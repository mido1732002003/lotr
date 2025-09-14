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
    const draws = await prisma.draw.findMany({
      where: {
        status: { in: ['UPCOMING', 'ACTIVE'] },
      },
      include: {
        _count: { select: { tickets: true } },
      },
      orderBy: { scheduledAt: 'asc' },
    });
    
    return NextResponse.json({ draws });
  } catch (error) {
    console.error('Failed to fetch draws:', error);
    return NextResponse.json({ error: 'Failed to fetch draws' }, { status: 500 });
  }
}