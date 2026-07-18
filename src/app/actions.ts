'use server';

import { prisma } from '@/lib/prisma';
import { headers, cookies } from 'next/headers';
import crypto from 'crypto';

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

async function logSearchEvent({
  storeId,
  searchType,
  searchedValue,
  searchedNeighborhood,
  matchedNeighborhoodId,
  deliveryAvailable,
  deliveryPrice,
  responseTimeMs
}: {
  storeId: string;
  searchType: 'CEP' | 'ADDRESS' | 'LOCATION';
  searchedValue: string;
  searchedNeighborhood: string | null;
  matchedNeighborhoodId: string | null;
  deliveryAvailable: boolean;
  deliveryPrice: number;
  responseTimeMs: number;
}) {
  try {
    const headersList = await headers();
    const userAgent = headersList.get('user-agent') || 'unknown';
    const ip = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || '127.0.0.1';
    const ipHash = crypto.createHash('sha256').update(ip).digest('hex');

    const cookieStore = await cookies();
    let sessionId = cookieStore.get('ff_session_id')?.value;
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      cookieStore.set('ff_session_id', sessionId, {
        httpOnly: true,
        secure: true,
        maxAge: 60 * 60 * 24 * 365, // 1 year
        path: '/'
      });
    }

    await prisma.searchEvent.create({
      data: {
        storeId,
        eventType: 'SEARCH',
        searchType,
        searchedValue: searchedValue.length > 120 ? searchedValue.substring(0, 117) + '...' : searchedValue,
        searchedNeighborhood: searchedNeighborhood ? (searchedNeighborhood.length > 80 ? searchedNeighborhood.substring(0, 77) + '...' : searchedNeighborhood) : null,
        matchedNeighborhoodId,
        deliveryAvailable,
        deliveryPrice,
        responseTimeMs,
        sessionId,
        ipHash,
        userAgent
      }
    });
  } catch (error) {
    console.error('Error logging search event:', error);
  }
}

export async function lookupCep(storeSlug: string, rawCep: string): Promise<LookupResult> {
  const startTime = Date.now();
  const cleanedCep = rawCep.replace(/\D/g, '');
  if (cleanedCep.length !== 8) {
    return { success: false, error: 'CEP inválido. Deve conter 8 dígitos.' };
  }

  // Pre-fetch store to have storeId for logging
  const store = await prisma.store.findUnique({
    where: { slug: storeSlug }
  });

  if (!store) {
    return { success: false, error: 'Loja não encontrada.' };
  }

  try {
    const response = await fetch(`https://viacep.com.br/ws/${cleanedCep}/json/`);
    if (!response.ok) {
      const responseTimeMs = Date.now() - startTime;
      await logSearchEvent({
        storeId: store.id,
        searchType: 'CEP',
        searchedValue: rawCep,
        searchedNeighborhood: null,
        matchedNeighborhoodId: null,
        deliveryAvailable: false,
        deliveryPrice: 0,
        responseTimeMs
      });
      return { success: false, error: 'Erro ao consultar o serviço de CEP.' };
    }

    const data = await response.json();
    if (data.erro) {
      const responseTimeMs = Date.now() - startTime;
      await logSearchEvent({
        storeId: store.id,
        searchType: 'CEP',
        searchedValue: rawCep,
        searchedNeighborhood: null,
        matchedNeighborhoodId: null,
        deliveryAvailable: false,
        deliveryPrice: 0,
        responseTimeMs
      });
      return { success: false, error: 'CEP não encontrado.' };
    }

    // Verify if it is in Fortaleza
    const city = data.localidade || '';
    if (city.toLowerCase() !== 'fortaleza') {
      const rawBairro = data.bairro || 'Fora de Fortaleza';
      const responseTimeMs = Date.now() - startTime;
      await logSearchEvent({
        storeId: store.id,
        searchType: 'CEP',
        searchedValue: rawCep,
        searchedNeighborhood: rawBairro,
        matchedNeighborhoodId: null,
        deliveryAvailable: false,
        deliveryPrice: 0,
        responseTimeMs
      });
      return { 
        success: true, 
        deliveryEnabled: false, 
        bairro: rawBairro,
        error: 'Infelizmente entregamos apenas em Fortaleza (CE).' 
      };
    }

    const rawBairro = data.bairro || '';
    if (!rawBairro) {
      return { success: false, error: 'Não foi possível identificar o bairro para este CEP.' };
    }

    const normalizedBairro = normalizeName(rawBairro);
    
    // Query base neighborhood details
    const baseBairro = await prisma.baseNeighborhood.findUnique({
      where: { name: normalizedBairro }
    });

    if (!baseBairro) {
      const responseTimeMs = Date.now() - startTime;
      await logSearchEvent({
        storeId: store.id,
        searchType: 'CEP',
        searchedValue: rawCep,
        searchedNeighborhood: rawBairro,
        matchedNeighborhoodId: null,
        deliveryAvailable: false,
        deliveryPrice: 0,
        responseTimeMs
      });
      return {
        success: true,
        bairro: rawBairro,
        street: data.logradouro || '',
        deliveryEnabled: false,
        storeAddress: store.address,
        storeWhatsapp: store.whatsapp,
        pickupEnabled: store.pickupEnabled,
      };
    }

    // Query neighborhood rates
    const neighborhood = await prisma.neighborhood.findUnique({
      where: {
        storeId_baseNeighborhoodId: {
          storeId: store.id,
          baseNeighborhoodId: baseBairro.id
        }
      }
    });

    const responseTimeMs = Date.now() - startTime;

    if (!neighborhood) {
      await logSearchEvent({
        storeId: store.id,
        searchType: 'CEP',
        searchedValue: rawCep,
        searchedNeighborhood: baseBairro.officialName,
        matchedNeighborhoodId: baseBairro.id,
        deliveryAvailable: false,
        deliveryPrice: 0,
        responseTimeMs
      });
      return {
        success: true,
        bairro: baseBairro.officialName,
        street: data.logradouro || '',
        deliveryEnabled: false,
        storeAddress: store.address,
        storeWhatsapp: store.whatsapp,
        pickupEnabled: store.pickupEnabled,
      };
    }

    await logSearchEvent({
      storeId: store.id,
      searchType: 'CEP',
      searchedValue: rawCep,
      searchedNeighborhood: baseBairro.officialName,
      matchedNeighborhoodId: baseBairro.id,
      deliveryAvailable: neighborhood.deliveryEnabled,
      deliveryPrice: Number(neighborhood.fee),
      responseTimeMs
    });

    return {
      success: true,
      bairro: baseBairro.officialName,
      street: data.logradouro || '',
      deliveryEnabled: neighborhood.deliveryEnabled,
      fee: Number(neighborhood.fee),
      deliveryTime: neighborhood.deliveryTime || '24h',
      minimumOrder: neighborhood.minimumOrder ? Number(neighborhood.minimumOrder) : null,
      freeDeliveryThreshold: neighborhood.freeDeliveryThreshold ? Number(neighborhood.freeDeliveryThreshold) : null,
      notes: neighborhood.notes,
      storeAddress: store.address,
      storeWhatsapp: store.whatsapp,
      pickupEnabled: store.pickupEnabled,
    };

  } catch (error) {
    console.error('Error looking up CEP:', error);
    return { success: false, error: 'Ocorreu um erro ao processar sua consulta de CEP.' };
  }
}

export async function lookupAddress(storeSlug: string, rawAddress: string): Promise<LookupResult> {
  const startTime = Date.now();
  if (!rawAddress || rawAddress.trim().length < 5) {
    return { success: false, error: 'Endereço muito curto. Digite o nome da rua e número.' };
  }

  // Pre-fetch store to have storeId for logging
  const store = await prisma.store.findUnique({
    where: { slug: storeSlug }
  });

  if (!store) {
    return { success: false, error: 'Loja não encontrada.' };
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
      const responseTimeMs = Date.now() - startTime;
      await logSearchEvent({
        storeId: store.id,
        searchType: 'ADDRESS',
        searchedValue: rawAddress,
        searchedNeighborhood: null,
        matchedNeighborhoodId: null,
        deliveryAvailable: false,
        deliveryPrice: 0,
        responseTimeMs
      });
      return { success: false, error: 'Erro ao consultar o serviço de endereços.' };
    }

    const data = await response.json();
    if (!data || data.length === 0) {
      const responseTimeMs = Date.now() - startTime;
      await logSearchEvent({
        storeId: store.id,
        searchType: 'ADDRESS',
        searchedValue: rawAddress,
        searchedNeighborhood: null,
        matchedNeighborhoodId: null,
        deliveryAvailable: false,
        deliveryPrice: 0,
        responseTimeMs
      });
      return { success: false, error: 'Endereço não localizado em Fortaleza. Tente incluir o número ou ajustar a grafia.' };
    }

    const result = data[0];
    const addressDetails = result.address || {};
    
    // Verify it is inside Fortaleza
    const city = addressDetails.city || addressDetails.town || addressDetails.municipality || '';
    if (city.toLowerCase() !== 'fortaleza') {
      const responseTimeMs = Date.now() - startTime;
      await logSearchEvent({
        storeId: store.id,
        searchType: 'ADDRESS',
        searchedValue: rawAddress,
        searchedNeighborhood: 'Fora de Fortaleza',
        matchedNeighborhoodId: null,
        deliveryAvailable: false,
        deliveryPrice: 0,
        responseTimeMs
      });
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
    
    // Query base neighborhood details
    const baseBairro = await prisma.baseNeighborhood.findUnique({
      where: { name: normalizedBairro }
    });

    // Extract street name
    const street = addressDetails.road || '';

    if (!baseBairro) {
      const responseTimeMs = Date.now() - startTime;
      await logSearchEvent({
        storeId: store.id,
        searchType: 'ADDRESS',
        searchedValue: rawAddress,
        searchedNeighborhood: rawBairro,
        matchedNeighborhoodId: null,
        deliveryAvailable: false,
        deliveryPrice: 0,
        responseTimeMs
      });
      return {
        success: true,
        bairro: rawBairro,
        street,
        deliveryEnabled: false,
        storeAddress: store.address,
        storeWhatsapp: store.whatsapp,
        pickupEnabled: store.pickupEnabled,
      };
    }

    // Query neighborhood rates
    const neighborhood = await prisma.neighborhood.findUnique({
      where: {
        storeId_baseNeighborhoodId: {
          storeId: store.id,
          baseNeighborhoodId: baseBairro.id
        }
      }
    });

    const responseTimeMs = Date.now() - startTime;

    if (!neighborhood) {
      await logSearchEvent({
        storeId: store.id,
        searchType: 'ADDRESS',
        searchedValue: rawAddress,
        searchedNeighborhood: baseBairro.officialName,
        matchedNeighborhoodId: baseBairro.id,
        deliveryAvailable: false,
        deliveryPrice: 0,
        responseTimeMs
      });
      return {
        success: true,
        bairro: baseBairro.officialName,
        street,
        deliveryEnabled: false,
        storeAddress: store.address,
        storeWhatsapp: store.whatsapp,
        pickupEnabled: store.pickupEnabled,
      };
    }

    await logSearchEvent({
      storeId: store.id,
      searchType: 'ADDRESS',
      searchedValue: rawAddress,
      searchedNeighborhood: baseBairro.officialName,
      matchedNeighborhoodId: baseBairro.id,
      deliveryAvailable: neighborhood.deliveryEnabled,
      deliveryPrice: Number(neighborhood.fee),
      responseTimeMs
    });

    return {
      success: true,
      bairro: baseBairro.officialName,
      street,
      deliveryEnabled: neighborhood.deliveryEnabled,
      fee: Number(neighborhood.fee),
      deliveryTime: neighborhood.deliveryTime || '24h',
      minimumOrder: neighborhood.minimumOrder ? Number(neighborhood.minimumOrder) : null,
      freeDeliveryThreshold: neighborhood.freeDeliveryThreshold ? Number(neighborhood.freeDeliveryThreshold) : null,
      notes: neighborhood.notes,
      storeAddress: store.address,
      storeWhatsapp: store.whatsapp,
      pickupEnabled: store.pickupEnabled,
    };

  } catch (error) {
    console.error('Error looking up Address:', error);
    return { success: false, error: 'Ocorreu um erro ao processar sua consulta de endereço.' };
  }
}

export async function lookupCoords(storeSlug: string, lat: number, lon: number): Promise<LookupResult> {
  const startTime = Date.now();
  
  // Pre-fetch store to have storeId for logging
  const store = await prisma.store.findUnique({
    where: { slug: storeSlug }
  });

  if (!store) {
    return { success: false, error: 'Loja não encontrada.' };
  }

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'FreteFortalApp/1.0 (contact: admin@fretefortal.com)'
        }
      }
    );

    if (!response.ok) {
      const responseTimeMs = Date.now() - startTime;
      await logSearchEvent({
        storeId: store.id,
        searchType: 'LOCATION',
        searchedValue: `${lat.toFixed(6)}, ${lon.toFixed(6)}`,
        searchedNeighborhood: null,
        matchedNeighborhoodId: null,
        deliveryAvailable: false,
        deliveryPrice: 0,
        responseTimeMs
      });
      return { success: false, error: 'Erro ao consultar o serviço de localização.' };
    }

    const data = await response.json();
    if (!data || !data.address) {
      const responseTimeMs = Date.now() - startTime;
      await logSearchEvent({
        storeId: store.id,
        searchType: 'LOCATION',
        searchedValue: `${lat.toFixed(6)}, ${lon.toFixed(6)}`,
        searchedNeighborhood: null,
        matchedNeighborhoodId: null,
        deliveryAvailable: false,
        deliveryPrice: 0,
        responseTimeMs
      });
      return { success: false, error: 'Localização não identificada.' };
    }

    const addressDetails = data.address;
    
    // Verify it is inside Fortaleza
    const city = addressDetails.city || addressDetails.town || addressDetails.municipality || '';
    if (city.toLowerCase() !== 'fortaleza') {
      const responseTimeMs = Date.now() - startTime;
      await logSearchEvent({
        storeId: store.id,
        searchType: 'LOCATION',
        searchedValue: `${lat.toFixed(6)}, ${lon.toFixed(6)}`,
        searchedNeighborhood: 'Fora de Fortaleza',
        matchedNeighborhoodId: null,
        deliveryAvailable: false,
        deliveryPrice: 0,
        responseTimeMs
      });
      return { 
        success: true, 
        deliveryEnabled: false, 
        error: 'Infelizmente entregamos apenas em Fortaleza (CE).' 
      };
    }

    // Extract neighborhood (Nominatim suburbs represent bairros)
    const rawBairro = addressDetails.suburb || addressDetails.neighbourhood || addressDetails.quarter || addressDetails.city_district || '';
    if (!rawBairro) {
      return { success: false, error: 'Bairro não identificado na sua localização. Tente pesquisar por CEP.' };
    }

    const normalizedBairro = normalizeName(rawBairro);
    
    // Query base neighborhood details
    const baseBairro = await prisma.baseNeighborhood.findUnique({
      where: { name: normalizedBairro }
    });

    // Extract street name
    const street = addressDetails.road || '';

    if (!baseBairro) {
      const responseTimeMs = Date.now() - startTime;
      await logSearchEvent({
        storeId: store.id,
        searchType: 'LOCATION',
        searchedValue: `${lat.toFixed(6)}, ${lon.toFixed(6)}`,
        searchedNeighborhood: rawBairro,
        matchedNeighborhoodId: null,
        deliveryAvailable: false,
        deliveryPrice: 0,
        responseTimeMs
      });
      return {
        success: true,
        bairro: rawBairro,
        street,
        deliveryEnabled: false,
        storeAddress: store.address,
        storeWhatsapp: store.whatsapp,
        pickupEnabled: store.pickupEnabled,
      };
    }

    // Query neighborhood rates
    const neighborhood = await prisma.neighborhood.findUnique({
      where: {
        storeId_baseNeighborhoodId: {
          storeId: store.id,
          baseNeighborhoodId: baseBairro.id
        }
      }
    });

    const responseTimeMs = Date.now() - startTime;

    if (!neighborhood) {
      await logSearchEvent({
        storeId: store.id,
        searchType: 'LOCATION',
        searchedValue: `${lat.toFixed(6)}, ${lon.toFixed(6)}`,
        searchedNeighborhood: baseBairro.officialName,
        matchedNeighborhoodId: baseBairro.id,
        deliveryAvailable: false,
        deliveryPrice: 0,
        responseTimeMs
      });
      return {
        success: true,
        bairro: baseBairro.officialName,
        street,
        deliveryEnabled: false,
        storeAddress: store.address,
        storeWhatsapp: store.whatsapp,
        pickupEnabled: store.pickupEnabled,
      };
    }

    await logSearchEvent({
      storeId: store.id,
      searchType: 'LOCATION',
      searchedValue: `${lat.toFixed(6)}, ${lon.toFixed(6)}`,
      searchedNeighborhood: baseBairro.officialName,
      matchedNeighborhoodId: baseBairro.id,
      deliveryAvailable: neighborhood.deliveryEnabled,
      deliveryPrice: Number(neighborhood.fee),
      responseTimeMs
    });

    return {
      success: true,
      bairro: baseBairro.officialName,
      street,
      deliveryEnabled: neighborhood.deliveryEnabled,
      fee: Number(neighborhood.fee),
      deliveryTime: neighborhood.deliveryTime || '24h',
      minimumOrder: neighborhood.minimumOrder ? Number(neighborhood.minimumOrder) : null,
      freeDeliveryThreshold: neighborhood.freeDeliveryThreshold ? Number(neighborhood.freeDeliveryThreshold) : null,
      notes: neighborhood.notes,
      storeAddress: store.address,
      storeWhatsapp: store.whatsapp,
      pickupEnabled: store.pickupEnabled,
    };

  } catch (error) {
    console.error('Error looking up Coordinates:', error);
    return { success: false, error: 'Ocorreu um erro ao processar sua consulta de localização.' };
  }
}
