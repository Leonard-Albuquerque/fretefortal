import { prisma } from '@/lib/prisma';
import NeighborhoodsConfigurator from '@/components/NeighborhoodsConfigurator';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ storeSlug: string }>;
}

export default async function NeighborhoodsPage({ params }: PageProps) {
  const { storeSlug } = await params;

  // Find the store
  const store = await prisma.store.findUnique({
    where: { slug: storeSlug }
  });

  if (!store) {
    notFound();
  }

  // Fetch only neighborhoods configs for this store, sorted alphabetically by official name
  const neighborhoods = await prisma.neighborhood.findMany({
    where: {
      storeId: store.id,
    },
    include: {
      baseNeighborhood: true,
    },
    orderBy: {
      baseNeighborhood: {
        officialName: 'asc',
      },
    },
  });

  // Serialize Decimal database types to Numbers for React Client Components props
  const serializedNeighborhoods = neighborhoods.map((n) => ({
    id: n.id,
    name: n.baseNeighborhood.name,
    officialName: n.baseNeighborhood.officialName,
    deliveryEnabled: n.deliveryEnabled,
    fee: Number(n.fee),
    deliveryTime: n.deliveryTime,
    minimumOrder: n.minimumOrder ? Number(n.minimumOrder) : null,
    freeDeliveryThreshold: n.freeDeliveryThreshold ? Number(n.freeDeliveryThreshold) : null,
    notes: n.notes,
  }));

  return (
    <div className="space-y-6 flex flex-col h-full animate-fadeIn">
      <div className="border-b border-[#F1ECE6] pb-6 space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
          Bairros e Taxas de Entrega
        </h1>
        <p className="text-sm text-slate-500">
          Gerencie a cobertura de frete por bairros de Fortaleza para a loja <strong>{store.name}</strong> utilizando a lista ou o mapa interativo.
        </p>
      </div>

      <NeighborhoodsConfigurator initialNeighborhoods={serializedNeighborhoods} />
    </div>
  );
}
