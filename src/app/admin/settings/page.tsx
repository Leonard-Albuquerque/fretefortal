import { prisma } from '@/lib/prisma';
import SettingsForm from '@/components/SettingsForm';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  // Get the store settings
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

  // Convert fields for props serialization
  const serializedStore = {
    id: store.id,
    name: store.name,
    whatsapp: store.whatsapp,
    address: store.address,
    operatingHours: store.operatingHours,
    pickupEnabled: store.pickupEnabled,
  };

  return (
    <div className="max-w-2xl mx-auto flex flex-col justify-center min-h-[calc(100vh-12rem)] space-y-6 py-4">
      <div className="text-center">
        <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">Configurações da Loja</h1>
        {/* <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm max-w-md mx-auto leading-relaxed">
          Defina as informações de contato, endereço físico e horário de funcionamento da loja.
        </p> */}
      </div>

      <div className="w-full">
        <SettingsForm initialStore={serializedStore} />
      </div>
    </div>
  );
}
