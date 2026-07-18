'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { lookupCep, lookupAddress, lookupCoords } from '@/app/actions';
import { Search, MapPin, Map, MessageSquare, Building, AlertTriangle, ArrowRight, Loader2, Locate, Clock, Truck, Timer, ShoppingBag, Gift } from 'lucide-react';

const LeafletMap = dynamic(() => import('./LeafletMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-slate-950 flex items-center justify-center min-h-[350px]">
      <div className="flex flex-col items-center space-y-3">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5FC9C8]"></div>
        <span className="text-sm text-slate-500">Iniciando mapa interativo...</span>
      </div>
    </div>
  ),
});

interface NeighborhoodData {
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

interface PublicLookupProps {
  storeSlug: string;
  storeName: string;
  storeWhatsapp: string;
  pickupEnabled: boolean;
  storeAddress: string;
  operatingHours: string;
  initialNeighborhoods: NeighborhoodData[];
}

export default function PublicLookup({
  storeSlug,
  storeName,
  storeWhatsapp,
  pickupEnabled,
  storeAddress,
  operatingHours,
  initialNeighborhoods
}: PublicLookupProps) {
  const [mode, setMode] = useState<'cep' | 'address'>('cep');
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [geolocating, setGeolocating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [selectedMapBairroName, setSelectedMapBairroName] = useState<string | null>(null);

  const isPending = loading || geolocating;

  const handleLookup = async (overrideValue?: string) => {
    const valueToQuery = overrideValue || inputValue;
    if (!valueToQuery || valueToQuery.trim().length === 0) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      let res;
      if (mode === 'cep') {
        res = await lookupCep(storeSlug, valueToQuery);
      } else {
        res = await lookupAddress(storeSlug, valueToQuery);
      }

      if (res.success) {
        setResult(res);
        const targetBairro = res.bairro;
        if (targetBairro) {
          const match = initialNeighborhoods.find(
            (n) => n.officialName.toLowerCase() === targetBairro.toLowerCase() || n.name === targetBairro.toLowerCase()
          );
          if (match) {
            setSelectedMapBairroName(match.name);
          }
        }
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

  const handleGeolocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocalização não é suportada por este navegador.');
      return;
    }

    setGeolocating(true);
    setError(null);
    setResult(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await lookupCoords(storeSlug, latitude, longitude);
          if (res.success) {
            setResult(res);
            let displayAddress = '';
            if (res.street) {
              displayAddress += res.street;
            }
            const targetBairro = res.bairro;
            if (targetBairro) {
              displayAddress += (displayAddress ? ', ' : '') + targetBairro;
              const match = initialNeighborhoods.find(
                (n) => n.officialName.toLowerCase() === targetBairro.toLowerCase() || n.name === targetBairro.toLowerCase()
              );
              if (match) {
                setSelectedMapBairroName(match.name);
              }
            }
            if (displayAddress) {
              setInputValue(displayAddress);
              setMode('address');
            }
            if (res.error) {
              setError(res.error);
            }
          } else {
            setError(res.error || 'Ocorreu um erro na consulta de localização.');
          }
        } catch (err) {
          console.error(err);
          setError('Falha de conexão com o servidor. Tente novamente.');
        } finally {
          setGeolocating(false);
        }
      },
      (err) => {
        console.error('Geolocation error:', err);
        setGeolocating(false);
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setError('Permissão de localização negada pelo usuário.');
            break;
          case err.POSITION_UNAVAILABLE:
            setError('Informações de localização indisponíveis.');
            break;
          case err.TIMEOUT:
            setError('Tempo limite esgotado ao tentar obter localização.');
            break;
          default:
            setError('Não foi possível obter a sua localização atual.');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const handleMapSelect = (normalizedName: string, officialName: string) => {
    setError(null);
    setSelectedMapBairroName(normalizedName);

    const dbBairro = initialNeighborhoods.find((n) => n.name === normalizedName);

    if (dbBairro) {
      setResult({
        success: true,
        deliveryEnabled: dbBairro.deliveryEnabled,
        bairro: dbBairro.officialName,
        street: '',
        fee: dbBairro.fee,
        deliveryTime: dbBairro.deliveryTime || '24h',
        minimumOrder: dbBairro.minimumOrder,
        freeDeliveryThreshold: dbBairro.freeDeliveryThreshold,
        notes: dbBairro.notes,
        storeAddress,
        storeWhatsapp,
        pickupEnabled
      });
      setInputValue(dbBairro.officialName);
      setMode('address');
    } else {
      setResult({
        success: true,
        deliveryEnabled: false,
        bairro: officialName,
        street: '',
        storeAddress,
        storeWhatsapp,
        pickupEnabled
      });
      setInputValue(officialName);
      setMode('address');
    }
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
    <div className="relative w-full h-full min-h-[calc(100vh-4rem)] md:h-[calc(100vh-4rem)] flex flex-col md:flex-row overflow-hidden">
      {/* Left Sidebar Control Panel - Positioned absolute at the top on mobile, relative sidebar on desktop */}
      <div className="w-auto md:w-[420px] lg:w-[450px] flex-shrink-0 z-10 transition-all duration-300 absolute md:relative top-4 md:top-auto left-4 md:left-auto right-4 md:right-auto md:h-full md:max-h-none h-auto max-h-[85vh] overflow-y-auto bg-transparent md:bg-slate-950/85 md:backdrop-blur-md md:border-r border-slate-900/60 shadow-none md:shadow-none p-0 md:p-6 flex flex-col justify-between pointer-events-none md:pointer-events-auto">
        <div className="space-y-6">
          {/* Header title inside sidebar (Desktop only) */}
          <div className="hidden md:block space-y-2">
            <h1 className="text-3xl font-black tracking-tight text-white bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              Consulte seu Frete
            </h1>
            <p className="text-xs text-slate-400 leading-relaxed">
              Informe seu CEP, endereço ou use a sua localização atual. Você também pode clicar diretamente em qualquer bairro no mapa interativo.
            </p>
          </div>

          {/* Quick stats/Hours inside sidebar (Desktop only) */}
          <div className="hidden md:flex flex-wrap gap-2 text-[10px] font-semibold text-slate-400">
            <div className="flex items-center space-x-1.5 bg-slate-900/60 px-3 py-1.5 rounded-full border border-slate-900 shadow-sm">
              <Clock className="h-3 w-3 text-[#5FC9C8]" />
              <span>{operatingHours}</span>
            </div>
            {pickupEnabled && (
              <div className="flex items-center space-x-1.5 bg-slate-900/60 px-3 py-1.5 rounded-full border border-slate-900 shadow-sm">
                <MapPin className="h-3 w-3 text-[#5FC9C8]" />
                <span>Retirada Habilitada</span>
              </div>
            )}
          </div>

          {/* Mobile Search Summary Card - Visible only on mobile when result is active */}
          {result && (
            <div className="md:hidden w-full pointer-events-auto bg-slate-900 border border-slate-800 rounded-2xl p-3.5 shadow-xl flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="bg-[#5FC9C8]/10 p-2 rounded-xl text-[#5FC9C8] border border-[#5FC9C8]/10">
                  <MapPin className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Consultando bairro</span>
                  <span className="text-sm font-bold text-white block truncate max-w-[150px] sm:max-w-[200px]">
                    {result.bairro}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setResult(null);
                  setError(null);
                  setInputValue('');
                  setSelectedMapBairroName(null);
                }}
                className="bg-slate-800 hover:bg-slate-700 text-[#5FC9C8] hover:text-white font-bold text-xs px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center space-x-1"
              >
                <span>Alterar</span>
              </button>
            </div>
          )}

          {/* Search elements and Tabs inside sidebar - Styled as a floating unified card on mobile (hidden on mobile if result exists) */}
          <div className={`${result ? 'hidden md:block' : 'block'} space-y-3 pointer-events-auto bg-slate-905 md:bg-transparent backdrop-blur-md md:backdrop-blur-none border border-slate-900/60 md:border-0 rounded-2xl md:rounded-none p-3.5 md:p-0 shadow-2xl md:shadow-none`}>
            {/* Search Selection Tabs */}
            <div className="bg-slate-900/50 p-1 rounded-2xl flex items-center space-x-1 border border-slate-900">
              <button
                type="button"
                disabled={isPending}
                onClick={() => switchMode('cep')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${mode === 'cep'
                  ? 'bg-gradient-to-r from-[#1E3A5F] to-[#2F7DBB] text-white shadow shadow-[#1E3A5F]/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/30'
                  }`}
              >
                Pesquisar por CEP
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={() => switchMode('address')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${mode === 'address'
                  ? 'bg-gradient-to-r from-[#1E3A5F] to-[#2F7DBB] text-white shadow shadow-[#1E3A5F]/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/30'
                  }`}
              >
                Não sei meu CEP
              </button>
            </div>

            {/* Main Search Card - Compact padding on mobile */}
            <div className="bg-slate-900/30 border border-slate-900 rounded-2xl p-3 md:p-6 shadow-xl relative overflow-hidden">
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                    {mode === 'cep' ? 'Digite seu CEP de Fortaleza' : 'Digite seu endereço em Fortaleza'}
                  </label>
                  <div className="relative">
                    {mode === 'cep' ? (
                      <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                    ) : (
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                    )}
                    <input
                      type="text"
                      required
                      disabled={isPending}
                      value={inputValue}
                      onChange={handleInputChange}
                      maxLength={mode === 'cep' ? 9 : 100}
                      placeholder={mode === 'cep' ? 'Ex: 60150-160' : 'Rua, Avenida, Número, etc.'}
                      className="w-full pl-11 pr-4 py-2.5 md:py-3 rounded-xl border border-slate-900 bg-slate-950 text-white focus:outline-none focus:ring-2 focus:ring-[#5FC9C8] focus:border-transparent transition-all font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleGeolocation}
                  disabled={isPending}
                  className="w-full py-2 rounded-xl border border-slate-800 bg-slate-900/40 text-slate-350 hover:text-white hover:bg-slate-900/60 transition-all font-semibold text-xs flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-98"
                >
                  {geolocating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin text-[#5FC9C8]" />
                      <span>Obtendo localização...</span>
                    </>
                  ) : (
                    <>
                      <Locate className="h-4 w-4 text-[#5FC9C8]" />
                      <span>Usar minha localização atual</span>
                    </>
                  )}
                </button>

                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full bg-gradient-to-r from-[#1E3A5F] to-[#2F7DBB] hover:from-[#1A3354] hover:to-[#276AA3] text-white font-bold py-2.5 md:py-3.5 rounded-xl flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-lg shadow-[#1E3A5F]/15 active:scale-98 text-sm"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin text-white" />
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
          </div>

          {/* Error Alert */}
          {error && !result && (
            <div className="bg-rose-955 text-rose-450 border border-rose-900/30 p-4 rounded-xl flex items-start space-x-3 text-sm animate-fadeIn pointer-events-auto">
              <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5 text-rose-500" />
              <div>
                <span className="font-semibold block">Erro na consulta</span>
                <span className="text-xs text-rose-400 mt-0.5 block">{error}</span>
              </div>
            </div>
          )}

          {/* Results Overlay Card */}
          {result && (
            <div className="animate-fadeIn pointer-events-auto  md:p-0 fixed md:relative bottom-4 md:bottom-auto left-4 md:left-auto right-4 md:right-auto z-[400] md:z-auto max-h-[75dvh] md:max-h-none overflow-y-auto bg-slate-900 border border-slate-800 rounded-2xl md:border-0 md:bg-transparent md:rounded-none md:shadow-none md:p-0">
              {result.deliveryEnabled ? (
                /* DELIVERABLE */
                <div className="bg-slate-900/30 border-2 border-[#2F7DBB]/85 rounded-2xl overflow-hidden shadow-2xl shadow-[#2F7DBB]/10">
                  <div className="bg-gradient-to-r from-[#1E3A5F] to-[#2F7DBB] p-4 flex items-center justify-between">
                    <span className="font-bold text-white text-sm">Entregamos no seu Bairro!</span>
                    {/* <span className="bg-white/20 text-white text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      Fortaleza
                    </span> */}
                  </div>
                  <div className="p-4 md:p-6 space-y-4 md:space-y-6">
                    <div className="flex items-start space-x-3 border-b border-slate-900 pb-3">
                      <div className="bg-[#2F7DBB]/10 p-2.5 rounded-xl text-[#2F7DBB] border border-[#2F7DBB]/15 flex-shrink-0">
                        <MapPin className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Endereço Identificado</span>
                        <span className="text-base font-black text-white mt-0.5 block truncate">
                          {result.bairro}
                        </span>
                        {result.street && (
                          <span className="text-xs text-slate-450 mt-0.5 block truncate leading-tight">
                            Rua: {result.street}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Logistical Grid Dashboard */}
                    <div className="grid grid-cols-2 gap-3">
                      {/* Delivery Fee */}
                      <div className="bg-slate-950 border border-slate-900 p-3 rounded-xl flex items-start space-x-2.5">
                        <div className="bg-[#5FC9C8]/10 p-1.5 rounded-lg text-[#5FC9C8] border border-[#5FC9C8]/10 flex-shrink-0 mt-0.5">
                          <Truck className="h-4 w-4" />
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wide">Frete</span>
                          <span className="text-sm font-black text-[#5FC9C8] mt-0.5 block">
                            {result.fee === 0 ? 'Grátis' : `R$ ${result.fee.toFixed(2)}`}
                          </span>
                        </div>
                      </div>

                      {/* Delivery Time */}
                      <div className="bg-slate-950 border border-slate-900 p-3 rounded-xl flex items-start space-x-2.5">
                        <div className="bg-[#2F7DBB]/10 p-1.5 rounded-lg text-[#2F7DBB] border border-[#2F7DBB]/10 flex-shrink-0 mt-0.5">
                          <Timer className="h-4 w-4" />
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wide">Prazo</span>
                          <span className="text-sm font-bold text-white mt-0.5 block truncate max-w-[100px]" title={result.deliveryTime}>
                            {result.deliveryTime}
                          </span>
                        </div>
                      </div>

                      {/* Operating Hours */}
                      <div className="bg-slate-950 border border-slate-900 p-3 rounded-xl flex items-start space-x-2.5">
                        <div className="bg-slate-900 p-1.5 rounded-lg text-slate-400 border border-slate-800 flex-shrink-0 mt-0.5">
                          <Clock className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wide">Funcionamento</span>
                          <span className="text-xs font-semibold text-white mt-0.5 block truncate" title={operatingHours}>
                            {operatingHours}
                          </span>
                        </div>
                      </div>

                      {/* Minimum Order */}
                      <div className="bg-slate-950 border border-slate-900 p-3 rounded-xl flex items-start space-x-2.5">
                        <div className="bg-slate-900 p-1.5 rounded-lg text-slate-400 border border-slate-800 flex-shrink-0 mt-0.5">
                          <ShoppingBag className="h-4 w-4" />
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wide">Pedido Mínimo</span>
                          <span className="text-xs font-bold text-white mt-0.5 block">
                            {result.minimumOrder ? `R$ ${result.minimumOrder.toFixed(2)}` : 'Sem mínimo'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Highlight alerts/rules (Free delivery threshold, special notes) */}
                    {(result.freeDeliveryThreshold || result.notes) && (
                      <div className="bg-[#2F7DBB]/5 border border-[#2F7DBB]/15 p-3 rounded-xl text-xs space-y-1.5 text-slate-300">
                        {result.freeDeliveryThreshold && (
                          <div className="flex items-center space-x-2">
                            <Gift className="h-3.5 w-3.5 text-[#5FC9C8] flex-shrink-0" />
                            <p>
                              Frete grátis a partir de <strong className="text-white">R$ {result.freeDeliveryThreshold.toFixed(2)}</strong> em compras!
                            </p>
                          </div>
                        )}
                        {result.notes && (
                          <div className="flex items-start space-x-2">
                            <span className="text-[#5FC9C8] font-bold block mt-0.5">•</span>
                            <p className="text-[11px] text-slate-400 leading-tight">
                              <span className="font-semibold text-slate-350">Obs:</span> {result.notes}
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    <a
                      href={getWhatsAppLink()}
                      target="_blank"
                      className="w-full bg-gradient-to-r from-[#1E3A5F] to-[#2F7DBB] hover:from-[#1A3354] hover:to-[#276AA3] text-white font-bold py-3.5 rounded-xl flex items-center justify-center space-x-2 transition-all shadow-lg shadow-[#1E3A5F]/15 text-sm cursor-pointer active:scale-98"
                    >
                      <MessageSquare className="h-5 w-5 fill-current text-white" />
                      <span>Enviar Pedido via WhatsApp</span>
                    </a>
                  </div>
                </div>
              ) : (
                /* NON-DELIVERABLE */
                <div className="bg-slate-900/30 border border-slate-900 rounded-2xl overflow-hidden shadow-2xl p-6 space-y-6">
                  <div className="flex items-start space-x-3 text-rose-450">
                    <AlertTriangle className="h-6 w-6 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-white text-base">Sem Entrega para este Bairro</h4>
                      <p className="text-xs text-slate-400 mt-1">
                        Infelizmente {storeName} ainda não realiza entregas no bairro <strong className="text-white">{result.bairro}</strong>.
                      </p>
                    </div>
                  </div>

                  {result.pickupEnabled ? (
                    <div className="border-t border-slate-900 pt-5 space-y-4">
                      <div className="flex items-start space-x-4">
                        <div className="bg-slate-950 p-3 rounded-xl text-slate-400 border border-slate-905">
                          <Building className="h-6 w-6" />
                        </div>
                        <div>
                          <span className="text-xs text-slate-500 font-semibold block uppercase">Opção: Retirada no Local</span>
                          <p className="text-xs text-slate-400 mt-1">
                            Você pode retirar seu pedido diretamente em nossa loja física sem custo de entrega:
                          </p>
                          <span className="text-sm font-bold text-white mt-2 block">
                            {result.storeAddress || storeAddress}
                          </span>
                        </div>
                      </div>

                      <a
                        href={`https://wa.me/${result.storeWhatsapp || storeWhatsapp}?text=${encodeURIComponent(
                          `Olá! Gostaria de fazer um pedido para retirada na loja física.`
                        )}`}
                        target="_blank"
                        className="w-full bg-slate-900 hover:bg-slate-800 text-white border border-slate-800 font-semibold py-3.5 rounded-xl flex items-center justify-center space-x-2 transition-all text-sm cursor-pointer active:scale-98"
                      >
                        <MessageSquare className="h-5 w-5" />
                        <span>Combinar Retirada via WhatsApp</span>
                      </a>
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-slate-950 text-center text-xs text-slate-500 border border-slate-900">
                      Caso queira falar com um atendente, entre em contato pelo WhatsApp.
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar Footer (Desktop only) */}
        <div className="hidden md:block pt-6 border-t border-slate-900/60 mt-8 text-center text-[10px] text-slate-500 flex-shrink-0">
          <p>&copy; {new Date().getFullYear()} {storeName}. Todos os direitos reservados.</p>
          <p className="mt-0.5 text-[9px] text-slate-600">
            Entregas realizadas exclusivamente na cidade de Fortaleza (CE).
          </p>
        </div>
      </div>

      {/* Right side: Map container (covers screen on desktop, full background on mobile) */}
      <div className="absolute md:relative inset-0 md:inset-auto w-full h-full md:flex-1 z-0">
        <LeafletMap
          neighborhoods={initialNeighborhoods}
          selectedName={selectedMapBairroName}
          onSelect={handleMapSelect}
          dirtyName={null}
          publicView={true}
          className="w-full h-full min-h-[350px] relative z-0 md:rounded-none border-0 shadow-none"
        />
      </div>
    </div>
  );
}
