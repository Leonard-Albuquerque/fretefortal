'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, MapPin, Clock, ArrowRight, Store as StoreIcon, HelpCircle } from 'lucide-react';

interface Store {
  id: string;
  slug: string;
  name: string;
  address: string;
  operatingHours: string;
  pickupEnabled: boolean;
  logoUrl: string | null;
  hasDelivery: boolean;
  pickupPointsCount: number;
}

interface StoreSearchProps {
  initialStores: Store[];
}

export default function StoreSearch({ initialStores }: StoreSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredStores = initialStores.filter((store) =>
    store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    store.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8 animate-fadeIn">
      {/* Search Input Container */}
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-[#0D9488]/15 via-[#FF8A65]/15 to-[#0D9488]/15 rounded-2xl blur opacity-40 group-hover:opacity-70 transition duration-500 group-focus-within:opacity-80"></div>
        <div className="relative bg-white border border-[#EAE4DC] rounded-2xl p-2 shadow-lg shadow-slate-900/5 flex items-center focus-within:border-[#0D9488] transition-colors">
          <Search className="h-5 w-5 text-slate-400 ml-4 flex-shrink-0" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Digite o nome da loja ou endereço..."
            className="w-full px-4 py-3 bg-transparent text-slate-900 placeholder-slate-400 focus:outline-none font-medium text-base"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="px-3 py-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 mr-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              Limpar
            </button>
          )}
        </div>
      </div>

      {/* Stores List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest">
            {filteredStores.length === 1 ? '1 loja encontrada' : `${filteredStores.length} lojas encontradas`}
          </h2>
        </div>

        {filteredStores.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {filteredStores.map((store) => (
              <Link
                key={store.id}
                href={`/${store.slug}`}
                className="group relative block bg-white border border-[#F1ECE6] rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-0.5 active:scale-[0.99] overflow-hidden hover:border-[#0D9488]/40"
              >
                {/* Visual Accent Hover Glow */}
                <div className="absolute -inset-px bg-gradient-to-r from-[#0D9488]/0 via-[#0D9488]/5 to-[#FF8A65]/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center space-x-3">
                      {store.logoUrl ? (
                        <img src={store.logoUrl} alt={store.name} className="h-11 w-11 rounded-xl object-cover flex-shrink-0 border border-slate-100 shadow-xs group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <div className="bg-gradient-to-br from-[#F0FDFA] to-[#FFF4F0] p-3 rounded-xl text-[#0D9488] flex-shrink-0 group-hover:scale-105 transition-transform duration-300 border border-[#0D9488]/15 shadow-xs">
                          <StoreIcon className="h-5 w-5" />
                        </div>
                      )}
                      <h3 className="font-bold text-lg text-slate-900 group-hover:text-[#0D9488] transition-colors">
                        {store.name}
                      </h3>
                    </div>

                    <div className="space-y-1.5 text-xs font-medium text-slate-600">
                      <div className="flex items-start space-x-2">
                        <MapPin className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                          <span>{store.address}</span>
                          {store.pickupPointsCount > 1 && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-[#F0FDFA] border border-[#CCFBF1] text-[#0D9488] uppercase tracking-wider w-fit">
                              +{store.pickupPointsCount} endereços
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-slate-400 flex-shrink-0" />
                        <span>{store.operatingHours}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-3 pt-3 md:pt-0 border-t border-[#F1ECE6] md:border-0">
                    <div className="flex flex-col items-start md:items-end gap-1.5">
                      {store.pickupEnabled ? (
                        <span className="text-[9px] font-extrabold px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 uppercase tracking-widest text-center">
                          Retirada disponível
                        </span>
                      ) : (
                        <span className="text-[9px] font-extrabold px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200 text-slate-400 uppercase tracking-widest text-center">
                          Retirada indisponível
                        </span>
                      )}

                      {store.hasDelivery ? (
                        <span className="text-[9px] font-extrabold px-2.5 py-1 rounded-full bg-[#F0FDFA] border border-[#CCFBF1] text-[#0D9488] uppercase tracking-widest text-center">
                          Fazemos entrega
                        </span>
                      ) : (
                        <span className="text-[9px] font-extrabold px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200 text-slate-400 uppercase tracking-widest text-center">
                          Sem entrega oficial
                        </span>
                      )}
                    </div>
                    <div className="bg-gradient-to-r from-[#0D9488] to-[#14B8A6] text-white p-2.5 rounded-xl transition-all shadow-md shadow-[#0D9488]/20 group-hover:translate-x-1 duration-300 flex items-center justify-center">
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-white border border-[#F1ECE6] rounded-2xl p-12 text-center shadow-sm animate-fadeIn">
            <HelpCircle className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h3 className="font-bold text-base text-slate-700">Nenhuma loja encontrada</h3>
            <p className="text-slate-500 text-xs mt-1 max-w-sm mx-auto">
              Tente pesquisar por termos diferentes ou verifique a grafia do nome.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
