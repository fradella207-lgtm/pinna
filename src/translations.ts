export type LanguageCode = "it" | "en" | "de" | "fr" | "es";

export interface TranslationDictionary {
  // Settings Modal
  settingsTitle: string;
  settingsSubtitle: string;
  accountSection: string;
  registeredUser: string;
  guestUser: string;
  cloudActive: string;
  localOnlyText: string;
  loginText: string;
  loginButton: string;
  logoutButton: string;
  
  // Customization
  customizationSection: string;
  themeTitle: string;
  themeLight: string;
  themeDark: string;
  themeAuto: string;
  
  languageTitle: string;
  languageSub: string;
  languageSavedSuccess: string;
  
  // Saved spots
  dataSection: string;
  savedSpotsCount: string;
  exportJson: string;
  privacyTitle: string;
  privacyStatus: string;
  
  // Danger Zone: 3-step safe delete flow
  dangerSection: string;
  deleteTitle: string;
  deleteDesc: string;
  deleteStep1Button: string;
  deleteStep2Title: string;
  deleteStep2Warning: string;
  deleteStep2Impact1: string;
  deleteStep2Impact2: string;
  deleteStep2Impact3: string;
  deleteStep2ProceedButton: string;
  deleteStep3Title: string;
  deleteStep3Question: string;
  deleteConfirmButton: string;
  cancelButton: string;
  deletingText: string;
  deleteSuccessMessage: string;
  
  // Feedback
  feedbackTitle: string;
  feedbackSubtitle: string;
  
  // Slogan
  slogan: string;
  
  // Quick Save Button
  saveSettingsButton: string;
  savedToast: string;
}

export const TRANSLATIONS: Record<LanguageCode, TranslationDictionary> = {
  it: {
    settingsTitle: "Impostazioni & Profilo",
    settingsSubtitle: "Personalizza tema, lingua, account e gestione dei dati salvati",
    accountSection: "Account & Cloud",
    registeredUser: "Utente Registrato",
    guestUser: "Modalità Ospite",
    cloudActive: "Cloud Sincronizzato",
    localOnlyText: "I dati sono salvati solo sul tuo browser locale",
    loginText: "Accedi con Google per sincronizzare i tuoi luoghi e note su tutti i dispositivi.",
    loginButton: "Accedi con Google / Email",
    logoutButton: "Disconnetti Account",
    
    customizationSection: "Personalizzazione & Aspetto",
    themeTitle: "Tema dell'App",
    themeLight: "Chiaro",
    themeDark: "Scuro",
    themeAuto: "Sistema",
    
    languageTitle: "Lingua dell'Interfaccia",
    languageSub: "Cambia istantaneamente i testi e le etichette dell'app",
    languageSavedSuccess: "Lingua aggiornata in tempo reale!",
    
    dataSection: "I Tuoi Luoghi & Backup",
    savedSpotsCount: "Spot e Luoghi Memorizzati",
    exportJson: "Esporta Backup JSON",
    privacyTitle: "Privacy e Dati",
    privacyStatus: "Archiviazione Protetta",
    
    dangerSection: "Gestione Avanzata & Ripristino",
    deleteTitle: "Elimina tutti i luoghi e resetta applicazione",
    deleteDesc: "Procedura di sicurezza guidata a 3 passaggi per prevenire cancellazioni accidentali di luoghi e preferenze.",
    deleteStep1Button: "Elimina tutti i luoghi e resetta l'applicazione",
    deleteStep2Title: "Cosa comporta questa operazione?",
    deleteStep2Warning: "Questa azione rimuoverà permanentemente tutti i tuoi dati da Pinna:",
    deleteStep2Impact1: "Tutti gli spot, i percorsi e le coordinate salvate",
    deleteStep2Impact2: "Tutte le liste personalizzate, foto e note allegate",
    deleteStep2Impact3: "I dati cloud sincronizzati e la memoria locale del browser",
    deleteStep2ProceedButton: "Ho capito, continua verso la conferma",
    deleteStep3Title: "Conferma definitiva richiesta",
    deleteStep3Question: "Sei assolutamente sicuro di voler cancellare tutto? Questa azione è irreversibile.",
    deleteConfirmButton: "Sì, Conferma ed Elimina Definitivamente",
    cancelButton: "Annulla e Torna Indietro",
    deletingText: "Eliminazione in corso...",
    deleteSuccessMessage: "Tutti i dati dell'applicazione sono stati eliminati con successo.",
    
    feedbackTitle: "Segnala e Aiutaci a Migliorare",
    feedbackSubtitle: "Invia suggerimenti, feedback o richiedi nuove funzionalità",
    
    slogan: "Basta screen dimenticati. I tuoi Reel e TikTok preferiti, subito sulla mappa.",
    saveSettingsButton: "Salva Impostazioni",
    savedToast: "Modifiche salvate con successo!",
  },
  en: {
    settingsTitle: "Settings & Profile",
    settingsSubtitle: "Customize theme, language, account and saved places data",
    accountSection: "Account & Cloud",
    registeredUser: "Registered User",
    guestUser: "Guest Mode",
    cloudActive: "Cloud Synced",
    localOnlyText: "Data is currently stored only in your local browser",
    loginText: "Sign in with Google to sync your places and notes across all your devices.",
    loginButton: "Sign In with Google / Email",
    logoutButton: "Sign Out",
    
    customizationSection: "Appearance & Preferences",
    themeTitle: "App Theme",
    themeLight: "Light",
    themeDark: "Dark",
    themeAuto: "System",
    
    languageTitle: "Interface Language",
    languageSub: "Instantly update all app texts and labels",
    languageSavedSuccess: "Language updated in real time!",
    
    dataSection: "Your Saved Places & Backup",
    savedSpotsCount: "Saved Spots & Locations",
    exportJson: "Export JSON Backup",
    privacyTitle: "Privacy & Security",
    privacyStatus: "Protected Storage",
    
    dangerSection: "Advanced Management & Reset",
    deleteTitle: "Delete all places and reset application",
    deleteDesc: "3-step safe reset workflow designed to prevent accidental erasure of your places.",
    deleteStep1Button: "Delete all places and reset application",
    deleteStep2Title: "What does this action do?",
    deleteStep2Warning: "This action will permanently wipe all your data from Pinna:",
    deleteStep2Impact1: "All saved spots, tracks and GPS coordinates",
    deleteStep2Impact2: "All custom lists, attached photos and notes",
    deleteStep2Impact3: "Synced cloud storage and local browser cache",
    deleteStep2ProceedButton: "Understood, proceed to confirmation",
    deleteStep3Title: "Final confirmation required",
    deleteStep3Question: "Are you completely sure? This action cannot be reversed.",
    deleteConfirmButton: "Yes, Confirm and Delete Permanently",
    cancelButton: "Cancel and Go Back",
    deletingText: "Clearing data...",
    deleteSuccessMessage: "All application data has been successfully deleted.",
    
    feedbackTitle: "Feedback & Suggestions",
    feedbackSubtitle: "Share ideas, suggest new features or report an issue",
    
    slogan: "No more lost screenshots. Your favorite Reels & TikToks, right on the map.",
    saveSettingsButton: "Save Changes",
    savedToast: "Settings saved successfully!",
  },
  de: {
    settingsTitle: "Einstellungen & Profil",
    settingsSubtitle: "Design, Sprache, Account und gespeicherte Daten anpassen",
    accountSection: "Konto & Cloud",
    registeredUser: "Registrierter Benutzer",
    guestUser: "Gast-Modus",
    cloudActive: "Cloud Synchronisiert",
    localOnlyText: "Daten werden nur lokal im Browser gespeichert",
    loginText: "Mit Google anmelden, um Orte geräteübergreifend zu synchronisieren.",
    loginButton: "Mit Google / E-Mail anmelden",
    logoutButton: "Abmelden",
    
    customizationSection: "Erscheinungsbild",
    themeTitle: "App-Design",
    themeLight: "Hell",
    themeDark: "Dunkel",
    themeAuto: "System",
    
    languageTitle: "Sprache",
    languageSub: "App-Texte sofort in Echtzeit ändern",
    languageSavedSuccess: "Sprache erfolgreich geändert!",
    
    dataSection: "Gespeicherte Orte & Backup",
    savedSpotsCount: "Gespeicherte Spots & Orte",
    exportJson: "JSON-Backup exportieren",
    privacyTitle: "Datenschutz & Sicherheit",
    privacyStatus: "Geschützt",
    
    dangerSection: "App Zurücksetzen",
    deleteTitle: "Alle Orte löschen und App zurücksetzen",
    deleteDesc: "Sicheres 3-Stufen-Verfahren zum Schutz vor versehentlichem Löschen.",
    deleteStep1Button: "Alle Orte löschen und Anwendung zurücksetzen",
    deleteStep2Title: "Was bewirkt diese Aktion?",
    deleteStep2Warning: "Diese Aktion löscht alle deine Daten unwiderruflich:",
    deleteStep2Impact1: "Alle gespeicherten Spots, Routen und Koordinaten",
    deleteStep2Impact2: "Alle Listen, angehängten Fotos und Notizen",
    deleteStep2Impact3: "Cloud-Synchronisation und lokaler Browser-Speicher",
    deleteStep2ProceedButton: "Verstanden, weiter zur Bestätigung",
    deleteStep3Title: "Letzte Bestätigung erforderlich",
    deleteStep3Question: "Bist du absolut sicher? Dies kann nicht rückgängig gemacht werden.",
    deleteConfirmButton: "Ja, endgültig löschen",
    cancelButton: "Abbrechen",
    deletingText: "Löschen...",
    deleteSuccessMessage: "Alle Daten wurden erfolgreich gelöscht.",
    
    feedbackTitle: "Feedback & Ideen",
    feedbackSubtitle: "Sende uns Vorschläge oder melde Probleme",
    
    slogan: "Schluss mit verlorenen Screenshots. Deine Reels & TikToks direkt auf der Karte.",
    saveSettingsButton: "Einstellungen speichern",
    savedToast: "Änderungen erfolgreich gespeichert!",
  },
  fr: {
    settingsTitle: "Paramètres & Profil",
    settingsSubtitle: "Personnalisez le thème, la langue, le compte et vos données",
    accountSection: "Compte & Cloud",
    registeredUser: "Utilisateur enregistré",
    guestUser: "Mode invité",
    cloudActive: "Synchronisé au Cloud",
    localOnlyText: "Données stockées uniquement sur votre navigateur local",
    loginText: "Connectez-vous avec Google pour synchroniser vos lieux sur tous vos appareils.",
    loginButton: "Connexion Google / Email",
    logoutButton: "Déconnexion",
    
    customizationSection: "Personnalisation & Thème",
    themeTitle: "Thème de l'application",
    themeLight: "Clair",
    themeDark: "Sombre",
    themeAuto: "Système",
    
    languageTitle: "Langue de l'interface",
    languageSub: "Mettez à jour instantanément les textes de l'application",
    languageSavedSuccess: "Langue mise à jour en temps réel !",
    
    dataSection: "Lieux Enregistrés & Sauvegarde",
    savedSpotsCount: "Spots & Lieux Sauvegardés",
    exportJson: "Exporter Backup JSON",
    privacyTitle: "Confidentialité",
    privacyStatus: "Stockage Protégé",
    
    dangerSection: "Gestion Avancée & Réinitialisation",
    deleteTitle: "Supprimer tous les lieux et réinitialiser",
    deleteDesc: "Procédure sécurisée en 3 étapes pour éviter toute suppression involontaire.",
    deleteStep1Button: "Supprimer tous les lieux et réinitialiser l'application",
    deleteStep2Title: "Que fait cette action ?",
    deleteStep2Warning: "Cette action effacera définitivement toutes vos données :",
    deleteStep2Impact1: "Tous les spots, parcours et coordonnées GPS",
    deleteStep2Impact2: "Toutes les listes, photos jointes et notes",
    deleteStep2Impact3: "Les données Cloud et le stockage local du navigateur",
    deleteStep2ProceedButton: "J'ai compris, passer à la confirmation",
    deleteStep3Title: "Confirmation finale requise",
    deleteStep3Question: "Êtes-vous absolument certain ? Cette action est irréversible.",
    deleteConfirmButton: "Oui, confirmer la suppression définitive",
    cancelButton: "Annuler",
    deletingText: "Suppression...",
    deleteSuccessMessage: "Toutes les données ont été supprimées avec succès.",
    
    feedbackTitle: "Avis & Suggestions",
    feedbackSubtitle: "Partagez vos idées ou signalez un problème",
    
    slogan: "Fini les captures oubliées. Vos Reels et TikToks directement sur la carte.",
    saveSettingsButton: "Enregistrer",
    savedToast: "Modifications enregistrées avec succès !",
  },
  es: {
    settingsTitle: "Ajustes y Perfil",
    settingsSubtitle: "Personaliza el tema, idioma, cuenta y gestión de datos",
    accountSection: "Cuenta y Nube",
    registeredUser: "Usuario Registrado",
    guestUser: "Modo Invitado",
    cloudActive: "Nube Sincronizada",
    localOnlyText: "Los datos están guardados solo en tu navegador local",
    loginText: "Inicia sesión con Google para sincronizar tus lugares en todos tus dispositivos.",
    loginButton: "Iniciar sesión con Google / Email",
    logoutButton: "Cerrar sesión",
    
    customizationSection: "Personalización y Apariencia",
    themeTitle: "Tema de la App",
    themeLight: "Claro",
    themeDark: "Oscuro",
    themeAuto: "Sistema",
    
    languageTitle: "Idioma de la Interfaz",
    languageSub: "Cambia al instante los textos de la aplicación",
    languageSavedSuccess: "¡Idioma actualizado en tiempo real!",
    
    dataSection: "Tus Lugares y Copia de Seguridad",
    savedSpotsCount: "Lugares y Spots Guardados",
    exportJson: "Exportar Copia JSON",
    privacyTitle: "Privacidad y Seguridad",
    privacyStatus: "Almacenamiento Seguro",
    
    dangerSection: "Gestión y Restablecimiento",
    deleteTitle: "Eliminar todos los lugares y reiniciar la app",
    deleteDesc: "Procedimiento de seguridad en 3 toques para evitar borrados accidentales.",
    deleteStep1Button: "Eliminar todos los lugares y reiniciar la aplicación",
    deleteStep2Title: "¿Qué implica esta acción?",
    deleteStep2Warning: "Esta acción borrará de manera permanente todos tus datos de Pinna:",
    deleteStep2Impact1: "Todos los lugares, rutas y coordenadas guardadas",
    deleteStep2Impact2: "Todas las listas, fotos y notas asociadas",
    deleteStep2Impact3: "La sincronización en la nube y el almacenamiento local",
    deleteStep2ProceedButton: "Entendido, ir a la confirmación",
    deleteStep3Title: "Confirmación final requerida",
    deleteStep3Question: "¿Estás completamente seguro? Esta acción no se puede deshacer.",
    deleteConfirmButton: "Sí, Confirmar y Eliminar Definitivamente",
    cancelButton: "Cancelar",
    deletingText: "Borrando...",
    deleteSuccessMessage: "Todos los datos han sido eliminados con éxito.",
    
    feedbackTitle: "Comentarios y Sugerencias",
    feedbackSubtitle: "Envíanos tus ideas o reporta un problema",
    
    slogan: "Basta de capturas olvidadas. Tus Reels y TikToks favoritos directos en el mapa.",
    saveSettingsButton: "Guardar Ajustes",
    savedToast: "¡Ajustes guardados con éxito!",
  },
};
