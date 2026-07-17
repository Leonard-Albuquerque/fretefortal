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
  onSelect: (normalizedName: string) => void;
  dirtyName: string | null;
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
  dirtyName
}: LeafletMapProps) {
  const [geojsonData, setGeojsonData] = useState<any>(null);
  const geojsonRef = useRef<any>(null);
  const isDarkMode = true; // Forced dark theme map

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

  // Update styles on data / state changes
  useEffect(() => {
    if (geojsonRef.current) {
      geojsonRef.current.eachLayer((layer: any) => {
        const name = layer.feature.properties.name;
        const dbNeighborhood = neighborhoods.find(n => n.name === name);
        const isSelected = selectedName === name;
        const isDirty = dirtyName === name;

        let fillColor = '#1e293b'; // slate-800 for unconfigured/missing
        let fillOpacity = 0.2;
        let color = '#475569'; // slate-600 border
        let weight = 1;
        let dashArray = undefined;

        if (dbNeighborhood) {
          if (dbNeighborhood.deliveryEnabled) {
            fillColor = '#8b5cf6'; // Violet active delivery
            fillOpacity = 0.35;
            color = '#a78bfa'; // violet-400 border
            weight = 1.5;
          } else {
            fillColor = '#f43f5e'; // Soft Rose for inactive
            fillOpacity = 0.15;
            color = '#fda4af'; // rose-300 border
            weight = 1;
          }
        }

        if (isSelected) {
          color = '#d946ef'; // Fuchsia neon for selected
          weight = 3;
          fillOpacity = 0.55;
          if (isDirty) {
            dashArray = '5, 5';
          }
        } else if (isDirty) {
          dashArray = '5, 5';
          weight = 2;
        }

        if (layer.setStyle && typeof layer.setStyle === 'function') {
          layer.setStyle({
            fillColor,
            fillOpacity,
            color,
            weight,
            dashArray,
          });
        }
      });
    }
  }, [neighborhoods, selectedName, dirtyName, geojsonData]);

  if (!geojsonData) {
    return (
      <div className="w-full h-[550px] bg-slate-950 border border-slate-900 rounded-xl flex items-center justify-center">
        <div className="flex flex-col items-center space-y-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500"></div>
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
        onSelect(name);
      },
      mouseover: (e: any) => {
        const l = e.target;
        if (l.setStyle && typeof l.setStyle === 'function') {
          const isSelected = selectedName === name;
          l.setStyle({
            fillOpacity: isSelected ? 0.7 : 0.45,
            weight: isSelected ? 3.5 : 2,
            color: isSelected ? '#d946ef' : '#f472b6', // pink highlight on hover
          });
        }
      },
      mouseout: (e: any) => {
        const l = e.target;
        const dbNeighborhood = neighborhoods.find(n => n.name === name);
        const isSelected = selectedName === name;
        const isDirty = dirtyName === name;

        let fillColor = '#1e293b';
        let fillOpacity = 0.2;
        let color = '#475569';
        let weight = 1;
        let dashArray = undefined;

        if (dbNeighborhood) {
          if (dbNeighborhood.deliveryEnabled) {
            fillColor = '#8b5cf6';
            fillOpacity = 0.35;
            color = '#a78bfa';
            weight = 1.5;
          } else {
            fillColor = '#f43f5e';
            fillOpacity = 0.15;
            color = '#fda4af';
            weight = 1;
          }
        }

        if (isSelected) {
          color = '#d946ef';
          weight = 3;
          fillOpacity = 0.55;
          if (isDirty) {
            dashArray = '5, 5';
          }
        } else if (isDirty) {
          dashArray = '5, 5';
          weight = 2;
        }

        if (l.setStyle && typeof l.setStyle === 'function') {
          l.setStyle({
            fillColor,
            fillOpacity,
            color,
            weight,
            dashArray,
          });
        }
      }
    });
  };

  const tileUrl = 'https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png';

  return (
    <div className="w-full h-[550px] overflow-hidden rounded-xl border border-slate-900 relative shadow-xl">
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

      {/* Modern Minimal Map Legend */}
      <div className="absolute top-4 left-4 bg-slate-900/95 backdrop-blur border border-slate-800 p-3.5 rounded-xl shadow-lg z-[500] space-y-2 text-[11px] font-medium transition-all text-slate-350">
        <span className="text-slate-500 block text-[10px] uppercase tracking-wider font-semibold">Legenda</span>
        <div className="flex items-center space-x-2.5">
          <span className="w-3 h-3 bg-violet-500/20 border border-violet-500 rounded-md"></span>
          <span>Entrega Habilitada</span>
        </div>
        <div className="flex items-center space-x-2.5">
          <span className="w-3 h-3 bg-rose-500/20 border border-rose-500 rounded-md"></span>
          <span>Entrega Desativada</span>
        </div>
        <div className="flex items-center space-x-2.5">
          <span className="w-3 h-3 bg-slate-800/20 border border-slate-700 rounded-md"></span>
          <span>Não Configurado</span>
        </div>
        <div className="flex items-center space-x-2.5">
          <span className="w-3 h-3 bg-fuchsia-500/20 border border-fuchsia-500 rounded-md"></span>
          <span>Selecionado</span>
        </div>
      </div>
    </div>
  );
}
