"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard-layout";
import { BarDashboard } from "@/components/bar/bar-dashboard";
import { BarPOS } from "@/components/bar/bar-pos";
import { BarInventory } from "@/components/bar/bar-inventory";
import { BarSales } from "@/components/bar/bar-sales";
import { BarReports } from "@/components/bar/bar-reports";
import { BarSettings } from "@/components/bar/bar-settings";
import { useTheme } from "@/contexts/theme-context";

// ============================================
// TRANSLATIONS - BAR MODULE
// ============================================
const translations = {
  en: {
    title: "AETHEL Bar",
    subtitle: "Bar & Beverage Management System",
    dashboard: "Dashboard",
    pos: "Point of Sale",
    inventory: "Inventory",
    sales: "Sales",
    reports: "Reports",
    settings: "Settings",
  },
  es: {
    title: "AETHEL Bar",
    subtitle: "Sistema de Gestion para Bares",
    dashboard: "Tablero",
    pos: "Punto de Venta",
    inventory: "Inventario",
    sales: "Ventas",
    reports: "Reportes",
    settings: "Configuracion",
  },
};

// Menu items will be generated dynamically based on language
const getMenuItems = (t: typeof translations.en) => [
  { id: "dashboard", label: t.dashboard, icon: "LayoutDashboard" },
  { id: "pos", label: t.pos, icon: "ShoppingCart" },
  { id: "inventory", label: t.inventory, icon: "Package" },
  { id: "sales", label: t.sales, icon: "DollarSign" },
  { id: "reports", label: t.reports, icon: "BarChart3" },
  { id: "settings", label: t.settings, icon: "Settings" },
];

function BarPageContent() {
  const searchParams = useSearchParams();
  const [activeModule, setActiveModule] = useState("dashboard");
  const { language } = useTheme();
  
  const t = translations[language];
  const menuItems = getMenuItems(t);

  // Handle URL tab parameter
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && menuItems.some(item => item.id === tab)) {
      setActiveModule(tab);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const renderContent = () => {
    switch (activeModule) {
      case "dashboard":
        return <BarDashboard />;
      case "pos":
        return <BarPOS tenantId="demo-bar-tenant" />;
      case "inventory":
        return <BarInventory />;
      case "sales":
        return <BarSales />;
      case "reports":
        return <BarReports />;
      case "settings":
        return <BarSettings />;
      default:
        return <BarDashboard />;
    }
  };

  return (
    <DashboardLayout
      title={t.title}
      subtitle={t.subtitle}
      menuItems={menuItems}
      activeModule={activeModule}
      onModuleChange={setActiveModule}
      primaryColor="#8B5CF6"
      secondaryColor="#A78BFA"
    >
      {renderContent()}
    </DashboardLayout>
  );
}

export default function BarPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8B5CF6]" />
      </div>
    }>
      <BarPageContent />
    </Suspense>
  );
}
