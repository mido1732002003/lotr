import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { PaymentProvider } from '@prisma/client';
import { prisma } from '@/lib/db/prisma';
import { paymentService } from '@/lib/payment/payment.service';
import { createCheckoutSchema } from '@/lib/validation/payment.schema';
import { findOrCreateUser, createTicket, createPayment } from '@/lib/db/queries';
import { createAuditLog } from '@/lib/db/queries';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = createCheckoutSchema.parse(body);
    
    // Get draw details
    const draw = await prisma.draw.findUnique({
      where: { id: validated.drawId },
      include: {
        _count: { select: { tickets: true } },
      },
    });
    
    if (!draw) {
      return NextResponse.json(
        { error: 'Draw not found' },
        { status: 404 }
      );
    }
    
    if (draw.status !== 'ACTIVE' && draw.status !== 'UPCOMING') {
      return NextResponse.json(
        { error: 'Draw is not accepting tickets' },
        { status: 400 }
      );
    }
    
    if (draw._count.tickets + validated.ticketCount > draw.maxTickets) {
      return NextResponse.json(
        { error: 'Not enough tickets available' },
        { status: 400 }
      );
    }
    
    // Find or create user
    const user = await findOrCreateUser(
      validated.email,
      validated.walletAddress,
      validated.walletNetwork
    );
    
    // Ensure wallet exists
    let wallet = user.wallets.find(
      w => w.address === validated.walletAddress && 
           w.network === validated.walletNetwork
    );
    
    if (!wallet) {
      wallet = await prisma.wallet.create({
        data: {
          userId: user.id,
          address: validated.walletAddress,
          network: validated.walletNetwork as any,
          isPrimary: user.wallets.length === 0,
        },
      });
    }
    
    // Calculate total amount
    const totalAmount = Number(draw.ticketPrice) * validated.ticketCount;
    
    // Create tickets and payment records
    const tickets = [];
    for (let i = 0; i < validated.ticketCount; i++) {
      const ticketNumber = generateTicketNumber();
      const ticket = await createTicket({
        drawId: draw.id,
        userId: user.id,
        walletId: wallet.id,
        ticketNumber,
      });
      tickets.push(ticket);
    }
    
    // Create payment checkout
    const checkout = await paymentService.createCheckout(
      validated.paymentMethod as PaymentProvider,
      {
        amount: totalAmount,
        currency: draw.currency,
        description: `${validated.ticketCount} ticket(s) for ${draw.title}`,
        customerEmail: validated.email || undefined,
        metadata: {
          drawId: draw.id,
          ticketIds: tickets.map(t => t.id),
          userId: user.id,
          walletId: wallet.id,
        },
        redirectUrl: `${process.env.APP_URL}/payment/success`,
        cancelUrl: `${process.env.APP_URL}/payment/cancel`,
      }
    );
    
    // Create payment records for each ticket
    for (const ticket of tickets) {
      await createPayment({
        provider: validated.paymentMethod as PaymentProvider,
        providerPaymentId: checkout.id,
        ticket: { connect: { id: ticket.id } },
        amount: Number(draw.ticketPrice),
        currency: draw.currency,
        status: 'PENDING',
        checkoutUrl: checkout.url,
        expiresAt: checkout.expiresAt,
        metadata: checkout.metadata,
      });
    }
    
    // Audit log
    await createAuditLog({
      action: 'TICKET_CREATED',
      entityType: 'Draw',
      entityId: draw.id,
      userId: user.id,
      metadata: {
        ticketCount: validated.ticketCount,
        totalAmount,
        paymentMethod: validated.paymentMethod,
      },
    });
    
    return NextResponse.json({
      success: true,
      checkoutUrl: checkout.url,
      paymentId: checkout.id,
      tickets: tickets.map(t => ({
        id: t.id,
        ticketNumber: t.ticketNumber,
      })),
      expiresAt: checkout.expiresAt,
    });
    
  } catch (error) {
    console.error('Create checkout error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create checkout' },
      { status: 500 }
    );
  }
}

function generateTicketNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `TKT-${timestamp}-${random}`;
}