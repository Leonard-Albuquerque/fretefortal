import { prisma } from '@/lib/prisma';
import PublicLookup from '@/components/PublicLookup';
import { Motorbike, Clock, MapPin, Settings } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Consulte seu Frete - Fortaleza',
  description: 'Descubra rapidamente se entregamos no seu bairro, o valor da taxa de entrega e o prazo.',
};

export default async function Home() {
  // Get store details
  let store = await prisma.store.findFirst();

  if (!store) {
    // Fallback if not seeded yet
    store = await prisma.store.create({
      data: {
        name: "Fortal Express",
        whatsapp: "5585999999999",
        address: "Av. Beira Mar, 1000 - Meireles, Fortaleza - CE",
        operatingHours: "Segunda a Sábado: 09:00 às 21:00",
        pickupEnabled: true,
      },
    });
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors">
      {/* Top Navbar */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800/80 sticky top-0 z-50 transition-colors">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="bg-emerald-500 p-1.5 rounded-lg text-slate-900">
              <Motorbike className="h-5 w-5" />
            </div>
            <span className="font-bold text-lg text-slate-800 dark:text-white">{store.name}</span>
          </div>
          <Link
            href="/admin"
            className="text-xs font-semibold px-3 py-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 flex items-center space-x-1 transition-colors"
          >
            <Settings className="h-3.5 w-3.5" />
            <span>Área Administrativa</span>
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-12 flex flex-col items-center justify-center space-y-8">
        {/* Store Info Banner */}
        <div className="text-center space-y-4 max-w-xl">
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-800 dark:text-white sm:text-5xl">
            Consulte seu Frete
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
            Informe seu CEP ou endereço para verificar se entregamos no seu bairro de Fortaleza, a taxa cobrada e o prazo de entrega.
          </p>

          {/* Quick Stats/Hours */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <div className="flex items-center space-x-1 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-full border border-slate-200/60 dark:border-slate-800 shadow-sm">
              <Clock className="h-3.5 w-3.5 text-emerald-500" />
              <span>{store.operatingHours}</span>
            </div>
            {store.pickupEnabled && (
              <div className="flex items-center space-x-1 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-full border border-slate-200/60 dark:border-slate-800 shadow-sm">
                <MapPin className="h-3.5 w-3.5 text-emerald-500" />
                <span>Retirada no Local Habilitada</span>
              </div>
            )}
          </div>
        </div>

        {/* Public Lookup Interactive Interface */}
        <PublicLookup
          storeName={store.name}
          storeWhatsapp={store.whatsapp}
          pickupEnabled={store.pickupEnabled}
          storeAddress={store.address}
          operatingHours={store.operatingHours}
        />
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-slate-200 dark:border-slate-900 bg-white dark:bg-slate-900/40 text-center text-xs text-slate-400 mt-12 transition-colors">
        <p>&copy; {new Date().getFullYear()} {store.name}. Todos os direitos reservados.</p>
        <p className="mt-1 text-[10px] text-slate-500 dark:text-slate-500/80">
          Entregas realizadas exclusivamente na cidade de Fortaleza (CE).
        </p>
      </footer>
    </div>
  );
}
