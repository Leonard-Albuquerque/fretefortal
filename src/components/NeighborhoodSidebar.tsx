'use client';

import { useState, useEffect } from 'react';
import { updateNeighborhood } from '@/app/admin/neighborhoods/actions';
import { X, Save, ShieldAlert, CheckCircle } from 'lucide-react';

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
}

export default function NeighborhoodSidebar({
  neighborhood,
  onClose,
  onSaveSuccess
}: NeighborhoodSidebarProps) {
  const [deliveryEnabled, setDeliveryEnabled] = useState(false);
  const [fee, setFee] = useState('0');
  const [deliveryTime, setDeliveryTime] = useState('24h');
  const [minimumOrder, setMinimumOrder] = useState('');
  const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

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
    }
  }, [neighborhood]);

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

      const result = await updateNeighborhood(neighborhood.id, payload);
      if (result.success) {
        setSuccess(true);
        onSaveSuccess({
          ...neighborhood,
          ...payload,
          fee: Number(fee) || 0,
        });
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      console.error(err);
      alert('Erro ao atualizar configurações do bairro.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-96 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-xl h-full flex flex-col z-20">
      <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-lg text-slate-800 dark:text-white">
            {neighborhood.officialName}
          </h3>
          <span className="text-xs text-slate-400">Configuração de Entrega</span>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
        {success && (
          <div className="bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30 p-3 rounded-lg flex items-center space-x-2 text-sm font-medium">
            <CheckCircle className="h-5 w-5 flex-shrink-0" />
            <span>Configurações salvas com sucesso!</span>
          </div>
        )}

        {/* Status Toggle */}
        <div className="flex items-center justify-between p-4 border border-slate-100 dark:border-slate-800 rounded-lg bg-slate-50/50 dark:bg-slate-950/20">
          <div className="space-y-0.5">
            <span className="text-sm font-bold text-slate-850 dark:text-slate-200 block">
              Entregar neste bairro
            </span>
            <span className="text-xs text-slate-400">
              {deliveryEnabled ? 'Entrega Ativa' : 'Entrega Desativada'}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setDeliveryEnabled(!deliveryEnabled)}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              deliveryEnabled ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
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
          <div className="space-y-4 animate-fadeIn">
            {/* Delivery Fee */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 block">
                Valor do Frete (R$)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={fee}
                onChange={(e) => setFee(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                placeholder="Ex: 8.00"
              />
            </div>

            {/* Delivery Time */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 block">
                Prazo de Entrega
              </label>
              <input
                type="text"
                required
                value={deliveryTime}
                onChange={(e) => setDeliveryTime(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                placeholder="Ex: 24h, 2 horas, 2 dias"
              />
            </div>

            {/* Minimum Order */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 block">
                Pedido Mínimo (R$ - Opcional)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={minimumOrder}
                onChange={(e) => setMinimumOrder(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                placeholder="Ex: 30.00"
              />
            </div>

            {/* Free Delivery Threshold */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 block">
                Frete Grátis Acima de (R$ - Opcional)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={freeDeliveryThreshold}
                onChange={(e) => setFreeDeliveryThreshold(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                placeholder="Ex: 100.00"
              />
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 block">
                Observações (Opcional)
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all resize-none text-sm"
                placeholder="Ex: Entregamos somente no período da noite neste bairro."
              />
            </div>
          </div>
        )}

        {!deliveryEnabled && (
          <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-850 flex items-start space-x-3 text-slate-400">
            <ShieldAlert className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <span className="text-xs">
              A entrega está desativada para este bairro. Clientes que buscarem por CEPs nesta localidade receberão a opção de retirada física na loja (se ativada).
            </span>
          </div>
        )}
      </form>

      <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/10 flex justify-end">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="bg-emerald-500 text-slate-900 font-bold px-5 py-2.5 rounded-lg flex items-center space-x-2 hover:bg-emerald-400 transition-colors disabled:opacity-50 cursor-pointer text-sm w-full justify-center"
        >
          <Save className="h-4.5 w-4.5" />
          <span>{loading ? 'Salvando...' : 'Salvar Alterações'}</span>
        </button>
      </div>
    </div>
  );
}
