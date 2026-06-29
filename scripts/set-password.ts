import "dotenv/config";
import bcrypt from "bcryptjs";
import { MongoClient } from "mongodb";

/**
 * Change (or create) a staff account's password.
 *
 * Usage:
 *   npm run set-password -- <email> <new-password>
 *
 * Example:
 *   npm run set-password -- admin@normenerji.com MonNouveauMotDePasse123
 *
 * If the account doesn't exist yet, it is created.
 */
async function main() {
  const [email, password] = process.argv.slice(2);
  if (!email || !password) {
    console.error("❌ Usage: npm run set-password -- <email> <mot-de-passe>");
    process.exit(1);
  }
  if (password.length < 6) {
    console.error("❌ Le mot de passe doit faire au moins 6 caractères.");
    process.exit(1);
  }

  const uri = process.env.MONGODB_URI ?? "mongodb://localhost:27017";
  const dbName = process.env.MONGODB_DB ?? "normassessment";
  const normalizedEmail = email.toLowerCase().trim();

  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(dbName);

  const passwordHash = await bcrypt.hash(password, 10);
  const res = await db.collection("users").updateOne(
    { email: normalizedEmail },
    { $set: { email: normalizedEmail, passwordHash }, $setOnInsert: { createdAt: new Date() } },
    { upsert: true }
  );

  if (res.upsertedCount > 0) {
    console.log(`✅ Nouveau compte créé : ${normalizedEmail}`);
  } else {
    console.log(`✅ Mot de passe mis à jour pour : ${normalizedEmail}`);
  }

  await client.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
