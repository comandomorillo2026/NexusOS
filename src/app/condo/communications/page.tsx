'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Bell,
  Plus,
  Search,
  Megaphone,
  Vote,
  AlertCircle,
  Info,
  Calendar,
  Users,
  CheckCircle,
  Clock,
  BarChart3,
  Send,
  Eye,
  Trash2,
  Edit,
  FileText,
  X,
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
import { Switch } from '@/components/ui/switch';
import { AuroraBackground, CondoHeader, StatCard, StatusBadge, PageLoader, CondoCard, EmptyState } from '@/components/condo';

// Types
interface Announcement {
  id: string;
  title: string;
  content: string;
  category: string;
  priority: string;
  publishDate: string;
  expireDate?: string;
  authorName?: string;
  status: string;
  sendEmail: boolean;
  sendSMS: boolean;
  sendPush: boolean;
  attachments?: string;
  createdAt: string;
  _count?: { reads: number };
}

interface Vote {
  id: string;
  title: string;
  description?: string;
  type: string;
  options: string;
  startDate: string;
  endDate: string;
  status: string;
  totalEligible: number;
  totalVotes: number;
  requiresQuorum: boolean;
  quorumPercentage: number;
  isAnonymous: boolean;
  createdByName?: string;
  hasVoted?: boolean;
}

// Category icons and colors
const categoryConfig: Record<string, { icon: React.ElementType; color: string }> = {
  general: { icon: Info, color: 'violet' },
  maintenance: { icon: Bell, color: 'cyan' },
  emergency: { icon: AlertCircle, color: 'red' },
  event: { icon: Calendar, color: 'green' },
  meeting: { icon: Users, color: 'gold' },
};

// Priority colors
const priorityColors: Record<string, string> = {
  low: 'bg-[#22D3EE]/20 text-[#22D3EE] border-[#22D3EE]/30',
  normal: 'bg-[#6C3FCE]/20 text-[#B197FC] border-[#6C3FCE]/30',
  high: 'bg-[#F0B429]/20 text-[#F0B429] border-[#F0B429]/30',
  urgent: 'bg-[#F87171]/20 text-[#F87171] border-[#F87171]/30',
};

export default function CommunicationsPage() {
  const searchParams = useSearchParams();
  const propertyId = searchParams.get('propertyId') || 'default';

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('announcements');
  const [searchQuery, setSearchQuery] = useState('');

  // New announcement dialog
  const [showAnnouncementDialog, setShowAnnouncementDialog] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    content: '',
    category: 'general',
    priority: 'normal',
    sendEmail: true,
    sendPush: true,
    sendSMS: false,
  });
  const [submitting, setSubmitting] = useState(false);

  // New vote dialog
  const [showVoteDialog, setShowVoteDialog] = useState(false);
  const [newVote, setNewVote] = useState({
    title: '',
    description: '',
    type: 'simple',
    options: [{ id: '1', text: '' }, { id: '2', text: '' }],
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    requiresQuorum: true,
    quorumPercentage: 51,
    isAnonymous: true,
  });

  // Vote detail dialog
  const [selectedVote, setSelectedVote] = useState<Vote | null>(null);
  const [showVoteDetailDialog, setShowVoteDetailDialog] = useState(false);
  const [voteResults, setVoteResults] = useState<Array<{ id: string; text: string; votes: number; percentage: string }>>([]);

  // Stats
  const [announcementStats, setAnnouncementStats] = useState({
    total: 0,
    published: 0,
    urgent: 0,
  });
  const [voteStats, setVoteStats] = useState({
    total: 0,
    active: 0,
    upcoming: 0,
  });

  useEffect(() => {
    fetchData();
  }, [propertyId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [annRes, votesRes] = await Promise.all([
        fetch(`/api/condo/announcements?propertyId=${propertyId}`),
        fetch(`/api/condo/votes?propertyId=${propertyId}`),
      ]);
      
      const annData = await annRes.json();
      const votesData = await votesRes.json();
      
      setAnnouncements(annData.announcements || []);
      setAnnouncementStats(annData.stats || {});
      setVotes(votesData.votes || []);
      setVoteStats(votesData.stats || {});
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAnnouncement = async () => {
    if (!newAnnouncement.title || !newAnnouncement.content) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/condo/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId,
          tenantId: 'default',
          authorId: 'demo-user',
          authorName: 'Administrador',
          ...newAnnouncement,
          publishDate: new Date().toISOString().split('T')[0],
        }),
      });

      if (res.ok) {
        setShowAnnouncementDialog(false);
        setNewAnnouncement({
          title: '',
          content: '',
          category: 'general',
          priority: 'normal',
          sendEmail: true,
          sendPush: true,
          sendSMS: false,
        });
        fetchData();
      }
    } catch (error) {
      console.error('Error creating announcement:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateVote = async () => {
    if (!newVote.title || newVote.options.filter(o => o.text).length < 2) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/condo/votes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId,
          tenantId: 'default',
          createdBy: 'demo-user',
          createdByName: 'Administrador',
          ...newVote,
          options: JSON.stringify(newVote.options.filter(o => o.text)),
        }),
      });

      if (res.ok) {
        setShowVoteDialog(false);
        setNewVote({
          title: '',
          description: '',
          type: 'simple',
          options: [{ id: '1', text: '' }, { id: '2', text: '' }],
          startDate: new Date().toISOString().split('T')[0],
          endDate: '',
          requiresQuorum: true,
          quorumPercentage: 51,
          isAnonymous: true,
        });
        fetchData();
      }
    } catch (error) {
      console.error('Error creating vote:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleViewVote = async (vote: Vote) => {
    setSelectedVote(vote);
    
    // Parse options
    const options = JSON.parse(vote.options);
    const results = options.map((opt: { id: string; text: string }) => ({
      ...opt,
      votes: Math.floor(Math.random() * 20), // Mock data
      percentage: '0',
    }));
    
    // Calculate percentages
    const totalVotes = results.reduce((sum: number, r: { votes: number }) => sum + r.votes, 0);
    results.forEach((r: { votes: number; percentage: string }) => {
      r.percentage = totalVotes > 0 ? ((r.votes / totalVotes) * 100).toFixed(1) : '0';
    });
    
    setVoteResults(results);
    setShowVoteDetailDialog(true);
  };

  const handleSubmitVote = async (voteId: string, optionId: string) => {
    try {
      await fetch('/api/condo/votes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: voteId,
          action: 'submit_vote',
          residentId: 'demo-resident',
          propertyId,
          response: optionId,
        }),
      });
      
      setShowVoteDetailDialog(false);
      fetchData();
    } catch (error) {
      console.error('Error submitting vote:', error);
    }
  };

  const filteredAnnouncements = announcements.filter(ann => 
    ann.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ann.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return <PageLoader />;
  }

  return (
    <div className="min-h-screen bg-[#050410]">
      <AuroraBackground />
      
      <CondoHeader 
        title="Comunicaciones" 
        subtitle="Anuncios y votaciones"
        rightContent={
          <div className="flex gap-2">
            <Button onClick={() => setShowVoteDialog(true)} variant="outline" className="border-[rgba(167,139,250,0.2)] text-[#9D7BEA]">
              <Vote className="w-4 h-4 mr-2" />
              Nueva Votación
            </Button>
            <Button onClick={() => setShowAnnouncementDialog(true)} className="btn-nexus">
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Anuncio
            </Button>
          </div>
        }
      />

      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Anuncios"
            value={announcementStats.total}
            icon={Megaphone}
            color="violet"
          />
          <StatCard
            title="Urgentes"
            value={announcementStats.urgent}
            icon={AlertCircle}
            color="red"
          />
          <StatCard
            title="Votaciones Activas"
            value={voteStats.active}
            icon={Vote}
            color="cyan"
          />
          <StatCard
            title="Próximas"
            value={voteStats.upcoming}
            icon={Clock}
            color="gold"
          />
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-[#0A0820] border border-[rgba(167,139,250,0.2)] mb-6">
            <TabsTrigger value="announcements">
              <Megaphone className="w-4 h-4 mr-2" />
              Anuncios
            </TabsTrigger>
            <TabsTrigger value="votes">
              <Vote className="w-4 h-4 mr-2" />
              Votaciones
            </TabsTrigger>
          </TabsList>

          {/* Announcements Tab */}
          <TabsContent value="announcements">
            {/* Search */}
            <div className="relative mb-6 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9D7BEA]" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar anuncios..."
                className="pl-10 bg-[#0A0820] border-[rgba(167,139,250,0.2)] text-[#EDE9FE]"
              />
            </div>

            <div className="space-y-4">
              {filteredAnnouncements.length > 0 ? (
                filteredAnnouncements.map(announcement => {
                  const Icon = categoryConfig[announcement.category]?.icon || Info;
                  return (
                    <Card 
                      key={announcement.id}
                      className="bg-[#0A0820]/80 border-[rgba(167,139,250,0.2)] hover:border-[rgba(167,139,250,0.4)] transition-all"
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#6C3FCE] to-[#C026D3] flex items-center justify-center">
                              <Icon className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-[#EDE9FE] font-medium">{announcement.title}</h3>
                                <span className={`px-2 py-0.5 rounded text-xs ${priorityColors[announcement.priority] || priorityColors.normal}`}>
                                  {announcement.priority}
                                </span>
                              </div>
                              <p className="text-sm text-[#9D7BEA] line-clamp-2">{announcement.content}</p>
                              <div className="flex items-center gap-4 mt-2 text-xs text-[#9D7BEA]">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {new Date(announcement.publishDate).toLocaleDateString('es')}
                                </span>
                                {announcement.authorName && (
                                  <span className="flex items-center gap-1">
                                    <Users className="w-3 h-3" />
                                    {announcement.authorName}
                                  </span>
                                )}
                                {announcement._count && (
                                  <span className="flex items-center gap-1">
                                    <Eye className="w-3 h-3" />
                                    {announcement._count.reads} lecturas
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <StatusBadge status={announcement.status} />
                        </div>

                        {/* Notification Channels */}
                        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-[rgba(167,139,250,0.1)]">
                          <span className="text-xs text-[#9D7BEA]">Enviado por:</span>
                          {announcement.sendEmail && (
                            <Badge variant="outline" className="border-[rgba(167,139,250,0.2)] text-[#B197FC]">
                              Email
                            </Badge>
                          )}
                          {announcement.sendPush && (
                            <Badge variant="outline" className="border-[rgba(167,139,250,0.2)] text-[#B197FC]">
                              Push
                            </Badge>
                          )}
                          {announcement.sendSMS && (
                            <Badge variant="outline" className="border-[rgba(167,139,250,0.2)] text-[#B197FC]">
                              SMS
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              ) : (
                <EmptyState
                  icon={Megaphone}
                  title="No hay anuncios"
                  description="Crea un nuevo anuncio para comunicarte con los residentes"
                  action={{
                    label: "Nuevo Anuncio",
                    onClick: () => setShowAnnouncementDialog(true)
                  }}
                />
              )}
            </div>
          </TabsContent>

          {/* Votes Tab */}
          <TabsContent value="votes">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {votes.length > 0 ? (
                votes.map(vote => (
                  <Card 
                    key={vote.id}
                    className="bg-[#0A0820]/80 border-[rgba(167,139,250,0.2)] hover:border-[rgba(167,139,250,0.4)] transition-all cursor-pointer"
                    onClick={() => handleViewVote(vote)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6C3FCE] to-[#C026D3] flex items-center justify-center">
                            <Vote className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <CardTitle className="text-[#EDE9FE] text-base">{vote.title}</CardTitle>
                            <CardDescription className="text-[#9D7BEA] text-xs">
                              {vote.type === 'simple' ? 'Votación simple' : 'Opción múltiple'}
                            </CardDescription>
                          </div>
                        </div>
                        <StatusBadge status={vote.status} size="sm" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      {vote.description && (
                        <p className="text-sm text-[#9D7BEA] mb-4 line-clamp-2">{vote.description}</p>
                      )}
                      
                      {/* Progress */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-[#9D7BEA]">Participación</span>
                          <span className="text-[#EDE9FE]">
                            {vote.totalVotes} / {vote.totalEligible} votos
                          </span>
                        </div>
                        <Progress 
                          value={vote.totalEligible > 0 ? (vote.totalVotes / vote.totalEligible) * 100 : 0}
                          className="h-2 bg-[rgba(167,139,250,0.1)]"
                        />
                        {vote.requiresQuorum && (
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-[#9D7BEA]">Quórum requerido: {vote.quorumPercentage}%</span>
                            {vote.totalEligible > 0 && (vote.totalVotes / vote.totalEligible) * 100 >= vote.quorumPercentage ? (
                              <span className="text-[#34D399]">✓ Alcanzado</span>
                            ) : (
                              <span className="text-[#F0B429]">Pendiente</span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Dates */}
                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-[rgba(167,139,250,0.1)] text-xs">
                        <span className="text-[#9D7BEA]">
                          Del {new Date(vote.startDate).toLocaleDateString('es')}
                        </span>
                        <span className="text-[#9D7BEA]">
                          Al {new Date(vote.endDate).toLocaleDateString('es')}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-full">
                  <EmptyState
                    icon={Vote}
                    title="No hay votaciones"
                    description="Crea una nueva votación para obtener la opinión de los residentes"
                    action={{
                      label: "Nueva Votación",
                      onClick: () => setShowVoteDialog(true)
                    }}
                  />
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* New Announcement Dialog */}
      <Dialog open={showAnnouncementDialog} onOpenChange={setShowAnnouncementDialog}>
        <DialogContent className="bg-[#0A0820] border-[rgba(167,139,250,0.2)] text-[#EDE9FE] max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-[#EDE9FE]">Nuevo Anuncio</DialogTitle>
            <DialogDescription className="text-[#9D7BEA]">
              Crear un nuevo anuncio para los residentes
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[#9D7BEA]">Categoría</Label>
                <Select
                  value={newAnnouncement.category}
                  onValueChange={(v) => setNewAnnouncement(prev => ({ ...prev, category: v }))}
                >
                  <SelectTrigger className="bg-[#050410] border-[rgba(167,139,250,0.2)]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0A0820] border-[rgba(167,139,250,0.2)]">
                    <SelectItem value="general" className="text-[#EDE9FE]">General</SelectItem>
                    <SelectItem value="maintenance" className="text-[#EDE9FE]">Mantenimiento</SelectItem>
                    <SelectItem value="emergency" className="text-[#EDE9FE]">Emergencia</SelectItem>
                    <SelectItem value="event" className="text-[#EDE9FE]">Evento</SelectItem>
                    <SelectItem value="meeting" className="text-[#EDE9FE]">Asamblea</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-[#9D7BEA]">Prioridad</Label>
                <Select
                  value={newAnnouncement.priority}
                  onValueChange={(v) => setNewAnnouncement(prev => ({ ...prev, priority: v }))}
                >
                  <SelectTrigger className="bg-[#050410] border-[rgba(167,139,250,0.2)]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0A0820] border-[rgba(167,139,250,0.2)]">
                    <SelectItem value="low" className="text-[#EDE9FE]">Baja</SelectItem>
                    <SelectItem value="normal" className="text-[#EDE9FE]">Normal</SelectItem>
                    <SelectItem value="high" className="text-[#EDE9FE]">Alta</SelectItem>
                    <SelectItem value="urgent" className="text-[#EDE9FE]">Urgente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[#9D7BEA]">Título *</Label>
              <Input
                value={newAnnouncement.title}
                onChange={(e) => setNewAnnouncement(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Título del anuncio"
                className="bg-[#050410] border-[rgba(167,139,250,0.2)]"
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[#9D7BEA]">Contenido *</Label>
              <Textarea
                value={newAnnouncement.content}
                onChange={(e) => setNewAnnouncement(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Escribe el mensaje..."
                className="bg-[#050410] border-[rgba(167,139,250,0.2)]"
                rows={4}
                required
              />
            </div>

            {/* Notification Channels */}
            <div className="space-y-3">
              <Label className="text-[#9D7BEA]">Canales de Notificación</Label>
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <Switch
                    checked={newAnnouncement.sendEmail}
                    onCheckedChange={(v) => setNewAnnouncement(prev => ({ ...prev, sendEmail: v }))}
                  />
                  <span className="text-sm text-[#EDE9FE]">Email</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <Switch
                    checked={newAnnouncement.sendPush}
                    onCheckedChange={(v) => setNewAnnouncement(prev => ({ ...prev, sendPush: v }))}
                  />
                  <span className="text-sm text-[#EDE9FE]">Push</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <Switch
                    checked={newAnnouncement.sendSMS}
                    onCheckedChange={(v) => setNewAnnouncement(prev => ({ ...prev, sendSMS: v }))}
                  />
                  <span className="text-sm text-[#EDE9FE]">SMS</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowAnnouncementDialog(false)}
                className="border-[rgba(167,139,250,0.2)] text-[#9D7BEA]"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleCreateAnnouncement}
                disabled={!newAnnouncement.title || !newAnnouncement.content || submitting}
                className="btn-nexus"
              >
                <Send className="w-4 h-4 mr-2" />
                {submitting ? 'Publicando...' : 'Publicar Anuncio'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* New Vote Dialog */}
      <Dialog open={showVoteDialog} onOpenChange={setShowVoteDialog}>
        <DialogContent className="bg-[#0A0820] border-[rgba(167,139,250,0.2)] text-[#EDE9FE] max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-[#EDE9FE]">Nueva Votación</DialogTitle>
            <DialogDescription className="text-[#9D7BEA]">
              Crear una nueva votación electrónica
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label className="text-[#9D7BEA]">Título *</Label>
              <Input
                value={newVote.title}
                onChange={(e) => setNewVote(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Ej: Aprobación de presupuesto 2024"
                className="bg-[#050410] border-[rgba(167,139,250,0.2)]"
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[#9D7BEA]">Descripción</Label>
              <Textarea
                value={newVote.description}
                onChange={(e) => setNewVote(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe el tema de votación..."
                className="bg-[#050410] border-[rgba(167,139,250,0.2)]"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[#9D7BEA]">Fecha Inicio</Label>
                <Input
                  type="date"
                  value={newVote.startDate}
                  onChange={(e) => setNewVote(prev => ({ ...prev, startDate: e.target.value }))}
                  className="bg-[#050410] border-[rgba(167,139,250,0.2)]"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[#9D7BEA]">Fecha Fin *</Label>
                <Input
                  type="date"
                  value={newVote.endDate}
                  onChange={(e) => setNewVote(prev => ({ ...prev, endDate: e.target.value }))}
                  className="bg-[#050410] border-[rgba(167,139,250,0.2)]"
                  required
                />
              </div>
            </div>

            {/* Options */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-[#9D7BEA]">Opciones</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setNewVote(prev => ({
                    ...prev,
                    options: [...prev.options, { id: String(prev.options.length + 1), text: '' }]
                  }))}
                  className="text-[#9D7BEA]"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {newVote.options.map((option, index) => (
                <div key={option.id} className="flex items-center gap-2">
                  <span className="text-sm text-[#9D7BEA] w-6">{index + 1}.</span>
                  <Input
                    value={option.text}
                    onChange={(e) => {
                      const newOptions = [...newVote.options];
                      newOptions[index].text = e.target.value;
                      setNewVote(prev => ({ ...prev, options: newOptions }));
                    }}
                    placeholder={`Opción ${index + 1}`}
                    className="bg-[#050410] border-[rgba(167,139,250,0.2)]"
                  />
                  {newVote.options.length > 2 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setNewVote(prev => ({
                        ...prev,
                        options: prev.options.filter(o => o.id !== option.id)
                      }))}
                      className="text-[#F87171]"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            {/* Quorum Settings */}
            <div className="p-4 rounded-lg bg-[rgba(108,63,206,0.1)] border border-[rgba(167,139,250,0.2)] space-y-3">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm text-[#EDE9FE]">Requiere quórum</span>
                <Switch
                  checked={newVote.requiresQuorum}
                  onCheckedChange={(v) => setNewVote(prev => ({ ...prev, requiresQuorum: v }))}
                />
              </label>
              {newVote.requiresQuorum && (
                <div className="flex items-center gap-2">
                  <Label className="text-[#9D7BEA]">Porcentaje:</Label>
                  <Input
                    type="number"
                    value={newVote.quorumPercentage}
                    onChange={(e) => setNewVote(prev => ({ ...prev, quorumPercentage: parseInt(e.target.value) || 51 }))}
                    className="w-20 bg-[#050410] border-[rgba(167,139,250,0.2)]"
                    min={1}
                    max={100}
                  />
                  <span className="text-[#9D7BEA]">%</span>
                </div>
              )}
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm text-[#EDE9FE]">Voto anónimo</span>
                <Switch
                  checked={newVote.isAnonymous}
                  onCheckedChange={(v) => setNewVote(prev => ({ ...prev, isAnonymous: v }))}
                />
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowVoteDialog(false)}
                className="border-[rgba(167,139,250,0.2)] text-[#9D7BEA]"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleCreateVote}
                disabled={!newVote.title || !newVote.endDate || newVote.options.filter(o => o.text).length < 2 || submitting}
                className="btn-nexus"
              >
                {submitting ? 'Creando...' : 'Crear Votación'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Vote Detail Dialog */}
      <Dialog open={showVoteDetailDialog} onOpenChange={setShowVoteDetailDialog}>
        <DialogContent className="bg-[#0A0820] border-[rgba(167,139,250,0.2)] text-[#EDE9FE] max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-[#EDE9FE]">{selectedVote?.title}</DialogTitle>
            <DialogDescription className="text-[#9D7BEA]">
              {selectedVote?.description}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {/* Results */}
            <div className="space-y-3">
              {voteResults.map((result, index) => (
                <div key={result.id} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[#EDE9FE]">{result.text}</span>
                    <span className="text-[#9D7BEA] text-sm">{result.votes} votos ({result.percentage}%)</span>
                  </div>
                  <Progress 
                    value={parseFloat(result.percentage)}
                    className="h-2 bg-[rgba(167,139,250,0.1)]"
                  />
                </div>
              ))}
            </div>

            {/* Vote Buttons */}
            {selectedVote?.status === 'active' && !selectedVote.hasVoted && (
              <div className="grid grid-cols-2 gap-2 pt-4">
                {voteResults.map(result => (
                  <Button
                    key={result.id}
                    onClick={() => handleSubmitVote(selectedVote.id, result.id)}
                    className="btn-nexus"
                  >
                    {result.text}
                  </Button>
                ))}
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[rgba(167,139,250,0.1)]">
              <div className="text-center p-3 rounded-lg bg-[rgba(108,63,206,0.1)]">
                <p className="text-2xl font-bold text-[#EDE9FE]">{selectedVote?.totalVotes}</p>
                <p className="text-xs text-[#9D7BEA]">Votos emitidos</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-[rgba(108,63,206,0.1)]">
                <p className="text-2xl font-bold text-[#EDE9FE]">
                  {selectedVote && selectedVote.totalEligible > 0 
                    ? ((selectedVote.totalVotes / selectedVote.totalEligible) * 100).toFixed(0)
                    : 0}%
                </p>
                <p className="text-xs text-[#9D7BEA]">Participación</p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
