'use client';

import { useTheme } from '@/contexts/theme-context';
import { translations, Language } from '@/lib/translations';
import { industryTranslations } from '@/lib/industry-translations';

/**
 * App-specific translations for dashboard layouts and UI components
 * These translations are specifically for the AETHEL OS application
 */
const appTranslations = {
  es: {
    // Common UI elements
    common: {
      home: 'Inicio AETHEL OS',
      menu: 'Menú',
      loading: 'Cargando...',
    },
    
    // Dashboard layout user section
    userSection: {
      profile: 'Mi Perfil',
      preferences: 'Preferencias',
      help: 'Ayuda',
      logout: 'Cerrar Sesión',
      administrator: 'Administrador',
    },
    
    // Dashboard navigation items - General
    navigation: {
      dashboard: 'Dashboard',
      appointments: 'Citas',
      pos: 'POS',
      clients: 'Clientes',
      customers: 'Clientes',
      inventory: 'Inventario',
      finances: 'Finanzas',
      reports: 'Reportes',
      settings: 'Configuración',
      products: 'Productos',
      orders: 'Pedidos',
      production: 'Producción',
      accounting: 'Contabilidad',
      invoices: 'Facturas',
      services: 'Servicios',
      staff: 'Personal',
      branches: 'Sucursales',
      clientPortal: 'Portal Clientes',
      catalog: 'Catálogo',
      aiAssistant: 'Asistente IA',
    },
    
    // Clinic specific navigation
    clinic: {
      dashboard: 'Dashboard',
      patients: 'Pacientes',
      appointments: 'Citas',
      records: 'Expedientes',
      billing: 'Facturación',
      prescriptions: 'Recetas',
      lab: 'Laboratorio',
      inventory: 'Inventario',
      nursePortal: 'Portal Enfermería',
      reports: 'Reportes',
      settings: 'Configuración',
      adminClinic: 'Admin Clínica',
    },
    
    // Theme and language toggles
    toggles: {
      switchToLight: 'Cambiar a modo claro',
      switchToDark: 'Cambiar a modo oscuro',
      switchToEnglish: 'Switch to English',
      switchToSpanish: 'Cambiar a Español',
    },
  },
  
  en: {
    // Common UI elements
    common: {
      home: 'AETHEL OS Home',
      menu: 'Menu',
      loading: 'Loading...',
    },
    
    // Dashboard layout user section
    userSection: {
      profile: 'My Profile',
      preferences: 'Preferences',
      help: 'Help',
      logout: 'Log Out',
      administrator: 'Administrator',
    },
    
    // Dashboard navigation items - General
    navigation: {
      dashboard: 'Dashboard',
      appointments: 'Appointments',
      pos: 'POS',
      clients: 'Clients',
      customers: 'Customers',
      inventory: 'Inventory',
      finances: 'Finances',
      reports: 'Reports',
      settings: 'Settings',
      products: 'Products',
      orders: 'Orders',
      production: 'Production',
      accounting: 'Accounting',
      invoices: 'Invoices',
      services: 'Services',
      staff: 'Staff',
      branches: 'Branches',
      clientPortal: 'Client Portal',
      catalog: 'Catalog',
      aiAssistant: 'AI Assistant',
    },
    
    // Clinic specific navigation
    clinic: {
      dashboard: 'Dashboard',
      patients: 'Patients',
      appointments: 'Appointments',
      records: 'Records',
      billing: 'Billing',
      prescriptions: 'Prescriptions',
      lab: 'Laboratory',
      inventory: 'Inventory',
      nursePortal: 'Nurse Portal',
      reports: 'Reports',
      settings: 'Settings',
      adminClinic: 'Clinic Admin',
    },
    
    // Theme and language toggles
    toggles: {
      switchToLight: 'Switch to light mode',
      switchToDark: 'Switch to dark mode',
      switchToEnglish: 'Switch to English',
      switchToSpanish: 'Switch to Spanish',
    },
  },
};

/**
 * Translation key paths for type safety
 */
type AppTranslationKeys = typeof appTranslations.es;

/**
 * Custom hook for application translations
 * Uses the language from ThemeContext to determine which translations to use
 * 
 * @returns Object with t() function and current language
 * 
 * @example
 * const { t } = useAppTranslation();
 * // Access nested translations
 * const label = t('navigation.dashboard'); // Returns 'Dashboard' or 'Dashboard' based on language
 * const profile = t('userSection.profile'); // Returns 'Mi Perfil' or 'My Profile'
 */
export function useAppTranslation() {
  const { language } = useTheme();
  
  /**
   * Get a translation value by key path (e.g., 'navigation.dashboard')
   * Supports nested access using dot notation
   */
  const t = (key: string): string => {
    const currentTranslations = appTranslations[language];
    
    // Split the key by dots to access nested properties
    const keys = key.split('.');
    let result: unknown = currentTranslations;
    
    for (const k of keys) {
      if (result && typeof result === 'object' && k in result) {
        result = (result as Record<string, unknown>)[k];
      } else {
        // Key not found, return the key itself as fallback
        console.warn(`Translation key not found: ${key}`);
        return key;
      }
    }
    
    // Return the final value if it's a string
    if (typeof result === 'string') {
      return result;
    }
    
    return key;
  };
  
  /**
   * Get all translations for a specific section
   * Useful when you need multiple translations at once
   */
  const getSection = <K extends keyof AppTranslationKeys>(section: K): AppTranslationKeys[K] => {
    return appTranslations[language][section];
  };
  
  /**
   * Get current language
   */
  const getLanguage = (): Language => language;
  
  /**
   * Check if current language is Spanish
   */
  const isSpanish = (): boolean => language === 'es';
  
  /**
   * Check if current language is English
   */
  const isEnglish = (): boolean => language === 'en';
  
  return {
    t,
    getSection,
    getLanguage,
    isSpanish,
    isEnglish,
    language,
    // Direct access to all app translations
    appTranslations: appTranslations[language],
    // Access to global translations from translations.ts
    globalTranslations: translations[language],
    // Access to industry translations
    industryTrans: industryTranslations[language],
  };
}

// Export the app translations for direct access if needed
export { appTranslations };

// Export types
export type { AppTranslationKeys };
