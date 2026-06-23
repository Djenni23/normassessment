import { DashboardClient } from "@/components/staff/DashboardClient";
import { getDb } from "@/lib/mongo";
import { DEFAULT_SETTINGS } from "@/lib/calc";

export const dynamic = "force-dynamic";

async function loadSettings() {
  try {
    const db = await getDb();
    const doc = await db.collection("settings").findOne({ _id: "singleton" as unknown as never });
    if (!doc) return { ...DEFAULT_SETTINGS, updatedAt: null };
    return {
      peakSunHours: doc.peakSunHours ?? DEFAULT_SETTINGS.peakSunHours,
      performanceRatio: doc.performanceRatio ?? DEFAULT_SETTINGS.performanceRatio,
      panelWatt: doc.panelWatt ?? DEFAULT_SETTINGS.panelWatt,
      updatedAt: doc.updatedAt ? new Date(doc.updatedAt).toISOString() : null,
    };
  } catch {
    return { ...DEFAULT_SETTINGS, updatedAt: null };
  }
}

export default async function StaffPage() {
  const settings = await loadSettings();
  return <DashboardClient initialSettings={settings} />;
}
