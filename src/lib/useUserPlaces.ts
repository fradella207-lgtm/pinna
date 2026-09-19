import { useState, useEffect } from "react";
import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  deleteDoc, 
  writeBatch,
  getDocs 
} from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "./firebase";
import { useAuth } from "../context/AuthContext";
import { SavedPlace } from "../types";
import { INITIAL_PLACES } from "../data/initialData";

export function sanitizePlaceForFirestore<T extends Record<string, any>>(place: T): T {
  if (!place || typeof place !== "object") return place;
  const clean: any = { ...place };

  // Convert coordinate_percorso from nested arrays [[lat, lng], ...] to array of objects [{ lat, lng }, ...]
  if (Array.isArray(clean.coordinate_percorso)) {
    clean.coordinate_percorso = clean.coordinate_percorso.map((pt: any) => {
      if (Array.isArray(pt)) {
        return { lat: Number(pt[0]), lng: Number(pt[1]) };
      }
      if (pt && typeof pt === "object") {
        return { lat: Number(pt.lat), lng: Number(pt.lng) };
      }
      return pt;
    });
  }

  // Sanitize geometria_percorso.coordinate_linea
  if (clean.geometria_percorso && Array.isArray(clean.geometria_percorso.coordinate_linea)) {
    clean.geometria_percorso = {
      ...clean.geometria_percorso,
      coordinate_linea: clean.geometria_percorso.coordinate_linea.map((pt: any) => {
        if (Array.isArray(pt)) {
          return { lat: Number(pt[0]), lng: Number(pt[1]) };
        }
        if (pt && typeof pt === "object") {
          return { lat: Number(pt.lat), lng: Number(pt.lng) };
        }
        return pt;
      }),
    };
  }

  // Remove undefined values which Firestore rejects
  Object.keys(clean).forEach((k) => {
    if (clean[k] === undefined) {
      delete clean[k];
    }
  });

  return clean as T;
}

export function useUserPlaces() {
  const { user, loading: authLoading } = useAuth();
  const [places, setPlaces] = useState<SavedPlace[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If auth is still loading, wait
    if (authLoading) return;

    // Key for local per-user or guest cache
    const cacheKey = user ? `spotter_places_${user.uid}` : "spotter_saved_places_guest";

    // If not logged in, load from local storage (starts completely empty if nothing saved)
    if (!user) {
      const local = localStorage.getItem(cacheKey);
      if (local) {
        try {
          setPlaces(JSON.parse(local));
        } catch {
          setPlaces([]);
        }
      } else {
        setPlaces([]);
      }
      setLoading(false);
      return;
    }

    // Attempt to load from local cache first for instant render
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try {
        setPlaces(JSON.parse(cached));
      } catch {
        setPlaces([]);
      }
    } else {
      setPlaces([]);
    }

    // When logged in, listen to user's personal Firestore subcollection
    const placesColRef = collection(db, "users", user.uid, "places");

    const unsubscribe = onSnapshot(
      placesColRef,
      async (snapshot) => {
        if (snapshot.empty) {
          // New account or empty collection: keep completely empty!
          setPlaces([]);
          localStorage.setItem(cacheKey, JSON.stringify([]));
        } else {
          const userPlaces: SavedPlace[] = [];
          snapshot.forEach((docSnap) => {
            userPlaces.push({
              ...(docSnap.data() as SavedPlace),
              id: docSnap.id,
            });
          });
          setPlaces(userPlaces);
          localStorage.setItem(cacheKey, JSON.stringify(userPlaces));
        }
        setLoading(false);
      },
      (error) => {
        console.warn("Firestore snapshot listener notice, using local cache:", error);
        const local = localStorage.getItem(cacheKey);
        if (local) {
          try {
            setPlaces(JSON.parse(local));
          } catch {
            setPlaces([]);
          }
        } else {
          setPlaces([]);
        }
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, authLoading]);

  // Add or update place
  const savePlace = async (place: SavedPlace) => {
    const cacheKey = user ? `spotter_places_${user.uid}` : "spotter_saved_places_v3";

    // Optimistically update local state & localStorage
    setPlaces((prev) => {
      const next = [place, ...prev.filter((p) => p.id !== place.id)];
      localStorage.setItem(cacheKey, JSON.stringify(next));
      return next;
    });

    if (!user) return;

    try {
      const dataToSave = sanitizePlaceForFirestore({
        ...place,
        userId: user.uid,
        visited: Boolean(place.stato_iniziale?.visitato || place.visited),
      });
      await setDoc(doc(db, "users", user.uid, "places", place.id), dataToSave, { merge: true });
    } catch (err) {
      console.warn("Could not sync place to Firestore (saved locally):", err);
    }
  };

  // Toggle visited status
  const toggleVisited = async (placeId: string) => {
    const target = places.find((p) => p.id === placeId);
    if (!target) return;
    const nextVisited = !Boolean(target.stato_iniziale?.visitato || target.visited);

    const updated: SavedPlace = {
      ...target,
      visited: nextVisited,
      stato_iniziale: {
        ...target.stato_iniziale,
        visitato: nextVisited,
      },
    };

    await savePlace(updated);
  };

  // Delete place
  const removePlace = async (placeId: string) => {
    const cacheKey = user ? `spotter_places_${user.uid}` : "spotter_saved_places_v3";

    setPlaces((prev) => {
      const next = prev.filter((p) => p.id !== placeId);
      localStorage.setItem(cacheKey, JSON.stringify(next));
      return next;
    });

    if (!user) return;

    try {
      await deleteDoc(doc(db, "users", user.uid, "places", placeId));
    } catch (err) {
      console.warn("Could not delete place from Firestore (deleted locally):", err);
    }
  };

  // Clear / Reset all user places
  const clearAllPlaces = async () => {
    const cacheKey = user ? `spotter_places_${user.uid}` : "spotter_saved_places_v3";
    localStorage.removeItem(cacheKey);
    localStorage.removeItem("spotter_saved_places_v3");
    localStorage.removeItem("spotter_saved_places_v2");
    localStorage.removeItem("spotter_lists_v1");

    setPlaces([]);

    if (!user) return;

    try {
      const placesColRef = collection(db, "users", user.uid, "places");
      const snap = await getDocs(placesColRef);
      if (!snap.empty) {
        const batch = writeBatch(db);
        snap.forEach((d) => batch.delete(d.ref));
        await batch.commit();
      }
    } catch (err) {
      console.warn("Could not batch delete from Firestore:", err);
    }
  };

  // Explicitly seed sample spots on-demand ONLY if user requests it
  const seedSamplePlaces = async () => {
    const cacheKey = user ? `spotter_places_${user.uid}` : "spotter_saved_places_guest";
    setPlaces(INITIAL_PLACES);
    localStorage.setItem(cacheKey, JSON.stringify(INITIAL_PLACES));

    if (!user) return;
    try {
      const batch = writeBatch(db);
      INITIAL_PLACES.forEach((place) => {
        const placeDocRef = doc(db, "users", user.uid, "places", place.id);
        const dataToSave = sanitizePlaceForFirestore({
          ...place,
          userId: user.uid,
          visited: Boolean(place.stato_iniziale?.visitato || place.visited),
        });
        batch.set(placeDocRef, dataToSave);
      });
      await batch.commit();
    } catch (err) {
      console.warn("Could not seed sample places to Firestore:", err);
    }
  };

  return {
    places,
    loading,
    savePlace,
    toggleVisited,
    removePlace,
    clearAllPlaces,
    seedSamplePlaces,
  };
}
