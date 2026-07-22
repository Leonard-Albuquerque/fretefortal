import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { headers, cookies } from 'next/headers';
import crypto from 'crypto';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const startTime = Date.now();
  const { token } = await params;

  if (!token) {
    return new NextResponse('QR Code inválido', { status: 404 });
  }

  const store = await prisma.store.findUnique({
    where: { qrToken: token }
  });

  if (!store) {
    return new NextResponse('QR Code inválido', { status: 404 });
  }

  // Log metric to SearchEvent
  try {
    const headersList = await headers();
    const userAgent = headersList.get('user-agent') || 'unknown';
    const ip = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || '127.0.0.1';
    const ipHash = crypto.createHash('sha256').update(ip).digest('hex');

    const cookieStore = await cookies();
    let sessionId = cookieStore.get('ff_session_id')?.value;
    if (!sessionId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(sessionId)) {
      sessionId = crypto.randomUUID();
    }

    await prisma.searchEvent.create({
      data: {
        storeId: store.id,
        eventType: 'QR_REDIRECT',
        searchType: 'QR_CODE',
        searchedValue: token,
        searchedNeighborhood: null,
        matchedNeighborhoodId: null,
        deliveryAvailable: true,
        deliveryPrice: 0,
        responseTimeMs: Date.now() - startTime,
        sessionId,
        ipHash,
        userAgent
      }
    });
  } catch (error) {
    console.error('Error logging QR code redirect event:', error);
  }

  // HTTP 302 Redirect to current store slug
  const targetUrl = new URL(`/${store.slug}`, request.url);
  return NextResponse.redirect(targetUrl, 302);
}
