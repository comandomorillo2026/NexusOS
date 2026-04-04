'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Shield, 
  ArrowRight, 
  Users, 
  Building2, 
  Clock,
  CreditCard,
  Stethoscope,
  Heart,
  Scale,
  Scissors,
  Menu,
  X,
  ChevronRight,
  Zap,
  Globe,
  Sun,
  Moon,
  Languages
} from 'lucide-react';
import { useTheme } from '@/contexts/theme-context';

// ============================================
// NEXUSOS - OFICINA CENTRAL (Página Principal)
// ============================================

export default function OficinaCentral() {
  const [showLogin, setShowLogin] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, toggleTheme, language, toggleLanguage } = useTheme();

  const t = {
    es: {
      heroTitle: 'Tu negocio,',
      heroHighlight: 'simplificado',
      heroDesc: 'AETHEL OS es la plataforma de gestión empresarial diseñada para negocios del Caribe. Clínicas, salones de belleza, bufetes de abogados y más — todos desde un solo lugar.',
      exploreProducts: 'Explorar Productos',
      haveAccount: 'Ya tengo cuenta',
      login: 'Iniciar Sesión',
      whoWeAre: '¿Quiénes Somos?',
      whoWeAreDesc: 'Somos un equipo del Caribe que entiende las necesidades únicas de los negocios locales.',
      madeForCaribbean: 'Hecho para el Caribe',
      madeForCaribbeanDesc: 'Diseñado para Trinidad & Tobago, Guyana, Barbados y toda la región. Precios en TT$, soporte local.',
      allInOne: 'Todo en Uno',
      allInOneDesc: 'Citas, facturación, inventario, reportes y más. Un solo sistema que reemplaza múltiples herramientas.',
      realSupport: 'Soporte Real',
      realSupportDesc: 'Equipo de soporte local que entiende tu negocio. Personas reales, no bots.',
      ourSolutions: 'Nuestras Soluciones',
      ourSolutionsDesc: 'Cada industria tiene necesidades únicas. Nuestras soluciones están diseñadas específicamente para cada sector.',
      clinics: 'Clínicas',
      clinicsDesc: 'Pacientes, citas, facturación, recetas, laboratorio',
      nursing: 'Enfermería',
      nursingDesc: 'Portal de enfermería incluido con cada clínica',
      lawFirms: 'Bufetes de Abogados',
      lawFirmsDesc: 'Casos, clientes, documentos, facturación de tiempo',
      beautySalons: 'Salones de Belleza',
      beautySalonsDesc: 'Citas, POS, inventario, contabilidad',
      seeMore: 'Ver más',
      readyCTA: '¿Listo para transformar tu negocio?',
      readyCTADesc: 'Visita nuestro Portal de Ventas para ver planes, precios detallados, características y solicitar tu demo gratuita.',
      goToSalesPortal: 'Ir al Portal de Ventas',
      salesPortal: 'Portal de Ventas',
      products: 'Productos',
      industries: 'Industrias',
      platform: 'Plataforma #1 del Caribe',
      footerTag: 'Sistema de gestión empresarial para el Caribe.',
      access: 'Acceso',
      viewPlans: 'Ver Planes',
      prices: 'Precios',
      noAccount: '¿No tienes cuenta?',
      requestDemo: 'Solicita tu demo aquí',
      wrongCredentials: 'Credenciales incorrectas. Si no tienes acceso, solicita tu demo en el portal.',
      verifying: 'Verificando...',
      accessWorkspace: 'Accede a tu espacio de trabajo',
      email: 'Email',
      password: 'Contraseña',
      deployedIn: 'Desplegado en',
      copyright: '© 2024 AETHEL OS. Todos los derechos reservados. Hecho con ❤️ en Trinidad & Tobago 🇹🇹'
    },
    en: {
      heroTitle: 'Your business,',
      heroHighlight: 'simplified',
      heroDesc: 'AETHEL OS is the business management platform designed for Caribbean businesses. Clinics, beauty salons, law firms and more — all from one place.',
      exploreProducts: 'Explore Products',
      haveAccount: 'I have an account',
      login: 'Log In',
      whoWeAre: 'Who We Are',
      whoWeAreDesc: 'We are a Caribbean team that understands the unique needs of local businesses.',
      madeForCaribbean: 'Made for the Caribbean',
      madeForCaribbeanDesc: 'Designed for Trinidad & Tobago, Guyana, Barbados and the entire region. Prices in TT$, local support.',
      allInOne: 'All in One',
      allInOneDesc: 'Appointments, billing, inventory, reports and more. One system that replaces multiple tools.',
      realSupport: 'Real Support',
      realSupportDesc: 'Local support team that understands your business. Real people, not bots.',
      ourSolutions: 'Our Solutions',
      ourSolutionsDesc: 'Each industry has unique needs. Our solutions are specifically designed for each sector.',
      clinics: 'Clinics',
      clinicsDesc: 'Patients, appointments, billing, prescriptions, laboratory',
      nursing: 'Nursing',
      nursingDesc: 'Nursing portal included with each clinic',
      lawFirms: 'Law Firms',
      lawFirmsDesc: 'Cases, clients, documents, time billing',
      beautySalons: 'Beauty Salons',
      beautySalonsDesc: 'Appointments, POS, inventory, accounting',
      seeMore: 'See more',
      readyCTA: 'Ready to transform your business?',
      readyCTADesc: 'Visit our Sales Portal to see plans, detailed pricing, features and request your free demo.',
      goToSalesPortal: 'Go to Sales Portal',
      salesPortal: 'Sales Portal',
      products: 'Products',
      industries: 'Industries',
      platform: '#1 Platform in the Caribbean',
      footerTag: 'Business management system for the Caribbean.',
      access: 'Access',
      viewPlans: 'View Plans',
      prices: 'Pricing',
      noAccount: "Don't have an account?",
      requestDemo: 'Request your demo here',
      wrongCredentials: 'Invalid credentials. If you don\'t have access, request your demo in the portal.',
      verifying: 'Verifying...',
      accessWorkspace: 'Access your workspace',
      email: 'Email',
      password: 'Password',
      deployedIn: 'Deployed in',
      copyright: '© 2024 AETHEL OS. All rights reserved. Made with ❤️ in Trinidad & Tobago 🇹🇹'
    }
  };

  const currentT = t[language];

  return (
    <div className={`min-h-screen transition-colors duration-300 ${theme === 'dark' ? 'bg-[#050410]' : 'bg-gray-50'}`}>
      {/* Aurora Background */}
      <div className="aurora-bg" />
      
      {/* Header */}
      <header className={`relative z-50 border-b transition-colors duration-300 ${theme === 'dark' ? 'border-[rgba(167,139,250,0.1)] bg-[#0A0820]/80' : 'border-gray-200 bg-white/80'} backdrop-blur-xl sticky top-0`}>
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6C3FCE] to-[#C026D3] flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className={`text-xl font-bold transition-colors ${theme === 'dark' ? 'text-[#EDE9FE]' : 'text-gray-900'}`} style={{ fontFamily: 'var(--font-cormorant)' }}>
                AETHEL OS
              </h1>
              <p className={`text-xs transition-colors ${theme === 'dark' ? 'text-[#9D7BEA]' : 'text-gray-500'}`}>
                {language === 'es' ? 'Sistema de Gestión Empresarial' : 'Business Management System'}
              </p>
            </div>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <a href="#quienes-somos" className={`text-sm transition-colors ${theme === 'dark' ? 'text-[#9D7BEA] hover:text-[#EDE9FE]' : 'text-gray-600 hover:text-gray-900'}`}>
              {currentT.whoWeAre}
            </a>
            <a href="#productos" className={`text-sm transition-colors ${theme === 'dark' ? 'text-[#9D7BEA] hover:text-[#EDE9FE]' : 'text-gray-600 hover:text-gray-900'}`}>
              {currentT.products}
            </a>
            <a href="#industrias" className={`text-sm transition-colors ${theme === 'dark' ? 'text-[#9D7BEA] hover:text-[#EDE9FE]' : 'text-gray-600 hover:text-gray-900'}`}>
              {currentT.industries}
            </a>
            <Link href="/portal" className="text-sm font-medium text-[#F0B429] hover:text-[#EDE9FE] transition-colors">
              {currentT.salesPortal}
            </Link>
          </nav>
          
          {/* Right Side: Language, Theme, Auth */}
          <div className="flex items-center gap-2">
            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                theme === 'dark' 
                  ? 'bg-[rgba(108,63,206,0.2)] text-[#EDE9FE] hover:bg-[rgba(108,63,206,0.3)]' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              title={language === 'es' ? 'Switch to English' : 'Cambiar a Español'}
            >
              <Languages className="w-4 h-4" />
              <span>{language === 'es' ? 'ES' : 'EN'}</span>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-all ${
                theme === 'dark' 
                  ? 'bg-[rgba(108,63,206,0.2)] text-[#FBBF24] hover:bg-[rgba(108,63,206,0.3)]' 
                  : 'bg-gray-100 text-[#F97316] hover:bg-gray-200'
              }`}
              title={theme === 'dark' ? (language === 'es' ? 'Modo Claro' : 'Light Mode') : (language === 'es' ? 'Modo Oscuro' : 'Dark Mode')}
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Login Button */}
            <button
              onClick={() => setShowLogin(true)}
              className={`hidden sm:block px-4 py-2 rounded-lg text-sm transition-all ${
                theme === 'dark' 
                  ? 'border border-[rgba(167,139,250,0.2)] text-[#9D7BEA] hover:bg-[rgba(108,63,206,0.1)]' 
                  : 'border border-gray-300 text-gray-700 hover:bg-gray-100'
              }`}
            >
              {currentT.login}
            </button>

            <Link
              href="/portal"
              className="hidden sm:flex px-4 py-2 rounded-lg bg-gradient-to-r from-[#F0B429] to-[#d97706] text-white text-sm font-medium hover:opacity-90 transition-opacity"
            >
              {currentT.exploreProducts}
            </Link>
            
            {/* Mobile Menu Button */}
            <button 
              className={`md:hidden ${theme === 'dark' ? 'text-[#9D7BEA]' : 'text-gray-600'}`}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className={`md:hidden border-t transition-colors ${theme === 'dark' ? 'border-[rgba(167,139,250,0.1)] bg-[#0A0820]/95' : 'border-gray-200 bg-white/95'} backdrop-blur-xl`}>
            <nav className="flex flex-col p-4 gap-3">
              <a href="#quienes-somos" className={`py-2 transition-colors ${theme === 'dark' ? 'text-[#9D7BEA] hover:text-[#EDE9FE]' : 'text-gray-600 hover:text-gray-900'}`}>
                {currentT.whoWeAre}
              </a>
              <a href="#productos" className={`py-2 transition-colors ${theme === 'dark' ? 'text-[#9D7BEA] hover:text-[#EDE9FE]' : 'text-gray-600 hover:text-gray-900'}`}>
                {currentT.products}
              </a>
              <a href="#industrias" className={`py-2 transition-colors ${theme === 'dark' ? 'text-[#9D7BEA] hover:text-[#EDE9FE]' : 'text-gray-600 hover:text-gray-900'}`}>
                {currentT.industries}
              </a>
              <Link href="/portal" className="text-[#F0B429] py-2">
                {currentT.salesPortal} →
              </Link>
              <div className="flex gap-2 mt-2">
                <button
                  onClick={toggleLanguage}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium ${
                    theme === 'dark' ? 'bg-[rgba(108,63,206,0.2)] text-[#EDE9FE]' : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {language === 'es' ? '🇪🇸 ES' : '🇬🇧 EN'}
                </button>
                <button
                  onClick={toggleTheme}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium ${
                    theme === 'dark' ? 'bg-[rgba(108,63,206,0.2)] text-[#FBBF24]' : 'bg-gray-100 text-[#F97316]'
                  }`}
                >
                  {theme === 'dark' ? (language === 'es' ? '☀️ Claro' : '☀️ Light') : (language === 'es' ? '🌙 Oscuro' : '🌙 Dark')}
                </button>
              </div>
              <button
                onClick={() => setShowLogin(true)}
                className={`mt-2 px-4 py-3 rounded-lg text-center ${
                  theme === 'dark' 
                    ? 'border border-[rgba(167,139,250,0.2)] text-[#9D7BEA]' 
                    : 'border border-gray-300 text-gray-700'
                }`}
              >
                {currentT.login}
              </button>
            </nav>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative z-10 py-16 md:py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[rgba(240,180,41,0.1)] border border-[#F0B429]/20 text-[#F0B429] text-sm mb-6">
                <Globe className="w-4 h-4" />
                <span>{currentT.platform}</span>
              </div>
              
              <h1 className={`text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight transition-colors ${theme === 'dark' ? 'text-[#EDE9FE]' : 'text-gray-900'}`} style={{ fontFamily: 'var(--font-cormorant)' }}>
                {currentT.heroTitle}<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F0B429] to-[#C026D3]">
                  {currentT.heroHighlight}
                </span>
              </h1>
              
              <p className={`text-lg mb-8 max-w-xl transition-colors ${theme === 'dark' ? 'text-[#9D7BEA]' : 'text-gray-600'}`}>
                {currentT.heroDesc}
              </p>
              
              <div className="flex flex-col sm:flex-row items-start gap-4">
                <Link
                  href="/portal"
                  className="px-8 py-4 rounded-xl bg-gradient-to-r from-[#F0B429] to-[#d97706] text-white font-semibold text-lg hover:opacity-90 transition-all flex items-center gap-2 shadow-lg shadow-[#F0B429]/20"
                >
                  {currentT.exploreProducts}
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <button
                  onClick={() => setShowLogin(true)}
                  className={`px-8 py-4 rounded-xl font-medium transition-all ${
                    theme === 'dark' 
                      ? 'border border-[rgba(167,139,250,0.3)] text-[#EDE9FE] hover:bg-[rgba(108,63,206,0.1)]' 
                      : 'border border-gray-300 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {currentT.haveAccount}
                </button>
              </div>
            </div>
            
            {/* Stats */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-[#6C3FCE]/20 to-[#C026D3]/20 rounded-3xl blur-3xl" />
              <div className={`relative p-6 rounded-2xl border transition-colors ${theme === 'dark' ? 'bg-[#0A0820] border-[rgba(167,139,250,0.2)]' : 'bg-white border-gray-200'}`}>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {[
                    { icon: Building2, value: '150+', label: language === 'es' ? 'Empresas Activas' : 'Active Companies', color: '#F0B429' },
                    { icon: Users, value: '500+', label: language === 'es' ? 'Usuarios' : 'Users', color: '#22D3EE' },
                    { icon: Clock, value: '99.9%', label: language === 'es' ? 'Disponibilidad' : 'Uptime', color: '#34D399' },
                    { icon: CreditCard, value: 'TT$', label: language === 'es' ? 'Precios Locales' : 'Local Prices', color: '#EC4899' }
                  ].map((stat, i) => (
                    <div key={i} className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-[rgba(108,63,206,0.05)] border border-[rgba(167,139,250,0.1)]' : 'bg-gray-50 border border-gray-100'}`}>
                      <stat.icon className="w-6 h-6 mb-2" style={{ color: stat.color }} />
                      <p className={`text-2xl font-bold transition-colors ${theme === 'dark' ? 'text-[#EDE9FE]' : 'text-gray-900'}`}>{stat.value}</p>
                      <p className={`text-sm transition-colors ${theme === 'dark' ? 'text-[#9D7BEA]' : 'text-gray-500'}`}>{stat.label}</p>
                    </div>
                  ))}
                </div>
                <div className="text-center">
                  <p className={`text-xs ${theme === 'dark' ? 'text-[rgba(167,139,250,0.5)]' : 'text-gray-400'}`}>{currentT.deployedIn}</p>
                  <p className={`text-sm ${theme === 'dark' ? 'text-[#9D7BEA]' : 'text-gray-600'}`}>Trinidad & Tobago 🇹🇹</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quiénes Somos */}
      <section id="quienes-somos" className={`relative z-10 py-16 px-4 ${theme === 'dark' ? 'bg-[rgba(108,63,206,0.03)]' : 'bg-gray-50'}`}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className={`text-3xl md:text-4xl font-bold mb-4 transition-colors ${theme === 'dark' ? 'text-[#EDE9FE]' : 'text-gray-900'}`} style={{ fontFamily: 'var(--font-cormorant)' }}>
              {currentT.whoWeAre}
            </h2>
            <p className={`max-w-2xl mx-auto transition-colors ${theme === 'dark' ? 'text-[#9D7BEA]' : 'text-gray-600'}`}>
              {currentT.whoWeAreDesc}
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Globe, title: currentT.madeForCaribbean, desc: currentT.madeForCaribbeanDesc },
              { icon: Zap, title: currentT.allInOne, desc: currentT.allInOneDesc },
              { icon: Users, title: currentT.realSupport, desc: currentT.realSupportDesc }
            ].map((item, index) => (
              <div key={index} className={`p-6 rounded-2xl transition-colors hover:border-[#F0B429]/30 ${theme === 'dark' ? 'bg-[rgba(108,63,206,0.05)] border border-[rgba(167,139,250,0.1)]' : 'bg-white border border-gray-200'}`}>
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#F0B429] to-[#d97706] flex items-center justify-center mb-4">
                  <item.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className={`text-xl font-semibold mb-2 transition-colors ${theme === 'dark' ? 'text-[#EDE9FE]' : 'text-gray-900'}`}>{item.title}</h3>
                <p className={theme === 'dark' ? 'text-[#9D7BEA]' : 'text-gray-600'}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Industrias */}
      <section id="industrias" className="relative z-10 py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className={`text-3xl md:text-4xl font-bold mb-4 transition-colors ${theme === 'dark' ? 'text-[#EDE9FE]' : 'text-gray-900'}`} style={{ fontFamily: 'var(--font-cormorant)' }}>
              {currentT.ourSolutions}
            </h2>
            <p className={`max-w-2xl mx-auto transition-colors ${theme === 'dark' ? 'text-[#9D7BEA]' : 'text-gray-600'}`}>
              {currentT.ourSolutionsDesc}
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Stethoscope, name: currentT.clinics, desc: currentT.clinicsDesc, color: '#22D3EE', href: '/portal?industry=clinic' },
              { icon: Heart, name: currentT.nursing, desc: currentT.nursingDesc, color: '#34D399', href: '/portal?industry=nurse' },
              { icon: Scale, name: currentT.lawFirms, desc: currentT.lawFirmsDesc, color: '#C4A35A', href: '/portal?industry=lawfirm' },
              { icon: Scissors, name: currentT.beautySalons, desc: currentT.beautySalonsDesc, color: '#EC4899', href: '/portal?industry=beauty' }
            ].map((industry, index) => (
              <Link 
                key={index} 
                href={industry.href}
                className={`p-6 rounded-2xl transition-all cursor-pointer group hover:scale-[1.02] ${
                  theme === 'dark' 
                    ? 'bg-[rgba(108,63,206,0.05)] border border-[rgba(167,139,250,0.1)] hover:border-[rgba(167,139,250,0.3)]' 
                    : 'bg-white border border-gray-200 hover:border-gray-300 hover:shadow-lg'
                }`}
              >
                <div 
                  className="w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
                  style={{ backgroundColor: `${industry.color}20` }}
                >
                  <industry.icon className="w-7 h-7" style={{ color: industry.color }} />
                </div>
                <h3 className={`font-semibold mb-2 transition-colors ${theme === 'dark' ? 'text-[#EDE9FE]' : 'text-gray-900'}`}>{industry.name}</h3>
                <p className={`text-sm mb-3 transition-colors ${theme === 'dark' ? 'text-[#9D7BEA]' : 'text-gray-500'}`}>{industry.desc}</p>
                <span className="text-xs text-[#F0B429] flex items-center gap-1 group-hover:gap-2 transition-all">
                  {currentT.seeMore} <ChevronRight className="w-3 h-3" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="productos" className="relative z-10 py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className={`p-8 md:p-12 rounded-3xl border transition-colors ${
            theme === 'dark' 
              ? 'bg-gradient-to-r from-[rgba(108,63,206,0.2)] to-[rgba(192,38,211,0.2)] border-[rgba(167,139,250,0.2)]' 
              : 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-100'
          }`}>
            <h2 className={`text-3xl md:text-4xl font-bold mb-4 transition-colors ${theme === 'dark' ? 'text-[#EDE9FE]' : 'text-gray-900'}`} style={{ fontFamily: 'var(--font-cormorant)' }}>
              {currentT.readyCTA}
            </h2>
            <p className={`mb-6 max-w-xl mx-auto transition-colors ${theme === 'dark' ? 'text-[#9D7BEA]' : 'text-gray-600'}`}>
              {currentT.readyCTADesc}
            </p>
            <Link
              href="/portal"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-[#F0B429] to-[#d97706] text-white font-semibold text-lg hover:opacity-90 transition-all shadow-lg shadow-[#F0B429]/20"
            >
              {currentT.goToSalesPortal}
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={`relative z-10 border-t py-8 px-4 transition-colors ${theme === 'dark' ? 'border-[rgba(167,139,250,0.1)] bg-[#0A0820]/50' : 'border-gray-200 bg-gray-50'}`}>
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6C3FCE] to-[#C026D3] flex items-center justify-center">
                  <Shield className="w-4 h-4 text-white" />
                </div>
                <span className={`font-bold transition-colors ${theme === 'dark' ? 'text-[#EDE9FE]' : 'text-gray-900'}`}>AETHEL OS</span>
              </div>
              <p className={`text-sm transition-colors ${theme === 'dark' ? 'text-[#9D7BEA]' : 'text-gray-500'}`}>
                {currentT.footerTag}
              </p>
            </div>
            <div>
              <h4 className={`font-semibold mb-3 transition-colors ${theme === 'dark' ? 'text-[#EDE9FE]' : 'text-gray-900'}`}>{currentT.products}</h4>
              <ul className={`space-y-2 text-sm ${theme === 'dark' ? 'text-[#9D7BEA]' : 'text-gray-500'}`}>
                <li><Link href="/portal?industry=clinic" className="hover:text-[#F0B429]">{currentT.clinics}</Link></li>
                <li><Link href="/portal?industry=lawfirm" className="hover:text-[#F0B429]">{currentT.lawFirms}</Link></li>
                <li><Link href="/portal?industry=beauty" className="hover:text-[#F0B429]">{currentT.beautySalons}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className={`font-semibold mb-3 transition-colors ${theme === 'dark' ? 'text-[#EDE9FE]' : 'text-gray-900'}`}>{currentT.salesPortal}</h4>
              <ul className={`space-y-2 text-sm ${theme === 'dark' ? 'text-[#9D7BEA]' : 'text-gray-500'}`}>
                <li><Link href="/portal" className="hover:text-[#F0B429]">{currentT.viewPlans}</Link></li>
                <li><Link href="/portal#pricing" className="hover:text-[#F0B429]">{currentT.prices}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className={`font-semibold mb-3 transition-colors ${theme === 'dark' ? 'text-[#EDE9FE]' : 'text-gray-900'}`}>{currentT.access}</h4>
              <ul className={`space-y-2 text-sm ${theme === 'dark' ? 'text-[#9D7BEA]' : 'text-gray-500'}`}>
                <li><button onClick={() => setShowLogin(true)} className="hover:text-[#F0B429]">{currentT.login}</button></li>
              </ul>
            </div>
          </div>
          <div className={`border-t pt-6 text-center ${theme === 'dark' ? 'border-[rgba(167,139,250,0.1)]' : 'border-gray-200'}`}>
            <p className={`text-sm ${theme === 'dark' ? 'text-[#9D7BEA]' : 'text-gray-500'}`}>
              {currentT.copyright}
            </p>
          </div>
        </div>
      </footer>

      {/* Login Modal */}
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} language={language} theme={theme} t={currentT} />}
    </div>
  );
}

// Login Modal Component
function LoginModal({ onClose, language, theme, t }: { 
  onClose: () => void; 
  language: 'es' | 'en'; 
  theme: 'dark' | 'light';
  t: ReturnType<typeof OficinaCentral> extends React.FC<infer P> ? P extends { t: infer T } ? T : never : never;
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    setTimeout(() => {
      if (email === 'admin@nexusos.tt' && password === 'admin123') {
        window.location.href = '/admin';
      } else if (email === 'clinic@demo.tt' && password === 'demo123') {
        window.location.href = '/clinic';
      } else if (email === 'lawfirm@demo.tt' && password === 'demo123') {
        window.location.href = '/lawfirm';
      } else if (email === 'beauty@demo.tt' && password === 'demo123') {
        window.location.href = '/beauty';
      } else if (email === 'nurse@demo.tt' && password === 'demo123') {
        window.location.href = '/nurse';
      } else if (email === 'bakery@demo.tt' && password === 'demo123') {
        window.location.href = '/bakery';
      } else {
        setError(t.wrongCredentials);
      }
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className={`relative w-full max-w-md p-6 rounded-2xl shadow-2xl transition-colors ${
        theme === 'dark' ? 'bg-[#0A0820] border border-[rgba(167,139,250,0.2)]' : 'bg-white border border-gray-200'
      }`}>
        <button 
          onClick={onClose}
          className={`absolute top-4 right-4 transition-colors ${theme === 'dark' ? 'text-[#9D7BEA] hover:text-[#EDE9FE]' : 'text-gray-400 hover:text-gray-600'}`}
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#6C3FCE] to-[#C026D3] flex items-center justify-center mx-auto mb-4">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <h3 className={`text-xl font-bold transition-colors ${theme === 'dark' ? 'text-[#EDE9FE]' : 'text-gray-900'}`}>
            {t.login}
          </h3>
          <p className={`text-sm mt-1 transition-colors ${theme === 'dark' ? 'text-[#9D7BEA]' : 'text-gray-500'}`}>
            {t.accessWorkspace}
          </p>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-[#F87171]/10 border border-[#F87171]/20 text-[#F87171] text-sm">
              {error}
            </div>
          )}
          
          <div className="space-y-2">
            <label className={`text-sm transition-colors ${theme === 'dark' ? 'text-[#9D7BEA]' : 'text-gray-600'}`}>
              {t.email}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full px-4 py-3 rounded-lg transition-colors focus:border-[#6C3FCE] focus:outline-none ${
                theme === 'dark' 
                  ? 'bg-[rgba(108,63,206,0.07)] border border-[rgba(167,139,250,0.2)] text-[#EDE9FE] placeholder-[rgba(167,139,250,0.3)]' 
                  : 'bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400'
              }`}
              placeholder="tu@email.com"
              required
            />
          </div>
          
          <div className="space-y-2">
            <label className={`text-sm transition-colors ${theme === 'dark' ? 'text-[#9D7BEA]' : 'text-gray-600'}`}>
              {t.password}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full px-4 py-3 rounded-lg transition-colors focus:border-[#6C3FCE] focus:outline-none ${
                theme === 'dark' 
                  ? 'bg-[rgba(108,63,206,0.07)] border border-[rgba(167,139,250,0.2)] text-[#EDE9FE] placeholder-[rgba(167,139,250,0.3)]' 
                  : 'bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400'
              }`}
              placeholder="••••••••"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg bg-gradient-to-r from-[#6C3FCE] to-[#C026D3] text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? t.verifying : t.login}
          </button>
        </form>
        
        <div className={`text-center text-xs mt-6 ${theme === 'dark' ? 'text-[rgba(167,139,250,0.5)]' : 'text-gray-400'}`}>
          {t.noAccount}{' '}
          <Link href="/portal" className="text-[#F0B429] hover:underline">
            {t.requestDemo}
          </Link>
        </div>
      </div>
    </div>
  );
}
