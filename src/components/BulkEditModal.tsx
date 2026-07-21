'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { updateMultipleNeighborhoods } from '@/app/admin/neighborhoods/actions';
import { X, Check, Save, Settings, ArrowRight, ArrowLeft } from 'lucide-react';
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
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

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

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl border border-[#F1ECE6] shadow-2xl w-full max-w-xl max-h-[85vh] flex flex-col overflow-hidden text-slate-800 transition-all">
        {/* Header */}
        <div className="p-5 border-b border-[#F1ECE6] flex items-center justify-between bg-white">
          <div className="flex items-center space-x-3">
            <div className="bg-[#F0FDFA] border border-[#CCFBF1] p-2.5 rounded-xl text-[#0D9488]">
              <Settings className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 leading-snug">
                Editar em Massa
              </h3>
              <div className="flex items-center space-x-2 mt-1">
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors ${step === 1
                    ? 'bg-[#0D9488] text-white'
                    : 'bg-slate-100 text-slate-500'
                    }`}
                >
                  1. Bairros ({selectedIds.length})
                </span>
                <span className="text-slate-300 text-xs">•</span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors ${step === 2
                    ? 'bg-[#0D9488] text-white'
                    : 'bg-slate-100 text-slate-500'
                    }`}
                >
                  2. Configuração
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer border border-transparent hover:border-slate-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Step 1 */}
        {step === 1 && (
          <div className="flex-1 p-5 flex flex-col min-h-0 overflow-hidden bg-white">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                Selecione os bairros
              </span>
              <span className="text-xs font-extrabold text-[#0D9488] bg-[#F0FDFA] border border-[#CCFBF1] px-2.5 py-0.5 rounded-full">
                {selectedIds.length} selecionado{selectedIds.length === 1 ? '' : 's'}
              </span>
            </div>

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Pesquisar bairro..."
              className="w-full px-3.5 py-2 rounded-xl border border-[#EAE4DC] bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0D9488] focus:border-transparent transition-all mb-3 text-sm font-medium"
            />

            <div className="flex items-center space-x-2 mb-3">
              <button
                type="button"
                onClick={selectAll}
                className="text-[10px] font-bold px-2.5 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition-colors cursor-pointer uppercase tracking-wider"
              >
                Selecionar Todos ({filtered.length})
              </button>
              <button
                type="button"
                onClick={selectNone}
                className="text-[10px] font-bold px-2.5 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition-colors cursor-pointer uppercase tracking-wider"
              >
                Limpar Seleção
              </button>
            </div>

            <div className="flex-1 overflow-y-auto border border-[#F1ECE6] rounded-xl p-2 space-y-1 bg-[#FFFDFB] max-h-[360px]">
              {filtered.map((n) => {
                const isSelected = selectedIds.includes(n.id);
                return (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => toggleSelect(n.id)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-all text-left text-sm cursor-pointer ${isSelected
                      ? 'bg-[#F0FDFA] text-[#0D9488] font-bold border border-[#CCFBF1]'
                      : 'hover:bg-slate-100 text-slate-700 border border-transparent'
                      }`}
                  >
                    <span>{n.officialName}</span>
                    {isSelected ? (
                      <span className="bg-[#0D9488] text-white rounded-full p-0.5 shadow-xs">
                        <Check className="h-3.5 w-3.5" />
                      </span>
                    ) : (
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${n.deliveryEnabled
                          ? 'bg-[#F0FDFA] text-[#0D9488] border-[#CCFBF1]'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}
                      >
                        {n.deliveryEnabled ? 'Ativo' : 'Inativo'}
                      </span>
                    )}
                  </button>
                );
              })}
              {filtered.length === 0 && (
                <div className="py-8 text-center text-xs text-slate-400 italic">
                  Nenhum bairro encontrado.
                </div>
              )}
            </div>

            {/* Step 1 Footer */}
            <div className="pt-4 border-t border-[#F1ECE6] mt-4 flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold border border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900 transition-all cursor-pointer text-center"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  if (selectedIds.length === 0) {
                    alert('Selecione pelo menos um bairro para avançar.');
                    return;
                  }
                  setStep(2);
                }}
                disabled={selectedIds.length === 0}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-[#2E5B9A] via-[#59C8CF] to-[#FFD7B5] text-white transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center space-x-2"
              >
                <span>Avançar</span>
                <ArrowRight className="h-4 w-4 text-white" />
              </button>
            </div>
          </div>
        )}

        {/* Content Step 2 */}
        {step === 2 && (
          <div className="flex-1 p-5 flex flex-col min-h-0 overflow-y-auto bg-white">
            <div className="bg-[#F0FDFA] border border-[#CCFBF1] rounded-xl p-3 mb-4 flex items-center justify-between">
              <span className="text-xs text-slate-600 font-medium">
                Aplicando alterações em:
              </span>
              <span className="text-xs font-bold text-[#0D9488]">
                {selectedIds.length} bairro{selectedIds.length === 1 ? '' : 's'} selecionado{selectedIds.length === 1 ? '' : 's'}
              </span>
            </div>

            <div className="space-y-4 flex-1">
              {/* Delivery Status Option */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-600 block">
                  Status de Entrega
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setUpdateDelivery(true)}
                    className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-center border ${updateDelivery === true
                      ? 'bg-[#0D9488] text-white border-transparent shadow-xs'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                  >
                    Habilitar
                  </button>
                  <button
                    type="button"
                    onClick={() => setUpdateDelivery(false)}
                    className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-center border ${updateDelivery === false
                      ? 'bg-rose-600 text-white border-transparent shadow-xs'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                  >
                    Desabilitar
                  </button>
                  <button
                    type="button"
                    onClick={() => setUpdateDelivery(null)}
                    className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-center border ${updateDelivery === null
                      ? 'bg-slate-800 text-white border-slate-800'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                  >
                    Manter Atual
                  </button>
                </div>
              </div>

              {/* Delivery Fee */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 block">
                  Taxa de Entrega (R$ - Deixe em branco para não alterar)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={fee}
                  onChange={(e) => setFee(e.target.value)}
                  placeholder="Ex: 10.00"
                  className="w-full px-3 py-2 rounded-xl border border-[#EAE4DC] bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0D9488] focus:border-transparent transition-all text-sm font-medium"
                />
              </div>

              {/* Delivery Time */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 block">
                  Prazo de Entrega (Deixe em branco para não alterar)
                </label>
                <input
                  type="text"
                  value={deliveryTime}
                  onChange={(e) => setDeliveryTime(e.target.value)}
                  placeholder="Ex: 24h, 2 horas"
                  className="w-full px-3 py-2 rounded-xl border border-[#EAE4DC] bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0D9488] focus:border-transparent transition-all text-sm font-medium"
                />
              </div>

              {/* Minimum Order */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 block">
                  Pedido Mínimo (R$ - Deixe em branco para não alterar)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={minimumOrder}
                  onChange={(e) => setMinimumOrder(e.target.value)}
                  placeholder="Ex: 30.00"
                  className="w-full px-3 py-2 rounded-xl border border-[#EAE4DC] bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0D9488] focus:border-transparent transition-all text-sm font-medium"
                />
              </div>

              {/* Free Delivery Threshold */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 block">
                  Frete Grátis Acima de (R$ - Deixe em branco para não alterar)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={freeDeliveryThreshold}
                  onChange={(e) => setFreeDeliveryThreshold(e.target.value)}
                  placeholder="Ex: 80.00"
                  className="w-full px-3 py-2 rounded-xl border border-[#EAE4DC] bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0D9488] focus:border-transparent transition-all text-sm font-medium"
                />
              </div>
            </div>

            {/* Step 2 Footer */}
            <div className="pt-4 border-t border-[#F1ECE6] mt-4 flex space-x-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold border border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900 transition-all cursor-pointer flex items-center justify-center space-x-1.5"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Voltar</span>
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={loading || selectedIds.length === 0}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-[#2E5B9A] via-[#59C8CF] to-[#FFD7B5] text-white transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center  "
              >
                <Save className="h-5 w-5 text-white ml-4" />
                <span>{loading ? 'Atualizando...' : 'Atualizar Selecionados'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
