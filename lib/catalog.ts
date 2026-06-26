export type ProjectTypeId =
  | "house"
  | "business"
  | "office"
  | "mine"
  | "farm"
  | "irrigation"
  | "other";

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
  { id: "mine", label: "Mine", icon: "terrain", desc: "Mining site", cat: "Commercial" },
  { id: "farm", label: "Farm", icon: "agriculture", desc: "Agricultural site", cat: "Agricultural" },
  { id: "irrigation", label: "Solar Irrigation", icon: "water_drop", desc: "Pumping & irrigation", cat: "Agricultural" },
  { id: "other", label: "Other", icon: "category", desc: "Tell us your project", cat: "Residential" },
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

// International dialing codes for the phone field. The customer can pick one
// or choose "Other…" to type a custom code manually.
export const DIAL_CODES: Array<{ code: string; label: string; flag: string }> = [
  { code: "+90", label: "Türkiye", flag: "🇹🇷" },
  { code: "+221", label: "Senegal", flag: "🇸🇳" },
  { code: "+225", label: "Côte d’Ivoire", flag: "🇨🇮" },
  { code: "+223", label: "Mali", flag: "🇲🇱" },
  { code: "+237", label: "Cameroon", flag: "🇨🇲" },
  { code: "+234", label: "Nigeria", flag: "🇳🇬" },
  { code: "+233", label: "Ghana", flag: "🇬🇭" },
  { code: "+254", label: "Kenya", flag: "🇰🇪" },
  { code: "+226", label: "Burkina Faso", flag: "🇧🇫" },
  { code: "+227", label: "Niger", flag: "🇳🇪" },
  { code: "+243", label: "DR Congo", flag: "🇨🇩" },
  { code: "+224", label: "Guinea", flag: "🇬🇳" },
  { code: "+229", label: "Benin", flag: "🇧🇯" },
  { code: "+228", label: "Togo", flag: "🇹🇬" },
  { code: "+255", label: "Tanzania", flag: "🇹🇿" },
  { code: "+256", label: "Uganda", flag: "🇺🇬" },
  { code: "+212", label: "Morocco", flag: "🇲🇦" },
];

export const PRESETS: Record<ProjectTypeId, Record<string, number>> = {
  house: { lights: 6, tv: 1, fridge: 1, fan: 2, internet: 1 },
  business: { lights: 10, tv: 1, fridge: 1, computer: 2, internet: 1, camera: 2 },
  office: { lights: 12, computer: 6, ac: 1, internet: 1, camera: 2 },
  mine: { lights: 20, pump: 4, computer: 4, camera: 4, internet: 1 },
  farm: { lights: 6, pump: 1, fridge: 1, fan: 2 },
  irrigation: { pump: 2, lights: 2 },
  other: {},
};

export const CATEGORY_ICON: Record<ProjectCategory, string> = {
  Residential: "home",
  Commercial: "business_center",
  Agricultural: "agriculture",
};

// --- Site & system checklist (from Norm Enerji preliminary form) ---

export type SystemTypeId = "on_grid" | "off_grid" | "hybrid";
export const SYSTEM_TYPES: Array<{ id: SystemTypeId; label: string; desc: string; icon: string }> = [
  { id: "on_grid", label: "On-Grid", desc: "Connected to the utility grid", icon: "power" },
  { id: "off_grid", label: "Off-Grid", desc: "Fully autonomous, no grid", icon: "bolt" },
  { id: "hybrid", label: "Hybrid", desc: "Grid + batteries", icon: "battery_charging_full" },
];

export type InstallZoneId = "roof" | "ground";
export const INSTALL_ZONES: Array<{ id: InstallZoneId; label: string; icon: string }> = [
  { id: "roof", label: "Rooftop", icon: "roofing" },
  { id: "ground", label: "Ground", icon: "landscape" },
];

export type RoofTypeId = "flat" | "sloped";
export const ROOF_TYPES: Array<{ id: RoofTypeId; label: string }> = [
  { id: "flat", label: "Flat" },
  { id: "sloped", label: "Sloped" },
];

export type RoofMaterialId = "trapezoidal" | "tile" | "concrete" | "other";
export const ROOF_MATERIALS: Array<{ id: RoofMaterialId; label: string }> = [
  { id: "trapezoidal", label: "Trapezoidal sheet" },
  { id: "tile", label: "Tile" },
  { id: "concrete", label: "Concrete" },
  { id: "other", label: "Other" },
];

export type OrientationId = "south" | "east" | "west" | "north" | "other";
export const ORIENTATIONS: Array<{ id: OrientationId; label: string }> = [
  { id: "south", label: "South" },
  { id: "east", label: "East" },
  { id: "west", label: "West" },
  { id: "north", label: "North" },
  { id: "other", label: "Other" },
];

export type SoilId = "earth" | "concrete" | "other";
export const SOILS: Array<{ id: SoilId; label: string }> = [
  { id: "earth", label: "Earth" },
  { id: "concrete", label: "Concrete" },
  { id: "other", label: "Other" },
];

export type GoalId = "savings" | "backup" | "autonomy";
export const GOALS: Array<{ id: GoalId; label: string; desc: string; icon: string }> = [
  { id: "savings", label: "Electricity savings", desc: "Lower the monthly bill", icon: "savings" },
  { id: "backup", label: "Backup power", desc: "Keep running during outages", icon: "history_toggle_off" },
  { id: "autonomy", label: "Full autonomy", desc: "Completely off the grid", icon: "all_inclusive" },
];

export const SYSTEM_TYPE_LABEL: Record<SystemTypeId, string> = Object.fromEntries(
  SYSTEM_TYPES.map((s) => [s.id, s.label])
) as Record<SystemTypeId, string>;
export const GOAL_LABEL: Record<GoalId, string> = Object.fromEntries(
  GOALS.map((g) => [g.id, g.label])
) as Record<GoalId, string>;
