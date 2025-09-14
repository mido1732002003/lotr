import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET(req: NextRequest) {
  try {
    const draw = await prisma.draw.findFirst({
      where: {
        status: 'ACTIVE',
      },
      include: {
        _count: {
          select: { tickets: true },
        },
      },
    });

    return NextResponse.json({ draw });
  } catch (error) {
    console.error('Failed to fetch current draw:', error);
    return NextResponse.json(
      { error: 'Failed to fetch current draw' },
      { status: 500 }
    );
  }
}