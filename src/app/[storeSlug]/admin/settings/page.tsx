import { prisma } from '@/lib/prisma';
import SettingsForm from '@/components/SettingsForm';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ storeSlug: string }>;
}

export default async function SettingsPage({ params }: PageProps) {
  const { storeSlug } = await params;

  // Find the store
  const store = await prisma.store.findUnique({
    where: { slug: storeSlug },
    include: {
      pickupPoints: true
    }
  });

  if (!store) {
    notFound();
  }

  // Convert fields for props serialization
  const serializedStore = {
    id: store.id,
    name: store.name,
    whatsapp: store.whatsapp,
    address: store.address,
    operatingHours: store.operatingHours,
    pickupEnabled: store.pickupEnabled,
    logoUrl: store.logoUrl,
    bannerUrl: store.bannerUrl,
    description: store.description,
    instagram: store.instagram,
    catalogUrl: store.catalogUrl,
    websiteUrl: store.websiteUrl,
    operatingHoursJson: store.operatingHoursJson ? JSON.parse(JSON.stringify(store.operatingHoursJson)) : null,
    deliveryTimeDefault: store.deliveryTimeDefault,
    deliveryAvailableMsg: store.deliveryAvailableMsg,
    deliveryUnavailableMsg: store.deliveryUnavailableMsg,
    sameDayCutoff: store.sameDayCutoff,
    cutoffMessage: store.cutoffMessage,
    pickupPoints: store.pickupPoints.map(p => ({
      id: p.id,
      name: p.name || '',
      address: p.address,
      latitude: p.latitude,
      longitude: p.longitude,
      instructions: p.instructions || ''
    }))
  };

  return (
    <div className="max-w-2xl mx-auto flex flex-col justify-center min-h-[calc(100vh-12rem)] space-y-6 py-4 animate-fadeIn">
      <div className="text-center border-b border-slate-900 pb-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-white bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
          Configurações da Loja
        </h1>
      </div>

      <div className="w-full">
        <SettingsForm initialStore={serializedStore} />
      </div>
    </div>
  );
}
