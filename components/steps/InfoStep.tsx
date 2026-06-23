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
  const bind = (k: keyof ContactForm) => ({
    value: form[k],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => onChange(k, e.target.value),
  });
  return (
    <div className="anim-fadeUp max-w-[760px] mx-auto">
      <StepLabel>Step 2 · Details</StepLabel>
      <H1>A few details about you</H1>
      <Lede>So our team can reach you with your tailored solar proposal.</Lede>

      <div className="bg-white border border-[color:var(--border)] rounded-[22px] shadow-[0_8px_28px_rgba(40,60,110,.07)] p-[26px]">
        <Section icon="badge" label="Project" />
        <div className="grid gap-[15px] [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]">
          <label className="block sm:col-span-2" style={{ gridColumn: "1/-1" }}>
            <span className={fieldLabel}>
              Project / company name
            </span>
            <input
              {...bind("projectName")}
              placeholder="e.g. Diallo Family Home, Boutique Soleil…"
              className={fieldInput}
            />
          </label>
        </div>
        <div className="h-px bg-[#EDF1F7] my-[20px]" />

        <Section icon="person" label="Contact" />
        <div className="grid gap-[15px] [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]">
          <label className="block">
            <span className={fieldLabel}>
              Full name <span className="text-[color:var(--danger)]">*</span>
            </span>
            <input {...bind("name")} placeholder="e.g. Amadou Diallo" className={fieldInput} />
          </label>
          <label className="block">
            <span className={fieldLabel}>
              Phone number <span className="text-[color:var(--danger)]">*</span>
            </span>
            <input {...bind("phone")} placeholder="+221 ..." className={fieldInput} />
          </label>
          <label className="block">
            <span className={fieldLabel}>
              <Icon name="chat" size={15} className="align-[-2px] text-[color:var(--success)]" /> WhatsApp number
            </span>
            <input {...bind("whatsapp")} placeholder="Same as phone?" className={fieldInput} />
          </label>
          <label className="block">
            <span className={fieldLabel}>Email</span>
            <input {...bind("email")} placeholder="you@example.com" className={fieldInput} />
          </label>
        </div>

        <div className="h-px bg-[#EDF1F7] my-[24px]" />
        <Section icon="location_on" label="Location" />
        <div className="grid gap-[15px] [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]">
          <label className="block">
            <span className={fieldLabel}>
              Country <span className="text-[color:var(--danger)]">*</span>
            </span>
            <div className="relative">
              <select {...bind("country")} className={`${fieldInput} pr-[42px] cursor-pointer`}>
                <option value="">Select a country…</option>
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
            <span className={fieldLabel}>City</span>
            <input {...bind("city")} placeholder="e.g. Dakar" className={fieldInput} />
          </label>
          <label className="block sm:col-span-2 col-[1/-1]">
            <span className={fieldLabel}>Project address</span>
            <input {...bind("address")} placeholder="Where the system will be installed" className={fieldInput} />
          </label>
        </div>
      </div>

      <div className="flex items-center justify-between gap-[14px] flex-wrap mt-[26px]">
        <BackButton onClick={onBack}>
          <Icon name="arrow_back" size={20} />
          Back
        </BackButton>
        <div className="flex items-center gap-[16px]">
          {error && (
            <span className="text-[13.5px] text-[color:var(--danger)] font-semibold">
              Please add name, phone &amp; country
            </span>
          )}
          <PrimaryButton onClick={onContinue}>
            Continue
            <Icon name="arrow_forward" size={20} />
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}
