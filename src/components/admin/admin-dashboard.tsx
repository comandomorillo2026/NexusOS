'use client';

import React, { useState, useEffect } from 'react';
import { AdminLayout } from './admin-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign, 
  Building2, 
  Activity,
  Lock,
  Globe,
  DollarSign as PriceIcon,
  Settings,
  Shield,
  Save,
  Eye,
  EyeOff,
  Key,
  Server,
  Mail,
  Bell,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Plus,
  Trash2,
  Edit3,
  Copy,
  ArrowLeft,
  Search,
  Filter,
  MoreVertical,
  ExternalLink,
  X,
  ChevronRight,
  Stethoscope,
  Heart,
  Scale,
  Scissors,
  Clock,
  CheckCircle2,
  XCircle,
  Pause,
  Play,
  Database,
  HardDrive,
  Zap,
  CreditCard,
  Pill,
  ChefHat,
  UserCheck,
  FileText,
} from 'lucide-react';
import Link from 'next/link';
import { CapacityMetrics } from './capacity-metrics';
import { SecurityInfo } from './security-info';
import { AIAssistant, AIAssistantButton } from './ai-assistant';
import { ScalabilityPlan } from './scalability-plan';
import { CompetitiveAnalysis } from './competitive-analysis';
import { DatabaseMonitor } from './database-monitor';
import { ControlTower } from './control-tower';

// ============================================
// STAT CARD COMPONENT
// ============================================
function StatCard({ title, value, change, trend, icon: Icon, color = '#F0B429' }: {
  title: string;
  value: string;
  change?: string;
  trend?: 'up' | 'down';
  icon: React.ElementType;
  color?: string;
}) {
  return (
    <div className="glass-card p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[var(--text-mid)] text-sm">{title}</p>
          <p className="text-2xl font-bold text-[var(--text-primary)] mt-1" style={{ fontFamily: 'var(--font-dm-mono)' }}>
            {value}
          </p>
          {change && (
            <p className={`text-sm mt-2 flex items-center gap-1 ${trend === 'up' ? 'text-[var(--success)]' : 'text-[var(--error)]'}`}>
              {trend === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              {change}
            </p>
          )}
        </div>
        <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}15` }}>
          <Icon className="w-6 h-6" style={{ color }} />
        </div>
      </div>
    </div>
  );
}

// ============================================
// CREATE TENANT WIZARD
// ============================================
function CreateTenantWizard({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    businessName: '',
    ownerName: '',
    email: '',
    phone: '',
    industry: '',
    plan: 'GROWTH',
    billingCycle: 'monthly',
    notes: ''
  });
  const [isCreating, setIsCreating] = useState(false);

  const industries = [
    { value: 'clinic', label: 'Clínica / Centro Médico', icon: Stethoscope, color: '#22D3EE', prices: { starter: 1200, growth: 2200, premium: 3800 } },
    { value: 'nurse', label: 'Enfermería / Home Care', icon: Heart, color: '#34D399', prices: { starter: 800, growth: 1500, premium: 2500 } },
    { value: 'beauty', label: 'Salón de Belleza / SPA', icon: Scissors, color: '#EC4899', prices: { starter: 600, growth: 1100, premium: 1900 } },
    { value: 'lawfirm', label: 'Bufete de Abogados', icon: Scale, color: '#C4A35A', prices: { starter: 1500, growth: 2800, premium: 4500 } },
    { value: 'condo', label: 'Condominios / Propiedades', icon: Building2, color: '#10B981', prices: { starter: 1000, growth: 1800, premium: 3200 } },
    { value: 'pharmacy', label: 'Farmacia', icon: Pill, color: '#8B5CF6', prices: { starter: 1800, growth: 3200, premium: 5000 } },
    { value: 'insurance', label: 'Aseguradora', icon: Shield, color: '#F59E0B', prices: { starter: 8000, growth: 15000, premium: 28000 } },
    { value: 'retail', label: 'Retail / Boutique', icon: Building2, color: '#3B82F6', prices: { starter: 700, growth: 1300, premium: 2200 } },
    { value: 'bakery', label: 'Panadería / Pastelería', icon: ChefHat, color: '#F97316', prices: { starter: 500, growth: 900, premium: 1500 } },
  ];

  // Get selected industry for dynamic pricing
  const selectedIndustry = industries.find(i => i.value === formData.industry);
  const industryPrices = selectedIndustry?.prices || { starter: 800, growth: 1500, premium: 2800 };

  const plans = [
    { value: 'STARTER', label: 'Starter', price: `TT$${industryPrices.starter}/mes`, users: '1-2 usuarios' },
    { value: 'GROWTH', label: 'Growth', price: `TT$${industryPrices.growth}/mes`, users: '3-5 usuarios', popular: true },
    { value: 'PREMIUM', label: 'Premium', price: `TT$${industryPrices.premium}/mes`, users: '6+ usuarios' },
  ];

  const handleCreate = async () => {
    setIsCreating(true);
    try {
      // Generate slug from business name
      const slug = formData.businessName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

      const response = await fetch('/api/admin/tenants/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: formData.businessName,
          legalName: formData.businessName,
          slug: slug,
          ownerName: formData.ownerName,
          ownerEmail: formData.email,
          ownerPhone: formData.phone,
          industrySlug: formData.industry,
          planSlug: formData.plan.toLowerCase(),
          billingCycle: formData.billingCycle,
          isTrial: true,
          trialDays: 7,
          sendWelcomeEmail: true,
          acceptTerms: true
        })
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || 'Error al crear inquilino');
        setIsCreating(false);
        return;
      }

      setIsCreating(false);
      onSuccess();
    } catch (error) {
      console.error('Error creating tenant:', error);
      alert('Error al crear inquilino');
      setIsCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-[#0A0820] border border-[rgba(167,139,250,0.2)] shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-[#0A0820] p-6 border-b border-[rgba(167,139,250,0.1)] flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-[var(--text-primary)]">Crear Nuevo Inquilino</h2>
            <p className="text-sm text-[var(--text-mid)] mt-1">Paso {step} de 3</p>
          </div>
          <button onClick={onClose} className="text-[var(--text-dim)] hover:text-[var(--text-primary)]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
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

        {/* Content */}
        <div className="p-6">
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

          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">Seleccionar Plan</h3>
              
              <div className="space-y-3">
                {plans.map((plan) => (
                  <button
                    key={plan.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, plan: plan.value }))}
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
                    <span className="font-semibold text-[var(--nexus-gold)]">{plan.price}</span>
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

          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">Confirmar y Crear</h3>
              
              <div className="p-4 rounded-lg bg-[var(--glass)] space-y-3">
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

              <div className="p-4 rounded-lg bg-[rgba(240,180,41,0.05)] border border-[var(--nexus-gold)]/20">
                <p className="text-sm text-[var(--text-mid)]">
                  <AlertCircle className="w-4 h-4 inline mr-2 text-[var(--nexus-gold)]" />
                  El espacio de trabajo será creado en estado <strong className="text-[var(--text-primary)]">pendiente de activación</strong>. 
                  El cliente podrá acceder una vez que confirmes el pago y actives su cuenta.
                </p>
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
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-[#0A0820] p-6 border-t border-[rgba(167,139,250,0.1)] flex justify-between">
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
        </div>
      </div>
    </div>
  );
}

// ============================================
// TENANTS MANAGEMENT
// ============================================
function TenantsManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateWizard, setShowCreateWizard] = useState(false);
  const [tenants, setTenants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch tenants from API
  const fetchTenants = async () => {
    try {
      const response = await fetch('/api/admin/tenants');
      const data = await response.json();
      if (data.tenants) {
        setTenants(data.tenants.map((t: any) => ({
          id: t.id,
          name: t.businessName,
          industry: t.industrySlug,
          owner: t.ownerName,
          email: t.ownerEmail,
          plan: t.planSlug?.toUpperCase() || 'GROWTH',
          status: t.status,
          users: t._count?.users || 0,
          createdAt: new Date(t.createdAt).toLocaleDateString('es-ES'),
          slug: t.slug
        })));
      }
    } catch (error) {
      console.error('Error fetching tenants:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load tenants on mount
  useEffect(() => {
    fetchTenants();
  }, []);

  const industryIcons: Record<string, React.ElementType> = {
    clinic: Stethoscope,
    nurse: Heart,
    beauty: Scissors,
    lawfirm: Scale,
    pharmacy: Heart,
    insurance: Shield,
    retail: Building2,
    bakery: Building2,
  };

  const industryColors: Record<string, string> = {
    clinic: '#22D3EE',
    nurse: '#34D399',
    beauty: '#EC4899',
    lawfirm: '#C4A35A',
    pharmacy: '#8B5CF6',
    insurance: '#F59E0B',
    retail: '#3B82F6',
    bakery: '#F97316',
  };

  const statusColors: Record<string, string> = {
    active: 'bg-[var(--success)]/10 text-[var(--success)]',
    pending: 'bg-[var(--nexus-gold)]/10 text-[var(--nexus-gold)]',
    suspended: 'bg-[var(--error)]/10 text-[var(--error)]'
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    // Determine new status
    let newStatus = currentStatus;
    if (currentStatus === 'active') newStatus = 'suspended';
    else if (currentStatus === 'pending') newStatus = 'active';
    else newStatus = 'active';

    // Optimistic update
    setTenants(prev => prev.map(t => {
      if (t.id === id) {
        return { ...t, status: newStatus };
      }
      return t;
    }));

    // Call API to persist change
    try {
      const response = await fetch(`/api/admin/tenants/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();
      
      if (!data.success) {
        // Revert on failure
        setTenants(prev => prev.map(t => {
          if (t.id === id) {
            return { ...t, status: currentStatus };
          }
          return t;
        }));
        alert('Error al actualizar estado: ' + (data.error || 'Error desconocido'));
      }
    } catch (error) {
      // Revert on error
      setTenants(prev => prev.map(t => {
        if (t.id === id) {
          return { ...t, status: currentStatus };
        }
        return t;
      }));
      console.error('Error updating tenant status:', error);
      alert('Error de conexión al actualizar estado');
    }
  };

  const filteredTenants = tenants.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.owner.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)]">Gestión de Inquilinos</h2>
          <p className="text-sm text-[var(--text-mid)]">Administra todos los espacios de trabajo</p>
        </div>
        <Button onClick={() => setShowCreateWizard(true)} className="btn-gold">
          <Plus className="w-4 h-4 mr-2" />
          Crear Inquilino
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-dim)]" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nombre, propietario o email..."
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          {['all', 'active', 'pending', 'suspended'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                statusFilter === status
                  ? 'bg-[var(--nexus-gold)] text-white'
                  : 'bg-[var(--glass)] text-[var(--text-mid)] hover:text-[var(--text-primary)]'
              }`}
            >
              {status === 'all' ? 'Todos' : status === 'active' ? 'Activos' : status === 'pending' ? 'Pendientes' : 'Suspendidos'}
            </button>
          ))}
        </div>
      </div>

      {/* Tenants Grid */}
      <div className="grid gap-4">
        {filteredTenants.map((tenant) => {
          const IconComponent = industryIcons[tenant.industry] || Building2;
          const iconColor = industryColors[tenant.industry] || '#9D7BEA';
          
          return (
            <div key={tenant.id} className="p-4 rounded-xl bg-[var(--glass)] border border-[var(--glass-border)] hover:border-[rgba(167,139,250,0.3)] transition-all">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${iconColor}20` }}>
                    <IconComponent className="w-6 h-6" style={{ color: iconColor }} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-[var(--text-primary)]">{tenant.name}</h3>
                      <span className={`px-2 py-0.5 rounded text-xs ${statusColors[tenant.status]}`}>
                        {tenant.status === 'active' ? 'Activo' : tenant.status === 'pending' ? 'Pendiente' : 'Suspendido'}
                      </span>
                    </div>
                    <p className="text-sm text-[var(--text-mid)]">{tenant.owner} • {tenant.email}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-xs text-[var(--text-dim)]">Plan: <span className="text-[var(--nexus-gold)]">{tenant.plan}</span></span>
                      <span className="text-xs text-[var(--text-dim)]">Usuarios: <span className="text-[var(--text-primary)]">{tenant.users}</span></span>
                      <span className="text-xs text-[var(--text-dim)]">Creado: {tenant.createdAt}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {tenant.status === 'pending' && (
                    <Button
                      onClick={() => handleToggleStatus(tenant.id, tenant.status)}
                      className="btn-gold"
                      size="sm"
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Activar
                    </Button>
                  )}
                  {tenant.status === 'active' && (
                    <Button
                      onClick={() => handleToggleStatus(tenant.id, tenant.status)}
                      variant="outline"
                      size="sm"
                      className="text-[var(--error)] hover:text-[var(--error)]"
                    >
                      <Pause className="w-4 h-4 mr-1" />
                      Suspender
                    </Button>
                  )}
                  {tenant.status === 'suspended' && (
                    <Button
                      onClick={() => handleToggleStatus(tenant.id, tenant.status)}
                      variant="outline"
                      size="sm"
                      className="text-[var(--success)] hover:text-[var(--success)]"
                    >
                      <Play className="w-4 h-4 mr-1" />
                      Reactivar
                    </Button>
                  )}
                  <Link
                    href={`/${tenant.industry}`}
                    className="p-2 rounded-lg hover:bg-[var(--glass)] text-[var(--text-dim)] hover:text-[var(--text-primary)]"
                    title="Ver espacio"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Tenant Wizard */}
      {showCreateWizard && (
        <CreateTenantWizard 
          onClose={() => setShowCreateWizard(false)}
          onSuccess={() => {
            setShowCreateWizard(false);
            fetchTenants(); // Refresh the list
          }}
        />
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <RefreshCw className="w-8 h-8 mx-auto text-[var(--nexus-gold)] animate-spin" />
          <p className="text-[var(--text-mid)] mt-4">Cargando inquilinos...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && tenants.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="w-12 h-12 mx-auto text-[var(--text-dim)]" />
          <p className="text-[var(--text-mid)] mt-4">No hay inquilinos registrados</p>
          <Button onClick={() => setShowCreateWizard(true)} className="btn-gold mt-4">
            <Plus className="w-4 h-4 mr-2" />
            Crear Primer Inquilino
          </Button>
        </div>
      )}
    </div>
  );
}

// ============================================
// ORDERS MANAGEMENT
// ============================================
function OrdersManagement() {
  const orders = [
    { id: 'NXS-2026-0001', business: 'Clínica San Fernando', plan: 'GROWTH', amount: 'TT$2,750', status: 'paid', date: '2024-03-15' },
    { id: 'NXS-2026-0002', business: 'Bufete Pérez & Asoc.', plan: 'PREMIUM', amount: 'TT$4,050', status: 'pending', date: '2024-03-14' },
    { id: 'NXS-2026-0003', business: 'Salón Bella Vista', plan: 'STARTER', amount: 'TT$2,050', status: 'paid', date: '2024-03-13' },
    { id: 'NXS-2026-0004', business: 'Home Care Trinidad', plan: 'GROWTH', amount: 'TT$2,750', status: 'failed', date: '2024-03-12' },
  ];

  const statusColors: Record<string, string> = {
    paid: 'bg-[var(--success)]/10 text-[var(--success)]',
    pending: 'bg-[var(--nexus-gold)]/10 text-[var(--nexus-gold)]',
    failed: 'bg-[var(--error)]/10 text-[var(--error)]'
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[var(--text-primary)]">Órdenes de Compra</h2>
        <p className="text-sm text-[var(--text-mid)]">Historial de transacciones y pagos</p>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--glass-border)] bg-[var(--glass)]">
                <th className="text-left py-3 px-4 text-sm font-medium text-[var(--text-mid)]">Orden</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-[var(--text-mid)]">Negocio</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-[var(--text-mid)]">Plan</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-[var(--text-mid)]">Monto</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-[var(--text-mid)]">Fecha</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-[var(--text-mid)]">Estado</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-[var(--text-mid)]">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b border-[var(--glass-border)] last:border-0 hover:bg-[var(--glass)]">
                  <td className="py-3 px-4 text-sm text-[var(--nexus-violet-lite)] font-mono">{order.id}</td>
                  <td className="py-3 px-4 text-sm text-[var(--text-primary)]">{order.business}</td>
                  <td className="py-3 px-4 text-sm text-[var(--text-mid)]">{order.plan}</td>
                  <td className="py-3 px-4 text-sm text-[var(--text-primary)] font-mono">{order.amount}</td>
                  <td className="py-3 px-4 text-sm text-[var(--text-mid)]">{order.date}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded text-xs ${statusColors[order.status]}`}>
                      {order.status === 'paid' ? 'Pagado' : order.status === 'pending' ? 'Pendiente' : 'Fallido'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ============================================
// PRICING CONFIGURATION
// ============================================
function PricingConfiguration() {
  const [prices, setPrices] = useState({
    starter: { monthly: 800, annual: 680, activation: 1250 },
    growth: { monthly: 1500, annual: 1275, activation: 1250 },
    premium: { monthly: 2800, annual: 2380, activation: 1250 },
  });
  const [taxRate, setTaxRate] = useState(12.5);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[var(--text-primary)]">Configuración de Precios</h2>
        <p className="text-sm text-[var(--text-mid)]">Ajusta los precios de los planes y tarifas</p>
      </div>

      {/* Global Settings */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-[var(--nexus-gold)]/10 flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-[var(--nexus-gold)]" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">Configuración Global</h3>
            <p className="text-sm text-[var(--text-dim)]">Impuestos y descuentos</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label className="text-[var(--text-mid)]">Moneda</Label>
            <select className="w-full h-10 px-3 rounded-lg bg-[var(--obsidian-3)] border border-[var(--glass-border)] text-[var(--text-primary)]">
              <option value="TTD">TTD - Dólar Trinitense</option>
              <option value="USD">USD - Dólar Americano</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label className="text-[var(--text-mid)]">Impuesto (%)</Label>
            <Input
              type="number"
              value={taxRate}
              onChange={(e) => setTaxRate(parseFloat(e.target.value))}
              step="0.5"
              className="font-mono"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[var(--text-mid)]">Descuento Anual (%)</Label>
            <Input
              type="number"
              defaultValue="15"
              className="font-mono"
            />
          </div>
        </div>
      </div>

      {/* Plans Pricing */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Object.entries(prices).map(([plan, pricing]) => (
          <div key={plan} className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-[var(--text-primary)] uppercase">{plan}</h3>
              {plan === 'growth' && (
                <span className="px-2 py-1 rounded text-xs bg-[var(--nexus-gold)]/10 text-[var(--nexus-gold)]">
                  Popular
                </span>
              )}
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-[var(--text-mid)] text-sm">Mensual (TT$)</Label>
                <Input
                  type="number"
                  value={pricing.monthly}
                  onChange={(e) => setPrices(prev => ({
                    ...prev,
                    [plan]: { ...prev[plan as keyof typeof prev], monthly: parseFloat(e.target.value) }
                  }))}
                  className="font-mono"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[var(--text-mid)] text-sm">Anual (TT$)</Label>
                <Input
                  type="number"
                  value={pricing.annual}
                  onChange={(e) => setPrices(prev => ({
                    ...prev,
                    [plan]: { ...prev[plan as keyof typeof prev], annual: parseFloat(e.target.value) }
                  }))}
                  className="font-mono"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[var(--text-mid)] text-sm">Activación (TT$)</Label>
                <Input
                  type="number"
                  value={pricing.activation}
                  onChange={(e) => setPrices(prev => ({
                    ...prev,
                    [plan]: { ...prev[plan as keyof typeof prev], activation: parseFloat(e.target.value) }
                  }))}
                  className="font-mono"
                />
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-[var(--glass-border)]">
              <div className="flex justify-between text-xs text-[var(--text-dim)]">
                <span>Con impuesto:</span>
                <span className="font-mono text-[var(--text-primary)]">
                  TT${(pricing.monthly * (1 + taxRate / 100)).toFixed(0)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {saved && (
        <div className="flex items-center gap-2 text-[var(--success)] text-sm">
          <CheckCircle className="w-4 h-4" />
          Precios actualizados exitosamente
        </div>
      )}

      <div className="flex justify-end">
        <Button onClick={handleSave} className="btn-gold">
          <Save className="w-4 h-4 mr-2" />
          Guardar Cambios
        </Button>
      </div>
    </div>
  );
}

// ============================================
// SYSTEM SETTINGS
// ============================================
function SystemSettings() {
  const [settings, setSettings] = useState({
    siteName: 'AETHEL OS',
    supportEmail: 'soporte@aethel.tt',
    timezone: 'America/Port_of_Spain',
    language: 'es',
    maintenanceMode: false,
    registrationEnabled: true,
    emailNotifications: true,
    twoFactorRequired: false,
  });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[var(--text-primary)]">Configuración del Sistema</h2>
        <p className="text-sm text-[var(--text-mid)]">Ajustes generales y de seguridad</p>
      </div>

      {/* General Settings */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">General</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="text-[var(--text-mid)]">Nombre del Sitio</Label>
            <Input
              value={settings.siteName}
              onChange={(e) => setSettings(prev => ({ ...prev, siteName: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[var(--text-mid)]">Email de Soporte</Label>
            <Input
              type="email"
              value={settings.supportEmail}
              onChange={(e) => setSettings(prev => ({ ...prev, supportEmail: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[var(--text-mid)]">Zona Horaria</Label>
            <select 
              value={settings.timezone}
              onChange={(e) => setSettings(prev => ({ ...prev, timezone: e.target.value }))}
              className="w-full h-10 px-3 rounded-lg bg-[var(--obsidian-3)] border border-[var(--glass-border)] text-[var(--text-primary)]"
            >
              <option value="America/Port_of_Spain">América/Puerto España (AST)</option>
              <option value="America/New_York">América/Nueva York (EST)</option>
              <option value="UTC">UTC</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label className="text-[var(--text-mid)]">Idioma</Label>
            <select 
              value={settings.language}
              onChange={(e) => setSettings(prev => ({ ...prev, language: e.target.value }))}
              className="w-full h-10 px-3 rounded-lg bg-[var(--obsidian-3)] border border-[var(--glass-border)] text-[var(--text-primary)]"
            >
              <option value="es">Español</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>
      </div>

      {/* Security Settings */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Seguridad</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg bg-[var(--glass)]">
            <div>
              <p className="text-[var(--text-primary)]">Autenticación de Dos Factores</p>
              <p className="text-xs text-[var(--text-dim)]">Requerir 2FA para todos los usuarios</p>
            </div>
            <Switch
              checked={settings.twoFactorRequired}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, twoFactorRequired: checked }))}
            />
          </div>
          <div className="flex items-center justify-between p-4 rounded-lg bg-[var(--glass)]">
            <div>
              <p className="text-[var(--text-primary)]">Registro de Usuarios</p>
              <p className="text-xs text-[var(--text-dim)]">Permitir auto-registro</p>
            </div>
            <Switch
              checked={settings.registrationEnabled}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, registrationEnabled: checked }))}
            />
          </div>
          <div className="flex items-center justify-between p-4 rounded-lg bg-[var(--glass)]">
            <div>
              <p className="text-[var(--text-primary)]">Modo Mantenimiento</p>
              <p className="text-xs text-[var(--text-dim)]">Desactivar acceso temporalmente</p>
            </div>
            <Switch
              checked={settings.maintenanceMode}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, maintenanceMode: checked }))}
            />
          </div>
        </div>
      </div>

      {saved && (
        <div className="flex items-center gap-2 text-[var(--success)] text-sm">
          <CheckCircle className="w-4 h-4" />
          Configuración guardada exitosamente
        </div>
      )}

      <div className="flex justify-end">
        <Button onClick={handleSave} className="btn-gold">
          <Save className="w-4 h-4 mr-2" />
          Guardar Configuración
        </Button>
      </div>
    </div>
  );
}

// ============================================
// MAIN ADMIN DASHBOARD
// ============================================
export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showCreateTenant, setShowCreateTenant] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);

  // Listen for tab change events from sidebar
  useEffect(() => {
    const handleTabChange = (e: CustomEvent) => {
      if (e.detail === 'create-tenant') {
        setShowCreateTenant(true);
      } else {
        setActiveTab(e.detail);
      }
    };

    window.addEventListener('adminTabChange', handleTabChange as EventListener);
    return () => window.removeEventListener('adminTabChange', handleTabChange as EventListener);
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardOverview />;
      case 'orders':
        return <OrdersManagement />;
      case 'tenants':
        return <TenantsManagement />;
      case 'industries':
        return <IndustriesPanel />;
      case 'documents':
        return <DocumentsManagement />;
      case 'competitive':
        return <CompetitiveAnalysis />;
      case 'scalability':
        return <ScalabilityPlan />;
      case 'database':
        return <DatabaseMonitor />;
      case 'control-tower':
        return <ControlTower />;
      case 'users':
        return <UsersManagement />;
      case 'pricing':
        return <PricingConfiguration />;
      case 'settings':
        return <SystemSettings />;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <>
      <AdminLayout activeTab={activeTab}>
        {renderContent()}
      </AdminLayout>
      
      {showCreateTenant && (
        <CreateTenantWizard 
          onClose={() => setShowCreateTenant(false)}
          onSuccess={() => {
            setShowCreateTenant(false);
            setActiveTab('tenants');
          }}
        />
      )}

      {/* AI Assistant - Solo para SUPER_ADMIN */}
      <AIAssistantButton 
        onClick={() => setShowAIAssistant(true)} 
        isOpen={showAIAssistant} 
      />
      <AIAssistant 
        isOpen={showAIAssistant} 
        onClose={() => setShowAIAssistant(false)} 
      />
    </>
  );
}

// ============================================
// DOCUMENTS MANAGEMENT
// ============================================
function DocumentsManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTenant, setSelectedTenant] = useState<string | null>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tenants, setTenants] = useState<any[]>([]);

  // Fetch tenants and documents
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tenantsRes] = await Promise.all([
          fetch('/api/admin/tenants'),
        ]);
        const tenantsData = await tenantsRes.json();
        setTenants(tenantsData.tenants || []);
        
        // Mock documents for now - would come from API
        setDocuments([
          { id: '1', name: 'Contrato de Servicios - Clínica Demo', type: 'contract', tenantId: '1', tenantName: 'Clínica Demo', status: 'active', createdAt: '2024-01-15', expiresAt: '2025-01-15' },
          { id: '2', name: 'Acuerdo de Confidencialidad', type: 'nda', tenantId: '1', tenantName: 'Clínica Demo', status: 'active', createdAt: '2024-01-15', expiresAt: null },
          { id: '3', name: 'Términos y Condiciones', type: 'terms', tenantId: '2', tenantName: 'Bufete Pérez', status: 'active', createdAt: '2024-02-01', expiresAt: null },
          { id: '4', name: 'Contrato Premium', type: 'contract', tenantId: '3', tenantName: 'Salón Bella Vista', status: 'expired', createdAt: '2023-06-01', expiresAt: '2024-01-01' },
        ]);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const documentTypes = [
    { value: 'contract', label: 'Contrato de Servicios', icon: FileText, color: '#22D3EE' },
    { value: 'nda', label: 'Acuerdo de Confidencialidad', icon: Shield, color: '#34D399' },
    { value: 'terms', label: 'Términos y Condiciones', icon: FileText, color: '#F0B429' },
    { value: 'invoice', label: 'Factura', icon: CreditCard, color: '#EC4899' },
  ];

  const statusColors: Record<string, string> = {
    active: 'bg-[var(--success)]/10 text-[var(--success)]',
    expired: 'bg-[var(--error)]/10 text-[var(--error)]',
    pending: 'bg-[var(--nexus-gold)]/10 text-[var(--nexus-gold)]',
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          doc.tenantName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTenant = !selectedTenant || doc.tenantId === selectedTenant;
    return matchesSearch && matchesTenant;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)]">Gestión de Documentos</h2>
          <p className="text-sm text-[var(--text-mid)]">Contratos, acuerdos y documentos con inquilinos</p>
        </div>
        <Button className="btn-gold">
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Documento
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[var(--nexus-violet)]/10 flex items-center justify-center">
              <FileText className="w-5 h-5 text-[var(--nexus-violet)]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[var(--text-primary)]">{documents.length}</p>
              <p className="text-xs text-[var(--text-dim)]">Total Documentos</p>
            </div>
          </div>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[var(--success)]/10 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-[var(--success)]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[var(--text-primary)]">{documents.filter(d => d.status === 'active').length}</p>
              <p className="text-xs text-[var(--text-dim)]">Activos</p>
            </div>
          </div>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[var(--error)]/10 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-[var(--error)]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[var(--text-primary)]">{documents.filter(d => d.status === 'expired').length}</p>
              <p className="text-xs text-[var(--text-dim)]">Vencidos</p>
            </div>
          </div>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[var(--nexus-gold)]/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-[var(--nexus-gold)]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[var(--text-primary)]">{tenants.length}</p>
              <p className="text-xs text-[var(--text-dim)]">Inquilinos</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-dim)]" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar documentos o inquilinos..."
            className="pl-10"
          />
        </div>
        <select
          value={selectedTenant || ''}
          onChange={(e) => setSelectedTenant(e.target.value || null)}
          className="h-10 px-3 rounded-lg bg-[var(--glass)] border border-[var(--glass-border)] text-[var(--text-primary)]"
        >
          <option value="">Todos los inquilinos</option>
          {tenants.map((t: any) => (
            <option key={t.id} value={t.id}>{t.businessName}</option>
          ))}
        </select>
      </div>

      {/* Documents Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--glass-border)] bg-[var(--glass)]">
                <th className="text-left py-3 px-4 text-sm font-medium text-[var(--text-mid)]">Documento</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-[var(--text-mid)]">Inquilino</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-[var(--text-mid)]">Tipo</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-[var(--text-mid)]">Estado</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-[var(--text-mid)]">Vence</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-[var(--text-mid)]">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredDocuments.map((doc) => (
                <tr key={doc.id} className="border-b border-[var(--glass-border)] last:border-0 hover:bg-[var(--glass)]">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[var(--nexus-violet)]/10 flex items-center justify-center">
                        <FileText className="w-4 h-4 text-[var(--nexus-violet)]" />
                      </div>
                      <span className="text-[var(--text-primary)] font-medium">{doc.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-[var(--text-mid)]">{doc.tenantName}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 rounded text-xs bg-[var(--glass)] text-[var(--text-mid)]">
                      {documentTypes.find(t => t.value === doc.type)?.label || doc.type}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded text-xs ${statusColors[doc.status]}`}>
                      {doc.status === 'active' ? 'Activo' : doc.status === 'expired' ? 'Vencido' : 'Pendiente'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-[var(--text-dim)] text-sm">{doc.expiresAt || 'Sin vencimiento'}</td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="sm" title="Ver">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" title="Descargar">
                        <ArrowLeft className="w-4 h-4 rotate-180" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Empty State */}
      {!loading && filteredDocuments.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 mx-auto text-[var(--text-dim)]" />
          <p className="text-[var(--text-mid)] mt-4">No se encontraron documentos</p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <RefreshCw className="w-8 h-8 mx-auto text-[var(--nexus-gold)] animate-spin" />
          <p className="text-[var(--text-mid)] mt-4">Cargando documentos...</p>
        </div>
      )}
    </div>
  );
}

// ============================================
// INDUSTRIES PANEL
// ============================================
function IndustriesPanel() {
  const [tenants, setTenants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch tenants to calculate industry stats
  useEffect(() => {
    const fetchTenants = async () => {
      try {
        const response = await fetch('/api/admin/tenants');
        const data = await response.json();
        if (data.tenants) {
          setTenants(data.tenants);
        }
      } catch (error) {
        console.error('Error fetching tenants:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTenants();
  }, []);

  const industries = [
    { slug: 'clinic', name: 'Clínica Médica', icon: Stethoscope, color: '#22D3EE', route: '/clinic' },
    { slug: 'nurse', name: 'Enfermería', icon: Heart, color: '#34D399', route: '/nurse' },
    { slug: 'beauty', name: 'Salón de Belleza', icon: Scissors, color: '#EC4899', route: '/beauty' },
    { slug: 'lawfirm', name: 'Bufete de Abogados', icon: Scale, color: '#C4A35A', route: '/lawfirm' },
    { slug: 'condo', name: 'Condominios/Propiedades', icon: Building2, color: '#10B981', route: '/condo' },
    { slug: 'bakery', name: 'Panadería/Pastelería', icon: ChefHat, color: '#F97316', route: '/bakery' },
    { slug: 'pharmacy', name: 'Farmacia', icon: Pill, color: '#8B5CF6', route: '/pharmacy' },
    { slug: 'insurance', name: 'Seguros', icon: Shield, color: '#F59E0B', route: '/insurance' },
  ];

  // Calculate stats for each industry
  const getIndustryStats = (slug: string) => {
    const industryTenants = tenants.filter((t: any) => t.industrySlug === slug);
    return {
      tenantCount: industryTenants.length,
      activeUsers: industryTenants.reduce((sum: number, t: any) => sum + (t._count?.users || 0), 0),
      activeCount: industryTenants.filter((t: any) => t.status === 'active').length,
      pendingCount: industryTenants.filter((t: any) => t.status === 'pending').length,
      suspendedCount: industryTenants.filter((t: any) => t.status === 'suspended').length,
    };
  };

  const getStatusBadge = (stats: { activeCount: number; pendingCount: number; suspendedCount: number; tenantCount: number }) => {
    if (stats.tenantCount === 0) {
      return { label: 'Sin actividad', className: 'bg-[var(--text-dim)]/10 text-[var(--text-dim)]' };
    }
    if (stats.activeCount > 0) {
      return { label: 'Activo', className: 'bg-[var(--success)]/10 text-[var(--success)]' };
    }
    if (stats.pendingCount > 0) {
      return { label: 'Pendiente', className: 'bg-[var(--nexus-gold)]/10 text-[var(--nexus-gold)]' };
    }
    return { label: 'Suspendido', className: 'bg-[var(--error)]/10 text-[var(--error)]' };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">Industrias</h2>
          <p className="text-[var(--text-mid)]">Gestiona todas las industrias disponibles en NexusOS</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm text-[var(--text-dim)]">Total Industrias</p>
            <p className="text-2xl font-bold text-[var(--nexus-gold)]">{industries.length}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-[var(--text-dim)]">Total Inquilinos</p>
            <p className="text-2xl font-bold text-[var(--text-primary)]">{tenants.length}</p>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <RefreshCw className="w-8 h-8 mx-auto text-[var(--nexus-gold)] animate-spin" />
          <p className="text-[var(--text-mid)] mt-4">Cargando estadísticas...</p>
        </div>
      )}

      {/* Industries Grid */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {industries.map((industry) => {
            const stats = getIndustryStats(industry.slug);
            const statusBadge = getStatusBadge(stats);
            
            return (
              <Link
                key={industry.slug}
                href={industry.route}
                className="group p-5 rounded-xl bg-[var(--glass)] border border-[var(--glass-border)] hover:border-[rgba(167,139,250,0.3)] transition-all"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform"
                    style={{ backgroundColor: `${industry.color}20` }}
                  >
                    <industry.icon className="w-6 h-6" style={{ color: industry.color }} />
                  </div>
                  <span className={`px-2 py-1 rounded text-xs ${statusBadge.className}`}>
                    {statusBadge.label}
                  </span>
                </div>

                {/* Name */}
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-3">
                  {industry.name}
                </h3>

                {/* Stats */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[var(--text-dim)]">Inquilinos</span>
                    <span className="text-[var(--text-primary)] font-medium">{stats.tenantCount}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[var(--text-dim)]">Usuarios activos</span>
                    <span className="text-[var(--text-primary)] font-medium">{stats.activeUsers}</span>
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-4 pt-3 border-t border-[var(--glass-border)] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {stats.activeCount > 0 && (
                      <span className="flex items-center gap-1 text-xs text-[var(--success)]">
                        <CheckCircle className="w-3 h-3" />
                        {stats.activeCount}
                      </span>
                    )}
                    {stats.pendingCount > 0 && (
                      <span className="flex items-center gap-1 text-xs text-[var(--nexus-gold)]">
                        <Clock className="w-3 h-3" />
                        {stats.pendingCount}
                      </span>
                    )}
                    {stats.suspendedCount > 0 && (
                      <span className="flex items-center gap-1 text-xs text-[var(--error)]">
                        <XCircle className="w-3 h-3" />
                        {stats.suspendedCount}
                      </span>
                    )}
                  </div>
                  <ChevronRight className="w-4 h-4 text-[var(--text-dim)] group-hover:text-[var(--nexus-gold)] transition-colors" />
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Summary Cards */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="p-4 rounded-xl bg-[var(--glass)] border border-[var(--glass-border)]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[var(--success)]/10 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-[var(--success)]" />
              </div>
              <div>
                <p className="text-sm text-[var(--text-dim)]">Inquilinos Activos</p>
                <p className="text-xl font-bold text-[var(--text-primary)]">
                  {tenants.filter((t: any) => t.status === 'active').length}
                </p>
              </div>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-[var(--glass)] border border-[var(--glass-border)]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[var(--nexus-gold)]/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-[var(--nexus-gold)]" />
              </div>
              <div>
                <p className="text-sm text-[var(--text-dim)]">Pendientes</p>
                <p className="text-xl font-bold text-[var(--text-primary)]">
                  {tenants.filter((t: any) => t.status === 'pending').length}
                </p>
              </div>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-[var(--glass)] border border-[var(--glass-border)]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[var(--error)]/10 flex items-center justify-center">
                <XCircle className="w-5 h-5 text-[var(--error)]" />
              </div>
              <div>
                <p className="text-sm text-[var(--text-dim)]">Suspendidos</p>
                <p className="text-xl font-bold text-[var(--text-primary)]">
                  {tenants.filter((t: any) => t.status === 'suspended').length}
                </p>
              </div>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-[var(--glass)] border border-[var(--glass-border)]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[var(--nexus-violet)]/10 flex items-center justify-center">
                <UserCheck className="w-5 h-5 text-[var(--nexus-violet)]" />
              </div>
              <div>
                <p className="text-sm text-[var(--text-dim)]">Total Usuarios</p>
                <p className="text-xl font-bold text-[var(--text-primary)]">
                  {tenants.reduce((sum: number, t: any) => sum + (t._count?.users || 0), 0)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// DASHBOARD OVERVIEW
// ============================================
function DashboardOverview() {
  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">Bienvenido a la Torre de Control</h2>
          <p className="text-[var(--text-mid)]">Panel centralizado de administración de NexusOS</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-[var(--text-dim)]">Hoy</p>
          <p className="text-lg font-semibold text-[var(--text-primary)]">
            {new Date().toLocaleDateString('es-TT', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Ingresos del Mes"
          value="TT$45,500"
          change="+12.5% vs mes anterior"
          trend="up"
          icon={DollarSign}
          color="#F0B429"
        />
        <StatCard
          title="Inquilinos Activos"
          value="23"
          change="+3 nuevos"
          trend="up"
          icon={Building2}
          color="#22D3EE"
        />
        <StatCard
          title="Usuarios Totales"
          value="156"
          change="+18 esta semana"
          trend="up"
          icon={Users}
          color="#34D399"
        />
        <StatCard
          title="Tasa de Actividad"
          value="94%"
          change="-2% vs semana anterior"
          trend="down"
          icon={Activity}
          color="#EC4899"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'Crear Inquilino', icon: Plus, color: '#F0B429', tab: 'create-tenant' },
          { title: 'Ver Órdenes', icon: CreditCard, color: '#22D3EE', tab: 'orders' },
          { title: 'Gestionar Planes', icon: DollarSign, color: '#34D399', tab: 'pricing' },
          { title: 'Configuración', icon: Settings, color: '#EC4899', tab: 'settings' },
        ].map((action, index) => (
          <button
            key={index}
            onClick={() => {
              if (action.tab === 'create-tenant') {
                const event = new CustomEvent('adminTabChange', { detail: action.tab });
                window.dispatchEvent(event);
              } else {
                const event = new CustomEvent('adminTabChange', { detail: action.tab });
                window.dispatchEvent(event);
              }
            }}
            className="flex items-center gap-3 p-4 rounded-xl bg-[var(--glass)] border border-[var(--glass-border)] hover:border-[rgba(167,139,250,0.3)] transition-all group"
          >
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${action.color}20` }}>
              <action.icon className="w-5 h-5" style={{ color: action.color }} />
            </div>
            <span className="text-[var(--text-primary)] font-medium group-hover:text-[var(--nexus-gold)] transition-colors">
              {action.title}
            </span>
            <ChevronRight className="w-4 h-4 ml-auto text-[var(--text-dim)] group-hover:text-[var(--nexus-gold)]" />
          </button>
        ))}
      </div>

      {/* Industry Access */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Acceso Rápido a Industrias</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { name: 'Clínicas', icon: Stethoscope, href: '/clinic', color: '#22D3EE', count: 12 },
            { name: 'Enfermería', icon: Heart, href: '/nurse', color: '#34D399', count: 5 },
            { name: 'Bufetes', icon: Scale, href: '/lawfirm', color: '#C4A35A', count: 4 },
            { name: 'Belleza', icon: Scissors, href: '/beauty', color: '#EC4899', count: 2 },
          ].map((industry, index) => (
            <Link
              key={index}
              href={industry.href}
              className="flex flex-col items-center p-4 rounded-xl bg-[var(--glass)] hover:bg-[rgba(108,63,206,0.1)] transition-all group"
            >
              <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform" style={{ backgroundColor: `${industry.color}20` }}>
                <industry.icon className="w-7 h-7" style={{ color: industry.color }} />
              </div>
              <span className="text-[var(--text-primary)] font-medium">{industry.name}</span>
              <span className="text-xs text-[var(--text-dim)]">{industry.count} espacios</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Capacity Metrics */}
      <CapacityMetrics />

      {/* Security Info */}
      <SecurityInfo />
    </div>
  );
}

// ============================================
// USERS MANAGEMENT (Placeholder)
// ============================================
function UsersManagement() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[var(--text-primary)]">Gestión de Usuarios</h2>
        <p className="text-sm text-[var(--text-mid)]">Administra usuarios del sistema</p>
      </div>
      <div className="glass-card p-6 text-center">
        <Users className="w-12 h-12 text-[var(--text-dim)] mx-auto mb-4" />
        <p className="text-[var(--text-mid)]">Módulo de usuarios en desarrollo...</p>
      </div>
    </div>
  );
}
