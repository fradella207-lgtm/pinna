import React from "react";
import { 
  Sparkles, 
  Map, 
  ListOrdered, 
  Search, 
  Compass, 
  Layers,
  Video,
  Mountain
} from "lucide-react";

interface HeaderProps {
  currentTab: "map" | "places" | "lists";
  onTabChange: (tab: "map" | "places" | "lists") => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenExtractor: () => void;
  totalPlaces: number;
  routesCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onTabChange,
  searchQuery,
  onSearchChange,
  onOpenExtractor,
  totalPlaces,
  routesCount,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3.5">
        <div className="flex items-center justify-between gap-3">
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-violet-600 text-white flex items-center justify-center shadow-xs shrink-0">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                  SpotFinder <span className="text-indigo-600">AI</span>
                </h1>
                <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-300">
                  🛰️ Mappa Satellitare &amp; Video
                </span>
              </div>
              <p className="hidden md:block text-[11px] text-slate-500 font-medium">
                Mappa e organizza Passi di montagna, Trekking, Baite e Ristoranti da Reel e TikTok
              </p>
            </div>
          </div>

          {/* Search bar on desktop */}
          <div className="hidden md:flex items-center relative flex-1 max-w-xs">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
            <input
              id="input-global-search"
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Cerca percorsi, passi, vette, città..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-indigo-600 focus:bg-white transition-all"
            />
          </div>

          {/* Primary CTA: Extract from Reel / Video */}
          <div className="flex items-center gap-2">
            <button
              id="btn-open-extractor-header"
              type="button"
              onClick={onOpenExtractor}
              className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-2xl bg-gradient-to-r from-orange-600 via-amber-600 to-indigo-700 hover:from-orange-700 hover:to-indigo-800 text-white font-bold text-xs shadow-xs transition-all hover:shadow-md active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-200" />
              <span>+ Analizza Reel / Video</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="flex items-center justify-between pt-2.5 mt-1.5 border-t border-slate-100">
          <nav className="flex items-center gap-1 sm:gap-2">
            {/* Map-First Tab (Default) */}
            <button
              id="tab-btn-map"
              type="button"
              onClick={() => onTabChange("map")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                currentTab === "map"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <Map className="w-3.5 h-3.5 text-amber-400" />
              <span>Mappa &amp; Proposte</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                currentTab === "map" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
              }`}>
                {totalPlaces}
              </span>
            </button>

            {/* Places Grid Tab */}
            <button
              id="tab-btn-places"
              type="button"
              onClick={() => onTabChange("places")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                currentTab === "places"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <ListOrdered className="w-3.5 h-3.5" />
              <span>Schede &amp; Griglia</span>
            </button>

            {/* Lists Tab */}
            <button
              id="tab-btn-lists"
              type="button"
              onClick={() => onTabChange("lists")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                currentTab === "lists"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Raccolte &amp; Stagioni</span>
            </button>
          </nav>

          {/* Quick badge on right */}
          <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-slate-500">
            <span className="flex items-center gap-1">
              <Mountain className="w-3.5 h-3.5 text-orange-500" />
              <span>{routesCount} Percorsi</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Video className="w-3.5 h-3.5 text-amber-500" />
              <span>Con Video</span>
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
