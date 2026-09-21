import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { AuthProvider } from "./context/AuthContext.tsx";
import { PreferencesProvider } from "./context/PreferencesContext.tsx";
import { SubscriptionProvider } from "./context/SubscriptionContext.tsx";
import "./index.css";

// Register Service Worker for PWA / Play Store TWA
if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => {
        console.log("PWA ServiceWorker registered with scope:", reg.scope);
      })
      .catch((err) => {
        console.warn("PWA ServiceWorker registration error:", err);
      });
  });
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <PreferencesProvider>
      <AuthProvider>
        <SubscriptionProvider>
          <App />
        </SubscriptionProvider>
      </AuthProvider>
    </PreferencesProvider>
  </StrictMode>
);
