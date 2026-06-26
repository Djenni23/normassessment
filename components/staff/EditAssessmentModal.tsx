"use client";
import { useEffect, useState } from "react";
import { Icon } from "../Icon";
import { useT } from "../LangProvider";
import { TYPES, COUNTRIES, type ProjectTypeId } from "@/lib/catalog";
import type { DictKey } from "@/lib/i18n/types";

export type EditableAssessment = {
  _id: string;
  projectType?: ProjectTypeId;
  customTypeLabel?: string;
  projectName?: string;
  name: string;
  dialCode?: string;
  phone?: string;
  whatsappDial?: string;
  whatsapp?: string;
  email?: string;
  country: string;
  city?: string;
  address?: string;
  status: "New" | "In Review" | "Quoted";
};

const STATUSES: Array<EditableAssessment["status"]> = ["New", "In Review", "Quoted"];
const STATUS_KEY: Record<EditableAssessment["status"], DictKey> = {
  New: "staff.status.new",
  "In Review": "staff.status.in_review",
  Quoted: "staff.status.quoted",
};

export function EditAssessmentModal({
  record,
  onClose,
  onSaved,
}: {
  record: EditableAssessment;
  onClose: () => void;
  onSaved: () => void;
}) {
  const t = useT();
  const [form, setForm] = useState<EditableAssessment>(record);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const set = <K extends keyof EditableAssessment>(k: K, v: EditableAssessment[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch(`/api/assessments/${form._id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          status: form.status,
          projectType: form.projectType,
          customTypeLabel: form.customTypeLabel ?? "",
          projectName: form.projectName ?? "",
          contact: {
            name: form.name,
            dialCode: form.dialCode ?? "",
            phone: form.phone ?? "",
            whatsappDial: form.whatsappDial ?? "",
            whatsapp: form.whatsapp ?? "",
            email: form.email ?? "",
          },
          location: {
            country: form.country,
            city: form.city ?? "",
            address: form.address ?? "",
          },
        }),
      });
      if (!res.ok) throw new Error();
      onSaved();
    } catch {
      setErr(t("staff.actions.save_failed"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-[18px] shadow-[0_24px_60px_rgba(40,60,110,.25)] w-full max-w-[560px] max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-[color:var(--border)] px-5 py-4 flex items-center justify-between">
          <h2 className="font-display font-bold text-[17px] text-[color:var(--ink)]">{t("staff.edit.title")}</h2>
          <button
            onClick={onClose}
            className="material-symbols bg-transparent border-0 cursor-pointer text-[color:var(--ink-faint)] hover:text-[color:var(--ink)]"
            style={{ fontSize: 22 }}
            aria-label="close"
          >
            close
          </button>
        </div>

        <div className="p-5 grid gap-4">
          <Field label={t("staff.edit.f.project_type")}>
            <select
              value={form.projectType ?? ""}
              onChange={(e) => set("projectType", e.target.value as ProjectTypeId)}
              className={`${fInput} cursor-pointer`}
            >
              {TYPES.map((tp) => (
                <option key={tp.id} value={tp.id}>
                  {t(`type.${tp.id}.label` as DictKey)}
                </option>
              ))}
            </select>
          </Field>

          {form.projectType === "other" && (
            <Field label={t("staff.edit.f.project_name")}>
              <input
                value={form.customTypeLabel ?? ""}
                onChange={(e) => set("customTypeLabel", e.target.value)}
                className={fInput}
              />
            </Field>
          )}

          <Field label={t("staff.edit.f.project_name")}>
            <input value={form.projectName ?? ""} onChange={(e) => set("projectName", e.target.value)} className={fInput} />
          </Field>

          <Field label={t("staff.edit.f.name")}>
            <input value={form.name} onChange={(e) => set("name", e.target.value)} className={fInput} />
          </Field>

          <div className="grid gap-3 [grid-template-columns:88px_1fr]">
            <Field label={t("staff.edit.f.phone")}>
              <input
                value={form.dialCode ?? ""}
                onChange={(e) => set("dialCode", e.target.value)}
                placeholder="+90"
                className={fInput}
              />
            </Field>
            <Field label="&nbsp;">
              <input value={form.phone ?? ""} onChange={(e) => set("phone", e.target.value)} className={fInput} />
            </Field>
          </div>

          <div className="grid gap-3 [grid-template-columns:88px_1fr]">
            <Field label={t("staff.edit.f.whatsapp")}>
              <input
                value={form.whatsappDial ?? ""}
                onChange={(e) => set("whatsappDial", e.target.value)}
                placeholder="+90"
                className={fInput}
              />
            </Field>
            <Field label="&nbsp;">
              <input value={form.whatsapp ?? ""} onChange={(e) => set("whatsapp", e.target.value)} className={fInput} />
            </Field>
          </div>

          <Field label={t("staff.edit.f.email")}>
            <input type="email" value={form.email ?? ""} onChange={(e) => set("email", e.target.value)} className={fInput} />
          </Field>

          <div className="grid gap-3 [grid-template-columns:1fr_1fr]">
            <Field label={t("staff.edit.f.country")}>
              <select value={form.country} onChange={(e) => set("country", e.target.value)} className={`${fInput} cursor-pointer`}>
                {!COUNTRIES.includes(form.country) && form.country && <option value={form.country}>{form.country}</option>}
                {COUNTRIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </Field>
            <Field label={t("staff.edit.f.city")}>
              <input value={form.city ?? ""} onChange={(e) => set("city", e.target.value)} className={fInput} />
            </Field>
          </div>

          <Field label={t("staff.edit.f.address")}>
            <input value={form.address ?? ""} onChange={(e) => set("address", e.target.value)} className={fInput} />
          </Field>

          <Field label={t("staff.edit.f.status")}>
            <select
              value={form.status}
              onChange={(e) => set("status", e.target.value as EditableAssessment["status"])}
              className={`${fInput} cursor-pointer`}
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>{t(STATUS_KEY[s])}</option>
              ))}
            </select>
          </Field>

          {err && (
            <div className="text-[13px] text-[color:var(--danger)] font-semibold flex items-center gap-1">
              <Icon name="error" size={16} /> {err}
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-white border-t border-[color:var(--border)] px-5 py-3 flex justify-end gap-2">
          <button
            onClick={onClose}
            disabled={busy}
            className="bg-white border-[1.5px] border-[color:var(--border-strong)] text-[color:var(--ink-soft)] rounded-[11px] px-[14px] py-[9px] font-semibold text-[13.5px] cursor-pointer hover:bg-[#EEF2FB] disabled:opacity-60"
          >
            {t("staff.actions.cancel")}
          </button>
          <button
            onClick={save}
            disabled={busy}
            className="inline-flex items-center gap-2 bg-[color:var(--brand-navy)] text-white border-0 rounded-[11px] px-[16px] py-[9px] font-semibold text-[13.5px] cursor-pointer shadow-[0_6px_16px_rgba(53,80,142,.22)] hover:brightness-110 disabled:opacity-60"
          >
            <Icon name="save" size={16} />
            {busy ? t("staff.actions.saving") : t("staff.actions.save")}
          </button>
        </div>
      </div>
    </div>
  );
}

const fInput =
  "w-full px-[12px] py-[10px] border-[1.5px] border-[color:var(--border-strong)] rounded-[11px] text-[14px] text-[color:var(--ink)] bg-white focus:border-[color:var(--brand-navy)] focus:shadow-[0_0_0_3px_rgba(53,80,142,.10)] outline-none";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span
        className="block font-semibold text-[12px] text-[color:var(--ink-muted)] mb-[5px]"
        dangerouslySetInnerHTML={{ __html: label }}
      />
      {children}
    </label>
  );
}
