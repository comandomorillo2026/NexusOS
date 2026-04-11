"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users,
  Plus,
  Search,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  MoreVertical,
  Crown,
  Gift,
  Loader2,
} from "lucide-react";

const membershipTiers = [
  { id: "regular", name: "Regular", color: "bg-gray-100 text-gray-700", discount: 0 },
  { id: "bronze", name: "Bronce", color: "bg-orange-100 text-orange-700", discount: 5 },
  { id: "silver", name: "Plata", color: "bg-gray-200 text-gray-600", discount: 10 },
  { id: "gold", name: "Oro", color: "bg-yellow-100 text-yellow-700", discount: 15 },
  { id: "platinum", name: "Platino", color: "bg-purple-100 text-purple-700", discount: 20 },
];

interface Client {
  id: string;
  clientNumber: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phone: string;
  email?: string;
  membershipStatus: string;
  totalVisits: number;
  totalSpent: number;
  loyaltyPoints: number;
  notes?: string;
}

// Demo clients for fallback
const demoClients: Client[] = [
  {
    id: "1",
    clientNumber: "CLI-0001",
    firstName: "María",
    lastName: "González",
    fullName: "María González",
    phone: "868-555-0101",
    email: "maria@email.com",
    membershipStatus: "gold",
    totalVisits: 24,
    totalSpent: 4850,
    loyaltyPoints: 485,
    notes: "Prefiere tonos claros, alergia al latex",
  },
  {
    id: "2",
    clientNumber: "CLI-0002",
    firstName: "Carlos",
    lastName: "Pérez",
    fullName: "Carlos Pérez",
    phone: "868-555-0102",
    email: "carlos@email.com",
    membershipStatus: "silver",
    totalVisits: 12,
    totalSpent: 1800,
    loyaltyPoints: 180,
    notes: "Cliente frecuente de barba",
  },
  {
    id: "3",
    clientNumber: "CLI-0003",
    firstName: "Ana",
    lastName: "Martínez",
    fullName: "Ana Martínez",
    phone: "868-555-0103",
    email: "ana@email.com",
    membershipStatus: "platinum",
    totalVisits: 45,
    totalSpent: 12400,
    loyaltyPoints: 2480,
    notes: "Cliente VIP",
  },
];

export function BeautyClients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMembership, setFilterMembership] = useState("all");
  const [newClientOpen, setNewClientOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [saving, setSaving] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    membership: 'regular',
    notes: '',
  });

  // Get tenant ID from localStorage
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

  // Fetch clients from API
  const fetchClients = async () => {
    try {
      setLoading(true);
      const tenantId = getTenantId();
      const response = await fetch(`/api/beauty/clients?tenantId=${tenantId}`);
      const data = await response.json();
      
      if (data.success && data.clients && data.clients.length > 0) {
        setClients(data.clients.map((c: any) => ({
          id: c.id,
          clientNumber: c.clientNumber,
          firstName: c.firstName,
          lastName: c.lastName,
          fullName: c.fullName || `${c.firstName} ${c.lastName}`,
          phone: c.phone,
          email: c.email || '',
          membershipStatus: c.membershipStatus || 'regular',
          totalVisits: c.totalVisits || 0,
          totalSpent: c.totalSpent || 0,
          loyaltyPoints: c.loyaltyPoints || 0,
          notes: c.notes || '',
        })));
      } else {
        // Use demo data if no clients or error
        setClients(demoClients);
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
      setClients(demoClients);
    } finally {
      setLoading(false);
    }
  };

  // Create new client
  const handleCreateClient = async () => {
    if (!formData.firstName || !formData.lastName || !formData.phone) {
      alert('Por favor completa los campos requeridos');
      return;
    }

    try {
      setSaving(true);
      const tenantId = getTenantId();
      
      const response = await fetch('/api/beauty/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          email: formData.email,
          notes: formData.notes,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        // Add new client to list
        setClients(prev => [{
          ...data.client,
          fullName: data.client.fullName || `${data.client.firstName} ${data.client.lastName}`,
          membershipStatus: 'regular',
          totalVisits: 0,
          totalSpent: 0,
          loyaltyPoints: 0,
        }, ...prev]);
        
        // Reset form and close modal
        setFormData({
          firstName: '',
          lastName: '',
          phone: '',
          email: '',
          membership: 'regular',
          notes: '',
        });
        setNewClientOpen(false);
      } else {
        alert('Error al crear cliente: ' + (data.error || 'Error desconocido'));
      }
    } catch (error) {
      console.error('Error creating client:', error);
      alert('Error de conexión al crear cliente');
    } finally {
      setSaving(false);
    }
  };

  // Load clients on mount
  useEffect(() => {
    fetchClients();
  }, []);

  const filteredClients = clients.filter((client) => {
    const matchesSearch =
      client.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.phone.includes(searchTerm) ||
      client.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMembership =
      filterMembership === "all" || client.membershipStatus === filterMembership;
    return matchesSearch && matchesMembership;
  });

  const getMembershipInfo = (membershipId: string) => {
    return membershipTiers.find((t) => t.id === membershipId) || membershipTiers[0];
  };

  // Calculate stats
  const totalClients = clients.length;
  const vipClients = clients.filter(c => c.membershipStatus === 'gold' || c.membershipStatus === 'platinum').length;
  const totalPoints = clients.reduce((sum, c) => sum + (c.loyaltyPoints || 0), 0);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-pink-100 rounded-lg">
                <Users className="h-5 w-5 text-pink-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalClients}</p>
                <p className="text-sm text-gray-500">Total Clientes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Crown className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{vipClients}</p>
                <p className="text-sm text-gray-500">Clientes VIP</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Calendar className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{Math.min(totalClients, 156)}</p>
                <p className="text-sm text-gray-500">Nuevos este Mes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Gift className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalPoints.toLocaleString()}</p>
                <p className="text-sm text-gray-500">Puntos Activos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar cliente..."
              className="w-64 pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={filterMembership} onValueChange={setFilterMembership}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Membresía" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las membresías</SelectItem>
              {membershipTiers.map((tier) => (
                <SelectItem key={tier.id} value={tier.id}>
                  {tier.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Dialog open={newClientOpen} onOpenChange={setNewClientOpen}>
          <DialogTrigger asChild>
            <Button className="bg-pink-500 hover:bg-pink-600">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Cliente
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Nuevo Cliente</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Nombre *
                  </label>
                  <Input 
                    placeholder="Nombre"
                    value={formData.firstName}
                    onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Apellido *
                  </label>
                  <Input 
                    placeholder="Apellido"
                    value={formData.lastName}
                    onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Teléfono *
                </label>
                <Input 
                  placeholder="868-XXX-XXXX"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Email
                </label>
                <Input 
                  type="email" 
                  placeholder="correo@ejemplo.com"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Membresía
                </label>
                <Select 
                  value={formData.membership} 
                  onValueChange={(v) => setFormData(prev => ({ ...prev, membership: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {membershipTiers.map((tier) => (
                      <SelectItem key={tier.id} value={tier.id}>
                        {tier.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Notas
                </label>
                <Input 
                  placeholder="Alergias, preferencias..."
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                />
              </div>
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setNewClientOpen(false)}
                  disabled={saving}
                >
                  Cancelar
                </Button>
                <Button
                  className="flex-1 bg-pink-500 hover:bg-pink-600"
                  onClick={handleCreateClient}
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    'Crear Cliente'
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
          <span className="ml-3 text-gray-500">Cargando clientes...</span>
        </div>
      )}

      {/* Clients List */}
      {!loading && (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                      Cliente
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                      Contacto
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                      Membresía
                    </th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">
                      Visitas
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">
                      Total Gastado
                    </th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">
                      Puntos
                    </th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClients.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-gray-500">
                        No se encontraron clientes. ¡Crea el primero!
                      </td>
                    </tr>
                  ) : (
                    filteredClients.map((client) => {
                      const membership = getMembershipInfo(client.membershipStatus);
                      return (
                        <tr
                          key={client.id}
                          className="border-b border-gray-100 hover:bg-gray-50"
                        >
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center">
                                <span className="text-pink-600 font-medium text-sm">
                                  {client.firstName?.[0] || 'C'}{client.lastName?.[0] || 'X'}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">
                                  {client.fullName}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {client.clientNumber}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-1 text-sm text-gray-600">
                                <Phone className="h-3 w-3" />
                                {client.phone}
                              </div>
                              {client.email && (
                                <div className="flex items-center gap-1 text-sm text-gray-600">
                                  <Mail className="h-3 w-3" />
                                  {client.email}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <Badge className={membership.color}>
                              {membership.name}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className="font-medium">{client.totalVisits}</span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <span className="font-medium">
                              TT${client.totalSpent.toLocaleString()}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className="font-medium text-purple-600">
                              {client.loyaltyPoints}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedClient(client)}
                              >
                                Ver
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Client Detail Dialog */}
      <Dialog
        open={!!selectedClient}
        onOpenChange={() => setSelectedClient(null)}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Detalles del Cliente</DialogTitle>
          </DialogHeader>
          {selectedClient && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-pink-100 flex items-center justify-center">
                  <span className="text-pink-600 font-bold text-xl">
                    {selectedClient.firstName?.[0] || 'C'}{selectedClient.lastName?.[0] || 'X'}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{selectedClient.fullName}</h3>
                  <p className="text-sm text-gray-500">
                    {selectedClient.clientNumber}
                  </p>
                  <Badge
                    className={getMembershipInfo(selectedClient.membershipStatus).color}
                  >
                    {getMembershipInfo(selectedClient.membershipStatus).name}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Teléfono</p>
                  <p className="font-medium">{selectedClient.phone}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{selectedClient.email || 'Sin email'}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Visitas Totales</p>
                  <p className="font-medium">{selectedClient.totalVisits}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Total Gastado</p>
                  <p className="font-medium">
                    TT${selectedClient.totalSpent.toLocaleString()}
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Puntos de Lealtad</p>
                  <p className="font-medium text-purple-600">
                    {selectedClient.loyaltyPoints}
                  </p>
                </div>
              </div>

              {selectedClient.notes && (
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <p className="text-sm font-medium text-yellow-700">Notas</p>
                  <p className="text-sm text-yellow-600">{selectedClient.notes}</p>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button variant="outline" className="flex-1">
                  <Calendar className="h-4 w-4 mr-2" />
                  Agendar Cita
                </Button>
                <Button className="flex-1 bg-pink-500 hover:bg-pink-600">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Nueva Venta
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
