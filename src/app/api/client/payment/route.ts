import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'nexusos-client-portal-secret-key-2024';

// WiPay Configuration
const WIPAY_API_URL = process.env.WIPAY_API_URL || 'https://wipayfinancial.com/v1';
const WIPAY_API_KEY = process.env.WIPAY_API_KEY || '';
const WIPAY_ACCOUNT_NUMBER = process.env.WIPAY_ACCOUNT_NUMBER || '';

interface PaymentRequest {
  invoiceId: string;
  amount: number;
  method: 'wipay' | 'bank_transfer';
}

async function verifyToken(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  try {
    return jwt.verify(token, JWT_SECRET) as {
      accessId: string;
      caseId: string;
      clientId: string;
      tenantId: string;
      permissions: string;
      type: string;
    };
  } catch {
    return null;
  }
}

// POST - Create payment
export async function POST(request: NextRequest) {
  try {
    const tokenData = await verifyToken(request);

    if (!tokenData) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized access' },
        { status: 401 }
      );
    }

    // Check permissions
    const permissions = tokenData.permissions.split(',');
    if (!permissions.includes('pay_invoices')) {
      return NextResponse.json(
        { success: false, error: 'Payment permission denied' },
        { status: 403 }
      );
    }

    const body: PaymentRequest = await request.json();
    const { invoiceId, amount, method } = body;

    if (!invoiceId || !amount || amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid payment details' },
        { status: 400 }
      );
    }

    // Get invoice
    const invoice = await db.lawInvoice.findFirst({
      where: {
        id: invoiceId,
        caseId: tokenData.caseId,
      },
      include: {
        LawCase: {
          select: {
            tenantId: true,
            LawClient: {
              select: {
                fullName: true,
                email: true,
                phone: true,
              },
            },
          },
        },
      },
    });

    if (!invoice) {
      return NextResponse.json(
        { success: false, error: 'Invoice not found' },
        { status: 404 }
      );
    }

    // Verify amount doesn't exceed balance
    if (amount > invoice.balanceDue) {
      return NextResponse.json(
        { success: false, error: 'Payment amount exceeds balance due' },
        { status: 400 }
      );
    }

    // Get firm settings
    const firmSettings = await db.lawSettings.findFirst({
      where: { tenantId: invoice.LawCase.tenantId },
    });

    if (method === 'wipay') {
      // Generate WiPay payment URL
      const returnUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/portal/client?payment=success`;
      const cancelUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/portal/client?payment=cancelled`;

      // Calculate fees (WiPay charges 3% + TT$1)
      const wiPayFee = Math.round((amount * 0.03 + 1) * 100) / 100;
      const totalAmount = amount + wiPayFee;

      // Create payment record
      const paymentRecord = await db.lawTrustTransaction.create({
        data: {
          tenantId: invoice.LawCase.tenantId,
          trustAccountId: '', // Will be updated after payment
          caseId: tokenData.caseId,
          transactionNumber: `PAY-${Date.now()}`,
          type: 'deposit',
          description: `Payment for Invoice ${invoice.invoiceNumber} via WiPay`,
          amount: amount,
          balanceAfter: 0,
          transactionDate: new Date().toISOString(),
          notes: `WiPay Fee: TT$${wiPayFee.toFixed(2)}`,
        },
      });

      // Build WiPay URL (for development/demo)
      // In production, you would make an API call to WiPay
      const wiPayParams = new URLSearchParams({
        total: totalAmount.toFixed(2),
        phone: invoice.LawCase.LawClient?.phone || '',
        email: invoice.LawCase.LawClient?.email || '',
        name: invoice.LawCase.LawClient?.fullName || 'Client',
        order_id: paymentRecord.transactionNumber,
        return_url: returnUrl,
        cancel_url: cancelUrl,
        developer_id: WIPAY_API_KEY,
      });

      // For demo purposes, return a mock payment URL
      // In production: `${WIPAY_API_URL}/payment?${wiPayParams.toString()}`
      const paymentUrl = `https://wipayfinancial.com/live/payment.php?${wiPayParams.toString()}`;

      return NextResponse.json({
        success: true,
        paymentUrl,
        transactionNumber: paymentRecord.transactionNumber,
        amount: totalAmount,
        fee: wiPayFee,
        message: 'Redirect to WiPay to complete payment',
      });
    } else if (method === 'bank_transfer') {
      // Return bank details for manual transfer
      return NextResponse.json({
        success: true,
        method: 'bank_transfer',
        bankDetails: {
          bankName: firmSettings?.taxId?.includes('RBTT') ? 'RBTT Bank' : 'First Caribbean International Bank',
          accountName: firmSettings?.firmName || 'Law Firm',
          accountNumber: '1234567890',
          routingNumber: '100001',
          reference: invoice.invoiceNumber,
          amount: amount,
        },
        message: 'Please complete the bank transfer and use your invoice number as reference',
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid payment method' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Payment error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process payment request' },
      { status: 500 }
    );
  }
}

// Webhook for payment confirmation (called by WiPay)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { transactionNumber, status, transaction_id } = body;

    // Find the payment record
    const payment = await db.lawTrustTransaction.findFirst({
      where: { transactionNumber },
    });

    if (!payment) {
      return NextResponse.json(
        { success: false, error: 'Transaction not found' },
        { status: 404 }
      );
    }

    if (status === 'success' || status === 'approved') {
      // Update invoice payment
      const invoice = await db.lawInvoice.findFirst({
        where: {
          caseId: payment.caseId,
          balanceDue: { gte: payment.amount },
        },
        orderBy: { issueDate: 'asc' },
      });

      if (invoice) {
        await db.lawInvoice.update({
          where: { id: invoice.id },
          data: {
            amountPaid: { increment: payment.amount },
            balanceDue: { decrement: payment.amount },
            paidDate: new Date().toISOString(),
            paymentMethod: 'wipay',
            status: invoice.balanceDue - payment.amount <= 0 ? 'paid' : 'partial',
          },
        });
      }

      // Update payment record
      await db.lawTrustTransaction.update({
        where: { id: payment.id },
        data: {
          reference: transaction_id,
          notes: `${payment.notes}\nPayment confirmed via WiPay`,
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Payment confirmed',
      });
    } else {
      return NextResponse.json({
        success: false,
        message: 'Payment not completed',
      });
    }
  } catch (error) {
    console.error('Payment webhook error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process payment confirmation' },
      { status: 500 }
    );
  }
}
