import { prisma } from '@/lib/prisma';
import { MapPin, DollarSign, Clock, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  // Fetch stats from DB
  const [activeCount, inactiveCount, avgFeeAggregate, lastUpdatedNeighborhood] = await Promise.all([
    prisma.neighborhood.count({ where: { deliveryEnabled: true } }),
    prisma.neighborhood.count({ where: { deliveryEnabled: false } }),
    prisma.neighborhood.aggregate({
      _avg: { fee: true },
      where: { deliveryEnabled: true }
    }),
    prisma.neighborhood.findFirst({
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
      color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30'
    },
    {
      name: 'Bairros sem Entrega',
      value: inactiveCount,
      description: 'Não atendidos pela loja',
      icon: XCircle,
      color: 'text-rose-500 bg-rose-50 dark:bg-rose-950/30'
    },
    {
      name: 'Frete Médio',
      value: `R$ ${avgFee.toFixed(2)}`,
      description: 'Entre bairros ativos',
      icon: DollarSign,
      color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/30'
    },
    {
      name: 'Última Atualização',
      value: lastUpdated.split(',')[0] || 'Hoje',
      description: lastUpdated.split(',')[1] ? `Hora: ${lastUpdated.split(',')[1].trim()}` : 'Sem registros',
      icon: Clock,
      color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/30'
    }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Resumo Geral</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">
          Visão rápida da cobertura de entregas e taxas cadastradas em Fortaleza.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm flex items-center space-x-5"
            >
              <div className={`p-4 rounded-xl ${stat.color}`}>
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <span className="text-sm font-medium text-slate-400 block">{stat.name}</span>
                <span className="text-2xl font-bold text-slate-800 dark:text-white mt-1 block">
                  {stat.value}
                </span>
                <span className="text-xs text-slate-400 mt-1 block">{stat.description}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 shadow-sm">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Primeiros Passos</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="border border-slate-100 dark:border-slate-800 rounded-lg p-5 bg-slate-50/50 dark:bg-slate-950/20">
            <h4 className="font-bold text-slate-800 dark:text-white flex items-center space-x-2">
              <span className="bg-emerald-500 text-white rounded-full h-5 w-5 inline-flex items-center justify-center text-xs font-semibold">1</span>
              <span>Configurar a Loja</span>
            </h4>
            <p className="text-sm text-slate-500 mt-2">
              Acesse as configurações e insira o nome, WhatsApp, endereço e horário de funcionamento da sua loja.
            </p>
            <Link
              href="/admin/settings"
              className="text-sm font-semibold text-emerald-600 hover:text-emerald-500 mt-4 inline-block"
            >
              Configurar dados →
            </Link>
          </div>

          <div className="border border-slate-100 dark:border-slate-800 rounded-lg p-5 bg-slate-50/50 dark:bg-slate-950/20">
            <h4 className="font-bold text-slate-800 dark:text-white flex items-center space-x-2">
              <span className="bg-emerald-500 text-white rounded-full h-5 w-5 inline-flex items-center justify-center text-xs font-semibold">2</span>
              <span>Definir os Bairros</span>
            </h4>
            <p className="text-sm text-slate-500 mt-2">
              Use a lista ou o mapa interativo para habilitar a entrega nos bairros desejados e definir as taxas e prazos.
            </p>
            <Link
              href="/admin/neighborhoods"
              className="text-sm font-semibold text-emerald-600 hover:text-emerald-500 mt-4 inline-block"
            >
              Gerenciar bairros →
            </Link>
          </div>

          <div className="border border-slate-100 dark:border-slate-800 rounded-lg p-5 bg-slate-50/50 dark:bg-slate-950/20">
            <h4 className="font-bold text-slate-800 dark:text-white flex items-center space-x-2">
              <span className="bg-emerald-500 text-white rounded-full h-5 w-5 inline-flex items-center justify-center text-xs font-semibold">3</span>
              <span>Divulgar o Link</span>
            </h4>
            <p className="text-sm text-slate-500 mt-2">
              Compartilhe o site público com seus clientes para que eles consultem o frete sozinhos no WhatsApp.
            </p>
            <Link
              href="/"
              target="_blank"
              className="text-sm font-semibold text-emerald-600 hover:text-emerald-500 mt-4 inline-block"
            >
              Acessar site público →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
