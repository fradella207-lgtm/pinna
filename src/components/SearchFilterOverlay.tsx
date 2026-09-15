import React from "react";
import { 
  Search, 
  X, 
  ExternalLink,
  MapPin,
  Sparkles,
  SlidersHorizontal
} from "lucide-react";
import { ActivityFilterKey } from "../types";
import { ACTIVITY_FILTERS, getActivityIcon } from "../data/categories";
import { SpecialFilterType } from "./ActivityFilterBar";

interface SearchFilterOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  activeActivity: ActivityFilterKey;
  onSelectActivity: (act: ActivityFilterKey) => void;
  specialFilter: SpecialFilterType;
  onSelectSpecialFilter: (type: SpecialFilterType) => void;
  totalFiltered: number;
}

export const SearchFilterOverlay: React.FC<SearchFilterOverlayProps> = ({
  isOpen,
  onClose,
  searchQuery,
  onSearchChange,
  activeActivity,
  onSelectActivity,
  specialFilter,
  onSelectSpecialFilter,
  totalFiltered,
}) => {
  if (!isOpen) return null;

  const handleSearchOnGoogleMaps = () => {
    if (!searchQuery.trim()) return;
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(searchQuery)}`, "_blank");
  };

  return (
    <div className="fixed top-20 left-4 right-4 max-w-xl mx-auto z-30 pointer-events-auto animate-in fade-in slide-in-from-top-2 duration-150">
      <div className="bg-white/95 text-slate-900 backdrop-blur-2xl border border-slate-200/90 rounded-3xl shadow-[0_12px_36px_rgba(0,0,0,0.15)] p-3.5 space-y-3">
        
        {/* Top Header & Quick Reset */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
            <span>Filtra e Cerca ({totalFiltered} spot visibili)</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Categories Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 text-xs">
          <button
            type="button"
            onClick={() => onSelectActivity("tutti")}
            className={`px-3 py-1.5 rounded-full font-semibold shrink-0 transition-all ${
              activeActivity === "tutti"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Tutti
          </button>

          {ACTIVITY_FILTERS.map((f) => {
            const isActive = activeActivity === f.key;
            return (
              <button
                key={f.key}
                type="button"
                onClick={() => onSelectActivity(f.key)}
                className={`px-3 py-1.5 rounded-full font-semibold shrink-0 transition-all flex items-center gap-1.5 ${
                  isActive
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <span>{getActivityIcon(f.categoryName)}</span>
                <span>{f.label}</span>
              </button>
            );
          })}
        </div>

        {/* Special Filter Badges */}
        <div className="flex items-center gap-1.5 flex-wrap pt-1 text-[11px]">
          <button
            type="button"
            onClick={() => onSelectSpecialFilter("all")}
            className={`px-2.5 py-1 rounded-full font-medium transition-all ${
              specialFilter === "all"
                ? "bg-slate-200 text-slate-900 font-bold"
                : "text-slate-500 hover:bg-slate-100"
            }`}
          >
            Tutti i luoghi
          </button>
          <button
            type="button"
            onClick={() => onSelectSpecialFilter("to_visit")}
            className={`px-2.5 py-1 rounded-full font-medium transition-all ${
              specialFilter === "to_visit"
                ? "bg-slate-200 text-slate-900 font-bold"
                : "text-slate-500 hover:bg-slate-100"
            }`}
          >
            Da visitare
          </button>
          <button
            type="button"
            onClick={() => onSelectSpecialFilter("visited")}
            className={`px-2.5 py-1 rounded-full font-medium transition-all ${
              specialFilter === "visited"
                ? "bg-slate-200 text-slate-900 font-bold"
                : "text-slate-500 hover:bg-slate-100"
            }`}
          >
            Visitati
          </button>
          <button
            type="button"
            onClick={() => onSelectSpecialFilter("top_recommended")}
            className={`px-2.5 py-1 rounded-full font-medium transition-all ${
              specialFilter === "top_recommended"
                ? "bg-slate-200 text-slate-900 font-bold"
                : "text-slate-500 hover:bg-slate-100"
            }`}
          >
            ★ Top Consigliati
          </button>
        </div>

        {/* Google Maps Intelligence Search trigger */}
        {searchQuery.trim().length > 1 && (
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-500">
              Cerchi un luogo ovunque nel mondo?
            </span>
            <button
              type="button"
              onClick={handleSearchOnGoogleMaps}
              className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors"
            >
              <span>Cerca "{searchQuery}" su Google Maps</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
