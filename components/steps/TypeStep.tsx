"use client";
import { Icon } from "../Icon";
import { StepLabel, H1, Lede, PrimaryButton } from "../ui";
import { TYPES, type ProjectTypeId } from "@/lib/catalog";
import { useT } from "../LangProvider";
import type { DictKey } from "@/lib/i18n/types";

export function TypeStep({
  selected,
  onSelect,
  onContinue,
}: {
  selected: ProjectTypeId | null;
  onSelect: (id: ProjectTypeId) => void;
  onContinue: () => void;
}) {
  const t = useT();
  return (
    <div className="anim-fadeUp">
      <StepLabel>{t("type.step_label")}</StepLabel>
      <H1>{t("type.title")}</H1>
      <Lede className="max-w-[560px]">{t("type.subtitle")}</Lede>

      <div className="grid gap-[15px] [grid-template-columns:repeat(auto-fill,minmax(228px,1fr))]">
        {TYPES.map((tp) => {
          const sel = selected === tp.id;
          return (
            <button
              key={tp.id}
              onClick={() => onSelect(tp.id)}
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
                  <Icon name={tp.icon} size={28} />
                </div>
                <div
                  className="w-[26px] h-[26px] rounded-full bg-[color:var(--brand-navy)] text-white items-center justify-center"
                  style={{ display: sel ? "flex" : "none" }}
                >
                  <Icon name="check" size={18} />
                </div>
              </div>
              <div className="font-display font-bold text-[18px] text-[color:var(--ink)] mt-4">{t(`type.${tp.id}.label` as DictKey)}</div>
              <div className="text-[13.5px] text-[color:var(--ink-faint)] mt-[3px]">{t(`type.${tp.id}.desc` as DictKey)}</div>
              <div className="mt-3 font-mono font-semibold text-[11px] tracking-[.5px] text-[color:var(--ink-ghost)] uppercase">
                {t(`type.cat.${tp.cat}` as DictKey)}
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex justify-end mt-7">
        <PrimaryButton onClick={onContinue} disabled={!selected}>
          {t("common.continue")}
          <Icon name="arrow_forward" size={20} />
        </PrimaryButton>
      </div>
    </div>
  );
}
