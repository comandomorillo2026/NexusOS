'use client';

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  CheckCircle,
  XCircle,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Sparkles,
  MessageSquare,
  Globe,
  Clock,
  Users,
  Building2,
  Stethoscope,
  Heart,
  Scale,
  Scissors,
  Pill,
  Shield,
  ChevronRight,
  Copy,
  Lightbulb,
  AlertTriangle,
  BarChart3,
  Zap,
  Phone,
  MapPin,
  Target,
  Award
} from 'lucide-react';

// ============================================
// TYPES & DATA
// ============================================

interface CompetitorFeature {
  name: string;
  aethel: boolean | string;
  competitors: { [key: string]: boolean | string };
  highlight?: boolean;
}

interface IndustryData {
  id: string;
  name: string;
  icon: React.ElementType;
  color: string;
  description: string;
  competitors: string[];
  features: CompetitorFeature[];
  usps: string[];
  missing: string[];
  quickFacts: { label: string; value: string; highlight?: boolean }[];
  aethelPrice: string;
  priceComparison: { name: string; price: string; features: number; color: string }[];
}

// ============================================
// INDUSTRY DATA CONFIGURATION
// ============================================

const industriesData: IndustryData[] = [
  {
    id: 'bakery',
    name: 'Panadería / Pastelería',
    icon: Building2,
    color: '#F97316',
    description: 'Gestión completa para panaderías y pastelerías del Caribe',
    competitors: ['Square', 'Toast', 'Cybake'],
    features: [
      { name: 'POS con offline', aethel: true, competitors: { 'Square': true, 'Toast': true, 'Cybake': false } },
      { name: 'Recetas integradas', aethel: true, competitors: { 'Square': false, 'Toast': false, 'Cybake': true } },
      { name: 'IA especializada', aethel: true, competitors: { 'Square': false, 'Toast': false, 'Cybake': false }, highlight: true },
      { name: 'WiPay/Artim', aethel: true, competitors: { 'Square': false, 'Toast': false, 'Cybake': false }, highlight: true },
      { name: 'WhatsApp integrado', aethel: true, competitors: { 'Square': false, 'Toast': false, 'Cybake': false }, highlight: true },
      { name: 'Producción diaria', aethel: true, competitors: { 'Square': false, 'Toast': false, 'Cybake': true } },
      { name: 'Pedidos personalizados', aethel: true, competitors: { 'Square': true, 'Toast': true, 'Cybake': true } },
      { name: 'Inventario con recetas', aethel: true, competitors: { 'Square': false, 'Toast': false, 'Cybake': true } },
      { name: 'Facturación TT$', aethel: true, competitors: { 'Square': false, 'Toast': false, 'Cybake': false }, highlight: true },
      { name: 'Soporte en español', aethel: true, competitors: { 'Square': false, 'Toast': false, 'Cybake': true } },
      { name: 'Precio/mes', aethel: 'TT$900', competitors: { 'Square': '$60+', 'Toast': '$165+', 'Cybake': '$150+' } },
    ],
    usps: [
      'Único con IA especializada para panaderías del Caribe',
      'Integración nativa con WiPay y Artim para pagos locales',
      'WhatsApp Business integrado para pedidos directos',
      'Precios en TT$ sin conversión de divisas',
      'Soporte técnico en español 24/7',
      'Sistema de recetas con cálculo automático de costos',
    ],
    missing: [
      'App móvil nativa para clientes (en desarrollo)',
      'Integración con Uber Eats/DoorDash',
      'Programa de lealtad con puntos (roadmap Q2)',
    ],
    quickFacts: [
      { label: '70% más económico', value: 'vs competidores internacionales' },
      { label: 'Único con IA', value: 'para panaderías del Caribe' },
      { label: 'Pagos locales', value: 'WiPay, Artim, transferencias' },
      { label: 'Soporte 24/7', value: 'en español', highlight: true },
    ],
    aethelPrice: 'TT$900',
    priceComparison: [
      { name: 'AETHEL OS', price: 'TT$900', features: 10, color: '#F97316' },
      { name: 'Square', price: '~TT$408', features: 4, color: '#3B82F6' },
      { name: 'Toast', price: '~TT$1,122', features: 3, color: '#EF4444' },
      { name: 'Cybake', price: '~TT$1,020', features: 4, color: '#8B5CF6' },
    ],
  },
  {
    id: 'clinic',
    name: 'Clínica / Centro Médico',
    icon: Stethoscope,
    color: '#22D3EE',
    description: 'Sistema integral para clínicas y centros médicos',
    competitors: ['Athenahealth', 'DrChrono', ' Kareo'],
    features: [
      { name: 'Multi-proveedor', aethel: true, competitors: { 'Athenahealth': true, 'DrChrono': true, 'Kareo': true } },
      { name: 'Citas online', aethel: true, competitors: { 'Athenahealth': true, 'DrChrono': true, 'Kareo': true } },
      { name: 'Portal de pacientes', aethel: true, competitors: { 'Athenahealth': true, 'DrChrono': true, 'Kareo': false }, highlight: true },
      { name: 'Historial médico', aethel: true, competitors: { 'Athenahealth': true, 'DrChrono': true, 'Kareo': true } },
      { name: 'Recetas digitales', aethel: true, competitors: { 'Athenahealth': true, 'DrChrono': true, 'Kareo': false } },
      { name: 'Laboratorio integrado', aethel: true, competitors: { 'Athenahealth': false, 'DrChrono': false, 'Kareo': false }, highlight: true },
      { name: 'Portal de enfermería', aethel: true, competitors: { 'Athenahealth': true, 'DrChrono': false, 'Kareo': false }, highlight: true },
      { name: 'IA diagnóstica', aethel: true, competitors: { 'Athenahealth': false, 'DrChrono': false, 'Kareo': false }, highlight: true },
      { name: 'WiPay/Artim', aethel: true, competitors: { 'Athenahealth': false, 'DrChrono': false, 'Kareo': false }, highlight: true },
      { name: 'WhatsApp reminders', aethel: true, competitors: { 'Athenahealth': false, 'DrChrono': false, 'Kareo': false }, highlight: true },
      { name: 'Soporte en español', aethel: true, competitors: { 'Athenahealth': false, 'DrChrono': false, 'Kareo': false } },
      { name: 'Precio/mes', aethel: 'TT$2,200', competitors: { 'Athenahealth': '$200+', 'DrChrono': '$150+', 'Kareo': '$125+' } },
    ],
    usps: [
      'Único con IA diagnóstica asistida para clínicas del Caribe',
      'Portal de enfermería incluido sin costo adicional',
      'Laboratorio integrado con resultados en tiempo real',
      'Recordatorios por WhatsApp para reducir no-shows',
      'Pagos locales integrados (WiPay, Artim)',
      'Soporte técnico en español con conocimiento médico local',
    ],
    missing: [
      'Integración con seguros médicos internacionales',
      'Telemedicina con video (roadmap Q3)',
      'Certificación HIPAA (en proceso)',
    ],
    quickFacts: [
      { label: '50% más económico', value: 'vs Athenahealth' },
      { label: 'Portal enfermería', value: 'incluido sin cargo extra' },
      { label: 'IA diagnóstica', value: 'único en el Caribe', highlight: true },
      { label: 'WhatsApp', value: 'recordatorios automáticos' },
    ],
    aethelPrice: 'TT$2,200',
    priceComparison: [
      { name: 'AETHEL OS', price: 'TT$2,200', features: 12, color: '#22D3EE' },
      { name: 'Athenahealth', price: '~TT$1,360', features: 7, color: '#3B82F6' },
      { name: 'DrChrono', price: '~TT$1,020', features: 6, color: '#10B981' },
      { name: 'Kareo', price: '~TT$850', features: 5, color: '#8B5CF6' },
    ],
  },
  {
    id: 'beauty',
    name: 'Salón de Belleza / SPA',
    icon: Scissors,
    color: '#EC4899',
    description: 'Gestión completa para salones de belleza y spas',
    competitors: ['Vagaro', 'Mindbody', 'Fresha'],
    features: [
      { name: 'Citas online', aethel: true, competitors: { 'Vagaro': true, 'Mindbody': true, 'Fresha': true } },
      { name: 'POS integrado', aethel: true, competitors: { 'Vagaro': true, 'Mindbody': true, 'Fresha': false } },
      { name: 'Membresías', aethel: true, competitors: { 'Vagaro': true, 'Mindbody': true, 'Fresha': false } },
      { name: 'Gestión de personal', aethel: true, competitors: { 'Vagaro': true, 'Mindbody': true, 'Fresha': false } },
      { name: 'Comisiones', aethel: true, competitors: { 'Vagaro': true, 'Mindbody': true, 'Fresha': false } },
      { name: 'Contabilidad real', aethel: true, competitors: { 'Vagaro': false, 'Mindbody': false, 'Fresha': false }, highlight: true },
      { name: 'Gastos (luz, agua, AC)', aethel: true, competitors: { 'Vagaro': false, 'Mindbody': false, 'Fresha': false }, highlight: true },
      { name: 'Impuestos TT', aethel: true, competitors: { 'Vagaro': false, 'Mindbody': false, 'Fresha': false }, highlight: true },
      { name: 'WhatsApp booking', aethel: true, competitors: { 'Vagaro': false, 'Mindbody': true, 'Fresha': false }, highlight: true },
      { name: 'Multi-sucursal', aethel: true, competitors: { 'Vagaro': true, 'Mindbody': true, 'Fresha': false } },
      { name: 'Soporte en español', aethel: true, competitors: { 'Vagaro': true, 'Mindbody': false, 'Fresha': false } },
      { name: 'Precio/mes', aethel: 'TT$1,100', competitors: { 'Vagaro': '$30+', 'Mindbody': '$129+', 'Fresha': 'Gratis*' } },
    ],
    usps: [
      'Único con contabilidad real integrada (gastos, impuestos TT)',
      'Seguimiento de gastos operativos (luz, agua, AC, alquiler)',
      'Sistema de impuestos de Trinidad & Tobago configurado',
      'Reservas por WhatsApp sin costo adicional',
      '10x más económico que Mindbody con MÁS features',
      'Sin comisiones por transacción como Fresha',
    ],
    missing: [
      'Marketplace de clientes (como Fresha)',
      'App móvil para clientes (en desarrollo)',
      'Integración con Instagram booking',
    ],
    quickFacts: [
      { label: '10x más barato', value: 'que Mindbody' },
      { label: 'Contabilidad real', value: 'incluida en el plan', highlight: true },
      { label: 'Sin comisiones', value: 'a diferencia de Fresha' },
      { label: 'Impuestos TT', value: 'configurados y listos' },
    ],
    aethelPrice: 'TT$1,100',
    priceComparison: [
      { name: 'AETHEL OS', price: 'TT$1,100', features: 11, color: '#EC4899' },
      { name: 'Vagaro', price: '~TT$204', features: 8, color: '#6366F1' },
      { name: 'Mindbody', price: '~TT$877', features: 7, color: '#10B981' },
      { name: 'Fresha', price: 'Gratis*', features: 3, color: '#F59E0B' },
    ],
  },
  {
    id: 'lawfirm',
    name: 'Bufete de Abogados',
    icon: Scale,
    color: '#C4A35A',
    description: 'Gestión legal para bufetes del Caribe',
    competitors: ['Clio', 'MyCase', 'PracticePanther'],
    features: [
      { name: 'Gestión de casos', aethel: true, competitors: { 'Clio': true, 'MyCase': true, 'PracticePanther': true } },
      { name: 'Time tracking', aethel: true, competitors: { 'Clio': true, 'MyCase': true, 'PracticePanther': true } },
      { name: 'Trust accounting (IOLTA)', aethel: true, competitors: { 'Clio': true, 'MyCase': true, 'PracticePanther': true } },
      { name: 'Documentos legales', aethel: true, competitors: { 'Clio': true, 'MyCase': true, 'PracticePanther': true } },
      { name: 'Biblioteca legal TT', aethel: true, competitors: { 'Clio': false, 'MyCase': false, 'PracticePanther': false }, highlight: true },
      { name: 'Facturación por hora', aethel: true, competitors: { 'Clio': true, 'MyCase': true, 'PracticePanther': true } },
      { name: 'Portal de clientes', aethel: true, competitors: { 'Clio': true, 'MyCase': true, 'PracticePanther': false } },
      { name: 'IA para contratos', aethel: true, competitors: { 'Clio': false, 'MyCase': false, 'PracticePanther': false }, highlight: true },
      { name: 'Plantillas TT', aethel: true, competitors: { 'Clio': false, 'MyCase': false, 'PracticePanther': false }, highlight: true },
      { name: 'WhatsApp updates', aethel: true, competitors: { 'Clio': false, 'MyCase': false, 'PracticePanther': false }, highlight: true },
      { name: 'Soporte en español', aethel: true, competitors: { 'Clio': false, 'MyCase': false, 'PracticePanther': false } },
      { name: 'Precio/mes', aethel: 'TT$2,800', competitors: { 'Clio': '$125+', 'MyCase': '$79+', 'PracticePanther': '$79+' } },
    ],
    usps: [
      'Biblioteca legal de Trinidad & Tobago integrada',
      'Plantillas de documentos para jurisdicción TT',
      'IA para análisis y generación de contratos',
      'Actualizaciones a clientes por WhatsApp',
      'Cumplimiento IOLTA para cuentas de fideicomiso',
      'Soporte legal en español con conocimiento local',
    ],
    missing: [
      'Integración con Microsoft 365',
      'E-signature nativo (integración en progreso)',
      'Court filing integration (solo TT)',
    ],
    quickFacts: [
      { label: 'Biblioteca TT', value: 'leyes y estatutos locales' },
      { label: 'IA para contratos', value: 'único en el mercado', highlight: true },
      { label: 'IOLTA compliant', value: 'cuentas de fideicomiso' },
      { label: '40% ahorro', value: 'vs Clio con más features' },
    ],
    aethelPrice: 'TT$2,800',
    priceComparison: [
      { name: 'AETHEL OS', price: 'TT$2,800', features: 11, color: '#C4A35A' },
      { name: 'Clio', price: '~TT$850', features: 8, color: '#6366F1' },
      { name: 'MyCase', price: '~TT$537', features: 7, color: '#10B981' },
      { name: 'PracticePanther', price: '~TT$537', features: 6, color: '#8B5CF6' },
    ],
  },
  {
    id: 'condo',
    name: 'Condominios / Propiedades',
    icon: Building2,
    color: '#10B981',
    description: 'Gestión integral de condominios y propiedades horizontales',
    competitors: ['Buildium', 'AppFolio', 'Yardi'],
    features: [
      { name: 'Gestión de unidades', aethel: true, competitors: { 'Buildium': true, 'AppFolio': true, 'Yardi': true } },
      { name: 'Facturación mensual', aethel: true, competitors: { 'Buildium': true, 'AppFolio': true, 'Yardi': true } },
      { name: 'Portal de residentes', aethel: true, competitors: { 'Buildium': true, 'AppFolio': true, 'Yardi': true } },
      { name: 'Reservaciones amenidades', aethel: true, competitors: { 'Buildium': true, 'AppFolio': true, 'Yardi': true } },
      { name: 'Contabilidad real', aethel: true, competitors: { 'Buildium': true, 'AppFolio': true, 'Yardi': true } },
      { name: 'Mantenimiento', aethel: true, competitors: { 'Buildium': true, 'AppFolio': true, 'Yardi': true } },
      { name: 'Votaciones electrónicas', aethel: true, competitors: { 'Buildium': false, 'AppFolio': false, 'Yardi': false }, highlight: true },
      { name: 'WhatsApp notificaciones', aethel: true, competitors: { 'Buildium': false, 'AppFolio': false, 'Yardi': false }, highlight: true },
      { name: 'Pagos WiPay/Artim', aethel: true, competitors: { 'Buildium': false, 'AppFolio': false, 'Yardi': false }, highlight: true },
      { name: 'Modo offline', aethel: true, competitors: { 'Buildium': false, 'AppFolio': false, 'Yardi': false }, highlight: true },
      { name: 'Soporte en español', aethel: true, competitors: { 'Buildium': false, 'AppFolio': false, 'Yardi': false } },
      { name: 'Precio/mes', aethel: 'TT$1,800', competitors: { 'Buildium': '$100+', 'AppFolio': '$200+', 'Yardi': '$150+' } },
    ],
    usps: [
      'Único con votaciones electrónicas para asambleas',
      'Notificaciones por WhatsApp para recordatorios de pago',
      'Modo offline para administradores sin conexión',
      'Pagos locales integrados (WiPay, Artim)',
      'Contabilidad lista para contadores profesionales',
      'Soporte técnico en español 24/7',
    ],
    missing: [
      'App móvil nativa para residentes (en desarrollo)',
      'Integración con seguros de propiedad',
      'Marketplace de servicios para residentes',
    ],
    quickFacts: [
      { label: 'Votaciones digitales', value: 'asambleas sin papel', highlight: true },
      { label: '50% más económico', value: 'que Buildium' },
      { label: 'Modo offline', value: 'funciona sin internet' },
      { label: 'Contabilidad real', value: 'lista para contadores' },
    ],
    aethelPrice: 'TT$1,800',
    priceComparison: [
      { name: 'AETHEL OS', price: 'TT$1,800', features: 11, color: '#10B981' },
      { name: 'Buildium', price: '~TT$680', features: 7, color: '#3B82F6' },
      { name: 'AppFolio', price: '~TT$1,360', features: 7, color: '#8B5CF6' },
      { name: 'Yardi', price: '~TT$1,020', features: 6, color: '#F59E0B' },
    ],
  },
  {
    id: 'pharmacy',
    name: 'Farmacia',
    icon: Pill,
    color: '#8B5CF6',
    description: 'Control de inventario y recetas para farmacias',
    competitors: ['PioneerRx', 'McKesson', 'RxSafe'],
    features: [
      { name: 'Inventario', aethel: true, competitors: { 'PioneerRx': true, 'McKesson': true, 'RxSafe': true } },
      { name: 'Recetas digitales', aethel: true, competitors: { 'PioneerRx': true, 'McKesson': true, 'RxSafe': false } },
      { name: 'Alertas de stock', aethel: true, competitors: { 'PioneerRx': true, 'McKesson': true, 'RxSafe': true } },
      { name: 'Vencimientos', aethel: true, competitors: { 'PioneerRx': true, 'McKesson': true, 'RxSafe': true } },
      { name: 'Interacciones medicamentosas', aethel: true, competitors: { 'PioneerRx': true, 'McKesson': false, 'RxSafe': false } },
      { name: 'POS integrado', aethel: true, competitors: { 'PioneerRx': true, 'McKesson': false, 'RxSafe': false } },
      { name: 'Multi-sucursal', aethel: true, competitors: { 'PioneerRx': true, 'McKesson': true, 'RxSafe': true } },
      { name: 'WiPay/Artim', aethel: true, competitors: { 'PioneerRx': false, 'McKesson': false, 'RxSafe': false }, highlight: true },
      { name: 'WhatsApp refills', aethel: true, competitors: { 'PioneerRx': false, 'McKesson': false, 'RxSafe': false }, highlight: true },
      { name: 'Reportes TT', aethel: true, competitors: { 'PioneerRx': false, 'McKesson': false, 'RxSafe': false }, highlight: true },
      { name: 'Soporte en español', aethel: true, competitors: { 'PioneerRx': false, 'McKesson': false, 'RxSafe': false } },
      { name: 'Precio/mes', aethel: 'TT$3,200', competitors: { 'PioneerRx': '$250+', 'McKesson': '$300+', 'RxSafe': '$200+' } },
    ],
    usps: [
      'Sistema de alertas de interacciones medicamentosas',
      'WhatsApp para refill de recetas automáticas',
      'Pagos locales integrados (WiPay, Artim)',
      'Reportes para Ministerio de Salud TT',
      'Seguimiento de medicamentos controlados',
      'Soporte técnico en español 24/7',
    ],
    missing: [
      'Integración con laboratorios clínicos',
      'Sistema de seguros locales (en desarrollo)',
      'App móvil para clientes',
    ],
    quickFacts: [
      { label: '50% ahorro', value: 'vs PioneerRx' },
      { label: 'WhatsApp refills', value: 'pedidos automáticos', highlight: true },
      { label: 'Reportes TT', value: 'listos para Ministerio' },
      { label: 'Alertas IA', value: 'interacciones medicamentosas' },
    ],
    aethelPrice: 'TT$3,200',
    priceComparison: [
      { name: 'AETHEL OS', price: 'TT$3,200', features: 11, color: '#8B5CF6' },
      { name: 'PioneerRx', price: '~TT$1,700', features: 7, color: '#3B82F6' },
      { name: 'McKesson', price: '~TT$2,040', features: 6, color: '#10B981' },
      { name: 'RxSafe', price: '~TT$1,360', features: 5, color: '#F59E0B' },
    ],
  },
  {
    id: 'insurance',
    name: 'Aseguradora',
    icon: Shield,
    color: '#F59E0B',
    description: 'Gestión de pólizas y reclamos para aseguradoras',
    competitors: ['Guidewire', 'Duck Creek', 'Vertafore'],
    features: [
      { name: 'Gestión de pólizas', aethel: true, competitors: { 'Guidewire': true, 'Duck Creek': true, 'Vertafore': true } },
      { name: 'Reclamos', aethel: true, competitors: { 'Guidewire': true, 'Duck Creek': true, 'Vertafore': true } },
      { name: 'Portal de clientes', aethel: true, competitors: { 'Guidewire': true, 'Duck Creek': true, 'Vertafore': true } },
      { name: 'Portal de agentes', aethel: true, competitors: { 'Guidewire': true, 'Duck Creek': true, 'Vertafore': false } },
      { name: 'IA para reclamos', aethel: true, competitors: { 'Guidewire': true, 'Duck Creek': false, 'Vertafore': false }, highlight: true },
      { name: 'Detección de fraude', aethel: true, competitors: { 'Guidewire': true, 'Duck Creek': true, 'Vertafore': false } },
      { name: 'Reportes regulatorios TT', aethel: true, competitors: { 'Guidewire': false, 'Duck Creek': false, 'Vertafore': false }, highlight: true },
      { name: 'Pagos locales', aethel: true, competitors: { 'Guidewire': false, 'Duck Creek': false, 'Vertafore': false }, highlight: true },
      { name: 'WhatsApp claims', aethel: true, competitors: { 'Guidewire': false, 'Duck Creek': false, 'Vertafore': false }, highlight: true },
      { name: 'Multi-rama', aethel: true, competitors: { 'Guidewire': true, 'Duck Creek': true, 'Vertafore': true } },
      { name: 'Soporte en español', aethel: true, competitors: { 'Guidewire': false, 'Duck Creek': false, 'Vertafore': false } },
      { name: 'Precio/mes', aethel: 'TT$15,000', competitors: { 'Guidewire': '$5,000+', 'Duck Creek': '$3,000+', 'Vertafore': '$2,500+' } },
    ],
    usps: [
      'Reportes regulatorios para Trinidad & Tobago listos',
      'IA para evaluación automática de reclamos',
      'WhatsApp para notificación y seguimiento de reclamos',
      'Integración con sistema de pagos local',
      'Detección de fraude con machine learning',
      '90% más económico que Guidewire',
    ],
    missing: [
      'Integración con reaseguradores internacionales',
      'Actuarial tools avanzados',
      'Mobile app para asegurados (roadmap Q4)',
    ],
    quickFacts: [
      { label: '90% ahorro', value: 'vs Guidewire' },
      { label: 'Reportes TT', value: 'Cumplimiento regulatorio', highlight: true },
      { label: 'IA para reclamos', value: 'evaluación automática' },
      { label: 'WhatsApp', value: 'notificaciones en tiempo real' },
    ],
    aethelPrice: 'TT$15,000',
    priceComparison: [
      { name: 'AETHEL OS', price: 'TT$15,000', features: 11, color: '#F59E0B' },
      { name: 'Guidewire', price: '~TT$34,000', features: 8, color: '#3B82F6' },
      { name: 'Duck Creek', price: '~TT$20,400', features: 7, color: '#10B981' },
      { name: 'Vertafore', price: '~TT$17,000', features: 6, color: '#8B5CF6' },
    ],
  },
];

// ============================================
// HELPER COMPONENTS
// ============================================

function FeatureValue({ value, highlight }: { value: boolean | string; highlight?: boolean }) {
  if (typeof value === 'boolean') {
    return value ? (
      <span className={`flex items-center justify-center ${highlight ? 'text-[#34D399]' : 'text-[#34D399]'}`}>
        <CheckCircle className="w-5 h-5" />
      </span>
    ) : (
      <span className="flex items-center justify-center text-[#F87171]">
        <XCircle className="w-5 h-5" />
      </span>
    );
  }
  return (
    <span className={`font-mono text-sm ${highlight ? 'text-[#F0B429] font-bold' : 'text-[#EDE9FE]'}`}>
      {value}
    </span>
  );
}

function QuickFactCard({ fact }: { fact: { label: string; value: string; highlight?: boolean } }) {
  return (
    <div className={`p-4 rounded-xl border transition-all ${
      fact.highlight 
        ? 'bg-gradient-to-br from-[rgba(240,180,41,0.15)] to-[rgba(240,180,41,0.05)] border-[#F0B429]/30' 
        : 'bg-[rgba(108,63,206,0.05)] border-[rgba(167,139,250,0.1)]'
    }`}>
      <div className="flex items-center gap-2 mb-1">
        {fact.highlight && <Zap className="w-4 h-4 text-[#F0B429]" />}
        <span className={`text-sm font-semibold ${fact.highlight ? 'text-[#F0B429]' : 'text-[#EDE9FE]'}`}>
          {fact.label}
        </span>
      </div>
      <p className="text-xs text-[#9D7BEA]">{fact.value}</p>
    </div>
  );
}

function PriceBar({ name, price, features, color, isAETHEL OS }: { 
  name: string; 
  price: string; 
  features: number; 
  color: string;
  isAETHEL OS: boolean;
}) {
  // Parse price for bar width (rough comparison)
  const getPriceValue = (p: string) => {
    const match = p.match(/[\d,]+/);
    return match ? parseInt(match[0].replace(',', '')) : 0;
  };
  
  const maxPrice = 35000;
  const priceValue = getPriceValue(price);
  const width = Math.max(15, (priceValue / maxPrice) * 100);

  return (
    <div className={`p-4 rounded-xl ${isAETHEL OS ? 'bg-[rgba(240,180,41,0.1)] border border-[#F0B429]/30' : 'bg-[rgba(108,63,206,0.05)] border border-[rgba(167,139,250,0.1)]'}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {isAETHEL OS && <Award className="w-4 h-4 text-[#F0B429]" />}
          <span className={`font-semibold ${isAETHEL OS ? 'text-[#F0B429]' : 'text-[#EDE9FE]'}`}>{name}</span>
        </div>
        <span className={`font-mono text-lg font-bold ${isAETHEL OS ? 'text-[#F0B429]' : 'text-[#EDE9FE]'}`}>
          {price}
        </span>
      </div>
      <div className="h-3 rounded-full bg-[rgba(167,139,250,0.1)] overflow-hidden">
        <div 
          className="h-full rounded-full transition-all"
          style={{ width: `${width}%`, backgroundColor: color }}
        />
      </div>
      <div className="flex justify-between mt-2">
        <span className="text-xs text-[#9D7BEA]">{features} features clave</span>
        {isAETHEL OS && (
          <span className="text-xs text-[#34D399]">Mejor valor</span>
        )}
      </div>
    </div>
  );
}

function USPCard({ text, index }: { text: string; index: number }) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg bg-[rgba(108,63,206,0.05)] border border-[rgba(167,139,250,0.1)]">
      <div className="w-6 h-6 rounded-full bg-[#F0B429] flex items-center justify-center flex-shrink-0">
        <span className="text-xs font-bold text-white">{index + 1}</span>
      </div>
      <p className="text-sm text-[#EDE9FE]">{text}</p>
    </div>
  );
}

function MissingFeatureCard({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg bg-[rgba(248,113,113,0.05)] border border-[rgba(248,113,113,0.2)]">
      <AlertTriangle className="w-5 h-5 text-[#F87171] flex-shrink-0 mt-0.5" />
      <p className="text-sm text-[#9D7BEA]">{text}</p>
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export function CompetitiveAnalysis() {
  const [activeIndustry, setActiveIndustry] = useState('bakery');
  const [copiedFact, setCopiedFact] = useState<string | null>(null);

  const currentIndustry = industriesData.find(i => i.id === activeIndustry) || industriesData[0];

  const handleCopyFact = async (fact: string) => {
    await navigator.clipboard.writeText(fact);
    setCopiedFact(fact);
    setTimeout(() => setCopiedFact(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#EDE9FE]" style={{ fontFamily: 'var(--font-cormorant)' }}>
            Análisis Competitivo
          </h1>
          <p className="text-[#9D7BEA] mt-1">Información para conversaciones con clientes</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-[#9D7BEA]">
          <Target className="w-4 h-4 text-[#F0B429]" />
          <span>Actualizado: Enero 2025</span>
        </div>
      </div>

      {/* Industry Tabs */}
      <div className="bg-[rgba(108,63,206,0.05)] rounded-xl p-1 border border-[rgba(167,139,250,0.1)] overflow-x-auto">
        <div className="flex gap-1 min-w-max">
          {industriesData.map((industry) => {
            const Icon = industry.icon;
            const isActive = activeIndustry === industry.id;
            return (
              <button
                key={industry.id}
                onClick={() => setActiveIndustry(industry.id)}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-[#F0B429] to-[#d97706] text-white'
                    : 'text-[#9D7BEA] hover:text-[#EDE9FE] hover:bg-[rgba(167,139,250,0.1)]'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="font-medium whitespace-nowrap">{industry.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Quick Facts for Sales */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {currentIndustry.quickFacts.map((fact, index) => (
          <QuickFactCard key={index} fact={fact} />
        ))}
      </div>

      {/* Feature Comparison Table */}
      <div className="glass-card overflow-hidden">
        <div className="p-4 border-b border-[rgba(167,139,250,0.1)] bg-[rgba(108,63,206,0.05)]">
          <h2 className="text-lg font-semibold text-[#EDE9FE] flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#F0B429]" />
            Comparación de Features
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[rgba(167,139,250,0.1)]">
                <th className="text-left py-4 px-4 text-sm font-medium text-[#9D7BEA]">Función</th>
                <th className="text-center py-4 px-4 text-sm font-medium text-[#F0B429] bg-[rgba(240,180,41,0.05)]">
                  AETHEL OS
                </th>
                {currentIndustry.competitors.map((comp) => (
                  <th key={comp} className="text-center py-4 px-4 text-sm font-medium text-[#9D7BEA]">
                    {comp}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {currentIndustry.features.map((feature, index) => (
                <tr 
                  key={index} 
                  className={`border-b border-[rgba(167,139,250,0.05)] ${
                    feature.highlight ? 'bg-[rgba(240,180,41,0.03)]' : ''
                  }`}
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      {feature.highlight && <Sparkles className="w-4 h-4 text-[#F0B429]" />}
                      <span className={`text-sm ${feature.highlight ? 'text-[#EDE9FE] font-medium' : 'text-[#9D7BEA]'}`}>
                        {feature.name}
                      </span>
                    </div>
                  </td>
                  <td className="text-center py-3 px-4 bg-[rgba(240,180,41,0.03)]">
                    <FeatureValue value={feature.aethel} highlight={feature.highlight} />
                  </td>
                  {currentIndustry.competitors.map((comp) => (
                    <td key={comp} className="text-center py-3 px-4">
                      <FeatureValue value={feature.competitors[comp]} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Two Column Layout: USPs and Missing Features */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Unique Selling Points */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-[#34D399]/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-[#34D399]" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[#EDE9FE]">¿Qué nos hace mejores?</h3>
              <p className="text-xs text-[#9D7BEA]">Diferenciadores competitivos</p>
            </div>
          </div>
          <div className="space-y-2 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
            {currentIndustry.usps.map((usp, index) => (
              <USPCard key={index} text={usp} index={index} />
            ))}
          </div>
        </div>

        {/* What We Don't Have (Be Honest) */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-[#F87171]/10 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-[#F87171]" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[#EDE9FE]">Lo que NO tenemos (aún)</h3>
              <p className="text-xs text-[#9D7BEA]">Transparencia para el equipo de ventas</p>
            </div>
          </div>
          <div className="space-y-2">
            {currentIndustry.missing.map((item, index) => (
              <MissingFeatureCard key={index} text={item} />
            ))}
          </div>
          <div className="mt-4 p-3 rounded-lg bg-[rgba(108,63,206,0.05)] border border-[rgba(167,139,250,0.1)]">
            <p className="text-xs text-[#9D7BEA]">
              <Lightbulb className="w-4 h-4 inline mr-1 text-[#F0B429]" />
              Tip: Si el cliente pregunta por estas features, mencionar que están en el roadmap y ofrecer timeline estimado.
            </p>
          </div>
        </div>
      </div>

      {/* Price Comparison */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#F0B429]/10 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-[#F0B429]" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[#EDE9FE]">Comparación de Precios</h3>
              <p className="text-xs text-[#9D7BEA]">Precios mensuales aproximados</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-[#9D7BEA]">Nuestro precio</p>
            <p className="text-2xl font-bold text-[#F0B429]" style={{ fontFamily: 'var(--font-dm-mono)' }}>
              {currentIndustry.aethelPrice}
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {currentIndustry.priceComparison.map((item, index) => (
            <PriceBar 
              key={index} 
              {...item} 
              isAETHEL OS={item.name === 'AETHEL OS'}
            />
          ))}
        </div>

        <div className="mt-6 p-4 rounded-lg bg-[rgba(52,211,153,0.05)] border border-[rgba(52,211,153,0.2)]">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-[#34D399] flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-[#EDE9FE]">Argumento de valor clave</p>
              <p className="text-sm text-[#9D7BEA] mt-1">
                AETHEL OS incluye más features locales relevantes para el Caribe que cualquier competidor internacional, 
                a una fracción del precio y con soporte en español.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Sales Scripts / Talking Points */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-[#22D3EE]/10 flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-[#22D3EE]" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-[#EDE9FE]">Guiones de Venta</h3>
            <p className="text-xs text-[#9D7BEA]">Frases probadas para conversaciones</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {[
            {
              scenario: 'Cuando preguntan por precio',
              script: `"AETHEL OS cuesta ${currentIndustry.aethelPrice}/mes, pero incluye features que los competidores internacionales no tienen: pagos locales, WhatsApp, y soporte en español. Con ellos, terminas pagando más por menos."`
            },
            {
              scenario: 'Cuando mencionan competencia',
              script: `"¿Usas [competidor]? Excelente elección... si estás en Estados Unidos. Para el Caribe, AETHEL OS está diseñado específicamente para nuestras leyes, moneda y forma de hacer negocios."`
            },
            {
              scenario: 'Objeción: "Ya tenemos sistema"',
              script: `"Entiendo. Muchos clientes también tenían sistemas que 'funcionaban'. Lo que descubrieron es que AETHEL OS les ahorró horas semanales con automatizaciones que no sabían que necesitaban."`
            },
            {
              scenario: 'Cierre de conversación',
              script: `"Te puedo dar acceso a una demo gratuita por 14 días, sin compromiso. Así ves por ti mismo cómo AETHEL OS se adapta a tu negocio específico."`
            }
          ].map((item, index) => (
            <div 
              key={index} 
              className="p-4 rounded-lg bg-[rgba(108,63,206,0.05)] border border-[rgba(167,139,250,0.1)] cursor-pointer hover:border-[rgba(167,139,250,0.3)] transition-all group"
              onClick={() => handleCopyFact(item.script)}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-[#F0B429]">{item.scenario}</span>
                <Copy className={`w-4 h-4 ${copiedFact === item.script ? 'text-[#34D399]' : 'text-[#9D7BEA] group-hover:text-[#EDE9FE]'} transition-colors`} />
              </div>
              <p className="text-sm text-[#9D7BEA]">{item.script}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Contact & Resources */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="glass-card p-4">
          <div className="flex items-center gap-3">
            <Phone className="w-5 h-5 text-[#34D399]" />
            <div>
              <p className="text-sm font-medium text-[#EDE9FE]">Soporte Técnico</p>
              <p className="text-xs text-[#9D7BEA]">+1 868-XXX-XXXX</p>
            </div>
          </div>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-3">
            <Globe className="w-5 h-5 text-[#22D3EE]" />
            <div>
              <p className="text-sm font-medium text-[#EDE9FE]">Documentación</p>
              <p className="text-xs text-[#9D7BEA]">docs.aethel.tt</p>
            </div>
          </div>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-3">
            <MapPin className="w-5 h-5 text-[#F0B429]" />
            <div>
              <p className="text-sm font-medium text-[#EDE9FE]">Oficina Principal</p>
              <p className="text-xs text-[#9D7BEA]">Port of Spain, Trinidad</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CompetitiveAnalysis;
