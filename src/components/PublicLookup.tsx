'use client';

import { useState, useEffect } from 'react';
import { lookupCep, lookupAddress } from '@/app/actions';
import { Search, MapPin, Map, MessageSquare, Building, AlertTriangle, ArrowRight, Loader2 } from 'lucide-react';

interface PublicLookupProps {
  storeName: string;
  storeWhatsapp: string;
  pickupEnabled: boolean;
  storeAddress: string;
  operatingHours: string;
}

export default function PublicLookup({
  storeName,
  storeWhatsapp,
  pickupEnabled,
  storeAddress,
  operatingHours
}: PublicLookupProps) {
  const [mode, setMode] = useState<'cep' | 'address'>('cep');
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);

  const handleLookup = async (overrideValue?: string) => {
    const valueToQuery = overrideValue || inputValue;
    if (!valueToQuery || valueToQuery.trim().length === 0) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      let res;
      if (mode === 'cep') {
        res = await lookupCep(valueToQuery);
      } else {
        res = await lookupAddress(valueToQuery);
      }

      if (res.success) {
        setResult(res);
        if (res.error) {
          setError(res.error);
        }
      } else {
        setError(res.error || 'Ocorreu um erro na consulta.');
      }
    } catch (err) {
      console.error(err);
      setError('Falha de conexão com o servidor. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Auto-submit when CEP reaches 8 digits
  useEffect(() => {
    if (mode === 'cep') {
      const cleaned = inputValue.replace(/\D/g, '');
      if (cleaned.length === 8) {
        handleLookup(cleaned);
      }
    }
  }, [inputValue, mode]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleLookup();
  };

  const formatCep = (val: string) => {
    const cleaned = val.replace(/\D/g, '');
    if (cleaned.length <= 5) return cleaned;
    return `${cleaned.slice(0, 5)}-${cleaned.slice(5, 8)}`;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (mode === 'cep') {
      setInputValue(formatCep(val));
    } else {
      setInputValue(val);
    }
  };

  const switchMode = (newMode: 'cep' | 'address') => {
    setMode(newMode);
    setInputValue('');
    setError(null);
    setResult(null);
  };

  // Generate the WhatsApp Link
  const getWhatsAppLink = () => {
    if (!result) return '';
    const number = result.storeWhatsapp || storeWhatsapp;
    
    let text = `Olá, *${storeName}*! Consultei a taxa de entrega para meu endereço pelo site e gostaria de fazer um pedido.\n\n`;
    text += `📍 *Meu Endereço:*\n`;
    if (result.street) {
      text += `- Rua/Av: ${result.street}\n`;
    }
    text += `- Bairro: *${result.bairro}*\n`;
    text += `- Cidade: Fortaleza - CE\n\n`;
    
    text += `🚚 *Informações do Frete:*\n`;
    text += `- Taxa: R$ ${result.fee?.toFixed(2) || '0.00'}\n`;
    text += `- Prazo: ${result.deliveryTime || '24h'}`;

    return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="w-full max-w-lg mx-auto space-y-6">
      {/* Search Selection Tabs */}
      <div className="bg-slate-200/50 dark:bg-slate-900/60 p-1 rounded-xl flex items-center space-x-1 border border-slate-300/30 dark:border-slate-800">
        <button
          onClick={() => switchMode('cep')}
          className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            mode === 'cep'
              ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-350'
          }`}
        >
          Pesquisar por CEP
        </button>
        <button
          onClick={() => switchMode('address')}
          className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            mode === 'address'
              ? 'bg-white dark:bg-slate-850 text-slate-800 dark:text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-350'
          }`}
        >
          Não sei meu CEP
        </button>
      </div>

      {/* Main Search Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-md transition-all">
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
              {mode === 'cep' ? 'Digite seu CEP de Fortaleza' : 'Digite seu endereço em Fortaleza'}
            </label>
            <div className="relative">
              {mode === 'cep' ? (
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              ) : (
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              )}
              <input
                type="text"
                required
                value={inputValue}
                onChange={handleInputChange}
                maxLength={mode === 'cep' ? 9 : 100}
                placeholder={mode === 'cep' ? 'Ex: 60150-160' : 'Rua, Avenida, Número, etc.'}
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 text-slate-855 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all font-medium text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-500 text-slate-900 hover:bg-emerald-400 font-bold py-3 rounded-xl flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-md text-sm"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Buscando taxa...</span>
              </>
            ) : (
              <>
                <span>Consultar Taxa de Entrega</span>
                <ArrowRight className="h-4.5 w-4.5" />
              </>
            )}
          </button>
        </form>
      </div>

      {/* Error Alert */}
      {error && !result && (
        <div className="bg-rose-50 dark:bg-rose-950/20 text-rose-800 dark:text-rose-400 border border-rose-100 dark:border-rose-900/30 p-4 rounded-xl flex items-start space-x-3 text-sm animate-fadeIn">
          <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5 text-rose-500" />
          <div>
            <span className="font-semibold block">Erro na consulta</span>
            <span className="text-xs text-rose-600 dark:text-rose-400/80 mt-0.5 block">{error}</span>
          </div>
        </div>
      )}

      {/* Results Overlay Card */}
      {result && (
        <div className="animate-fadeIn">
          {result.deliveryEnabled ? (
            /* DELIVERABLE */
            <div className="bg-white dark:bg-slate-900 border-2 border-emerald-500 dark:border-emerald-500/80 rounded-2xl overflow-hidden shadow-lg">
              <div className="bg-emerald-500 dark:bg-emerald-600 p-4 flex items-center justify-between">
                <span className="font-bold text-slate-900 dark:text-white text-sm">Entregamos no seu Bairro!</span>
                <span className="bg-slate-900/10 dark:bg-white/20 text-slate-900 dark:text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  Fortaleza
                </span>
              </div>
              <div className="p-6 space-y-6">
                <div className="flex items-start space-x-4 border-b border-slate-100 dark:border-slate-800/80 pb-4">
                  <div className="bg-emerald-50 dark:bg-emerald-950/30 p-3 rounded-xl text-emerald-500">
                    <Map className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 font-semibold block uppercase">Localização Identificada</span>
                    <span className="text-lg font-bold text-slate-800 dark:text-white mt-0.5 block">
                      {result.bairro}
                    </span>
                    {result.street && (
                      <span className="text-xs text-slate-400 mt-1 block">
                        Rua: {result.street}
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-850 p-4 rounded-xl">
                    <span className="text-xs text-slate-400 font-semibold block">Taxa de Frete</span>
                    <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1 block">
                      {result.fee === 0 ? 'Grátis' : `R$ ${result.fee.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-850 p-4 rounded-xl">
                    <span className="text-xs text-slate-400 font-semibold block">Prazo de Entrega</span>
                    <span className="text-xl font-bold text-slate-850 dark:text-white mt-1 block">
                      {result.deliveryTime}
                    </span>
                  </div>
                </div>

                {/* Additional criteria */}
                {(result.minimumOrder || result.freeDeliveryThreshold || result.notes) && (
                  <div className="bg-slate-50 dark:bg-slate-950/10 border border-slate-100 dark:border-slate-850 p-4 rounded-xl text-xs space-y-1.5 text-slate-500 dark:text-slate-400">
                    {result.minimumOrder && (
                      <p>• Pedido mínimo para entrega: <strong className="text-slate-700 dark:text-slate-350">R$ {result.minimumOrder.toFixed(2)}</strong></p>
                    )}
                    {result.freeDeliveryThreshold && (
                      <p>• Frete grátis para compras acima de: <strong className="text-slate-700 dark:text-slate-350">R$ {result.freeDeliveryThreshold.toFixed(2)}</strong></p>
                    )}
                    {result.notes && (
                      <p>• Observações: <span className="italic">{result.notes}</span></p>
                    )}
                  </div>
                )}

                <a
                  href={getWhatsAppLink()}
                  target="_blank"
                  className="w-full bg-emerald-500 text-slate-900 hover:bg-emerald-400 font-bold py-3.5 rounded-xl flex items-center justify-center space-x-2 transition-all shadow-md text-sm cursor-pointer"
                >
                  <MessageSquare className="h-5 w-5 fill-current" />
                  <span>Enviar Pedido via WhatsApp</span>
                </a>
              </div>
            </div>
          ) : (
            /* NON-DELIVERABLE */
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-lg p-6 space-y-6">
              <div className="flex items-start space-x-3 text-rose-500">
                <AlertTriangle className="h-6 w-6 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-white text-base">Sem Entrega para este Bairro</h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Infelizmente {storeName} ainda não realiza entregas no bairro <strong className="text-slate-800 dark:text-slate-200">{result.bairro}</strong>.
                  </p>
                </div>
              </div>

              {result.pickupEnabled ? (
                <div className="border-t border-slate-100 dark:border-slate-850 pt-5 space-y-4">
                  <div className="flex items-start space-x-4">
                    <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-xl text-slate-500">
                      <Building className="h-6 w-6" />
                    </div>
                    <div>
                      <span className="text-xs text-slate-400 font-semibold block uppercase">Opção: Retirada no Local</span>
                      <p className="text-xs text-slate-500 mt-1">
                        Você pode retirar seu pedido diretamente em nossa loja física sem custo de entrega:
                      </p>
                      <span className="text-sm font-bold text-slate-800 dark:text-white mt-2 block">
                        {result.storeAddress || storeAddress}
                      </span>
                    </div>
                  </div>

                  <a
                    href={`https://wa.me/${result.storeWhatsapp || storeWhatsapp}?text=${encodeURIComponent(
                      `Olá! Gostaria de fazer um pedido para retirada na loja física.`
                    )}`}
                    target="_blank"
                    className="w-full bg-slate-900 dark:bg-slate-800 text-white hover:bg-slate-800 dark:hover:bg-slate-700 font-semibold py-3.5 rounded-xl flex items-center justify-center space-x-2 transition-all text-sm cursor-pointer"
                  >
                    <MessageSquare className="h-5 w-5" />
                    <span>Combinar Retirada via WhatsApp</span>
                  </a>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/20 text-center text-xs text-slate-400">
                  Caso queira falar com um atendente, entre em contato pelo WhatsApp.
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
