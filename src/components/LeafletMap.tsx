'use client';

import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
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
}

export default function LeafletMap({
  neighborhoods,
  selectedName,
  onSelect
}: LeafletMapProps) {
  const [geojsonData, setGeojsonData] = useState<any>(null);
  const geojsonRef = useRef<any>(null);

  // Fix Leaflet marker icon issue in Next.js inside the component mount phase
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

  // Load the GeoJSON file containing Fortaleza neighborhood boundaries
  useEffect(() => {
    fetch('/bairros-fortaleza.geojson')
      .then((res) => res.json())
      .then((data) => setGeojsonData(data))
      .catch((err) => console.error('Error loading GeoJSON:', err));
  }, []);

  // Update styles when selections or statuses change
  useEffect(() => {
    if (geojsonRef.current) {
      geojsonRef.current.eachLayer((layer: any) => {
        const name = layer.feature.properties.name;
        const dbNeighborhood = neighborhoods.find(n => n.name === name);
        const isSelected = selectedName === name;

        let fillColor = '#64748b'; // Gray for unconfigured/missing
        let fillOpacity = 0.3;
        let color = '#475569';
        let weight = 1;

        if (dbNeighborhood) {
          if (dbNeighborhood.deliveryEnabled) {
            fillColor = '#10b981'; // Green for active delivery
            fillOpacity = 0.5;
            color = '#047857';
          } else {
            fillColor = '#ef4444'; // Red for inactive delivery
            fillOpacity = 0.4;
            color = '#b91c1c';
          }
        }

        if (isSelected) {
          fillColor = '#3b82f6'; // Blue highlight for selected
          fillOpacity = 0.7;
          color = '#1d4ed8';
          weight = 3;
        }

        if (layer.setStyle && typeof layer.setStyle === 'function') {
          layer.setStyle({
            fillColor,
            fillOpacity,
            color,
            weight,
          });
        }
      });
    }
  }, [neighborhoods, selectedName, geojsonData]);

  if (!geojsonData) {
    return (
      <div className="w-full h-[550px] bg-slate-100 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-center">
        <div className="flex flex-col items-center space-y-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
          <span className="text-sm text-slate-400">Carregando mapa de Fortaleza...</span>
        </div>
      </div>
    );
  }

  // Handle polygon clicks
  const onEachFeature = (feature: any, layer: any) => {
    const name = feature.properties.name;
    const officialName = feature.properties.officialName;

    // Bind a simple tooltip with the neighborhood name
    layer.bindTooltip(officialName, {
      sticky: true,
      className: 'bg-slate-900 border-none text-white text-xs px-2 py-1 rounded shadow'
    });

    layer.on({
      click: () => {
        onSelect(name);
      },
      mouseover: (e: any) => {
        const l = e.target;
        if (l.setStyle && typeof l.setStyle === 'function') {
          l.setStyle({
            fillOpacity: 0.85,
            weight: 2
          });
        }
      },
      mouseout: (e: any) => {
        const l = e.target;
        const dbNeighborhood = neighborhoods.find(n => n.name === name);
        const isSelected = selectedName === name;
        
        let opacity = 0.3;
        if (dbNeighborhood) {
          opacity = dbNeighborhood.deliveryEnabled ? 0.5 : 0.4;
        }
        if (isSelected) opacity = 0.7;

        if (l.setStyle && typeof l.setStyle === 'function') {
          l.setStyle({
            fillOpacity: opacity,
            weight: isSelected ? 3 : 1
          });
        }
      }
    });
  };

  return (
    <div className="w-full h-[550px] overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 relative shadow-inner">
      <MapContainer
        center={[-3.7319, -38.5267]} // Fortaleza center coords
        zoom={12}
        className="w-full h-full"
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          className="dark:invert dark:opacity-85"
        />
        <GeoJSON
          ref={geojsonRef}
          data={geojsonData}
          onEachFeature={onEachFeature}
        />
      </MapContainer>

      {/* Map Legend */}
      <div className="absolute bottom-4 left-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-lg shadow-md z-[500] space-y-1.5 text-xs font-semibold">
        <span className="text-slate-400 block mb-1">Legenda:</span>
        <div className="flex items-center space-x-2">
          <span className="w-3.5 h-3.5 bg-emerald-500 border border-emerald-600 rounded"></span>
          <span className="text-slate-700 dark:text-slate-300">Entrega Habilitada</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-3.5 h-3.5 bg-rose-500 border border-rose-600 rounded"></span>
          <span className="text-slate-700 dark:text-slate-300">Entrega Desabilitada</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-3.5 h-3.5 bg-blue-500 border border-blue-600 rounded"></span>
          <span className="text-slate-700 dark:text-slate-300">Bairro Selecionado</span>
        </div>
      </div>
    </div>
  );
}
