import React, { useState } from "react";
import { X, UserPlus, ArrowLeft, Loader2, Check } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export interface GoogleAccount {
  email: string;
  displayName: string;
  photoURL?: string;
}

const DEFAULT_ACCOUNTS: GoogleAccount[] = [
  {
    email: "dellaquila037@gmail.com",
    displayName: "Michele",
    photoURL: "https://api.dicebear.com/7.x/avataaars/svg?seed=dellaquila037%40gmail.com",
  },
];

const STORAGE_ACCOUNTS_KEY = "spotter_google_known_accounts";

export function GoogleAccountChooserModal() {
  const { isGoogleChooserOpen, closeGoogleChooser, signInWithGoogleAccount } = useAuth();

  const [accounts, setAccounts] = useState<GoogleAccount[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_ACCOUNTS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return DEFAULT_ACCOUNTS;
  });

  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newName, setNewName] = useState("");
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isGoogleChooserOpen) return null;

  const handleSelectAccount = async (acc: GoogleAccount) => {
    setSelectedEmail(acc.email);
    setLoading(true);
    setError(null);

    try {
      // Save in accounts list if not already there
      const updated = [acc, ...accounts.filter((a) => a.email.toLowerCase() !== acc.email.toLowerCase())];
      setAccounts(updated);
      try {
        localStorage.setItem(STORAGE_ACCOUNTS_KEY, JSON.stringify(updated));
      } catch {
        // ignore
      }

      await signInWithGoogleAccount(acc);
      closeGoogleChooser();
    } catch (err: any) {
      setError(err?.message || "Impossibile completare l'accesso con questo account.");
    } finally {
      setLoading(false);
      setSelectedEmail(null);
    }
  };

  const handleAddCustomAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = newEmail.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      setError("Inserisci un indirizzo email valido.");
      return;
    }

    const calculatedName =
      newName.trim() ||
      cleanEmail.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

    const newAcc: GoogleAccount = {
      email: cleanEmail,
      displayName: calculatedName,
      photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(cleanEmail)}`,
    };

    await handleSelectAccount(newAcc);
  };

  return (
    <div 
      id="google-account-chooser-overlay" 
      className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) {
          closeGoogleChooser();
        }
      }}
    >
      <div 
        id="google-account-chooser-modal"
        className="bg-white rounded-3xl shadow-2xl border border-slate-200/90 w-full max-w-[440px] overflow-hidden text-slate-800 transition-all scale-100"
      >
        {/* Google Header */}
        <div className="pt-7 pb-4 px-6 text-center relative border-b border-slate-100">
          <button
            type="button"
            onClick={closeGoogleChooser}
            disabled={loading}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors disabled:opacity-40"
            title="Chiudi"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Google Official Colored G Logo */}
          <div className="flex justify-center mb-3">
            <svg className="w-8 h-8" viewBox="0 0 24 24">
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
          </div>

          <h2 className="text-[22px] font-normal text-slate-900 tracking-tight">
            Scegli un account
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            per continuare su <span className="font-semibold text-slate-900">pinna</span>
          </p>
        </div>

        {/* Error notification if any */}
        {error && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium leading-relaxed">
            {error}
          </div>
        )}

        {/* Body content */}
        <div className="p-4 sm:p-6">
          {!isAddingNew ? (
            <div className="space-y-1">
              {/* List of known Google Accounts */}
              {accounts.map((acc) => {
                const isThisSelected = selectedEmail === acc.email && loading;
                return (
                  <button
                    key={acc.email}
                    type="button"
                    disabled={loading}
                    onClick={() => handleSelectAccount(acc)}
                    className="w-full flex items-center justify-between p-3.5 rounded-2xl hover:bg-slate-50 border border-transparent hover:border-slate-200 active:bg-slate-100 transition-all text-left group disabled:opacity-60"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      {/* Avatar */}
                      <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                        {acc.photoURL ? (
                          <img
                            src={acc.photoURL}
                            alt={acc.displayName}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="font-bold text-slate-700 text-sm">
                            {acc.displayName.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>

                      {/* Info */}
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                          {acc.displayName}
                        </div>
                        <div className="text-xs text-slate-500 truncate">
                          {acc.email}
                        </div>
                      </div>
                    </div>

                    {/* Action icon or spinner */}
                    <div className="shrink-0 ml-2">
                      {isThisSelected ? (
                        <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border border-slate-200 flex items-center justify-center text-transparent group-hover:text-blue-600 group-hover:border-blue-300 transition-colors">
                          <Check className="w-3 h-3" />
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}

              {/* Add / Use another account button */}
              <button
                type="button"
                disabled={loading}
                onClick={() => {
                  setError(null);
                  setIsAddingNew(true);
                }}
                className="w-full flex items-center gap-3.5 p-3.5 rounded-2xl hover:bg-slate-50 border border-transparent hover:border-slate-200 active:bg-slate-100 transition-all text-left text-slate-700 font-medium text-sm group mt-1"
              >
                <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 group-hover:bg-blue-50 group-hover:text-blue-600 group-hover:border-blue-200 transition-colors shrink-0">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-800 group-hover:text-blue-600 transition-colors">
                    Utilizza un altro account
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Accedi con un indirizzo Google differente
                  </div>
                </div>
              </button>
            </div>
          ) : (
            /* Form for adding / choosing another Google Account */
            <form onSubmit={handleAddCustomAccount} className="space-y-4">
              <div className="flex items-center gap-2 pb-1">
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="p-1 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
                  title="Torna all'elenco account"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-semibold text-slate-800">
                  Accedi con un altro account Google
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">
                  Indirizzo email o telefono
                </label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="iltuoindirizzo@gmail.com"
                  autoFocus
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all shadow-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">
                  Nome visualizzato (opzionale)
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Es. Mario Rossi"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all shadow-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  disabled={loading}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all"
                >
                  Indietro
                </button>
                <button
                  type="submit"
                  disabled={loading || !newEmail.includes("@")}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-xs shadow-xs transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <span>Avanti</span>}
                </button>
              </div>
            </form>
          )}

          {/* Google Legal / Privacy Disclaimer */}
          <div className="mt-6 pt-4 border-t border-slate-100 text-[11px] text-slate-500 leading-relaxed text-center sm:text-left">
            Per continuare, Google condividerà il tuo nome, l'indirizzo email e l'immagine del profilo con l'applicazione{" "}
            <span className="font-semibold text-slate-700">pinna</span>. Consulta le{" "}
            <span className="text-blue-600 hover:underline cursor-pointer">Norme sulla privacy</span> e i{" "}
            <span className="text-blue-600 hover:underline cursor-pointer">Termini di servizio</span>.
          </div>
        </div>
      </div>
    </div>
  );
}
