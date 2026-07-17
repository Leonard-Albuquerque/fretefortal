'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function updateStoreSettings(formData: FormData) {
  const id = formData.get('id') as string;
  const name = formData.get('name') as string;
  const whatsapp = formData.get('whatsapp') as string;
  const address = formData.get('address') as string;
  const operatingHours = formData.get('operatingHours') as string;
  const pickupEnabled = formData.get('pickupEnabled') === 'true';

  if (!id) {
    throw new Error('Store ID is required');
  }

  // Basic validation: clean WhatsApp number (remove non-digits)
  const cleanedWhatsapp = whatsapp.replace(/\D/g, '');

  await prisma.store.update({
    where: { id },
    data: {
      name: name || 'Minha Loja',
      whatsapp: cleanedWhatsapp || '5585999999999',
      address: address || 'Endereço da Loja, Fortaleza - CE',
      operatingHours: operatingHours || 'Segunda a Sexta: 08:00 às 18:00',
      pickupEnabled,
    },
  });

  revalidatePath('/admin');
  revalidatePath('/admin/settings');
  revalidatePath('/');
  return { success: true };
}
