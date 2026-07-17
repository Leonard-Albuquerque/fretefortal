'use client';

import { useState, useEffect } from 'react';
import { updateNeighborhood } from '@/app/admin/neighborhoods/actions';
import { X, Save, ShieldAlert, CheckCircle, ArrowRight } from 'lucide-react';
import { useParams } from 'next/navigation';

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

interface NeighborhoodSidebarProps {
  neighborhood: Neighborhood | null;
  onClose: () => void;
  onSaveSuccess: (updatedNeighborhood: Neighborhood) => void;
  onSaveAndNext?: (name: string) => void;
  onDirtyChange?: (isDirty: boolean) => void;
}

export default function NeighborhoodSidebar({
  neighborhood,
  onClose,
  onSaveSuccess,
  onSaveAndNext,
  onDirtyChange
}: NeighborhoodSidebarProps) {
  const params = useParams();
  const storeSlug = params?.storeSlug as string;
  const [deliveryEnabled, setDeliveryEnabled] = useState(false);
  const [fee, setFee] = useState('0');
  const [deliveryTime, setDeliveryTime] = useState('24h');
  const [minimumOrder, setMinimumOrder] = useState('');
  const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // Sync state with selected neighborhood changes
  useEffect(() => {
    if (neighborhood) {
      setDeliveryEnabled(neighborhood.deliveryEnabled);
      setFee(String(neighborhood.fee));
      setDeliveryTime(neighborhood.deliveryTime || '24h');
      setMinimumOrder(neighborhood.minimumOrder ? String(neighborhood.minimumOrder) : '');
      setFreeDeliveryThreshold(neighborhood.freeDeliveryThreshold ? String(neighborhood.freeDeliveryThreshold) : '');
      setNotes(neighborhood.notes || '');
      setSuccess(false);
      setIsDirty(false);
    }
  }, [neighborhood]);

  // Compute dirty status
  useEffect(() => {
    if (neighborhood) {
      const currentFee = Number(fee) || 0;
      const originalFee = Number(neighborhood.fee) || 0;
      const currentMinOrder = minimumOrder ? Number(minimumOrder) : null;
      const originalMinOrder = neighborhood.minimumOrder ? Number(neighborhood.minimumOrder) : null;
      const currentFreeThreshold = freeDeliveryThreshold ? Number(freeDeliveryThreshold) : null;
      const originalFreeThreshold = neighborhood.freeDeliveryThreshold ? Number(neighborhood.freeDeliveryThreshold) : null;
      const currentNotes = notes || null;
      const originalNotes = neighborhood.notes || null;
      const currentDeliveryTime = deliveryTime || '24h';
      const originalDeliveryTime = neighborhood.deliveryTime || '24h';

      const dirty = (
        deliveryEnabled !== neighborhood.deliveryEnabled ||
        currentFee !== originalFee ||
        currentDeliveryTime !== originalDeliveryTime ||
        currentMinOrder !== originalMinOrder ||
        currentFreeThreshold !== originalFreeThreshold ||
        currentNotes !== originalNotes
      );
      
      setIsDirty(dirty);
      if (onDirtyChange) {
        onDirtyChange(dirty);
      }
    }
  }, [deliveryEnabled, fee, deliveryTime, minimumOrder, freeDeliveryThreshold, notes, neighborhood]);

  // Keyboard Shortcuts: Close on Esc
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!neighborhood) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    try {
      const payload = {
        deliveryEnabled,
        fee: Number(fee) || 0,
        deliveryTime: deliveryTime || '24h',
        minimumOrder: minimumOrder ? Number(minimumOrder) : null,
        freeDeliveryThreshold: freeDeliveryThreshold ? Number(freeDeliveryThreshold) : null,
        notes: notes || null,
      };

      const result = await updateNeighborhood(neighborhood.id, payload, storeSlug);
      if (result.success) {
        setSuccess(true);
        onSaveSuccess({
          ...neighborhood,
          ...payload,
          fee: Number(fee) || 0,
        });
        setTimeout(() => setSuccess(false), 2000);
      }
    } catch (err) {
      console.error(err);
      alert('Erro ao atualizar configurações do bairro.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAndNextClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isDirty) {
      if (onSaveAndNext) {
        onSaveAndNext(neighborhood.name);
      }
      return;
    }

    setLoading(true);
    setSuccess(false);

    try {
      const payload = {
        deliveryEnabled,
        fee: Number(fee) || 0,
        deliveryTime: deliveryTime || '24h',
        minimumOrder: minimumOrder ? Number(minimumOrder) : null,
        freeDeliveryThreshold: freeDeliveryThreshold ? Number(freeDeliveryThreshold) : null,
        notes: notes || null,
      };

      const result = await updateNeighborhood(neighborhood.id, payload, storeSlug);
      if (result.success) {
        setSuccess(true);
        onSaveSuccess({
          ...neighborhood,
          ...payload,
          fee: Number(fee) || 0,
        });
        
        setTimeout(() => {
          setSuccess(false);
          if (onSaveAndNext) {
            onSaveAndNext(neighborhood.name);
          }
        }, 300);
      }
    } catch (err) {
      console.error(err);
      alert('Erro ao atualizar configurações do bairro.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-96 bg-slate-950 border-l border-slate-900 shadow-2xl h-full flex flex-col z-20 animate-fadeIn">
      {/* Sidebar Header */}
      <div className="p-6 border-b border-slate-900 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-lg text-white tracking-tight">
            {neighborhood.officialName}
          </h3>
          <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Configuração de Entrega</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-900 hover:text-white transition-colors cursor-pointer border border-transparent hover:border-slate-800"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
        {success && (
          <div className="bg-violet-955 text-violet-400 border border-violet-900/30 p-3.5 rounded-xl flex items-center space-x-2.5 text-xs font-semibold animate-fadeIn">
            <CheckCircle className="h-4.5 w-4.5 flex-shrink-0" />
            <span>Configurações salvas com sucesso!</span>
          </div>
        )}

        {/* Status Toggle Switch */}
        <div className="flex items-center justify-between p-4 border border-slate-900 rounded-xl bg-slate-950/40">
          <div className="space-y-0.5">
            <span className="text-sm font-bold text-slate-200 block">
              Entregar neste bairro
            </span>
            <span className="text-[11px] text-slate-500">
              {deliveryEnabled ? 'Entrega Habilitada' : 'Entrega Desativada'}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setDeliveryEnabled(!deliveryEnabled)}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              deliveryEnabled ? 'bg-violet-600' : 'bg-slate-800'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                deliveryEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {deliveryEnabled && (
          <div className="space-y-5 animate-fadeIn">
            {/* Delivery Fee Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 block">
                Valor do Frete (R$)
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <span className="text-slate-550 text-xs font-semibold">R$</span>
                </div>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={fee}
                  onChange={(e) => setFee(e.target.value)}
                  className="block w-full rounded-xl border border-slate-900 bg-slate-950/40 py-2 pl-8 pr-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                  placeholder="0,00"
                />
              </div>
            </div>

            {/* Delivery Time Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 block">
                Prazo de Entrega
              </label>
              <input
                type="text"
                required
                value={deliveryTime}
                onChange={(e) => setDeliveryTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-900 bg-slate-950/40 text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                placeholder="Ex: 24h, 2 horas, 2 dias"
              />
            </div>

            {/* Minimum Order Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 block">
                Pedido Mínimo (Opcional)
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <span className="text-slate-550 text-xs font-semibold">R$</span>
                </div>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={minimumOrder}
                  onChange={(e) => setMinimumOrder(e.target.value)}
                  className="block w-full rounded-xl border border-slate-900 bg-slate-950/40 py-2 pl-8 pr-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                  placeholder="Sem valor mínimo"
                />
              </div>
            </div>

            {/* Free Delivery Threshold Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 block">
                Frete Grátis Acima de (Opcional)
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <span className="text-slate-550 text-xs font-semibold">R$</span>
                </div>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={freeDeliveryThreshold}
                  onChange={(e) => setFreeDeliveryThreshold(e.target.value)}
                  className="block w-full rounded-xl border border-slate-900 bg-slate-950/40 py-2 pl-8 pr-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                  placeholder="Sem frete grátis"
                />
              </div>
            </div>

            {/* Notes Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 block">
                Observações (Opcional)
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-900 bg-slate-950/40 text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all resize-none"
                placeholder="Ex: Entregamos somente no período da noite neste bairro."
              />
            </div>
          </div>
        )}

        {!deliveryEnabled && (
          <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-900 flex items-start space-x-3 text-slate-400">
            <ShieldAlert className="h-4.5 w-4.5 flex-shrink-0 mt-0.5" />
            <span className="text-xs leading-relaxed text-slate-500">
              A entrega está desativada para este bairro. Clientes que buscarem por CEPs nesta localidade receberão a opção de retirada física na loja (se ativada).
            </span>
          </div>
        )}
      </form>

      {/* Footer Sidebar Actions */}
      <div className="p-5 border-t border-slate-900 bg-slate-950/20 flex flex-col space-y-2.5">
        <div className="flex items-center justify-between px-1">
          {isDirty ? (
            <span className="text-[10px] text-violet-400 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse"></span>
              Não salvo
            </span>
          ) : (
            <span className="text-[10px] text-slate-500 font-medium">Sincronizado</span>
          )}
        </div>
        
        <div className="flex gap-2">
          {/* Secondary Close/Cancel Button */}
          <button
            type="button"
            onClick={onClose}
            className="flex-1 bg-slate-900 text-slate-350 border border-slate-800 hover:bg-slate-850 hover:text-white font-bold px-3 py-2.5 rounded-xl transition-all text-xs cursor-pointer active:scale-95 shadow-sm"
          >
            Fechar
          </button>

          {/* Main Save Button */}
          <button
            type="button"
            disabled={loading}
            onClick={handleSubmit}
            className="flex-1 bg-gradient-to-r from-violet-600 to-indigo-650 hover:from-violet-500 hover:to-indigo-500 text-white font-bold px-3 py-2.5 rounded-xl transition-all disabled:opacity-50 cursor-pointer text-xs shadow-sm flex items-center justify-center space-x-1.5 active:scale-95 border border-violet-755/30"
          >
            <Save className="h-4 w-4" />
            <span>{loading ? 'Salvando...' : 'Salvar'}</span>
          </button>
          
          {/* Save & Next Button */}
          <button
            type="button"
            disabled={loading}
            onClick={handleSaveAndNextClick}
            className="flex-1 bg-slate-900 text-slate-350 border border-slate-800 hover:bg-slate-850 hover:text-white font-bold px-3 py-2.5 rounded-xl transition-all disabled:opacity-50 cursor-pointer text-xs shadow-sm flex items-center justify-center space-x-1.5 active:scale-95"
          >
            <ArrowRight className="h-4 w-4" />
            <span>Próximo</span>
          </button>
        </div>
      </div>
    </div>
  );
}
