import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongo";
import { calc, DEFAULT_SETTINGS, genRef, type EquipmentInput, type ExtraCatalogEntry, type Settings } from "@/lib/calc";
import { TYPES, type ProjectTypeId, SYSTEM_TYPES, INSTALL_ZONES, GOALS, ROOF_TYPES, ROOF_MATERIALS, ORIENTATIONS, SOILS } from "@/lib/catalog";
import { requireStaff } from "@/lib/auth";

const ID_SETS = {
  systemType: new Set(SYSTEM_TYPES.map((x) => x.id)),
  installZone: new Set(INSTALL_ZONES.map((x) => x.id)),
  goal: new Set(GOALS.map((x) => x.id)),
  roofType: new Set(ROOF_TYPES.map((x) => x.id)),
  roofMaterial: new Set(ROOF_MATERIALS.map((x) => x.id)),
  orientation: new Set(ORIENTATIONS.map((x) => x.id)),
  soil: new Set(SOILS.map((x) => x.id)),
};
const oneOf = <T extends string>(set: Set<string>, v: unknown): T | null =>
  typeof v === "string" && set.has(v) ? (v as T) : null;
const str = (v: unknown, max = 500) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const numStr = (v: unknown) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

function sanitizeSite(raw: unknown) {
  const s = (raw ?? {}) as Record<string, unknown>;
  const roof = (s.roof ?? {}) as Record<string, unknown>;
  const ground = (s.ground ?? {}) as Record<string, unknown>;
  const bill = numStr(s.monthlyBill);
  const batt = numStr(s.batteryCapacityKwh);
  const invCount = numStr(s.inverterCount);
  const invCapacity = numStr(s.inverterCapacityKw);
  return {
    systemType: oneOf(ID_SETS.systemType, s.systemType),
    installZone: oneOf(ID_SETS.installZone, s.installZone),
    batteryCapacityKwh: batt != null && batt > 0 ? batt : null,
    inverterCount: invCount != null && invCount > 0 ? Math.floor(invCount) : null,
    inverterCapacityKw: invCapacity != null && invCapacity > 0 ? invCapacity : null,
    roof: {
      type: oneOf(ID_SETS.roofType, roof.type),
      material: oneOf(ID_SETS.roofMaterial, roof.material),
      materialOther: str(roof.materialOther, 80),
      orientation: oneOf(ID_SETS.orientation, roof.orientation),
      orientationOther: str(roof.orientationOther, 80),
      tiltDeg: numStr(roof.tiltDeg),
    },
    ground: {
      surfaceSqm: numStr(ground.surfaceSqm),
      soil: oneOf(ID_SETS.soil, ground.soil),
      soilOther: str(ground.soilOther, 80),
    },
    goal: oneOf(ID_SETS.goal, s.goal),
    moduleBrand: str(s.moduleBrand, 120),
    timeline: str(s.timeline, 200),
    monthlyBill: bill != null && bill > 0 ? bill : null,
    currency: str(s.currency, 8) || "FCFA",
    notes: str(s.notes, 2000),
  };
}

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

  const customAppliances: ExtraCatalogEntry[] = [];
  if (Array.isArray(body.customAppliances)) {
    for (const item of body.customAppliances as Array<Record<string, unknown>>) {
      const label = str(item.label, 80);
      const watts = Number(item.watts);
      const hours = Number(item.hours ?? 4);
      const id = str(item.id, 40);
      if (label && id && Number.isFinite(watts) && watts >= 1 && watts <= 50000) {
        customAppliances.push({ id, watts, hours: Math.min(24, Math.max(1, hours)) });
      }
    }
  }

  const settings = await loadSettings();
  const computed = calc(equipment, settings, customAppliances);
  const site = sanitizeSite(body.site);

  const customTypeLabel = str(body.customTypeLabel, 80);
  if (projectType === "other" && !customTypeLabel) {
    return NextResponse.json({ error: "customTypeLabel required for projectType=other" }, { status: 400 });
  }
  const typeLabel = projectType === "other" ? customTypeLabel : t.label;

  const ref = genRef();
  const doc = {
    ref,
    projectType,
    customTypeLabel: projectType === "other" ? customTypeLabel : "",
    projectName: str(body.projectName, 200),
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
    customAppliances: body.customAppliances ?? [],
    site,
    computed,
    typeLabel,
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
      projectName: d.projectName ?? "",
      country: d.location?.country ?? "",
      type: d.typeLabel ?? "",
      typeIcon: d.typeIcon ?? "home",
      size: `${(d.computed?.pv ?? 0).toFixed(1)} kWp`,
      daily: (d.computed?.daily ?? 0).toFixed(1),
      panels: d.computed?.panels ?? 0,
      systemType: d.site?.systemType ?? null,
      installZone: d.site?.installZone ?? null,
      goal: d.site?.goal ?? null,
      status: d.status ?? "New",
      createdAt: d.createdAt,
    }))
  );
}
