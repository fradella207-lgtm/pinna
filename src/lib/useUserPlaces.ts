import { useState, useEffect } from "react";
import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  deleteDoc, 
  writeBatch 
} from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "./firebase";
import { useAuth } from "../context/AuthContext";
import { SavedPlace } from "../types";
import { INITIAL_PLACES } from "../data/initialData";

export function useUserPlaces() {
  const { user, loading: authLoading } = useAuth();
  const [places, setPlaces] = useState<SavedPlace[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If auth is still loading, wait
    if (authLoading) return;

    // If not logged in, fallback to local storage
    if (!user) {
      const local = localStorage.getItem("spotter_saved_places_v3");
      if (local) {
        try {
          setPlaces(JSON.parse(local));
        } catch {
          setPlaces(INITIAL_PLACES);
        }
      } else {
        setPlaces(INITIAL_PLACES);
      }
      setLoading(false);
      return;
    }

    // When logged in, listen to user's personal Firestore subcollection
    const placesPath = `users/${user.uid}/places`;
    const placesColRef = collection(db, "users", user.uid, "places");

    const unsubscribe = onSnapshot(
      placesColRef,
      async (snapshot) => {
        if (snapshot.empty) {
          // If first time this user logs in and collection is empty, seed with initial sample spots
          try {
            const batch = writeBatch(db);
            INITIAL_PLACES.forEach((place) => {
              const placeDocRef = doc(db, "users", user.uid, "places", place.id);
              batch.set(placeDocRef, {
                ...place,
                userId: user.uid,
                visited: Boolean(place.stato_iniziale?.visitato || place.visited),
              });
            });
            await batch.commit();
          } catch (err) {
            handleFirestoreError(err, OperationType.WRITE, placesPath);
          }
        } else {
          const userPlaces: SavedPlace[] = [];
          snapshot.forEach((docSnap) => {
            userPlaces.push({
              ...(docSnap.data() as SavedPlace),
              id: docSnap.id,
            });
          });
          setPlaces(userPlaces);
          setLoading(false);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, placesPath);
      }
    );

    return () => unsubscribe();
  }, [user, authLoading]);

  // Add or update place
  const savePlace = async (place: SavedPlace) => {
    if (!user) {
      // Local fallback
      setPlaces((prev) => {
        const next = [place, ...prev.filter((p) => p.id !== place.id)];
        localStorage.setItem("spotter_saved_places_v3", JSON.stringify(next));
        return next;
      });
      return;
    }

    const placePath = `users/${user.uid}/places/${place.id}`;
    try {
      await setDoc(doc(db, "users", user.uid, "places", place.id), {
        ...place,
        userId: user.uid,
        visited: Boolean(place.stato_iniziale?.visitato || place.visited),
      }, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, placePath);
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
        voto_personale: target.stato_iniziale?.voto_personale || 0,
      },
    };

    await savePlace(updated);
  };

  // Delete place
  const removePlace = async (placeId: string) => {
    if (!user) {
      setPlaces((prev) => {
        const next = prev.filter((p) => p.id !== placeId);
        localStorage.setItem("spotter_saved_places_v3", JSON.stringify(next));
        return next;
      });
      return;
    }

    const placePath = `users/${user.uid}/places/${placeId}`;
    try {
      await deleteDoc(doc(db, "users", user.uid, "places", placeId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, placePath);
    }
  };

  return {
    places,
    loading,
    savePlace,
    toggleVisited,
    removePlace,
  };
}
