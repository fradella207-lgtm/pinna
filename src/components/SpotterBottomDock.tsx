import React from "react";
import { Map, Plus, Bookmark } from "lucide-react";
import { motion } from "motion/react";

export type DockActiveTab = "map" | "places";

interface SpotterBottomDockProps {
  activeTab: DockActiveTab;
  onSelectTab: (tab: DockActiveTab) => void;
  onOpenAddModal: () => void;
  savedPlacesCount: number;
}

export const SpotterBottomDock: React.FC<SpotterBottomDockProps> = ({
  activeTab,
  onSelectTab,
  onOpenAddModal,
  savedPlacesCount,
}) => {
  return (
    <div className="fixed bottom-5 left-0 right-0 z-50 pointer-events-none flex justify-center px-4">
      {/* Light & Ultra-Minimalist Floating Pill Dock - Symbols Only */}
      <motion.nav
        id="spotter-bottom-dock"
        aria-label="Navigazione Spotter"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="pointer-events-auto flex items-center justify-center gap-2 p-1.5 bg-white/95 backdrop-blur-2xl border border-slate-200/90 rounded-full shadow-[0_12px_40px_rgba(15,23,42,0.18)] transition-all duration-200"
      >
        {/* 1. Mappa Satellitare (🗺️) */}
        <motion.button
          id="dock-tab-map"
          type="button"
          whileTap={{ scale: 0.88 }}
          whileHover={{ scale: 1.06 }}
          onClick={() => onSelectTab("map")}
          className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors ${
            activeTab === "map"
              ? "bg-slate-900 text-white shadow-xs"
              : "text-slate-500 hover:text-slate-900 hover:bg-slate-100/80"
          }`}
          title="Vista Mappa Satellitare"
        >
          <Map className="w-5 h-5 stroke-[2.1]" />
          <span className="sr-only">Mappa</span>
        </motion.button>

        {/* 2. Tasto Centrale (+) ad alto contrasto per aggiungere */}
        <motion.button
          id="dock-btn-add"
          type="button"
          whileTap={{ scale: 0.9 }}
          whileHover={{ scale: 1.08 }}
          onClick={onOpenAddModal}
          className="w-12 h-12 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-[0_6px_20px_rgba(15,23,42,0.35)] hover:bg-slate-800 transition-colors focus:outline-none"
          title="Aggiungi luogo o incolla link Reel/TikTok"
        >
          <Plus className="w-6 h-6 stroke-[2.75]" />
          <span className="sr-only">Aggiungi nuovo luogo</span>
        </motion.button>

        {/* 3. I Miei Luoghi (🔖) */}
        <motion.button
          id="dock-tab-places"
          type="button"
          whileTap={{ scale: 0.88 }}
          whileHover={{ scale: 1.06 }}
          onClick={() => onSelectTab("places")}
          className={`relative w-11 h-11 rounded-full flex items-center justify-center transition-colors ${
            activeTab === "places"
              ? "bg-slate-900 text-white shadow-xs"
              : "text-slate-500 hover:text-slate-900 hover:bg-slate-100/80"
          }`}
          title="I Miei Luoghi Salvati"
        >
          <Bookmark className="w-5 h-5 stroke-[2.1]" />
          {savedPlacesCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-600 ring-2 ring-white" />
          )}
          <span className="sr-only">I Miei Luoghi</span>
        </motion.button>
      </motion.nav>
    </div>
  );
};
