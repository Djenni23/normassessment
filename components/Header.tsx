"use client";
import Image from "next/image";
import Link from "next/link";
import { Icon } from "./Icon";
import { LangSwitcher } from "./LangSwitcher";
import { useT } from "./LangProvider";
import type { DictKey } from "@/lib/i18n/types";

export type Screen = "type" | "info" | "site" | "assess" | "results" | "submit" | "dash";

const STEP_DEFS: Array<{ key: Screen; labelKey: DictKey }> = [
  { key: "type", labelKey: "header.step.project" },
  { key: "info", labelKey: "header.step.details" },
  { key: "site", labelKey: "header.step.site" },
  { key: "assess", labelKey: "header.step.equipment" },
  { key: "results", labelKey: "header.step.results" },
  { key: "submit", labelKey: "header.step.done" },
];

export function Header({
  screen,
  onHome,
  staffHref,
  staffLabelKey,
  staffIcon = "dashboard",
}: {
  screen: Screen;
  onHome?: () => void;
  staffHref: string;
  staffLabelKey?: DictKey;
  staffIcon?: string;
}) {
  const t = useT();
  const showStepper = screen !== "dash";
  const curIdx = Math.max(0, STEP_DEFS.findIndex((s) => s.key === screen));
  const staffLabel = t(staffLabelKey ?? "header.staff");

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-white/80 border-b border-[color:var(--border)]">
      <div className="max-w-[1200px] mx-auto px-[22px] py-[13px] flex items-center gap-4 flex-wrap">
        <button
          onClick={onHome}
          className="flex items-center gap-[11px] cursor-pointer bg-transparent border-0 p-0"
        >
          <Image
            src="/norm-mark.png"
            alt="Norm Enerji"
            width={42}
            height={42}
            className="rounded-[11px] shadow-[0_3px_9px_rgba(40,60,110,.16)]"
            priority
          />
          <div className="leading-[1.05] text-left">
            <div className="font-display font-extrabold text-[19px] tracking-[-.4px] text-[#2A3F73]">NORM ENERJI</div>
            <div className="font-mono font-medium text-[10.5px] tracking-[1.5px] text-[color:var(--brand-amber)] uppercase">
              {t("header.subtitle")}
            </div>
          </div>
        </button>

        <div className="flex-1" />

        {/* Desktop/tablet: full stepper with labels */}
        {showStepper && (
          <div className="hidden md:flex items-center gap-1">
            {STEP_DEFS.map((s, i) => {
              const done = i < curIdx;
              const active = i === curIdx;
              const hasBar = i < STEP_DEFS.length - 1;
              return (
                <div key={s.key} className="flex items-center gap-1">
                  <div
                    className={`w-[26px] h-[26px] rounded-full flex items-center justify-center font-display font-bold text-[12px] shrink-0 transition-all duration-300 ${
                      done
                        ? "bg-[color:var(--success)] text-white"
                        : active
                        ? "bg-[color:var(--brand-navy)] text-white shadow-[0_0_0_4px_rgba(53,80,142,.16)]"
                        : "bg-[#E5EAF2] text-[color:var(--ink-ghost)]"
                    }`}
                  >
                    {done ? <Icon name="check" size={15} /> : i + 1}
                  </div>
                  <div
                    className={`font-semibold text-[12.5px] mr-[2px] ${
                      active
                        ? "text-[color:var(--brand-navy)]"
                        : done
                        ? "text-[color:var(--success)]"
                        : "text-[#A4B0C4]"
                    }`}
                  >
                    {t(s.labelKey)}
                  </div>
                  {hasBar && (
                    <div
                      className="w-[18px] h-[2px] rounded-[2px] mr-[2px]"
                      style={{ background: done ? "var(--success)" : "#DDE3EC" }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}

        <LangSwitcher />

        {/* Mobile-only: compact numbers-only stepper */}
        {showStepper && (
          <div className="md:hidden flex items-center gap-[2px]">
            {STEP_DEFS.map((s, i) => {
              const done = i < curIdx;
              const active = i === curIdx;
              const hasBar = i < STEP_DEFS.length - 1;
              return (
                <div key={s.key} className="flex items-center gap-[2px]">
                  <div
                    className={`w-[22px] h-[22px] rounded-full flex items-center justify-center font-display font-bold text-[11px] shrink-0 transition-all duration-300 ${
                      done
                        ? "bg-[color:var(--success)] text-white"
                        : active
                        ? "bg-[color:var(--brand-navy)] text-white shadow-[0_0_0_3px_rgba(53,80,142,.16)]"
                        : "bg-[#E5EAF2] text-[color:var(--ink-ghost)]"
                    }`}
                  >
                    {done ? <Icon name="check" size={13} /> : i + 1}
                  </div>
                  {hasBar && (
                    <div
                      className="w-[10px] h-[2px] rounded-[2px]"
                      style={{ background: done ? "var(--success)" : "#DDE3EC" }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}

        <Link
          href={staffHref}
          className="inline-flex items-center gap-[7px] bg-white border-[1.5px] border-[color:var(--border-strong)] text-[color:var(--ink-soft)] rounded-[11px] px-[14px] py-[9px] font-semibold text-[13.5px] cursor-pointer transition-colors hover:bg-[#EEF2FB]"
        >
          <Icon name={staffIcon} size={18} />
          <span className="hidden sm:inline">{staffLabel}</span>
        </Link>
      </div>
    </header>
  );
}
