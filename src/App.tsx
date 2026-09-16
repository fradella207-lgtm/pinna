import React, { useState, useMemo } from "react";
import { 
  SavedPlace, 
  CustomList, 
  ActivityFilterKey 
} from "./types";
import { INITIAL_LISTS } from "./data/initialData";
import { MapView } from "./components/MapView";
import { SpotterBottomDock, DockActiveTab } from "./components/SpotterBottomDock";
import { SavedPlacesDrawer } from "./components/SavedPlacesDrawer";
import { SearchFilterOverlay } from "./components/SearchFilterOverlay";
import { FloatingPlaceCard } from "./components/FloatingPlaceCard";
import { PlaceDetailModal } from "./components/PlaceDetailModal";
import { AiExtractorModal } from "./components/AiExtractorModal";
import { AuthModal } from "./components/AuthModal";
import { SettingsModal } from "./components/SettingsModal";
import { FeedbackModal } from "./components/FeedbackModal";
import { SpecialFilterType } from "./components/ActivityFilterBar";
import { ACTIVITY_FILTERS } from "./data/categories";
import { UserAccountButton } from "./components/UserAccountButton";
import { useUserPlaces } from "./lib/useUserPlaces";
import { 
  doesPlaceMatchCountryRegionAndProvince, 
  findProvinceByCode, 
  findProvinceByName 
} from "./lib/geoItaly";
import { Search, SlidersHorizontal } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  // Real-time Cloud Firestore integration per user account
  const { 
    places, 
    savePlace, 
    toggleVisited: handleToggleVisited, 
    removePlace: handleDeletePlace 
  } = useUserPlaces();

  const [lists, setLists] = useState<CustomList[]>(() => {
    try {
      const saved = localStorage.getItem("spotter_lists_v1");
      if (saved) return JSON.parse(saved);
      const oldV3 = localStorage.getItem("spotfinder_lists_v3");
      if (oldV3) return JSON.parse(oldV3);
    } catch {
      // Ignored
    }
    return INITIAL_LISTS;
  });

  // Dock Navigation State: "map" (full screen map) | "places" (list view)
  const [activeDockTab, setActiveDockTab] = useState<DockActiveTab>("map");
  const [isExtractorOpen, setIsExtractorOpen] = useState(false);
  const [isSearchFilterOpen, setIsSearchFilterOpen] = useState(false);

  // Filters
  const [activeActivity, setActiveActivity] = useState<ActivityFilterKey>("tutti");
  const [specialFilter, setSpecialFilter] = useState<SpecialFilterType>("all");
  const [activeCountry, setActiveCountry] = useState<string>("tutti");
  const [activeRegion, setActiveRegion] = useState<string>("tutte");
  const [activeProvince, setActiveProvince] = useState<string>("tutte");
  const [activeListId, setActiveListId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSelectCountry = (country: string) => {
    setActiveCountry(country);
    if (country !== "tutti") {
      setActiveRegion("tutte");
      setActiveProvince("tutte");
    }
  };

  const handleSelectRegion = (region: string) => {
    setActiveRegion(region);
    // If current active province is not in the newly selected region, reset it
    if (region !== "tutte" && activeProvince !== "tutte") {
      const prov = findProvinceByCode(activeProvince) || findProvinceByName(activeProvince);
      if (prov && prov.region.toLowerCase() !== region.toLowerCase()) {
        setActiveProvince("tutte");
      }
    }
  };

  const handleSelectProvince = (provinceCode: string) => {
    setActiveProvince(provinceCode);
    if (provinceCode !== "tutte") {
      const prov = findProvinceByCode(provinceCode) || findProvinceByName(provinceCode);
      if (prov && activeRegion !== "tutte" && activeRegion.toLowerCase() !== prov.region.toLowerCase()) {
        setActiveRegion(prov.region);
      }
    }
  };

  // Place selection: Level 1 (compact preview card) & Level 2 (expanded modal)
  const [mapSelectedPlace, setMapSelectedPlace] = useState<SavedPlace | null>(null);
  const [detailPlace, setDetailPlace] = useState<SavedPlace | null>(null);

  // Visited count
  const visitedPlaces = useMemo(() => {
    return places.filter((p) => p.stato_iniziale?.visitato || p.visited);
  }, [places]);

  // Keep detailPlace in sync if places array updates from Firestore
  const activeDetailPlace = useMemo(() => {
    if (!detailPlace) return null;
    return places.find((p) => p.id === detailPlace.id) || detailPlace;
  }, [places, detailPlace]);

  // Experience-based algorithm ranking
  const experienceRecommendedPlaces = useMemo(() => {
    return [...places].sort((a, b) => {
      let scoreA = a.stato_iniziale?.punteggio_spotter || 80;
      let scoreB = b.stato_iniziale?.punteggio_spotter || 80;

      if (a.social_source_link || a.video_attachment) scoreA += 10;
      if (b.social_source_link || b.video_attachment) scoreB += 10;

      const visitedA = Boolean(a.stato_iniziale?.visitato || a.visited);
      const visitedB = Boolean(b.stato_iniziale?.visitato || b.visited);
      if (visitedA) scoreA -= 25;
      if (visitedB) scoreB -= 25;

      return scoreB - scoreA;
    });
  }, [places]);

  // Filtered Places
  const filteredPlaces = useMemo(() => {
    const baseList = specialFilter === "experience_based" ? experienceRecommendedPlaces : places;

    return baseList.filter((place) => {
      const placeName = (place.nome || place.nome_luogo || "").toLowerCase();
      const placeLoc = (place.citta_o_zona || "").toLowerCase();
      const placeCat = (place.categoria || "").toLowerCase();
      const isVisited = Boolean(place.stato_iniziale?.visitato || place.visited);

      // 1. Activity filter
      if (activeActivity !== "tutti") {
        const filterDef = ACTIVITY_FILTERS.find((f) => f.key === activeActivity);
        if (filterDef) {
          const target = filterDef.categoryName.toLowerCase();
          const match =
            placeCat.includes(target) ||
            (activeActivity === "giro_auto" && (placeCat.includes("pass") || placeCat.includes("auto")));
          if (!match) return false;
        }
      }

      // 2. Special filter
      if (specialFilter === "top_recommended") {
        if (!place.stato_iniziale?.consigliato_algoritmo) return false;
      } else if (specialFilter === "visited") {
        if (!isVisited) return false;
      } else if (specialFilter === "to_visit") {
        if (isVisited) return false;
      } else if (specialFilter === "with_video") {
        if (!place.video_attachment && !place.social_source_link) return false;
      }

      // 3. Custom List filter
      if (activeListId && !place.list_ids?.includes(activeListId)) {
        return false;
      }

      // 4. Country, Region and Province Filter
      if (!doesPlaceMatchCountryRegionAndProvince(place, activeCountry, activeRegion, activeProvince)) {
        return false;
      }

      // 5. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = placeName.includes(q);
        const matchLoc = placeLoc.includes(q);
        const matchCat = placeCat.includes(q);
        const matchSummary = (place.riassunto_ai_minimal || "").toLowerCase().includes(q);
        const matchTags = place.tag?.some((t) => t.toLowerCase().includes(q));
        const matchCountry = (place.paese || "").toLowerCase().includes(q);
        return matchName || matchLoc || matchCat || matchSummary || matchTags || matchCountry;
      }

      return true;
    });
  }, [places, activeActivity, specialFilter, activeCountry, activeRegion, activeProvince, activeListId, searchQuery, experienceRecommendedPlaces]);

  // Actions wired to Cloud Firestore
  const handleUpdatePlace = async (updated: SavedPlace) => {
    await savePlace(updated);
    setDetailPlace(updated);
    if (mapSelectedPlace?.id === updated.id) {
      setMapSelectedPlace(updated);
    }
  };

  const handleDeletePlaceWithCleanup = async (id: string) => {
    await handleDeletePlace(id);
    if (mapSelectedPlace?.id === id) {
      setMapSelectedPlace(null);
    }
    if (detailPlace?.id === id) {
      setDetailPlace(null);
    }
  };

  const handleSavePlace = async (newPlace: SavedPlace) => {
    await savePlace(newPlace);
    setMapSelectedPlace(newPlace);
    setActiveDockTab("map");
    setIsExtractorOpen(false);
  };

  const handleToggleListAssignment = async (placeId: string, listId: string) => {
    const target = places.find((p) => p.id === placeId);
    if (!target) return;
    const currentLists = target.list_ids || [];
    const hasList = currentLists.includes(listId);
    const updatedLists = hasList
      ? currentLists.filter((id) => id !== listId)
      : [...currentLists, listId];

    await savePlace({
      ...target,
      list_ids: updatedLists,
    });
  };

  return (
    <div className="relative w-full h-[100dvh] overflow-hidden bg-slate-950 font-sans select-none">
      {/* 1. MAP-FIRST FULLSCREEN SATELLITE MAP */}
      <MapView
        places={filteredPlaces}
        selectedPlace={mapSelectedPlace}
        onSelectPlace={(p) => {
          setMapSelectedPlace(p);
          setIsSearchFilterOpen(false);
        }}
        activeFilterKey={activeActivity}
        isFullScreen={true}
      />

      {/* 2. EXTENDED FLOATING SEARCH BAR & USER ACCOUNT (Top Pill) */}
      <div className="absolute top-4 left-3 right-3 sm:left-4 sm:right-4 max-w-3xl mx-auto z-20 pointer-events-auto flex items-center gap-2">
        <div className="flex-1 flex items-center gap-2 p-1.5 bg-white/95 backdrop-blur-2xl border border-slate-200/90 rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.12)]">
          <div className="relative flex-1 flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
            <input
              id="input-main-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cerca passi, trekking o città..."
              className="w-full pl-9 pr-7 py-1.5 rounded-full bg-transparent text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 p-1 text-slate-400 hover:text-slate-700 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Quick Filter toggle pill */}
          <button
            id="btn-spotter-filters"
            type="button"
            onClick={() => setIsSearchFilterOpen(!isSearchFilterOpen)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
              activeActivity !== "tutti" || specialFilter !== "all" || activeCountry !== "tutti" || activeRegion !== "tutte" || activeProvince !== "tutte"
                ? "bg-slate-900 text-white"
                : "bg-slate-100 hover:bg-slate-200 text-slate-700"
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Filtri</span>
          </button>
        </div>

        {/* User Account Google Sign-in / Profile Button */}
        <UserAccountButton />
      </div>

      {/* 3. SEARCH & QUICK FILTERS OVERLAY (When tapped) */}
      <SearchFilterOverlay
        isOpen={isSearchFilterOpen}
        onClose={() => setIsSearchFilterOpen(false)}
        allPlaces={places}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeActivity={activeActivity}
        onSelectActivity={setActiveActivity}
        specialFilter={specialFilter}
        onSelectSpecialFilter={setSpecialFilter}
        activeCountry={activeCountry}
        onSelectCountry={handleSelectCountry}
        activeRegion={activeRegion}
        onSelectRegion={handleSelectRegion}
        activeProvince={activeProvince}
        onSelectProvince={handleSelectProvince}
        totalFiltered={filteredPlaces.length}
      />

      {/* 4. SCHEDA LUOGO MINIMAL - LIVELLO 1 (Anteprima Compatta Fluttuante) */}
      <AnimatePresence>
        {mapSelectedPlace && activeDockTab === "map" && (
          <motion.div 
            key={mapSelectedPlace.id}
            initial={{ opacity: 0, y: 36, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ type: "spring", damping: 28, stiffness: 350 }}
            className="fixed bottom-22 left-3 right-3 sm:left-4 sm:right-auto sm:w-[420px] z-20 pointer-events-none"
          >
            <FloatingPlaceCard
              place={mapSelectedPlace}
              onClose={() => setMapSelectedPlace(null)}
              onOpenDetails={(p) => setDetailPlace(p)}
              onToggleVisited={handleToggleVisited}
              onDeletePlace={handleDeletePlaceWithCleanup}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 5. VISTA ELEGANTE: I MIEI LUOGHI (🔖) */}
      <SavedPlacesDrawer
        isOpen={activeDockTab === "places"}
        onClose={() => setActiveDockTab("map")}
        places={filteredPlaces}
        allPlaces={places}
        selectedPlace={mapSelectedPlace}
        onSelectPlace={(p) => {
          setMapSelectedPlace(p);
          setActiveDockTab("map");
        }}
        onOpenDetails={(p) => setDetailPlace(p)}
        onToggleVisited={handleToggleVisited}
        onDeletePlace={handleDeletePlaceWithCleanup}
        onOpenAddPlace={() => setIsExtractorOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeActivity={activeActivity}
        onSelectActivity={setActiveActivity}
        specialFilter={specialFilter}
        onSelectSpecialFilter={setSpecialFilter}
        activeCountry={activeCountry}
        onSelectCountry={handleSelectCountry}
        activeRegion={activeRegion}
        onSelectRegion={handleSelectRegion}
        activeProvince={activeProvince}
        onSelectProvince={handleSelectProvince}
      />

      {/* 6. DOCK DI NAVIGAZIONE IN BASSO (3 SEZIONI: 🗺️ Mappa, (+) Centrale, 🔖 I Miei Luoghi) */}
      <SpotterBottomDock
        activeTab={activeDockTab}
        onSelectTab={(tab) => {
          setActiveDockTab(tab);
          if (tab === "places") {
            setMapSelectedPlace(null);
          }
        }}
        onOpenAddModal={() => setIsExtractorOpen(true)}
        savedPlacesCount={places.length}
      />

      {/* 7. SCHEDA LUOGO MINIMAL - LIVELLO 2 (Espanso al Tap: Modifica, Note, Foto, Maps) */}
      <PlaceDetailModal
        place={activeDetailPlace}
        lists={lists}
        onClose={() => setDetailPlace(null)}
        onCenterOnMap={(p) => {
          setMapSelectedPlace(p);
          setDetailPlace(null);
          setActiveDockTab("map");
        }}
        onToggleVisited={handleToggleVisited}
        onToggleListAssignment={handleToggleListAssignment}
        onUpdatePlace={handleUpdatePlace}
        onDeletePlace={handleDeletePlaceWithCleanup}
      />

      {/* 8. MODALE INSERIMENTO SPOT */}
      <AiExtractorModal
        isOpen={isExtractorOpen}
        lists={lists}
        onClose={() => setIsExtractorOpen(false)}
        onSavePlace={handleSavePlace}
      />

      {/* 9. MODALI ACCOUNT, IMPOSTAZIONI & FEEDBACK */}
      <AuthModal />
      <SettingsModal places={places} />
      <FeedbackModal />
    </div>
  );
}
