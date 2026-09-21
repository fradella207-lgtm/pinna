import React, { useMemo } from "react";
import { 
  X, 
  ExternalLink,
  MapPin,
  SlidersHorizontal,
  RotateCcw,
  Globe
} from "lucide-react";
import { ActivityFilterKey, SavedPlace } from "../types";
import { ACTIVITY_FILTERS, getActivityIcon, TRANSPORT_MODES } from "../data/categories";
import { SpecialFilterType } from "./ActivityFilterBar";
import { 
  getInsertedCountries, 
  getInsertedRegionsAndProvinces 
} from "../lib/geoItaly";

interface SearchFilterOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  allPlaces: SavedPlace[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
  activeActivity: ActivityFilterKey;
  onSelectActivity: (act: ActivityFilterKey) => void;
  specialFilter: SpecialFilterType;
  onSelectSpecialFilter: (type: SpecialFilterType) => void;
  activeCountry: string;
  onSelectCountry: (country: string) => void;
  activeRegion: string;
  onSelectRegion: (reg: string) => void;
  activeProvince: string;
  onSelectProvince: (prov: string) => void;
  activeTransport?: string;
  onSelectTransport?: (transport: string) => void;
  totalFiltered: number;
}

export const SearchFilterOverlay: React.FC<SearchFilterOverlayProps> = ({
  isOpen,
  onClose,
  allPlaces,
  searchQuery,
  onSearchChange,
  activeActivity,
  onSelectActivity,
  specialFilter,
  onSelectSpecialFilter,
  activeCountry,
  onSelectCountry,
  activeRegion,
  onSelectRegion,
  activeProvince,
  onSelectProvince,
  activeTransport = "tutti",
  onSelectTransport,
  totalFiltered,
}) => {
  if (!isOpen) return null;

  const insertedCountries = useMemo(() => {
    return getInsertedCountries(allPlaces);
  }, [allPlaces]);

  const { insertedRegions, insertedProvinces } = useMemo(() => {
    return getInsertedRegionsAndProvinces(allPlaces, activeCountry);
  }, [allPlaces, activeCountry]);

  // Provinces to show: if a region is chosen, show only provinces for that region
  const provincesForDisplay = useMemo(() => {
    if (activeRegion === "tutte") return insertedProvinces;
    return insertedProvinces.filter((p) => p.region.toLowerCase() === activeRegion.toLowerCase());
  }, [insertedProvinces, activeRegion]);

  const hasAnyFilter = 
    activeActivity !== "tutti" || 
    specialFilter !== "all" || 
    activeCountry !== "tutti" ||
    activeRegion !== "tutte" || 
    activeProvince !== "tutte" || 
    activeTransport !== "tutti" ||
    Boolean(searchQuery.trim());

  const handleResetAll = () => {
    onSelectCountry("tutti");
    onSelectActivity("tutti");
    onSelectSpecialFilter("all");
    onSelectRegion("tutte");
    onSelectProvince("tutte");
    onSelectTransport?.("tutti");
    onSearchChange("");
  };

  return (
    <div className="fixed top-20 left-4 right-4 max-w-xl mx-auto z-30 pointer-events-auto animate-in fade-in slide-in-from-top-2 duration-150">
      <div className="bg-white/95 dark:bg-slate-900/95 text-slate-900 dark:text-white backdrop-blur-2xl border border-slate-200/90 dark:border-slate-800 rounded-3xl shadow-[0_12px_36px_rgba(0,0,0,0.15)] dark:shadow-[0_12px_36px_rgba(0,0,0,0.5)] p-4 space-y-3.5 max-h-[82vh] overflow-y-auto">
        
        {/* Top Header & Quick Reset */}
        <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span>Filtra Luoghi ({totalFiltered} visibili)</span>
          </div>

          <div className="flex items-center gap-2">
            {hasAnyFilter && (
              <button
                type="button"
                onClick={handleResetAll}
                className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Azzera</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 0. STATI / PAESI PRESENTI */}
        {insertedCountries.length > 0 && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1">
                <Globe className="w-3 h-3 text-sky-500" />
                <span>Stato / Nazione ({insertedCountries.length} presenti)</span>
              </span>
              {activeCountry !== "tutti" && (
                <button
                  type="button"
                  onClick={() => onSelectCountry("tutti")}
                  className="text-[10px] text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
                >
                  Tutti
                </button>
              )}
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 text-xs">
              <button
                type="button"
                onClick={() => onSelectCountry("tutti")}
                className={`px-2.5 py-1 rounded-full font-semibold shrink-0 transition-all text-xs flex items-center gap-1.5 cursor-pointer ${
                  activeCountry === "tutti"
                    ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                <span>🌍</span>
                <span>Tutti gli stati</span>
              </button>
              {insertedCountries.map((c) => {
                const isSelected = activeCountry.toLowerCase() === c.name.toLowerCase();
                return (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => onSelectCountry(isSelected ? "tutti" : c.name)}
                    className={`px-2.5 py-1 rounded-full font-semibold shrink-0 transition-all flex items-center gap-1.5 text-xs cursor-pointer ${
                      isSelected
                        ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                    }`}
                  >
                    <span>{c.flag}</span>
                    <span>{c.name}</span>
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      isSelected ? "bg-white/20 dark:bg-black/20 text-white dark:text-slate-900" : "bg-slate-200/80 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                    }`}>
                      {c.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 1. REGIONI INSERITE */}
        {insertedRegions.length > 0 && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1">
                <MapPin className="w-3 h-3 text-rose-500" />
                <span>Regione ({insertedRegions.length} presenti)</span>
              </span>
              {activeRegion !== "tutte" && (
                <button
                  type="button"
                  onClick={() => onSelectRegion("tutte")}
                  className="text-[10px] text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
                >
                  Tutte
                </button>
              )}
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 text-xs">
              <button
                type="button"
                onClick={() => onSelectRegion("tutte")}
                className={`px-2.5 py-1 rounded-full font-semibold shrink-0 transition-all text-xs cursor-pointer ${
                  activeRegion === "tutte"
                    ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                Tutte le regioni
              </button>
              {insertedRegions.map((r) => {
                const isSelected = activeRegion.toLowerCase() === r.name.toLowerCase();
                return (
                  <button
                    key={r.name}
                    type="button"
                    onClick={() => onSelectRegion(isSelected ? "tutte" : r.name)}
                    className={`px-2.5 py-1 rounded-full font-semibold shrink-0 transition-all flex items-center gap-1.5 text-xs cursor-pointer ${
                      isSelected
                        ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                    }`}
                  >
                    <span>{r.name}</span>
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      isSelected ? "bg-white/20 dark:bg-black/20 text-white dark:text-slate-900" : "bg-slate-200/80 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                    }`}>
                      {r.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 2. PROVINCIE INSERITE */}
        {provincesForDisplay.length > 0 && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1">
                <MapPin className="w-3 h-3 text-amber-500" />
                <span>
                  Provincia {activeRegion !== "tutte" ? `in ${activeRegion}` : "inserite"} ({provincesForDisplay.length})
                </span>
              </span>
              {activeProvince !== "tutte" && (
                <button
                  type="button"
                  onClick={() => onSelectProvince("tutte")}
                  className="text-[10px] text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
                >
                  Tutte
                </button>
              )}
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 text-xs">
              <button
                type="button"
                onClick={() => onSelectProvince("tutte")}
                className={`px-2.5 py-1 rounded-full font-semibold shrink-0 transition-all text-xs cursor-pointer ${
                  activeProvince === "tutte"
                    ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                Tutte le province
              </button>
              {provincesForDisplay.map((p) => {
                const isSelected = activeProvince.toLowerCase() === p.code.toLowerCase() || 
                                   activeProvince.toLowerCase() === p.name.toLowerCase();
                return (
                  <button
                    key={p.code}
                    type="button"
                    onClick={() => onSelectProvince(isSelected ? "tutte" : p.code)}
                    className={`px-2.5 py-1 rounded-full font-semibold shrink-0 transition-all flex items-center gap-1.5 text-xs cursor-pointer ${
                      isSelected
                        ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                    }`}
                  >
                    <span>{p.name}</span>
                    <span className={`text-[10px] font-mono font-bold ${
                      isSelected ? "text-amber-200 dark:text-amber-700" : "text-slate-400"
                    }`}>
                      {p.code}
                    </span>
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      isSelected ? "bg-white/20 dark:bg-black/20 text-white dark:text-slate-900" : "bg-slate-200/80 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                    }`}>
                      {p.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 3. CATEGORIE SPOT */}
        <div className="space-y-1.5 pt-1 border-t border-slate-100 dark:border-slate-800">
          <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
            Categoria
          </span>
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 text-xs">
            <button
              type="button"
              onClick={() => onSelectActivity("tutti")}
              className={`px-3 py-1.5 rounded-full font-semibold shrink-0 transition-all cursor-pointer ${
                activeActivity === "tutti"
                  ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
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
                  className={`px-3 py-1.5 rounded-full font-semibold shrink-0 transition-all flex items-center gap-1.5 cursor-pointer ${
                    isActive
                      ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                  }`}
                >
                  <span>{getActivityIcon(f.categoryName)}</span>
                  <span>{f.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3b. MEZZO DI TRASPORTO / ATTIVITÀ */}
        <div className="space-y-1.5 pt-1 border-t border-slate-100 dark:border-slate-800">
          <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
            Mezzo di Trasporto / Attività
          </span>
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 text-xs">
            <button
              type="button"
              onClick={() => onSelectTransport?.("tutti")}
              className={`px-3 py-1.5 rounded-full font-semibold shrink-0 transition-all cursor-pointer ${
                activeTransport === "tutti"
                  ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              Tutti i mezzi
            </button>
            {TRANSPORT_MODES.map((tm) => {
              const isSelected = activeTransport === tm.key;
              return (
                <button
                  key={tm.key}
                  type="button"
                  onClick={() => onSelectTransport?.(isSelected ? "tutti" : tm.key)}
                  className={`px-3 py-1.5 rounded-full font-semibold shrink-0 transition-all flex items-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                  }`}
                >
                  <span>{tm.emoji}</span>
                  <span>{tm.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. FILTRI STATO & ALGORITMO */}
        <div className="flex items-center gap-1.5 flex-wrap pt-1 text-[11px]">
          <button
            type="button"
            onClick={() => onSelectSpecialFilter("all")}
            className={`px-2.5 py-1 rounded-full font-medium transition-all cursor-pointer ${
              specialFilter === "all"
                ? "bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white font-bold"
                : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            Tutti i luoghi
          </button>
          <button
            type="button"
            onClick={() => onSelectSpecialFilter("to_visit")}
            className={`px-2.5 py-1 rounded-full font-medium transition-all cursor-pointer ${
              specialFilter === "to_visit"
                ? "bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white font-bold"
                : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            Da visitare
          </button>
          <button
            type="button"
            onClick={() => onSelectSpecialFilter("visited")}
            className={`px-2.5 py-1 rounded-full font-medium transition-all cursor-pointer ${
              specialFilter === "visited"
                ? "bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white font-bold"
                : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            Visitati
          </button>
          <button
            type="button"
            onClick={() => onSelectSpecialFilter("top_recommended")}
            className={`px-2.5 py-1 rounded-full font-medium transition-all cursor-pointer ${
              specialFilter === "top_recommended"
                ? "bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white font-bold"
                : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            ★ Top Consigliati
          </button>
        </div>

        {/* Google Maps Search trigger */}
        {searchQuery.trim().length > 1 && (
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              Cerchi un luogo ovunque nel mondo?
            </span>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(searchQuery)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
            >
              <span>Cerca "{searchQuery}" su Google Maps</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}
      </div>
    </div>
  );
};
