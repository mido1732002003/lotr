import { NextRequest } from 'next/server';
import { POST as createCheckout } from '@/app/api/payments/create-checkout/route';
import { POST as webhookHandler } from '@/app/api/payments/webhook/route';

describe('API Integration Tests', () => {
  describe('POST /api/payments/create-checkout', () => {
    it('should reject invalid request data', async () => {
      const request = new NextRequest('http://localhost:3000/api/payments/create-checkout', {
        method: 'POST',
        body: JSON.stringify({
          // Missing required fields
          ticketCount: 1,
        }),
      });
      
      const response = await createCheckout(request);
      expect(response.status).toBe(400);
      
      const data = await response.json();
      expect(data.error).toBeDefined();
    });
    
    it('should validate ticket count limits', async () => {
      const request = new NextRequest('http://localhost:3000/api/payments/create-checkout', {
        method: 'POST',
        body: JSON.stringify({
          drawId: 'test-draw-id',
          ticketCount: 101, // Exceeds max
          walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb7',
          walletNetwork: 'ETHEREUM',
          paymentMethod: 'COINBASE_COMMERCE',
        }),
      });
      
      const response = await createCheckout(request);
      expect(response.status).toBe(400);
    });
  });
  
  describe('POST /api/payments/webhook', () => {
    it('should reject webhook with invalid signature', async () => {
      const request = new NextRequest('http://localhost:3000/api/payments/webhook', {
        method: 'POST',
        headers: {
          'x-cc-webhook-signature': 'invalid-signature',
        },
        body: JSON.stringify({ test: 'data' }),
      });
      
      const response = await webhookHandler(request);
      expect(response.status).toBe(401);
      
      const data = await response.json();
      expect(data.error).toContain('signature');
    });
  });
});