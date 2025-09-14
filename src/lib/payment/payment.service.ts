import { PaymentProvider } from '@prisma/client';
import { PaymentAdapter } from './adapter.interface';
import { CoinbaseCommerceAdapter } from './adapters/coinbase-commerce.adapter';
import { NOWPaymentsAdapter } from './adapters/nowpayments.adapter';
import { CreateCheckoutOptions } from './adapter.interface';
import { PaymentCheckout, PaymentWebhookEvent } from './types';

export class PaymentService {
  private static instance: PaymentService;
  private adapters: Map<string, PaymentAdapter> = new Map();
  private initialized = false;
  
  private constructor() {}
  
  static getInstance(): PaymentService {
    if (!PaymentService.instance) {
      PaymentService.instance = new PaymentService();
    }
    return PaymentService.instance;
  }
  
  async initialize(): Promise<void> {
    if (this.initialized) return;
    
    // Initialize Coinbase Commerce
    if (process.env.COINBASE_COMMERCE_API_KEY) {
      const coinbaseAdapter = new CoinbaseCommerceAdapter();
      await coinbaseAdapter.initialize({
        apiKey: process.env.COINBASE_COMMERCE_API_KEY,
        webhookSecret: process.env.COINBASE_COMMERCE_WEBHOOK_SECRET!,
      });
      this.adapters.set(PaymentProvider.COINBASE_COMMERCE, coinbaseAdapter);
    }
    
    // Initialize NOWPayments (stub for now)
    if (process.env.NOWPAYMENTS_API_KEY) {
      const nowPaymentsAdapter = new NOWPaymentsAdapter();
      await nowPaymentsAdapter.initialize({
        apiKey: process.env.NOWPAYMENTS_API_KEY,
        webhookSecret: process.env.NOWPAYMENTS_WEBHOOK_SECRET,
      });
      this.adapters.set(PaymentProvider.NOWPAYMENTS, nowPaymentsAdapter);
    }
    
    this.initialized = true;
  }
  
  getAdapter(provider: PaymentProvider): PaymentAdapter {
    const adapter = this.adapters.get(provider);
    if (!adapter) {
      throw new Error(`Payment adapter not found for provider: ${provider}`);
    }
    return adapter;
  }
  
  async createCheckout(
    provider: PaymentProvider,
    options: CreateCheckoutOptions
  ): Promise<PaymentCheckout> {
    await this.initialize();
    const adapter = this.getAdapter(provider);
    return adapter.createCheckout(options);
  }
  
  verifyWebhookSignature(
    provider: PaymentProvider,
    payload: string,
    signature: string
  ): boolean {
    const adapter = this.getAdapter(provider);
    return adapter.verifyWebhookSignature(payload, signature);
  }
  
  parseWebhookEvent(
    provider: PaymentProvider,
    payload: any
  ): PaymentWebhookEvent {
    const adapter = this.getAdapter(provider);
    return adapter.parseWebhookEvent(payload);
  }
  
  async getPaymentDetails(
    provider: PaymentProvider,
    paymentId: string
  ) {
    await this.initialize();
    const adapter = this.getAdapter(provider);
    return adapter.getPaymentDetails(paymentId);
  }
}

export const paymentService = PaymentService.getInstance();