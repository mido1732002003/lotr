import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/db/prisma';
import { createAuditLog } from '@/lib/db/queries';

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
    
    const { payoutId, transactionHash } = await req.json();
    
    if (!payoutId || !transactionHash) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const payout = await prisma.payout.update({
      where: { id: payoutId },
      data: {
        status: 'COMPLETED',
        transactionHash,
        processedAt: new Date(),
        completedAt: new Date(),
      },
    });
    
    await createAuditLog({
      action: 'PAYOUT_COMPLETED',
      entityType: 'Payout',
      entityId: payout.id,
      metadata: {
        transactionHash,
        amount: payout.amount,
        currency: payout.currency,
      },
    });
    
    return NextResponse.json({
      success: true,
      payout,
    });
    
  } catch (error) {
    console.error('Payout record error:', error);
    return NextResponse.json(
      { error: 'Failed to record payout' },
      { status: 500 }
    );
  }
}