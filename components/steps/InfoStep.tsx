"use client";
import { useState } from "react";
import { Icon } from "../Icon";
import {
  StepLabel,
  H1,
  Lede,
  PrimaryButton,
  BackButton,
  Section,
  fieldLabel,
  fieldInput,
} from "../ui";
import { COUNTRIES, DIAL_CODES } from "@/lib/catalog";
import { useT } from "../LangProvider";

export type ContactForm = {
  projectName: string;
  name: string;
  dialCode: string;
  phone: string;
  whatsappDial: string;
  whatsapp: string;
  email: string;
  country: string;
  countryOther: string;
  city: string;
  address: string;
};

function DialPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  // "Custom mode" lets the user type a code that's not in the preset list. If the
  // typed code later matches a preset, we automatically flip back to the select
  // so the country flag shows up.
  const [custom, setCustom] = useState(() => !!value && !DIAL_CODES.some((d) => d.code === value));

  const formatDial = (raw: string): string => {
    const digits = raw.replace(/\D/g, "");
    return digits ? "+" + digits : "";
  };

  const onSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const v = e.target.value;
    if (v === "__other__") {
      setCustom(true);
      onChange("");
    } else {
      setCustom(false);
      onChange(v);
    }
  };

  const reset = () => {
    setCustom(false);
    onChange("");
  };

  return (
    <div className="relative shrink-0 w-[72px]">
      {custom ? (
        <>
          <input
            value={value}
            onChange={(e) => {
              const next = formatDial(e.target.value);
              onChange(next);
              if (next && DIAL_CODES.some((d) => d.code === next)) setCustom(false);
            }}
            placeholder="+"
            inputMode="tel"
            autoFocus
            className={`${fieldInput} w-full pr-[20px]`}
          />
          <button
            type="button"
            onClick={reset}
            aria-label="reset"
            className="material-symbols absolute right-[6px] top-1/2 -translate-y-1/2 text-[color:var(--ink-faint)] bg-transparent border-0 p-0 cursor-pointer hover:text-[color:var(--ink-muted)]"
            style={{ fontSize: 18 }}
          >
            close
          </button>
        </>
      ) : (
        <>
          <select
            value={value}
            onChange={onSelect}
            className={`${fieldInput} w-full pr-[20px] cursor-pointer`}
          >
            <option value="">+</option>
            {DIAL_CODES.map((d) => (
              <option key={d.code} value={d.code}>
                {d.flag} {d.code}
              </option>
            ))}
            <option value="__other__">{"…"}</option>
          </select>
          <span className="material-symbols absolute right-[4px] top-1/2 -translate-y-1/2 text-[color:var(--ink-faint)] pointer-events-none" style={{ fontSize: 18 }}>
            expand_more
          </span>
        </>
      )}
    </div>
  );
}

export function InfoStep({
  form,
  onChange,
  onBack,
  onContinue,
  error,
}: {
  form: ContactForm;
  onChange: (k: keyof ContactForm, v: string) => void;
  onBack: () => void;
  onContinue: () => void;
  error: boolean;
}) {
  const t = useT();
  const sanitizeName = (v: string) => v.replace(/[0-9_]/g, "");

  const formatPhone = (raw: string): string => {
    const hasPlus = raw.startsWith("+");
    const digits = raw.replace(/\D/g, "");
    if (!digits) return hasPlus ? "+" : "";
    const parts: string[] = [digits.slice(0, 3)];
    for (let i = 3; i < digits.length; i += 2) parts.push(digits.slice(i, i + 2));
    return (hasPlus ? "+" : "") + parts.filter(Boolean).join(" ");
  };

  const bind = (k: keyof ContactForm) => ({
    value: form[k],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      let v = e.target.value;
      if (k === "name") v = sanitizeName(v);
      else if (k === "phone" || k === "whatsapp") v = formatPhone(v);
      onChange(k, v);
    },
  });
  return (
    <div className="anim-fadeUp max-w-[760px] mx-auto">
      <StepLabel>{t("info.step_label")}</StepLabel>
      <H1>{t("info.title")}</H1>
      <Lede>{t("info.subtitle")}</Lede>

      <div className="bg-white border border-[color:var(--border)] rounded-[22px] shadow-[0_8px_28px_rgba(40,60,110,.07)] p-[26px]">
        <Section icon="badge" label={t("info.section.project")} />
        <div className="grid gap-[15px] [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]">
          <label className="block sm:col-span-2" style={{ gridColumn: "1/-1" }}>
            <span className={fieldLabel}>{t("info.project_name")}</span>
            <input
              {...bind("projectName")}
              placeholder={t("info.project_name_ph")}
              className={fieldInput}
            />
          </label>
        </div>
        <div className="h-px bg-[#EDF1F7] my-[20px]" />

        <Section icon="person" label={t("info.section.contact")} />
        <div className="grid gap-[15px] [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]">
          <label className="block">
            <span className={fieldLabel}>
              {t("info.name")} <span className="text-[color:var(--danger)]">*</span>
            </span>
            <input {...bind("name")} placeholder={t("info.name_ph")} className={fieldInput} />
          </label>
          <label className="block">
            <span className={fieldLabel}>
              {t("info.phone")} <span className="text-[color:var(--danger)]">*</span>
            </span>
            <div className="flex gap-2">
              <DialPicker value={form.dialCode} onChange={(v) => onChange("dialCode", v)} />
              <input {...bind("phone")} type="tel" inputMode="numeric" placeholder={t("info.phone_ph")} className={`${fieldInput} flex-1 min-w-0`} />
            </div>
          </label>
          <label className="block">
            <span className={fieldLabel}>
              <Icon name="chat" size={15} className="align-[-2px] text-[color:var(--success)]" /> {t("info.whatsapp")}
            </span>
            <div className="flex gap-2">
              <DialPicker value={form.whatsappDial} onChange={(v) => onChange("whatsappDial", v)} />
              <input {...bind("whatsapp")} type="tel" inputMode="numeric" placeholder={t("info.whatsapp_ph")} className={`${fieldInput} flex-1 min-w-0`} />
            </div>
          </label>
          <label className="block">
            <span className={fieldLabel}>{t("info.email")}</span>
            <input {...bind("email")} placeholder={t("info.email_ph")} className={fieldInput} />
          </label>
        </div>

        <div className="h-px bg-[#EDF1F7] my-[24px]" />
        <Section icon="location_on" label={t("info.section.location")} />
        <div className="grid gap-[15px] [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]">
          <label className="block">
            <span className={fieldLabel}>
              {t("info.country")} <span className="text-[color:var(--danger)]">*</span>
            </span>
            <div className="relative">
              <select {...bind("country")} className={`${fieldInput} pr-[42px] cursor-pointer`}>
                <option value="">{t("info.country_ph")}</option>
                {COUNTRIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <span className="material-symbols absolute right-[14px] top-1/2 -translate-y-1/2 text-[color:var(--ink-faint)] pointer-events-none" style={{ fontSize: 22 }}>
                expand_more
              </span>
            </div>
            {form.country === "Other" && (
              <input
                {...bind("countryOther")}
                autoFocus
                placeholder={t("info.country_other_ph")}
                className={`${fieldInput} mt-2 anim-fadeUp-fast`}
              />
            )}
          </label>
          <label className="block">
            <span className={fieldLabel}>{t("info.city")}</span>
            <input {...bind("city")} placeholder={t("info.city_ph")} className={fieldInput} />
          </label>
          <label className="block sm:col-span-2 col-[1/-1]">
            <span className={fieldLabel}>{t("info.address")}</span>
            <input {...bind("address")} placeholder={t("info.address_ph")} className={fieldInput} />
          </label>
        </div>
      </div>

      <div className="flex items-center justify-between gap-[14px] flex-wrap mt-[26px]">
        <BackButton onClick={onBack}>
          <Icon name="arrow_back" size={20} />
          {t("common.back")}
        </BackButton>
        <div className="flex items-center gap-[16px]">
          {error && (
            <span className="text-[13.5px] text-[color:var(--danger)] font-semibold">
              {t("info.error_missing")}
            </span>
          )}
          <PrimaryButton onClick={onContinue}>
            {t("common.continue")}
            <Icon name="arrow_forward" size={20} />
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}
