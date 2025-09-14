import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/db/prisma';
import { DrawService } from '@/lib/lottery/draw.service';

export async function POST(req: NextRequest) {
  const cookieStore = cookies();
  const adminAuth = cookieStore.get('admin-auth');
  
  if (!adminAuth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const body = await req.json();
    
    const draw = await DrawService.createDraw({
      title: body.title,
      description: body.description,
      ticketPrice: body.ticketPrice,
      currency: body.currency || 'USDC',
      maxTickets: body.maxTickets,
      scheduledAt: new Date(body.scheduledAt),
    });
    
    return NextResponse.json({ success: true, draw });
  } catch (error) {
    console.error('Failed to create draw:', error);
    return NextResponse.json(
      { error: 'Failed to create draw' },
      { status: 500 }
    );
  }
}