"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { en } from "@/lib/i18n/en";
import { fr } from "@/lib/i18n/fr";
import { tr } from "@/lib/i18n/tr";
import type { Dict, DictKey, Locale } from "@/lib/i18n/types";

const DICTS: Record<Locale, Dict> = { en, fr, tr };

type Ctx = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: DictKey, vars?: Record<string, string | number>) => string;
};

const LangCtx = createContext<Ctx | null>(null);

const STORAGE_KEY = "norm_lang";

function detectInitial(): Locale {
  if (typeof window === "undefined") return "en";
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === "en" || saved === "fr" || saved === "tr") return saved;
    const nav = (navigator.language || "en").slice(0, 2).toLowerCase();
    if (nav === "fr" || nav === "tr") return nav;
  } catch {}
  return "en";
}

function interpolate(s: string, vars?: Record<string, string | number>): string {
  if (!vars) return s;
  return s.replace(/\{(\w+)\}/g, (_, k) => (vars[k] != null ? String(vars[k]) : `{${k}}`));
}

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    setLocaleState(detectInitial());
  }, []);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    try {
      window.localStorage.setItem(STORAGE_KEY, l);
      document.documentElement.lang = l;
      document.cookie = `${STORAGE_KEY}=${l}; path=/; max-age=31536000; SameSite=Lax`;
    } catch {}
  }, []);

  useEffect(() => {
    try {
      document.documentElement.lang = locale;
    } catch {}
  }, [locale]);

  const t = useCallback(
    (key: DictKey, vars?: Record<string, string | number>) => interpolate(DICTS[locale][key] ?? key, vars),
    [locale]
  );

  const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t]);

  return <LangCtx.Provider value={value}>{children}</LangCtx.Provider>;
}

export function useLang() {
  const ctx = useContext(LangCtx);
  if (!ctx) throw new Error("useLang must be used inside <LangProvider>");
  return ctx;
}

export function useT() {
  return useLang().t;
}
