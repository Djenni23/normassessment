import "dotenv/config";
import bcrypt from "bcryptjs";
import { MongoClient } from "mongodb";
import { DEFAULT_SETTINGS, calc, type EquipmentInput } from "../lib/calc";

async function main() {
  const uri = process.env.MONGODB_URI ?? "mongodb://localhost:27017";
  const dbName = process.env.MONGODB_DB ?? "normassessment";
  const adminEmail = (process.env.SEED_ADMIN_EMAIL ?? "admin@normenerji.com").toLowerCase();
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "norm-enerji-2026";

  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(dbName);

  // settings
  await db.collection("settings").updateOne(
    { _id: "singleton" as unknown as never },
    { $setOnInsert: { ...DEFAULT_SETTINGS, updatedAt: new Date() } },
    { upsert: true }
  );

  // admin
  const existing = await db.collection("users").findOne({ email: adminEmail });
  if (!existing) {
    const passwordHash = await bcrypt.hash(adminPassword, 10);
    await db.collection("users").insertOne({ email: adminEmail, passwordHash, createdAt: new Date() });
    console.log(`Created admin: ${adminEmail} / ${adminPassword}`);
  } else {
    console.log(`Admin already exists: ${adminEmail}`);
  }

  // demo records — only if collection is empty
  const count = await db.collection("assessments").countDocuments();
  if (count === 0) {
    const demos: Array<{ ref: string; name: string; country: string; type: string; typeIcon: string; projectType: string; cat: string; equipment: EquipmentInput; status: string; daysAgo: number }> = [
      { ref: "NE-2026-7K2D", name: "Amadou Diallo", country: "Senegal", type: "House", typeIcon: "home", projectType: "house", cat: "Residential", equipment: { lights: { qty: 6 }, tv: { qty: 1 }, fridge: { qty: 1 }, fan: { qty: 2 }, internet: { qty: 1 } }, status: "Quoted", daysAgo: 9 },
      { ref: "NE-2026-3X9F", name: "Grace Mensah", country: "Ghana", type: "Solar Irrigation", typeIcon: "water_drop", projectType: "irrigation", cat: "Agricultural", equipment: { pump: { qty: 2 }, lights: { qty: 2 } }, status: "In Review", daysAgo: 10 },
      { ref: "NE-2026-1B8M", name: "Ibrahim Touré", country: "Mali", type: "Business", typeIcon: "storefront", projectType: "business", cat: "Commercial", equipment: { lights: { qty: 10 }, tv: { qty: 1 }, fridge: { qty: 1 }, computer: { qty: 2 }, internet: { qty: 1 }, camera: { qty: 2 } }, status: "New", daysAgo: 11 },
      { ref: "NE-2026-5Q4P", name: "Sarah Okonkwo", country: "Nigeria", type: "Office", typeIcon: "business_center", projectType: "office", cat: "Commercial", equipment: { lights: { qty: 12 }, computer: { qty: 6 }, ac: { qty: 1 }, internet: { qty: 1 }, camera: { qty: 2 } }, status: "In Review", daysAgo: 12 },
      { ref: "NE-2026-9L7C", name: "Jean-Paul Kouassi", country: "Côte d’Ivoire", type: "Mine", typeIcon: "terrain", projectType: "mine", cat: "Commercial", equipment: { lights: { qty: 20 }, pump: { qty: 4 }, computer: { qty: 4 }, camera: { qty: 4 }, internet: { qty: 1 } }, status: "Quoted", daysAgo: 14 },
      { ref: "NE-2026-2H6R", name: "Fatou Camara", country: "Guinea", type: "Farm", typeIcon: "agriculture", projectType: "farm", cat: "Agricultural", equipment: { lights: { qty: 6 }, pump: { qty: 1 }, fridge: { qty: 1 }, fan: { qty: 2 } }, status: "New", daysAgo: 15 },
    ];
    const now = Date.now();
    const docs = demos.map((d) => {
      const computed = calc(d.equipment, DEFAULT_SETTINGS);
      return {
        ref: d.ref,
        projectType: d.projectType,
        contact: { name: d.name, phone: "+221 70 000 0000", whatsapp: "", email: "" },
        location: { country: d.country, city: "", address: "" },
        equipment: d.equipment,
        computed,
        typeLabel: d.type,
        typeIcon: d.typeIcon,
        cat: d.cat,
        status: d.status,
        createdAt: new Date(now - d.daysAgo * 24 * 3600 * 1000),
      };
    });
    await db.collection("assessments").insertMany(docs);
    console.log(`Seeded ${docs.length} demo assessments.`);
  } else {
    console.log(`Assessments already present (${count}), skipping demo seed.`);
  }

  await client.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
