import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "./AuthContext";
import { SubscriptionTier, BillingCycle, PricingPlan } from "../types";

export const PRICING_PLANS: Record<SubscriptionTier, PricingPlan> = {
  base: {
    id: "base",
    name: "Base",
    tagline: "Per esploratori occasionali",
    badge: "Gratis per Sempre",
    priceFormatted: "€0",
    subPriceText: "per sempre",
    maxSpots: 20,
    features: [
      "Salva fino a 20 Luoghi / Spot personali",
      "Accesso completo alla Mappa Satellitare 3D/HD",
      "Organizzazione rapida «Da Visitare» / «Già Visti»",
      "Estrazione spot da link social e coordinate"
    ],
    ctaLabel: "Piano Attuale",
    isPopular: false
  },
  pro: {
    id: "pro",
    name: "PINNA Pro",
    tagline: "Per veri viaggiatori ed esploratori outdoor",
    badge: "Consigliato",
    priceFormatted: "€1,99",
    subPriceText: "/ mese oppure €14,99 / anno",
    maxSpots: Infinity,
    features: [
      "Spot e Luoghi Illimitati sulla mappa",
      "Mappe e Tracciati Offline (senza connessione)",
      "Esportazione File GPX/KML per navigatori GPS (Garmin, OsmAnd)",
      "Filtri Avanzati per Altitudine, Mezzi e Regioni",
      "Sincronizzazione Cloud Istantanea Multi-Dispositivo"
    ],
    ctaLabel: "Passa a PINNA Pro",
    isPopular: true
  },
  founder: {
    id: "founder",
    name: "Founder / Early Access",
    tagline: "Supporta pinna fin dal giorno uno con tutti i privilegi",
    badge: "Accesso a Vita",
    priceFormatted: "€19,99",
    subPriceText: "una tantum • nessun canone",
    maxSpots: Infinity,
    features: [
      "Tutti i vantaggi di PINNA Pro Illimitati a Vita",
      "Upgrade Gratuito all'AI Engine quando verrà rilasciato",
      "Badge Esclusivo «Founder» nel profilo e nell'app",
      "Canale prioritario per richieste di nuove funzioni",
      "Accesso anticipato a tutti i futuri aggiornamenti"
    ],
    ctaLabel: "Diventa Founder",
    isPopular: false,
    isLifetime: true
  }
};

interface SubscriptionContextType {
  tier: SubscriptionTier;
  billingCycle: BillingCycle;
  isProOrFounder: boolean;
  maxSpots: number;
  isUpgradeModalOpen: boolean;
  upgradeReason: string | null;
  openUpgradeModal: (reason?: string) => void;
  closeUpgradeModal: () => void;
  upgradePlan: (newTier: SubscriptionTier, newCycle?: BillingCycle) => Promise<void>;
  checkCanAddSpot: (currentCount: number) => boolean;
}

const SubscriptionContext = createContext<SubscriptionContextType>({
  tier: "base",
  billingCycle: "monthly",
  isProOrFounder: false,
  maxSpots: 20,
  isUpgradeModalOpen: false,
  upgradeReason: null,
  openUpgradeModal: () => {},
  closeUpgradeModal: () => {},
  upgradePlan: async () => {},
  checkCanAddSpot: () => true
});

const STORAGE_TIER_KEY = "pinna_subscription_tier";
const STORAGE_CYCLE_KEY = "pinna_billing_cycle";

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  const [tier, setTierState] = useState<SubscriptionTier>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_TIER_KEY) as SubscriptionTier | null;
      if (saved && (saved === "base" || saved === "pro" || saved === "founder")) {
        return saved;
      }
    } catch {
      // fallback
    }
    return "base";
  });

  const [billingCycle, setBillingCycle] = useState<BillingCycle>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_CYCLE_KEY) as BillingCycle | null;
      if (saved && (saved === "monthly" || saved === "yearly" || saved === "lifetime")) {
        return saved;
      }
    } catch {
      // fallback
    }
    return "monthly";
  });

  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [upgradeReason, setUpgradeReason] = useState<string | null>(null);

  // Sync plan from Firestore when user changes
  useEffect(() => {
    if (!user) return;

    let isMounted = true;
    const loadUserPlan = async () => {
      try {
        const userDocRef = doc(db, "users", user.uid);
        const snap = await getDoc(userDocRef);
        if (snap.exists() && isMounted) {
          const data = snap.data();
          if (data.plan && ["base", "pro", "founder"].includes(data.plan)) {
            setTierState(data.plan as SubscriptionTier);
            localStorage.setItem(STORAGE_TIER_KEY, data.plan);
          }
          if (data.billingCycle && ["monthly", "yearly", "lifetime"].includes(data.billingCycle)) {
            setBillingCycle(data.billingCycle as BillingCycle);
            localStorage.setItem(STORAGE_CYCLE_KEY, data.billingCycle);
          }
        }
      } catch (err) {
        console.warn("Impossibile caricare il piano da Firestore, uso cache locale:", err);
      }
    };

    loadUserPlan();
    return () => {
      isMounted = false;
    };
  }, [user]);

  const openUpgradeModal = useCallback((reason?: string) => {
    setUpgradeReason(reason || null);
    setIsUpgradeModalOpen(true);
  }, []);

  const closeUpgradeModal = useCallback(() => {
    setIsUpgradeModalOpen(false);
    setUpgradeReason(null);
  }, []);

  const upgradePlan = useCallback(
    async (newTier: SubscriptionTier, newCycle: BillingCycle = "monthly") => {
      setTierState(newTier);
      setBillingCycle(newCycle);

      try {
        localStorage.setItem(STORAGE_TIER_KEY, newTier);
        localStorage.setItem(STORAGE_CYCLE_KEY, newCycle);
      } catch (err) {
        console.warn("Errore salvataggio piano in localStorage:", err);
      }

      if (user) {
        try {
          const userDocRef = doc(db, "users", user.uid);
          await setDoc(
            userDocRef,
            {
              plan: newTier,
              billingCycle: newCycle,
              planUpdatedAt: new Date().toISOString()
            },
            { merge: true }
          );
        } catch (err) {
          console.warn("Errore aggiornamento piano in Firestore:", err);
        }
      }
    },
    [user]
  );

  const isProOrFounder = tier === "pro" || tier === "founder";
  const maxSpots = isProOrFounder ? Infinity : 20;

  const checkCanAddSpot = useCallback(
    (currentCount: number): boolean => {
      if (isProOrFounder) return true;
      if (currentCount >= 20) {
        openUpgradeModal(
          "Hai raggiunto il limite di 20 spot del piano Base gratuito. Passa a PINNA Pro o Founder per salvare luoghi illimitati sulla mappa!"
        );
        return false;
      }
      return true;
    },
    [isProOrFounder, openUpgradeModal]
  );

  return (
    <SubscriptionContext.Provider
      value={{
        tier,
        billingCycle,
        isProOrFounder,
        maxSpots,
        isUpgradeModalOpen,
        upgradeReason,
        openUpgradeModal,
        closeUpgradeModal,
        upgradePlan,
        checkCanAddSpot
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => useContext(SubscriptionContext);
