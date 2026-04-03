// WiPay Integration for Caribbean Payments
// https://wipaycaribbean.com/

export interface WiPayConfig {
  accountId: string;
  apiKey: string;
  countryCode: 'TT' | 'BB' | 'GD' | 'JM' | 'LC';
  environment: 'sandbox' | 'production';
}

export interface WiPayPaymentRequest {
  amount: number;
  currency: 'TTD' | 'USD' | 'BBD' | 'JMD';
  description: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  orderId: string;
  returnUrl: string;
  cancelUrl: string;
  // For subscriptions
  isRecurring?: boolean;
  recurringInterval?: 'monthly' | 'annual' | 'biannual';
}

export interface WiPayPaymentResponse {
  success: boolean;
  transactionId?: string;
  redirectUrl?: string;
  error?: string;
  status?: 'pending' | 'completed' | 'failed' | 'cancelled';
}

export interface WiPayWebhookPayload {
  transaction_id: string;
  order_id: string;
  status: 'success' | 'failed' | 'cancelled';
  amount: string;
  currency: string;
  customer_email: string;
  timestamp: string;
  signature: string;
}

// WiPay API URLs
const WIPAY_URLS = {
  sandbox: 'https://sandbox.wipaycaribbean.com/v2',
  production: 'https://wipaycaribbean.com/v2',
};

// Generate payment URL for WiPay redirect
export function generateWiPayPaymentUrl(
  config: WiPayConfig,
  request: WiPayPaymentRequest
): string {
  const baseUrl = WIPAY_URLS[config.environment];
  
  // Build query parameters
  const params = new URLSearchParams({
    account_number: config.accountId,
    amount: request.amount.toFixed(2),
    currency: request.currency,
    description: request.description,
    customer_name: request.customerName,
    customer_email: request.customerEmail,
    customer_phone: request.customerPhone,
    order_id: request.orderId,
    return_url: request.returnUrl,
    cancel_url: request.cancelUrl,
    environment: config.environment,
  });

  // Add recurring parameters if subscription
  if (request.isRecurring && request.recurringInterval) {
    params.append('recurring', 'true');
    params.append('recurring_interval', request.recurringInterval);
  }

  // Generate signature for security
  const signature = generateWiPaySignature(config.apiKey, params.toString());
  params.append('signature', signature);

  return `${baseUrl}/payment?${params.toString()}`;
}

// Generate signature for WiPay requests
function generateWiPaySignature(apiKey: string, data: string): string {
  // In production, use a proper HMAC-SHA256 implementation
  // This is a simplified version for demonstration
  const crypto = require('crypto');
  return crypto
    .createHmac('sha256', apiKey)
    .update(data)
    .digest('hex');
}

// Verify WiPay webhook signature
export function verifyWiPayWebhook(
  apiKey: string,
  payload: WiPayWebhookPayload
): boolean {
  // Reconstruct the data string
  const data = `${payload.transaction_id}${payload.order_id}${payload.status}${payload.amount}${payload.currency}${payload.timestamp}`;
  
  // Calculate expected signature
  const expectedSignature = generateWiPaySignature(apiKey, data);
  
  // Compare signatures
  return payload.signature === expectedSignature;
}

// Process payment result from WiPay redirect
export function processWiPayResult(
  queryParams: URLSearchParams
): WiPayPaymentResponse {
  const status = queryParams.get('status');
  const transactionId = queryParams.get('transaction_id');
  const orderId = queryParams.get('order_id');
  const error = queryParams.get('error');

  if (status === 'success' && transactionId) {
    return {
      success: true,
      transactionId,
      status: 'completed',
    };
  }

  if (status === 'cancelled') {
    return {
      success: false,
      status: 'cancelled',
      error: 'Payment was cancelled by user',
    };
  }

  return {
    success: false,
    status: 'failed',
    error: error || 'Payment failed',
  };
}

// WiPay React Component for payment form
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, CreditCard, Shield, CheckCircle } from 'lucide-react';

interface WiPayCheckoutProps {
  config: WiPayConfig;
  request: WiPayPaymentRequest;
  onSuccess?: (response: WiPayPaymentResponse) => void;
  onCancel?: () => void;
  onError?: (error: string) => void;
}

export function WiPayCheckout({
  config,
  request,
  onSuccess,
  onCancel,
  onError,
}: WiPayCheckoutProps) {
  const [loading, setLoading] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardholderName, setCardholderName] = useState(request.customerName);

  // Format card number with spaces
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    return parts.length ? parts.join(' ') : v;
  };

  // Format expiry date
  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  // Handle payment submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Generate payment URL and redirect
      const paymentUrl = generateWiPayPaymentUrl(config, {
        ...request,
        customerName: cardholderName,
      });

      // Option 1: Redirect to WiPay
      window.location.href = paymentUrl;

      // Option 2: If using iframe/modal (WiPay hosted page)
      // onSuccess?.({ success: true, redirectUrl: paymentUrl });

    } catch (error) {
      console.error('WiPay payment error:', error);
      onError?.('Failed to initialize payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#6C3FCE] to-[#C026D3] flex items-center justify-center mx-auto mb-4">
          <CreditCard className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-xl font-bold text-[var(--text-primary)]">
          Pago Seguro
        </h2>
        <p className="text-sm text-[var(--text-mid)]">
          Powered by WiPay Caribbean
        </p>
      </div>

      {/* Order Summary */}
      <div className="p-4 rounded-xl bg-[var(--glass)] border border-[var(--glass-border)] mb-6">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-[var(--text-mid)]">{request.description}</p>
            <p className="text-2xl font-bold text-[var(--text-primary)]">
              {request.currency} ${request.amount.toFixed(2)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-[var(--success)]" />
            <span className="text-xs text-[var(--success)]">SSL Secured</span>
          </div>
        </div>
      </div>

      {/* Payment Form - for direct card entry if supported */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label className="text-[var(--text-mid)]">Nombre del Titular</Label>
          <Input
            value={cardholderName}
            onChange={(e) => setCardholderName(e.target.value)}
            placeholder="JUAN PÉREZ"
            className="bg-[var(--glass)] border-[var(--glass-border)] uppercase"
            required
          />
        </div>

        <div className="space-y-2">
          <Label className="text-[var(--text-mid)]">Número de Tarjeta</Label>
          <Input
            value={cardNumber}
            onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
            placeholder="1234 5678 9012 3456"
            maxLength={19}
            className="bg-[var(--glass)] border-[var(--glass-border)]"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-[var(--text-mid)]">Expiración</Label>
            <Input
              value={expiryDate}
              onChange={(e) => setExpiryDate(formatExpiryDate(e.target.value))}
              placeholder="MM/YY"
              maxLength={5}
              className="bg-[var(--glass)] border-[var(--glass-border)]"
              required
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[var(--text-mid)]">CVV</Label>
            <Input
              value={cvv}
              onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
              placeholder="123"
              maxLength={4}
              type="password"
              className="bg-[var(--glass)] border-[var(--glass-border)]"
              required
            />
          </div>
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-[#6C3FCE] to-[#C026D3] text-white py-6"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Procesando...
            </>
          ) : (
            <>
              <CreditCard className="w-5 h-5 mr-2" />
              Pagar {request.currency} ${request.amount.toFixed(2)}
            </>
          )}
        </Button>
      </form>

      {/* WiPay Logo */}
      <div className="mt-6 text-center">
        <p className="text-xs text-[var(--text-dim)]">
          Pagos procesados de forma segura por
        </p>
        <div className="flex items-center justify-center gap-2 mt-2">
          <span className="text-lg font-bold text-[#6366F1]">WiPay</span>
          <span className="text-sm text-[var(--text-dim)]">Caribbean</span>
        </div>
      </div>

      {/* Cancel Button */}
      {onCancel && (
        <Button
          variant="ghost"
          onClick={onCancel}
          className="w-full mt-4 text-[var(--text-mid)]"
        >
          Cancelar
        </Button>
      )}
    </div>
  );
}

// Success page component for after payment
export function WiPaySuccess({
  transactionId,
  amount,
  currency,
  businessName,
  onContinue,
}: {
  transactionId: string;
  amount: number;
  currency: string;
  businessName: string;
  onContinue?: () => void;
}) {
  return (
    <div className="max-w-md mx-auto text-center py-12">
      <div className="w-20 h-20 rounded-full bg-[var(--success)]/20 flex items-center justify-center mx-auto mb-6">
        <CheckCircle className="w-10 h-10 text-[var(--success)]" />
      </div>
      
      <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
        ¡Pago Exitoso!
      </h2>
      <p className="text-[var(--text-mid)] mb-6">
        Tu suscripción a {businessName} ha sido activada.
      </p>

      <div className="p-4 rounded-xl bg-[var(--glass)] border border-[var(--glass-border)] mb-6 text-left">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-[var(--text-dim)]">Monto:</span>
            <span className="text-[var(--text-primary)] font-medium">
              {currency} ${amount.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--text-dim)]">Transacción:</span>
            <span className="text-[var(--text-primary)] font-mono text-sm">
              {transactionId}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--text-dim)]">Fecha:</span>
            <span className="text-[var(--text-primary)]">
              {new Date().toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      <Button onClick={onContinue} className="btn-nexus">
        Continuar al Dashboard
      </Button>
    </div>
  );
}
