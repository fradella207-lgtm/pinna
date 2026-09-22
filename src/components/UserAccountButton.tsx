import React from "react";
import { Settings, User as UserIcon, Cloud } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export const UserAccountButton: React.FC = () => {
  const { user, loading, openSettings } = useAuth();

  if (loading) {
    return (
      <div className="h-9 w-9 sm:w-28 rounded-full bg-white/70 dark:bg-slate-900/70 border border-slate-200/90 dark:border-slate-800 animate-pulse" />
    );
  }

  return (
    <button
      id="btn-settings-header"
      type="button"
      onClick={openSettings}
      className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/95 hover:bg-white dark:bg-slate-900/95 dark:hover:bg-slate-900 text-slate-800 dark:text-slate-100 border border-slate-200/90 dark:border-slate-800 shadow-[0_8px_30px_rgba(0,0,0,0.12)] hover:shadow-lg text-xs font-bold transition-all active:scale-95 cursor-pointer shrink-0"
      title="Impostazioni, Profilo e Abbonamento"
    >
      {user ? (
        <>
          {user.photoURL ? (
            <img
              src={user.photoURL}
              alt={user.displayName || "Utente"}
              referrerPolicy="no-referrer"
              className="w-5 h-5 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0"
            />
          ) : (
            <div className="w-5 h-5 rounded-full bg-slate-900 dark:bg-slate-700 text-white flex items-center justify-center text-[10px] font-black shrink-0">
              {user.displayName?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || "U"}
            </div>
          )}
          <span className="hidden sm:inline max-w-[90px] truncate font-medium text-slate-800 dark:text-slate-200">
            {user.displayName?.split(" ")[0] || user.email?.split("@")[0] || "Profilo"}
          </span>
          <Settings className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 shrink-0" />
        </>
      ) : (
        <>
          <Settings className="w-4 h-4 text-slate-600 dark:text-slate-300" />
          <span className="hidden sm:inline font-bold">Impostazioni</span>
        </>
      )}
    </button>
  );
};
