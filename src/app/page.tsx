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
  }));

  return (
    <div className="flex flex-col min-h-screen bg-slate-955 text-slate-100 transition-colors">
      {/* Header Banner */}
      <header className="bg-slate-950/80 backdrop-blur border-b border-slate-900 py-2 sticky top-0 z-50 transition-colors">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center">
            <img src="/logo.png" alt="Cobertura085 Logo" className=" object-contain  w-10 rounded-lg text-white flex items-center justify-center" />
            <span className="font-bold text-lg text-white tracking-tight">Cobertura085</span>
          </div>
          {/* <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#5FC9C8] bg-[#5FC9C8]/10 border border-[#5FC9C8]/10 px-1.5 py-1 rounded-full">
            Fortaleza - CE
          </span> */}
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-16 flex flex-col justify-center space-y-12">
        <div className="text-center space-y-4 max-w-xl mx-auto">
          <span className="bg-[#5FC9C8]/10 text-[#5FC9C8] text-[10px] font-bold tracking-widest px-3 py-1 rounded-full border border-[#5FC9C8]/10 uppercase">
            ESTABELECIMENTOS
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            Encontre sua Loja
          </h1>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Selecione o estabelecimento onde deseja realizar seu pedido para consultar a taxa de entrega e o prazo para seu endereço.
          </p>
        </div>

        {/* Interactive Store Search Component */}
        <StoreSearch initialStores={stores} />
      </main>

      {/* Footer */}
      <footer className="py-8 border-t border-slate-900 bg-slate-950/20 text-center text-xs text-slate-500 transition-colors mt-auto">
        <p>&copy; {new Date().getFullYear()} Cobertura085. Todos os direitos reservados.</p>
        <p className="mt-1 text-[10px] text-slate-600">
          Serviço disponível exclusivamente para a cidade de Fortaleza (CE).
        </p>
      </footer>
    </div>
  );
}
