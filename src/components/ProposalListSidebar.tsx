import React, { useState } from "react";
import { 
  Sparkles, 
  MapPin, 
  Navigation, 
  CheckCircle2, 
  Circle, 
  Copy, 
  Check, 
  Share2, 
  Video, 
  Play, 
  Mountain, 
  Car, 
  Utensils, 
  Sun, 
  Snowflake, 
  Landmark, 
  Compass, 
  TrendingUp,
  Clock,
  ChevronRight,
  ExternalLink
} from "lucide-react";
import { SavedPlace, ActivityFilterKey } from "../types";
import { getActivityColor } from "../data/categories";

interface ProposalListSidebarProps {
  places: SavedPlace[];
  allPlaces: SavedPlace[];
  selectedPlace: SavedPlace | null;
  onSelectPlace: (place: SavedPlace) => void;
  onOpenDetails: (place: SavedPlace) => void;
  onToggleVisited: (id: string) => void;
  onOpenExtractor: () => void;
  activeActivity: ActivityFilterKey;
  isExperienceMode?: boolean;
}

export const ProposalListSidebar: React.FC<ProposalListSidebarProps> = ({
  places,
  allPlaces,
  selectedPlace,
  onSelectPlace,
  onOpenDetails,
  onToggleVisited,
  onOpenExtractor,
  activeActivity,
  isExperienceMode = false,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (e: React.MouseEvent, place: SavedPlace) => {
    e.stopPropagation();
    const name = place.nome || place.nome_luogo;
    const loc = place.citta_o_zona;
    const text = `${name}, ${loc} (Coordinate GPS: ${place.coordinate?.lat}, ${place.coordinate?.lng})`;
    navigator.clipboard.writeText(text);
    setCopiedId(place.id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const handleShare = async (e: React.MouseEvent, place: SavedPlace) => {
    e.stopPropagation();
    const name = place.nome || place.nome_luogo;
    const loc = place.citta_o_zona;
    const navUrl = `https://www.google.com/maps/dir/?api=1&destination=${place.coordinate?.lat},${place.coordinate?.lng}`;
    const shareText = `Ti consiglio questo posto scoperto con SpotFinder AI: ${name} (${loc})!
${place.riassunto_ai_minimal || ""}
Apri il navigatore per arrivarci: ${navUrl}`;

    if (navigator.share) {
      try {
        await navigator.share({ title: name, text: shareText, url: navUrl });
      } catch {
        // Ignored
      }
    } else {
      navigator.clipboard.writeText(shareText);
      alert("Testo per consigliare agli amici copiato negli appunti!");
    }
  };

  // Group places by activity if "tutti" is active
  const activityGroups: { title: string; icon: React.ReactNode; color: string; items: SavedPlace[] }[] = [];

  if (activeActivity === "tutti") {
    const passes = places.filter(
      (p) =>
        (p.categoria || "").toLowerCase().includes("pass") ||
        (p.categoria || "").toLowerCase().includes("auto")
    );
    const trekking = places.filter(
      (p) =>
        (p.categoria || "").toLowerCase().includes("trek") ||
        (p.categoria || "").toLowerCase().includes("sentier")
    );
    const sundayMountain = places.filter(
      (p) =>
        (p.categoria || "").toLowerCase().includes("domenica") ||
        (p.categoria || "").toLowerCase().includes("montagna")
    );
    const food = places.filter(
      (p) =>
        (p.categoria || "").toLowerCase().includes("ristoran") ||
        (p.categoria || "").toLowerCase().includes("cibo")
    );
    const ski = places.filter(
      (p) =>
        (p.categoria || "").toLowerCase().includes("sci") ||
        (p.categoria || "").toLowerCase().includes("inverno")
    );
    const others = places.filter(
      (p) =>
        !passes.includes(p) &&
        !trekking.includes(p) &&
        !sundayMountain.includes(p) &&
        !food.includes(p) &&
        !ski.includes(p)
    );

    if (passes.length > 0) {
      activityGroups.push({
        title: "Giro in Auto & Valichi Panoramici",
        icon: <Car className="w-4 h-4 text-orange-500" />,
        color: "#ea580c",
        items: passes,
      });
    }
    if (trekking.length > 0) {
      activityGroups.push({
        title: "Trekking & Sentieri Alpini",
        icon: <Mountain className="w-4 h-4 text-emerald-600" />,
        color: "#16a34a",
        items: trekking,
      });
    }
    if (sundayMountain.length > 0) {
      activityGroups.push({
        title: "Domenica in Montagna (Baite & Laghi)",
        icon: <Sun className="w-4 h-4 text-teal-600" />,
        color: "#059669",
        items: sundayMountain,
      });
    }
    if (food.length > 0) {
      activityGroups.push({
        title: "Ristoranti & Sapori Locali",
        icon: <Utensils className="w-4 h-4 text-rose-600" />,
        color: "#e11d48",
        items: food,
      });
    }
    if (ski.length > 0) {
      activityGroups.push({
        title: "Piste da Sci & Sport Invernali",
        icon: <Snowflake className="w-4 h-4 text-sky-600" />,
        color: "#0284c7",
        items: ski,
      });
    }
    if (others.length > 0) {
      activityGroups.push({
        title: "Passeggiate & Altri Punti",
        icon: <Landmark className="w-4 h-4 text-violet-600" />,
        color: "#7c3aed",
        items: others,
      });
    }
  } else {
    // Single active group
    activityGroups.push({
      title: `Proposte per questa attività`,
      icon: <Compass className="w-4 h-4 text-indigo-600" />,
      color: "#4f46e5",
      items: places,
    });
  }

  const renderCardItem = (p: SavedPlace) => {
    const isSelected = selectedPlace?.id === p.id;
    const isVisited = p.stato_iniziale?.visitato || p.visited;
    const isRoute = p.tipo_entita === "PERCORSO";
    const strokeColor = p.dati_grafici?.colore_badge_consigliato || getActivityColor(p.categoria);
    const placeName = p.nome || p.nome_luogo;
    const googleMapsNavUrl = `https://www.google.com/maps/dir/?api=1&destination=${p.coordinate?.lat},${p.coordinate?.lng}`;

    return (
      <div
        key={p.id}
        id={`proposal-card-${p.id}`}
        onClick={() => onSelectPlace(p)}
        className={`group relative rounded-2xl border p-3.5 transition-all text-left cursor-pointer ${
          isSelected
            ? "border-indigo-500 bg-indigo-50/70 shadow-md ring-1 ring-indigo-400"
            : isVisited
            ? "border-emerald-200 bg-emerald-50/20 hover:border-emerald-300"
            : "border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/60 shadow-2xs"
        }`}
      >
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white shadow-2xs uppercase tracking-wider"
              style={{ backgroundColor: strokeColor }}
            >
              {isRoute ? "⛰️ Percorso" : "📍 Punto"}
            </span>

            <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
              {p.categoria}
            </span>

            {p.stato_iniziale?.consigliato_algoritmo && (
              <span className="flex items-center gap-0.5 text-[10px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.2 rounded-md">
                <Sparkles className="w-2.5 h-2.5 text-amber-600" />
                <span>Top</span>
              </span>
            )}

            {p.video_attachment && (
              <span className="flex items-center gap-0.5 text-[10px] font-bold text-orange-700 bg-orange-100 px-1.5 py-0.2 rounded-md">
                <Video className="w-2.5 h-2.5 text-orange-600" />
                <span>Video</span>
              </span>
            )}
          </div>

          {/* Visited Checkbox */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleVisited(p.id);
            }}
            title={isVisited ? "Già visitato (clicca per modificare)" : "Segna come visitato"}
            className="p-1 rounded-lg text-slate-400 hover:text-emerald-600 transition-colors"
          >
            {isVisited ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 fill-emerald-100" />
            ) : (
              <Circle className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Place Title & Location */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h4 className="font-bold text-xs sm:text-sm text-slate-900 truncate leading-snug group-hover:text-indigo-600 transition-colors">
              {placeName}
            </h4>
            <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5 truncate">
              <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
              <span className="truncate">{p.citta_o_zona}</span>
            </div>
          </div>
        </div>

        {/* Minimal AI Summary */}
        {p.riassunto_ai_minimal && (
          <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed mt-2 bg-slate-50 p-2 rounded-xl border border-slate-100/90">
            {p.riassunto_ai_minimal}
          </p>
        )}

        {/* Stats Row */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2.5 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-2">
            {p.metadata_ai_nascosti?.durata_stimata_minuti && (
              <span className="flex items-center gap-1 font-medium text-slate-600">
                <Clock className="w-3 h-3 text-amber-500" />
                <span>{p.metadata_ai_nascosti.durata_stimata_minuti}m</span>
              </span>
            )}
            {p.metadata_ai_nascosti?.dislivello_metri && (
              <span className="font-semibold text-slate-700">
                +{p.metadata_ai_nascosti.dislivello_metri}m
              </span>
            )}
            {isVisited && (
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                ✓ Visto
              </span>
            )}
          </div>

          {/* Action Row */}
          <div className="flex items-center gap-1">
            {/* Quick Google Maps GPS Navigation */}
            <a
              id={`proposal-nav-${p.id}`}
              href={googleMapsNavUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              title="Naviga subito su Google Maps"
              className="flex items-center gap-0.5 px-2 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] transition-colors"
            >
              <Navigation className="w-3 h-3" />
              <span>Naviga</span>
            </a>

            {/* Quick Copy Address */}
            <button
              id={`proposal-copy-${p.id}`}
              type="button"
              onClick={(e) => handleCopy(e, p)}
              title="Copia indirizzo e coordinate per il navigatore"
              className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            >
              {copiedId === p.id ? (
                <Check className="w-3 h-3 text-emerald-600" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
            </button>

            {/* Share with Friends */}
            <button
              type="button"
              onClick={(e) => handleShare(e, p)}
              title="Consiglia ad amici"
              className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            >
              <Share2 className="w-3 h-3" />
            </button>

            {/* View full details */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenDetails(p);
              }}
              className="px-2 py-1 rounded-lg bg-slate-900 text-white font-bold text-[10px] hover:bg-slate-800 transition-colors"
            >
              Scheda
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full bg-white rounded-3xl border border-slate-200 shadow-xs flex flex-col overflow-hidden">
      {/* Sidebar Header */}
      <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-1.5">
            <h3 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wide">
              {isExperienceMode ? "Consigliati per le tue esperienze" : "Proposte & Consigliati"}
            </h3>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
              {places.length}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 font-medium mt-0.5">
            {isExperienceMode
              ? "Basati sui luoghi e passi alpini che hai già visitato"
              : "Seleziona per inquadrare sulla mappa o avviare il navigatore"}
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenExtractor}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-xs transition-colors shrink-0"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-200" />
          <span>+ Nuovo</span>
        </button>
      </div>

      {/* Sidebar Content (Scrollable) */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-4">
        {places.length === 0 ? (
          <div className="text-center py-12 px-4 space-y-3">
            <Compass className="w-8 h-8 mx-auto text-slate-300" />
            <h4 className="text-xs font-bold text-slate-700">Nessuna proposta per questo filtro</h4>
            <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
              Prova a cambiare attività, selezionare "Mostra Tutto" o estrarre nuovi posti da un video.
            </p>
          </div>
        ) : (
          activityGroups.map((group, groupIdx) => (
            <div key={groupIdx} className="space-y-2">
              {/* Category Group Header (when in tutti mode) */}
              {activeActivity === "tutti" && (
                <div className="flex items-center justify-between pt-1 pb-0.5 px-1">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-slate-800">
                    {group.icon}
                    <span>{group.title}</span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400">
                    {group.items.length}
                  </span>
                </div>
              )}

              {/* Cards in this group */}
              <div className="space-y-2.5">
                {group.items.map((p) => renderCardItem(p))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
