import React, { createContext, useContext, useEffect, useState } from "react";
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  signOut as firebaseSignOut 
} from "firebase/auth";
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  getDoc,
  setDoc, 
  serverTimestamp 
} from "firebase/firestore";
import { auth, googleProvider, db } from "../lib/firebase";

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isAnonymous?: boolean;
  providerId?: string;
}

export interface PasswordResetResult {
  success: boolean;
  message: string;
  resetCode?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signInWithEmailInstant: (email: string, displayName?: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  handleGoogleCredentialResponse: (credential: string) => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, displayName: string) => Promise<void>;
  sendPasswordReset: (email: string) => Promise<PasswordResetResult>;
  confirmPasswordReset: (email: string, newPass: string, resetCode?: string) => Promise<void>;
  signInAsGuest: () => Promise<void>;
  signOut: () => Promise<void>;
  isWelcomeModalOpen: boolean;
  openWelcomeModal: () => void;
  closeWelcomeModal: () => void;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  isSettingsOpen: boolean;
  openSettings: () => void;
  closeSettings: () => void;
  isFeedbackOpen: boolean;
  openFeedback: () => void;
  closeFeedback: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signInWithEmailInstant: async () => {},
  signInWithGoogle: async () => {},
  handleGoogleCredentialResponse: async () => {},
  signInWithEmail: async () => {},
  signUpWithEmail: async () => {},
  sendPasswordReset: async () => ({ success: false, message: "" }),
  confirmPasswordReset: async () => {},
  signInAsGuest: async () => {},
  signOut: async () => {},
  isWelcomeModalOpen: true,
  openWelcomeModal: () => {},
  closeWelcomeModal: () => {},
  isAuthModalOpen: false,
  openAuthModal: () => {},
  closeAuthModal: () => {},
  isSettingsOpen: false,
  openSettings: () => {},
  closeSettings: () => {},
  isFeedbackOpen: false,
  openFeedback: () => {},
  closeFeedback: () => {},
});

const STORAGE_KEY = "pinna_auth_session_v3";

// Cryptographic hash for client-side password verification
async function sha256(str: string): Promise<string> {
  const enc = new TextEncoder();
  const hashBuffer = await window.crypto.subtle.digest("SHA-256", enc.encode(str));
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Decode Google Identity Services JWT payload safely
function parseGoogleJwt(token: string) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error("Failed to parse Google JWT", e);
    return null;
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      // Purge legacy test keys
      localStorage.removeItem("pinna_auth_user");
      localStorage.removeItem("pinna_auth_user_v2");

      // If user explicitly signed out, do NOT auto login
      if (localStorage.getItem("pinna_explicitly_logged_out") === "true") {
        return null;
      }

      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Ensure no leftover hardcoded developer email automatically logs in
        if (parsed?.email === "dellaquila037@gmail.com") {
          localStorage.removeItem(STORAGE_KEY);
          return null;
        }
        return parsed;
      }
    } catch {
      // ignore
    }
    return null;
  });

  const [loading, setLoading] = useState(true);

  // When user is null, the welcome gatekeeper screen must be active
  const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState<boolean>(() => {
    try {
      if (localStorage.getItem("pinna_explicitly_logged_out") === "true") {
        return true;
      }
      const saved = localStorage.getItem(STORAGE_KEY);
      return !saved;
    } catch {
      return true;
    }
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  // Helper to persist user state safely
  const persistUser = (u: AuthUser | null) => {
    setUser(u);
    try {
      if (u) {
        localStorage.removeItem("pinna_explicitly_logged_out");
        localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
        setIsWelcomeModalOpen(false);
      } else {
        localStorage.removeItem(STORAGE_KEY);
        setIsWelcomeModalOpen(true);
      }
    } catch {
      // ignore
    }
  };

  // Helper to sync user profile into Firestore without throwing fatal crashes
  const syncProfileToFirestore = async (u: AuthUser) => {
    try {
      await setDoc(
        doc(db, "users", u.uid),
        {
          userId: u.uid,
          email: u.email || "",
          displayName: u.displayName || "Utente pinna",
          photoURL: u.photoURL || "",
          isAnonymous: Boolean(u.isAnonymous),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    } catch (err) {
      console.warn("Could not sync profile to Firestore (using local persistence):", err);
    }
  };

  useEffect(() => {
    // Listen to Firebase client auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      // Respect explicit logout
      if (localStorage.getItem("pinna_explicitly_logged_out") === "true") {
        setLoading(false);
        return;
      }

      // If developer test account was previously cached in Firebase IndexedDB, sign it out once
      if (fbUser?.email === "dellaquila037@gmail.com" && localStorage.getItem("pinna_purged_dev_email") !== "true") {
        localStorage.setItem("pinna_purged_dev_email", "true");
        try { await firebaseSignOut(auth); } catch {}
        setLoading(false);
        return;
      }

      if (fbUser) {
        const authUser: AuthUser = {
          uid: fbUser.uid,
          email: fbUser.email,
          displayName: fbUser.displayName || (fbUser.isAnonymous ? "Ospite" : fbUser.email?.split("@")[0] || "Utente"),
          photoURL: fbUser.photoURL,
          isAnonymous: fbUser.isAnonymous,
          providerId: fbUser.providerData[0]?.providerId || "firebase",
        };
        persistUser(authUser);
        syncProfileToFirestore(authUser);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Ensure welcome modal opens if user is logged out
  useEffect(() => {
    if (!loading && !user) {
      setIsWelcomeModalOpen(true);
    }
  }, [user, loading]);

  // Handle Google credential returned by Google Identity Services official native button
  const handleGoogleCredentialResponse = async (credential: string) => {
    const payload = parseGoogleJwt(credential);
    if (!payload || !payload.email) {
      throw new Error("Dati account Google non validi.");
    }

    const cleanEmail = payload.email.trim().toLowerCase();
    const authUser: AuthUser = {
      uid: "g_" + (payload.sub || btoa(cleanEmail).replace(/[^a-zA-Z0-9]/g, "").slice(0, 14)),
      email: cleanEmail,
      displayName: payload.name || cleanEmail.split("@")[0],
      photoURL: payload.picture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(cleanEmail)}`,
      providerId: "google.com",
    };

    localStorage.removeItem("pinna_explicitly_logged_out");
    persistUser(authUser);
    syncProfileToFirestore(authUser);

    try {
      await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: authUser.email,
          displayName: authUser.displayName,
          photoURL: authUser.photoURL,
        }),
      });
    } catch {}

    setIsAuthModalOpen(false);
    setIsWelcomeModalOpen(false);
  };

  // 1. Ultra-simple, instant, zero-popup email sign-in (no popups, creates account if new, loads spots if existing)
  const signInWithEmailInstant = async (email: string, displayName?: string) => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      throw new Error("Inserisci un indirizzo email valido.");
    }

    // Deterministic UID from email hash so spots are permanently tied to this user across all devices/sessions
    const emailHash = await sha256(cleanEmail);
    const uid = "usr_" + emailHash.substring(0, 16);

    const rawPrefix = cleanEmail.split("@")[0].replace(/[._-]/g, " ");
    const defaultName = rawPrefix.charAt(0).toUpperCase() + rawPrefix.slice(1);
    const chosenName = displayName?.trim() || defaultName;
    const defaultAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(cleanEmail)}`;

    let finalName = chosenName;
    let finalAvatar = defaultAvatar;

    try {
      const userDocRef = doc(db, "users", uid);
      const snap = await getDoc(userDocRef);
      if (snap.exists()) {
        const data = snap.data();
        if (data.displayName) finalName = data.displayName;
        if (data.photoURL) finalAvatar = data.photoURL;
      }
    } catch (e) {
      console.warn("Firestore profile lookup notice:", e);
    }

    const authUser: AuthUser = {
      uid,
      email: cleanEmail,
      displayName: finalName,
      photoURL: finalAvatar,
      providerId: "email_direct",
    };

    localStorage.removeItem("pinna_explicitly_logged_out");
    persistUser(authUser);
    await syncProfileToFirestore(authUser);

    try {
      await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: cleanEmail,
          displayName: finalName,
          photoURL: finalAvatar,
        }),
      });
    } catch {}

    setIsAuthModalOpen(false);
    setIsWelcomeModalOpen(false);
  };

  // Google Sign In via standard popup or GSI token client
  // Google Sign In via standard Firebase Auth popup
  const signInWithGoogle = async () => {
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      if (cred?.user) {
        const u = cred.user;
        const authUser: AuthUser = {
          uid: u.uid,
          email: u.email || "",
          displayName: u.displayName || (u.email ? u.email.split("@")[0] : "Utente Google"),
          photoURL: u.photoURL || null,
          providerId: "google.com",
        };
        localStorage.removeItem("pinna_explicitly_logged_out");
        persistUser(authUser);
        await syncProfileToFirestore(authUser);
        setIsAuthModalOpen(false);
        setIsWelcomeModalOpen(false);
      }
    } catch (popupErr: any) {
      if (
        popupErr?.code === "auth/popup-closed-by-user" || 
        popupErr?.code === "auth/cancelled-popup-request"
      ) {
        throw new Error("Accesso con Google annullato.");
      }
      if (popupErr?.code === "auth/unauthorized-domain") {
        throw new Error("Il dominio attuale non è ancora registrato su Firebase Auth. Puoi entrare inserendo la tua email nel campo sottostante!");
      }
      throw new Error(popupErr?.message || "Impossibile completare l'accesso con Google.");
    }
  };

  // 2. Email & Password Sign In
  const signInWithEmail = async (email: string, pass: string) => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      throw new Error("Inserisci un indirizzo email valido.");
    }

    // A. Check Firestore directly (works on Vercel and all hosts)
    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", cleanEmail));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const userData = snap.docs[0].data();
        if (userData.passwordHash && userData.salt) {
          const computedHash = await sha256(pass + userData.salt);
          if (computedHash === userData.passwordHash) {
            const authUser: AuthUser = {
              uid: snap.docs[0].id,
              email: userData.email || cleanEmail,
              displayName: userData.displayName || cleanEmail.split("@")[0],
              photoURL: userData.photoURL || null,
              providerId: "password",
            };
            localStorage.removeItem("pinna_explicitly_logged_out");
            persistUser(authUser);
            setIsAuthModalOpen(false);
            setIsWelcomeModalOpen(false);
            return;
          } else {
            throw new Error("Password non corretta. Verifica e riprova.");
          }
        }
      }
    } catch (fsErr: any) {
      if (fsErr.message?.includes("Password non corretta")) throw fsErr;
      console.warn("Firestore signin notice:", fsErr);
    }

    // B. Check server endpoint if running
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail, password: pass }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.user) {
          const authUser: AuthUser = {
            uid: data.user.uid,
            email: data.user.email,
            displayName: data.user.displayName,
            photoURL: data.user.photoURL,
            providerId: "password",
          };
          localStorage.removeItem("pinna_explicitly_logged_out");
          persistUser(authUser);
          syncProfileToFirestore(authUser);
          setIsAuthModalOpen(false);
          setIsWelcomeModalOpen(false);
          return;
        }
      }
    } catch {}

    // C. Try Firebase auth if enabled
    try {
      const cred = await signInWithEmailAndPassword(auth, cleanEmail, pass);
      if (cred.user) {
        const authUser: AuthUser = {
          uid: cred.user.uid,
          email: cred.user.email,
          displayName: cred.user.displayName || cleanEmail.split("@")[0],
          photoURL: cred.user.photoURL,
          providerId: "password",
        };
        localStorage.removeItem("pinna_explicitly_logged_out");
        persistUser(authUser);
        syncProfileToFirestore(authUser);
        setIsAuthModalOpen(false);
        setIsWelcomeModalOpen(false);
        return;
      }
    } catch (fbErr: any) {
      if (fbErr.code === "auth/wrong-password") {
        throw new Error("Password non corretta.");
      }
    }

    throw new Error("Nessun account trovato con questa email. Clicca su 'Crea Account' per registrarti.");
  };

  // 3. Email & Password Sign Up
  const signUpWithEmail = async (email: string, pass: string, displayName: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = displayName.trim() || cleanEmail.split("@")[0];

    if (!cleanEmail || !cleanEmail.includes("@")) {
      throw new Error("Inserisci un indirizzo email valido.");
    }
    if (!pass || pass.length < 6) {
      throw new Error("La password deve contenere almeno 6 caratteri.");
    }

    // Check if user already exists in Firestore
    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", cleanEmail));
      const snap = await getDocs(q);
      if (!snap.empty) {
        throw new Error("Email già registrata! Clicca su 'Accedi' per entrare con la tua password.");
      }
    } catch (checkErr: any) {
      if (checkErr.message?.includes("già registrata")) throw checkErr;
      console.warn("Firestore check warning:", checkErr);
    }

    // Compute secure client-side hash
    const salt = Math.random().toString(36).substring(2, 12);
    const passwordHash = await sha256(pass + salt);
    const uid = "usr_" + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
    const photoURL = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(cleanEmail)}`;

    const authUser: AuthUser = {
      uid,
      email: cleanEmail,
      displayName: cleanName,
      photoURL,
      providerId: "password",
    };

    // Save profile and credentials directly to Firestore
    try {
      await setDoc(doc(db, "users", uid), {
        userId: uid,
        email: cleanEmail,
        displayName: cleanName,
        passwordHash,
        salt,
        photoURL,
        provider: "password",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (fsErr) {
      console.warn("Firestore direct user save warning:", fsErr);
    }

    // Also attempt server-side registration (silently ignores 404 if on static host like Vercel)
    try {
      await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail, password: pass, displayName: cleanName }),
      });
    } catch {}

    // Also attempt Firebase registration if enabled
    try {
      const cred = await createUserWithEmailAndPassword(auth, cleanEmail, pass);
      if (cred.user) {
        await updateProfile(cred.user, { displayName: cleanName });
      }
    } catch {}

    localStorage.removeItem("pinna_explicitly_logged_out");
    persistUser(authUser);
    setIsAuthModalOpen(false);
    setIsWelcomeModalOpen(false);
  };

  // 4. Send Password Reset
  const sendPasswordReset = async (email: string): Promise<PasswordResetResult> => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      throw new Error("Inserisci un indirizzo email valido.");
    }

    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Store reset code in Firestore if possible
    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", cleanEmail));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const userDoc = snap.docs[0];
        await setDoc(doc(db, "users", userDoc.id), {
          resetCode,
          resetExpiresAt: Date.now() + 15 * 60 * 1000,
        }, { merge: true });
      }
    } catch {}

    // Also attempt Firebase native password reset
    try {
      await sendPasswordResetEmail(auth, cleanEmail);
    } catch {}

    // Call server forgot password API if available
    try {
      await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail }),
      });
    } catch {}

    return {
      success: true,
      message: `Codice di recupero generato per ${cleanEmail}: ${resetCode}`,
      resetCode,
    };
  };

  // 5. Confirm Password Reset with new password
  const confirmPasswordReset = async (email: string, newPass: string, resetCode?: string) => {
    const cleanEmail = email.trim().toLowerCase();
    if (!newPass || newPass.length < 6) {
      throw new Error("La nuova password deve contenere almeno 6 caratteri.");
    }

    let updated = false;

    // Update in Firestore directly
    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", cleanEmail));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const userDoc = snap.docs[0];
        const salt = Math.random().toString(36).substring(2, 12);
        const passwordHash = await sha256(newPass + salt);
        await setDoc(doc(db, "users", userDoc.id), {
          passwordHash,
          salt,
          updatedAt: serverTimestamp(),
        }, { merge: true });
        updated = true;

        const authUser: AuthUser = {
          uid: userDoc.id,
          email: cleanEmail,
          displayName: userDoc.data().displayName || cleanEmail.split("@")[0],
          photoURL: userDoc.data().photoURL || null,
          providerId: "password",
        };
        localStorage.removeItem("pinna_explicitly_logged_out");
        persistUser(authUser);
        setIsAuthModalOpen(false);
        setIsWelcomeModalOpen(false);
      }
    } catch (fsErr) {
      console.warn("Firestore password reset error:", fsErr);
    }

    // Also update server if available
    try {
      await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail, newPassword: newPass, resetCode }),
      });
    } catch {}

    if (!updated) {
      throw new Error("Impossibile reimpostare la password. Verifica l'email e riprova.");
    }
  };

  // 6. Guest Mode
  const signInAsGuest = async () => {
    const guestUid = "guest_" + Math.random().toString(36).substring(2, 10);
    const guestUser: AuthUser = {
      uid: guestUid,
      email: null,
      displayName: "Ospite Esploratore",
      photoURL: `https://api.dicebear.com/7.x/bottts/svg?seed=${guestUid}`,
      isAnonymous: true,
    };
    localStorage.removeItem("pinna_explicitly_logged_out");
    persistUser(guestUser);
    syncProfileToFirestore(guestUser);
    setIsAuthModalOpen(false);
    setIsWelcomeModalOpen(false);
  };

  // 7. Sign Out
  const signOut = async () => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem("pinna_auth_user");
    localStorage.removeItem("pinna_auth_user_v2");
    localStorage.setItem("pinna_explicitly_logged_out", "true");
    sessionStorage.clear();
    try {
      await firebaseSignOut(auth);
    } catch {
      // ignore
    }
    setUser(null);
    setIsSettingsOpen(false);
    setIsWelcomeModalOpen(true);
  };

  const closeWelcomeModal = () => {
    if (user) {
      setIsWelcomeModalOpen(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signInWithEmailInstant,
        signInWithGoogle,
        handleGoogleCredentialResponse,
        signInWithEmail,
        signUpWithEmail,
        sendPasswordReset,
        confirmPasswordReset,
        signInAsGuest,
        signOut,
        isWelcomeModalOpen,
        openWelcomeModal: () => setIsWelcomeModalOpen(true),
        closeWelcomeModal,
        isAuthModalOpen,
        openAuthModal: () => setIsAuthModalOpen(true),
        closeAuthModal: () => setIsAuthModalOpen(false),
        isSettingsOpen,
        openSettings: () => setIsSettingsOpen(true),
        closeSettings: () => setIsSettingsOpen(false),
        isFeedbackOpen,
        openFeedback: () => setIsFeedbackOpen(true),
        closeFeedback: () => setIsFeedbackOpen(false),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
