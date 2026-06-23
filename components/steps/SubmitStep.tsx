"use client";
import { Icon } from "../Icon";
import { PrimaryButton, BackButton } from "../ui";
import { useT } from "../LangProvider";

export type SubmittedRecord = {
  ref: string;
  name: string;
  type: string;
  size: string;
  daily: string;
  panels: number;
};

export function SubmitStep({
  submitted,
  onRestart,
  onStaff,
}: {
  submitted: SubmittedRecord;
  onRestart: () => void;
  onStaff: () => void;
}) {
  const t = useT();
  const firstName = submitted.name.split(" ")[0] || "—";
  return (
    <div className="anim-fadeUp max-w-[560px] mx-auto mt-[18px] text-center">
      <div className="w-[96px] h-[96px] rounded-full flex items-center justify-center mx-auto shadow-[0_16px_38px_rgba(31,168,85,.34)] anim-popIn" style={{ background: "linear-gradient(135deg,#1FA855,#168944)" }}>
        <Icon name="check" size={54} className="text-white" />
      </div>
      <h1 className="font-display font-bold text-[30px] tracking-[-.6px] mt-[22px] mb-2 text-[color:var(--ink)]">{t("submit.title")}</h1>
      <p className="text-[16px] text-[color:var(--ink-muted)] mx-auto mb-[26px] max-w-[420px]">
        {t("submit.thank", { name: firstName })}
      </p>

      <div className="bg-white border border-[color:var(--border)] rounded-[22px] shadow-[0_8px_28px_rgba(40,60,110,.08)] p-6 text-left">
        <div className="flex items-center justify-between pb-4 border-b border-[#EDF1F7]">
          <div>
            <div className="text-[11.5px] text-[color:var(--ink-ghost)] font-bold uppercase tracking-[.8px]">{t("submit.reference")}</div>
            <div className="font-mono font-semibold text-[22px] text-[color:var(--brand-navy)] mt-[3px]">{submitted.ref}</div>
          </div>
          <div className="inline-flex items-center gap-[6px] bg-[#EAF6EF] text-[color:var(--success)] px-[13px] py-[7px] rounded-[20px] font-display font-bold text-[12.5px]">
            <Icon name="task_alt" size={16} />
            {t("submit.received")}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-[18px]">
          <Field label={t("submit.project_type")} value={submitted.type} />
          <Field label={t("submit.recommended_system")} value={submitted.size} />
          <Field label={t("submit.daily_usage")} value={`${submitted.daily} kWh`} />
          <Field label={t("submit.solar_panels")} value={`${submitted.panels} ${t("results.unit.panels")}`} />
        </div>
        <div className="mt-[18px] flex items-center gap-[10px] bg-[#F2FAF5] border border-[#CDEBD9] rounded-[13px] px-[14px] py-[12px]">
          <Icon name="chat" size={21} className="text-[color:var(--success)]" />
          <span className="text-[13.5px] text-[#3F7456] font-semibold">{t("submit.whatsapp_followup")}</span>
        </div>
      </div>

      <div className="flex gap-3 mt-6 justify-center flex-wrap">
        <BackButton onClick={onRestart}>
          <Icon name="add" size={20} />
          {t("submit.new_assessment")}
        </BackButton>
        <PrimaryButton onClick={onStaff}>
          <Icon name="dashboard" size={20} />
          {t("submit.view_dashboard")}
        </PrimaryButton>
      </div>
      <p className="text-[12.5px] text-[color:var(--ink-faint)] mt-3">
        {t("submit.staff_link_note", { ref: submitted.ref })}
      </p>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[11.5px] text-[color:var(--ink-ghost)] font-semibold">{label}</div>
      <div className="font-display font-semibold text-[15px] text-[color:var(--ink)] mt-[2px]">{value}</div>
    </div>
  );
}
