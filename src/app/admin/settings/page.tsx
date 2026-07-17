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

  // Convert decimal/other fields if necessary. 
  // Our Prisma model uses String and Boolean, which matches our frontend props perfectly.
  const serializedStore = {
    id: store.id,
    name: store.name,
    whatsapp: store.whatsapp,
    address: store.address,
    operatingHours: store.operatingHours,
    pickupEnabled: store.pickupEnabled,
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Configurações da Loja</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">
          Defina as informações de contato, endereço físico e horário de funcionamento da loja.
        </p>
      </div>

      <SettingsForm initialStore={serializedStore} />
    </div>
  );
}
