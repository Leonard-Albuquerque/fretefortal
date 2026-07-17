'use client';

import { useState } from 'react';
import { updateStoreSettings } from '@/app/admin/settings/actions';
import { Save, CheckCircle } from 'lucide-react';
import { useParams } from 'next/navigation';

interface Store {
  id: string;
  name: string;
  whatsapp: string;
  address: string;
  operatingHours: string;
  pickupEnabled: boolean;
}

export default function SettingsForm({ initialStore }: { initialStore: Store }) {
  const params = useParams();
  const storeSlug = params?.storeSlug as string;
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
      const result = await updateStoreSettings(formData, storeSlug);
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
    <form onSubmit={handleSubmit} className="space-y-6 w-full max-w-2xl bg-slate-900/30 border border-slate-900 rounded-2xl p-8 shadow-xl animate-fadeIn">
      {message && (
        <div
          className={`p-4 rounded-xl flex items-center space-x-3 text-sm font-semibold animate-fadeIn ${
            message.type === 'success'
              ? 'bg-violet-955 text-violet-400 border border-violet-900/30'
              : 'bg-rose-955 text-rose-450 border border-rose-900/30'
          }`}
        >
          {message.type === 'success' && <CheckCircle className="h-5 w-5 text-violet-400" />}
          <span>{message.text}</span>
        </div>
      )}

      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
          Nome da Loja
        </label>
        <input
          type="text"
          required
          value={store.name}
          onChange={(e) => setStore({ ...store, name: e.target.value })}
          className="w-full px-4 py-2.5 rounded-xl border border-slate-900 bg-slate-950/40 text-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all text-sm"
          placeholder="Ex: Pizzaria Bella Fortaleza"
        />
      </div>

      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
          WhatsApp da Loja (com DDD)
        </label>
        <input
          type="text"
          required
          value={store.whatsapp}
          onChange={(e) => setStore({ ...store, whatsapp: e.target.value })}
          className="w-full px-4 py-2.5 rounded-xl border border-slate-900 bg-slate-950/40 text-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all text-sm"
          placeholder="Ex: 85999999999"
        />
        <p className="text-xs text-slate-500 leading-normal">
          Apenas números. Os links para envio de mensagens serão criados automaticamente usando este número.
        </p>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
          Endereço Físico (para Retiradas)
        </label>
        <textarea
          required
          rows={3}
          value={store.address}
          onChange={(e) => setStore({ ...store, address: e.target.value })}
          className="w-full px-4 py-2.5 rounded-xl border border-slate-900 bg-slate-950/40 text-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all text-sm resize-none"
          placeholder="Ex: Av. Beira Mar, 1000 - Meireles, Fortaleza - CE"
        />
      </div>

      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
          Horário de Funcionamento
        </label>
        <input
          type="text"
          required
          value={store.operatingHours}
          onChange={(e) => setStore({ ...store, operatingHours: e.target.value })}
          className="w-full px-4 py-2.5 rounded-xl border border-slate-900 bg-slate-950/40 text-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all text-sm"
          placeholder="Ex: Segunda a Sábado: 18:00 às 23:00"
        />
      </div>

      <div className="flex items-center justify-between p-4 border border-slate-900 rounded-xl bg-slate-950/40">
        <div className="space-y-0.5">
          <label className="text-sm font-bold text-white block">
            Habilitar Retirada no Local
          </label>
          <span className="text-xs text-slate-550 leading-normal block max-w-md">
            Permite que o cliente veja a opção de retirar o pedido caso a entrega não esteja disponível no bairro dele.
          </span>
        </div>
        <button
          type="button"
          onClick={() => setStore({ ...store, pickupEnabled: !store.pickupEnabled })}
          className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
            store.pickupEnabled ? 'bg-violet-650' : 'bg-slate-800'
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
              store.pickupEnabled ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      <div className="pt-4 border-t border-slate-900 flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="bg-gradient-to-r from-violet-600 to-indigo-650 hover:from-violet-500 hover:to-indigo-500 text-white font-bold px-6 py-3 rounded-xl flex items-center space-x-2 transition-colors disabled:opacity-50 cursor-pointer shadow shadow-violet-600/10 active:scale-95 border border-violet-755/30"
        >
          <Save className="h-5 w-5" />
          <span>{loading ? 'Salvando...' : 'Salvar Configurações'}</span>
        </button>
      </div>
    </form>
  );
}
