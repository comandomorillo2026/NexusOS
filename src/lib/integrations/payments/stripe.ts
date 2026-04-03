// Payments integration types
export type PaymentProvider = 'stripe' | 'paypal' | 'wipay';

export interface PaymentConfig {
  provider: PaymentProvider;
  apiKey: string;
  webhookSecret?: string;
}

export interface PaymentIntent {
  amount: number;
  currency: string;
  description?: string;
  metadata?: Record<string, string>;
}

export async function createPaymentIntent(config: PaymentConfig, intent: PaymentIntent): Promise<{ id: string; clientSecret: string } | null> {
  console.log('Creating payment intent via', config.provider);
  return { id: 'pi_' + Date.now(), clientSecret: 'secret_' + Date.now() };
}

