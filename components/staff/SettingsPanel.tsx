"use client";
import { useEffect, useState } from "react";
import { Icon } from "../Icon";
import { useT } from "../LangProvider";
import type { Settings } from "@/lib/calc";

export function SettingsPanel({ initial }: { initial: Settings & { updatedAt?: string | null } }) {
  const t = useT();
  const [s, setS] = useState(initial);
  const [savedAt, setSavedAt] = useState<string | null>(initial.updatedAt ?? null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setS(initial);
    setSavedAt(initial.updatedAt ?? null);
  }, [initial]);

  const save = async () => {
    setBusy(true);
    const res = await fetch("/api/settings", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        peakSunHours: s.peakSunHours,
        performanceRatio: s.performanceRatio,
        panelWatt: s.panelWatt,
      }),
    });
    setBusy(false);
    if (res.ok) {
      const d = await res.json();
      setSavedAt(d.updatedAt);
    } else {
      alert(t("staff.settings.save_failed"));
    }
  };

  return (
    <div className="bg-white border border-[color:var(--border)] rounded-[18px] shadow-[0_6px_20px_rgba(40,60,110,.06)] p-5 mb-5">
      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Icon name="tune" size={20} className="text-[color:var(--brand-navy)]" />
          <div className="font-display font-bold text-[15px] text-[color:var(--ink)]">{t("staff.settings.title")}</div>
        </div>
        {savedAt && (
          <div className="text-[12px] text-[color:var(--ink-ghost)] font-mono">
            {t("staff.settings.updated")} {new Date(savedAt).toLocaleString()}
          </div>
        )}
      </div>
      <div className="grid gap-5 [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]">
        <SliderField label={t("staff.settings.peak_sun")} value={s.peakSunHours} min={3.5} max={6.5} step={0.1} fmt={(v) => v.toFixed(1)} onChange={(v) => setS({ ...s, peakSunHours: v })} />
        <SliderField label={t("staff.settings.perf_ratio")} value={s.performanceRatio} min={0.6} max={0.95} step={0.05} fmt={(v) => v.toFixed(2)} onChange={(v) => setS({ ...s, performanceRatio: v })} />
        <SliderField label={t("staff.settings.panel_watt")} value={s.panelWatt} min={350} max={700} step={10} fmt={(v) => `${Math.round(v)} W`} onChange={(v) => setS({ ...s, panelWatt: Math.round(v) })} />
      </div>
      <div className="flex justify-end mt-4">
        <button
          onClick={save}
          disabled={busy}
          className="inline-flex items-center gap-2 bg-[color:var(--brand-navy)] text-white border-0 rounded-[12px] px-[18px] py-[10px] font-semibold text-[14px] cursor-pointer shadow-[0_6px_16px_rgba(53,80,142,.22)] hover:brightness-110 disabled:opacity-60"
        >
          <Icon name="save" size={18} />
          {busy ? t("staff.settings.saving") : t("staff.settings.save")}
        </button>
      </div>
    </div>
  );
}

function SliderField({
  label,
  value,
  min,
  max,
  step,
  fmt,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  fmt: (v: number) => string;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block">
      <div className="flex items-baseline justify-between mb-1">
        <span className="font-semibold text-[12.5px] text-[color:var(--ink-muted)]">{label}</span>
        <span className="font-mono font-semibold text-[13px] text-[color:var(--brand-navy)]">{fmt(value)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full"
      />
    </label>
  );
}
