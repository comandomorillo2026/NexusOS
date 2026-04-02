'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Heart, Activity } from 'lucide-react';

// Simple Nurse Dashboard
function NurseDashboard() {
  return (
    <div className="p-6 space-y-6">
      <div className="glass-card p-6">
        <h2 className="text-2xl font-bold text-[#EDE9FE] mb-2">Portal de Enfermería</h2>
        <p className="text-[#9D7BEA]">Sistema de gestión para cuidados de enfermería</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Pacientes Asignados', value: '5', color: '#6C3FCE' },
          { label: 'Tareas Pendientes', value: '8', color: '#F0B429' },
          { label: 'Medicamentos', value: '12', color: '#22D3EE' },
          { label: 'Turno Restante', value: '6:30', color: '#34D399' },
        ].map((stat, i) => (
          <div key={i} className="glass-card p-4">
            <p className="text-sm text-[#9D7BEA]">{stat.label}</p>
            <p className="text-2xl font-bold text-[#EDE9FE] mt-1" style={{ color: stat.color }}>{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: 'Activity' },
  { id: 'patients', label: 'Pacientes', icon: 'Users' },
  { id: 'tasks', label: 'Tareas', icon: 'ClipboardList' },
  { id: 'medications', label: 'Medicamentos', icon: 'Pill' },
  { id: 'vitals', label: 'Signos Vitales', icon: 'Heart' },
  { id: 'notes', label: 'Notas', icon: 'FileText' },
  { id: 'settings', label: 'Configuración', icon: 'Settings' },
];

export default function NursePage() {
  const [activeModule, setActiveModule] = useState('dashboard');

  return (
    <DashboardLayout
      title="NexusOS Nurse"
      subtitle="Portal de Enfermería"
      menuItems={menuItems}
      activeModule={activeModule}
      onModuleChange={setActiveModule}
      primaryColor="#34D399"
      secondaryColor="#22D3EE"
    >
      <NurseDashboard />
    </DashboardLayout>
  );
}
