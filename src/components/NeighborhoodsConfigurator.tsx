'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import NeighborhoodSidebar from './NeighborhoodSidebar';
import BulkEditModal from './BulkEditModal';
import { Search, Map, List, Settings, Edit3, CheckCircle, XCircle, Info, Keyboard } from 'lucide-react';

const LeafletMap = dynamic(() => import('./LeafletMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[550px] bg-slate-950 border border-slate-900 rounded-xl flex items-center justify-center">
      <div className="flex flex-col items-center space-y-3">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5FC9C8]"></div>
        <span className="text-sm text-slate-500">Iniciando mapa interativo...</span>
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
    <div className="space-y-6 flex flex-col h-[100vh] overflow-hidden py-3 animate-fadeIn">
      {/* Top Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-white border border-[#F1ECE6] p-4 rounded-2xl shadow-sm shadow-slate-900/5">

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
              className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-[#EAE4DC] bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0D9488] focus:border-transparent transition-all text-sm shadow-xs font-medium"
            />
          </div>

          {searchFocused && search.trim().length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-[#F1ECE6] rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto divide-y divide-[#F1ECE6] animate-fadeIn animate-duration-150">
              {filteredNeighborhoods.slice(0, 8).map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => {
                    handleSelectNeighborhood(n.name);
                    setSearch('');
                    setSearchFocused(false);
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-[#F0FDFA] flex items-center justify-between transition-colors cursor-pointer"
                >
                  <div className="flex flex-col">
                    <span className="font-semibold text-sm text-slate-900">
                      {n.officialName}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      Fortaleza, CE
                    </span>
                  </div>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold ${n.deliveryEnabled
                    ? 'bg-[#F0FDFA] text-[#0D9488] border border-[#CCFBF1]'
                    : 'bg-slate-100 text-slate-500 border border-slate-200'
                    }`}>
                    {n.deliveryEnabled ? `Ativo • R$ ${n.fee.toFixed(2)}` : 'Inativo'}
                  </span>
                </button>
              ))}
              {filteredNeighborhoods.length === 0 && (
                <div className="px-4 py-6 text-center text-xs text-slate-400 font-medium">
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
            <div className="bg-[#FFFDFB] border border-[#F1ECE6] px-4 py-2 rounded-xl flex flex-col min-w-[120px] shadow-xs">
              <span className="text-[9px] text-slate-400 uppercase tracking-wider font-bold">Cobertura</span>
              <span className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5 leading-tight">
                {activeCount}/{totalCount} <span className="text-xs text-slate-400 font-semibold">({coveragePercent}%)</span>
              </span>
            </div>
            <div className="bg-[#FFFDFB] border border-[#F1ECE6] px-4 py-2 rounded-xl flex flex-col min-w-[120px] shadow-xs">
              <span className="text-[9px] text-slate-400 uppercase tracking-wider font-bold">Frete Médio</span>
              <span className="text-sm font-extrabold text-[#FF8A65] leading-tight">
                R$ {avgFee.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3 ml-auto lg:ml-0">
            {/* Tab Switcher */}
            <div className="bg-slate-100 p-1 rounded-xl flex items-center space-x-1 border border-slate-200">
              <button
                type="button"
                onClick={() => setActiveTab('map')}
                className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeTab === 'map'
                  ? 'bg-gradient-to-r from-[#2E5B9A] via-[#59C8CF] to-[#FFD7B5] text-white '
                  : 'text-black hover:text-slate-900'
                  }`}
              >
                <Map className="h-4 w-4" />
                <span>Mapa</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('list')}
                className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeTab === 'list'
                  ? 'bg-gradient-to-r from-[#2E5B9A] via-[#59C8CF] to-[#FFD7B5] text-white '
                  : 'text-black hover:text-slate-900'
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
              className="bg-gradient-to-r from-[#2E5B9A] via-[#59C8CF] to-[#FFD7B5] text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center space-x-1.5 transition-all cursor-pointer "
            >
              <Settings className="h-4 w-4" />
              <span>Editar em Massa</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Container - Side by Side with Sidebar */}
      <div className="flex-1 flex overflow-hidden gap-6 min-h-0">
        <div className="flex-1 overflow-y-none min-w-0">
          {activeTab === 'map' ? (
            <div className="space-y-4">
              <LeafletMap
                neighborhoods={neighborhoods}
                selectedName={selectedName}
                onSelect={handleSelectNeighborhood}
                dirtyName={dirtyName}
              />
              <div className="flex items-center space-x-2 text-xs text-slate-500 font-medium">
                <Info className="h-3.5 w-3.5 text-[#0D9488]" />
                <span>Clique em qualquer bairro no mapa para editar. Rótulos aparecem ao aproximar o zoom.</span>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-[#F1ECE6] rounded-2xl overflow-hidden shadow-sm flex flex-col max-h-[570px]">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase border-b border-[#F1ECE6]">
                    <tr>
                      <th className="px-6 py-4">Bairro</th>
                      <th className="px-6 py-4">Status de Entrega</th>
                      <th className="px-6 py-4">Taxa de Frete</th>
                      <th className="px-6 py-4">Prazo</th>
                      <th className="px-6 py-4 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F1ECE6]">
                    {filteredNeighborhoods.map((n) => (
                      <tr
                        key={n.id}
                        className={`hover:bg-[#FFFDFB] transition-colors ${selectedName === n.name ? 'bg-[#F0FDFA]' : ''
                          }`}
                      >
                        <td className="px-6 py-3.5 font-semibold text-slate-900">
                          {n.officialName}
                        </td>
                        <td className="px-6 py-3.5">
                          <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${n.deliveryEnabled
                            ? 'bg-[#F0FDFA] text-[#0D9488] border-[#CCFBF1]'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                            }`}>
                            {n.deliveryEnabled ? (
                              <>
                                <CheckCircle className="h-3 w-3 mr-0.5 text-[#0D9488]" />
                                <span>Entregando</span>
                              </>
                            ) : (
                              <>
                                <XCircle className="h-3 w-3 mr-0.5 text-rose-500" />
                                <span>Inativo</span>
                              </>
                            )}
                          </span>
                        </td>
                        <td className="px-6 py-3.5 font-mono font-semibold text-slate-900">
                          {n.deliveryEnabled ? `R$ ${Number(n.fee).toFixed(2)}` : '-'}
                        </td>
                        <td className="px-6 py-3.5 text-slate-500 font-medium">
                          {n.deliveryEnabled ? n.deliveryTime : '-'}
                        </td>
                        <td className="px-6 py-3.5 text-right">
                          <button
                            type="button"
                            onClick={() => handleSelectNeighborhood(n.name)}
                            className="text-[#0D9488] hover:text-[#0F766E] transition-colors inline-flex items-center space-x-1 cursor-pointer text-[11px] font-extrabold uppercase tracking-wide"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                            <span>Editar</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                    {filteredNeighborhoods.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-slate-400 italic">
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
          <div className="hidden lg:flex w-96 bg-white border border-[#F1ECE6] rounded-2xl flex-col items-center justify-center p-8 text-center h-[550px] shadow-sm select-none">
            <div className="p-4 rounded-2xl bg-[#F0FDFA] text-[#0D9488] border border-[#CCFBF1] mb-4 animate-pulse">
              <Map className="h-8 w-8" />
            </div>
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-xs">Painel de Configuração</h4>
            <p className="text-[11px] text-slate-500 mt-2 max-w-xs leading-relaxed font-medium">
              Clique em um bairro no mapa ou use a barra de pesquisa para visualizar e configurar as taxas de entrega da sua loja.
            </p>
            <div className="mt-8 border-t border-[#F1ECE6] pt-6 w-full flex flex-col space-y-2.5 text-left">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                <Keyboard className="h-3.5 w-3.5" />
                Atalhos Rápidos
              </span>
              <div className="flex justify-between text-xs text-slate-600 font-medium">
                <span>Buscar Bairros</span>
                <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-[9px] font-bold text-slate-600">Pesquisar</kbd>
              </div>
              <div className="flex justify-between text-xs text-slate-600 font-medium">
                <span>Fechar Painel</span>
                <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-[9px] font-bold text-slate-600">Esc</kbd>
              </div>
              <div className="flex justify-between text-xs text-slate-600 font-medium">
                <span>Salvar Formulário</span>
                <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-[9px] font-bold text-slate-600">Enter</kbd>
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
