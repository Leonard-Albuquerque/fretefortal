import { prisma } from '@/lib/prisma';
import {
  Activity,
  Search,
  MapPin,
  Clock,
  User,
  CheckCircle,
  XCircle,
  Percent,
  Layers,
  Globe,
  Calendar,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Telemetria Pangalaxy - Cobertura085',
  description: 'Painel global de análise de telemetria e métricas de buscas.',
};

export default async function PangalaxyAdminPage() {
  // Fetch general stats from DB
  const [
    totalSearches,
    uniqueSessionsGroup,
    successfulDeliveries,
    failedDeliveries,
    avgResponseTimeAggregate,
    cepSearches,
    addressSearches,
    locationSearches,
    topNeighborhoodsRaw,
    storeShareRaw,
    recentEvents
  ] = await Promise.all([
    // Total searches
    prisma.searchEvent.count(),

    // Unique visitors (sessions)
    prisma.searchEvent.groupBy({
      by: ['sessionId']
    }),

    // Delivery Available rate
    prisma.searchEvent.count({ where: { deliveryAvailable: true } }),
    prisma.searchEvent.count({ where: { deliveryAvailable: false } }),

    // Response time
    prisma.searchEvent.aggregate({
      _avg: { responseTimeMs: true }
    }),

    // Search types
    prisma.searchEvent.count({ where: { searchType: 'CEP' } }),
    prisma.searchEvent.count({ where: { searchType: 'ADDRESS' } }),
    prisma.searchEvent.count({ where: { searchType: 'LOCATION' } }),

    // Top 10 Searched Neighborhoods
    prisma.searchEvent.groupBy({
      by: ['searchedNeighborhood'],
      _count: { id: true },
      where: {
        searchedNeighborhood: { not: null }
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      },
      take: 10
    }),

    // Share of searches by store
    prisma.searchEvent.groupBy({
      by: ['storeId'],
      _count: { id: true },
      orderBy: {
        _count: {
          id: 'desc'
        }
      }
    }),

    // Recent logs
    prisma.searchEvent.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        store: {
          select: {
            name: true,
            slug: true
          }
        }
      }
    })
  ]);

  // Fetch all stores to map names
  const allStores = await prisma.store.findMany({
    select: { id: true, name: true, slug: true }
  });

  const storeMap = new Map(allStores.map(s => [s.id, s]));

  const uniqueVisitors = uniqueSessionsGroup.length;
  const avgResponseTime = avgResponseTimeAggregate._avg.responseTimeMs
    ? Math.round(avgResponseTimeAggregate._avg.responseTimeMs)
    : 0;

  const successRate = totalSearches > 0
    ? Math.round((successfulDeliveries / totalSearches) * 100)
    : 0;

  // Process store share data
  const storeShare = storeShareRaw.map(item => {
    const storeInfo = storeMap.get(item.storeId);
    return {
      name: storeInfo?.name || 'Desconhecida',
      slug: storeInfo?.slug || '',
      count: item._count.id,
      percentage: totalSearches > 0 ? Math.round((item._count.id / totalSearches) * 100) : 0
    };
  });

  // Process top neighborhoods
  const topNeighborhoods = topNeighborhoodsRaw.map(item => ({
    name: item.searchedNeighborhood || 'Desconhecido',
    count: item._count.id,
    percentage: totalSearches > 0 ? Math.round((item._count.id / totalSearches) * 100) : 0
  }));

  return (
    <div className="space-y-12 animate-fadeIn">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-900 pb-8">
        <div className="space-y-2">
          <div className="flex items-center space-x-3">
            <span className="bg-gradient-to-r from-[#1E3A5F] to-[#2F7DBB] text-white text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full shadow-lg shadow-[#1E3A5F]/20 border border-[#2F7DBB]/10">
              PANGALAXY TELEMETRIA
            </span>
            <span className="h-2 w-2 rounded-full bg-[#5FC9C8] animate-ping"></span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            Event Analytics Dashboard
          </h1>
          <p className="text-sm text-slate-400 max-w-xl">
            Monitoramento em tempo real de logs de consultas de frete, performance de requisições e análise geográfica de Fortaleza.
          </p>
        </div>
      </header>

      {/* Stats Grid (Accents Refactored to Ocean Palette) */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Total Searches */}
        <div className="relative group bg-slate-900/30 border border-slate-900 rounded-2xl p-6 shadow-md transition-all duration-300 overflow-hidden hover:border-[#1E3A5F]/40">
          <div className="absolute top-0 right-0 p-4 opacity-10 text-[#1E3A5F] group-hover:scale-110 transition-transform">
            <Search className="h-20 w-20" />
          </div>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="bg-[#1E3A5F]/15 p-2.5 rounded-xl text-[#5FC9C8] border border-[#1E3A5F]/20">
                <Activity className="h-5 w-5" />
              </div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total de Buscas</span>
            </div>
            <div>
              <span className="text-4xl font-black tracking-tight text-white block">{totalSearches}</span>
              <span className="text-xs text-slate-500 mt-1 block">Requisições registradas no banco</span>
            </div>
          </div>
        </div>

        {/* Card 2: Unique Visitors */}
        <div className="relative group bg-slate-900/30 border border-slate-900 rounded-2xl p-6 shadow-md transition-all duration-300 overflow-hidden hover:border-[#2F7DBB]/40">
          <div className="absolute top-0 right-0 p-4 opacity-10 text-[#2F7DBB] group-hover:scale-110 transition-transform">
            <User className="h-20 w-20" />
          </div>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="bg-[#2F7DBB]/15 p-2.5 rounded-xl text-[#5FC9C8] border border-[#2F7DBB]/20">
                <User className="h-5 w-5" />
              </div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Visitantes Únicos</span>
            </div>
            <div>
              <span className="text-4xl font-black tracking-tight text-white block">{uniqueVisitors}</span>
              <span className="text-xs text-slate-500 mt-1 block">Identificados por token de sessão</span>
            </div>
          </div>
        </div>

        {/* Card 3: Success Rate */}
        <div className="relative group bg-slate-900/30 border border-slate-900 rounded-2xl p-6 shadow-md transition-all duration-300 overflow-hidden hover:border-[#5FC9C8]/40">
          <div className="absolute top-0 right-0 p-4 opacity-10 text-[#5FC9C8] group-hover:scale-110 transition-transform">
            <Percent className="h-20 w-20" />
          </div>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="bg-[#5FC9C8]/15 p-2.5 rounded-xl text-[#5FC9C8] border border-[#5FC9C8]/20">
                <Percent className="h-5 w-5" />
              </div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Taxa de Cobertura</span>
            </div>
            <div>
              <span className="text-4xl font-black tracking-tight text-white block">{successRate}%</span>
              <div className="flex items-center space-x-2 text-[10px] text-slate-500 mt-1">
                <span className="flex items-center text-[#5FC9C8] font-bold"><CheckCircle className="h-3 w-3 mr-0.5" />{successfulDeliveries}</span>
                <span>/</span>
                <span className="flex items-center text-rose-450 font-bold"><XCircle className="h-3 w-3 mr-0.5" />{failedDeliveries}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 4: Response Time */}
        <div className="relative group bg-slate-900/30 border border-slate-900 rounded-2xl p-6 shadow-md transition-all duration-300 overflow-hidden hover:border-[#DCC8A5]/40">
          <div className="absolute top-0 right-0 p-4 opacity-10 text-[#DCC8A5] group-hover:scale-110 transition-transform">
            <Clock className="h-20 w-20" />
          </div>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="bg-[#DCC8A5]/15 p-2.5 rounded-xl text-[#DCC8A5] border border-[#DCC8A5]/20">
                <Clock className="h-5 w-5" />
              </div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Latência Média</span>
            </div>
            <div>
              <span className="text-4xl font-black tracking-tight text-white block">{avgResponseTime} <span className="text-lg font-normal text-slate-500">ms</span></span>
              <span className="text-xs text-slate-550 mt-1 block">Tempo de processamento da busca</span>
            </div>
          </div>
        </div>
      </section>

      {/* Charts & Distributions */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Col 1: Search type & Stores share */}
        <div className="space-y-8 lg:col-span-1">
          {/* Search Type Card */}
          <div className="bg-slate-900/30 border border-slate-900 rounded-2xl p-6 space-y-6">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
              <Layers className="h-4 w-4 text-[#5FC9C8]" />
              <span>Método de Busca</span>
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-400">Consulta por CEP</span>
                  <span className="text-white">{cepSearches} ({totalSearches > 0 ? Math.round((cepSearches / totalSearches) * 100) : 0}%)</span>
                </div>
                <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-900">
                  <div
                    className="h-full bg-gradient-to-r from-[#1E3A5F] to-[#2F7DBB] rounded-full"
                    style={{ width: `${totalSearches > 0 ? (cepSearches / totalSearches) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-400">Consulta por Endereço</span>
                  <span className="text-white">{addressSearches} ({totalSearches > 0 ? Math.round((addressSearches / totalSearches) * 100) : 0}%)</span>
                </div>
                <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-900">
                  <div
                    className="h-full bg-gradient-to-r from-[#DCC8A5] to-[#5FC9C8] rounded-full"
                    style={{ width: `${totalSearches > 0 ? (addressSearches / totalSearches) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-400">Consulta por Localização</span>
                  <span className="text-white">{locationSearches} ({totalSearches > 0 ? Math.round((locationSearches / totalSearches) * 100) : 0}%)</span>
                </div>
                <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-900">
                  <div
                    className="h-full bg-gradient-to-r from-violet-600 to-fuchsia-500 rounded-full"
                    style={{ width: `${totalSearches > 0 ? (locationSearches / totalSearches) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Store Share Card */}
          <div className="bg-slate-900/30 border border-slate-900 rounded-2xl p-6 space-y-6">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
              <Globe className="h-4 w-4 text-[#2F7DBB]" />
              <span>Buscas por Estabelecimento</span>
            </h3>
            <div className="space-y-4">
              {storeShare.length > 0 ? (
                storeShare.map((item, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex justify-between text-xs font-bold">
                      <Link href={`/${item.slug}`} className="text-[#5FC9C8] hover:underline">{item.name}</Link>
                      <span className="text-white">{item.count} ({item.percentage}%)</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-900">
                      <div
                        className="h-full bg-gradient-to-r from-[#1E3A5F] to-[#5FC9C8] rounded-full"
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 italic text-center py-4">Nenhum evento registrado</p>
              )}
            </div>
          </div>
        </div>

        {/* Col 2: Top Searched Neighborhoods */}
        <div className="lg:col-span-2">
          <div className="bg-slate-900/30 border border-slate-900 rounded-2xl p-6 space-y-6 h-full flex flex-col">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-[#5FC9C8]" />
              <span>Bairros Mais Procurados (Top 10)</span>
            </h3>
            <div className="space-y-4 flex-1 flex flex-col justify-center">
              {topNeighborhoods.length > 0 ? (
                topNeighborhoods.map((item, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-300 flex items-center">
                        <span className="text-[10px] bg-slate-950 border border-slate-850 px-1.5 py-0.5 rounded text-slate-400 mr-2 font-mono">#{idx + 1}</span>
                        {item.name}
                      </span>
                      <span className="text-white font-mono">{item.count} buscas</span>
                    </div>
                    <div className="w-full h-2 bg-slate-955 rounded-full overflow-hidden border border-slate-900">
                      <div
                        className="h-full bg-[#5FC9C8] rounded-full"
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 space-y-2">
                  <AlertCircle className="h-8 w-8 text-slate-650 mx-auto" />
                  <p className="text-xs text-slate-550 italic">Nenhum dado geográfico registrado</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Real-time Telemetry Logs Table */}
      <section className="bg-slate-900/30 border border-slate-900 rounded-2xl p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-[#DCC8A5]" />
              <span>Histórico de Logs de Telemetria</span>
            </h3>
            <p className="text-xs text-slate-500">Exibindo as últimas 50 consultas realizadas no sistema.</p>
          </div>
          <div className="text-xs font-mono bg-slate-950 border border-slate-900 px-3 py-1.5 rounded-lg text-slate-400">
            Banco de Dados: <span className="text-[#5FC9C8] font-bold">Neon Postgres</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-900 text-slate-450 font-bold bg-slate-950/40">
                <th className="p-4 rounded-tl-xl">Data/Hora</th>
                <th className="p-4">Estabelecimento</th>
                <th className="p-4">Tipo</th>
                <th className="p-4">Valor Buscado</th>
                <th className="p-4">Bairro Identificado</th>
                <th className="p-4">Entrega?</th>
                <th className="p-4">Frete</th>
                <th className="p-4">Latência</th>
                <th className="p-4 rounded-tr-xl">Navegador</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-950">
              {recentEvents.length > 0 ? (
                recentEvents.map((event) => {
                  const parsedDate = new Date(event.createdAt).toLocaleString('pt-BR', { timeZone: 'America/Fortaleza' });

                  // Simple browser detection from userAgent
                  let browser = 'Unknown';
                  const ua = event.userAgent.toLowerCase();
                  if (ua.includes('firefox')) browser = 'Firefox';
                  else if (ua.includes('chrome') && !ua.includes('chrome-lighthouse')) browser = 'Chrome';
                  else if (ua.includes('safari') && !ua.includes('chrome')) browser = 'Safari';
                  else if (ua.includes('edge')) browser = 'Edge';
                  else if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) browser = 'Mobile Web';
                  else if (ua.includes('chrome-lighthouse') || ua.includes('googlebot')) browser = 'Bot/Spider';

                  return (
                    <tr key={event.id} className="hover:bg-slate-900/10 transition-colors text-slate-350">
                      <td className="p-4 whitespace-nowrap font-mono text-[10px] text-slate-500">{parsedDate}</td>
                      <td className="p-4 font-semibold text-slate-200">{event.store.name}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold border ${event.searchType === 'CEP'
                            ? 'bg-[#1E3A5F]/20 text-[#5FC9C8] border-[#1E3A5F]/30'
                            : event.searchType === 'ADDRESS'
                              ? 'bg-[#2F7DBB]/20 text-white border-[#2F7DBB]/30'
                              : 'bg-violet-950/40 text-violet-400 border-violet-900/40'
                          }`}>
                          {event.searchType}
                        </span>
                      </td>
                      <td className="p-4 font-mono font-medium max-w-[120px] truncate text-slate-300" title={event.searchedValue}>
                        {event.searchedValue}
                      </td>
                      <td className="p-4 font-semibold text-white">
                        {event.searchedNeighborhood || <span className="text-slate-600 italic">Desconhecido</span>}
                      </td>
                      <td className="p-4">
                        {event.deliveryAvailable ? (
                          <span className="inline-flex items-center text-[#5FC9C8] bg-[#5FC9C8]/10 px-2 py-0.5 rounded text-[10px] font-bold border border-[#5FC9C8]/20">
                            <CheckCircle className="h-3 w-3 mr-1" /> SIM
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-rose-450 bg-rose-955 px-2 py-0.5 rounded text-[10px] font-bold border border-rose-900/30">
                            <XCircle className="h-3 w-3 mr-1" /> NÃO
                          </span>
                        )}
                      </td>
                      <td className="p-4 font-mono font-semibold text-slate-100">
                        {event.deliveryAvailable ? `R$ ${Number(event.deliveryPrice).toFixed(2)}` : '-'}
                      </td>
                      <td className="p-4 font-mono">
                        <span className={`${event.responseTimeMs > 800
                            ? 'text-rose-450 font-semibold'
                            : (event.responseTimeMs > 300 ? 'text-[#DCC8A5]' : 'text-[#5FC9C8]')
                          }`}>
                          {event.responseTimeMs} ms
                        </span>
                      </td>
                      <td className="p-4 truncate max-w-[100px] text-slate-500" title={event.userAgent}>
                        {browser}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-500 italic">
                    Nenhum log registrado até o momento. Faça pesquisas públicas na tela inicial para gerar dados de telemetria!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
