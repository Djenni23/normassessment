"use client";
import { Icon } from "./Icon";

export function StepLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="font-mono font-medium text-[12px] tracking-[2px] text-[color:var(--brand-amber)] uppercase">
      {children}
    </div>
  );
}

export function H1({ children }: { children: React.ReactNode }) {
  return (
    <h1 className="font-display font-bold text-[33px] tracking-[-.8px] my-[6px] text-[color:var(--ink)]" style={{ marginTop: 8 }}>
      {children}
    </h1>
  );
}

export function Lede({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={`text-[16px] text-[color:var(--ink-muted)] mb-[26px] ${className}`}>{children}</p>
  );
}

export function PrimaryButton({
  children,
  onClick,
  disabled,
  type = "button",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center justify-center gap-2 bg-[color:var(--brand-navy)] text-white border-0 rounded-[14px] px-[24px] py-[14px] font-semibold text-[15.5px] cursor-pointer shadow-[0_8px_20px_rgba(53,80,142,.22)] transition-all duration-150 hover:shadow-[0_12px_26px_rgba(53,80,142,.30)] hover:-translate-y-0.5 disabled:opacity-45 disabled:shadow-none disabled:cursor-not-allowed disabled:hover:translate-y-0"
    >
      {children}
    </button>
  );
}

export function BackButton({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center justify-center gap-[7px] bg-white text-[color:var(--ink-soft)] border-[1.5px] border-[#DCE3EE] rounded-[14px] px-[22px] py-[13px] font-semibold text-[15px] cursor-pointer transition-colors hover:bg-[#EEF2FB]"
    >
      {children}
    </button>
  );
}

export function Section({ icon, label }: { icon: string; label: string }) {
  return (
    <div className="font-display font-bold text-[13px] text-[color:var(--brand-navy)] uppercase tracking-[.8px] flex items-center gap-2 mb-[18px]">
      <Icon name={icon} size={19} />
      {label}
    </div>
  );
}

export const fieldLabel = "block font-semibold text-[12.5px] text-[color:var(--ink-muted)] mb-[7px]";
export const fieldInput =
  "w-full px-[15px] py-[13px] border-[1.5px] border-[color:var(--border-strong)] rounded-[13px] text-[15px] text-[color:var(--ink)] bg-white transition-all duration-150 focus:border-[color:var(--brand-navy)] focus:shadow-[0_0_0_4px_rgba(53,80,142,.10)]";
