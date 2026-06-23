import { CATALOG } from "./catalog";

export type Settings = {
  peakSunHours: number;
  performanceRatio: number;
  panelWatt: number;
};

export const DEFAULT_SETTINGS: Settings = {
  peakSunHours: 5,
  performanceRatio: 0.8,
  panelWatt: 550,
};

export type EquipmentInput = Record<string, { qty: number; hours?: number }>;

export type Computed = {
  daily: number;
  peak: number;
  count: number;
  pv: number;
  batt: number;
  panels: number;
  byId: Record<string, number>;
};

export function calc(equipment: EquipmentInput, settings: Settings): Computed {
  let daily = 0;
  let peakRaw = 0;
  let count = 0;
  const byId: Record<string, number> = {};

  for (const a of CATALOG) {
    const entry = equipment[a.id];
    const qty = entry?.qty ?? 0;
    if (qty <= 0) continue;
    const hours = entry?.hours ?? a.hours;
    const duty = a.duty ?? 1;
    const d = (a.watts * qty * hours * duty) / 1000;
    daily += d;
    peakRaw += a.watts * qty;
    count += qty;
    byId[a.id] = d;
  }

  const peak = peakRaw * 0.85;
  const pv = daily / (settings.peakSunHours * settings.performanceRatio);
  const batt = daily * 1.5;
  const panels = Math.max(0, Math.ceil((pv * 1000) / settings.panelWatt));

  return { daily, peak, count, pv, batt, panels, byId };
}

export function fmt(n: number, d: number): string {
  return (n || 0).toLocaleString("en-US", {
    minimumFractionDigits: d,
    maximumFractionDigits: d,
  });
}

export function genRef(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789";
  let s = "";
  for (let i = 0; i < 4; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return `NE-${new Date().getFullYear()}-${s}`;
}
