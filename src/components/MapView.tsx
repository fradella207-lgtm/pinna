import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import { SavedPlace } from "../types";
import { getActivityColor } from "../data/categories";
import { 
  Layers, 
  MapPin, 
  Maximize2, 
  Video, 
  CheckCircle2, 
  Navigation, 
  ExternalLink,
  Eye,
  Mountain,
  Share2
} from "lucide-react";

interface MapViewProps {
  places: SavedPlace[];
  selectedPlace: SavedPlace | null;
  onSelectPlace: (place: SavedPlace) => void;
  activeFilterKey?: string;
  isFullScreen?: boolean;
}

type MapLayerType = "satellite" | "topo" | "streets";

export const MapView: React.FC<MapViewProps> = ({
  places,
  selectedPlace,
  onSelectPlace,
  isFullScreen = true,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [id: string]: L.Marker }>({});
  const polylinesRef = useRef<{ [id: string]: L.Polyline }>({});
  const polylineGlowsRef = useRef<{ [id: string]: L.Polyline }>({});
  const tileLayerGroupRef = useRef<L.LayerGroup | null>(null);

  const [activeLayer, setActiveLayer] = useState<MapLayerType>("satellite");
  const [showLayerMenu, setShowLayerMenu] = useState(false);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Center on Italian Alps initially
    const map = L.map(mapContainerRef.current, {
      center: [46.4, 11.8],
      zoom: 8,
      zoomControl: false,
    });

    // Layer Group for Base Tiles
    const tileGroup = L.layerGroup().addTo(map);
    tileLayerGroupRef.current = tileGroup;

    // Zoom control at bottom right (above possible bottom cards on mobile)
    L.control.zoom({ position: "bottomright" }).addTo(map);

    mapInstanceRef.current = map;

    // Set initial Satellite layer
    updateBaseTiles(map, tileGroup, "satellite");

    // Handle container resize cleanly without lag
    const observer = new ResizeObserver(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    });
    observer.observe(mapContainerRef.current);

    return () => {
      observer.disconnect();
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Function to switch base tiles
  const updateBaseTiles = (map: L.Map, group: L.LayerGroup, layerType: MapLayerType) => {
    group.clearLayers();

    if (layerType === "satellite") {
      // 1. High-resolution Satellite Imagery (ESRI World Imagery)
      const satLayer = L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        {
          attribution: "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
          maxZoom: 19,
        }
      );
      // 2. Clear Road & Place Labels Overlay
      const labelsLayer = L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
        {
          attribution: "Labels &copy; Esri",
          maxZoom: 19,
          opacity: 0.85,
        }
      );
      group.addLayer(satLayer);
      group.addLayer(labelsLayer);
    } else if (layerType === "topo") {
      // Topographic elevation with contours
      const topoLayer = L.tileLayer(
        "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
        {
          maxZoom: 17,
          attribution: "Map data: &copy; OpenStreetMap contributors, SRTM | Map style: &copy; OpenTopoMap (CC-BY-SA)",
        }
      );
      group.addLayer(topoLayer);
    } else {
      // Clean modern street map (CartoDB Positron / OSM)
      const streetLayer = L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
        {
          attribution: "&copy; OpenStreetMap contributors &copy; CARTO",
          subdomains: "abcd",
          maxZoom: 20,
        }
      );
      group.addLayer(streetLayer);
    }
  };

  const handleSelectLayer = (type: MapLayerType) => {
    setActiveLayer(type);
    setShowLayerMenu(false);
    if (mapInstanceRef.current && tileLayerGroupRef.current) {
      updateBaseTiles(mapInstanceRef.current, tileLayerGroupRef.current, type);
    }
  };

  // Synchronize Markers and Route Polylines
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear existing markers & polylines
    Object.keys(markersRef.current).forEach((id) => markersRef.current[id]?.remove());
    markersRef.current = {};

    Object.keys(polylinesRef.current).forEach((id) => polylinesRef.current[id]?.remove());
    polylinesRef.current = {};

    Object.keys(polylineGlowsRef.current).forEach((id) => polylineGlowsRef.current[id]?.remove());
    polylineGlowsRef.current = {};

    const bounds: L.LatLngExpression[] = [];

    places.forEach((place) => {
      const lat = place.coordinate?.lat;
      const lng = place.coordinate?.lng;
      if (!lat || !lng) return;

      const isVisited = Boolean(place.stato_iniziale?.visitato || place.visited);
      const hasVideo = Boolean(place.video_attachment || place.social_source_link);
      const strokeColor = isVisited ? "#64748b" : (place.dati_grafici?.colore_badge_consigliato || getActivityColor(place.categoria));

      // --- 1. MOUNTAIN ROUTE POLYLINE (SE PERCORSO) ---
      if (place.tipo_entita === "PERCORSO" && place.geometria_percorso?.coordinate_linea?.length) {
        const latLngs: L.LatLngExpression[] = place.geometria_percorso.coordinate_linea.map(
          (coord) => [coord.lat, coord.lng]
        );

        // Subtle Glow Line underneath
        const glowLine = L.polyline(latLngs, {
          color: strokeColor,
          weight: 10,
          opacity: isVisited ? 0.2 : 0.35,
          lineCap: "round",
          lineJoin: "round",
        }).addTo(map);
        polylineGlowsRef.current[place.id] = glowLine;

        // Main Route Polyline
        const isSelected = selectedPlace?.id === place.id;
        const routeLine = L.polyline(latLngs, {
          color: isSelected ? "#ffffff" : strokeColor,
          weight: isSelected ? 6 : 4.5,
          opacity: 0.95,
          dashArray: place.geometria_percorso.tipo_tracciato === "SENTIERO" ? "6, 8" : undefined,
          lineCap: "round",
          lineJoin: "round",
        }).addTo(map);

        routeLine.on("click", () => {
          onSelectPlace(place);
        });

        polylinesRef.current[place.id] = routeLine;
        latLngs.forEach((pt) => bounds.push(pt));
      }

      // --- 2. PIN MARKER ---
      const isSelected = selectedPlace?.id === place.id;
      const pinSize = isSelected ? 42 : 36;
      const iconLetter = place.tipo_entita === "PERCORSO" ? "⛰️" : "📍";

      const customHtml = `
        <div style="position: relative; width: ${pinSize}px; height: ${pinSize + 8}px; display: flex; align-items: center; justify-content: center; cursor: pointer; filter: drop-shadow(0 4px 8px rgba(0,0,0,0.5)); transform: ${isSelected ? "scale(1.15)" : "scale(1)"}; transition: transform 0.2s ease;">
          <svg viewBox="0 0 24 32" width="${pinSize}" height="${pinSize + 8}" style="fill: ${strokeColor};">
            <path d="M12 0C5.373 0 0 5.373 0 12c0 9 12 20 12 20s12-11 12-20c0-6.627-5.373-12-12-12z" />
          </svg>
          <div style="position: absolute; top: 4px; width: ${pinSize - 16}px; height: ${pinSize - 16}px; border-radius: 50%; background: white; display: flex; align-items: center; justify-content: center; font-size: ${isSelected ? "14px" : "12px"}; font-weight: 800; color: #0f172a; box-shadow: 0 1px 3px rgba(0,0,0,0.2);">
            ${iconLetter}
          </div>
          ${
            isVisited
              ? `<div style="position: absolute; top: -2px; right: -2px; width: 15px; height: 15px; background: #10b981; border: 2px solid white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 9px; color: white; font-weight: bold;">✓</div>`
              : ""
          }
          ${
            hasVideo
              ? `<div style="position: absolute; bottom: 4px; right: -4px; width: 15px; height: 15px; background: #ea580c; border: 2px solid white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 8px; color: white;">▶</div>`
              : ""
          }
        </div>
      `;

      const icon = L.divIcon({
        html: customHtml,
        className: "custom-interactive-marker",
        iconSize: [pinSize, pinSize + 8],
        iconAnchor: [pinSize / 2, pinSize + 8],
        popupAnchor: [0, -(pinSize + 6)],
      });

      const marker = L.marker([lat, lng], { icon }).addTo(map);

      marker.on("click", () => {
        onSelectPlace(place);
      });

      markersRef.current[place.id] = marker;
      bounds.push([lat, lng]);
    });

    // Auto-fit initial bounds nicely
    if (bounds.length > 0 && !selectedPlace) {
      map.fitBounds(L.latLngBounds(bounds), { padding: [40, 40], maxZoom: 14 });
    }
  }, [places]);

  // Highlight and fly to selected place
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedPlace) return;

    const lat = selectedPlace.coordinate?.lat;
    const lng = selectedPlace.coordinate?.lng;
    if (!lat || !lng) return;

    if (selectedPlace.tipo_entita === "PERCORSO" && selectedPlace.geometria_percorso?.coordinate_linea?.length) {
      const pts = selectedPlace.geometria_percorso.coordinate_linea.map(
        (c) => [c.lat, c.lng] as [number, number]
      );
      map.fitBounds(L.latLngBounds(pts), { padding: [60, 60], maxZoom: 15 });
    } else {
      map.flyTo([lat, lng], 13, { duration: 1.2 });
    }
  }, [selectedPlace]);

  // Fit all markers in view
  const fitAllMarkers = () => {
    const map = mapInstanceRef.current;
    if (!map) return;
    const bounds: L.LatLngExpression[] = places
      .filter((p) => p.coordinate?.lat && p.coordinate?.lng)
      .map((p) => [p.coordinate.lat, p.coordinate.lng]);

    if (bounds.length > 0) {
      map.fitBounds(L.latLngBounds(bounds), { padding: [40, 40] });
    }
  };

  return (
    <div className={`relative w-full h-full ${isFullScreen ? "inset-0" : "rounded-3xl border border-slate-700/50 shadow-md"} overflow-hidden bg-slate-950`}>
      {/* Leaflet DOM Root */}
      <div 
        id="leaflet-map-canvas"
        ref={mapContainerRef} 
        className="w-full h-full absolute inset-0 z-0" 
      />
    </div>
  );
};
