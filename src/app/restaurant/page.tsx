'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { useTheme } from '@/contexts/theme-context';
import {
  RestaurantDashboard,
  RestaurantPOS,
  RestaurantMenu,
  RestaurantOrders,
  RestaurantTables,
  RestaurantInventory,
  RestaurantReports,
  RestaurantSettings,
} from '@/components/restaurant';

// ============================================
// TRANSLATIONS
// ============================================
const translations = {
  en: {
    dashboard: 'Dashboard',
    pos: 'POS',
    menu: 'Menu',
    orders: 'Orders',
    tables: 'Tables',
    inventory: 'Inventory',
    reports: 'Reports',
    settings: 'Settings',
    restaurantManagement: 'Restaurant Management',
    welcomeMessage: 'Manage your food & beverage business',
  },
  es: {
    dashboard: 'Panel',
    pos: 'POS',
    menu: 'Menú',
    orders: 'Pedidos',
    tables: 'Mesas',
    inventory: 'Inventario',
    reports: 'Reportes',
    settings: 'Configuración',
    restaurantManagement: 'Gestión de Restaurante',
    welcomeMessage: 'Administre su negocio de alimentos y bebidas',
  },
};

// ============================================
// MENU ITEMS CONFIGURATION
// ============================================
const getMenuItems = (t: typeof translations.en) => [
  { id: 'dashboard', label: t.dashboard, icon: 'LayoutDashboard' },
  { id: 'pos', label: t.pos, icon: 'ShoppingCart' },
  { id: 'menu', label: t.menu, icon: 'Package' },
  { id: 'orders', label: t.orders, icon: 'Calendar' },
  { id: 'tables', label: t.tables, icon: 'Users' },
  { id: 'inventory', label: t.inventory, icon: 'Package' },
  { id: 'reports', label: t.reports, icon: 'BarChart3' },
  { id: 'settings', label: t.settings, icon: 'Settings' },
];

// ============================================
// MAIN RESTAURANT PAGE
// ============================================
export default function RestaurantPage() {
  const { language } = useTheme();
  const t = translations[language];
  const [activeModule, setActiveModule] = useState('dashboard');

  // Primary color for restaurant industry
  const PRIMARY_COLOR = '#EF4444';
  const SECONDARY_COLOR = '#F97316';

  // Render active module content
  const renderContent = () => {
    switch (activeModule) {
      case 'dashboard':
        return <RestaurantDashboard />;
      case 'pos':
        return <RestaurantPOS />;
      case 'menu':
        return <RestaurantMenu />;
      case 'orders':
        return <RestaurantOrders />;
      case 'tables':
        return <RestaurantTables />;
      case 'inventory':
        return <RestaurantInventory />;
      case 'reports':
        return <RestaurantReports />;
      case 'settings':
        return <RestaurantSettings />;
      default:
        return <RestaurantDashboard />;
    }
  };

  return (
    <DashboardLayout
      title="AETHEL Restaurant"
      subtitle={t.restaurantManagement}
      menuItems={getMenuItems(t)}
      activeModule={activeModule}
      onModuleChange={setActiveModule}
      primaryColor={PRIMARY_COLOR}
      secondaryColor={SECONDARY_COLOR}
    >
      {renderContent()}
    </DashboardLayout>
  );
}
