"use client";
import { useState } from "react";
import { Icon } from "../Icon";
import { useT } from "../LangProvider";
import type { DictKey } from "@/lib/i18n/types";

type Status = "New" | "In Review" | "Quoted";
const ALL: Status[] = ["New", "In Review", "Quoted"];
const STATUS_KEY: Record<Status, DictKey> = {
  New: "staff.status.new",
  "In Review": "staff.status.in_review",
  Quoted: "staff.status.quoted",
};

const COLOR: Record<Status, { bg: string; fg: string; dot: string }> = {
  New: { bg: "#EEF2FB", fg: "var(--brand-navy)", dot: "#35508E" },
  "In Review": { bg: "#FEF4DD", fg: "var(--warning)", dot: "#F4B12A" },
  Quoted: { bg: "#EAF6EF", fg: "var(--success)", dot: "#1FA855" },
};

export function StatusEditor({ id, initial }: { id: string; initial: Status }) {
  const t = useT();
  const [status, setStatus] = useState<Status>(initial);
  const [saving, setSaving] = useState<Status | null>(null);
  const [err, setErr] = useState(false);

  const change = async (next: Status) => {
    if (next === status || saving) return;
    setSaving(next);
    setErr(false);
    try {
      const res = await fetch(`/api/assessments/${id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) throw new Error();
      setStatus(next);
    } catch {
      setErr(true);
    } finally {
      setSaving(null);
    }
  };

  return (
    <div className="print:hidden bg-white border border-[color:var(--border)] rounded-[14px] p-[14px_18px] shadow-[0_4px_14px_rgba(40,60,110,.05)] flex items-center gap-3 flex-wrap">
      <div className="flex items-center gap-2 mr-2">
        <Icon name="flag_circle" size={18} className="text-[color:var(--brand-navy)]" />
        <span className="font-display font-bold text-[13px] text-[color:var(--ink)]">{t("staff.status_editor.label")}</span>
      </div>
      <div className="flex gap-[6px] bg-[#F4F6FB] border border-[color:var(--border)] rounded-[11px] p-[4px]">
        {ALL.map((s) => {
          const on = status === s;
          const isSaving = saving === s;
          const col = COLOR[s];
          return (
            <button
              key={s}
              onClick={() => change(s)}
              disabled={!!saving}
              className="inline-flex items-center gap-[6px] px-[12px] py-[7px] rounded-[8px] font-display font-semibold text-[12.5px] cursor-pointer transition-all disabled:opacity-60"
              style={{
                background: on ? col.bg : "transparent",
                color: on ? col.fg : "var(--ink-muted)",
              }}
            >
              <span
                className="w-[8px] h-[8px] rounded-full"
                style={{ background: on ? col.dot : "#C2CBDA" }}
              />
              {isSaving ? t("staff.status_editor.saving") : t(STATUS_KEY[s])}
            </button>
          );
        })}
      </div>
      {err && (
        <span className="text-[12.5px] text-[color:var(--danger)] font-semibold flex items-center gap-1">
          <Icon name="error" size={15} />
          {t("staff.status_editor.failed")}
        </span>
      )}
    </div>
  );
}
