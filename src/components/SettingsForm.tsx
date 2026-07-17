'use client';

import { useState } from 'react';
import { updateStoreSettings } from '@/app/admin/settings/actions';
import { Save, CheckCircle } from 'lucide-react';

interface Store {
  id: string;
  name: string;
  whatsapp: string;
  address: string;
  operatingHours: string;
  pickupEnabled: boolean;
}

export default function SettingsForm({ initialStore }: { initialStore: Store }) {
  const [store, setStore] = useState(initialStore);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const formData = new FormData();
    formData.append('id', store.id);
    formData.append('name', store.name);
    formData.append('whatsapp', store.whatsapp);
    formData.append('address', store.address);
    formData.append('operatingHours', store.operatingHours);
    formData.append('pickupEnabled', String(store.pickupEnabled));

    try {
      const result = await updateStoreSettings(formData);
      if (result.success) {
        setMessage({ type: 'success', text: 'Configurações salvas com sucesso!' });
        setTimeout(() => setMessage(null), 4000);
      }
    } catch (error: any) {
      console.error(error);
      setMessage({ type: 'error', text: 'Ocorreu um erro ao salvar as configurações.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 shadow-sm">
      {message && (
        <div
          className={`p-4 rounded-lg flex items-center space-x-3 text-sm font-medium ${
            message.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30'
              : 'bg-rose-50 dark:bg-rose-950/20 text-rose-800 dark:text-rose-400 border border-rose-100 dark:border-rose-900/30'
          }`}
        >
          {message.type === 'success' && <CheckCircle className="h-5 w-5" />}
          <span>{message.text}</span>
        </div>
      )}

      <div className="space-y-2">
        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block">
          Nome da Loja
        </label>
        <input
          type="text"
          required
          value={store.name}
          onChange={(e) => setStore({ ...store, name: e.target.value })}
          className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-950/40 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
          placeholder="Ex: Pizzaria Bella Fortaleza"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block">
          WhatsApp da Loja (com DDD)
        </label>
        <input
          type="text"
          required
          value={store.whatsapp}
          onChange={(e) => setStore({ ...store, whatsapp: e.target.value })}
          className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-950/40 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
          placeholder="Ex: 85999999999"
        />
        <p className="text-xs text-slate-400">
          Apenas números, incluindo o 55 se desejar. Os links para envio de mensagens serão criados automaticamente usando este número.
        </p>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block">
          Endereço Físico (para Retiradas)
        </label>
        <textarea
          required
          rows={3}
          value={store.address}
          onChange={(e) => setStore({ ...store, address: e.target.value })}
          className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-950/40 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all resize-none"
          placeholder="Ex: Av. Beira Mar, 1000 - Meireles, Fortaleza - CE"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block">
          Horário de Funcionamento
        </label>
        <input
          type="text"
          required
          value={store.operatingHours}
          onChange={(e) => setStore({ ...store, operatingHours: e.target.value })}
          className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-950/40 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
          placeholder="Ex: Segunda a Sábado: 18:00 às 23:00"
        />
      </div>

      <div className="flex items-center justify-between p-4 border border-slate-100 dark:border-slate-800 rounded-lg bg-slate-50/50 dark:bg-slate-950/20">
        <div className="space-y-0.5">
          <label className="text-sm font-bold text-slate-850 dark:text-slate-200 block">
            Habilitar Retirada no Local
          </label>
          <span className="text-xs text-slate-400">
            Permite que o cliente veja a opção de retirar o pedido caso a entrega não esteja disponível no bairro dele.
          </span>
        </div>
        <button
          type="button"
          onClick={() => setStore({ ...store, pickupEnabled: !store.pickupEnabled })}
          className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
            store.pickupEnabled ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
              store.pickupEnabled ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      <div className="pt-4 border-t border-slate-100 dark:border-slate-850 flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="bg-emerald-500 text-slate-900 font-bold px-6 py-3 rounded-lg flex items-center space-x-2 hover:bg-emerald-400 transition-colors disabled:opacity-50 cursor-pointer"
        >
          <Save className="h-5 w-5" />
          <span>{loading ? 'Salvando...' : 'Salvar Configurações'}</span>
        </button>
      </div>
    </form>
  );
}
