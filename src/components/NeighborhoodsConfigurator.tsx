'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import NeighborhoodSidebar from './NeighborhoodSidebar';
import BulkEditModal from './BulkEditModal';
import { Search, Map, List, Settings, Edit3, CheckCircle, XCircle, Info, Keyboard } from 'lucide-react';

const LeafletMap = dynamic(() => import('./LeafletMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[550px] bg-slate-100 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-center">
      <div className="flex flex-col items-center space-y-3">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
        <span className="text-sm text-slate-400 dark:text-slate-500">Iniciando mapa interativo...</span>
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
  const [dirtyName, setDirtyName] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
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
    if (dirtyName && dirtyName !== name) {
      const discard = confirm('Você possui alterações não salvas no bairro selecionado. Deseja descartá-las?');
      if (!discard) return;
    }
    setSelectedName(name);
    setDirtyName(null);
  };

  const handleSaveSuccess = (updated: Neighborhood) => {
    setNeighborhoods((prev) =>
      prev.map((n) => (n.id === updated.id ? updated : n))
    );
    setDirtyName(null);
  };

  const handleSaveAndNext = (currentName: string) => {
    const listToUse = neighborhoods;
    const currentIndex = listToUse.findIndex((n) => n.name === currentName);
    
    if (currentIndex !== -1 && listToUse.length > 1) {
      const nextIndex = (currentIndex + 1) % listToUse.length;
      setSelectedName(listToUse[nextIndex].name);
      setDirtyName(null);
    } else {
      setSelectedName(null);
      setDirtyName(null);
    }
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

  // Stats calculation
  const totalCount = neighborhoods.length;
  const activeCount = neighborhoods.filter((n) => n.deliveryEnabled).length;
  const coveragePercent = totalCount ? Math.round((activeCount / totalCount) * 100) : 0;
  
  const activeWithFee = neighborhoods.filter((n) => n.deliveryEnabled && n.fee > 0);
  const avgFee = activeWithFee.length
    ? activeWithFee.reduce((acc, curr) => acc + curr.fee, 0) / activeWithFee.length
    : 0;

  return (
    <div className="space-y-6 flex flex-col h-[calc(100vh-10rem)]">
      {/* Top Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 p-4 rounded-2xl shadow-sm">
        
        {/* Unified Auto-Complete Search */}
        <div className="relative flex-1 max-w-md z-30">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              value={search}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
              onChange={(e) => {
                setSearch(e.target.value);
                setSearchFocused(true);
              }}
              placeholder="Pesquisar bairro por nome..."
              className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm shadow-sm"
            />
          </div>

          {searchFocused && search.trim().length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/40 animate-fadeIn">
              {filteredNeighborhoods.slice(0, 8).map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => {
                    handleSelectNeighborhood(n.name);
                    setSearch('');
                    setSearchFocused(false);
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 flex items-center justify-between transition-colors cursor-pointer"
                >
                  <div className="flex flex-col">
                    <span className="font-semibold text-sm text-slate-800 dark:text-white">
                      {n.officialName}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Fortaleza, CE
                    </span>
                  </div>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold ${
                    n.deliveryEnabled
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400'
                      : 'bg-slate-100 text-slate-500 dark:bg-slate-800/60 dark:text-slate-400'
                  }`}>
                    {n.deliveryEnabled ? `Ativo • R$ ${n.fee.toFixed(2)}` : 'Inativo'}
                  </span>
                </button>
              ))}
              {filteredNeighborhoods.length === 0 && (
                <div className="px-4 py-6 text-center text-xs text-slate-400">
                  Nenhum bairro encontrado.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Coverage Mini Dashboard & Actions */}
        <div className="flex flex-wrap lg:flex-nowrap items-center gap-4 justify-between lg:justify-end">
          
          {/* Mini Dashboard */}
          <div className="flex items-center space-x-3">
            <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/80 px-4 py-2 rounded-xl flex flex-col min-w-[120px]">
              <span className="text-[9px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-bold">Cobertura</span>
              <span className="text-sm font-extrabold text-slate-800 dark:text-white flex items-center gap-1.5 leading-tight">
                {activeCount}/{totalCount} <span className="text-xs text-slate-455 dark:text-slate-500 font-semibold">({coveragePercent}%)</span>
              </span>
            </div>
            <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/80 px-4 py-2 rounded-xl flex flex-col min-w-[120px]">
              <span className="text-[9px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-bold">Frete Médio</span>
              <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 leading-tight">
                R$ {avgFee.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3 ml-auto lg:ml-0">
            {/* Tab Switcher */}
            <div className="bg-slate-100 dark:bg-slate-850 p-1 rounded-xl flex items-center space-x-1 border border-slate-200/40 dark:border-slate-800/40">
              <button
                type="button"
                onClick={() => setActiveTab('map')}
                className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'map'
                    ? 'bg-white dark:bg-slate-900 text-slate-800 dark:text-white shadow-sm border border-slate-200/50 dark:border-slate-800/30'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-350'
                }`}
              >
                <Map className="h-4 w-4" />
                <span>Mapa</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('list')}
                className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'list'
                    ? 'bg-white dark:bg-slate-900 text-slate-800 dark:text-white shadow-sm border border-slate-200/50 dark:border-slate-800/30'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-350'
                }`}
              >
                <List className="h-4 w-4" />
                <span>Lista</span>
              </button>
            </div>

            {/* Bulk Edit Button */}
            <button
              type="button"
              onClick={() => setBulkEditOpen(true)}
              className="bg-indigo-600 text-white hover:bg-indigo-500 font-bold px-4 py-2 rounded-xl text-sm flex items-center space-x-1.5 transition-colors cursor-pointer shadow-sm shadow-indigo-500/10 active:scale-95 border border-indigo-700/40"
            >
              <Settings className="h-4 w-4" />
              <span>Editar em Massa</span>
            </button>
          </div>
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
                dirtyName={dirtyName}
              />
              <div className="flex items-center space-x-2 text-xs text-slate-400 dark:text-slate-500">
                <Info className="h-3.5 w-3.5 text-slate-400" />
                <span>Clique em qualquer bairro no mapa para editar. Rótulos aparecem ao aproximar o zoom.</span>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-sm flex flex-col max-h-[570px] border-b-4">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-500 dark:text-slate-400">
                  <thead className="bg-slate-50 dark:bg-slate-850/40 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase border-b border-slate-200 dark:border-slate-800">
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
                          selectedName === n.name ? 'bg-indigo-50/20 dark:bg-indigo-950/10' : ''
                        }`}
                      >
                        <td className="px-6 py-3 font-semibold text-slate-800 dark:text-white">
                          {n.officialName}
                        </td>
                        <td className="px-6 py-3">
                          <span className={`inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            n.deliveryEnabled
                              ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400'
                              : 'bg-rose-50 text-rose-800 dark:bg-rose-950/20 dark:text-rose-400'
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
                        <td className="px-6 py-3 text-slate-500 dark:text-slate-400">
                          {n.deliveryEnabled ? n.deliveryTime : '-'}
                        </td>
                        <td className="px-6 py-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleSelectNeighborhood(n.name)}
                            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 transition-colors inline-flex items-center space-x-1 cursor-pointer text-xs font-bold"
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
          <div className="h-full flex-shrink-0 animate-slideIn">
            <NeighborhoodSidebar
              neighborhood={selectedNeighborhood}
              onClose={() => {
                if (dirtyName) {
                  const discard = confirm('Você possui alterações não salvas. Deseja fechar e descartá-las?');
                  if (!discard) return;
                }
                setSelectedName(null);
                setDirtyName(null);
              }}
              onSaveSuccess={handleSaveSuccess}
              onSaveAndNext={handleSaveAndNext}
              onDirtyChange={(isDirty) => {
                setDirtyName(isDirty ? selectedNeighborhood.name : null);
              }}
            />
          </div>
        ) : (
          <div className="hidden lg:flex w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex-col items-center justify-center p-8 text-center h-[550px] shadow-sm select-none">
            <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/20 text-indigo-650 dark:text-indigo-400 mb-4 animate-pulse">
              <Map className="h-8 w-8" />
            </div>
            <h4 className="font-bold text-slate-800 dark:text-slate-200">Painel de Configuração</h4>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 max-w-xs leading-relaxed">
              Clique em um bairro no mapa ou use a barra de pesquisa para visualizar e configurar as taxas de entrega da sua loja.
            </p>
            <div className="mt-8 border-t border-slate-100 dark:border-slate-800/80 pt-6 w-full flex flex-col space-y-2 text-left">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-550 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                <Keyboard className="h-3.5 w-3.5" />
                Atalhos Rápidos
              </span>
              <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>Buscar Bairros</span>
                <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-[10px] font-bold">Pesquisar</kbd>
              </div>
              <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>Fechar Painel</span>
                <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-[10px] font-bold">Esc</kbd>
              </div>
              <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>Salvar Formulário</span>
                <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-[10px] font-bold">Enter</kbd>
              </div>
            </div>
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
