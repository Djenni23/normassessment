import { cookies } from "next/headers";
import { en } from "./en";
import { fr } from "./fr";
import { tr } from "./tr";
import type { Dict, DictKey, Locale } from "./types";

const DICTS: Record<Locale, Dict> = { en, fr, tr };

// Mirrors the client-side LangProvider STORAGE_KEY cookie. The cookie is written
// whenever a visitor changes language, so staff server components can render in
// the same language the user selected.
const STORAGE_KEY = "norm_lang";

function interpolate(s: string, vars?: Record<string, string | number>): string {
  if (!vars) return s;
  return s.replace(/\{(\w+)\}/g, (_, k) => (vars[k] != null ? String(vars[k]) : `{${k}}`));
}

export async function getServerLocale(): Promise<Locale> {
  try {
    const v = (await cookies()).get(STORAGE_KEY)?.value;
    if (v === "en" || v === "fr" || v === "tr") return v;
  } catch {}
  return "en";
}

export type ServerT = (key: DictKey, vars?: Record<string, string | number>) => string;

export async function getServerT(): Promise<{ t: ServerT; locale: Locale }> {
  const locale = await getServerLocale();
  const t: ServerT = (key, vars) => interpolate(DICTS[locale][key] ?? key, vars);
  return { t, locale };
}
