'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
  { id: 'policies', label: 'Pólizas', icon: 'Shield' },
  { id: 'claims', label: 'Reclamaciones', icon: 'FileText' },
  { id: 'clients', label: 'Clientes', icon: 'Users' },
  { id: 'products', label: 'Productos', icon: 'Package' },
  { id: 'billing', label: 'Facturación', icon: 'CreditCard' },
  { id: 'reports', label: 'Reportes', icon: 'BarChart3' },
  { id: 'settings', label: 'Configuración', icon: 'Settings' },
];

function InsuranceDashboard() {
  return (
    <div className="p-6 space-y-6">
      <div className="glass-card p-6">
        <h2 className="text-2xl font-bold text-[#EDE9FE] mb-2">Aseguradora</h2>
        <p className="text-[#9D7BEA]">Sistema de gestión para aseguradoras</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Pólizas Activas', value: '1,247', color: '#2563EB' },
          { label: 'Reclamaciones', value: '38', color: '#F59E0B' },
          { label: 'Primas Mes', value: 'TT$847K', color: '#10B981' },
          { label: 'Siniestros', value: 'TT$234K', color: '#8B5CF6' },
        ].map((stat, i) => (
          <div key={i} className="glass-card p-4">
            <p className="text-sm text-[#9D7BEA]">{stat.label}</p>
            <p className="text-2xl font-bold text-[#EDE9FE] mt-1" style={{ color: stat.color }}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-[#EDE9FE] mb-4">Tipos de Pólizas</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { type: 'Auto', count: 423 },
              { type: 'Hogar', count: 312 },
              { type: 'Salud', count: 389 },
              { type: 'Negocio', count: 123 },
            ].map((item, i) => (
              <div key={i} className="p-3 bg-[rgba(108,63,206,0.1)] rounded-lg text-center">
                <p className="text-xl font-bold text-[#EDE9FE]">{item.count}</p>
                <p className="text-sm text-[#9D7BEA]">{item.type}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-[#EDE9FE] mb-4">Reclamaciones Pendientes</h3>
          <div className="space-y-2">
            {[
              { name: 'María Santos', amount: 'TT$15,400' },
              { name: 'Carlos Mendoza', amount: 'TT$8,200' },
              { name: 'Ana Rodríguez', amount: 'TT$23,500' },
            ].map((claim, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-[rgba(245,158,11,0.1)] rounded-lg">
                <span className="text-[#EDE9FE]">{claim.name}</span>
                <span className="text-[#F59E0B] font-medium">{claim.amount}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function InsurancePage() {
  const [activeModule, setActiveModule] = useState('dashboard');

  const renderContent = () => {
    switch (activeModule) {
      case 'dashboard':
        return <InsuranceDashboard />;
      default:
        return <InsuranceDashboard />;
    }
  };

  return (
    <DashboardLayout
      title="NexusOS Insurance"
      subtitle="Sistema de Gestión para Aseguradoras"
      menuItems={menuItems}
      activeModule={activeModule}
      onModuleChange={setActiveModule}
      primaryColor="#2563EB"
      secondaryColor="#3B82F6"
    >
      {renderContent()}
    </DashboardLayout>
  );
}
