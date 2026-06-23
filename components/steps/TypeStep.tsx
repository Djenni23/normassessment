"use client";
import { Icon } from "../Icon";
import { StepLabel, H1, Lede, PrimaryButton } from "../ui";
import { TYPES, type ProjectTypeId } from "@/lib/catalog";

export function TypeStep({
  selected,
  onSelect,
  onContinue,
}: {
  selected: ProjectTypeId | null;
  onSelect: (id: ProjectTypeId) => void;
  onContinue: () => void;
}) {
  return (
    <div className="anim-fadeUp">
      <StepLabel>Step 1 · Project</StepLabel>
      <H1>What are we powering?</H1>
      <Lede className="max-w-[560px]">Pick the type of project. We&apos;ll tailor the equipment list and recommendations to match.</Lede>

      <div className="grid gap-[15px] [grid-template-columns:repeat(auto-fill,minmax(228px,1fr))]">
        {TYPES.map((t) => {
          const sel = selected === t.id;
          return (
            <button
              key={t.id}
              onClick={() => onSelect(t.id)}
              className="text-left cursor-pointer rounded-[20px] p-5 flex flex-col items-start transition-all duration-200 hover:-translate-y-[3px] hover:shadow-[0_14px_30px_rgba(40,60,110,.12)] hover:border-[color:var(--brand-navy)]"
              style={{
                background: sel ? "#F4F8FF" : "#fff",
                border: `2px solid ${sel ? "var(--brand-navy)" : "var(--border)"}`,
                boxShadow: sel ? "0 12px 28px rgba(53,80,142,.16)" : "0 6px 20px rgba(40,60,110,.05)",
              }}
            >
              <div className="flex items-center justify-between w-full">
                <div
                  className="w-[52px] h-[52px] rounded-[15px] flex items-center justify-center transition-all duration-200"
                  style={{
                    background: sel ? "var(--brand-navy)" : "#EEF2FB",
                    color: sel ? "#fff" : "var(--brand-navy)",
                  }}
                >
                  <Icon name={t.icon} size={28} />
                </div>
                <div
                  className="w-[26px] h-[26px] rounded-full bg-[color:var(--brand-navy)] text-white items-center justify-center"
                  style={{ display: sel ? "flex" : "none" }}
                >
                  <Icon name="check" size={18} />
                </div>
              </div>
              <div className="font-display font-bold text-[18px] text-[color:var(--ink)] mt-4">{t.label}</div>
              <div className="text-[13.5px] text-[color:var(--ink-faint)] mt-[3px]">{t.desc}</div>
              <div className="mt-3 font-mono font-semibold text-[11px] tracking-[.5px] text-[color:var(--ink-ghost)] uppercase">
                {t.cat}
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex justify-end mt-7">
        <PrimaryButton onClick={onContinue} disabled={!selected}>
          Continue
          <Icon name="arrow_forward" size={20} />
        </PrimaryButton>
      </div>
    </div>
  );
}
