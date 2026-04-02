"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";

const menuItems = [
  { id: "dashboard", label: "Dashboard", icon: "LayoutDashboard" },
  { id: "pos", label: "Punto de Venta", icon: "ShoppingCart" },
  { id: "products", label: "Productos", icon: "Package" },
  { id: "orders", label: "Pedidos", icon: "ClipboardList" },
  { id: "production", label: "Produccion", icon: "ChefHat" },
  { id: "customers", label: "Clientes", icon: "Users" },
  { id: "reports", label: "Reportes", icon: "BarChart3" },
  { id: "settings", label: "Configuracion", icon: "Settings" },
];

function BakeryDashboard() {
  return (
    <div className="p-6 space-y-6">
      <div className="glass-card p-6">
        <h2 className="text-2xl font-bold text-[#EDE9FE] mb-2">Panadería</h2>
        <p className="text-[#9D7BEA]">Sistema de gestión para panaderías y pastelerías</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Ventas Hoy', value: 'TT$3,450', color: '#F97316' },
          { label: 'Pedidos Activos', value: '12', color: '#FBBF24' },
          { label: 'Productos', value: '45', color: '#EC4899' },
          { label: 'Clientes', value: '89', color: '#22D3EE' },
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

export default function BakeryPage() {
  const [activeModule, setActiveModule] = useState("dashboard");

  const renderContent = () => {
    switch (activeModule) {
      case "dashboard":
        return <BakeryDashboard />;
      default:
        return <BakeryDashboard />;
    }
  };

  return (
    <DashboardLayout
      title="NexusOS Bakery"
      subtitle="Sistema de Gestion para Panaderias"
      menuItems={menuItems}
      activeModule={activeModule}
      onModuleChange={setActiveModule}
      primaryColor="#F97316"
      secondaryColor="#FBBF24"
    >
      {renderContent()}
    </DashboardLayout>
  );
}
