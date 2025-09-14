import { PaymentCheckout, PaymentWebhookEvent, PaymentDetails } from './types';

export interface PaymentAdapterConfig {
  apiKey: string;
  webhookSecret?: string;
  environment?: 'production' | 'sandbox';
  [key: string]: any;
}

export interface CreateCheckoutOptions {
  amount: number;
  currency: string;
  description?: string;
  customerEmail?: string;
  metadata?: Record<string, any>;
  redirectUrl?: string;
  cancelUrl?: string;
}

export interface PaymentAdapter {
  name: string;
  
  /**
   * Initialize the adapter with configuration
   */
  initialize(config: PaymentAdapterConfig): Promise<void>;
  
  /**
   * Create a new payment checkout session
   */
  createCheckout(options: CreateCheckoutOptions): Promise<PaymentCheckout>;
  
  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(payload: string, signature: string): boolean;
  
  /**
   * Parse webhook payload into standardized event
   */
  parseWebhookEvent(payload: any): PaymentWebhookEvent;
  
  /**
   * Get payment details by ID
   */
  getPaymentDetails(paymentId: string): Promise<PaymentDetails>;
  
  /**
   * Cancel a pending payment
   */
  cancelPayment?(paymentId: string): Promise<void>;
  
  /**
   * Refund a completed payment
   */
  refundPayment?(paymentId: string, amount?: number): Promise<void>;
}