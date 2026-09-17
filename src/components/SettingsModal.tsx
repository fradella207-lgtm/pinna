import React, { useState } from "react";
import { 
  X, 
  User, 
  LogOut, 
  LogIn, 
  Cloud, 
  Download, 
  Shield, 
  ChevronRight,
  MessageSquarePlus,
  Check,
  Moon,
  Sun,
  Monitor,
  Languages,
  Trash2,
  AlertTriangle,
  RefreshCw,
  ArrowRight,
  ChevronLeft,
  Info
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "../context/AuthContext";
import { usePreferences, AppTheme, AppLanguage } from "../context/PreferencesContext";
import { SavedPlace } from "../types";

interface SettingsModalProps {
  places: SavedPlace[];
  onClearAllData?: () => Promise<void>;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ places, onClearAllData }) => {
  const { 
    isSettingsOpen, 
    closeSettings, 
    user, 
    signOut, 
    openAuthModal, 
    openFeedback 
  } = useAuth();

  const { theme, setTheme, language, setLanguage, isDarkMode, t } = usePreferences();

  // 3-step delete workflow:
  // step 0 = default collapsed view with "Elimina tutti i luoghi e resetta l'applicazione" button
  // step 1 = explanation section explaining what it does
  // step 2 = final confirmation prompt with confirmation button
  const [deleteStep, setDeleteStep] = useState<0 | 1 | 2>(0);
  const [isClearing, setIsClearing] = useState(false);
  const [clearSuccess, setClearSuccess] = useState(false);
  const [saveToast, setSaveToast] = useState(false);

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

  const handleExecuteClearData = async () => {
    setIsClearing(true);
    try {
      if (onClearAllData) {
        await onClearAllData();
      }
      setClearSuccess(true);
      setDeleteStep(0);
      setTimeout(() => {
        setClearSuccess(false);
      }, 4000);
    } catch (err) {
      console.error("Error clearing data:", err);
    } finally {
      setIsClearing(false);
    }
  };

  const handleSaveAndConfirm = () => {
    setSaveToast(true);
    setTimeout(() => {
      setSaveToast(false);
      closeSettings();
    }, 500);
  };

  const languageOptions: { id: AppLanguage; label: string; flag: string }[] = [
    { id: "it", label: "Italiano", flag: "🇮🇹" },
    { id: "en", label: "English", flag: "🇬🇧" },
    { id: "de", label: "Deutsch", flag: "🇩🇪" },
    { id: "fr", label: "Français", flag: "🇫🇷" },
    { id: "es", label: "Español", flag: "🇪🇸" },
  ];

  return (
    <motion.div
      id="modal-settings"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/70 backdrop-blur-md"
    >
      <div onClick={closeSettings} className="absolute inset-0" />

      <motion.div
        initial={{ y: "100%", opacity: 0.8 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0 }}
        transition={{ type: "spring", stiffness: 360, damping: 30 }}
        className="relative w-full sm:max-w-lg max-h-[92vh] bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-t-3xl sm:rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden z-10 transition-colors duration-200"
      >
        {/* Header */}
        <div className="px-6 pt-5 pb-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-900/80">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-900 dark:bg-white" />
              <span>{t.settingsTitle}</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {t.settingsSubtitle}
            </p>
          </div>

          <button
            type="button"
            onClick={closeSettings}
            className="p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            title="Chiudi"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6">

          {/* 1. Account Card */}
          <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/90 dark:border-slate-800 space-y-3">
            <div className="flex items-center gap-3">
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || "Avatar"}
                  referrerPolicy="no-referrer"
                  className="w-12 h-12 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 shadow-xs"
                />
              ) : (
                <div className="w-12 h-12 rounded-2xl bg-slate-900 dark:bg-slate-700 text-white flex items-center justify-center font-bold text-base shadow-xs">
                  <User className="w-6 h-6" />
                </div>
              )}

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                    {user?.displayName || (user ? t.registeredUser : t.guestUser)}
                  </h3>
                  {user && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100/70 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200/60 dark:border-emerald-800">
                      <Cloud className="w-2.5 h-2.5" />
                      <span>{t.cloudActive}</span>
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                  {user?.email || t.localOnlyText}
                </p>
              </div>
            </div>

            {!user ? (
              <div className="pt-2.5 border-t border-slate-200/80 dark:border-slate-800 space-y-2.5">
                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                  {t.loginText}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    closeSettings();
                    openAuthModal();
                  }}
                  className="w-full py-2.5 px-3 rounded-xl bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 text-white dark:text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-xs active:scale-98"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>{t.loginButton}</span>
                </button>
              </div>
            ) : (
              <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    signOut().catch(console.error);
                  }}
                  className="text-xs text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 font-semibold flex items-center gap-1.5 py-1.5 px-2.5 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>{t.logoutButton}</span>
                </button>
              </div>
            )}
          </div>

          {/* 2. Preferenze Tema & Lingua Reattiva */}
          <div className="space-y-3">
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-1">
              {t.customizationSection}
            </span>

            {/* Tema Grafico */}
            <div className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/90 dark:border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                  <Sun className="w-4 h-4 text-amber-500" />
                  <span>{t.themeTitle}</span>
                </div>
                <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">
                  {theme === "light" ? t.themeLight : theme === "dark" ? t.themeDark : t.themeAuto}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 text-[11px] font-bold">
                {(
                  [
                    { id: "light", label: t.themeLight, icon: Sun },
                    { id: "dark", label: t.themeDark, icon: Moon },
                    { id: "system", label: t.themeAuto, icon: Monitor },
                  ] as const
                ).map((item) => {
                  const Icon = item.icon;
                  const isSelected = theme === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setTheme(item.id as AppTheme)}
                      className={`py-2 rounded-lg flex flex-col items-center justify-center gap-1 transition-all ${
                        isSelected
                          ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-xs"
                          : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Lingua dell'App con Selezione Istantanea e Reattiva */}
            <div className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/90 dark:border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                  <Languages className="w-4 h-4 text-sky-500" />
                  <span>{t.languageTitle}</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200/60 dark:border-emerald-800 flex items-center gap-1">
                  <Check className="w-3 h-3 stroke-[2.5]" />
                  <span>Reattivo</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {t.languageSub}
              </p>

              {/* Language Pills / Buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 p-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold">
                {languageOptions.map((item) => {
                  const isSelected = language === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setLanguage(item.id)}
                      className={`py-2 px-2.5 rounded-lg flex items-center justify-between transition-all ${
                        isSelected
                          ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-xs font-bold"
                          : "text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800"
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm">{item.flag}</span>
                        <span className="text-[11px] truncate">{item.label}</span>
                      </div>
                      {isSelected && (
                        <Check className="w-3.5 h-3.5 text-emerald-400 dark:text-emerald-600 stroke-[2.5] shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          {/* 3. Community & Feedback */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-1">
              Community & Idee
            </span>
            <button
              type="button"
              onClick={() => {
                closeSettings();
                openFeedback();
              }}
              className="w-full p-3.5 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 hover:from-amber-100 hover:to-orange-100 dark:hover:from-amber-950/30 dark:hover:to-orange-950/30 border border-amber-200/90 dark:border-amber-800/60 text-left flex items-center justify-between transition-all group shadow-xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
                  <MessageSquarePlus className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-amber-950 dark:group-hover:text-amber-300">
                    {t.feedbackTitle}
                  </div>
                  <div className="text-[11px] text-slate-600 dark:text-slate-300">
                    {t.feedbackSubtitle}
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-amber-600 dark:text-amber-400 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {/* 4. I Tuoi Luoghi & Gestione Dati */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-1">
              {t.dataSection}
            </span>
            <div className="bg-slate-50/80 dark:bg-slate-800/50 rounded-2xl border border-slate-200/90 dark:border-slate-800 divide-y divide-slate-200/80 dark:divide-slate-800 overflow-hidden text-xs">
              <div className="p-3.5 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-800 dark:text-slate-200">{t.savedSpotsCount}</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    {places.length} {places.length === 1 ? "luogo salvato" : "luoghi salvati"}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleExportData}
                  className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 shadow-2xs transition-all active:scale-98"
                  title="Scarica un file di backup JSON"
                >
                  <Download className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>{t.exportJson}</span>
                </button>
              </div>

              <div className="p-3.5 flex items-center justify-between text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                  <span>{t.privacyTitle}</span>
                </div>
                <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <Check className="w-3 h-3 stroke-[2.5]" /> {t.privacyStatus}
                </span>
              </div>
            </div>
          </div>

          {/* 5. Zona Pericolosa: Procedura di Sicurezza Guidata a 3 Tocchi */}
          <div className="space-y-2 pt-1">
            <span className="text-[11px] font-bold text-rose-500 dark:text-rose-400 uppercase tracking-wider px-1 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              <span>{t.dangerSection}</span>
            </span>

            <div className="p-4 rounded-2xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/60 space-y-3">
              
              {clearSuccess && (
                <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center gap-2 border border-emerald-300 dark:border-emerald-700">
                  <Check className="w-4 h-4 stroke-[2.5]" />
                  <span>{t.deleteSuccessMessage}</span>
                </div>
              )}

              {/* TOCCO 1: Schermata base con il pulsante principale */}
              {deleteStep === 0 && (
                <div className="space-y-3">
                  <div>
                    <h4 className="text-xs font-bold text-rose-950 dark:text-rose-200">
                      {t.deleteTitle}
                    </h4>
                    <p className="text-[11px] text-rose-800/80 dark:text-rose-300/80 mt-0.5 leading-relaxed">
                      {t.deleteDesc}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setDeleteStep(1)}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-950/50 text-xs font-bold transition-all flex items-center justify-between sm:justify-start gap-2 shadow-2xs active:scale-98"
                  >
                    <div className="flex items-center gap-2">
                      <Trash2 className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                      <span>{t.deleteStep1Button}</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-rose-400" />
                  </button>
                </div>
              )}

              {/* TOCCO 2: Nuova Sezione Esplicativa (Spiega chiaramente cosa fa e prepara la conferma) */}
              {deleteStep === 1 && (
                <motion.div 
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-xl bg-white dark:bg-slate-900 border-2 border-rose-300 dark:border-rose-800 space-y-3 shadow-xs"
                >
                  <div className="flex items-start gap-2.5">
                    <div className="p-2 rounded-lg bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 shrink-0">
                      <Info className="w-4 h-4" />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                        {t.deleteStep2Title}
                      </h5>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
                        {t.deleteStep2Warning}
                      </p>
                    </div>
                  </div>

                  <div className="pl-2 space-y-1.5 text-[11px] text-slate-700 dark:text-slate-300">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                      <span>{t.deleteStep2Impact1}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                      <span>{t.deleteStep2Impact2}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                      <span>{t.deleteStep2Impact3}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => setDeleteStep(0)}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center gap-1 transition-colors"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                      <span>{t.cancelButton}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeleteStep(2)}
                      className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs active:scale-98 transition-all"
                    >
                      <span>{t.deleteStep2ProceedButton}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* TOCCO 3: Conferma Definitiva ed Esecuzione Irreversibile */}
              {deleteStep === 2 && (
                <motion.div 
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-xl bg-rose-100/90 dark:bg-rose-950/60 border-2 border-rose-400 dark:border-rose-700 space-y-3 shadow-md"
                >
                  <div className="flex items-center gap-2 text-rose-900 dark:text-rose-200">
                    <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                    <h5 className="text-xs font-black tracking-tight">
                      {t.deleteStep3Title}
                    </h5>
                  </div>

                  <p className="text-xs font-bold text-rose-800 dark:text-rose-300 leading-relaxed">
                    {t.deleteStep3Question}
                  </p>

                  <div className="pt-2 border-t border-rose-200 dark:border-rose-900/60 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => setDeleteStep(0)}
                      disabled={isClearing}
                      className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-700"
                    >
                      {t.cancelButton}
                    </button>

                    <button
                      type="button"
                      onClick={handleExecuteClearData}
                      disabled={isClearing}
                      className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black flex items-center gap-2 shadow-md active:scale-98 transition-all"
                    >
                      {isClearing ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>{t.deletingText}</span>
                        </>
                      ) : (
                        <>
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>{t.deleteConfirmButton}</span>
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              )}

            </div>
          </div>

          {/* 6. App Info Brand */}
          <div className="pt-2 text-center text-slate-400 dark:text-slate-500 space-y-1">
            <div className="flex items-center justify-center gap-1.5 text-xs font-black text-slate-800 dark:text-slate-200">
              <span>PINNA</span>
              <span className="text-[10px] font-semibold px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-600 dark:text-slate-400">
                v2.0 • Official
              </span>
            </div>
            <p className="text-[10px] leading-relaxed text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
              {t.slogan}
            </p>
          </div>
        </div>

        {/* Footer with Easy Green "Salva Impostazioni" Button */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/80 flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate">
            {saveToast ? (
              <span className="text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1 animate-in fade-in">
                <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 stroke-[2.5]" />
                <span>{t.savedToast}</span>
              </span>
            ) : (
              <span>Modifiche applicate all'istante</span>
            )}
          </div>

          <button
            type="button"
            onClick={handleSaveAndConfirm}
            className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-emerald-600/20 active:scale-98 transition-all"
            title="Salva impostazioni e chiudi"
          >
            <Check className="w-4 h-4 stroke-[2.5]" />
            <span>{t.saveSettingsButton}</span>
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};
