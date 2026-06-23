"use client";
import { useEffect, useRef, useState } from "react";
import { Icon } from "../Icon";
import { StepLabel, H1, Lede, PrimaryButton, BackButton } from "../ui";
import { CATALOG, CATEGORY_ICON, COLORS, TYPES, type ProjectTypeId } from "@/lib/catalog";
import { calc, fmt, type Settings } from "@/lib/calc";
import type { Equipment } from "./AssessStep";

export function ResultsStep({
  equipment,
  projectType,
  settings,
  onBack,
  onSubmit,
}: {
  equipment: Equipment;
  projectType: ProjectTypeId | null;
  settings: Settings;
  onBack: () => void;
  onSubmit: () => void;
}) {
  const c = calc(equipment, settings);
  const t = TYPES.find((x) => x.id === projectType);
  const category = t?.cat ?? "Residential";
  const catIcon = CATEGORY_ICON[category];

  // anim
  const [anim, setAnim] = useState({ daily: 0, pv: 0, batt: 0, panels: 0 });
  const rafRef = useRef<number | null>(null);
  useEffect(() => {
    const target = { daily: c.daily, pv: c.pv, batt: c.batt, panels: c.panels };
    const start = performance.now();
    const dur = 950;
    const tick = (now: number) => {
      const k = Math.min(1, (now - start) / dur);
      const e = 1 - Math.pow(1 - k, 3);
      setAnim({
        daily: target.daily * e,
        pv: target.pv * e,
        batt: target.batt * e,
        panels: Math.round(target.panels * e),
      });
      if (k < 1) rafRef.current = requestAnimationFrame(tick);
      else setAnim(target);
    };
    rafRef.current = requestAnimationFrame(tick);
    const safety = setTimeout(() => setAnim(target), 1150);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      clearTimeout(safety);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // distribution
  const contribs = CATALOG.map((a, i) => {
    const q = equipment[a.id]?.qty ?? 0;
    const h = equipment[a.id]?.hours ?? a.hours;
    const d = (a.watts * q * h * (a.duty ?? 1)) / 1000;
    return { label: a.label, icon: a.icon, d, color: COLORS[i % COLORS.length] };
  })
    .filter((x) => x.d > 0)
    .sort((a, b) => b.d - a.d);

  const totalD = contribs.reduce((s, x) => s + x.d, 0) || 1;
  const legendSrc = contribs.slice(0, 5);
  const otherD = contribs.slice(5).reduce((s, x) => s + x.d, 0);
  const donutItems = otherD > 0 ? [...legendSrc, { label: "Other", icon: "category", d: otherD, color: "#C7CFDD" }] : legendSrc;

  let acc = 0;
  const segs = donutItems.map((x) => {
    const start = (acc / totalD) * 100;
    acc += x.d;
    const end = (acc / totalD) * 100;
    return `${x.color} ${start.toFixed(2)}% ${end.toFixed(2)}%`;
  });
  const donutBg = segs.length ? `conic-gradient(${segs.join(",")})` : "#EEF1F7";
  const legend = donutItems.map((x) => ({ label: x.label, color: x.color, pct: Math.round((x.d / totalD) * 100) }));

  const maxD = contribs.length ? contribs[0].d : 1;
  const bars = contribs.slice(0, 5);

  const recMap: Record<typeof category, string> = {
    Residential: `An off-grid ready ${fmt(c.pv, 1)} kWp solar array with ${c.panels} panels and roughly ${fmt(c.batt, 1)} kWh of battery storage will comfortably cover your ${fmt(c.daily, 1)} kWh daily demand, with backup through the evening.`,
    Commercial: `A ${fmt(c.pv, 1)} kWp commercial system (${c.panels} panels) paired with ${fmt(c.batt, 1)} kWh storage will offset your ${fmt(c.daily, 1)} kWh daily load and protect operations against grid outages.`,
    Agricultural: `A rugged ${fmt(c.pv, 1)} kWp array of ${c.panels} panels with ${fmt(c.batt, 1)} kWh storage will reliably run your pumps and equipment across the ${fmt(c.daily, 1)} kWh daily cycle, even off-grid.`,
  };

  const statCards = [
    { icon: "battery_charging_full", value: fmt(anim.daily, 1), unit: "kWh/day", label: "Estimated daily usage", big: false },
    { icon: "solar_power", value: fmt(anim.pv, 1), unit: "kWp", label: "Recommended solar capacity", big: true },
    { icon: "battery_full", value: fmt(anim.batt, 1), unit: "kWh", label: "Recommended battery", big: false },
    { icon: "grid_view", value: String(anim.panels), unit: "panels", label: `Est. ${settings.panelWatt}W solar panels`, big: false },
  ];

  return (
    <div className="anim-fadeUp">
      <div className="flex items-start justify-between gap-4 flex-wrap mb-[22px]">
        <div>
          <StepLabel>Step 4 · Results</StepLabel>
          <H1>Your solar recommendation</H1>
          <p className="text-[16px] text-[color:var(--ink-muted)]">
            Tailored for your {t?.label ?? "—"} project. Here&apos;s what we&apos;d put on site.
          </p>
        </div>
        <div className="inline-flex items-center gap-[9px] bg-white border border-[color:var(--border)] rounded-[14px] px-4 py-[11px] shadow-[0_6px_20px_rgba(40,60,110,.07)]">
          <Icon name={catIcon} size={24} className="text-[color:var(--brand-navy)]" />
          <div>
            <div className="text-[11px] text-[color:var(--ink-ghost)] font-semibold uppercase tracking-[.5px]">System category</div>
            <div className="font-display font-bold text-[16px] text-[color:var(--ink)]">{category}</div>
          </div>
        </div>
      </div>

      <div className="grid gap-[15px] [grid-template-columns:repeat(auto-fit,minmax(212px,1fr))]">
        {statCards.map((s, i) => (
          <div
            key={i}
            className="rounded-[20px] p-5"
            style={{
              background: s.big ? "linear-gradient(150deg,#FFFBF2,#FFF1D6)" : "#fff",
              border: `1px solid ${s.big ? "#F4D78A" : "var(--border)"}`,
              boxShadow: "0 8px 24px rgba(40,60,110,.07)",
            }}
          >
            <div
              className="w-[46px] h-[46px] rounded-[13px] flex items-center justify-center"
              style={{ background: s.big ? "#FFF6E2" : "#EEF2FB", color: s.big ? "#D9920A" : "var(--brand-navy)" }}
            >
              <Icon name={s.icon} size={24} />
            </div>
            <div className="flex items-baseline gap-[5px] mt-4">
              <span
                className="font-display font-extrabold text-[32px] tracking-[-1px]"
                style={{ color: s.big ? "#B47B12" : "var(--ink)" }}
              >
                {s.value}
              </span>
              <span className="font-display font-semibold text-[15px] text-[#8493AC]">{s.unit}</span>
            </div>
            <div className="text-[13.5px] text-[color:var(--ink-muted)] font-semibold mt-[3px]">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-[18px] mt-[18px]">
        <div className="flex-1 basis-[360px] bg-white border border-[color:var(--border)] rounded-[22px] shadow-[0_8px_28px_rgba(40,60,110,.07)] p-6">
          <div className="font-display font-bold text-[15px] text-[color:var(--ink)] mb-[18px]">Where your energy goes</div>
          <div className="flex items-center gap-6 flex-wrap">
            <div className="relative w-[168px] h-[168px] shrink-0">
              <div className="absolute inset-0 rounded-full" style={{ background: donutBg }} />
              <div className="absolute inset-[26px] bg-white rounded-full flex flex-col items-center justify-center shadow-[inset_0_0_0_1px_#EEF1F7]">
                <div className="font-display font-extrabold text-[26px] text-[color:var(--ink)] leading-none">{fmt(anim.daily, 1)}</div>
                <div className="text-[10.5px] text-[color:var(--ink-ghost)] font-bold tracking-[.5px]">kWh / DAY</div>
              </div>
            </div>
            <div className="flex-1 min-w-[160px] flex flex-col gap-[10px]">
              {legend.map((l, i) => (
                <div key={i} className="flex items-center gap-[10px]">
                  <span className="w-[11px] h-[11px] rounded-[4px] shrink-0" style={{ background: l.color }} />
                  <span className="flex-1 text-[13.5px] text-[#42526E] font-semibold">{l.label}</span>
                  <span className="font-mono font-semibold text-[13px] text-[#8493AC]">{l.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1 basis-[300px] bg-white border border-[color:var(--border)] rounded-[22px] shadow-[0_8px_28px_rgba(40,60,110,.07)] p-6">
          <div className="font-display font-bold text-[15px] text-[color:var(--ink)] mb-[18px]">Top consumers</div>
          <div className="flex flex-col gap-[14px]">
            {bars.map((b, i) => (
              <div key={i}>
                <div className="flex justify-between mb-[5px]">
                  <span className="text-[13.5px] text-[#42526E] font-semibold flex items-center gap-[7px]">
                    <Icon name={b.icon} size={17} className="text-[#8FA0BE]" />
                    {b.label}
                  </span>
                  <span className="font-mono font-semibold text-[12.5px] text-[#8493AC]">{fmt(b.d, 1)} kWh</span>
                </div>
                <div className="h-[9px] bg-[#EEF1F7] rounded-[20px] overflow-hidden">
                  <div
                    className="h-full rounded-[20px]"
                    style={{
                      width: `${Math.max(4, (b.d / maxD) * 100)}%`,
                      background: "linear-gradient(90deg,#35508E,#5B79C2)",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div
        className="mt-[18px] rounded-[22px] p-6 flex gap-4 items-start"
        style={{ background: "linear-gradient(135deg,#FFFBF2 0%,#FFF6E2 100%)", border: "1px solid #F6E2B0" }}
      >
        <div className="w-[44px] h-[44px] rounded-[13px] bg-[color:var(--brand-amber)] flex items-center justify-center shrink-0 shadow-[0_6px_16px_rgba(244,177,42,.4)]">
          <Icon name="lightbulb" size={26} className="text-white" />
        </div>
        <div>
          <div className="font-display font-bold text-[16px] text-[#7A5408] mb-[5px]">What we&apos;d recommend</div>
          <div className="text-[14.5px] text-[#8A6512] leading-[1.55]">{recMap[category]}</div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-[14px] flex-wrap mt-[26px]">
        <BackButton onClick={onBack}>
          <Icon name="arrow_back" size={20} />
          Adjust equipment
        </BackButton>
        <PrimaryButton onClick={onSubmit}>
          <Icon name="send" size={20} />
          Send to Norm Enerji team
        </PrimaryButton>
      </div>
    </div>
  );
}
