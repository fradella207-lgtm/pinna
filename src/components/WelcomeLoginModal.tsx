import React, { useState, useEffect } from "react";
import { 
  Sparkles, 
  MapPin, 
  ArrowRight, 
  ShieldCheck, 
  Mail, 
  Lock, 
  User as UserIcon, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  KeyRound,
  Compass
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
  const { 
    signInWithGoogle,
    signInWithEmailInstant,
    signInWithEmail, 
    signUpWithEmail, 
    signInAsGuest,
    user 
  } = useAuth();

  const [taglineIndex, setTaglineIndex] = useState(0);

  // Form states - completely clean, NO hardcoded or default accounts!
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [withPassword, setWithPassword] = useState(false);
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Rotate hero punchlines smoothly every 4.2 seconds
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setTaglineIndex((prev) => (prev + 1) % HERO_TAGLINES.length);
    }, 4200);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen && user) return null;

  // Google Sign In handler
  const handleGoogleSignIn = async () => {
    setError(null);
    setSuccessMessage(null);
    setLoading(true);
    try {
      await signInWithGoogle();
      setSuccessMessage("Accesso con Google completato! Benvenuto.");
      setTimeout(() => {
        onClose();
      }, 400);
    } catch (err: any) {
      setError(err?.message || "Impossibile completare l'accesso con Google. Riprova o usa l'email sotto.");
    } finally {
      setLoading(false);
    }
  };

  // Ultra-simple direct sign in: enter email, click enter, zero popups!
  const handleDirectSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    const cleanEmail = email.trim();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      setError("Inserisci un indirizzo email valido.");
      return;
    }

    setLoading(true);
    try {
      if (withPassword && password.trim().length >= 6) {
        try {
          await signInWithEmail(cleanEmail, password);
        } catch {
          await signUpWithEmail(cleanEmail, password, displayName.trim());
        }
      } else {
        await signInWithEmailInstant(cleanEmail, displayName.trim());
      }
      setSuccessMessage("Accesso completato! Benvenuto in PINNA.");
      setTimeout(() => {
        onClose();
      }, 400);
    } catch (err: any) {
      setError(err?.message || "Impossibile accedere. Verifica l'email e riprova.");
    } finally {
      setLoading(false);
    }
  };

  const handleGuest = async () => {
    setLoading(true);
    try {
      await signInAsGuest();
      onClose();
    } catch (e) {
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      id="welcome-login-modal"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto"
    >
      <motion.div
        initial={{ scale: 0.94, opacity: 0, y: 16 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.94, opacity: 0, y: 16 }}
        transition={{ type: "spring", stiffness: 350, damping: 28 }}
        className="relative w-full max-w-md bg-white text-slate-900 rounded-3xl shadow-[0_24px_60px_rgba(0,0,0,0.4)] border border-slate-200 overflow-hidden z-10 flex flex-col my-auto"
      >
        {/* Top Aesthetic Header with Satellite / Mountain backdrop */}
        <div className="relative h-36 sm:h-40 bg-slate-950 overflow-hidden flex flex-col justify-between p-5 text-white select-none shrink-0">
          <img
            src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&auto=format&fit=crop&q=80"
            alt="Dolomiti Pinna"
            className="absolute inset-0 w-full h-full object-cover opacity-45 mix-blend-luminosity scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />

          {/* Top Badge */}
          <div className="relative z-10 flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[10px] font-bold tracking-widest text-slate-200 uppercase">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>PINNA Cloud Sync</span>
            </span>

            <span className="text-[11px] font-semibold text-slate-300">
              Accesso Veloce
            </span>
          </div>

          {/* App Brand */}
          <div className="relative z-10 space-y-0.5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-white text-slate-950 flex items-center justify-center font-black text-base shadow-md">
                📍
              </div>
              <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-1.5">
                <span>PINNA</span>
              </h1>
            </div>
            <p className="text-[11px] text-slate-300 font-medium">
              Salva, organizza ed esplora i tuoi spot preferiti
            </p>
          </div>
        </div>

        {/* Dynamic Rotating Punchline Section */}
        <div className="px-6 pt-3 pb-2 bg-gradient-to-b from-slate-50 to-white border-b border-slate-100 shrink-0">
          <div className="min-h-[42px] flex items-center justify-center text-center">
            <AnimatePresence mode="wait">
              <motion.p
                key={taglineIndex}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.25 }}
                className="text-xs sm:text-[13px] font-bold text-slate-800 leading-snug max-w-sm"
              >
                "{HERO_TAGLINES[taglineIndex]}"
              </motion.p>
            </AnimatePresence>
          </div>

          {/* Carousel indicators */}
          <div className="flex items-center justify-center gap-1 py-1">
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

        {/* Auth Body */}
        <div className="p-5 sm:p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Feedback messages */}
          {error && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">{error}</div>
              <button
                type="button"
                onClick={() => setError(null)}
                className="text-rose-500 hover:text-rose-800 text-xs font-bold shrink-0 ml-1"
              >
                ✕
              </button>
            </div>
          )}

          {successMessage && (
            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="flex-1">{successMessage}</div>
            </div>
          )}

          {/* 1. Opzione Google: Veloce e Comoda */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full py-3 px-4 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs sm:text-sm shadow-xs flex items-center justify-center gap-3 transition-all active:scale-[0.98] disabled:opacity-60 cursor-pointer hover:border-slate-300"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>Accedi con Google</span>
          </button>

          {/* Separatore visivo */}
          <div className="relative flex items-center justify-center my-2">
            <div className="border-t border-slate-200 w-full" />
            <span className="bg-white px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
              oppure inserisci la tua email
            </span>
          </div>

          {/* Semplice Accesso Diretto con Email (Zero Popup, Zero Complicazioni) */}
          <form onSubmit={handleDirectSignIn} className="space-y-3">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700 block">
                La tua Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Inserisci la tua email (es. mario@gmail.com)"
                  required
                  autoFocus
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all shadow-inner"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700 block">
                Nome o Nickname <span className="text-slate-400 font-normal">(facoltativo)</span>
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Es. Marco o Giulia"
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Optional password protection */}
            {withPassword && (
              <div className="space-y-1 pt-1">
                <label className="text-[11px] font-bold text-slate-700 block">
                  Password <span className="text-slate-400 font-normal">(minimo 6 caratteri)</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="La tua password"
                    minLength={6}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all"
                  />
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-0.5">
              <button
                type="button"
                onClick={() => setWithPassword(!withPassword)}
                className="text-[11px] text-slate-500 hover:text-slate-800 font-medium flex items-center gap-1 transition-colors"
              >
                <KeyRound className="w-3 h-3 text-slate-400" />
                <span>{withPassword ? "Rimuovi password (accesso diretto)" : "Vuoi impostare una password?"}</span>
              </button>
            </div>

            {/* Primary Action Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-60 mt-3 cursor-pointer"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Entra in PINNA</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Guest option */}
          <div className="pt-3 border-t border-slate-100 text-center">
            <button
              type="button"
              onClick={handleGuest}
              disabled={loading}
              className="text-xs text-slate-500 hover:text-slate-900 font-semibold inline-flex items-center gap-1.5 transition-colors py-1 px-3 rounded-lg hover:bg-slate-50"
            >
              <Compass className="w-3.5 h-3.5 text-slate-400" />
              <span>Esplora come ospite (senza salvare su Cloud)</span>
            </button>
          </div>

          {/* Security & Sync note */}
          <div className="pt-2 flex items-center justify-center gap-1.5 text-[11px] text-slate-400 text-center">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>I tuoi spot sono protetti e sincronizzati su Cloud</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
