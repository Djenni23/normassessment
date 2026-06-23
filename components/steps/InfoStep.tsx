"use client";
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
import { COUNTRIES } from "@/lib/catalog";
import { useT } from "../LangProvider";

export type ContactForm = {
  projectName: string;
  name: string;
  phone: string;
  whatsapp: string;
  email: string;
  country: string;
  city: string;
  address: string;
};

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
  const bind = (k: keyof ContactForm) => ({
    value: form[k],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => onChange(k, e.target.value),
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
            <input {...bind("phone")} placeholder={t("info.phone_ph")} className={fieldInput} />
          </label>
          <label className="block">
            <span className={fieldLabel}>
              <Icon name="chat" size={15} className="align-[-2px] text-[color:var(--success)]" /> {t("info.whatsapp")}
            </span>
            <input {...bind("whatsapp")} placeholder={t("info.whatsapp_ph")} className={fieldInput} />
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
