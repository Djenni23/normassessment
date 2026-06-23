"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { Icon } from "../Icon";
import { Header } from "../Header";
import { SettingsPanel } from "./SettingsPanel";
import { SYSTEM_TYPE_LABEL, GOAL_LABEL, type SystemTypeId, type GoalId } from "@/lib/catalog";
import type { Settings } from "@/lib/calc";

type Assessment = {
  _id: string;
  ref: string;
  name: string;
  projectName?: string;
  country: string;
  type: string;
  typeIcon: string;
  size: string;
  daily: string;
  panels: number;
  systemType: SystemTypeId | null;
  installZone: "roof" | "ground" | null;
  goal: GoalId | null;
  status: "New" | "In Review" | "Quoted";
  createdAt: string;
};

const FILTERS: Array<{ key: "all" | "New" | "In Review" | "Quoted"; label: string }> = [
  { key: "all", label: "All" },
  { key: "New", label: "New" },
  { key: "In Review", label: "In Review" },
  { key: "Quoted", label: "Quoted" },
];

const AVATAR_COLORS = ["#35508E", "#5B79C2", "#2A3F73", "#6B7FB8"];

export function DashboardClient({ initialSettings }: { initialSettings: Settings & { updatedAt?: string | null } }) {
  const [records, setRecords] = useState<Assessment[]>([]);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["key"]>("all");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const tid = setTimeout(async () => {
      setLoading(true);
      const params = new URLSearchParams();
      if (filter !== "all") params.set("status", filter);
      if (query.trim()) params.set("q", query.trim());
      try {
        const res = await fetch(`/api/assessments?${params}`);
        if (!res.ok) throw new Error("load");
        const data = await res.json();
        if (active) setRecords(data);
      } catch {
        if (active) setRecords([]);
      } finally {
        if (active) setLoading(false);
      }
    }, 250);
    return () => {
      active = false;
      clearTimeout(tid);
    };
  }, [filter, query]);

  const counts = useMemo(() => {
    const c = { all: records.length, New: 0, "In Review": 0, Quoted: 0 } as Record<string, number>;
    records.forEach((r) => (c[r.status] = (c[r.status] ?? 0) + 1));
    return c;
  }, [records]);

  const fmtDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
  };

  return (
    <>
      <Header screen="dash" staffHref="/" staffLabelKey="header.customer_view" staffIcon="person" />
      <main className="flex-1 w-full max-w-[1200px] mx-auto px-[22px] pt-[30px] pb-16 anim-fadeUp">
        <div className="flex items-end justify-between gap-4 flex-wrap mb-[22px]">
          <div>
            <div className="font-mono font-medium text-[12px] tracking-[2px] text-[color:var(--brand-amber)] uppercase">
              Internal · Norm Enerji team
            </div>
            <h1 className="font-display font-bold text-[31px] tracking-[-.7px] mt-2 text-[color:var(--ink)]">
              Assessment requests
            </h1>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="inline-flex items-center gap-2 bg-white border-[1.5px] border-[color:var(--border-strong)] text-[color:var(--ink-soft)] rounded-[12px] px-[14px] py-[9px] font-semibold text-[13.5px] cursor-pointer hover:bg-[#EEF2FB]"
            >
              <Icon name="logout" size={18} />
              Sign out
            </button>
          </div>
        </div>

        <SettingsPanel initial={initialSettings} />

        <div className="grid gap-[14px] [grid-template-columns:repeat(auto-fit,minmax(160px,1fr))] mb-5">
          <StatCard label="Total requests" value={counts.all} color="#35508E" />
          <StatCard label="New" value={counts.New} color="#35508E" />
          <StatCard label="In review" value={counts["In Review"]} color="#F4B12A" />
          <StatCard label="Quoted" value={counts.Quoted} color="#1FA855" />
        </div>

        <div className="flex items-center gap-3 flex-wrap mb-4">
          <div className="flex gap-[6px] bg-white border border-[color:var(--border)] rounded-[13px] p-[5px] shadow-[0_4px_14px_rgba(40,60,110,.05)]">
            {FILTERS.map((f) => {
              const on = filter === f.key;
              return (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={`border-0 rounded-[9px] px-[14px] py-2 font-semibold text-[13px] cursor-pointer transition-colors ${on ? "bg-[color:var(--brand-navy)] text-white" : "bg-transparent text-[color:var(--ink-faint)]"}`}
                >
                  {f.label}
                </button>
              );
            })}
          </div>
          <div className="flex-1" />
          <div className="relative min-w-[220px] basis-[280px]">
            <span className="material-symbols absolute left-[13px] top-1/2 -translate-y-1/2 text-[color:var(--ink-ghost)]" style={{ fontSize: 20 }}>
              search
            </span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name or country…"
              className="w-full pl-[42px] pr-[14px] py-[11px] border border-[color:var(--border-strong)] rounded-[13px] text-[14px] bg-white focus:border-[color:var(--brand-navy)] focus:shadow-[0_0_0_4px_rgba(53,80,142,.10)] outline-none"
            />
          </div>
        </div>

        <div className="flex flex-col gap-[11px]">
          {records.map((r, i) => (
            <RecordRow key={r._id} r={r} index={i} fmtDate={fmtDate} />
          ))}
          {!loading && records.length === 0 && (
            <div className="text-center p-12 text-[color:var(--ink-ghost)] font-semibold">No requests match your filters.</div>
          )}
        </div>
      </main>
    </>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="bg-white border border-[color:var(--border)] rounded-[18px] p-[18px_20px] shadow-[0_6px_20px_rgba(40,60,110,.06)]">
      <div className="flex items-center gap-[9px]">
        <div className="w-[10px] h-[10px] rounded-full" style={{ background: color }} />
        <span className="text-[13px] text-[color:var(--ink-faint)] font-semibold">{label}</span>
      </div>
      <div className="font-display font-extrabold text-[30px] text-[color:var(--ink)] mt-2 tracking-[-.5px]">{value}</div>
    </div>
  );
}

function RecordRow({ r, index, fmtDate }: { r: Assessment; index: number; fmtDate: (s: string) => string }) {
  const initials = r.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  const statusCls =
    r.status === "New"
      ? "bg-[#EEF2FB] text-[color:var(--brand-navy)]"
      : r.status === "In Review"
      ? "bg-[#FEF4DD] text-[color:var(--warning)]"
      : "bg-[#EAF6EF] text-[color:var(--success)]";
  return (
    <Link
      href={`/staff/${r.ref}`}
      className="flex items-center gap-4 bg-white border border-[color:var(--border)] rounded-[16px] px-[18px] py-[15px] shadow-[0_5px_16px_rgba(40,60,110,.05)] flex-wrap transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_26px_rgba(40,60,110,.12)] no-underline"
    >
      <div
        className="w-[44px] h-[44px] rounded-[13px] shrink-0 flex items-center justify-center font-display font-bold text-[15px] text-white"
        style={{ background: AVATAR_COLORS[index % AVATAR_COLORS.length] }}
      >
        {initials}
      </div>
      <div className="flex-1 basis-[180px] min-w-[140px]">
        <div className="font-display font-bold text-[15.5px] text-[color:var(--ink)]">
          {r.name}
          {r.projectName && <span className="text-[color:var(--ink-faint)] font-normal text-[13px]"> · {r.projectName}</span>}
        </div>
        <div className="text-[13px] text-[color:var(--ink-faint)] flex items-center gap-[5px] mt-[2px]">
          <Icon name="public" size={15} className="text-[color:var(--ink-ghost)]" />
          {r.country}
          <span className="font-mono text-[11.5px] text-[color:var(--ink-ghost)] ml-2">{r.ref}</span>
        </div>
      </div>
      <div className="inline-flex items-center gap-[6px] bg-[#EEF2FB] text-[color:var(--brand-navy)] px-3 py-[6px] rounded-[9px] font-display font-semibold text-[12.5px]">
        <Icon name={r.typeIcon} size={16} />
        {r.type}
      </div>
      {r.systemType && (
        <div className="inline-flex items-center gap-[6px] bg-[#FFF7E6] text-[#B47B12] px-3 py-[6px] rounded-[9px] font-display font-semibold text-[12px]">
          <Icon name="bolt" size={14} />
          {SYSTEM_TYPE_LABEL[r.systemType]}
        </div>
      )}
      {r.goal && (
        <div className="inline-flex items-center gap-[6px] bg-[#F2FAF5] text-[color:var(--success)] px-3 py-[6px] rounded-[9px] font-display font-semibold text-[12px]">
          <Icon name="flag" size={14} />
          {GOAL_LABEL[r.goal]}
        </div>
      )}
      <div className="text-right min-w-[84px]">
        <div className="font-display font-bold text-[15px] text-[color:var(--ink)]">{r.size}</div>
        <div className="text-[11.5px] text-[color:var(--ink-ghost)]">{r.daily} kWh/day</div>
      </div>
      <div className="text-right min-w-[78px] text-[12.5px] text-[color:var(--ink-faint)] font-semibold">{fmtDate(r.createdAt)}</div>
      <div className={`min-w-[80px] text-center px-3 py-[7px] rounded-[9px] font-display font-bold text-[12px] ${statusCls}`}>{r.status}</div>
    </Link>
  );
}
