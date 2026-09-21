import React, { useState, useEffect } from "react";
import { 
  Mail, 
  Lock, 
  User as UserIcon, 
  Loader2, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles,
  Compass,
  Eye,
  EyeOff,
  KeyRound,
  HelpCircle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "../context/AuthContext";

const HERO_TAGLINES = [
  "Salva ogni spot che trovi sui social o per strada.",
  "Mappa interattiva e filtri veloci per regione e provincia.",
  "Zero account preimpostati: il tuo spazio parte pulito al 100%.",
  "Porta le tue avventure e i tuoi posti speciali sempre con te."
];

interface WelcomeLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WelcomeLoginModal: React.FC<WelcomeLoginModalProps> = ({ isOpen, onClose }) => {
  const { 
    signInWithEmail, 
    signUpWithEmail, 
    sendPasswordReset,
    user 
  } = useAuth();

  const [mode, setMode] = useState<"login" | "register" | "forgot">("login");
  const [taglineIndex, setTaglineIndex] = useState(0);

  // Form states - email di riferimento impostata su my360garage@gmail.com
  const [email, setEmail] = useState("my360garage@gmail.com");
  const [displayName, setDisplayName] = useState("My360Garage");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Rotate punchlines
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setTaglineIndex((prev) => (prev + 1) % HERO_TAGLINES.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen && user) return null;

  const handleClassicSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    const cleanEmail = email.trim();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      setError("Inserisci un indirizzo email valido.");
      return;
    }

    if (mode === "forgot") {
      setLoading(true);
      try {
        const res = await sendPasswordReset(cleanEmail);
        setSuccessMessage(res.message || "Istruzioni per il reset inviate all'email!");
      } catch (err: any) {
        setError(err?.message || "Impossibile resettare la password.");
      } finally {
        setLoading(false);
      }
      return;
    }

    if (!password || password.length < 6) {
      setError("La password deve contenere almeno 6 caratteri.");
      return;
    }

    setLoading(true);
    try {
      if (mode === "login") {
        await signInWithEmail(cleanEmail, password);
        setSuccessMessage("Accesso effettuato! Bentornato su PINNA.");
      } else {
        await signUpWithEmail(cleanEmail, password, displayName.trim());
        setSuccessMessage("Account creato con successo! Il tuo spazio è pronto e vuoto da 0.");
      }
      setTimeout(() => {
        onClose();
      }, 500);
    } catch (err: any) {
      setError(err?.message || "Errore durante l'operazione. Verifica i dati inseriti.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      id="welcome-login-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 15 }}
        transition={{ type: "spring", stiffness: 350, damping: 28 }}
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/90 dark:border-slate-800 overflow-hidden my-auto"
      >
        {/* Visual Hero Header */}
        <div className="relative h-32 bg-slate-950 p-6 flex flex-col justify-between overflow-hidden">
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
              <span>PINNA • Cloud Sync</span>
            </span>

            <span className="text-[11px] font-semibold text-slate-300">
              {mode === "login" ? "Accedi" : mode === "register" ? "Registrati" : "Recupero"}
            </span>
          </div>

          {/* App Brand */}
          <div className="relative z-10 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white text-slate-950 flex items-center justify-center font-black text-base shadow-md">
              📍
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-white leading-none">
                PINNA
              </h1>
              <p className="text-[11px] text-slate-300 font-medium pt-0.5">
                I tuoi luoghi preferiti, sempre con te
              </p>
            </div>
          </div>
        </div>

        {/* Dynamic Rotating Punchline Section */}
        <div className="px-5 py-2 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="min-h-[34px] flex items-center justify-center text-center">
            <AnimatePresence mode="wait">
              <motion.p
                key={taglineIndex}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.22 }}
                className="text-xs font-semibold text-slate-700 dark:text-slate-200 leading-snug"
              >
                "{HERO_TAGLINES[taglineIndex]}"
              </motion.p>
            </AnimatePresence>
          </div>
        </div>

        {/* Two-Tab Switcher: Accedi vs Registrati */}
        <div className="p-2 mx-5 mt-4 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center gap-1">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setError(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              mode === "login"
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Accedi
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("register");
              setError(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              mode === "register"
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Crea Account
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 sm:p-6 pt-3 space-y-4 max-h-[58vh] overflow-y-auto">
          {/* Feedback messages */}
          {error && (
            <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs font-semibold flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">{error}</div>
              <button
                type="button"
                onClick={() => setError(null)}
                className="text-rose-500 hover:text-rose-800 dark:hover:text-rose-300 text-xs font-bold shrink-0 ml-1"
              >
                ✕
              </button>
            </div>
          )}

          {successMessage && (
            <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-semibold flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="flex-1">{successMessage}</div>
            </div>
          )}

          {/* Classic Form */}
          <form onSubmit={handleClassicSubmit} className="space-y-3">
            {mode === "register" && (
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
                  Il tuo Nome o Nickname
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Es. Mario Rossi"
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white focus:bg-white dark:focus:bg-slate-800 transition-all"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
                Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="La tua email (es. mario@gmail.com)"
                  required
                  autoFocus
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white focus:bg-white dark:focus:bg-slate-800 transition-all"
                />
              </div>
            </div>

            {mode !== "forgot" && (
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
                    Password {mode === "register" && <span className="text-slate-400 font-normal">(min. 6 caratteri)</span>}
                  </label>
                  {mode === "login" && (
                    <button
                      type="button"
                      onClick={() => setMode("forgot")}
                      className="text-[10px] text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium"
                    >
                      Password dimenticata?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="La tua password"
                    required
                    minLength={6}
                    className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white focus:bg-white dark:focus:bg-slate-800 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                    title={showPassword ? "Nascondi password" : "Mostra password"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {mode === "forgot" && (
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-[11px] text-amber-900 dark:text-amber-200 space-y-1">
                <p className="font-semibold">Recupero password rapido</p>
                <p className="text-slate-600 dark:text-slate-400">
                  Inserisci l'email del tuo account e ti invieremo un link o codice per reimpostare la tua password.
                </p>
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className="text-amber-800 dark:text-amber-300 font-bold underline pt-1 block"
                >
                  Torna al login classico
                </button>
              </div>
            )}

            {/* Pulsante principale di invio */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 font-bold text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-60 mt-2 cursor-pointer"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>
                    {mode === "login" 
                      ? "Accedi con Password" 
                      : mode === "register" 
                      ? "Crea il tuo Account" 
                      : "Invia link di recupero"}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Note */}
          <div className="pt-2 flex items-center justify-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500 text-center">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>I tuoi spot sono privati e protetti sul database Cloud</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
