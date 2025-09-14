import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/db/prisma';

export async function GET(req: NextRequest) {
  const cookieStore = cookies();
  const adminAuth = cookieStore.get('admin-auth');
  
  if (!adminAuth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const payouts = await prisma.payout.findMany({
      where: { status: 'PENDING' },
      include: {
        ticket: {
          include: {
            draw: true,
            wallet: true,
          },
        },
      },
    });
    
    return NextResponse.json({ payouts });
  } catch (error) {
    console.error('Failed to fetch payouts:', error);
    return NextResponse.json({ error: 'Failed to fetch payouts' }, { status: 500 });
  }
}