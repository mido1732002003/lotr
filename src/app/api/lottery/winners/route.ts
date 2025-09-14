import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET(req: NextRequest) {
  try {
    const winners = await prisma.ticket.findMany({
      where: { isWinner: true },
      include: {
        draw: true,
        wallet: true,
        payout: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    return NextResponse.json({ winners });
  } catch (error) {
    console.error('Failed to fetch winners:', error);
    return NextResponse.json(
      { error: 'Failed to fetch winners' },
      { status: 500 }
    );
  }
}