'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DollarSign,
  FileText,
  Download,
  Eye,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  CreditCard,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

interface InvoiceItem {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  paidDate: string | null;
  items: InvoiceItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  amountPaid: number;
  balanceDue: number;
  status: 'draft' | 'sent' | 'paid' | 'partial' | 'overdue' | 'cancelled';
  paymentMethod?: string;
  paymentReference?: string;
}

interface Payment {
  id: string;
  date: string;
  amount: number;
  method: string;
  reference?: string;
}

interface ClientInvoicesProps {
  invoices: Invoice[];
  payments: Payment[];
  onDownloadInvoice: (invoiceId: string) => void;
  language?: 'en' | 'es';
}

const translations = {
  en: {
    title: 'Invoices & Payments',
    invoicesTab: 'Invoices',
    paymentsTab: 'Payment History',
    noInvoices: 'No invoices available',
    noPayments: 'No payment history',
    download: 'Download PDF',
    view: 'View Details',
    invoiceNumber: 'Invoice #',
    issueDate: 'Issue Date',
    dueDate: 'Due Date',
    total: 'Total',
    balanceDue: 'Balance Due',
    status: 'Status',
    description: 'Description',
    quantity: 'Qty',
    rate: 'Rate',
    amount: 'Amount',
    subtotal: 'Subtotal',
    discount: 'Discount',
    tax: 'Tax',
    grandTotal: 'Grand Total',
    amountPaid: 'Amount Paid',
    paymentHistory: 'Payment History',
    paymentDate: 'Date',
    paymentMethod: 'Method',
    paymentAmount: 'Amount',
    reference: 'Reference',
    statuses: {
      draft: 'Draft',
      sent: 'Sent',
      paid: 'Paid',
      partial: 'Partial',
      overdue: 'Overdue',
      cancelled: 'Cancelled',
    },
    methods: {
      cash: 'Cash',
      card: 'Credit/Debit Card',
      transfer: 'Bank Transfer',
      check: 'Check',
      trust: 'Trust Account',
    },
    currency: 'TT$',
    paidInFull: 'Paid in Full',
  },
  es: {
    title: 'Facturas y Pagos',
    invoicesTab: 'Facturas',
    paymentsTab: 'Historial de Pagos',
    noInvoices: 'No hay facturas disponibles',
    noPayments: 'No hay historial de pagos',
    download: 'Descargar PDF',
    view: 'Ver Detalles',
    invoiceNumber: 'Factura #',
    issueDate: 'Fecha de Emisión',
    dueDate: 'Fecha de Vencimiento',
    total: 'Total',
    balanceDue: 'Saldo Pendiente',
    status: 'Estado',
    description: 'Descripción',
    quantity: 'Cant.',
    rate: 'Tarifa',
    amount: 'Monto',
    subtotal: 'Subtotal',
    discount: 'Descuento',
    tax: 'Impuesto',
    grandTotal: 'Total General',
    amountPaid: 'Monto Pagado',
    paymentHistory: 'Historial de Pagos',
    paymentDate: 'Fecha',
    paymentMethod: 'Método',
    paymentAmount: 'Monto',
    reference: 'Referencia',
    statuses: {
      draft: 'Borrador',
      sent: 'Enviada',
      paid: 'Pagada',
      partial: 'Parcial',
      overdue: 'Vencida',
      cancelled: 'Cancelada',
    },
    methods: {
      cash: 'Efectivo',
      card: 'Tarjeta Crédito/Débito',
      transfer: 'Transferencia Bancaria',
      check: 'Cheque',
      trust: 'Cuenta de Fideicomiso',
    },
    currency: 'TT$',
    paidInFull: 'Pagado Completamente',
  },
};

const getStatusConfig = (status: Invoice['status']) => {
  const configs: Record<Invoice['status'], { color: string; icon: React.ElementType; bgColor: string }> = {
    draft: { color: 'text-gray-600', icon: FileText, bgColor: 'bg-gray-100' },
    sent: { color: 'text-blue-600', icon: Clock, bgColor: 'bg-blue-100' },
    paid: { color: 'text-green-600', icon: CheckCircle, bgColor: 'bg-green-100' },
    partial: { color: 'text-yellow-600', icon: AlertCircle, bgColor: 'bg-yellow-100' },
    overdue: { color: 'text-red-600', icon: AlertCircle, bgColor: 'bg-red-100' },
    cancelled: { color: 'text-gray-500', icon: FileText, bgColor: 'bg-gray-100' },
  };
  return configs[status];
};

const formatCurrency = (amount: number, t: typeof translations.en) => {
  return `${t.currency}${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export function ClientInvoices({
  invoices,
  payments,
  onDownloadInvoice,
  language = 'en',
}: ClientInvoicesProps) {
  const [activeTab, setActiveTab] = useState<'invoices' | 'payments'>('invoices');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const t = translations[language];

  // Calculate totals
  const totalOutstanding = invoices.reduce((sum, inv) => sum + inv.balanceDue, 0);
  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <ArrowDownRight className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-green-600">{language === 'en' ? 'Total Paid' : 'Total Pagado'}</p>
                <p className="text-xl font-bold text-green-700">{formatCurrency(totalPaid, t)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                <ArrowUpRight className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-amber-600">{language === 'en' ? 'Outstanding' : 'Pendiente'}</p>
                <p className="text-xl font-bold text-amber-700">{formatCurrency(totalOutstanding, t)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 pb-2">
        <Button
          variant={activeTab === 'invoices' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('invoices')}
          className={activeTab === 'invoices' ? 'bg-[#1E3A5F] hover:bg-[#2C4A6F]' : ''}
        >
          <FileText className="w-4 h-4 mr-2" />
          {t.invoicesTab}
        </Button>
        <Button
          variant={activeTab === 'payments' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('payments')}
          className={activeTab === 'payments' ? 'bg-[#1E3A5F] hover:bg-[#2C4A6F]' : ''}
        >
          <CreditCard className="w-4 h-4 mr-2" />
          {t.paymentsTab}
        </Button>
      </div>

      {/* Invoices List */}
      {activeTab === 'invoices' && (
        <div className="space-y-3">
          {invoices.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">{t.noInvoices}</p>
              </CardContent>
            </Card>
          ) : (
            invoices.map(invoice => {
              const statusConfig = getStatusConfig(invoice.status);
              const StatusIcon = statusConfig.icon;
              return (
                <Card 
                  key={invoice.id} 
                  className="hover:shadow-md transition-shadow cursor-pointer group"
                  onClick={() => setSelectedInvoice(invoice)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      {/* Invoice Icon */}
                      <div className={`w-12 h-12 rounded-lg ${statusConfig.bgColor} flex items-center justify-center flex-shrink-0`}>
                        <StatusIcon className={`w-6 h-6 ${statusConfig.color}`} />
                      </div>

                      {/* Invoice Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900">{invoice.invoiceNumber}</p>
                        <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {invoice.issueDate}
                          </span>
                          <span>•</span>
                          <span>{language === 'en' ? 'Due' : 'Vence'}: {invoice.dueDate}</span>
                        </div>
                      </div>

                      {/* Amount */}
                      <div className="text-right">
                        <p className="font-bold text-gray-900">{formatCurrency(invoice.total, t)}</p>
                        {invoice.balanceDue > 0 && (
                          <p className="text-sm text-amber-600">{formatCurrency(invoice.balanceDue, t)} {language === 'en' ? 'due' : 'pendiente'}</p>
                        )}
                      </div>

                      {/* Status Badge */}
                      <Badge className={`${statusConfig.bgColor} ${statusConfig.color} border-0`}>
                        {t.statuses[invoice.status]}
                      </Badge>

                      <ChevronRight className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      )}

      {/* Payments List */}
      {activeTab === 'payments' && (
        <div className="space-y-3">
          {payments.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center">
                <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">{t.noPayments}</p>
              </CardContent>
            </Card>
          ) : (
            payments.map(payment => (
              <Card key={payment.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>

                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{formatCurrency(payment.amount, t)}</p>
                      <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                        <span>{payment.date}</span>
                        <span>•</span>
                        <span>{t.methods[payment.method as keyof typeof t.methods] || payment.method}</span>
                      </div>
                    </div>

                    {payment.reference && (
                      <div className="text-right">
                        <p className="text-xs text-gray-400">{t.reference}</p>
                        <p className="text-sm text-gray-600">{payment.reference}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Invoice Detail Dialog */}
      <Dialog open={!!selectedInvoice} onOpenChange={() => setSelectedInvoice(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#1E3A5F]" />
              {selectedInvoice?.invoiceNumber}
            </DialogTitle>
          </DialogHeader>

          {selectedInvoice && (
            <div className="space-y-4">
              {/* Invoice Header */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-xs text-gray-500">{t.issueDate}</p>
                  <p className="font-medium">{selectedInvoice.issueDate}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">{t.dueDate}</p>
                  <p className="font-medium">{selectedInvoice.dueDate}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">{t.status}</p>
                  <Badge className={`${getStatusConfig(selectedInvoice.status).bgColor} ${getStatusConfig(selectedInvoice.status).color} border-0`}>
                    {t.statuses[selectedInvoice.status]}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-gray-500">{t.total}</p>
                  <p className="font-bold text-lg">{formatCurrency(selectedInvoice.total, t)}</p>
                </div>
              </div>

              {/* Line Items */}
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left p-3 text-sm font-medium text-gray-500">{t.description}</th>
                      <th className="text-center p-3 text-sm font-medium text-gray-500 w-20">{t.quantity}</th>
                      <th className="text-right p-3 text-sm font-medium text-gray-500 w-24">{t.rate}</th>
                      <th className="text-right p-3 text-sm font-medium text-gray-500 w-24">{t.amount}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {selectedInvoice.items.map((item, idx) => (
                      <tr key={idx}>
                        <td className="p-3 text-sm">{item.description}</td>
                        <td className="p-3 text-sm text-center">{item.quantity}</td>
                        <td className="p-3 text-sm text-right">{formatCurrency(item.rate, t)}</td>
                        <td className="p-3 text-sm text-right font-medium">{formatCurrency(item.amount, t)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="space-y-2 p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">{t.subtotal}</span>
                  <span>{formatCurrency(selectedInvoice.subtotal, t)}</span>
                </div>
                {selectedInvoice.discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>{t.discount}</span>
                    <span>-{formatCurrency(selectedInvoice.discount, t)}</span>
                  </div>
                )}
                {selectedInvoice.tax > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">{t.tax}</span>
                    <span>{formatCurrency(selectedInvoice.tax, t)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-bold">
                  <span>{t.grandTotal}</span>
                  <span>{formatCurrency(selectedInvoice.total, t)}</span>
                </div>
                {selectedInvoice.amountPaid > 0 && (
                  <>
                    <div className="flex justify-between text-sm text-green-600">
                      <span>{t.amountPaid}</span>
                      <span>-{formatCurrency(selectedInvoice.amountPaid, t)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-amber-600">
                      <span>{t.balanceDue}</span>
                      <span>{formatCurrency(selectedInvoice.balanceDue, t)}</span>
                    </div>
                  </>
                )}
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setSelectedInvoice(null)}>
                  {language === 'en' ? 'Close' : 'Cerrar'}
                </Button>
                <Button 
                  className="bg-[#C4A35A] hover:bg-[#B8943D]"
                  onClick={() => {
                    onDownloadInvoice(selectedInvoice.id);
                  }}
                >
                  <Download className="w-4 h-4 mr-2" />
                  {t.download}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ClientInvoices;
