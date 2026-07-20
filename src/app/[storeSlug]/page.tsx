import { prisma } from '@/lib/prisma';
import PublicLookup from '@/components/PublicLookup';
import { Motorbike, Clock, MapPin, Settings, Building2 } from 'lucide-react';
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
    where: { slug: storeSlug },
    include: {
      pickupPoints: true
    }
  });

  if (!store) {
    notFound();
  }

  // Fetch all neighborhoods for this store
  const dbNeighborhoods = await prisma.neighborhood.findMany({
    where: { storeId: store.id },
    include: {
      baseNeighborhood: true
    }
  });

  const initialNeighborhoods = dbNeighborhoods.map((n) => ({
    id: n.id,
    name: n.baseNeighborhood.name,
    officialName: n.baseNeighborhood.officialName,
    deliveryEnabled: n.deliveryEnabled,
    fee: Number(n.fee),
    deliveryTime: n.deliveryTime,
    minimumOrder: n.minimumOrder ? Number(n.minimumOrder) : null,
    freeDeliveryThreshold: n.freeDeliveryThreshold ? Number(n.freeDeliveryThreshold) : null,
    notes: n.notes
  }));

  const serializedPickupPoints = store.pickupPoints.map((p) => ({
    id: p.id,
    name: p.name || '',
    address: p.address,
    latitude: p.latitude,
    longitude: p.longitude,
    instructions: p.instructions || ''
  }));

  return (
    <div className="flex flex-col min-h-screen bg-[#FFFDFB] text-slate-800 transition-colors">
      {/* Top Navbar */}
      <header className="bg-white/80 backdrop-blur-md border-b border-[#F1ECE6] sticky top-0 z-50 transition-colors shadow-sm shadow-slate-900/5">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2.5">
            {store.logoUrl ?
              <div className="flex items-center">
                <img src={store.logoUrl} alt={store.name} className="object-contain w-9 h-9 rounded-xl border border-slate-100 shadow-xs" />
              </div>
              :
              <div className="bg-gradient-to-r from-[#0D9488] to-[#14B8A6] p-2 rounded-xl text-white shadow-xs">
                <Building2 className="h-5 w-5" />
              </div>
            }
            <span className="font-bold text-lg text-slate-900 tracking-tight">{store.name}</span>
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 relative w-full h-[calc(100vh-4rem)] overflow-hidden bg-[#FFFDFB] flex flex-col">
        <PublicLookup
          storeSlug={storeSlug}
          storeName={store.name}
          storeWhatsapp={store.whatsapp}
          pickupEnabled={store.pickupEnabled}
          storeAddress={store.address}
          operatingHours={store.operatingHours}
          initialNeighborhoods={initialNeighborhoods}
          logoUrl={store.logoUrl}
          bannerUrl={store.bannerUrl}
          description={store.description}
          instagram={store.instagram}
          catalogUrl={store.catalogUrl}
          websiteUrl={store.websiteUrl}
          deliveryTimeDefault={store.deliveryTimeDefault}
          deliveryAvailableMsg={store.deliveryAvailableMsg}
          deliveryUnavailableMsg={store.deliveryUnavailableMsg}
          sameDayCutoff={store.sameDayCutoff}
          cutoffMessage={store.cutoffMessage}
          pickupPoints={serializedPickupPoints}
        />
      </main>
    </div>
  );
}
