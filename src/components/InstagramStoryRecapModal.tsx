import React, { useRef, useState } from "react";
import { 
  X, 
  Download, 
  Share2, 
  Check, 
  Sparkles, 
  MapPin, 
  Compass, 
  Calendar,
  Camera,
  Quote
} from "lucide-react";
import { SavedPlace } from "../types";
import { getActivityIcon } from "../data/categories";

interface InstagramStoryRecapModalProps {
  place: SavedPlace | null;
  onClose: () => void;
}

export const InstagramStoryRecapModal: React.FC<InstagramStoryRecapModalProps> = ({
  place,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  if (!place) return null;

  const placeName = place.nome || place.nome_luogo || "Spotter Place";
  const coverImg = (place.user_photos && place.user_photos[0]) || 
    place.dati_grafici?.cover_image_url || 
    "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1080&auto=format&fit=crop&q=90";

  const isVisited = Boolean(place.stato_iniziale?.visitato || place.visited);
  const dateVisited = place.visited_date || new Date().toLocaleDateString("it-IT", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const handleCopyShareText = () => {
    const text = `📍 ${placeName}, ${place.citta_o_zona} (Spotter Travel)\n` +
      `📌 ${place.categoria} | GPS: ${place.coordinate?.lat.toFixed(4)}, ${place.coordinate?.lng.toFixed(4)}\n` +
      (place.user_notes ? `💭 Note: "${place.user_notes}"\n` : "") +
      `✨ Tappa esplorata con Spotter App`;

    if (navigator.share) {
      navigator.share({
        title: `Spotter Recap - ${placeName}`,
        text: text,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadStoryImage = async () => {
    setIsDownloading(true);
    try {
      // Create high-res 1080x1920 Canvas
      const canvas = document.createElement("canvas");
      canvas.width = 1080;
      canvas.height = 1920;
      const ctx = canvas.getContext("2d");

      if (!ctx) return;

      // Draw background image
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = coverImg;

      await new Promise((resolve) => {
        img.onload = resolve;
        img.onerror = resolve;
      });

      // Aspect fill the 1080x1920 canvas
      const scale = Math.max(canvas.width / img.width, canvas.height / img.height);
      const x = (canvas.width / 2) - (img.width / 2) * scale;
      const y = (canvas.height / 2) - (img.height / 2) * scale;
      ctx.drawImage(img, x, y, img.width * scale, img.height * scale);

      // Add dark cinematic gradients
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, "rgba(0, 0, 0, 0.7)");
      gradient.addColorStop(0.3, "rgba(0, 0, 0, 0.15)");
      gradient.addColorStop(0.65, "rgba(0, 0, 0, 0.4)");
      gradient.addColorStop(1, "rgba(0, 0, 0, 0.92)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 1. Top Brand Stamp: "SPOTTER • TRAVEL DIARY"
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 32px sans-serif";
      ctx.letterSpacing = "6px";
      ctx.fillText("SPOTTER • TRAVEL DIARY", 80, 140);

      // Visited badge or status
      ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
      ctx.font = "24px sans-serif";
      ctx.letterSpacing = "2px";
      ctx.fillText(`VERIFIED SPOT • ${dateVisited.toUpperCase()}`, 80, 185);

      // 2. Category badge pill
      ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
      ctx.beginPath();
      ctx.roundRect(80, 225, 340, 56, 28);
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 24px sans-serif";
      ctx.fillText(`${place.categoria.toUpperCase()}`, 110, 262);

      // 3. Main Bottom Section: Title, Location, Notes
      const startBottomY = 1350;

      // Location City
      ctx.fillStyle = "#facc15"; // Yellow amber accent
      ctx.font = "bold 28px sans-serif";
      ctx.letterSpacing = "2px";
      ctx.fillText(`📍 ${place.citta_o_zona.toUpperCase()}`, 80, startBottomY);

      // Place Name (Large Title)
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 76px sans-serif";
      ctx.letterSpacing = "-1px";
      
      // Multi-line wrap for place name
      const words = placeName.split(" ");
      let line = "";
      let titleY = startBottomY + 80;
      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + " ";
        const metrics = ctx.measureText(testLine);
        if (metrics.width > 920 && n > 0) {
          ctx.fillText(line, 80, titleY);
          line = words[n] + " ";
          titleY += 85;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, 80, titleY);

      // GPS Coordinates Stamp
      ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
      ctx.font = "24px monospace";
      ctx.fillText(
        `GPS: ${place.coordinate?.lat.toFixed(4)}° N, ${place.coordinate?.lng.toFixed(4)}° E`,
        80,
        titleY + 55
      );

      // Personal User Note (if exists)
      if (place.user_notes) {
        const noteBoxY = titleY + 95;
        ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
        ctx.beginPath();
        ctx.roundRect(80, noteBoxY, 920, 130, 24);
        ctx.fill();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
        ctx.stroke();

        ctx.fillStyle = "#fef08a";
        ctx.font = "italic 28px sans-serif";
        ctx.fillText(`"${place.user_notes}"`, 115, noteBoxY + 75);
      }

      // Bottom Watermark
      ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
      ctx.font = "bold 24px sans-serif";
      ctx.letterSpacing = "3px";
      ctx.fillText("SAVED WITH SPOTTER", 80, 1820);

      // Trigger download
      const dataUrl = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `Spotter-Recap-${placeName.replace(/\s+/g, "_")}.png`;
      a.click();
    } catch (err) {
      console.error("Errore salvataggio recap", err);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div 
      id="instagram-recap-modal"
      className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div onClick={onClose} className="absolute inset-0" />

      <div className="relative w-full max-w-sm bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-white/10 flex flex-col animate-in zoom-in-95 duration-150 text-white">
        
        {/* Top Floating Controls */}
        <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between pointer-events-auto">
          <div className="px-3 py-1 rounded-full bg-black/40 backdrop-blur-md text-[11px] font-bold text-white/90 border border-white/10 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Story Recap</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 9:16 Instagram Story Preview Card */}
        <div 
          ref={cardRef}
          className="relative w-full aspect-[9/16] overflow-hidden bg-slate-950 flex flex-col justify-between p-6 select-none"
        >
          {/* Background Image */}
          <img
            src={coverImg}
            alt={placeName}
            referrerPolicy="no-referrer"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/20 to-black/90 pointer-events-none" />

          {/* Top Story Branding */}
          <div className="relative z-10 pt-8 space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black tracking-widest uppercase text-white/90">
                SPOTTER • TRAVEL DIARY
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold tracking-wider text-white/75 uppercase flex items-center gap-1">
                <Calendar className="w-3 h-3 text-amber-400" />
                <span>{isVisited ? `Visitato • ${dateVisited}` : "Tappa in programma"}</span>
              </span>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold text-white border border-white/20 mt-1">
              <span>{getActivityIcon(place.categoria)}</span>
              <span>{place.categoria}</span>
            </div>
          </div>

          {/* Bottom Story Content */}
          <div className="relative z-10 space-y-3 pb-2">
            <div>
              <div className="text-xs font-bold tracking-wider uppercase text-amber-300 flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                <span>{place.citta_o_zona}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight text-white mt-0.5 drop-shadow-md">
                {placeName}
              </h2>
              <div className="text-[10px] font-mono text-white/60 mt-1 flex items-center gap-1">
                <Compass className="w-3 h-3 text-indigo-400" />
                <span>GPS: {place.coordinate?.lat.toFixed(4)}° N, {place.coordinate?.lng.toFixed(4)}° E</span>
              </div>
            </div>

            {/* User Note Quote */}
            {place.user_notes && (
              <div className="p-3 rounded-2xl bg-black/40 backdrop-blur-md border border-white/15 text-xs text-amber-100 font-medium leading-relaxed flex items-start gap-2">
                <Quote className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <span>"{place.user_notes}"</span>
              </div>
            )}

            <div className="text-[10px] font-bold tracking-widest text-white/40 uppercase pt-1">
              SAVED WITH SPOTTER
            </div>
          </div>
        </div>

        {/* Action Buttons Footer */}
        <div className="p-3.5 bg-slate-900 border-t border-white/10 flex items-center gap-2">
          <button
            type="button"
            onClick={handleDownloadStoryImage}
            disabled={isDownloading}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-2xl bg-white text-slate-950 font-bold text-xs shadow-md hover:bg-slate-100 active:scale-95 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>{isDownloading ? "Creazione..." : "Scarica Story (PNG)"}</span>
          </button>

          <button
            type="button"
            onClick={handleCopyShareText}
            className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="Condividi o copia testo"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};
