'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
  { id: 'pos', label: 'Punto de Venta', icon: 'ShoppingCart' },
  { id: 'inventory', label: 'Inventario', icon: 'Package' },
  { id: 'prescriptions', label: 'Recetas', icon: 'ClipboardList' },
  { id: 'suppliers', label: 'Proveedores', icon: 'Truck' },
  { id: 'customers', label: 'Clientes', icon: 'Users' },
  { id: 'reports', label: 'Reportes', icon: 'BarChart3' },
  { id: 'settings', label: 'Configuración', icon: 'Settings' },
];

function PharmacyDashboard() {
  return (
    <div className="p-6 space-y-6">
      <div className="glass-card p-6">
        <h2 className="text-2xl font-bold text-[#EDE9FE] mb-2">Farmacia</h2>
        <p className="text-[#9D7BEA]">Sistema de gestión para farmacias</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Ventas Hoy', value: 'TT$12,450', color: '#10B981' },
          { label: 'Recetas', value: '87', color: '#3B82F6' },
          { label: 'Alertas Stock', value: '12', color: '#F59E0B' },
          { label: 'Clientes', value: '156', color: '#8B5CF6' },
        ].map((stat, i) => (
          <div key={i} className="glass-card p-4">
            <p className="text-sm text-[#9D7BEA]">{stat.label}</p>
            <p className="text-2xl font-bold text-[#EDE9FE] mt-1" style={{ color: stat.color }}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-[#EDE9FE] mb-4">Productos con Stock Bajo</h3>
        <div className="space-y-2">
          {['Amoxicilina 500mg', 'Ibuprofeno 400mg', 'Omeprazol 20mg'].map((product, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-[rgba(245,158,11,0.1)] rounded-lg">
              <span className="text-[#EDE9FE]">{product}</span>
              <span className="text-sm text-[#F59E0B]">Reordenar</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function PharmacyPage() {
  const [activeModule, setActiveModule] = useState('dashboard');

  const renderContent = () => {
    switch (activeModule) {
      case 'dashboard':
        return <PharmacyDashboard />;
      default:
        return <PharmacyDashboard />;
    }
  };

  return (
    <DashboardLayout
      title="NexusOS Pharmacy"
      subtitle="Sistema de Gestión para Farmacias"
      menuItems={menuItems}
      activeModule={activeModule}
      onModuleChange={setActiveModule}
      primaryColor="#10B981"
      secondaryColor="#34D399"
    >
      {renderContent()}
    </DashboardLayout>
  );
}
