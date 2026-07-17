'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

interface NeighborhoodInput {
  deliveryEnabled: boolean;
  fee: number;
  deliveryTime: string;
  minimumOrder: number | null;
  freeDeliveryThreshold: number | null;
  notes: string | null;
}

export async function updateNeighborhood(id: string, data: NeighborhoodInput) {
  if (!id) {
    throw new Error('Neighborhood ID is required');
  }

  await prisma.neighborhood.update({
    where: { id },
    data: {
      deliveryEnabled: data.deliveryEnabled,
      fee: data.fee,
      deliveryTime: data.deliveryTime || '24h',
      minimumOrder: data.minimumOrder,
      freeDeliveryThreshold: data.freeDeliveryThreshold,
      notes: data.notes,
    },
  });

  revalidatePath('/admin');
  revalidatePath('/admin/neighborhoods');
  revalidatePath('/');
  return { success: true };
}

export async function updateMultipleNeighborhoods(ids: string[], data: Partial<NeighborhoodInput>) {
  if (!ids || ids.length === 0) {
    throw new Error('At least one Neighborhood ID is required');
  }

  const updateData: any = {};
  if (data.deliveryEnabled !== undefined) updateData.deliveryEnabled = data.deliveryEnabled;
  if (data.fee !== undefined) updateData.fee = data.fee;
  if (data.deliveryTime !== undefined) updateData.deliveryTime = data.deliveryTime;
  if (data.minimumOrder !== undefined) updateData.minimumOrder = data.minimumOrder;
  if (data.freeDeliveryThreshold !== undefined) updateData.freeDeliveryThreshold = data.freeDeliveryThreshold;
  if (data.notes !== undefined) updateData.notes = data.notes;

  await prisma.neighborhood.updateMany({
    where: {
      id: { in: ids }
    },
    data: updateData
  });

  revalidatePath('/admin');
  revalidatePath('/admin/neighborhoods');
  revalidatePath('/');
  return { success: true };
}
