import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const linesOfBusiness = await prisma.lineOfBusiness.findMany({
      where: {
        isActive: true,
      },
      orderBy: [
        { sortOrder: 'asc' },
        { name: 'asc' },
      ],
      select: {
        id: true,
        code: true,
        name: true,
        isActive: true,
        sortOrder: true,
      },
    });

    return NextResponse.json(linesOfBusiness);
  } catch (error) {
    console.error('Error fetching lines of business:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar ramos de atuação' },
      { status: 500 }
    );
  }
}
