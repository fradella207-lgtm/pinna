import { SavedPlace } from "../types";

/**
 * Escapes XML special characters
 */
function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case "&":
        return "&amp;";
      case "'":
        return "&apos;";
      case '"':
        return "&quot;";
      default:
        return c;
    }
  });
}

/**
 * Generates GPX (GPS Exchange Format 1.1) for Garmin, OsmAnd, Gaia GPS, etc.
 */
export function generateGpx(places: SavedPlace[]): string {
  const time = new Date().toISOString();
  let waypointsXml = "";

  for (const place of places) {
    const lat = place.coordinate?.lat;
    const lng = place.coordinate?.lng;
    if (lat === undefined || lng === undefined) continue;

    const name = escapeXml(place.nome_del_luogo || place.nome || place.nome_luogo || "Spot");
    const isVisited = place.stato_iniziale?.visitato ?? place.visited ?? false;
    const descParts = [
      place.categoria_principale ? `Categoria: ${place.categoria_principale}` : "",
      place.citta_o_zona ? `Zona: ${place.citta_o_zona}` : "",
      place.sintesi ? `Note: ${place.sintesi}` : "",
      place.paese ? `Paese: ${place.paese}` : "",
      place.regione ? `Regione: ${place.regione}` : "",
      isVisited ? "Stato: Già visitato" : "Stato: Da visitare"
    ].filter(Boolean).join(" | ");

    waypointsXml += `  <wpt lat="${lat.toFixed(6)}" lon="${lng.toFixed(6)}">
    <name>${name}</name>
    <desc>${escapeXml(descParts)}</desc>
    <type>${escapeXml(place.categoria_principale || "Punto di interesse")}</type>
    <sym>Flag, Blue</sym>
  </wpt>\n`;
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="pinna - Mappa Satellitare (https://pinna.app)" xmlns="http://www.topografix.com/GPX/1/1">
  <metadata>
    <name>Esportazione Spot pinna</name>
    <desc>Luoghi e spot salvati esportati dall'applicazione pinna.</desc>
    <time>${time}</time>
  </metadata>
${waypointsXml}</gpx>`;
}

/**
 * Generates KML for Google Earth, Maps, MAPS.ME, etc.
 */
export function generateKml(places: SavedPlace[]): string {
  let placemarksXml = "";

  for (const place of places) {
    const lat = place.coordinate?.lat;
    const lng = place.coordinate?.lng;
    if (lat === undefined || lng === undefined) continue;

    const name = escapeXml(place.nome_del_luogo || place.nome || place.nome_luogo || "Spot");
    const desc = escapeXml(
      `${place.citta_o_zona || ""}\n${place.categoria_principale || ""}\n${place.sintesi || ""}`.trim()
    );

    placemarksXml += `    <Placemark>
      <name>${name}</name>
      <description>${desc}</description>
      <Point>
        <coordinates>${lng.toFixed(6)},${lat.toFixed(6)},0</coordinates>
      </Point>
    </Placemark>\n`;
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>Spot Salvati pinna</name>
    <description>I tuoi luoghi e punti di interesse esportati da pinna.</description>
${placemarksXml}  </Document>
</kml>`;
}

/**
 * Downloads a generated file in browser
 */
export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
