import React, { useState, useEffect } from "react";
import { 
  X, 
  Sparkles, 
  MapPin, 
  Navigation, 
  ArrowRight, 
  CheckCircle2, 
  ChevronRight,
  ShieldCheck,
  Globe
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "../context/AuthContext";

const HERO_TAGLINES = [
  "Basta screen dimenticati. I tuoi Reel e TikTok preferiti, subito sulla mappa.",
  "Dal tuo feed alla tua prossima meta. Incolla il link, al resto pensa PINNA.",
  "Niente liste disordinate. Solo tu, la mappa satellitare e i tuoi posti del cuore.",
  "Ogni curva, ogni panorama, ogni sosta. Tutto ordinato in un solo tap.",
  "Dal ristorante nascosto al passo in quota: la tua mappa, zero caos.",
  "Trasforma i video che salvi sui social in itinerari reali da vivere.",
  "L'AI estrae i dettagli, la mappa ti guida. Semplicemente PINNA.",
  "Non perdere i posti migliori. Fissa il punto, traccia la strada e parti."
];

interface WelcomeLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WelcomeLoginModal: React.FC<WelcomeLoginModalProps> = ({ isOpen, onClose }) => {
  const { signInWithGoogle, signInAsGuest, user } = useAuth();
  const [taglineIndex, setTaglineIndex] = useState(0);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [loadingGuest, setLoadingGuest] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Rotate hero punchlines smoothly every 4 seconds
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setTaglineIndex((prev) => (prev + 1) % HERO_TAGLINES.length);
    }, 4200);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoadingGoogle(true);
    try {
      await signInWithGoogle();
      onClose();
    } catch (err: any) {
      if (err?.message?.includes("popup-closed-by-user")) {
        setError("Accesso Google annullato.");
      } else {
        setError("Impossibile completare l'accesso con Google. Riprova.");
      }
    } finally {
      setLoadingGoogle(false);
    }
  };

  const handleGuestContinue = async () => {
    setError(null);
    setLoadingGuest(true);
    try {
      if (!user) {
        await signInAsGuest();
      }
      onClose();
    } catch {
      onClose();
    } finally {
      setLoadingGuest(false);
    }
  };

  return (
    <motion.div
      id="welcome-login-modal"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md"
    >
      <div onClick={onClose} className="absolute inset-0" />

      <motion.div
        initial={{ scale: 0.94, opacity: 0, y: 16 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.94, opacity: 0, y: 16 }}
        transition={{ type: "spring", stiffness: 350, damping: 28 }}
        className="relative w-full max-w-md bg-white text-slate-900 rounded-3xl shadow-[0_24px_60px_rgba(0,0,0,0.35)] border border-slate-200 overflow-hidden z-10 flex flex-col"
      >
        {/* Top Aesthetic Header with Satellite / Mountain backdrop */}
        <div className="relative h-44 sm:h-48 bg-slate-950 overflow-hidden flex flex-col justify-between p-6 text-white select-none">
          <img
            src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&auto=format&fit=crop&q=80"
            alt="Dolomiti Pinna"
            className="absolute inset-0 w-full h-full object-cover opacity-45 mix-blend-luminosity scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />

          {/* Close button */}
          <div className="relative z-10 flex items-center justify-between">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[10px] font-bold tracking-widest text-slate-200 uppercase">
              <Sparkles className="w-2.5 h-2.5 text-amber-400" />
              <span>Official Release</span>
            </span>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full bg-black/40 hover:bg-black/60 text-white/70 hover:text-white transition-colors backdrop-blur-sm"
              aria-label="Chiudi"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Big App Brand */}
          <div className="relative z-10 space-y-0.5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-white text-slate-950 flex items-center justify-center font-black text-base shadow-md">
                📍
              </div>
              <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-1.5">
                <span>PINNA</span>
              </h1>
            </div>
            <p className="text-[11px] text-slate-300 font-medium">
              La tua mappa satellitare per salvare ogni meta dai social
            </p>
          </div>
        </div>

        {/* Dynamic Rotating Punchline Section */}
        <div className="px-6 pt-5 pb-2 bg-gradient-to-b from-slate-50 to-white border-b border-slate-100">
          <div className="min-h-[58px] flex items-center justify-center text-center">
            <AnimatePresence mode="wait">
              <motion.p
                key={taglineIndex}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
                className="text-xs sm:text-[13px] font-bold text-slate-800 leading-snug max-w-sm"
              >
                "{HERO_TAGLINES[taglineIndex]}"
              </motion.p>
            </AnimatePresence>
          </div>

          {/* Carousel indicators */}
          <div className="flex items-center justify-center gap-1 py-2">
            {HERO_TAGLINES.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setTaglineIndex(i)}
                className={`h-1 rounded-full transition-all ${
                  taglineIndex === i ? "w-5 bg-slate-900" : "w-1.5 bg-slate-300 hover:bg-slate-400"
                }`}
                aria-label={`Frase ${i + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Auth CTAs */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center justify-between">
              <span>{error}</span>
              <button
                type="button"
                onClick={() => setError(null)}
                className="text-rose-500 hover:text-rose-800 text-xs font-bold"
              >
                ✕
              </button>
            </div>
          )}

          {/* Google Firebase Login Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loadingGoogle || loadingGuest}
            className="w-full py-3.5 px-4 rounded-2xl bg-white border border-slate-300 hover:border-slate-400 hover:bg-slate-50 text-slate-900 font-bold text-xs sm:text-sm shadow-sm hover:shadow-md flex items-center justify-center gap-3 transition-all active:scale-[0.98] disabled:opacity-60 group"
          >
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>{loadingGoogle ? "Accesso in corso..." : "Continua con Google"}</span>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </button>

          {/* Guest / Explore Without Login */}
          <button
            type="button"
            onClick={handleGuestContinue}
            disabled={loadingGoogle || loadingGuest}
            className="w-full py-3 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-60"
          >
            <span>{loadingGuest ? "Accesso rapido..." : "Inizia subito (Senza account)"}</span>
          </button>

          {/* Security & Sync note */}
          <div className="pt-2 flex items-center justify-center gap-1.5 text-[11px] text-slate-500 text-center">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>I tuoi dati e spot sono protetti e sincronizzati su Google Firebase</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
