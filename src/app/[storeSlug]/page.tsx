import { prisma } from '@/lib/prisma';
import PublicLookup from '@/components/PublicLookup';
import { Motorbike, Clock, MapPin, Settings } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ storeSlug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { storeSlug } = await params;
  const store = await prisma.store.findUnique({
    where: { slug: storeSlug },
  });

  return {
    title: store ? `Consulte seu Frete - ${store.name}` : 'Consulte seu Frete - Fortaleza',
    description: `Descubra rapidamente se entregamos no seu bairro, o valor da taxa de entrega e o prazo para ${store?.name || 'sua loja'}.`,
  };
}

export default async function StoreHome({ params }: PageProps) {
  const { storeSlug } = await params;

  // Get store details
  const store = await prisma.store.findUnique({
    where: { slug: storeSlug }
  });

  if (!store) {
    notFound();
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-955 text-slate-100 transition-colors">
      {/* Top Navbar */}
      <header className="bg-slate-950/80 backdrop-blur border-b border-slate-900 sticky top-0 z-50 transition-colors">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="bg-gradient-to-r from-[#1E3A5F] to-[#2F7DBB] p-1.5 rounded-lg text-white">
              <Motorbike className="h-5 w-5" />
            </div>
            <span className="font-bold text-lg text-white tracking-tight">{store.name}</span>
          </Link>
          {/* <Link
            href={`/${storeSlug}/admin`}
            className="text-xs font-semibold px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white flex items-center space-x-1.5 transition-all active:scale-95 cursor-pointer hover:border-slate-700"
          >
            <Settings className="h-3.5 w-3.5" />
            <span>Área Administrativa</span>
          </Link> */}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-12 flex flex-col items-center justify-center space-y-8">
        {/* Store Info Banner */}
        <div className="text-center space-y-4 max-w-xl">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            Consulte seu Frete
          </h1>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Informe seu CEP ou endereço para verificar se entregamos no seu bairro de Fortaleza, a taxa cobrada e o prazo de entrega.
          </p>

          {/* Quick Stats/Hours */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2 text-xs font-semibold text-slate-400">
            <div className="flex items-center space-x-1.5 bg-slate-900/40 px-3.5 py-1.5 rounded-full border border-slate-900 shadow-sm">
              <Clock className="h-3.5 w-3.5 text-[#5FC9C8]" />
              <span>{store.operatingHours}</span>
            </div>
            {store.pickupEnabled && (
              <div className="flex items-center space-x-1.5 bg-slate-900/40 px-3.5 py-1.5 rounded-full border border-slate-900 shadow-sm">
                <MapPin className="h-3.5 w-3.5 text-[#5FC9C8]" />
                <span>Retirada no Local Habilitada</span>
              </div>
            )}
          </div>
        </div>

        {/* Public Lookup Interactive Interface */}
        <PublicLookup
          storeSlug={storeSlug}
          storeName={store.name}
          storeWhatsapp={store.whatsapp}
          pickupEnabled={store.pickupEnabled}
          storeAddress={store.address}
          operatingHours={store.operatingHours}
        />
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-slate-900 bg-slate-950/20 text-center text-xs text-slate-500 mt-12 transition-colors">
        <p>&copy; {new Date().getFullYear()} {store.name}. Todos os direitos reservados.</p>
        <p className="mt-1 text-[10px] text-slate-600">
          Entregas realizadas exclusivamente na cidade de Fortaleza (CE).
        </p>
      </footer>
    </div>
  );
}
