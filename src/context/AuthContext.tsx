import React, { createContext, useContext, useEffect, useState } from "react";
import { 
  User, 
  onAuthStateChanged, 
  signInWithPopup, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  updateProfile,
  signOut as firebaseSignOut 
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, googleProvider, db, handleFirestoreError, OperationType, testFirestoreConnection } from "../lib/firebase";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, displayName: string) => Promise<void>;
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
  signInAsGuest: async () => {},
  signOut: async () => {},
  isWelcomeModalOpen: false,
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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Global modals control
  const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState<boolean>(() => {
    try {
      const seen = localStorage.getItem("pinna_seen_welcome_v1");
      return !seen;
    } catch {
      return false;
    }
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  useEffect(() => {
    testFirestoreConnection().catch(console.error);

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setLoading(false);

      if (currentUser) {
        // Synchronize basic user profile document
        const userDocPath = `users/${currentUser.uid}`;
        try {
          await setDoc(
            doc(db, "users", currentUser.uid),
            {
              userId: currentUser.uid,
              email: currentUser.email || "",
              displayName: currentUser.displayName || (currentUser.isAnonymous ? "Ospite" : "Utente pinna"),
              photoURL: currentUser.photoURL || "",
              isAnonymous: currentUser.isAnonymous,
              updatedAt: serverTimestamp(),
            },
            { merge: true }
          );
        } catch (err) {
          console.error("Error creating/updating user profile doc:", err);
          handleFirestoreError(err, OperationType.WRITE, userDocPath);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      setIsAuthModalOpen(false);
    } catch (error) {
      console.error("Google sign in error:", error);
      throw error;
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, pass);
      setIsAuthModalOpen(false);
    } catch (error) {
      console.error("Email sign in error:", error);
      throw error;
    }
  };

  const signUpWithEmail = async (email: string, pass: string, displayName: string) => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      if (displayName.trim() && cred.user) {
        await updateProfile(cred.user, { displayName: displayName.trim() });
      }
      setIsAuthModalOpen(false);
    } catch (error) {
      console.error("Email sign up error:", error);
      throw error;
    }
  };

  const signInAsGuest = async () => {
    try {
      await signInAnonymously(auth);
      setIsAuthModalOpen(false);
    } catch (error) {
      console.error("Anonymous sign in error:", error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error("Sign out error:", error);
      throw error;
    }
  };

  const closeWelcomeModal = () => {
    try {
      localStorage.setItem("pinna_seen_welcome_v1", "true");
    } catch {
      // ignore
    }
    setIsWelcomeModalOpen(false);
  };

  const openWelcomeModal = () => {
    setIsWelcomeModalOpen(true);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        signInAsGuest,
        signOut,
        isWelcomeModalOpen,
        openWelcomeModal,
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
