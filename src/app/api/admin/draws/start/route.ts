import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { DrawService } from '@/lib/lottery/draw.service';

export async function POST(req: NextRequest) {
  const cookieStore = cookies();
  const adminAuth = cookieStore.get('admin-auth');
  
  if (!adminAuth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const { drawId } = await req.json();
    
    const draw = await DrawService.startDraw(drawId);
    
    return NextResponse.json({ success: true, draw });
  } catch (error) {
    console.error('Failed to start draw:', error);
    return NextResponse.json(
      { error: 'Failed to start draw' },
      { status: 500 }
    );
  }
}