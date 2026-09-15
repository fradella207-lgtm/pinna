import { ActivityCategory, ActivityFilterKey, Season } from "../types";

export interface ActivityFilterMeta {
  key: ActivityFilterKey;
  label: string;
  categoryName: string;
  tagline: string;
  iconName: string;
  color: string;
  bgLight: string;
  badgeBorder: string;
}

export const ACTIVITY_FILTERS: ActivityFilterMeta[] = [
  {
    key: "tutti",
    label: "Tutte le Attività",
    categoryName: "Tutti",
    tagline: "Tutti i punti di interesse e i percorsi salvati",
    iconName: "Compass",
    color: "#4f46e5", // Indigo-600
    bgLight: "bg-indigo-50 text-indigo-700 border-indigo-200",
    badgeBorder: "border-indigo-500",
  },
  {
    key: "giro_auto",
    label: "Giro in Auto / Moto",
    categoryName: "Passi di Montagna",
    tagline: "Valichi montani, 48 tornanti e curve panoramiche",
    iconName: "Car",
    color: "#ea580c", // Orange-600
    bgLight: "bg-orange-50 text-orange-700 border-orange-200",
    badgeBorder: "border-orange-500",
  },
  {
    key: "trekking",
    label: "Trekking & Sentieri",
    categoryName: "Trekking",
    tagline: "Escursioni a piedi, vette, anelli e rifugi alpini",
    iconName: "Mountain",
    color: "#16a34a", // Green-600
    bgLight: "bg-emerald-50 text-emerald-700 border-emerald-200",
    badgeBorder: "border-emerald-500",
  },
  {
    key: "domenica_montagna",
    label: "Domenica in Montagna",
    categoryName: "Domenica in Montagna",
    tagline: "Baite panoramiche, laghi smeraldo e relax in quota",
    iconName: "Sun",
    color: "#059669", // Emerald-600
    bgLight: "bg-teal-50 text-teal-700 border-teal-200",
    badgeBorder: "border-teal-500",
  },
  {
    key: "ristoranti",
    label: "Ristoranti & Cibo",
    categoryName: "Ristoranti",
    tagline: "Trattorie tipiche, pasta fatta in casa e piatti tradizionali",
    iconName: "Utensils",
    color: "#e11d48", // Rose-600
    bgLight: "bg-rose-50 text-rose-700 border-rose-200",
    badgeBorder: "border-rose-500",
  },
  {
    key: "sci_inverno",
    label: "Piste da Sci & Neve",
    categoryName: "Sci & Inverno",
    tagline: "Discese leggendarie, rifugi caldi e settimane bianche",
    iconName: "Snowflake",
    color: "#0284c7", // Sky-600
    bgLight: "bg-sky-50 text-sky-700 border-sky-200",
    badgeBorder: "border-sky-500",
  },
  {
    key: "passeggiate",
    label: "Passeggiate & Borghi",
    categoryName: "Passeggiate",
    tagline: "Borghi storici, belvedere romantici e vicoli incantati",
    iconName: "Landmark",
    color: "#7c3aed", // Violet-600
    bgLight: "bg-purple-50 text-purple-700 border-purple-200",
    badgeBorder: "border-purple-500",
  },
];

export const SEASONS_LIST: { name: Season; iconName: string; colorClass: string }[] = [
  { name: "Tutte le stagioni", iconName: "Sparkles", colorClass: "text-slate-600 bg-slate-100" },
  { name: "Primavera", iconName: "Flower2", colorClass: "text-emerald-700 bg-emerald-50 border-emerald-200" },
  { name: "Estate", iconName: "Sun", colorClass: "text-amber-700 bg-amber-50 border-amber-200" },
  { name: "Autunno", iconName: "Trees", colorClass: "text-orange-700 bg-orange-50 border-orange-200" },
  { name: "Inverno", iconName: "Snowflake", colorClass: "text-sky-700 bg-sky-50 border-sky-200" },
];

export function getActivityColor(category?: string): string {
  const cat = (category || "").toLowerCase();
  if (cat.includes("pass") || cat.includes("auto") || cat.includes("moto")) return "#ea580c";
  if (cat.includes("trek") || cat.includes("sentier")) return "#16a34a";
  if (cat.includes("domenica") || cat.includes("montagna")) return "#059669";
  if (cat.includes("ristoran") || cat.includes("cibo") || cat.includes("food")) return "#e11d48";
  if (cat.includes("sci") || cat.includes("inverno") || cat.includes("neve")) return "#0284c7";
  if (cat.includes("passegg") || cat.includes("borgh") || cat.includes("cultur")) return "#7c3aed";
  return "#4f46e5";
}

export function getActivityIcon(category?: string): string {
  const cat = (category || "").toLowerCase();
  if (cat.includes("pass") || cat.includes("auto") || cat.includes("moto")) return "🏎️";
  if (cat.includes("trek") || cat.includes("sentier")) return "🥾";
  if (cat.includes("domenica") || cat.includes("montagna")) return "🏔️";
  if (cat.includes("ristoran") || cat.includes("cibo") || cat.includes("food")) return "🍝";
  if (cat.includes("sci") || cat.includes("inverno") || cat.includes("neve")) return "⛷️";
  if (cat.includes("passegg") || cat.includes("borgh") || cat.includes("cultur")) return "🏰";
  return "📍";
}

export const GENRE_METADATA: Record<
  string,
  { label: string; color: string; description: string }
> = {
  passi_motori: {
    label: "Passi & Curve",
    color: "#ea580c",
    description: "Valichi montani, curve e tornanti panoramici",
  },
  piste_sci: {
    label: "Piste da Sci",
    color: "#0284c7",
    description: "Comprensori sciistici e baite sulle piste",
  },
  trekking_outdoor: {
    label: "Trekking",
    color: "#16a34a",
    description: "Sentieri escursionistici, vette e anelli alpini",
  },
  food_drink: {
    label: "Ristoranti",
    color: "#e11d48",
    description: "Trattorie tipiche, aperitivi e sapori tradizionali",
  },
  cultura_borghi: {
    label: "Borghi & Cultura",
    color: "#7c3aed",
    description: "Borghi antichi, castelli e belvedere romantici",
  },
  relax_panorami: {
    label: "Domenica in Montagna",
    color: "#059669",
    description: "Laghi alpini, baite e relax in quota",
  },
};

