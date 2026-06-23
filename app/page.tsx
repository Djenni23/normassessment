"use client";
import { useEffect, useReducer, useState } from "react";
import { useRouter } from "next/navigation";
import { Header, type Screen } from "@/components/Header";
import { TypeStep } from "@/components/steps/TypeStep";
import { InfoStep, type ContactForm } from "@/components/steps/InfoStep";
import { SiteStep } from "@/components/steps/SiteStep";
import { AssessStep, type Equipment } from "@/components/steps/AssessStep";
import { ResultsStep } from "@/components/steps/ResultsStep";
import { SubmitStep, type SubmittedRecord } from "@/components/steps/SubmitStep";
import { PRESETS, type ProjectTypeId, TYPES, CATALOG } from "@/lib/catalog";
import { DEFAULT_SETTINGS, type Settings } from "@/lib/calc";
import { EMPTY_SITE, type SiteForm } from "@/lib/site";

type State = {
  screen: Screen;
  projectType: ProjectTypeId | null;
  form: ContactForm;
  site: SiteForm;
  equipment: Equipment;
  infoError: boolean;
  submitted: SubmittedRecord | null;
};

const initial: State = {
  screen: "type",
  projectType: null,
  form: { projectName: "", name: "", phone: "", whatsapp: "", email: "", country: "", city: "", address: "" },
  site: EMPTY_SITE,
  equipment: {},
  infoError: false,
  submitted: null,
};

type Action =
  | { type: "GO"; screen: Screen }
  | { type: "BACK" }
  | { type: "SELECT_TYPE"; id: ProjectTypeId }
  | { type: "SET_FIELD"; k: keyof ContactForm; v: string }
  | { type: "SET_SITE"; k: keyof SiteForm; v: SiteForm[keyof SiteForm] }
  | { type: "SET_ROOF"; k: keyof SiteForm["roof"]; v: SiteForm["roof"][keyof SiteForm["roof"]] }
  | { type: "SET_GROUND"; k: keyof SiteForm["ground"]; v: SiteForm["ground"][keyof SiteForm["ground"]] }
  | { type: "INC"; id: string }
  | { type: "DEC"; id: string }
  | { type: "HOURS"; id: string; h: number }
  | { type: "INFO_ERROR" }
  | { type: "SUBMITTED"; record: SubmittedRecord }
  | { type: "RESTART" };

const ORDER: Screen[] = ["type", "info", "site", "assess", "results"];

function reducer(s: State, a: Action): State {
  switch (a.type) {
    case "GO":
      return { ...s, screen: a.screen };
    case "BACK": {
      const i = ORDER.indexOf(s.screen);
      return { ...s, screen: i > 0 ? ORDER[i - 1] : "type" };
    }
    case "SELECT_TYPE": {
      const preset = PRESETS[a.id] ?? {};
      const equipment: Equipment = {};
      for (const [k, qty] of Object.entries(preset)) equipment[k] = { qty };
      return { ...s, projectType: a.id, equipment };
    }
    case "SET_FIELD":
      return { ...s, form: { ...s.form, [a.k]: a.v }, infoError: false };
    case "SET_SITE":
      return { ...s, site: { ...s.site, [a.k]: a.v } };
    case "SET_ROOF":
      return { ...s, site: { ...s.site, roof: { ...s.site.roof, [a.k]: a.v } } };
    case "SET_GROUND":
      return { ...s, site: { ...s.site, ground: { ...s.site.ground, [a.k]: a.v } } };
    case "INC": {
      const cur = s.equipment[a.id]?.qty ?? 0;
      return { ...s, equipment: { ...s.equipment, [a.id]: { ...(s.equipment[a.id] ?? {}), qty: cur + 1 } } };
    }
    case "DEC": {
      const cur = s.equipment[a.id]?.qty ?? 0;
      return { ...s, equipment: { ...s.equipment, [a.id]: { ...(s.equipment[a.id] ?? {}), qty: Math.max(0, cur - 1) } } };
    }
    case "HOURS":
      return { ...s, equipment: { ...s.equipment, [a.id]: { ...(s.equipment[a.id] ?? { qty: 0 }), hours: a.h } } };
    case "INFO_ERROR":
      return { ...s, infoError: true };
    case "SUBMITTED":
      return { ...s, submitted: a.record, screen: "submit" };
    case "RESTART":
      return initial;
    default:
      return s;
  }
}

export default function Home() {
  const router = useRouter();
  const [state, dispatch] = useReducer(reducer, initial);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d && typeof d.peakSunHours === "number") setSettings(d);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    try {
      document.scrollingElement?.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    } catch {}
  }, [state.screen]);

  const goBack = () => dispatch({ type: "BACK" });
  const go = (screen: Screen) => dispatch({ type: "GO", screen });

  const onContinueInfo = () => {
    const f = state.form;
    if (!f.name.trim() || !f.phone.trim() || !f.country) {
      dispatch({ type: "INFO_ERROR" });
      return;
    }
    go("site");
  };

  const onSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/assessments", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          projectType: state.projectType,
          projectName: state.form.projectName,
          contact: {
            name: state.form.name,
            phone: state.form.phone,
            whatsapp: state.form.whatsapp,
            email: state.form.email,
          },
          location: {
            country: state.form.country,
            city: state.form.city,
            address: state.form.address,
          },
          equipment: state.equipment,
          site: state.site,
        }),
      });
      if (!res.ok) throw new Error("submit failed");
      const data = await res.json();
      const t = TYPES.find((x) => x.id === state.projectType);
      dispatch({
        type: "SUBMITTED",
        record: {
          ref: data.ref,
          name: state.form.name.trim() || "New Customer",
          type: t?.label ?? "House",
          size: `${data.computed.pv.toFixed(1)} kWp`,
          daily: data.computed.daily.toFixed(1),
          panels: data.computed.panels,
        },
      });
    } catch {
      setSubmitting(false);
      alert("Could not submit. Make sure MongoDB is running.");
    }
  };

  return (
    <>
      <Header
        screen={state.screen}
        onHome={() => dispatch({ type: "RESTART" })}
        staffHref="/staff"
        staffLabel="Staff"
        staffIcon="dashboard"
      />
      <main className="flex-1 w-full max-w-[1200px] mx-auto px-[22px] pt-[30px] pb-16">
        {state.screen === "type" && (
          <TypeStep
            selected={state.projectType}
            onSelect={(id) => dispatch({ type: "SELECT_TYPE", id })}
            onContinue={() => state.projectType && go("info")}
          />
        )}
        {state.screen === "info" && (
          <InfoStep
            form={state.form}
            onChange={(k, v) => dispatch({ type: "SET_FIELD", k, v })}
            onBack={goBack}
            onContinue={onContinueInfo}
            error={state.infoError}
          />
        )}
        {state.screen === "site" && (
          <SiteStep
            site={state.site}
            onChange={(k, v) => dispatch({ type: "SET_SITE", k, v })}
            onRoofChange={(k, v) => dispatch({ type: "SET_ROOF", k, v })}
            onGroundChange={(k, v) => dispatch({ type: "SET_GROUND", k, v })}
            onBack={goBack}
            onContinue={() => go("assess")}
          />
        )}
        {state.screen === "assess" && (
          <AssessStep
            equipment={state.equipment}
            projectType={state.projectType}
            settings={settings}
            onInc={(id) => dispatch({ type: "INC", id })}
            onDec={(id) => dispatch({ type: "DEC", id })}
            onHours={(id, h) => dispatch({ type: "HOURS", id, h })}
            onBack={goBack}
            onContinue={() => {
              const hasItems = CATALOG.some((a) => (state.equipment[a.id]?.qty ?? 0) > 0);
              if (hasItems) go("results");
            }}
          />
        )}
        {state.screen === "results" && (
          <ResultsStep
            equipment={state.equipment}
            projectType={state.projectType}
            settings={settings}
            site={state.site}
            onBack={goBack}
            onSubmit={onSubmit}
          />
        )}
        {state.screen === "submit" && state.submitted && (
          <SubmitStep
            submitted={state.submitted}
            onRestart={() => dispatch({ type: "RESTART" })}
            onStaff={() => router.push("/staff")}
          />
        )}
      </main>
    </>
  );
}
