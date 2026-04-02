'use client';

import React from 'react';
import Link from 'next/link';
import {
  Shield,
  Stethoscope,
  Scale,
  Scissors,
  Heart,
  ChefHat,
  Pill,
  Building2,
  ArrowRight
} from 'lucide-react';

// ============================================
// NEXUSOS - SELECTOR DE INDUSTRIAS SIN LOGIN
// ============================================

const WORKSPACES = [
  {
    id: 'admin',
    name: 'Torre de Control',
    description: 'Panel de administración general del sistema',
    icon: Shield,
    color: '#F0B429',
    href: '/admin'
  },
  {
    id: 'clinic',
    name: 'Clínica Médica',
    description: 'Gestión completa de clínicas y consultorios',
    icon: Stethoscope,
    color: '#22D3EE',
    href: '/clinic'
  },
  {
    id: 'lawfirm',
    name: 'Bufete de Abogados',
    description: 'Control de casos, clientes y documentos legales',
    icon: Scale,
    color: '#C4A35A',
    href: '/lawfirm'
  },
  {
    id: 'beauty',
    name: 'Salón de Belleza',
    description: 'Citas, servicios, inventario y clientes',
    icon: Scissors,
    color: '#EC4899',
    href: '/beauty'
  },
  {
    id: 'nurse',
    name: 'Enfermería',
    description: 'Cuidados de enfermería a domicilio',
    icon: Heart,
    color: '#34D399',
    href: '/nurse'
  },
  {
    id: 'bakery',
    name: 'Panadería',
    description: 'POS, catálogo, pedidos y producción',
    icon: ChefHat,
    color: '#F97316',
    href: '/bakery'
  },
  {
    id: 'pharmacy',
    name: 'Farmacia',
    description: 'Inventario, ventas y control de medicamentos',
    icon: Pill,
    color: '#8B5CF6',
    href: '/pharmacy'
  },
  {
    id: 'insurance',
    name: 'Aseguradora',
    description: 'Pólizas, reclamaciones y clientes',
    icon: Building2,
    color: '#3B82F6',
    href: '/insurance'
  }
];

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#050410]">
      {/* Aurora Background */}
      <div className="aurora-bg" />

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="border-b border-[rgba(167,139,250,0.1)] bg-[#0A0820]/80 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#6C3FCE] to-[#C026D3] flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[#EDE9FE]" style={{ fontFamily: 'var(--font-cormorant)' }}>
                  NexusOS
                </h1>
                <p className="text-sm text-[#9D7BEA]">Sistema de Gestión Empresarial</p>
              </div>
            </div>

            <Link
              href="/portal"
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#F0B429] to-[#d97706] text-white text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Portal de Ventas
            </Link>
          </div>
        </header>

        {/* Workspaces Grid */}
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-6xl">
            <div className="text-center mb-10">
              <h2 className="text-4xl font-bold text-[#EDE9FE] mb-4" style={{ fontFamily: 'var(--font-cormorant)' }}>
                Selecciona tu Espacio de Trabajo
              </h2>
              <p className="text-[#9D7BEA] text-lg">
                Acceso directo a todos los módulos del sistema
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {WORKSPACES.map((workspace) => {
                const IconComponent = workspace.icon;
                return (
                  <Link
                    key={workspace.id}
                    href={workspace.href}
                    className="group p-6 rounded-2xl bg-[rgba(14,12,31,0.7)] border border-[rgba(167,139,250,0.12)] hover:border-[rgba(167,139,250,0.3)] transition-all hover:scale-[1.02] backdrop-blur-sm"
                  >
                    <div
                      className="w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
                      style={{ backgroundColor: `${workspace.color}20` }}
                    >
                      <IconComponent className="w-7 h-7" style={{ color: workspace.color }} />
                    </div>
                    <h3 className="text-lg font-semibold text-[#EDE9FE] mb-1">{workspace.name}</h3>
                    <p className="text-sm text-[#9D7BEA] mb-4">{workspace.description}</p>
                    <div className="flex items-center gap-2 text-xs" style={{ color: workspace.color }}>
                      <span>Acceder</span>
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Quick Stats */}
            <div className="mt-10 flex justify-center gap-8 text-center">
              <div className="p-4 rounded-xl bg-[rgba(14,12,31,0.5)] border border-[rgba(167,139,250,0.1)]">
                <p className="text-3xl font-bold text-[#F0B429]">7+</p>
                <p className="text-sm text-[#9D7BEA]">Industrias</p>
              </div>
              <div className="p-4 rounded-xl bg-[rgba(14,12,31,0.5)] border border-[rgba(167,139,250,0.1)]">
                <p className="text-3xl font-bold text-[#22D3EE]">50+</p>
                <p className="text-sm text-[#9D7BEA]">Módulos</p>
              </div>
              <div className="p-4 rounded-xl bg-[rgba(14,12,31,0.5)] border border-[rgba(167,139,250,0.1)]">
                <p className="text-3xl font-bold text-[#EC4899]">TT$</p>
                <p className="text-sm text-[#9D7BEA]">Precios Locales</p>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-[rgba(167,139,250,0.1)] bg-[#0A0820]/50 py-4">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <p className="text-sm text-[rgba(167,139,250,0.5)]">
              © 2024 NexusOS. Hecho con ❤️ en Trinidad & Tobago 🇹🇹
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
