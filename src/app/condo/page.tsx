'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Building2,
  Home,
  Users,
  DollarSign,
  Wrench,
  Bell,
  Calendar,
  TrendingUp,
  TrendingDown,
  Plus,
  Eye,
  Edit,
  Trash2,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  Clock,
  CreditCard,
  FileText,
  Settings,
  BarChart3,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// Types
interface Property {
  id: string;
  name: string;
  type: string;
  address: string;
  city: string;
  totalUnits: number;
  hasPool: boolean;
  hasGym: boolean;
  hasParking: boolean;
  hasSecurity24h: boolean;
  currency: string;
  _count?: {
    units: number;
    amenities: number;
  };
}

interface Unit {
  id: string;
  unitNumber: string;
  floor: number | null;
  building: string | null;
  type: string;
  bedrooms: number;
  bathrooms: number;
  status: string;
  monthlyFee: number;
  residents: Array<{ firstName: string; lastName: string; isPrimary: boolean }>;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  total: number;
  status: string;
  balanceDue: number;
  unit?: { unitNumber: string };
}

// Stat Card Component
function StatCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend, 
  trendUp,
  color = 'violet'
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  trend?: string;
  trendUp?: boolean;
  color?: 'violet' | 'green' | 'gold' | 'red' | 'blue';
}) {
  const colorClasses = {
    violet: 'from-[#6C3FCE] to-[#C026D3]',
    green: 'from-[#34D399] to-[#059669]',
    gold: 'from-[#F0B429] to-[#d97706]',
    red: 'from-[#F87171] to-[#dc2626]',
    blue: 'from-[#22D3EE] to-[#3B82F6]',
  };

  return (
    <Card className="bg-[#0A0820]/80 border-[rgba(167,139,250,0.2)] hover:border-[rgba(167,139,250,0.4)] transition-all">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[#9D7BEA] text-sm">{title}</p>
            <p className="text-2xl font-bold text-[#EDE9FE] mt-1">{value}</p>
            {subtitle && (
              <p className="text-xs text-[rgba(167,139,250,0.6)] mt-1">{subtitle}</p>
            )}
            {trend && (
              <div className={`flex items-center gap-1 mt-2 text-xs ${trendUp ? 'text-[#34D399]' : 'text-[#F87171]'}`}>
                {trendUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {trend}
              </div>
            )}
          </div>
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Status Badge
function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: 'bg-[#F0B429]/20 text-[#F0B429] border-[#F0B429]/30',
    paid: 'bg-[#34D399]/20 text-[#34D399] border-[#34D399]/30',
    overdue: 'bg-[#F87171]/20 text-[#F87171] border-[#F87171]/30',
    occupied: 'bg-[#34D399]/20 text-[#34D399] border-[#34D399]/30',
    vacant: 'bg-[#22D3EE]/20 text-[#22D3EE] border-[#22D3EE]/30',
    open: 'bg-[#F0B429]/20 text-[#F0B429] border-[#F0B429]/30',
    in_progress: 'bg-[#6C3FCE]/20 text-[#B197FC] border-[#6C3FCE]/30',
    completed: 'bg-[#34D399]/20 text-[#34D399] border-[#34D399]/30',
  };

  return (
    <span className={`px-2 py-1 rounded text-xs font-medium border ${styles[status] || styles.pending}`}>
      {status.toUpperCase().replace('_', ' ')}
    </span>
  );
}

// Main Component
export default function CondoDashboard() {
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [units, setUnits] = useState<Unit[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [stats, setStats] = useState({
    totalUnits: 0,
    occupiedUnits: 0,
    vacantUnits: 0,
    occupancyRate: 0,
    totalReceivable: 0,
    activeMaintenance: 0,
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showNewPropertyDialog, setShowNewPropertyDialog] = useState(false);
  const [showNewUnitDialog, setShowNewUnitDialog] = useState(false);

  // Fetch properties
  useEffect(() => {
    fetchProperties();
  }, []);

  async function fetchProperties() {
    try {
      const res = await fetch('/api/condo?tenantId=default');
      const data = await res.json();
      setProperties(data.properties || []);
      if (data.properties?.length > 0) {
        selectProperty(data.properties[0]);
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  }

  async function selectProperty(property: Property) {
    setSelectedProperty(property);
    setLoading(true);
    try {
      // Fetch property details
      const res = await fetch(`/api/condo?propertyId=${property.id}&tenantId=default`);
      const data = await res.json();
      setStats(data.stats || {});
      setUnits([]);
      setInvoices([]);
    } catch (error) {
      console.error('Error fetching property details:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchUnits() {
    if (!selectedProperty) return;
    try {
      const res = await fetch(`/api/condo/units?propertyId=${selectedProperty.id}`);
      const data = await res.json();
      setUnits(data.units || []);
    } catch (error) {
      console.error('Error fetching units:', error);
    }
  }

  async function fetchInvoices() {
    if (!selectedProperty) return;
    try {
      const res = await fetch(`/api/condo/invoices?propertyId=${selectedProperty.id}`);
      const data = await res.json();
      setInvoices(data.invoices || []);
    } catch (error) {
      console.error('Error fetching invoices:', error);
    }
  }

  // Tab change handlers
  useEffect(() => {
    if (activeTab === 'units') fetchUnits();
    if (activeTab === 'billing') fetchInvoices();
  }, [activeTab]);

  if (loading && !selectedProperty) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050410]">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#6C3FCE] to-[#C026D3] animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050410]">
      {/* Aurora Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#6C3FCE]/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#C026D3]/20 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#0A0820]/90 backdrop-blur-xl border-b border-[rgba(167,139,250,0.1)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6C3FCE] to-[#C026D3] flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-[#EDE9FE]">CondoOS</h1>
                <p className="text-xs text-[#9D7BEA]">Property Management</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Property Selector */}
              {properties.length > 0 && (
                <Select 
                  value={selectedProperty?.id} 
                  onValueChange={(id) => {
                    const prop = properties.find(p => p.id === id);
                    if (prop) selectProperty(prop);
                  }}
                >
                  <SelectTrigger className="w-48 bg-[#0A0820] border-[rgba(167,139,250,0.2)] text-[#EDE9FE]">
                    <SelectValue placeholder="Select property" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0A0820] border-[rgba(167,139,250,0.2)]">
                    {properties.map(p => (
                      <SelectItem key={p.id} value={p.id} className="text-[#EDE9FE]">
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              <Button 
                onClick={() => setShowNewPropertyDialog(true)}
                className="btn-nexus"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nueva Propiedad
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!selectedProperty ? (
          /* No Property State */
          <Card className="bg-[#0A0820]/80 border-[rgba(167,139,250,0.2)]">
            <CardContent className="p-12 text-center">
              <Building2 className="w-16 h-16 text-[#6C3FCE] mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-[#EDE9FE] mb-2">Bienvenido a CondoOS</h2>
              <p className="text-[#9D7BEA] mb-6">
                Comienza creando tu primera propiedad para gestionar condominios y propiedades.
              </p>
              <Button onClick={() => setShowNewPropertyDialog(true)} className="btn-nexus">
                <Plus className="w-4 h-4 mr-2" />
                Crear Primera Propiedad
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Property Header */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-[#EDE9FE]">{selectedProperty.name}</h2>
              <p className="text-[#9D7BEA]">{selectedProperty.address}, {selectedProperty.city}</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <StatCard
                title="Unidades Totales"
                value={stats.totalUnits}
                icon={Home}
                color="violet"
              />
              <StatCard
                title="Ocupación"
                value={`${stats.occupancyRate}%`}
                subtitle={`${stats.occupiedUnits} de ${stats.totalUnits}`}
                icon={Users}
                color="green"
                trend="+2.5% este mes"
                trendUp
              />
              <StatCard
                title="Por Cobrar"
                value={`$${stats.totalReceivable?.toLocaleString() || 0}`}
                icon={DollarSign}
                color="gold"
              />
              <StatCard
                title="Mantenimientos"
                value={stats.activeMaintenance}
                subtitle="Activos"
                icon={Wrench}
                color="blue"
              />
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="bg-[#0A0820] border border-[rgba(167,139,250,0.2)]">
                <TabsTrigger value="overview">Resumen</TabsTrigger>
                <TabsTrigger value="units">Unidades</TabsTrigger>
                <TabsTrigger value="billing">Facturación</TabsTrigger>
                <TabsTrigger value="amenities">Amenidades</TabsTrigger>
                <TabsTrigger value="maintenance">Mantenimiento</TabsTrigger>
                <TabsTrigger value="communications">Comunicaciones</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Occupancy Chart */}
                  <Card className="bg-[#0A0820]/80 border-[rgba(167,139,250,0.2)]">
                    <CardHeader>
                      <CardTitle className="text-[#EDE9FE] flex items-center gap-2">
                        <BarChart3 className="w-5 h-5" />
                        Estado de Ocupación
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-[#9D7BEA]">Ocupadas</span>
                        <span className="text-[#34D399] font-bold">{stats.occupiedUnits}</span>
                      </div>
                      <Progress 
                        value={stats.totalUnits > 0 ? (stats.occupiedUnits / stats.totalUnits) * 100 : 0}
                        className="h-2 bg-[rgba(167,139,250,0.1)]"
                      />
                      <div className="flex items-center justify-between">
                        <span className="text-[#9D7BEA]">Vacías</span>
                        <span className="text-[#22D3EE] font-bold">{stats.vacantUnits}</span>
                      </div>
                      <Progress 
                        value={stats.totalUnits > 0 ? (stats.vacantUnits / stats.totalUnits) * 100 : 0}
                        className="h-2 bg-[rgba(167,139,250,0.1)]"
                      />
                    </CardContent>
                  </Card>

                  {/* Property Features */}
                  <Card className="bg-[#0A0820]/80 border-[rgba(167,139,250,0.2)]">
                    <CardHeader>
                      <CardTitle className="text-[#EDE9FE]">Características</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-[rgba(108,63,206,0.1)]">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${selectedProperty.hasPool ? 'bg-[#22D3EE]/20 text-[#22D3EE]' : 'bg-[rgba(167,139,250,0.1)] text-[#9D7BEA]'}`}>
                            <span className="text-lg">🏊</span>
                          </div>
                          <span className="text-[#EDE9FE]">Piscina</span>
                          {selectedProperty.hasPool && <CheckCircle className="w-4 h-4 text-[#34D399] ml-auto" />}
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-[rgba(108,63,206,0.1)]">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${selectedProperty.hasGym ? 'bg-[#F0B429]/20 text-[#F0B429]' : 'bg-[rgba(167,139,250,0.1)] text-[#9D7BEA]'}`}>
                            <span className="text-lg">💪</span>
                          </div>
                          <span className="text-[#EDE9FE]">Gimnasio</span>
                          {selectedProperty.hasGym && <CheckCircle className="w-4 h-4 text-[#34D399] ml-auto" />}
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-[rgba(108,63,206,0.1)]">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${selectedProperty.hasParking ? 'bg-[#6C3FCE]/20 text-[#B197FC]' : 'bg-[rgba(167,139,250,0.1)] text-[#9D7BEA]'}`}>
                            <span className="text-lg">🚗</span>
                          </div>
                          <span className="text-[#EDE9FE]">Parking</span>
                          {selectedProperty.hasParking && <CheckCircle className="w-4 h-4 text-[#34D399] ml-auto" />}
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-[rgba(108,63,206,0.1)]">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${selectedProperty.hasSecurity24h ? 'bg-[#34D399]/20 text-[#34D399]' : 'bg-[rgba(167,139,250,0.1)] text-[#9D7BEA]'}`}>
                            <span className="text-lg">🔒</span>
                          </div>
                          <span className="text-[#EDE9FE]">Seguridad 24h</span>
                          {selectedProperty.hasSecurity24h && <CheckCircle className="w-4 h-4 text-[#34D399] ml-auto" />}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Quick Actions */}
                  <Card className="bg-[#0A0820]/80 border-[rgba(167,139,250,0.2)] lg:col-span-2">
                    <CardHeader>
                      <CardTitle className="text-[#EDE9FE]">Acciones Rápidas</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Button 
                          variant="outline" 
                          className="h-auto py-4 flex-col gap-2 bg-[rgba(108,63,206,0.1)] border-[rgba(167,139,250,0.2)] hover:bg-[rgba(108,63,206,0.2)]"
                          onClick={() => setShowNewUnitDialog(true)}
                        >
                          <Home className="w-6 h-6 text-[#B197FC]" />
                          <span className="text-[#EDE9FE]">Nueva Unidad</span>
                        </Button>
                        <Button 
                          variant="outline" 
                          className="h-auto py-4 flex-col gap-2 bg-[rgba(108,63,206,0.1)] border-[rgba(167,139,250,0.2)] hover:bg-[rgba(108,63,206,0.2)]"
                          onClick={() => setActiveTab('billing')}
                        >
                          <CreditCard className="w-6 h-6 text-[#F0B429]" />
                          <span className="text-[#EDE9FE]">Generar Facturas</span>
                        </Button>
                        <Button 
                          variant="outline" 
                          className="h-auto py-4 flex-col gap-2 bg-[rgba(108,63,206,0.1)] border-[rgba(167,139,250,0.2)] hover:bg-[rgba(108,63,206,0.2)]"
                          onClick={() => setActiveTab('maintenance')}
                        >
                          <Wrench className="w-6 h-6 text-[#22D3EE]" />
                          <span className="text-[#EDE9FE]">Solicitud Mantenimiento</span>
                        </Button>
                        <Button 
                          variant="outline" 
                          className="h-auto py-4 flex-col gap-2 bg-[rgba(108,63,206,0.1)] border-[rgba(167,139,250,0.2)] hover:bg-[rgba(108,63,206,0.2)]"
                          onClick={() => setActiveTab('communications')}
                        >
                          <Bell className="w-6 h-6 text-[#C026D3]" />
                          <span className="text-[#EDE9FE]">Nuevo Anuncio</span>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Units Tab */}
              <TabsContent value="units" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-[#EDE9FE]">Unidades</h3>
                  <Button onClick={() => setShowNewUnitDialog(true)} className="btn-nexus">
                    <Plus className="w-4 h-4 mr-2" />
                    Nueva Unidad
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {units.map(unit => (
                    <Card key={unit.id} className="bg-[#0A0820]/80 border-[rgba(167,139,250,0.2)] hover:border-[rgba(167,139,250,0.4)] transition-all">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="text-lg font-bold text-[#EDE9FE]">
                              {unit.building && `${unit.building}-`}{unit.unitNumber}
                            </p>
                            <p className="text-xs text-[#9D7BEA]">
                              {unit.bedrooms} hab • {unit.bathrooms} baños
                            </p>
                          </div>
                          <StatusBadge status={unit.status} />
                        </div>
                        {unit.residents?.length > 0 && (
                          <p className="text-sm text-[#B197FC]">
                            {unit.residents[0].firstName} {unit.residents[0].lastName}
                          </p>
                        )}
                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-[rgba(167,139,250,0.1)]">
                          <span className="text-sm text-[#F0B429]">
                            ${unit.monthlyFee}/mes
                          </span>
                          <Button variant="ghost" size="sm" className="text-[#9D7BEA]">
                            <Eye className="w-4 h-4 mr-1" /> Ver
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Billing Tab */}
              <TabsContent value="billing" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-[#EDE9FE]">Facturación</h3>
                  <Button className="btn-nexus">
                    <Plus className="w-4 h-4 mr-2" />
                    Generar Facturas Mensuales
                  </Button>
                </div>
                <Card className="bg-[#0A0820]/80 border-[rgba(167,139,250,0.2)]">
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-[rgba(167,139,250,0.1)]">
                            <th className="text-left p-4 text-[#9D7BEA] font-medium">Factura</th>
                            <th className="text-left p-4 text-[#9D7BEA] font-medium">Unidad</th>
                            <th className="text-left p-4 text-[#9D7BEA] font-medium">Fecha</th>
                            <th className="text-left p-4 text-[#9D7BEA] font-medium">Vence</th>
                            <th className="text-right p-4 text-[#9D7BEA] font-medium">Monto</th>
                            <th className="text-center p-4 text-[#9D7BEA] font-medium">Estado</th>
                          </tr>
                        </thead>
                        <tbody>
                          {invoices.map(invoice => (
                            <tr key={invoice.id} className="border-b border-[rgba(167,139,250,0.05)] hover:bg-[rgba(108,63,206,0.05)]">
                              <td className="p-4 text-[#EDE9FE] font-mono">{invoice.invoiceNumber}</td>
                              <td className="p-4 text-[#B197FC]">{invoice.unit?.unitNumber}</td>
                              <td className="p-4 text-[#9D7BEA]">{invoice.invoiceDate}</td>
                              <td className="p-4 text-[#9D7BEA]">{invoice.dueDate}</td>
                              <td className="p-4 text-right text-[#F0B429] font-bold">
                                ${invoice.total.toLocaleString()}
                              </td>
                              <td className="p-4 text-center">
                                <StatusBadge status={invoice.status} />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Other tabs placeholder */}
              <TabsContent value="amenities">
                <Card className="bg-[#0A0820]/80 border-[rgba(167,139,250,0.2)]">
                  <CardContent className="p-8 text-center">
                    <Calendar className="w-12 h-12 text-[#6C3FCE] mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-[#EDE9FE] mb-2">Amenidades</h3>
                    <p className="text-[#9D7BEA]">Gestión de amenidades y reservaciones próximamente...</p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="maintenance">
                <Card className="bg-[#0A0820]/80 border-[rgba(167,139,250,0.2)]">
                  <CardContent className="p-8 text-center">
                    <Wrench className="w-12 h-12 text-[#22D3EE] mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-[#EDE9FE] mb-2">Mantenimiento</h3>
                    <p className="text-[#9D7BEA]">Sistema de solicitudes de mantenimiento próximamente...</p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="communications">
                <Card className="bg-[#0A0820]/80 border-[rgba(167,139,250,0.2)]">
                  <CardContent className="p-8 text-center">
                    <Bell className="w-12 h-12 text-[#C026D3] mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-[#EDE9FE] mb-2">Comunicaciones</h3>
                    <p className="text-[#9D7BEA]">Sistema de anuncios y votaciones próximamente...</p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
      </main>

      {/* New Property Dialog */}
      <Dialog open={showNewPropertyDialog} onOpenChange={setShowNewPropertyDialog}>
        <DialogContent className="bg-[#0A0820] border-[rgba(167,139,250,0.2)] text-[#EDE9FE]">
          <DialogHeader>
            <DialogTitle className="text-[#EDE9FE]">Nueva Propiedad</DialogTitle>
            <DialogDescription className="text-[#9D7BEA]">
              Crea una nueva propiedad para gestionar.
            </DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target as HTMLFormElement);
            const data = {
              name: formData.get('name'),
              address: formData.get('address'),
              city: formData.get('city'),
              totalUnits: formData.get('totalUnits'),
              monthlyFeeDefault: formData.get('monthlyFeeDefault'),
            };
            try {
              const res = await fetch('/api/condo', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
              });
              if (res.ok) {
                setShowNewPropertyDialog(false);
                fetchProperties();
              }
            } catch (error) {
              console.error('Error creating property:', error);
            }
          }}>
            <div className="space-y-2">
              <Label htmlFor="name" className="text-[#9D7BEA]">Nombre de la Propiedad</Label>
              <Input id="name" name="name" placeholder="Residencia Las Palmas" className="bg-[#050410] border-[rgba(167,139,250,0.2)]" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address" className="text-[#9D7BEA]">Dirección</Label>
              <Input id="address" name="address" placeholder="Av. Principal, Sector..." className="bg-[#050410] border-[rgba(167,139,250,0.2)]" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city" className="text-[#9D7BEA]">Ciudad</Label>
                <Input id="city" name="city" placeholder="Port of Spain" className="bg-[#050410] border-[rgba(167,139,250,0.2)]" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="totalUnits" className="text-[#9D7BEA]">Total Unidades</Label>
                <Input id="totalUnits" name="totalUnits" type="number" placeholder="20" className="bg-[#050410] border-[rgba(167,139,250,0.2)]" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="monthlyFeeDefault" className="text-[#9D7BEA]">Cuota Mensual Base (TTD)</Label>
              <Input id="monthlyFeeDefault" name="monthlyFeeDefault" type="number" step="0.01" placeholder="1500.00" className="bg-[#050410] border-[rgba(167,139,250,0.2)]" />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setShowNewPropertyDialog(false)} className="border-[rgba(167,139,250,0.2)] text-[#9D7BEA]">
                Cancelar
              </Button>
              <Button type="submit" className="btn-nexus">
                Crear Propiedad
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* New Unit Dialog */}
      <Dialog open={showNewUnitDialog} onOpenChange={setShowNewUnitDialog}>
        <DialogContent className="bg-[#0A0820] border-[rgba(167,139,250,0.2)] text-[#EDE9FE]">
          <DialogHeader>
            <DialogTitle className="text-[#EDE9FE]">Nueva Unidad</DialogTitle>
            <DialogDescription className="text-[#9D7BEA]">
              Agrega una nueva unidad a {selectedProperty?.name}
            </DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={async (e) => {
            e.preventDefault();
            if (!selectedProperty) return;
            const formData = new FormData(e.target as HTMLFormElement);
            const data = {
              propertyId: selectedProperty.id,
              unitNumber: formData.get('unitNumber'),
              floor: formData.get('floor'),
              bedrooms: formData.get('bedrooms'),
              bathrooms: formData.get('bathrooms'),
              monthlyFee: formData.get('monthlyFee'),
            };
            try {
              const res = await fetch('/api/condo/units', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
              });
              if (res.ok) {
                setShowNewUnitDialog(false);
                fetchUnits();
              }
            } catch (error) {
              console.error('Error creating unit:', error);
            }
          }}>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="unitNumber" className="text-[#9D7BEA]">Número de Unidad</Label>
                <Input id="unitNumber" name="unitNumber" placeholder="101" className="bg-[#050410] border-[rgba(167,139,250,0.2)]" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="floor" className="text-[#9D7BEA]">Piso</Label>
                <Input id="floor" name="floor" type="number" placeholder="1" className="bg-[#050410] border-[rgba(167,139,250,0.2)]" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bedrooms" className="text-[#9D7BEA]">Habitaciones</Label>
                <Input id="bedrooms" name="bedrooms" type="number" placeholder="2" className="bg-[#050410] border-[rgba(167,139,250,0.2)]" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bathrooms" className="text-[#9D7BEA]">Baños</Label>
                <Input id="bathrooms" name="bathrooms" type="number" step="0.5" placeholder="1" className="bg-[#050410] border-[rgba(167,139,250,0.2)]" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="monthlyFee" className="text-[#9D7BEA]">Cuota Mensual (TTD)</Label>
              <Input id="monthlyFee" name="monthlyFee" type="number" step="0.01" placeholder="1500.00" className="bg-[#050410] border-[rgba(167,139,250,0.2)]" />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setShowNewUnitDialog(false)} className="border-[rgba(167,139,250,0.2)] text-[#9D7BEA]">
                Cancelar
              </Button>
              <Button type="submit" className="btn-nexus">
                Crear Unidad
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
