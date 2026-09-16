// Italian & International Geographic Reference & Spot Geo-Detection Engine

export interface ProvinceInfo {
  code: string;
  name: string;
  region: string;
}

export interface RegionSummary {
  name: string;
  count: number;
}

export interface ProvinceSummary {
  code: string;
  name: string;
  region: string;
  count: number;
}

export interface CountrySummary {
  name: string;
  flag: string;
  count: number;
}

export interface CountryDefinition {
  name: string;
  flag: string;
  aliases: string[];
  regions?: string[];
  latMin?: number;
  latMax?: number;
  lngMin?: number;
  lngMax?: number;
}

export const KNOWN_COUNTRIES: CountryDefinition[] = [
  {
    name: "Italia",
    flag: "🇮🇹",
    aliases: ["italia", "italy", "it", "italien", "italie"],
    latMin: 35.4,
    latMax: 47.1,
    lngMin: 6.6,
    lngMax: 18.6
  },
  {
    name: "Svizzera",
    flag: "🇨🇭",
    aliases: ["svizzera", "switzerland", "suisse", "schweiz", "svizra", "ch", "swiss"],
    regions: ["Ticino", "Grigioni", "Vallese", "Berna", "Uri", "Zurigo", "Lucerna", "Vaud", "Ginevra", "San Gallo", "Svitto"],
    latMin: 45.8,
    latMax: 47.8,
    lngMin: 5.9,
    lngMax: 10.5
  },
  {
    name: "Francia",
    flag: "🇫🇷",
    aliases: ["francia", "france", "fr", "frankreich"],
    regions: ["Alvernia-Rodano-Alpi", "Provenza-Alpi-Costa Azzurra", "Occitania", "Alta Savoia", "Corsica", "Île-de-France", "Alsazia"],
    latMin: 42.3,
    latMax: 51.1,
    lngMin: -4.8,
    lngMax: 8.3
  },
  {
    name: "Austria",
    flag: "🇦🇹",
    aliases: ["austria", "österreich", "oesterreich", "at", "autriche"],
    regions: ["Tirolo", "Carinzia", "Salisburghese", "Vorarlberg", "Stiria", "Alta Austria", "Bassa Austria", "Vienna"],
    latMin: 46.3,
    latMax: 49.1,
    lngMin: 9.5,
    lngMax: 17.2
  },
  {
    name: "Germania",
    flag: "🇩🇪",
    aliases: ["germania", "germany", "deutschland", "de", "allemagne"],
    regions: ["Baviera", "Baden-Württemberg", "Sassonia", "Renania", "Assia", "Berlino", "Amburgo"],
    latMin: 47.2,
    latMax: 55.1,
    lngMin: 5.8,
    lngMax: 15.1
  },
  {
    name: "Spagna",
    flag: "🇪🇸",
    aliases: ["spagna", "spain", "españa", "espagne", "es"],
    regions: ["Catalogna", "Andalusia", "Madrid", "Isole Baleari", "Isole Canarie", "Paesi Baschi", "Galizia", "Aragona", "Asturie"],
    latMin: 27.6,
    latMax: 43.8,
    lngMin: -18.2,
    lngMax: 4.4
  },
  {
    name: "Slovenia",
    flag: "🇸🇮",
    aliases: ["slovenia", "slovenija", "si"],
    regions: ["Alta Carniola", "Goriziano", "Litorale-Carso", "Alpi Giulie", "Lubiana"],
    latMin: 45.4,
    latMax: 46.9,
    lngMin: 13.3,
    lngMax: 16.6
  },
  {
    name: "Croazia",
    flag: "🇭🇷",
    aliases: ["croazia", "croatia", "hrvatska", "hr"],
    regions: ["Istria", "Dalmazia", "Quarnaro", "Zagabria"],
    latMin: 42.3,
    latMax: 46.6,
    lngMin: 13.4,
    lngMax: 19.5
  },
  {
    name: "Norvegia",
    flag: "🇳🇴",
    aliases: ["norvegia", "norway", "norge", "no"],
    regions: ["Vestland", "Troms e Finnmark", "Nordland", "Oslo", "Rogaland"],
    latMin: 57.9,
    latMax: 71.2,
    lngMin: 4.5,
    lngMax: 31.2
  },
  {
    name: "Islanda",
    flag: "🇮🇸",
    aliases: ["islanda", "iceland", "ísland", "is"],
    regions: ["Suðurland", "Vesturland", "Norðurland", "Höfuðborgarsvæði"],
    latMin: 63.3,
    latMax: 66.6,
    lngMin: -24.6,
    lngMax: -13.4
  },
  {
    name: "Regno Unito",
    flag: "🇬🇧",
    aliases: ["regno unito", "united kingdom", "uk", "great britain", "inghilterra", "scozia", "galles"],
    regions: ["Scozia", "Inghilterra", "Galles", "Irlanda del Nord"],
    latMin: 49.8,
    latMax: 60.9,
    lngMin: -8.7,
    lngMax: 1.8
  },
  {
    name: "Stati Uniti",
    flag: "🇺🇸",
    aliases: ["stati uniti", "united states", "usa", "us", "america"],
    regions: ["California", "Colorado", "Utah", "Wyoming", "Washington", "Alaska", "New York", "Arizona", "Oregon"]
  },
  {
    name: "Giappone",
    flag: "🇯🇵",
    aliases: ["giappone", "japan", "jp", "nihon", "nippon"],
    regions: ["Kanto", "Kansai", "Hokkaido", "Chubu", "Kyushu"]
  },
  {
    name: "Canada",
    flag: "🇨🇦",
    aliases: ["canada", "ca"],
    regions: ["Columbia Britannica", "Alberta", "Québec", "Ontario"]
  },
  {
    name: "Portogallo",
    flag: "🇵🇹",
    aliases: ["portogallo", "portugal", "pt"],
    regions: ["Azzorre", "Madeira", "Algarve", "Lisbona", "Porto"]
  },
  {
    name: "Grecia",
    flag: "🇬🇷",
    aliases: ["grecia", "greece", "hellas", "gr"],
    regions: ["Creta", "Isole Cicladi", "Isole Ionie", "Peloponneso", "Macedonia", "Attica"]
  }
];

export function getCountryFlag(countryName?: string): string {
  if (!countryName) return "🌍";
  const lower = countryName.toLowerCase().trim();
  for (const c of KNOWN_COUNTRIES) {
    if (c.name.toLowerCase() === lower || c.aliases.includes(lower)) {
      return c.flag;
    }
  }
  return "🌍";
}

export function normalizeCountryName(countryName?: string): string {
  if (!countryName) return "Italia";
  const lower = countryName.toLowerCase().trim();
  for (const c of KNOWN_COUNTRIES) {
    if (c.name.toLowerCase() === lower || c.aliases.includes(lower)) {
      return c.name;
    }
  }
  return countryName.trim();
}

// All 20 Italian Regions
export const ITALIAN_REGIONS: string[] = [
  "Abruzzo",
  "Basilicata",
  "Calabria",
  "Campania",
  "Emilia-Romagna",
  "Friuli-Venezia Giulia",
  "Lazio",
  "Liguria",
  "Lombardia",
  "Marche",
  "Molise",
  "Piemonte",
  "Puglia",
  "Sardegna",
  "Sicilia",
  "Toscana",
  "Trentino-Alto Adige",
  "Umbria",
  "Valle d'Aosta",
  "Veneto"
];

// All Italian Provinces (107) with standard 2-letter codes and parent regions
export const ITALIAN_PROVINCES: ProvinceInfo[] = [
  { code: "AG", name: "Agrigento", region: "Sicilia" },
  { code: "AL", name: "Alessandria", region: "Piemonte" },
  { code: "AN", name: "Ancona", region: "Marche" },
  { code: "AO", name: "Aosta", region: "Valle d'Aosta" },
  { code: "AR", name: "Arezzo", region: "Toscana" },
  { code: "AP", name: "Ascoli Piceno", region: "Marche" },
  { code: "AT", name: "Asti", region: "Piemonte" },
  { code: "AV", name: "Avellino", region: "Campania" },
  { code: "BA", name: "Bari", region: "Puglia" },
  { code: "BT", name: "Barletta-Andria-Trani", region: "Puglia" },
  { code: "BL", name: "Belluno", region: "Veneto" },
  { code: "BN", name: "Benevento", region: "Campania" },
  { code: "BG", name: "Bergamo", region: "Lombardia" },
  { code: "BI", name: "Biella", region: "Piemonte" },
  { code: "BO", name: "Bologna", region: "Emilia-Romagna" },
  { code: "BZ", name: "Bolzano", region: "Trentino-Alto Adige" },
  { code: "BS", name: "Brescia", region: "Lombardia" },
  { code: "BR", name: "Brindisi", region: "Puglia" },
  { code: "CA", name: "Cagliari", region: "Sardegna" },
  { code: "CL", name: "Caltanissetta", region: "Sicilia" },
  { code: "CB", name: "Campobasso", region: "Molise" },
  { code: "CE", name: "Caserta", region: "Campania" },
  { code: "CT", name: "Catania", region: "Sicilia" },
  { code: "CZ", name: "Catanzaro", region: "Calabria" },
  { code: "CH", name: "Chieti", region: "Abruzzo" },
  { code: "CO", name: "Como", region: "Lombardia" },
  { code: "CS", name: "Cosenza", region: "Calabria" },
  { code: "CR", name: "Cremona", region: "Lombardia" },
  { code: "KR", name: "Crotone", region: "Calabria" },
  { code: "CN", name: "Cuneo", region: "Piemonte" },
  { code: "EN", name: "Enna", region: "Sicilia" },
  { code: "FM", name: "Fermo", region: "Marche" },
  { code: "FE", name: "Ferrara", region: "Emilia-Romagna" },
  { code: "FI", name: "Firenze", region: "Toscana" },
  { code: "FG", name: "Foggia", region: "Puglia" },
  { code: "FC", name: "Forlì-Cesena", region: "Emilia-Romagna" },
  { code: "FR", name: "Frosinone", region: "Lazio" },
  { code: "GE", name: "Genova", region: "Liguria" },
  { code: "GO", name: "Gorizia", region: "Friuli-Venezia Giulia" },
  { code: "GR", name: "Grosseto", region: "Toscana" },
  { code: "IM", name: "Imperia", region: "Liguria" },
  { code: "IS", name: "Isernia", region: "Molise" },
  { code: "AQ", name: "L'Aquila", region: "Abruzzo" },
  { code: "SP", name: "La Spezia", region: "Liguria" },
  { code: "LT", name: "Latina", region: "Lazio" },
  { code: "LE", name: "Lecce", region: "Puglia" },
  { code: "LC", name: "Lecco", region: "Lombardia" },
  { code: "LI", name: "Livorno", region: "Toscana" },
  { code: "LO", name: "Lodi", region: "Lombardia" },
  { code: "LU", name: "Lucca", region: "Toscana" },
  { code: "MC", name: "Macerata", region: "Marche" },
  { code: "MN", name: "Mantova", region: "Lombardia" },
  { code: "MS", name: "Massa-Carrara", region: "Toscana" },
  { code: "MT", name: "Matera", region: "Basilicata" },
  { code: "ME", name: "Messina", region: "Sicilia" },
  { code: "MI", name: "Milano", region: "Lombardia" },
  { code: "MO", name: "Modena", region: "Emilia-Romagna" },
  { code: "MB", name: "Monza e Brianza", region: "Lombardia" },
  { code: "NA", name: "Napoli", region: "Campania" },
  { code: "NO", name: "Novara", region: "Piemonte" },
  { code: "NU", name: "Nuoro", region: "Sardegna" },
  { code: "OR", name: "Oristano", region: "Sardegna" },
  { code: "PD", name: "Padova", region: "Veneto" },
  { code: "PA", name: "Palermo", region: "Sicilia" },
  { code: "PR", name: "Parma", region: "Emilia-Romagna" },
  { code: "PV", name: "Pavia", region: "Lombardia" },
  { code: "PG", name: "Perugia", region: "Umbria" },
  { code: "PU", name: "Pesaro e Urbino", region: "Marche" },
  { code: "PE", name: "Pescara", region: "Abruzzo" },
  { code: "PC", name: "Piacenza", region: "Emilia-Romagna" },
  { code: "PI", name: "Pisa", region: "Toscana" },
  { code: "PT", name: "Pistoia", region: "Toscana" },
  { code: "PN", name: "Pordenone", region: "Friuli-Venezia Giulia" },
  { code: "PZ", name: "Potenza", region: "Basilicata" },
  { code: "PO", name: "Prato", region: "Toscana" },
  { code: "RG", name: "Ragusa", region: "Sicilia" },
  { code: "RA", name: "Ravenna", region: "Emilia-Romagna" },
  { code: "RC", name: "Reggio Calabria", region: "Calabria" },
  { code: "RE", name: "Reggio Emilia", region: "Emilia-Romagna" },
  { code: "RI", name: "Rieti", region: "Lazio" },
  { code: "RN", name: "Rimini", region: "Emilia-Romagna" },
  { code: "RM", name: "Roma", region: "Lazio" },
  { code: "RO", name: "Rovigo", region: "Veneto" },
  { code: "SA", name: "Salerno", region: "Campania" },
  { code: "SS", name: "Sassari", region: "Sardegna" },
  { code: "SV", name: "Savona", region: "Liguria" },
  { code: "SI", name: "Siena", region: "Toscana" },
  { code: "SR", name: "Siracusa", region: "Sicilia" },
  { code: "SO", name: "Sondrio", region: "Lombardia" },
  { code: "SU", name: "Sud Sardegna", region: "Sardegna" },
  { code: "TA", name: "Taranto", region: "Puglia" },
  { code: "TE", name: "Teramo", region: "Abruzzo" },
  { code: "TR", name: "Terni", region: "Umbria" },
  { code: "TO", name: "Torino", region: "Piemonte" },
  { code: "TP", name: "Trapani", region: "Sicilia" },
  { code: "TN", name: "Trento", region: "Trentino-Alto Adige" },
  { code: "TV", name: "Treviso", region: "Veneto" },
  { code: "TS", name: "Trieste", region: "Friuli-Venezia Giulia" },
  { code: "UD", name: "Udine", region: "Friuli-Venezia Giulia" },
  { code: "VA", name: "Varese", region: "Lombardia" },
  { code: "VE", name: "Venezia", region: "Veneto" },
  { code: "VB", name: "Verbano-Cusio-Ossola", region: "Piemonte" },
  { code: "VC", name: "Vercelli", region: "Piemonte" },
  { code: "VR", name: "Verona", region: "Veneto" },
  { code: "VV", name: "Vibo Valentia", region: "Calabria" },
  { code: "VI", name: "Vicenza", region: "Veneto" },
  { code: "VT", name: "Viterbo", region: "Lazio" }
];

// Helper to find province by code (e.g. "BL" or "BZ")
export function findProvinceByCode(code: string): ProvinceInfo | undefined {
  const upper = code.trim().toUpperCase();
  return ITALIAN_PROVINCES.find((p) => p.code === upper);
}

// Helper to find province by name (e.g. "Belluno", "Bolzano", "Bozen")
export function findProvinceByName(name: string): ProvinceInfo | undefined {
  const lower = name.trim().toLowerCase();
  return ITALIAN_PROVINCES.find(
    (p) => p.name.toLowerCase() === lower || 
           (p.code === "BZ" && lower.includes("bozen")) ||
           (p.code === "FC" && (lower.includes("forl") || lower.includes("cesena"))) ||
           (p.code === "PU" && (lower.includes("pesaro") || lower.includes("urbino"))) ||
           (p.code === "VB" && (lower.includes("verbano") || lower.includes("ossola"))) ||
           (p.code === "BT" && (lower.includes("barletta") || lower.includes("andria") || lower.includes("trani")))
  );
}

/**
 * Intelligent detector that extracts all matching regions and provinces from a place.
 * Supports multi-provincial locations (e.g. "(SO/BZ)", "(BL/BZ)").
 */
export function detectPlaceGeo(place: {
  paese?: string;
  regione?: string;
  provincia?: string;
  citta_o_zona?: string;
  nome?: string;
  nome_luogo?: string;
  query_google_maps?: string;
  coordinate?: { lat?: number; lng?: number };
}): {
  primaryCountry: string;
  countryFlag: string;
  primaryRegion?: string;
  primaryProvince?: ProvinceInfo;
  allCountries: string[];
  allRegions: string[];
  allProvinces: ProvinceInfo[];
} {
  const matchedCountries = new Set<string>();
  const matchedRegions = new Set<string>();
  const matchedProvinces = new Map<string, ProvinceInfo>();

  // 1. Explicitly stored fields
  if (place.paese && place.paese.trim()) {
    const norm = normalizeCountryName(place.paese);
    matchedCountries.add(norm);
  }
  if (place.regione && place.regione.trim()) {
    matchedRegions.add(place.regione.trim());
  }
  if (place.provincia && place.provincia.trim()) {
    const prov = findProvinceByCode(place.provincia) || findProvinceByName(place.provincia);
    if (prov) {
      matchedProvinces.set(prov.code, prov);
      matchedRegions.add(prov.region);
      matchedCountries.add("Italia");
    }
  }

  // 2. Scan text strings: citta_o_zona, nome, query_google_maps
  const combinedText = [
    place.citta_o_zona || "",
    place.nome || "",
    place.nome_luogo || "",
    place.query_google_maps || ""
  ].join(" ");
  const lowerText = combinedText.toLowerCase();

  // Check country keywords and aliases
  for (const country of KNOWN_COUNTRIES) {
    if (country.aliases.some((alias) => {
      const regex = new RegExp(`\\b${alias}\\b`, "i");
      return regex.test(combinedText);
    })) {
      matchedCountries.add(country.name);
    }

    // Check known international regions / cantons
    if (country.regions) {
      for (const reg of country.regions) {
        if (lowerText.includes(reg.toLowerCase())) {
          matchedRegions.add(reg);
          matchedCountries.add(country.name);
        }
      }
    }
  }

  // Famous international Alpine & outdoor spots
  // Switzerland
  if (
    lowerText.includes("furka") || lowerText.includes("grimsel") || lowerText.includes("susten") ||
    lowerText.includes("zermatt") || lowerText.includes("matterhorn") || lowerText.includes("engadin") ||
    lowerText.includes("st. moritz") || lowerText.includes("saint moritz") || lowerText.includes("interlaken") ||
    lowerText.includes("lauterbrunnen") || lowerText.includes("ticino") || lowerText.includes("grigioni") ||
    lowerText.includes("vallese") || lowerText.includes("valais") || lowerText.includes("nufenen") ||
    lowerText.includes("gottardo") || lowerText.includes("gotthard") || lowerText.includes("bernina") ||
    lowerText.includes("lugano") || lowerText.includes("locarno") || lowerText.includes("oeschinen")
  ) {
    matchedCountries.add("Svizzera");
    if (lowerText.includes("ticino") || lowerText.includes("lugano") || lowerText.includes("locarno")) matchedRegions.add("Ticino");
    if (lowerText.includes("grigioni") || lowerText.includes("engadin") || lowerText.includes("moritz") || lowerText.includes("bernina")) matchedRegions.add("Grigioni");
    if (lowerText.includes("zermatt") || lowerText.includes("vallese") || lowerText.includes("valais")) matchedRegions.add("Vallese");
  }

  // France
  if (
    lowerText.includes("galibier") || lowerText.includes("iseran") || lowerText.includes("chamonix") ||
    lowerText.includes("alpe d'huez") || lowerText.includes("tourmalet") || lowerText.includes("verdon") ||
    lowerText.includes("annecy") || lowerText.includes("côte d'azur") || lowerText.includes("costa azzurra") ||
    lowerText.includes("nice") || lowerText.includes("nizza") || lowerText.includes("provence") ||
    lowerText.includes("alta savoia") || lowerText.includes("haute-savoie")
  ) {
    matchedCountries.add("Francia");
    if (lowerText.includes("chamonix") || lowerText.includes("annecy") || lowerText.includes("alta savoia")) matchedRegions.add("Alta Savoia");
    if (lowerText.includes("côte d'azur") || lowerText.includes("costa azzurra") || lowerText.includes("nizza") || lowerText.includes("verdon")) matchedRegions.add("Provenza-Alpi-Costa Azzurra");
  }

  // Austria
  if (
    lowerText.includes("grossglockner") || lowerText.includes("innsbruck") || lowerText.includes("tirolo") ||
    lowerText.includes("tyrol") || lowerText.includes("kitzbühel") || lowerText.includes("zillertal") ||
    lowerText.includes("salzburg") || lowerText.includes("salisburgo") || lowerText.includes("hallstatt") ||
    lowerText.includes("carinzia") || lowerText.includes("kärnten") || lowerText.includes("vorarlberg")
  ) {
    matchedCountries.add("Austria");
    if (lowerText.includes("innsbruck") || lowerText.includes("tirolo") || lowerText.includes("tyrol") || lowerText.includes("zillertal")) matchedRegions.add("Tirolo");
    if (lowerText.includes("salzburg") || lowerText.includes("salisburgo") || lowerText.includes("hallstatt")) matchedRegions.add("Salisburghese");
  }

  // Slovenia
  if (
    lowerText.includes("vrsic") || lowerText.includes("bled") || lowerText.includes("bohinj") ||
    lowerText.includes("triglav") || lowerText.includes("soča") || lowerText.includes("postumia") ||
    lowerText.includes("lubiana") || lowerText.includes("ljubljana")
  ) {
    matchedCountries.add("Slovenia");
  }

  // Coordinate-based approximate country bounding check (if no country detected yet)
  if (matchedCountries.size === 0 && place.coordinate?.lat && place.coordinate?.lng) {
    const lat = place.coordinate.lat;
    const lng = place.coordinate.lng;
    for (const c of KNOWN_COUNTRIES) {
      if (
        c.latMin !== undefined && c.latMax !== undefined &&
        c.lngMin !== undefined && c.lngMax !== undefined
      ) {
        if (lat >= c.latMin && lat <= c.latMax && lng >= c.lngMin && lng <= c.lngMax) {
          matchedCountries.add(c.name);
          break;
        }
      }
    }
  }

  // Check 2-letter uppercase codes in parentheses or slashes, e.g. "(BL)", "(SO/BZ)", "(TN)"
  const inParentheses = combinedText.match(/\(([A-Za-z0-9\/\s\-]+)\)/g);
  if (inParentheses) {
    for (const paren of inParentheses) {
      const codes = paren.toUpperCase().match(/[A-Z]{2}/g);
      if (codes) {
        for (const c of codes) {
          const prov = findProvinceByCode(c);
          if (prov) {
            matchedProvinces.set(prov.code, prov);
            matchedRegions.add(prov.region);
            matchedCountries.add("Italia");
          }
        }
      }
    }
  }

  // Check direct occurrences of Italian Region names
  for (const reg of ITALIAN_REGIONS) {
    if (lowerText.includes(reg.toLowerCase())) {
      matchedRegions.add(reg);
      matchedCountries.add("Italia");
    }
  }

  // Check direct occurrences of Italian Province names
  for (const prov of ITALIAN_PROVINCES) {
    const provNameLower = prov.name.toLowerCase();
    const regex = new RegExp(`\\b${provNameLower}\\b`, "i");
    if (regex.test(combinedText)) {
      matchedProvinces.set(prov.code, prov);
      matchedRegions.add(prov.region);
      matchedCountries.add("Italia");
    }
  }

  // Known Italian famous mountain/localities fallbacks
  if (lowerText.includes("stelvio") || lowerText.includes("bormio")) {
    const so = findProvinceByCode("SO");
    if (so) { matchedProvinces.set(so.code, so); matchedRegions.add(so.region); matchedCountries.add("Italia"); }
  }
  if (lowerText.includes("cortina") || lowerText.includes("cadore") || lowerText.includes("giau") || lowerText.includes("lavaredo")) {
    const bl = findProvinceByCode("BL");
    if (bl) { matchedProvinces.set(bl.code, bl); matchedRegions.add(bl.region); matchedCountries.add("Italia"); }
  }
  if (lowerText.includes("seceda") || lowerText.includes("gardena") || lowerText.includes("braies") || lowerText.includes("ortisei")) {
    const bz = findProvinceByCode("BZ");
    if (bz) { matchedProvinces.set(bz.code, bz); matchedRegions.add(bz.region); matchedCountries.add("Italia"); }
  }
  if (lowerText.includes("trastevere") || lowerText.includes("colosseo")) {
    const rm = findProvinceByCode("RM");
    if (rm) { matchedProvinces.set(rm.code, rm); matchedRegions.add(rm.region); matchedCountries.add("Italia"); }
  }

  // Default to Italia if nothing matched
  if (matchedCountries.size === 0) {
    matchedCountries.add("Italia");
  }

  const allCountries = Array.from(matchedCountries);
  const primaryCountry = allCountries[0] || "Italia";
  const countryFlag = getCountryFlag(primaryCountry);
  const allProvs = Array.from(matchedProvinces.values());
  const allRegs = Array.from(matchedRegions);

  return {
    primaryCountry,
    countryFlag,
    primaryRegion: allRegs[0] || undefined,
    primaryProvince: allProvs[0] || undefined,
    allCountries,
    allRegions: allRegs,
    allProvinces: allProvs
  };
}

export function detectPlaceRegionsAndProvinces(place: {
  paese?: string;
  regione?: string;
  provincia?: string;
  citta_o_zona?: string;
  nome?: string;
  nome_luogo?: string;
  query_google_maps?: string;
  coordinate?: { lat?: number; lng?: number };
}): {
  primaryCountry: string;
  countryFlag: string;
  primaryRegion?: string;
  primaryProvince?: ProvinceInfo;
  allCountries: string[];
  allRegions: string[];
  allProvinces: ProvinceInfo[];
} {
  return detectPlaceGeo(place);
}

/**
 * Extracts ONLY the countries that actually exist in the saved places array.
 */
export function getInsertedCountries(places: any[]): CountrySummary[] {
  const countryMap = new Map<string, number>();

  for (const place of places) {
    const geo = detectPlaceGeo(place);
    const country = geo.primaryCountry;
    countryMap.set(country, (countryMap.get(country) || 0) + 1);
  }

  return Array.from(countryMap.entries())
    .map(([name, count]) => ({
      name,
      flag: getCountryFlag(name),
      count
    }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

/**
 * Extracts ONLY the regions and provinces that actually exist in the saved places array,
 * optionally filtered by active country.
 */
export function getInsertedRegionsAndProvinces(
  places: any[],
  filterCountry?: string
): {
  insertedRegions: RegionSummary[];
  insertedProvinces: ProvinceSummary[];
} {
  const regionMap = new Map<string, number>();
  const provinceMap = new Map<string, ProvinceSummary>();

  for (const place of places) {
    const detected = detectPlaceGeo(place);

    // If filtered by country, skip places not in this country
    if (filterCountry && filterCountry !== "tutti") {
      const match = detected.allCountries.some(
        (c) => c.toLowerCase() === filterCountry.toLowerCase()
      );
      if (!match) continue;
    }

    for (const reg of detected.allRegions) {
      regionMap.set(reg, (regionMap.get(reg) || 0) + 1);
    }

    for (const prov of detected.allProvinces) {
      const existing = provinceMap.get(prov.code);
      if (existing) {
        existing.count += 1;
      } else {
        provinceMap.set(prov.code, {
          code: prov.code,
          name: prov.name,
          region: prov.region,
          count: 1
        });
      }
    }
  }

  const insertedRegions: RegionSummary[] = Array.from(regionMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

  const insertedProvinces: ProvinceSummary[] = Array.from(provinceMap.values())
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

  return {
    insertedRegions,
    insertedProvinces
  };
}

/**
 * Evaluates whether a place satisfies the chosen country, region, and province filters.
 */
export function doesPlaceMatchCountryRegionAndProvince(
  place: any,
  activeCountry: string,
  activeRegion: string,
  activeProvince: string
): boolean {
  if (activeCountry === "tutti" && activeRegion === "tutte" && activeProvince === "tutte") {
    return true;
  }

  const detected = detectPlaceGeo(place);

  // 1. Check Country filter
  if (activeCountry !== "tutti") {
    const matchesCountry = detected.allCountries.some(
      (c) => c.toLowerCase() === activeCountry.toLowerCase()
    );
    if (!matchesCountry) return false;
  }

  // 2. Check Region filter
  if (activeRegion !== "tutte") {
    const matchesReg = detected.allRegions.some(
      (r) => r.toLowerCase() === activeRegion.toLowerCase()
    );
    if (!matchesReg) return false;
  }

  // 3. Check Province filter (by code e.g. "BL" or name)
  if (activeProvince !== "tutte") {
    const target = activeProvince.toLowerCase().trim();
    const matchesProv = detected.allProvinces.some(
      (p) => p.code.toLowerCase() === target || p.name.toLowerCase() === target
    );
    if (!matchesProv) return false;
  }

  return true;
}

/**
 * Legacy wrapper for doesPlaceMatchCountryRegionAndProvince
 */
export function doesPlaceMatchRegionAndProvince(
  place: any,
  activeRegion: string,
  activeProvince: string
): boolean {
  return doesPlaceMatchCountryRegionAndProvince(place, "tutti", activeRegion, activeProvince);
}
