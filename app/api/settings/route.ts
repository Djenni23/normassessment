import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongo";
import { DEFAULT_SETTINGS } from "@/lib/calc";
import { requireStaff } from "@/lib/auth";

export async function GET() {
  const db = await getDb();
  const doc = await db.collection("settings").findOne({ _id: "singleton" as unknown as never });
  const s = doc
    ? {
        peakSunHours: doc.peakSunHours ?? DEFAULT_SETTINGS.peakSunHours,
        performanceRatio: doc.performanceRatio ?? DEFAULT_SETTINGS.performanceRatio,
        panelWatt: doc.panelWatt ?? DEFAULT_SETTINGS.panelWatt,
        updatedAt: doc.updatedAt ?? null,
      }
    : { ...DEFAULT_SETTINGS, updatedAt: null };
  return NextResponse.json(s);
}

export async function PATCH(req: Request) {
  const session = await requireStaff();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const peakSunHours = clamp(Number(body.peakSunHours), 3.5, 6.5);
  const performanceRatio = clamp(Number(body.performanceRatio), 0.6, 0.95);
  const panelWatt = Math.round(clamp(Number(body.panelWatt), 350, 700));

  if (![peakSunHours, performanceRatio, panelWatt].every(Number.isFinite)) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  const db = await getDb();
  const updatedAt = new Date();
  await db.collection("settings").updateOne(
    { _id: "singleton" as unknown as never },
    { $set: { peakSunHours, performanceRatio, panelWatt, updatedAt } },
    { upsert: true }
  );
  return NextResponse.json({ peakSunHours, performanceRatio, panelWatt, updatedAt });
}

function clamp(n: number, min: number, max: number) {
  if (!Number.isFinite(n)) return n;
  return Math.min(max, Math.max(min, n));
}
