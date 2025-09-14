export enum PaymentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  CONFIRMED = 'CONFIRMED',
  FAILED = 'FAILED',
  EXPIRED = 'EXPIRED',
  REFUNDED = 'REFUNDED',
}

export interface PaymentCheckout {
  id: string;
  url: string;
  amount: number;
  currency: string;
  expiresAt: Date;
  metadata?: Record<string, any>;
}

export interface PaymentWebhookEvent {
  id: string;
  type: string;
  paymentId: string;
  status: PaymentStatus;
  amount?: number;
  currency?: string;
  transactionHash?: string;
  confirmations?: number;
  timestamp: Date;
  raw: any;
}

export interface PaymentDetails {
  id: string;
  status: PaymentStatus;
  amount: number;
  currency: string;
  cryptoAmount?: number;
  cryptoCurrency?: string;
  transactionHash?: string;
  confirmations?: number;
  paidAt?: Date;
  metadata?: Record<string, any>;
}