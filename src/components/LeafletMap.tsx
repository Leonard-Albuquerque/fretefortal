'use client';

import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import L from 'leaflet';

interface NeighborhoodData {
  id: string;
  name: string;
  officialName: string;
  deliveryEnabled: boolean;
  fee: number;
}

interface LeafletMapProps {
  neighborhoods: NeighborhoodData[];
  selectedName: string | null;
  onSelect: (normalizedName: string, officialName: string) => void;
  dirtyName: string | null;
  publicView?: boolean;
  className?: string;
}

const FORTALEZA_BOUNDS = L.latLngBounds(
  [-3.89, -38.66], // South-West (Sudoeste)
  [-3.68, -38.42]  // North-East (Nordeste)
);

function MapController({ selectedName, geojsonData }: { selectedName: string | null; geojsonData: any }) {
  const map = useMap();

  useEffect(() => {
    if (selectedName && geojsonData) {
      const feature = geojsonData.features.find(
        (f: any) => f.properties.name === selectedName
      );
      if (feature) {
        const tempLayer = L.geoJSON(feature);
        const bounds = tempLayer.getBounds();
        if (bounds.isValid()) {
          map.flyToBounds(bounds, {
            padding: [60, 60],
            maxZoom: 14,
            duration: 1.0
          });
        }
      }
    }
  }, [selectedName, geojsonData, map]);

  return null;
}

function CustomZoomControls() {
  const map = useMap();
  return (
    <div className="absolute bottom-4 right-4 z-[500] flex flex-col space-y-1.5 shadow-sm">
      <button
        type="button"
        onClick={() => map.zoomIn()}
        className="w-8 h-8 flex items-center justify-center bg-slate-900 border border-slate-800 text-slate-200 rounded-lg hover:bg-slate-850 active:scale-95 transition-all text-lg font-semibold cursor-pointer shadow"
        title="Aumentar Zoom"
      >
        +
      </button>
      <button
        type="button"
        onClick={() => map.zoomOut()}
        className="w-8 h-8 flex items-center justify-center bg-slate-900 border border-slate-800 text-slate-200 rounded-lg hover:bg-slate-850 active:scale-95 transition-all text-lg font-semibold cursor-pointer shadow"
        title="Diminuir Zoom"
      >
        −
      </button>
    </div>
  );
}

export default function LeafletMap({
  neighborhoods,
  selectedName,
  onSelect,
  dirtyName,
  publicView = false,
  className = "w-full h-[550px] overflow-hidden rounded-xl border border-slate-900 relative shadow-xl"
}: LeafletMapProps) {
  const [geojsonData, setGeojsonData] = useState<any>(null);
  const geojsonRef = useRef<any>(null);

  // Sync Leaflet default icon paths (required inside Next.js)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      });
    }
  }, []);

  // Load the Fortaleza boundaries GeoJSON
  useEffect(() => {
    fetch('/bairros-fortaleza.geojson')
      .then((res) => res.json())
      .then((data) => setGeojsonData(data))
      .catch((err) => console.error('Error loading GeoJSON:', err));
  }, []);

  const getStyleForLayer = (name: string, isSelected: boolean, isDirty: boolean) => {
    const dbNeighborhood = neighborhoods.find(n => n.name === name);

    let fillColor = '#1E3A5F'; // Petroleum Blue (institucional) default for unconfigured
    let fillOpacity = 0.15;
    let color = '#FFFFFF'; // Clean White borders dividing polygons
    let weight = 1.2;
    let dashArray = undefined;

    if (dbNeighborhood) {
      if (dbNeighborhood.deliveryEnabled) {
        fillOpacity = 0.45;
        // Dynamic fee-based logistics range mapping
        if (dbNeighborhood.fee <= 5) {
          fillColor = '#DCC8A5'; // Areia: low fee / point of origin
        } else if (dbNeighborhood.fee <= 12) {
          fillColor = '#5FC9C8'; // Turquesa: medium fee / transition zone
        } else {
          fillColor = '#2F7DBB'; // Azul Oceano: high fee / expansion zone
        }
      } else {
        fillColor = '#1E3A5F'; // Inactive: Petroleum Blue
        fillOpacity = 0.1; // Muted Petroleum Blue
      }
    }

    if (isSelected) {
      color = '#5FC9C8'; // Turquesa highlight border for selected
      weight = 3;
      fillOpacity = 0.65;
      if (isDirty) {
        dashArray = '5, 5';
      }
    } else if (isDirty) {
      dashArray = '5, 5';
      weight = 2;
    }

    return {
      fillColor,
      fillOpacity,
      color,
      weight,
      dashArray,
    };
  };

  // Update styles on data / state changes
  useEffect(() => {
    if (geojsonRef.current) {
      geojsonRef.current.eachLayer((layer: any) => {
        const name = layer.feature.properties.name;
        const isSelected = selectedName === name;
        const isDirty = dirtyName === name;

        const styles = getStyleForLayer(name, isSelected, isDirty);

        if (layer.setStyle && typeof layer.setStyle === 'function') {
          layer.setStyle(styles);
        }
      });
    }
  }, [neighborhoods, selectedName, dirtyName, geojsonData]);

  if (!geojsonData) {
    return (
      <div className="w-full h-[550px] bg-slate-950 border border-slate-900 rounded-xl flex items-center justify-center">
        <div className="flex flex-col items-center space-y-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-400"></div>
          <span className="text-sm text-slate-500">Carregando mapa de Fortaleza...</span>
        </div>
      </div>
    );
  }

  // Handle polygon clicks and hovers
  const onEachFeature = (feature: any, layer: any) => {
    const name = feature.properties.name;
    const officialName = feature.properties.officialName;

    // Bind a permanent tooltip with the neighborhood name (styling handled in globals.css)
    layer.bindTooltip(officialName, {
      permanent: true,
      direction: 'center',
      className: 'neighborhood-label'
    });

    layer.on({
      click: () => {
        onSelect(name, officialName);
      },
      mouseover: (e: any) => {
        const l = e.target;
        if (l.setStyle && typeof l.setStyle === 'function') {
          const isSelected = selectedName === name;
          l.setStyle({
            fillOpacity: isSelected ? 0.75 : 0.55,
            weight: isSelected ? 3.5 : 2,
            color: isSelected ? '#5FC9C8' : '#FFFFFF',
          });
        }
      },
      mouseout: (e: any) => {
        const l = e.target;
        const isSelected = selectedName === name;
        const isDirty = dirtyName === name;

        const styles = getStyleForLayer(name, isSelected, isDirty);

        if (l.setStyle && typeof l.setStyle === 'function') {
          l.setStyle(styles);
        }
      }
    });
  };

  const tileUrl = 'https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png';

  return (
    <div className={className}>
      <MapContainer
        center={[-3.7319, -38.5267]} // Fortaleza center
        zoom={12}
        minZoom={11}
        maxZoom={16}
        maxBounds={FORTALEZA_BOUNDS}
        className="w-full h-full dark"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
          url={tileUrl}
        />
        <GeoJSON
          ref={geojsonRef}
          data={geojsonData}
          onEachFeature={onEachFeature}
        />
        <MapController selectedName={selectedName} geojsonData={geojsonData} />
        <CustomZoomControls />
      </MapContainer>

      {/* Modern Minimal Map Legend (Theme Accents Refactored) */}
      <div className="absolute top-4 left-4 bg-slate-900/95 backdrop-blur border border-slate-800 p-3.5 rounded-xl shadow-lg z-[500] space-y-2 text-[11px] font-semibold transition-all text-slate-300">
        <span className="text-slate-500 block text-[9px] uppercase tracking-wider font-bold">Legenda de Frete</span>
        <div className="flex items-center space-x-2.5">
          <span className="w-3.5 h-3.5 bg-[#DCC8A5]/45 border border-[#DCC8A5] rounded-md"></span>
          <span>Econômico (≤ R$ 5,00)</span>
        </div>
        <div className="flex items-center space-x-2.5">
          <span className="w-3.5 h-3.5 bg-[#5FC9C8]/45 border border-[#5FC9C8] rounded-md"></span>
          <span>Intermediário (R$ 6 - R$ 12)</span>
        </div>
        <div className="flex items-center space-x-2.5">
          <span className="w-3.5 h-3.5 bg-[#2F7DBB]/45 border border-[#2F7DBB] rounded-md"></span>
          <span>Distante (&gt; R$ 12,00)</span>
        </div>
        <div className="flex items-center space-x-2.5">
          <span className="w-3.5 h-3.5 bg-[#1E3A5F]/15 border border-[#1E3A5F] rounded-md"></span>
          <span>Sem entrega / Inativo</span>
        </div>
        <div className="flex items-center space-x-2.5 border-t border-slate-800/80 pt-1.5 mt-1">
          <span className="w-3.5 h-3.5 bg-slate-900 border-2 border-[#5FC9C8] rounded-md"></span>
          <span>{publicView ? 'Bairro Selecionado' : 'Selecionado (Editar)'}</span>
        </div>
      </div>
    </div>
  );
}
