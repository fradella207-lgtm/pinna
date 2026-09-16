import React, { useState } from "react";
import { 
  X, 
  Mail, 
  Lock, 
  User as UserIcon, 
  Loader2, 
  CheckCircle2, 
  Cloud, 
  ShieldCheck, 
  MapPin,
  Sparkles,
  ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "../context/AuthContext";

export const AuthModal: React.FC = () => {
  const { 
    isAuthModalOpen, 
    closeAuthModal, 
    signInWithGoogle, 
    signInWithEmail, 
    signUpWithEmail, 
    signInAsGuest 
  } = useAuth();

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  const translateError = (codeOrMsg: string) => {
    if (codeOrMsg.includes("invalid-credential") || codeOrMsg.includes("user-not-found") || codeOrMsg.includes("wrong-password")) {
      return "Email o password non corretti.";
    }
    if (codeOrMsg.includes("email-already-in-use")) {
      return "Questa email è già registrata. Seleziona 'Accedi' in alto.";
    }
    if (codeOrMsg.includes("weak-password")) {
      return "La password deve contenere almeno 6 caratteri.";
    }
    if (codeOrMsg.includes("invalid-email")) {
      return "Inserisci un indirizzo email valido.";
    }
    if (codeOrMsg.includes("popup-closed-by-user")) {
      return "Accesso con Google annullato.";
    }
    if (codeOrMsg.includes("network-request-failed")) {
      return "Errore di connessione. Verifica la tua rete.";
    }
    return "Si è verificato un errore durante l'autenticazione. Riprova.";
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInWithGoogle();
      closeAuthModal();
    } catch (err: any) {
      setError(translateError(err.message || String(err)));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError("Inserisci sia l'email che la password.");
      return;
    }

    setLoading(true);
    try {
      if (mode === "signin") {
        await signInWithEmail(email.trim(), password);
      } else {
        await signUpWithEmail(email.trim(), password, displayName.trim());
      }
      closeAuthModal();
    } catch (err: any) {
      setError(translateError(err.message || String(err)));
    } finally {
      setLoading(false);
    }
  };

  const handleGuestSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInAsGuest();
      closeAuthModal();
    } catch (err: any) {
      setError(translateError(err.message || String(err)));
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      id="modal-auth"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/60 backdrop-blur-sm"
    >
      <div onClick={closeAuthModal} className="absolute inset-0" />

      <motion.div
        initial={{ y: "100%", opacity: 0.8 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0 }}
        transition={{ type: "spring", stiffness: 360, damping: 30 }}
        className="relative w-full sm:max-w-md max-h-[92vh] bg-white text-slate-900 rounded-t-3xl sm:rounded-3xl border border-slate-200 shadow-2xl flex flex-col overflow-hidden z-10"
      >
        {/* Header */}
        <div className="px-6 pt-5 pb-3 flex items-center justify-between border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-sm shadow-xs">
              p
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                Account pinna
              </h2>
              <p className="text-[11px] text-slate-500">
                Salva i tuoi luoghi e sincronizza ovunque
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={closeAuthModal}
            className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Segment: Accedi vs Registrati */}
        <div className="px-6 pt-3">
          <div className="flex p-1 rounded-2xl bg-slate-100 border border-slate-200/80 text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setMode("signin");
                setError(null);
              }}
              className={`flex-1 py-1.5 rounded-xl transition-all ${
                mode === "signin"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Accedi
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("signup");
                setError(null);
              }}
              className={`flex-1 py-1.5 rounded-xl transition-all ${
                mode === "signup"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Crea Account
            </button>
          </div>
        </div>

        {/* Body Form */}
        <div className="p-6 overflow-y-auto space-y-4">
          {error && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center justify-between">
              <span>{error}</span>
              <button 
                type="button" 
                onClick={() => setError(null)}
                className="text-rose-500 hover:text-rose-800 ml-2"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Primary: Google Sign-in */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full py-3 px-4 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-bold shadow-xs hover:shadow-sm flex items-center justify-center gap-3 transition-all active:scale-98 disabled:opacity-50"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
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
            <span>Continua con Google</span>
          </button>

          {/* Divider */}
          <div className="relative flex items-center justify-center my-2">
            <div className="border-t border-slate-200 w-full" />
            <span className="bg-white px-3 text-[11px] font-medium text-slate-400 uppercase tracking-wider">
              oppure con email
            </span>
          </div>

          {/* Email / Password Form */}
          <form onSubmit={handleSubmitEmail} className="space-y-3">
            {mode === "signup" && (
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 block">
                  Il tuo nome
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Es. Marco Rossi"
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700 block">
                Indirizzo Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nome@esempio.com"
                  required
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700 block">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimo 6 caratteri"
                  required
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 active:scale-98 transition-all disabled:opacity-50 mt-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <span>{mode === "signin" ? "Accedi con Email" : "Crea il Mio Account"}</span>
              )}
            </button>
          </form>

          {/* Guest fallback button */}
          <div className="pt-2 border-t border-slate-100 flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={handleGuestSignIn}
              disabled={loading}
              className="text-xs text-slate-600 hover:text-slate-900 font-semibold hover:underline"
            >
              Continua come Ospite (senza account)
            </button>
            <p className="text-[10px] text-slate-400 text-center leading-relaxed max-w-xs">
              Con un account registrato i tuoi luoghi, note e foto rimangono sempre al sicuro nel Cloud.
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
