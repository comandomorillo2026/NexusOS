'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  X, 
  Building2, 
  Mail, 
  Phone, 
  Calendar, 
  DollarSign,
  Users,
  FileText,
  CreditCard,
  Settings,
  BarChart3,
  Stethoscope,
  Heart,
  Scale,
  Scissors,
  Store,
  Cookie,
  CheckCircle,
  XCircle,
  Pause,
  Play,
  Globe,
  Palette
} from 'lucide-react';
import { formatCurrency, type Tenant, type Invoice } from '@/lib/admin-types';

interface TenantDetailModalProps {
  tenant: Tenant | null;
  invoices: Invoice[];
  onClose: () => void;
  onUpdate: (tenant: Tenant) => void;
}

export function TenantDetailModal({ tenant, invoices, onClose, onUpdate }: TenantDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'info' | 'invoices' | 'settings'>('info');

  // Handle Escape key and click outside to close
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  }, [onClose]);
  
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [handleKeyDown]);
  
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!tenant) return null;

  const industryConfig: Record<string, { label: string; icon: React.ElementType; color: string }> = {
    clinic: { label: 'Clínica', icon: Stethoscope, color: '#22D3EE' },
    nurse: { label: 'Enfermería', icon: Heart, color: '#34D399' },
    lawfirm: { label: 'Bufete', icon: Scale, color: '#C4A35A' },
    beauty: { label: 'Salón/SPA', icon: Scissors, color: '#EC4899' },
    retail: { label: 'Retail', icon: Store, color: '#F97316' },
    bakery: { label: 'Panadería', icon: Cookie, color: '#D97706' },
  };

  const statusConfig = {
    active: { label: 'Activo', color: 'bg-[var(--success)]/10 text-[var(--success)]', icon: CheckCircle },
    pending: { label: 'Pendiente', color: 'bg-[var(--nexus-gold)]/10 text-[var(--nexus-gold)]', icon: Pause },
    suspended: { label: 'Suspendido', color: 'bg-[var(--error)]/10 text-[var(--error)]', icon: XCircle },
  };

  const industryInfo = industryConfig[tenant.industry] || { label: 'Otro', icon: Building2, color: '#9D7BEA' };
  const IndustryIcon = industryInfo.icon;
  const statusInfo = statusConfig[tenant.status];
  const StatusIcon = statusInfo.icon;

  const tenantInvoices = invoices.filter(inv => inv.tenantId === tenant.id);
  const totalPaid = tenantInvoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.total, 0);

  const handleStatusChange = (newStatus: 'active' | 'pending' | 'suspended') => {
    onUpdate({ ...tenant, status: newStatus });
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl bg-[#0A0820] border border-[rgba(167,139,250,0.2)] shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-[#0A0820] z-10 p-6 border-b border-[rgba(167,139,250,0.1)]">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div 
                className="w-16 h-16 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${industryInfo.color}20` }}
              >
                <IndustryIcon className="w-8 h-8" style={{ color: industryInfo.color }} />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold text-[var(--text-primary)]">{tenant.businessName}</h2>
                  <span className={`px-3 py-1 rounded-full text-xs ${statusInfo.color} flex items-center gap-1`}>
                    <StatusIcon className="w-3 h-3" />
                    {statusInfo.label}
                  </span>
                </div>
                <div className="flex items-center gap-4 mt-1 text-sm text-[var(--text-mid)]">
                  <span className="flex items-center gap-1">
                    <Building2 className="w-4 h-4" />
                    Tenant #{tenant.tenantNumber}
                  </span>
                  <span>{industryInfo.label}</span>
                  <span>Plan {tenant.plan}</span>
                </div>
              </div>
            </div>
            <button onClick={onClose} className="text-[var(--text-dim)] hover:text-[var(--text-primary)] text-2xl">
              ×
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mt-6">
            {[
              { id: 'info', label: 'Información', icon: Building2 },
              { id: 'invoices', label: 'Facturas', icon: FileText },
              { id: 'settings', label: 'Configuración', icon: Settings },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-[var(--nexus-violet)]/20 text-[var(--nexus-violet-lite)] border border-[var(--nexus-violet)]/30'
                    : 'text-[var(--text-mid)] hover:bg-[var(--glass)]'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'info' && (
            <div className="space-y-6">
              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-lg bg-[var(--glass)] border border-[var(--glass-border)]">
                  <p className="text-xs text-[var(--text-dim)]">Usuarios</p>
                  <p className="text-2xl font-bold text-[var(--text-primary)]">{tenant.users}</p>
                </div>
                <div className="p-4 rounded-lg bg-[var(--glass)] border border-[var(--glass-border)]">
                  <p className="text-xs text-[var(--text-dim)]">Total Pagado</p>
                  <p className="text-2xl font-bold text-[var(--success)]">{formatCurrency(totalPaid)}</p>
                </div>
                <div className="p-4 rounded-lg bg-[var(--glass)] border border-[var(--glass-border)]">
                  <p className="text-xs text-[var(--text-dim)]">Facturas</p>
                  <p className="text-2xl font-bold text-[var(--text-primary)]">{tenantInvoices.length}</p>
                </div>
                <div className="p-4 rounded-lg bg-[var(--glass)] border border-[var(--glass-border)]">
                  <p className="text-xs text-[var(--text-dim)]">Ciclo</p>
                  <p className="text-2xl font-bold text-[var(--nexus-gold)]">{tenant.billingCycle === 'monthly' ? 'Mensual' : 'Anual'}</p>
                </div>
              </div>

              {/* Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-[var(--text-primary)]">Información del Negocio</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-[var(--glass)]">
                      <Building2 className="w-5 h-5 text-[var(--text-dim)]" />
                      <div>
                        <p className="text-xs text-[var(--text-dim)]">Nombre</p>
                        <p className="text-[var(--text-primary)]">{tenant.businessName}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-[var(--glass)]">
                      <Users className="w-5 h-5 text-[var(--text-dim)]" />
                      <div>
                        <p className="text-xs text-[var(--text-dim)]">Propietario</p>
                        <p className="text-[var(--text-primary)]">{tenant.ownerName}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-[var(--glass)]">
                      <Mail className="w-5 h-5 text-[var(--text-dim)]" />
                      <div>
                        <p className="text-xs text-[var(--text-dim)]">Email</p>
                        <p className="text-[var(--text-primary)]">{tenant.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-[var(--glass)]">
                      <Phone className="w-5 h-5 text-[var(--text-dim)]" />
                      <div>
                        <p className="text-xs text-[var(--text-dim)]">Teléfono</p>
                        <p className="text-[var(--text-primary)]">{tenant.phone}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-[var(--text-primary)]">Información de Suscripción</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-[var(--glass)]">
                      <DollarSign className="w-5 h-5 text-[var(--nexus-gold)]" />
                      <div>
                        <p className="text-xs text-[var(--text-dim)]">Plan Actual</p>
                        <p className="text-[var(--nexus-gold)] font-semibold">{tenant.plan}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-[var(--glass)]">
                      <CreditCard className="w-5 h-5 text-[var(--text-dim)]" />
                      <div>
                        <p className="text-xs text-[var(--text-dim)]">Ciclo de Facturación</p>
                        <p className="text-[var(--text-primary)]">{tenant.billingCycle === 'monthly' ? 'Mensual' : 'Anual'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-[var(--glass)]">
                      <Calendar className="w-5 h-5 text-[var(--text-dim)]" />
                      <div>
                        <p className="text-xs text-[var(--text-dim)]">Fecha de Creación</p>
                        <p className="text-[var(--text-primary)]">{new Date(tenant.createdAt).toLocaleDateString('es-TT', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}</p>
                      </div>
                    </div>
                    {tenant.notes && (
                      <div className="p-3 rounded-lg bg-[rgba(108,63,206,0.1)] border border-[rgba(167,139,250,0.2)]">
                        <p className="text-xs text-[var(--text-dim)] mb-1">Notas</p>
                        <p className="text-sm text-[var(--text-primary)]">{tenant.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Status Actions */}
              <div className="p-4 rounded-lg bg-[var(--glass)] border border-[var(--glass-border)]">
                <p className="text-sm text-[var(--text-mid)] mb-3">Cambiar Estado</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleStatusChange('active')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      tenant.status === 'active'
                        ? 'bg-[var(--success)] text-white'
                        : 'bg-[var(--glass)] text-[var(--text-mid)] hover:bg-[var(--success)]/10 hover:text-[var(--success)]'
                    }`}
                  >
                    <Play className="w-4 h-4" />
                    Activo
                  </button>
                  <button
                    onClick={() => handleStatusChange('pending')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      tenant.status === 'pending'
                        ? 'bg-[var(--nexus-gold)] text-white'
                        : 'bg-[var(--glass)] text-[var(--text-mid)] hover:bg-[var(--nexus-gold)]/10 hover:text-[var(--nexus-gold)]'
                    }`}
                  >
                    <Pause className="w-4 h-4" />
                    Pendiente
                  </button>
                  <button
                    onClick={() => handleStatusChange('suspended')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      tenant.status === 'suspended'
                        ? 'bg-[var(--error)] text-white'
                        : 'bg-[var(--glass)] text-[var(--text-mid)] hover:bg-[var(--error)]/10 hover:text-[var(--error)]'
                    }`}
                  >
                    <XCircle className="w-4 h-4" />
                    Suspendido
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'invoices' && (
            <div className="space-y-4">
              {tenantInvoices.length > 0 ? (
                <div className="space-y-3">
                  {tenantInvoices.map((invoice) => (
                    <div 
                      key={invoice.id}
                      className="flex items-center justify-between p-4 rounded-lg bg-[var(--glass)] border border-[var(--glass-border)]"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-[var(--nexus-violet)]/10 flex items-center justify-center">
                          <FileText className="w-5 h-5 text-[var(--nexus-violet)]" />
                        </div>
                        <div>
                          <p className="font-mono text-[var(--nexus-violet-lite)]">{invoice.invoiceNumber}</p>
                          <p className="text-xs text-[var(--text-dim)]">
                            {new Date(invoice.createdAt).toLocaleDateString('es-TT')}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-[var(--nexus-gold)]">{formatCurrency(invoice.total)}</p>
                        <p className={`text-xs ${
                          invoice.status === 'paid' ? 'text-[var(--success)]' :
                          invoice.status === 'pending' ? 'text-[var(--nexus-gold)]' : 'text-[var(--error)]'
                        }`}>
                          {invoice.status === 'paid' ? 'Pagada' : invoice.status === 'pending' ? 'Pendiente' : 'Vencida'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 mx-auto text-[var(--text-dim)] mb-4" />
                  <p className="text-[var(--text-mid)]">No hay facturas para este inquilino</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              {/* Language Settings */}
              <div className="p-4 rounded-lg bg-[var(--glass)] border border-[var(--glass-border)]">
                <div className="flex items-center gap-3 mb-4">
                  <Globe className="w-5 h-5 text-[var(--nexus-aqua)]" />
                  <h4 className="font-medium text-[var(--text-primary)]">Idioma del Workspace</h4>
                </div>
                <div className="flex gap-3">
                  <button className="flex-1 p-3 rounded-lg border border-[var(--nexus-violet)]/30 bg-[var(--nexus-violet)]/10 text-[var(--text-primary)]">
                    🇪🇸 Español
                  </button>
                  <button className="flex-1 p-3 rounded-lg border border-[var(--glass-border)] text-[var(--text-mid)] hover:border-[var(--nexus-violet)]/30">
                    🇬🇧 English
                  </button>
                </div>
              </div>

              {/* Theme Settings */}
              <div className="p-4 rounded-lg bg-[var(--glass)] border border-[var(--glass-border)]">
                <div className="flex items-center gap-3 mb-4">
                  <Palette className="w-5 h-5 text-[var(--nexus-fuchsia)]" />
                  <h4 className="font-medium text-[var(--text-primary)]">Colores del Workspace</h4>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { name: 'Violeta', color: '#6C3FCE' },
                    { name: 'Oro', color: '#F0B429' },
                    { name: 'Aqua', color: '#22D3EE' },
                    { name: 'Rosa', color: '#EC4899' },
                  ].map((theme) => (
                    <button
                      key={theme.color}
                      className="flex flex-col items-center gap-2 p-3 rounded-lg border border-[var(--glass-border)] hover:border-[var(--nexus-violet)]/30 transition-colors"
                    >
                      <div 
                        className="w-8 h-8 rounded-full"
                        style={{ backgroundColor: theme.color }}
                      />
                      <span className="text-xs text-[var(--text-mid)]">{theme.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Preview */}
              <div className="p-4 rounded-lg bg-[rgba(108,63,206,0.1)] border border-[rgba(167,139,250,0.2)]">
                <p className="text-sm text-[var(--text-mid)] mb-2">Vista Previa</p>
                <div className="h-32 rounded-lg bg-[var(--obsidian)] border border-[var(--glass-border)] flex items-center justify-center">
                  <p className="text-[var(--text-dim)]">Los cambios se aplicarán al workspace del inquilino</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
