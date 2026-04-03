// Tenant and Invoice Types for NexusOS Admin

export interface Tenant {
  id: string;
  tenantNumber: number;
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  industry: 'clinic' | 'nurse' | 'lawfirm' | 'beauty' | 'retail' | 'bakery';
  plan: 'STARTER' | 'GROWTH' | 'PREMIUM';
  billingCycle: 'monthly' | 'annual';
  status: 'active' | 'pending' | 'suspended';
  users: number;
  createdAt: string;
  notes?: string;
  lastPayment?: string;
  totalPayments: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  tenantId: string;
  tenantName: string;
  tenantNumber: number;
  industry: string;
  plan: string;
  billingCycle: 'monthly' | 'annual';
  subtotal: number;
  tax: number;
  total: number;
  status: 'paid' | 'pending' | 'overdue' | 'cancelled';
  createdAt: string;
  dueDate: string;
  paidAt?: string;
  sentVia?: 'email' | 'whatsapp' | 'saved';
}

// Pricing
export const PRICING = {
  STARTER: { monthly: 800, annual: 680, activation: 1250 },
  GROWTH: { monthly: 1500, annual: 1275, activation: 1250 },
  PREMIUM: { monthly: 2800, annual: 2380, activation: 1250 },
};

export const TAX_RATE = 12.5;

// Helper to generate invoice number
export function generateInvoiceNumber(tenantNumber: number, date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `NXS-${year}${month}-${String(tenantNumber).padStart(4, '0')}`;
}

// Helper to format currency
export function formatCurrency(amount: number): string {
  return `TT$${amount.toLocaleString('en-TT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
