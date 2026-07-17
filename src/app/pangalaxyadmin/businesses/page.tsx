import { prisma } from '@/lib/prisma';
import { 
  Activity, 
  Store as StoreIcon, 
  MapPin, 
  Clock, 
  User, 
  Percent, 
  ExternalLink,
  BarChart2
} from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Métricas de Empresas - Pangalaxy',
  description: 'Visão comparativa de métricas e telemetria segregada por empresa.',
};

export default async function PangalaxyBusinessesPage() {
  // Fetch all stores
  const stores = await prisma.store.findMany({
    orderBy: { name: 'asc' }
  });

  // Fetch metrics for each store
  const storeMetrics = await Promise.all(stores.map(async (store) => {
    const [
      totalSearches,
      uniqueSessionsGroup,
      successfulDeliveries,
      failedDeliveries,
      avgResponseTimeAggregate,
      topNeighborhoodsRaw
    ] = await Promise.all([
      prisma.searchEvent.count({ where: { storeId: store.id } }),
      prisma.searchEvent.groupBy({
        by: ['sessionId'],
        where: { storeId: store.id }
      }),
      prisma.searchEvent.count({ where: { storeId: store.id, deliveryAvailable: true } }),
      prisma.searchEvent.count({ where: { storeId: store.id, deliveryAvailable: false } }),
      prisma.searchEvent.aggregate({
        _avg: { responseTimeMs: true },
        where: { storeId: store.id }
      }),
      prisma.searchEvent.groupBy({
        by: ['searchedNeighborhood'],
        _count: { id: true },
        where: {
          storeId: store.id,
          searchedNeighborhood: { not: null }
        },
        orderBy: {
          _count: { id: 'desc' }
        },
        take: 3
      })
    ]);

    const uniqueVisitors = uniqueSessionsGroup.length;
    const avgResponseTime = avgResponseTimeAggregate._avg.responseTimeMs 
      ? Math.round(avgResponseTimeAggregate._avg.responseTimeMs) 
      : 0;

    const successRate = totalSearches > 0 
      ? Math.round((successfulDeliveries / totalSearches) * 100) 
      : 0;

    const topNeighborhoods = topNeighborhoodsRaw.map(n => ({
      name: n.searchedNeighborhood || 'Desconhecido',
      count: n._count.id
    }));

    return {
      store,
      totalSearches,
      uniqueVisitors,
      successfulDeliveries,
      failedDeliveries,
      avgResponseTime,
      successRate,
      topNeighborhoods
    };
  }));

  return (
    <div className="space-y-12 animate-fadeIn">
      {/* Header */}
      <header className="border-b border-slate-900 pb-8 space-y-2">
        <span className="bg-gradient-to-r from-[#1E3A5F] to-[#2F7DBB] text-white text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full shadow-lg shadow-[#1E3A5F]/20 border border-[#2F7DBB]/10">
          Métricas por Estabelecimento
        </span>
        <h1 className="text-4xl font-extrabold tracking-tight text-white bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
          Desempenho de Empresas
        </h1>
        <p className="text-sm text-slate-400 max-w-xl">
          Compare volumes de requisições, cobertura de frete por CEP/endereço e latência média separadamente para cada empresa.
        </p>
      </header>

      {/* Grid of Store Cards */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {storeMetrics.map(({ store, totalSearches, uniqueVisitors, successfulDeliveries, failedDeliveries, avgResponseTime, successRate, topNeighborhoods }) => (
          <div 
            key={store.id} 
            className="group relative bg-slate-900/30 border border-slate-900 rounded-2xl p-8 shadow-xl transition-all duration-300 hover:border-[#5FC9C8]/25 overflow-hidden"
          >
            {/* Ambient Background Glow on Hover */}
            <div className="absolute -inset-px bg-gradient-to-r from-[#2F7DBB]/0 via-[#5FC9C8]/5 to-[#2F7DBB]/0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

            <div className="space-y-8 relative">
              {/* Card Title & Store link */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center space-x-3.5">
                  <div className="bg-gradient-to-r from-[#1E3A5F]/10 to-[#2F7DBB]/10 p-3 rounded-xl text-[#5FC9C8] border border-[#5FC9C8]/10 group-hover:scale-105 transition-transform duration-300">
                    <StoreIcon className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white group-hover:text-[#5FC9C8] transition-colors">
                      {store.name}
                    </h2>
                    <span className="text-[10px] text-slate-500 font-mono block mt-0.5">
                      SLUG: {store.slug}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Link
                    href={`/${store.slug}`}
                    target="_blank"
                    className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-all text-xs flex items-center space-x-1"
                    title="Acessar site público da loja"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    <span>Visitar</span>
                  </Link>
                  <Link
                    href={`/${store.slug}/admin`}
                    target="_blank"
                    className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-all text-xs flex items-center space-x-1"
                    title="Acessar admin da loja"
                  >
                    <BarChart2 className="h-3.5 w-3.5" />
                    <span>Admin</span>
                  </Link>
                </div>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Stat 1: Total searches */}
                <div className="bg-slate-950/40 border border-slate-900 p-4 rounded-xl space-y-1">
                  <div className="flex items-center space-x-1.5 text-slate-550">
                    <Activity className="h-3.5 w-3.5 text-[#5FC9C8]" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Buscas</span>
                  </div>
                  <span className="text-xl font-black text-white block">{totalSearches}</span>
                </div>

                {/* Stat 2: Unique Visitors */}
                <div className="bg-slate-950/40 border border-slate-900 p-4 rounded-xl space-y-1">
                  <div className="flex items-center space-x-1.5 text-slate-550">
                    <User className="h-3.5 w-3.5 text-[#2F7DBB]" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Visitantes</span>
                  </div>
                  <span className="text-xl font-black text-white block">{uniqueVisitors}</span>
                </div>

                {/* Stat 3: Coverage Rate */}
                <div className="bg-slate-950/40 border border-slate-900 p-4 rounded-xl space-y-1">
                  <div className="flex items-center space-x-1.5 text-slate-550">
                    <Percent className="h-3.5 w-3.5 text-[#5FC9C8]" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Cobertura</span>
                  </div>
                  <span className="text-xl font-black text-[#5FC9C8] block">{successRate}%</span>
                </div>

                {/* Stat 4: Avg Response Time */}
                <div className="bg-slate-950/40 border border-slate-900 p-4 rounded-xl space-y-1">
                  <div className="flex items-center space-x-1.5 text-slate-550">
                    <Clock className="h-3.5 w-3.5 text-[#DCC8A5]" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Latência</span>
                  </div>
                  <span className="text-xl font-black text-white block">{avgResponseTime} <span className="text-xs font-normal text-slate-400">ms</span></span>
                </div>
              </div>

              {/* Delivery ratio progress bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-400">Sucesso na Cobertura de Entregas</span>
                  <span className="text-slate-550">{successfulDeliveries} sim / {failedDeliveries} não</span>
                </div>
                <div className="w-full h-2.5 bg-slate-955 rounded-full overflow-hidden flex border border-slate-900">
                  <div 
                    className="h-full bg-[#5FC9C8]" 
                    style={{ width: `${totalSearches > 0 ? (successfulDeliveries / totalSearches) * 100 : 0}%` }}
                    title="Entregas Disponíveis"
                  ></div>
                  <div 
                    className="h-full bg-[#1E3A5F]" 
                    style={{ width: `${totalSearches > 0 ? (failedDeliveries / totalSearches) * 100 : 0}%` }}
                    title="Fora da Cobertura"
                  ></div>
                </div>
              </div>

              {/* Top 3 Bairros */}
              <div className="space-y-4 pt-2">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                  <MapPin className="h-3.5 w-3.5 text-[#DCC8A5]" />
                  <span>Bairros Mais Procurados nesta Loja</span>
                </h3>
                <div className="space-y-2.5">
                  {topNeighborhoods.length > 0 ? (
                    topNeighborhoods.map((n, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs border-b border-slate-955 pb-2">
                        <span className="text-slate-300 flex items-center font-medium">
                          <span className="text-[9px] bg-slate-955 border border-slate-900 text-slate-450 px-1.5 py-0.5 rounded mr-2 font-mono">#{idx+1}</span>
                          {n.name}
                        </span>
                        <span className="text-white font-bold font-mono">{n.count} buscas</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-600 italic py-2">Nenhuma busca de CEP realizada nesta loja.</p>
                  )}
                </div>
              </div>

              {/* Metadata Details */}
              <div className="pt-4 border-t border-slate-950/60 text-[10px] text-slate-500 flex flex-col sm:flex-row justify-between gap-2">
                <span>Endereço: {store.address}</span>
                <span className="sm:text-right">Funcionamento: {store.operatingHours}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
