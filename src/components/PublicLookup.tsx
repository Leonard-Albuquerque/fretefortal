'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { lookupCep, lookupAddress, lookupCoords, lookupSelectedAddress } from '@/app/actions';
import {
  Search,
  MapPin,
  MessageSquare,
  Building,
  AlertTriangle,
  ArrowRight,
  Loader2,
  Locate,
  Clock,
  Truck,
  Timer,
  ShoppingBag,
  Gift,
  Info,
  Globe,
  Navigation,
  Copy,
  Check,
} from 'lucide-react';
import AddressAutocomplete from './AddressAutocomplete';

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

interface PickupPoint {
  id?: string;
  name: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  instructions: string;
}

interface PublicLookupProps {
  storeSlug: string;
  storeName: string;
  storeWhatsapp: string;
  pickupEnabled: boolean;
  storeAddress: string;
  operatingHours: string;
  initialNeighborhoods: NeighborhoodData[];
  logoUrl?: string | null;
  bannerUrl?: string | null;
  description?: string | null;
  instagram?: string | null;
  catalogUrl?: string | null;
  websiteUrl?: string | null;
  deliveryTimeDefault?: string;
  deliveryAvailableMsg?: string | null;
  deliveryUnavailableMsg?: string | null;
  sameDayCutoff?: string | null;
  cutoffMessage?: string | null;
  pickupPoints?: PickupPoint[];
}

export default function PublicLookup({
  storeSlug,
  storeName,
  storeWhatsapp,
  pickupEnabled,
  storeAddress,
  operatingHours,
  initialNeighborhoods,
  logoUrl,
  bannerUrl,
  description,
  instagram,
  catalogUrl,
  websiteUrl,
  deliveryTimeDefault = '2 horas',
  deliveryAvailableMsg,
  deliveryUnavailableMsg,
  sameDayCutoff,
  cutoffMessage,
  pickupPoints = [],
}: PublicLookupProps) {
  const [mode, setMode] = useState<'cep' | 'address'>('cep');
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [geolocating, setGeolocating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [selectedMapBairroName, setSelectedMapBairroName] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

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

  const handleAddressSelect = async (address: string, lat: number, lon: number, bairro?: string) => {
    setInputValue(address);
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await lookupSelectedAddress(storeSlug, address, lat, lon, bairro);
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

  const handleCopyAddress = (address: string, index: number) => {
    navigator.clipboard.writeText(address);
    setCopiedIndex(index);
    setTimeout(() => {
      setCopiedIndex(null);
    }, 2000);
  };

  // Lock body scroll on mobile when search result is active to prevent scroll conflict
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkAndLockScroll = () => {
      const isMobile = window.innerWidth < 768; // md breakpoint is 768px
      if (isMobile && result) {
        document.documentElement.style.overflow = 'hidden';
        document.body.style.overflow = 'hidden';
      } else {
        document.documentElement.style.overflow = '';
        document.body.style.overflow = '';
      }
    };

    checkAndLockScroll();

    window.addEventListener('resize', checkAndLockScroll);
    return () => {
      window.removeEventListener('resize', checkAndLockScroll);
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    };
  }, [result]);

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
        maximumAge: 0,
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
        deliveryTime: dbBairro.deliveryTime || deliveryTimeDefault,
        minimumOrder: dbBairro.minimumOrder,
        freeDeliveryThreshold: dbBairro.freeDeliveryThreshold,
        notes: dbBairro.notes,
        storeAddress,
        storeWhatsapp,
        pickupEnabled,
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
        pickupEnabled,
      });
      setInputValue(officialName);
      setMode('address');
    }
  };

  // Same day cutoff checker
  const isPastCutoff = () => {
    if (!sameDayCutoff) return false;
    try {
      const [cutoffHours, cutoffMinutes] = sameDayCutoff.split(':').map(Number);
      const now = new Date();
      const currentHours = now.getHours();
      const currentMinutes = now.getMinutes();

      if (currentHours > cutoffHours) return true;
      if (currentHours === cutoffHours && currentMinutes >= cutoffMinutes) return true;
      return false;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const getCustomDeliveryMsg = () => {
    const time = result?.deliveryTime || deliveryTimeDefault || '2 horas';
    if (deliveryAvailableMsg) {
      return deliveryAvailableMsg.replace('{deliveryTime}', time);
    }
    return `Receba hoje em até ${time}.`;
  };

  const getCustomDeliveryUnavailableMsg = () => {
    if (deliveryUnavailableMsg) {
      return deliveryUnavailableMsg;
    }
    return `Infelizmente ${storeName} ainda não realiza entregas no bairro ${result?.bairro || ''}.`;
  };

  // Generate the WhatsApp Link for Delivery
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
    text += `- Prazo: ${result.deliveryTime || deliveryTimeDefault}`;

    if (isPastCutoff()) {
      text += `\n⚠️ _(Ciente do aviso de entrega no próximo dia útil)_`;
    }

    return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
  };

  const renderPickupPointsSection = () => {
    if (!pickupEnabled) return null;

    return (
      <div className="space-y-4">
        {pickupPoints.length > 0 ? (
          <div className="space-y-3">
            {pickupPoints.map((p, idx) => (
              <div key={idx} className="bg-slate-950/60 border border-slate-900/60 rounded-xl p-3.5 space-y-3">
                <div>
                  <span className="text-xs font-black text-white block">
                    {p.name || `Ponto ${idx + 1}`}
                  </span>
                  <span className="text-[10px] text-slate-400 mt-0.5 block leading-normal font-medium">
                    {p.address}
                  </span>
                  {p.instructions && (
                    <span className="text-[9px] text-[#5FC9C8] font-bold mt-1.5 block uppercase tracking-wider bg-[#5FC9C8]/5 px-2 py-1 rounded border border-[#5FC9C8]/10 w-max leading-none">
                      Obs: {p.instructions}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-900/80">
                  {/* Google Maps link */}
                  <a
                    href={
                      p.latitude && p.longitude
                        ? `https://www.google.com/maps/search/?api=1&query=${p.latitude},${p.longitude}`
                        : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p.address)}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-white font-bold px-3 py-1.5 rounded-lg text-[9px] uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    <Navigation className="h-3 w-3 text-[#5FC9C8]" />
                    <span>Google Maps</span>
                  </a>

                  {/* Waze link if coordinates are present */}
                  {p.latitude && p.longitude && (
                    <a
                      href={`https://waze.com/ul?ll=${p.latitude},${p.longitude}&navigate=yes`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-white font-bold px-3 py-1.5 rounded-lg text-[9px] uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      <Navigation className="h-3 w-3 text-[#2F7DBB]" />
                      <span>Waze</span>
                    </a>
                  )}

                  {/* Uber ride link */}
                  {p.latitude && p.longitude && (
                    <a
                      href={`https://m.uber.com/ul/?action=setPickup&pickup=my_location&dropoff[latitude]=${p.latitude}&dropoff[longitude]=${p.longitude}&dropoff[formatted_address]=${encodeURIComponent(p.name || p.address)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-white font-bold px-3 py-1.5 rounded-lg text-[9px] uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      <span className="text-[#5FC9C8] font-bold text-[9px]">Uber</span>
                    </a>
                  )}

                  {/* Copy address button */}
                  <button
                    type="button"
                    onClick={() => handleCopyAddress(p.address, idx)}
                    className="flex items-center space-x-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-white font-bold px-3 py-1.5 rounded-lg text-[9px] uppercase tracking-wider transition-all cursor-pointer"
                  >
                    {copiedIndex === idx ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3 text-[#E9B824]" />
                        <span>Copiar endereço</span>
                      </>
                    )}
                  </button>

                  {/* Combine via WhatsApp */}
                  <a
                    href={`https://wa.me/${result?.storeWhatsapp || storeWhatsapp}?text=${encodeURIComponent(
                      `Olá! Gostaria de fazer um pedido para retirada no ponto: ${p.name || `Ponto ${idx + 1}`} (${p.address}) , mas tenho algumas dúvidas.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1.5 bg-gradient-to-r from-[#1E3A5F] to-[#2F7DBB] hover:from-[#1A3354] hover:to-[#276AA3] text-white font-bold px-3.5 py-1.5 rounded-lg text-[9px] uppercase tracking-wider transition-all cursor-pointer ml-auto"
                  >
                    <img src="/whatsapp.svg" alt="WhatsApp" className="h-3 w-3" />
                    <span>Tenho dúvidas</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-slate-950 border border-slate-900 rounded-xl p-4">
            <span className="text-[11px] font-bold text-white block">
              Loja Central
            </span>
            <span className="text-[10px] text-slate-400 mt-1 block">
              {result?.storeAddress || storeAddress}
            </span>
            <a
              href={`https://wa.me/${result?.storeWhatsapp || storeWhatsapp}?text=${encodeURIComponent(
                `Olá! Gostaria de fazer um pedido para retirada na loja central.`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-slate-900 hover:bg-slate-800 text-white border border-slate-800 font-semibold py-2.5 rounded-xl flex items-center justify-center space-x-2 transition-all text-xs cursor-pointer active:scale-98 mt-3"
            >
              <img src="/whatsapp.svg" alt="WhatsApp" className="h-4 w-4" />
              <span>Combinar Retirada via WhatsApp</span>
            </a>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="relative w-full h-full min-h-[calc(100vh-4rem)] md:h-[calc(100vh-4rem)] flex flex-col md:flex-row overflow-hidden">
      {/* Left Sidebar Control Panel */}
      <div className={`w-auto md:w-[420px] lg:w-[450px] flex-shrink-0 z-10 transition-all duration-300 absolute md:relative top-4 md:top-auto left-4 md:left-auto right-4 md:right-auto md:h-full md:max-h-none h-auto max-h-[85vh] overflow-y-auto bg-transparent md:bg-slate-950/85 md:backdrop-blur-md md:border-r border-slate-900/60 shadow-none md:shadow-none p-0 md:p-6 flex flex-col justify-between ${result ? 'pointer-events-auto' : 'pointer-events-none'} md:pointer-events-auto`}>
        <div className="space-y-5">

          {/* Cover card: Logo + Banner + Description */}
          <div className="hidden md:block bg-slate-900/40 border border-slate-900 rounded-2xl overflow-hidden shadow-xl pointer-events-auto">
            {bannerUrl ? (
              <div className="w-full h-24 overflow-hidden relative">
                <img src={bannerUrl} alt={storeName} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>
              </div>
            ) : (
              <div className="w-full h-12 bg-gradient-to-r from-[#1E3A5F]/40 to-[#2F7DBB]/40"></div>
            )}

            <div className="px-5 pb-5 pt-3 relative">
              {logoUrl && (
                <div className="absolute -top-8 left-5 w-14 h-14 rounded-full border-2 border-slate-950 bg-slate-950 flex items-center justify-center overflow-hidden shadow">
                  <img src={logoUrl} alt={storeName} className="w-full h-full object-cover" />
                </div>
              )}

              <div className={logoUrl ? 'pl-18' : ''}>
                <h2 className="text-base font-extrabold text-white leading-tight truncate">{storeName}</h2>
                {description && (
                  <p className="text-[10px] text-slate-400 mt-1 leading-normal line-clamp-2 font-medium">
                    {description}
                  </p>
                )}
              </div>

              {/* Social and Contact Links */}
              {(instagram || catalogUrl || websiteUrl) && (
                <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-slate-900/40">
                  {instagram && (
                    <a
                      href={instagram.startsWith('http') ? instagram : `https://instagram.com/${instagram.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-900 border border-slate-900 text-slate-400 hover:text-white transition-all text-[9px] font-bold flex items-center space-x-1"
                    >
                      <Globe className="h-3 w-3 text-pink-500" />
                      <span>Instagram</span>
                    </a>
                  )}
                  {catalogUrl && (
                    <a
                      href={catalogUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-900 border border-slate-900 text-[#5FC9C8] hover:text-white transition-all text-[9px] font-bold flex items-center space-x-1"
                    >
                      <ShoppingBag className="h-3 w-3" />
                      <span>Catálogo</span>
                    </a>
                  )}
                  {websiteUrl && (
                    <a
                      href={websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-900 border border-slate-900 text-[#2F7DBB] hover:text-white transition-all text-[9px] font-bold flex items-center space-x-1"
                    >
                      <Globe className="h-3 w-3" />
                      <span>Site</span>
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="hidden md:block space-y-1">
            <h1 className="text-2xl font-black tracking-tight text-white">
              Consulte seu Frete
            </h1>
            <p className="text-[10px] text-slate-500 leading-normal font-semibold uppercase tracking-wider">
              Fortaleza - CE
            </p>
          </div>

          {/* Quick stats/Hours inside sidebar */}
          <div className="hidden md:flex flex-wrap gap-2 text-[10px] font-bold text-slate-400">
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

          {/* Mobile Search Summary Card */}
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

          {/* Search elements and Tabs inside sidebar */}
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
                Pesquisar por Endereço
              </button>
            </div>

            {/* Main Search Card */}
            <div className="bg-slate-900/30 border border-slate-900 rounded-2xl p-3 md:p-6 shadow-xl relative overflow-hidden">
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">
                    {mode === 'cep' ? 'Digite seu CEP de Fortaleza' : 'Digite seu endereço em Fortaleza'}
                  </label>
                  <div className="relative">
                    {mode === 'cep' ? (
                      <>
                        <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                        <input
                          type="text"
                          required
                          disabled={isPending}
                          value={inputValue}
                          onChange={handleInputChange}
                          maxLength={9}
                          placeholder="Ex: 60150-160"
                          className="w-full pl-11 pr-4 py-2.5 md:py-3 rounded-xl border border-slate-900 bg-slate-950 text-white focus:outline-none focus:ring-2 focus:ring-[#5FC9C8] focus:border-transparent transition-all font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                      </>
                    ) : (
                      <AddressAutocomplete
                        disabled={isPending}
                        initialValue={inputValue}
                        placeholder="Rua, Avenida, Número, etc."
                        onSelect={handleAddressSelect}
                      />
                    )}
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

                {mode === 'cep' && (
                  <button
                    type="submit"
                    disabled={isPending || inputValue.length < 8}
                    className="w-full bg-gradient-to-r from-[#1E3A5F] to-[#2F7DBB] hover:from-[#1A3354] hover:to-[#276AA3] text-white font-bold py-2.5 md:py-3 rounded-xl flex items-center justify-center space-x-2 transition-all shadow-md shadow-[#1E3A5F]/10 text-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-98"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <span>Consultar Frete</span>
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                )}
              </form>

              {/* Informative text below search button */}
              <div className="mt-4 flex items-start space-x-2 text-[10px] text-slate-500 font-semibold leading-normal">
                <Info className="h-3.5 w-3.5 text-[#5FC9C8] flex-shrink-0 mt-0.5" />
                <p>
                  As taxas de entrega são calculadas automaticamente com base no seu bairro.
                </p>
              </div>
            </div>
          </div>

          {/* Feedback Messages (Errors, Out of Boundaries, etc.) */}
          {error && !result && (
            <div className="pointer-events-auto bg-rose-955 border border-rose-900/30 rounded-2xl p-4 flex items-start space-x-3 shadow-lg animate-fadeIn">
              <AlertTriangle className="h-5 w-5 text-rose-450 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-white text-xs">Não foi possível consultar</h4>
                <p className="text-[10px] text-rose-300 mt-0.5 leading-relaxed">{error}</p>
              </div>
            </div>
          )}

          {/* Results Details Card */}
          {result && (
            <div className="pointer-events-auto space-y-4 animate-fadeIn">
              {result.deliveryEnabled ? (
                /* DELIVERABLE */
                <div className="bg-slate-900/30 border border-slate-900 rounded-2xl overflow-hidden shadow-2xl p-4 md:p-6 space-y-5">
                  <div className="flex items-center space-x-3 pb-4 border-b border-slate-900/60">
                    <div className="bg-[#5FC9C8]/10 p-2.5 rounded-xl text-[#5FC9C8] border border-[#5FC9C8]/10">
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

                  {/* Logistical Details - Level 1 */}
                  <div className="grid grid-cols-2 gap-3">
                    {/* Delivery Fee */}
                    <div className="bg-slate-950 border border-slate-900 p-3 rounded-xl flex items-start space-x-2.5">
                      <div className="bg-[#5FC9C8]/10 p-1.5 rounded-lg text-[#5FC9C8] border border-[#5FC9C8]/10 flex-shrink-0 mt-0.5">
                        <Truck className="h-4 w-4" />
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-500 font-bold block uppercase tracking-wider">FRETE</span>
                        <span className="text-[15px] font-black text-[#5FC9C8] mt-0.5 block leading-tight">
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
                        <span className="text-[9px] text-slate-500 font-bold block uppercase tracking-wider">PRAZO</span>
                        <span className="text-[15px] font-black text-white mt-0.5 block leading-tight">
                          {result.deliveryTime || deliveryTimeDefault}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Custom Delivery Availability Message */}
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-900 text-xs font-semibold text-slate-200 text-center">
                    {getCustomDeliveryMsg()}
                  </div>

                  {/* Cutoff Warning */}
                  {sameDayCutoff && isPastCutoff() && (
                    <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl flex items-start space-x-2.5 text-xs text-amber-200">
                      <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold">Aviso de Horário Limite ({sameDayCutoff})</p>
                        <p className="text-[10px] text-amber-350 mt-0.5 leading-normal">
                          {cutoffMessage || 'Pedidos realizados após esse horário serão entregues no próximo dia útil.'}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Logistical Details - Level 2 */}
                  <div className="space-y-2.5 md:grid md:grid-cols-2 md:gap-3 md:space-y-0">
                    {/* Operating Hours */}
                    <div className="bg-slate-950 border border-slate-900 p-3 rounded-xl flex items-start space-x-2.5">
                      <div className="bg-slate-900 p-1.5 rounded-lg text-slate-400 border border-slate-800 flex-shrink-0 mt-0.5">
                        <Clock className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-[9px] text-slate-500 font-bold block uppercase tracking-wider">FUNCIONAMENTO</span>
                        <span className="text-[11px] md:text-xs font-semibold text-slate-200 mt-0.5 block whitespace-normal break-words leading-tight">
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
                        <span className="text-[9px] text-slate-500 font-bold block uppercase tracking-wider">PEDIDO MÍNIMO</span>
                        <span className="text-xs font-bold text-slate-200 mt-0.5 block leading-tight">
                          {result.minimumOrder ? `R$ ${result.minimumOrder.toFixed(2)}` : 'Sem mínimo'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Highlight alerts/rules */}
                  {(result.freeDeliveryThreshold && result.notes?.length > 3) && (
                    <div className="bg-[#2F7DBB]/5 border border-[#2F7DBB]/15 p-3 rounded-xl text-xs space-y-2 text-slate-300">
                      {result.freeDeliveryThreshold && (
                        <div className="flex items-center space-x-2">
                          <Gift className="h-3.5 w-3.5 text-[#5FC9C8] flex-shrink-0" />
                          <p className="text-[11px] leading-tight">
                            Frete grátis a partir de <strong className="text-white">R$ {result.freeDeliveryThreshold.toFixed(2)}</strong> em compras!
                          </p>
                        </div>
                      )}
                      {result.notes && (
                        <div className="flex items-start space-x-2">
                          <Info className="h-3.5 w-3.5 text-[#5FC9C8]/80 flex-shrink-0" />
                          <p className="text-[11px] text-slate-400 leading-tight">
                            <span className="font-semibold text-slate-300">Obs:</span> {result.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="pt-2">
                    <a
                      href={getWhatsAppLink()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-gradient-to-r from-[#1E3A5F] to-[#2F7DBB] hover:from-[#1A3354] hover:to-[#276AA3] text-white font-bold py-3.5 rounded-xl flex items-center justify-center space-x-2 transition-all shadow-lg shadow-[#1E3A5F]/15 text-xs cursor-pointer active:scale-98"
                    >
                      <MessageSquare className="h-4 w-4 fill-current text-white" />
                      <span>Enviar Pedido via WhatsApp</span>
                    </a>
                  </div>

                  {pickupEnabled && (
                    <div className="border-t border-slate-900/60 pt-5 space-y-4">
                      <div>
                        <span className="text-xs text-white font-bold block uppercase tracking-wider">Opção: Retirada no Local</span>
                        {/* <p className="text-[10px] text-slate-500 mt-1 leading-normal font-semibold">
                          Se preferir, economize no frete retirando em um de nossos pontos de retirada:
                        </p> */}
                      </div>
                      {renderPickupPointsSection()}
                    </div>
                  )}
                </div>
              ) : (
                /* NON-DELIVERABLE */
                <div className="bg-slate-900/30 border border-slate-900 rounded-2xl overflow-hidden shadow-2xl p-4 md:p-6 space-y-5">
                  <div className="flex items-start space-x-3 text-rose-450 pb-4 border-b border-slate-900/60">
                    <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-white text-sm">Sem Entrega para este Bairro</h4>
                      <p className="text-[10px] text-slate-450 mt-1 leading-normal font-medium">
                        {getCustomDeliveryUnavailableMsg()}
                      </p>
                    </div>
                  </div>

                  {result.pickupEnabled ? (
                    <div className="space-y-4">
                      <div>
                        <span className="text-xs text-slate-450 font-bold block uppercase tracking-wider">Opção: Retirada no Local</span>
                        <p className="text-[10px] text-slate-500 mt-1 leading-normal font-semibold">
                          Você pode retirar seu pedido em um de nossos pontos de retirada sem taxa de entrega:
                        </p>
                      </div>
                      {renderPickupPointsSection()}
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
          {/* Mobile Spacer to prevent overlap of Chrome mobile bottom controls */}
          <div className="h-32 w-full block md:hidden" />
        </div>

        {/* Sidebar Footer */}
        <div className="hidden md:block pt-4 border-t border-slate-900/60 mt-6 text-center text-[9px] text-slate-500 flex-shrink-0">
          <p>&copy; {new Date().getFullYear()} {storeName}. Todos os direitos reservados.</p>
          <p className="mt-0.5 text-slate-650 font-medium">
            Entregas realizadas exclusivamente na cidade de Fortaleza (CE).
          </p>
        </div>
      </div>

      {/* Right side: Map container */}
      <div className="absolute md:relative inset-0 md:inset-auto w-full h-full md:flex-1 z-0">
        <LeafletMap
          neighborhoods={initialNeighborhoods}
          selectedName={selectedMapBairroName}
          onSelect={handleMapSelect}
          dirtyName={null}
          publicView={true}
          className="w-full h-full min-h-[350px] relative z-0 md:rounded-none border-0 shadow-none"
          pickupPoints={pickupPoints}
        />
      </div>
    </div>
  );
}
