'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Megaphone,
  Send,
  Users,
  Building2,
  Search,
  Filter,
  CheckCircle,
  Clock,
  Eye,
  X,
  RefreshCw,
  Mail,
  Calendar,
  ChevronRight,
  AlertCircle
} from 'lucide-react';

// ============================================
// BROADCAST TYPES
// ============================================
interface Recipient {
  id: string;
  businessName: string;
  ownerName: string;
  email: string;
  industry: string;
  status: 'active' | 'pending' | 'suspended';
}

interface Broadcast {
  id: string;
  subject: string;
  message: string;
  recipientType: 'all' | 'industry' | 'specific';
  recipientCount: number;
  industries?: string[];
  recipients?: string[];
  sentAt: Date;
  status: 'sent' | 'partial' | 'failed';
  openRate?: number;
}

// ============================================
// MOCK DATA
// ============================================
const MOCK_RECIPIENTS: Recipient[] = [
  { id: '1', businessName: 'Clínica San Fernando', ownerName: 'Dr. Juan Pérez', email: 'juan@clinica.tt', industry: 'clinic', status: 'active' },
  { id: '2', businessName: 'Bufete Pérez & Asociados', ownerName: 'Lic. María Pérez', email: 'maria@bufete.tt', industry: 'lawfirm', status: 'active' },
  { id: '3', businessName: 'Salón Bella Vista', ownerName: 'Ana Gómez', email: 'ana@bella.tt', industry: 'beauty', status: 'active' },
  { id: '4', businessName: 'Panadería Dulce Hogar', ownerName: 'Carlos Rodríguez', email: 'carlos@dulce.tt', industry: 'bakery', status: 'pending' },
  { id: '5', businessName: 'Home Care Trinidad', ownerName: 'Enf. Luisa Martínez', email: 'luisa@homecare.tt', industry: 'nurse', status: 'active' },
  { id: '6', businessName: 'Farmacia Salud Plus', ownerName: 'Dr. Pedro Sánchez', email: 'pedro@farmacia.tt', industry: 'pharmacy', status: 'suspended' },
];

const MOCK_BROADCASTS: Broadcast[] = [
  {
    id: '1',
    subject: 'Actualización de Sistema - Nueva Versión 2.5',
    message: 'Estimados clientes,\n\nLes informamos que hemos lanzado la versión 2.5 de NexusOS con las siguientes mejoras:\n\n- Nuevo módulo de reportes avanzados\n- Mejoras en el sistema de facturación\n- Corrección de errores\n\nLa actualización será automática y no afectará sus datos.\n\nSaludos,\nEquipo NexusOS',
    recipientType: 'all',
    recipientCount: 23,
    sentAt: new Date('2024-03-15T10:00:00'),
    status: 'sent',
    openRate: 78
  },
  {
    id: '2',
    subject: 'Promoción Especial - 20% de descuento en upgrades',
    message: '¡Hola!\n\nPor tiempo limitado, ofreceos un 20% de descuento al actualizar tu plan.\n\nAprovecha esta oportunidad para acceder a más funcionalidades.\n\nCódigo: UPGRADE20\nVálido hasta: 31 de marzo\n\nEquipo NexusOS',
    recipientType: 'industry',
    industries: ['clinic', 'beauty'],
    recipientCount: 8,
    sentAt: new Date('2024-03-12T14:30:00'),
    status: 'sent',
    openRate: 65
  },
  {
    id: '3',
    subject: 'Recordatorio de Pago',
    message: 'Estimado cliente,\n\nLe recordamos que su factura tiene un saldo pendiente.\n\nPor favor regularice su situación para evitar suspensión del servicio.\n\nGracias,\nNexusOS',
    recipientType: 'specific',
    recipients: ['6'],
    recipientCount: 1,
    sentAt: new Date('2024-03-10T09:00:00'),
    status: 'sent',
    openRate: 100
  }
];

const INDUSTRIES = [
  { slug: 'clinic', name: 'Clínica Médica', color: '#22D3EE' },
  { slug: 'lawfirm', name: 'Bufete de Abogados', color: '#C4A35A' },
  { slug: 'beauty', name: 'Salón de Belleza', color: '#EC4899' },
  { slug: 'bakery', name: 'Panadería/Pastelería', color: '#F97316' },
  { slug: 'nurse', name: 'Enfermería', color: '#34D399' },
  { slug: 'pharmacy', name: 'Farmacia', color: '#8B5CF6' },
  { slug: 'insurance', name: 'Aseguradora', color: '#F59E0B' },
];

// ============================================
// COMPOSE BROADCAST MODAL
// ============================================
function ComposeBroadcastModal({ 
  onClose, 
  onSend 
}: { 
  onClose: () => void; 
  onSend: (broadcast: Partial<Broadcast>) => void;
}) {
  const [step, setStep] = useState(1);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [recipientType, setRecipientType] = useState<'all' | 'industry' | 'specific'>('all');
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sending, setSending] = useState(false);

  const filteredRecipients = MOCK_RECIPIENTS.filter(r => {
    if (recipientType === 'industry' && selectedIndustries.length > 0) {
      return selectedIndustries.includes(r.industry);
    }
    if (searchQuery) {
      return r.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
             r.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
             r.email.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  const getRecipientCount = () => {
    if (recipientType === 'all') return MOCK_RECIPIENTS.filter(r => r.status === 'active').length;
    if (recipientType === 'industry') {
      return MOCK_RECIPIENTS.filter(r => selectedIndustries.includes(r.industry) && r.status === 'active').length;
    }
    return selectedRecipients.length;
  };

  const handleSend = async () => {
    setSending(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    onSend({
      subject,
      message,
      recipientType,
      recipientCount: getRecipientCount(),
      industries: recipientType === 'industry' ? selectedIndustries : undefined,
      recipients: recipientType === 'specific' ? selectedRecipients : undefined,
      status: 'sent',
      openRate: 0
    });
    setSending(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-2xl bg-[#0A0820] border border-[rgba(167,139,250,0.2)] shadow-2xl flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-[#0A0820] p-6 border-b border-[rgba(167,139,250,0.1)] flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-[var(--text-primary)]">Nuevo Comunicado</h2>
            <p className="text-sm text-[var(--text-mid)] mt-1">Paso {step} de 3</p>
          </div>
          <button onClick={onClose} className="text-[var(--text-dim)] hover:text-[var(--text-primary)]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-3 bg-[rgba(108,63,206,0.05)]">
          <div className="flex items-center gap-2">
            {[1, 2, 3].map((s) => (
              <React.Fragment key={s}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  s <= step 
                    ? 'bg-[var(--nexus-gold)] text-white' 
                    : 'bg-[var(--glass)] text-[var(--text-dim)]'
                }`}>
                  {s}
                </div>
                {s < 3 && <div className={`flex-1 h-1 rounded ${s < step ? 'bg-[var(--nexus-gold)]' : 'bg-[var(--glass)]'}`} />}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">Redactar Mensaje</h3>
              
              <div className="space-y-2">
                <Label className="text-[var(--text-mid)]">Asunto</Label>
                <Input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Ej: Actualización importante del sistema"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[var(--text-mid)]">Mensaje</Label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full h-64 p-4 rounded-lg bg-[var(--glass)] border border-[var(--glass-border)] text-[var(--text-primary)] placeholder-[var(--text-dim)] resize-none focus:border-[var(--nexus-gold)] focus:outline-none"
                  placeholder="Escribe tu mensaje aquí..."
                />
                <p className="text-xs text-[var(--text-dim)]">
                  {message.length} caracteres
                </p>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">Seleccionar Destinatarios</h3>
              
              {/* Recipient Type */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'all', label: 'Todos', desc: 'Todos los inquilinos activos' },
                  { value: 'industry', label: 'Por Industria', desc: 'Seleccionar industrias específicas' },
                  { value: 'specific', label: 'Específicos', desc: 'Seleccionar inquilinos individualmente' },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setRecipientType(option.value as any);
                      if (option.value !== 'industry') setSelectedIndustries([]);
                      if (option.value !== 'specific') setSelectedRecipients([]);
                    }}
                    className={`p-4 rounded-lg border text-left transition-all ${
                      recipientType === option.value
                        ? 'border-[var(--nexus-gold)] bg-[rgba(240,180,41,0.1)]'
                        : 'border-[var(--glass-border)] hover:border-[rgba(167,139,250,0.3)]'
                    }`}
                  >
                    <p className="font-medium text-[var(--text-primary)]">{option.label}</p>
                    <p className="text-xs text-[var(--text-dim)] mt-1">{option.desc}</p>
                  </button>
                ))}
              </div>

              {/* Industry Selection */}
              {recipientType === 'industry' && (
                <div className="space-y-3">
                  <Label className="text-[var(--text-mid)]">Seleccionar Industrias</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {INDUSTRIES.map((ind) => (
                      <button
                        key={ind.slug}
                        onClick={() => {
                          setSelectedIndustries(prev => 
                            prev.includes(ind.slug) 
                              ? prev.filter(i => i !== ind.slug)
                              : [...prev, ind.slug]
                          );
                        }}
                        className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                          selectedIndustries.includes(ind.slug)
                            ? 'border-[var(--nexus-gold)] bg-[rgba(240,180,41,0.1)]'
                            : 'border-[var(--glass-border)] hover:border-[rgba(167,139,250,0.3)]'
                        }`}
                      >
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: ind.color }} />
                        <span className="text-sm text-[var(--text-primary)]">{ind.name}</span>
                        {selectedIndustries.includes(ind.slug) && (
                          <CheckCircle className="w-4 h-4 text-[var(--nexus-gold)] ml-auto" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Specific Recipients */}
              {recipientType === 'specific' && (
                <div className="space-y-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-dim)]" />
                    <Input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Buscar inquilino..."
                      className="pl-10"
                    />
                  </div>
                  
                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {filteredRecipients.map((recipient) => (
                      <button
                        key={recipient.id}
                        onClick={() => {
                          setSelectedRecipients(prev =>
                            prev.includes(recipient.id)
                              ? prev.filter(id => id !== recipient.id)
                              : [...prev, recipient.id]
                          );
                        }}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-all ${
                          selectedRecipients.includes(recipient.id)
                            ? 'border-[var(--nexus-gold)] bg-[rgba(240,180,41,0.1)]'
                            : 'border-[var(--glass-border)] hover:border-[rgba(167,139,250,0.3)]'
                        }`}
                      >
                        <div className="w-10 h-10 rounded-lg bg-[var(--glass)] flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-[var(--text-mid)]" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-[var(--text-primary)]">{recipient.businessName}</p>
                          <p className="text-xs text-[var(--text-dim)]">{recipient.email}</p>
                        </div>
                        {selectedRecipients.includes(recipient.id) && (
                          <CheckCircle className="w-4 h-4 text-[var(--nexus-gold)]" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Recipient Count Summary */}
              <div className="p-4 rounded-lg bg-[var(--glass)] border border-[var(--glass-border)]">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-[var(--nexus-gold)]" />
                  <div>
                    <p className="text-sm text-[var(--text-mid)]">Destinatarios seleccionados</p>
                    <p className="text-xl font-bold text-[var(--text-primary)]">{getRecipientCount()}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">Vista Previa y Confirmación</h3>
              
              {/* Email Preview */}
              <div className="p-6 rounded-lg bg-white text-gray-900">
                <div className="border-b border-gray-200 pb-3 mb-4">
                  <p className="text-xs text-gray-500">De: NexusOS &lt;noreply@nexusos.tt&gt;</p>
                  <p className="text-xs text-gray-500">Para: {getRecipientCount()} destinatarios</p>
                  <p className="text-sm font-medium text-gray-900 mt-2">{subject || '(Sin asunto)'}</p>
                </div>
                <div className="whitespace-pre-wrap text-sm text-gray-700">
                  {message || '(Sin mensaje)'}
                </div>
                <div className="border-t border-gray-200 pt-3 mt-4">
                  <p className="text-xs text-gray-400">
                    Este email fue enviado desde NexusOS - Sistema de Gestión Empresarial
                  </p>
                </div>
              </div>

              {/* Warning */}
              <div className="p-4 rounded-lg bg-[rgba(240,180,41,0.1)] border border-[var(--nexus-gold)]/20">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-[var(--nexus-gold)] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-[var(--text-primary)]">
                      Estás a punto de enviar este email a <strong>{getRecipientCount()} destinatarios</strong>.
                    </p>
                    <p className="text-xs text-[var(--text-mid)] mt-1">
                      Esta acción no se puede deshacer. Verifica que todo esté correcto antes de enviar.
                    </p>
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-[var(--glass)] border border-[var(--glass-border)]">
                  <p className="text-xs text-[var(--text-dim)]">Tipo de destinatario</p>
                  <p className="text-sm font-medium text-[var(--text-primary)]">
                    {recipientType === 'all' ? 'Todos los inquilinos' : 
                     recipientType === 'industry' ? 'Por industria' : 'Específicos'}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-[var(--glass)] border border-[var(--glass-border)]">
                  <p className="text-xs text-[var(--text-dim)]">Total a enviar</p>
                  <p className="text-sm font-medium text-[var(--nexus-gold)]">{getRecipientCount()} emails</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-[#0A0820] p-6 border-t border-[rgba(167,139,250,0.1)] flex justify-between">
          <Button
            variant="outline"
            onClick={() => step > 1 ? setStep(step - 1) : onClose()}
            disabled={sending}
          >
            {step > 1 ? 'Atrás' : 'Cancelar'}
          </Button>
          
          {step < 3 ? (
            <Button
              onClick={() => setStep(step + 1)}
              className="btn-gold"
              disabled={step === 1 ? !subject || !message : step === 2 ? getRecipientCount() === 0 : false}
            >
              Continuar
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSend}
              className="btn-gold"
              disabled={sending}
            >
              {sending ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Enviar Comunicado
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================
// BROADCAST DETAIL MODAL
// ============================================
function BroadcastDetailModal({ 
  broadcast, 
  onClose 
}: { 
  broadcast: Broadcast; 
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-2xl bg-[#0A0820] border border-[rgba(167,139,250,0.2)] shadow-2xl flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-[#0A0820] p-6 border-b border-[rgba(167,139,250,0.1)] flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-[var(--text-primary)]">{broadcast.subject}</h2>
            <p className="text-sm text-[var(--text-mid)] mt-1">
              Enviado el {broadcast.sentAt.toLocaleDateString('es-TT', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
          <button onClick={onClose} className="text-[var(--text-dim)] hover:text-[var(--text-primary)]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="p-4 rounded-lg bg-[var(--glass)] border border-[var(--glass-border)] text-center">
              <Users className="w-5 h-5 mx-auto text-[var(--nexus-violet)] mb-2" />
              <p className="text-2xl font-bold text-[var(--text-primary)]">{broadcast.recipientCount}</p>
              <p className="text-xs text-[var(--text-dim)]">Destinatarios</p>
            </div>
            <div className="p-4 rounded-lg bg-[var(--glass)] border border-[var(--glass-border)] text-center">
              <Mail className="w-5 h-5 mx-auto text-[var(--success)] mb-2" />
              <p className="text-2xl font-bold text-[var(--text-primary)]">{broadcast.status === 'sent' ? 'Enviado' : 'Parcial'}</p>
              <p className="text-xs text-[var(--text-dim)]">Estado</p>
            </div>
            <div className="p-4 rounded-lg bg-[var(--glass)] border border-[var(--glass-border)] text-center">
              <Eye className="w-5 h-5 mx-auto text-[var(--nexus-gold)] mb-2" />
              <p className="text-2xl font-bold text-[var(--text-primary)]">{broadcast.openRate || 0}%</p>
              <p className="text-xs text-[var(--text-dim)]">Tasa de apertura</p>
            </div>
          </div>

          {/* Recipient Type */}
          <div className="p-4 rounded-lg bg-[var(--glass)] border border-[var(--glass-border)] mb-6">
            <p className="text-sm text-[var(--text-mid)]">Enviado a:</p>
            <p className="text-[var(--text-primary)] font-medium">
              {broadcast.recipientType === 'all' 
                ? 'Todos los inquilinos activos'
                : broadcast.recipientType === 'industry'
                ? `Industrias: ${broadcast.industries?.map(i => INDUSTRIES.find(ind => ind.slug === i)?.name).join(', ')}`
                : `${broadcast.recipientCount} inquilinos específicos`}
            </p>
          </div>

          {/* Message Preview */}
          <div className="p-6 rounded-lg bg-white text-gray-900">
            <div className="whitespace-pre-wrap text-sm">
              {broadcast.message}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-[#0A0820] p-6 border-t border-[rgba(167,139,250,0.1)]">
          <Button onClick={onClose} className="w-full">
            Cerrar
          </Button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// MAIN BROADCASTS MODULE
// ============================================
export function BroadcastsModule() {
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>(MOCK_BROADCASTS);
  const [showCompose, setShowCompose] = useState(false);
  const [selectedBroadcast, setSelectedBroadcast] = useState<Broadcast | null>(null);

  const handleSendBroadcast = (broadcast: Partial<Broadcast>) => {
    const newBroadcast: Broadcast = {
      id: `${Date.now()}`,
      subject: broadcast.subject || '',
      message: broadcast.message || '',
      recipientType: broadcast.recipientType || 'all',
      recipientCount: broadcast.recipientCount || 0,
      industries: broadcast.industries,
      recipients: broadcast.recipients,
      sentAt: new Date(),
      status: 'sent',
      openRate: 0
    };
    setBroadcasts(prev => [newBroadcast, ...prev]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)]">Comunicados Masivos</h2>
          <p className="text-sm text-[var(--text-mid)]">Envía mensajes a todos los inquilinos</p>
        </div>
        <Button onClick={() => setShowCompose(true)} className="btn-gold">
          <Megaphone className="w-4 h-4 mr-2" />
          Nuevo Comunicado
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[var(--glass)] border border-[var(--glass-border)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[var(--nexus-violet)]/10 flex items-center justify-center">
              <Megaphone className="w-5 h-5 text-[var(--nexus-violet)]" />
            </div>
            <div>
              <p className="text-sm text-[var(--text-dim)]">Total Enviados</p>
              <p className="text-xl font-bold text-[var(--text-primary)]">{broadcasts.length}</p>
            </div>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-[var(--glass)] border border-[var(--glass-border)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[var(--success)]/10 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-[var(--success)]" />
            </div>
            <div>
              <p className="text-sm text-[var(--text-dim)]">Entregados</p>
              <p className="text-xl font-bold text-[var(--text-primary)]">
                {broadcasts.filter(b => b.status === 'sent').length}
              </p>
            </div>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-[var(--glass)] border border-[var(--glass-border)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[var(--nexus-gold)]/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-[var(--nexus-gold)]" />
            </div>
            <div>
              <p className="text-sm text-[var(--text-dim)]">Total Alcance</p>
              <p className="text-xl font-bold text-[var(--text-primary)]">
                {broadcasts.reduce((sum, b) => sum + b.recipientCount, 0)}
              </p>
            </div>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-[var(--glass)] border border-[var(--glass-border)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[var(--info)]/10 flex items-center justify-center">
              <Eye className="w-5 h-5 text-[var(--info)]" />
            </div>
            <div>
              <p className="text-sm text-[var(--text-dim)]">Tasa Apertura Prom.</p>
              <p className="text-xl font-bold text-[var(--text-primary)]">
                {broadcasts.length > 0 
                  ? Math.round(broadcasts.reduce((sum, b) => sum + (b.openRate || 0), 0) / broadcasts.length)
                  : 0}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Broadcasts History */}
      <div className="glass-card overflow-hidden">
        <div className="p-4 border-b border-[var(--glass-border)]">
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">Historial de Comunicados</h3>
        </div>
        <div className="divide-y divide-[var(--glass-border)]">
          {broadcasts.map((broadcast) => (
            <button
              key={broadcast.id}
              onClick={() => setSelectedBroadcast(broadcast)}
              className="w-full p-4 flex items-center justify-between hover:bg-[var(--glass)] transition-colors text-left"
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  broadcast.status === 'sent' 
                    ? 'bg-[var(--success)]/10' 
                    : 'bg-[var(--nexus-gold)]/10'
                }`}>
                  {broadcast.status === 'sent' 
                    ? <CheckCircle className="w-5 h-5 text-[var(--success)]" />
                    : <Clock className="w-5 h-5 text-[var(--nexus-gold)]" />
                  }
                </div>
                <div>
                  <p className="font-medium text-[var(--text-primary)]">{broadcast.subject}</p>
                  <p className="text-sm text-[var(--text-dim)]">
                    {broadcast.sentAt.toLocaleDateString('es-TT')} • {broadcast.recipientCount} destinatarios
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm text-[var(--text-mid)]">{broadcast.openRate || 0}% apertura</p>
                  <p className="text-xs text-[var(--text-dim)]">
                    {broadcast.recipientType === 'all' ? 'Todos' : 
                     broadcast.recipientType === 'industry' ? 'Por industria' : 'Específicos'}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-[var(--text-dim)]" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Empty State */}
      {broadcasts.length === 0 && (
        <div className="text-center py-12">
          <Megaphone className="w-12 h-12 mx-auto text-[var(--text-dim)]" />
          <p className="text-[var(--text-mid)] mt-4">No hay comunicados enviados</p>
          <Button onClick={() => setShowCompose(true)} className="btn-gold mt-4">
            <Megaphone className="w-4 h-4 mr-2" />
            Enviar Primer Comunicado
          </Button>
        </div>
      )}

      {/* Compose Modal */}
      {showCompose && (
        <ComposeBroadcastModal
          onClose={() => setShowCompose(false)}
          onSend={handleSendBroadcast}
        />
      )}

      {/* Detail Modal */}
      {selectedBroadcast && (
        <BroadcastDetailModal
          broadcast={selectedBroadcast}
          onClose={() => setSelectedBroadcast(null)}
        />
      )}
    </div>
  );
}

export default BroadcastsModule;
