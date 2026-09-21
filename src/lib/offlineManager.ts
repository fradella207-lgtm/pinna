import { SavedPlace } from "../types";

const OFFLINE_STORAGE_KEY = "pinna_offline_places_bundle";
const OFFLINE_SYNC_TIMESTAMP_KEY = "pinna_offline_last_sync";

export interface OfflineStatus {
  isOfflineReady: boolean;
  lastSyncTime: string | null;
  cachedCount: number;
}

export function saveOfflinePlacesBundle(places: SavedPlace[]): boolean {
  try {
    localStorage.setItem(OFFLINE_STORAGE_KEY, JSON.stringify(places));
    const now = new Date().toISOString();
    localStorage.setItem(OFFLINE_SYNC_TIMESTAMP_KEY, now);
    return true;
  } catch (err) {
    console.error("Errore salvataggio offline bundle:", err);
    return false;
  }
}

export function getOfflinePlacesBundle(): SavedPlace[] | null {
  try {
    const raw = localStorage.getItem(OFFLINE_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SavedPlace[];
  } catch {
    return null;
  }
}

export function getOfflineStatus(): OfflineStatus {
  try {
    const raw = localStorage.getItem(OFFLINE_STORAGE_KEY);
    const lastSync = localStorage.getItem(OFFLINE_SYNC_TIMESTAMP_KEY);
    if (!raw) {
      return { isOfflineReady: false, lastSyncTime: null, cachedCount: 0 };
    }
    const parsed = JSON.parse(raw);
    return {
      isOfflineReady: true,
      lastSyncTime: lastSync,
      cachedCount: Array.isArray(parsed) ? parsed.length : 0
    };
  } catch {
    return { isOfflineReady: false, lastSyncTime: null, cachedCount: 0 };
  }
}

export function clearOfflineBundle(): void {
  try {
    localStorage.removeItem(OFFLINE_STORAGE_KEY);
    localStorage.removeItem(OFFLINE_SYNC_TIMESTAMP_KEY);
  } catch (err) {
    console.warn("Errore pulizia offline bundle:", err);
  }
}
