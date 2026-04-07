'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Wrench,
  Plus,
  Filter,
  Search,
  Clock,
  AlertTriangle,
  CheckCircle,
  User,
  Building2,
  DollarSign,
  Camera,
  Calendar,
  MessageSquare,
  X,
  ChevronDown,
  ChevronUp,
  Trash2,
  Edit,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { AuroraBackground, CondoHeader, StatCard, StatusBadge, PageLoader, CondoCard, EmptyState, ConfirmDialog } from '@/components/condo';

// Types
interface MaintenanceRequest {
  id: string;
  requestNumber: string;
  category: string;
  priority: string;
  title: string;
  description: string;
  location?: string;
  status: string;
  images?: string;
  assignedTo?: string;
  assignedToName?: string;
  assignedAt?: string;
  completedAt?: string;
  completionNotes?: string;
  laborCost: number;
  materialsCost: number;
  totalCost: number;
  rating?: number;
  ratingComment?: string;
  createdAt: string;
  resident?: {
    firstName: string;
    lastName: string;
    unit?: { unitNumber: string };
  };
  tickets?: Array<{
    id: string;
    ticketNumber: string;
    status: string;
    totalCost: number;
  }>;
}

// Category icons and colors
const categoryConfig: Record<string, { icon: string; color: string }> = {
  plumbing: { icon: '🔧', color: 'cyan' },
  electrical: { icon: '⚡', color: 'gold' },
  hvac: { icon: '❄️', color: 'blue' },
  structural: { icon: '🏗️', color: 'violet' },
  common_area: { icon: '🏢', color: 'green' },
  emergency: { icon: '🚨', color: 'red' },
  other: { icon: '📋', color: 'violet' },
};

// Priority colors
const priorityColors: Record<string, string> = {
  low: 'bg-[#22D3EE]/20 text-[#22D3EE]',
  normal: 'bg-[#6C3FCE]/20 text-[#B197FC]',
  high: 'bg-[#F0B429]/20 text-[#F0B429]',
  urgent: 'bg-[#F87171]/20 text-[#F87171]',
  emergency: 'bg-[#dc2626]/20 text-[#F87171]',
};

export default function MaintenancePage() {
  const searchParams = useSearchParams();
  const propertyId = searchParams.get('propertyId') || 'default';

  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('list');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedRequest, setExpandedRequest] = useState<string | null>(null);

  // New request dialog
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [newRequest, setNewRequest] = useState({
    category: 'plumbing',
    priority: 'normal',
    title: '',
    description: '',
    location: '',
    accessInstructions: '',
    preferredTime: '',
  });
  const [submitting, setSubmitting] = useState(false);

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    assigned: 0,
    inProgress: 0,
    completed: 0,
    urgent: 0,
    totalCost: 0,
  });

  useEffect(() => {
    fetchRequests();
  }, [propertyId]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/condo/maintenance?propertyId=${propertyId}`);
      const data = await res.json();
      setRequests(data.requests || []);
      setStats(data.stats || {});
    } catch (error) {
      console.error('Error fetching maintenance requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRequest = async () => {
    if (!newRequest.title || !newRequest.description) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/condo/maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId,
          tenantId: 'default',
          residentId: 'demo-resident',
          ...newRequest,
        }),
      });

      if (res.ok) {
        setShowNewDialog(false);
        setNewRequest({
          category: 'plumbing',
          priority: 'normal',
          title: '',
          description: '',
          location: '',
          accessInstructions: '',
          preferredTime: '',
        });
        fetchRequests();
      }
    } catch (error) {
      console.error('Error creating request:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await fetch('/api/condo/maintenance', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      fetchRequests();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const filteredRequests = requests.filter(req => {
    const matchesStatus = filterStatus === 'all' || req.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || req.priority === filterPriority;
    const matchesSearch = !searchQuery || 
      req.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.requestNumber.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesPriority && matchesSearch;
  });

  // Group by status for kanban view
  const groupedRequests = {
    open: filteredRequests.filter(r => r.status === 'open'),
    assigned: filteredRequests.filter(r => r.status === 'assigned'),
    in_progress: filteredRequests.filter(r => r.status === 'in_progress'),
    completed: filteredRequests.filter(r => r.status === 'completed'),
  };

  if (loading) {
    return <PageLoader />;
  }

  return (
    <div className="min-h-screen bg-[#050410]">
      <AuroraBackground />
      
      <CondoHeader 
        title="Mantenimiento" 
        subtitle="Solicitudes y órdenes de trabajo"
        rightContent={
          <Button onClick={() => setShowNewDialog(true)} className="btn-nexus">
            <Plus className="w-4 h-4 mr-2" />
            Nueva Solicitud
          </Button>
        }
      />

      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Total Solicitudes"
            value={stats.total}
            icon={Wrench}
            color="violet"
          />
          <StatCard
            title="Abiertas"
            value={stats.open}
            icon={AlertTriangle}
            color="gold"
          />
          <StatCard
            title="En Progreso"
            value={stats.inProgress}
            icon={Clock}
            color="cyan"
          />
          <StatCard
            title="Completadas"
            value={stats.completed}
            icon={CheckCircle}
            color="green"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9D7BEA]" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar solicitud..."
              className="pl-10 bg-[#0A0820] border-[rgba(167,139,250,0.2)] text-[#EDE9FE]"
            />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-40 bg-[#0A0820] border-[rgba(167,139,250,0.2)] text-[#EDE9FE]">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent className="bg-[#0A0820] border-[rgba(167,139,250,0.2)]">
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="open">Abiertas</SelectItem>
              <SelectItem value="assigned">Asignadas</SelectItem>
              <SelectItem value="in_progress">En Progreso</SelectItem>
              <SelectItem value="completed">Completadas</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterPriority} onValueChange={setFilterPriority}>
            <SelectTrigger className="w-40 bg-[#0A0820] border-[rgba(167,139,250,0.2)] text-[#EDE9FE]">
              <SelectValue placeholder="Prioridad" />
            </SelectTrigger>
            <SelectContent className="bg-[#0A0820] border-[rgba(167,139,250,0.2)]">
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="low">Baja</SelectItem>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="high">Alta</SelectItem>
              <SelectItem value="urgent">Urgente</SelectItem>
              <SelectItem value="emergency">Emergencia</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-[#0A0820] border border-[rgba(167,139,250,0.2)] mb-6">
            <TabsTrigger value="list">Lista</TabsTrigger>
            <TabsTrigger value="kanban">Kanban</TabsTrigger>
            <TabsTrigger value="history">Historial</TabsTrigger>
          </TabsList>

          {/* List View */}
          <TabsContent value="list">
            <div className="space-y-4">
              {filteredRequests.length > 0 ? (
                filteredRequests.map(request => (
                  <Card 
                    key={request.id}
                    className="bg-[#0A0820]/80 border-[rgba(167,139,250,0.2)] hover:border-[rgba(167,139,250,0.4)] transition-all"
                  >
                    <CardContent className="p-4">
                      <div 
                        className="flex items-start justify-between cursor-pointer"
                        onClick={() => setExpandedRequest(expandedRequest === request.id ? null : request.id)}
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#6C3FCE] to-[#C026D3] flex items-center justify-center text-xl">
                            {categoryConfig[request.category]?.icon || '📋'}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-[#EDE9FE] font-medium">{request.title}</p>
                              <span className="text-xs text-[#9D7BEA] font-mono">#{request.requestNumber}</span>
                            </div>
                            <p className="text-sm text-[#9D7BEA] mt-1">{request.description}</p>
                            <div className="flex items-center gap-4 mt-2">
                              {request.location && (
                                <span className="text-xs text-[#9D7BEA] flex items-center gap-1">
                                  <Building2 className="w-3 h-3" />
                                  {request.location}
                                </span>
                              )}
                              {request.resident && (
                                <span className="text-xs text-[#9D7BEA] flex items-center gap-1">
                                  <User className="w-3 h-3" />
                                  {request.resident.firstName} {request.resident.lastName}
                                  {request.resident.unit && ` - ${request.resident.unit.unitNumber}`}
                                </span>
                              )}
                              <span className="text-xs text-[#9D7BEA] flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(request.createdAt).toLocaleDateString('es')}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${priorityColors[request.priority] || priorityColors.normal}`}>
                            {request.priority.toUpperCase()}
                          </span>
                          <StatusBadge status={request.status} />
                          {expandedRequest === request.id ? (
                            <ChevronUp className="w-4 h-4 text-[#9D7BEA]" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-[#9D7BEA]" />
                          )}
                        </div>
                      </div>

                      {/* Expanded Details */}
                      {expandedRequest === request.id && (
                        <div className="mt-4 pt-4 border-t border-[rgba(167,139,250,0.1)]">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h4 className="text-sm font-medium text-[#EDE9FE] mb-2">Detalles</h4>
                              <div className="space-y-2 text-sm">
                                {request.accessInstructions && (
                                  <p className="text-[#9D7BEA]">
                                    <strong>Acceso:</strong> {request.accessInstructions}
                                  </p>
                                )}
                                {request.preferredTime && (
                                  <p className="text-[#9D7BEA]">
                                    <strong>Horario preferido:</strong> {request.preferredTime}
                                  </p>
                                )}
                                {request.assignedToName && (
                                  <p className="text-[#9D7BEA]">
                                    <strong>Asignado a:</strong> {request.assignedToName}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div>
                              <h4 className="text-sm font-medium text-[#EDE9FE] mb-2">Costos</h4>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-[#9D7BEA]">Mano de obra:</span>
                                  <span className="text-[#EDE9FE]">${request.laborCost}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-[#9D7BEA]">Materiales:</span>
                                  <span className="text-[#EDE9FE]">${request.materialsCost}</span>
                                </div>
                                <div className="flex justify-between font-medium">
                                  <span className="text-[#F0B429]">Total:</span>
                                  <span className="text-[#F0B429]">${request.totalCost}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-2 mt-4">
                            {request.status === 'open' && (
                              <Button
                                size="sm"
                                onClick={() => handleUpdateStatus(request.id, 'assigned')}
                                className="btn-nexus"
                              >
                                Asignar
                              </Button>
                            )}
                            {request.status === 'assigned' && (
                              <Button
                                size="sm"
                                onClick={() => handleUpdateStatus(request.id, 'in_progress')}
                                className="btn-nexus"
                              >
                                Iniciar Trabajo
                              </Button>
                            )}
                            {request.status === 'in_progress' && (
                              <Button
                                size="sm"
                                onClick={() => handleUpdateStatus(request.id, 'completed')}
                                className="bg-[#34D399] hover:bg-[#059669]"
                              >
                                Completar
                              </Button>
                            )}
                            <Button size="sm" variant="outline" className="border-[rgba(167,139,250,0.2)] text-[#9D7BEA]">
                              <MessageSquare className="w-4 h-4 mr-1" />
                              Comentar
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              ) : (
                <EmptyState
                  icon={Wrench}
                  title="No hay solicitudes"
                  description="No se encontraron solicitudes de mantenimiento con los filtros seleccionados"
                  action={{
                    label: "Nueva Solicitud",
                    onClick: () => setShowNewDialog(true)
                  }}
                />
              )}
            </div>
          </TabsContent>

          {/* Kanban View */}
          <TabsContent value="kanban">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(groupedRequests).map(([status, reqs]) => (
                <div key={status} className="space-y-3">
                  <div className="flex items-center justify-between px-3">
                    <h3 className="text-sm font-medium text-[#EDE9FE] capitalize">
                      {status.replace('_', ' ')}
                    </h3>
                    <Badge variant="outline" className="border-[rgba(167,139,250,0.2)] text-[#9D7BEA]">
                      {reqs.length}
                    </Badge>
                  </div>
                  <div className="space-y-3 min-h-[200px]">
                    {reqs.map(req => (
                      <Card 
                        key={req.id}
                        className="bg-[#0A0820]/80 border-[rgba(167,139,250,0.2)] hover:border-[rgba(167,139,250,0.4)] transition-all cursor-pointer"
                      >
                        <CardContent className="p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-lg">{categoryConfig[req.category]?.icon || '📋'}</span>
                            <span className={`px-2 py-0.5 rounded text-xs ${priorityColors[req.priority]}`}>
                              {req.priority}
                            </span>
                          </div>
                          <p className="text-[#EDE9FE] text-sm font-medium mb-1">{req.title}</p>
                          <p className="text-xs text-[#9D7BEA] line-clamp-2">{req.description}</p>
                          <div className="flex items-center justify-between mt-2 pt-2 border-t border-[rgba(167,139,250,0.1)]">
                            <span className="text-xs text-[#9D7BEA]">#{req.requestNumber}</span>
                            {req.assignedToName && (
                              <span className="text-xs text-[#B197FC]">{req.assignedToName}</span>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* History View */}
          <TabsContent value="history">
            <CondoCard title="Historial de Mantenimiento" icon={Clock}>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[rgba(167,139,250,0.1)]">
                      <th className="text-left p-3 text-[#9D7BEA] font-medium text-sm"># Solicitud</th>
                      <th className="text-left p-3 text-[#9D7BEA] font-medium text-sm">Título</th>
                      <th className="text-left p-3 text-[#9D7BEA] font-medium text-sm">Categoría</th>
                      <th className="text-left p-3 text-[#9D7BEA] font-medium text-sm">Fecha</th>
                      <th className="text-right p-3 text-[#9D7BEA] font-medium text-sm">Costo</th>
                      <th className="text-center p-3 text-[#9D7BEA] font-medium text-sm">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map(req => (
                      <tr key={req.id} className="border-b border-[rgba(167,139,250,0.05)] hover:bg-[rgba(108,63,206,0.05)]">
                        <td className="p-3 text-[#B197FC] font-mono text-sm">{req.requestNumber}</td>
                        <td className="p-3 text-[#EDE9FE] text-sm">{req.title}</td>
                        <td className="p-3 text-[#9D7BEA] text-sm capitalize">{req.category}</td>
                        <td className="p-3 text-[#9D7BEA] text-sm">
                          {new Date(req.createdAt).toLocaleDateString('es')}
                        </td>
                        <td className="p-3 text-right text-[#F0B429] font-medium">
                          ${req.totalCost.toLocaleString()}
                        </td>
                        <td className="p-3 text-center">
                          <StatusBadge status={req.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CondoCard>
          </TabsContent>
        </Tabs>
      </main>

      {/* New Request Dialog */}
      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent className="bg-[#0A0820] border-[rgba(167,139,250,0.2)] text-[#EDE9FE] max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-[#EDE9FE]">Nueva Solicitud de Mantenimiento</DialogTitle>
            <DialogDescription className="text-[#9D7BEA]">
              Describa el problema o requerimiento de mantenimiento
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[#9D7BEA]">Categoría</Label>
                <Select
                  value={newRequest.category}
                  onValueChange={(v) => setNewRequest(prev => ({ ...prev, category: v }))}
                >
                  <SelectTrigger className="bg-[#050410] border-[rgba(167,139,250,0.2)]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0A0820] border-[rgba(167,139,250,0.2)]">
                    <SelectItem value="plumbing" className="text-[#EDE9FE]">🔧 Plomería</SelectItem>
                    <SelectItem value="electrical" className="text-[#EDE9FE]">⚡ Eléctrico</SelectItem>
                    <SelectItem value="hvac" className="text-[#EDE9FE]">❄️ A/C y Calefacción</SelectItem>
                    <SelectItem value="structural" className="text-[#EDE9FE]">🏗️ Estructural</SelectItem>
                    <SelectItem value="common_area" className="text-[#EDE9FE]">🏢 Área Común</SelectItem>
                    <SelectItem value="emergency" className="text-[#EDE9FE]">🚨 Emergencia</SelectItem>
                    <SelectItem value="other" className="text-[#EDE9FE]">📋 Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-[#9D7BEA]">Prioridad</Label>
                <Select
                  value={newRequest.priority}
                  onValueChange={(v) => setNewRequest(prev => ({ ...prev, priority: v }))}
                >
                  <SelectTrigger className="bg-[#050410] border-[rgba(167,139,250,0.2)]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0A0820] border-[rgba(167,139,250,0.2)]">
                    <SelectItem value="low" className="text-[#EDE9FE]">Baja</SelectItem>
                    <SelectItem value="normal" className="text-[#EDE9FE]">Normal</SelectItem>
                    <SelectItem value="high" className="text-[#EDE9FE]">Alta</SelectItem>
                    <SelectItem value="urgent" className="text-[#EDE9FE]">Urgente</SelectItem>
                    <SelectItem value="emergency" className="text-[#EDE9FE]">Emergencia</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[#9D7BEA]">Título *</Label>
              <Input
                value={newRequest.title}
                onChange={(e) => setNewRequest(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Ej: Fuga de agua en cocina"
                className="bg-[#050410] border-[rgba(167,139,250,0.2)]"
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[#9D7BEA]">Descripción *</Label>
              <Textarea
                value={newRequest.description}
                onChange={(e) => setNewRequest(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describa el problema en detalle..."
                className="bg-[#050410] border-[rgba(167,139,250,0.2)]"
                rows={3}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[#9D7BEA]">Ubicación</Label>
                <Input
                  value={newRequest.location}
                  onChange={(e) => setNewRequest(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="Ej: Cocina, Baño principal..."
                  className="bg-[#050410] border-[rgba(167,139,250,0.2)]"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[#9D7BEA]">Horario Preferido</Label>
                <Input
                  value={newRequest.preferredTime}
                  onChange={(e) => setNewRequest(prev => ({ ...prev, preferredTime: e.target.value }))}
                  placeholder="Ej: Mañana, Tarde..."
                  className="bg-[#050410] border-[rgba(167,139,250,0.2)]"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[#9D7BEA]">Instrucciones de Acceso</Label>
              <Textarea
                value={newRequest.accessInstructions}
                onChange={(e) => setNewRequest(prev => ({ ...prev, accessInstructions: e.target.value }))}
                placeholder="Ej: Llave bajo el macetero, código de acceso..."
                className="bg-[#050410] border-[rgba(167,139,250,0.2)]"
                rows={2}
              />
            </div>

            {/* Photo Upload Placeholder */}
            <div className="space-y-2">
              <Label className="text-[#9D7BEA]">Fotos (Opcional)</Label>
              <div className="flex items-center justify-center w-full h-24 border-2 border-dashed border-[rgba(167,139,250,0.2)] rounded-lg cursor-pointer hover:border-[rgba(167,139,250,0.4)] transition-colors">
                <div className="text-center">
                  <Camera className="w-6 h-6 text-[#9D7BEA] mx-auto mb-1" />
                  <span className="text-xs text-[#9D7BEA]">Subir fotos</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowNewDialog(false)}
                className="border-[rgba(167,139,250,0.2)] text-[#9D7BEA]"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleCreateRequest}
                disabled={!newRequest.title || !newRequest.description || submitting}
                className="btn-nexus"
              >
                {submitting ? 'Enviando...' : 'Enviar Solicitud'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
