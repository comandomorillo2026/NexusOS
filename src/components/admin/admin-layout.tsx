'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { useTheme } from '@/contexts/theme-context';
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  CreditCard, 
  Settings, 
  LogOut,
  Bell,
  ChevronRight,
  Globe,
  DollarSign,
  Shield,
  Plus,
  Menu,
  X,
  Home,
  TrendingUp,
  Target,
  Sun,
  Moon,
  Database,
  FileText,
  Megaphone,
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
  activeTab?: string;
}

export function AdminLayout({ children, activeTab = 'dashboard' }: AdminLayoutProps) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme, language, toggleLanguage } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'orders', label: 'Órdenes', icon: CreditCard },
    { id: 'tenants', label: 'Inquilinos', icon: Building2 },
    { id: 'industries', label: 'Industrias', icon: Globe },
    { id: 'templates', label: 'Templates', icon: FileText },
    { id: 'broadcasts', label: 'Comunicados', icon: Megaphone },
    { id: 'competitive', label: 'Análisis Competitivo', icon: Target },
    { id: 'scalability', label: 'Escalabilidad', icon: TrendingUp },
    { id: 'database', label: 'Base de Datos', icon: Database },
    { id: 'users', label: 'Usuarios', icon: Users },
    { id: 'pricing', label: 'Precios', icon: DollarSign },
    { id: 'settings', label: 'Configuración', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-50
        w-72 bg-card border-r border-border 
        flex flex-col transform transition-transform duration-200
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Logo Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <Link href="/admin" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--nexus-gold)] to-[#d97706] flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-foreground" style={{ fontFamily: 'var(--font-cormorant)' }}>
                  NexusOS
                </h1>
                <p className="text-xs text-[var(--nexus-gold)]">Torre de Control</p>
              </div>
            </Link>
            <button 
              className="md:hidden text-muted-foreground"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 overflow-y-auto">
          {/* Main Navigation */}
          <div className="mb-4">
            <p className="text-xs font-medium text-muted-foreground uppercase px-3 mb-2">Principal</p>
            <ul className="space-y-1">
              {navItems.slice(0, 6).map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => {
                      // Handle tab navigation within admin dashboard
                      const event = new CustomEvent('adminTabChange', { detail: item.id });
                      window.dispatchEvent(event);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left ${
                      activeTab === item.id
                        ? 'bg-primary/10 text-primary border border-primary/20'
                        : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="text-sm">{item.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Tools & Analysis */}
          <div className="mb-4">
            <p className="text-xs font-medium text-muted-foreground uppercase px-3 mb-2">Herramientas</p>
            <ul className="space-y-1">
              {navItems.slice(6, 9).map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => {
                      const event = new CustomEvent('adminTabChange', { detail: item.id });
                      window.dispatchEvent(event);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left ${
                      activeTab === item.id
                        ? 'bg-primary/10 text-primary border border-primary/20'
                        : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="text-sm">{item.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Configuration */}
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase px-3 mb-2">Configuración</p>
            <ul className="space-y-1">
              {navItems.slice(9).map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => {
                      const event = new CustomEvent('adminTabChange', { detail: item.id });
                      window.dispatchEvent(event);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left ${
                      activeTab === item.id
                        ? 'bg-primary/10 text-primary border border-primary/20'
                        : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="text-sm">{item.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        {/* Quick Actions */}
        <div className="p-3 border-t border-border">
          <button
            onClick={() => {
              const event = new CustomEvent('adminTabChange', { detail: 'create-tenant' });
              window.dispatchEvent(event);
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-gradient-to-r from-[var(--nexus-gold)] to-[#d97706] text-white font-medium hover:opacity-90 transition-opacity"
          >
            <Plus className="w-5 h-5" />
            <span>Crear Inquilino</span>
          </button>
        </div>

        {/* User Profile */}
        <div className="p-3 border-t border-border">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--nexus-gold)] to-[var(--nexus-fuchsia)] flex items-center justify-center">
              <span className="text-white font-bold text-sm">{user?.name?.charAt(0) || 'A'}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{user?.name || 'Administrador'}</p>
              <p className="text-xs text-[var(--nexus-gold)]">Super Admin</p>
            </div>
            <div className="flex items-center gap-1">
              <Link 
                href="/" 
                className="p-2 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                title="Volver al inicio"
              >
                <Home className="w-4 h-4" />
              </Link>
              <button 
                onClick={logout} 
                className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                title="Cerrar sesión"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-14 bg-card/50 border-b border-border flex items-center justify-between px-4 md:px-6 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2 rounded-lg hover:bg-accent text-muted-foreground"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
            
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm">
              <Link href="/admin" className="text-muted-foreground hover:text-foreground">
                Torre de Control
              </Link>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
              <span className="text-foreground font-medium">
                {navItems.find(item => item.id === activeTab)?.label || 'Dashboard'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-accent transition-colors"
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? <Sun className="w-5 h-5 text-muted-foreground" /> : <Moon className="w-5 h-5 text-muted-foreground" />}
            </button>
            <button 
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-accent transition-colors text-sm"
              title={language === 'es' ? 'Switch to English' : 'Cambiar a Español'}
            >
              <Globe className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium text-muted-foreground">{language.toUpperCase()}</span>
            </button>
            <button className="relative p-2 rounded-lg hover:bg-accent transition-colors">
              <Bell className="w-5 h-5 text-muted-foreground" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[var(--nexus-gold)]" />
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 p-4 md:p-6 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
