export type ProjectTypeId =
  | "house"
  | "business"
  | "office"
  | "school"
  | "farm"
  | "irrigation";

export type ProjectCategory = "Residential" | "Commercial" | "Agricultural";

export type ProjectType = {
  id: ProjectTypeId;
  label: string;
  icon: string;
  desc: string;
  cat: ProjectCategory;
};

export const TYPES: ProjectType[] = [
  { id: "house", label: "House", icon: "home", desc: "Home or residence", cat: "Residential" },
  { id: "business", label: "Business", icon: "storefront", desc: "Shop or commercial space", cat: "Commercial" },
  { id: "office", label: "Office", icon: "business_center", desc: "Workspace or company", cat: "Commercial" },
  { id: "school", label: "School", icon: "school", desc: "Education facility", cat: "Commercial" },
  { id: "farm", label: "Farm", icon: "agriculture", desc: "Agricultural site", cat: "Agricultural" },
  { id: "irrigation", label: "Solar Irrigation", icon: "water_drop", desc: "Pumping & irrigation", cat: "Agricultural" },
];

export type Appliance = {
  id: string;
  label: string;
  icon: string;
  watts: number;
  hours: number;
  duty?: number;
};

export const CATALOG: Appliance[] = [
  { id: "lights", label: "Lights", icon: "lightbulb", watts: 12, hours: 5 },
  { id: "tv", label: "Televisions", icon: "tv", watts: 90, hours: 4 },
  { id: "fridge", label: "Refrigerators", icon: "kitchen", watts: 150, hours: 24, duty: 0.4 },
  { id: "freezer", label: "Freezers", icon: "ac_unit", watts: 200, hours: 24, duty: 0.45 },
  { id: "ac", label: "Air Conditioners", icon: "mode_fan", watts: 1200, hours: 6 },
  { id: "fan", label: "Fans", icon: "air", watts: 60, hours: 8 },
  { id: "computer", label: "Computers", icon: "computer", watts: 150, hours: 6 },
  { id: "pump", label: "Water Pumps", icon: "water_pump", watts: 750, hours: 4 },
  { id: "internet", label: "Internet", icon: "router", watts: 15, hours: 24 },
  { id: "camera", label: "Security Cameras", icon: "videocam", watts: 10, hours: 24 },
  { id: "other", label: "Other Appliances", icon: "category", watts: 100, hours: 4 },
];

export const COLORS = [
  "#35508E", "#F4B12A", "#5B79C2", "#E08A1E", "#8AA0D4", "#2A3F73",
  "#F6C760", "#B9C6E6", "#6B7FB8", "#C99318", "#9FB0D6",
];

export const COUNTRIES = [
  "Senegal", "Côte d’Ivoire", "Mali", "Cameroon", "Nigeria", "Ghana",
  "Kenya", "Burkina Faso", "Niger", "DR Congo", "Guinea", "Benin",
  "Togo", "Tanzania", "Uganda", "Morocco", "Türkiye", "Other",
];

export const PRESETS: Record<ProjectTypeId, Record<string, number>> = {
  house: { lights: 6, tv: 1, fridge: 1, fan: 2, internet: 1 },
  business: { lights: 10, tv: 1, fridge: 1, computer: 2, internet: 1, camera: 2 },
  office: { lights: 12, computer: 6, ac: 1, internet: 1, camera: 2 },
  school: { lights: 20, computer: 8, fan: 6, internet: 1, camera: 2 },
  farm: { lights: 6, pump: 1, fridge: 1, fan: 2 },
  irrigation: { pump: 2, lights: 2 },
};

export const CATEGORY_ICON: Record<ProjectCategory, string> = {
  Residential: "home",
  Commercial: "business_center",
  Agricultural: "agriculture",
};
