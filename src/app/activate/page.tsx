'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import {
  Zap,
  Crown,
  Shield,
  CreditCard,
  Clock,
  Check,
  ArrowRight,
  AlertTriangle,
  Sparkles,
  Calendar
} from 'lucide-react';

export default function ActivatePage() {
  const [selectedPlan, setSelectedPlan] = useState('growth');
  const [selectedCycle, setSelectedCycle] = useState('monthly');
  const [processing, setProcessing] = useState(false);

  // Plans data
  const plans = [
    { 
      slug: 'starter', 
      name: 'Starter', 
      price: 250, 
      icon: Zap, 
      color: '#22D3EE',
      features: ['5 Usuarios', '1 Sede', 'Soporte Email', 'Reportes Básicos']
    },
    { 
      slug: 'growth', 
      name: 'Growth', 
      price: 500, 
      icon: Crown, 
      color: '#F59E0B',
      features: ['15 Usuarios', '3 Sedes', 'Soporte Prioritario', 'Reportes Avanzados', 'API Access'],
      popular: true
    },
    { 
      slug: 'premium', 
      name: 'Premium', 
      price: 1000, 
      icon: Shield, 
      color: '#A855F7',
      features: ['Usuarios Ilimitados', 'Sedes Ilimitadas', 'Soporte 24/7', 'Personalizaciones', 'Integraciones', 'SLA Garantizado']
    },
  ];

  // Billing cycles
  const billingCycles = [
    { slug: 'monthly', name: 'Mensual', discount: 0 },
    { slug: 'annual', name: 'Anual', discount: 10 },
    { slug: 'biannual', name: 'Bienal', discount: 20 },
  ];

  // Get selected plan and cycle
  const plan = plans.find(p => p.slug === selectedPlan)!;
  const cycle = billingCycles.find(c => c.slug === selectedCycle)!;
  const basePrice = plan.price;
  const discount = cycle.discount;
  const finalPrice = basePrice * (1 - discount / 100);
  const activationFee = 0; // No activation fee for trial conversion

  // Handle activation
  const handleActivate = async () => {
    setProcessing(true);
    
    // Redirect to checkout
    window.location.href = `/checkout?plan=${selectedPlan}&cycle=${selectedCycle}`;
  };

  return (
    <div className="min-h-screen bg-[var(--obsidian-1)] py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-full bg-[var(--nexus-gold)]/20 flex items-center justify-center mx-auto mb-6">
            <Clock className="w-10 h-10 text-[var(--nexus-gold)]" />
          </div>
          
          <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">
            Tu Período de Prueba Ha Expirado
          </h1>
          <p className="text-[var(--text-mid)] max-w-md mx-auto">
            El período de prueba de 7 días ha terminado. Activa tu plan para continuar 
            usando AETHEL OS con todos tus datos intactos.
          </p>
        </div>

        {/* Trial Benefits */}
        <div className="p-4 rounded-xl bg-[var(--nexus-violet)]/10 border border-[var(--nexus-violet)]/30 mb-8">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-[var(--nexus-violet-lite)]" />
            <div>
              <p className="text-[var(--nexus-violet-lite)] font-medium">
                ¡Gracias por probar AETHEL OS!
              </p>
              <p className="text-sm text-[var(--text-mid)]">
                Todos tus datos están guardados y listos. Activa ahora y continúa justo donde lo dejaste.
              </p>
            </div>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {plans.map((plan) => {
            const Icon = plan.icon;
            const isSelected = selectedPlan === plan.slug;
            
            return (
              <button
                key={plan.slug}
                onClick={() => setSelectedPlan(plan.slug)}
                className={`relative p-6 rounded-xl border transition-all text-left ${
                  isSelected 
                    ? 'border-[var(--nexus-violet)] bg-[var(--nexus-violet)]/10' 
                    : 'border-[var(--glass-border)] bg-[var(--glass)] hover:border-[var(--nexus-violet)]/50'
                }`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 bg-[var(--nexus-gold)] text-black text-xs">
                    Más Popular
                  </Badge>
                )}
                
                <div className="flex items-center gap-3 mb-4">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${plan.color}20` }}
                  >
                    <Icon className="w-6 h-6" style={{ color: plan.color }} />
                  </div>
                  <div>
                    <p className="text-[var(--text-primary)] font-semibold text-lg">{plan.name}</p>
                    <p className="text-2xl font-bold text-[var(--text-primary)]">
                      TT${plan.price}
                      <span className="text-sm font-normal text-[var(--text-dim)]">/mes</span>
                    </p>
                  </div>
                </div>
                
                <ul className="space-y-2">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-[var(--text-mid)]">
                      <Check className="w-4 h-4 text-[var(--success)]" />
                      {feature}
                    </li>
                  ))}
                </ul>

                {isSelected && (
                  <div className="mt-4 pt-4 border-t border-[var(--glass-border)]">
                    <div className="flex items-center gap-2 text-[var(--nexus-violet-lite)]">
                      <Check className="w-4 h-4" />
                      <span className="text-sm font-medium">Plan seleccionado</span>
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Billing Cycle */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
            Ciclo de Facturación
          </h3>
          <div className="grid grid-cols-3 gap-4">
            {billingCycles.map((cycle) => (
              <button
                key={cycle.slug}
                onClick={() => setSelectedCycle(cycle.slug)}
                className={`p-4 rounded-xl border transition-all ${
                  selectedCycle === cycle.slug 
                    ? 'border-[var(--nexus-violet)] bg-[var(--nexus-violet)]/10' 
                    : 'border-[var(--glass-border)] bg-[var(--glass)] hover:border-[var(--nexus-violet)]/50'
                }`}
              >
                <p className="text-[var(--text-primary)] font-medium">{cycle.name}</p>
                {cycle.discount > 0 && (
                  <p className="text-sm text-[var(--success)]">-{cycle.discount}% descuento</p>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="p-6 rounded-xl bg-[var(--glass)] border border-[var(--glass-border)] mb-8">
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
            Resumen del Pedido
          </h3>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-[var(--text-mid)]">Plan {plan.name}</span>
              <span className="text-[var(--text-primary)]">TT${basePrice}/mes</span>
            </div>
            
            {discount > 0 && (
              <div className="flex justify-between text-[var(--success)]">
                <span>Descuento ({cycle.name})</span>
                <span>-{discount}%</span>
              </div>
            )}
            
            <div className="flex justify-between">
              <span className="text-[var(--text-mid)]">Fee de Activación</span>
              <span className="text-[var(--success)]">GRATIS</span>
            </div>
            
            <div className="border-t border-[var(--glass-border)] pt-3">
              <div className="flex justify-between items-center">
                <span className="text-[var(--text-primary)] font-bold text-lg">Total a Pagar</span>
                <span className="text-3xl font-bold text-[var(--nexus-gold)]">
                  TT${finalPrice.toFixed(0)}
                </span>
              </div>
              <p className="text-xs text-[var(--text-dim)] text-right mt-1">
                {cycle.slug === 'monthly' ? 'Cobrado mensualmente' : 
                 cycle.slug === 'annual' ? 'Cobrado anualmente' : 'Cobrado cada 2 años'}
              </p>
            </div>
          </div>
        </div>

        {/* Payment Method Selection */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          {/* WiPay */}
          <button className="p-6 rounded-xl border border-[var(--glass-border)] bg-[var(--glass)] hover:border-[var(--nexus-violet)]/50 transition-all text-left">
            <div className="flex items-center gap-4 mb-3">
              <div className="w-12 h-12 rounded-lg bg-[#6366F1]/20 flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-[#6366F1]" />
              </div>
              <div>
                <p className="text-[var(--text-primary)] font-semibold">WiPay Caribbean</p>
                <p className="text-sm text-[var(--text-mid)]">Tarjeta de crédito/débito</p>
              </div>
            </div>
            <p className="text-xs text-[var(--text-dim)]">
              Acepta tarjetas Visa, Mastercard y más. Procesamiento seguro en el Caribe.
            </p>
          </button>

          {/* Bank Transfer */}
          <button className="p-6 rounded-xl border border-[var(--glass-border)] bg-[var(--glass)] hover:border-[var(--nexus-violet)]/50 transition-all text-left">
            <div className="flex items-center gap-4 mb-3">
              <div className="w-12 h-12 rounded-lg bg-[var(--nexus-gold)]/20 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-[var(--nexus-gold)]" />
              </div>
              <div>
                <p className="text-[var(--text-primary)] font-semibold">Transferencia Bancaria</p>
                <p className="text-sm text-[var(--text-mid)]">Pago manual</p>
              </div>
            </div>
            <p className="text-xs text-[var(--text-dim)]">
              Transferencia directa a nuestra cuenta. Activación en 24-48 horas hábiles.
            </p>
          </button>
        </div>

        {/* Activate Button */}
        <Button
          onClick={handleActivate}
          disabled={processing}
          className="w-full py-6 text-lg bg-gradient-to-r from-[var(--nexus-violet)] to-[var(--nexus-fuchsia)] text-white"
        >
          {processing ? (
            <>
              <span className="animate-pulse">Procesando...</span>
            </>
          ) : (
            <>
              <CreditCard className="w-5 h-5 mr-2" />
              Activar Plan {plan.name} - TT${finalPrice.toFixed(0)}
              <ArrowRight className="w-5 h-5 ml-2" />
            </>
          )}
        </Button>

        {/* Terms */}
        <p className="text-center text-xs text-[var(--text-dim)] mt-4">
          Al activar, aceptas nuestros{' '}
          <Link href="/terms" className="text-[var(--nexus-violet-lite)] hover:underline">
            Términos y Condiciones
          </Link>
          . Puedes cancelar en cualquier momento.
        </p>

        {/* Contact Support */}
        <div className="mt-8 p-4 rounded-xl bg-[var(--glass)] border border-[var(--glass-border)]">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-[var(--nexus-gold)]" />
            <div>
              <p className="text-[var(--text-primary)] font-medium">¿Necesitas ayuda?</p>
              <p className="text-sm text-[var(--text-mid)]">
                Contacta a soporte: <a href="mailto:support@nexusos.tt" className="text-[var(--nexus-violet-lite)]">support@nexusos.tt</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
