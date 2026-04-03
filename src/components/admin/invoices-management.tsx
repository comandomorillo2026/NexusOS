'use client';

import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  MoreVertical,
  Eye,
  Mail,
  MessageSquare,
  Download,
  Send,
  DollarSign,
  Calendar,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { formatCurrency, type Invoice } from '@/lib/admin-types';

interface InvoicesManagementProps {
  invoices: Invoice[];
  onRefresh?: () => void;
}

export function InvoicesManagement({ invoices, onRefresh }: InvoicesManagementProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'pending' | 'overdue'>('all');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const statusConfig = {
    paid: { label: 'Pagada', color: 'bg-[var(--success)]/10 text-[var(--success)]', icon: CheckCircle },
    pending: { label: 'Pendiente', color: 'bg-[var(--nexus-gold)]/10 text-[var(--nexus-gold)]', icon: Clock },
    overdue: { label: 'Vencida', color: 'bg-[var(--error)]/10 text-[var(--error)]', icon: AlertCircle },
    cancelled: { label: 'Cancelada', color: 'bg-[var(--text-dim)]/10 text-[var(--text-dim)]', icon: XCircle },
  };

  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          inv.tenantName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalRevenue = invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.total, 0);
  const pendingAmount = invoices.filter(i => i.status === 'pending' || i.status === 'overdue').reduce((sum, i) => sum + i.total, 0);

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[var(--success)]/10 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-[var(--success)]" />
            </div>
            <div>
              <p className="text-xs text-[var(--text-dim)]">Cobrado este mes</p>
              <p className="text-lg font-bold text-[var(--success)]">{formatCurrency(totalRevenue)}</p>
            </div>
          </div>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[var(--nexus-gold)]/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-[var(--nexus-gold)]" />
            </div>
            <div>
              <p className="text-xs text-[var(--text-dim)]">Pendiente de cobro</p>
              <p className="text-lg font-bold text-[var(--nexus-gold)]">{formatCurrency(pendingAmount)}</p>
            </div>
          </div>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[var(--nexus-violet)]/10 flex items-center justify-center">
              <FileText className="w-5 h-5 text-[var(--nexus-violet)]" />
            </div>
            <div>
              <p className="text-xs text-[var(--text-dim)]">Total facturas</p>
              <p className="text-lg font-bold text-[var(--text-primary)]">{invoices.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)]">Gestión de Facturas</h2>
          <p className="text-sm text-[var(--text-mid)]">Historial y seguimiento de pagos</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-dim)]" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por número o nombre..."
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'paid', 'pending', 'overdue'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                statusFilter === status
                  ? 'bg-[var(--nexus-gold)] text-white'
                  : 'bg-[var(--glass)] text-[var(--text-mid)] hover:text-[var(--text-primary)]'
              }`}
            >
              {status === 'all' ? 'Todas' : status === 'paid' ? 'Pagadas' : status === 'pending' ? 'Pendientes' : 'Vencidas'}
            </button>
          ))}
        </div>
      </div>

      {/* Invoices Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--glass-border)] bg-[var(--glass)]">
                <th className="text-left py-3 px-4 text-sm font-medium text-[var(--text-mid)]">Factura</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-[var(--text-mid)]">Cliente</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-[var(--text-mid)]">Plan</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-[var(--text-mid)]">Monto</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-[var(--text-mid)]">Fecha</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-[var(--text-mid)]">Estado</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-[var(--text-mid)]">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.map((invoice) => {
                const statusInfo = statusConfig[invoice.status];
                const StatusIcon = statusInfo.icon;
                
                return (
                  <tr key={invoice.id} className="border-b border-[var(--glass-border)] last:border-0 hover:bg-[var(--glass)]">
                    <td className="py-3 px-4">
                      <span className="text-[var(--nexus-violet-lite)] font-mono text-sm">{invoice.invoiceNumber}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="text-sm text-[var(--text-primary)]">{invoice.tenantName}</p>
                        <p className="text-xs text-[var(--text-dim)]">Tenant #{invoice.tenantNumber}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="text-sm text-[var(--text-primary)]">{invoice.plan}</p>
                        <p className="text-xs text-[var(--text-dim)]">{invoice.billingCycle === 'monthly' ? 'Mensual' : 'Anual'}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm font-mono text-[var(--nexus-gold)]">{formatCurrency(invoice.total)}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="text-sm text-[var(--text-primary)]">{new Date(invoice.createdAt).toLocaleDateString('es-TT')}</p>
                        <p className="text-xs text-[var(--text-dim)]">Vence: {new Date(invoice.dueDate).toLocaleDateString('es-TT')}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs ${statusInfo.color}`}>
                        <StatusIcon className="w-3 h-3" />
                        {statusInfo.label}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setSelectedInvoice(invoice)}
                          className="p-2 rounded-lg hover:bg-[var(--glass)] text-[var(--text-dim)] hover:text-[var(--text-primary)] transition-colors"
                          title="Ver detalles"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          className="p-2 rounded-lg hover:bg-[var(--glass)] text-[var(--text-dim)] hover:text-[var(--nexus-aqua)] transition-colors"
                          title="Enviar por email"
                        >
                          <Mail className="w-4 h-4" />
                        </button>
                        <button
                          className="p-2 rounded-lg hover:bg-[var(--glass)] text-[var(--text-dim)] hover:text-[#25D366] transition-colors"
                          title="Enviar por WhatsApp"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </button>
                        <button
                          className="p-2 rounded-lg hover:bg-[var(--glass)] text-[var(--text-dim)] hover:text-[var(--nexus-gold)] transition-colors"
                          title="Descargar PDF"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredInvoices.length === 0 && (
          <div className="p-8 text-center">
            <FileText className="w-12 h-12 mx-auto text-[var(--text-dim)] mb-4" />
            <p className="text-[var(--text-mid)]">No se encontraron facturas</p>
          </div>
        )}
      </div>

      {/* Invoice Detail Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-2xl bg-[#0A0820] border border-[rgba(167,139,250,0.2)] shadow-2xl">
            <div className="p-6 border-b border-[rgba(167,139,250,0.1)] flex items-center justify-between">
              <h3 className="text-lg font-bold text-[var(--text-primary)]">Detalle de Factura</h3>
              <button onClick={() => setSelectedInvoice(null)} className="text-[var(--text-dim)] hover:text-[var(--text-primary)]">
                ×
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="text-center pb-4 border-b border-[var(--glass-border)]">
                <p className="text-2xl font-mono font-bold text-[var(--nexus-violet-lite)]">{selectedInvoice.invoiceNumber}</p>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm mt-2 ${statusConfig[selectedInvoice.status].color}`}>
                  {statusConfig[selectedInvoice.status].label}
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-[var(--text-dim)]">Cliente:</span>
                  <span className="text-[var(--text-primary)]">{selectedInvoice.tenantName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-dim)]">Plan:</span>
                  <span className="text-[var(--text-primary)]">{selectedInvoice.plan}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-dim)]">Subtotal:</span>
                  <span className="text-[var(--text-primary)]">{formatCurrency(selectedInvoice.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-dim)]">Impuesto:</span>
                  <span className="text-[var(--text-primary)]">{formatCurrency(selectedInvoice.tax)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-[var(--glass-border)] font-bold">
                  <span className="text-[var(--nexus-gold)]">TOTAL:</span>
                  <span className="text-[var(--nexus-gold)]">{formatCurrency(selectedInvoice.total)}</span>
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-[rgba(167,139,250,0.1)] flex gap-2">
              <button
                onClick={() => setSelectedInvoice(null)}
                className="flex-1 py-2 rounded-lg border border-[var(--glass-border)] text-[var(--text-mid)] hover:bg-[var(--glass)] transition-colors"
              >
                Cerrar
              </button>
              <button className="flex-1 py-2 rounded-lg bg-gradient-to-r from-[#6C3FCE] to-[#C026D3] text-white font-medium hover:opacity-90 flex items-center justify-center gap-2">
                <Send className="w-4 h-4" />
                Reenviar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
