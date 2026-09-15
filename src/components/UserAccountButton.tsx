import React from "react";
import { LogIn, LogOut, User as UserIcon, Cloud, Check } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export const UserAccountButton: React.FC = () => {
  const { user, loading, signInWithGoogle, signOut } = useAuth();

  if (loading) {
    return (
      <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 animate-pulse" />
    );
  }

  if (!user) {
    return (
      <button
        type="button"
        onClick={() => signInWithGoogle().catch(console.error)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/95 hover:bg-white text-slate-800 border border-slate-200/90 shadow-xs hover:shadow-md text-xs font-bold transition-all active:scale-95"
        title="Accedi con il tuo account Google per salvare i tuoi luoghi su Cloud"
      >
        <LogIn className="w-3.5 h-3.5 text-indigo-600" />
        <span className="hidden sm:inline">Accedi con Google</span>
        <span className="sm:hidden">Accedi</span>
      </button>
    );
  }

  return (
    <div className="flex items-center gap-1.5 p-1 pl-2.5 rounded-full bg-white/95 border border-slate-200/90 shadow-xs text-xs">
      <div className="flex items-center gap-1.5 text-slate-700 font-semibold pr-1">
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
        <span className="max-w-[80px] sm:max-w-[120px] truncate font-medium text-slate-800">
          {user.displayName?.split(" ")[0] || user.email?.split("@")[0] || "Account"}
        </span>
        <span className="hidden sm:inline-flex items-center text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md font-bold">
          <Cloud className="w-2.5 h-2.5 mr-0.5" /> Cloud
        </span>
      </div>

      <button
        type="button"
        onClick={() => signOut().catch(console.error)}
        className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        title="Disconnetti account"
      >
        <LogOut className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
