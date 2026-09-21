import React, { useState, useMemo } from "react";
import { 
  Search, 
  MapPin, 
  Navigation, 
  CheckCircle2, 
  Circle, 
  Clock, 
  Bookmark, 
  Camera, 
  FileText, 
  SlidersHorizontal, 
  Trash2, 
  X, 
  RotateCcw, 
  Check, 
  Compass,
  Building2,
  Globe,
  ExternalLink
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { SavedPlace, ActivityFilterKey } from "../types";
import { ACTIVITY_FILTERS, getActivityColor, getActivityIcon, getTransportModeMeta } from "../data/categories";
import { UserAccountButton } from "./UserAccountButton";
import { 
  getInsertedCountries,
  getInsertedRegionsAndProvinces, 
  detectPlaceRegionsAndProvinces,
  getCountryFlag
} from "../lib/geoItaly";

interface SavedPlacesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  places: SavedPlace[];
  allPlaces: SavedPlace[];
  selectedPlace: SavedPlace | null;
  onSelectPlace: (place: SavedPlace) => void;
  onOpenDetails: (place: SavedPlace) => void;
  onToggleVisited: (id: string) => void;
  onDeletePlace?: (id: string) => void;
  onOpenAddPlace: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  activeActivity: ActivityFilterKey;
  onSelectActivity: (key: ActivityFilterKey) => void;
  specialFilter: string;
  onSelectSpecialFilter: (type: any) => void;
  activeCountry?: string;
  onSelectCountry?: (country: string) => void;
  activeRegion: string;
  onSelectRegion: (reg: string) => void;
  activeProvince: string;
  onSelectProvince: (prov: string) => void;
  onClearAllPlaces?: () => void;
  onSeedSamplePlaces?: () => void;
}

export const SavedPlacesDrawer: React.FC<SavedPlacesDrawerProps> = ({
  isOpen,
  places,
  allPlaces,
  onOpenDetails,
  onToggleVisited,
  onDeletePlace,
  onOpenAddPlace,
  searchQuery,
  onSearchChange,
  activeActivity,
  onSelectActivity,
  specialFilter,
  onSelectSpecialFilter,
  activeCountry = "tutti",
  onSelectCountry,
  activeRegion,
  onSelectRegion,
  activeProvince,
  onSelectProvince,
  onClearAllPlaces,
  onSeedSamplePlaces,
}) => {
  // Main view segment: "to_visit" (colored) vs "visited" (gray/desaturated)
  const [visitedTab, setVisitedTab] = useState<"to_visit" | "visited">("to_visit");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  // Dynamic calculation of inserted countries across all user places
  const insertedCountries = useMemo(() => {
    return getInsertedCountries(allPlaces);
  }, [allPlaces]);

  // Dynamic calculation of inserted regions and provinces across all user places
  const { insertedRegions, insertedProvinces } = useMemo(() => {
    return getInsertedRegionsAndProvinces(allPlaces, activeCountry);
  }, [allPlaces, activeCountry]);

  // If a region is active, filter province suggestions to that region
  const provincesForDisplay = useMemo(() => {
    if (activeRegion === "tutte") return insertedProvinces;
    return insertedProvinces.filter((p) => p.region.toLowerCase() === activeRegion.toLowerCase());
  }, [insertedProvinces, activeRegion]);

  if (!isOpen) return null;

  // Separate places into To Visit and Visited
  const toVisitPlaces = places.filter((p) => !(p.stato_iniziale?.visitato || p.visited));
  const visitedPlaces = places.filter((p) => Boolean(p.stato_iniziale?.visitato || p.visited));

  const currentDisplayPlaces = visitedTab === "to_visit" ? toVisitPlaces : visitedPlaces;

  // Check if any non-default filter is active
  const hasActiveFilter = 
    activeActivity !== "tutti" || 
    specialFilter !== "all" || 
    (activeCountry && activeCountry !== "tutti") ||
    activeRegion !== "tutte" || 
    activeProvince !== "tutte";

  const activeFilterCount = 
    (activeActivity !== "tutti" ? 1 : 0) + 
    (specialFilter !== "all" ? 1 : 0) + 
    (activeCountry && activeCountry !== "tutti" ? 1 : 0) + 
    (activeRegion !== "tutte" ? 1 : 0) + 
    (activeProvince !== "tutte" ? 1 : 0);

  const activeActivityLabel = ACTIVITY_FILTERS.find((f) => f.key === activeActivity)?.label || activeActivity;

  const handleResetFilters = () => {
    onSelectCountry?.("tutti");
    onSelectActivity("tutti");
    onSelectSpecialFilter("all");
    onSelectRegion("tutte");
    onSelectProvince("tutte");
  };

  return (
    <motion.div 
      id="saved-places-fullscreen-view"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 15 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className="fixed inset-0 z-40 bg-slate-50 dark:bg-slate-950 flex flex-col text-slate-900 dark:text-slate-100 overflow-hidden transition-colors duration-200"
    >
      {/* 1. Header Desktop & Mobile */}
      <header className="sticky top-0 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-4 sm:px-8 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 flex items-center justify-center shadow-xs">
            <Bookmark className="w-4 h-4 fill-current" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-white">
              I Miei Luoghi
            </h1>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium flex items-center gap-2">
              <span>{allPlaces.length} salvati • {visitedPlaces.length} visitati</span>
              {allPlaces.length > 0 && onClearAllPlaces && (
                <button
                  type="button"
                  onClick={() => setShowClearConfirm(true)}
                  title="Svuota completamente tutti gli spot"
                  className="text-[10px] text-slate-400 hover:text-rose-600 font-semibold px-1.5 py-0.5 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors inline-flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-2.5 h-2.5" />
                  <span>Svuota lista</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Desktop Search + Filter Button */}
        <div className="hidden sm:flex items-center gap-2 flex-1 max-w-md justify-end">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Filtra per nome o zona..."
              className="w-full pl-8 pr-7 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:bg-white dark:focus:bg-slate-800 focus:ring-1 focus:ring-slate-900 dark:focus:ring-slate-400 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange("")}
                className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-xs cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          {/* Desktop Filter Button next to search */}
          <button
            type="button"
            onClick={() => setIsFilterModalOpen(true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all border shrink-0 cursor-pointer ${
              hasActiveFilter
                ? "bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-950 dark:border-white shadow-xs"
                : "bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 shadow-2xs"
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filtri</span>
            {hasActiveFilter && (
              <span className="w-4 h-4 rounded-full bg-indigo-500 text-white text-[10px] font-bold flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <UserAccountButton />
        </div>
      </header>

      {/* 2. Controls & Segment Bar */}
      <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/70 dark:border-slate-800 px-4 sm:px-8 py-2.5 space-y-2">
        
        {/* Mobile Search Bar + Filter Button side-by-side */}
        <div className="flex sm:hidden items-center gap-2 w-full">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Cerca nei tuoi luoghi..."
              className="w-full pl-8 pr-7 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:bg-white dark:focus:bg-slate-800 focus:ring-1 focus:ring-slate-900 dark:focus:ring-slate-400 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange("")}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-xs cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          {/* Mobile Filter button adjacent to search */}
          <button
            type="button"
            onClick={() => setIsFilterModalOpen(true)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border shrink-0 cursor-pointer ${
              hasActiveFilter
                ? "bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-950 dark:border-white shadow-xs"
                : "bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 shadow-2xs"
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filtri</span>
            {hasActiveFilter && (
              <span className="w-4 h-4 rounded-full bg-indigo-500 text-white text-[10px] font-bold flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Fluid Segment Switcher: Da Visitare vs Già Visti */}
        <div className="flex items-center justify-between gap-3 max-w-xl mx-auto">
          <div className="relative flex p-1 rounded-2xl bg-slate-100/90 dark:bg-slate-800/90 border border-slate-200/70 dark:border-slate-700/70 w-full text-xs font-semibold">
            {/* Tab: Da Visitare */}
            <button
              type="button"
              onClick={() => setVisitedTab("to_visit")}
              className={`relative z-10 flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl transition-colors duration-150 cursor-pointer ${
                visitedTab === "to_visit"
                  ? "text-slate-900 dark:text-white font-bold"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              {visitedTab === "to_visit" && (
                <motion.div
                  layoutId="activeTabBadge"
                  className="absolute inset-0 bg-white dark:bg-slate-900 rounded-xl shadow-xs"
                  transition={{ type: "spring", stiffness: 450, damping: 32 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400" />
                <span>Da Visitare</span>
                <span className="px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-700 dark:text-slate-300 font-bold">
                  {toVisitPlaces.length}
                </span>
              </span>
            </button>

            {/* Tab: Già Visti */}
            <button
              type="button"
              onClick={() => setVisitedTab("visited")}
              className={`relative z-10 flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl transition-colors duration-150 cursor-pointer ${
                visitedTab === "visited"
                  ? "text-slate-900 dark:text-white font-bold"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              {visitedTab === "visited" && (
                <motion.div
                  layoutId="activeTabBadge"
                  className="absolute inset-0 bg-white dark:bg-slate-900 rounded-xl shadow-xs"
                  transition={{ type: "spring", stiffness: 450, damping: 32 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Già Visti</span>
                <span className="px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-700 dark:text-slate-300 font-bold">
                  {visitedPlaces.length}
                </span>
              </span>
            </button>
          </div>
        </div>

        {/* Active Filter Reminder Chips (Removable pills) */}
        {hasActiveFilter && (
          <div className="flex items-center justify-center gap-1.5 flex-wrap pt-0.5 max-w-2xl mx-auto">
            <span className="text-[11px] text-slate-400 font-medium">Attivi:</span>

            {/* Country Chip */}
            {activeCountry && activeCountry !== "tutti" && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-800 border border-sky-200 text-[11px] font-semibold">
                <Globe className="w-3 h-3 text-sky-500" />
                <span>{getCountryFlag(activeCountry)} {activeCountry}</span>
                <button
                  type="button"
                  onClick={() => onSelectCountry?.("tutti")}
                  className="hover:text-sky-950 ml-0.5 text-xs font-bold"
                >
                  ✕
                </button>
              </span>
            )}

            {/* Region Chip */}
            {activeRegion !== "tutte" && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-800 border border-rose-200 text-[11px] font-semibold">
                <MapPin className="w-3 h-3 text-rose-500" />
                <span>{activeRegion}</span>
                <button
                  type="button"
                  onClick={() => onSelectRegion("tutte")}
                  className="hover:text-rose-950 ml-0.5 text-xs font-bold"
                >
                  ✕
                </button>
              </span>
            )}

            {/* Province Chip */}
            {activeProvince !== "tutte" && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200 text-[11px] font-semibold">
                <Building2 className="w-3 h-3 text-amber-600" />
                <span>Prov. {activeProvince}</span>
                <button
                  type="button"
                  onClick={() => onSelectProvince("tutte")}
                  className="hover:text-amber-950 ml-0.5 text-xs font-bold"
                >
                  ✕
                </button>
              </span>
            )}

            {/* Category Chip */}
            {activeActivity !== "tutti" && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-900 text-white text-[11px] font-semibold">
                <span>{getActivityIcon(activeActivityLabel)}</span>
                <span>{activeActivityLabel}</span>
                <button
                  type="button"
                  onClick={() => onSelectActivity("tutti")}
                  className="hover:text-rose-300 ml-0.5"
                >
                  ✕
                </button>
              </span>
            )}

            {/* Special Filter Chip */}
            {specialFilter !== "all" && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-800 text-white text-[11px] font-semibold">
                <span>{specialFilter}</span>
                <button
                  type="button"
                  onClick={() => onSelectSpecialFilter("all")}
                  className="hover:text-rose-300 ml-0.5"
                >
                  ✕
                </button>
              </span>
            )}

            <button
              type="button"
              onClick={handleResetFilters}
              className="text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold underline ml-1"
            >
              Azzera tutti
            </button>
          </div>
        )}
      </div>

      {/* 3. Places Grid */}
      <main className="flex-1 overflow-y-auto px-4 sm:px-8 py-5 pb-32">
        <div className="max-w-5xl mx-auto">
          <AnimatePresence mode="wait">
            {currentDisplayPlaces.length === 0 ? (
              <motion.div 
                key="empty-state"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-16 text-center max-w-md mx-auto space-y-4"
              >
                <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto flex items-center justify-center shadow-inner">
                  <Compass className="w-7 h-7" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-200">
                    {allPlaces.length === 0 ? "Nessun luogo salvato" : "Nessun luogo trovato"}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed px-4">
                    {allPlaces.length === 0
                      ? "Il tuo account è completamente vuoto da 0. Pronto per iniziare a salvare e organizzare i tuoi spot preferiti!"
                      : hasActiveFilter || searchQuery
                      ? "Nessun luogo salvato corrisponde ai filtri o alla ricerca corrente."
                      : visitedTab === "to_visit"
                      ? "Non hai ancora luoghi da visitare. Salva nuovi spot dalla mappa o aggiungili con il pulsante (+)!"
                      : "Non hai ancora segnato nessun luogo come visitato. Quando completi una visita, premi 'Segna come visitato'!"}
                  </p>
                </div>

                <div className="flex flex-col items-center justify-center gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={onOpenAddPlace}
                    className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-all active:scale-98 cursor-pointer flex items-center gap-2"
                  >
                    <span>+ Aggiungi il tuo primo spot</span>
                  </button>

                  {allPlaces.length === 0 && onSeedSamplePlaces && (
                    <button
                      type="button"
                      onClick={onSeedSamplePlaces}
                      className="text-[11px] text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 font-medium py-1 px-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      (Oppure prova con spot dimostrativi)
                    </button>
                  )}
                </div>

                {searchQuery.trim().length >= 2 && (
                  <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200/90 text-amber-900 text-left space-y-2 mt-2">
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      La ricerca nella mappa cerca solo tra i tuoi <strong>luoghi salvati</strong>. Vuoi cercare "<strong>{searchQuery}</strong>" nel mondo su Google Maps e aggiungerlo?
                    </p>
                    <div className="flex items-center gap-2">
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(searchQuery)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors"
                      >
                        <span>Cerca su Google Maps</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      <button
                        type="button"
                        onClick={onOpenAddPlace}
                        className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs transition-colors"
                      >
                        + Aggiungi Nuovo Spot
                      </button>
                    </div>
                  </div>
                )}

                {hasActiveFilter && (
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="mt-2 px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
                  >
                    Azzera filtri
                  </button>
                )}
              </motion.div>
            ) : (
              <motion.div 
                key={`places-grid-${visitedTab}`}
                layout
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
              >
                {currentDisplayPlaces.map((place) => {
                  const isVisited = Boolean(place.stato_iniziale?.visitato || place.visited);
                  const isDeleting = confirmDeleteId === place.id;
                  const placeName = place.nome || place.nome_luogo || "Spot";
                  const coverImage = place.cover_image || place.foto_principale || "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=60";
                  
                  // Detect place region & province for quick visual tag
                  const geo = detectPlaceRegionsAndProvinces(place);
                  const displayReg = place.regione || geo.primaryRegion;
                  const displayProv = place.provincia || geo.primaryProvince?.code;
                  const transportMeta = getTransportModeMeta(place.mezzo_trasporto);

                  return (
                    <motion.div
                      key={place.id}
                      layout
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.18 }}
                      className={`group relative flex flex-col justify-between rounded-2xl border transition-all duration-200 overflow-hidden ${
                        isVisited
                          ? "bg-white/80 dark:bg-slate-900/80 border-slate-200/70 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 shadow-2xs opacity-90"
                          : "bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md shadow-xs"
                      }`}
                    >
                      {/* Clickable Card Body */}
                      <div 
                        onClick={() => onOpenDetails(place)}
                        className="p-3 cursor-pointer flex-1 flex flex-col"
                      >
                        {/* Thumbnail & Badges */}
                        <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 mb-2.5 border border-slate-100 dark:border-slate-800">
                          <img
                            src={coverImage}
                            alt={placeName}
                            referrerPolicy="no-referrer"
                            className={`w-full h-full object-cover transition-all duration-300 group-hover:scale-102 ${
                              isVisited ? "grayscale contrast-105" : ""
                            }`}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

                          {/* Category Badge & Transport Badge */}
                          <div className="absolute top-2 left-2 flex items-center gap-1 flex-wrap max-w-[70%]">
                            <span 
                              className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white shadow-xs"
                              style={{ backgroundColor: getActivityColor(place.categoria_principale || place.categoria) }}
                            >
                              {place.categoria_principale || place.categoria}
                            </span>
                            {transportMeta && (
                              <span 
                                className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-900/80 backdrop-blur-md text-white border border-white/20 shadow-xs flex items-center gap-1"
                                title={transportMeta.label}
                              >
                                <span>{transportMeta.emoji}</span>
                                <span className="hidden sm:inline">{transportMeta.label}</span>
                              </span>
                            )}
                          </div>

                          {/* Quick Visited Toggle on Card */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleVisited(place.id);
                            }}
                            className={`absolute top-2 right-2 px-2.5 py-1 rounded-full text-[10px] font-bold shadow-xs transition-all flex items-center gap-1 cursor-pointer ${
                              isVisited
                                ? "bg-slate-900/90 backdrop-blur-md text-emerald-400 border border-white/20"
                                : "bg-white/95 dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-800"
                            }`}
                            title={isVisited ? "Segna come da visitare" : "Segna come visitato"}
                          >
                            {isVisited ? (
                              <>
                                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                <span>Visitato</span>
                              </>
                            ) : (
                              <>
                                <Circle className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                                <span>Da fare</span>
                              </>
                            )}
                          </button>

                          {/* Location string overlay */}
                          <div className="absolute bottom-2 left-2 right-2 text-white">
                            <span className="text-[11px] font-medium text-slate-200 flex items-center gap-1 drop-shadow-sm truncate">
                              <MapPin className="w-3 h-3 text-rose-300 shrink-0" />
                              <span className="truncate">{place.citta_o_zona}</span>
                            </span>
                          </div>
                        </div>

                        {/* Title */}
                        <div className="flex items-start justify-between gap-1.5">
                          <h3 className={`font-bold text-sm leading-snug tracking-tight truncate transition-colors ${
                            isVisited 
                              ? "text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white" 
                              : "text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400"
                          }`}>
                            {placeName}
                          </h3>
                        </div>

                        {/* Region & Province Badge */}
                        {(displayReg || displayProv) && (
                          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                            {displayReg && (
                              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 font-semibold text-[10px]">
                                <MapPin className="w-2.5 h-2.5 text-rose-500" />
                                <span>{displayReg}</span>
                              </span>
                            )}
                            {displayProv && (
                              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 font-semibold text-[10px]">
                                <span>Prov. {displayProv}</span>
                              </span>
                            )}
                          </div>
                        )}

                        {/* Notes or Summary */}
                        {place.user_notes ? (
                          <p className="text-[11px] text-amber-800 dark:text-amber-200 bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/50 rounded-lg px-2 py-1 mt-1.5 line-clamp-1 flex items-center gap-1 font-medium">
                            <FileText className="w-3 h-3 shrink-0 text-amber-600 dark:text-amber-400" />
                            <span className="truncate">"{place.user_notes}"</span>
                          </p>
                        ) : place.riassunto_ai_minimal ? (
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                            {place.riassunto_ai_minimal}
                          </p>
                        ) : null}

                        {/* Metadata Pills */}
                        <div className="flex items-center gap-1.5 mt-2 flex-wrap text-[10px]">
                          {transportMeta && (
                            <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold border border-blue-200/50 dark:border-blue-800/50">
                              <span>{transportMeta.emoji}</span>
                              <span>{transportMeta.label}</span>
                            </span>
                          )}
                          <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                            <Clock className="w-2.5 h-2.5 text-amber-500" />
                            <span>{place.metadata_ai_nascosti?.durata_stimata_minuti || 90}m</span>
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                            {place.metadata_ai_nascosti?.momento_ideale || "Mattina"}
                          </span>
                          {place.user_photos && place.user_photos.length > 0 && (
                            <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-semibold">
                              <Camera className="w-2.5 h-2.5" />
                              <span>{place.user_photos.length} foto</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Card Footer Actions */}
                      <div className="flex items-center justify-between gap-2 px-3 py-2.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                        <div className="flex items-center gap-1.5">
                          <a
                            id={`btn-nav-place-${place.id}`}
                            href={`https://www.google.com/maps/dir/?api=1&destination=${place.coordinate?.lat || 46.5},${place.coordinate?.lng || 11.5}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="p-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200 dark:border-slate-700 transition-colors flex items-center gap-1 text-[11px] font-semibold cursor-pointer"
                            title="Naviga su Google Maps"
                          >
                            <Navigation className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                            <span className="hidden sm:inline">Naviga</span>
                          </a>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenDetails(place);
                            }}
                            className="p-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors text-[11px] font-semibold cursor-pointer"
                          >
                            Dettagli
                          </button>
                        </div>

                        {/* Direct Delete Trigger */}
                        {onDeletePlace && (
                          <div className="relative">
                            {isDeleting ? (
                              <div 
                                onClick={(e) => e.stopPropagation()}
                                className="flex items-center gap-1.5 bg-rose-50 dark:bg-rose-950/70 border border-rose-200 dark:border-rose-900 rounded-full px-2 py-0.5 shadow-xs animate-in fade-in zoom-in-95 duration-150"
                              >
                                <Trash2 className="w-3 h-3 text-rose-500 shrink-0" />
                                <span className="text-[10px] font-bold text-rose-800 dark:text-rose-200">Elimina?</span>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onDeletePlace(place.id);
                                    setConfirmDeleteId(null);
                                  }}
                                  className="px-2 py-0.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-bold shadow-2xs active:scale-95 transition-all cursor-pointer"
                                >
                                  Sì
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setConfirmDeleteId(null);
                                  }}
                                  className="px-1.5 py-0.5 rounded-full bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-semibold border border-slate-200 dark:border-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
                                >
                                  ✕
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setConfirmDeleteId(place.id);
                                }}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                                title="Elimina spot"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* 4. MODALE FILTRI COMPATTO (Regione, Provincia, Categoria, Speciale) */}
      <AnimatePresence>
        {isFilterModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
            onClick={() => setIsFilterModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh]"
            >
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 flex items-center justify-center shadow-xs">
                    <SlidersHorizontal className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                      Filtra i Tuoi Luoghi
                    </h2>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Filtra per regione, provincia, categoria o tipologia
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsFilterModalOpen(false)}
                  className="p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Filter Options */}
              <div className="p-6 overflow-y-auto space-y-5">

                {/* 0. STATO / NAZIONE (Dei Luoghi Inseriti) */}
                {insertedCountries.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5 text-sky-500" />
                        <span>Stato / Nazione ({insertedCountries.length} presenti)</span>
                      </label>
                      {activeCountry !== "tutti" && (
                        <button
                          type="button"
                          onClick={() => onSelectCountry?.("tutti")}
                          className="text-xs font-semibold text-sky-600 dark:text-sky-400 hover:underline cursor-pointer"
                        >
                          Tutti gli stati
                        </button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                      <button
                        type="button"
                        onClick={() => onSelectCountry?.("tutti")}
                        className={`p-2 rounded-xl border text-left text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                          activeCountry === "tutti"
                            ? "bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-950 dark:border-white shadow-xs"
                            : "bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200"
                        }`}
                      >
                        <span className="flex items-center gap-1.5">
                          <span>🌍</span>
                          <span>Tutti gli stati</span>
                        </span>
                        {activeCountry === "tutti" && <Check className="w-3.5 h-3.5" />}
                      </button>

                      {insertedCountries.map((c) => {
                        const isSelected = activeCountry.toLowerCase() === c.name.toLowerCase();
                        return (
                          <button
                            key={c.name}
                            type="button"
                            onClick={() => onSelectCountry?.(isSelected ? "tutti" : c.name)}
                            className={`p-2 rounded-xl border text-left text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                              isSelected
                                ? "bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-950 dark:border-white shadow-xs"
                                : "bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200"
                            }`}
                          >
                            <span className="truncate flex items-center gap-1.5">
                              <span>{c.flag}</span>
                              <span className="truncate">{c.name}</span>
                            </span>
                            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                              isSelected ? "bg-white/20 text-white dark:bg-slate-950/20 dark:text-slate-950" : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                            }`}>
                              {c.count}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 1. REGIONE (Dei Luoghi Inseriti) */}
                {insertedRegions.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-rose-500" />
                        <span>Regione ({insertedRegions.length} presenti)</span>
                      </label>
                      {activeRegion !== "tutte" && (
                        <button
                          type="button"
                          onClick={() => onSelectRegion("tutte")}
                          className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
                        >
                          Mostra tutte
                        </button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                      <button
                        type="button"
                        onClick={() => onSelectRegion("tutte")}
                        className={`p-2 rounded-xl border text-left text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                          activeRegion === "tutte"
                            ? "bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-950 dark:border-white shadow-xs"
                            : "bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200"
                        }`}
                      >
                        <span>Tutte le regioni</span>
                        {activeRegion === "tutte" && <Check className="w-3.5 h-3.5" />}
                      </button>

                      {insertedRegions.map((reg) => {
                        const isSelected = activeRegion.toLowerCase() === reg.name.toLowerCase();
                        return (
                          <button
                            key={reg.name}
                            type="button"
                            onClick={() => onSelectRegion(isSelected ? "tutte" : reg.name)}
                            className={`p-2 rounded-xl border text-left text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                              isSelected
                                ? "bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-950 dark:border-white shadow-xs"
                                : "bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200"
                            }`}
                          >
                            <span className="truncate">{reg.name}</span>
                            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                              isSelected ? "bg-white/20 text-white dark:bg-slate-950/20 dark:text-slate-950" : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                            }`}>
                              {reg.count}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 2. PROVINCIA (Dei Luoghi Inseriti) */}
                {provincesForDisplay.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-amber-500" />
                        <span>
                          Provincia {activeRegion !== "tutte" ? `in ${activeRegion}` : "inserite"} ({provincesForDisplay.length})
                        </span>
                      </label>
                      {activeProvince !== "tutte" && (
                        <button
                          type="button"
                          onClick={() => onSelectProvince("tutte")}
                          className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
                        >
                          Mostra tutte
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                      <button
                        type="button"
                        onClick={() => onSelectProvince("tutte")}
                        className={`p-2 rounded-xl border text-left text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                          activeProvince === "tutte"
                            ? "bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-950 dark:border-white shadow-xs"
                            : "bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200"
                        }`}
                      >
                        <span>Tutte le province</span>
                        {activeProvince === "tutte" && <Check className="w-3.5 h-3.5" />}
                      </button>

                      {provincesForDisplay.map((prov) => {
                        const isSelected = activeProvince.toLowerCase() === prov.code.toLowerCase() || 
                                           activeProvince.toLowerCase() === prov.name.toLowerCase();
                        return (
                          <button
                            key={prov.code}
                            type="button"
                            onClick={() => onSelectProvince(isSelected ? "tutte" : prov.code)}
                            className={`p-2 rounded-xl border text-left text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                              isSelected
                                ? "bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-950 dark:border-white shadow-xs"
                                : "bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200"
                            }`}
                          >
                            <span className="truncate flex items-center gap-1">
                              <span>{prov.name}</span>
                              <span className={`text-[10px] font-mono ${
                                isSelected ? "text-amber-200 font-bold" : "text-slate-400 dark:text-slate-500"
                              }`}>
                                ({prov.code})
                              </span>
                            </span>
                            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                              isSelected ? "bg-white/20 text-white dark:bg-slate-950/20 dark:text-slate-950" : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                            }`}>
                              {prov.count}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 3. Categoria Spot */}
                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider block">
                    Categoria Spot
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => onSelectActivity("tutti")}
                      className={`p-2.5 rounded-xl border text-left text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                        activeActivity === "tutti"
                          ? "bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-950 dark:border-white shadow-xs"
                          : "bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200"
                      }`}
                    >
                      <span>Tutte le categorie</span>
                      {activeActivity === "tutti" && <Check className="w-3.5 h-3.5" />}
                    </button>

                    {ACTIVITY_FILTERS.map((f) => {
                      const isSelected = activeActivity === f.key;
                      return (
                        <button
                          key={f.key}
                          type="button"
                          onClick={() => onSelectActivity(f.key)}
                          className={`p-2.5 rounded-xl border text-left text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                            isSelected
                              ? "bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-950 dark:border-white shadow-xs"
                              : "bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200"
                          }`}
                        >
                          <span className="flex items-center gap-1.5 truncate">
                            <span>{getActivityIcon(f.categoryName)}</span>
                            <span className="truncate">{f.label}</span>
                          </span>
                          {isSelected && <Check className="w-3.5 h-3.5 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 4. Special / Algorithm Filters */}
                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider block">
                    Filtro Speciale
                  </label>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {[
                      { id: "all", label: "Tutti gli spot" },
                      { id: "top_recommended", label: "⭐ Più consigliati" },
                      { id: "with_video", label: "📹 Con video/social" },
                    ].map((opt) => {
                      const isSelected = specialFilter === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => onSelectSpecialFilter(opt.id)}
                          className={`p-2.5 rounded-xl border text-left font-bold transition-all flex items-center justify-between cursor-pointer ${
                            isSelected
                              ? "bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-950 dark:border-white shadow-xs"
                              : "bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200"
                          }`}
                        >
                          <span>{opt.label}</span>
                          {isSelected && <Check className="w-3.5 h-3.5" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Azzera tutti</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsFilterModalOpen(false)}
                  className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 text-xs font-bold shadow-xs transition-all cursor-pointer"
                >
                  Mostra Luoghi ({currentDisplayPlaces.length})
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirmation Modal for "Svuota lista" */}
      <AnimatePresence>
        {showClearConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 12 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-rose-100 dark:border-rose-900/50 text-center space-y-4"
            >
              <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto shadow-inner border border-rose-100 dark:border-rose-900/40">
                <Trash2 className="w-7 h-7 stroke-[2]" />
              </div>

              <div className="space-y-1.5">
                <h4 className="text-base font-black text-slate-900 dark:text-white">
                  Svuotare tutti i luoghi?
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed px-2">
                  Tutti i <strong>{allPlaces.length} luoghi salvati</strong> verranno eliminati definitivamente. Il tuo account rimarrà completamente vuoto da 0.
                </p>
              </div>

              <div className="flex items-center justify-center gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowClearConfirm(false)}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer"
                >
                  Annulla
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onClearAllPlaces?.();
                    setShowClearConfirm(false);
                  }}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black flex items-center justify-center gap-1.5 shadow-md shadow-rose-600/20 active:scale-98 transition-all cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Svuota tutto</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
