import React, { useState } from "react";
import { 
  MapPin, 
  Clock, 
  Sun, 
  ChevronDown, 
  ChevronUp, 
  ExternalLink, 
  CheckCircle2, 
  Circle, 
  Navigation, 
  Video, 
  Play, 
  Share2, 
  Copy, 
  Check,
  Mountain,
  Car,
  Utensils,
  Snowflake,
  Landmark,
  Compass,
  Sparkles
} from "lucide-react";
import { SavedPlace, CustomList } from "../types";
import { getActivityColor } from "../data/categories";

interface PlaceCardProps {
  place: SavedPlace;
  lists: CustomList[];
  onToggleVisited: (id: string) => void;
  onOpenDetails: (place: SavedPlace) => void;
  onCenterOnMap: (place: SavedPlace) => void;
  onToggleListAssignment: (placeId: string, listId: string) => void;
  onDeletePlace: (id: string) => void;
}

export const PlaceCard: React.FC<PlaceCardProps> = ({
  place,
  lists,
  onToggleVisited,
  onOpenDetails,
  onCenterOnMap,
  onToggleListAssignment,
  onDeletePlace,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);

  const isVisited = place.stato_iniziale?.visitato || place.visited;
  const isRoute = place.tipo_entita === "PERCORSO";
  const badgeColor = place.dati_grafici?.colore_badge_consigliato || getActivityColor(place.categoria);

  const placeName = place.nome || place.nome_luogo || "Luogo salvato";
  const placeLocation = place.citta_o_zona || "Italia";

  const googleMapsNavUrl = `https://www.google.com/maps/dir/?api=1&destination=${place.coordinate?.lat},${place.coordinate?.lng}`;
  const googleMapsSearchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    place.query_google_maps || `${placeName} ${placeLocation}`
  )}`;

  const handleCopyAddress = (e: React.MouseEvent) => {
    e.stopPropagation();
    const copyText = `${placeName}, ${placeLocation} (GPS: ${place.coordinate?.lat}, ${place.coordinate?.lng})`;
    navigator.clipboard.writeText(copyText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleShareWithFriends = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareText = `Ti consiglio questo posto scoperto con pinna: ${placeName} (${placeLocation})! Guarda il percorso: ${googleMapsNavUrl}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: placeName,
          text: shareText,
          url: googleMapsNavUrl,
        });
      } catch {
        // Ignored
      }
    } else {
      navigator.clipboard.writeText(shareText);
      alert("Testo per consigliare agli amici copiato negli appunti!");
    }
  };

  // Activity Icon mapping
  const renderCategoryIcon = () => {
    const cat = (place.categoria || "").toLowerCase();
    if (cat.includes("pass") || cat.includes("auto") || cat.includes("moto")) {
      return <Car className="w-3.5 h-3.5" />;
    }
    if (cat.includes("trek") || cat.includes("sentier") || cat.includes("montagna")) {
      return <Mountain className="w-3.5 h-3.5" />;
    }
    if (cat.includes("ristoran") || cat.includes("cibo")) {
      return <Utensils className="w-3.5 h-3.5" />;
    }
    if (cat.includes("sci") || cat.includes("neve")) {
      return <Snowflake className="w-3.5 h-3.5" />;
    }
    if (cat.includes("passegg") || cat.includes("borgh")) {
      return <Landmark className="w-3.5 h-3.5" />;
    }
    return <Compass className="w-3.5 h-3.5" />;
  };

  return (
    <div 
      id={`place-card-${place.id}`}
      className={`group relative bg-white rounded-3xl border transition-all duration-200 shadow-xs hover:shadow-md overflow-hidden ${
        isVisited ? "border-emerald-200/90 bg-emerald-50/10" : "border-slate-200/90 hover:border-slate-300"
      }`}
    >
      {/* Top Gradient Accent Bar */}
      <div 
        className="h-1.5 w-full" 
        style={{ backgroundColor: badgeColor }} 
      />

      {/* Optional Media / Cover or Video Preview */}
      {place.video_attachment && isPlayingVideo ? (
        <div className="relative w-full aspect-video bg-black overflow-hidden">
          <video
            src={place.video_attachment.url}
            controls
            autoPlay
            className="w-full h-full object-cover"
          />
          <button
            type="button"
            onClick={() => setIsPlayingVideo(false)}
            className="absolute top-2 right-2 px-2 py-1 rounded-lg bg-black/70 text-white text-[10px] font-bold"
          >
            Chiudi Video
          </button>
        </div>
      ) : place.dati_grafici?.cover_image_url || place.video_attachment?.thumbnailUrl ? (
        <div 
          className="relative w-full h-36 bg-slate-100 overflow-hidden cursor-pointer"
          onClick={() => onOpenDetails(place)}
        >
          <img
            src={place.video_attachment?.thumbnailUrl || place.dati_grafici?.cover_image_url}
            alt={placeName}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          
          {place.video_attachment && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsPlayingVideo(true);
              }}
              className="absolute bottom-2.5 left-2.5 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-600/90 hover:bg-orange-600 text-white text-[11px] font-bold backdrop-blur-md shadow-md"
            >
              <Play className="w-3 h-3 fill-white" />
              <span>Guarda Video Reel</span>
            </button>
          )}

          {place.metadata_ai_nascosti?.dislivello_metri && (
            <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md bg-black/60 text-white text-[10px] font-bold backdrop-blur-md">
              +{place.metadata_ai_nascosti.dislivello_metri}m dislivello
            </div>
          )}
        </div>
      ) : null}

      <div className="p-4 sm:p-5 space-y-3">
        {/* Header Badges: Entity Type + Category */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <span 
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold text-white shadow-xs"
              style={{ backgroundColor: badgeColor }}
            >
              {renderCategoryIcon()}
              <span>{isRoute ? "PERCORSO" : "PUNTO"}</span>
            </span>

            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
              {place.categoria_principale || place.categoria}
            </span>

            {place.tag_contestuale && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-200/70 text-slate-800">
                {place.tag_contestuale}
              </span>
            )}

            {place.stato_iniziale?.consigliato_algoritmo && (
              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300/60">
                <Sparkles className="w-2.5 h-2.5 text-amber-600" />
                <span>Consigliato</span>
              </span>
            )}
          </div>

          {/* Toggle Visited Button */}
          <button
            id={`btn-visited-${place.id}`}
            type="button"
            onClick={() => onToggleVisited(place.id)}
            title={isVisited ? "Già visitato (clicca per cambiare)" : "Segna come visitato"}
            className={`p-1.5 rounded-xl transition-all active:scale-95 ${
              isVisited 
                ? "text-emerald-700 bg-emerald-100/90 hover:bg-emerald-200" 
                : "text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            }`}
          >
            {isVisited ? (
              <CheckCircle2 className="w-5 h-5 fill-emerald-600 text-white" />
            ) : (
              <Circle className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Name and Location */}
        <div>
          <h3 
            onClick={() => onOpenDetails(place)}
            className="text-base sm:text-lg font-black text-slate-900 leading-tight truncate hover:text-indigo-600 cursor-pointer transition-colors"
          >
            {placeName}
          </h3>
          <div className="flex items-center gap-1 text-xs font-medium text-slate-500 mt-1">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{placeLocation}</span>
          </div>
        </div>

        {/* Minimal AI Summary (Max 2 clean natural sentences) */}
        {(place.sintesi || place.riassunto_ai_minimal) && (
          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed bg-slate-50 p-2 rounded-xl border border-slate-100/80">
            {place.sintesi || place.riassunto_ai_minimal}
          </p>
        )}

        {/* Key Metrics Row */}
        <div className="flex flex-wrap items-center gap-2.5 pt-1 text-[11px] text-slate-600">
          {place.metadata_ai_nascosti?.durata_stimata_minuti && (
            <span className="flex items-center gap-1 font-medium">
              <Clock className="w-3 h-3 text-amber-500" />
              <span>{place.metadata_ai_nascosti.durata_stimata_minuti} min</span>
            </span>
          )}

          {place.metadata_ai_nascosti?.momento_ideale && (
            <span className="text-slate-500">
              • {place.metadata_ai_nascosti.momento_ideale}
            </span>
          )}

          {place.metadata_ai_nascosti?.difficolta && (
            <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold">
              Diff: {place.metadata_ai_nascosti.difficolta}
            </span>
          )}

          {place.video_attachment && (
            <span className="ml-auto flex items-center gap-1 text-orange-600 font-bold">
              <Video className="w-3 h-3" />
              <span>Video</span>
            </span>
          )}
        </div>

        {/* Primary Action Buttons: Maps Directions, Copy Address, Expand Details */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1.5">
          <div className="flex items-center gap-1">
            {/* Direct Google Maps Driving Directions */}
            <a
              id={`nav-maps-btn-${place.id}`}
              href={googleMapsNavUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="Avvia navigatore su Google Maps"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors shadow-xs"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Naviga</span>
            </a>

            {/* Copy Address / GPS */}
            <button
              id={`copy-addr-btn-${place.id}`}
              type="button"
              onClick={handleCopyAddress}
              title="Copia indirizzo e coordinate GPS per il navigatore"
              className="flex items-center gap-1 px-2 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
            >
              {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{isCopied ? "Copiato" : "Copia"}</span>
            </button>

            {/* Share / Recommend to Friends */}
            <button
              type="button"
              onClick={handleShareWithFriends}
              title="Consiglia questo posto ad amici su WhatsApp o social"
              className="p-1.5 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onCenterOnMap(place)}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 px-2 py-1"
            >
              Mappa
            </button>

            <button
              type="button"
              onClick={() => onOpenDetails(place)}
              className="text-xs font-bold px-2.5 py-1 rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-colors"
            >
              Scheda
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
