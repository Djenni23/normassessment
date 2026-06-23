"use client";
import { Icon } from "../Icon";
import { StepLabel, H1, Lede, PrimaryButton, BackButton, Section, fieldLabel, fieldInput } from "../ui";
import {
  GOALS,
  INSTALL_ZONES,
  ORIENTATIONS,
  ROOF_MATERIALS,
  ROOF_TYPES,
  SOILS,
  SYSTEM_TYPES,
  type GoalId,
  type InstallZoneId,
  type OrientationId,
  type RoofMaterialId,
  type RoofTypeId,
  type SoilId,
  type SystemTypeId,
} from "@/lib/catalog";
import { CURRENCIES, type SiteForm } from "@/lib/site";

type SiteUpdater = <K extends keyof SiteForm>(k: K, v: SiteForm[K]) => void;
type RoofUpdater = <K extends keyof SiteForm["roof"]>(k: K, v: SiteForm["roof"][K]) => void;
type GroundUpdater = <K extends keyof SiteForm["ground"]>(k: K, v: SiteForm["ground"][K]) => void;

export function SiteStep({
  site,
  onChange,
  onRoofChange,
  onGroundChange,
  onBack,
  onContinue,
}: {
  site: SiteForm;
  onChange: SiteUpdater;
  onRoofChange: RoofUpdater;
  onGroundChange: GroundUpdater;
  onBack: () => void;
  onContinue: () => void;
}) {
  const disabled = !site.systemType || !site.installZone || !site.goal;

  return (
    <div className="anim-fadeUp max-w-[860px] mx-auto">
      <StepLabel>Step 3 · Site & Objectives</StepLabel>
      <H1>Tell us about the site</H1>
      <Lede className="max-w-[620px]">
        These details help us match the right modules, mounting, and inverters to your project.
      </Lede>

      {/* ---- System type ---- */}
      <div className="bg-white border border-[color:var(--border)] rounded-[22px] shadow-[0_8px_28px_rgba(40,60,110,.07)] p-[26px] mb-5">
        <Section icon="bolt" label="System type" />
        <div className="grid gap-[12px] [grid-template-columns:repeat(auto-fit,minmax(200px,1fr))]">
          {SYSTEM_TYPES.map((s) => (
            <ChoiceCard
              key={s.id}
              selected={site.systemType === s.id}
              icon={s.icon}
              title={s.label}
              desc={s.desc}
              onClick={() => onChange("systemType", s.id as SystemTypeId)}
            />
          ))}
        </div>
      </div>

      {/* ---- Installation zone ---- */}
      <div className="bg-white border border-[color:var(--border)] rounded-[22px] shadow-[0_8px_28px_rgba(40,60,110,.07)] p-[26px] mb-5">
        <Section icon="map" label="Installation zone" />
        <div className="grid gap-[12px] [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))] mb-4">
          {INSTALL_ZONES.map((z) => (
            <ChoiceCard
              key={z.id}
              selected={site.installZone === z.id}
              icon={z.icon}
              title={z.label}
              onClick={() => onChange("installZone", z.id as InstallZoneId)}
            />
          ))}
        </div>

        {site.installZone === "roof" && (
          <div className="anim-fadeUp-fast grid gap-[15px] [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))] mt-4">
            <Field label="Roof type">
              <Pills
                options={ROOF_TYPES.map((r) => ({ id: r.id, label: r.label }))}
                value={site.roof.type}
                onChange={(v) => onRoofChange("type", v as RoofTypeId)}
              />
            </Field>
            <Field label="Material">
              <Pills
                options={ROOF_MATERIALS.map((r) => ({ id: r.id, label: r.label }))}
                value={site.roof.material}
                onChange={(v) => onRoofChange("material", v as RoofMaterialId)}
              />
              {site.roof.material === "other" && (
                <input
                  value={site.roof.materialOther}
                  onChange={(e) => onRoofChange("materialOther", e.target.value)}
                  placeholder="Specify…"
                  className={`${fieldInput} mt-2`}
                />
              )}
            </Field>
            <Field label="Orientation">
              <Pills
                options={ORIENTATIONS.map((o) => ({ id: o.id, label: o.label }))}
                value={site.roof.orientation}
                onChange={(v) => onRoofChange("orientation", v as OrientationId)}
              />
              {site.roof.orientation === "other" && (
                <input
                  value={site.roof.orientationOther}
                  onChange={(e) => onRoofChange("orientationOther", e.target.value)}
                  placeholder="Specify…"
                  className={`${fieldInput} mt-2`}
                />
              )}
            </Field>
            <label className="block">
              <span className={fieldLabel}>Tilt angle (°)</span>
              <input
                inputMode="numeric"
                value={site.roof.tiltDeg}
                onChange={(e) => onRoofChange("tiltDeg", e.target.value.replace(/[^0-9.]/g, ""))}
                placeholder="e.g. 15"
                className={fieldInput}
              />
            </label>
          </div>
        )}

        {site.installZone === "ground" && (
          <div className="anim-fadeUp-fast grid gap-[15px] [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))] mt-4">
            <label className="block">
              <span className={fieldLabel}>Available surface (m²)</span>
              <input
                inputMode="numeric"
                value={site.ground.surfaceSqm}
                onChange={(e) => onGroundChange("surfaceSqm", e.target.value.replace(/[^0-9.]/g, ""))}
                placeholder="e.g. 120"
                className={fieldInput}
              />
            </label>
            <Field label="Soil nature">
              <Pills
                options={SOILS.map((s) => ({ id: s.id, label: s.label }))}
                value={site.ground.soil}
                onChange={(v) => onGroundChange("soil", v as SoilId)}
              />
              {site.ground.soil === "other" && (
                <input
                  value={site.ground.soilOther}
                  onChange={(e) => onGroundChange("soilOther", e.target.value)}
                  placeholder="Specify…"
                  className={`${fieldInput} mt-2`}
                />
              )}
            </Field>
          </div>
        )}
      </div>

      {/* ---- Goal ---- */}
      <div className="bg-white border border-[color:var(--border)] rounded-[22px] shadow-[0_8px_28px_rgba(40,60,110,.07)] p-[26px] mb-5">
        <Section icon="flag" label="What's your goal?" />
        <div className="grid gap-[12px] [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]">
          {GOALS.map((g) => (
            <ChoiceCard
              key={g.id}
              selected={site.goal === g.id}
              icon={g.icon}
              title={g.label}
              desc={g.desc}
              onClick={() => onChange("goal", g.id as GoalId)}
            />
          ))}
        </div>
      </div>

      {/* ---- Extras (creative additions: monthly bill, brand, timeline, notes) ---- */}
      <div className="bg-white border border-[color:var(--border)] rounded-[22px] shadow-[0_8px_28px_rgba(40,60,110,.07)] p-[26px] mb-5">
        <Section icon="more_horiz" label="Extra context (optional)" />

        <div className="grid gap-[15px] [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]">
          <label className="block">
            <span className={fieldLabel}>
              <Icon name="receipt_long" size={15} className="align-[-2px] text-[color:var(--brand-amber)]" /> Monthly electricity bill
            </span>
            <div className="flex gap-2">
              <input
                inputMode="numeric"
                value={site.monthlyBill}
                onChange={(e) => onChange("monthlyBill", e.target.value.replace(/[^0-9.]/g, ""))}
                placeholder="e.g. 45000"
                className={`${fieldInput} flex-1`}
              />
              <select
                value={site.currency}
                onChange={(e) => onChange("currency", e.target.value)}
                className={`${fieldInput} w-[110px] cursor-pointer`}
              >
                {CURRENCIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <span className="text-[11.5px] text-[color:var(--ink-faint)] mt-1 block">We&apos;ll estimate your annual savings and payback period.</span>
          </label>

          <label className="block">
            <span className={fieldLabel}>Preferred module brand / type</span>
            <input
              value={site.moduleBrand}
              onChange={(e) => onChange("moduleBrand", e.target.value)}
              placeholder="e.g. Canadian Solar, Jinko, no preference…"
              className={fieldInput}
            />
          </label>

          <label className="block">
            <span className={fieldLabel}>Delivery / project timeline</span>
            <input
              value={site.timeline}
              onChange={(e) => onChange("timeline", e.target.value)}
              placeholder="e.g. within 2 months, by Q3 2026"
              className={fieldInput}
            />
          </label>

          <label className="block sm:col-span-2" style={{ gridColumn: "1/-1" }}>
            <span className={fieldLabel}>Notes / remarks</span>
            <textarea
              value={site.notes}
              onChange={(e) => onChange("notes", e.target.value)}
              placeholder="Anything else our team should know…"
              rows={3}
              className={`${fieldInput} resize-y min-h-[88px]`}
            />
          </label>
        </div>
      </div>

      <div className="flex items-center justify-between gap-[14px] flex-wrap mt-[26px]">
        <BackButton onClick={onBack}>
          <Icon name="arrow_back" size={20} />
          Back
        </BackButton>
        <div className="flex items-center gap-4">
          {disabled && (
            <span className="text-[13.5px] text-[color:var(--ink-faint)] font-semibold">
              Pick system type, zone &amp; goal to continue
            </span>
          )}
          <PrimaryButton onClick={onContinue} disabled={disabled}>
            Continue
            <Icon name="arrow_forward" size={20} />
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}

function ChoiceCard({
  selected,
  icon,
  title,
  desc,
  onClick,
}: {
  selected: boolean;
  icon: string;
  title: string;
  desc?: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="text-left cursor-pointer rounded-[18px] p-4 flex items-center gap-3 transition-all duration-200 hover:-translate-y-[2px] hover:shadow-[0_12px_24px_rgba(40,60,110,.10)]"
      style={{
        background: selected ? "#F4F8FF" : "#fff",
        border: `2px solid ${selected ? "var(--brand-navy)" : "var(--border)"}`,
        boxShadow: selected ? "0 10px 24px rgba(53,80,142,.14)" : "0 4px 14px rgba(40,60,110,.04)",
      }}
    >
      <div
        className="w-[44px] h-[44px] rounded-[12px] flex items-center justify-center shrink-0 transition-all"
        style={{
          background: selected ? "var(--brand-navy)" : "#EEF2FB",
          color: selected ? "#fff" : "var(--brand-navy)",
        }}
      >
        <Icon name={icon} size={24} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-display font-bold text-[15px] text-[color:var(--ink)] leading-tight">{title}</div>
        {desc && <div className="text-[12.5px] text-[color:var(--ink-faint)] mt-[2px]">{desc}</div>}
      </div>
      {selected && (
        <div className="w-[22px] h-[22px] rounded-full bg-[color:var(--brand-navy)] text-white flex items-center justify-center shrink-0">
          <Icon name="check" size={16} />
        </div>
      )}
    </button>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <span className={fieldLabel}>{label}</span>
      {children}
    </div>
  );
}

function Pills({
  options,
  value,
  onChange,
}: {
  options: Array<{ id: string; label: string }>;
  value: string | null;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-[6px]">
      {options.map((o) => {
        const on = value === o.id;
        return (
          <button
            key={o.id}
            type="button"
            onClick={() => onChange(o.id)}
            className="px-[12px] py-[8px] rounded-[10px] font-semibold text-[13px] cursor-pointer transition-all border"
            style={{
              background: on ? "var(--brand-navy)" : "#fff",
              borderColor: on ? "var(--brand-navy)" : "var(--border-strong)",
              color: on ? "#fff" : "var(--ink-soft)",
            }}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
