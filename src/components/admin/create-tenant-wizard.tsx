'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  X, 
  CheckCircle, 
  ChevronRight, 
  ArrowLeft, 
  RefreshCw,
  Mail,
  MessageSquare,
  Download,
  Copy,
  Stethoscope,
  Heart,
  Scale,
  Scissors,
  Store,
  Cookie
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PRICING, TAX_RATE, generateInvoiceNumber, formatCurrency, type Tenant, type Invoice } from '@/lib/admin-types';

interface CreateTenantWizardProps {
  onClose: () => void;
  onSuccess: (tenant: Tenant, invoice: Invoice) => void;
  nextTenantNumber: number;
}

export function CreateTenantWizard({ onClose, onSuccess, nextTenantNumber }: CreateTenantWizardProps) {
  const [step, setStep] = useState(1);
  
  // Handle Escape key and click outside to close
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  }, [onClose]);
  
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    // Prevent body scroll when modal is open
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
  const [isCreating, setIsCreating] = useState(false);
  const [createdTenant, setCreatedTenant] = useState<Tenant | null>(null);
  const [createdInvoice, setCreatedInvoice] = useState<Invoice | null>(null);
  const [sendMethod, setSendMethod] = useState<'email' | 'whatsapp' | 'saved' | null>(null);
  
  const [formData, setFormData] = useState({
    businessName: '',
    ownerName: '',
    email: '',
    phone: '',
    industry: '',
    plan: 'GROWTH' as 'STARTER' | 'GROWTH' | 'PREMIUM',
    billingCycle: 'monthly' as 'monthly' | 'annual',
    notes: ''
  });

  const industries = [
    { value: 'clinic', label: 'Clínica / Centro Médico', icon: Stethoscope, color: '#22D3EE' },
    { value: 'nurse', label: 'Enfermería / Home Care', icon: Heart, color: '#34D399' },
    { value: 'lawfirm', label: 'Bufete de Abogados', icon: Scale, color: '#C4A35A' },
    { value: 'beauty', label: 'Salón de Belleza / SPA', icon: Scissors, color: '#EC4899' },
    { value: 'retail', label: 'Tienda / Retail', icon: Store, color: '#F97316' },
    { value: 'bakery', label: 'Panadería', icon: Cookie, color: '#D97706' },
  ];

  const plans = [
    { value: 'STARTER', label: 'Starter', users: '1-2 usuarios' },
    { value: 'GROWTH', label: 'Growth', users: '3-5 usuarios', popular: true },
    { value: 'PREMIUM', label: 'Premium', users: '6+ usuarios' },
  ];

  const getPlanPrice = (plan: string, cycle: string) => {
    const pricing = PRICING[plan as keyof typeof PRICING];
    return cycle === 'annual' ? pricing.annual : pricing.monthly;
  };

  const calculateTotals = () => {
    const basePrice = getPlanPrice(formData.plan, formData.billingCycle);
    const activation = PRICING[formData.plan].activation;
    const subtotal = basePrice + activation;
    const tax = subtotal * (TAX_RATE / 100);
    const total = subtotal + tax;
    return { basePrice, activation, subtotal, tax, total };
  };

  const handleCreate = () => {
    setIsCreating(true);
    
    setTimeout(() => {
      const now = new Date();
      const { total } = calculateTotals();
      
      const newTenant: Tenant = {
        id: `tenant-${Date.now()}`,
        tenantNumber: nextTenantNumber,
        businessName: formData.businessName,
        ownerName: formData.ownerName,
        email: formData.email,
        phone: formData.phone,
        industry: formData.industry as Tenant['industry'],
        plan: formData.plan,
        billingCycle: formData.billingCycle,
        status: 'pending',
        users: 0,
        createdAt: now.toISOString(),
        notes: formData.notes,
        totalPayments: 0
      };
      
      const newInvoice: Invoice = {
        id: `invoice-${Date.now()}`,
        invoiceNumber: generateInvoiceNumber(nextTenantNumber, now),
        tenantId: newTenant.id,
        tenantName: newTenant.businessName,
        tenantNumber: nextTenantNumber,
        industry: formData.industry,
        plan: formData.plan,
        billingCycle: formData.billingCycle,
        subtotal: calculateTotals().subtotal,
        tax: calculateTotals().tax,
        total: total,
        status: 'pending',
        createdAt: now.toISOString(),
        dueDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString()
      };
      
      setCreatedTenant(newTenant);
      setCreatedInvoice(newInvoice);
      setIsCreating(false);
      setStep(4); // Go to success/invoice step
    }, 2000);
  };

  const handleSendInvoice = (method: 'email' | 'whatsapp' | 'saved') => {
    setSendMethod(method);
    if (createdTenant && createdInvoice) {
      onSuccess(createdTenant, createdInvoice);
    }
  };

  const handleCopyToClipboard = () => {
    if (!createdInvoice) return;
    const text = `
FACTURA NEXUSOS
===============
Número: ${createdInvoice.invoiceNumber}
Cliente: ${createdTenant?.businessName}
Propietario: ${createdTenant?.ownerName}
Industria: ${industries.find(i => i.value === createdTenant?.industry)?.label}
Plan: ${createdInvoice.plan}
Ciclo: ${createdInvoice.billingCycle === 'monthly' ? 'Mensual' : 'Anual'}
-------------------
Subtotal: ${formatCurrency(createdInvoice.subtotal)}
Impuesto (${TAX_RATE}%): ${formatCurrency(createdInvoice.tax)}
TOTAL: ${formatCurrency(createdInvoice.total)}
-------------------
Fecha: ${new Date(createdInvoice.createdAt).toLocaleDateString('es-TT')}
Vence: ${new Date(createdInvoice.dueDate).toLocaleDateString('es-TT')}
    `.trim();
    navigator.clipboard.writeText(text);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-[#0A0820] border border-[rgba(167,139,250,0.2)] shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-[#0A0820] p-6 border-b border-[rgba(167,139,250,0.1)] flex items-center justify-between z-10">
          <div>
            <h2 className="text-xl font-bold text-[var(--text-primary)]">
              {step === 4 ? '¡Inquilino Creado!' : 'Crear Nuevo Inquilino'}
            </h2>
            <p className="text-sm text-[var(--text-mid)] mt-1">
              {step === 4 
                ? `Tenant #${nextTenantNumber} - ${createdTenant?.businessName}`
                : `Paso ${step} de 3`
              }
            </p>
          </div>
          <button onClick={onClose} className="text-[var(--text-dim)] hover:text-[var(--text-primary)]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar - Only steps 1-3 */}
        {step < 4 && (
          <div className="px-6 py-3 bg-[rgba(108,63,206,0.05)]">
            <div className="flex items-center gap-2">
              {[1, 2, 3].map((s) => (
                <React.Fragment key={s}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    s <= step 
                      ? 'bg-[var(--nexus-gold)] text-white' 
                      : 'bg-[var(--glass)] text-[var(--text-dim)]'
                  }`}>
                    {s}
                  </div>
                  {s < 3 && <div className={`flex-1 h-1 rounded ${s < step ? 'bg-[var(--nexus-gold)]' : 'bg-[var(--glass)]'}`} />}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          {/* Step 1: Business Info */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">Información del Negocio</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[var(--text-mid)]">Nombre del Negocio *</Label>
                  <Input
                    value={formData.businessName}
                    onChange={(e) => setFormData(prev => ({ ...prev, businessName: e.target.value }))}
                    placeholder="Ej: Clínica San Fernando"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[var(--text-mid)]">Propietario *</Label>
                  <Input
                    value={formData.ownerName}
                    onChange={(e) => setFormData(prev => ({ ...prev, ownerName: e.target.value }))}
                    placeholder="Ej: Dr. Juan Pérez"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[var(--text-mid)]">Email *</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="contacto@negocio.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[var(--text-mid)]">Teléfono *</Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+1 868 XXX XXXX"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[var(--text-mid)]">Industria *</Label>
                <div className="grid grid-cols-2 gap-3">
                  {industries.map((ind) => (
                    <button
                      key={ind.value}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, industry: ind.value }))}
                      className={`flex items-center gap-3 p-4 rounded-lg border transition-all ${
                        formData.industry === ind.value
                          ? 'border-[var(--nexus-gold)] bg-[rgba(240,180,41,0.1)]'
                          : 'border-[var(--glass-border)] hover:border-[rgba(167,139,250,0.3)]'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${ind.color}20` }}>
                        <ind.icon className="w-5 h-5" style={{ color: ind.color }} />
                      </div>
                      <span className="text-sm text-[var(--text-primary)]">{ind.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Plan Selection */}
          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">Seleccionar Plan</h3>
              
              <div className="space-y-3">
                {plans.map((plan) => (
                  <button
                    key={plan.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, plan: plan.value as typeof formData.plan }))}
                    className={`w-full flex items-center justify-between p-4 rounded-lg border transition-all ${
                      formData.plan === plan.value
                        ? 'border-[var(--nexus-gold)] bg-[rgba(240,180,41,0.1)]'
                        : 'border-[var(--glass-border)] hover:border-[rgba(167,139,250,0.3)]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        formData.plan === plan.value ? 'border-[var(--nexus-gold)]' : 'border-[var(--text-dim)]'
                      }`}>
                        {formData.plan === plan.value && <div className="w-3 h-3 rounded-full bg-[var(--nexus-gold)]" />}
                      </div>
                      <div className="text-left">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-[var(--text-primary)]">{plan.label}</span>
                          {plan.popular && (
                            <span className="px-2 py-0.5 rounded text-xs bg-[var(--nexus-gold)] text-white">Popular</span>
                          )}
                        </div>
                        <span className="text-sm text-[var(--text-dim)]">{plan.users}</span>
                      </div>
                    </div>
                    <span className="font-semibold text-[var(--nexus-gold)]">
                      {formatCurrency(getPlanPrice(plan.value, formData.billingCycle))}/mes
                    </span>
                  </button>
                ))}
              </div>

              <div className="space-y-2">
                <Label className="text-[var(--text-mid)]">Ciclo de Facturación</Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, billingCycle: 'monthly' }))}
                    className={`p-3 rounded-lg border text-center transition-all ${
                      formData.billingCycle === 'monthly'
                        ? 'border-[var(--nexus-gold)] bg-[rgba(240,180,41,0.1)]'
                        : 'border-[var(--glass-border)]'
                    }`}
                  >
                    <span className="block font-medium text-[var(--text-primary)]">Mensual</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, billingCycle: 'annual' }))}
                    className={`p-3 rounded-lg border text-center transition-all ${
                      formData.billingCycle === 'annual'
                        ? 'border-[var(--success)] bg-[rgba(52,211,153,0.1)]'
                        : 'border-[var(--glass-border)]'
                    }`}
                  >
                    <span className="block font-medium text-[var(--text-primary)]">Anual</span>
                    <span className="block text-xs text-[var(--success)]">Ahorra 15%</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Confirmation */}
          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">Confirmar y Crear</h3>
              
              <div className="p-4 rounded-lg bg-[var(--glass)] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[var(--text-mid)]">Número de Tenant:</span>
                  <span className="text-[var(--nexus-gold)] font-mono font-bold">#{nextTenantNumber}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--text-mid)]">Negocio:</span>
                  <span className="text-[var(--text-primary)] font-medium">{formData.businessName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--text-mid)]">Propietario:</span>
                  <span className="text-[var(--text-primary)]">{formData.ownerName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--text-mid)]">Email:</span>
                  <span className="text-[var(--text-primary)]">{formData.email}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--text-mid)]">Industria:</span>
                  <span className="text-[var(--text-primary)]">
                    {industries.find(i => i.value === formData.industry)?.label}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--text-mid)]">Plan:</span>
                  <span className="text-[var(--nexus-gold)] font-medium">{formData.plan}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--text-mid)]">Facturación:</span>
                  <span className="text-[var(--text-primary)]">
                    {formData.billingCycle === 'monthly' ? 'Mensual' : 'Anual'}
                  </span>
                </div>
              </div>

              {/* Invoice Preview */}
              <div className="p-4 rounded-lg bg-[rgba(108,63,206,0.1)] border border-[rgba(167,139,250,0.2)] space-y-2">
                <h4 className="font-medium text-[var(--text-primary)]">Vista Previa de Factura</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[var(--text-dim)]">Plan ({formData.billingCycle === 'monthly' ? 'Mensual' : 'Anual'}):</span>
                    <span className="text-[var(--text-primary)]">{formatCurrency(getPlanPrice(formData.plan, formData.billingCycle))}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--text-dim)]">Activación:</span>
                    <span className="text-[var(--text-primary)]">{formatCurrency(PRICING[formData.plan].activation)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--text-dim)]">Subtotal:</span>
                    <span className="text-[var(--text-primary)]">{formatCurrency(calculateTotals().subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--text-dim)]">Impuesto ({TAX_RATE}%):</span>
                    <span className="text-[var(--text-primary)]">{formatCurrency(calculateTotals().tax)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-[rgba(167,139,250,0.2)] font-bold">
                    <span className="text-[var(--nexus-gold)]">TOTAL:</span>
                    <span className="text-[var(--nexus-gold)]">{formatCurrency(calculateTotals().total)}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[var(--text-mid)]">Notas adicionales (opcional)</Label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full p-3 rounded-lg bg-[var(--glass)] border border-[var(--glass-border)] text-[var(--text-primary)] placeholder-[var(--text-dim)] focus:border-[var(--nexus-gold)] focus:outline-none"
                  rows={3}
                  placeholder="Instrucciones especiales, personalización, etc."
                />
              </div>
            </div>
          )}

          {/* Step 4: Success & Invoice */}
          {step === 4 && createdTenant && createdInvoice && (
            <div className="space-y-6">
              {/* Success Message */}
              <div className="text-center p-6 rounded-xl bg-gradient-to-r from-[rgba(52,211,153,0.1)] to-transparent border border-[rgba(52,211,153,0.2)]">
                <div className="w-16 h-16 rounded-full bg-[var(--success)] flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-[var(--text-primary)]">¡Inquilino Creado Exitosamente!</h3>
                <p className="text-[var(--text-mid)] mt-2">
                  Tenant #{createdTenant.tenantNumber} - {createdTenant.businessName}
                </p>
                <p className="text-xs text-[var(--text-dim)] mt-1">
                  Creado el {new Date(createdTenant.createdAt).toLocaleDateString('es-TT', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>

              {/* Invoice Card */}
              <div className="p-6 rounded-xl bg-[var(--glass)] border border-[var(--glass-border)]">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-bold text-[var(--text-primary)]">Factura Generada</h4>
                  <span className="px-3 py-1 rounded-full bg-[var(--nexus-gold)]/10 text-[var(--nexus-gold)] text-sm font-mono">
                    {createdInvoice.invoiceNumber}
                  </span>
                </div>
                
                <div className="space-y-2 text-sm mb-4">
                  <div className="flex justify-between">
                    <span className="text-[var(--text-dim)]">Cliente:</span>
                    <span className="text-[var(--text-primary)]">{createdTenant.businessName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--text-dim)]">Plan:</span>
                    <span className="text-[var(--text-primary)]">{createdInvoice.plan}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--text-dim)]">Vence:</span>
                    <span className="text-[var(--text-primary)]">{new Date(createdInvoice.dueDate).toLocaleDateString('es-TT')}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-[var(--glass-border)] font-bold">
                    <span className="text-[var(--nexus-gold)]">TOTAL:</span>
                    <span className="text-[var(--nexus-gold)]">{formatCurrency(createdInvoice.total)}</span>
                  </div>
                </div>

                <button
                  onClick={handleCopyToClipboard}
                  className="w-full flex items-center justify-center gap-2 p-2 rounded-lg border border-[var(--glass-border)] text-[var(--text-mid)] hover:bg-[var(--glass)] transition-colors text-sm"
                >
                  <Copy className="w-4 h-4" />
                  Copiar detalles al portapapeles
                </button>
              </div>

              {/* Send Options */}
              <div className="space-y-3">
                <p className="text-sm text-[var(--text-mid)]">Enviar factura por:</p>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => handleSendInvoice('email')}
                    className={`flex flex-col items-center gap-2 p-4 rounded-lg border transition-all ${
                      sendMethod === 'email'
                        ? 'border-[var(--success)] bg-[rgba(52,211,153,0.1)]'
                        : 'border-[var(--glass-border)] hover:border-[rgba(167,139,250,0.3)]'
                    }`}
                  >
                    <Mail className="w-6 h-6 text-[var(--nexus-aqua)]" />
                    <span className="text-xs text-[var(--text-primary)]">Email</span>
                  </button>
                  <button
                    onClick={() => handleSendInvoice('whatsapp')}
                    className={`flex flex-col items-center gap-2 p-4 rounded-lg border transition-all ${
                      sendMethod === 'whatsapp'
                        ? 'border-[var(--success)] bg-[rgba(52,211,153,0.1)]'
                        : 'border-[var(--glass-border)] hover:border-[rgba(167,139,250,0.3)]'
                    }`}
                  >
                    <MessageSquare className="w-6 h-6 text-[#25D366]" />
                    <span className="text-xs text-[var(--text-primary)]">WhatsApp</span>
                  </button>
                  <button
                    onClick={() => handleSendInvoice('saved')}
                    className={`flex flex-col items-center gap-2 p-4 rounded-lg border transition-all ${
                      sendMethod === 'saved'
                        ? 'border-[var(--success)] bg-[rgba(52,211,153,0.1)]'
                        : 'border-[var(--glass-border)] hover:border-[rgba(167,139,250,0.3)]'
                    }`}
                  >
                    <Download className="w-6 h-6 text-[var(--nexus-gold)]" />
                    <span className="text-xs text-[var(--text-primary)]">Guardar</span>
                  </button>
                </div>
              </div>

              {sendMethod && (
                <div className="p-4 rounded-lg bg-[rgba(52,211,153,0.1)] border border-[rgba(52,211,153,0.2)] text-center">
                  <CheckCircle className="w-5 h-5 text-[var(--success)] inline mr-2" />
                  <span className="text-[var(--success)]">
                    {sendMethod === 'email' && 'Factura enviada por email'}
                    {sendMethod === 'whatsapp' && 'Factura enviada por WhatsApp'}
                    {sendMethod === 'saved' && 'Factura guardada en el sistema'}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-[#0A0820] p-6 border-t border-[rgba(167,139,250,0.1)] flex justify-between">
          {step < 4 ? (
            <>
              <Button
                variant="outline"
                onClick={() => step > 1 ? setStep(step - 1) : onClose()}
                disabled={isCreating}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {step > 1 ? 'Atrás' : 'Cancelar'}
              </Button>
              
              {step < 3 ? (
                <Button
                  onClick={() => setStep(step + 1)}
                  className="btn-gold"
                  disabled={!formData.businessName || !formData.ownerName || !formData.email || (step === 1 && !formData.industry)}
                >
                  Continuar
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleCreate}
                  className="btn-gold"
                  disabled={isCreating}
                >
                  {isCreating ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Creando...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Crear Inquilino
                    </>
                  )}
                </Button>
              )}
            </>
          ) : (
            <Button onClick={onClose} className="btn-gold w-full">
              <CheckCircle className="w-4 h-4 mr-2" />
              Finalizar
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
