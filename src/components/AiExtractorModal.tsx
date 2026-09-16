import React, { useState, useEffect, useRef } from "react";
import { 
  X, 
  MapPin, 
  Clock, 
  Search, 
  CheckCircle2, 
  Mountain, 
  Camera, 
  Upload, 
  Video, 
  Play, 
  Plus, 
  Image as ImageIcon, 
  Trash2, 
  Loader2, 
  Check, 
  Sparkles, 
  Compass,
  Tag,
  Globe
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { SavedPlace, CustomList, VideoAttachment } from "../types";
import { TAXONOMIA_360, getActivityIcon, getActivityColor } from "../data/categories";
import { compressImageFile } from "../lib/imageCompressor";
import { 
  detectPlaceRegionsAndProvinces, 
  getCountryFlag, 
  normalizeCountryName,
  KNOWN_COUNTRIES 
} from "../lib/geoItaly";

interface AiExtractorModalProps {
  isOpen: boolean;
  lists?: CustomList[];
  onClose: () => void;
  onSavePlace: (place: SavedPlace) => void;
}

interface LocationSuggestion {
  name: string;
  lat: number;
  lng: number;
  displayName: string;
  city: string;
  country?: string;
}

export const AiExtractorModal: React.FC<AiExtractorModalProps> = ({
  isOpen,
  onClose,
  onSavePlace,
}) => {
  // --- FORM STATE ---
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<string>("Italia");
  
  // Category default: "Seleziona" as requested
  const [category, setCategory] = useState("Seleziona");
  const [contextTag, setContextTag] = useState("");
  const [entityType, setEntityType] = useState<"PUNTO" | "PERCORSO">("PUNTO");
  
  // Background coordinates (no raw lat/lng exposed to the user)
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  
  // Notes & details
  const [notes, setNotes] = useState("");
  const [duration, setDuration] = useState("90");
  const [moment, setMoment] = useState("Mattina");
  const [visited, setVisited] = useState(false);

  // Address search suggestions for quick auto-complete
  const [searchLocationQuery, setSearchLocationQuery] = useState("");
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const [locationSuggestions, setLocationSuggestions] = useState<LocationSuggestion[]>([]);
  const [showLocationSearch, setShowLocationSearch] = useState(false);
  const [isLocatingUser, setIsLocatingUser] = useState(false);

  // Media (Photos & Video)
  const [attachedPhotos, setAttachedPhotos] = useState<string[]>([]);
  const [coverPhotoIndex, setCoverPhotoIndex] = useState<number>(0);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [showImageUrlField, setShowImageUrlField] = useState(false);

  const [videoLinkInput, setVideoLinkInput] = useState("");
  const [videoFileAttachment, setVideoFileAttachment] = useState<VideoAttachment | null>(null);
  const [showVideoField, setShowVideoField] = useState(false);

  // Status & Validation
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const photoInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setName("");
      setCity("");
      setSelectedCountry("Italia");
      setCategory("Seleziona");
      setContextTag("");
      setEntityType("PUNTO");
      setCoords(null);
      setNotes("");
      setDuration("90");
      setMoment("Mattina");
      setVisited(false);
      setSearchLocationQuery("");
      setLocationSuggestions([]);
      setShowLocationSearch(false);
      setIsLocatingUser(false);
      setAttachedPhotos([]);
      setCoverPhotoIndex(0);
      setImageUrlInput("");
      setShowImageUrlField(false);
      setVideoLinkInput("");
      setVideoFileAttachment(null);
      setShowVideoField(false);
      setError(null);
      setIsSaving(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Selected category metadata
  const selectedTaxonomy = TAXONOMIA_360.find((t) => t.nome === category);

  // --- PHOTOS HANDLING ---
  const handlePhotoFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingPhoto(true);
    try {
      const newPhotos: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.type.startsWith("image/")) {
          const compressed = await compressImageFile(file, 1200, 0.82);
          newPhotos.push(compressed);
        }
      }
      setAttachedPhotos((prev) => [...prev, ...newPhotos]);
    } catch (err) {
      console.error("Errore compressione foto:", err);
    } finally {
      setIsUploadingPhoto(false);
      if (photoInputRef.current) photoInputRef.current.value = "";
    }
  };

  const handleAddImageUrl = () => {
    const url = imageUrlInput.trim();
    if (!url) return;
    setAttachedPhotos((prev) => [...prev, url]);
    setImageUrlInput("");
    setShowImageUrlField(false);
  };

  const handleRemovePhoto = (index: number) => {
    setAttachedPhotos((prev) => prev.filter((_, i) => i !== index));
    if (coverPhotoIndex >= index && coverPhotoIndex > 0) {
      setCoverPhotoIndex(coverPhotoIndex - 1);
    }
  };

  // --- VIDEO HANDLING ---
  const handleVideoFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    const url = URL.createObjectURL(file);
    setVideoFileAttachment({
      id: `vid_${Date.now()}`,
      url,
      sourceType: "file",
      title: file.name,
    });
  };

  // --- LOCATION SEARCH (NOMINATIM AUTOCOMPLETE) ---
  const handleSearchLocation = async (query: string) => {
    setSearchLocationQuery(query);
    if (!query || query.trim().length < 3) {
      setLocationSuggestions([]);
      return;
    }
    setIsSearchingLocation(true);
    try {
      const endpoint = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        query
      )}&limit=5&addressdetails=1`;
      const res = await fetch(endpoint, {
        headers: { "Accept-Language": "it,en", "User-Agent": "PinnaApp/2.0" },
      });
      if (res.ok) {
        const data = await res.json();
        const suggestions: LocationSuggestion[] = data.map((item: any) => {
          const locCountry = item.address?.country || "Italia";
          const locCity = item.address?.city || 
                          item.address?.town || 
                          item.address?.village || 
                          item.address?.county || 
                          item.address?.state || 
                          locCountry;
          return {
            name: item.name || query,
            lat: parseFloat(item.lat),
            lng: parseFloat(item.lon),
            displayName: item.display_name,
            city: locCity,
            country: locCountry,
          };
        });
        setLocationSuggestions(suggestions);
      }
    } catch {
      // Ignore network errors
    } finally {
      setIsSearchingLocation(false);
    }
  };

  const handleSelectLocation = (sug: LocationSuggestion) => {
    if (!name.trim()) {
      setName(sug.name);
    }
    setCity(sug.city);
    if (sug.country) {
      setSelectedCountry(normalizeCountryName(sug.country));
    }
    setCoords({ lat: sug.lat, lng: sug.lng });
    setLocationSuggestions([]);
    setSearchLocationQuery("");
    setShowLocationSearch(false);
  };

  // --- GET CURRENT LOCATION VIA BROWSER GPS ---
  const handleDetectCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocalizzazione non supportata dal tuo browser.");
      return;
    }
    setIsLocatingUser(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const userLat = pos.coords.latitude;
        const userLng = pos.coords.longitude;
        setCoords({ lat: userLat, lng: userLng });

        // Reverse geocode to get a readable city name
        try {
          const revRes = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${userLat}&lon=${userLng}&zoom=14&addressdetails=1`,
            { headers: { "Accept-Language": "it,en", "User-Agent": "PinnaApp/2.0" } }
          );
          if (revRes.ok) {
            const data = await revRes.json();
            const foundCity = data.address?.city || data.address?.town || data.address?.village || data.address?.county || "Posizione Attuale";
            if (!city.trim()) {
              setCity(foundCity);
            }
          }
        } catch {
          if (!city.trim()) setCity("Posizione Rilevata");
        } finally {
          setIsLocatingUser(false);
        }
      },
      (err) => {
        setIsLocatingUser(false);
        setError("Impossibile rilevare la posizione attuale: " + err.message);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // --- RESOLVE COORDINATES IN BACKGROUND IF NOT SET ---
  const resolveCoordinates = async (placeName: string, placeCity: string): Promise<{ lat: number; lng: number }> => {
    if (coords) return coords;

    const query = `${placeName} ${placeCity}`.trim();
    if (query.length >= 2) {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`,
          { headers: { "Accept-Language": "it,en", "User-Agent": "PinnaApp/2.0" } }
        );
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            const lat = parseFloat(data[0].lat);
            const lng = parseFloat(data[0].lon);
            if (!isNaN(lat) && !isNaN(lng)) {
              return { lat, lng };
            }
          }
        }
      } catch {
        // Fallback
      }
    }

    // Default Italy coordinates
    return { lat: 45.4642, lng: 9.1900 };
  };

  // --- SUBMIT SPOT ---
  const handleSave = async () => {
    setError(null);
    const cleanName = name.trim();
    if (!cleanName) {
      setError("Inserisci il nome del luogo o dello spot.");
      return;
    }

    if (!category || category === "Seleziona") {
      setError("Seleziona una categoria per questo spot.");
      return;
    }

    setIsSaving(true);
    try {
      const finalCoords = await resolveCoordinates(cleanName, city.trim());
      const generatedId = `spot_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
      const isRoute = entityType === "PERCORSO";
      const cleanCity = city.trim() || "Italia";
      const effectiveTag = contextTag.trim() || undefined;

      // Default cover image based on category or photos
      const defaultCover = attachedPhotos.length > 0
        ? attachedPhotos[coverPhotoIndex]
        : getDefaultCover(category);

      // Route waypoints (array of objects, no nested arrays)
      let routeCoords: { lat: number; lng: number }[] | undefined = undefined;
      if (isRoute) {
        routeCoords = generateRoutePoints(finalCoords.lat, finalCoords.lng);
      }

      const quickBadges = [category];
      if (effectiveTag) quickBadges.push(effectiveTag);

      // Detect Region, Province & Country from location text
      const detectedGeo = detectPlaceRegionsAndProvinces({
        paese: selectedCountry,
        citta_o_zona: cleanCity,
        nome: cleanName,
        query_google_maps: `${cleanName} ${cleanCity}`,
        coordinate: finalCoords,
      });

      const place: SavedPlace = {
        id: generatedId,
        nome: cleanName,
        nome_luogo: cleanName,
        tipo_entita: entityType,
        categoria: category,
        categoria_principale: category as any,
        tag_contestuale: effectiveTag,
        badge_rapidi: quickBadges,
        confidenza_alta: true,
        query_search_maps: `${cleanName} ${cleanCity}`,
        sintesi: notes.trim() || `Spot salvato in ${category}${effectiveTag ? ` • ${effectiveTag}` : ""}.`,
        dettagli_algoritmo: {
          durata_minuti: parseInt(duration, 10) || 90,
          momento_ideale: moment,
          meteo_ideale: "Sereno",
        },
        paese: detectedGeo.primaryCountry,
        citta_o_zona: cleanCity,
        regione: detectedGeo.primaryRegion,
        provincia: detectedGeo.primaryProvince?.code || detectedGeo.primaryProvince?.name,
        query_google_maps: `${cleanName} ${cleanCity}`,
        coordinate: finalCoords,
        coordinate_percorso: routeCoords,
        geometria_percorso: routeCoords ? {
          tipo_tracciato: category.includes("Drive") ? "STRADA" : "SENTIERO",
          coordinate_linea: routeCoords,
        } : undefined,
        riassunto_ai_minimal: notes.trim() || `Spot salvato in ${category}.`,
        user_notes: notes.trim() || undefined,
        social_source_link: videoLinkInput.trim() || undefined,
        video_attachment: videoFileAttachment || undefined,
        user_photos: attachedPhotos.length > 0 ? attachedPhotos : undefined,
        dati_grafici: {
          cover_image_url: defaultCover,
          colore_badge_consigliato: getActivityColor(category),
          query_immagine_copertina: cleanName,
        },
        metadata_ai_nascosti: {
          durata_stimata_minuti: parseInt(duration, 10) || 90,
          momento_ideale: moment,
          meteo_consigliato: "Sereno",
          difficolta: "Facile",
        },
        stato_iniziale: {
          visitato: visited,
          valutazione_community: 5.0,
        },
        visited,
        list_ids: [],
        saved_at: new Date().toISOString(),
      };

      onSavePlace(place);
      onClose();
    } catch (err: any) {
      setError("Errore durante il salvataggio: " + (err.message || err));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <motion.div 
      id="spotter-modal-add"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/50 backdrop-blur-sm"
    >
      <div onClick={onClose} className="absolute inset-0" />

      <motion.div 
        initial={{ y: "100%", opacity: 0.8 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0 }}
        transition={{ type: "spring", stiffness: 380, damping: 32 }}
        className="relative w-full sm:max-w-lg max-h-[92vh] sm:max-h-[88vh] bg-white text-slate-900 rounded-t-3xl sm:rounded-3xl border border-slate-200 shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Header Bar */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-slate-900 text-white flex items-center justify-center text-xs font-black">
                +
              </span>
              <span>Aggiungi Nuovo Spot</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Inserisci i dettagli del luogo o del percorso da salvare
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">

          {/* Validation Alert */}
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center justify-between">
              <span>{error}</span>
              <button 
                type="button" 
                onClick={() => setError(null)}
                className="text-rose-500 hover:text-rose-800 ml-2"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* 1. Nome Spot */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
              <span>Nome dello Spot o Luogo *</span>
              <span className="text-[10px] text-slate-400 font-normal">Obbligatorio</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Es. Passo Giau, Rifugio Lagazuoi, Borgo di Civita..."
              className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 font-semibold text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all"
              autoFocus
            />
          </div>

          {/* 2. Città o Zona con pulsante Posizione o Ricerca */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800">
                Città o Zona
              </label>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowLocationSearch(!showLocationSearch)}
                  className="text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
                >
                  <Search className="w-3 h-3" />
                  <span>{showLocationSearch ? "Chiudi Cerca" : "Cerca Luogo"}</span>
                </button>

                <button
                  type="button"
                  onClick={handleDetectCurrentLocation}
                  disabled={isLocatingUser}
                  className="text-[11px] text-emerald-600 hover:text-emerald-800 font-semibold flex items-center gap-1 disabled:opacity-50"
                  title="Rileva dove ti trovi adesso"
                >
                  {isLocatingUser ? <Loader2 className="w-3 h-3 animate-spin" /> : <Compass className="w-3 h-3" />}
                  <span>Posizione Attuale</span>
                </button>
              </div>
            </div>

            {/* Optional quick search dropdown to auto-fill */}
            {showLocationSearch && (
              <div className="p-2.5 rounded-2xl bg-indigo-50/70 border border-indigo-100 space-y-2">
                <div className="relative">
                  <input
                    type="text"
                    value={searchLocationQuery}
                    onChange={(e) => handleSearchLocation(e.target.value)}
                    placeholder="Cerca su mappa: es. 'Cortina', 'Lago di Braies'..."
                    className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-white border border-indigo-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                  <Search className="w-3.5 h-3.5 text-indigo-500 absolute left-2.5 top-2" />
                  {isSearchingLocation && (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-500 absolute right-2.5 top-2" />
                  )}
                </div>

                {locationSuggestions.length > 0 && (
                  <div className="rounded-xl border border-indigo-100 divide-y divide-indigo-50 bg-white overflow-hidden max-h-36 overflow-y-auto shadow-xs">
                    {locationSuggestions.map((sug, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleSelectLocation(sug)}
                        className="w-full text-left p-2 hover:bg-indigo-50/70 flex items-start gap-2 text-xs transition-colors"
                      >
                        <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 truncate">{sug.name}</p>
                          <p className="text-[10px] text-slate-500 truncate">{sug.displayName}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <input
              type="text"
              value={city}
              onChange={(e) => {
                const val = e.target.value;
                setCity(val);
                const detected = detectPlaceRegionsAndProvinces({ citta_o_zona: val });
                if (detected.allCountries && detected.allCountries.length > 0 && detected.primaryCountry !== selectedCountry) {
                  setSelectedCountry(detected.primaryCountry);
                }
              }}
              placeholder="Es. Cortina d'Ampezzo (BL), Passo del Furka (Svizzera), Chamonix..."
              className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 font-medium text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all"
            />

            {/* Country Selector Quick Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1 pb-0.5">
              <span className="text-[10px] font-bold text-slate-400 shrink-0 uppercase tracking-wider flex items-center gap-1 mr-1">
                <Globe className="w-3 h-3 text-sky-500" />
                <span>Stato:</span>
              </span>
              {["Italia", "Svizzera", "Francia", "Austria", "Germania", "Slovenia", "Spagna", "Norvegia"].map((countryName) => {
                const isSel = selectedCountry.toLowerCase() === countryName.toLowerCase();
                return (
                  <button
                    key={countryName}
                    type="button"
                    onClick={() => setSelectedCountry(countryName)}
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold shrink-0 transition-all flex items-center gap-1 ${
                      isSel
                        ? "bg-slate-900 text-white shadow-xs"
                        : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                    }`}
                  >
                    <span>{getCountryFlag(countryName)}</span>
                    <span>{countryName}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Categoria (Default: "Seleziona") & Tipo Luogo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            
            {/* Categoria Dropdown */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                <span>Categoria *</span>
                {category !== "Seleziona" && (
                  <span 
                    className="text-[10px] font-bold px-1.5 py-0.2 rounded-md text-white"
                    style={{ backgroundColor: getActivityColor(category) }}
                  >
                    {category}
                  </span>
                )}
              </label>

              <select
                value={category}
                onChange={(e) => {
                  const newCat = e.target.value;
                  setCategory(newCat);
                  setContextTag("");
                }}
                className={`w-full px-3 py-2.5 rounded-2xl border text-xs font-bold transition-all focus:outline-none focus:ring-2 ${
                  category === "Seleziona"
                    ? "bg-amber-50/70 border-amber-300 text-amber-900 focus:ring-amber-500"
                    : "bg-slate-50 border-slate-200 text-slate-900 focus:ring-slate-900 focus:bg-white"
                }`}
              >
                <option value="Seleziona">-- Seleziona Categoria --</option>
                {TAXONOMIA_360.map((cat) => (
                  <option key={cat.nome} value={cat.nome}>
                    {cat.nome}
                  </option>
                ))}
              </select>
            </div>

            {/* Tipo di Località: Punto Singolo vs Percorso */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800">
                Tipologia Spot
              </label>
              <div className="grid grid-cols-2 gap-1.5 p-1 rounded-2xl bg-slate-100 border border-slate-200/80">
                <button
                  type="button"
                  onClick={() => setEntityType("PUNTO")}
                  className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    entityType === "PUNTO"
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5 text-rose-500" />
                  <span>Punto</span>
                </button>
                <button
                  type="button"
                  onClick={() => setEntityType("PERCORSO")}
                  className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    entityType === "PERCORSO"
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Mountain className="w-3.5 h-3.5 text-amber-600" />
                  <span>Percorso</span>
                </button>
              </div>
            </div>
          </div>

          {/* 4. Tag Contestuali (Pillole rapide quando la categoria è selezionata) */}
          {selectedTaxonomy && (
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                <Tag className="w-3 h-3 text-slate-500" />
                <span>Tag Specifico ({category})</span>
              </span>
              
              <div className="flex items-center gap-1.5 flex-wrap">
                {selectedTaxonomy.tagContestuali.map((tag) => {
                  const isSelected = contextTag === tag;
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setContextTag(isSelected ? "" : tag)}
                      className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold transition-all ${
                        isSelected
                          ? "bg-slate-900 text-white shadow-xs"
                          : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 5. Sezione Foto e Media */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-indigo-600" />
                <span>Foto del Luogo ({attachedPhotos.length})</span>
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowImageUrlField(!showImageUrlField)}
                  className="text-[11px] text-blue-600 hover:underline font-semibold"
                >
                  {showImageUrlField ? "Chiudi Link" : "+ Link Web"}
                </button>

                <button
                  type="button"
                  onClick={() => photoInputRef.current?.click()}
                  disabled={isUploadingPhoto}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 text-[11px] font-semibold transition-colors disabled:opacity-50"
                >
                  {isUploadingPhoto ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3 text-indigo-600" />}
                  <span>Carica Foto</span>
                </button>
              </div>
            </div>

            {showImageUrlField && (
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="url"
                  value={imageUrlInput}
                  onChange={(e) => setImageUrlInput(e.target.value)}
                  placeholder="Incolla URL immagine online..."
                  className="flex-1 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
                <button
                  type="button"
                  onClick={handleAddImageUrl}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold"
                >
                  Aggiungi
                </button>
              </div>
            )}

            {attachedPhotos.length > 0 ? (
              <div className="grid grid-cols-4 gap-2 pt-1">
                {attachedPhotos.map((photo, idx) => (
                  <div 
                    key={idx} 
                    className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                      coverPhotoIndex === idx ? "border-amber-500 shadow-xs" : "border-slate-200"
                    }`}
                  >
                    <img src={photo} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover" />
                    {coverPhotoIndex === idx && (
                      <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded-md bg-amber-500 text-white text-[8px] font-bold">
                        Copertina
                      </span>
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 flex items-center justify-center gap-1 transition-opacity">
                      {coverPhotoIndex !== idx && (
                        <button
                          type="button"
                          onClick={() => setCoverPhotoIndex(idx)}
                          className="p-1 rounded-md bg-white text-slate-900 text-[9px] font-bold"
                          title="Imposta come copertina"
                        >
                          ⭐
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemovePhoto(idx)}
                        className="p-1 rounded-md bg-rose-600 text-white text-[9px]"
                        title="Rimuovi foto"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div 
                onClick={() => photoInputRef.current?.click()}
                className="py-3 px-4 rounded-xl border border-dashed border-slate-300 hover:border-slate-400 bg-white/60 hover:bg-white flex items-center justify-center gap-2 text-slate-500 hover:text-slate-800 cursor-pointer transition-all text-xs"
              >
                <ImageIcon className="w-4 h-4 text-slate-400" />
                <span>Tocca per aggiungere foto dal tuo dispositivo o fotocamera</span>
              </div>
            )}
          </div>

          {/* 6. Video o Link Social (Facoltativo) */}
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
                <Video className="w-3.5 h-3.5 text-rose-500" />
                <span>Link Social o Video (Facoltativo)</span>
              </span>
              <button
                type="button"
                onClick={() => setShowVideoField(!showVideoField)}
                className="text-[11px] text-blue-600 hover:underline font-semibold"
              >
                {showVideoField ? "Nascondi" : "+ Aggiungi Link/Video"}
              </button>
            </div>

            {showVideoField && (
              <div className="space-y-2 pt-1">
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    value={videoLinkInput}
                    onChange={(e) => setVideoLinkInput(e.target.value)}
                    placeholder="Link Reel, TikTok o YouTube..."
                    className="flex-1 px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                  <button
                    type="button"
                    onClick={() => videoInputRef.current?.click()}
                    className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 font-semibold text-xs flex items-center gap-1"
                    title="Carica file video"
                  >
                    <Upload className="w-3 h-3 text-rose-500" />
                    <span>File</span>
                  </button>
                </div>

                {videoFileAttachment && (
                  <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-semibold">
                    <span className="flex items-center gap-1">
                      <Play className="w-3 h-3 text-emerald-600" />
                      <span>Video allegato: {videoFileAttachment.title}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setVideoFileAttachment(null)}
                      className="text-rose-600 hover:text-rose-800"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 7. Note Personali & Consigli */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800">
              Note Personali o Consigli
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Consigli pratici, orario migliore, dove parcheggiare o particolarità..."
              className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white resize-none transition-all"
            />
          </div>

          {/* 8. Dettagli Rapidi: Durata, Momento e Stato */}
          <div className="grid grid-cols-3 gap-2.5 pt-1">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-700 block">Durata (min)</label>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-700 block">Momento Ideale</label>
              <select
                value={moment}
                onChange={(e) => setMoment(e.target.value)}
                className="w-full px-2 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white"
              >
                <option value="Mattina presto">Mattina presto</option>
                <option value="Mattina">Mattina</option>
                <option value="Pranzo">Pranzo</option>
                <option value="Pomeriggio">Pomeriggio</option>
                <option value="Tramonto">Tramonto</option>
                <option value="Sera">Sera</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-700 block">Stato Spot</label>
              <button
                type="button"
                onClick={() => setVisited(!visited)}
                className={`w-full py-2 px-2 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1 border ${
                  visited 
                    ? "bg-emerald-50 border-emerald-200 text-emerald-700" 
                    : "bg-slate-50 border-slate-200 text-slate-600"
                }`}
              >
                {visited ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <Clock className="w-3 h-3 text-slate-400" />}
                <span>{visited ? "Visitato" : "Da fare"}</span>
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="w-full py-3.5 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 active:scale-98 transition-all disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Salvataggio...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 stroke-[2.5]" />
                  <span>Salva nei Miei Luoghi</span>
                </>
              )}
            </button>
          </div>

        </div>
      </motion.div>

      {/* Hidden File Pickers */}
      <input
        ref={photoInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handlePhotoFilesSelected}
        className="hidden"
      />
      <input
        ref={videoInputRef}
        type="file"
        accept="video/*"
        onChange={handleVideoFileSelected}
        className="hidden"
      />
    </motion.div>
  );
};

function getDefaultCover(cat: string): string {
  if (cat.includes("Culture")) return "https://images.unsplash.com/photo-1533105079780-92b9be482077?w=800&auto=format&fit=crop&q=80";
  if (cat.includes("Drive")) return "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&auto=format&fit=crop&q=80";
  if (cat.includes("Active")) return "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&auto=format&fit=crop&q=80";
  if (cat.includes("Food")) return "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80";
  if (cat.includes("Leisure")) return "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80";
  return "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80";
}

function generateRoutePoints(centerLat: number, centerLng: number): { lat: number; lng: number }[] {
  const points: { lat: number; lng: number }[] = [];
  const count = 7;
  for (let i = 0; i < count; i++) {
    const progress = (i - count / 2) * 0.005;
    const wave = Math.sin(i * 1.2) * 0.006;
    points.push({
      lat: Number((centerLat + progress).toFixed(5)),
      lng: Number((centerLng + wave).toFixed(5)),
    });
  }
  return points;
}
