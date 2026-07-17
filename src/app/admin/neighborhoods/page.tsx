import { prisma } from '@/lib/prisma';
import NeighborhoodsConfigurator from '@/components/NeighborhoodsConfigurator';

export const dynamic = 'force-dynamic';

export default async function NeighborhoodsPage() {
  // Fetch all neighborhoods sorted alphabetically
  const neighborhoods = await prisma.neighborhood.findMany({
    orderBy: {
      officialName: 'asc',
    },
  });

  // Serialize Decimal database types to Numbers for React Client Components props
  const serializedNeighborhoods = neighborhoods.map((n) => ({
    id: n.id,
    name: n.name,
    officialName: n.officialName,
    deliveryEnabled: n.deliveryEnabled,
    fee: Number(n.fee),
    deliveryTime: n.deliveryTime,
    minimumOrder: n.minimumOrder ? Number(n.minimumOrder) : null,
    freeDeliveryThreshold: n.freeDeliveryThreshold ? Number(n.freeDeliveryThreshold) : null,
    notes: n.notes,
  }));

  return (
    <div className="space-y-6 flex flex-col h-full">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Bairros e Taxas de Entrega</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">
          Gerencie a cobertura de frete por bairros de Fortaleza utilizando a lista ou o mapa interativo.
        </p>
      </div>

      <NeighborhoodsConfigurator initialNeighborhoods={serializedNeighborhoods} />
    </div>
  );
}
