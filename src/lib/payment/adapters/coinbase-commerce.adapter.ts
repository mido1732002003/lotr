import crypto from 'crypto';
import axios from 'axios';
import { 
  PaymentAdapter, 
  PaymentAdapterConfig, 
  CreateCheckoutOptions 
} from '../adapter.interface';
import { 
  PaymentCheckout, 
  PaymentWebhookEvent, 
  PaymentDetails, 
  PaymentStatus 
} from '../types';

interface CoinbaseCharge {
  id: string;
  code: string;
  name: string;
  description: string;
  hosted_url: string;
  created_at: string;
  expires_at: string;
  confirmed_at?: string;
  pricing: {
    local: { amount: string; currency: string };
    ethereum?: { amount: string; currency: string };
    bitcoin?: { amount: string; currency: string };
    usdc?: { amount: string; currency: string };
  };
  payments: Array<{
    network: string;
    transaction_id: string;
    status: string;
    value: {
      amount: string;
      currency: string;
    };
    block: {
      height: number;
      hash: string;
      confirmations: number;
    };
  }>;
  timeline: Array<{
    time: string;
    status: string;
  }>;
  metadata?: Record<string, any>;
}

export class CoinbaseCommerceAdapter implements PaymentAdapter {
  name = 'COINBASE_COMMERCE';
  private apiKey!: string;
  private webhookSecret!: string;
  private baseUrl = 'https://api.commerce.coinbase.com';
  
  async initialize(config: PaymentAdapterConfig): Promise<void> {
    if (!config.apiKey) {
      throw new Error('Coinbase Commerce API key is required');
    }
    if (!config.webhookSecret) {
      throw new Error('Coinbase Commerce webhook secret is required');
    }
    
    this.apiKey = config.apiKey;
    this.webhookSecret = config.webhookSecret;
    
    // Test API connection
    try {
      await this.makeRequest('GET', '/charges?limit=1');
    } catch (error) {
      throw new Error(`Failed to initialize Coinbase Commerce: ${error}`);
    }
  }
  
  async createCheckout(options: CreateCheckoutOptions): Promise<PaymentCheckout> {
    const charge = await this.makeRequest<{ data: CoinbaseCharge }>('POST', '/charges', {
      name: 'Lottery Ticket Purchase',
      description: options.description || 'LOTR Lottery Ticket',
      pricing_type: 'fixed_price',
      local_price: {
        amount: options.amount.toString(),
        currency: options.currency.toUpperCase(),
      },
      metadata: {
        ...options.metadata,
        customer_email: options.customerEmail,
      },
      redirect_url: options.redirectUrl,
      cancel_url: options.cancelUrl,
    });
    
    return {
      id: charge.data.code,
      url: charge.data.hosted_url,
      amount: options.amount,
      currency: options.currency,
      expiresAt: new Date(charge.data.expires_at),
      metadata: charge.data.metadata,
    };
  }
  
  verifyWebhookSignature(payload: string, signature: string): boolean {
    const hash = crypto
      .createHmac('sha256', this.webhookSecret)
      .update(payload)
      .digest('hex');
    
    return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(signature));
  }
  
  parseWebhookEvent(payload: any): PaymentWebhookEvent {
    const event = payload.event;
    const charge = event.data as CoinbaseCharge;
    
    // Map Coinbase statuses to our internal statuses
    const statusMap: Record<string, PaymentStatus> = {
      'NEW': PaymentStatus.PENDING,
      'PENDING': PaymentStatus.PROCESSING,
      'COMPLETED': PaymentStatus.CONFIRMED,
      'EXPIRED': PaymentStatus.EXPIRED,
      'UNRESOLVED': PaymentStatus.FAILED,
      'RESOLVED': PaymentStatus.CONFIRMED,
      'CANCELED': PaymentStatus.FAILED,
    };
    
    const latestStatus = charge.timeline[charge.timeline.length - 1]?.status || 'NEW';
    const payment = charge.payments?.[0];
    
    return {
      id: event.id,
      type: event.type,
      paymentId: charge.code,
      status: statusMap[latestStatus] || PaymentStatus.PENDING,
      amount: parseFloat(charge.pricing.local.amount),
      currency: charge.pricing.local.currency,
      transactionHash: payment?.transaction_id,
      confirmations: payment?.block?.confirmations,
      timestamp: new Date(event.created_at || Date.now()),
      raw: payload,
    };
  }
  
  async getPaymentDetails(paymentId: string): Promise<PaymentDetails> {
    const response = await this.makeRequest<{ data: CoinbaseCharge }>(
      'GET',
      `/charges/${paymentId}`
    );
    const charge = response.data;
    
    const latestStatus = charge.timeline[charge.timeline.length - 1]?.status || 'NEW';
    const payment = charge.payments?.[0];
    
    const statusMap: Record<string, PaymentStatus> = {
      'NEW': PaymentStatus.PENDING,
      'PENDING': PaymentStatus.PROCESSING,
      'COMPLETED': PaymentStatus.CONFIRMED,
      'EXPIRED': PaymentStatus.EXPIRED,
      'UNRESOLVED': PaymentStatus.FAILED,
      'RESOLVED': PaymentStatus.CONFIRMED,
      'CANCELED': PaymentStatus.FAILED,
    };
    
    return {
      id: charge.code,
      status: statusMap[latestStatus] || PaymentStatus.PENDING,
      amount: parseFloat(charge.pricing.local.amount),
      currency: charge.pricing.local.currency,
      cryptoAmount: payment ? parseFloat(payment.value.amount) : undefined,
      cryptoCurrency: payment?.value.currency,
      transactionHash: payment?.transaction_id,
      confirmations: payment?.block?.confirmations,
      paidAt: charge.confirmed_at ? new Date(charge.confirmed_at) : undefined,
      metadata: charge.metadata,
    };
  }
  
  async cancelPayment(paymentId: string): Promise<void> {
    await this.makeRequest('POST', `/charges/${paymentId}/cancel`);
  }
  
  private async makeRequest<T = any>(
    method: string,
    path: string,
    data?: any
  ): Promise<T> {
    try {
      const response = await axios({
        method,
        url: `${this.baseUrl}${path}`,
        headers: {
          'X-CC-Api-Key': this.apiKey,
          'X-CC-Version': '2018-03-22',
          'Content-Type': 'application/json',
        },
        data,
      });
      
      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(
          `Coinbase Commerce API error: ${error.response.data?.error?.message || error.response.statusText}`
        );
      }
      throw error;
    }
  }
}