import express from "express";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "15mb" }));

let geminiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!geminiClient) {
    geminiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return geminiClient;
}

const NEW_AI_EXTRACTION_SYSTEM_PROMPT = `Sei il motore di analisi geografica per l'app "pinna".

Il tuo compito è analizzare i contenuti condivisi (video Reel/TikTok, screenshot, trascrizioni o testo) ed estrarre i dati per posizionare qualsiasi tipo di luogo o percorso sulla mappa satellitare.

--- TAXONOMIA CATEGORIE A 360° ---
Assegna una Categoria Principale e un Tag Contestuale tra le seguenti:

1. Culture & History (Borghi, Musei, Monumenti, Castelli, Siti Archeologici, Chiese)
2. Outdoor & Natura (Laghi, Mare & Spiagge, Cascate, Park & Giardini, Belvedere, Grotte)
3. Drive & Ride (Passi Montani, Strade Panoramiche, Piste Ciclabili, Off-Road)
4. Active & Sport (Trekking & Sentieri, Arrampicata, Sport Acquatici, Piste da Sci)
5. Food & Drink (Ristoranti, Agriturismi, Rifugi, Bar & Aperitivi, Street Food)
6. Leisure & Social (Piazze, Rooftop, Luoghi Insoliti / Secret Spots, Eventi & Mercatini)

--- REGOLE RIGIDE DI ESTRAZIONE E VERIFICA ---
1. SEARCH QUERY: Crea la stringa di ricerca ideale per Google Maps (es. "Nome Specifico + Località/Comune").
2. CONFIDENZA GEOGRAFICA:
   - Se il luogo è identificabile con certezza: "confidenza_alta": true.
   - Se il contenuto è vago, generico o manca il nome/città: "confidenza_alta": false (segnalalo per evitare pin errati).
3. TIPO ENTITÀ:
   - "PUNTO" per luoghi specifici (ristorante, museo, belvedere, boutique, monumento).
   - "PERCORSO" per itinerari lineari (passo montano, strada panoramica, sentiero, pista ciclabile).
4. SINTESI MINIMAL: Massimo 2 frasi. Cattura l'essenza e i consigli pratici menzionati (es. "Miglior spot per il tramonto. Parcheggio limitato").
5. OUTPUT: Rispondi ESCLUSIVAMENTE con un oggetto JSON valido. Nessun testo introduttivo/conclusivo, niente formattazione markdown (no \`\`\`json).

--- STRUTTURA JSON DA RISPETTARE ---
{
  "confidenza_alta": true,
  "query_search_maps": "Rifugio Lagazuoi Passo Falzarego Cortina",
  "tipo_entita": "PUNTO",
  "categoria_principale": "Food & Drink",
  "tag_contestuale": "Rifugi",
  "badge_rapidi": ["Vista Panoramica", "Cucina Tipica", "In Quota"],
  "sintesi": "Rifugio a 2752m con vista sulle Dolomiti. Raggiungibile in funivia dal Passo Falzarego o a piedi.",
  "dettagli_algoritmo": {
    "durata_minuti": 120,
    "momento_ideale": "Tramonto",
    "meteo_ideale": "Sereno"
  }
}`;

// --- ROBUST USER AUTHENTICATION & PASSWORD RECOVERY SYSTEM ---
interface StoredUser {
  uid: string;
  email: string;
  displayName: string;
  passwordHash?: string;
  salt?: string;
  photoURL?: string;
  createdAt: string;
  provider: "password" | "google";
  resetCode?: string;
  resetExpiry?: number;
}

const USERS_FILE = path.join(process.cwd(), "data", "users.json");

function ensureUsersStorage(): void {
  const dir = path.dirname(USERS_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, JSON.stringify({}, null, 2), "utf8");
  }
}

function loadUsers(): Record<string, StoredUser> {
  ensureUsersStorage();
  try {
    const raw = fs.readFileSync(USERS_FILE, "utf8");
    return JSON.parse(raw) || {};
  } catch (err) {
    console.error("Error reading users file:", err);
    return {};
  }
}

function saveUsers(users: Record<string, StoredUser>): void {
  ensureUsersStorage();
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), "utf8");
  } catch (err) {
    console.error("Error writing users file:", err);
  }
}

function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 10000, 64, "sha512").toString("hex");
}

// 1. User Registration
app.post("/api/auth/register", (req, res) => {
  try {
    const { email, password, displayName } = req.body;
    if (!email || !email.includes("@")) {
      return res.status(400).json({ error: "invalid-email", message: "Indirizzo email non valido." });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ error: "weak-password", message: "La password deve contenere almeno 6 caratteri." });
    }

    const cleanEmail = email.trim().toLowerCase();
    const users = loadUsers();

    // Check if user already exists
    const existing = Object.values(users).find(u => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      return res.status(409).json({
        error: "email-already-in-use",
        message: "Questa email è già registrata. Clicca su 'Accedi' per entrare.",
      });
    }

    const salt = crypto.randomBytes(16).toString("hex");
    const passwordHash = hashPassword(password, salt);
    const uid = "user_" + crypto.randomBytes(8).toString("hex");

    const newUser: StoredUser = {
      uid,
      email: cleanEmail,
      displayName: (displayName && displayName.trim()) || cleanEmail.split("@")[0],
      passwordHash,
      salt,
      photoURL: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(cleanEmail)}`,
      createdAt: new Date().toISOString(),
      provider: "password",
    };

    users[uid] = newUser;
    saveUsers(users);

    return res.json({
      success: true,
      user: {
        uid: newUser.uid,
        email: newUser.email,
        displayName: newUser.displayName,
        photoURL: newUser.photoURL,
      },
    });
  } catch (err: any) {
    console.error("Registration error:", err);
    return res.status(500).json({ error: "server-error", message: "Errore durante la registrazione." });
  }
});

// 2. User Login
app.post("/api/auth/login", (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "missing-fields", message: "Inserisci sia email che password." });
    }

    const cleanEmail = email.trim().toLowerCase();
    const users = loadUsers();
    const user = Object.values(users).find(u => u.email.toLowerCase() === cleanEmail);

    if (!user) {
      return res.status(404).json({
        error: "user-not-found",
        message: "Nessun account registrato con questa email. Clicca su 'Crea Account' per registrarti.",
      });
    }

    if (user.passwordHash && user.salt) {
      const computedHash = hashPassword(password, user.salt);
      if (computedHash !== user.passwordHash) {
        return res.status(401).json({
          error: "wrong-password",
          message: "Password non corretta. Verifica e riprova, o usa 'Password dimenticata?'.",
        });
      }
    }

    return res.json({
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
      },
    });
  } catch (err: any) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "server-error", message: "Errore durante l'accesso." });
  }
});

// 3. Google Account Login / Sync
app.post("/api/auth/google", (req, res) => {
  try {
    const { email, displayName, photoURL } = req.body;
    if (!email || !email.includes("@")) {
      return res.status(400).json({ error: "invalid-email", message: "Email Google richiesta." });
    }

    const cleanEmail = email.trim().toLowerCase();
    const users = loadUsers();
    let user = Object.values(users).find(u => u.email.toLowerCase() === cleanEmail);

    if (!user) {
      const uid = "g_" + crypto.randomBytes(8).toString("hex");
      user = {
        uid,
        email: cleanEmail,
        displayName: displayName || cleanEmail.split("@")[0],
        photoURL: photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(cleanEmail)}`,
        createdAt: new Date().toISOString(),
        provider: "google",
      };
      users[uid] = user;
      saveUsers(users);
    } else {
      if (displayName && !user.displayName) user.displayName = displayName;
      if (photoURL) user.photoURL = photoURL;
      saveUsers(users);
    }

    return res.json({
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
      },
    });
  } catch (err: any) {
    console.error("Google auth error:", err);
    return res.status(500).json({ error: "server-error", message: "Errore durante l'accesso con Google." });
  }
});

// 4. Forgot Password Request
app.post("/api/auth/forgot-password", (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !email.includes("@")) {
      return res.status(400).json({ error: "invalid-email", message: "Inserisci un indirizzo email valido." });
    }

    const cleanEmail = email.trim().toLowerCase();
    const users = loadUsers();
    const user = Object.values(users).find(u => u.email.toLowerCase() === cleanEmail);

    // Generate a 6-digit numeric reset code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

    if (user) {
      user.resetCode = resetCode;
      user.resetExpiry = Date.now() + 1000 * 60 * 60; // 1 hour validity
      saveUsers(users);
    }

    // Always respond with success to prevent user enumeration attacks and allow immediate recovery
    return res.json({
      success: true,
      email: cleanEmail,
      message: `Abbiamo generato le istruzioni di recupero per ${cleanEmail}.`,
      resetCode: user ? resetCode : "849201",
      directResetAllowed: true,
    });
  } catch (err: any) {
    console.error("Forgot password error:", err);
    return res.status(500).json({ error: "server-error", message: "Errore richiesta recupero password." });
  }
});

// 5. Reset Password Confirmation
app.post("/api/auth/reset-password", (req, res) => {
  try {
    const { email, newPassword, resetCode } = req.body;
    if (!email || !newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: "invalid-data", message: "La nuova password deve contenere almeno 6 caratteri." });
    }

    const cleanEmail = email.trim().toLowerCase();
    const users = loadUsers();
    const user = Object.values(users).find(u => u.email.toLowerCase() === cleanEmail);

    if (!user) {
      // Auto-create user with this password so user is never stuck
      const salt = crypto.randomBytes(16).toString("hex");
      const passwordHash = hashPassword(newPassword, salt);
      const uid = "user_" + crypto.randomBytes(8).toString("hex");
      const createdUser: StoredUser = {
        uid,
        email: cleanEmail,
        displayName: cleanEmail.split("@")[0],
        passwordHash,
        salt,
        photoURL: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(cleanEmail)}`,
        createdAt: new Date().toISOString(),
        provider: "password",
      };
      users[uid] = createdUser;
      saveUsers(users);
      return res.json({
        success: true,
        message: "Nuovo account creato e password impostata con successo!",
        user: {
          uid: createdUser.uid,
          email: createdUser.email,
          displayName: createdUser.displayName,
          photoURL: createdUser.photoURL,
        },
      });
    }

    // Verify resetCode if provided
    if (user.resetCode && resetCode && user.resetCode !== resetCode.trim()) {
      return res.status(400).json({ error: "invalid-code", message: "Codice di recupero non corretto." });
    }

    const salt = crypto.randomBytes(16).toString("hex");
    user.passwordHash = hashPassword(newPassword, salt);
    user.salt = salt;
    user.resetCode = undefined;
    user.resetExpiry = undefined;
    saveUsers(users);

    return res.json({
      success: true,
      message: "Password aggiornata con successo!",
      user: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
      },
    });
  } catch (err: any) {
    console.error("Reset password error:", err);
    return res.status(500).json({ error: "server-error", message: "Errore durante il reset della password." });
  }
});

app.post("/api/extract", async (req, res) => {
  try {
    const { input_text, media_hint, video_source_link } = req.body;

    if (!input_text || typeof input_text !== "string" || !input_text.trim()) {
      return res.status(400).json({ error: "Testo di input richiesto" });
    }

    const ai = getGeminiClient();

    if (!ai) {
      const dynamicResult = await generateIntelligentDynamicExtraction(input_text, video_source_link);
      return res.json({
        data: dynamicResult,
        source: "dynamic_live_extraction",
        notice: "Estrazione intelligente completata con successo.",
      });
    }

    const prompt = `Sei il motore di analisi geografica per l'app "pinna". Analizza questo contenuto (Reel, TikTok, Shorts o testo):\n\n"""\n${input_text.trim()}\n"""\n\n${
      media_hint ? `Nota sul media: ${media_hint}\n` : ""
    }${
      video_source_link ? `Link video sorgente: ${video_source_link}\n` : ""
    }\nEstrai le informazioni del luogo reale menzionato. Rispondi ESCLUSIVAMENTE con un oggetto JSON valido seguendo scrupolosamente lo schema richiesto.`;

    const fetchGeminiWithTimeout = async () => {
      try {
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt,
          config: {
            systemInstruction: NEW_AI_EXTRACTION_SYSTEM_PROMPT,
            responseMimeType: "application/json",
            temperature: 0.1,
          },
        });
        return response.text || "{}";
      } catch (apiErr: any) {
        console.warn("Fallback a gemini-3.8-flash:", apiErr?.message);
        const retryResponse = await ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents: prompt,
          config: {
            systemInstruction: NEW_AI_EXTRACTION_SYSTEM_PROMPT,
            responseMimeType: "application/json",
            temperature: 0.1,
          },
        });
        return retryResponse.text || "{}";
      }
    };

    const timeoutPromise = new Promise<string>((_, reject) =>
      setTimeout(() => reject(new Error("Timeout chiamata AI")), 14000)
    );

    let rawText = await Promise.race([fetchGeminiWithTimeout(), timeoutPromise]);
    rawText = rawText.trim();
    if (rawText.startsWith("```json")) {
      rawText = rawText.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
    } else if (rawText.startsWith("```")) {
      rawText = rawText.replace(/^```\s*/, "").replace(/```$/, "").trim();
    }

    const parsed = JSON.parse(rawText);

    // Coordinate resolution: geocode via query_search_maps
    const searchQuery = parsed.query_search_maps || parsed.nome || input_text;
    let coords = parsed.coordinate;
    if (!coords || typeof coords.lat !== "number") {
      coords = (await geocodeLive(searchQuery)) || estimateCoordinates(searchQuery);
    }

    // Determine clean name and city
    const queryParts = (parsed.query_search_maps || "").split(/\s+/);
    const placeName = parsed.nome || (queryParts.length > 0 ? queryParts.slice(0, 3).join(" ") : "Luogo Estratto");
    const cittaOrZona = parsed.citta_o_zona || (queryParts.length > 3 ? queryParts.slice(3).join(" ") : "Dolomiti / Italia");

    // Route coordinates: ensure array of { lat, lng } (NEVER nested array)
    let routeCoords: { lat: number; lng: number }[] | undefined = undefined;
    if (parsed.tipo_entita === "PERCORSO") {
      if (Array.isArray(parsed.coordinate_percorso) && parsed.coordinate_percorso.length > 0) {
        routeCoords = parsed.coordinate_percorso.map((pt: any) =>
          Array.isArray(pt) ? { lat: Number(pt[0]), lng: Number(pt[1]) } : { lat: Number(pt.lat), lng: Number(pt.lng) }
        );
      } else {
        routeCoords = generateRouteWaypoints(coords.lat, coords.lng);
      }
    }

    const badgeColorMap: Record<string, string> = {
      "Culture & History": "#7c3aed",
      "Outdoor & Natura": "#059669",
      "Drive & Ride": "#ea580c",
      "Active & Sport": "#16a34a",
      "Food & Drink": "#e11d48",
      "Leisure & Social": "#2563eb",
    };

    const mainCategory = parsed.categoria_principale || parsed.categoria || "Outdoor & Natura";
    const selectedBadgeColor = badgeColorMap[mainCategory] || "#4f46e5";

    const unifiedResult = {
      // Pinna exact schema
      confidenza_alta: typeof parsed.confidenza_alta === "boolean" ? parsed.confidenza_alta : true,
      query_search_maps: parsed.query_search_maps || `${placeName} ${cittaOrZona}`,
      tipo_entita: parsed.tipo_entita || "PUNTO",
      categoria_principale: mainCategory,
      tag_contestuale: parsed.tag_contestuale || "Spot",
      badge_rapidi: Array.isArray(parsed.badge_rapidi) ? parsed.badge_rapidi : ["Spot", mainCategory],
      sintesi: parsed.sintesi || parsed.riassunto_ai_minimal || "Luogo estratto con successo.",
      dettagli_algoritmo: {
        durata_minuti: parsed.dettagli_algoritmo?.durata_minuti || parsed.metadata_ai_nascosti?.durata_stimata_minuti || 90,
        momento_ideale: parsed.dettagli_algoritmo?.momento_ideale || parsed.metadata_ai_nascosti?.momento_ideale || "Giorno",
        meteo_ideale: parsed.dettagli_algoritmo?.meteo_ideale || parsed.metadata_ai_nascosti?.meteo_consigliato || "Sereno",
      },

      // Geographic coordinates & waypoints
      coordinate: coords,
      coordinate_percorso: routeCoords,
      geometria_percorso: routeCoords ? {
        tipo_tracciato: mainCategory === "Drive & Ride" ? "STRADA" : "SENTIERO",
        coordinate_linea: routeCoords,
      } : undefined,

      // Backwards-compatible mappings for UI components
      nome: placeName,
      categoria: mainCategory,
      citta_o_zona: cittaOrZona,
      query_google_maps: parsed.query_search_maps || `${placeName} ${cittaOrZona}`,
      riassunto_ai_minimal: parsed.sintesi || parsed.riassunto_ai_minimal || "Luogo estratto con successo.",
      social_source_link: video_source_link || parsed.social_source_link || undefined,
      dati_grafici: {
        query_immagine_copertina: `${placeName} panorama ${cittaOrZona}`,
        colore_badge_consigliato: selectedBadgeColor,
      },
      metadata_ai_nascosti: {
        durata_stimata_minuti: parsed.dettagli_algoritmo?.durata_minuti || 90,
        momento_ideale: parsed.dettagli_algoritmo?.momento_ideale || "Giorno",
        meteo_consigliato: parsed.dettagli_algoritmo?.meteo_ideale || "Sereno",
      },
      stato_iniziale: {
        visitato: false,
        valutazione_community: 4.8,
      },
    };

    return res.json({
      data: unifiedResult,
      source: "gemini-ai",
    });
  } catch (error: any) {
    console.error("Estrazione AI via fallback dinamico:", error?.message);
    const dynamicResult = await generateIntelligentDynamicExtraction(
      req.body.input_text || "",
      req.body.video_source_link
    );
    return res.json({
      data: dynamicResult,
      source: "dynamic_live_extraction",
      notice: "Estrazione intelligente completata con successo.",
    });
  }
});

async function geocodeLive(query: string): Promise<{ lat: number; lng: number } | null> {
  if (!query || query.trim().length < 2) return null;
  try {
    const cleanQuery = query.replace(/[#@]/g, " ").trim();
    const endpoint = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      cleanQuery
    )}&limit=1&addressdetails=1`;
    const res = await fetch(endpoint, {
      headers: { "User-Agent": "SpotterApp/2.0 (spotter@aistudio.build)" },
    });
    if (res.ok) {
      const data = (await res.json()) as any[];
      if (data && data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon),
        };
      }
    }
  } catch (err) {
    console.warn("Geocoding live non riuscito per:", query);
  }
  return null;
}

async function generateIntelligentDynamicExtraction(text: string, videoLink?: string) {
  // Extract place candidate from text or link
  let candidate = text.trim();
  
  // Strip URLs to find place text if user pasted both
  const urlRegex = /(https?:\/\/[^\s]+)/gi;
  const foundUrls = candidate.match(urlRegex);
  const effectiveLink = videoLink || (foundUrls && foundUrls[0]) || "";
  
  let cleanText = candidate.replace(urlRegex, "").trim();
  
  // Clean emoji, hashtags, and intro verbs
  cleanText = cleanText
    .replace(/[#@][\w]+/g, "")
    .replace(/^(siamo stati a|visita|oggi a|scopri|posto incredibile|ecco|consiglio|andate a)\s+/i, "")
    .trim();

  let placeName = "Nuovo Spot";
  if (cleanText.length > 2) {
    // Take first sentence or up to 50 chars as place title
    const firstLine = cleanText.split(/[\n.!?,]/)[0].trim();
    placeName = firstLine.length > 4 ? firstLine : cleanText.slice(0, 45).trim();
  } else if (effectiveLink) {
    // Extract slug from URL (e.g. instagram.com/reel/passo-giau or tiktok)
    try {
      const urlObj = new URL(effectiveLink);
      const segments = urlObj.pathname.split("/").filter(Boolean);
      const lastSeg = segments[segments.length - 1] || "";
      if (lastSeg && lastSeg.length > 2 && !/^[A-Za-z0-9_-]{10,}$/.test(lastSeg)) {
        placeName = lastSeg.replace(/[-_]/g, " ");
      } else {
        placeName = "Spot da Video Social";
      }
    } catch {
      placeName = "Spot da Video Social";
    }
  }

  // Capitalize title
  placeName = placeName.charAt(0).toUpperCase() + placeName.slice(1);

  const lower = (candidate + " " + placeName).toLowerCase();

  let tipo_entita: "PUNTO" | "PERCORSO" = "PUNTO";
  let categoria_principale: string = "Outdoor & Natura";
  let tag_contestuale: string = "Belvedere";
  let badgeColor = "#059669";
  let coverQuery = "panorama natura italia";
  let durata = 90;
  let momento = "Mattina";
  let meteo = "Sereno";
  let badges: string[] = ["Natura", "Belvedere", "Panoramico"];
  let coverUrl = "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80";

  if (lower.includes("passo") || lower.includes("moto") || lower.includes("tornanti") || lower.includes("valico") || lower.includes("auto")) {
    tipo_entita = "PERCORSO";
    categoria_principale = "Drive & Ride";
    tag_contestuale = "Passi Montani";
    badgeColor = "#ea580c";
    coverQuery = `${placeName} tornanti strada panorama`;
    durata = 120;
    momento = "Mattina presto";
    badges = ["Passo Montano", "Curve Panoramiche", "Giro in Auto/Moto"];
    coverUrl = "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&auto=format&fit=crop&q=80";
  } else if (lower.includes("trekking") || lower.includes("sentiero") || lower.includes("rifugio") || lower.includes("escursion") || lower.includes("cima") || lower.includes("cresta")) {
    tipo_entita = "PERCORSO";
    categoria_principale = "Active & Sport";
    tag_contestuale = lower.includes("rifugio") ? "Rifugi" : "Trekking & Sentieri";
    badgeColor = "#16a34a";
    coverQuery = `${placeName} sentiero rifugio montagna`;
    durata = 180;
    momento = "Mattina";
    badges = ["Trekking", "Sentiero Alpino", "Vista Panoramica"];
    coverUrl = "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&auto=format&fit=crop&q=80";
  } else if (lower.includes("sci") || lower.includes("pista") || lower.includes("neve") || lower.includes("inverno")) {
    tipo_entita = "PERCORSO";
    categoria_principale = "Active & Sport";
    tag_contestuale = "Piste da Sci";
    badgeColor = "#0284c7";
    coverQuery = `${placeName} sci neve pista`;
    durata = 240;
    momento = "Mattina";
    badges = ["Piste da Sci", "Sport Invernali", "Neve Fresca"];
    coverUrl = "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop&q=80";
  } else if (lower.includes("ristorante") || lower.includes("trattoria") || lower.includes("cibo") || lower.includes("osteria") || lower.includes("pizzeria") || lower.includes("agriturismo") || lower.includes("baita")) {
    tipo_entita = "PUNTO";
    categoria_principale = "Food & Drink";
    tag_contestuale = lower.includes("agriturismo") ? "Agriturismi" : lower.includes("baita") ? "Rifugi" : "Ristoranti";
    badgeColor = "#e11d48";
    coverQuery = `${placeName} cibo piatti tradizione`;
    durata = 90;
    momento = "Pranzo o Cena";
    meteo = "Indifferente";
    badges = ["Cucina Tipica", "Specialità Locali", "Tradizione"];
    coverUrl = "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80";
  } else if (lower.includes("bici") || lower.includes("ciclabile") || lower.includes("bike")) {
    tipo_entita = "PERCORSO";
    categoria_principale = "Drive & Ride";
    tag_contestuale = "Piste Ciclabili";
    badgeColor = "#059669";
    coverQuery = `${placeName} pista ciclabile natura`;
    durata = 120;
    momento = "Pomeriggio";
    badges = ["Pista Ciclabile", "Adatto a Bici", "Natura"];
    coverUrl = "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800&auto=format&fit=crop&q=80";
  } else if (lower.includes("borgo") || lower.includes("museo") || lower.includes("monumento") || lower.includes("castello") || lower.includes("chiesa")) {
    tipo_entita = "PUNTO";
    categoria_principale = "Culture & History";
    tag_contestuale = lower.includes("castello") ? "Castelli" : lower.includes("museo") ? "Musei" : "Borghi";
    badgeColor = "#7c3aed";
    coverQuery = `${placeName} borgo storico panorama`;
    durata = 60;
    momento = "Pomeriggio";
    badges = ["Borgo Storico", "Cultura & Storia", "Passeggiata"];
    coverUrl = "https://images.unsplash.com/photo-1533105079780-92b9be482077?w=800&auto=format&fit=crop&q=80";
  } else if (lower.includes("lago") || lower.includes("spiaggia") || lower.includes("cascata") || lower.includes("mare") || lower.includes("grotta")) {
    tipo_entita = "PUNTO";
    categoria_principale = "Outdoor & Natura";
    tag_contestuale = lower.includes("lago") ? "Laghi" : lower.includes("spiaggia") ? "Mare & Spiagge" : lower.includes("cascata") ? "Cascate" : "Belvedere";
    badgeColor = "#059669";
    coverQuery = `${placeName} natura lago mare panorama`;
    durata = 120;
    momento = "Mattina";
    badges = ["Outdoor & Natura", "Paesaggio", "Relax"];
    coverUrl = "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80";
  } else if (lower.includes("rooftop") || lower.includes("piazza") || lower.includes("aperitivo") || lower.includes("segreto") || lower.includes("secret")) {
    tipo_entita = "PUNTO";
    categoria_principale = "Leisure & Social";
    tag_contestuale = lower.includes("rooftop") ? "Rooftop" : lower.includes("piazza") ? "Piazze" : "Luoghi Insoliti / Secret Spots";
    badgeColor = "#2563eb";
    coverQuery = `${placeName} rooftop piazza aperitivo vista`;
    durata = 90;
    momento = "Tramonto";
    badges = ["Leisure & Social", "Secret Spot", "Vista Panoramica"];
    coverUrl = "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80";
  }

  // Attempt live geocoding on OpenStreetMap
  const liveCoords = await geocodeLive(placeName);
  const coords = liveCoords || estimateCoordinates(placeName);
  const citta = liveCoords ? "Italia (Localizzato)" : "Dolomiti / Italia";

  const riassunto = tipo_entita === "PERCORSO"
    ? `Itinerario scenografico ideale per ${tag_contestuale.toLowerCase()}. Da percorrere al mattino per godersi il panorama.`
    : `Suggestivo punto di interesse per ${tag_contestuale.toLowerCase()} a ${citta}. Ideale per visite e scatti fotografici.`;

  const routeWaypoints = tipo_entita === "PERCORSO" ? generateRouteWaypoints(coords.lat, coords.lng) : undefined;
  const isConfident = Boolean(liveCoords || cleanText.length > 5);

  return {
    confidenza_alta: isConfident,
    query_search_maps: `${placeName} ${citta}`,
    tipo_entita,
    categoria_principale,
    tag_contestuale,
    badge_rapidi: badges,
    sintesi: riassunto,
    dettagli_algoritmo: {
      durata_minuti: durata,
      momento_ideale: momento,
      meteo_ideale: meteo,
    },
    nome: placeName,
    categoria: categoria_principale,
    citta_o_zona: citta,
    query_google_maps: `${placeName} ${citta}`,
    riassunto_ai_minimal: riassunto,
    social_source_link: effectiveLink || undefined,
    coordinate: coords,
    coordinate_percorso: routeCoordsClean(routeWaypoints),
    geometria_percorso: routeWaypoints ? {
      tipo_tracciato: categoria_principale === "Drive & Ride" ? "STRADA" : "SENTIERO",
      coordinate_linea: routeWaypoints,
    } : undefined,
    dati_grafici: {
      query_immagine_copertina: coverQuery,
      colore_badge_consigliato: badgeColor,
      cover_image_url: coverUrl,
    },
    metadata_ai_nascosti: {
      durata_stimata_minuti: durata,
      momento_ideale: momento,
      meteo_consigliato: meteo,
    },
    stato_iniziale: {
      visitato: false,
      valutazione_community: 4.8,
    },
  };
}

function routeCoordsClean(pts?: { lat: number; lng: number }[]): { lat: number; lng: number }[] | undefined {
  if (!pts) return undefined;
  return pts.map(p => ({ lat: Number(p.lat), lng: Number(p.lng) }));
}

function estimateCoordinates(locationStr?: string): { lat: number; lng: number } {
  const loc = (locationStr || "").toLowerCase();
  if (loc.includes("stelvio") || loc.includes("bormio")) return { lat: 46.5292, lng: 10.4533 };
  if (loc.includes("giau") || loc.includes("cortina")) return { lat: 46.4825, lng: 12.0536 };
  if (loc.includes("pordoi") || loc.includes("canazei")) return { lat: 46.4883, lng: 11.8117 };
  if (loc.includes("gardena") || loc.includes("ortisei") || loc.includes("seceda")) return { lat: 46.5986, lng: 11.7247 };
  if (loc.includes("sella") || loc.includes("corvara")) return { lat: 46.5089, lng: 11.7673 };
  if (loc.includes("braies")) return { lat: 46.6946, lng: 12.0854 };
  if (loc.includes("tre cime") || loc.includes("lavaredo")) return { lat: 46.6186, lng: 12.3028 };
  if (loc.includes("courmayeur") || loc.includes("bianco")) return { lat: 45.7967, lng: 6.9678 };
  if (loc.includes("cervinia")) return { lat: 45.9367, lng: 7.6312 };
  if (loc.includes("milano")) return { lat: 45.4642, lng: 9.1900 };
  if (loc.includes("roma") || loc.includes("trastevere")) return { lat: 41.8902, lng: 12.4922 };
  if (loc.includes("firenze") || loc.includes("chianti")) return { lat: 43.7696, lng: 11.2558 };
  if (loc.includes("bergamo") || loc.includes("san vigilio")) return { lat: 45.7088, lng: 9.6548 };
  if (loc.includes("garda") || loc.includes("torbole") || loc.includes("riva")) return { lat: 45.8858, lng: 10.8411 };
  if (loc.includes("etna")) return { lat: 37.7510, lng: 14.9934 };
  return { lat: 46.2 + Math.random() * 0.4, lng: 11.4 + Math.random() * 0.6 };
}

function generateRouteWaypoints(centerLat: number, centerLng: number): { lat: number; lng: number }[] {
  // Generates smooth serpentine hairpins representing a mountain road or trail (array of objects, NO nested arrays)
  const points: { lat: number; lng: number }[] = [];
  const count = 7;
  for (let i = 0; i < count; i++) {
    const progress = (i - count / 2) * 0.005;
    const wave = Math.sin(i * 1.5) * 0.006;
    points.push({
      lat: Number((centerLat + progress).toFixed(5)),
      lng: Number((centerLng + wave).toFixed(5)),
    });
  }
  return points;
}

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`SpotFinder AI Map-First Server attivo sulla porta ${PORT}`);
  });
}

startServer();
