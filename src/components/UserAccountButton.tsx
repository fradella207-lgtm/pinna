import React from "react";
import { LogIn, Settings, User as UserIcon, Cloud } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export const UserAccountButton: React.FC = () => {
  const { user, loading, openWelcomeModal, openSettings } = useAuth();

  if (loading) {
    return (
      <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 animate-pulse" />
    );
  }

  if (!user) {
    return (
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={openWelcomeModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/95 hover:bg-white text-slate-800 border border-slate-200/90 shadow-xs hover:shadow-md text-xs font-bold transition-all active:scale-95"
          title="Accedi o registrati per salvare i tuoi spot su Cloud"
        >
          <LogIn className="w-3.5 h-3.5 text-indigo-600" />
          <span>Accedi</span>
        </button>

        <button
          type="button"
          onClick={openSettings}
          className="w-8 h-8 rounded-full bg-white/95 hover:bg-white text-slate-600 hover:text-slate-900 border border-slate-200/90 shadow-xs flex items-center justify-center transition-all active:scale-95"
          title="Impostazioni dell'app"
        >
          <Settings className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        onClick={openSettings}
        className="flex items-center gap-1.5 p-1 pl-2.5 pr-2.5 rounded-full bg-white/95 hover:bg-white border border-slate-200/90 shadow-xs hover:shadow-sm text-xs transition-all active:scale-98 text-left"
        title="Apri impostazioni e profilo"
      >
        <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
          {user.photoURL ? (
            <img
              src={user.photoURL}
              alt={user.displayName || "Utente"}
              referrerPolicy="no-referrer"
              className="w-5 h-5 rounded-full object-cover border border-slate-200"
            />
          ) : (
            <UserIcon className="w-4 h-4 text-slate-500" />
          )}
          <span className="max-w-[70px] sm:max-w-[110px] truncate font-medium text-slate-800">
            {user.displayName?.split(" ")[0] || user.email?.split("@")[0] || "Account"}
          </span>
          <span className="hidden sm:inline-flex items-center text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md font-bold">
            <Cloud className="w-2.5 h-2.5 mr-0.5" /> Cloud
          </span>
        </div>
      </button>

      <button
        type="button"
        onClick={openSettings}
        className="w-8 h-8 rounded-full bg-white/95 hover:bg-white text-slate-600 hover:text-slate-900 border border-slate-200/90 shadow-xs flex items-center justify-center transition-all active:scale-95"
        title="Impostazioni"
      >
        <Settings className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
