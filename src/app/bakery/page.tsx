"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import {
  BakeryDashboard,
  BakeryProducts,
  BakeryOrders,
  BakeryCustomers,
  BakeryProduction,
  BakeryInvoices,
  BakeryReports,
  BakerySettings,
  BakeryPOS,
  BakeryAIButton,
  BakeryAIPage,
  BakeryCatalogSettings,
} from "@/components/bakery";

const menuItems = [
  { id: "dashboard", label: "Dashboard", icon: "LayoutDashboard" },
  { id: "pos", label: "Punto de Venta", icon: "ShoppingCart" },
  { id: "products", label: "Productos", icon: "Package" },
  { id: "orders", label: "Pedidos", icon: "ClipboardList" },
  { id: "production", label: "Produccion", icon: "ChefHat" },
  { id: "customers", label: "Clientes", icon: "Users" },
  { id: "invoices", label: "Facturas", icon: "FileText" },
  { id: "reports", label: "Reportes", icon: "BarChart3" },
  { id: "catalog", label: "Catalogo Publico", icon: "Globe" },
  { id: "settings", label: "Configuracion", icon: "Settings" },
];

export default function BakeryPage() {
  const [activeModule, setActiveModule] = useState("dashboard");
  const [showAI, setShowAI] = useState(false);

  const renderContent = () => {
    switch (activeModule) {
      case "dashboard":
        return <BakeryDashboard />;
      case "pos":
        return <BakeryPOS />;
      case "products":
        return <BakeryProducts />;
      case "orders":
        return <BakeryOrders />;
      case "production":
        return <BakeryProduction />;
      case "customers":
        return <BakeryCustomers />;
      case "invoices":
        return <BakeryInvoices />;
      case "reports":
        return <BakeryReports />;
      case "catalog":
        return <BakeryCatalogSettings />;
      case "settings":
        return <BakerySettings />;
      case "ai":
        return <BakeryAIPage />;
      default:
        return <BakeryDashboard />;
    }
  };

  return (
    <>
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

      {/* AI Assistant Button */}
      <BakeryAIButton onClick={() => setShowAI(true)} isOpen={showAI} />

      {/* AI Assistant Modal */}
      {showAI && (
        <BakeryAIPage />
      )}
    </>
  );
}
