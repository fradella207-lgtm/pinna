import React, { useState, useEffect, useRef } from "react";
import { 
  X, 
  Sparkles, 
  Loader2, 
  Check, 
  MapPin, 
  Clock, 
  Sun, 
  Link as LinkIcon, 
  Search,
  CheckCircle2,
  Mountain,
  Compass,
  FileText,
  RotateCcw,
  ClipboardPaste,
  Trash2,
  Navigation,
  Camera,
  Upload,
  Video,
  Play,
  Plus,
  Image as ImageIcon,
  Edit3,
  SlidersHorizontal,
  Star
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { SavedPlace, CustomList, ExtractionResult, VideoAttachment } from "../types";
import { ACTIVITY_FILTERS, getActivityIcon, getActivityColor } from "../data/categories";
import { compressImageFile } from "../lib/imageCompressor";

interface AiExtractorModalProps {
  isOpen: boolean;
  lists: CustomList[];
  onClose: () => void;
  onSavePlace: (place: SavedPlace) => void;
}

interface LocationSuggestion {
  name: string;
  lat: number;
  lng: number;
  displayName: string;
  city: string;
}

export const AiExtractorModal: React.FC<AiExtractorModalProps> = ({
  isOpen,
  onClose,
  onSavePlace,
}) => {
  // Primary Mode: "automatic" (AI/Reel) vs "manual" (Normale/Manuale)
  const [activeTab, setActiveTab] = useState<"automatic" | "manual">("automatic");

  // --- AUTOMATIC (AI / REEL) STATE ---
  const [reelInput, setReelInput] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [extractedPlace, setExtractedPlace] = useState<SavedPlace | null>(null);

  // --- COMMON MEDIA STATE (PHOTOS & VIDEO UPLOADED RIGHT AWAY) ---
  const [attachedPhotos, setAttachedPhotos] = useState<string[]>([]);
  const [coverPhotoIndex, setCoverPhotoIndex] = useState<number>(0);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [showImageUrlField, setShowImageUrlField] = useState(false);

  // Video attachment state
  const [videoLinkInput, setVideoLinkInput] = useState("");
  const [videoFileAttachment, setVideoFileAttachment] = useState<VideoAttachment | null>(null);

  // --- MANUAL MODE FORM STATE ---
  const [manualName, setManualName] = useState("");
  const [manualCity, setManualCity] = useState("");
  const [manualCategory, setManualCategory] = useState("Passi di Montagna");
  const [manualEntityType, setManualEntityType] = useState<"PUNTO" | "PERCORSO">("PUNTO");
  const [manualLat, setManualLat] = useState<string>("46.5292");
  const [manualLng, setManualLng] = useState<string>("10.4533");
  const [manualNotes, setManualNotes] = useState("");
  const [manualDuration, setManualDuration] = useState("90");
  const [manualMoment, setManualMoment] = useState("Mattina");
  const [manualWeather, setManualWeather] = useState("Soleggiato");
  const [manualVisited, setManualVisited] = useState(false);
  const [isGettingGps, setIsGettingGps] = useState(false);

  // Search Address suggestions
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const [locationSuggestions, setLocationSuggestions] = useState<LocationSuggestion[]>([]);

  // Refs for file inputs
  const photoInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveTab("automatic");
      setReelInput("");
      setIsAiLoading(false);
      setLoadingStep("");
      setError(null);
      setExtractedPlace(null);
      setAttachedPhotos([]);
      setCoverPhotoIndex(0);
      setImageUrlInput("");
      setShowImageUrlField(false);
      setVideoLinkInput("");
      setVideoFileAttachment(null);
      
      // Reset manual
      setManualName("");
      setManualCity("");
      setManualCategory("Passi di Montagna");
      setManualEntityType("PUNTO");
      setManualLat("46.5292");
      setManualLng("10.4533");
      setManualNotes("");
      setManualDuration("90");
      setManualMoment("Mattina");
      setManualWeather("Soleggiato");
      setManualVisited(false);
      setLocationSuggestions([]);
      setSearchQuery("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // --- PHOTO HANDLING ---
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
      console.error("Errore compressione immagine:", err);
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

  // --- VIDEO FILE HANDLING ---
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

  // --- CLIPBOARD PASTE ---
  const handlePasteFromClipboard = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text && text.trim()) {
          setReelInput(text.trim());
          setError(null);
        }
      }
    } catch {
      // Ignore clipboard permission errors
    }
  };

  // --- GET CURRENT GPS ---
  const handleGetCurrentGps = () => {
    if (!navigator.geolocation) {
      setError("Geolocalizzazione non supportata dal browser");
      return;
    }
    setIsGettingGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setManualLat(pos.coords.latitude.toFixed(5));
        setManualLng(pos.coords.longitude.toFixed(5));
        setIsGettingGps(false);
      },
      (err) => {
        setIsGettingGps(false);
        setError("Impossibile recuperare posizione GPS: " + err.message);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // --- ADDRESS SEARCH (NOMINATIM) ---
  const handleSearchLocation = async (q: string) => {
    setSearchQuery(q);
    if (!q || q.trim().length < 3) {
      setLocationSuggestions([]);
      return;
    }
    setIsSearchingLocation(true);
    try {
      const endpoint = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        q
      )}&limit=5&addressdetails=1`;
      const res = await fetch(endpoint, {
        headers: { "Accept-Language": "it,en", "User-Agent": "SpotterApp/2.0" },
      });
      if (res.ok) {
        const data = await res.json();
        const sugs: LocationSuggestion[] = data.map((item: any) => {
          const city = item.address?.city || 
                       item.address?.town || 
                       item.address?.village || 
                       item.address?.county || 
                       item.address?.state || 
                       "Italia";
          return {
            name: item.name || q,
            lat: parseFloat(item.lat),
            lng: parseFloat(item.lon),
            displayName: item.display_name,
            city,
          };
        });
        setLocationSuggestions(sugs);
      }
    } catch {
      // Ignore network errors
    } finally {
      setIsSearchingLocation(false);
    }
  };

  const handleSelectLocationSuggestion = (sug: LocationSuggestion) => {
    setManualName(sug.name);
    setManualCity(sug.city);
    setManualLat(sug.lat.toFixed(5));
    setManualLng(sug.lng.toFixed(5));
    setLocationSuggestions([]);
    setSearchQuery("");
  };

  // --- AUTOMATIC EXTRACTION VIA AI ---
  const handleExtractWithAI = async () => {
    const raw = reelInput.trim();
    if (!raw) {
      setError("Incolla un link Reel/TikTok o scrivi il nome del posto da analizzare");
      return;
    }

    setIsAiLoading(true);
    setError(null);
    setLoadingStep("✨ Analisi del link o testo...");

    const t1 = setTimeout(() => {
      setLoadingStep("📍 Rilevamento coordinate e informazioni...");
    }, 1200);

    const t2 = setTimeout(() => {
      setLoadingStep("🏔️ Ottimizzazione dettagli e scheda...");
    }, 2800);

    try {
      const isUrl = /^(https?:\/\/)/i.test(raw);
      const payloadBody = {
        input_text: raw,
        video_source_link: isUrl ? raw : undefined,
      };

      const res = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payloadBody),
      });

      clearTimeout(t1);
      clearTimeout(t2);

      if (!res.ok) {
        throw new Error(`Errore durante l'estrazione (${res.status})`);
      }

      const payload = await res.json();
      const resData: ExtractionResult = payload.data;

      if (!resData || !resData.nome) {
        throw new Error("L'AI non è riuscita a identificare il luogo. Prova a specificare il nome.");
      }

      const generatedId = `spot_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
      const isRoute = resData.tipo_entita === "PERCORSO";

      // Effective cover photo from user uploads or AI suggested
      const defaultCover = attachedPhotos.length > 0 
        ? attachedPhotos[coverPhotoIndex] 
        : resData.dati_grafici?.cover_image_url || "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&auto=format&fit=crop&q=80";

      const place: SavedPlace = {
        id: generatedId,
        nome: resData.nome,
        nome_luogo: resData.nome,
        tipo_entita: resData.tipo_entita || (isRoute ? "PERCORSO" : "PUNTO"),
        categoria: resData.categoria || "Domenica in Montagna",
        citta_o_zona: resData.citta_o_zona || "Italia",
        query_google_maps: resData.query_google_maps || `${resData.nome} ${resData.citta_o_zona || ""}`,
        coordinate: {
          lat: Number(resData.coordinate?.lat) || 46.52,
          lng: Number(resData.coordinate?.lng) || 10.45,
        },
        coordinate_percorso: resData.coordinate_percorso,
        riassunto_ai_minimal: resData.riassunto_ai_minimal || "Spot suggestivo scoperto da video social.",
        social_source_link: resData.social_source_link || (isUrl ? raw : undefined),
        video_attachment: videoFileAttachment || undefined,
        user_photos: attachedPhotos.length > 0 ? attachedPhotos : undefined,
        dati_grafici: {
          cover_image_url: defaultCover,
          colore_badge_consigliato: resData.dati_grafici?.colore_badge_consigliato || (isRoute ? "#ea580c" : "#4f46e5"),
          query_immagine_copertina: resData.dati_grafici?.query_immagine_copertina || resData.nome,
        },
        metadata_ai_nascosti: {
          durata_stimata_minuti: resData.metadata_ai_nascosti?.durata_stimata_minuti || 90,
          momento_ideale: resData.metadata_ai_nascosti?.momento_ideale || "Mattina",
          meteo_consigliato: resData.metadata_ai_nascosti?.meteo_consigliato || "Soleggiato",
          difficolta: resData.metadata_ai_nascosti?.difficolta || "Facile",
          dislivello_metri: resData.metadata_ai_nascosti?.dislivello_metri,
        },
        stato_iniziale: {
          visitato: false,
          valutazione_community: 4.8,
          consigliato_algoritmo: true,
        },
        list_ids: [],
        saved_at: new Date().toISOString(),
        visited: false,
      };

      setExtractedPlace(place);
    } catch (err: any) {
      clearTimeout(t1);
      clearTimeout(t2);
      setError(err.message || "Errore durante l'estrazione. Riprova con un altro link o testo.");
    } finally {
      setIsAiLoading(false);
      setLoadingStep("");
    }
  };

  // --- SAVE EXTRACTED PLACE ---
  const handleSaveExtracted = () => {
    if (!extractedPlace) return;
    
    // Sync current photos into extractedPlace
    const finalCover = attachedPhotos.length > 0
      ? attachedPhotos[coverPhotoIndex]
      : extractedPlace.dati_grafici?.cover_image_url;

    const finalPlace: SavedPlace = {
      ...extractedPlace,
      user_photos: attachedPhotos.length > 0 ? attachedPhotos : extractedPlace.user_photos,
      video_attachment: videoFileAttachment || extractedPlace.video_attachment,
      social_source_link: videoLinkInput.trim() || extractedPlace.social_source_link,
      dati_grafici: {
        ...extractedPlace.dati_grafici,
        cover_image_url: finalCover,
      }
    };

    onSavePlace(finalPlace);
    onClose();
  };

  // --- SAVE MANUAL PLACE ---
  const handleSaveManual = () => {
    if (!manualName.trim()) {
      setError("Inserisci il nome del luogo");
      return;
    }

    const lat = parseFloat(manualLat) || 46.5292;
    const lng = parseFloat(manualLng) || 10.4533;
    const generatedId = `spot_manual_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const isRoute = manualEntityType === "PERCORSO";

    const defaultCover = attachedPhotos.length > 0
      ? attachedPhotos[coverPhotoIndex]
      : "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&auto=format&fit=crop&q=80";

    const place: SavedPlace = {
      id: generatedId,
      nome: manualName.trim(),
      nome_luogo: manualName.trim(),
      tipo_entita: manualEntityType,
      categoria: manualCategory,
      citta_o_zona: manualCity.trim() || "Italia",
      query_google_maps: `${manualName.trim()} ${manualCity.trim()}`,
      coordinate: { lat, lng },
      riassunto_ai_minimal: manualNotes.trim() || `Spot inserito manualmente: ${manualName.trim()}.`,
      user_notes: manualNotes.trim() || undefined,
      social_source_link: videoLinkInput.trim() || undefined,
      video_attachment: videoFileAttachment || undefined,
      user_photos: attachedPhotos.length > 0 ? attachedPhotos : undefined,
      dati_grafici: {
        cover_image_url: defaultCover,
        colore_badge_consigliato: getActivityColor(manualCategory),
        query_immagine_copertina: manualName.trim(),
      },
      metadata_ai_nascosti: {
        durata_stimata_minuti: parseInt(manualDuration, 10) || 90,
        momento_ideale: manualMoment,
        meteo_consigliato: manualWeather,
        difficolta: "Facile",
      },
      stato_iniziale: {
        visitato: manualVisited,
        valutazione_community: 5.0,
      },
      visited: manualVisited,
      list_ids: [],
      saved_at: new Date().toISOString(),
    };

    onSavePlace(place);
    onClose();
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
        className="relative w-full sm:max-w-xl max-h-[94vh] sm:max-h-[90vh] bg-white text-slate-900 rounded-t-3xl sm:rounded-3xl border border-slate-200 shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Header Bar */}
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Aggiungi Nuovo Spot</span>
            </h2>
            <p className="text-[11px] text-slate-500">
              Scegli come salvare la località e allega foto o video subito
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode Selector Tabs: Automatico vs Normale/Manuale */}
        <div className="px-5 pt-3 pb-1 bg-slate-50 border-b border-slate-100 shrink-0">
          <div className="flex p-1 rounded-2xl bg-slate-200/80 max-w-sm mx-auto text-xs font-bold">
            <button
              type="button"
              onClick={() => setActiveTab("automatic")}
              className={`flex-1 py-1.5 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                activeTab === "automatic"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Automatico (Reel / AI)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("manual")}
              className={`flex-1 py-1.5 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                activeTab === "manual"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Edit3 className="w-3.5 h-3.5 text-blue-600" />
              <span>Normale (Manuale)</span>
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">

          {error && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center justify-between">
              <span>{error}</span>
              <button 
                type="button" 
                onClick={() => setError(null)}
                className="text-rose-500 hover:text-rose-800"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 1: MODALITÀ AUTOMATICA (AI / REEL) */}
          {/* ========================================================================= */}
          {activeTab === "automatic" && (
            <div className="space-y-4">
              
              {!extractedPlace ? (
                <>
                  {/* Reel / Link / Text Input Card */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <LinkIcon className="w-3.5 h-3.5 text-blue-600" />
                        <span>Link Reel / TikTok / Shorts o Testo</span>
                      </label>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={handlePasteFromClipboard}
                          className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 text-[11px] font-semibold transition-colors"
                          title="Incolla dagli appunti"
                        >
                          <ClipboardPaste className="w-3 h-3 text-indigo-600" />
                          <span>Incolla</span>
                        </button>

                        {reelInput && (
                          <button
                            type="button"
                            onClick={() => setReelInput("")}
                            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
                            title="Cancella testo"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>

                    <textarea
                      rows={3}
                      value={reelInput}
                      onChange={(e) => setReelInput(e.target.value)}
                      placeholder="Incolla qui il link di Instagram Reel, TikTok, Shorts o scrivi: 'Passo Giau con vista Marmolada al tramonto'..."
                      className="w-full p-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 resize-none transition-all"
                      autoFocus
                    />

                    <p className="text-[11px] text-slate-500">
                      ⚡ L'AI individua automaticamente nome esatto, categoria, coordinate GPS e dettagli.
                    </p>
                  </div>

                  {/* IMAGES & VIDEO ATTACHMENT SECTION (Subito, anche prima di estrarre!) */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <Camera className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Inserisci Immagini Subito ({attachedPhotos.length})</span>
                      </h4>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setShowImageUrlField(!showImageUrlField)}
                          className="text-[11px] text-blue-600 hover:underline font-semibold"
                        >
                          {showImageUrlField ? "Nascondi Link" : "+ Link URL"}
                        </button>
                        <button
                          type="button"
                          onClick={() => photoInputRef.current?.click()}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 text-[11px] font-semibold transition-colors"
                        >
                          <Upload className="w-3 h-3 text-indigo-600" />
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
                          placeholder="Incolla link immagine (es. https://...)"
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

                    {/* Thumbnails Gallery */}
                    {attachedPhotos.length > 0 ? (
                      <div className="grid grid-cols-4 gap-2 pt-1">
                        {attachedPhotos.map((photo, idx) => (
                          <div 
                            key={idx} 
                            className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                              coverPhotoIndex === idx ? "border-amber-500 shadow-sm" : "border-slate-200"
                            }`}
                          >
                            <img 
                              src={photo} 
                              alt={`Foto ${idx + 1}`} 
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover" 
                            />
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
                        className="py-3 px-4 rounded-xl border border-dashed border-slate-300 hover:border-slate-400 bg-white/50 hover:bg-white flex items-center justify-center gap-2 text-slate-500 hover:text-slate-800 cursor-pointer transition-all text-xs"
                      >
                        <Camera className="w-4 h-4 text-slate-400" />
                        <span>Tocca per aggiungere foto dal tuo dispositivo o fotocamera</span>
                      </div>
                    )}

                    {/* Allegare Video in Automatico */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs text-slate-700 font-semibold">
                        <Video className="w-3.5 h-3.5 text-rose-500" />
                        <span>Video Allegato:</span>
                        <span className="text-[11px] text-slate-500 font-normal">
                          {videoFileAttachment ? videoFileAttachment.title : "Nessun file video caricato"}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => videoInputRef.current?.click()}
                          className="px-2 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 text-[11px] font-semibold transition-colors"
                        >
                          + Carica Video
                        </button>
                        {videoFileAttachment && (
                          <button
                            type="button"
                            onClick={() => setVideoFileAttachment(null)}
                            className="p-1 text-rose-500 hover:text-rose-700"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Extract Button */}
                  <button
                    type="button"
                    onClick={handleExtractWithAI}
                    disabled={isAiLoading || !reelInput.trim()}
                    className="w-full py-3.5 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 active:scale-98 transition-all disabled:opacity-50 disabled:pointer-events-none"
                  >
                    {isAiLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                        <span>{loadingStep || "Analisi AI in corso..."}</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-amber-300" />
                        <span>Estrai Luogo con AI</span>
                      </>
                    )}
                  </button>
                </>
              ) : (
                /* STEP 2: PREVIEW OF EXTRACTED PLACE (With photos and video ready) */
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  {/* Photo Preview & Badge */}
                  <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/80 shadow-xs">
                    <img 
                      src={
                        attachedPhotos.length > 0 
                          ? attachedPhotos[coverPhotoIndex] 
                          : extractedPlace.dati_grafici?.cover_image_url
                      } 
                      alt={extractedPlace.nome}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
                    
                    <div className="absolute top-3 right-3 flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => photoInputRef.current?.click()}
                        className="px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md text-slate-900 text-[11px] font-bold flex items-center gap-1 hover:bg-white shadow-xs"
                      >
                        <Camera className="w-3 h-3 text-indigo-600" />
                        <span>{attachedPhotos.length > 0 ? `${attachedPhotos.length} Foto` : "+ Aggiungi Foto"}</span>
                      </button>
                    </div>

                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <div className="flex items-center gap-2 mb-1">
                        <span 
                          className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white shadow-xs flex items-center gap-1"
                          style={{ backgroundColor: getActivityColor(extractedPlace.categoria) }}
                        >
                          <span>{getActivityIcon(extractedPlace.categoria)}</span>
                          <span>{extractedPlace.categoria}</span>
                        </span>

                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/30 backdrop-blur-md text-white">
                          {extractedPlace.tipo_entita === "PERCORSO" ? "Percorso / Strada" : "Punto Panoramico"}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold leading-tight">
                        {extractedPlace.nome}
                      </h3>
                      <p className="text-xs text-slate-200 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-rose-300" />
                        <span>{extractedPlace.citta_o_zona}</span>
                      </p>
                    </div>
                  </div>

                  {/* Attached Photos row if any */}
                  {attachedPhotos.length > 0 && (
                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                      {attachedPhotos.map((photo, idx) => (
                        <div 
                          key={idx} 
                          onClick={() => setCoverPhotoIndex(idx)}
                          className={`relative w-16 h-12 rounded-xl overflow-hidden shrink-0 border-2 cursor-pointer transition-all ${
                            coverPhotoIndex === idx ? "border-amber-500 scale-105" : "border-slate-200 opacity-70 hover:opacity-100"
                          }`}
                        >
                          <img src={photo} alt={`Mini ${idx}`} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemovePhoto(idx);
                            }}
                            className="absolute top-0.5 right-0.5 p-0.5 bg-black/60 rounded text-white"
                          >
                            <X className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => photoInputRef.current?.click()}
                        className="w-16 h-12 rounded-xl border border-dashed border-slate-300 bg-slate-50 flex items-center justify-center text-slate-500 hover:text-slate-900 shrink-0"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {/* Quick Fine-Tuning Editable Fields */}
                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">Nome Spot</label>
                      <input
                        type="text"
                        value={extractedPlace.nome}
                        onChange={(e) => setExtractedPlace({
                          ...extractedPlace,
                          nome: e.target.value,
                          nome_luogo: e.target.value
                        })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">Città o Zona</label>
                        <input
                          type="text"
                          value={extractedPlace.citta_o_zona}
                          onChange={(e) => setExtractedPlace({
                            ...extractedPlace,
                            citta_o_zona: e.target.value
                          })}
                          className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">Categoria</label>
                        <select
                          value={extractedPlace.categoria}
                          onChange={(e) => setExtractedPlace({
                            ...extractedPlace,
                            categoria: e.target.value
                          })}
                          className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white"
                        >
                          {ACTIVITY_FILTERS.filter(f => f.key !== "tutti").map((f) => (
                            <option key={f.key} value={f.categoryName}>
                              {getActivityIcon(f.categoryName)} {f.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Riassunto / Note */}
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">Riassunto & Note</label>
                      <textarea
                        rows={2}
                        value={extractedPlace.riassunto_ai_minimal}
                        onChange={(e) => setExtractedPlace({
                          ...extractedPlace,
                          riassunto_ai_minimal: e.target.value
                        })}
                        className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white resize-none"
                      />
                    </div>

                    {/* Metadata Badges */}
                    <div className="flex items-center gap-2 flex-wrap p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px]">
                      <span className="flex items-center gap-1 font-mono text-slate-600">
                        <MapPin className="w-3 h-3 text-rose-500" />
                        <span>GPS: {extractedPlace.coordinate?.lat.toFixed(4)}, {extractedPlace.coordinate?.lng.toFixed(4)}</span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-slate-600 font-medium">
                        <Clock className="w-3 h-3 text-amber-500" />
                        <span>{extractedPlace.metadata_ai_nascosti?.durata_stimata_minuti || 90} min</span>
                      </span>
                      <span>•</span>
                      <span className="text-slate-600 font-medium">
                        {extractedPlace.metadata_ai_nascosti?.momento_ideale || "Mattina"}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleSaveExtracted}
                      className="flex-1 py-3.5 px-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 active:scale-98 transition-all"
                    >
                      <Check className="w-4 h-4 stroke-[2.5]" />
                      <span>Salva nei Miei Luoghi</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setExtractedPlace(null);
                        setReelInput("");
                      }}
                      className="py-3.5 px-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors"
                      title="Estrai un altro spot"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Nuovo</span>
                    </button>
                  </div>
                </motion.div>
              )}

            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: MODALITÀ NORMALE (MANUALE) */}
          {/* ========================================================================= */}
          {activeTab === "manual" && (
            <div className="space-y-4 text-xs">
              
              {/* Quick Search Helper on Maps / Nominatim */}
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                    <Search className="w-3.5 h-3.5 text-blue-600" />
                    <span>Cerca Indirizzo o Luogo (Auto-compilazione rapida)</span>
                  </label>
                  {isSearchingLocation && <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-400" />}
                </div>

                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => handleSearchLocation(e.target.value)}
                    placeholder="Digita per cercare: es. 'Passo Sella', 'Lago di Braies', 'Firenze'..."
                    className="w-full pl-8 pr-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                </div>

                {locationSuggestions.length > 0 && (
                  <div className="rounded-xl border border-slate-200 divide-y divide-slate-100 bg-white overflow-hidden shadow-sm max-h-40 overflow-y-auto">
                    {locationSuggestions.map((sug, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleSelectLocationSuggestion(sug)}
                        className="w-full text-left p-2.5 hover:bg-slate-50 flex items-start gap-2 text-xs transition-colors"
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

              {/* Name & City */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Nome Spot o Località *
                  </label>
                  <input
                    type="text"
                    value={manualName}
                    onChange={(e) => setManualName(e.target.value)}
                    placeholder="Es. Rifugio Scoiattoli, Passo Falzarego..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Città o Zona
                  </label>
                  <input
                    type="text"
                    value={manualCity}
                    onChange={(e) => setManualCity(e.target.value)}
                    placeholder="Es. Cortina d'Ampezzo (BL)"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white"
                  />
                </div>
              </div>

              {/* Category & Entity Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Categoria
                  </label>
                  <select
                    value={manualCategory}
                    onChange={(e) => setManualCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white"
                  >
                    {ACTIVITY_FILTERS.filter(f => f.key !== "tutti").map((f) => (
                      <option key={f.key} value={f.categoryName}>
                        {getActivityIcon(f.categoryName)} {f.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Tipo di Località
                  </label>
                  <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-slate-100 border border-slate-200">
                    <button
                      type="button"
                      onClick={() => setManualEntityType("PUNTO")}
                      className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all flex items-center justify-center gap-1 ${
                        manualEntityType === "PUNTO"
                          ? "bg-white text-slate-900 shadow-xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      <MapPin className="w-3 h-3 text-rose-500" />
                      <span>Punto Singolo</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setManualEntityType("PERCORSO")}
                      className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all flex items-center justify-center gap-1 ${
                        manualEntityType === "PERCORSO"
                          ? "bg-white text-slate-900 shadow-xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      <Mountain className="w-3 h-3 text-amber-600" />
                      <span>Percorso / Strada</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* GPS Coordinates */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-bold text-slate-700">Coordinate GPS (Latitudine, Longitudine)</label>
                  <button
                    type="button"
                    onClick={handleGetCurrentGps}
                    className="text-[11px] text-blue-600 hover:underline flex items-center gap-1 font-semibold"
                  >
                    <Compass className="w-3 h-3" />
                    <span>{isGettingGps ? "Rilevamento..." : "Usa la mia posizione GPS"}</span>
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    step="0.0001"
                    value={manualLat}
                    onChange={(e) => setManualLat(e.target.value)}
                    placeholder="Lat (es. 46.5292)"
                    className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white"
                  />
                  <input
                    type="number"
                    step="0.0001"
                    value={manualLng}
                    onChange={(e) => setManualLng(e.target.value)}
                    placeholder="Lng (es. 10.4533)"
                    className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white"
                  />
                </div>
              </div>

              {/* IMMAGINI SUBITO NELLA MODALITÀ MANUALE */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Inserisci Immagini del Posto ({attachedPhotos.length})</span>
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
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 text-[11px] font-semibold transition-colors"
                    >
                      <Upload className="w-3 h-3 text-indigo-600" />
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
                      placeholder="Incolla link immagine online..."
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
                          coverPhotoIndex === idx ? "border-amber-500 shadow-sm" : "border-slate-200"
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
                    className="py-3 px-4 rounded-xl border border-dashed border-slate-300 hover:border-slate-400 bg-white/50 hover:bg-white flex items-center justify-center gap-2 text-slate-500 hover:text-slate-800 cursor-pointer transition-all text-xs"
                  >
                    <ImageIcon className="w-4 h-4 text-slate-400" />
                    <span>Tocca per aggiungere subito foto scattate o salvate sul dispositivo</span>
                  </div>
                )}
              </div>

              {/* VIDEO & SOCIAL LINK SUBITO NELLA MODALITÀ MANUALE */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                <label className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
                  <Video className="w-3.5 h-3.5 text-rose-500" />
                  <span>Allega Video o Link Social (Reel, TikTok, YouTube)</span>
                </label>

                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    value={videoLinkInput}
                    onChange={(e) => setVideoLinkInput(e.target.value)}
                    placeholder="Es. https://instagram.com/reel/... o TikTok link"
                    className="flex-1 px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                  <button
                    type="button"
                    onClick={() => videoInputRef.current?.click()}
                    className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 font-semibold text-xs flex items-center gap-1"
                    title="Carica file video dal dispositivo"
                  >
                    <Upload className="w-3 h-3 text-rose-500" />
                    <span>File Video</span>
                  </button>
                </div>

                {videoFileAttachment && (
                  <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-semibold">
                    <span className="flex items-center gap-1">
                      <Play className="w-3 h-3 text-emerald-600" />
                      <span>Video locale allegato: {videoFileAttachment.title}</span>
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

              {/* Personal Notes / Description */}
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Note Personali o Descrizione
                </label>
                <textarea
                  rows={2}
                  value={manualNotes}
                  onChange={(e) => setManualNotes(e.target.value)}
                  placeholder="Es. Consigliato arrivare presto per il parcheggio, sentiero panoramico stupendo..."
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white resize-none"
                />
              </div>

              {/* Duration, Weather & Visited */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-700 block mb-1">Durata (min)</label>
                  <input
                    type="number"
                    value={manualDuration}
                    onChange={(e) => setManualDuration(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-700 block mb-1">Momento</label>
                  <select
                    value={manualMoment}
                    onChange={(e) => setManualMoment(e.target.value)}
                    className="w-full px-2 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white"
                  >
                    <option value="Mattina presto">Mattina presto</option>
                    <option value="Mattina">Mattina</option>
                    <option value="Pranzo">Pranzo</option>
                    <option value="Pomeriggio">Pomeriggio</option>
                    <option value="Tramonto">Tramonto</option>
                    <option value="Sera">Sera</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-700 block mb-1">Stato</label>
                  <button
                    type="button"
                    onClick={() => setManualVisited(!manualVisited)}
                    className={`w-full py-1.5 px-2 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1 border ${
                      manualVisited 
                        ? "bg-emerald-50 border-emerald-200 text-emerald-700" 
                        : "bg-slate-50 border-slate-200 text-slate-600"
                    }`}
                  >
                    {manualVisited ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <Clock className="w-3 h-3 text-slate-400" />}
                    <span>{manualVisited ? "Visitato" : "Da fare"}</span>
                  </button>
                </div>
              </div>

              {/* Submit Manual Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleSaveManual}
                  className="w-full py-3.5 px-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 active:scale-98 transition-all"
                >
                  <Check className="w-4 h-4 stroke-[2.5]" />
                  <span>Salva nei Miei Luoghi</span>
                </button>
              </div>

            </div>
          )}

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
