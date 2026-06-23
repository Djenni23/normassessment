"use client";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { fieldLabel, fieldInput, PrimaryButton } from "@/components/ui";
import { useT } from "@/components/LangProvider";
import { LangSwitcher } from "@/components/LangSwitcher";

function LoginInner() {
  const router = useRouter();
  const params = useSearchParams();
  const from = params.get("from") || "/staff";
  const t = useT();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const res = await signIn("credentials", { email, password, redirect: false });
    setBusy(false);
    if (res?.error) {
      setError(t("login.invalid"));
      return;
    }
    router.push(from);
    router.refresh();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 relative">
      <div className="absolute top-5 right-5"><LangSwitcher /></div>
      <Link href="/" className="flex items-center gap-3 mb-8 no-underline">
        <Image src="/norm-mark.png" alt="Norm Enerji" width={42} height={42} className="rounded-[11px]" />
        <div className="font-display font-extrabold text-[19px] tracking-[-.4px] text-[#2A3F73]">NORM ENERJI</div>
      </Link>
      <form
        onSubmit={submit}
        className="w-full max-w-[400px] bg-white border border-[color:var(--border)] rounded-[22px] shadow-[0_8px_28px_rgba(40,60,110,.08)] p-7"
      >
        <h1 className="font-display font-bold text-[22px] text-[color:var(--ink)]">{t("login.title")}</h1>
        <p className="text-[14px] text-[color:var(--ink-muted)] mt-1 mb-6">{t("login.subtitle")}</p>

        <label className="block mb-4">
          <span className={fieldLabel}>{t("login.email")}</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t("login.email_ph")}
            className={fieldInput}
            required
            autoComplete="email"
          />
        </label>
        <label className="block mb-5">
          <span className={fieldLabel}>{t("login.password")}</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={fieldInput}
            required
            autoComplete="current-password"
          />
        </label>

        {error && (
          <div className="mb-4 text-[13.5px] text-[color:var(--danger)] font-semibold flex items-center gap-2">
            <Icon name="error" size={18} />
            {error}
          </div>
        )}

        <PrimaryButton type="submit" disabled={busy}>
          {busy ? t("login.signing_in") : t("login.signin")}
          <Icon name="arrow_forward" size={20} />
        </PrimaryButton>
      </form>
      <Link href="/" className="mt-5 text-[14px] text-[color:var(--ink-muted)] hover:text-[color:var(--brand-navy)] flex items-center gap-1">
        <Icon name="arrow_back" size={16} /> {t("login.back_customer")}
      </Link>
    </div>
  );
}

export default function StaffLoginPage() {
  return (
    <Suspense fallback={<div />}>
      <LoginInner />
    </Suspense>
  );
}
