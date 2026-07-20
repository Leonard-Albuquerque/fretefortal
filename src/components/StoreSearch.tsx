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
        <div className="absolute -inset-0.5 bg-gradient-to-r from-[#1E3A5F] to-[#2F7DBB] rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-1000 group-focus-within:opacity-40"></div>
        <div className="relative bg-slate-900/50 border border-slate-900 rounded-2xl p-2 shadow-2xl flex items-center">
          <Search className="h-6 w-6 text-slate-500 ml-4 flex-shrink-0" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Digite o nome da loja ou endereço..."
            className="w-full px-4 py-3 bg-transparent text-white placeholder-slate-550 focus:outline-none font-medium text-base md:text-lg"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="px-3 py-1.5 text-xs font-bold text-slate-400 hover:text-white mr-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
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
                className="group relative block bg-slate-900/30 border border-slate-900 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-0.5 active:scale-[0.99] overflow-hidden hover:border-[#5FC9C8]/25"
              >
                {/* Visual Accent Hover Glow (Refactored to new palette) */}
                <div className="absolute -inset-px bg-gradient-to-r from-[#2F7DBB]/0 via-[#5FC9C8]/5 to-[#2F7DBB]/0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-550 pointer-events-none"></div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center space-x-3">
                      {store.logoUrl ? (
                        <img src={store.logoUrl} alt={store.name} className="h-10 w-10 rounded-xl object-cover flex-shrink-0 group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <div className="bg-gradient-to-r from-[#1E3A5F]/10 to-[#2F7DBB]/10 p-2.5 rounded-xl text-[#5FC9C8] flex-shrink-0 group-hover:scale-105 transition-transform duration-300 border border-[#5FC9C8]/10">
                          <StoreIcon className="h-5 w-5" />
                        </div>
                      )}
                      <h3 className="font-bold text-lg text-white group-hover:text-[#5FC9C8] transition-colors">
                        {store.name}
                      </h3>
                    </div>

                    <div className="space-y-1.5 text-xs font-semibold text-slate-400">
                      <div className="flex items-start space-x-2">
                        <MapPin className="h-4 w-4 text-slate-500 mt-0.5 flex-shrink-0" />
                        <span>{store.address}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-slate-500 flex-shrink-0" />
                        <span>{store.operatingHours}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-3 pt-2 md:pt-0 border-t border-slate-900 md:border-0">
                    <div className="flex flex-col items-start md:items-end gap-1.5">
                      {store.pickupEnabled ? (
                        <span className="text-[9px] font-extrabold px-2.5 py-1 rounded-full bg-emerald-950/40 border border-emerald-500/20 text-emerald-400 uppercase tracking-widest text-center">
                          Retirada disponível
                        </span>
                      ) : (
                        <span className="text-[9px] font-extrabold px-2.5 py-1 rounded-full bg-slate-900/60 border border-slate-800/80 text-slate-500 uppercase tracking-widest text-center">
                          Retirada indisponível
                        </span>
                      )}

                      {store.hasDelivery ? (
                        <span className="text-[9px] font-extrabold px-2.5 py-1 rounded-full bg-teal-950/40 border border-teal-500/20 text-teal-400 uppercase tracking-widest text-center">
                          Fazemos entrega
                        </span>
                      ) : (
                        <span className="text-[9px] font-extrabold px-2.5 py-1 rounded-full bg-slate-900/60 border border-slate-800/80 text-slate-500 uppercase tracking-widest text-center">
                          Sem entrega oficial
                        </span>
                      )}
                    </div>
                    <div className="bg-gradient-to-r from-[#1E3A5F] to-[#2F7DBB] text-white p-2.5 rounded-xl transition-all shadow-lg shadow-[#1E3A5F]/10 group-hover:translate-x-1 duration-300 flex items-center justify-center">
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-slate-900/10 border border-slate-900 rounded-2xl p-12 text-center shadow-md animate-fadeIn">
            <HelpCircle className="h-12 w-12 text-slate-700 mx-auto mb-4" />
            <h3 className="font-bold text-base text-slate-400">Nenhuma loja encontrada</h3>
            <p className="text-slate-500 text-xs mt-1 max-w-sm mx-auto">
              Tente pesquisar por termos diferentes ou verifique a grafia do nome.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
