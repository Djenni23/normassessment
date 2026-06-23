"use client";
import { useEffect, useRef, useState } from "react";
import { Icon } from "../Icon";
import { StepLabel, H1, Lede, PrimaryButton, BackButton } from "../ui";
import { CATALOG, CATEGORY_ICON, COLORS, TYPES, type ProjectTypeId } from "@/lib/catalog";
import { calc, fmt, type Settings } from "@/lib/calc";
import type { SiteForm } from "@/lib/site";
import type { Equipment } from "./AssessStep";
import { useT } from "../LangProvider";
import type { DictKey } from "@/lib/i18n/types";

export function ResultsStep({
  equipment,
  projectType,
  settings,
  site,
  onBack,
  onSubmit,
}: {
  equipment: Equipment;
  projectType: ProjectTypeId | null;
  settings: Settings;
  site?: SiteForm;
  onBack: () => void;
  onSubmit: () => void;
}) {
  const t = useT();
  const c = calc(equipment, settings);
  const projType = TYPES.find((x) => x.id === projectType);
  const category = projType?.cat ?? "Residential";
  const catIcon = CATEGORY_ICON[category];
  const projLabel = projType ? t(`type.${projType.id}.label` as DictKey) : "—";

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
    return { label: t(`appliance.${a.id}` as DictKey), icon: a.icon, d, color: COLORS[i % COLORS.length] };
  })
    .filter((x) => x.d > 0)
    .sort((a, b) => b.d - a.d);

  const totalD = contribs.reduce((s, x) => s + x.d, 0) || 1;
  const legendSrc = contribs.slice(0, 5);
  const otherD = contribs.slice(5).reduce((s, x) => s + x.d, 0);
  const donutItems = otherD > 0 ? [...legendSrc, { label: t("appliance.other"), icon: "category", d: otherD, color: "#C7CFDD" }] : legendSrc;

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

  const recVars = { pv: fmt(c.pv, 1), panels: String(c.panels), batt: fmt(c.batt, 1), daily: fmt(c.daily, 1) };
  const recommendation = t(`results.recommend.${category}` as DictKey, recVars);

  const statCards = [
    { icon: "battery_charging_full", value: fmt(anim.daily, 1), unit: t("results.unit.kwh_day"), label: t("results.stat.daily"), big: false },
    { icon: "solar_power", value: fmt(anim.pv, 1), unit: t("results.unit.kwp"), label: t("results.stat.solar"), big: true },
    { icon: "battery_full", value: fmt(anim.batt, 1), unit: t("results.unit.kwh"), label: t("results.stat.battery"), big: false },
    { icon: "grid_view", value: String(anim.panels), unit: t("results.unit.panels"), label: t("results.stat.panels", { watt: settings.panelWatt }), big: false },
  ];

  return (
    <div className="anim-fadeUp">
      <div className="flex items-start justify-between gap-4 flex-wrap mb-[22px]">
        <div>
          <StepLabel>{t("results.step_label")}</StepLabel>
          <H1>{t("results.title")}</H1>
          <p className="text-[16px] text-[color:var(--ink-muted)]">
            {t("results.subtitle", { project: projLabel })}
          </p>
          {(site?.systemType || site?.goal || site?.installZone) && (
            <div className="flex gap-2 flex-wrap mt-3">
              {site?.systemType && (
                <span className="inline-flex items-center gap-[6px] bg-[#EEF2FB] text-[color:var(--brand-navy)] px-3 py-[6px] rounded-[9px] font-display font-semibold text-[12.5px]">
                  <Icon name="bolt" size={15} />
                  {t(`site.systype.${site.systemType}.label` as DictKey)}
                </span>
              )}
              {site?.installZone && (
                <span className="inline-flex items-center gap-[6px] bg-[#EEF2FB] text-[color:var(--brand-navy)] px-3 py-[6px] rounded-[9px] font-display font-semibold text-[12.5px]">
                  <Icon name={site.installZone === "roof" ? "roofing" : "landscape"} size={15} />
                  {t(site.installZone === "roof" ? "results.chip.rooftop" : "results.chip.ground")}
                </span>
              )}
              {site?.goal && (
                <span className="inline-flex items-center gap-[6px] bg-[#FFF7E6] text-[#B47B12] px-3 py-[6px] rounded-[9px] font-display font-semibold text-[12.5px]">
                  <Icon name="flag" size={15} />
                  {t(`site.goal.${site.goal}.label` as DictKey)}
                </span>
              )}
            </div>
          )}
        </div>
        <div className="inline-flex items-center gap-[9px] bg-white border border-[color:var(--border)] rounded-[14px] px-4 py-[11px] shadow-[0_6px_20px_rgba(40,60,110,.07)]">
          <Icon name={catIcon} size={24} className="text-[color:var(--brand-navy)]" />
          <div>
            <div className="text-[11px] text-[color:var(--ink-ghost)] font-semibold uppercase tracking-[.5px]">{t("results.system_category")}</div>
            <div className="font-display font-bold text-[16px] text-[color:var(--ink)]">{t(`results.cat.${category}` as DictKey)}</div>
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
          <div className="font-display font-bold text-[15px] text-[color:var(--ink)] mb-[18px]">{t("results.donut.title")}</div>
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
          <div className="font-display font-bold text-[15px] text-[color:var(--ink)] mb-[18px]">{t("results.bars.title")}</div>
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

      {(() => {
        const bill = site?.monthlyBill ? Number(site.monthlyBill) : 0;
        if (!bill || bill <= 0) return null;
        const currency = site?.currency || "FCFA";
        // Heuristic: an off-grid/hybrid system offsets ~85% of the bill; on-grid net-metered ~70%.
        const offset = site?.systemType === "on_grid" ? 0.7 : 0.85;
        const monthlySavings = bill * offset;
        const annualSavings = monthlySavings * 12;
        // Rough turnkey cost per kWp (West Africa typical range, conservative).
        const costPerKwp = 950000; // ~ FCFA / kWp turnkey assumption
        const estCost = c.pv * costPerKwp;
        // Normalize cost by currency-vs-FCFA rough heuristics so the number is meaningful per local input.
        const conv: Record<string, number> = { FCFA: 1, NGN: 2.6, GHS: 0.024, USD: 0.0016, EUR: 0.0015, MAD: 0.016, KES: 0.21, TRY: 0.06 };
        const localCost = estCost * (conv[currency] ?? 1);
        const paybackYears = annualSavings > 0 ? localCost / annualSavings : 0;
        const co2Tons = (c.daily * 365 * 0.6) / 1000; // 0.6 kg CO2 / kWh grid avoided, → tons/year
        return (
          <div className="mt-[18px] grid gap-[15px] [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]">
            <BonusStat icon="savings" tint="#EAF6EF" ic="#1FA855" valueColor="#168944" value={formatCurrency(monthlySavings, currency)} unit={t("results.bonus.per_month")} label={t("results.bonus.monthly_savings")} />
            <BonusStat icon="payments" tint="#EAF6EF" ic="#1FA855" valueColor="#168944" value={formatCurrency(annualSavings, currency)} unit={t("results.bonus.per_year")} label={t("results.bonus.annual_savings")} />
            <BonusStat icon="schedule" tint="#EEF2FB" ic="#35508E" valueColor="#1B2A50" value={paybackYears > 0 ? paybackYears.toFixed(1) : "—"} unit={t("results.bonus.payback_unit")} label={t("results.bonus.payback")} />
            <BonusStat icon="eco" tint="#F2FAF5" ic="#1FA855" valueColor="#168944" value={co2Tons.toFixed(2)} unit={t("results.bonus.emissions_unit")} label={t("results.bonus.emissions")} />
          </div>
        );
      })()}

      <RequestVsRecommendation site={site} pv={c.pv} batt={c.batt} t={t} />

      <div
        className="mt-[18px] rounded-[22px] p-6 flex gap-4 items-start"
        style={{ background: "linear-gradient(135deg,#FFFBF2 0%,#FFF6E2 100%)", border: "1px solid #F6E2B0" }}
      >
        <div className="w-[44px] h-[44px] rounded-[13px] bg-[color:var(--brand-amber)] flex items-center justify-center shrink-0 shadow-[0_6px_16px_rgba(244,177,42,.4)]">
          <Icon name="lightbulb" size={26} className="text-white" />
        </div>
        <div>
          <div className="font-display font-bold text-[16px] text-[#7A5408] mb-[5px]">{t("results.recommend.title")}</div>
          <div className="text-[14.5px] text-[#8A6512] leading-[1.55]">{recommendation}</div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-[14px] flex-wrap mt-[26px]">
        <BackButton onClick={onBack}>
          <Icon name="arrow_back" size={20} />
          {t("results.back")}
        </BackButton>
        <PrimaryButton onClick={onSubmit}>
          <Icon name="send" size={20} />
          {t("results.submit")}
        </PrimaryButton>
      </div>
    </div>
  );
}

type TFn = (key: DictKey, vars?: Record<string, string | number>) => string;

function RequestVsRecommendation({ site, pv, batt, t }: { site?: SiteForm; pv: number; batt: number; t: TFn }) {
  if (!site) return null;
  const reqBatt = site.batteryCapacityKwh ? Number(site.batteryCapacityKwh) : 0;
  const reqCount = site.inverterCount ? parseInt(site.inverterCount, 10) : 0;
  const reqCap = site.inverterCapacityKw ? Number(site.inverterCapacityKw) : 0;
  const hasBatt = reqBatt > 0;
  const hasInv = reqCount > 0 && reqCap > 0;
  if (!hasBatt && !hasInv) return null;

  // Recommended inverter ~ 0.9 * pv kW (oversize slightly), single unit if pv ≤ 5
  const recCount = pv <= 5 ? 1 : Math.ceil(pv / 6);
  const recCap = recCount > 0 ? Math.max(1, +(pv * 0.9 / recCount).toFixed(1)) : 0;

  const rows: Array<{ label: string; requested: string; recommended: string; deltaPct: number; icon: string }> = [];
  if (hasBatt) {
    const deltaPct = ((reqBatt - batt) / Math.max(batt, 0.01)) * 100;
    rows.push({
      label: t("results.compare.battery"),
      requested: `${fmt(reqBatt, 1)} kWh`,
      recommended: `${fmt(batt, 1)} kWh`,
      deltaPct,
      icon: "battery_full",
    });
  }
  if (hasInv) {
    const reqTotal = reqCount * reqCap;
    const recTotal = recCount * recCap;
    const deltaPct = ((reqTotal - recTotal) / Math.max(recTotal, 0.01)) * 100;
    rows.push({
      label: t("results.compare.inverter"),
      requested: `${reqCount} × ${fmt(reqCap, 1)} kW (${fmt(reqTotal, 1)} kW total)`,
      recommended: `${recCount} × ${fmt(recCap, 1)} kW (${fmt(recTotal, 1)} kW total)`,
      deltaPct,
      icon: "electrical_services",
    });
  }

  return (
    <div className="mt-[18px] bg-white border border-[color:var(--border)] rounded-[22px] shadow-[0_8px_28px_rgba(40,60,110,.07)] p-6">
      <div className="flex items-center gap-2 mb-4">
        <Icon name="compare_arrows" size={20} className="text-[color:var(--brand-navy)]" />
        <div className="font-display font-bold text-[15px] text-[color:var(--ink)]">{t("results.compare.title")}</div>
      </div>
      <div className="flex flex-col gap-[14px]">
        {rows.map((r, i) => {
          const abs = Math.abs(r.deltaPct);
          const within = abs <= 15;
          const over = r.deltaPct > 15;
          const badgeBg = within ? "#EAF6EF" : over ? "#FFF7E6" : "#FEF1ED";
          const badgeCol = within ? "var(--success)" : over ? "#B47B12" : "var(--danger)";
          const badgeIcon = within ? "check_circle" : over ? "trending_up" : "trending_down";
          const badgeText = within
            ? t("results.compare.good")
            : over
              ? t("results.compare.over", { pct: abs.toFixed(0) })
              : t("results.compare.under", { pct: abs.toFixed(0) });
          return (
            <div key={i} className="grid items-center gap-3" style={{ gridTemplateColumns: "minmax(0,1fr) auto" }}>
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-[36px] h-[36px] rounded-[10px] bg-[#EEF2FB] text-[color:var(--brand-navy)] flex items-center justify-center shrink-0">
                  <Icon name={r.icon} size={20} />
                </div>
                <div className="min-w-0">
                  <div className="font-display font-bold text-[13.5px] text-[color:var(--ink)]">{r.label}</div>
                  <div className="text-[12.5px] text-[color:var(--ink-faint)] truncate">
                    {t("results.compare.asked_suggest", { requested: r.requested, recommended: r.recommended })}
                  </div>
                </div>
              </div>
              <div
                className="inline-flex items-center gap-[5px] px-[10px] py-[5px] rounded-[8px] font-display font-bold text-[11.5px] whitespace-nowrap"
                style={{ background: badgeBg, color: badgeCol }}
              >
                <Icon name={badgeIcon} size={14} />
                {badgeText}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function BonusStat({ icon, tint, ic, valueColor, value, unit, label }: { icon: string; tint: string; ic: string; valueColor: string; value: string; unit: string; label: string }) {
  return (
    <div className="rounded-[20px] p-5 bg-white border border-[color:var(--border)] shadow-[0_8px_24px_rgba(40,60,110,.07)]">
      <div className="w-[46px] h-[46px] rounded-[13px] flex items-center justify-center" style={{ background: tint, color: ic }}>
        <Icon name={icon} size={24} />
      </div>
      <div className="flex items-baseline gap-[5px] mt-4">
        <span className="font-display font-extrabold text-[28px] tracking-[-.8px]" style={{ color: valueColor }}>{value}</span>
        <span className="font-display font-semibold text-[13px] text-[#8493AC]">{unit}</span>
      </div>
      <div className="text-[13px] text-[color:var(--ink-muted)] font-semibold mt-[3px]">{label}</div>
    </div>
  );
}

function formatCurrency(n: number, currency: string) {
  if (!Number.isFinite(n)) return "—";
  const rounded = Math.round(n);
  return `${rounded.toLocaleString("en-US")} ${currency}`;
}
