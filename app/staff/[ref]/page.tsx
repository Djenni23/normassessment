import { notFound } from "next/navigation";
import Link from "next/link";
import { getDb } from "@/lib/mongo";
import { fmt } from "@/lib/calc";
import {
  ROOF_MATERIALS,
  ROOF_TYPES,
  ORIENTATIONS,
  SOILS,
  SYSTEM_TYPES,
  INSTALL_ZONES,
  GOALS,
  CATALOG,
} from "@/lib/catalog";
import { ChecklistActions } from "@/components/staff/ChecklistActions";
import { StatusEditor } from "@/components/staff/StatusEditor";

export const dynamic = "force-dynamic";

type SiteDoc = {
  systemType: string | null;
  installZone: string | null;
  batteryCapacityKwh?: number | null;
  inverterCount?: number | null;
  inverterCapacityKw?: number | null;
  roof?: { type?: string | null; material?: string | null; materialOther?: string; orientation?: string | null; orientationOther?: string; tiltDeg?: number | null };
  ground?: { surfaceSqm?: number | null; soil?: string | null; soilOther?: string };
  goal: string | null;
  moduleBrand?: string;
  timeline?: string;
  monthlyBill?: number | null;
  currency?: string;
  notes?: string;
};

type Assessment = {
  _id: string;
  ref: string;
  projectName?: string;
  contact: { name: string; phone: string; whatsapp?: string; email?: string };
  location: { country: string; city?: string; address?: string };
  equipment: Record<string, { qty: number; hours?: number }>;
  site?: SiteDoc;
  computed: { daily: number; pv: number; batt: number; panels: number; peak: number; count: number };
  typeLabel: string;
  status: string;
  createdAt: string;
};

async function load(ref: string): Promise<Assessment | null> {
  const db = await getDb();
  const doc = await db.collection("assessments").findOne({ ref });
  if (!doc) return null;
  return JSON.parse(JSON.stringify({ ...doc, _id: String(doc._id) })) as Assessment;
}

export default async function ChecklistPage({ params }: { params: Promise<{ ref: string }> }) {
  const { ref } = await params;
  const a = await load(ref);
  if (!a) notFound();

  const site = a.site;
  const labelOf = <T extends { id: string; label: string }>(list: readonly T[], id: string | null | undefined) =>
    list.find((x) => x.id === id)?.label ?? "";

  const Check = ({ on }: { on: boolean }) => (
    <span style={{ display: "inline-block", width: 14, height: 14, border: "1.5px solid #1B2A50", borderRadius: 3, marginRight: 7, verticalAlign: -2, background: on ? "#1B2A50" : "transparent", position: "relative" }}>
      {on && <span style={{ position: "absolute", top: -2, left: 2, color: "#fff", fontWeight: 800 }}>✓</span>}
    </span>
  );

  return (
    <div className="min-h-screen bg-[#EAEEF4] print:bg-white">
      <div className="max-w-[820px] mx-auto px-6 py-8 print:p-0">
        <div className="flex items-center justify-between mb-4 print:hidden">
          <Link href="/staff" className="inline-flex items-center gap-2 text-[14px] text-[color:var(--ink-muted)] hover:text-[color:var(--brand-navy)] font-semibold">
            <span className="material-symbols" style={{ fontSize: 18 }}>arrow_back</span>
            Back to dashboard
          </Link>
          <ChecklistActions />
        </div>
        <div className="mb-5 print:hidden">
          <StatusEditor id={a._id} initial={(a.status as "New" | "In Review" | "Quoted") || "New"} />
        </div>

        <article className="bg-white border border-[color:var(--border)] rounded-[18px] p-10 shadow-[0_8px_28px_rgba(40,60,110,.06)] print:shadow-none print:border-0 print:rounded-none print:p-0">
          <header className="border-b-2 border-[color:var(--brand-navy)] pb-4 mb-6">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/norm-mark.png" alt="Norm Enerji" className="w-[44px] h-[44px] rounded-[10px]" />
                <div>
                  <div className="font-display font-extrabold text-[20px] tracking-[-.4px] text-[#2A3F73]">NORM ENERJI</div>
                  <div className="font-mono text-[10.5px] tracking-[1.5px] text-[color:var(--brand-amber)] uppercase">Preliminary Solar Form / Checklist</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-mono text-[11px] text-[color:var(--ink-ghost)] uppercase tracking-[.6px]">Reference</div>
                <div className="font-mono font-semibold text-[16px] text-[color:var(--brand-navy)]">{a.ref}</div>
              </div>
            </div>
            <h1 className="font-display font-bold text-[22px] text-[color:var(--ink)] mt-4 leading-tight">
              ☀️ Preliminary Information Form — Solar System / Checklist
            </h1>
            <div className="text-[12.5px] text-[color:var(--ink-faint)] mt-1">
              Generated {new Date(a.createdAt).toLocaleString()} · Status: <strong>{a.status}</strong>
            </div>
          </header>

          {/* 1. Project info */}
          <Sec title="1. Project information">
            <Row label="Project / company name" value={a.projectName || "—"} />
            <Row label="Address / location" value={[a.location.address, a.location.city, a.location.country].filter(Boolean).join(", ") || "—"} />
            <Row label="Customer" value={a.contact.name} />
            <Row label="Phone" value={a.contact.phone} />
            {a.contact.whatsapp && <Row label="WhatsApp" value={a.contact.whatsapp} />}
            {a.contact.email && <Row label="Email" value={a.contact.email} />}
            <Row label="Project type" value={a.typeLabel} />
          </Sec>

          {/* 2. System type */}
          <Sec title="2. System type">
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              {SYSTEM_TYPES.map((s) => (
                <span key={s.id} className="text-[13.5px] text-[color:var(--ink)]">
                  <Check on={site?.systemType === s.id} />
                  {s.label} <span className="text-[color:var(--ink-faint)]">— {s.desc}</span>
                </span>
              ))}
            </div>
          </Sec>

          {/* 3. Power & energy needs */}
          <Sec title="3. Power & energy needs">
            <Row label="Recommended system capacity" value={`${fmt(a.computed.pv, 1)} kWp`} />
            <Row label="Average daily consumption" value={`${fmt(a.computed.daily, 1)} kWh`} />
            <Row
              label="Requested battery capacity"
              value={
                site?.batteryCapacityKwh != null
                  ? `${fmt(site.batteryCapacityKwh, 1)} kWh (customer)  ·  recommended ${fmt(a.computed.batt, 1)} kWh`
                  : `${fmt(a.computed.batt, 1)} kWh (recommended)`
              }
            />
            <Row
              label="Inverters (requested)"
              value={
                site?.inverterCount && site?.inverterCapacityKw
                  ? `${site.inverterCount} × ${fmt(site.inverterCapacityKw, 1)} kW`
                  : site?.inverterCount
                    ? `${site.inverterCount} (capacity unspecified)`
                    : "—"
              }
            />
            <Row label="Estimated panels" value={`${a.computed.panels} panels`} />
            <Row label="Peak load" value={`${fmt(Math.round(a.computed.peak), 0)} W`} />
            <Row label="Equipment items" value={String(a.computed.count)} />
          </Sec>

          {/* 4. Installation zone */}
          <Sec title="4. Installation zone">
            <div className="flex flex-wrap gap-x-6 gap-y-2 mb-3">
              {INSTALL_ZONES.map((z) => (
                <span key={z.id} className="text-[13.5px] text-[color:var(--ink)]">
                  <Check on={site?.installZone === z.id} />
                  {z.label}
                </span>
              ))}
            </div>

            {site?.installZone === "roof" && (
              <div className="border-l-2 border-[color:var(--brand-navy)] pl-4 mt-2 grid gap-2">
                <SubChoices label="Roof type" items={ROOF_TYPES} value={site.roof?.type} />
                <SubChoicesWithOther label="Material" items={ROOF_MATERIALS} value={site.roof?.material ?? null} other={site.roof?.materialOther} />
                <SubChoicesWithOther label="Orientation" items={ORIENTATIONS} value={site.roof?.orientation ?? null} other={site.roof?.orientationOther} />
                <Row label="Tilt angle" value={site.roof?.tiltDeg != null ? `${site.roof.tiltDeg}°` : "—"} />
              </div>
            )}

            {site?.installZone === "ground" && (
              <div className="border-l-2 border-[color:var(--brand-navy)] pl-4 mt-2 grid gap-2">
                <Row label="Available surface" value={site.ground?.surfaceSqm != null ? `${site.ground.surfaceSqm} m²` : "—"} />
                <SubChoicesWithOther label="Soil nature" items={SOILS} value={site.ground?.soil ?? null} other={site.ground?.soilOther} />
              </div>
            )}
          </Sec>

          {/* 5. Objectives */}
          <Sec title="5. Objectives & additional information">
            <div className="flex flex-wrap gap-x-6 gap-y-2 mb-3">
              {GOALS.map((g) => (
                <span key={g.id} className="text-[13.5px] text-[color:var(--ink)]">
                  <Check on={site?.goal === g.id} />
                  {g.label}
                </span>
              ))}
            </div>
            <Row label="Preferred module brand / type" value={site?.moduleBrand || "—"} />
            <Row label="Delivery / project timeline" value={site?.timeline || "—"} />
            {site?.monthlyBill != null && site.monthlyBill > 0 && (
              <Row label="Monthly electricity bill" value={`${site.monthlyBill.toLocaleString("en-US")} ${site.currency || "FCFA"}`} />
            )}
            {site?.notes && (
              <div className="mt-3">
                <div className="text-[11.5px] text-[color:var(--ink-faint)] font-semibold uppercase tracking-[.5px] mb-1">Notes / remarks</div>
                <div className="text-[13.5px] text-[color:var(--ink)] whitespace-pre-wrap leading-relaxed border-l-2 border-[color:var(--border-strong)] pl-3">{site.notes}</div>
              </div>
            )}
          </Sec>

          {/* 6. Equipment list */}
          <Sec title="6. Equipment inventory">
            <table className="w-full border-collapse text-[13px]">
              <thead>
                <tr style={{ background: "#F4F6FB" }}>
                  <th style={{ textAlign: "left", padding: "8px 10px", border: "1px solid #E2E8F2", fontWeight: 700 }}>Item</th>
                  <th style={{ textAlign: "right", padding: "8px 10px", border: "1px solid #E2E8F2", fontWeight: 700 }}>Qty</th>
                  <th style={{ textAlign: "right", padding: "8px 10px", border: "1px solid #E2E8F2", fontWeight: 700 }}>Hrs / day</th>
                  <th style={{ textAlign: "right", padding: "8px 10px", border: "1px solid #E2E8F2", fontWeight: 700 }}>W / unit</th>
                  <th style={{ textAlign: "right", padding: "8px 10px", border: "1px solid #E2E8F2", fontWeight: 700 }}>kWh / day</th>
                </tr>
              </thead>
              <tbody>
                {CATALOG.filter((c) => (a.equipment[c.id]?.qty ?? 0) > 0).map((c) => {
                  const qty = a.equipment[c.id]?.qty ?? 0;
                  const hrs = a.equipment[c.id]?.hours ?? c.hours;
                  const duty = c.duty ?? 1;
                  const d = (c.watts * qty * hrs * duty) / 1000;
                  return (
                    <tr key={c.id}>
                      <td style={{ padding: "7px 10px", border: "1px solid #E2E8F2" }}>{c.label}</td>
                      <td style={{ padding: "7px 10px", border: "1px solid #E2E8F2", textAlign: "right" }}>{qty}</td>
                      <td style={{ padding: "7px 10px", border: "1px solid #E2E8F2", textAlign: "right" }}>{hrs}</td>
                      <td style={{ padding: "7px 10px", border: "1px solid #E2E8F2", textAlign: "right" }}>{c.watts}</td>
                      <td style={{ padding: "7px 10px", border: "1px solid #E2E8F2", textAlign: "right" }}>{fmt(d, 2)}</td>
                    </tr>
                  );
                })}
                <tr style={{ background: "#F4F6FB", fontWeight: 700 }}>
                  <td style={{ padding: "8px 10px", border: "1px solid #E2E8F2" }} colSpan={4}>Total</td>
                  <td style={{ padding: "8px 10px", border: "1px solid #E2E8F2", textAlign: "right" }}>{fmt(a.computed.daily, 2)}</td>
                </tr>
              </tbody>
            </table>
          </Sec>

          <footer className="mt-10 pt-4 border-t border-[color:var(--border)] text-[11.5px] text-[color:var(--ink-faint)] text-center">
            Document generated by Norm Enerji Solar Assessment · {a.ref} · Page 1
          </footer>
        </article>
      </div>

      <style>{`
        @media print {
          .print\\:hidden { display: none !important; }
          .print\\:bg-white { background: #fff !important; }
          .print\\:shadow-none { box-shadow: none !important; }
          .print\\:border-0 { border: 0 !important; }
          .print\\:rounded-none { border-radius: 0 !important; }
          .print\\:p-0 { padding: 0 !important; }
          @page { size: A4; margin: 14mm; }
        }
      `}</style>
    </div>
  );
}

function Sec({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-7">
      <h2 className="font-display font-bold text-[15px] text-[color:var(--brand-navy)] uppercase tracking-[.5px] mb-3 border-b border-[color:var(--border)] pb-1">{title}</h2>
      <div className="grid gap-1">{children}</div>
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[200px_1fr] gap-3 text-[13.5px]">
      <div className="text-[color:var(--ink-faint)] font-semibold">{label}</div>
      <div className="text-[color:var(--ink)]">{value || "—"}</div>
    </div>
  );
}

function SubChoices({ label, items, value }: { label: string; items: ReadonlyArray<{ id: string; label: string }>; value: string | null | undefined }) {
  return (
    <div>
      <div className="text-[12px] text-[color:var(--ink-faint)] font-semibold mb-1">{label}</div>
      <div className="flex flex-wrap gap-x-5 gap-y-1 text-[13px] text-[color:var(--ink)]">
        {items.map((i) => (
          <span key={i.id}>
            <span style={{ display: "inline-block", width: 12, height: 12, border: "1.5px solid #1B2A50", borderRadius: 3, marginRight: 6, verticalAlign: -2, background: value === i.id ? "#1B2A50" : "transparent" }} />
            {i.label}
          </span>
        ))}
      </div>
    </div>
  );
}

function SubChoicesWithOther({ label, items, value, other }: { label: string; items: ReadonlyArray<{ id: string; label: string }>; value: string | null | undefined; other?: string }) {
  return (
    <div>
      <div className="text-[12px] text-[color:var(--ink-faint)] font-semibold mb-1">{label}</div>
      <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-[13px] text-[color:var(--ink)]">
        {items.map((i) => (
          <span key={i.id}>
            <span style={{ display: "inline-block", width: 12, height: 12, border: "1.5px solid #1B2A50", borderRadius: 3, marginRight: 6, verticalAlign: -2, background: value === i.id ? "#1B2A50" : "transparent" }} />
            {i.label}
          </span>
        ))}
        {value === "other" && other && <span className="text-[color:var(--ink-faint)] italic">→ {other}</span>}
      </div>
    </div>
  );
}
