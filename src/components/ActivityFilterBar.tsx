import React from "react";
import { 
  Compass, 
  Mountain, 
  Car, 
  Sun, 
  Utensils, 
  Snowflake, 
  Landmark, 
  Sparkles, 
  CheckCircle2, 
  Video, 
  TrendingUp,
  Clock
} from "lucide-react";
import { ActivityFilterKey, SavedPlace } from "../types";
import { ACTIVITY_FILTERS } from "../data/categories";

export type SpecialFilterType = "all" | "top_recommended" | "experience_based" | "visited" | "to_visit" | "with_video";

interface ActivityFilterBarProps {
  activeActivity: ActivityFilterKey;
  onSelectActivity: (key: ActivityFilterKey) => void;
  specialFilter: SpecialFilterType;
  onSelectSpecialFilter: (filter: SpecialFilterType) => void;
  places: SavedPlace[];
  visitedCount: number;
}

export const ActivityFilterBar: React.FC<ActivityFilterBarProps> = ({
  activeActivity,
  onSelectActivity,
  specialFilter,
  onSelectSpecialFilter,
  places,
  visitedCount,
}) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "Car":
        return <Car className="w-3.5 h-3.5" />;
      case "Mountain":
        return <Mountain className="w-3.5 h-3.5" />;
      case "Sun":
        return <Sun className="w-3.5 h-3.5" />;
      case "Utensils":
        return <Utensils className="w-3.5 h-3.5" />;
      case "Snowflake":
        return <Snowflake className="w-3.5 h-3.5" />;
      case "Landmark":
        return <Landmark className="w-3.5 h-3.5" />;
      default:
        return <Compass className="w-3.5 h-3.5" />;
    }
  };

  const getActivityCount = (filterKey: ActivityFilterKey) => {
    if (filterKey === "tutti") return places.length;
    const filterDef = ACTIVITY_FILTERS.find((f) => f.key === filterKey);
    if (!filterDef) return 0;

    return places.filter((p) => {
      const cat = (p.categoria || "").toLowerCase();
      const target = filterDef.categoryName.toLowerCase();
      return (
        cat.includes(target) ||
        (filterKey === "guida_panorami" && (cat.includes("pass") || cat.includes("auto") || cat.includes("guida") || cat.includes("strad"))) ||
        (filterKey === "cultura_storia" && (cat.includes("cultur") || cat.includes("stori") || cat.includes("borgh") || cat.includes("muse") || cat.includes("monument"))) ||
        (filterKey === "natura_relax" && (cat.includes("natur") || cat.includes("relax") || cat.includes("lago") || cat.includes("panoram") || cat.includes("belveder"))) ||
        (filterKey === "sport_natura" && (cat.includes("sport") || cat.includes("trek") || cat.includes("sentier") || cat.includes("sci"))) ||
        (filterKey === "cibo_sapori" && (cat.includes("cibo") || cat.includes("sapor") || cat.includes("ristoran") || cat.includes("food") || cat.includes("trattor"))) ||
        (filterKey === "svago_citta" && (cat.includes("svago") || cat.includes("citt") || cat.includes("piazz") || cat.includes("rooftop")))
      );
    }).length;
  };

  return (
    <div className="space-y-2.5">
      {/* 1. Primary Activity Filters (Horizontal Pill Strip) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {ACTIVITY_FILTERS.map((item) => {
          const isSelected = activeActivity === item.key;
          const count = getActivityCount(item.key);

          return (
            <button
              key={item.key}
              id={`activity-pill-${item.key}`}
              type="button"
              onClick={() => onSelectActivity(item.key)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all shadow-2xs ${
                isSelected
                  ? "bg-slate-900 text-white shadow-xs scale-100"
                  : "bg-white text-slate-700 border border-slate-200 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              <span style={{ color: isSelected ? "#fcd34d" : item.color }}>
                {getIcon(item.iconName)}
              </span>
              <span>{item.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  isSelected ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 2. Secondary Intuitive State Filters (Consigliati, In base alle esperienze, Visitati) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        <button
          id="filter-special-all"
          type="button"
          onClick={() => onSelectSpecialFilter("all")}
          className={`px-2.5 py-1 rounded-xl font-semibold transition-colors whitespace-nowrap ${
            specialFilter === "all"
              ? "bg-indigo-600 text-white"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          Mostra Tutto
        </button>

        <button
          id="filter-special-top"
          type="button"
          onClick={() => onSelectSpecialFilter("top_recommended")}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-xl font-semibold transition-colors whitespace-nowrap ${
            specialFilter === "top_recommended"
              ? "bg-amber-500 text-white shadow-xs"
              : "bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100"
          }`}
        >
          <Sparkles className="w-3 h-3 text-amber-500" />
          <span>⭐ Più Consigliati</span>
        </button>

        <button
          id="filter-special-experiences"
          type="button"
          onClick={() => onSelectSpecialFilter("experience_based")}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-xl font-semibold transition-colors whitespace-nowrap ${
            specialFilter === "experience_based"
              ? "bg-purple-600 text-white shadow-xs"
              : "bg-purple-50 text-purple-900 border border-purple-200 hover:bg-purple-100"
          }`}
          title="Consigli personalizzati calcolati in base ai posti che hai già visitato ed apprezzato"
        >
          <TrendingUp className="w-3 h-3 text-purple-600" />
          <span>🎯 Consigliati per le tue esperienze</span>
        </button>

        <button
          id="filter-special-visited"
          type="button"
          onClick={() => onSelectSpecialFilter("visited")}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-xl font-semibold transition-colors whitespace-nowrap ${
            specialFilter === "visited"
              ? "bg-emerald-600 text-white shadow-xs"
              : "bg-emerald-50 text-emerald-900 border border-emerald-200 hover:bg-emerald-100"
          }`}
        >
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          <span>✓ Già Visitati ({visitedCount})</span>
        </button>

        <button
          id="filter-special-tovisit"
          type="button"
          onClick={() => onSelectSpecialFilter("to_visit")}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-xl font-semibold transition-colors whitespace-nowrap ${
            specialFilter === "to_visit"
              ? "bg-slate-800 text-white"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
        >
          <Clock className="w-3 h-3 text-slate-500" />
          <span>⏳ Da Visitare</span>
        </button>

        <button
          id="filter-special-video"
          type="button"
          onClick={() => onSelectSpecialFilter("with_video")}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-xl font-semibold transition-colors whitespace-nowrap ${
            specialFilter === "with_video"
              ? "bg-orange-600 text-white shadow-xs"
              : "bg-orange-50 text-orange-900 border border-orange-200 hover:bg-orange-100"
          }`}
        >
          <Video className="w-3 h-3 text-orange-600" />
          <span>🎬 Con Video</span>
        </button>
      </div>
    </div>
  );
};
