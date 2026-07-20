import { prisma } from '@/lib/prisma';
import StoreSearch from '@/components/StoreSearch';
import { Motorbike } from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Encontre sua Loja - Cobertura085',
  description: 'Selecione um estabelecimento para consultar a taxa de entrega e o prazo para seu bairro em Fortaleza.',
};

export default async function HomePage() {
  const dbStores = await prisma.store.findMany({
    orderBy: {
      name: 'asc',
    },
    include: {
      neighborhoods: {
        select: {
          deliveryEnabled: true,
        },
      },
      _count: {
        select: {
          pickupPoints: true,
        },
      },
    },
  });

  const stores = dbStores.map((store) => ({
    id: store.id,
    slug: store.slug,
    logoUrl: store.logoUrl || null,
    name: store.name,
    address: store.address,
    operatingHours: store.operatingHours,
    pickupEnabled: store.pickupEnabled,
    hasDelivery: store.neighborhoods.some((n) => n.deliveryEnabled),
    pickupPointsCount: store._count.pickupPoints,
  }));

  return (
    <div className="flex flex-col min-h-screen bg-[#FFFDFB] text-slate-800 transition-colors">
      {/* Header Banner */}
      <header className="bg-white/80 backdrop-blur-md border-b border-[#F1ECE6] py-3 sticky top-0 z-50 transition-colors shadow-sm shadow-slate-900/5">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <img src="/logo.png" alt="Cobertura085 Logo" className="object-contain w-9 rounded-lg" />
            <span className="font-bold text-lg text-slate-900 tracking-tight">Cobertura085</span>
          </div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#0D9488] bg-[#F0FDFA] border border-[#CCFBF1] px-2.5 py-1 rounded-full shadow-xs">
            Fortaleza - CE
          </span>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-12 md:py-16 flex flex-col justify-center space-y-10">
        <div className="text-center space-y-4 max-w-xl mx-auto">
          <div className="inline-flex items-center space-x-2 bg-[#FFF4F0] border border-[#FFE3DC] px-3.5 py-1 rounded-full shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF8A65] animate-pulse"></span>
            <span className="text-[#E0533C] text-[10px] font-bold tracking-widest uppercase">
              ESTABELECIMENTOS
            </span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl bg-gradient-to-r from-[#2E5B9A] via-[#59C8CF] to-[#FFD7B5] bg-clip-text text-transparent">
            Encontre sua Loja
          </h1>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed font-normal">
            Selecione o estabelecimento onde deseja realizar seu pedido para consultar a taxa de entrega e o prazo para seu endereço.
          </p>
        </div>

        {/* Interactive Store Search Component */}
        <StoreSearch initialStores={stores} />
      </main>

      {/* Footer */}
      <footer className="py-8 border-t border-[#F1ECE6] bg-white/60 text-center text-xs text-slate-500 transition-colors mt-auto">
        <p className="font-medium">&copy; {new Date().getFullYear()} Cobertura085. Todos os direitos reservados.</p>
        <p className="mt-1 text-[10px] text-slate-400">
          Serviço disponível exclusivamente para a cidade de Fortaleza (CE).
        </p>
      </footer>
    </div>
  );
}
