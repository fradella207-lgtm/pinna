import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { AuthProvider } from "./context/AuthContext.tsx";
import { PreferencesProvider } from "./context/PreferencesContext.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <PreferencesProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </PreferencesProvider>
  </StrictMode>
);
