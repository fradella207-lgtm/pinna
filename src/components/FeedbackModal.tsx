import React, { useState } from "react";
import { 
  X, 
  Send, 
  Loader2, 
  CheckCircle2, 
  Bug, 
  Lightbulb, 
  MapPin, 
  MessageSquareHeart, 
  Star,
  Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../context/AuthContext";

type FeedbackType = "bug" | "feature" | "place_correction" | "general";

interface FeedbackOption {
  id: FeedbackType;
  label: string;
  description: string;
  icon: React.ReactNode;
}

const FEEDBACK_OPTIONS: FeedbackOption[] = [
  {
    id: "feature",
    label: "Nuova Idea",
    description: "Suggerisci una funzione che vorresti in pinna",
    icon: <Lightbulb className="w-4 h-4 text-amber-500" />,
  },
  {
    id: "bug",
    label: "Segnala un Bug",
    description: "Qualcosa non funziona o si blocca",
    icon: <Bug className="w-4 h-4 text-rose-500" />,
  },
  {
    id: "place_correction",
    label: "Errore su Luogo",
    description: "Posizione errata, nome impreciso o mappa",
    icon: <MapPin className="w-4 h-4 text-indigo-500" />,
  },
  {
    id: "general",
    label: "Feedback Generale",
    description: "Dicci la tua esperienza generale",
    icon: <MessageSquareHeart className="w-4 h-4 text-emerald-500" />,
  },
];

export const FeedbackModal: React.FC = () => {
  const { isFeedbackOpen, closeFeedback, user } = useAuth();

  const [type, setType] = useState<FeedbackType>("feature");
  const [rating, setRating] = useState<number>(5);
  const [message, setMessage] = useState("");
  const [contactEmail, setContactEmail] = useState(user?.email || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isFeedbackOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      setError("Inserisci una descrizione per aiutarci a capire.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const feedbackPayload = {
      type,
      rating,
      message: message.trim(),
      email: contactEmail.trim() || user?.email || "anonimo",
      userId: user?.uid || "ospite",
      createdAt: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    try {
      // Save directly to Firestore collection 'feedback'
      await addDoc(collection(db, "feedback"), {
        ...feedbackPayload,
        timestamp: serverTimestamp(),
      });
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setMessage("");
        closeFeedback();
      }, 2500);
    } catch (err: any) {
      console.warn("Firestore feedback submission error, saving locally:", err);
      // Store in localStorage as robust fallback
      try {
        const stored = JSON.parse(localStorage.getItem("pinna_feedback_queue") || "[]");
        stored.push(feedbackPayload);
        localStorage.setItem("pinna_feedback_queue", JSON.stringify(stored));
        setIsSuccess(true);
        setTimeout(() => {
          setIsSuccess(false);
          setMessage("");
          closeFeedback();
        }, 2200);
      } catch {
        setError("Impossibile inviare la segnalazione al momento. Riprova più tardi.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      id="modal-feedback"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/60 backdrop-blur-sm"
    >
      <div onClick={closeFeedback} className="absolute inset-0" />

      <motion.div
        initial={{ y: "100%", opacity: 0.8 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0 }}
        transition={{ type: "spring", stiffness: 360, damping: 30 }}
        className="relative w-full sm:max-w-lg max-h-[92vh] bg-white text-slate-900 rounded-t-3xl sm:rounded-3xl border border-slate-200 shadow-2xl flex flex-col overflow-hidden z-10"
      >
        {/* Header */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center shadow-xs">
              <Sparkles className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                Segnala e Aiutaci a Migliorare
              </h2>
              <p className="text-[11px] text-slate-500">
                La tua opinione è fondamentale per il futuro di pinna
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={closeFeedback}
            className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
          {isSuccess ? (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-xs">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Grazie per il tuo contributo!
              </h3>
              <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
                Abbiamo registrato il tuo feedback. Ogni segnalazione ci aiuta a perfezionare pinna per tutta la community.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
                  {error}
                </div>
              )}

              {/* Feedback Category Picker */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 block">
                  Cosa vuoi condividere?
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {FEEDBACK_OPTIONS.map((opt) => {
                    const isSelected = type === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setType(opt.id)}
                        className={`p-2.5 rounded-2xl border text-left transition-all flex items-start gap-2.5 ${
                          isSelected
                            ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                            : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700"
                        }`}
                      >
                        <div className="mt-0.5">{opt.icon}</div>
                        <div>
                          <div className={`text-xs font-bold ${isSelected ? "text-white" : "text-slate-900"}`}>
                            {opt.label}
                          </div>
                          <div className={`text-[10px] leading-tight line-clamp-2 mt-0.5 ${isSelected ? "text-slate-300" : "text-slate-500"}`}>
                            {opt.description}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Rating stars */}
              <div className="space-y-1.5 pt-1">
                <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                  <span>Come valuti la tua esperienza finora?</span>
                  <span className="text-[11px] font-semibold text-amber-600">
                    {rating === 5 ? "Eccellente 🌟" : rating === 4 ? "Molto Buona" : rating === 3 ? "Buona" : rating === 2 ? "Da migliorare" : "Scarsa"}
                  </span>
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 rounded-lg hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`w-6 h-6 transition-colors ${
                          star <= rating
                            ? "fill-amber-400 text-amber-400"
                            : "fill-slate-100 text-slate-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Detailed Message */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 block">
                  Dettagli della segnalazione o proposta
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  placeholder={
                    type === "bug"
                      ? "Descrivi cosa stavi facendo e cosa è andato storto..."
                      : type === "feature"
                      ? "Quale funzione renderebbe pinna perfetta per te?"
                      : type === "place_correction"
                      ? "Indicaci il luogo e quale informazione vorresti correggere..."
                      : "Cosa ti piace di pinna e cosa possiamo migliorare?"
                  }
                  required
                  className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white resize-none transition-all"
                />
              </div>

              {/* Contact Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                  <span>Email di contatto (opzionale)</span>
                  <span className="text-[10px] text-slate-400 font-normal">Per aggiornarti</span>
                </label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="Se vuoi una risposta dal nostro team"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all"
                />
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 active:scale-98 transition-all disabled:opacity-50 mt-4"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Invia Segnalazione</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};
