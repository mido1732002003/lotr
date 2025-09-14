import { NextRequest, NextResponse } from 'next/server';
import { PaymentProvider } from '@prisma/client';
import { prisma } from '@/lib/db/prisma';
import { paymentService } from '@/lib/payment/payment.service';
import { updatePaymentStatus, updateTicketStatus, createAuditLog } from '@/lib/db/queries';
import { PaymentStatus } from '@/lib/payment/types';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-cc-webhook-signature') || 
                      req.headers.get('x-nowpayments-sig') || '';
    
    // Determine provider from headers or URL
    let provider: PaymentProvider;
    if (req.headers.get('x-cc-webhook-signature')) {
      provider = PaymentProvider.COINBASE_COMMERCE;
    } else if (req.headers.get('x-nowpayments-sig')) {
      provider = PaymentProvider.NOWPAYMENTS;
    } else {
      return NextResponse.json(
        { error: 'Unknown payment provider' },
        { status: 400 }
      );
    }
    
    // Verify webhook signature
    const isValid = paymentService.verifyWebhookSignature(provider, rawBody, signature);
    
    if (!isValid) {
      await createAuditLog({
        action: 'WEBHOOK_FAILED',
        metadata: {
          provider,
          reason: 'Invalid signature',
        },
      });
      
      return NextResponse.json(
        { error: 'Invalid webhook signature' },
        { status: 401 }
      );
    }
    
    // Parse webhook event
    const payload = JSON.parse(rawBody);
    const event = paymentService.parseWebhookEvent(provider, payload);
    
    // Log webhook received
    await createAuditLog({
      action: 'WEBHOOK_RECEIVED',
      metadata: {
        provider,
        eventType: event.type,
        paymentId: event.paymentId,
      },
    });
    
    // Get payment record
    const payment = await prisma.payment.findUnique({
      where: { providerPaymentId: event.paymentId },
      include: { ticket: true },
    });
    
    if (!payment) {
      console.warn(`Payment not found for webhook: ${event.paymentId}`);
      return NextResponse.json({ received: true });
    }
    
    // Update payment status
    await updatePaymentStatus(
      event.paymentId,
      event.status,
      {
        transactionHash: event.transactionHash,
        blockConfirmations: event.confirmations,
        webhookData: payload,
        cryptoAmount: event.amount,
        cryptoCurrency: event.currency,
      }
    );
    
    // Update ticket status based on payment status
    if (event.status === PaymentStatus.CONFIRMED) {
      await updateTicketStatus(payment.ticketId, 'ACTIVE');
      
      // Update draw prize pool
      await prisma.draw.update({
        where: { id: payment.ticket.drawId },
        data: {
          totalPrizePool: {
            increment: payment.amount,
          },
        },
      });
      
      await createAuditLog({
        action: 'PAYMENT_RECEIVED',
        entityType: 'Payment',
        entityId: payment.id,
        metadata: {
          amount: payment.amount,
          currency: payment.currency,
          ticketId: payment.ticketId,
        },
      });
      
    } else if (event.status === PaymentStatus.FAILED || event.status === PaymentStatus.EXPIRED) {
      await updateTicketStatus(payment.ticketId, 'CANCELLED');
      
      await createAuditLog({
        action: 'PAYMENT_FAILED',
        entityType: 'Payment',
        entityId: payment.id,
        metadata: {
          reason: event.status,
          ticketId: payment.ticketId,
        },
      });
    }
    
    await createAuditLog({
      action: 'WEBHOOK_VERIFIED',
      metadata: {
        provider,
        eventType: event.type,
        paymentId: event.paymentId,
        status: event.status,
      },
    });
    
    return NextResponse.json({ received: true });
    
  } catch (error) {
    console.error('Webhook processing error:', error);
    
    await createAuditLog({
      action: 'WEBHOOK_FAILED',
      metadata: {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    });
    
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

// Disable body parsing for webhooks to get raw body
export const runtime = 'nodejs';