'use client';

import { useState } from 'react';
import { updateMultipleNeighborhoods } from '@/app/admin/neighborhoods/actions';
import { X, Check, Save, Settings } from 'lucide-react';
import { useParams } from 'next/navigation';

interface Neighborhood {
  id: string;
  name: string;
  officialName: string;
  deliveryEnabled: boolean;
  fee: number;
}

interface BulkEditModalProps {
  neighborhoods: Neighborhood[];
  onClose: () => void;
  onSaveSuccess: (updatedIds: string[], data: any) => void;
}

export default function BulkEditModal({
  neighborhoods,
  onClose,
  onSaveSuccess
}: BulkEditModalProps) {
  const params = useParams();
  const storeSlug = params?.storeSlug as string;
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [search, setSearch] = useState('');

  // Field values to update
  const [updateDelivery, setUpdateDelivery] = useState<boolean | null>(null);
  const [fee, setFee] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('');
  const [minimumOrder, setMinimumOrder] = useState('');
  const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState('');
  const [loading, setLoading] = useState(false);

  // Filtered list of neighborhoods to select
  const filtered = neighborhoods.filter((n) =>
    n.officialName.toLowerCase().includes(search.toLowerCase())
  );

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    setSelectedIds(filtered.map((n) => n.id));
  };

  const selectNone = () => {
    setSelectedIds([]);
  };

  const handleSave = async () => {
    if (selectedIds.length === 0) {
      alert('Selecione pelo menos um bairro.');
      return;
    }

    const payload: any = {};
    if (updateDelivery !== null) payload.deliveryEnabled = updateDelivery;
    if (fee !== '') payload.fee = Number(fee);
    if (deliveryTime !== '') payload.deliveryTime = deliveryTime;
    if (minimumOrder !== '') payload.minimumOrder = minimumOrder ? Number(minimumOrder) : null;
    if (freeDeliveryThreshold !== '') payload.freeDeliveryThreshold = freeDeliveryThreshold ? Number(freeDeliveryThreshold) : null;

    if (Object.keys(payload).length === 0) {
      alert('Preencha pelo menos um campo para atualizar.');
      return;
    }

    setLoading(true);
    try {
      const result = await updateMultipleNeighborhoods(selectedIds, payload, storeSlug);
      if (result.success) {
        onSaveSuccess(selectedIds, payload);
        onClose();
      }
    } catch (err) {
      console.error(err);
      alert('Erro ao realizar atualização em massa.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-955/80 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-slate-900 rounded-2xl border border-slate-805 shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-950 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-[#1E3A5F]/20 border border-[#2F7DBB]/10 p-2.5 rounded-xl text-[#5FC9C8]">
              <Settings className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">
                Editar em Massa (Fortaleza)
              </h3>
              <span className="text-xs text-slate-400">
                Configure múltiplos bairros de uma só vez
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-950 hover:text-white transition-colors cursor-pointer border border-transparent hover:border-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row min-h-0">
          {/* Left Panel: Neighborhood Selection */}
          <div className="w-full md:w-1/2 p-6 border-r border-slate-950 flex flex-col min-h-0">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-3">
              1. Selecionar Bairros ({selectedIds.length} selecionados)
            </span>

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Pesquisar bairro..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-950 bg-slate-950/40 text-white focus:outline-none focus:ring-2 focus:ring-[#5FC9C8] focus:border-transparent transition-all mb-3 text-sm"
            />

            <div className="flex items-center space-x-2 mb-3">
              <button
                onClick={selectAll}
                className="text-[10px] font-bold px-2.5 py-1.5 rounded bg-slate-950 border border-slate-850 text-slate-400 hover:text-white hover:bg-slate-950/80 transition-colors cursor-pointer uppercase tracking-wider"
              >
                Selecionar Todos Filtrados
              </button>
              <button
                onClick={selectNone}
                className="text-[10px] font-bold px-2.5 py-1.5 rounded bg-slate-950 border border-slate-850 text-slate-400 hover:text-white hover:bg-slate-950/80 transition-colors cursor-pointer uppercase tracking-wider"
              >
                Limpar Seleção
              </button>
            </div>

            <div className="flex-1 overflow-y-auto border border-slate-950 rounded-xl p-2 space-y-1 bg-slate-950/20">
              {filtered.map((n) => {
                const isSelected = selectedIds.includes(n.id);
                return (
                  <button
                    key={n.id}
                    onClick={() => toggleSelect(n.id)}
                    className={`w-full flex items-center justify-between p-2 rounded-xl transition-all text-left text-sm ${isSelected
                        ? 'bg-[#5FC9C8]/10 text-[#5FC9C8] font-semibold'
                        : 'hover:bg-slate-950/30 text-slate-350'
                      }`}
                  >
                    <span>{n.officialName}</span>
                    {isSelected ? (
                      <span className="bg-[#5FC9C8] text-slate-950 rounded-full p-0.5">
                        <Check className="h-3.5 w-3.5" />
                      </span>
                    ) : (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${n.deliveryEnabled
                          ? 'bg-[#5FC9C8]/10 text-[#5FC9C8] border-[#5FC9C8]/20'
                          : 'bg-rose-955 text-rose-455 border-rose-900/30'
                        }`}>
                        {n.deliveryEnabled ? 'Ativo' : 'Inativo'}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Panel: Fields Configuration */}
          <div className="w-full md:w-1/2 p-6 flex flex-col justify-between overflow-y-auto border-t md:border-t-0 border-slate-950">
            <div className="space-y-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                2. Configurar Atualização
              </span>

              {/* Delivery Status Option */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 block">
                  Status de Entrega
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setUpdateDelivery(true)}
                    className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-center border ${updateDelivery === true
                        ? 'bg-[#2F7DBB] text-white border-transparent shadow shadow-[#2F7DBB]/20'
                        : 'bg-slate-955/40 text-slate-400 border-slate-950 hover:bg-slate-950/70'
                      }`}
                  >
                    Habilitar
                  </button>
                  <button
                    onClick={() => setUpdateDelivery(false)}
                    className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-center border ${updateDelivery === false
                        ? 'bg-rose-500 text-white border-transparent shadow shadow-rose-500/20'
                        : 'bg-slate-955/40 text-slate-400 border-slate-950 hover:bg-slate-950/70'
                      }`}
                  >
                    Desabilitar
                  </button>
                  <button
                    onClick={() => setUpdateDelivery(null)}
                    className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-center border ${updateDelivery === null
                        ? 'bg-slate-950 text-white border-slate-900'
                        : 'bg-slate-955/40 text-slate-400 border-slate-950 hover:bg-slate-950/70'
                      }`}
                  >
                    Manter Atual
                  </button>
                </div>
              </div>

              {/* Delivery Fee */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 block">
                  Taxa de Entrega (R$ - Deixe em branco para não alterar)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={fee}
                  onChange={(e) => setFee(e.target.value)}
                  placeholder="Ex: 10.00"
                  className="w-full px-3 py-2 rounded-xl border border-slate-950 bg-slate-950/40 text-white focus:outline-none focus:ring-2 focus:ring-[#5FC9C8] focus:border-transparent transition-all text-sm"
                />
              </div>

              {/* Delivery Time */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 block">
                  Prazo de Entrega (Deixe em branco para não alterar)
                </label>
                <input
                  type="text"
                  value={deliveryTime}
                  onChange={(e) => setDeliveryTime(e.target.value)}
                  placeholder="Ex: 24h, 2 horas"
                  className="w-full px-3 py-2 rounded-xl border border-slate-955 bg-slate-955/40 text-white focus:outline-none focus:ring-2 focus:ring-[#5FC9C8] focus:border-transparent transition-all text-sm"
                />
              </div>

              {/* Minimum Order */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 block">
                  Pedido Mínimo (R$ - Deixe em branco para não alterar)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={minimumOrder}
                  onChange={(e) => setMinimumOrder(e.target.value)}
                  placeholder="Ex: 30.00"
                  className="w-full px-3 py-2 rounded-xl border border-slate-950 bg-slate-950/40 text-white focus:outline-none focus:ring-2 focus:ring-[#5FC9C8] focus:border-transparent transition-all text-sm"
                />
              </div>

              {/* Free Delivery Threshold */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 block">
                  Frete Grátis Acima de (R$ - Deixe em branco para não alterar)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={freeDeliveryThreshold}
                  onChange={(e) => setFreeDeliveryThreshold(e.target.value)}
                  placeholder="Ex: 80.00"
                  className="w-full px-3 py-2 rounded-xl border border-slate-950 bg-slate-950/40 text-white focus:outline-none focus:ring-2 focus:ring-[#5FC9C8] focus:border-transparent transition-all text-sm"
                />
              </div>
            </div>

            <div className="pt-6 border-t border-slate-950 mt-6 flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold border border-slate-805 text-slate-350 hover:bg-slate-850 hover:text-white transition-all cursor-pointer text-center"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={loading || selectedIds.length === 0}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-[#1E3A5F] to-[#2F7DBB] hover:from-[#1A3354] hover:to-[#276AA3] text-white transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center space-x-2 shadow shadow-[#1E3A5F]/15 border border-[#2F7DBB]/30"
              >
                <Save className="h-4.5 w-4.5 text-white" />
                <span>{loading ? 'Atualizando...' : 'Atualizar Selecionados'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
