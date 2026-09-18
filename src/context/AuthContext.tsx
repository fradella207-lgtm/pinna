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
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
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
  signInWithGoogle: () => Promise<void>;
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
  signInWithGoogle: async () => {},
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

const STORAGE_KEY = "pinna_auth_user_v2";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return null;
  });

  const [loading, setLoading] = useState(true);

  // When user is null, the welcome gatekeeper screen must be active
  const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState<boolean>(() => {
    try {
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
      if (fbUser) {
        // If there's an existing manual user in local storage with a different email, preserve it
        try {
          const saved = localStorage.getItem(STORAGE_KEY);
          if (saved) {
            const parsed = JSON.parse(saved);
            if (parsed && parsed.email && fbUser.email && parsed.email.toLowerCase() !== fbUser.email.toLowerCase()) {
              console.log("Preserving active custom user session:", parsed.email);
              setLoading(false);
              return;
            }
          }
        } catch {
          // ignore
        }

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

  // 1. Google Sign In via standard Google popup (accounts of the computer)
  const signInWithGoogle = async () => {
    // Attempt standard Firebase signInWithPopup first
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      if (cred.user) {
        const authUser: AuthUser = {
          uid: cred.user.uid,
          email: cred.user.email || "",
          displayName: cred.user.displayName || (cred.user.email ? cred.user.email.split("@")[0] : "Utente Google"),
          photoURL: cred.user.photoURL || null,
          providerId: "google.com",
        };
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
        return;
      }
    } catch (popupErr: any) {
      console.warn("Firebase signInWithPopup error:", popupErr);

      if (
        popupErr?.code === "auth/popup-closed-by-user" || 
        popupErr?.code === "auth/cancelled-popup-request"
      ) {
        throw new Error("Accesso Google annullato.");
      }

      // Fallback to Google Identity Services (GSI) native popup if available
      const gsi = (window as any).google?.accounts?.oauth2;
      if (gsi) {
        await new Promise<void>((resolve, reject) => {
          try {
            const client = gsi.initTokenClient({
              client_id: "377912341406-b26rn1juct1vd7ajatoha2cqjk2njmqd.apps.googleusercontent.com",
              scope: "email profile openid",
              callback: async (tokenResponse: any) => {
                if (tokenResponse?.error) {
                  if (tokenResponse.error === "access_denied") {
                    reject(new Error("Accesso Google annullato."));
                  } else {
                    reject(new Error(tokenResponse.error_description || tokenResponse.error));
                  }
                  return;
                }
                if (tokenResponse?.access_token) {
                  try {
                    const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
                      headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
                    });
                    const profile = await userInfoRes.json();
                    if (profile?.email) {
                      const authUser: AuthUser = {
                        uid: "g_" + (profile.sub || btoa(profile.email).replace(/[^a-zA-Z0-9]/g, "").slice(0, 14)),
                        email: profile.email,
                        displayName: profile.name || profile.email.split("@")[0],
                        photoURL: profile.picture || null,
                        providerId: "google.com",
                      };
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
                      resolve();
                      return;
                    }
                  } catch (e) {
                    reject(e);
                    return;
                  }
                }
                reject(new Error("Nessun token ricevuto da Google"));
              },
            });
            client.requestAccessToken({ prompt: "select_account" });
          } catch (err) {
            reject(err);
          }
        });
        return;
      }

      throw popupErr;
    }
  };

  // 2. Email & Password Sign In
  const signInWithEmail = async (email: string, pass: string) => {
    const cleanEmail = email.trim().toLowerCase();

    // Try Firebase Email Auth first
    try {
      const cred = await signInWithEmailAndPassword(auth, cleanEmail, pass);
      if (cred.user) {
        const authUser: AuthUser = {
          uid: cred.user.uid,
          email: cred.user.email,
          displayName: cred.user.displayName || cleanEmail.split("@")[0],
          photoURL: cred.user.photoURL,
        };
        persistUser(authUser);
        syncProfileToFirestore(authUser);
        setIsAuthModalOpen(false);
        setIsWelcomeModalOpen(false);
        return;
      }
    } catch (fbErr: any) {
      console.warn("Firebase email login fallback to local server auth:", fbErr?.code || fbErr?.message);
    }

    // Call server authentication endpoint
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: cleanEmail, password: pass }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || "Errore durante l'accesso.");
    }

    const authUser: AuthUser = {
      uid: data.user.uid,
      email: data.user.email,
      displayName: data.user.displayName,
      photoURL: data.user.photoURL,
    };

    persistUser(authUser);
    syncProfileToFirestore(authUser);
    setIsAuthModalOpen(false);
    setIsWelcomeModalOpen(false);
  };

  // 3. Email & Password Sign Up
  const signUpWithEmail = async (email: string, pass: string, displayName: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = displayName.trim() || cleanEmail.split("@")[0];

    // Try Firebase Email Auth first
    try {
      const cred = await createUserWithEmailAndPassword(auth, cleanEmail, pass);
      if (cred.user) {
        await updateProfile(cred.user, { displayName: cleanName });
        const authUser: AuthUser = {
          uid: cred.user.uid,
          email: cred.user.email,
          displayName: cleanName,
          photoURL: cred.user.photoURL,
        };
        persistUser(authUser);
        syncProfileToFirestore(authUser);
        setIsAuthModalOpen(false);
        setIsWelcomeModalOpen(false);
        return;
      }
    } catch (fbErr: any) {
      console.warn("Firebase email signup fallback to local server auth:", fbErr?.code || fbErr?.message);
    }

    // Call server registration endpoint
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: cleanEmail, password: pass, displayName: cleanName }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || "Errore durante la registrazione.");
    }

    const authUser: AuthUser = {
      uid: data.user.uid,
      email: data.user.email,
      displayName: data.user.displayName,
      photoURL: data.user.photoURL,
    };

    persistUser(authUser);
    syncProfileToFirestore(authUser);
    setIsAuthModalOpen(false);
    setIsWelcomeModalOpen(false);
  };

  // 4. Send Password Reset
  const sendPasswordReset = async (email: string): Promise<PasswordResetResult> => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      throw new Error("Inserisci un indirizzo email valido.");
    }

    // Also attempt Firebase native password reset
    try {
      await sendPasswordResetEmail(auth, cleanEmail);
    } catch (fbErr: any) {
      console.warn("Firebase native password reset notice:", fbErr?.code || fbErr?.message);
    }

    // Call server forgot password API
    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: cleanEmail }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || "Impossibile elaborare la richiesta di recupero password.");
    }

    return {
      success: true,
      message: `Abbiamo generato le istruzioni di recupero per ${cleanEmail}.`,
      resetCode: data.resetCode,
    };
  };

  // 5. Confirm Password Reset with new password
  const confirmPasswordReset = async (email: string, newPass: string, resetCode?: string) => {
    const cleanEmail = email.trim().toLowerCase();
    if (!newPass || newPass.length < 6) {
      throw new Error("La nuova password deve contenere almeno 6 caratteri.");
    }

    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: cleanEmail, newPassword: newPass, resetCode }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || "Errore durante il reset della password.");
    }

    if (data.user) {
      const authUser: AuthUser = {
        uid: data.user.uid,
        email: data.user.email,
        displayName: data.user.displayName,
        photoURL: data.user.photoURL,
      };
      persistUser(authUser);
      syncProfileToFirestore(authUser);
      setIsAuthModalOpen(false);
      setIsWelcomeModalOpen(false);
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
    persistUser(guestUser);
    syncProfileToFirestore(guestUser);
    setIsAuthModalOpen(false);
    setIsWelcomeModalOpen(false);
  };

  // 7. Sign Out
  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch {
      // ignore
    }
    persistUser(null);
    setIsSettingsOpen(false);
    setIsWelcomeModalOpen(true);
  };

  const closeWelcomeModal = () => {
    // Only allow closing if user is actually authenticated
    if (user) {
      setIsWelcomeModalOpen(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signInWithGoogle,
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
