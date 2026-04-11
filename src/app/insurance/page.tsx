'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { InsuranceRoute } from '@/components/auth/protected-layout';
import {
  InsuranceDashboard,
  PolicyManagement,
  ClaimsManagement,
  ReinsuranceModule,
  ActuarialModule,
  RegulatoryCompliance,
  FraudDetection,
  AgentManagement,
  ProductsModule,
  AuditTrail,
  InsuranceSettings,
  LegacyIntegration,
} from '@/components/insurance';

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
  { id: 'policies', label: 'Pólizas', icon: 'Shield' },
  { id: 'claims', label: 'Reclamaciones', icon: 'FileText' },
  { id: 'reinsurance', label: 'Reaseguro', icon: 'RefreshCw' },
  { id: 'actuarial', label: 'Actuarial', icon: 'Calculator' },
  { id: 'regulatory', label: 'Regulatorio', icon: 'Scale' },
  { id: 'fraud', label: 'Fraude', icon: 'AlertTriangle' },
  { id: 'agents', label: 'Agentes', icon: 'Users' },
  { id: 'products', label: 'Productos', icon: 'Package' },
  { id: 'audit', label: 'Auditoría', icon: 'ClipboardCheck' },
  { id: 'integration', label: 'Integración', icon: 'Link' },
  { id: 'settings', label: 'Configuración', icon: 'Settings' },
];

function InsurancePageContent() {
  const [activeModule, setActiveModule] = useState('dashboard');

  const renderContent = () => {
    switch (activeModule) {
      case 'dashboard':
        return <InsuranceDashboard />;
      case 'policies':
        return <PolicyManagement />;
      case 'claims':
        return <ClaimsManagement />;
      case 'reinsurance':
        return <ReinsuranceModule />;
      case 'actuarial':
        return <ActuarialModule />;
      case 'regulatory':
        return <RegulatoryCompliance />;
      case 'fraud':
        return <FraudDetection />;
      case 'agents':
        return <AgentManagement />;
      case 'products':
        return <ProductsModule />;
      case 'audit':
        return <AuditTrail />;
      case 'integration':
        return <LegacyIntegration />;
      case 'settings':
        return <InsuranceSettings />;
      default:
        return <InsuranceDashboard />;
    }
  };

  return (
    <DashboardLayout
      title="AETHEL OS Insurance"
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

export default function InsurancePage() {
  return (
    <InsuranceRoute>
      <InsurancePageContent />
    </InsuranceRoute>
  );
}
