import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongo";
import { calc, DEFAULT_SETTINGS, genRef, type EquipmentInput, type Settings } from "@/lib/calc";
import { TYPES, type ProjectTypeId } from "@/lib/catalog";
import { requireStaff } from "@/lib/auth";

async function loadSettings(): Promise<Settings> {
  const db = await getDb();
  const doc = await db.collection("settings").findOne({ _id: "singleton" as unknown as never });
  if (!doc) return DEFAULT_SETTINGS;
  return {
    peakSunHours: doc.peakSunHours ?? DEFAULT_SETTINGS.peakSunHours,
    performanceRatio: doc.performanceRatio ?? DEFAULT_SETTINGS.performanceRatio,
    panelWatt: doc.panelWatt ?? DEFAULT_SETTINGS.panelWatt,
  };
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "invalid body" }, { status: 400 });

  const projectType = body.projectType as ProjectTypeId | undefined;
  const t = TYPES.find((x) => x.id === projectType);
  if (!t) return NextResponse.json({ error: "invalid projectType" }, { status: 400 });

  const contact = body.contact ?? {};
  const location = body.location ?? {};
  if (!String(contact.name ?? "").trim() || !String(contact.phone ?? "").trim() || !String(location.country ?? "").trim()) {
    return NextResponse.json({ error: "missing required fields" }, { status: 400 });
  }

  const equipment: EquipmentInput = {};
  if (body.equipment && typeof body.equipment === "object") {
    for (const [k, v] of Object.entries(body.equipment as Record<string, { qty?: number; hours?: number }>)) {
      const qty = Math.max(0, Math.floor(Number(v?.qty ?? 0)));
      if (qty <= 0) continue;
      const hours = v?.hours != null ? Math.min(24, Math.max(1, Math.floor(Number(v.hours)))) : undefined;
      equipment[k] = { qty, hours };
    }
  }

  const settings = await loadSettings();
  const computed = calc(equipment, settings);

  const ref = genRef();
  const doc = {
    ref,
    projectType,
    contact: {
      name: String(contact.name).trim(),
      phone: String(contact.phone).trim(),
      whatsapp: String(contact.whatsapp ?? "").trim(),
      email: String(contact.email ?? "").trim(),
    },
    location: {
      country: String(location.country).trim(),
      city: String(location.city ?? "").trim(),
      address: String(location.address ?? "").trim(),
    },
    equipment,
    computed,
    typeLabel: t.label,
    typeIcon: t.icon,
    cat: t.cat,
    status: "New" as const,
    createdAt: new Date(),
  };

  const db = await getDb();
  await db.collection("assessments").insertOne(doc);
  return NextResponse.json({ ref, computed, status: doc.status }, { status: 201 });
}

export async function GET(req: Request) {
  const session = await requireStaff();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const q = searchParams.get("q")?.trim();

  const filter: Record<string, unknown> = {};
  if (status && status !== "all") filter.status = status;
  if (q) {
    const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    filter.$or = [{ "contact.name": rx }, { "location.country": rx }];
  }

  const db = await getDb();
  const docs = await db.collection("assessments").find(filter).sort({ createdAt: -1 }).limit(200).toArray();
  return NextResponse.json(
    docs.map((d) => ({
      _id: String(d._id),
      ref: d.ref,
      name: d.contact?.name ?? "",
      country: d.location?.country ?? "",
      type: d.typeLabel ?? "",
      typeIcon: d.typeIcon ?? "home",
      size: `${(d.computed?.pv ?? 0).toFixed(1)} kWp`,
      daily: (d.computed?.daily ?? 0).toFixed(1),
      panels: d.computed?.panels ?? 0,
      status: d.status ?? "New",
      createdAt: d.createdAt,
    }))
  );
}
