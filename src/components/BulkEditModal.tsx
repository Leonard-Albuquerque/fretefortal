'use client';

import { useState } from 'react';
import { updateMultipleNeighborhoods } from '@/app/admin/neighborhoods/actions';
import { X, Check, Save, Settings } from 'lucide-react';

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
      const result = await updateMultipleNeighborhoods(selectedIds, payload);
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
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-zoomIn">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-emerald-100 dark:bg-emerald-950/30 p-2 rounded-lg text-emerald-600 dark:text-emerald-400">
              <Settings className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-850 dark:text-white">
                Editar em Massa (Fortaleza)
              </h3>
              <span className="text-xs text-slate-400">
                Configure múltiplos bairros de uma só vez
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-850 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row min-h-0">
          {/* Left Panel: Neighborhood Selection */}
          <div className="w-full md:w-1/2 p-6 border-r border-slate-200 dark:border-slate-800 flex flex-col min-h-0">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-3">
              1. Selecionar Bairros ({selectedIds.length} selecionados)
            </span>
            
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Pesquisar bairro..."
              className="w-full px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all mb-3 text-sm"
            />

            <div className="flex items-center space-x-2 mb-3">
              <button
                onClick={selectAll}
                className="text-xs font-semibold px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-350 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                Selecionar Todos Filtrados
              </button>
              <button
                onClick={selectNone}
                className="text-xs font-semibold px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-350 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                Limpar Seleção
              </button>
            </div>

            <div className="flex-1 overflow-y-auto border border-slate-100 dark:border-slate-850 rounded-lg p-2 space-y-1">
              {filtered.map((n) => {
                const isSelected = selectedIds.includes(n.id);
                return (
                  <button
                    key={n.id}
                    onClick={() => toggleSelect(n.id)}
                    className={`w-full flex items-center justify-between p-2 rounded-md transition-colors text-left text-sm ${
                      isSelected
                        ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-400 font-medium'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span>{n.officialName}</span>
                    {isSelected ? (
                      <span className="bg-emerald-500 text-slate-900 rounded-full p-0.5">
                        <Check className="h-3.5 w-3.5" />
                      </span>
                    ) : (
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        n.deliveryEnabled 
                          ? 'bg-emerald-100/50 text-emerald-700 dark:bg-emerald-900/10 dark:text-emerald-400' 
                          : 'bg-rose-100/50 text-rose-700 dark:bg-rose-900/10 dark:text-rose-400'
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
          <div className="w-full md:w-1/2 p-6 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                2. Configurar Atualização
              </span>

              {/* Delivery Status Option */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-500 block">
                  Status de Entrega
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setUpdateDelivery(true)}
                    className={`py-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer text-center ${
                      updateDelivery === true
                        ? 'bg-emerald-500 text-slate-900 border-transparent shadow'
                        : 'bg-slate-50 dark:bg-slate-950/30 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    Habilitar
                  </button>
                  <button
                    onClick={() => setUpdateDelivery(false)}
                    className={`py-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer text-center ${
                      updateDelivery === false
                        ? 'bg-rose-500 text-slate-900 border-transparent shadow'
                        : 'bg-slate-50 dark:bg-slate-950/30 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    Desabilitar
                  </button>
                  <button
                    onClick={() => setUpdateDelivery(null)}
                    className={`py-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer text-center ${
                      updateDelivery === null
                        ? 'bg-slate-500 text-white border-transparent shadow'
                        : 'bg-slate-50 dark:bg-slate-950/30 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    Manter Atual
                  </button>
                </div>
              </div>

              {/* Delivery Fee */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 block">
                  Taxa de Entrega (R$ - Deixe em branco para não alterar)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={fee}
                  onChange={(e) => setFee(e.target.value)}
                  placeholder="Ex: 10.00"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-sm"
                />
              </div>

              {/* Delivery Time */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 block">
                  Prazo de Entrega (Deixe em branco para não alterar)
                </label>
                <input
                  type="text"
                  value={deliveryTime}
                  onChange={(e) => setDeliveryTime(e.target.value)}
                  placeholder="Ex: 24h, 2 horas"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-sm"
                />
              </div>

              {/* Minimum Order */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 block">
                  Pedido Mínimo (R$ - Deixe em branco para não alterar)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={minimumOrder}
                  onChange={(e) => setMinimumOrder(e.target.value)}
                  placeholder="Ex: 30.00"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-sm"
                />
              </div>

              {/* Free Delivery Threshold */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 block">
                  Frete Grátis Acima de (R$ - Deixe em branco para não alterar)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={freeDeliveryThreshold}
                  onChange={(e) => setFreeDeliveryThreshold(e.target.value)}
                  placeholder="Ex: 80.00"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-sm"
                />
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 dark:border-slate-850 mt-6 flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-lg text-sm font-semibold border border-slate-200 dark:border-slate-850 text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer text-center"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={loading || selectedIds.length === 0}
                className="flex-1 py-2.5 rounded-lg text-sm font-bold bg-emerald-500 text-slate-900 hover:bg-emerald-400 transition-colors disabled:opacity-50 cursor-pointer flex items-center justify-center space-x-2"
              >
                <Save className="h-4.5 w-4.5" />
                <span>{loading ? 'Atualizando...' : 'Atualizar Selecionados'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
