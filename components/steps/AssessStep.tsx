"use client";
import { useState } from "react";
import { Icon } from "../Icon";
import { StepLabel, H1, Lede, fieldInput, fieldLabel } from "../ui";
import { CATALOG, TYPES, type ProjectTypeId } from "@/lib/catalog";
import { calc, fmt, type Settings } from "@/lib/calc";
import { useT } from "../LangProvider";
import type { DictKey } from "@/lib/i18n/types";

export type Equipment = Record<string, { qty: number; hours?: number }>;
export type CustomAppliance = { id: string; label: string; watts: number; hours: number };

export function AssessStep({
  equipment,
  customAppliances,
  projectType,
  settings,
  onInc,
  onDec,
  onHours,
  onAddCustom,
  onRemoveCustom,
  onBack,
  onContinue,
}: {
  equipment: Equipment;
  customAppliances: CustomAppliance[];
  projectType: ProjectTypeId | null;
  settings: Settings;
  onInc: (id: string) => void;
  onDec: (id: string) => void;
  onHours: (id: string, h: number) => void;
  onAddCustom: (a: CustomAppliance) => void;
  onRemoveCustom: (id: string) => void;
  onBack: () => void;
  onContinue: () => void;
}) {
  const t = useT();
  const extra = customAppliances.map((a) => ({ id: a.id, watts: a.watts, hours: a.hours }));
  const c = calc(equipment, settings, extra);
  const tp = TYPES.find((x) => x.id === projectType);
  const typeLabel = tp ? t(`type.${tp.id}.label` as DictKey) : "—";
  const disabled = c.count === 0;

  const [adding, setAdding] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newWatts, setNewWatts] = useState("");

  const confirmAdd = () => {
    const w = parseInt(newWatts, 10);
    if (!newLabel.trim() || !w || w <= 0) return;
    onAddCustom({ id: `custom_${Date.now()}`, label: newLabel.trim(), watts: w, hours: 4 });
    setNewLabel("");
    setNewWatts("");
    setAdding(false);
  };

  return (
    <div className="anim-fadeUp">
      <StepLabel>{t("assess.step_label")}</StepLabel>
      <H1>{t("assess.title")}</H1>
      <Lede className="max-w-[620px]">{t("assess.subtitle")}</Lede>

      <div className="flex flex-wrap gap-[22px] items-start">
        <div className="flex-1 basis-[540px] min-w-[300px]">
          <div className="grid gap-[14px] [grid-template-columns:repeat(auto-fill,minmax(232px,1fr))]">
            {CATALOG.map((a) => {
              const qty = equipment[a.id]?.qty ?? 0;
              const hours = equipment[a.id]?.hours ?? a.hours;
              const active = qty > 0;
              const duty = a.duty ?? 1;
              const contribution = fmt((a.watts * qty * hours * duty) / 1000, 1);
              const wattLabel = a.watts >= 1000 ? `${fmt(a.watts / 1000, 1)} kW` : `${a.watts} W`;
              return (
                <ApplianceCard
                  key={a.id}
                  label={t(`appliance.${a.id}` as DictKey)}
                  icon={a.icon}
                  wattLabel={wattLabel}
                  qty={qty}
                  hours={hours}
                  active={active}
                  contribution={contribution}
                  onInc={() => onInc(a.id)}
                  onDec={() => onDec(a.id)}
                  onHours={(h) => onHours(a.id, h)}
                  hoursLabel={t("assess.hours_per_day")}
                  kwhLabel={t("assess.kwh_per_day")}
                />
              );
            })}

            {customAppliances.map((a) => {
              const qty = equipment[a.id]?.qty ?? 0;
              const hours = equipment[a.id]?.hours ?? a.hours;
              const active = qty > 0;
              const contribution = fmt((a.watts * qty * hours) / 1000, 1);
              const wattLabel = a.watts >= 1000 ? `${fmt(a.watts / 1000, 1)} kW` : `${a.watts} W`;
              return (
                <ApplianceCard
                  key={a.id}
                  label={a.label}
                  icon="category"
                  wattLabel={wattLabel}
                  qty={qty}
                  hours={hours}
                  active={active}
                  contribution={contribution}
                  onInc={() => onInc(a.id)}
                  onDec={() => onDec(a.id)}
                  onHours={(h) => onHours(a.id, h)}
                  hoursLabel={t("assess.hours_per_day")}
                  kwhLabel={t("assess.kwh_per_day")}
                  onRemove={() => onRemoveCustom(a.id)}
                />
              );
            })}

            {adding ? (
              <div
                className="rounded-[18px] p-4 anim-fadeUp-fast"
                style={{ background: "#F4F8FF", border: "1.5px solid var(--brand-navy)" }}
              >
                <div className="font-display font-bold text-[13px] text-[color:var(--brand-navy)] mb-3">
                  {t("assess.custom.add_title")}
                </div>
                <label className="block mb-2">
                  <span className={fieldLabel} style={{ marginBottom: 4 }}>{t("assess.custom.name")}</span>
                  <input
                    autoFocus
                    value={newLabel}
                    onChange={(e) => setNewLabel(e.target.value.slice(0, 60))}
                    placeholder={t("assess.custom.name_ph")}
                    className={fieldInput}
                    style={{ padding: "10px 12px", fontSize: 14 }}
                  />
                </label>
                <label className="block mb-3">
                  <span className={fieldLabel} style={{ marginBottom: 4 }}>{t("assess.custom.watts")}</span>
                  <input
                    inputMode="numeric"
                    value={newWatts}
                    onChange={(e) => setNewWatts(e.target.value.replace(/\D/g, ""))}
                    placeholder={t("assess.custom.watts_ph")}
                    className={fieldInput}
                    style={{ padding: "10px 12px", fontSize: 14 }}
                  />
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={confirmAdd}
                    disabled={!newLabel.trim() || !newWatts}
                    className="flex-1 rounded-[10px] py-[9px] font-semibold text-[13px] border-0 cursor-pointer"
                    style={{
                      background: newLabel.trim() && newWatts ? "var(--brand-navy)" : "#C2CBDA",
                      color: "#fff",
                    }}
                  >
                    {t("assess.custom.confirm")}
                  </button>
                  <button
                    onClick={() => { setAdding(false); setNewLabel(""); setNewWatts(""); }}
                    className="px-[14px] rounded-[10px] py-[9px] font-semibold text-[13px] border border-[color:var(--border-strong)] bg-white cursor-pointer text-[color:var(--ink-soft)]"
                  >
                    {t("common.cancel")}
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setAdding(true)}
                className="rounded-[18px] p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all hover:border-[color:var(--brand-navy)] hover:bg-[#F4F8FF]"
                style={{ background: "#fff", border: "1.5px dashed #C2CBDA", minHeight: 90 }}
              >
                <div className="w-[38px] h-[38px] rounded-[11px] bg-[#EEF2FB] flex items-center justify-center text-[color:var(--brand-navy)]">
                  <Icon name="add" size={22} />
                </div>
                <span className="font-semibold text-[13px] text-[color:var(--ink-faint)]">{t("assess.custom.add_btn")}</span>
              </button>
            )}
          </div>
        </div>

        <aside className="flex-1 basis-[320px] max-w-[368px] md:sticky md:top-[92px]">
          <div
            className="rounded-[24px] p-6 text-white shadow-[0_18px_40px_rgba(40,60,110,.26)] relative overflow-hidden"
            style={{ background: "linear-gradient(160deg,#35508E 0%,#2A3F73 100%)" }}
          >
            <div className="absolute w-[180px] h-[180px] rounded-full -top-[60px] -right-[50px]" style={{ background: "radial-gradient(circle,rgba(244,177,42,.32),transparent 70%)" }} />
            <div className="font-mono font-medium text-[11px] tracking-[2px] uppercase text-[#B9C6E6] relative">{t("assess.live_estimate")}</div>
            <div className="flex items-end gap-[10px] mt-[14px] relative">
              <div className="w-[50px] h-[50px] rounded-[14px] flex items-center justify-center anim-floaty" style={{ background: "rgba(244,177,42,.18)" }}>
                <Icon name="solar_power" size={30} className="text-[color:var(--brand-amber)]" />
              </div>
              <div>
                <div className="font-display font-extrabold text-[38px] leading-[.9] tracking-[-1px]">{fmt(c.pv, 1)}</div>
                <div className="text-[12px] text-[#B9C6E6] font-semibold mt-[3px]">{t("assess.kwp_recommended")}</div>
              </div>
            </div>
            <div className="h-px bg-white/15 my-5 relative" />
            <div className="flex flex-col gap-[13px] relative">
              <SummaryRow icon="battery_charging_full" label={t("assess.daily_consumption")} value={`${fmt(c.daily, 1)} kWh`} />
              <SummaryRow icon="speed" label={t("assess.peak_load")} value={`${fmt(Math.round(c.peak), 0)} W`} />
              <SummaryRow icon="inventory_2" label={t("assess.equipment_items")} value={String(c.count)} />
              <div className="flex items-center justify-between">
                <span className="text-[13.5px] text-[#C7D2EA] flex items-center gap-2">
                  <Icon name="category" size={18} className="text-[#8FA4D0]" />
                  {t("assess.project_type")}
                </span>
                <span className="font-display font-bold text-[14px] bg-[rgba(244,177,42,.16)] text-[#F8CB6A] px-[11px] py-[3px] rounded-[20px]">{typeLabel}</span>
              </div>
            </div>
            <button
              onClick={onContinue}
              disabled={disabled}
              className="w-full mt-[22px] flex items-center justify-center gap-2 border-0 rounded-[14px] py-[15px] font-display font-bold text-[15.5px] transition-all"
              style={{
                background: disabled ? "rgba(255,255,255,.18)" : "var(--brand-amber)",
                color: disabled ? "#9FB0D6" : "#3A2A00",
                boxShadow: disabled ? "none" : "0 8px 20px rgba(244,177,42,.34)",
                cursor: disabled ? "not-allowed" : "pointer",
              }}
            >
              {t("assess.cta")}
              <Icon name="arrow_forward" size={20} />
            </button>
            {disabled && (
              <div className="text-center text-[12px] text-[#9FB0D6] mt-[10px]">{t("assess.cta_disabled")}</div>
            )}
          </div>
          <button
            onClick={onBack}
            className="w-full mt-3 bg-transparent border-0 text-[color:var(--ink-muted)] font-semibold text-[14px] py-[10px] cursor-pointer flex items-center justify-center gap-[6px] hover:text-[color:var(--brand-navy)]"
          >
            <Icon name="arrow_back" size={18} />
            {t("assess.back_to_details")}
          </button>
        </aside>
      </div>
    </div>
  );
}

function ApplianceCard({
  label,
  icon,
  wattLabel,
  qty,
  hours,
  active,
  contribution,
  onInc,
  onDec,
  onHours,
  hoursLabel,
  kwhLabel,
  onRemove,
}: {
  label: string;
  icon: string;
  wattLabel: string;
  qty: number;
  hours: number;
  active: boolean;
  contribution: string;
  onInc: () => void;
  onDec: () => void;
  onHours: (h: number) => void;
  hoursLabel: string;
  kwhLabel: string;
  onRemove?: () => void;
}) {
  return (
    <div
      className="rounded-[18px] p-4 transition-all duration-200"
      style={{
        background: "#fff",
        border: `1.5px solid ${active ? "#C9D6EC" : "#EBEFF6"}`,
        boxShadow: active ? "0 8px 22px rgba(53,80,142,.09)" : "0 4px 14px rgba(40,60,110,.04)",
      }}
    >
      <div className="flex items-center gap-[11px]">
        <div
          className="w-[42px] h-[42px] rounded-[12px] shrink-0 flex items-center justify-center transition-all"
          style={{
            background: active ? "var(--brand-navy)" : "#EEF2FB",
            color: active ? "#fff" : "var(--brand-navy)",
          }}
        >
          <Icon name={icon} size={23} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-display font-bold text-[15px] text-[color:var(--ink)] leading-[1.15]">{label}</div>
          <div className="font-mono font-medium text-[11px] text-[color:var(--ink-ghost)]">{wattLabel}</div>
        </div>
        {onRemove && (
          <button
            onClick={onRemove}
            className="w-[24px] h-[24px] rounded-full flex items-center justify-center border-0 cursor-pointer shrink-0 text-[color:var(--ink-ghost)] hover:bg-[#FDECEA] hover:text-[color:var(--danger)]"
            style={{ background: "#F4F6FB" }}
            title="Remove"
          >
            <Icon name="close" size={15} />
          </button>
        )}
      </div>
      <div className="flex items-center justify-between gap-2 mt-[14px]">
        <button
          onClick={onDec}
          className="w-[38px] h-[38px] rounded-[11px] border-0 bg-[#EFF2F7] cursor-pointer flex items-center justify-center transition-colors hover:bg-[#E2E8F2]"
          style={{ color: active ? "var(--ink-soft)" : "#B6C0D0" }}
        >
          <Icon name="remove" size={20} />
        </button>
        <div
          className="flex-1 text-center font-display font-extrabold text-[22px]"
          style={{ color: active ? "var(--ink)" : "#C2CBDA" }}
        >
          {qty}
        </div>
        <button
          onClick={onInc}
          className="w-[38px] h-[38px] rounded-[11px] border-0 bg-[color:var(--brand-navy)] text-white cursor-pointer flex items-center justify-center shadow-[0_4px_10px_rgba(53,80,142,.22)] hover:brightness-110"
        >
          <Icon name="add" size={20} />
        </button>
      </div>
      {active && (
        <div className="anim-fadeUp-fast mt-[13px] pt-[12px] border-t border-dashed border-[#E3E9F2]">
          <div className="flex justify-between items-baseline mb-[5px]">
            <span className="text-[11.5px] text-[color:var(--ink-faint)] font-semibold">{hoursLabel}</span>
            <span className="font-display font-bold text-[13px] text-[color:var(--brand-navy)]">{hours}h</span>
          </div>
          <input
            type="range"
            min={1}
            max={24}
            value={hours}
            onChange={(e) => onHours(parseInt(e.target.value, 10))}
            className="w-full h-[5px] cursor-pointer"
          />
          <div className="mt-[9px] inline-flex items-center gap-[5px] bg-[#FFF7E6] border border-[#F6E2B0] rounded-[8px] px-[9px] py-[3px] font-mono font-semibold text-[11.5px] text-[#B47B12]">
            <Icon name="bolt" size={14} />
            {contribution} {kwhLabel}
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[13.5px] text-[#C7D2EA] flex items-center gap-2">
        <Icon name={icon} size={18} className="text-[#8FA4D0]" />
        {label}
      </span>
      <span className="font-display font-bold text-[15px]">{value}</span>
    </div>
  );
}
