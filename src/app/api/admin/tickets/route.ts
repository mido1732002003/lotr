import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/db/prisma';

export async function GET(req: NextRequest) {
  // Check admin auth
  const cookieStore = cookies();
  const adminAuth = cookieStore.get('admin-auth');
  
  if (!adminAuth) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  try {
    const tickets = await prisma.ticket.findMany({
      include: {
        draw: true,
        user: true,
        wallet: true,
        payment: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    
    return NextResponse.json({ tickets });
  } catch (error) {
    console.error('Failed to fetch tickets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tickets' },
      { status: 500 }
    );
  }
}