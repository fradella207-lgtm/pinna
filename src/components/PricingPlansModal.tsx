import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Check, 
  Sparkles, 
  Crown, 
  Zap, 
  X, 
  MapPin, 
  Compass, 
  Download, 
  ShieldCheck, 
  Award,
  AlertCircle
} from "lucide-react";
import { useSubscription, PRICING_PLANS } from "../context/SubscriptionContext";
import { PinnaLogo } from "./PinnaLogo";
import { SubscriptionTier, BillingCycle } from "../types";

export const PricingPlansModal: React.FC = () => {
  const {
    tier,
    billingCycle,
    isUpgradeModalOpen,
    upgradeReason,
    closeUpgradeModal,
    upgradePlan
  } = useSubscription();

  const [selectedCycle, setSelectedCycle] = useState<"monthly" | "yearly">(
    billingCycle === "yearly" ? "yearly" : "monthly"
  );
  const [processingTier, setProcessingTier] = useState<SubscriptionTier | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isUpgradeModalOpen) return null;

  const handleSelectPlan = async (targetTier: SubscriptionTier) => {
    if (targetTier === tier) {
      closeUpgradeModal();
      return;
    }

    setProcessingTier(targetTier);
    const cycle: BillingCycle = targetTier === "founder" ? "lifetime" : selectedCycle;

    // Simulate safe instant activation
    setTimeout(async () => {
      await upgradePlan(targetTier, cycle);
      setProcessingTier(null);
      setSuccessMessage(
        targetTier === "founder"
          ? "Complimenti! Sei ora un Founder ufficiale di pinna a vita."
          : targetTier === "pro"
          ? "Fantastico! PINNA Pro è ora attivo sul tuo account."
          : "Piano Base ripristinato."
      );

      setTimeout(() => {
        setSuccessMessage(null);
        closeUpgradeModal();
      }, 1500);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        className="relative w-full max-w-4xl my-auto bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Close button */}
        <button
          type="button"
          onClick={closeUpgradeModal}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors cursor-pointer"
          title="Chiudi"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Section */}
        <div className="p-6 pb-4 sm:p-8 sm:pb-6 text-center border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center justify-center gap-2 mb-2">
            <PinnaLogo size={36} />
            <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white font-display">
              Piani & Livelli pinna
            </span>
          </div>
          
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-lg mx-auto">
            Scegli il piano ideale per le tue esplorazioni. Salva ogni angolo del mondo e naviga anche offline.
          </p>

          {upgradeReason && (
            <div className="mt-3.5 max-w-md mx-auto p-2.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-center gap-2 text-xs font-semibold text-amber-800 dark:text-amber-200 text-left">
              <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>{upgradeReason}</span>
            </div>
          )}

          {/* Monthly / Yearly toggle */}
          <div className="mt-5 inline-flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-full border border-slate-200/80 dark:border-slate-700/80">
            <button
              type="button"
              onClick={() => setSelectedCycle("monthly")}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                selectedCycle === "monthly"
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Fatturazione Mensile
            </button>
            <button
              type="button"
              onClick={() => setSelectedCycle("yearly")}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedCycle === "yearly"
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <span>Annuale</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                Risparmi 37%
              </span>
            </button>
          </div>
        </div>

        {/* Success Banner */}
        <AnimatePresence>
          {successMessage && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-emerald-500 text-white text-center py-2 px-4 text-xs font-bold flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>{successMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Plans Grid */}
        <div className="p-4 sm:p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 1. PIANO BASE */}
          <div className={`relative flex flex-col justify-between p-5 rounded-3xl border transition-all ${
            tier === "base" 
              ? "border-emerald-500/80 bg-emerald-50/20 dark:bg-emerald-950/10 ring-2 ring-emerald-500/20"
              : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60"
          }`}>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Gratuito
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  {tier === "base" ? "Attivo" : "Base"}
                </span>
              </div>

              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Base
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 min-h-[32px]">
                {PRICING_PLANS.base.tagline}
              </p>

              <div className="mt-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-slate-900 dark:text-white">
                    €0
                  </span>
                  <span className="text-xs text-slate-400 dark:text-slate-500">
                    / per sempre
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                  Nessuna carta di credito richiesta
                </p>
              </div>

              <ul className="mt-4 space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                {PRICING_PLANS.base.features.map((feat, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              type="button"
              disabled={tier === "base" || processingTier !== null}
              onClick={() => handleSelectPlan("base")}
              className={`mt-6 w-full py-2.5 px-4 rounded-2xl font-bold text-xs transition-all cursor-pointer ${
                tier === "base"
                  ? "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-default"
                  : "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-white"
              }`}
            >
              {tier === "base" ? "Piano Attuale" : "Passa a Base"}
            </button>
          </div>

          {/* 2. PINNA PRO */}
          <div className={`relative flex flex-col justify-between p-5 rounded-3xl border transition-all ${
            tier === "pro"
              ? "border-indigo-500/80 bg-indigo-50/20 dark:bg-indigo-950/20 ring-2 ring-indigo-500/30"
              : "border-indigo-200 dark:border-indigo-900/60 bg-gradient-to-b from-indigo-50/30 dark:from-indigo-950/20 to-white dark:to-slate-900 shadow-md"
          }`}>
            {/* Recommended pill */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-extrabold tracking-wide uppercase bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-xs">
              Più Scelto
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5" />
                  <span>Completo</span>
                </span>
                {tier === "pro" && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300">
                    Attivo
                  </span>
                )}
              </div>

              <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>PINNA Pro</span>
                <Sparkles className="w-4 h-4 text-amber-500" />
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 min-h-[32px]">
                {PRICING_PLANS.pro.tagline}
              </p>

              <div className="mt-4 pb-4 border-b border-indigo-100 dark:border-indigo-900/40">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-slate-900 dark:text-white">
                    {selectedCycle === "yearly" ? "€14,99" : "€1,99"}
                  </span>
                  <span className="text-xs text-slate-400 dark:text-slate-500">
                    {selectedCycle === "yearly" ? "/ anno" : "/ mese"}
                  </span>
                </div>
                <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium mt-1">
                  {selectedCycle === "yearly"
                    ? "Equivalente a soli €1,24 al mese"
                    : "Oppure €14,99/anno con il 37% di sconto"}
                </p>
              </div>

              <ul className="mt-4 space-y-2.5 text-xs text-slate-700 dark:text-slate-200">
                {PRICING_PLANS.pro.features.map((feat, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                    <span className={i === 0 ? "font-bold text-slate-900 dark:text-white" : ""}>
                      {feat}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              type="button"
              disabled={tier === "pro" || processingTier !== null}
              onClick={() => handleSelectPlan("pro")}
              className={`mt-6 w-full py-2.5 px-4 rounded-2xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                tier === "pro"
                  ? "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-default"
                  : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20 active:scale-98"
              }`}
            >
              {processingTier === "pro" ? (
                <span>Attivazione...</span>
              ) : tier === "pro" ? (
                "Piano Attuale"
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5" />
                  <span>Attiva PINNA Pro</span>
                </>
              )}
            </button>
          </div>

          {/* 3. FOUNDER / EARLY ACCESS */}
          <div className={`relative flex flex-col justify-between p-5 rounded-3xl border transition-all ${
            tier === "founder"
              ? "border-amber-500/80 bg-amber-50/20 dark:bg-amber-950/20 ring-2 ring-amber-500/30"
              : "border-amber-200 dark:border-amber-900/60 bg-gradient-to-b from-amber-50/30 dark:from-amber-950/20 to-white dark:to-slate-900 shadow-md"
          }`}>
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-extrabold tracking-wide uppercase bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-xs">
              Accesso A Vita
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1">
                  <Crown className="w-3.5 h-3.5" />
                  <span>Edizione Fondatore</span>
                </span>
                {tier === "founder" && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200">
                    Attivo
                  </span>
                )}
              </div>

              <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>Founder Pass</span>
                <Award className="w-4 h-4 text-amber-500" />
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 min-h-[32px]">
                {PRICING_PLANS.founder.tagline}
              </p>

              <div className="mt-4 pb-4 border-b border-amber-100 dark:border-amber-900/40">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-slate-900 dark:text-white">
                    €19,99
                  </span>
                  <span className="text-xs text-slate-400 dark:text-slate-500">
                    una tantum
                  </span>
                </div>
                <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium mt-1">
                  Paghi una volta sola, Pro a vita per sempre
                </p>
              </div>

              <ul className="mt-4 space-y-2.5 text-xs text-slate-700 dark:text-slate-200">
                {PRICING_PLANS.founder.features.map((feat, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                    <span className={i === 1 ? "font-bold text-amber-700 dark:text-amber-300" : ""}>
                      {feat}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              type="button"
              disabled={tier === "founder" || processingTier !== null}
              onClick={() => handleSelectPlan("founder")}
              className={`mt-6 w-full py-2.5 px-4 rounded-2xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                tier === "founder"
                  ? "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-default"
                  : "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-md shadow-amber-500/20 active:scale-98"
              }`}
            >
              {processingTier === "founder" ? (
                <span>Attivazione...</span>
              ) : tier === "founder" ? (
                "Pass Founder Attivo"
              ) : (
                <>
                  <Crown className="w-3.5 h-3.5" />
                  <span>Diventa Founder (€19,99)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Footer Guarantee */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Garanzia Google Play Store & Sincronizzazione Cloud Protetta</span>
          </div>
          <button
            type="button"
            onClick={closeUpgradeModal}
            className="text-xs font-semibold text-slate-600 dark:text-slate-300 hover:underline cursor-pointer"
          >
            Continua a esplorare la mappa
          </button>
        </div>
      </motion.div>
    </div>
  );
};
