"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Settings,
  Store,
  Clock,
  DollarSign,
  Bell,
  Receipt,
  Users,
  Shield,
  Palette,
  Save,
  Plus,
  Trash2,
  Edit,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useTheme } from "@/contexts/theme-context";

// ============================================
// TRANSLATIONS
// ============================================
const translations = {
  en: {
    title: "Settings",
    subtitle: "Configure your bar preferences",
    generalSettings: "General Settings",
    barName: "Bar Name",
    barNamePlaceholder: "Enter bar name",
    address: "Address",
    addressPlaceholder: "Enter address",
    phone: "Phone",
    phonePlaceholder: "Enter phone number",
    email: "Email",
    emailPlaceholder: "Enter email",
    taxRate: "Tax Rate (%)",
    currency: "Currency",
    operatingHours: "Operating Hours",
    openingTime: "Opening Time",
    closingTime: "Closing Time",
    happyHour: "Happy Hour",
    happyHourEnabled: "Happy Hour Enabled",
    happyHourStart: "Happy Hour Start",
    happyHourEnd: "Happy Hour End",
    happyHourDiscount: "Happy Hour Discount (%)",
    notifications: "Notifications",
    lowStockAlerts: "Low Stock Alerts",
    dailyReports: "Daily Reports",
    orderNotifications: "Order Notifications",
    paymentAlerts: "Payment Alerts",
    posSettings: "POS Settings",
    receiptHeader: "Receipt Header",
    receiptFooter: "Receipt Footer",
    autoPrint: "Auto Print Receipt",
    askForCustomer: "Ask for Customer Info",
    staffManagement: "Staff Management",
    addStaff: "Add Staff",
    name: "Name",
    role: "Role",
    status: "Status",
    active: "Active",
    inactive: "Inactive",
    administrator: "Administrator",
    bartender: "Bartender",
    cashier: "Cashier",
    saveChanges: "Save Changes",
    saved: "Settings saved successfully",
  },
  es: {
    title: "Configuracion",
    subtitle: "Configura las preferencias de tu bar",
    generalSettings: "Configuracion General",
    barName: "Nombre del Bar",
    barNamePlaceholder: "Ingresa el nombre del bar",
    address: "Direccion",
    addressPlaceholder: "Ingresa la direccion",
    phone: "Telefono",
    phonePlaceholder: "Ingresa el telefono",
    email: "Correo Electronico",
    emailPlaceholder: "Ingresa el correo",
    taxRate: "Tasa de Impuesto (%)",
    currency: "Moneda",
    operatingHours: "Horario de Operacion",
    openingTime: "Hora de Apertura",
    closingTime: "Hora de Cierre",
    happyHour: "Happy Hour",
    happyHourEnabled: "Happy Hour Activo",
    happyHourStart: "Inicio Happy Hour",
    happyHourEnd: "Fin Happy Hour",
    happyHourDiscount: "Descuento Happy Hour (%)",
    notifications: "Notificaciones",
    lowStockAlerts: "Alertas de Stock Bajo",
    dailyReports: "Reportes Diarios",
    orderNotifications: "Notificaciones de Ordenes",
    paymentAlerts: "Alertas de Pagos",
    posSettings: "Configuracion POS",
    receiptHeader: "Encabezado de Recibo",
    receiptFooter: "Pie de Recibo",
    autoPrint: "Imprimir Recibo Auto",
    askForCustomer: "Pedir Info del Cliente",
    staffManagement: "Gestion de Personal",
    addStaff: "Agregar Personal",
    name: "Nombre",
    role: "Rol",
    status: "Estado",
    active: "Activo",
    inactive: "Inactivo",
    administrator: "Administrador",
    bartender: "Bartender",
    cashier: "Cajero",
    saveChanges: "Guardar Cambios",
    saved: "Configuracion guardada exitosamente",
  },
};

// ============================================
// DEMO DATA
// ============================================
const DEMO_STAFF = [
  { id: '1', name: 'Juan Perez', role: 'administrator', status: 'active' },
  { id: '2', name: 'Maria Garcia', role: 'bartender', status: 'active' },
  { id: '3', name: 'Carlos Rodriguez', role: 'bartender', status: 'active' },
  { id: '4', name: 'Ana Martinez', role: 'cashier', status: 'inactive' },
];

// ============================================
// MAIN COMPONENT
// ============================================
export function BarSettings() {
  const { language } = useTheme();
  const t = translations[language];
  
  // Form state
  const [settings, setSettings] = useState({
    barName: "Mi Bar Favorito",
    address: "Av. George Washington 123, Santo Domingo",
    phone: "809-555-1234",
    email: "contacto@mibar.com",
    taxRate: "10",
    currency: "DOP",
    openingTime: "12:00",
    closingTime: "02:00",
    happyHourEnabled: true,
    happyHourStart: "17:00",
    happyHourEnd: "19:00",
    happyHourDiscount: "20",
    lowStockAlerts: true,
    dailyReports: true,
    orderNotifications: true,
    paymentAlerts: true,
    receiptHeader: "Mi Bar Favorito",
    receiptFooter: "Gracias por su visita!",
    autoPrint: true,
    askForCustomer: false,
  });
  
  const [staff, setStaff] = useState(DEMO_STAFF);

  const handleSave = () => {
    // In production, this would save to the backend
    alert(t.saved);
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'administrator': return t.administrator;
      case 'bartender': return t.bartender;
      case 'cashier': return t.cashier;
      default: return role;
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === 'active') {
      return <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">{t.active}</Badge>;
    }
    return <Badge className="bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400">{t.inactive}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">{t.title}</h2>
          <p className="text-muted-foreground">{t.subtitle}</p>
        </div>
        <Button onClick={handleSave} className="bg-[#8B5CF6] hover:bg-[#7C3AED]">
          <Save className="h-4 w-4 mr-2" />
          {t.saveChanges}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="h-5 w-5 text-[#8B5CF6]" />
              {t.generalSettings}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="barName">{t.barName}</Label>
              <Input
                id="barName"
                value={settings.barName}
                onChange={(e) => setSettings({ ...settings, barName: e.target.value })}
                placeholder={t.barNamePlaceholder}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="address">{t.address}</Label>
              <Input
                id="address"
                value={settings.address}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                placeholder={t.addressPlaceholder}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">{t.phone}</Label>
                <Input
                  id="phone"
                  value={settings.phone}
                  onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                  placeholder={t.phonePlaceholder}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">{t.email}</Label>
                <Input
                  id="email"
                  type="email"
                  value={settings.email}
                  onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                  placeholder={t.emailPlaceholder}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="taxRate">{t.taxRate}</Label>
                <Input
                  id="taxRate"
                  type="number"
                  value={settings.taxRate}
                  onChange={(e) => setSettings({ ...settings, taxRate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">{t.currency}</Label>
                <Select value={settings.currency} onValueChange={(v) => setSettings({ ...settings, currency: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DOP">DOP - Peso Dominicano</SelectItem>
                    <SelectItem value="USD">USD - US Dollar</SelectItem>
                    <SelectItem value="EUR">EUR - Euro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Operating Hours */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-[#8B5CF6]" />
              {t.operatingHours}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="openingTime">{t.openingTime}</Label>
                <Input
                  id="openingTime"
                  type="time"
                  value={settings.openingTime}
                  onChange={(e) => setSettings({ ...settings, openingTime: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="closingTime">{t.closingTime}</Label>
                <Input
                  id="closingTime"
                  type="time"
                  value={settings.closingTime}
                  onChange={(e) => setSettings({ ...settings, closingTime: e.target.value })}
                />
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t.happyHourEnabled}</Label>
                </div>
                <Switch
                  checked={settings.happyHourEnabled}
                  onCheckedChange={(checked) => setSettings({ ...settings, happyHourEnabled: checked })}
                />
              </div>
              
              {settings.happyHourEnabled && (
                <div className="grid grid-cols-3 gap-4 pl-4 border-l-2 border-[#8B5CF6]">
                  <div className="space-y-2">
                    <Label>{t.happyHourStart}</Label>
                    <Input
                      type="time"
                      value={settings.happyHourStart}
                      onChange={(e) => setSettings({ ...settings, happyHourStart: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t.happyHourEnd}</Label>
                    <Input
                      type="time"
                      value={settings.happyHourEnd}
                      onChange={(e) => setSettings({ ...settings, happyHourEnd: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t.happyHourDiscount}</Label>
                    <Input
                      type="number"
                      value={settings.happyHourDiscount}
                      onChange={(e) => setSettings({ ...settings, happyHourDiscount: e.target.value })}
                    />
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-[#8B5CF6]" />
              {t.notifications}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{t.lowStockAlerts}</p>
                <p className="text-sm text-muted-foreground">Get notified when items are running low</p>
              </div>
              <Switch
                checked={settings.lowStockAlerts}
                onCheckedChange={(checked) => setSettings({ ...settings, lowStockAlerts: checked })}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{t.dailyReports}</p>
                <p className="text-sm text-muted-foreground">Receive daily sales summary</p>
              </div>
              <Switch
                checked={settings.dailyReports}
                onCheckedChange={(checked) => setSettings({ ...settings, dailyReports: checked })}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{t.orderNotifications}</p>
                <p className="text-sm text-muted-foreground">Alert for new orders</p>
              </div>
              <Switch
                checked={settings.orderNotifications}
                onCheckedChange={(checked) => setSettings({ ...settings, orderNotifications: checked })}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{t.paymentAlerts}</p>
                <p className="text-sm text-muted-foreground">Alert for payment issues</p>
              </div>
              <Switch
                checked={settings.paymentAlerts}
                onCheckedChange={(checked) => setSettings({ ...settings, paymentAlerts: checked })}
              />
            </div>
          </CardContent>
        </Card>

        {/* POS Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-[#8B5CF6]" />
              {t.posSettings}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="receiptHeader">{t.receiptHeader}</Label>
              <Input
                id="receiptHeader"
                value={settings.receiptHeader}
                onChange={(e) => setSettings({ ...settings, receiptHeader: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="receiptFooter">{t.receiptFooter}</Label>
              <Input
                id="receiptFooter"
                value={settings.receiptFooter}
                onChange={(e) => setSettings({ ...settings, receiptFooter: e.target.value })}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{t.autoPrint}</p>
                <p className="text-sm text-muted-foreground">Automatically print receipts</p>
              </div>
              <Switch
                checked={settings.autoPrint}
                onCheckedChange={(checked) => setSettings({ ...settings, autoPrint: checked })}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{t.askForCustomer}</p>
                <p className="text-sm text-muted-foreground">Require customer info at checkout</p>
              </div>
              <Switch
                checked={settings.askForCustomer}
                onCheckedChange={(checked) => setSettings({ ...settings, askForCustomer: checked })}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Staff Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-[#8B5CF6]" />
                {t.staffManagement}
              </CardTitle>
              <CardDescription>Manage your bar staff and permissions</CardDescription>
            </div>
            <Button size="sm" className="bg-[#8B5CF6] hover:bg-[#7C3AED]">
              <Plus className="h-4 w-4 mr-2" />
              {t.addStaff}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left p-3 text-sm font-medium">{t.name}</th>
                  <th className="text-left p-3 text-sm font-medium">{t.role}</th>
                  <th className="text-left p-3 text-sm font-medium">{t.status}</th>
                  <th className="text-right p-3 text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {staff.map((member) => (
                  <tr key={member.id} className="hover:bg-muted/50">
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#8B5CF6] text-white flex items-center justify-center text-sm font-medium">
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span className="font-medium">{member.name}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <Badge variant="outline">{getRoleLabel(member.role)}</Badge>
                    </td>
                    <td className="p-3">{getStatusBadge(member.status)}</td>
                    <td className="p-3">
                      <div className="flex items-center justify-end gap-2">
                        <Button size="sm" variant="ghost">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="text-red-500">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
