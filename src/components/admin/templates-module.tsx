'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  FileText,
  Receipt,
  Mail,
  DollarSign,
  Plus,
  Edit3,
  Trash2,
  Copy,
  Send,
  Download,
  Eye,
  Save,
  CheckCircle,
  Calendar,
  Building2,
  FileSignature,
  Printer,
  X
} from 'lucide-react';

// ============================================
// TEMPLATE TYPES
// ============================================
interface Template {
  id: string;
  type: 'receipt' | 'invoice' | 'email';
  name: string;
  description: string;
  content: string;
  variables: string[];
  createdAt: Date;
  lastUsed?: Date;
  usageCount: number;
}

// ============================================
// DEFAULT TEMPLATES
// ============================================
const DEFAULT_TEMPLATES: Template[] = [
  {
    id: 'receipt-1',
    type: 'receipt',
    name: 'Recibo de Pago Mensual',
    description: 'Recibo estándar para pagos de mensualidad',
    content: `RECIBO DE PAGO #{{receipt_number}}

Fecha: {{date}}
Recibido de: {{client_name}}
Negocio: {{business_name}}

Concepto: {{concept}}
Período: {{period}}
Monto: TT${{amount}}
Método de pago: {{payment_method}}

Recibido por: {{admin_name}}
NexusOS - Sistema de Gestión Empresarial

¡Gracias por su pago!`,
    variables: ['receipt_number', 'date', 'client_name', 'business_name', 'concept', 'period', 'amount', 'payment_method', 'admin_name'],
    createdAt: new Date(),
    usageCount: 0
  },
  {
    id: 'receipt-2',
    type: 'receipt',
    name: 'Recibo de Activación',
    description: 'Recibo para pagos de activación inicial',
    content: `RECIBO DE ACTIVACIÓN #{{receipt_number}}

Fecha: {{date}}
Cliente: {{client_name}}
Email: {{client_email}}
Teléfono: {{client_phone}}

Detalles del Servicio:
- Industria: {{industry}}
- Plan: {{plan}}
- Ciclo: {{billing_cycle}}

Pago de Activación: TT${{activation_fee}}
Primer Mes: TT${{monthly_fee}}
TOTAL PAGADO: TT${{total}}

Método de pago: {{payment_method}}
Referencia: {{payment_reference}}

Bienvenido a NexusOS!
Su espacio estará activo en 24-48 horas.

Recibido por: {{admin_name}}`,
    variables: ['receipt_number', 'date', 'client_name', 'client_email', 'client_phone', 'industry', 'plan', 'billing_cycle', 'activation_fee', 'monthly_fee', 'total', 'payment_method', 'payment_reference', 'admin_name'],
    createdAt: new Date(),
    usageCount: 0
  },
  {
    id: 'invoice-1',
    type: 'invoice',
    name: 'Factura Mensual con PNL',
    description: 'Factura detallada con desglose de PNL',
    content: `FACTURA #{{invoice_number}}
Fecha de Emisión: {{issue_date}}
Fecha de Vencimiento: {{due_date}}

DATOS DEL CLIENTE:
{{client_name}}
{{business_name}}
{{client_address}}
RIF/NIT: {{tax_id}}

DETALLE DE SERVICIOS:
┌─────────────────────────────────────────────────────────────┐
│ Concepto                          │ Precio    │ Subtotal   │
├─────────────────────────────────────────────────────────────┤
│ Suscripción {{plan}} - {{period}}    │ TT${{base_price}}│ TT${{base_price}}│
│ Descuento Lealtad                 │ -TT${{discount}}│ -TT${{discount}}│
│ IVA ({{tax_rate}}%)                    │           │ TT${{tax}}│
└─────────────────────────────────────────────────────────────┘
 TOTAL A PAGAR: TT${{total}}

INFORMACIÓN DE PAGO:
Banco: First Citizens Bank
Cuenta Corriente: XXX-XXX-XXXX
Beneficiario: NexusOS Trinidad Ltd.
Email: pagos@nexusos.tt

¡Gracias por su preferencia!`,
    variables: ['invoice_number', 'issue_date', 'due_date', 'client_name', 'business_name', 'client_address', 'tax_id', 'plan', 'period', 'base_price', 'discount', 'tax_rate', 'tax', 'total'],
    createdAt: new Date(),
    usageCount: 0
  },
  {
    id: 'email-1',
    type: 'email',
    name: 'Email de Bienvenida',
    description: 'Email de bienvenida para nuevos clientes',
    content: `Asunto: ¡Bienvenido a NexusOS! Tu espacio está listo

Hola {{client_name}},

¡Te damos la bienvenida a NexusOS!

Tu espacio de trabajo para {{industry}} ha sido creado exitosamente.

DATOS DE ACCESO:
URL: https://nexus-os-alpha.vercel.app/{{industry_slug}}
Email: {{user_email}}
Contraseña temporal: {{temp_password}}

Tu plan: {{plan}}
Próxima facturación: {{next_billing_date}}

RECURSOS ÚTILES:
- Guía de inicio: https://nexus-os-alpha.vercel.app/ayuda
- Videos tutoriales: https://nexus-os-alpha.vercel.app/tutoriales
- Soporte: soporte@nexusos.tt

Si necesitas ayuda, no dudes en contactarnos.

El equipo de NexusOS`,
    variables: ['client_name', 'industry', 'industry_slug', 'user_email', 'temp_password', 'plan', 'next_billing_date'],
    createdAt: new Date(),
    usageCount: 0
  },
  {
    id: 'email-2',
    type: 'email',
    name: 'Recordatorio de Pago',
    description: 'Email recordatorio de pago pendiente',
    content: `Asunto: Recordatorio: Tu factura de NexusOS vence pronto

Hola {{client_name}},

Te recordamos que tu factura #{{invoice_number}} de {{business_name}} vence el {{due_date}}.

MONTO A PAGAR: TT${{amount}}

MÉTODOS DE PAGO:
1. Transferencia bancaria:
   Banco: First Citizens
   Cuenta: XXX-XXX-XXXX
   
2. WiPay (tarjeta de crédito/débito):
   Enlace: {{payment_link}}

3. Pago móvil:
   Banco: First Citizens
   Cédula: XXXXXXXXX
   Teléfono: +1 868 XXX XXXX

¿Necesitas ayuda? Responde este email o llámanos al +1 868 XXX XXXX.

Gracias por tu preferencia.

NexusOS - Sistema de Gestión Empresarial`,
    variables: ['client_name', 'invoice_number', 'business_name', 'due_date', 'amount', 'payment_link'],
    createdAt: new Date(),
    usageCount: 0
  },
  {
    id: 'email-3',
    type: 'email',
    name: 'Email de Suspensión',
    description: 'Notificación de suspensión por falta de pago',
    content: `Asunto: Importante: Tu cuenta ha sido suspendida

Hola {{client_name}},

Lamentamos informarte que tu cuenta de NexusOS para {{business_name}} ha sido suspendida debido a falta de pago.

FACTURA PENDIENTE:
- Número: {{invoice_number}}
- Monto: TT${{amount}}
- Vencida desde: {{due_date}}

Para reactivar tu cuenta:
1. Realiza el pago pendiente
2. Envía el comprobante a pagos@nexusos.tt
3. Tu cuenta será reactivada en 24 horas

IMPORTANTE: Tus datos están seguros y se mantendrán por 30 días. Después de ese período, podrían ser eliminados.

¿Tienes alguna pregunta? Contáctanos:
- Email: soporte@nexusos.tt
- Teléfono: +1 868 XXX XXXX

Esperamos resolver esto pronto.

Equipo de NexusOS`,
    variables: ['client_name', 'business_name', 'invoice_number', 'amount', 'due_date'],
    createdAt: new Date(),
    usageCount: 0
  }
];

// ============================================
// TEMPLATE EDITOR MODAL
// ============================================
function TemplateEditor({ 
  template, 
  onClose, 
  onSave 
}: { 
  template: Template | null; 
  onClose: () => void; 
  onSave: (template: Template) => void;
}) {
  const [editingTemplate, setEditingTemplate] = useState<Template>(template || {
    id: `template-${Date.now()}`,
    type: 'receipt',
    name: '',
    description: '',
    content: '',
    variables: [],
    createdAt: new Date(),
    usageCount: 0
  });
  const [showPreview, setShowPreview] = useState(false);

  const extractVariables = (content: string): string[] => {
    const matches = content.match(/\{\{(\w+)\}\}/g) || [];
    return [...new Set(matches.map(m => m.replace(/[{}]/g, '')))];
  };

  const handleContentChange = (content: string) => {
    const variables = extractVariables(content);
    setEditingTemplate(prev => ({ ...prev, content, variables }));
  };

  const handleSave = () => {
    onSave(editingTemplate);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl bg-[#0A0820] border border-[rgba(167,139,250,0.2)] shadow-2xl flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-[#0A0820] p-6 border-b border-[rgba(167,139,250,0.1)] flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-[var(--text-primary)]">
              {template ? 'Editar Template' : 'Nuevo Template'}
            </h2>
            <p className="text-sm text-[var(--text-mid)] mt-1">Personaliza tu documento o email</p>
          </div>
          <button onClick={onClose} className="text-[var(--text-dim)] hover:text-[var(--text-primary)]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Editor */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[var(--text-mid)]">Nombre</Label>
                  <Input
                    value={editingTemplate.name}
                    onChange={(e) => setEditingTemplate(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ej: Recibo Mensual"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[var(--text-mid)]">Tipo</Label>
                  <select
                    value={editingTemplate.type}
                    onChange={(e) => setEditingTemplate(prev => ({ ...prev, type: e.target.value as 'receipt' | 'invoice' | 'email' }))}
                    className="w-full h-10 px-3 rounded-lg bg-[var(--obsidian-3)] border border-[var(--glass-border)] text-[var(--text-primary)]"
                  >
                    <option value="receipt">Recibo</option>
                    <option value="invoice">Factura</option>
                    <option value="email">Email</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[var(--text-mid)]">Descripción</Label>
                <Input
                  value={editingTemplate.description}
                  onChange={(e) => setEditingTemplate(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Breve descripción del template"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[var(--text-mid)]">Contenido</Label>
                <textarea
                  value={editingTemplate.content}
                  onChange={(e) => handleContentChange(e.target.value)}
                  className="w-full h-80 p-4 rounded-lg bg-[var(--glass)] border border-[var(--glass-border)] text-[var(--text-primary)] placeholder-[var(--text-dim)] font-mono text-sm focus:border-[var(--nexus-gold)] focus:outline-none resize-none"
                  placeholder="Escribe el contenido aquí. Usa {{variable}} para campos dinámicos."
                />
              </div>

              {/* Variables Detectadas */}
              {editingTemplate.variables.length > 0 && (
                <div className="p-4 rounded-lg bg-[var(--glass)] border border-[var(--glass-border)]">
                  <p className="text-sm text-[var(--text-mid)] mb-2">Variables detectadas:</p>
                  <div className="flex flex-wrap gap-2">
                    {editingTemplate.variables.map((v, i) => (
                      <span key={i} className="px-2 py-1 rounded bg-[var(--nexus-violet)]/20 text-[var(--nexus-violet-lite)] text-xs font-mono">
                        {`{{${v}}}`}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Preview */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-[var(--text-mid)]">Vista Previa</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPreview(!showPreview)}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  {showPreview ? 'Ocultar' : 'Mostrar'}
                </Button>
              </div>
              
              {showPreview && (
                <div className="p-4 rounded-lg bg-white text-gray-900 font-mono text-sm h-96 overflow-y-auto">
                  <pre className="whitespace-pre-wrap">
                    {editingTemplate.content.replace(/\{\{(\w+)\}\}/g, (_, varName) => {
                      const placeholders: Record<string, string> = {
                        receipt_number: 'REC-2024-0001',
                        date: new Date().toLocaleDateString('es-TT'),
                        client_name: 'Dr. Juan Pérez',
                        business_name: 'Clínica San Fernando',
                        concept: 'Mensualidad servicio SaaS',
                        period: 'Marzo 2024',
                        amount: '2,750.00',
                        payment_method: 'Transferencia bancaria',
                        admin_name: 'Admin NexusOS',
                        invoice_number: 'INV-2024-0001',
                        issue_date: new Date().toLocaleDateString('es-TT'),
                        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('es-TT'),
                        plan: 'GROWTH',
                        total: '2,750.00',
                      };
                      return placeholders[varName] || `[${varName}]`;
                    })}
                  </pre>
                </div>
              )}

              {/* Quick Insert Variables */}
              <div className="p-4 rounded-lg bg-[var(--glass)] border border-[var(--glass-border)]">
                <p className="text-sm text-[var(--text-mid)] mb-3">Insertar variable:</p>
                <div className="grid grid-cols-2 gap-2">
                  {['client_name', 'business_name', 'date', 'amount', 'plan', 'invoice_number'].map((v) => (
                    <button
                      key={v}
                      onClick={() => {
                        const textarea = document.querySelector('textarea');
                        if (textarea) {
                          const start = textarea.selectionStart;
                          const end = textarea.selectionEnd;
                          const text = editingTemplate.content;
                          const before = text.substring(0, start);
                          const after = text.substring(end);
                          const newContent = before + `{{${v}}}` + after;
                          handleContentChange(newContent);
                        }
                      }}
                      className="px-3 py-2 rounded-lg bg-[var(--obsidian-3)] border border-[var(--glass-border)] text-[var(--text-mid)] hover:text-[var(--text-primary)] hover:border-[var(--nexus-violet)] text-xs font-mono text-left"
                    >
                      {`{{${v}}}`}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-[#0A0820] p-6 border-t border-[rgba(167,139,250,0.1)] flex justify-between">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave} className="btn-gold" disabled={!editingTemplate.name || !editingTemplate.content}>
            <Save className="w-4 h-4 mr-2" />
            Guardar Template
          </Button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// USE TEMPLATE MODAL
// ============================================
function UseTemplateModal({ 
  template, 
  onClose 
}: { 
  template: Template; 
  onClose: () => void;
}) {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSend = async () => {
    setSending(true);
    // Simular envío
    await new Promise(resolve => setTimeout(resolve, 1500));
    setSending(false);
    setSent(true);
  };

  const filledContent = template.content.replace(/\{\{(\w+)\}\}/g, (_, varName) => {
    return formData[varName] || `[${varName}]`;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-2xl bg-[#0A0820] border border-[rgba(167,139,250,0.2)] shadow-2xl flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-[#0A0820] p-6 border-b border-[rgba(167,139,250,0.1)] flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-[var(--text-primary)]">{template.name}</h2>
            <p className="text-sm text-[var(--text-mid)] mt-1">Completa los campos para generar el documento</p>
          </div>
          <button onClick={onClose} className="text-[var(--text-dim)] hover:text-[var(--text-primary)]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {!sent ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Form Fields */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-[var(--text-primary)]">Datos</h3>
                {template.variables.map((variable) => (
                  <div key={variable} className="space-y-2">
                    <Label className="text-[var(--text-mid)] capitalize">
                      {variable.replace(/_/g, ' ')}
                    </Label>
                    <Input
                      value={formData[variable] || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, [variable]: e.target.value }))}
                      placeholder={`Ingresa ${variable.replace(/_/g, ' ')}`}
                    />
                  </div>
                ))}
              </div>

              {/* Preview */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-[var(--text-primary)]">Vista Previa</h3>
                <div className="p-4 rounded-lg bg-white text-gray-900 font-mono text-sm h-80 overflow-y-auto">
                  <pre className="whitespace-pre-wrap">{filledContent}</pre>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <CheckCircle className="w-16 h-16 mx-auto text-[var(--success)] mb-4" />
              <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">
                {template.type === 'email' ? 'Email Enviado' : 'Documento Generado'}
              </h3>
              <p className="text-[var(--text-mid)]">
                {template.type === 'email' 
                  ? 'El email ha sido enviado exitosamente'
                  : 'Puedes descargar o imprimir el documento'}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-[#0A0820] p-6 border-t border-[rgba(167,139,250,0.1)] flex justify-between">
          <Button variant="outline" onClick={onClose}>
            {sent ? 'Cerrar' : 'Cancelar'}
          </Button>
          {!sent && (
            <div className="flex gap-2">
              {template.type !== 'email' && (
                <>
                  <Button variant="outline">
                    <Printer className="w-4 h-4 mr-2" />
                    Imprimir
                  </Button>
                  <Button variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Descargar PDF
                  </Button>
                </>
              )}
              <Button onClick={handleSend} className="btn-gold" disabled={sending}>
                {sending ? (
                  <>
                    <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    {template.type === 'email' ? (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Enviar Email
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-2" />
                        Copiar al Portapapeles
                      </>
                    )}
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================
// MAIN TEMPLATES MODULE
// ============================================
export function TemplatesModule() {
  const [templates, setTemplates] = useState<Template[]>(DEFAULT_TEMPLATES);
  const [selectedType, setSelectedType] = useState<'all' | 'receipt' | 'invoice' | 'email'>('all');
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [usingTemplate, setUsingTemplate] = useState<Template | null>(null);

  const typeIcons = {
    receipt: Receipt,
    invoice: FileText,
    email: Mail
  };

  const typeColors = {
    receipt: '#F0B429',
    invoice: '#22D3EE',
    email: '#34D399'
  };

  const filteredTemplates = selectedType === 'all' 
    ? templates 
    : templates.filter(t => t.type === selectedType);

  const handleSaveTemplate = (template: Template) => {
    setTemplates(prev => {
      const exists = prev.find(t => t.id === template.id);
      if (exists) {
        return prev.map(t => t.id === template.id ? template : t);
      }
      return [...prev, template];
    });
  };

  const handleDeleteTemplate = (id: string) => {
    if (confirm('¿Estás seguro de eliminar este template?')) {
      setTemplates(prev => prev.filter(t => t.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)]">Templates Personales</h2>
          <p className="text-sm text-[var(--text-mid)]">Documentos y emails pre-cargados para uso personal</p>
        </div>
        <Button onClick={() => setEditingTemplate(null)} className="btn-gold">
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Template
        </Button>
      </div>

      {/* Type Filter */}
      <div className="flex gap-2">
        {['all', 'receipt', 'invoice', 'email'].map((type) => (
          <button
            key={type}
            onClick={() => setSelectedType(type as any)}
            className={`px-4 py-2 rounded-lg text-sm transition-colors ${
              selectedType === type
                ? 'bg-[var(--nexus-gold)] text-white'
                : 'bg-[var(--glass)] text-[var(--text-mid)] hover:text-[var(--text-primary)]'
            }`}
          >
            {type === 'all' ? 'Todos' : type === 'receipt' ? 'Recibos' : type === 'invoice' ? 'Facturas' : 'Emails'}
          </button>
        ))}
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTemplates.map((template) => {
          const IconComponent = typeIcons[template.type];
          const iconColor = typeColors[template.type];
          
          return (
            <div 
              key={template.id} 
              className="p-5 rounded-xl bg-[var(--glass)] border border-[var(--glass-border)] hover:border-[rgba(167,139,250,0.3)] transition-all group"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${iconColor}20` }}>
                  <IconComponent className="w-6 h-6" style={{ color: iconColor }} />
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => setEditingTemplate(template)}
                    className="p-2 rounded-lg hover:bg-[var(--glass)] text-[var(--text-dim)] hover:text-[var(--text-primary)]"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteTemplate(template.id)}
                    className="p-2 rounded-lg hover:bg-[var(--error)]/10 text-[var(--text-dim)] hover:text-[var(--error)]"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-1">{template.name}</h3>
              <p className="text-sm text-[var(--text-mid)] mb-4">{template.description}</p>

              {/* Variables Count */}
              <div className="flex items-center gap-2 text-xs text-[var(--text-dim)] mb-4">
                <FileSignature className="w-3 h-3" />
                <span>{template.variables.length} variables</span>
                <span>•</span>
                <span>Usado {template.usageCount} veces</span>
              </div>

              {/* Actions */}
              <Button 
                onClick={() => setUsingTemplate(template)} 
                className="w-full"
                variant="outline"
              >
                {template.type === 'email' ? (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Usar Template
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4 mr-2" />
                    Generar Documento
                  </>
                )}
              </Button>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 mx-auto text-[var(--text-dim)]" />
          <p className="text-[var(--text-mid)] mt-4">No hay templates de este tipo</p>
          <Button onClick={() => setEditingTemplate(null)} className="btn-gold mt-4">
            <Plus className="w-4 h-4 mr-2" />
            Crear Template
          </Button>
        </div>
      )}

      {/* Editor Modal */}
      {editingTemplate !== null && (
        <TemplateEditor
          template={editingTemplate}
          onClose={() => setEditingTemplate(null)}
          onSave={handleSaveTemplate}
        />
      )}

      {/* Use Template Modal */}
      {usingTemplate && (
        <UseTemplateModal
          template={usingTemplate}
          onClose={() => setUsingTemplate(null)}
        />
      )}
    </div>
  );
}

export default TemplatesModule;
