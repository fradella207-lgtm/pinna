import React from "react";
import { 
  Compass, 
  MapPin, 
  Search, 
  Plus, 
  Filter, 
  Sparkles, 
  ChevronDown,
  Layers,
  Maximize2,
  X
} from "lucide-react";

interface MobileControlBarProps {
  totalPlacesCount: number;
  filteredPlacesCount: number;
  isDrawerOpen: boolean;
  onToggleDrawer: () => void;
  isSearchFilterOpen: boolean;
  onToggleSearchFilter: () => void;
  onOpenAddPlace: () => void;
  searchQuery: string;
  hasActiveFilters: boolean;
}

export const MobileControlBar: React.FC<MobileControlBarProps> = ({
  totalPlacesCount,
  filteredPlacesCount,
  isDrawerOpen,
  onToggleDrawer,
  isSearchFilterOpen,
  onToggleSearchFilter,
  onOpenAddPlace,
  searchQuery,
  hasActiveFilters,
}) => {
  return (
    <header className="fixed top-3 left-3 right-3 sm:left-4 sm:right-4 z-20 pointer-events-none flex flex-col gap-2">
      {/* Top Floating Glass Bar */}
      <div className="pointer-events-auto flex items-center justify-between gap-2 p-1.5 sm:p-2 rounded-2xl sm:rounded-3xl bg-slate-900/85 backdrop-blur-xl border border-slate-700/70 shadow-2xl text-white">
        {/* Brand & Drawer Toggle */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Logo icon */}
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-violet-600 flex items-center justify-center text-white shadow-xs shrink-0">
            <Compass className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
          </div>

          {/* MAIN BUTTON: Località Salvate (Menù a tendina / drawer) */}
          <button
            id="btn-toggle-saved-places-menu"
            type="button"
            onClick={onToggleDrawer}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm transition-all active:scale-95 ${
              isDrawerOpen
                ? "bg-indigo-600 text-white shadow-md ring-1 ring-indigo-400"
                : "bg-slate-800/90 hover:bg-slate-700 text-slate-100 hover:text-white"
            }`}
            title="Apri il menù delle località salvate"
          >
            <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
            <span>Località</span>
            <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[10px] sm:text-xs font-mono">
              {filteredPlacesCount}
            </span>
            <ChevronDown 
              className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                isDrawerOpen ? "rotate-180 text-white" : ""
              }`} 
            />
          </button>
        </div>

        {/* Right Side Actions: Cerca & Filtri + Aggiungi Luogo */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Cerca & Filtri Button */}
          <button
            id="btn-toggle-search-filters"
            type="button"
            onClick={onToggleSearchFilter}
            className={`relative flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl sm:rounded-2xl text-xs font-semibold transition-all active:scale-95 ${
              isSearchFilterOpen || searchQuery || hasActiveFilters
                ? "bg-indigo-600/90 text-white border border-indigo-400/50"
                : "bg-slate-800/80 hover:bg-slate-700 text-slate-200"
            }`}
            title="Cerca e filtra località"
          >
            <Search className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Filtri</span>
            {(searchQuery || hasActiveFilters) && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            )}
          </button>

          {/* MAIN BUTTON: Aggiungi Luogo (+ Analizza Reel) */}
          <button
            id="btn-add-new-place-mobile"
            type="button"
            onClick={onOpenAddPlace}
            className="flex items-center gap-1 px-3 sm:px-3.5 py-1.5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95 shrink-0"
            title="Aggiungi nuovo luogo o analizza Reel"
          >
            <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[3]" />
            <span>Aggiungi</span>
          </button>
        </div>
      </div>
    </header>
  );
};
