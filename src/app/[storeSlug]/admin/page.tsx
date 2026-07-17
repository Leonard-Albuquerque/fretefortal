import { prisma } from '@/lib/prisma';
import { MapPin, DollarSign, Clock, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ storeSlug: string }>;
}

export default async function AdminDashboard({ params }: PageProps) {
  const { storeSlug } = await params;

  // Find the store
  const store = await prisma.store.findUnique({
    where: { slug: storeSlug }
  });

  if (!store) {
    notFound();
  }

  // Fetch stats from DB filtered by this store
  const [activeCount, inactiveCount, avgFeeAggregate, lastUpdatedNeighborhood] = await Promise.all([
    prisma.neighborhood.count({ where: { storeId: store.id, deliveryEnabled: true } }),
    prisma.neighborhood.count({ where: { storeId: store.id, deliveryEnabled: false } }),
    prisma.neighborhood.aggregate({
      _avg: { fee: true },
      where: { storeId: store.id, deliveryEnabled: true }
    }),
    prisma.neighborhood.findFirst({
      where: { storeId: store.id },
      orderBy: { updatedAt: 'desc' },
      select: { updatedAt: true }
    })
  ]);

  const avgFee = avgFeeAggregate._avg.fee ? Number(avgFeeAggregate._avg.fee) : 0;
  const lastUpdated = lastUpdatedNeighborhood?.updatedAt 
    ? new Date(lastUpdatedNeighborhood.updatedAt).toLocaleString('pt-BR', { timeZone: 'America/Fortaleza' }) 
    : 'Sem atualizações';

  const stats = [
    {
      name: 'Bairros com Entrega',
      value: activeCount,
      description: 'Atendidos pela loja',
      icon: CheckCircle,
      color: 'text-violet-400 bg-violet-950/30 border border-violet-900/20'
    },
    {
      name: 'Bairros sem Entrega',
      value: inactiveCount,
      description: 'Não atendidos pela loja',
      icon: XCircle,
      color: 'text-rose-450 bg-rose-950/30 border border-rose-900/20'
    },
    {
      name: 'Frete Médio',
      value: `R$ ${avgFee.toFixed(2)}`,
      description: 'Entre bairros ativos',
      icon: DollarSign,
      color: 'text-indigo-400 bg-indigo-950/30 border border-indigo-900/20'
    },
    {
      name: 'Última Atualização',
      value: lastUpdated.split(',')[0] || 'Hoje',
      description: lastUpdated.split(',')[1] ? `Hora: ${lastUpdated.split(',')[1].trim()}` : 'Sem registros',
      icon: Clock,
      color: 'text-amber-400 bg-amber-950/30 border border-amber-900/20'
    }
  ];

  return (
    <div className="space-y-12 animate-fadeIn">
      <div className="border-b border-slate-900 pb-8 space-y-2">
        <h1 className="text-4xl font-extrabold tracking-tight text-white bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
          Resumo Geral
        </h1>
        <p className="text-sm text-slate-400">
          Visão rápida da cobertura de entregas e taxas cadastradas em Fortaleza para <strong>{store.name}</strong>.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              className="bg-slate-900/30 border border-slate-900 rounded-xl p-6 shadow-xl flex items-center space-x-5 relative overflow-hidden"
            >
              <div className={`p-4 rounded-xl flex-shrink-0 flex items-center justify-center ${stat.color}`}>
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-500 block uppercase tracking-wider">{stat.name}</span>
                <span className="text-2xl font-black text-white mt-1 block">
                  {stat.value}
                </span>
                <span className="text-xs text-slate-400 mt-1 block">{stat.description}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-slate-900/30 border border-slate-900 rounded-xl p-8 shadow-xl space-y-6">
        <h3 className="text-lg font-bold text-white uppercase tracking-wider">Primeiros Passos</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="border border-slate-900 rounded-xl p-5 bg-slate-950/40 space-y-3">
            <h4 className="font-bold text-white flex items-center space-x-2.5">
              <span className="bg-gradient-to-r from-violet-500 to-indigo-500 text-white rounded-full h-6 w-6 inline-flex items-center justify-center text-xs font-extrabold shadow-md shadow-violet-500/10">1</span>
              <span>Configurar a Loja</span>
            </h4>
            <p className="text-xs leading-relaxed text-slate-400">
              Acesse as configurações e insira o nome, WhatsApp, endereço e horário de funcionamento da sua loja.
            </p>
            <Link
              href={`/${storeSlug}/admin/settings`}
              className="text-xs font-bold text-violet-400 hover:text-violet-300 transition-colors inline-block mt-2"
            >
              Configurar dados →
            </Link>
          </div>

          <div className="border border-slate-900 rounded-xl p-5 bg-slate-950/40 space-y-3">
            <h4 className="font-bold text-white flex items-center space-x-2.5">
              <span className="bg-gradient-to-r from-violet-500 to-indigo-500 text-white rounded-full h-6 w-6 inline-flex items-center justify-center text-xs font-extrabold shadow-md shadow-violet-500/10">2</span>
              <span>Definir os Bairros</span>
            </h4>
            <p className="text-xs leading-relaxed text-slate-400">
              Use a lista ou o mapa interativo para habilitar a entrega nos bairros desejados e definir as taxas e prazos.
            </p>
            <Link
              href={`/${storeSlug}/admin/neighborhoods`}
              className="text-xs font-bold text-violet-400 hover:text-violet-300 transition-colors inline-block mt-2"
            >
              Gerenciar bairros →
            </Link>
          </div>

          <div className="border border-slate-900 rounded-xl p-5 bg-slate-950/40 space-y-3">
            <h4 className="font-bold text-white flex items-center space-x-2.5">
              <span className="bg-gradient-to-r from-violet-500 to-indigo-500 text-white rounded-full h-6 w-6 inline-flex items-center justify-center text-xs font-extrabold shadow-md shadow-violet-500/10">3</span>
              <span>Divulgar o Link</span>
            </h4>
            <p className="text-xs leading-relaxed text-slate-400">
              Compartilhe o site público com seus clientes para que eles consultem o frete sozinhos no WhatsApp.
            </p>
            <Link
              href={`/${storeSlug}`}
              target="_blank"
              className="text-xs font-bold text-violet-400 hover:text-violet-300 transition-colors inline-block mt-2"
            >
              Acessar site público →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
