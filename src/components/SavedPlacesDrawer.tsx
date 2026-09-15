import React, { useState } from "react";
import { 
  Search, 
  MapPin, 
  Navigation, 
  CheckCircle2, 
  Circle, 
  Clock,
  ChevronRight,
  Bookmark,
  Camera,
  FileText,
  Edit3,
  SlidersHorizontal,
  Trash2
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { SavedPlace, ActivityFilterKey } from "../types";
import { ACTIVITY_FILTERS, getActivityColor, getActivityIcon } from "../data/categories";
import { UserAccountButton } from "./UserAccountButton";

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
}

export const SavedPlacesDrawer: React.FC<SavedPlacesDrawerProps> = ({
  isOpen,
  places,
  allPlaces,
  onOpenDetails,
  onToggleVisited,
  onDeletePlace,
  searchQuery,
  onSearchChange,
  activeActivity,
  onSelectActivity,
}) => {
  // Main view segment: "to_visit" (colored) vs "visited" (gray/desaturated)
  const [visitedTab, setVisitedTab] = useState<"to_visit" | "visited">("to_visit");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  if (!isOpen) return null;

  // Separate all places into To Visit and Visited
  const toVisitPlaces = places.filter((p) => !(p.stato_iniziale?.visitato || p.visited));
  const visitedPlaces = places.filter((p) => Boolean(p.stato_iniziale?.visitato || p.visited));

  const currentDisplayPlaces = visitedTab === "to_visit" ? toVisitPlaces : visitedPlaces;

  return (
    <motion.div 
      id="saved-places-fullscreen-view"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 15 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className="fixed inset-0 z-40 bg-slate-50 flex flex-col text-slate-900 overflow-hidden"
    >
      {/* 1. Top Refined Header (Pure Minimalist, NO 'Nuovo Spot' and NO 'Mappa' buttons) */}
      <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-slate-200/70 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
            <Bookmark className="w-4 h-4 fill-white" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold tracking-tight text-slate-900">
              I Miei Luoghi
            </h1>
            <p className="text-[11px] text-slate-500 font-medium">
              {allPlaces.length} salvati • {visitedPlaces.length} già visitati
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Quick Search inside top bar on larger screens */}
          <div className="relative flex-1 max-w-xs hidden sm:block">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Filtra per nome o zona..."
              className="w-full pl-8 pr-7 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-slate-900 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange("")}
                className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-700 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          <UserAccountButton />
        </div>
      </header>

      {/* 2. Controls & Segment Bar */}
      <div className="bg-white/90 backdrop-blur-md border-b border-slate-200/70 px-4 sm:px-8 py-2.5 space-y-2.5">
        
        {/* Mobile Search Bar */}
        <div className="relative w-full sm:hidden">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Cerca nei tuoi luoghi..."
            className="w-full pl-8 pr-7 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-slate-900 transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-700 text-xs"
            >
              ✕
            </button>
          )}
        </div>

        {/* Fluid Segment Switcher: Da Visitare vs Già Visti */}
        <div className="flex items-center justify-between gap-3 max-w-xl mx-auto">
          <div className="relative flex p-1 rounded-2xl bg-slate-100/90 border border-slate-200/70 w-full text-xs font-semibold">
            {/* Tab: Da Visitare */}
            <button
              type="button"
              onClick={() => setVisitedTab("to_visit")}
              className={`relative z-10 flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl transition-colors duration-150 ${
                visitedTab === "to_visit"
                  ? "text-slate-900 font-bold"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {visitedTab === "to_visit" && (
                <motion.div
                  layoutId="activeTabBadge"
                  className="absolute inset-0 bg-white rounded-xl shadow-xs"
                  transition={{ type: "spring", stiffness: 450, damping: 32 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-600" />
                <span>Da Visitare</span>
                <span className="px-1.5 py-0.5 rounded-full bg-slate-100 text-[10px] text-slate-700 font-bold">
                  {toVisitPlaces.length}
                </span>
              </span>
            </button>

            {/* Tab: Già Visti */}
            <button
              type="button"
              onClick={() => setVisitedTab("visited")}
              className={`relative z-10 flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl transition-colors duration-150 ${
                visitedTab === "visited"
                  ? "text-slate-900 font-bold"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {visitedTab === "visited" && (
                <motion.div
                  layoutId="activeTabBadge"
                  className="absolute inset-0 bg-white rounded-xl shadow-xs"
                  transition={{ type: "spring", stiffness: 450, damping: 32 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Già Visti</span>
                <span className="px-1.5 py-0.5 rounded-full bg-slate-100 text-[10px] text-slate-700 font-bold">
                  {visitedPlaces.length}
                </span>
              </span>
            </button>
          </div>
        </div>

        {/* Minimal Category Filter Line */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 text-[11px] max-w-xl mx-auto">
          <button
            type="button"
            onClick={() => onSelectActivity("tutti")}
            className={`px-3 py-1 rounded-full font-medium shrink-0 transition-all ${
              activeActivity === "tutti"
                ? "bg-slate-900 text-white font-semibold shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Tutte
          </button>
          {ACTIVITY_FILTERS.map((f) => {
            const isActive = activeActivity === f.key;
            return (
              <button
                key={f.key}
                type="button"
                onClick={() => onSelectActivity(f.key)}
                className={`px-2.5 py-1 rounded-full font-medium shrink-0 transition-all flex items-center gap-1 ${
                  isActive
                    ? "bg-slate-900 text-white font-semibold shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <span>{getActivityIcon(f.categoryName)}</span>
                <span>{f.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Places Grid (Opens full detail view directly on click, without jumping to the map!) */}
      <main className="flex-1 overflow-y-auto px-4 sm:px-8 py-5 pb-32">
        <div className="max-w-5xl mx-auto">
          <AnimatePresence mode="wait">
            {currentDisplayPlaces.length === 0 ? (
              <motion.div 
                key="empty"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-20 px-4 max-w-sm mx-auto space-y-3"
              >
                <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center mx-auto text-slate-400 shadow-xs">
                  {visitedTab === "visited" ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                  ) : (
                    <Bookmark className="w-6 h-6 text-slate-400" />
                  )}
                </div>
                <h3 className="text-sm font-bold text-slate-800">
                  {visitedTab === "visited"
                    ? "Nessun luogo segnato come visitato"
                    : "Nessun luogo da visitare"}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {visitedTab === "visited"
                    ? "Quando visiti uno spot, tocca il cerchietto per segnarlo come visitato: diventerà grigio ed entrerà qui nel tuo diario di viaggio."
                    : "Usa il pulsante (+) nella barra in basso per aggiungere o incollare un nuovo spot."}
                </p>
              </motion.div>
            ) : (
              <motion.div 
                key={visitedTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.18 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5"
              >
                {currentDisplayPlaces.map((place) => {
                  const isVisited = Boolean(place.stato_iniziale?.visitato || place.visited);
                  const placeName = place.nome || place.nome_luogo;
                  const googleMapsNavUrl = `https://www.google.com/maps/dir/?api=1&destination=${place.coordinate?.lat},${place.coordinate?.lng}`;
                  const coverImg = (place.user_photos && place.user_photos[0]) ||
                    place.dati_grafici?.cover_image_url || 
                    "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=500&auto=format&fit=crop&q=80";

                  return (
                    <motion.div
                      key={place.id}
                      id={`saved-card-${place.id}`}
                      whileHover={{ y: -3 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => onOpenDetails(place)} // Opens full detail view directly in-place!
                      className={`group relative bg-white rounded-2xl p-3 border transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                        isVisited
                          ? "border-slate-200/80 bg-slate-50/50 hover:bg-white hover:border-slate-300"
                          : "border-slate-200/80 hover:border-slate-300 shadow-xs hover:shadow-md"
                      }`}
                    >
                      <div>
                        {/* Cover Image Container */}
                        <div className="relative w-full h-40 rounded-xl overflow-hidden bg-slate-100 mb-2.5">
                          <img
                            src={coverImg}
                            alt={placeName}
                            referrerPolicy="no-referrer"
                            className={`w-full h-full object-cover transition-all duration-300 group-hover:scale-105 ${
                              isVisited
                                ? "grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100"
                                : ""
                            }`}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent pointer-events-none" />

                          {/* Category Badge */}
                          <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-white/95 backdrop-blur-md text-[10px] font-bold text-slate-800 shadow-xs flex items-center gap-1">
                            <span>{getActivityIcon(place.categoria)}</span>
                            <span>{place.categoria}</span>
                          </div>

                          {/* Visited Status Button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleVisited(place.id);
                            }}
                            className={`absolute top-2 right-2 px-2.5 py-1 rounded-full text-[10px] font-bold shadow-xs transition-all flex items-center gap-1 ${
                              isVisited
                                ? "bg-slate-900/90 backdrop-blur-md text-emerald-400 border border-white/20"
                                : "bg-white/95 text-slate-700 hover:bg-white"
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
                                <Circle className="w-3 h-3 text-slate-400" />
                                <span>Da fare</span>
                              </>
                            )}
                          </button>

                          <div className="absolute bottom-2 left-2 right-2 text-white">
                            <span className="text-[11px] font-medium text-slate-200 flex items-center gap-1 drop-shadow-sm truncate">
                              <MapPin className="w-3 h-3 text-rose-300 shrink-0" />
                              <span className="truncate">{place.citta_o_zona}</span>
                            </span>
                          </div>
                        </div>

                        {/* Title & Notes */}
                        <div className="flex items-start justify-between gap-1.5">
                          <h3 className={`font-bold text-sm leading-snug tracking-tight truncate transition-colors ${
                            isVisited ? "text-slate-600 group-hover:text-slate-900" : "text-slate-900 group-hover:text-indigo-600"
                          }`}>
                            {placeName}
                          </h3>
                        </div>

                        {place.user_notes ? (
                          <p className="text-[11px] text-amber-800 bg-amber-50/80 border border-amber-200/60 rounded-lg px-2 py-1 mt-1.5 line-clamp-1 flex items-center gap-1 font-medium">
                            <FileText className="w-3 h-3 shrink-0 text-amber-600" />
                            <span className="truncate">"{place.user_notes}"</span>
                          </p>
                        ) : place.riassunto_ai_minimal ? (
                          <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                            {place.riassunto_ai_minimal}
                          </p>
                        ) : null}

                        {/* Metadata Pills */}
                        <div className="flex items-center gap-1.5 mt-2 flex-wrap text-[10px]">
                          <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium">
                            <Clock className="w-2.5 h-2.5 text-amber-500" />
                            <span>{place.metadata_ai_nascosti?.durata_stimata_minuti || 90}m</span>
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium">
                            {place.metadata_ai_nascosti?.momento_ideale || "Mattina"}
                          </span>
                          {place.user_photos && place.user_photos.length > 0 && (
                            <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-semibold">
                              <Camera className="w-2.5 h-2.5" />
                              <span>{place.user_photos.length} foto</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Card Footer Actions */}
                      <div className="flex items-center justify-between gap-2 mt-3 pt-2.5 border-t border-slate-100">
                        <div className="flex items-center gap-1.5">
                          <a
                            id={`btn-nav-place-${place.id}`}
                            href={googleMapsNavUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white font-semibold text-[11px] transition-all"
                          >
                            <Navigation className="w-3 h-3" />
                            <span>Maps</span>
                          </a>

                          {/* Quick Delete Spot Button */}
                          {onDeletePlace && (
                            confirmDeleteId === place.id ? (
                              <div 
                                onClick={(e) => e.stopPropagation()} 
                                className="flex items-center gap-1 px-2 py-1 rounded-xl bg-rose-50 border border-rose-200 animate-in fade-in"
                              >
                                <span className="text-[10px] font-bold text-rose-700">Eliminare?</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    onDeletePlace(place.id);
                                    setConfirmDeleteId(null);
                                  }}
                                  className="px-1.5 py-0.5 rounded-md bg-rose-600 text-white font-bold text-[10px] hover:bg-rose-700"
                                >
                                  Sì
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setConfirmDeleteId(null)}
                                  className="px-1.5 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 font-semibold text-[10px]"
                                >
                                  No
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setConfirmDeleteId(place.id);
                                }}
                                className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                title="Elimina spot dai salvati"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )
                          )}
                        </div>

                        <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-600 group-hover:text-slate-900 transition-colors">
                          <Edit3 className="w-3 h-3 text-slate-400 group-hover:text-slate-700" />
                          <span>Dettagli</span>
                          <ChevronRight className="w-3 h-3 text-slate-400" />
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </motion.div>
  );
};
