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
  Globe,
  ExternalLink,
  Clipboard,
  Link2
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
import { 
  searchLocationsOnline, 
  parseGoogleMapsLinkOrCoords, 
  guessCategoryFromName,
  resolveGoogleMapsLinkOnline,
  ResolvedGoogleMapsPlace,
  GeoSearchResult 
} from "../lib/locationSearch";

interface AiExtractorModalProps {
  isOpen: boolean;
  lists?: CustomList[];
  initialSearchQuery?: string;
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
  initialSearchQuery,
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
  const [coordsSourceName, setCoordsSourceName] = useState<string | null>(null);
  
  // Notes & details
  const [notes, setNotes] = useState("");
  const [duration, setDuration] = useState("90");
  const [moment, setMoment] = useState("Mattina");
  const [visited, setVisited] = useState(false);

  // Address & Google Maps search suggestions
  const [searchLocationQuery, setSearchLocationQuery] = useState("");
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const [isResolvingMapsLink, setIsResolvingMapsLink] = useState(false);
  const [mapsResolvedNotice, setMapsResolvedNotice] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [locationSuggestions, setLocationSuggestions] = useState<GeoSearchResult[]>([]);
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

  // Reset form or trigger initial query when modal opens
  useEffect(() => {
    if (isOpen) {
      const initQ = initialSearchQuery?.trim() || "";
      setName(initQ);
      setCity("");
      setSelectedCountry("Italia");
      setCategory("Seleziona");
      setContextTag("");
      setEntityType("PUNTO");
      setCoords(null);
      setCoordsSourceName(null);
      setNotes("");
      setDuration("90");
      setMoment("Mattina");
      setVisited(false);
      setSearchLocationQuery(initQ);
      setLocationSuggestions([]);
      setHasSearched(false);
      setIsLocatingUser(false);
      setIsResolvingMapsLink(false);
      setMapsResolvedNotice(null);
      setAttachedPhotos([]);
      setCoverPhotoIndex(0);
      setImageUrlInput("");
      setShowImageUrlField(false);
      setVideoLinkInput("");
      setVideoFileAttachment(null);
      setShowVideoField(false);
      setError(null);
      setIsSaving(false);

      if (initQ) {
        handleSearchLocation(initQ);
      }
    }
  }, [isOpen, initialSearchQuery]);

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

  const isGoogleMapsLink = (str: string) => {
    return (
      str.includes("maps.app.goo.gl") ||
      str.includes("goo.gl/maps") ||
      str.includes("google.com/maps") ||
      str.includes("google.it/maps") ||
      str.includes("maps.google.")
    );
  };

  // --- GOOGLE MAPS RESOLVER & CLIPBOARD HANDLERS ---
  const handleResolveGoogleMapsLink = async (rawInput: string): Promise<boolean> => {
    const trimmed = rawInput.trim();
    if (!trimmed) return false;

    setIsResolvingMapsLink(true);
    setMapsResolvedNotice(null);
    setError(null);

    try {
      const resolved = await resolveGoogleMapsLinkOnline(trimmed);
      if (resolved && resolved.lat && resolved.lng) {
        setName(resolved.name);
        setCity(resolved.city);
        setSelectedCountry(normalizeCountryName(resolved.country));
        setCoords({ lat: resolved.lat, lng: resolved.lng });
        setCoordsSourceName(`Google Maps: ${resolved.name} • ${resolved.city}`);

        if (resolved.category && (category === "Seleziona" || !category)) {
          setCategory(resolved.category);
        }
        if (resolved.tag && !contextTag) {
          setContextTag(resolved.tag);
        }
        if (resolved.entityType) {
          setEntityType(resolved.entityType);
        }
        if (!videoLinkInput.trim()) {
          setVideoLinkInput(resolved.originalUrl);
        }

        setMapsResolvedNotice(`Trovato con successo: "${resolved.name}" (${resolved.city})`);
        setSearchLocationQuery(resolved.name);
        setLocationSuggestions([]);
        return true;
      } else {
        setError("Impossibile estrarre automaticamente il luogo dal link di Google Maps. Prova a inserire il nome o la località a mano.");
        return false;
      }
    } catch (err: any) {
      console.error("Errore risoluzione link Google Maps:", err);
      setError("Errore nella lettura del link Google Maps: " + (err?.message || ""));
      return false;
    } finally {
      setIsResolvingMapsLink(false);
    }
  };

  const handlePasteFromClipboard = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text && text.trim()) {
          const trimmed = text.trim();
          setSearchLocationQuery(trimmed);
          if (isGoogleMapsLink(trimmed)) {
            await handleResolveGoogleMapsLink(trimmed);
          } else {
            await handleSearchLocation(trimmed);
          }
          return;
        }
      }
    } catch {
      // ignore
    }

    const fallback = window.prompt("Incolla qui il link di Google Maps o l'indirizzo da cercare:");
    if (fallback && fallback.trim()) {
      const trimmed = fallback.trim();
      setSearchLocationQuery(trimmed);
      if (isGoogleMapsLink(trimmed)) {
        await handleResolveGoogleMapsLink(trimmed);
      } else {
        await handleSearchLocation(trimmed);
      }
    }
  };

  const handleNameChange = (val: string) => {
    if (isGoogleMapsLink(val)) {
      handleResolveGoogleMapsLink(val);
      return;
    }
    setName(val);
  };

  // --- INTELLIGENT LOCATION SEARCH (GOOGLE MAPS LINKS, PHOTON & NOMINATIM) ---
  const handleSearchLocation = async (query: string) => {
    setSearchLocationQuery(query);
    const trimmed = query.trim();
    if (!trimmed || trimmed.length < 2) {
      setLocationSuggestions([]);
      setHasSearched(false);
      return;
    }

    // Direct Google Maps link resolution
    if (isGoogleMapsLink(trimmed)) {
      const resolvedOk = await handleResolveGoogleMapsLink(trimmed);
      if (resolvedOk) return;
    }

    setIsSearchingLocation(true);
    setHasSearched(true);
    try {
      // Check if user directly pasted a Google Maps link or raw coordinates
      const parsed = parseGoogleMapsLinkOrCoords(trimmed);
      if (parsed.lat !== undefined && parsed.lng !== undefined) {
        setCoords({ lat: parsed.lat, lng: parsed.lng });
        setCoordsSourceName(`Google Maps / GPS (${parsed.lat.toFixed(4)}, ${parsed.lng.toFixed(4)})`);
        if (parsed.extractedQuery && !name.trim()) {
          setName(parsed.extractedQuery);
        }
      }

      const suggestions = await searchLocationsOnline(trimmed);
      setLocationSuggestions(suggestions);

      // Auto-apply if it was an exact single coordinate match or Google Maps verified
      if (suggestions.length === 1 && (suggestions[0].source === "coordinates" || suggestions[0].source === "google_maps")) {
        handleSelectLocation(suggestions[0]);
      }
    } catch {
      // Silent catch
    } finally {
      setIsSearchingLocation(false);
    }
  };

  const handleSelectLocation = (sug: GeoSearchResult) => {
    if (!name.trim() || name === searchLocationQuery) {
      setName(sug.name);
    }
    if (sug.city) {
      setCity(sug.city);
    }
    if (sug.country) {
      setSelectedCountry(normalizeCountryName(sug.country));
    }
    setCoords({ lat: sug.lat, lng: sug.lng });
    setCoordsSourceName(sug.displayName);

    // Auto-suggest category if still not selected
    if ((category === "Seleziona" || !category) && sug.categoryGuess) {
      setCategory(sug.categoryGuess);
    }

    setLocationSuggestions([]);
    setSearchLocationQuery(sug.name);
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
        setCoordsSourceName(`Posizione GPS attuale (${userLat.toFixed(4)}, ${userLng.toFixed(4)})`);

        // Reverse geocode to get a readable city name
        try {
          const revRes = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${userLat}&lon=${userLng}&zoom=14&addressdetails=1`,
            { headers: { "Accept-Language": "it,en" } }
          );
          if (revRes.ok) {
            const data = await revRes.json();
            const foundCity = data.address?.city || data.address?.town || data.address?.village || data.address?.county || "Posizione Attuale";
            const foundCountry = data.address?.country || "Italia";
            if (!city.trim()) {
              setCity(foundCity);
            }
            setSelectedCountry(normalizeCountryName(foundCountry));
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

  // --- RESOLVE COORDINATES WITH MULTI-PROVIDER FALLBACK IF NOT PRE-SET ---
  const resolveCoordinates = async (placeName: string, placeCity: string): Promise<{ lat: number; lng: number }> => {
    if (coords) return coords;

    // 1. Try combined place name + city
    const query = `${placeName} ${placeCity}`.trim();
    if (query.length >= 2) {
      try {
        const results = await searchLocationsOnline(query);
        if (results.length > 0 && results[0].lat && results[0].lng) {
          return { lat: results[0].lat, lng: results[0].lng };
        }
      } catch {
        // Continue
      }
    }

    // 2. Try place name alone
    if (placeName.trim().length >= 2) {
      try {
        const results = await searchLocationsOnline(placeName.trim());
        if (results.length > 0 && results[0].lat && results[0].lng) {
          return { lat: results[0].lat, lng: results[0].lng };
        }
      } catch {
        // Continue
      }
    }

    // Default Alps / Italy coordinates if completely unresolvable
    return { lat: 46.5287, lng: 10.4533 };
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

          {/* 1. RICERCA RAPIDA INTELLIGENTE & GOOGLE MAPS */}
          <div className="p-3.5 rounded-2xl bg-indigo-50/60 border border-indigo-100 space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <label className="text-xs font-bold text-indigo-950 flex items-center gap-1.5 truncate">
                <Search className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span className="truncate">Cerca Luogo o Incolla Link Maps</span>
              </label>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={handlePasteFromClipboard}
                  disabled={isResolvingMapsLink}
                  className="text-[11px] text-indigo-700 hover:text-indigo-900 bg-indigo-100/70 hover:bg-indigo-200/80 border border-indigo-200 px-2 py-0.5 rounded-lg font-semibold flex items-center gap-1 transition-all disabled:opacity-50"
                  title="Incolla link o testo copiato da Google Maps"
                >
                  <Clipboard className="w-3 h-3 text-indigo-600" />
                  <span>Incolla Link</span>
                </button>

                <button
                  type="button"
                  onClick={handleDetectCurrentLocation}
                  disabled={isLocatingUser || isResolvingMapsLink}
                  className="text-[11px] text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 px-2 py-0.5 rounded-lg font-semibold flex items-center gap-1 transition-all disabled:opacity-50"
                  title="Rileva dove ti trovi adesso con il GPS"
                >
                  {isLocatingUser ? <Loader2 className="w-3 h-3 animate-spin text-emerald-600" /> : <Compass className="w-3 h-3 text-emerald-600" />}
                  <span>GPS Attuale</span>
                </button>
              </div>
            </div>

            {/* Resolving feedback banner */}
            {isResolvingMapsLink && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold shadow-sm animate-pulse">
                <Loader2 className="w-4 h-4 animate-spin text-white shrink-0" />
                <span className="truncate">Risoluzione link Google Maps condiviso in corso...</span>
              </div>
            )}

            {/* Resolved confirmation banner */}
            {mapsResolvedNotice && !isResolvingMapsLink && (
              <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold shadow-sm">
                <div className="flex items-center gap-2 truncate">
                  <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
                  <span className="truncate">{mapsResolvedNotice}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setMapsResolvedNotice(null)}
                  className="text-emerald-200 hover:text-white ml-2 text-xs"
                >
                  ✕
                </button>
              </div>
            )}

            <div className="relative">
              <input
                type="text"
                value={searchLocationQuery}
                onChange={(e) => handleSearchLocation(e.target.value)}
                placeholder="Es. 'Passo Giau', 'Chamonix', o incolla 'https://maps.app.goo.gl/...'"
                className="w-full pl-9 pr-9 py-2 rounded-xl bg-white border border-indigo-200 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 shadow-xs"
              />
              <Search className="w-4 h-4 text-indigo-400 absolute left-3 top-2.5 pointer-events-none" />
              {(isSearchingLocation || isResolvingMapsLink) && (
                <Loader2 className="w-4 h-4 animate-spin text-indigo-600 absolute right-3 top-2.5" />
              )}
              {searchLocationQuery && !isSearchingLocation && !isResolvingMapsLink && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchLocationQuery("");
                    setLocationSuggestions([]);
                    setHasSearched(false);
                    setMapsResolvedNotice(null);
                  }}
                  className="absolute right-2.5 top-2 p-0.5 text-slate-400 hover:text-slate-600 text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Suggestions Dropdown */}
            {locationSuggestions.length > 0 && (
              <div className="rounded-xl border border-indigo-200 divide-y divide-indigo-50 bg-white overflow-hidden max-h-48 overflow-y-auto shadow-lg">
                {locationSuggestions.map((sug, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleSelectLocation(sug)}
                    className="w-full text-left p-2.5 hover:bg-indigo-50/80 flex items-start gap-2.5 text-xs transition-colors group"
                  >
                    <span className="text-base shrink-0 leading-none mt-0.5">
                      {sug.countryFlag || "📍"}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <p className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                          {sug.name}
                        </p>
                        <div className="flex items-center gap-1 shrink-0">
                          {sug.source === "google_maps" && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold shrink-0">
                              Google Maps 📍
                            </span>
                          )}
                          {sug.categoryGuess && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 shrink-0 font-medium">
                              {sug.categoryGuess}
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-[10px] text-slate-500 truncate mt-0.5">
                        {sug.city ? `${sug.city}, ` : ""}{sug.country}
                        {sug.lat && sug.lng ? ` • (${sug.lat.toFixed(3)}, ${sug.lng.toFixed(3)})` : ""}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Fallback Google Maps Prompt when no results found */}
            {hasSearched && !isSearchingLocation && locationSuggestions.length === 0 && searchLocationQuery.trim().length >= 2 && !coords && (
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/90 text-amber-900 space-y-2 shadow-xs">
                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-xl bg-amber-500/20 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
                    📍
                  </div>
                  <div className="text-xs space-y-1">
                    <p className="font-bold text-slate-900">
                      Nessun risultato diretto trovato per "{searchLocationQuery}"
                    </p>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Puoi cercarlo direttamente su <strong>Google Maps</strong>, copiare il link o condividere l'indirizzo per incollarlo qui sopra (riconosce link brevi <code className="bg-amber-100/70 px-1 rounded">maps.app.goo.gl</code> e coordinate GPS).
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(searchLocationQuery)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-colors"
                  >
                    <span>Cerca "{searchLocationQuery}" su Google Maps</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            )}

            {/* Coordinates Status Confirmation Badge */}
            {coords && (
              <div className="flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-800">
                <div className="flex items-center gap-1.5 truncate">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="font-semibold truncate">
                    {coordsSourceName || `GPS: ${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`}
                  </span>
                </div>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${coords.lat},${coords.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-700 hover:text-emerald-900 font-bold shrink-0 underline ml-2"
                >
                  Verifica su Maps ↗
                </a>
              </div>
            )}
          </div>

          {/* 2. Nome Spot */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
              <span>Nome dello Spot o Luogo *</span>
              <span className="text-[10px] text-slate-400 font-normal">Obbligatorio</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Es. Passo Giau, Rifugio Lagazuoi, Borgo di Civita..."
              className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 font-semibold text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all"
            />
          </div>

          {/* 3. Città o Zona & Paese */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800">
              Città o Zona
            </label>
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
  const c = (cat || "").toLowerCase();
  if (c.includes("cultur") || c.includes("stori") || c.includes("borgh") || c.includes("muse") || c.includes("monument")) {
    return "https://images.unsplash.com/photo-1533105079780-92b9be482077?w=800&auto=format&fit=crop&q=80";
  }
  if (c.includes("guida") || c.includes("panoram") || c.includes("pass") || c.includes("auto") || c.includes("strad")) {
    return "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&auto=format&fit=crop&q=80";
  }
  if (c.includes("sport") || c.includes("trek") || c.includes("sentier") || c.includes("sci") || c.includes("arrampicat")) {
    return "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&auto=format&fit=crop&q=80";
  }
  if (c.includes("cibo") || c.includes("sapor") || c.includes("ristoran") || c.includes("trattor") || c.includes("food")) {
    return "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80";
  }
  if (c.includes("svago") || c.includes("citt") || c.includes("piazz") || c.includes("leisure") || c.includes("social")) {
    return "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80";
  }
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
