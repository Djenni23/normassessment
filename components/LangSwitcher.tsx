"use client";
import { useEffect, useRef, useState } from "react";
import { useLang } from "./LangProvider";
import { LOCALES, type Locale } from "@/lib/i18n/types";
import { Icon } from "./Icon";

export function LangSwitcher() {
  const { locale, setLocale, t } = useLang();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const current = LOCALES.find((l) => l.code === locale) ?? LOCALES[0];

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        title={t("lang.label")}
        className="inline-flex items-center gap-[6px] bg-white border-[1.5px] border-[color:var(--border-strong)] rounded-[11px] px-[10px] py-[8px] font-semibold text-[13px] cursor-pointer hover:bg-[#EEF2FB]"
      >
        <span className="text-[15px] leading-none">{current.flag}</span>
        <span className="uppercase text-[color:var(--ink-soft)]">{current.code}</span>
        <Icon name="expand_more" size={16} className="text-[color:var(--ink-faint)]" />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 z-50 bg-white rounded-[12px] border border-[color:var(--border)] shadow-[0_18px_40px_rgba(40,60,110,.18)] py-1 min-w-[170px]">
          {LOCALES.map((l) => {
            const on = l.code === locale;
            return (
              <button
                key={l.code}
                onClick={() => {
                  setLocale(l.code as Locale);
                  setOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-left text-[13.5px] cursor-pointer hover:bg-[#F4F6FB]"
                style={{ background: on ? "#EEF2FB" : "transparent", color: on ? "var(--brand-navy)" : "var(--ink)", fontWeight: on ? 700 : 500 }}
              >
                <span className="text-[15px] leading-none">{l.flag}</span>
                <span className="flex-1">{l.label}</span>
                {on && <Icon name="check" size={16} className="text-[color:var(--brand-navy)]" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
