'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { INDUSTRY_PRICING, DEFAULT_PRICING, getPlanPrice } from '@/lib/industry-pricing';
import { 
  Building2,
  User,
  Mail,
  Phone,
  Globe,
  CreditCard,
  Calendar,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Clock,
  FileText,
  Send,
  Loader2,
  Shield,
  Zap,
  Crown,
  Check
} from 'lucide-react';

// Industries available - now with dynamic pricing
const INDUSTRIES = Object.values(INDUSTRY_PRICING).map(ind => ({
  slug: ind.slug,
  name: ind.name,
  icon: ind.icon,
  color: ind.color,
}));

// Billing cycles
const BILLING_CYCLES = [
  { slug: 'monthly', name: 'Mensual', discount: 0 },
  { slug: 'annual', name: 'Anual', discount: 20 },
  { slug: 'biannual', name: 'Bienal', discount: 20 },
];

// Dynamic plans based on selected industry
const getPlansForIndustry = (industrySlug: string) => {
  const industry = INDUSTRY_PRICING[industrySlug];
  const pricing = industry?.plans || DEFAULT_PRICING;
  
  return [
    { 
      slug: 'starter', 
      name: 'Starter', 
      price: pricing.starter.price,
      priceAnnual: pricing.starter.priceAnnual,
      users: pricing.starter.users,
      branches: pricing.starter.branches,
      icon: Zap, 
      color: '#22D3EE',
      features: [`${pricing.starter.users} Usuarios`, `${pricing.starter.branches} Sede(s)`, 'Soporte Email', 'Reportes Básicos']
    },
    { 
      slug: 'growth', 
      name: 'Growth', 
      price: pricing.growth.price,
      priceAnnual: pricing.growth.priceAnnual,
      users: pricing.growth.users,
      branches: pricing.growth.branches,
      icon: Crown, 
      color: '#F59E0B',
      features: [`${pricing.growth.users} Usuarios`, `${pricing.growth.branches} Sedes`, 'Soporte Prioritario', 'Reportes Avanzados', 'API Access'],
      popular: true
    },
    { 
      slug: 'premium', 
      name: 'Premium', 
      price: pricing.premium.price,
      priceAnnual: pricing.premium.priceAnnual,
      users: pricing.premium.users,
      branches: pricing.premium.branches,
      icon: Shield, 
      color: '#A855F7',
      features: [`${pricing.premium.users} Usuarios`, `${pricing.premium.branches} Sedes`, 'Soporte 24/7', 'Personalizaciones', 'Integraciones', 'SLA Garantizado']
    },
  ];
};

interface TenantWizardProps {
  isOpen: boolean;
  onClose: () => void;
  leadData?: {
    businessName: string;
    ownerName: string;
    email: string;
    phone: string;
    industry: string;
    plan?: string;
  };
  onTenantCreated?: (tenant: any) => void;
}

export function TenantWizard({ isOpen, onClose, leadData, onTenantCreated }: TenantWizardProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [createdTenant, setCreatedTenant] = useState<any>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    // Step 1: Business Info
    businessName: leadData?.businessName || '',
    legalName: '',
    industrySlug: leadData?.industry || 'clinic',
    country: 'Trinidad & Tobago',
    
    // Step 2: Owner Info
    ownerName: leadData?.ownerName || '',
    ownerEmail: leadData?.email || '',
    ownerPhone: leadData?.phone || '',
    
    // Step 3: Plan & Billing
    planSlug: leadData?.plan || 'growth',
    billingCycle: 'monthly',
    isTrial: true,
    trialDays: 7,
    skipPayment: false,
    
    // Step 4: Settings
    slug: '',
    sendWelcomeEmail: true,
    acceptTerms: false,
  });

  // Auto-generate slug from business name
  useEffect(() => {
    if (formData.businessName) {
      const slug = formData.businessName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setFormData(prev => ({ ...prev, slug }));
    }
  }, [formData.businessName]);

  // Dynamic plans based on selected industry
  const PLANS = useMemo(() => getPlansForIndustry(formData.industrySlug), [formData.industrySlug]);

  // Calculate prices
  const selectedPlan = PLANS.find(p => p.slug === formData.planSlug);
  const selectedCycle = BILLING_CYCLES.find(c => c.slug === formData.billingCycle);
  const basePrice = formData.billingCycle === 'annual' 
    ? (selectedPlan?.priceAnnual || selectedPlan?.price || 0)
    : (selectedPlan?.price || 0);
  const discount = formData.billingCycle === 'annual' ? 0 : (selectedCycle?.discount || 0);
  const finalPrice = basePrice * (1 - discount / 100);
  const activationFee = 1250;

  // Calculate trial end date
  const calculateTrialEnd = () => {
    const now = new Date();
    const endDate = new Date(now.getTime() + formData.trialDays * 24 * 60 * 60 * 1000);
    // Set to midnight
    endDate.setHours(0, 0, 0, 0);
    return endDate.toISOString();
  };

  // Handle form submission
  const handleSubmit = async () => {
    setLoading(true);
    
    try {
      // Create tenant via API
      const response = await fetch('/api/admin/tenants/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          trialEndsAt: formData.isTrial ? calculateTrialEnd() : null,
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setCreatedTenant(data.tenant);
        setStep(5); // Success step
        onTenantCreated?.(data.tenant);
      } else {
        alert('Error: ' + data.error);
      }
    } catch (error) {
      console.error('Error creating tenant:', error);
      alert('Error al crear el tenant');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-4xl max-h-[90vh] bg-[var(--obsidian-2)] rounded-2xl border border-[var(--glass-border)] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-[var(--glass-border)] bg-gradient-to-r from-[var(--nexus-violet)]/10 to-[var(--nexus-fuchsia)]/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--nexus-violet)] to-[var(--nexus-fuchsia)] flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[var(--text-primary)]">Crear Nuevo Tenant</h2>
                <p className="text-sm text-[var(--text-mid)]">
                  {step < 5 ? `Paso ${step} de 4` : '¡Completado!'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-[var(--text-dim)] hover:text-[var(--text-primary)] transition-colors"
            >
              ✕
            </button>
          </div>
          
          {/* Progress bar */}
          {step < 5 && (
            <div className="mt-4 flex items-center gap-2">
              {[1, 2, 3, 4].map((s) => (
                <React.Fragment key={s}>
                  <div 
                    className={`flex-1 h-2 rounded-full transition-all ${
                      s <= step ? 'bg-[var(--nexus-violet)]' : 'bg-[var(--glass)]'
                    }`}
                  />
                </React.Fragment>
              ))}
            </div>
          )}
        </div>

        {/* Content */}
        <ScrollArea className="h-[60vh]">
          <div className="p-6">
            {/* Step 1: Business Info */}
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
                    Información del Negocio
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[var(--text-mid)]">Nombre del Negocio *</Label>
                      <Input
                        value={formData.businessName}
                        onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                        placeholder="Mi Negocio"
                        className="bg-[var(--glass)] border-[var(--glass-border)]"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-[var(--text-mid)]">Razón Social (Opcional)</Label>
                      <Input
                        value={formData.legalName}
                        onChange={(e) => setFormData({ ...formData, legalName: e.target.value })}
                        placeholder="Mi Negocio S.A."
                        className="bg-[var(--glass)] border-[var(--glass-border)]"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-4 space-y-2">
                    <Label className="text-[var(--text-mid)]">Slug / URL del Espacio</Label>
                    <div className="flex items-center gap-2">
                      <span className="text-[var(--text-dim)] text-sm">aethel.tt/</span>
                      <Input
                        value={formData.slug}
                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                        placeholder="mi-negocio"
                        className="bg-[var(--glass)] border-[var(--glass-border)] flex-1"
                      />
                    </div>
                  </div>
                </div>
                
                <div>
                  <Label className="text-[var(--text-mid)] mb-3 block">Industria *</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {INDUSTRIES.map((industry) => (
                      <button
                        key={industry.slug}
                        onClick={() => setFormData({ ...formData, industrySlug: industry.slug })}
                        className={`p-4 rounded-xl border transition-all text-left ${
                          formData.industrySlug === industry.slug 
                            ? 'border-[var(--nexus-violet)] bg-[var(--nexus-violet)]/10' 
                            : 'border-[var(--glass-border)] bg-[var(--glass)] hover:border-[var(--nexus-violet)]/50'
                        }`}
                      >
                        <span className="text-2xl">{industry.icon}</span>
                        <p className="text-sm text-[var(--text-primary)] mt-2">{industry.name}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Owner Info */}
            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
                    Información del Propietario
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[var(--text-mid)]">Nombre Completo *</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-dim)]" />
                        <Input
                          value={formData.ownerName}
                          onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                          placeholder="Juan Pérez"
                          className="pl-10 bg-[var(--glass)] border-[var(--glass-border)]"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-[var(--text-mid)]">Email *</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-dim)]" />
                        <Input
                          type="email"
                          value={formData.ownerEmail}
                          onChange={(e) => setFormData({ ...formData, ownerEmail: e.target.value })}
                          placeholder="juan@empresa.com"
                          className="pl-10 bg-[var(--glass)] border-[var(--glass-border)]"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[var(--text-mid)]">Teléfono *</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-dim)]" />
                        <Input
                          value={formData.ownerPhone}
                          onChange={(e) => setFormData({ ...formData, ownerPhone: e.target.value })}
                          placeholder="+1 868 555-0100"
                          className="pl-10 bg-[var(--glass)] border-[var(--glass-border)]"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-[var(--text-mid)]">País</Label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-dim)]" />
                        <Input
                          value={formData.country}
                          onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                          className="pl-10 bg-[var(--glass)] border-[var(--glass-border)]"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Plan & Billing */}
            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
                    Plan y Facturación
                  </h3>
                  
                  {/* Trial Toggle */}
                  <div className="p-4 rounded-xl bg-[var(--nexus-gold)]/10 border border-[var(--nexus-gold)]/30 mb-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Sparkles className="w-5 h-5 text-[var(--nexus-gold)]" />
                        <div>
                          <p className="text-[var(--text-primary)] font-medium">Período de Prueba</p>
                          <p className="text-xs text-[var(--text-mid)]">
                            El cliente tendrá acceso completo antes de pagar
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={formData.isTrial}
                        onCheckedChange={(checked) => setFormData({ ...formData, isTrial: checked })}
                      />
                    </div>
                    
                    {formData.isTrial && (
                      <div className="mt-4 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-[var(--nexus-gold)]" />
                        <span className="text-sm text-[var(--text-mid)]">
                          Duración del trial:
                        </span>
                        <select
                          value={formData.trialDays}
                          onChange={(e) => setFormData({ ...formData, trialDays: parseInt(e.target.value) })}
                          className="bg-[var(--glass)] border border-[var(--glass-border)] rounded px-3 py-1 text-[var(--text-primary)]"
                        >
                          <option value={3}>3 días</option>
                          <option value={7}>7 días</option>
                          <option value={14}>14 días</option>
                          <option value={30}>30 días</option>
                        </select>
                      </div>
                    )}
                  </div>
                  
                  {/* Plans */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    {PLANS.map((plan) => {
                      const Icon = plan.icon;
                      const isSelected = formData.planSlug === plan.slug;
                      
                      return (
                        <button
                          key={plan.slug}
                          onClick={() => setFormData({ ...formData, planSlug: plan.slug })}
                          className={`relative p-4 rounded-xl border transition-all text-left ${
                            isSelected 
                              ? 'border-[var(--nexus-violet)] bg-[var(--nexus-violet)]/10' 
                              : 'border-[var(--glass-border)] bg-[var(--glass)] hover:border-[var(--nexus-violet)]/50'
                          }`}
                        >
                          {plan.popular && (
                            <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 bg-[var(--nexus-gold)] text-black text-xs">
                              Popular
                            </Badge>
                          )}
                          
                          <div className="flex items-center gap-2 mb-3">
                            <div 
                              className="w-10 h-10 rounded-lg flex items-center justify-center"
                              style={{ backgroundColor: `${plan.color}20` }}
                            >
                              <Icon className="w-5 h-5" style={{ color: plan.color }} />
                            </div>
                            <div>
                              <p className="text-[var(--text-primary)] font-medium">{plan.name}</p>
                              <p className="text-lg font-bold text-[var(--text-primary)]">
                                TT${plan.price}
                                <span className="text-xs font-normal text-[var(--text-dim)]">/mes</span>
                              </p>
                            </div>
                          </div>
                          
                          <ul className="space-y-1">
                            {plan.features.map((feature, i) => (
                              <li key={i} className="flex items-center gap-2 text-xs text-[var(--text-mid)]">
                                <Check className="w-3 h-3 text-[var(--success)]" />
                                {feature}
                              </li>
                            ))}
                          </ul>
                        </button>
                      );
                    })}
                  </div>
                  
                  {/* Billing Cycle */}
                  <div className="space-y-2 mb-4">
                    <Label className="text-[var(--text-mid)]">Ciclo de Facturación</Label>
                    <div className="grid grid-cols-3 gap-3">
                      {BILLING_CYCLES.map((cycle) => (
                        <button
                          key={cycle.slug}
                          onClick={() => setFormData({ ...formData, billingCycle: cycle.slug })}
                          className={`p-3 rounded-lg border transition-all ${
                            formData.billingCycle === cycle.slug 
                              ? 'border-[var(--nexus-violet)] bg-[var(--nexus-violet)]/10' 
                              : 'border-[var(--glass-border)] bg-[var(--glass)] hover:border-[var(--nexus-violet)]/50'
                          }`}
                        >
                          <p className="text-[var(--text-primary)] font-medium">{cycle.name}</p>
                          {cycle.discount > 0 && (
                            <p className="text-xs text-[var(--success)]">-{cycle.discount}% descuento</p>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Price Summary */}
                  <div className="p-4 rounded-xl bg-[var(--glass)] border border-[var(--glass-border)]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[var(--text-mid)]">Plan {selectedPlan?.name}</span>
                      <span className="text-[var(--text-primary)]">TT${basePrice}/mes</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex items-center justify-between mb-2 text-[var(--success)]">
                        <span>Descuento ({selectedCycle?.name})</span>
                        <span>-{discount}%</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[var(--text-mid)]">Fee de Activación</span>
                      <span className="text-[var(--text-primary)]">TT${activationFee}</span>
                    </div>
                    <div className="border-t border-[var(--glass-border)] pt-2 mt-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[var(--text-primary)] font-bold">Total a Pagar</span>
                        <span className="text-xl font-bold text-[var(--nexus-gold)]">
                          {formData.isTrial ? 'TT$0 (Trial)' : `TT${finalPrice + activationFee}`}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Review & Create */}
            {step === 4 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
                    Revisar y Crear
                  </h3>
                  
                  {/* Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="p-4 rounded-xl bg-[var(--glass)] border border-[var(--glass-border)]">
                      <h4 className="text-sm font-medium text-[var(--text-mid)] mb-3">Información del Negocio</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-[var(--text-dim)]">Negocio:</span>
                          <span className="text-[var(--text-primary)]">{formData.businessName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[var(--text-dim)]">Industria:</span>
                          <span className="text-[var(--text-primary)]">
                            {INDUSTRIES.find(i => i.slug === formData.industrySlug)?.name}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[var(--text-dim)]">Slug:</span>
                          <span className="text-[var(--text-primary)]">{formData.slug}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 rounded-xl bg-[var(--glass)] border border-[var(--glass-border)]">
                      <h4 className="text-sm font-medium text-[var(--text-mid)] mb-3">Propietario</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-[var(--text-dim)]">Nombre:</span>
                          <span className="text-[var(--text-primary)]">{formData.ownerName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[var(--text-dim)]">Email:</span>
                          <span className="text-[var(--text-primary)]">{formData.ownerEmail}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[var(--text-dim)]">Teléfono:</span>
                          <span className="text-[var(--text-primary)]">{formData.ownerPhone}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Plan Summary */}
                  <div className="p-4 rounded-xl bg-gradient-to-r from-[var(--nexus-violet)]/10 to-[var(--nexus-fuchsia)]/10 border border-[var(--nexus-violet)]/30 mb-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[var(--text-primary)] font-medium">
                          Plan {selectedPlan?.name} - {selectedCycle?.name}
                        </p>
                        {formData.isTrial && (
                          <p className="text-sm text-[var(--nexus-gold)]">
                            ⏱️ {formData.trialDays} días de prueba - Expira {new Date(calculateTrialEnd()).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-[var(--text-primary)]">
                          {formData.isTrial ? 'TT$0' : `TT$${finalPrice}`}
                        </p>
                        {formData.isTrial && (
                          <p className="text-xs text-[var(--text-dim)]">luego TT${finalPrice}/período</p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Options */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--glass)]">
                      <div className="flex items-center gap-3">
                        <Send className="w-4 h-4 text-[var(--text-dim)]" />
                        <span className="text-[var(--text-primary)]">Enviar email de bienvenida</span>
                      </div>
                      <Switch
                        checked={formData.sendWelcomeEmail}
                        onCheckedChange={(checked) => setFormData({ ...formData, sendWelcomeEmail: checked })}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--glass)]">
                      <div className="flex items-center gap-3">
                        <FileText className="w-4 h-4 text-[var(--text-dim)]" />
                        <span className="text-[var(--text-primary)]">Aceptar términos y condiciones en nombre del cliente</span>
                      </div>
                      <Switch
                        checked={formData.acceptTerms}
                        onCheckedChange={(checked) => setFormData({ ...formData, acceptTerms: checked })}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Success */}
            {step === 5 && createdTenant && (
              <div className="text-center py-8">
                <div className="w-20 h-20 rounded-full bg-[var(--success)]/20 flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-10 h-10 text-[var(--success)]" />
                </div>
                
                <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
                  ¡Tenant Creado Exitosamente!
                </h3>
                <p className="text-[var(--text-mid)] mb-6">
                  El espacio de trabajo está listo para usar.
                </p>
                
                <div className="p-4 rounded-xl bg-[var(--glass)] border border-[var(--glass-border)] inline-block text-left mb-6">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-[var(--text-dim)]">Negocio:</span>
                      <p className="text-[var(--text-primary)] font-medium">{createdTenant.businessName}</p>
                    </div>
                    <div>
                      <span className="text-[var(--text-dim)]">URL:</span>
                      <p className="text-[var(--nexus-violet-lite)]">{createdTenant.slug}.aethel.tt</p>
                    </div>
                    <div>
                      <span className="text-[var(--text-dim)]">Plan:</span>
                      <p className="text-[var(--text-primary)]">{createdTenant.planSlug}</p>
                    </div>
                    <div>
                      <span className="text-[var(--text-dim)]">Estado:</span>
                      <Badge className={createdTenant.isTrial ? 'bg-[var(--nexus-gold)]/20 text-[var(--nexus-gold)]' : 'bg-[var(--success)]/20 text-[var(--success)]'}>
                        {createdTenant.isTrial ? 'Trial' : 'Activo'}
                      </Badge>
                    </div>
                    {createdTenant.trialEndsAt && (
                      <div className="col-span-2">
                        <span className="text-[var(--text-dim)]">Trial expira:</span>
                        <p className="text-[var(--nexus-gold)]">{new Date(createdTenant.trialEndsAt).toLocaleString()}</p>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center justify-center gap-3">
                  <Button onClick={onClose} variant="outline" className="border-[var(--glass-border)]">
                    Cerrar
                  </Button>
                  <Button className="btn-nexus">
                    Ver en Torre de Control
                  </Button>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        {step < 5 && (
          <div className="p-6 border-t border-[var(--glass-border)] flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => step > 1 ? setStep(step - 1) : onClose()}
              className="text-[var(--text-mid)]"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {step === 1 ? 'Cancelar' : 'Atrás'}
            </Button>
            
            <Button
              onClick={() => {
                if (step < 4) {
                  setStep(step + 1);
                } else {
                  handleSubmit();
                }
              }}
              disabled={loading}
              className="btn-nexus"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creando...
                </>
              ) : step === 4 ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Crear Tenant
                </>
              ) : (
                <>
                  Continuar
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
