import { ActivityCategory, ActivityFilterKey, MainCategory, Season } from "../types";

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

export interface TaxonomyCategory {
  nome: MainCategory;
  sottotitolo: string;
  tagContestuali: string[];
  iconName: string;
  color: string;
  bgLight: string;
  badgeBorder: string;
}

export const TAXONOMIA_360: TaxonomyCategory[] = [
  {
    nome: "Cultura & Storia",
    sottotitolo: "Monumenti, Musei, Chiese, Castelli, Borghi e Siti Archeologici",
    tagContestuali: ["Monumenti", "Musei", "Chiese & Basiliche", "Castelli", "Borghi Antichi", "Siti Archeologici"],
    iconName: "Landmark",
    color: "#7c3aed",
    bgLight: "bg-purple-50 text-purple-700 border-purple-200",
    badgeBorder: "border-purple-500",
  },
  {
    nome: "Natura & Relax",
    sottotitolo: "Laghi, Punti Panoramici, Spiagge, Cascate, Parchi e Grotte",
    tagContestuali: ["Punti Panoramici", "Laghi", "Spiagge & Mare", "Cascate & Fiumi", "Parchi Naturali", "Grotte"],
    iconName: "Trees",
    color: "#059669",
    bgLight: "bg-emerald-50 text-emerald-700 border-emerald-200",
    badgeBorder: "border-emerald-500",
  },
  {
    nome: "Guida & Panorami",
    sottotitolo: "Passi Montani, Strade Panoramiche, Piste Ciclabili e Itinerari",
    tagContestuali: ["Passi Montani", "Strade Panoramiche", "Piste Ciclabili", "Strade Storiche"],
    iconName: "Car",
    color: "#ea580c",
    bgLight: "bg-orange-50 text-orange-700 border-orange-200",
    badgeBorder: "border-orange-500",
  },
  {
    nome: "Sport & Natura",
    sottotitolo: "Trekking & Sentieri, Vette, Arrampicata, Piste da Sci e Sport",
    tagContestuali: ["Trekking & Sentieri", "Vette & Cime", "Rifugi Alpini", "Piste da Sci", "Arrampicata"],
    iconName: "Mountain",
    color: "#16a34a",
    bgLight: "bg-green-50 text-green-700 border-green-200",
    badgeBorder: "border-green-500",
  },
  {
    nome: "Cibo & Sapori",
    sottotitolo: "Ristoranti Tipici, Trattorie, Agriturismi, Rifugi e Bar",
    tagContestuali: ["Ristoranti Tipici", "Trattorie & Osterie", "Agriturismi", "Rifugi & Malghe", "Aperitivi & Bar"],
    iconName: "Utensils",
    color: "#e11d48",
    bgLight: "bg-rose-50 text-rose-700 border-rose-200",
    badgeBorder: "border-rose-500",
  },
  {
    nome: "Svago & Città",
    sottotitolo: "Piazze Famose, Strade Principali, Negozi, Mercatini e Luoghi Unici",
    tagContestuali: ["Piazze Principali", "Vie & Corsi Famosi", "Terrazze & Rooftop", "Posti Insoliti", "Eventi & Mercatini"],
    iconName: "Sparkles",
    color: "#2563eb",
    bgLight: "bg-blue-50 text-blue-700 border-blue-200",
    badgeBorder: "border-blue-500",
  },
];

export const ACTIVITY_FILTERS: ActivityFilterMeta[] = [
  {
    key: "tutti",
    label: "Tutti i Luoghi",
    categoryName: "Tutti",
    tagline: "Tutti i punti di interesse salvati nel mondo",
    iconName: "Compass",
    color: "#4f46e5",
    bgLight: "bg-indigo-50 text-indigo-700 border-indigo-200",
    badgeBorder: "border-indigo-500",
  },
  {
    key: "cultura_storia",
    label: "Cultura & Storia",
    categoryName: "Cultura & Storia",
    tagline: "Monumenti, Musei, Chiese, Castelli, Borghi e Siti Archeologici",
    iconName: "Landmark",
    color: "#7c3aed",
    bgLight: "bg-purple-50 text-purple-700 border-purple-200",
    badgeBorder: "border-purple-500",
  },
  {
    key: "natura_relax",
    label: "Natura & Relax",
    categoryName: "Natura & Relax",
    tagline: "Laghi, Belvedere, Punti Panoramici, Spiagge, Parchi",
    iconName: "Trees",
    color: "#059669",
    bgLight: "bg-emerald-50 text-emerald-700 border-emerald-200",
    badgeBorder: "border-emerald-500",
  },
  {
    key: "guida_panorami",
    label: "Guida & Panorami",
    categoryName: "Guida & Panorami",
    tagline: "Passi Montani, Strade Panoramiche, Piste Ciclabili",
    iconName: "Car",
    color: "#ea580c",
    bgLight: "bg-orange-50 text-orange-700 border-orange-200",
    badgeBorder: "border-orange-500",
  },
  {
    key: "sport_natura",
    label: "Sport & Natura",
    categoryName: "Sport & Natura",
    tagline: "Trekking & Sentieri, Vette, Sci, Rifugi, Arrampicata",
    iconName: "Mountain",
    color: "#16a34a",
    bgLight: "bg-green-50 text-green-700 border-green-200",
    badgeBorder: "border-green-500",
  },
  {
    key: "cibo_sapori",
    label: "Cibo & Sapori",
    categoryName: "Cibo & Sapori",
    tagline: "Ristoranti Tipici, Trattorie, Baite, Rifugi, Aperitivi",
    iconName: "Utensils",
    color: "#e11d48",
    bgLight: "bg-rose-50 text-rose-700 border-rose-200",
    badgeBorder: "border-rose-500",
  },
  {
    key: "svago_citta",
    label: "Svago & Città",
    categoryName: "Svago & Città",
    tagline: "Piazze Celebri, Vie dello Shopping, Rooftop, Posti Insoliti",
    iconName: "Sparkles",
    color: "#2563eb",
    bgLight: "bg-blue-50 text-blue-700 border-blue-200",
    badgeBorder: "border-blue-500",
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
  if (cat.includes("cultura") || cat.includes("storia") || cat.includes("culture") || cat.includes("history") || cat.includes("borgh") || cat.includes("muse") || cat.includes("monument")) return "#7c3aed";
  if (cat.includes("natura") || cat.includes("relax") || cat.includes("outdoor") || cat.includes("lago") || cat.includes("spiagg") || cat.includes("mare") || cat.includes("cascat")) return "#059669";
  if (cat.includes("guida") || cat.includes("panoram") || cat.includes("drive") || cat.includes("ride") || cat.includes("pass") || cat.includes("auto") || cat.includes("moto") || cat.includes("strad")) return "#ea580c";
  if (cat.includes("sport") || cat.includes("active") || cat.includes("trek") || cat.includes("sentier") || cat.includes("sci") || cat.includes("arrampicat")) return "#16a34a";
  if (cat.includes("cibo") || cat.includes("sapor") || cat.includes("food") || cat.includes("drink") || cat.includes("ristoran") || cat.includes("trattor") || cat.includes("agritur")) return "#e11d48";
  if (cat.includes("svago") || cat.includes("città") || cat.includes("citta") || cat.includes("leisure") || cat.includes("social") || cat.includes("rooftop") || cat.includes("piazz")) return "#2563eb";
  if (cat.includes("domenica") || cat.includes("montagna")) return "#059669";
  return "#4f46e5";
}

export function getActivityIcon(category?: string): string {
  const cat = (category || "").toLowerCase();
  if (cat.includes("cultura") || cat.includes("storia") || cat.includes("culture") || cat.includes("history") || cat.includes("borgh") || cat.includes("muse") || cat.includes("monument")) return "🏛️";
  if (cat.includes("natura") || cat.includes("relax") || cat.includes("outdoor") || cat.includes("lago") || cat.includes("spiagg") || cat.includes("mare") || cat.includes("cascat")) return "🌿";
  if (cat.includes("guida") || cat.includes("panoram") || cat.includes("drive") || cat.includes("ride") || cat.includes("pass") || cat.includes("auto") || cat.includes("moto") || cat.includes("strad")) return "🏎️";
  if (cat.includes("sport") || cat.includes("active") || cat.includes("trek") || cat.includes("sentier")) return "🥾";
  if (cat.includes("cibo") || cat.includes("sapor") || cat.includes("food") || cat.includes("drink") || cat.includes("ristoran")) return "🍝";
  if (cat.includes("svago") || cat.includes("città") || cat.includes("citta") || cat.includes("leisure") || cat.includes("social") || cat.includes("rooftop") || cat.includes("piazz")) return "✨";
  if (cat.includes("sci") || cat.includes("inverno") || cat.includes("neve")) return "⛷️";
  if (cat.includes("domenica") || cat.includes("montagna")) return "🏔️";
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

