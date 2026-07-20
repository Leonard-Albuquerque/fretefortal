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
      color: 'text-[#0D9488] bg-[#F0FDFA] border border-[#CCFBF1]'
    },
    {
      name: 'Bairros sem Entrega',
      value: inactiveCount,
      description: 'Não atendidos pela loja',
      icon: XCircle,
      color: 'text-slate-500 bg-slate-100 border border-slate-200'
    },
    {
      name: 'Frete Médio',
      value: `R$ ${avgFee.toFixed(2)}`,
      description: 'Entre bairros ativos',
      icon: DollarSign,
      color: 'text-[#FF8A65] bg-[#FFF4F0] border border-[#FFE3DC]'
    },
    {
      name: 'Última Atualização',
      value: lastUpdated.split(',')[0] || 'Hoje',
      description: lastUpdated.split(',')[1] ? `Hora: ${lastUpdated.split(',')[1].trim()}` : 'Sem registros',
      icon: Clock,
      color: 'text-[#0D9488] bg-[#F0FDFA] border border-[#CCFBF1]'
    }
  ];

  return (
    <div className="space-y-10 animate-fadeIn">
      <div className="border-b border-[#F1ECE6] pb-6 space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
          Resumo Geral
        </h1>
        <p className="text-sm text-slate-500">
          Visão rápida da cobertura de entregas e taxas cadastradas em Fortaleza para <strong>{store.name}</strong>.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              className="bg-white border border-[#F1ECE6] rounded-2xl p-6 shadow-sm shadow-slate-900/5 flex items-center space-x-5 relative overflow-hidden"
            >
              <div className={`p-3.5 rounded-xl flex-shrink-0 flex items-center justify-center ${stat.color}`}>
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">{stat.name}</span>
                <span className="text-2xl font-extrabold text-slate-900 mt-1 block">
                  {stat.value}
                </span>
                <span className="text-xs text-slate-500 mt-1 block font-medium">{stat.description}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white border border-[#F1ECE6] rounded-2xl p-8 shadow-sm shadow-slate-900/5 space-y-6">
        <h3 className="text-base font-bold text-slate-900 uppercase tracking-wider">Primeiros Passos</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="border border-[#F1ECE6] rounded-xl p-5 bg-[#FFFDFB] space-y-3 shadow-xs">
            <h4 className="font-bold text-slate-900 flex items-center space-x-2.5">
              <span className="bg-[#0D9488] text-white rounded-full h-6 w-6 inline-flex items-center justify-center text-xs font-extrabold shadow-xs">1</span>
              <span>Configurar a Loja</span>
            </h4>
            <p className="text-xs leading-relaxed text-slate-600 font-normal">
              Acesse as configurações e insira o nome, WhatsApp, endereço e horário de funcionamento da sua loja.
            </p>
            <Link
              href={`/${storeSlug}/admin/settings`}
              className="text-xs font-bold text-[#0D9488] hover:text-[#0F766E] transition-colors inline-block mt-2"
            >
              Configurar dados →
            </Link>
          </div>

          <div className="border border-[#F1ECE6] rounded-xl p-5 bg-[#FFFDFB] space-y-3 shadow-xs">
            <h4 className="font-bold text-slate-900 flex items-center space-x-2.5">
              <span className="bg-[#0D9488] text-white rounded-full h-6 w-6 inline-flex items-center justify-center text-xs font-extrabold shadow-xs">2</span>
              <span>Definir os Bairros</span>
            </h4>
            <p className="text-xs leading-relaxed text-slate-600 font-normal">
              Use a lista ou o mapa interativo para habilitar a entrega nos bairros desejados e definir as taxas e prazos.
            </p>
            <Link
              href={`/${storeSlug}/admin/neighborhoods`}
              className="text-xs font-bold text-[#0D9488] hover:text-[#0F766E] transition-colors inline-block mt-2"
            >
              Gerenciar bairros →
            </Link>
          </div>

          <div className="border border-[#F1ECE6] rounded-xl p-5 bg-[#FFFDFB] space-y-3 shadow-xs">
            <h4 className="font-bold text-slate-900 flex items-center space-x-2.5">
              <span className="bg-[#FF8A65] text-white rounded-full h-6 w-6 inline-flex items-center justify-center text-xs font-extrabold shadow-xs">3</span>
              <span>Divulgar o Link</span>
            </h4>
            <p className="text-xs leading-relaxed text-slate-600 font-normal">
              Compartilhe o site público com seus clientes para que eles consultem o frete sozinhos no WhatsApp.
            </p>
            <Link
              href={`/${storeSlug}`}
              target="_blank"
              className="text-xs font-bold text-[#FF8A65] hover:text-[#E0533C] transition-colors inline-block mt-2"
            >
              Acessar site público →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
