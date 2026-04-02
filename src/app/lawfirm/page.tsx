"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { LawDashboard } from "@/components/lawfirm/law-dashboard";
import { LawCases } from "@/components/lawfirm/law-cases";
import { LawClients } from "@/components/lawfirm/law-clients";
import { LawDocuments } from "@/components/lawfirm/law-documents";
import { LawBilling } from "@/components/lawfirm/law-billing";
import { LawTrust } from "@/components/lawfirm/law-trust";
import { LawTime } from "@/components/lawfirm/law-time";
import { LawCalendar } from "@/components/lawfirm/law-calendar";
import { LawReports } from "@/components/lawfirm/law-reports";
import { LawSettings } from "@/components/lawfirm/law-settings";
import { LawGlobalSearch } from "@/components/lawfirm/law-global-search";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";

const menuItems = [
  { id: "dashboard", label: "Dashboard", icon: "LayoutDashboard" },
  { id: "cases", label: "Casos", icon: "Briefcase" },
  { id: "clients", label: "Clientes", icon: "Users" },
  { id: "documents", label: "Documentos", icon: "FileText" },
  { id: "calendar", label: "Calendario", icon: "Calendar" },
  { id: "time", label: "Tiempo", icon: "Clock" },
  { id: "billing", label: "Facturación", icon: "DollarSign" },
  { id: "trust", label: "Trust Account", icon: "Building" },
  { id: "reports", label: "Reportes", icon: "BarChart3" },
  { id: "settings", label: "Configuración", icon: "Settings" },
];

export default function LawFirmPage() {
  const [activeModule, setActiveModule] = useState("dashboard");
  const [globalSearchOpen, setGlobalSearchOpen] = useState(false);

  const renderContent = () => {
    switch (activeModule) {
      case "dashboard":
        return <LawDashboard />;
      case "cases":
        return <LawCases />;
      case "clients":
        return <LawClients />;
      case "documents":
        return <LawDocuments />;
      case "calendar":
        return <LawCalendar />;
      case "time":
        return <LawTime />;
      case "billing":
        return <LawBilling />;
      case "trust":
        return <LawTrust />;
      case "reports":
        return <LawReports />;
      case "settings":
        return <LawSettings />;
      default:
        return <LawDashboard />;
    }
  };

  return (
    <>
      <DashboardLayout
        title="NexusOS Law"
        subtitle="Sistema de Gestión para Bufetes de Abogados"
        menuItems={menuItems}
        activeModule={activeModule}
        onModuleChange={setActiveModule}
        primaryColor="#1E3A5F"
        secondaryColor="#C4A35A"
        headerRightContent={
          <Button
            variant="outline"
            size="sm"
            onClick={() => setGlobalSearchOpen(true)}
            className="flex items-center gap-2 text-gray-500"
          >
            <Search className="h-4 w-4" />
            <span className="hidden sm:inline">Buscar...</span>
            <kbd className="hidden sm:inline px-1.5 py-0.5 text-xs bg-gray-100 rounded border">⌘K</kbd>
          </Button>
        }
      >
        {renderContent()}
      </DashboardLayout>

      <LawGlobalSearch open={globalSearchOpen} onOpenChange={setGlobalSearchOpen} />
    </>
  );
}
