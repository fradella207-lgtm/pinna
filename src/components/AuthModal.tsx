import React, { useState } from "react";
import { 
  X, 
  Mail, 
  Lock, 
  User as UserIcon, 
  Loader2, 
  AlertCircle, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2,
  Compass,
  Eye,
  EyeOff
} from "lucide-react";
import { motion } from "motion/react";
import { useAuth } from "../context/AuthContext";

export const AuthModal: React.FC = () => {
  const { 
    isAuthModalOpen, 
    closeAuthModal, 
    signInWithEmail, 
    signUpWithEmail,
    sendPasswordReset
  } = useAuth();

  const [mode, setMode] = useState<"login" | "register" | "forgot">("login");

  // Email di riferimento impostata su my360garage@gmail.com
  const [email, setEmail] = useState("my360garage@gmail.com");
  const [displayName, setDisplayName] = useState("My360Garage");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  const handleClassicSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const cleanEmail = email.trim();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      setError("Inserisci un indirizzo email valido.");
      return;
    }

    if (mode === "forgot") {
      setLoading(true);
      try {
        const res = await sendPasswordReset(cleanEmail);
        setSuccessMsg(res.message || "Istruzioni per il reset inviate all'email!");
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
        setSuccessMsg("Accesso effettuato con successo!");
      } else {
        await signUpWithEmail(cleanEmail, password, displayName.trim());
        setSuccessMsg("Account creato con successo! Lista pronta e vuota da 0.");
      }
      setTimeout(() => {
        closeAuthModal();
      }, 500);
    } catch (err: any) {
      setError(err?.message || "Errore durante l'operazione. Verifica i dati inseriti.");
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
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/70 backdrop-blur-sm"
    >
      <div onClick={closeAuthModal} className="absolute inset-0" />

      <motion.div
        initial={{ y: "100%", opacity: 0.8 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0 }}
        transition={{ type: "spring", stiffness: 360, damping: 30 }}
        className="relative w-full sm:max-w-md max-h-[92vh] bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-t-3xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden z-10"
      >
        {/* Header */}
        <div className="px-6 pt-5 pb-3 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 flex items-center justify-center font-black text-sm shadow-xs">
              📍
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                {mode === "login" ? "Accedi al tuo Account" : mode === "register" ? "Crea un nuovo Account" : "Recupera Password"}
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Sincronizza i tuoi spot su PINNA Cloud
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={closeAuthModal}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="px-6 pt-4 shrink-0">
          <div className="p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center gap-1">
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setError(null);
              }}
              className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
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
              className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                mode === "register"
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Registrati
            </button>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4 overflow-y-auto">
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

          {successMsg && (
            <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-semibold flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="flex-1">{successMsg}</div>
            </div>
          )}

          <form onSubmit={handleClassicSubmit} className="space-y-3">
            {mode === "register" && (
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
                  Nome o Nickname
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Es. Marco o Giulia"
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
                  placeholder="La tua email (es. nome@email.com)"
                  required
                  autoFocus
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white focus:bg-white dark:focus:bg-slate-800 transition-all shadow-inner"
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
                    className="w-full pl-9 pr-10 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white focus:bg-white dark:focus:bg-slate-800 transition-all"
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
                <p className="font-semibold">Recupero password</p>
                <p className="text-slate-600 dark:text-slate-400">
                  Inserisci la tua email e riceverai le istruzioni per impostare una nuova password.
                </p>
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className="text-amber-800 dark:text-amber-300 font-bold underline pt-1 block"
                >
                  Torna al login
                </button>
              </div>
            )}

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

          <div className="pt-2 flex items-center justify-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500 text-center">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>I tuoi spot sono privati e al sicuro nel Cloud</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
