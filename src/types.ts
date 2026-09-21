export type EntityType = "PUNTO" | "PERCORSO";

export type GenreSubcategory =
  | "passi_motori"
  | "piste_sci"
  | "trekking_outdoor"
  | "food_drink"
  | "cultura_borghi"
  | "relax_panorami";

export type MainCategory =
  | "Cultura & Storia"
  | "Natura & Relax"
  | "Guida & Panorami"
  | "Sport & Natura"
  | "Cibo & Sapori"
  | "Svago & Città";

export type ActivityCategory =
  | MainCategory
  | "Passi di Montagna"
  | "Trekking"
  | "Domenica in Montagna"
  | "Passeggiate"
  | "Piste Ciclabili"
  | "Ristoranti"
  | "Sci & Inverno"
  | "Altro"
  | string;

export type ActivityFilterKey =
  | "tutti"
  | "cultura_storia"
  | "natura_relax"
  | "guida_panorami"
  | "sport_natura"
  | "cibo_sapori"
  | "svago_citta";

export type Season =
  | "Primavera"
  | "Estate"
  | "Autunno"
  | "Inverno"
  | "Tutte le stagioni";

export interface GraphicData {
  query_immagine_copertina: string;
  colore_badge_consigliato: string;
  cover_image_url?: string;
}

export interface HiddenAiMetadata {
  durata_stimata_minuti: number | null;
  momento_ideale: string | null;
  meteo_consigliato: string | null;
  difficolta?: "Facile" | "Media" | "Esperto" | "Panoramica" | null;
  dislivello_metri?: number | null;
  stagione_consigliata?: Season;
}

export interface PlaceState {
  visitato: boolean;
  valutazione_community: number;
  consigliato_algoritmo?: boolean;
  motivo_consiglio?: string;
  appunti_personali?: string;
}

export interface PlaceCoordinates {
  lat: number;
  lng: number;
}

export interface VideoAttachment {
  id: string;
  url: string; // Blob URL, object URL, or embed link
  sourceType: "file" | "social" | "youtube";
  title?: string;
  thumbnailUrl?: string;
}

export interface SavedPlace {
  id: string;
  nome: string;
  tipo_entita: EntityType;
  categoria: ActivityCategory | string;
  citta_o_zona: string;
  query_google_maps: string;
  riassunto_ai_minimal: string;
  social_source_link?: string;
  video_attachment?: VideoAttachment;
  dati_grafici: GraphicData;
  metadata_ai_nascosti: HiddenAiMetadata;
  stato_iniziale: PlaceState;
  
  // Geographic position & Route geometry
  coordinate: PlaceCoordinates;
  coordinate_percorso?: PlaceCoordinates[]; // Line coordinates for routes on satellite map (array of {lat, lng} - no nested arrays)
  geometria_percorso?: {
    tipo_tracciato?: string;
    coordinate_linea: PlaceCoordinates[];
  };

  // 360 Taxonomy & Pinna Geographic Engine fields
  confidenza_alta?: boolean;
  query_search_maps?: string;
  categoria_principale?: MainCategory | string;
  tag_contestuale?: string;
  badge_rapidi?: string[];
  sintesi?: string;
  dettagli_algoritmo?: {
    durata_minuti?: number | null;
    momento_ideale?: string | null;
    meteo_ideale?: string | null;
  };

  // User lists & timestamps
  list_ids: string[];
  saved_at: string;
  
  // Transport mode / Mezzo con cui si deve fare l'attività (auto, bici, a piedi, moto, camper, ecc.)
  mezzo_trasporto?: string;
  mezzi_consigliati?: string[];
  
  // Geographic administrative tags
  paese?: string;
  regione?: string;
  provincia?: string;
  
  // Compatibility helpers
  nome_luogo?: string; // alias to nome
  sottocategoria?: string;
  visited?: boolean;
  user_notes?: string;
  user_photos?: string[];
  visited_date?: string;
  tag?: string[];
  durata_stimata_minuti?: number | null;
  momento_ideale?: string | null;
  meteo_consigliato?: string | null;
  stagione_ideale?: Season;
  dettagli_extra?: {
    fascia_prezzo?: string | null;
    prenotazione_consigliata?: boolean | null;
    note_e_consigli?: string | null;
  };
}

export interface CustomList {
  id: string;
  name: string;
  description?: string;
  season: Season;
  genre: string;
  iconName: string;
  color: string;
  created_at: string;
}

export interface ExtractionResult {
  // Pinna strict schema fields
  confidenza_alta?: boolean;
  query_search_maps?: string;
  tipo_entita: EntityType;
  categoria_principale?: MainCategory | string;
  tag_contestuale?: string;
  badge_rapidi?: string[];
  sintesi?: string;
  dettagli_algoritmo?: {
    durata_minuti?: number | null;
    momento_ideale?: string | null;
    meteo_ideale?: string | null;
  };

  // Additional & compatibility fields
  nome?: string;
  categoria?: string;
  citta_o_zona?: string;
  query_google_maps?: string;
  riassunto_ai_minimal?: string;
  social_source_link?: string;
  dati_grafici?: GraphicData;
  metadata_ai_nascosti?: HiddenAiMetadata;
  stato_iniziale?: PlaceState;
  coordinate?: PlaceCoordinates;
  coordinate_percorso?: PlaceCoordinates[];
  mezzo_trasporto?: string;
  mezzi_consigliati?: string[];
}

export type TransportMode = "auto" | "moto" | "bici" | "piedi" | "camper" | "treno_bus" | string;
export { getTransportModeMeta } from "./data/categories";
export type { TransportModeMeta } from "./data/categories";
