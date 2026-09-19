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
    signInWithGoogle,
    signInWithEmail, 
    signUpWithEmail,
    sendPasswordReset,
    signInAsGuest,
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

  const handleGoogleSignIn = async () => {
    setError(null);
    setSuccessMessage(null);
    setLoading(true);
    try {
      await signInWithGoogle();
      setSuccessMessage("Accesso con Google completato!");
      setTimeout(() => {
        onClose();
      }, 500);
    } catch (err: any) {
      setError(err?.message || "Accesso con Google non riuscito. Puoi accedere con Email e Password qui sotto.");
    } finally {
      setLoading(false);
    }
  };

  const handleGuest = async () => {
    setLoading(true);
    try {
      await signInAsGuest();
      onClose();
    } catch {
      onClose();
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
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden my-auto"
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
        <div className="px-5 py-2 bg-slate-50 border-b border-slate-100 shrink-0">
          <div className="min-h-[34px] flex items-center justify-center text-center">
            <AnimatePresence mode="wait">
              <motion.p
                key={taglineIndex}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.22 }}
                className="text-xs font-semibold text-slate-700 leading-snug"
              >
                "{HERO_TAGLINES[taglineIndex]}"
              </motion.p>
            </AnimatePresence>
          </div>
        </div>

        {/* Two-Tab Switcher: Accedi vs Registrati */}
        <div className="p-2 mx-5 mt-4 bg-slate-100 rounded-2xl flex items-center gap-1">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setError(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              mode === "login"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
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
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Crea Account
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 sm:p-6 pt-3 space-y-4 max-h-[58vh] overflow-y-auto">
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

          {/* Classic Form */}
          <form onSubmit={handleClassicSubmit} className="space-y-3">
            {mode === "register" && (
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 block">
                  Il tuo Nome o Nickname
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Es. Mario Rossi"
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700 block">
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
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all"
                />
              </div>
            </div>

            {mode !== "forgot" && (
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-slate-700 block">
                    Password {mode === "register" && <span className="text-slate-400 font-normal">(min. 6 caratteri)</span>}
                  </label>
                  {mode === "login" && (
                    <button
                      type="button"
                      onClick={() => setMode("forgot")}
                      className="text-[10px] text-slate-500 hover:text-slate-900 font-medium"
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
                    className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                    title={showPassword ? "Nascondi password" : "Mostra password"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {mode === "forgot" && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900 space-y-1">
                <p className="font-semibold">Recupero password rapido</p>
                <p className="text-slate-600">
                  Inserisci l'email del tuo account e ti invieremo un link o codice per reimpostare la tua password.
                </p>
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className="text-amber-800 font-bold underline pt-1 block"
                >
                  Torna al login classico
                </button>
              </div>
            )}

            {/* Pulsante principale di invio */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-60 mt-2 cursor-pointer"
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

          {/* Separatore visivo */}
          <div className="relative flex items-center justify-center my-1">
            <div className="border-t border-slate-200 w-full" />
            <span className="bg-white px-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
              oppure
            </span>
          </div>

          {/* Opzione Google Alternativa */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs shadow-2xs flex items-center justify-center gap-2.5 transition-all active:scale-[0.98] disabled:opacity-60 cursor-pointer hover:border-slate-300"
          >
            <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>Continua con Google</span>
          </button>

          {/* Guest option */}
          <div className="pt-2 border-t border-slate-100 text-center">
            <button
              type="button"
              onClick={handleGuest}
              disabled={loading}
              className="text-xs text-slate-500 hover:text-slate-900 font-semibold inline-flex items-center gap-1.5 transition-colors py-1 px-3 rounded-lg hover:bg-slate-50 cursor-pointer"
            >
              <Compass className="w-3.5 h-3.5 text-slate-400" />
              <span>Esplora come ospite (senza account)</span>
            </button>
          </div>

          {/* Note */}
          <div className="pt-1 flex items-center justify-center gap-1.5 text-[11px] text-slate-400 text-center">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>I tuoi spot sono privati e protetti sul database Cloud</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
