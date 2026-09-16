import React from "react";
import { 
  X, 
  User, 
  LogOut, 
  LogIn, 
  Cloud, 
  Sparkles, 
  Download, 
  Shield, 
  Info, 
  ChevronRight,
  Heart,
  MessageSquarePlus,
  Compass,
  Check
} from "lucide-react";
import { motion } from "motion/react";
import { useAuth } from "../context/AuthContext";
import { SavedPlace } from "../types";

interface SettingsModalProps {
  places: SavedPlace[];
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ places }) => {
  const { 
    isSettingsOpen, 
    closeSettings, 
    user, 
    signOut, 
    openAuthModal, 
    openFeedback 
  } = useAuth();

  if (!isSettingsOpen) return null;

  const handleExportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(places, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `pinna_spots_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <motion.div
      id="modal-settings"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/60 backdrop-blur-sm"
    >
      <div onClick={closeSettings} className="absolute inset-0" />

      <motion.div
        initial={{ y: "100%", opacity: 0.8 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0 }}
        transition={{ type: "spring", stiffness: 360, damping: 30 }}
        className="relative w-full sm:max-w-md max-h-[92vh] bg-white text-slate-900 rounded-t-3xl sm:rounded-3xl border border-slate-200 shadow-2xl flex flex-col overflow-hidden z-10"
      >
        {/* Header */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
              <Compass className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                Impostazioni
              </h2>
              <p className="text-[11px] text-slate-500">
                Gestione account, dati e preferenze
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={closeSettings}
            className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* 1. Account Card */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Profilo & Account
              </span>
              {user ? (
                <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-md font-bold">
                  <Cloud className="w-2.5 h-2.5" /> Sincronizzato Cloud
                </span>
              ) : (
                <span className="text-[10px] text-amber-700 bg-amber-100/70 px-2 py-0.5 rounded-md font-bold">
                  Modalità Locale
                </span>
              )}
            </div>

            {user ? (
              <div className="flex items-center gap-3">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || "Avatar"}
                    referrerPolicy="no-referrer"
                    className="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-xs"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold">
                    <User className="w-5 h-5" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-slate-900 truncate">
                    {user.displayName || "Utente pinna"}
                  </div>
                  <div className="text-[11px] text-slate-500 truncate">
                    {user.email || (user.isAnonymous ? "Account Ospite" : "")}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-xs text-slate-600 leading-relaxed">
                  Accedi per salvare i tuoi spot su database Cloud e ritrovarli su qualsiasi dispositivo.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    closeSettings();
                    openAuthModal();
                  }}
                  className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Accedi o Registrati</span>
                </button>
              </div>
            )}

            {user && (
              <div className="pt-2 border-t border-slate-200 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    signOut().catch(console.error);
                  }}
                  className="text-xs text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1.5 py-1 px-2 rounded-lg hover:bg-rose-50 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Disconnetti</span>
                </button>
              </div>
            )}
          </div>

          {/* 2. Feature Section: Segnala e aiutaci a migliorare */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">
              Community & Supporto
            </span>
            <button
              type="button"
              onClick={() => {
                closeSettings();
                openFeedback();
              }}
              className="w-full p-3.5 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 border border-amber-200/80 text-left flex items-center justify-between transition-all group shadow-xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
                  <MessageSquarePlus className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 group-hover:text-amber-950">
                    Segnala e Aiutaci a Migliorare
                  </div>
                  <div className="text-[11px] text-slate-600">
                    Invia un feedback, suggerisci idee o segnala un bug
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-amber-600 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {/* 3. Dati & Backup */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">
              I Tuoi Luoghi & Dati
            </span>
            <div className="bg-slate-50 rounded-2xl border border-slate-200/80 divide-y divide-slate-200/60 overflow-hidden text-xs">
              <div className="p-3.5 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-800">Spot e Luoghi Salvati</div>
                  <div className="text-[11px] text-slate-500">
                    {places.length} luoghi memorizzati nel tuo profilo
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleExportData}
                  className="px-2.5 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 font-bold text-slate-700 flex items-center gap-1.5 shadow-2xs transition-all"
                  title="Scarica un file di backup JSON"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Esporta JSON</span>
                </button>
              </div>

              <div className="p-3.5 flex items-center justify-between text-slate-600">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-slate-400" />
                  <span>Privacy e Sicurezza Dati</span>
                </div>
                <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                  <Check className="w-3 h-3" /> Privati
                </span>
              </div>
            </div>
          </div>

          {/* 4. App Info */}
          <div className="pt-2 text-center text-slate-400 space-y-1">
            <div className="flex items-center justify-center gap-1 text-xs font-bold text-slate-700">
              <span>pinna</span>
              <span className="text-[10px] font-normal px-1.5 py-0.5 bg-slate-100 rounded-md text-slate-600">
                v1.2
              </span>
            </div>
            <p className="text-[10px] leading-relaxed">
              Il tuo taccuino geografico per passi montani, natura e spot speciali.
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
