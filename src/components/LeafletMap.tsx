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
        className="w-8 h-8 flex items-center justify-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-95 transition-all text-lg font-semibold cursor-pointer shadow"
        title="Aumentar Zoom"
      >
        +
      </button>
      <button
        type="button"
        onClick={() => map.zoomOut()}
        className="w-8 h-8 flex items-center justify-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-95 transition-all text-lg font-semibold cursor-pointer shadow"
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
  const [isDarkMode, setIsDarkMode] = useState(false);
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

  // Monitor Dark Mode changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const checkDark = () => {
        const isDarkClass = document.documentElement.classList.contains('dark');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setIsDarkMode(isDarkClass || prefersDark);
      };

      checkDark();

      const observer = new MutationObserver(checkDark);
      observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', checkDark);

      return () => {
        observer.disconnect();
        mediaQuery.removeEventListener('change', checkDark);
      };
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

        let fillColor = '#cbd5e1'; // Gray for unconfigured/missing
        let fillOpacity = 0.15;
        let color = '#94a3b8';
        let weight = 1;
        let dashArray = undefined;

        if (dbNeighborhood) {
          if (dbNeighborhood.deliveryEnabled) {
            fillColor = '#10b981'; // Green for active delivery
            fillOpacity = 0.35;
            color = '#059669';
            weight = 1.5;
          } else {
            fillColor = '#f59e0b'; // Amber for inactive delivery
            fillOpacity = 0.25;
            color = '#d97706';
            weight = 1.5;
          }
        }

        if (isSelected) {
          color = '#6366f1'; // Premium Indigo highlight for selected
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
      <div className="w-full h-[550px] bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-center">
        <div className="flex flex-col items-center space-y-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
          <span className="text-sm text-slate-400 dark:text-slate-500">Carregando mapa de Fortaleza...</span>
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
            color: isSelected ? '#6366f1' : '#818cf8',
          });
        }
      },
      mouseout: (e: any) => {
        const l = e.target;
        const dbNeighborhood = neighborhoods.find(n => n.name === name);
        const isSelected = selectedName === name;
        const isDirty = dirtyName === name;

        let fillColor = '#cbd5e1';
        let fillOpacity = 0.15;
        let color = '#94a3b8';
        let weight = 1;
        let dashArray = undefined;

        if (dbNeighborhood) {
          if (dbNeighborhood.deliveryEnabled) {
            fillColor = '#10b981';
            fillOpacity = 0.35;
            color = '#059669';
            weight = 1.5;
          } else {
            fillColor = '#f59e0b';
            fillOpacity = 0.25;
            color = '#d97706';
            weight = 1.5;
          }
        }

        if (isSelected) {
          color = '#6366f1';
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

  const tileUrl = isDarkMode
    ? 'https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png';

  return (
    <div className="w-full h-[550px] overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800/80 relative shadow-sm">
      <MapContainer
        center={[-3.7319, -38.5267]} // Fortaleza center
        zoom={12}
        minZoom={11}
        maxZoom={16}
        maxBounds={FORTALEZA_BOUNDS}
        className={`w-full h-full ${isDarkMode ? 'dark' : ''}`}
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
      <div className="absolute top-4 left-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur border border-slate-200/80 dark:border-slate-800 p-3.5 rounded-xl shadow-lg z-[500] space-y-2 text-[11px] font-medium transition-all">
        <span className="text-slate-400 dark:text-slate-500 block text-[10px] uppercase tracking-wider font-semibold">Legenda</span>
        <div className="flex items-center space-x-2.5">
          <span className="w-3 h-3 bg-emerald-500/20 border border-emerald-500 rounded-md"></span>
          <span className="text-slate-650 dark:text-slate-350">Entrega Habilitada</span>
        </div>
        <div className="flex items-center space-x-2.5">
          <span className="w-3 h-3 bg-amber-500/20 border border-amber-500 rounded-md"></span>
          <span className="text-slate-650 dark:text-slate-350">Entrega Desativada</span>
        </div>
        <div className="flex items-center space-x-2.5">
          <span className="w-3 h-3 bg-slate-300/20 border border-slate-400 dark:bg-slate-800/20 dark:border-slate-700 rounded-md"></span>
          <span className="text-slate-650 dark:text-slate-350">Não Configurado</span>
        </div>
        <div className="flex items-center space-x-2.5">
          <span className="w-3 h-3 bg-indigo-500/20 border border-indigo-500 rounded-md"></span>
          <span className="text-slate-650 dark:text-slate-350">Selecionado</span>
        </div>
      </div>
    </div>
  );
}
