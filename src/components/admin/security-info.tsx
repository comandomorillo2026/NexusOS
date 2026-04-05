'use client';

import React, { useState } from 'react';
import {
  Shield,
  Lock,
  Key,
  Database,
  Server,
  Globe,
  CheckCircle,
  AlertTriangle,
  Info,
  ChevronDown,
  ChevronUp,
  Building2,
  Users,
  CreditCard,
  FileText,
  Eye,
  Zap
} from 'lucide-react';

// ============================================
// DATOS DE SEGURIDAD SUPABASE
// ============================================
const SECURITY_FEATURES = {
  free: {
    name: 'Free Tier',
    price: '$0/mes',
    features: [
      { name: 'Row Level Security (RLS)', included: true, description: 'Aislamiento de datos multi-tenant' },
      { name: 'SSL/TLS Encriptación', included: true, description: 'Conexiones cifradas en tránsito' },
      { name: 'Autenticación JWT', included: true, description: 'Tokens seguros con expiración' },
      { name: 'API Keys (Anon + Service)', included: true, description: 'Claves públicas y privadas' },
      { name: 'Auth Service', included: true, description: 'Login, registro, recuperación' },
      { name: 'PostgreSQL Roles', included: true, description: 'Control de acceso a nivel DB' },
      { name: 'Audit Logs', included: true, description: 'Registro de actividades' },
      { name: 'Point-in-Time Recovery', included: false, description: 'Recuperación a punto específico' },
      { name: 'SOC2 Compliance', included: false, description: 'Certificación de seguridad' },
      { name: 'HIPAA Compliance', included: false, description: 'Cumplimiento médico' },
      { name: 'SAML SSO', included: false, description: 'Single Sign-On empresarial' },
      { name: 'Custom Roles', included: false, description: 'Roles personalizados' },
    ],
    limits: {
      storage: '500 MB',
      bandwidth: '5 GB',
      apiCalls: '500K/mes',
      concurrentConnections: '200',
      retention: '1 día'
    }
  },
  pro: {
    name: 'Pro Tier',
    price: '$25/mes',
    features: [
      { name: 'Row Level Security (RLS)', included: true, description: 'Aislamiento de datos multi-tenant' },
      { name: 'SSL/TLS Encriptación', included: true, description: 'Conexiones cifradas en tránsito' },
      { name: 'Autenticación JWT', included: true, description: 'Tokens seguros con expiración' },
      { name: 'API Keys (Anon + Service)', included: true, description: 'Claves públicas y privadas' },
      { name: 'Auth Service', included: true, description: 'Login, registro, recuperación' },
      { name: 'PostgreSQL Roles', included: true, description: 'Control de acceso a nivel DB' },
      { name: 'Audit Logs', included: true, description: 'Registro de actividades (7 días)' },
      { name: 'Point-in-Time Recovery', included: true, description: 'Recuperación a punto específico' },
      { name: 'SOC2 Compliance', included: false, description: 'Certificación de seguridad' },
      { name: 'HIPAA Compliance', included: false, description: 'Cumplimiento médico' },
      { name: 'SAML SSO', included: false, description: 'Single Sign-On empresarial' },
      { name: 'Custom Roles', included: true, description: 'Roles personalizados' },
    ],
    limits: {
      storage: '8 GB',
      bandwidth: '250 GB',
      apiCalls: '2M/mes',
      concurrentConnections: '2000',
      retention: '7 días'
    }
  },
  team: {
    name: 'Team Tier',
    price: '$599/mes',
    features: [
      { name: 'Row Level Security (RLS)', included: true, description: 'Aislamiento de datos multi-tenant' },
      { name: 'SSL/TLS Encriptación', included: true, description: 'Conexiones cifradas en tránsito' },
      { name: 'Autenticación JWT', included: true, description: 'Tokens seguros con expiración' },
      { name: 'API Keys (Anon + Service)', included: true, description: 'Claves públicas y privadas' },
      { name: 'Auth Service', included: true, description: 'Login, registro, recuperación' },
      { name: 'PostgreSQL Roles', included: true, description: 'Control de acceso a nivel DB' },
      { name: 'Audit Logs', included: true, description: 'Registro de actividades (30 días)' },
      { name: 'Point-in-Time Recovery', included: true, description: 'Recuperación a punto específico' },
      { name: 'SOC2 Compliance', included: true, description: 'Certificación de seguridad' },
      { name: 'HIPAA Compliance', included: false, description: 'Cumplimiento médico (addon)' },
      { name: 'SAML SSO', included: true, description: 'Single Sign-On empresarial' },
      { name: 'Custom Roles', included: true, description: 'Roles personalizados' },
    ],
    limits: {
      storage: '100 GB',
      bandwidth: '1 TB',
      apiCalls: '10M/mes',
      concurrentConnections: '10000',
      retention: '30 días'
    }
  }
};

const INDUSTRY_COMPLIANCE = [
  { industry: 'Clínicas / Médico', requires: 'HIPAA', tier: 'Team + HIPAA Addon', icon: '🏥' },
  { industry: 'Bufetes de Abogados', requires: 'SOC2 + Encriptación', tier: 'Pro', icon: '⚖️' },
  { industry: 'Farmacias', requires: 'HIPAA + SOC2', tier: 'Team + HIPAA Addon', icon: '💊' },
  { industry: 'Seguros', requires: 'SOC2 + PCI-DSS', tier: 'Team', icon: '🛡️' },
  { industry: 'Salones de Belleza', requires: 'Ninguno específico', tier: 'Free / Pro', icon: '💇' },
  { industry: 'Panaderías', requires: 'Ninguno específico', tier: 'Free / Pro', icon: '🍞' },
  { industry: 'Retail', requires: 'PCI-DSS (pagos)', tier: 'Pro', icon: '🏪' },
  { industry: 'Enfermería', requires: 'HIPAA', tier: 'Team + HIPAA Addon', icon: '💉' },
];

const ENV_VARIABLES = [
  { name: 'SUPABASE_URL', purpose: 'URL base del proyecto', security: 'Pública, sin secreto' },
  { name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', purpose: 'Clave para operaciones públicas', security: 'Segura con RLS' },
  { name: 'SUPABASE_SERVICE_ROLE_KEY', purpose: 'Clave admin (backend only)', security: '⚠️ NUNCA exponer al cliente' },
  { name: 'SUPABASE_JWT_SECRET', purpose: 'Firma de tokens JWT', security: '⚠️ Secreto crítico' },
  { name: 'POSTGRES_URL', purpose: 'Conexión directa a DB', security: 'Solo server-side' },
  { name: 'POSTGRES_PRISMA_URL', purpose: 'Pooler para serverless', security: 'Con pgbouncer' },
];

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
function SecurityInfo() {
  const [selectedTier, setSelectedTier] = useState<'free' | 'pro' | 'team'>('free');
  const [expandedSection, setExpandedSection] = useState<string | null>('features');

  const tier = SECURITY_FEATURES[selectedTier];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
            <Shield className="w-6 h-6 text-[var(--nexus-gold)]" />
            Seguridad del Sistema
          </h3>
          <p className="text-sm text-[var(--text-mid)]">
            Infraestructura de seguridad proporcionada por Supabase
          </p>
        </div>
      </div>

      {/* Tier Selector */}
      <div className="flex gap-2 flex-wrap">
        {(['free', 'pro', 'team'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setSelectedTier(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              selectedTier === t 
                ? 'bg-[var(--nexus-gold)] text-[var(--obsidian)]' 
                : 'bg-[var(--glass)] text-[var(--text-mid)] hover:text-[var(--text-primary)]'
            }`}
          >
            {SECURITY_FEATURES[t].name} ({SECURITY_FEATURES[t].price})
          </button>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-4">
          <div className="flex items-center gap-3">
            <Database className="w-8 h-8 text-[#22D3EE]" />
            <div>
              <p className="text-xs text-[var(--text-dim)]">Storage</p>
              <p className="text-lg font-bold text-[var(--text-primary)]">{tier.limits.storage}</p>
            </div>
          </div>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-3">
            <Globe className="w-8 h-8 text-[#34D399]" />
            <div>
              <p className="text-xs text-[var(--text-dim)]">Bandwidth</p>
              <p className="text-lg font-bold text-[var(--text-primary)]">{tier.limits.bandwidth}</p>
            </div>
          </div>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-3">
            <Zap className="w-8 h-8 text-[#F59E0B]" />
            <div>
              <p className="text-xs text-[var(--text-dim)]">API Calls</p>
              <p className="text-lg font-bold text-[var(--text-primary)]">{tier.limits.apiCalls}</p>
            </div>
          </div>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-[#8B5CF6]" />
            <div>
              <p className="text-xs text-[var(--text-dim)]">Conexiones</p>
              <p className="text-lg font-bold text-[var(--text-primary)]">{tier.limits.concurrentConnections}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Security Features */}
      <div className="glass-card overflow-hidden">
        <button
          onClick={() => setExpandedSection(expandedSection === 'features' ? null : 'features')}
          className="w-full p-4 flex items-center justify-between hover:bg-[var(--glass)] transition-colors"
        >
          <div className="flex items-center gap-3">
            <Lock className="w-5 h-5 text-[var(--nexus-gold)]" />
            <h4 className="text-lg font-semibold text-[var(--text-primary)]">
              Características de Seguridad - {tier.name}
            </h4>
          </div>
          {expandedSection === 'features' ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
        
        {expandedSection === 'features' && (
          <div className="p-4 pt-0">
            <div className="grid gap-2">
              {tier.features.map((feature, index) => (
                <div 
                  key={index}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    feature.included ? 'bg-[var(--success)]/5' : 'bg-[var(--error)]/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {feature.included ? (
                      <CheckCircle className="w-5 h-5 text-[var(--success)]" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-[var(--error)]" />
                    )}
                    <div>
                      <p className={`font-medium ${feature.included ? 'text-[var(--text-primary)]' : 'text-[var(--text-mid)]'}`}>
                        {feature.name}
                      </p>
                      <p className="text-xs text-[var(--text-dim)]">{feature.description}</p>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${
                    feature.included ? 'bg-[var(--success)]/20 text-[var(--success)]' : 'bg-[var(--error)]/20 text-[var(--error)]'
                  }`}>
                    {feature.included ? 'Incluido' : 'No incluido'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Industry Compliance */}
      <div className="glass-card overflow-hidden">
        <button
          onClick={() => setExpandedSection(expandedSection === 'compliance' ? null : 'compliance')}
          className="w-full p-4 flex items-center justify-between hover:bg-[var(--glass)] transition-colors"
        >
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-[var(--nexus-gold)]" />
            <h4 className="text-lg font-semibold text-[var(--text-primary)]">
              Cumplimiento por Industria
            </h4>
          </div>
          {expandedSection === 'compliance' ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
        
        {expandedSection === 'compliance' && (
          <div className="p-4 pt-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[var(--glass)]">
                    <th className="text-left py-3 px-4 text-sm font-medium text-[var(--text-mid)]">Industria</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-[var(--text-mid)]">Requisito</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-[var(--text-mid)]">Tier Recomendado</th>
                  </tr>
                </thead>
                <tbody>
                  {INDUSTRY_COMPLIANCE.map((item, index) => (
                    <tr key={index} className="border-b border-[var(--glass-border)]">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span>{item.icon}</span>
                          <span className="text-[var(--text-primary)]">{item.industry}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-sm ${
                          item.requires === 'Ninguno específico' ? 'text-[var(--success)]' : 'text-[var(--nexus-gold)]'
                        }`}>
                          {item.requires}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-[var(--text-mid)]">{item.tier}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Environment Variables */}
      <div className="glass-card overflow-hidden">
        <button
          onClick={() => setExpandedSection(expandedSection === 'env' ? null : 'env')}
          className="w-full p-4 flex items-center justify-between hover:bg-[var(--glass)] transition-colors"
        >
          <div className="flex items-center gap-3">
            <Key className="w-5 h-5 text-[var(--nexus-gold)]" />
            <h4 className="text-lg font-semibold text-[var(--text-primary)]">
              Variables de Entorno Configuradas
            </h4>
          </div>
          {expandedSection === 'env' ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
        
        {expandedSection === 'env' && (
          <div className="p-4 pt-0">
            <div className="space-y-3">
              {ENV_VARIABLES.map((env, index) => (
                <div key={index} className="p-3 rounded-lg bg-[var(--obsidian-3)] border border-[var(--glass-border)]">
                  <div className="flex items-center justify-between mb-2">
                    <code className="text-sm text-[#22D3EE] font-mono">{env.name}</code>
                    <span className={`text-xs px-2 py-1 rounded ${
                      env.security.includes('⚠️') ? 'bg-[var(--error)]/20 text-[var(--error)]' : 'bg-[var(--success)]/20 text-[var(--success)]'
                    }`}>
                      {env.security}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--text-dim)]">{env.purpose}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* What Changes When You Pay */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <CreditCard className="w-5 h-5 text-[var(--nexus-gold)]" />
          <h4 className="text-lg font-semibold text-[var(--text-primary)]">
            ¿Qué cambia al pagar?
          </h4>
        </div>
        
        <div className="grid gap-4">
          <div className="p-4 rounded-lg bg-[var(--nexus-gold)]/5 border border-[var(--nexus-gold)]/20">
            <h5 className="font-medium text-[var(--text-primary)] mb-2">De Free → Pro ($25/mes)</h5>
            <ul className="text-sm text-[var(--text-mid)] space-y-1">
              <li>✓ 16x más almacenamiento (8 GB vs 500 MB)</li>
              <li>✓ 50x más bandwidth (250 GB vs 5 GB)</li>
              <li>✓ 4x más API calls (2M vs 500K)</li>
              <li>✓ Logs de auditoría por 7 días</li>
              <li>✓ Point-in-Time Recovery</li>
              <li>✓ Roles personalizados</li>
            </ul>
          </div>
          
          <div className="p-4 rounded-lg bg-[#8B5CF6]/5 border border-[#8B5CF6]/20">
            <h5 className="font-medium text-[var(--text-primary)] mb-2">De Pro → Team ($599/mes)</h5>
            <ul className="text-sm text-[var(--text-mid)] space-y-1">
              <li>✓ SOC2 Compliance incluido</li>
              <li>✓ SAML SSO para empresas</li>
              <li>✓ 100 GB storage + ilimitado en add-on</li>
              <li>✓ Soporte prioritario 24/7</li>
              <li>✓ SLA garantizado 99.9%</li>
              <li>✓ HIPAA disponible como add-on</li>
            </ul>
          </div>
        </div>
      </div>

      {/* RLS Explanation */}
      <div className="p-4 rounded-lg bg-[var(--success)]/10 border border-[var(--success)]/20">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-[var(--success)] flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-[var(--text-primary)]">Row Level Security (RLS) - Tu Mejor Defensa</p>
            <p className="text-sm text-[var(--text-mid)] mt-1">
              Supabase usa RLS de PostgreSQL para garantizar que cada empresa (tenant) solo pueda acceder a SUS datos. 
              Incluso si alguien obtiene la API key pública, las políticas RLS bloquean cualquier acceso a datos de otros tenants.
              <strong className="text-[var(--success)]"> Esto es nivel enterprise de seguridad, incluido en el plan gratuito.</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export { SecurityInfo, SECURITY_FEATURES, INDUSTRY_COMPLIANCE };
