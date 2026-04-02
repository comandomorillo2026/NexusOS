'use client';

import React, { useState } from 'react';
import { ClinicLayout } from '@/components/clinic/clinic-layout';
import { ClinicDashboard } from '@/components/clinic/clinic-dashboard';
import { useRouter } from 'next/navigation';

// Temporary placeholder components
const PlaceholderModule = ({ name }: { name: string }) => (
  <div className="p-8">
    <h2 className="text-2xl font-bold text-[#EDE9FE] mb-4">{name}</h2>
    <p className="text-[#9D7BEA]">Módulo en desarrollo...</p>
  </div>
);

export default function ClinicPage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const router = useRouter();

  const handleTabChange = (tab: string) => {
    if (tab === 'nurse') {
      router.push('/nurse');
    } else {
      setActiveTab(tab);
    }
  };

  const renderModule = () => {
    switch (activeTab) {
      case 'dashboard':
        return <ClinicDashboard />;
      case 'patients':
        return <PlaceholderModule name="Pacientes" />;
      case 'appointments':
        return <PlaceholderModule name="Citas" />;
      case 'billing':
        return <PlaceholderModule name="Facturación" />;
      case 'prescriptions':
        return <PlaceholderModule name="Recetas" />;
      case 'lab':
        return <PlaceholderModule name="Laboratorio" />;
      case 'inventory':
        return <PlaceholderModule name="Inventario" />;
      case 'reports':
        return <PlaceholderModule name="Reportes" />;
      case 'settings':
        return <PlaceholderModule name="Configuración" />;
      default:
        return <ClinicDashboard />;
    }
  };

  return (
    <ClinicLayout activeTab={activeTab} onTabChange={handleTabChange}>
      <div className="module-container" data-tab={activeTab}>
        {renderModule()}
      </div>
    </ClinicLayout>
  );
}
