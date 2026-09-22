import { normalizeCountryName, getCountryFlag } from "./geoItaly";

// Global geocoding and search engine
// Provides fast, comprehensive worldwide search covering:
// - Monuments, museums, historical attractions, landmarks
// - Streets, avenues, squares, addresses
// - Mountain passes, peaks, lakes, beaches, natural parks
// - Cities, towns, villages, regions, countries across the globe

export interface GeoSearchResult {
  name: string;
  city: string;
  region?: string;
  country: string;
  countryFlag: string;
  lat: number;
  lng: number;
  displayName: string;
  categoryGuess?: string;
  typeLabel?: string; // e.g. "Monumento", "Museo", "Strada", "Passo Montano", "Città"
  source: "local_cache" | "photon" | "nominatim" | "coordinates" | "google_maps";
}

// Curated high-precision offline spots (Famous landmarks, Alps, passes, lakes, world monuments)
// Provides instant 0ms responses
const CURATED_KNOWN_PLACES: Array<{
  keywords: string[];
  name: string;
  city: string;
  region: string;
  country: string;
  lat: number;
  lng: number;
  category: string;
  typeLabel: string;
}> = [
  // Italy & Alps Highlights
  {
    keywords: ["colosseo", "colosseo roma", "anfiteatro flavio", "colosseum"],
    name: "Colosseo (Anfiteatro Flavio)",
    city: "Roma",
    region: "Lazio",
    country: "Italia",
    lat: 41.8902,
    lng: 12.4922,
    category: "Cultura & Storia",
    typeLabel: "Monumento Storico",
  },
  {
    keywords: ["fontana di trevi", "trevi roma", "trevi fountain"],
    name: "Fontana di Trevi",
    city: "Roma",
    region: "Lazio",
    country: "Italia",
    lat: 41.9009,
    lng: 12.4833,
    category: "Cultura & Storia",
    typeLabel: "Monumento Storico",
  },
  {
    keywords: ["pantheon", "pantheon roma"],
    name: "Pantheon",
    city: "Roma",
    region: "Lazio",
    country: "Italia",
    lat: 41.8986,
    lng: 12.4769,
    category: "Cultura & Storia",
    typeLabel: "Monumento Storico",
  },
  {
    keywords: ["duomo di milano", "duomo milano", "piazza duomo milano"],
    name: "Duomo di Milano",
    city: "Milano",
    region: "Lombardia",
    country: "Italia",
    lat: 45.4642,
    lng: 9.1919,
    category: "Cultura & Storia",
    typeLabel: "Monumento & Chiesa",
  },
  {
    keywords: ["galleria degli uffizi", "uffizi", "museo uffizi firenze"],
    name: "Galleria degli Uffizi",
    city: "Firenze",
    region: "Toscana",
    country: "Italia",
    lat: 43.7678,
    lng: 11.2553,
    category: "Cultura & Storia",
    typeLabel: "Museo d'Arte",
  },
  {
    keywords: ["torre di pisa", "piazza dei miracoli", "leaning tower of pisa"],
    name: "Torre di Pisa",
    city: "Pisa",
    region: "Toscana",
    country: "Italia",
    lat: 43.7230,
    lng: 10.3966,
    category: "Cultura & Storia",
    typeLabel: "Monumento Storico",
  },
  {
    keywords: ["piazza san marco", "san marco venezia", "basilica di san marco"],
    name: "Piazza San Marco",
    city: "Venezia",
    region: "Veneto",
    country: "Italia",
    lat: 45.4342,
    lng: 12.3389,
    category: "Cultura & Storia",
    typeLabel: "Piazza & Monumento",
  },
  {
    keywords: ["passo dello stelvio", "passo stelvio", "stelvio", "stilfser joch"],
    name: "Passo dello Stelvio (2.757m)",
    city: "Bormio / Trafoi (SO/BZ)",
    region: "Trentino-Alto Adige / Lombardia",
    country: "Italia",
    lat: 46.5287,
    lng: 10.4533,
    category: "Guida & Panorami",
    typeLabel: "Passo Montano",
  },
  {
    keywords: ["passo giau", "giau", "rifugio giau"],
    name: "Passo Giau (2.236m)",
    city: "Colle Santa Lucia / Cortina (BL)",
    region: "Veneto",
    country: "Italia",
    lat: 46.4825,
    lng: 12.0538,
    category: "Guida & Panorami",
    typeLabel: "Passo Montano",
  },
  {
    keywords: ["passo sella", "sella", "sellajoch"],
    name: "Passo Sella",
    city: "Canazei / Selva di Val Gardena (TN/BZ)",
    region: "Trentino-Alto Adige",
    country: "Italia",
    lat: 46.5089,
    lng: 11.7575,
    category: "Guida & Panorami",
    typeLabel: "Passo Montano",
  },
  {
    keywords: ["passo gardena", "gardena", "grödner joch"],
    name: "Passo Gardena",
    city: "Selva di Val Gardena / Corvara (BZ)",
    region: "Trentino-Alto Adige",
    country: "Italia",
    lat: 46.5497,
    lng: 11.8089,
    category: "Guida & Panorami",
    typeLabel: "Passo Montano",
  },
  {
    keywords: ["passo pordoi", "pordoi", "sass pordoi"],
    name: "Passo Pordoi",
    city: "Canazei / Livinallongo (TN/BL)",
    region: "Trentino-Alto Adige",
    country: "Italia",
    lat: 46.4883,
    lng: 11.8125,
    category: "Guida & Panorami",
    typeLabel: "Passo Montano",
  },
  {
    keywords: ["tre cime di lavaredo", "tre cime", "drei zinnen", "rifugio auronzo"],
    name: "Tre Cime di Lavaredo",
    city: "Auronzo di Cadore (BL)",
    region: "Veneto",
    country: "Italia",
    lat: 46.6186,
    lng: 12.2981,
    category: "Sport & Natura",
    typeLabel: "Vetta & Trekking",
  },
  {
    keywords: ["lago di braies", "braies", "pragser wildsee"],
    name: "Lago di Braies",
    city: "Braies (BZ)",
    region: "Trentino-Alto Adige",
    country: "Italia",
    lat: 46.6946,
    lng: 12.0854,
    category: "Natura & Relax",
    typeLabel: "Lago Alpino",
  },
  {
    keywords: ["lago di carezza", "carezza", "karersee"],
    name: "Lago di Carezza",
    city: "Nova Levante (BZ)",
    region: "Trentino-Alto Adige",
    country: "Italia",
    lat: 46.4092,
    lng: 11.5750,
    category: "Natura & Relax",
    typeLabel: "Lago Alpino",
  },
  {
    keywords: ["passo del furka", "furka pass", "furka", "hotel belvedere"],
    name: "Passo del Furka & Hotel Belvédère",
    city: "Realp / Obergoms",
    region: "Alpi Svizzere",
    country: "Svizzera",
    lat: 46.5724,
    lng: 8.4144,
    category: "Guida & Panorami",
    typeLabel: "Passo Montano",
  },
  // Global Landmarks & World Monuments
  {
    keywords: ["torre eiffel", "tour eiffel", "eiffel tower"],
    name: "Torre Eiffel",
    city: "Parigi",
    region: "Île-de-France",
    country: "Francia",
    lat: 48.8584,
    lng: 2.2945,
    category: "Cultura & Storia",
    typeLabel: "Monumento Mondiale",
  },
  {
    keywords: ["museo del louvre", "louvre", "louvre museum paris"],
    name: "Museo del Louvre",
    city: "Parigi",
    region: "Île-de-France",
    country: "Francia",
    lat: 48.8606,
    lng: 2.3376,
    category: "Cultura & Storia",
    typeLabel: "Museo",
  },
  {
    keywords: ["sagrada familia", "sagrada família barcellona"],
    name: "Basílica de la Sagrada Família",
    city: "Barcellona",
    region: "Catalogna",
    country: "Spagna",
    lat: 41.4036,
    lng: 2.1744,
    category: "Cultura & Storia",
    typeLabel: "Monumento & Chiesa",
  },
  {
    keywords: ["big ben", "elizabeth tower", "parliament london"],
    name: "Big Ben & Palazzo di Westminster",
    city: "Londra",
    region: "Greater London",
    country: "Regno Unito",
    lat: 51.5007,
    lng: -0.1246,
    category: "Cultura & Storia",
    typeLabel: "Monumento Storico",
  },
  {
    keywords: ["statua della liberta", "statue of liberty new york"],
    name: "Statua della Libertà",
    city: "New York",
    region: "New York",
    country: "Stati Uniti",
    lat: 40.6892,
    lng: -74.0445,
    category: "Cultura & Storia",
    typeLabel: "Monumento Mondiale",
  },
  // Italy & Alps Highlights Continued
  {
    keywords: ["passo falzarego", "falzarego"],
    name: "Passo Falzarego",
    city: "Cortina d'Ampezzo (BL)",
    region: "Veneto",
    country: "Italia",
    lat: 46.5189,
    lng: 12.0089,
    category: "Guida & Panorami",
    typeLabel: "Passo Montano",
  },
  {
    keywords: ["seceda", "baita sofie", "seceda 2500m"],
    name: "Seceda (Val Gardena)",
    city: "Ortisei / Santa Cristina (BZ)",
    region: "Trentino-Alto Adige",
    country: "Italia",
    lat: 46.6006,
    lng: 11.7267,
    category: "Natura & Relax",
    typeLabel: "Punto Panoramico",
  },
  {
    keywords: ["passo del gottardo", "san gottardo", "gotthard pass", "tremola"],
    name: "Passo del San Gottardo (Tremola)",
    city: "Airolo / Andermatt",
    region: "Ticino / Uri",
    country: "Svizzera",
    lat: 46.5592,
    lng: 8.5619,
    category: "Guida & Panorami",
    typeLabel: "Passo Montano",
  },
  {
    keywords: ["passo del bernina", "bernina pass", "bernina express"],
    name: "Passo del Bernina",
    city: "Pontresina / Poschiavo",
    region: "Grigioni",
    country: "Svizzera",
    lat: 46.4108,
    lng: 10.0225,
    category: "Guida & Panorami",
    typeLabel: "Passo Montano",
  },
  {
    keywords: ["chamonix", "aiguille du midi", "monte bianco"],
    name: "Aiguille du Midi (Chamonix / Monte Bianco)",
    city: "Chamonix-Mont-Blanc",
    region: "Alta Savoia",
    country: "Francia",
    lat: 45.8778,
    lng: 6.8878,
    category: "Sport & Natura",
    typeLabel: "Vetta & Funivia",
  },
  {
    keywords: ["grossglockner", "hochalpenstrasse"],
    name: "Großglockner Hochalpenstraße",
    city: "Heiligenblut / Fusch",
    region: "Tirolo / Salisburghese",
    country: "Austria",
    lat: 47.0750,
    lng: 12.8428,
    category: "Guida & Panorami",
    typeLabel: "Strada Panoramica",
  },
  {
    keywords: ["passo rombo", "timmelsjoch"],
    name: "Passo del Rombo (Timmelsjoch)",
    city: "Moso in Passiria / Sölden",
    region: "Trentino-Alto Adige / Tirolo",
    country: "Italia",
    lat: 46.9056,
    lng: 11.0975,
    category: "Guida & Panorami",
    typeLabel: "Passo Montano",
  },
  {
    keywords: ["cortina d'ampezzo", "cortina"],
    name: "Cortina d'Ampezzo",
    city: "Cortina d'Ampezzo (BL)",
    region: "Veneto",
    country: "Italia",
    lat: 46.5405,
    lng: 12.1357,
    category: "Cultura & Storia",
    typeLabel: "Borgo & Località Montana",
  },
  {
    keywords: ["bormio", "terme di bormio"],
    name: "Bormio",
    city: "Bormio (SO)",
    region: "Lombardia",
    country: "Italia",
    lat: 46.4674,
    lng: 10.3742,
    category: "Natura & Relax",
    typeLabel: "Borgo & Terme",
  },
  {
    keywords: ["livigno"],
    name: "Livigno",
    city: "Livigno (SO)",
    region: "Lombardia",
    country: "Italia",
    lat: 46.5386,
    lng: 10.1357,
    category: "Sport & Natura",
    typeLabel: "Località Montana",
  },
  {
    keywords: ["zermatt", "matterhorn", "cervino"],
    name: "Zermatt & Cervino (Matterhorn)",
    city: "Zermatt",
    region: "Vallese",
    country: "Svizzera",
    lat: 45.9765,
    lng: 7.7491,
    category: "Natura & Relax",
    typeLabel: "Vetta & Località",
  },
];

export interface ResolvedGoogleMapsPlace {
  name: string;
  lat: number;
  lng: number;
  city: string;
  province?: string;
  region?: string;
  country: string;
  category: string;
  tag?: string;
  entityType: "PUNTO" | "PERCORSO";
  originalUrl: string;
  resolvedUrl: string;
}

/**
 * Calls backend API to unwrap and resolve Google Maps short links (maps.app.goo.gl)
 * or complex Google Maps URLs to extract exact coordinates, place name, and city.
 */
export async function resolveGoogleMapsLinkOnline(input: string): Promise<ResolvedGoogleMapsPlace | null> {
  const trimmed = input.trim();
  if (!trimmed) return null;

  // Extract clean URL from text
  const urlMatch = trimmed.match(/(https?:\/\/[^\s"'<>]+)/i);
  const targetUrl = urlMatch ? urlMatch[0] : trimmed;

  try {
    const res = await fetch("/api/resolve-maps-url", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url: targetUrl }),
    });

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    if (data.success && data.data) {
      return data.data as ResolvedGoogleMapsPlace;
    }
  } catch (err) {
    console.warn("Chiamata resolveGoogleMapsLinkOnline non riuscita:", err);
  }

  return null;
}

/**
 * Parses raw text or URL to detect Google Maps links, coordinates, or search queries
 */
export function parseGoogleMapsLinkOrCoords(input: string): {
  lat?: number;
  lng?: number;
  extractedQuery?: string;
  isLink: boolean;
  isShortLink?: boolean;
} {
  const trimmed = input.trim();

  // 1. Direct coordinate pattern: "46.5287, 10.4533" or "46.5287 10.4533" or "46.5287,10.4533"
  const coordsRegex = /^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?)[,\s]+[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$/;
  if (coordsRegex.test(trimmed)) {
    const parts = trimmed.split(/[,\s]+/).filter(Boolean);
    if (parts.length >= 2) {
      const lat = parseFloat(parts[0]);
      const lng = parseFloat(parts[1]);
      if (!isNaN(lat) && !isNaN(lng)) {
        return { lat, lng, isLink: false };
      }
    }
  }

  // 2. Google Maps URL patterns:
  // e.g. https://maps.app.goo.gl/5jUom49pGr3nbVpv5 (Short link from "Condividi" button)
  // e.g. https://www.google.com/maps/place/Passo+Giau/@46.4825,12.0538,15z/...
  // e.g. https://maps.google.com/?q=46.4825,12.0538
  // e.g. https://maps.google.com/?q=Passo+Giau
  const isShortLink = trimmed.includes("maps.app.goo.gl") || trimmed.includes("goo.gl/maps");
  const isGoogleLink = isShortLink || trimmed.includes("google.com/maps") || trimmed.includes("google.it/maps") || trimmed.includes("maps.google.");

  if (isGoogleLink) {
    // Check for exact pin coordinate in URL: !3d<lat>!4d<lng>
    const pinMatch = trimmed.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
    if (pinMatch) {
      const lat = parseFloat(pinMatch[1]);
      const lng = parseFloat(pinMatch[2]);
      const placeMatch = trimmed.match(/\/place\/([^/@?]+)/);
      const extractedQuery = placeMatch ? decodeURIComponent(placeMatch[1].replace(/\+/g, " ")) : undefined;
      return { lat, lng, extractedQuery, isLink: true, isShortLink };
    }

    // Check for @lat,lng
    const atMatch = trimmed.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (atMatch) {
      const lat = parseFloat(atMatch[1]);
      const lng = parseFloat(atMatch[2]);
      // Also see if place name is in path
      const placeMatch = trimmed.match(/\/place\/([^/@?]+)/);
      const extractedQuery = placeMatch ? decodeURIComponent(placeMatch[1].replace(/\+/g, " ")) : undefined;
      return { lat, lng, extractedQuery, isLink: true, isShortLink };
    }

    // Check for ?q=lat,lng or ?q=query
    const qMatch = trimmed.match(/[?&]q=([^&]+)/);
    if (qMatch) {
      const qVal = decodeURIComponent(qMatch[1].replace(/\+/g, " "));
      const coordParts = qVal.split(",");
      if (coordParts.length === 2 && !isNaN(parseFloat(coordParts[0])) && !isNaN(parseFloat(coordParts[1]))) {
        return { lat: parseFloat(coordParts[0]), lng: parseFloat(coordParts[1]), isLink: true, isShortLink };
      }
      return { extractedQuery: qVal, isLink: true, isShortLink };
    }

    return { isLink: true, isShortLink };
  }

  return { isLink: false };
}

/**
 * Intelligent categorization guess based on place name aligned with TAXONOMIA_360
 */
export function guessCategoryFromName(name: string): string | undefined {
  const lower = name.toLowerCase();

  if (lower.includes("santuario") || lower.includes("chiesa") || lower.includes("basilica") || lower.includes("duomo") || lower.includes("cattedrale") || lower.includes("abbazia") || lower.includes("eremo") || lower.includes("borgo") || lower.includes("castello") || lower.includes("museo") || lower.includes("monumento") || lower.includes("rocca")) {
    return "Cultura & Storia";
  }
  if (lower.includes("passo") || lower.includes("col ") || lower.includes("valico") || lower.includes("pass ") || lower.includes("joch") || lower.includes("strada panoramica") || lower.includes("ciclabile")) {
    return "Guida & Panorami";
  }
  if (lower.includes("rifugio") || lower.includes("cima") || lower.includes("monte ") || lower.includes("sentiero") || lower.includes("trek") || lower.includes("bivacco") || lower.includes("vetta") || lower.includes("sci ") || lower.includes("ferrata")) {
    return "Sport & Natura";
  }
  if (lower.includes("lago") || lower.includes("cascata") || lower.includes("fiume") || lower.includes("belvedere") || lower.includes("punto panoramico") || lower.includes("spiaggia") || lower.includes("vista") || lower.includes("viewpoint") || lower.includes("parco")) {
    return "Natura & Relax";
  }
  if (lower.includes("ristorante") || lower.includes("osteria") || lower.includes("trattoria") || lower.includes("baita") || lower.includes("malga") || lower.includes("pizzeria") || lower.includes("bar ") || lower.includes("agriturismo")) {
    return "Cibo & Sapori";
  }
  if (lower.includes("piazza") || lower.includes("corso") || lower.includes("rooftop") || lower.includes("via ")) {
    return "Svago & Città";
  }

  return undefined;
}

/**
 * Multi-provider search with fallback logic:
 * 0. Google Maps Resolver (for shortlinks like maps.app.goo.gl and Google links)
 * 1. Curated Instant Cache
 * 2. Photon (Komoot API - ultra fast, unmetered, great for alpine POIs)
 * 3. Nominatim (OpenStreetMap with structured queries)
 */
export async function searchLocationsOnline(query: string): Promise<GeoSearchResult[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  // 0. Check if query is or contains a Google Maps link (e.g. maps.app.goo.gl/..., goo.gl/maps/...)
  const isGoogleLink = trimmed.includes("google.com/maps") || 
                       trimmed.includes("google.it/maps") || 
                       trimmed.includes("maps.app.goo.gl") || 
                       trimmed.includes("goo.gl/maps") || 
                       trimmed.includes("maps.google.");

  if (isGoogleLink) {
    const resolved = await resolveGoogleMapsLinkOnline(trimmed);
    if (resolved && resolved.lat && resolved.lng) {
      return [
        {
          name: resolved.name,
          city: resolved.city,
          region: resolved.region,
          country: resolved.country,
          countryFlag: getCountryFlag(resolved.country),
          lat: resolved.lat,
          lng: resolved.lng,
          displayName: `${resolved.name}, ${resolved.city} (${resolved.country}) • Verificato da Google Maps`,
          categoryGuess: resolved.category,
          source: "google_maps",
        },
      ];
    }
  }

  // Check if direct link or coordinates
  const parsed = parseGoogleMapsLinkOrCoords(trimmed);
  if (parsed.lat !== undefined && parsed.lng !== undefined) {
    const lat = parsed.lat;
    const lng = parsed.lng;
    const name = parsed.extractedQuery || `Coordinate GPS (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
    return [
      {
        name,
        city: "Posizione da Google Maps",
        country: "Italia",
        countryFlag: "🇮🇹",
        lat,
        lng,
        displayName: `${name} - [${lat.toFixed(5)}, ${lng.toFixed(5)}]`,
        categoryGuess: guessCategoryFromName(name),
        source: "coordinates",
      },
    ];
  }

  // If query was a raw link that failed resolution, extract any text around it or the place slug
  let effectiveQuery = parsed.extractedQuery || trimmed;
  if (effectiveQuery.startsWith("http://") || effectiveQuery.startsWith("https://")) {
    const placeFromUrl = effectiveQuery.match(/\/place\/([^/@?]+)/);
    if (placeFromUrl) {
      effectiveQuery = decodeURIComponent(placeFromUrl[1].replace(/\+/g, " "));
    } else {
      const qFromUrl = effectiveQuery.match(/[?&]q=([^&]+)/);
      if (qFromUrl) {
        effectiveQuery = decodeURIComponent(qFromUrl[1].replace(/\+/g, " "));
      } else {
        // Remove the URL portion and see if user wrote a place name
        const textWithoutUrl = trimmed.replace(/https?:\/\/[^\s"'<>]+/gi, "").trim();
        if (textWithoutUrl.length >= 2) {
          effectiveQuery = textWithoutUrl;
        } else {
          return [];
        }
      }
    }
  }
  const lowerQuery = effectiveQuery.toLowerCase();

  const results: GeoSearchResult[] = [];

  // 1. Check Curated Local Cache
  for (const item of CURATED_KNOWN_PLACES) {
    if (item.keywords.some((k) => lowerQuery.includes(k) || k.includes(lowerQuery))) {
      results.push({
        name: item.name,
        city: item.city,
        region: item.region,
        country: item.country,
        countryFlag: getCountryFlag(item.country),
        lat: item.lat,
        lng: item.lng,
        displayName: `${item.name}, ${item.city} (${item.country})`,
        categoryGuess: item.category,
        source: "local_cache",
      });
    }
  }

  // If we already have strong curated matches, return them immediately
  if (results.length >= 3) {
    return results;
  }

  // 2. Primary Online Provider: Photon (Komoot)
  try {
    const photonUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(
      effectiveQuery
    )}&limit=7&lang=it`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4500);

    const res = await fetch(photonUrl, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.features)) {
        for (const feat of data.features) {
          const props = feat.properties || {};
          const coords = feat.geometry?.coordinates;
          if (!coords || coords.length < 2) continue;

          const lng = coords[0];
          const lat = coords[1];
          const rawName = props.name || props.street || effectiveQuery;
          const rawCity = props.city || props.town || props.village || props.county || props.state || "";
          const rawCountry = props.country || "Italia";
          const normalizedCountry = normalizeCountryName(rawCountry);

          // Build a readable display name
          const parts: string[] = [rawName];
          if (rawCity && rawCity !== rawName) parts.push(rawCity);
          if (props.state && props.state !== rawCity) parts.push(props.state);
          parts.push(normalizedCountry);

          // Avoid duplicate coordinates
          const isDup = results.some((r) => Math.abs(r.lat - lat) < 0.001 && Math.abs(r.lng - lng) < 0.001);
          if (!isDup) {
            results.push({
              name: rawName,
              city: rawCity || normalizedCountry,
              region: props.state,
              country: normalizedCountry,
              countryFlag: getCountryFlag(normalizedCountry),
              lat,
              lng,
              displayName: parts.join(", "),
              categoryGuess: guessCategoryFromName(rawName),
              source: "photon",
            });
          }
        }
      }
    }
  } catch {
    // Photon timed out or failed, continue to fallback
  }

  if (results.length > 0) {
    return results;
  }

  // 3. Fallback Provider: Nominatim
  try {
    const nomUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      effectiveQuery
    )}&limit=5&addressdetails=1`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(nomUrl, {
      signal: controller.signal,
      headers: { "Accept-Language": "it,en" },
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        for (const item of data) {
          const lat = parseFloat(item.lat);
          const lng = parseFloat(item.lon);
          if (isNaN(lat) || isNaN(lng)) continue;

          const addr = item.address || {};
          const countryRaw = addr.country || "Italia";
          const countryNorm = normalizeCountryName(countryRaw);
          const cityFound = addr.city || addr.town || addr.village || addr.municipality || addr.county || countryNorm;
          const placeName = item.name || effectiveQuery;

          results.push({
            name: placeName,
            city: cityFound,
            region: addr.state,
            country: countryNorm,
            countryFlag: getCountryFlag(countryNorm),
            lat,
            lng,
            displayName: item.display_name,
            categoryGuess: guessCategoryFromName(placeName),
            source: "nominatim",
          });
        }
      }
    }
  } catch {
    // Silently continue
  }

  return results;
}
