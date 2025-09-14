import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { DrawService } from '@/lib/lottery/draw.service';
import { runDrawSchema } from '@/lib/validation/draw.schema';

export async function POST(req: NextRequest) {
  try {
    // Check admin auth
    const cookieStore = cookies();
    const adminAuth = cookieStore.get('admin-auth');
    
    if (!adminAuth) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const body = await req.json();
    const validated = runDrawSchema.parse(body);
    
    const result = await DrawService.runDraw(
      validated.drawId,
      validated.blockchainAnchor
    );
    
    return NextResponse.json({
      success: true,
      draw: result.draw,
      winner: {
        ticketId: result.winner.id,
        ticketNumber: result.winner.ticketNumber,
        userId: result.winner.userId,
        walletAddress: result.winner.wallet.address,
      },
      fairnessProof: result.fairnessProof,
      payout: {
        id: result.payout.id,
        amount: result.payout.amount,
        currency: result.payout.currency,
      },
    });
    
  } catch (error) {
    console.error('Draw run error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to run draw' },
      { status: 500 }
    );
  }
}