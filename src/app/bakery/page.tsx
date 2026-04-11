"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard-layout";
import { BakeryDashboard } from "@/components/bakery/bakery-dashboard";
import { BakeryProducts } from "@/components/bakery/bakery-products";
import { BakeryOrders } from "@/components/bakery/bakery-orders";
import { BakeryCustomers } from "@/components/bakery/bakery-customers";
import { BakeryProduction } from "@/components/bakery/bakery-production";
import { BakeryInvoices } from "@/components/bakery/bakery-invoices";
import { BakeryReports } from "@/components/bakery/bakery-reports";
import { BakerySettings } from "@/components/bakery/bakery-settings";
import { BakeryPOS } from "@/components/bakery/bakery-pos";
import { BakeryCatalogSettings } from "@/components/bakery/bakery-catalog-settings";
import { CatalogAnalytics } from "@/components/bakery/bakery-catalog-analytics";
import { BakeryRoute } from "@/components/auth/protected-layout";
import { useAppTranslation } from "@/hooks/use-app-translation";

// Translations for bakery menu items
const bakeryTranslations = {
  es: {
    title: "AETHEL OS Bakery",
    subtitle: "Sistema de Gestión para Panaderías",
    menuItems: {
      dashboard: "Dashboard",
      pos: "Punto de Venta",
      products: "Productos",
      orders: "Pedidos",
      production: "Producción",
      customers: "Clientes",
      invoices: "Facturas",
      reports: "Reportes",
      catalog: "Portal Productos",
      analytics: "Analíticas",
      settings: "Configuración",
    },
  },
  en: {
    title: "AETHEL OS Bakery",
    subtitle: "Management System for Bakeries",
    menuItems: {
      dashboard: "Dashboard",
      pos: "Point of Sale",
      products: "Products",
      orders: "Orders",
      production: "Production",
      customers: "Customers",
      invoices: "Invoices",
      reports: "Reports",
      catalog: "Product Portal",
      analytics: "Analytics",
      settings: "Settings",
    },
  },
};

// Menu item configuration (without labels - labels come from translations)
const menuItemConfig = [
  { id: "dashboard", icon: "LayoutDashboard" },
  { id: "pos", icon: "ShoppingCart" },
  { id: "products", icon: "Package" },
  { id: "orders", icon: "ClipboardList" },
  { id: "production", icon: "ChefHat" },
  { id: "customers", icon: "Users" },
  { id: "invoices", icon: "FileText" },
  { id: "reports", icon: "BarChart3" },
  { id: "catalog", icon: "Store" },
  { id: "analytics", icon: "TrendingUp" },
  { id: "settings", icon: "Settings" },
];

function BakeryPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { language } = useAppTranslation();
  
  // Get tab from URL params
  const tabFromUrl = searchParams.get("tab");
  const validTabs = ["dashboard", "pos", "products", "orders", "production", "customers", "invoices", "reports", "catalog", "analytics", "settings"];
  const initialModule = tabFromUrl && validTabs.includes(tabFromUrl) ? tabFromUrl : "dashboard";
  const [activeModule, setActiveModule] = useState(initialModule);

  // Get translations based on current language
  const translations = bakeryTranslations[language];

  // Get tenant ID from localStorage (lazy evaluation)
  const getTenantId = () => {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('nexus_user');
      if (userStr) {
        const user = JSON.parse(userStr);
        return user.tenantId || 'demo-tenant';
      }
    }
    return 'demo-tenant';
  };

  // Create menu items with translated labels
  const menuItems = menuItemConfig.map((item) => ({
    id: item.id,
    label: translations.menuItems[item.id as keyof typeof translations.menuItems],
    icon: item.icon,
  }));

  // Handle module change with URL update
  const handleModuleChange = (module: string) => {
    setActiveModule(module);
    // Update URL without full navigation
    const url = new URL(window.location.href);
    if (module === "dashboard") {
      url.searchParams.delete("tab");
    } else {
      url.searchParams.set("tab", module);
    }
    router.replace(url.pathname + url.search, { scroll: false });
  };

  const renderContent = () => {
    switch (activeModule) {
      case "dashboard":
        return <BakeryDashboard />;
      case "pos":
        return <BakeryPOS tenantId={getTenantId()} />;
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
      case "analytics":
        return <CatalogAnalytics />;
      case "settings":
        return <BakerySettings />;
      default:
        return <BakeryDashboard />;
    }
  };

  return (
    <DashboardLayout
      title={translations.title}
      subtitle={translations.subtitle}
      menuItems={menuItems}
      activeModule={activeModule}
      onModuleChange={handleModuleChange}
      primaryColor="#F97316"
      secondaryColor="#FBBF24"
    >
      {renderContent()}
    </DashboardLayout>
  );
}

export default function BakeryPage() {
  return (
    <BakeryRoute>
      <BakeryPageContent />
    </BakeryRoute>
  );
}
