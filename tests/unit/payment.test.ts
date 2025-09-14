import { CoinbaseCommerceAdapter } from '@/lib/payment/adapters/coinbase-commerce.adapter';
import { PaymentStatus } from '@/lib/payment/types';

describe('CoinbaseCommerceAdapter', () => {
  let adapter: CoinbaseCommerceAdapter;
  
  beforeEach(() => {
    adapter = new CoinbaseCommerceAdapter();
  });
  
  describe('verifyWebhookSignature', () => {
    it('should verify valid signature', () => {
      const payload = '{"test":"data"}';
      const secret = 'test-secret';
      
      // Mock the webhook secret
      (adapter as any).webhookSecret = secret;
      
      // Calculate expected signature
      const crypto = require('crypto');
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(payload)
        .digest('hex');
      
      const isValid = adapter.verifyWebhookSignature(payload, expectedSignature);
      expect(isValid).toBe(true);
    });
    
    it('should reject invalid signature', () => {
      const payload = '{"test":"data"}';
      (adapter as any).webhookSecret = 'test-secret';
      
      const isValid = adapter.verifyWebhookSignature(payload, 'wrong-signature');
      expect(isValid).toBe(false);
    });
  });
  
  describe('parseWebhookEvent', () => {
    it('should parse completed payment event', () => {
      const payload = {
        event: {
          id: 'evt_123',
          type: 'charge:confirmed',
          created_at: '2024-01-01T00:00:00Z',
          data: {
            code: 'CHARGE123',
            timeline: [
              { status: 'NEW', time: '2024-01-01T00:00:00Z' },
              { status: 'COMPLETED', time: '2024-01-01T00:01:00Z' },
            ],
            pricing: {
              local: { amount: '10.00', currency: 'USD' },
            },
            payments: [{
              transaction_id: '0x123abc',
              block: { confirmations: 12 },
            }],
          },
        },
      };
      
      const event = adapter.parseWebhookEvent(payload);
      
      expect(event.paymentId).toBe('CHARGE123');
      expect(event.status).toBe(PaymentStatus.CONFIRMED);
      expect(event.amount).toBe(10);
      expect(event.transactionHash).toBe('0x123abc');
      expect(event.confirmations).toBe(12);
    });
    
    it('should handle expired payment event', () => {
      const payload = {
        event: {
          id: 'evt_124',
          type: 'charge:expired',
          data: {
            code: 'CHARGE124',
            timeline: [{ status: 'EXPIRED' }],
            pricing: { local: { amount: '5.00', currency: 'USD' } },
            payments: [],
          },
        },
      };
      
      const event = adapter.parseWebhookEvent(payload);
      
      expect(event.status).toBe(PaymentStatus.EXPIRED);
      expect(event.transactionHash).toBeUndefined();
    });
  });
});