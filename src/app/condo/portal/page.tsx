'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Home,
  User,
  DollarSign,
  Calendar,
  Wrench,
  Bell,
  Vote,
  FileText,
  CreditCard,
  Clock,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  Download,
  Eye,
  Plus,
  Menu,
  X,
  Building2,
  Phone,
  Mail,
  MapPin,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AuroraBackground, StatusBadge, PageLoader, CondoCard, EmptyState } from '@/components/condo';

// Types
interface ResidentData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  unit: {
    unitNumber: string;
    floor?: number;
    building?: string;
    bedrooms: number;
    bathrooms: number;
    monthlyFee: number;
  };
  property: {
    name: string;
    address: string;
    city: string;
  };
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  total: number;
  status: string;
  balanceDue: number;
}

interface Reservation {
  id: string;
  reservationDate: string;
  startTime: string;
  endTime: string;
  status: string;
  amenity: { name: string };
}

interface MaintenanceRequest {
  id: string;
  requestNumber: string;
  title: string;
  status: string;
  priority: string;
  createdAt: string;
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: string;
  publishDate: string;
}

export default function ResidentPortalPage() {
  const searchParams = useSearchParams();
  const residentId = searchParams.get('residentId') || 'demo-resident';

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Data
  const [resident, setResident] = useState<ResidentData | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [maintenanceRequests, setMaintenanceRequests] = useState<MaintenanceRequest[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  // Quick actions
  const [showMaintenanceDialog, setShowMaintenanceDialog] = useState(false);
  const [newMaintenance, setNewMaintenance] = useState({
    category: 'plumbing',
    priority: 'normal',
    title: '',
    description: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchResidentData();
  }, [residentId]);

  const fetchResidentData = async () => {
    setLoading(true);
    try {
      // Mock data for demo - in production these would be real API calls
      setResident({
        id: residentId,
        firstName: 'Juan',
        lastName: 'Pérez',
        email: 'juan.perez@email.com',
        phone: '+1 868 123-4567',
        unit: {
          unitNumber: '101',
          floor: 1,
          building: 'A',
          bedrooms: 2,
          bathrooms: 2,
          monthlyFee: 1500,
        },
        property: {
          name: 'Residencia Las Palmas',
          address: 'Av. Principal, Sector Norte',
          city: 'Port of Spain',
        },
      });

      setInvoices([
        {
          id: '1',
          invoiceNumber: 'INV-2024-0001',
          invoiceDate: '2024-01-01',
          dueDate: '2024-01-15',
          total: 1500,
          status: 'paid',
          balanceDue: 0,
        },
        {
          id: '2',
          invoiceNumber: 'INV-2024-0002',
          invoiceDate: '2024-02-01',
          dueDate: '2024-02-15',
          total: 1500,
          status: 'pending',
          balanceDue: 1500,
        },
      ]);

      setReservations([
        {
          id: '1',
          reservationDate: '2024-02-10',
          startTime: '14:00',
          endTime: '18:00',
          status: 'confirmed',
          amenity: { name: 'Salón de Eventos' },
        },
      ]);

      setMaintenanceRequests([
        {
          id: '1',
          requestNumber: 'MR-2024-0001',
          title: 'Fuga en cocina',
          status: 'in_progress',
          priority: 'normal',
          createdAt: '2024-01-20',
        },
      ]);

      setAnnouncements([
        {
          id: '1',
          title: 'Mantenimiento de ascensores',
          content: 'El día 15 de febrero se realizará mantenimiento preventivo de los ascensores.',
          priority: 'normal',
          publishDate: '2024-02-01',
        },
      ]);

    } catch (error) {
      console.error('Error fetching resident data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMaintenance = async () => {
    setSubmitting(true);
    try {
      // In production, this would call the API
      await new Promise(resolve => setTimeout(resolve, 1000));
      setShowMaintenanceDialog(false);
      setNewMaintenance({ category: 'plumbing', priority: 'normal', title: '', description: '' });
    } catch (error) {
      console.error('Error creating maintenance request:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const calculateBalance = () => {
    return invoices
      .filter(inv => ['pending', 'overdue'].includes(inv.status))
      .reduce((sum, inv) => sum + inv.balanceDue, 0);
  };

  if (loading) {
    return <PageLoader />;
  }

  const menuItems = [
    { id: 'home', label: 'Inicio', icon: Home },
    { id: 'unit', label: 'Mi Unidad', icon: Building2 },
    { id: 'billing', label: 'Facturas', icon: DollarSign },
    { id: 'reservations', label: 'Reservas', icon: Calendar },
    { id: 'maintenance', label: 'Mantenimiento', icon: Wrench },
    { id: 'announcements', label: 'Anuncios', icon: Bell },
  ];

  return (
    <div className="min-h-screen bg-[#050410] pb-20">
      <AuroraBackground />
      
      {/* Mobile Header */}
      <header className="sticky top-0 z-40 bg-[#0A0820]/90 backdrop-blur-xl border-b border-[rgba(167,139,250,0.1)]">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10 border-2 border-[#6C3FCE]">
              <AvatarFallback className="bg-gradient-to-br from-[#6C3FCE] to-[#C026D3] text-white">
                {resident?.firstName[0]}{resident?.lastName[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-[#EDE9FE] font-medium">{resident?.firstName} {resident?.lastName}</p>
              <p className="text-xs text-[#9D7BEA]">{resident?.property.name}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-[#9D7BEA]"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="border-t border-[rgba(167,139,250,0.1)] p-4 space-y-2">
            {menuItems.map(item => (
              <Button
                key={item.id}
                variant="ghost"
                className="w-full justify-start text-[#9D7BEA] hover:text-[#EDE9FE] hover:bg-[rgba(108,63,206,0.2)]"
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
              >
                <item.icon className="w-4 h-4 mr-3" />
                {item.label}
              </Button>
            ))}
          </div>
        )}
      </header>

      <main className="px-4 py-6">
        {/* Home Tab */}
        {activeTab === 'home' && (
          <div className="space-y-6">
            {/* Welcome Card */}
            <Card className="bg-gradient-to-br from-[#6C3FCE]/20 to-[#C026D3]/20 border-[rgba(167,139,250,0.2)]">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold text-[#EDE9FE] mb-2">
                  ¡Hola, {resident?.firstName}! 👋
                </h2>
                <p className="text-[#9D7BEA]">
                  Bienvenido al portal de residentes de {resident?.property.name}
                </p>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-[#0A0820]/80 border-[rgba(167,139,250,0.2)]">
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-[#F0B429]">
                    ${calculateBalance().toLocaleString()}
                  </p>
                  <p className="text-xs text-[#9D7BEA]">Saldo Pendiente</p>
                </CardContent>
              </Card>
              <Card className="bg-[#0A0820]/80 border-[rgba(167,139,250,0.2)]">
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-[#34D399]">
                    {maintenanceRequests.filter(r => r.status === 'completed').length}
                  </p>
                  <p className="text-xs text-[#9D7BEA]">Solicitudes Completadas</p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-3 gap-3">
              <Button
                onClick={() => setShowMaintenanceDialog(true)}
                className="h-20 flex-col gap-1 bg-[#0A0820] border border-[rgba(167,139,250,0.2)] hover:border-[rgba(167,139,250,0.4)]"
                variant="outline"
              >
                <Wrench className="w-6 h-6 text-[#22D3EE]" />
                <span className="text-xs text-[#EDE9FE]">Solicitud</span>
              </Button>
              <Button
                onClick={() => setActiveTab('reservations')}
                className="h-20 flex-col gap-1 bg-[#0A0820] border border-[rgba(167,139,250,0.2)] hover:border-[rgba(167,139,250,0.4)]"
                variant="outline"
              >
                <Calendar className="w-6 h-6 text-[#6C3FCE]" />
                <span className="text-xs text-[#EDE9FE]">Reservar</span>
              </Button>
              <Button
                onClick={() => setActiveTab('billing')}
                className="h-20 flex-col gap-1 bg-[#0A0820] border border-[rgba(167,139,250,0.2)] hover:border-[rgba(167,139,250,0.4)]"
                variant="outline"
              >
                <CreditCard className="w-6 h-6 text-[#F0B429]" />
                <span className="text-xs text-[#EDE9FE]">Pagar</span>
              </Button>
            </div>

            {/* Recent Announcements */}
            <div>
              <h3 className="text-lg font-semibold text-[#EDE9FE] mb-3">Anuncios Recientes</h3>
              <div className="space-y-3">
                {announcements.map(ann => (
                  <Card key={ann.id} className="bg-[#0A0820]/80 border-[rgba(167,139,250,0.2)]">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#6C3FCE]/20 flex items-center justify-center">
                          <Bell className="w-5 h-5 text-[#B197FC]" />
                        </div>
                        <div>
                          <p className="text-[#EDE9FE] font-medium">{ann.title}</p>
                          <p className="text-sm text-[#9D7BEA] line-clamp-2">{ann.content}</p>
                          <p className="text-xs text-[#9D7BEA] mt-1">
                            {new Date(ann.publishDate).toLocaleDateString('es')}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Upcoming Reservations */}
            {reservations.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-[#EDE9FE] mb-3">Próximas Reservas</h3>
                {reservations.map(res => (
                  <Card key={res.id} className="bg-[#0A0820]/80 border-[rgba(167,139,250,0.2)]">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-[#34D399]/20 flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-[#34D399]" />
                          </div>
                          <div>
                            <p className="text-[#EDE9FE] font-medium">{res.amenity.name}</p>
                            <p className="text-sm text-[#9D7BEA]">
                              {new Date(res.reservationDate).toLocaleDateString('es')} | {res.startTime} - {res.endTime}
                            </p>
                          </div>
                        </div>
                        <StatusBadge status={res.status} size="sm" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Unit Tab */}
        {activeTab === 'unit' && resident && (
          <div className="space-y-6">
            <Card className="bg-[#0A0820]/80 border-[rgba(167,139,250,0.2)]">
              <CardHeader>
                <CardTitle className="text-[#EDE9FE] flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Mi Unidad
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[#9D7BEA] text-sm">Unidad</p>
                    <p className="text-[#EDE9FE] font-medium">
                      {resident.unit.building && `${resident.unit.building}-`}{resident.unit.unitNumber}
                    </p>
                  </div>
                  <div>
                    <p className="text-[#9D7BEA] text-sm">Piso</p>
                    <p className="text-[#EDE9FE] font-medium">{resident.unit.floor || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-[#9D7BEA] text-sm">Habitaciones</p>
                    <p className="text-[#EDE9FE] font-medium">{resident.unit.bedrooms}</p>
                  </div>
                  <div>
                    <p className="text-[#9D7BEA] text-sm">Baños</p>
                    <p className="text-[#EDE9FE] font-medium">{resident.unit.bathrooms}</p>
                  </div>
                </div>
                <div className="pt-4 border-t border-[rgba(167,139,250,0.1)]">
                  <p className="text-[#9D7BEA] text-sm">Cuota Mensual</p>
                  <p className="text-2xl font-bold text-[#F0B429]">${resident.unit.monthlyFee.toLocaleString()}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#0A0820]/80 border-[rgba(167,139,250,0.2)]">
              <CardHeader>
                <CardTitle className="text-[#EDE9FE] flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Mis Datos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-[#9D7BEA]" />
                  <p className="text-[#EDE9FE]">{resident.email}</p>
                </div>
                {resident.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-[#9D7BEA]" />
                    <p className="text-[#EDE9FE]">{resident.phone}</p>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-[#9D7BEA]" />
                  <p className="text-[#EDE9FE]">{resident.property.address}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Billing Tab */}
        {activeTab === 'billing' && (
          <div className="space-y-6">
            {/* Balance Card */}
            <Card className="bg-gradient-to-br from-[#F0B429]/20 to-[#d97706]/20 border-[rgba(240,180,41,0.2)]">
              <CardContent className="p-6 text-center">
                <p className="text-[#9D7BEA] text-sm mb-2">Saldo Pendiente</p>
                <p className="text-4xl font-bold text-[#F0B429]">${calculateBalance().toLocaleString()}</p>
                {calculateBalance() > 0 && (
                  <Button className="mt-4 btn-nexus w-full">
                    <CreditCard className="w-4 h-4 mr-2" />
                    Pagar Ahora
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Invoices List */}
            <h3 className="text-lg font-semibold text-[#EDE9FE]">Historial de Facturas</h3>
            <div className="space-y-3">
              {invoices.map(invoice => (
                <Card key={invoice.id} className="bg-[#0A0820]/80 border-[rgba(167,139,250,0.2)]">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[#EDE9FE] font-medium">{invoice.invoiceNumber}</p>
                        <p className="text-sm text-[#9D7BEA]">
                          {new Date(invoice.invoiceDate).toLocaleDateString('es')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[#F0B429] font-bold">${invoice.total.toLocaleString()}</p>
                        <StatusBadge status={invoice.status} size="sm" />
                      </div>
                    </div>
                    {invoice.status !== 'paid' && (
                      <div className="flex gap-2 mt-3 pt-3 border-t border-[rgba(167,139,250,0.1)]">
                        <Button size="sm" variant="outline" className="flex-1 border-[rgba(167,139,250,0.2)] text-[#9D7BEA]">
                          <Eye className="w-4 h-4 mr-1" />
                          Ver
                        </Button>
                        <Button size="sm" className="flex-1 btn-nexus">
                          <CreditCard className="w-4 h-4 mr-1" />
                          Pagar
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Reservations Tab */}
        {activeTab === 'reservations' && (
          <div className="space-y-6">
            <Button 
              onClick={() => setActiveTab('home')}
              className="w-full btn-nexus h-12"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nueva Reservación
            </Button>

            <h3 className="text-lg font-semibold text-[#EDE9FE]">Mis Reservas</h3>
            {reservations.length > 0 ? (
              <div className="space-y-3">
                {reservations.map(res => (
                  <Card key={res.id} className="bg-[#0A0820]/80 border-[rgba(167,139,250,0.2)]">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[#EDE9FE] font-medium">{res.amenity.name}</p>
                          <p className="text-sm text-[#9D7BEA]">
                            {new Date(res.reservationDate).toLocaleDateString('es')}
                          </p>
                          <p className="text-sm text-[#B197FC]">{res.startTime} - {res.endTime}</p>
                        </div>
                        <StatusBadge status={res.status} />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Calendar}
                title="Sin reservaciones"
                description="Realiza una nueva reservación desde el botón de arriba"
              />
            )}
          </div>
        )}

        {/* Maintenance Tab */}
        {activeTab === 'maintenance' && (
          <div className="space-y-6">
            <Button 
              onClick={() => setShowMaintenanceDialog(true)}
              className="w-full btn-nexus h-12"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nueva Solicitud
            </Button>

            <h3 className="text-lg font-semibold text-[#EDE9FE]">Mis Solicitudes</h3>
            {maintenanceRequests.length > 0 ? (
              <div className="space-y-3">
                {maintenanceRequests.map(req => (
                  <Card key={req.id} className="bg-[#0A0820]/80 border-[rgba(167,139,250,0.2)]">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[#EDE9FE] font-medium">{req.title}</p>
                          <p className="text-xs text-[#9D7BEA]">{req.requestNumber}</p>
                          <p className="text-sm text-[#9D7BEA]">
                            {new Date(req.createdAt).toLocaleDateString('es')}
                          </p>
                        </div>
                        <StatusBadge status={req.status} />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Wrench}
                title="Sin solicitudes"
                description="Reporta un problema de mantenimiento"
              />
            )}
          </div>
        )}

        {/* Announcements Tab */}
        {activeTab === 'announcements' && (
          <div className="space-y-4">
            {announcements.map(ann => (
              <Card key={ann.id} className="bg-[#0A0820]/80 border-[rgba(167,139,250,0.2)]">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-0.5 rounded text-xs ${
                      ann.priority === 'urgent' ? 'bg-[#F87171]/20 text-[#F87171]' : 'bg-[#6C3FCE]/20 text-[#B197FC]'
                    }`}>
                      {ann.priority}
                    </span>
                    <span className="text-xs text-[#9D7BEA]">
                      {new Date(ann.publishDate).toLocaleDateString('es')}
                    </span>
                  </div>
                  <p className="text-[#EDE9FE] font-medium mb-2">{ann.title}</p>
                  <p className="text-sm text-[#9D7BEA]">{ann.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#0A0820]/95 backdrop-blur-xl border-t border-[rgba(167,139,250,0.1)] px-2 py-2 z-50">
        <div className="flex items-center justify-around max-w-lg mx-auto">
          {menuItems.slice(0, 5).map(item => (
            <Button
              key={item.id}
              variant="ghost"
              onClick={() => setActiveTab(item.id)}
              className={`flex-col gap-1 h-14 w-14 ${
                activeTab === item.id 
                  ? 'text-[#B197FC]' 
                  : 'text-[#9D7BEA]'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px]">{item.label}</span>
            </Button>
          ))}
        </div>
      </nav>

      {/* New Maintenance Dialog */}
      <Dialog open={showMaintenanceDialog} onOpenChange={setShowMaintenanceDialog}>
        <DialogContent className="bg-[#0A0820] border-[rgba(167,139,250,0.2)] text-[#EDE9FE] max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-[#EDE9FE]">Nueva Solicitud</DialogTitle>
            <DialogDescription className="text-[#9D7BEA]">
              Reporta un problema de mantenimiento
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label className="text-[#9D7BEA]">Categoría</Label>
              <Select
                value={newMaintenance.category}
                onValueChange={(v) => setNewMaintenance(prev => ({ ...prev, category: v }))}
              >
                <SelectTrigger className="bg-[#050410] border-[rgba(167,139,250,0.2)]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#0A0820] border-[rgba(167,139,250,0.2)]">
                  <SelectItem value="plumbing" className="text-[#EDE9FE]">Plomería</SelectItem>
                  <SelectItem value="electrical" className="text-[#EDE9FE]">Eléctrico</SelectItem>
                  <SelectItem value="hvac" className="text-[#EDE9FE]">A/C</SelectItem>
                  <SelectItem value="other" className="text-[#EDE9FE]">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-[#9D7BEA]">Título</Label>
              <Input
                value={newMaintenance.title}
                onChange={(e) => setNewMaintenance(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Describe el problema"
                className="bg-[#050410] border-[rgba(167,139,250,0.2)]"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[#9D7BEA]">Detalles</Label>
              <Textarea
                value={newMaintenance.description}
                onChange={(e) => setNewMaintenance(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Más información..."
                className="bg-[#050410] border-[rgba(167,139,250,0.2)]"
                rows={3}
              />
            </div>

            <Button
              onClick={handleCreateMaintenance}
              disabled={!newMaintenance.title || submitting}
              className="w-full btn-nexus"
            >
              {submitting ? 'Enviando...' : 'Enviar Solicitud'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
