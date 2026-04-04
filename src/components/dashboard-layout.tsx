"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  LayoutDashboard,
  Calendar,
  Users,
  UserCircle,
  Scissors,
  Package,
  DollarSign,
  BarChart3,
  Settings,
  ShoppingCart,
  Menu,
  X,
  Bell,
  Search,
  ChevronDown,
  LogOut,
  User,
  Store,
  Home,
  HelpCircle,
  Sun,
  Moon,
  Globe,
} from "lucide-react";
import { useTheme } from "@/contexts/theme-context";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  Calendar,
  Users,
  UserCircle,
  Scissors,
  Package,
  DollarSign,
  BarChart3,
  Settings,
  ShoppingCart,
};

interface MenuItem {
  id: string;
  label: string;
  icon: string;
  badge?: string | number;
}

interface DashboardLayoutProps {
  title: string;
  subtitle: string;
  menuItems: MenuItem[];
  activeModule: string;
  onModuleChange: (module: string) => void;
  primaryColor?: string;
  secondaryColor?: string;
  headerRightContent?: React.ReactNode;
  children: React.ReactNode;
}

export function DashboardLayout({
  title,
  subtitle,
  menuItems,
  activeModule,
  onModuleChange,
  primaryColor = "#6C3FCE",
  secondaryColor = "#F0B429",
  headerRightContent,
  children,
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { theme, toggleTheme, language, toggleLanguage } = useTheme();

  const getIcon = (iconName: string) => {
    const IconComponent = iconMap[iconName] || LayoutDashboard;
    return <IconComponent className="h-5 w-5" />;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <header
        className="lg:hidden fixed top-0 left-0 right-0 z-50 h-16 flex items-center justify-between px-4 text-white shadow-lg"
        style={{ backgroundColor: primaryColor }}
      >
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/10"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
        <div className="flex items-center gap-2">
          <Store className="h-6 w-6" />
          <span className="font-bold text-lg">{title}</span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/10"
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/10"
            onClick={toggleLanguage}
            title={language === 'es' ? 'Switch to English' : 'Cambiar a Español'}
          >
            <Globe className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/10"
          >
            <Bell className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full bg-card shadow-xl transition-all duration-300 border-r border-border",
          "lg:translate-x-0",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          sidebarOpen ? "w-64" : "lg:w-20"
        )}
      >
        {/* Logo */}
        <div
          className="h-16 flex items-center justify-between px-4 text-white"
          style={{ backgroundColor: primaryColor }}
        >
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <Store className="h-7 w-7" />
              <span className="font-bold text-lg">{title}</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/10 hidden lg:flex"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 overflow-y-auto">
          <div className="px-3 space-y-1">
            {/* Home Link */}
            <a
              href="/home"
              className="flex items-center gap-3 px-3 py-2.5 text-muted-foreground hover:bg-accent hover:text-accent-foreground rounded-lg transition-colors"
            >
              <Home className="h-5 w-5" />
              {sidebarOpen && <span className="font-medium">Inicio AETHEL OS</span>}
            </a>

            <div className="my-3 border-t border-border" />

            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onModuleChange(item.id);
                  setMobileMenuOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                  activeModule === item.id
                    ? "text-white shadow-md"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
                style={{
                  backgroundColor: activeModule === item.id ? primaryColor : undefined,
                }}
              >
                {getIcon(item.icon)}
                {sidebarOpen && (
                  <div className="flex items-center justify-between flex-1">
                    <span className="font-medium">{item.label}</span>
                    {item.badge && (
                      <Badge
                        variant="secondary"
                        className="text-xs"
                        style={{ backgroundColor: secondaryColor, color: "#000" }}
                      >
                        {item.badge}
                      </Badge>
                    )}
                  </div>
                )}
              </button>
            ))}
          </div>
        </nav>

        {/* User Section */}
        <div className="border-t border-border p-4">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className={cn(
              "w-full flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors",
              sidebarOpen ? "justify-start" : "justify-center"
            )}
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
              style={{ backgroundColor: primaryColor }}
            >
              JD
            </div>
            {sidebarOpen && (
              <>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-foreground">Juan Dueño</p>
                  <p className="text-xs text-muted-foreground">Administrador</p>
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </>
            )}
          </button>

          {userMenuOpen && sidebarOpen && (
            <div className="mt-2 bg-popover border border-border rounded-lg shadow-lg">
              <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground">
                <User className="h-4 w-4" />
                Mi Perfil
              </button>
              <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground">
                <Settings className="h-4 w-4" />
                Preferencias
              </button>
              <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground">
                <HelpCircle className="h-4 w-4" />
                Ayuda
              </button>
              <div className="border-t border-border" />
              <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10">
                <LogOut className="h-4 w-4" />
                Cerrar Sesión
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={cn(
          "transition-all duration-300 pt-16 lg:pt-0",
          sidebarOpen ? "lg:ml-64" : "lg:ml-20"
        )}
      >
        {/* Top Bar */}
        <header className="hidden lg:flex h-16 items-center justify-between px-6 bg-card border-b border-border sticky top-0 z-30">
          <div>
            <h1 className="text-xl font-semibold text-foreground">{subtitle}</h1>
          </div>
          <div className="flex items-center gap-3">
            {headerRightContent}
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="text-muted-foreground hover:text-foreground hover:bg-accent"
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            {/* Language Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleLanguage}
              className="text-muted-foreground hover:text-foreground hover:bg-accent gap-1.5 px-3"
              title={language === 'es' ? 'Switch to English' : 'Cambiar a Español'}
            >
              <Globe className="h-4 w-4" />
              <span className="font-medium">{language.toUpperCase()}</span>
            </Button>
            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground hover:bg-accent">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </Button>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-4 lg:p-6">{children}</div>
      </main>
    </div>
  );
}
