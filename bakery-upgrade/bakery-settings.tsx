"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Settings,
  Store,
  Phone,
  Mail,
  MapPin,
  Clock,
  Percent,
  Save,
  Loader2,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { LogoUploader, LogoPreview } from "@/components/settings/logo-uploader";
import { toast } from "sonner";

interface BakerySettingsData {
  id?: string;
  bakeryName: string;
  legalName: string;
  taxId: string;
  email: string;
  phone: string;
  whatsapp: string;
  address: string;
  city: string;
  currency: string;
  taxEnabled: boolean;
  taxRate: number;
  taxName: string;
  openingTime: string;
  closingTime: string;
  workingDays: string;
  productionStart: string;
  lastOrderTime: string;
  loyaltyEnabled: boolean;
  pointsPerDollar: number;
  offlineMode: boolean;
  logoUrl: string | null;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
}

const defaultSettings: BakerySettingsData = {
  bakeryName: "Panaderia del Valle",
  legalName: "Panaderia del Valle S.A.",
  taxId: "123456789",
  email: "contacto@panaderiadelvalle.com",
  phone: "+1 868 555-1234",
  whatsapp: "+1 868 555-1234",
  address: "Calle Principal 123",
  city: "Puerto España",
  currency: "TTD",
  taxEnabled: true,
  taxRate: 12.5,
  taxName: "VAT",
  openingTime: "06:00",
  closingTime: "20:00",
  workingDays: "Lunes a Sabado",
  productionStart: "04:00",
  lastOrderTime: "19:30",
  loyaltyEnabled: true,
  pointsPerDollar: 1,
  offlineMode: true,
  logoUrl: null,
  primaryColor: "#F97316",
  secondaryColor: "#FBBF24",
  accentColor: "#78350F",
};

export function BakerySettings() {
  const [settings, setSettings] = useState<BakerySettingsData>(defaultSettings);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/bakery/settings");
      if (response.ok) {
        const data = await response.json();
        if (data.settings) {
          setSettings({ ...defaultSettings, ...data.settings });
        }
      }
    } catch (error) {
      console.error("Error loading settings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/bakery/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        toast.success("Settings saved successfully!");
        setHasChanges(false);
      } else {
        toast.error("Failed to save settings");
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogoChange = (logoUrl: string | null) => {
    setSettings(prev => ({ ...prev, logoUrl }));
    setHasChanges(true);
  };

  const handleLogoSave = async (logoUrl: string) => {
    // Logo is automatically saved via the API in the uploader
    // But we also update local state
    setSettings(prev => ({ ...prev, logoUrl }));
  };

  const updateSetting = <K extends keyof BakerySettingsData>(
    key: K,
    value: BakerySettingsData[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-[#F97316]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Configuracion</h2>
          <p className="text-gray-500 dark:text-gray-400">Ajustes de la panaderia</p>
        </div>
        <Button
          onClick={handleSave}
          disabled={isSaving || !hasChanges}
          className="bg-[#F97316] hover:bg-[#EA580C]"
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Guardar Cambios
            </>
          )}
        </Button>
      </div>

      {/* Logo Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Logo e Imagen</CardTitle>
        </CardHeader>
        <CardContent>
          <LogoUploader
            currentLogoUrl={settings.logoUrl}
            businessName={settings.bakeryName}
            primaryColor={settings.primaryColor}
            onLogoChange={handleLogoChange}
            onLogoSave={handleLogoSave}
            industry="bakery"
            storageMethod="base64"
            size="lg"
            showBackgroundToggle={true}
          />
        </CardContent>
      </Card>

      {/* Business Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Store className="h-5 w-5 text-[#F97316]" />
            Informacion del Negocio
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium">Nombre Comercial</label>
              <Input
                value={settings.bakeryName}
                onChange={(e) => updateSetting("bakeryName", e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Razon Social</label>
              <Input
                value={settings.legalName}
                onChange={(e) => updateSetting("legalName", e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">RIF / Tax ID</label>
              <Input
                value={settings.taxId}
                onChange={(e) => updateSetting("taxId", e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Moneda</label>
              <Select
                value={settings.currency}
                onValueChange={(value) => updateSetting("currency", value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TTD">TT$ - Dolar Trinitense</SelectItem>
                  <SelectItem value="USD">$ - Dolar US</SelectItem>
                  <SelectItem value="VES">Bs - Bolivar</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Phone className="h-5 w-5 text-[#F97316]" />
            Contacto
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium">Telefono</label>
              <div className="relative mt-1">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  value={settings.phone}
                  onChange={(e) => updateSetting("phone", e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">WhatsApp</label>
              <div className="relative mt-1">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  value={settings.whatsapp}
                  onChange={(e) => updateSetting("whatsapp", e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Email</label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="email"
                  value={settings.email}
                  onChange={(e) => updateSetting("email", e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Direccion</label>
              <div className="relative mt-1">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  value={settings.address}
                  onChange={(e) => updateSetting("address", e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Ciudad</label>
              <Input
                value={settings.city}
                onChange={(e) => updateSetting("city", e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Operating Hours */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5 text-[#F97316]" />
            Horarios
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium">Hora de Apertura</label>
              <Input
                type="time"
                value={settings.openingTime}
                onChange={(e) => updateSetting("openingTime", e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Hora de Cierre</label>
              <Input
                type="time"
                value={settings.closingTime}
                onChange={(e) => updateSetting("closingTime", e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Dias Laborales</label>
              <Input
                value={settings.workingDays}
                onChange={(e) => updateSetting("workingDays", e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Inicio de Produccion</label>
              <Input
                type="time"
                value={settings.productionStart}
                onChange={(e) => updateSetting("productionStart", e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Ultimo Pedido</label>
              <Input
                type="time"
                value={settings.lastOrderTime}
                onChange={(e) => updateSetting("lastOrderTime", e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tax Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Percent className="h-5 w-5 text-[#F97316]" />
            Impuestos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div>
                <p className="font-medium">Habilitar Impuestos</p>
                <p className="text-sm text-gray-500">
                  Aplicar impuesto a las ventas
                </p>
              </div>
              <Switch
                checked={settings.taxEnabled}
                onCheckedChange={(checked) => updateSetting("taxEnabled", checked)}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Nombre del Impuesto</label>
              <Input
                value={settings.taxName}
                onChange={(e) => updateSetting("taxName", e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Tasa de Impuesto (%)</label>
              <Input
                type="number"
                value={settings.taxRate}
                onChange={(e) => updateSetting("taxRate", parseFloat(e.target.value))}
                className="mt-1"
                disabled={!settings.taxEnabled}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Features */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Settings className="h-5 w-5 text-[#F97316]" />
            Funcionalidades
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div>
                <p className="font-medium">Programa de Lealtad</p>
                <p className="text-sm text-gray-500">
                  Sistema de puntos para clientes frecuentes
                </p>
              </div>
              <Switch
                checked={settings.loyaltyEnabled}
                onCheckedChange={(checked) => updateSetting("loyaltyEnabled", checked)}
              />
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div>
                <p className="font-medium">Modo Offline</p>
                <p className="text-sm text-gray-500">
                  Permitir ventas sin conexion a internet
                </p>
              </div>
              <Switch
                checked={settings.offlineMode}
                onCheckedChange={(checked) => updateSetting("offlineMode", checked)}
              />
            </div>
            {settings.loyaltyEnabled && (
              <div>
                <label className="text-sm font-medium">
                  Puntos por Dolar Gastado
                </label>
                <Input
                  type="number"
                  value={settings.pointsPerDollar}
                  onChange={(e) => updateSetting("pointsPerDollar", parseInt(e.target.value))}
                  className="mt-1 w-32"
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Branding Colors */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Colores de Marca</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="text-sm font-medium">Primario</label>
              <div className="mt-2 flex items-center gap-3">
                <input
                  type="color"
                  value={settings.primaryColor}
                  onChange={(e) => updateSetting("primaryColor", e.target.value)}
                  className="w-12 h-12 rounded-lg cursor-pointer"
                />
                <div 
                  className="flex-1 h-12 rounded-lg"
                  style={{ backgroundColor: settings.primaryColor }}
                />
                <Input
                  value={settings.primaryColor}
                  onChange={(e) => updateSetting("primaryColor", e.target.value)}
                  className="w-24"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Secundario</label>
              <div className="mt-2 flex items-center gap-3">
                <input
                  type="color"
                  value={settings.secondaryColor}
                  onChange={(e) => updateSetting("secondaryColor", e.target.value)}
                  className="w-12 h-12 rounded-lg cursor-pointer"
                />
                <div 
                  className="flex-1 h-12 rounded-lg"
                  style={{ backgroundColor: settings.secondaryColor }}
                />
                <Input
                  value={settings.secondaryColor}
                  onChange={(e) => updateSetting("secondaryColor", e.target.value)}
                  className="w-24"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Acento</label>
              <div className="mt-2 flex items-center gap-3">
                <input
                  type="color"
                  value={settings.accentColor}
                  onChange={(e) => updateSetting("accentColor", e.target.value)}
                  className="w-12 h-12 rounded-lg cursor-pointer"
                />
                <div 
                  className="flex-1 h-12 rounded-lg"
                  style={{ backgroundColor: settings.accentColor }}
                />
                <Input
                  value={settings.accentColor}
                  onChange={(e) => updateSetting("accentColor", e.target.value)}
                  className="w-24"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logo Preview Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Vista Previa del Logo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-6">
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-2">Extra Small</p>
              <LogoPreview
                logoUrl={settings.logoUrl}
                businessName={settings.bakeryName}
                primaryColor={settings.primaryColor}
                size="xs"
                rounded="full"
              />
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-2">Small</p>
              <LogoPreview
                logoUrl={settings.logoUrl}
                businessName={settings.bakeryName}
                primaryColor={settings.primaryColor}
                size="sm"
                rounded="lg"
              />
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-2">Medium</p>
              <LogoPreview
                logoUrl={settings.logoUrl}
                businessName={settings.bakeryName}
                primaryColor={settings.primaryColor}
                size="md"
                rounded="lg"
              />
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-2">Large</p>
              <LogoPreview
                logoUrl={settings.logoUrl}
                businessName={settings.bakeryName}
                primaryColor={settings.primaryColor}
                size="lg"
                rounded="xl"
              />
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-2">Extra Large</p>
              <LogoPreview
                logoUrl={settings.logoUrl}
                businessName={settings.bakeryName}
                primaryColor={settings.primaryColor}
                size="xl"
                rounded="xl"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
