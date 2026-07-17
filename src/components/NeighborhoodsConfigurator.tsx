'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import NeighborhoodSidebar from './NeighborhoodSidebar';
import BulkEditModal from './BulkEditModal';
import { Search, Map, List, Settings, Edit3, CheckCircle, XCircle } from 'lucide-react';

const LeafletMap = dynamic(() => import('./LeafletMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[550px] bg-slate-100 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-center">
      <div className="flex flex-col items-center space-y-3">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
        <span className="text-sm text-slate-400">Iniciando mapa interativo...</span>
      </div>
    </div>
  ),
});

interface Neighborhood {
  id: string;
  name: string;
  officialName: string;
  deliveryEnabled: boolean;
  fee: number;
  deliveryTime: string | null;
  minimumOrder: number | null;
  freeDeliveryThreshold: number | null;
  notes: string | null;
}

interface NeighborhoodsConfiguratorProps {
  initialNeighborhoods: Neighborhood[];
}

export default function NeighborhoodsConfigurator({
  initialNeighborhoods
}: NeighborhoodsConfiguratorProps) {
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>(initialNeighborhoods);
  const [selectedName, setSelectedName] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'map' | 'list'>('map');
  const [bulkEditOpen, setBulkEditOpen] = useState(false);

  const selectedNeighborhood = selectedName
    ? neighborhoods.find((n) => n.name === selectedName) || null
    : null;

  // Filter list of neighborhoods
  const filteredNeighborhoods = neighborhoods.filter((n) =>
    n.officialName.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelectNeighborhood = (name: string) => {
    setSelectedName(name);
  };

  const handleSaveSuccess = (updated: Neighborhood) => {
    setNeighborhoods((prev) =>
      prev.map((n) => (n.id === updated.id ? updated : n))
    );
  };

  const handleBulkSaveSuccess = (updatedIds: string[], data: any) => {
    setNeighborhoods((prev) =>
      prev.map((n) => {
        if (updatedIds.includes(n.id)) {
          return {
            ...n,
            ...data,
          };
        }
        return n;
      })
    );
  };

  return (
    <div className="space-y-6 flex flex-col h-[calc(100vh-10rem)]">
      {/* Top Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Pesquisar bairro por nome..."
            className="w-full pl-11 pr-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-950/40 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-sm"
          />
        </div>

        <div className="flex items-center space-x-3">
          {/* Tab Switcher */}
          <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-lg flex items-center space-x-1">
            <button
              onClick={() => setActiveTab('map')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'map'
                  ? 'bg-white dark:bg-slate-900 text-slate-800 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
              }`}
            >
              <Map className="h-4 w-4" />
              <span>Mapa</span>
            </button>
            <button
              onClick={() => setActiveTab('list')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'list'
                  ? 'bg-white dark:bg-slate-900 text-slate-800 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
              }`}
            >
              <List className="h-4 w-4" />
              <span>Lista</span>
            </button>
          </div>

          {/* Bulk Edit Button */}
          <button
            onClick={() => setBulkEditOpen(true)}
            className="bg-emerald-500 text-slate-900 hover:bg-emerald-400 font-bold px-4 py-2 rounded-lg text-sm flex items-center space-x-1.5 transition-colors cursor-pointer"
          >
            <Settings className="h-4.5 w-4.5" />
            <span>Editar em Massa</span>
          </button>
        </div>
      </div>

      {/* Main Container - Side by Side with Sidebar */}
      <div className="flex-1 flex overflow-hidden gap-6 min-h-0">
        <div className="flex-1 overflow-y-auto min-w-0">
          {activeTab === 'map' ? (
            <div className="space-y-4">
              <LeafletMap
                neighborhoods={neighborhoods}
                selectedName={selectedName}
                onSelect={handleSelectNeighborhood}
              />
              <p className="text-xs text-slate-400">
                💡 Clique em qualquer bairro no mapa para ver ou alterar as configurações específicas dele no painel ao lado.
              </p>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm flex flex-col max-h-[570px]">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-500 dark:text-slate-455">
                  <thead className="bg-slate-50 dark:bg-slate-800/40 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="px-6 py-4">Bairro</th>
                      <th className="px-6 py-4">Status de Entrega</th>
                      <th className="px-6 py-4">Taxa de Frete</th>
                      <th className="px-6 py-4">Prazo</th>
                      <th className="px-6 py-4 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                    {filteredNeighborhoods.map((n) => (
                      <tr
                        key={n.id}
                        className={`hover:bg-slate-50 dark:hover:bg-slate-850/10 transition-colors ${
                          selectedName === n.name ? 'bg-blue-50/40 dark:bg-blue-950/10' : ''
                        }`}
                      >
                        <td className="px-6 py-3 font-semibold text-slate-800 dark:text-white">
                          {n.officialName}
                        </td>
                        <td className="px-6 py-3">
                          <span className={`inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            n.deliveryEnabled
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400'
                              : 'bg-rose-100 text-rose-800 dark:bg-rose-950/20 dark:text-rose-400'
                          }`}>
                            {n.deliveryEnabled ? (
                              <>
                                <CheckCircle className="h-3 w-3" />
                                <span>Entregando</span>
                              </>
                            ) : (
                              <>
                                <XCircle className="h-3 w-3" />
                                <span>Inativo</span>
                              </>
                            )}
                          </span>
                        </td>
                        <td className="px-6 py-3 font-semibold text-slate-800 dark:text-white">
                          {n.deliveryEnabled ? `R$ ${Number(n.fee).toFixed(2)}` : '-'}
                        </td>
                        <td className="px-6 py-3 text-slate-500">
                          {n.deliveryEnabled ? n.deliveryTime : '-'}
                        </td>
                        <td className="px-6 py-3 text-right">
                          <button
                            onClick={() => setSelectedName(n.name)}
                            className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 transition-colors inline-flex items-center space-x-1 cursor-pointer text-xs font-semibold"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                            <span>Editar</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                    {filteredNeighborhoods.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                          Nenhum bairro encontrado com o termo digitado.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Panel for Editing */}
        {selectedNeighborhood ? (
          <div className="h-full">
            <NeighborhoodSidebar
              neighborhood={selectedNeighborhood}
              onClose={() => setSelectedName(null)}
              onSaveSuccess={handleSaveSuccess}
            />
          </div>
        ) : (
          <div className="hidden lg:flex w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex-col items-center justify-center p-8 text-center h-[550px]">
            <Map className="h-10 w-10 text-slate-300 dark:text-slate-700 mb-4" />
            <h4 className="font-bold text-slate-700 dark:text-slate-350">Nenhum Bairro Selecionado</h4>
            <p className="text-xs text-slate-400 mt-2 max-w-xs">
              Clique em um bairro no mapa ou clique no botão &quot;Editar&quot; na lista para visualizar e configurar as taxas de entrega.
            </p>
          </div>
        )}
      </div>

      {/* Bulk Edit Modal */}
      {bulkEditOpen && (
        <BulkEditModal
          neighborhoods={neighborhoods}
          onClose={() => setBulkEditOpen(false)}
          onSaveSuccess={handleBulkSaveSuccess}
        />
      )}
    </div>
  );
}
