import React, { useState, useRef, useEffect } from "react";
import { 
  X, 
  MapPin, 
  Clock, 
  Sun, 
  ExternalLink, 
  Compass, 
  Navigation, 
  CheckCircle2, 
  Circle, 
  Copy, 
  Check, 
  Video, 
  Sparkles,
  Edit3,
  Save,
  Camera,
  Upload,
  FileText,
  Trash2,
  Eye,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { SavedPlace, CustomList } from "../types";
import { getActivityIcon, ACTIVITY_FILTERS } from "../data/categories";
import { InstagramStoryRecapModal } from "./InstagramStoryRecapModal";
import { detectPlaceRegionsAndProvinces, getCountryFlag } from "../lib/geoItaly";

interface PlaceDetailModalProps {
  place: SavedPlace | null;
  lists: CustomList[];
  onClose: () => void;
  onCenterOnMap: (place: SavedPlace) => void;
  onToggleVisited: (id: string) => void;
  onToggleListAssignment: (placeId: string, listId: string) => void;
  onUpdatePlace?: (updated: SavedPlace) => void;
  onDeletePlace?: (id: string) => void;
}

export const PlaceDetailModal: React.FC<PlaceDetailModalProps> = ({
  place,
  onClose,
  onCenterOnMap,
  onToggleVisited,
  onUpdatePlace,
  onDeletePlace,
}) => {
  if (!place) return null;

  const [activeViewMode, setActiveViewMode] = useState<"view" | "edit">("view");
  const [copied, setCopied] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [showStoryRecap, setShowStoryRecap] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // User Notes state
  const [personalNotes, setPersonalNotes] = useState(place.user_notes || "");
  const [isNotesSaved, setIsNotesSaved] = useState(false);

  // Form Fields for Editing
  const [editName, setEditName] = useState(place.nome || place.nome_luogo || "");
  const [editLocation, setEditLocation] = useState(place.citta_o_zona || "");
  const [editCountry, setEditCountry] = useState(place.paese || "Italia");
  const [editCategory, setEditCategory] = useState(place.categoria || "Passi di Montagna");
  const [editSummary, setEditSummary] = useState(place.riassunto_ai_minimal || "");
  const [editDuration, setEditDuration] = useState(place.metadata_ai_nascosti?.durata_stimata_minuti || 90);
  const [editMoment, setEditMoment] = useState(place.metadata_ai_nascosti?.momento_ideale || "Mattina presto");
  const [editWeather, setEditWeather] = useState(place.metadata_ai_nascosti?.meteo_consigliato || "Soleggiato");
  const [editLat, setEditLat] = useState(place.coordinate?.lat || 46.529);
  const [editLng, setEditLng] = useState(place.coordinate?.lng || 10.453);
  const [editCoverUrl, setEditCoverUrl] = useState(place.dati_grafici?.cover_image_url || "");
  const [editIsRoute, setEditIsRoute] = useState(place.tipo_entita === "PERCORSO");
  const [saveSuccessMsg, setSaveSuccessMsg] = useState(false);

  const detectedGeo = detectPlaceRegionsAndProvinces(place);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync state when selected place changes
  useEffect(() => {
    if (place) {
      setPersonalNotes(place.user_notes || "");
      setEditName(place.nome || place.nome_luogo || "");
      setEditLocation(place.citta_o_zona || "");
      setEditCountry(place.paese || "Italia");
      setEditCategory(place.categoria || "Passi di Montagna");
      setEditSummary(place.riassunto_ai_minimal || "");
      setEditDuration(place.metadata_ai_nascosti?.durata_stimata_minuti || 90);
      setEditMoment(place.metadata_ai_nascosti?.momento_ideale || "Mattina presto");
      setEditWeather(place.metadata_ai_nascosti?.meteo_consigliato || "Soleggiato");
      setEditLat(place.coordinate?.lat || 46.529);
      setEditLng(place.coordinate?.lng || 10.453);
      setEditCoverUrl(place.dati_grafici?.cover_image_url || "");
      setEditIsRoute(place.tipo_entita === "PERCORSO");
      setSelectedPhotoIndex(0);
      setActiveViewMode("view");
      setConfirmDelete(false);
    }
  }, [place.id]);

  const isVisited = Boolean(place.stato_iniziale?.visitato || place.visited);
  const placeName = place.nome || place.nome_luogo || "Luogo salvato";
  const placeLocation = place.citta_o_zona || "Italia";

  const googleMapsNavUrl = `https://www.google.com/maps/dir/?api=1&destination=${place.coordinate?.lat},${place.coordinate?.lng}`;

  const photos = [
    ...(place.user_photos || []),
    place.dati_grafici?.cover_image_url || "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1000&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1000&auto=format&fit=crop&q=80",
  ];

  const handleCopyGPS = () => {
    const text = `${placeName}, ${placeLocation} — GPS: ${place.coordinate?.lat}, ${place.coordinate?.lng}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveNotes = () => {
    if (!onUpdatePlace) return;
    const updated: SavedPlace = {
      ...place,
      user_notes: personalNotes,
    };
    onUpdatePlace(updated);
    setIsNotesSaved(true);
    setTimeout(() => setIsNotesSaved(false), 2000);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !onUpdatePlace) return;

    const file = files[0];
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const updatedPhotos = [dataUrl, ...(place.user_photos || [])];
      const updated: SavedPlace = {
        ...place,
        user_photos: updatedPhotos,
      };
      onUpdatePlace(updated);
      setSelectedPhotoIndex(0);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveEdits = () => {
    if (!onUpdatePlace) return;
    const editedGeo = detectPlaceRegionsAndProvinces({
      paese: editCountry,
      citta_o_zona: editLocation.trim(),
      nome: editName.trim(),
    });
    const updated: SavedPlace = {
      ...place,
      nome: editName.trim(),
      nome_luogo: editName.trim(),
      citta_o_zona: editLocation.trim(),
      paese: editCountry || editedGeo.primaryCountry || place.paese,
      regione: editedGeo.primaryRegion || place.regione,
      provincia: editedGeo.primaryProvince?.code || place.provincia,
      categoria: editCategory,
      tipo_entita: editIsRoute ? "PERCORSO" : "PUNTO",
      riassunto_ai_minimal: editSummary.trim(),
      user_notes: personalNotes.trim() || undefined,
      coordinate: {
        lat: Number(editLat) || place.coordinate.lat,
        lng: Number(editLng) || place.coordinate.lng,
      },
      dati_grafici: {
        ...place.dati_grafici,
        cover_image_url: editCoverUrl.trim() || place.dati_grafici?.cover_image_url,
      },
      metadata_ai_nascosti: {
        ...place.metadata_ai_nascosti,
        durata_stimata_minuti: Number(editDuration) || 90,
        momento_ideale: editMoment.trim(),
        meteo_consigliato: editWeather.trim(),
      },
    };
    onUpdatePlace(updated);
    setSaveSuccessMsg(true);
    setTimeout(() => {
      setSaveSuccessMsg(false);
      setActiveViewMode("view");
    }, 900);
  };

  const handleDelete = () => {
    if (onDeletePlace) {
      onDeletePlace(place.id);
      onClose();
    }
  };

  return (
    <>
      <motion.div 
        id="spotter-modal-level2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/40 backdrop-blur-sm"
      >
        <div onClick={onClose} className="absolute inset-0" />

        <motion.div 
          initial={{ y: "100%", opacity: 0.8 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          transition={{ type: "spring", stiffness: 380, damping: 32 }}
          className="relative w-full sm:max-w-xl max-h-[92vh] sm:max-h-[88vh] bg-white text-slate-900 rounded-t-3xl sm:rounded-3xl border border-slate-200 shadow-2xl flex flex-col overflow-hidden"
        >
          
          {/* Header Bar with View/Edit Segment */}
          <div className="px-5 py-3 border-b border-slate-100 bg-white flex items-center justify-between">
            {/* View vs Edit Toggle Switch */}
            <div className="flex p-0.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveViewMode("view")}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all ${
                  activeViewMode === "view"
                    ? "bg-white text-slate-900 shadow-xs font-bold"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Scheda</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveViewMode("edit")}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all ${
                  activeViewMode === "edit"
                    ? "bg-white text-slate-900 shadow-xs font-bold"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Modifica</span>
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Instagram Story Recap Button */}
              <button
                type="button"
                onClick={() => setShowStoryRecap(true)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs transition-colors shadow-xs active:scale-95"
                title="Crea Story Recap per Instagram / WhatsApp"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span className="hidden sm:inline">Story Recap</span>
              </button>

              {/* Direct Delete Button in Header */}
              {onDeletePlace && (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(!confirmDelete)}
                  title="Elimina questo luogo"
                  className={`p-1.5 rounded-full transition-colors ${
                    confirmDelete
                      ? "bg-rose-100 text-rose-700"
                      : "bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600"
                  }`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}

              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Beautiful Delete Confirmation Modal Overlay */}
          <AnimatePresence>
            {confirmDelete && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4"
              >
                <motion.div
                  initial={{ scale: 0.92, opacity: 0, y: 12 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.92, opacity: 0, y: 12 }}
                  transition={{ type: "spring", damping: 25, stiffness: 350 }}
                  className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-rose-100 text-center space-y-4"
                >
                  <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto shadow-inner border border-rose-100">
                    <Trash2 className="w-7 h-7 stroke-[2]" />
                  </div>

                  <div className="space-y-1.5">
                    <h4 className="text-base font-black text-slate-900">
                      Eliminare questo spot?
                    </h4>
                    <p className="text-xs text-slate-500 leading-relaxed px-2">
                      Vuoi rimuovere definitivamente <strong className="text-slate-800">"{placeName}"</strong> dai tuoi luoghi salvati?
                    </p>
                  </div>

                  <div className="flex items-center justify-center gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(false)}
                      className="flex-1 py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
                    >
                      Annulla
                    </button>
                    <button
                      type="button"
                      onClick={handleDelete}
                      className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black flex items-center justify-center gap-1.5 shadow-md shadow-rose-600/20 active:scale-98 transition-all cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Elimina spot</span>
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            
            {activeViewMode === "edit" ? (
              /* --- EDIT MODE: CLEAN, INTUITIVE & COMPLETE --- */
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3.5"
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <Edit3 className="w-4 h-4 text-indigo-600" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Modifica Dettagli Luogo
                    </span>
                  </div>
                  {saveSuccessMsg && (
                    <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 animate-pulse">
                      <Check className="w-3.5 h-3.5" /> Salvato!
                    </span>
                  )}
                </div>

                {/* 1. Nome & Località */}
                <div className="space-y-2 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Nome del Luogo</label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-semibold focus:bg-white focus:ring-2 focus:ring-slate-900 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Città o Zona Geografica</label>
                    <input
                      type="text"
                      value={editLocation}
                      onChange={(e) => {
                        const val = e.target.value;
                        setEditLocation(val);
                        const det = detectPlaceRegionsAndProvinces({ citta_o_zona: val });
                        if (det.allCountries && det.allCountries.length > 0 && det.primaryCountry !== editCountry) {
                          setEditCountry(det.primaryCountry);
                        }
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-semibold focus:bg-white focus:ring-2 focus:ring-slate-900 focus:outline-none"
                    />
                    {/* Country Selector in Edit Mode */}
                    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1.5 pb-0.5">
                      {["Italia", "Svizzera", "Francia", "Austria", "Germania", "Slovenia", "Spagna", "Norvegia"].map((cName) => {
                        const isSel = editCountry.toLowerCase() === cName.toLowerCase();
                        return (
                          <button
                            key={cName}
                            type="button"
                            onClick={() => setEditCountry(cName)}
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold shrink-0 transition-all flex items-center gap-1 ${
                              isSel
                                ? "bg-slate-900 text-white shadow-xs"
                                : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                            }`}
                          >
                            <span>{getCountryFlag(cName)}</span>
                            <span>{cName}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* 2. Categoria (Chip Selection) */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">Categoria</label>
                  <div className="flex flex-wrap gap-1.5">
                    {ACTIVITY_FILTERS.map((f) => {
                      const isSelected = editCategory === f.categoryName;
                      return (
                        <button
                          key={f.key}
                          type="button"
                          onClick={() => setEditCategory(f.categoryName)}
                          className={`px-3 py-1 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all ${
                            isSelected
                              ? "bg-slate-900 text-white shadow-xs"
                              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                          }`}
                        >
                          <span>{getActivityIcon(f.categoryName)}</span>
                          <span>{f.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Tipo: Spot Singolo vs Itinerario */}
                <div className="flex items-center gap-4 py-1 text-xs">
                  <label className="flex items-center gap-1.5 cursor-pointer font-semibold text-slate-700">
                    <input
                      type="radio"
                      name="editEntityRadio"
                      checked={!editIsRoute}
                      onChange={() => setEditIsRoute(false)}
                      className="accent-slate-900"
                    />
                    <span>📍 Spot Singolo</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer font-semibold text-slate-700">
                    <input
                      type="radio"
                      name="editEntityRadio"
                      checked={editIsRoute}
                      onChange={() => setEditIsRoute(true)}
                      className="accent-slate-900"
                    />
                    <span>⛰️ Itinerario Panoramico</span>
                  </label>
                </div>

                {/* 4. Sintesi / Descrizione */}
                <div className="text-xs">
                  <label className="font-bold text-slate-700 block mb-1">Descrizione / Note Spotter</label>
                  <textarea
                    rows={2}
                    value={editSummary}
                    onChange={(e) => setEditSummary(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-slate-900 focus:outline-none"
                  />
                </div>

                {/* 5. Coordinate GPS */}
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-700 flex items-center gap-1">
                      <Compass className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Coordinate GPS</span>
                    </span>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${editName} ${editLocation}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                    >
                      <span>Verifica su Maps</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[10px] text-slate-500 block mb-0.5">Latitudine</span>
                      <input
                        type="number"
                        step="0.0001"
                        value={editLat}
                        onChange={(e) => setEditLat(Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 font-mono text-slate-900 text-xs focus:ring-1 focus:ring-slate-900"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block mb-0.5">Longitudine</span>
                      <input
                        type="number"
                        step="0.0001"
                        value={editLng}
                        onChange={(e) => setEditLng(Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 font-mono text-slate-900 text-xs focus:ring-1 focus:ring-slate-900"
                      />
                    </div>
                  </div>
                </div>

                {/* 6. URL Immagine di Copertina */}
                <div className="text-xs">
                  <label className="font-bold text-slate-700 block mb-1">URL Immagine Principale</label>
                  <input
                    type="url"
                    value={editCoverUrl}
                    onChange={(e) => setEditCoverUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono text-[11px] focus:bg-white focus:ring-2 focus:ring-slate-900 focus:outline-none"
                  />
                </div>

                {/* Save and Delete Buttons */}
                <div className="pt-2 space-y-2">
                  <button
                    type="button"
                    onClick={handleSaveEdits}
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 active:scale-98 transition-all"
                  >
                    <Save className="w-4 h-4" />
                    <span>Salva Tutte le Modifiche</span>
                  </button>

                  {/* Delete Spot option */}
                  {confirmDelete ? (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-between text-xs animate-in fade-in">
                      <span className="text-rose-800 font-semibold flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                        <span>Sei sicuro di voler eliminare questo spot?</span>
                      </span>
                      <div className="flex gap-1.5">
                        <button
                          type="button"
                          onClick={() => setConfirmDelete(false)}
                          className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 font-semibold"
                        >
                          Annulla
                        </button>
                        <button
                          type="button"
                          onClick={handleDelete}
                          className="px-2.5 py-1 rounded-lg bg-rose-600 text-white font-bold hover:bg-rose-700"
                        >
                          Elimina
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(true)}
                      className="w-full py-2 px-3 rounded-xl text-rose-600 hover:bg-rose-50 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Rimuovi questo spot dai salvati</span>
                    </button>
                  )}
                </div>
              </motion.div>
            ) : (
              /* --- VIEW MODE: ELEGANT & MINIMAL --- */
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                {/* Photo & Cover Gallery */}
                <div className="space-y-2">
                  <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-slate-100 border border-slate-100 shadow-xs">
                    <img
                      src={photos[selectedPhotoIndex]}
                      alt={placeName}
                      referrerPolicy="no-referrer"
                      className={`w-full h-full object-cover transition-all duration-300 ${
                        isVisited ? "grayscale contrast-105 hover:grayscale-0" : ""
                      }`}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

                    <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between text-white">
                      <div>
                        <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                          <span 
                            className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white shadow-xs"
                            style={{ backgroundColor: place.dati_grafici?.colore_badge_consigliato || "#059669" }}
                          >
                            {place.categoria_principale || place.categoria}
                          </span>
                          {place.tag_contestuale && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-black/40 backdrop-blur-md text-white border border-white/20">
                              {place.tag_contestuale}
                            </span>
                          )}
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/25 backdrop-blur-md text-white">
                            {place.tipo_entita === "PERCORSO" ? "Percorso" : "Punto"}
                          </span>
                          {(place.paese || detectedGeo.primaryCountry) && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-black/40 backdrop-blur-md text-amber-200 border border-amber-400/30 flex items-center gap-1">
                              <span>{getCountryFlag(place.paese || detectedGeo.primaryCountry || "Italia")}</span>
                              <span>{place.paese || detectedGeo.primaryCountry}</span>
                            </span>
                          )}
                          {(place.regione || detectedGeo.primaryRegion) && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-black/40 backdrop-blur-md text-emerald-200 border border-emerald-400/30">
                              {place.regione || detectedGeo.primaryRegion}
                            </span>
                          )}
                          {(place.provincia || detectedGeo.primaryProvince) && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-black/40 backdrop-blur-md text-sky-200 border border-sky-400/30">
                              {place.provincia || detectedGeo.primaryProvince?.code}
                            </span>
                          )}
                        </div>
                        <h2 className="text-xl font-bold leading-tight drop-shadow-sm">
                          {placeName}
                        </h2>
                        <div className="flex items-center gap-1.5 text-xs text-slate-200 mt-0.5">
                          <MapPin className="w-3.5 h-3.5 text-rose-300 shrink-0" />
                          <span>{placeLocation}</span>
                        </div>
                      </div>

                      {/* Visited Toggle Button */}
                      <button
                        type="button"
                        onClick={() => onToggleVisited(place.id)}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-md transition-all ${
                          isVisited
                            ? "bg-emerald-500 text-white"
                            : "bg-white/95 text-slate-800 hover:bg-white"
                        }`}
                      >
                        {isVisited ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Circle className="w-3.5 h-3.5" />}
                        <span>{isVisited ? "Visitato" : "Segna Visitato"}</span>
                      </button>
                    </div>
                  </div>

                  {/* Low confidence warning banner */}
                  {place.confidenza_alta === false && (
                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
                      <span className="text-base">⚠️</span>
                      <div className="space-y-0.5">
                        <span className="font-bold block text-xs text-amber-950">Posizione approssimativa o da verificare</span>
                        <p className="text-[11px] text-amber-800 leading-relaxed">
                          La geolocalizzazione automatica è avvenuta a bassa confidenza. Puoi usare la modalità Modifica (tasto matita in alto) per posizionare il punto o la via esatta.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Rapid tags (badge_rapidi) */}
                  {place.badge_rapidi && place.badge_rapidi.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {place.badge_rapidi.map((badge, bIdx) => (
                        <span key={bIdx} className="px-2.5 py-0.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 text-[10px] font-semibold">
                          #{badge}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Photos Carousel + Upload */}
                  <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-0.5">
                    {photos.map((img, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedPhotoIndex(idx)}
                        className={`relative w-14 h-11 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                          selectedPhotoIndex === idx
                            ? "border-slate-900 scale-105 shadow-xs"
                            : "border-transparent opacity-60 hover:opacity-100"
                        }`}
                      >
                        <img
                          src={img}
                          alt={`Foto ${idx + 1}`}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-14 h-11 rounded-xl border-2 border-dashed border-slate-300 hover:border-slate-500 bg-slate-50 flex flex-col items-center justify-center text-slate-500 hover:text-slate-900 transition-colors shrink-0"
                      title="Carica una tua foto scattata sul posto"
                    >
                      <Camera className="w-4 h-4" />
                      <span className="text-[8px] font-bold mt-0.5">+ Foto</span>
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </div>
                </div>

                {/* Note Personali per il luogo */}
                <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/70 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-amber-600" />
                      <span>Le mie Note (per quando ci ritorno)</span>
                    </span>
                    <button
                      type="button"
                      onClick={handleSaveNotes}
                      className="flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-100 hover:bg-amber-200 px-2.5 py-0.5 rounded-lg transition-colors"
                    >
                      {isNotesSaved ? <Check className="w-3 h-3 text-emerald-600" /> : <Save className="w-3 h-3" />}
                      <span>{isNotesSaved ? "Salvate!" : "Salva"}</span>
                    </button>
                  </div>

                  <textarea
                    rows={2}
                    value={personalNotes}
                    onChange={(e) => setPersonalNotes(e.target.value)}
                    placeholder="Es: 'Parcheggiare vicino alla cascata, portare abbigliamento pesante'..."
                    className="w-full px-3 py-2 rounded-xl bg-white border border-amber-200/80 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                {/* Sintesi AI */}
                <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-100 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-700">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Sintesi AI pinna</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                    {place.sintesi || place.riassunto_ai_minimal || "Spot panoramico scoperto dai consigli della community."}
                  </p>
                </div>

                {/* Metadata cards */}
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Durata</span>
                    <span className="font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3 text-amber-500" />
                      {place.metadata_ai_nascosti?.durata_stimata_minuti || 90}m
                    </span>
                  </div>

                  <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Momento</span>
                    <span className="font-bold text-slate-800 mt-0.5 truncate block">
                      {place.metadata_ai_nascosti?.momento_ideale || "Mattina"}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Meteo</span>
                    <span className="font-bold text-slate-800 mt-0.5 truncate block flex items-center gap-1">
                      <Sun className="w-3 h-3 text-amber-500" />
                      {place.metadata_ai_nascosti?.meteo_consigliato || "Soleggiato"}
                    </span>
                  </div>
                </div>

                {/* Social Origin Reel */}
                {place.social_source_link && (
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 font-bold text-slate-700">
                      <Video className="w-3.5 h-3.5 text-rose-500" />
                      <span>Video originario (Reel / TikTok)</span>
                    </span>
                    <a
                      href={place.social_source_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1"
                    >
                      <span>Apri Video</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}

                {/* Local Video Attachment */}
                {place.video_attachment && (
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 text-xs">
                    <span className="flex items-center gap-1.5 font-bold text-slate-700">
                      <Video className="w-3.5 h-3.5 text-rose-500" />
                      <span>Video locale: {place.video_attachment.title || "Video allegato"}</span>
                    </span>
                    <video
                      src={place.video_attachment.url}
                      controls
                      playsInline
                      className="w-full max-h-56 rounded-xl bg-black object-contain"
                    />
                  </div>
                )}

                {/* Coordinate GPS */}
                <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
                  <div className="space-y-0.5">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Coordinate GPS</span>
                    <span className="font-mono text-slate-700 font-medium">
                      {place.coordinate?.lat.toFixed(4)}, {place.coordinate?.lng.toFixed(4)}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyGPS}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? "Copiato" : "Copia"}</span>
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Bottom Nav Action */}
          <div className="p-3.5 border-t border-slate-100 bg-white flex items-center gap-2">
            <a
              id={`btn-launch-google-maps-${place.id}`}
              href={googleMapsNavUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-sm active:scale-98 transition-all"
            >
              <Navigation className="w-3.5 h-3.5 fill-white" />
              <span>Naviga con Google Maps</span>
            </a>

            <button
              type="button"
              onClick={() => onCenterOnMap(place)}
              className="px-3.5 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1.5 active:scale-95 transition-all"
              title="Centra sulla Mappa"
            >
              <Compass className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden sm:inline">Mappa</span>
            </button>
          </div>
        </motion.div>
      </motion.div>

      {/* Instagram Story Recap Modal */}
      {showStoryRecap && (
        <InstagramStoryRecapModal
          place={place}
          onClose={() => setShowStoryRecap(false)}
        />
      )}
    </>
  );
};
