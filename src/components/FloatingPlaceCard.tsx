import React, { useState } from "react";
import { motion } from "motion/react";
import { 
  Navigation, 
  Copy, 
  Check, 
  CheckCircle2, 
  Circle, 
  X, 
  MapPin, 
  Clock, 
  ChevronRight,
  Trash2
} from "lucide-react";
import { SavedPlace } from "../types";
import { getActivityIcon, getActivityColor } from "../data/categories";
import { getCountryFlag } from "../lib/geoItaly";

interface FloatingPlaceCardProps {
  place: SavedPlace;
  onClose: () => void;
  onOpenDetails: (place: SavedPlace) => void;
  onToggleVisited: (id: string) => void;
  onDeletePlace?: (id: string) => void;
}

export const FloatingPlaceCard: React.FC<FloatingPlaceCardProps> = ({
  place,
  onClose,
  onOpenDetails,
  onToggleVisited,
  onDeletePlace,
}) => {
  const [copied, setCopied] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const placeName = place.nome || place.nome_luogo;
  const isVisited = Boolean(place.stato_iniziale?.visitato || place.visited);
  const isRoute = place.tipo_entita === "PERCORSO";
  const strokeColor = place.dati_grafici?.colore_badge_consigliato || getActivityColor(place.categoria);
  const lat = place.coordinate?.lat;
  const lng = place.coordinate?.lng;
  const googleMapsNavUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

  const coverImage = place.dati_grafici?.cover_image_url || 
    "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&auto=format&fit=crop&q=80";

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    const text = `${placeName}, ${place.citta_o_zona} (GPS: ${lat}, ${lng})`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div 
      id="spotter-compact-card-level1"
      onClick={() => onOpenDetails(place)}
      className="group pointer-events-auto cursor-pointer w-full bg-white/95 text-slate-900 backdrop-blur-2xl border border-slate-200/90 rounded-3xl p-3 sm:p-3.5 shadow-[0_12px_36px_rgba(0,0,0,0.18)] hover:shadow-xl transition-all duration-200 relative overflow-hidden"
    >
      {/* Subtle Top Accent */}
      <div 
        className="absolute top-0 left-0 right-0 h-1" 
        style={{ backgroundColor: strokeColor }} 
      />

      {/* Top right buttons: Delete & Close */}
      <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1">
        {onDeletePlace && (
          confirmDelete ? (
            <motion.div 
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1.5 px-2 py-0.5 bg-white/95 backdrop-blur-md border border-rose-200 rounded-full shadow-md"
            >
              <Trash2 className="w-3 h-3 text-rose-500 shrink-0" />
              <button
                type="button"
                onClick={() => {
                  onDeletePlace(place.id);
                  onClose();
                }}
                className="px-2 py-0.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px] shadow-xs active:scale-95 transition-all cursor-pointer"
              >
                Elimina
              </button>
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="px-1.5 py-0.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-semibold transition-all cursor-pointer"
              >
                ✕
              </button>
            </motion.div>
          ) : (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setConfirmDelete(true);
              }}
              title="Elimina questo luogo"
              className="p-1.5 rounded-full bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )
        )}

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          title="Chiudi anteprima"
          className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Row with Real Cover Image + Content */}
      <div className="flex items-center gap-3">
        {/* Real Main Photo */}
        <div className="relative w-20 h-20 sm:w-22 sm:h-22 rounded-2xl overflow-hidden shrink-0 bg-slate-100 border border-slate-100 shadow-inner">
          <img
            src={coverImage}
            alt={placeName}
            referrerPolicy="no-referrer"
            className={`w-full h-full object-cover group-hover:scale-105 transition-all duration-300 ${
              isVisited ? "grayscale contrast-105 opacity-85" : ""
            }`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          <div className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded-md bg-white/90 text-[10px] font-bold text-slate-900 flex items-center gap-1 shadow-xs">
            <span>{getActivityIcon(place.categoria)}</span>
          </div>
        </div>

        {/* Info Column */}
        <div className="flex-1 min-w-0 pr-6">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-0.5">
            <span 
              className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded"
              style={{ backgroundColor: `${strokeColor}20`, color: strokeColor }}
            >
              {place.categoria}
            </span>
            <span>•</span>
            <span className="truncate flex items-center gap-1">
              {place.paese && <span>{getCountryFlag(place.paese)}</span>}
              <span>{place.citta_o_zona}</span>
            </span>
          </div>

          <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight leading-snug truncate group-hover:text-blue-600 transition-colors">
            {placeName}
          </h3>

          {/* Key Badges */}
          <div className="flex items-center gap-1.5 flex-wrap mt-1.5 text-[10px]">
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
              <Clock className="w-2.5 h-2.5 text-amber-500" />
              <span>{place.metadata_ai_nascosti?.durata_stimata_minuti || 90} min</span>
            </span>

            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
              {place.metadata_ai_nascosti?.momento_ideale || "Mattina"}
            </span>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleVisited(place.id);
              }}
              className={`flex items-center gap-1 px-2 py-0.5 rounded-full font-bold transition-colors ${
                isVisited
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {isVisited ? (
                <>
                  <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                  <span>Visitato</span>
                </>
              ) : (
                <>
                  <Circle className="w-2.5 h-2.5 text-slate-400" />
                  <span>Da visitare</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Bottom actions row */}
      <div className="flex items-center justify-between gap-2 mt-2.5 pt-2 border-t border-slate-100">
        <a
          id={`compact-nav-${place.id}`}
          href={googleMapsNavUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-xs transition-all active:scale-95"
        >
          <Navigation className="w-3.5 h-3.5 fill-white" />
          <span>Naviga con Maps</span>
        </a>

        <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-600 group-hover:text-slate-900">
          <span>Tocca per dettagli</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </div>
  );
};
