'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

interface PickupPointInput {
  name?: string;
  address: string;
  latitude?: number;
  longitude?: number;
  instructions?: string;
}

interface OperatingHourDay {
  day: number;
  label: string;
  open: boolean;
  openTime: string;
  closeTime: string;
}

function formatOperatingHours(hours: OperatingHourDay[]): string {
  if (!Array.isArray(hours) || hours.length === 0) {
    return 'Segunda a Sexta: 08:00 às 18:00';
  }
  
  const formattedDays = hours.map((h) => {
    if (!h.open) return `${h.label.substring(0, 3)}: Fechado`;
    return `${h.label.substring(0, 3)}: ${h.openTime}-${h.closeTime}`;
  });
  
  return formattedDays.join(', ');
}

export async function updateStoreSettings(formData: FormData, storeSlug: string) {
  const id = formData.get('id') as string;
  const name = formData.get('name') as string;
  const whatsapp = formData.get('whatsapp') as string;
  const address = formData.get('address') as string; // Keep as fallback address
  const pickupEnabled = formData.get('pickupEnabled') === 'true';

  // New fields
  const logoUrl = formData.get('logoUrl') as string;
  const bannerUrl = formData.get('bannerUrl') as string;
  const description = formData.get('description') as string;
  const instagram = formData.get('instagram') as string;
  const catalogUrl = formData.get('catalogUrl') as string;
  const websiteUrl = formData.get('websiteUrl') as string;
  
  const deliveryTimeDefault = formData.get('deliveryTimeDefault') as string;
  const deliveryAvailableMsg = formData.get('deliveryAvailableMsg') as string;
  const deliveryUnavailableMsg = formData.get('deliveryUnavailableMsg') as string;
  const sameDayCutoff = formData.get('sameDayCutoff') as string;
  const cutoffMessage = formData.get('cutoffMessage') as string;

  // Line of business fields & validation
  const rawLineOfBusiness = formData.get('lineOfBusiness') as string | null;
  const rawCustomLineOfBusiness = formData.get('customLineOfBusiness') as string | null;

  let finalLineOfBusiness: string | null = null;
  let finalCustomLineOfBusiness: string | null = null;

  if (rawLineOfBusiness && rawLineOfBusiness.trim() !== '') {
    const trimmedLob = rawLineOfBusiness.trim();
    if (trimmedLob === 'other') {
      const trimmedCustom = rawCustomLineOfBusiness ? rawCustomLineOfBusiness.trim() : '';
      if (!trimmedCustom) {
        throw new Error('É necessário preencher o ramo de atuação personalizado para a opção "Outro".');
      }
      finalLineOfBusiness = 'other';
      finalCustomLineOfBusiness = trimmedCustom;
    } else {
      // Validate that code exists in LineOfBusiness and is active
      const validLob = await prisma.lineOfBusiness.findFirst({
        where: { code: trimmedLob, isActive: true },
      });
      if (!validLob) {
        throw new Error(`Ramo de atuação inválido ("${trimmedLob}"). Selecione uma opção válida da lista.`);
      }
      finalLineOfBusiness = validLob.code;
      finalCustomLineOfBusiness = null;
    }
  }

  // JSON structured arrays passed as strings
  const operatingHoursJsonStr = formData.get('operatingHoursJson') as string;
  const pickupPointsJsonStr = formData.get('pickupPoints') as string;

  if (!id) {
    throw new Error('Store ID is required');
  }

  // Basic validation: clean WhatsApp number (remove non-digits)
  const cleanedWhatsapp = whatsapp.replace(/\D/g, '');

  let operatingHoursJson: OperatingHourDay[] | null = null;
  let operatingHoursFormatted = 'Segunda a Sexta: 08:00 às 18:00';

  if (operatingHoursJsonStr) {
    try {
      operatingHoursJson = JSON.parse(operatingHoursJsonStr);
      if (operatingHoursJson) {
        operatingHoursFormatted = formatOperatingHours(operatingHoursJson);
      }
    } catch (e) {
      console.error('Error parsing operatingHoursJson:', e);
    }
  }

  let pickupPointsInput: PickupPointInput[] = [];
  if (pickupPointsJsonStr) {
    try {
      pickupPointsInput = JSON.parse(pickupPointsJsonStr);
    } catch (e) {
      console.error('Error parsing pickupPoints:', e);
    }
  }

  // Update store details
  await prisma.$transaction(async (tx) => {
    // 1. Update store columns
    await tx.store.update({
      where: { id },
      data: {
        name: name || 'Minha Loja',
        whatsapp: cleanedWhatsapp || '5585999999999',
        address: address || 'Endereço da Loja, Fortaleza - CE',
        operatingHours: operatingHoursFormatted,
        operatingHoursJson: operatingHoursJson as any,
        pickupEnabled,
        logoUrl: logoUrl || null,
        bannerUrl: bannerUrl || null,
        description: description || null,
        instagram: instagram || null,
        catalogUrl: catalogUrl || null,
        websiteUrl: websiteUrl || null,
        deliveryTimeDefault: deliveryTimeDefault || '2 horas',
        deliveryAvailableMsg: deliveryAvailableMsg || null,
        deliveryUnavailableMsg: deliveryUnavailableMsg || null,
        sameDayCutoff: sameDayCutoff || null,
        cutoffMessage: cutoffMessage || null,
        lineOfBusiness: finalLineOfBusiness,
        customLineOfBusiness: finalCustomLineOfBusiness,
      },
    });

    // 2. Sync pickup points: delete all and recreate
    await tx.pickupPoint.deleteMany({
      where: { storeId: id },
    });

    if (pickupPointsInput.length > 0) {
      await tx.pickupPoint.createMany({
        data: pickupPointsInput.map((p) => ({
          storeId: id,
          name: p.name || null,
          address: p.address,
          latitude: p.latitude ? parseFloat(p.latitude as any) : null,
          longitude: p.longitude ? parseFloat(p.longitude as any) : null,
          instructions: p.instructions || null,
        })),
      });
    }
  });

  revalidatePath(`/${storeSlug}/admin`);
  revalidatePath(`/${storeSlug}/admin/settings`);
  revalidatePath(`/${storeSlug}`);
  return { success: true };
}
