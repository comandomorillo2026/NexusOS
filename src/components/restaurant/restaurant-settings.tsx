'use client';

import React, { useState, useCallback } from 'react';
import { useTheme } from '@/contexts/theme-context';
import { toast } from 'sonner';
import {
  Settings,
  Store,
  Clock,
  CreditCard,
  Bell,
  Users,
  Globe,
  Save,
  Mail,
  Phone,
  MapPin,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// ============================================
// TRANSLATIONS
// ============================================
const translations = {
  en: {
    settings: 'Settings',
    generalSettings: 'General Settings',
    restaurantInfo: 'Restaurant Information',
    restaurantName: 'Restaurant Name',
    address: 'Address',
    phone: 'Phone',
    email: 'Email',
    taxRate: 'Tax Rate (%)',
    currency: 'Currency',
    openingHours: 'Opening Hours',
    openTime: 'Open Time',
    closeTime: 'Close Time',
    paymentSettings: 'Payment Settings',
    acceptCash: 'Accept Cash',
    acceptCard: 'Accept Card',
    acceptTransfer: 'Accept Transfer',
    notificationSettings: 'Notification Settings',
    orderNotifications: 'Order Notifications',
    lowStockAlerts: 'Low Stock Alerts',
    dailyReport: 'Daily Report Email',
    soundAlerts: 'Sound Alerts',
    staffSettings: 'Staff Settings',
    autoAssignTables: 'Auto-assign Tables',
    requireServerLogin: 'Require Server Login',
    language: 'Language',
    spanish: 'Spanish',
    english: 'English',
    save: 'Save Changes',
    saved: 'Settings saved successfully',
  },
  es: {
    settings: 'Configuración',
    generalSettings: 'Configuración General',
    restaurantInfo: 'Información del Restaurante',
    restaurantName: 'Nombre del Restaurante',
    address: 'Dirección',
    phone: 'Teléfono',
    email: 'Correo Electrónico',
    taxRate: 'Tasa de Impuesto (%)',
    currency: 'Moneda',
    openingHours: 'Horario de Apertura',
    openTime: 'Hora de Apertura',
    closeTime: 'Hora de Cierre',
    paymentSettings: 'Configuración de Pagos',
    acceptCash: 'Aceptar Efectivo',
    acceptCard: 'Aceptar Tarjeta',
    acceptTransfer: 'Aceptar Transferencia',
    notificationSettings: 'Configuración de Notificaciones',
    orderNotifications: 'Notificaciones de Pedidos',
    lowStockAlerts: 'Alertas de Stock Bajo',
    dailyReport: 'Email de Reporte Diario',
    soundAlerts: 'Alertas de Sonido',
    staffSettings: 'Configuración de Personal',
    autoAssignTables: 'Asignar Mesas Automáticamente',
    requireServerLogin: 'Requerir Inicio de Sesión',
    language: 'Idioma',
    spanish: 'Español',
    english: 'Inglés',
    save: 'Guardar Cambios',
    saved: 'Configuración guardada exitosamente',
  },
};

// ============================================
// MAIN SETTINGS COMPONENT
// ============================================
export function RestaurantSettings() {
  const { language } = useTheme();
  const t = translations[language];

  const [settings, setSettings] = useState({
    // Restaurant Info
    restaurantName: 'Mi Restaurante',
    address: '123 Calle Principal, Puerto España, Trinidad',
    phone: '+1 868-123-4567',
    email: 'info@mirestaurante.com',
    taxRate: '12.5',
    currency: 'TTD',
    openTime: '11:00',
    closeTime: '22:00',
    // Payment
    acceptCash: true,
    acceptCard: true,
    acceptTransfer: true,
    // Notifications
    orderNotifications: true,
    lowStockAlerts: true,
    dailyReport: false,
    soundAlerts: true,
    // Staff
    autoAssignTables: false,
    requireServerLogin: true,
    // Language
    preferredLanguage: 'es',
  });

  const handleSave = useCallback(() => {
    // In a real app, save to API
    toast.success(t.saved);
  }, [t.saved]);

  const updateSetting = (key: string, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">{t.settings}</h2>
        <Button onClick={handleSave} className="bg-[#EF4444] hover:bg-red-600">
          <Save className="w-4 h-4 mr-2" />
          {t.save}
        </Button>
      </div>

      {/* Settings Tabs */}
      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">
            <Store className="w-4 h-4 mr-2" />
            {t.restaurantInfo}
          </TabsTrigger>
          <TabsTrigger value="hours">
            <Clock className="w-4 h-4 mr-2" />
            {t.openingHours}
          </TabsTrigger>
          <TabsTrigger value="payment">
            <CreditCard className="w-4 h-4 mr-2" />
            {t.paymentSettings}
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="w-4 h-4 mr-2" />
            {t.notificationSettings}
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>{t.restaurantInfo}</CardTitle>
              <CardDescription>
                {language === 'en' 
                  ? 'Basic information about your restaurant'
                  : 'Información básica sobre su restaurante'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">{t.restaurantName}</Label>
                  <Input
                    id="name"
                    value={settings.restaurantName}
                    onChange={(e) => updateSetting('restaurantName', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">{t.email}</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      className="pl-10"
                      value={settings.email}
                      onChange={(e) => updateSetting('email', e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">{t.phone}</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      className="pl-10"
                      value={settings.phone}
                      onChange={(e) => updateSetting('phone', e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">{t.currency}</Label>
                  <Select value={settings.currency} onValueChange={(v) => updateSetting('currency', v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TTD">TTD - Trinidad Dollar</SelectItem>
                      <SelectItem value="USD">USD - US Dollar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">{t.address}</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Textarea
                    id="address"
                    className="pl-10 min-h-[80px]"
                    value={settings.address}
                    onChange={(e) => updateSetting('address', e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="tax">{t.taxRate}</Label>
                  <Input
                    id="tax"
                    type="number"
                    step="0.1"
                    value={settings.taxRate}
                    onChange={(e) => updateSetting('taxRate', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t.language}</Label>
                  <Select value={settings.preferredLanguage} onValueChange={(v) => updateSetting('preferredLanguage', v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="es">{t.spanish}</SelectItem>
                      <SelectItem value="en">{t.english}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Opening Hours */}
        <TabsContent value="hours">
          <Card>
            <CardHeader>
              <CardTitle>{t.openingHours}</CardTitle>
              <CardDescription>
                {language === 'en'
                  ? 'Set your restaurant operating hours'
                  : 'Configure las horas de operación de su restaurante'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="openTime">{t.openTime}</Label>
                  <Input
                    id="openTime"
                    type="time"
                    value={settings.openTime}
                    onChange={(e) => updateSetting('openTime', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="closeTime">{t.closeTime}</Label>
                  <Input
                    id="closeTime"
                    type="time"
                    value={settings.closeTime}
                    onChange={(e) => updateSetting('closeTime', e.target.value)}
                  />
                </div>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  {language === 'en'
                    ? `Restaurant hours: ${settings.openTime} - ${settings.closeTime}`
                    : `Horario del restaurante: ${settings.openTime} - ${settings.closeTime}`}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Settings */}
        <TabsContent value="payment">
          <Card>
            <CardHeader>
              <CardTitle>{t.paymentSettings}</CardTitle>
              <CardDescription>
                {language === 'en'
                  ? 'Configure accepted payment methods'
                  : 'Configure los métodos de pago aceptados'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                    <span className="text-green-600 font-bold">$</span>
                  </div>
                  <div>
                    <p className="font-medium">{t.acceptCash}</p>
                    <p className="text-sm text-muted-foreground">
                      {language === 'en' ? 'Accept cash payments' : 'Aceptar pagos en efectivo'}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={settings.acceptCash}
                  onCheckedChange={(checked) => updateSetting('acceptCash', checked)}
                />
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">{t.acceptCard}</p>
                    <p className="text-sm text-muted-foreground">
                      {language === 'en' ? 'Accept credit/debit cards' : 'Aceptar tarjetas de crédito/débito'}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={settings.acceptCard}
                  onCheckedChange={(checked) => updateSetting('acceptCard', checked)}
                />
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                    <span className="text-purple-600 font-bold">T</span>
                  </div>
                  <div>
                    <p className="font-medium">{t.acceptTransfer}</p>
                    <p className="text-sm text-muted-foreground">
                      {language === 'en' ? 'Accept bank transfers' : 'Aceptar transferencias bancarias'}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={settings.acceptTransfer}
                  onCheckedChange={(checked) => updateSetting('acceptTransfer', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>{t.notificationSettings}</CardTitle>
              <CardDescription>
                {language === 'en'
                  ? 'Configure notifications and alerts'
                  : 'Configure notificaciones y alertas'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">{t.orderNotifications}</p>
                  <p className="text-sm text-muted-foreground">
                    {language === 'en' ? 'Get notified for new orders' : 'Recibir notificaciones de nuevos pedidos'}
                  </p>
                </div>
                <Switch
                  checked={settings.orderNotifications}
                  onCheckedChange={(checked) => updateSetting('orderNotifications', checked)}
                />
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">{t.lowStockAlerts}</p>
                  <p className="text-sm text-muted-foreground">
                    {language === 'en' ? 'Alert when items are low' : 'Alertar cuando los artículos estén bajos'}
                  </p>
                </div>
                <Switch
                  checked={settings.lowStockAlerts}
                  onCheckedChange={(checked) => updateSetting('lowStockAlerts', checked)}
                />
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">{t.dailyReport}</p>
                  <p className="text-sm text-muted-foreground">
                    {language === 'en' ? 'Receive daily sales report' : 'Recibir reporte diario de ventas'}
                  </p>
                </div>
                <Switch
                  checked={settings.dailyReport}
                  onCheckedChange={(checked) => updateSetting('dailyReport', checked)}
                />
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">{t.soundAlerts}</p>
                  <p className="text-sm text-muted-foreground">
                    {language === 'en' ? 'Play sound for notifications' : 'Reproducir sonido para notificaciones'}
                  </p>
                </div>
                <Switch
                  checked={settings.soundAlerts}
                  onCheckedChange={(checked) => updateSetting('soundAlerts', checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">{t.autoAssignTables}</p>
                  <p className="text-sm text-muted-foreground">
                    {language === 'en' ? 'Automatically assign tables to servers' : 'Asignar mesas a servidores automáticamente'}
                  </p>
                </div>
                <Switch
                  checked={settings.autoAssignTables}
                  onCheckedChange={(checked) => updateSetting('autoAssignTables', checked)}
                />
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">{t.requireServerLogin}</p>
                  <p className="text-sm text-muted-foreground">
                    {language === 'en' ? 'Require servers to login before orders' : 'Requerir que servidores inicien sesión antes de pedidos'}
                  </p>
                </div>
                <Switch
                  checked={settings.requireServerLogin}
                  onCheckedChange={(checked) => updateSetting('requireServerLogin', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
