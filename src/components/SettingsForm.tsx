'use client';

import { useState } from 'react';
import { updateStoreSettings } from '@/app/admin/settings/actions';
import {
  Save,
  CheckCircle,
  Building2,
  Globe,
  MapPin,
  Clock,
  Truck,
  Trash2,
  Plus,
  Copy,
  Upload,
  AlertTriangle,
} from 'lucide-react';
import { useParams } from 'next/navigation';
import AddressAutocomplete from './AddressAutocomplete';

interface PickupPoint {
  id?: string;
  name: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  instructions: string;
}

interface OperatingHourDay {
  day: number;
  label: string;
  open: boolean;
  openTime: string;
  closeTime: string;
}

interface Store {
  id: string;
  name: string;
  whatsapp: string;
  address: string;
  operatingHours: string;
  pickupEnabled: boolean;
  logoUrl?: string | null;
  bannerUrl?: string | null;
  description?: string | null;
  instagram?: string | null;
  catalogUrl?: string | null;
  websiteUrl?: string | null;
  operatingHoursJson?: OperatingHourDay[] | null;
  deliveryTimeDefault?: string;
  deliveryAvailableMsg?: string | null;
  deliveryUnavailableMsg?: string | null;
  sameDayCutoff?: string | null;
  cutoffMessage?: string | null;
  pickupPoints?: PickupPoint[];
}

const DEFAULT_HOURS: OperatingHourDay[] = [
  { day: 1, label: 'Segunda-feira', open: true, openTime: '08:00', closeTime: '18:00' },
  { day: 2, label: 'Terça-feira', open: true, openTime: '08:00', closeTime: '18:00' },
  { day: 3, label: 'Quarta-feira', open: true, openTime: '08:00', closeTime: '18:00' },
  { day: 4, label: 'Quinta-feira', open: true, openTime: '08:00', closeTime: '18:00' },
  { day: 5, label: 'Sexta-feira', open: true, openTime: '08:00', closeTime: '18:00' },
  { day: 6, label: 'Sábado', open: true, openTime: '08:00', closeTime: '12:00' },
  { day: 0, label: 'Domingo', open: false, openTime: '08:00', closeTime: '18:00' },
];

export default function SettingsForm({ initialStore }: { initialStore: Store }) {
  const params = useParams();
  const storeSlug = params?.storeSlug as string;

  // Initialize tabs
  const [activeTab, setActiveTab] = useState<'loja' | 'canais' | 'retirada' | 'horarios' | 'entrega'>('loja');

  // Form states
  const [name, setName] = useState(initialStore.name);
  const [whatsapp, setWhatsapp] = useState(initialStore.whatsapp);
  const [description, setDescription] = useState(initialStore.description || '');
  const [logoUrl, setLogoUrl] = useState(initialStore.logoUrl || '');
  const [bannerUrl, setBannerUrl] = useState(initialStore.bannerUrl || '');

  const [instagram, setInstagram] = useState(initialStore.instagram || '');
  const [catalogUrl, setCatalogUrl] = useState(initialStore.catalogUrl || '');
  const [websiteUrl, setWebsiteUrl] = useState(initialStore.websiteUrl || '');

  const [pickupEnabled, setPickupEnabled] = useState(initialStore.pickupEnabled);
  const [pickupPoints, setPickupPoints] = useState<PickupPoint[]>(initialStore.pickupPoints || []);

  const [operatingHours, setOperatingHours] = useState<OperatingHourDay[]>(
    initialStore.operatingHoursJson || DEFAULT_HOURS
  );

  const [deliveryTimeDefault, setDeliveryTimeDefault] = useState(initialStore.deliveryTimeDefault || '2 horas');
  const [deliveryAvailableMsg, setDeliveryAvailableMsg] = useState(initialStore.deliveryAvailableMsg || '');
  const [deliveryUnavailableMsg, setDeliveryUnavailableMsg] = useState(initialStore.deliveryUnavailableMsg || '');
  const [sameDayCutoff, setSameDayCutoff] = useState(initialStore.sameDayCutoff || '');
  const [cutoffMessage, setCutoffMessage] = useState(initialStore.cutoffMessage || '');

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Resize and compress uploaded images to Base64
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'banner') => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size first (before compression just in case)
    if (file.size > 8 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'A imagem deve ter no máximo 8MB.' });
      return;
    }

    const maxWidth = type === 'logo' ? 300 : 1200;
    const maxHeight = type === 'logo' ? 300 : 400;

    try {
      const base64 = await resizeImage(file, maxWidth, maxHeight);
      if (type === 'logo') {
        setLogoUrl(base64);
      } else {
        setBannerUrl(base64);
      }
      setMessage({ type: 'success', text: `${type === 'logo' ? 'Logo' : 'Banner'} carregado com sucesso!` });
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Falha ao processar a imagem.' });
    }
  };

  const resizeImage = (file: File, maxWidth: number, maxHeight: number): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.8));
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  };

  // Pickup Points manipulation
  const addPickupPoint = () => {
    setPickupPoints([
      ...pickupPoints,
      { name: '', address: '', latitude: null, longitude: null, instructions: '' },
    ]);
  };

  const removePickupPoint = (index: number) => {
    setPickupPoints(pickupPoints.filter((_, i) => i !== index));
  };

  const updatePickupPoint = (index: number, key: keyof PickupPoint, value: any) => {
    const updated = [...pickupPoints];
    updated[index] = { ...updated[index], [key]: value };
    setPickupPoints(updated);
  };

  // Copy Monday's operating hours to all other days
  const copyHoursToAllDays = () => {
    const mondayHours = operatingHours.find((h) => h.day === 1);
    if (!mondayHours) return;

    const newHours = operatingHours.map((h) => {
      if (h.day === 0) {
        // Keep Sunday closed as default or copy too? Let's copy but let Sunday closed if preferred, or copy everything.
        // Copying everything is cleaner, the admin can just toggle Sunday back if needed.
        return {
          ...h,
          open: mondayHours.open,
          openTime: mondayHours.openTime,
          closeTime: mondayHours.closeTime,
        };
      }
      return {
        ...h,
        open: mondayHours.open,
        openTime: mondayHours.openTime,
        closeTime: mondayHours.closeTime,
      };
    });
    setOperatingHours(newHours);
    setMessage({ type: 'success', text: 'Horários copiados da Segunda-feira para todos os dias!' });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleDayHoursChange = (index: number, key: keyof OperatingHourDay, value: any) => {
    const updated = [...operatingHours];
    updated[index] = { ...updated[index], [key]: value };
    setOperatingHours(updated);
  };

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const formData = new FormData();
    formData.append('id', initialStore.id);
    formData.append('name', name);
    formData.append('whatsapp', whatsapp);
    formData.append('address', initialStore.address); // keep original address as fallback
    formData.append('pickupEnabled', String(pickupEnabled));

    formData.append('logoUrl', logoUrl);
    formData.append('bannerUrl', bannerUrl);
    formData.append('description', description);
    formData.append('instagram', instagram);
    formData.append('catalogUrl', catalogUrl);
    formData.append('websiteUrl', websiteUrl);

    formData.append('deliveryTimeDefault', deliveryTimeDefault);
    formData.append('deliveryAvailableMsg', deliveryAvailableMsg);
    formData.append('deliveryUnavailableMsg', deliveryUnavailableMsg);
    formData.append('sameDayCutoff', sameDayCutoff);
    formData.append('cutoffMessage', cutoffMessage);

    formData.append('operatingHoursJson', JSON.stringify(operatingHours));
    formData.append('pickupPoints', JSON.stringify(pickupPoints));

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
    <form onSubmit={handleSubmit} className="w-full max-w-2xl bg-white border border-[#F1ECE6] rounded-2xl p-4 md:p-8 shadow-sm shadow-slate-900/5 animate-fadeIn space-y-6 text-slate-800">
      {message && (
        <div
          className={`p-4 rounded-xl flex items-center space-x-3 text-sm font-semibold animate-fadeIn ${message.type === 'success'
            ? 'bg-[#F0FDFA] text-[#0D9488] border border-[#CCFBF1]'
            : 'bg-rose-50 text-rose-700 border border-rose-200'
            }`}
        >
          {message.type === 'success' && <CheckCircle className="h-5 w-5 text-[#0D9488] flex-shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Tabs list */}
      <div className="flex flex-wrap gap-1 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab('loja')}
          className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeTab === 'loja'
            ? 'bg-gradient-to-r from-[#2E5B9A] via-[#59C8CF] to-[#FFD7B5] text-white '
            : 'text-black hover:text-slate-900'
            }`}
        >
          <Building2 className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Dados da Loja</span>
          <span className="sm:hidden">Loja</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('canais')}
          className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeTab === 'canais'
            ? 'bg-gradient-to-r from-[#2E5B9A] via-[#59C8CF] to-[#FFD7B5] text-white '
            : 'text-black hover:text-slate-900'
            }`}
        >
          <Globe className="h-3.5 w-3.5" />
          <span>Canais</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('retirada')}
          className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeTab === 'retirada'
            ? 'bg-gradient-to-r from-[#2E5B9A] via-[#59C8CF] to-[#FFD7B5] text-white '
            : 'text-black hover:text-slate-900'
            }`}
        >
          <MapPin className="h-3.5 w-3.5" />
          <span>Retirada</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('horarios')}
          className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeTab === 'horarios'
            ? 'bg-gradient-to-r from-[#2E5B9A] via-[#59C8CF] to-[#FFD7B5] text-white '
            : 'text-black hover:text-slate-900'
            }`}
        >
          <Clock className="h-3.5 w-3.5" />
          <span>Funcionamento</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('entrega')}
          className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeTab === 'entrega'
            ? 'bg-gradient-to-r from-[#2E5B9A] via-[#59C8CF] to-[#FFD7B5] text-white '
            : 'text-black hover:text-slate-900'
            }`}
        >
          <Truck className="h-3.5 w-3.5" />
          <span>Entrega</span>
        </button>
      </div>

      {/* Tab Contents */}
      <div className="pt-2">
        {/* LOJA TAB */}
        {activeTab === 'loja' && (
          <div className="space-y-5 animate-fadeIn">
            <h3 className="text-sm font-extrabold text-slate-900 border-b border-[#F1ECE6] pb-2">
              🏪 Dados Cadastrais da Loja
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">
                  Nome da Loja
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#EAE4DC] bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0D9488] text-xs font-medium"
                  placeholder="Nome comercial"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">
                  WhatsApp (com DDD, apenas números)
                </label>
                <input
                  type="text"
                  required
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#EAE4DC] bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0D9488] text-xs font-medium"
                  placeholder="Ex: 85999999999"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">
                Descrição Curta (exibida na página pública)
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-[#EAE4DC] bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0D9488] text-xs font-medium resize-none"
                placeholder="Ex.: A melhor hamburgueria artesanal do Cocó. Peça agora!"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {/* Logo Upload */}
              <div className="space-y-3">
                <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">
                  Logo da Loja
                </label>
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 rounded-full border border-slate-200 bg-[#FFFDFB] flex items-center justify-center overflow-hidden flex-shrink-0 relative group shadow-xs">
                    {logoUrl ? (
                      <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
                    ) : (
                      <Building2 className="h-6 w-6 text-slate-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <label className="inline-flex items-center space-x-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:text-slate-900 cursor-pointer transition-colors active:scale-98 shadow-xs">
                      <Upload className="h-4 w-4 text-[#0D9488]" />
                      <span>Selecionar Logo</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageFileChange(e, 'logo')}
                        className="hidden"
                      />
                    </label>
                    <p className="text-[10px] text-slate-400 mt-1.5 font-medium">PNG, JPG de até 8MB. Será redimensionado.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CANAIS TAB */}
        {activeTab === 'canais' && (
          <div className="space-y-5 animate-fadeIn">
            <h3 className="text-sm font-extrabold text-slate-900 border-b border-[#F1ECE6] pb-2">
              🌐 Redes Sociais e Canais de Contato
            </h3>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">
                  Instagram (Nome de usuário ou Link)
                </label>
                <input
                  type="text"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#EAE4DC] bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0D9488] text-xs font-medium"
                  placeholder="Ex: @minhaloja ou https://instagram.com/minhaloja"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">
                  Link do Catálogo (WhatsApp, Nuvemshop, Shopify, etc.)
                </label>
                <input
                  type="text"
                  value={catalogUrl}
                  onChange={(e) => setCatalogUrl(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#EAE4DC] bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0D9488] text-xs font-medium"
                  placeholder="Ex: https://catalogo.sualoja.com.br"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">
                  Site Principal (Opcional)
                </label>
                <input
                  type="text"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#EAE4DC] bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0D9488] text-xs font-medium"
                  placeholder="Ex: https://www.sualoja.com.br"
                />
              </div>
            </div>
          </div>
        )}

        {/* RETIRADA TAB */}
        {activeTab === 'retirada' && (
          <div className="space-y-5 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-[#F1ECE6] pb-2">
              <h3 className="text-sm font-extrabold text-slate-900">
                📍 Configuração de Retiradas
              </h3>
              <button
                type="button"
                onClick={() => setPickupEnabled(!pickupEnabled)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${pickupEnabled ? 'bg-[#0D9488]' : 'bg-slate-200'
                  }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${pickupEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                />
              </button>
            </div>

            {pickupEnabled ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-medium">
                    Gerencie os locais disponíveis para o cliente buscar o pedido.
                  </span>
                  <button
                    type="button"
                    onClick={addPickupPoint}
                    className="flex items-center space-x-1.5 bg-[#F0FDFA] hover:bg-[#CCFBF1] border border-[#CCFBF1] px-3.5 py-1.5 rounded-xl text-xs font-bold text-[#0D9488] transition-colors cursor-pointer shadow-xs"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Novo Ponto</span>
                  </button>
                </div>

                {pickupPoints.length === 0 ? (
                  <div className="p-8 rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-400 bg-[#FFFDFB] font-medium">
                    Nenhum ponto de retirada cadastrado. Adicione pelo menos um local físico.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pickupPoints.map((point, index) => (
                      <div
                        key={index}
                        className="bg-[#FFFDFB] border border-[#F1ECE6] rounded-xl p-4 space-y-4 relative animate-fadeIn shadow-xs"
                      >
                        <div className="flex items-center justify-between border-b border-[#F1ECE6] pb-2">
                          <span className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                            Ponto #{index + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => removePickupPoint(index)}
                            className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-all cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-500 uppercase block">
                              Nome do Ponto (ex.: "Loja Aldeota")
                            </label>
                            <input
                              type="text"
                              value={point.name}
                              onChange={(e) => updatePickupPoint(index, 'name', e.target.value)}
                              className="w-full px-3 py-2 rounded-lg border border-[#EAE4DC] bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0D9488] text-xs font-medium"
                              placeholder="Identificação opcional"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-500 uppercase block">
                              Instruções de Retirada (opcional)
                            </label>
                            <input
                              type="text"
                              value={point.instructions}
                              onChange={(e) => updatePickupPoint(index, 'instructions', e.target.value)}
                              className="w-full px-3 py-2 rounded-lg border border-[#EAE4DC] bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0D9488] text-xs font-medium"
                              placeholder="Ex: Entrar no estacionamento comercial"
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-500 uppercase block">
                            Buscar Endereço (Autocomplete)
                          </label>
                          <AddressAutocomplete
                            initialValue={point.address}
                            placeholder="Rua, avenida, número e bairro..."
                            onSelect={(addr, lat, lon) => {
                              updatePickupPoint(index, 'address', addr);
                              updatePickupPoint(index, 'latitude', lat);
                              updatePickupPoint(index, 'longitude', lon);
                            }}
                          />
                        </div>

                        {point.latitude && point.longitude && (
                          <div className="flex items-center space-x-1.5 text-[9px] font-extrabold text-[#0D9488] bg-[#F0FDFA] px-2.5 py-1.5 rounded-lg border border-[#CCFBF1] w-max uppercase tracking-wider">
                            <MapPin className="h-3 w-3" />
                            <span>Coordenadas Capturadas: Lat {point.latitude.toFixed(5)} / Lon {point.longitude.toFixed(5)}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-8 rounded-xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500 font-medium">
                A retirada no local está desativada. Ative o botão acima para cadastrar locais e disponibilizar aos clientes.
              </div>
            )}
          </div>
        )}

        {/* FUNCIONAMENTO TAB */}
        {activeTab === 'horarios' && (
          <div className="space-y-5 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-[#F1ECE6] pb-2">
              <h3 className="text-sm font-extrabold text-slate-900">
                🕒 Horário de Funcionamento Estruturado
              </h3>
              <button
                type="button"
                onClick={copyHoursToAllDays}
                className="flex items-center space-x-1.5 bg-[#F0FDFA] hover:bg-[#CCFBF1] border border-[#CCFBF1] px-3.5 py-1.5 rounded-xl text-xs font-bold text-[#0D9488] transition-colors cursor-pointer shadow-xs"
              >
                <Copy className="h-3.5 w-3.5" />
                <span>Copiar horário de Segunda para todos</span>
              </button>
            </div>

            <div className="space-y-3.5">
              {operatingHours.map((h, i) => (
                <div
                  key={h.day}
                  className="flex flex-col sm:flex-row sm:items-center justify-between bg-[#FFFDFB] border border-[#F1ECE6] rounded-xl p-3.5 gap-3 shadow-xs"
                >
                  <div className="flex items-center justify-between sm:justify-start sm:space-x-4 min-w-[150px]">
                    <span className="text-xs font-bold text-slate-900">{h.label}</span>
                    <button
                      type="button"
                      onClick={() => handleDayHoursChange(i, 'open', !h.open)}
                      className={`px-3 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider transition-colors cursor-pointer ${h.open
                        ? 'bg-[#F0FDFA] text-[#0D9488] border border-[#CCFBF1]'
                        : 'bg-slate-100 text-slate-500 border border-slate-200'
                        }`}
                    >
                      {h.open ? 'Aberto' : 'Fechado'}
                    </button>
                  </div>

                  {h.open ? (
                    <div className="flex items-center space-x-2 self-end sm:self-auto">
                      <input
                        type="time"
                        value={h.openTime}
                        onChange={(e) => handleDayHoursChange(i, 'openTime', e.target.value)}
                        className="px-2.5 py-1.5 rounded-lg border border-[#EAE4DC] bg-white text-slate-900 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#0D9488]"
                      />
                      <span className="text-xs font-bold text-slate-400">até</span>
                      <input
                        type="time"
                        value={h.closeTime}
                        onChange={(e) => handleDayHoursChange(i, 'closeTime', e.target.value)}
                        className="px-2.5 py-1.5 rounded-lg border border-[#EAE4DC] bg-white text-slate-900 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#0D9488]"
                      />
                    </div>
                  ) : (
                    <span className="text-xs font-bold text-slate-400 self-end sm:self-auto uppercase tracking-widest text-[10px]">
                      Não funciona
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ENTREGA TAB */}
        {activeTab === 'entrega' && (
          <div className="space-y-5 animate-fadeIn">
            <h3 className="text-sm font-extrabold text-slate-900 border-b border-[#F1ECE6] pb-2">
              🚚 Configurações Globais de Entrega
            </h3>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">
                  Tempo Padrão de Entrega (Ex.: 2 horas ou 45 min)
                </label>
                <input
                  type="text"
                  required
                  value={deliveryTimeDefault}
                  onChange={(e) => setDeliveryTimeDefault(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#EAE4DC] bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0D9488] text-xs font-medium"
                  placeholder="Ex: 2 horas"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">
                  Mensagem Personalizada - Entrega Disponível
                </label>
                <textarea
                  rows={2}
                  value={deliveryAvailableMsg}
                  onChange={(e) => setDeliveryAvailableMsg(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#EAE4DC] bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0D9488] text-xs font-medium resize-none"
                  placeholder="Ex: Receba hoje em até {deliveryTime}."
                />
                <p className="text-[10px] text-slate-400 font-medium">Dica: Use {"{deliveryTime}"} para injetar o tempo de entrega configurado para o bairro.</p>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">
                  Mensagem Personalizada - Entrega Indisponível
                </label>
                <textarea
                  rows={2}
                  value={deliveryUnavailableMsg}
                  onChange={(e) => setDeliveryUnavailableMsg(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#EAE4DC] bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0D9488] text-xs font-medium resize-none"
                  placeholder="Ex: Sem entregas disponíveis para sua região."
                />
              </div>

              <div className="border-t border-[#F1ECE6] pt-4 space-y-4">
                <div className="flex items-center space-x-2 text-[#FF8A65]">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-[10px] font-extrabold uppercase tracking-wider">Horário Limite no Mesmo Dia (Same Day)</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">
                      Pedidos fechados até:
                    </label>
                    <input
                      type="time"
                      value={sameDayCutoff}
                      onChange={(e) => setSameDayCutoff(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-[#EAE4DC] bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0D9488] text-xs font-semibold"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">
                      Aviso exibido após o horário limite:
                    </label>
                    <input
                      type="text"
                      value={cutoffMessage}
                      onChange={(e) => setCutoffMessage(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-[#EAE4DC] bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0D9488] text-xs font-medium"
                      placeholder="Ex: Pedidos após esse horário serão entregues no próximo dia útil."
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Save Button */}
      <div className="pt-4 border-t border-[#F1ECE6] flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="bg-gradient-to-r from-[#2E5B9A] via-[#59C8CF] to-[#FFD7B5] text-white font-bold px-6 py-3 rounded-xl flex items-center space-x-2 transition-colors disabled:opacity-50 cursor-pointer  active:scale-95  text-xs"
        >
          <Save className="h-4 w-4" />
          <span>{loading ? 'Salvando...' : 'Salvar Configurações'}</span>
        </button>
      </div>
    </form>
  );
}
