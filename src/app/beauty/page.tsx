"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { BeautyDashboard } from "@/components/beauty/beauty-dashboard";
import { BeautyAppointments } from "@/components/beauty/beauty-appointments";
import { BeautyClients } from "@/components/beauty/beauty-clients";
import { BeautyStaff } from "@/components/beauty/beauty-staff";
import { BeautyServices } from "@/components/beauty/beauty-services";
import { BeautyPOS } from "@/components/beauty/beauty-pos";
import { BeautyProducts } from "@/components/beauty/beauty-products";
import { BeautyFinances } from "@/components/beauty/beauty-finances";
import { BeautyReports } from "@/components/beauty/beauty-reports";
import { BeautySettings } from "@/components/beauty/beauty-settings";

const menuItems = [
  { id: "dashboard", label: "Dashboard", icon: "LayoutDashboard" },
  { id: "appointments", label: "Citas", icon: "Calendar" },
  { id: "pos", label: "Punto de Venta", icon: "ShoppingCart" },
  { id: "clients", label: "Clientes", icon: "Users" },
  { id: "staff", label: "Equipo", icon: "UserCircle" },
  { id: "services", label: "Servicios", icon: "Scissors" },
  { id: "products", label: "Productos", icon: "Package" },
  { id: "finances", label: "Finanzas", icon: "DollarSign" },
  { id: "reports", label: "Reportes", icon: "BarChart3" },
  { id: "settings", label: "Configuración", icon: "Settings" },
];

export default function BeautyPage() {
  const [activeModule, setActiveModule] = useState("dashboard");

  const renderContent = () => {
    switch (activeModule) {
      case "dashboard":
        return <BeautyDashboard />;
      case "appointments":
        return <BeautyAppointments />;
      case "pos":
        return <BeautyPOS />;
      case "clients":
        return <BeautyClients />;
      case "staff":
        return <BeautyStaff />;
      case "services":
        return <BeautyServices />;
      case "products":
        return <BeautyProducts />;
      case "finances":
        return <BeautyFinances />;
      case "reports":
        return <BeautyReports />;
      case "settings":
        return <BeautySettings />;
      default:
        return <BeautyDashboard />;
    }
  };

  return (
    <DashboardLayout
      title="NexusOS Beauty"
      subtitle="Sistema de Gestión para Salones"
      menuItems={menuItems}
      activeModule={activeModule}
      onModuleChange={setActiveModule}
      primaryColor="#EC4899"
      secondaryColor="#8B5CF6"
    >
      {renderContent()}
    </DashboardLayout>
  );
}
