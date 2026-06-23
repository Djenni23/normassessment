import type {
  GoalId,
  InstallZoneId,
  OrientationId,
  RoofMaterialId,
  RoofTypeId,
  SoilId,
  SystemTypeId,
} from "./catalog";

export type SiteForm = {
  systemType: SystemTypeId | null;
  installZone: InstallZoneId | null;
  roof: {
    type: RoofTypeId | null;
    material: RoofMaterialId | null;
    materialOther: string;
    orientation: OrientationId | null;
    orientationOther: string;
    tiltDeg: string;
  };
  ground: {
    surfaceSqm: string;
    soil: SoilId | null;
    soilOther: string;
  };
  goal: GoalId | null;
  moduleBrand: string;
  timeline: string;
  monthlyBill: string;
  currency: string;
  notes: string;
};

export const EMPTY_SITE: SiteForm = {
  systemType: null,
  installZone: null,
  roof: { type: null, material: null, materialOther: "", orientation: null, orientationOther: "", tiltDeg: "" },
  ground: { surfaceSqm: "", soil: null, soilOther: "" },
  goal: null,
  moduleBrand: "",
  timeline: "",
  monthlyBill: "",
  currency: "FCFA",
  notes: "",
};

export const CURRENCIES = ["FCFA", "NGN", "GHS", "USD", "EUR", "MAD", "KES", "TRY"];
