'use server';

import { prisma } from '@/lib/prisma';

function normalizeName(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/[^a-z0-9\s-]/g, "") // Remove special characters except spaces and hyphens
    .trim();
}

interface LookupResult {
  success: boolean;
  bairro?: string;
  street?: string;
  deliveryEnabled?: boolean;
  fee?: number;
  deliveryTime?: string;
  minimumOrder?: number | null;
  freeDeliveryThreshold?: number | null;
  notes?: string | null;
  storeAddress?: string;
  storeWhatsapp?: string;
  pickupEnabled?: boolean;
  error?: string;
}

export async function lookupCep(rawCep: string): Promise<LookupResult> {
  const cleanedCep = rawCep.replace(/\D/g, '');
  if (cleanedCep.length !== 8) {
    return { success: false, error: 'CEP inválido. Deve conter 8 dígitos.' };
  }

  try {
    const response = await fetch(`https://viacep.com.br/ws/${cleanedCep}/json/`);
    if (!response.ok) {
      return { success: false, error: 'Erro ao consultar o serviço de CEP.' };
    }

    const data = await response.json();
    if (data.erro) {
      return { success: false, error: 'CEP não encontrado.' };
    }

    // Verify if it is in Fortaleza
    const city = data.localidade || '';
    if (city.toLowerCase() !== 'fortaleza') {
      return { 
        success: true, 
        deliveryEnabled: false, 
        bairro: data.bairro || 'Fora de Fortaleza',
        error: 'Infelizmente entregamos apenas em Fortaleza (CE).' 
      };
    }

    const rawBairro = data.bairro || '';
    if (!rawBairro) {
      return { success: false, error: 'Não foi possível identificar o bairro para este CEP.' };
    }

    const normalizedBairro = normalizeName(rawBairro);
    
    // Query store details
    const store = await prisma.store.findFirst();
    
    // Query neighborhood rates
    const neighborhood = await prisma.neighborhood.findUnique({
      where: { name: normalizedBairro }
    });

    if (!neighborhood) {
      return {
        success: true,
        bairro: rawBairro,
        street: data.logradouro || '',
        deliveryEnabled: false,
        storeAddress: store?.address,
        storeWhatsapp: store?.whatsapp,
        pickupEnabled: store?.pickupEnabled,
      };
    }

    return {
      success: true,
      bairro: neighborhood.officialName,
      street: data.logradouro || '',
      deliveryEnabled: neighborhood.deliveryEnabled,
      fee: Number(neighborhood.fee),
      deliveryTime: neighborhood.deliveryTime || '24h',
      minimumOrder: neighborhood.minimumOrder ? Number(neighborhood.minimumOrder) : null,
      freeDeliveryThreshold: neighborhood.freeDeliveryThreshold ? Number(neighborhood.freeDeliveryThreshold) : null,
      notes: neighborhood.notes,
      storeAddress: store?.address,
      storeWhatsapp: store?.whatsapp,
      pickupEnabled: store?.pickupEnabled,
    };

  } catch (error) {
    console.error('Error looking up CEP:', error);
    return { success: false, error: 'Ocorreu um erro ao processar sua consulta de CEP.' };
  }
}

export async function lookupAddress(rawAddress: string): Promise<LookupResult> {
  if (!rawAddress || rawAddress.trim().length < 5) {
    return { success: false, error: 'Endereço muito curto. Digite o nome da rua e número.' };
  }

  try {
    const query = `${rawAddress.trim()}, Fortaleza, Ceará, Brasil`;
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=1`,
      {
        headers: {
          'User-Agent': 'FreteFortalApp/1.0 (contact: admin@fretefortal.com)'
        }
      }
    );

    if (!response.ok) {
      return { success: false, error: 'Erro ao consultar o serviço de endereços.' };
    }

    const data = await response.json();
    if (!data || data.length === 0) {
      return { success: false, error: 'Endereço não localizado em Fortaleza. Tente incluir o número ou ajustar a grafia.' };
    }

    const result = data[0];
    const addressDetails = result.address || {};
    
    // Verify it is inside Fortaleza
    const city = addressDetails.city || addressDetails.town || addressDetails.municipality || '';
    if (city.toLowerCase() !== 'fortaleza') {
      return { 
        success: true, 
        deliveryEnabled: false, 
        error: 'Infelizmente entregamos apenas em Fortaleza (CE).' 
      };
    }

    // Extract neighborhood (Nominatim suburbs represent bairros)
    const rawBairro = addressDetails.suburb || addressDetails.neighbourhood || addressDetails.quarter || addressDetails.city_district || '';
    if (!rawBairro) {
      return { success: false, error: 'Bairro não identificado. Tente pesquisar informando o CEP.' };
    }

    const normalizedBairro = normalizeName(rawBairro);
    
    // Query store details
    const store = await prisma.store.findFirst();

    // Query neighborhood rates
    const neighborhood = await prisma.neighborhood.findUnique({
      where: { name: normalizedBairro }
    });

    // Extract street name
    const street = addressDetails.road || '';

    if (!neighborhood) {
      return {
        success: true,
        bairro: rawBairro,
        street,
        deliveryEnabled: false,
        storeAddress: store?.address,
        storeWhatsapp: store?.whatsapp,
        pickupEnabled: store?.pickupEnabled,
      };
    }

    return {
      success: true,
      bairro: neighborhood.officialName,
      street,
      deliveryEnabled: neighborhood.deliveryEnabled,
      fee: Number(neighborhood.fee),
      deliveryTime: neighborhood.deliveryTime || '24h',
      minimumOrder: neighborhood.minimumOrder ? Number(neighborhood.minimumOrder) : null,
      freeDeliveryThreshold: neighborhood.freeDeliveryThreshold ? Number(neighborhood.freeDeliveryThreshold) : null,
      notes: neighborhood.notes,
      storeAddress: store?.address,
      storeWhatsapp: store?.whatsapp,
      pickupEnabled: store?.pickupEnabled,
    };

  } catch (error) {
    console.error('Error looking up Address:', error);
    return { success: false, error: 'Ocorreu um erro ao processar sua consulta de endereço.' };
  }
}
