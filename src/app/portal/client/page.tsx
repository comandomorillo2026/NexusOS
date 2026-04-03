'use client';

import React, { useState, useEffect, Suspense, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Scale,
  Lock,
  ArrowRight,
  AlertCircle,
  Shield,
  Globe,
  Menu,
  X,
  LogOut,
  Briefcase,
  FileText,
  DollarSign,
  MessageSquare,
  Upload,
  Calendar,
  Clock,
  User,
  Building,
  CheckCircle,
  Circle,
  Download,
  Eye,
  Send,
  Paperclip,
  Check,
  CheckCheck,
  CreditCard,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  File,
  FileImage,
  Search,
  Folder,
  Banknote,
  Phone,
  Mail,
  MapPin,
} from 'lucide-react';

// ============== TYPES ==============
interface CaseData {
  id: string;
  caseNumber: string;
  title: string;
  description?: string;
  status: string;
  stage?: string;
  progress: number;
  practiceArea: string;
  court?: string;
  judge?: string;
  openDate: string;
  nextDeadline?: string;
  nextDeadlineDesc?: string;
  leadAttorneyName?: string;
  tenantId: string;
  LawClient: {
    id: string;
    fullName: string;
    email?: string;
    phone: string;
  };
  LawDocument: Document[];
  LawInvoice: Invoice[];
  LawCalendarEvent: CalendarEvent[];
  LawClientMessage: Message[];
}

interface Document {
  id: string;
  name: string;
  category: string;
  fileSize: number;
  mimeType: string;
  documentDate: string;
  description?: string;
  fileUrl: string;
}

interface InvoiceItem {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  paidDate: string | null;
  items: InvoiceItem[] | string;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  amountPaid: number;
  balanceDue: number;
  status: string;
  paymentMethod?: string;
}

interface CalendarEvent {
  id: string;
  title: string;
  eventType: string;
  date: string;
  startTime: string;
  endTime?: string;
  location?: string;
  courtroom?: string;
  notes?: string;
}

interface Message {
  id: string;
  senderType: string;
  senderName: string;
  subject?: string;
  message: string;
  attachments?: string | Array<{ name: string; url: string; size: number }>;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
}

interface PaymentRequest {
  invoiceId: string;
  amount: number;
  method: 'wipay' | 'bank_transfer';
}

// ============== TRANSLATIONS ==============
const translations = {
  en: {
    // Login
    title: 'Client Portal',
    subtitle: 'Access your case information securely',
    email: 'Email Address',
    emailPlaceholder: 'Enter your email',
    accessCode: 'Access Code',
    accessCodePlaceholder: 'Enter your 8-digit access code',
    accessCodeHint: 'Enter the code provided by your attorney',
    login: 'Access Portal',
    loggingIn: 'Verifying...',
    error: 'Invalid credentials. Please check and try again.',
    footer: 'Need help? Contact your attorney directly.',
    secureNote: 'Your information is protected with end-to-end encryption',
    loginWithEmail: 'Login with Email + Access Code',
    
    // Portal
    dashboard: 'Dashboard',
    documents: 'Documents',
    invoices: 'Invoices',
    messages: 'Messages',
    upload: 'Upload',
    logout: 'Exit Portal',
    welcome: 'Welcome',
    yourCase: 'Your Case',
    upcomingEvents: 'Upcoming Events',
    noEvents: 'No upcoming events scheduled',
    quickActions: 'Quick Actions',
    viewDocuments: 'View Documents',
    sendMessage: 'Send Message',
    uploadDocuments: 'Upload Documents',
    viewInvoices: 'View Invoices',
    securePortal: 'Secure Client Portal',
    lastAccess: 'Last accessed',
    
    // Case Status
    caseStatus: 'Case Status',
    caseDetails: 'Case Details',
    caseNumber: 'Case Number',
    practiceArea: 'Practice Area',
    court: 'Court',
    judge: 'Judge',
    attorney: 'Lead Attorney',
    openedOn: 'Opened On',
    nextDeadline: 'Next Deadline',
    progress: 'Progress',
    timeline: 'Case Timeline',
    completed: 'Completed',
    inProgress: 'In Progress',
    pending: 'Pending',
    description: 'Description',
    
    // Documents
    searchDocuments: 'Search documents...',
    noDocuments: 'No documents available',
    noResults: 'No documents match your search',
    download: 'Download',
    view: 'View',
    fileSize: 'Size',
    date: 'Date',
    category: 'Category',
    allCategories: 'All',
    
    // Invoices
    invoicesAndPayments: 'Invoices & Payments',
    invoicesTab: 'Invoices',
    paymentsTab: 'Payment History',
    noInvoices: 'No invoices available',
    noPayments: 'No payment history',
    totalPaid: 'Total Paid',
    outstanding: 'Outstanding',
    payNow: 'Pay Now',
    payWithWiPay: 'Pay with WiPay',
    bankTransfer: 'Bank Transfer',
    due: 'Due',
    
    // Messages
    secureMessages: 'Secure Messages',
    typeMessage: 'Type your message to your attorney...',
    send: 'Send',
    sending: 'Sending...',
    attach: 'Attach File',
    noMessages: 'No messages yet. Start a conversation with your attorney.',
    today: 'Today',
    yesterday: 'Yesterday',
    you: 'You',
    read: 'Read',
    sent: 'Sent',
    
    // Upload
    uploadTitle: 'Upload Documents',
    uploadDescription: 'Upload documents related to your case',
    selectFiles: 'Select Files',
    dragDrop: 'or drag and drop files here',
    uploading: 'Uploading...',
    uploadSuccess: 'Files uploaded successfully',
    supportedFormats: 'Supported formats: PDF, DOC, DOCX, JPG, PNG (Max 10MB)',
    
    // Payment
    paymentTitle: 'Make Payment',
    selectPaymentMethod: 'Select Payment Method',
    wiPayDescription: 'Pay securely with credit/debit card via WiPay',
    bankTransferDescription: 'Transfer directly to our bank account',
    bankName: 'Bank Name',
    accountName: 'Account Name',
    accountNumber: 'Account Number',
    routingNumber: 'Routing Number',
    referenceNote: 'Please use your invoice number as reference',
    
    // Event types
    eventTypes: {
      court_date: 'Court Date',
      deposition: 'Deposition',
      meeting: 'Meeting',
      deadline: 'Deadline',
      hearing: 'Hearing',
    },
    
    // Status
    statuses: {
      open: 'Open',
      in_progress: 'In Progress',
      pending: 'Pending',
      discovery: 'Discovery',
      negotiation: 'Negotiation',
      trial: 'Trial',
      closed: 'Closed',
      settled: 'Settled',
    },
    
    stages: {
      intake: 'Intake',
      investigation: 'Investigation',
      discovery: 'Discovery',
      negotiation: 'Negotiation',
      trial: 'Trial',
      appeal: 'Appeal',
      settlement: 'Settlement',
      closed: 'Closed',
    },
    
    invoiceStatuses: {
      draft: 'Draft',
      sent: 'Sent',
      paid: 'Paid',
      partial: 'Partial',
      overdue: 'Overdue',
      cancelled: 'Cancelled',
    },
    
    paymentMethods: {
      cash: 'Cash',
      card: 'Credit/Debit Card',
      transfer: 'Bank Transfer',
      check: 'Check',
      trust: 'Trust Account',
      wipay: 'WiPay',
    },
  },
  es: {
    // Login
    title: 'Portal del Cliente',
    subtitle: 'Acceda a su información de caso de forma segura',
    email: 'Correo Electrónico',
    emailPlaceholder: 'Ingrese su correo',
    accessCode: 'Código de Acceso',
    accessCodePlaceholder: 'Ingrese su código de 8 dígitos',
    accessCodeHint: 'Ingrese el código proporcionado por su abogado',
    login: 'Acceder al Portal',
    loggingIn: 'Verificando...',
    error: 'Credenciales inválidas. Por favor verifique e intente nuevamente.',
    footer: '¿Necesita ayuda? Contacte a su abogado directamente.',
    secureNote: 'Su información está protegida con encriptación de extremo a extremo',
    loginWithEmail: 'Iniciar con Correo + Código de Acceso',
    
    // Portal
    dashboard: 'Panel',
    documents: 'Documentos',
    invoices: 'Facturas',
    messages: 'Mensajes',
    upload: 'Subir',
    logout: 'Salir del Portal',
    welcome: 'Bienvenido/a',
    yourCase: 'Su Caso',
    upcomingEvents: 'Próximos Eventos',
    noEvents: 'No hay eventos próximos programados',
    quickActions: 'Acciones Rápidas',
    viewDocuments: 'Ver Documentos',
    sendMessage: 'Enviar Mensaje',
    uploadDocuments: 'Subir Documentos',
    viewInvoices: 'Ver Facturas',
    securePortal: 'Portal Seguro del Cliente',
    lastAccess: 'Último acceso',
    
    // Case Status
    caseStatus: 'Estado del Caso',
    caseDetails: 'Detalles del Caso',
    caseNumber: 'Número de Caso',
    practiceArea: 'Área de Práctica',
    court: 'Tribunal',
    judge: 'Juez',
    attorney: 'Abogado Principal',
    openedOn: 'Fecha de Apertura',
    nextDeadline: 'Próximo Plazo',
    progress: 'Progreso',
    timeline: 'Línea de Tiempo',
    completed: 'Completado',
    inProgress: 'En Progreso',
    pending: 'Pendiente',
    description: 'Descripción',
    
    // Documents
    searchDocuments: 'Buscar documentos...',
    noDocuments: 'No hay documentos disponibles',
    noResults: 'No hay documentos que coincidan con su búsqueda',
    download: 'Descargar',
    view: 'Ver',
    fileSize: 'Tamaño',
    date: 'Fecha',
    category: 'Categoría',
    allCategories: 'Todos',
    
    // Invoices
    invoicesAndPayments: 'Facturas y Pagos',
    invoicesTab: 'Facturas',
    paymentsTab: 'Historial de Pagos',
    noInvoices: 'No hay facturas disponibles',
    noPayments: 'No hay historial de pagos',
    totalPaid: 'Total Pagado',
    outstanding: 'Pendiente',
    payNow: 'Pagar Ahora',
    payWithWiPay: 'Pagar con WiPay',
    bankTransfer: 'Transferencia Bancaria',
    due: 'Vence',
    
    // Messages
    secureMessages: 'Mensajes Seguros',
    typeMessage: 'Escriba su mensaje a su abogado...',
    send: 'Enviar',
    sending: 'Enviando...',
    attach: 'Adjuntar Archivo',
    noMessages: 'Sin mensajes aún. Inicie una conversación con su abogado.',
    today: 'Hoy',
    yesterday: 'Ayer',
    you: 'Usted',
    read: 'Leído',
    sent: 'Enviado',
    
    // Upload
    uploadTitle: 'Subir Documentos',
    uploadDescription: 'Suba documentos relacionados con su caso',
    selectFiles: 'Seleccionar Archivos',
    dragDrop: 'o arrastre y suelte archivos aquí',
    uploading: 'Subiendo...',
    uploadSuccess: 'Archivos subidos exitosamente',
    supportedFormats: 'Formatos soportados: PDF, DOC, DOCX, JPG, PNG (Máx 10MB)',
    
    // Payment
    paymentTitle: 'Realizar Pago',
    selectPaymentMethod: 'Seleccione Método de Pago',
    wiPayDescription: 'Pague de forma segura con tarjeta de crédito/débito a través de WiPay',
    bankTransferDescription: 'Transfiera directamente a nuestra cuenta bancaria',
    bankName: 'Nombre del Banco',
    accountName: 'Nombre de la Cuenta',
    accountNumber: 'Número de Cuenta',
    routingNumber: 'Número de Ruta',
    referenceNote: 'Por favor use su número de factura como referencia',
    
    // Event types
    eventTypes: {
      court_date: 'Fecha de Tribunal',
      deposition: 'Declaración',
      meeting: 'Reunión',
      deadline: 'Plazo',
      hearing: 'Audiencia',
    },
    
    // Status
    statuses: {
      open: 'Abierto',
      in_progress: 'En Progreso',
      pending: 'Pendiente',
      discovery: 'Descubrimiento',
      negotiation: 'Negociación',
      trial: 'Juicio',
      closed: 'Cerrado',
      settled: 'Resuelto',
    },
    
    stages: {
      intake: 'Recepción',
      investigation: 'Investigación',
      discovery: 'Descubrimiento',
      negotiation: 'Negociación',
      trial: 'Juicio',
      appeal: 'Apelación',
      settlement: 'Acuerdo',
      closed: 'Cerrado',
    },
    
    invoiceStatuses: {
      draft: 'Borrador',
      sent: 'Enviada',
      paid: 'Pagada',
      partial: 'Parcial',
      overdue: 'Vencida',
      cancelled: 'Cancelada',
    },
    
    paymentMethods: {
      cash: 'Efectivo',
      card: 'Tarjeta Crédito/Débito',
      transfer: 'Transferencia Bancaria',
      check: 'Cheque',
      trust: 'Cuenta de Fideicomiso',
      wipay: 'WiPay',
    },
  },
};

// ============== HELPER FUNCTIONS ==============
const formatCurrency = (amount: number, currency = 'TT$') => {
  return `${currency}${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const formatFileSize = (bytes: number, t: typeof translations.en) => {
  if (bytes === 0) return '0 bytes';
  const k = 1024;
  const sizes = ['bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

const getFileIcon = (mimeType: string) => {
  if (mimeType.startsWith('image/')) return FileImage;
  return FileText;
};

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    open: 'bg-blue-100 text-blue-700 border-blue-200',
    in_progress: 'bg-green-100 text-green-700 border-green-200',
    pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    discovery: 'bg-purple-100 text-purple-700 border-purple-200',
    negotiation: 'bg-orange-100 text-orange-700 border-orange-200',
    trial: 'bg-red-100 text-red-700 border-red-200',
    closed: 'bg-gray-100 text-gray-700 border-gray-200',
    settled: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  };
  return colors[status] || 'bg-gray-100 text-gray-700 border-gray-200';
};

const getInvoiceStatusConfig = (status: string) => {
  const configs: Record<string, { color: string; icon: React.ElementType; bgColor: string }> = {
    draft: { color: 'text-gray-600', icon: FileText, bgColor: 'bg-gray-100' },
    sent: { color: 'text-blue-600', icon: Clock, bgColor: 'bg-blue-100' },
    paid: { color: 'text-green-600', icon: CheckCircle, bgColor: 'bg-green-100' },
    partial: { color: 'text-yellow-600', icon: AlertCircle, bgColor: 'bg-yellow-100' },
    overdue: { color: 'text-red-600', icon: AlertCircle, bgColor: 'bg-red-100' },
    cancelled: { color: 'text-gray-500', icon: FileText, bgColor: 'bg-gray-100' },
  };
  return configs[status] || configs.draft;
};

const getCategoryColor = (category: string) => {
  const colors: Record<string, string> = {
    pleadings: 'bg-blue-100 text-blue-700',
    discovery: 'bg-purple-100 text-purple-700',
    correspondence: 'bg-green-100 text-green-700',
    contracts: 'bg-orange-100 text-orange-700',
    court_filings: 'bg-red-100 text-red-700',
    evidence: 'bg-yellow-100 text-yellow-700',
    other: 'bg-gray-100 text-gray-700',
  };
  return colors[category] || colors.other;
};

// ============== LOGIN COMPONENT ==============
function ClientPortalLogin({ 
  onLogin, 
  isLoading, 
  error, 
  language 
}: { 
  onLogin: (email: string, accessCode: string) => Promise<void>;
  isLoading: boolean;
  error?: string;
  language: 'en' | 'es';
}) {
  const [email, setEmail] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [localError, setLocalError] = useState('');
  const t = translations[language];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');

    if (!email.trim()) {
      setLocalError(language === 'en' ? 'Email is required' : 'El correo es requerido');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setLocalError(language === 'en' ? 'Please enter a valid email' : 'Por favor ingrese un correo válido');
      return;
    }

    const codeRegex = /^[A-Za-z0-9]{8}$/;
    if (!codeRegex.test(accessCode)) {
      setLocalError(language === 'en' 
        ? 'Access code must be exactly 8 characters'
        : 'El código debe tener exactamente 8 caracteres');
      return;
    }

    await onLogin(email, accessCode.toUpperCase());
  };

  const handleCodeChange = (value: string) => {
    const cleaned = value.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    if (cleaned.length <= 8) {
      setAccessCode(cleaned);
      setLocalError('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1E3A5F] to-[#0F1F2F] flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo and Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-[#C4A35A] to-[#B8943D] shadow-lg mb-4">
            <Scale className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">
            {t.title}
          </h1>
          <p className="text-gray-400">{t.subtitle}</p>
        </div>

        {/* Login Card */}
        <Card className="bg-white/10 backdrop-blur-xl border-white/20">
          <CardHeader className="text-center pb-2">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#C4A35A]/20 mb-3 mx-auto">
              <Lock className="w-6 h-6 text-[#C4A35A]" />
            </div>
            <CardTitle className="text-white text-lg">{t.loginWithEmail}</CardTitle>
            <CardDescription className="text-gray-400">
              {t.accessCodeHint}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Error Alert */}
              {(error || localError) && (
                <Alert className="bg-red-500/20 border-red-500/30 text-red-200">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error || localError}</AlertDescription>
                </Alert>
              )}

              {/* Email Input */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-300">
                  {t.email}
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setLocalError(''); }}
                    placeholder={t.emailPlaceholder}
                    className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-gray-500 focus:border-[#C4A35A] focus:ring-[#C4A35A]"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Access Code Input */}
              <div className="space-y-2">
                <Label htmlFor="accessCode" className="text-gray-300">
                  {t.accessCode}
                </Label>
                <Input
                  id="accessCode"
                  type="text"
                  value={accessCode}
                  onChange={(e) => handleCodeChange(e.target.value)}
                  placeholder={t.accessCodePlaceholder}
                  className="text-center text-2xl tracking-[0.3em] font-mono bg-white/5 border-white/20 text-white placeholder:text-gray-500 focus:border-[#C4A35A] focus:ring-[#C4A35A]"
                  disabled={isLoading}
                  autoComplete="off"
                />
                <p className="text-xs text-gray-500 text-center">
                  {accessCode.length}/8 {language === 'en' ? 'characters' : 'caracteres'}
                </p>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-[#C4A35A] to-[#B8943D] hover:from-[#B8943D] hover:to-[#A88530] text-white font-semibold py-6"
                disabled={isLoading || accessCode.length !== 8 || !email.trim()}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-white/30 border-t-white rounded-full" />
                    {t.loggingIn}
                  </>
                ) : (
                  <>
                    {t.login}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            {/* Security Note */}
            <div className="mt-6 flex items-center gap-2 text-xs text-gray-400">
              <Shield className="w-4 h-4" />
              <span>{t.secureNote}</span>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-gray-500 text-sm mt-6">
          {t.footer}
        </p>
      </div>
    </div>
  );
}

// ============== MAIN PORTAL COMPONENT ==============
function ClientPortalContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [caseData, setCaseData] = useState<CaseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState<'en' | 'es'>('en');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  
  // Payment state
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  
  // Messages state
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [messageAttachments, setMessageAttachments] = useState<File[]>([]);
  
  // Upload state
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  
  // Document preview
  const [previewDoc, setPreviewDoc] = useState<Document | null>(null);
  const [invoiceDialog, setInvoiceDialog] = useState<Invoice | null>(null);
  
  const t = translations[language];

  // Check language preference
  useEffect(() => {
    const langParam = searchParams.get('lang');
    if (langParam === 'es' || langParam === 'en') {
      setLanguage(langParam);
    } else if (typeof navigator !== 'undefined') {
      const browserLang = navigator.language.split('-')[0];
      if (browserLang === 'es') {
        setLanguage('es');
      }
    }
  }, [searchParams]);

  // Check for existing session
  useEffect(() => {
    const token = sessionStorage.getItem('clientPortalToken');
    const caseId = sessionStorage.getItem('clientPortalCaseId');
    
    if (token && caseId) {
      setSessionToken(token);
      setIsAuthenticated(true);
    } else {
      setLoading(false);
    }
  }, []);

  // Fetch case data when authenticated
  useEffect(() => {
    if (isAuthenticated && sessionToken) {
      fetchCaseData();
    }
  }, [isAuthenticated, sessionToken]);

  const handleLogin = async (email: string, accessCode: string) => {
    setIsLoading(true);
    setLoginError(null);

    try {
      const response = await fetch('/api/client/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, accessCode }),
      });

      const data = await response.json();

      if (data.success) {
        sessionStorage.setItem('clientPortalToken', data.token);
        sessionStorage.setItem('clientPortalCaseId', data.caseId);
        sessionStorage.setItem('clientPortalClientId', data.clientId);
        sessionStorage.setItem('portalLanguage', language);
        
        setSessionToken(data.token);
        setIsAuthenticated(true);
      } else {
        setLoginError(data.error || t.error);
      }
    } catch (err) {
      setLoginError(t.error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCaseData = async () => {
    try {
      const caseId = sessionStorage.getItem('clientPortalCaseId');
      const token = sessionStorage.getItem('clientPortalToken');
      
      const response = await fetch(`/api/client/cases/${caseId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setCaseData(data.case);
      } else {
        setLoginError(data.error || 'Failed to load case');
        setIsAuthenticated(false);
      }
    } catch (err) {
      setLoginError('Failed to load case information');
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.clear();
    setIsAuthenticated(false);
    setCaseData(null);
    setSessionToken(null);
    router.push('/portal/client');
  };

  const handleDownloadDocument = async (docId: string) => {
    try {
      const response = await fetch(`/api/client/documents/${docId}`, {
        headers: { 'Authorization': `Bearer ${sessionToken}` },
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const doc = caseData?.LawDocument.find(d => d.id === docId);
        if (doc) {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = doc.name;
          a.click();
          window.URL.revokeObjectURL(url);
        }
      }
    } catch (err) {
      console.error('Download error:', err);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() && messageAttachments.length === 0) return;
    
    setSendingMessage(true);
    try {
      const formData = new FormData();
      formData.append('message', newMessage);
      formData.append('caseId', caseData?.id || '');
      messageAttachments.forEach(file => formData.append('files', file));

      const response = await fetch('/api/client/messages', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${sessionToken}` },
        body: formData,
      });

      if (response.ok) {
        setNewMessage('');
        setMessageAttachments([]);
        fetchCaseData();
      }
    } catch (err) {
      console.error('Send message error:', err);
    } finally {
      setSendingMessage(false);
    }
  };

  const handleUploadDocuments = async () => {
    if (uploadFiles.length === 0) return;
    
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('caseId', caseData?.id || '');
      uploadFiles.forEach(file => formData.append('files', file));

      const response = await fetch('/api/client/documents', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${sessionToken}` },
        body: formData,
      });

      if (response.ok) {
        setUploadFiles([]);
        fetchCaseData();
      }
    } catch (err) {
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  const handlePayment = async (method: 'wipay' | 'bank_transfer') => {
    if (!selectedInvoice) return;
    
    setPaymentProcessing(true);
    try {
      const response = await fetch('/api/client/payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionToken}`,
        },
        body: JSON.stringify({
          invoiceId: selectedInvoice.id,
          amount: selectedInvoice.balanceDue,
          method,
        }),
      });

      const data = await response.json();

      if (data.success) {
        if (method === 'wipay' && data.paymentUrl) {
          window.open(data.paymentUrl, '_blank');
        }
        setPaymentDialogOpen(false);
        fetchCaseData();
      }
    } catch (err) {
      console.error('Payment error:', err);
    } finally {
      setPaymentProcessing(false);
    }
  };

  // Show login if not authenticated
  if (!isAuthenticated) {
    return (
      <ClientPortalLogin
        onLogin={handleLogin}
        isLoading={isLoading}
        error={loginError || undefined}
        language={language}
      />
    );
  }

  // Loading state
  if (loading || !caseData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-[#1E3A5F] border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-500">{language === 'en' ? 'Loading...' : 'Cargando...'}</p>
        </div>
      </div>
    );
  }

  // Build timeline
  const timeline = [
    { id: '1', date: caseData.openDate, title: language === 'en' ? 'Case Opened' : 'Caso Abierto', description: language === 'en' ? 'Initial consultation completed' : 'Consulta inicial completada', status: 'completed' as const },
    { id: '2', date: caseData.openDate, title: language === 'en' ? 'Documents Filed' : 'Documentos Presentados', description: language === 'en' ? 'Initial documents submitted to court' : 'Documentos iniciales enviados al tribunal', status: 'completed' as const },
    ...(caseData.stage ? [{ id: '3', date: new Date().toISOString().split('T')[0], title: language === 'en' ? 'Current Stage' : 'Etapa Actual', description: caseData.stage, status: 'current' as const }] : []),
    { id: '4', date: '', title: language === 'en' ? 'Resolution' : 'Resolución', description: language === 'en' ? 'Case conclusion' : 'Conclusión del caso', status: 'pending' as const },
  ];

  // Parse invoices items
  const invoices = caseData.LawInvoice.map(inv => ({
    ...inv,
    items: typeof inv.items === 'string' ? JSON.parse(inv.items) : inv.items,
  }));

  // Calculate totals
  const totalOutstanding = invoices.reduce((sum, inv) => sum + inv.balanceDue, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Title */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1E3A5F] to-[#2C4A6F] flex items-center justify-center">
                <Scale className="w-5 h-5 text-white" />
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-semibold text-[#1E3A5F]">{t.securePortal}</p>
                <p className="text-xs text-gray-500">{caseData.caseNumber}</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {[
                { id: 'dashboard', icon: Briefcase, label: t.dashboard },
                { id: 'documents', icon: FileText, label: t.documents },
                { id: 'invoices', icon: DollarSign, label: t.invoices },
                { id: 'messages', icon: MessageSquare, label: t.messages },
                { id: 'upload', icon: Upload, label: t.upload },
              ].map(tab => (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveTab(tab.id)}
                  className={activeTab === tab.id ? 'bg-[#1E3A5F] hover:bg-[#2C4A6F]' : ''}
                >
                  <tab.icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </Button>
              ))}
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center gap-2">
              {/* Language Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const newLang = language === 'en' ? 'es' : 'en';
                  setLanguage(newLang);
                  sessionStorage.setItem('portalLanguage', newLang);
                }}
              >
                <Globe className="w-4 h-4 mr-1" />
                {language === 'en' ? 'ES' : 'EN'}
              </Button>

              {/* Logout */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-gray-600 hover:text-red-600"
              >
                <LogOut className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">{t.logout}</span>
              </Button>

              {/* Mobile Menu */}
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden py-3 border-t border-gray-100">
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'dashboard', icon: Briefcase, label: t.dashboard },
                  { id: 'documents', icon: FileText, label: t.documents },
                  { id: 'invoices', icon: DollarSign, label: t.invoices },
                  { id: 'messages', icon: MessageSquare, label: t.messages },
                  { id: 'upload', icon: Upload, label: t.upload },
                ].map(tab => (
                  <Button
                    key={tab.id}
                    variant={activeTab === tab.id ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      setActiveTab(tab.id);
                      setMobileMenuOpen(false);
                    }}
                    className={activeTab === tab.id ? 'bg-[#1E3A5F]' : ''}
                  >
                    <tab.icon className="w-4 h-4 mr-1" />
                    {tab.label}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Welcome Banner */}
            <Card className="bg-gradient-to-r from-[#1E3A5F] to-[#2C4A6F] text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[#C4A35A] text-sm">{t.welcome}</p>
                    <h1 className="text-2xl font-bold mt-1">{caseData.LawClient.fullName}</h1>
                    <p className="text-gray-300 mt-1">{caseData.title}</p>
                  </div>
                  <div className="hidden sm:block text-right">
                    <p className="text-sm text-gray-300">{t.yourCase}</p>
                    <p className="text-lg font-semibold">{caseData.caseNumber}</p>
                    <Badge className="mt-2 bg-[#C4A35A] text-white">
                      {t.statuses[caseData.status as keyof typeof t.statuses] || caseData.status}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Case Status Card */}
            <Card className="bg-gradient-to-br from-[#1E3A5F] to-[#2C4A6F] text-white border-0">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-[#C4A35A] text-sm font-medium">{caseData.caseNumber}</p>
                    <h2 className="text-xl font-bold mt-1">{caseData.title}</h2>
                  </div>
                  <Badge className={`${getStatusColor(caseData.status)} font-medium`}>
                    {t.statuses[caseData.status as keyof typeof t.statuses] || caseData.status}
                  </Badge>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-300">{t.progress}</span>
                    <span className="font-semibold text-[#C4A35A]">{caseData.progress}%</span>
                  </div>
                  <Progress value={caseData.progress} className="h-3 bg-white/20" />
                </div>

                {caseData.stage && (
                  <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 bg-[#C4A35A]/20 rounded-full">
                    <Circle className="w-3 h-3 text-[#C4A35A] fill-current" />
                    <span className="text-sm text-[#C4A35A] font-medium">
                      {t.stages[caseData.stage as keyof typeof t.stages] || caseData.stage}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Case Details Grid */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-[#1E3A5F]" />
                  {t.caseDetails}
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <FileText className="w-5 h-5 text-[#C4A35A] mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">{t.caseNumber}</p>
                    <p className="font-medium">{caseData.caseNumber}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <Scale className="w-5 h-5 text-[#C4A35A] mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">{t.practiceArea}</p>
                    <p className="font-medium">{caseData.practiceArea}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <Building className="w-5 h-5 text-[#C4A35A] mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">{t.court}</p>
                    <p className="font-medium">{caseData.court || '-'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <User className="w-5 h-5 text-[#C4A35A] mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">{t.attorney}</p>
                    <p className="font-medium">{caseData.leadAttorneyName || '-'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <Calendar className="w-5 h-5 text-[#C4A35A] mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">{t.openedOn}</p>
                    <p className="font-medium">{caseData.openDate}</p>
                  </div>
                </div>

                {caseData.nextDeadline && (
                  <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <Clock className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="text-xs text-yellow-600">{t.nextDeadline}</p>
                      <p className="font-medium text-yellow-700">{caseData.nextDeadline}</p>
                      {caseData.nextDeadlineDesc && (
                        <p className="text-xs text-yellow-600 mt-0.5">{caseData.nextDeadlineDesc}</p>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="w-5 h-5 text-[#1E3A5F]" />
                  {t.timeline}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
                  <div className="space-y-4">
                    {timeline.map((item, index) => (
                      <div key={item.id} className="relative flex gap-4">
                        <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center ${
                          item.status === 'completed'
                            ? 'bg-green-100 text-green-600'
                            : item.status === 'current'
                            ? 'bg-[#C4A35A] text-white'
                            : 'bg-gray-100 text-gray-400'
                        }`}>
                          {item.status === 'completed' ? (
                            <CheckCircle className="w-5 h-5" />
                          ) : item.status === 'current' ? (
                            <ArrowRight className="w-5 h-5" />
                          ) : (
                            <Circle className="w-5 h-5" />
                          )}
                        </div>
                        <div className={`flex-1 pb-4 ${
                          index < timeline.length - 1 ? 'border-b border-gray-100' : ''
                        }`}>
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className={`font-medium ${
                                item.status === 'current' ? 'text-[#1E3A5F]' : 'text-gray-700'
                              }`}>
                                {item.title}
                              </p>
                              <p className="text-sm text-gray-500 mt-0.5">{item.description}</p>
                            </div>
                            {item.date && (
                              <span className="text-xs text-gray-400 whitespace-nowrap">{item.date}</span>
                            )}
                          </div>
                          {item.status === 'current' && (
                            <Badge variant="outline" className="mt-2 text-[#C4A35A] border-[#C4A35A]">
                              {t.inProgress}
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Events */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#C4A35A]" />
                  {t.upcomingEvents}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {caseData.LawCalendarEvent.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">{t.noEvents}</p>
                ) : (
                  <div className="space-y-3">
                    {caseData.LawCalendarEvent.map(event => (
                      <div
                        key={event.id}
                        className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="w-12 h-12 rounded-lg bg-[#1E3A5F]/10 flex items-center justify-center">
                          <Calendar className="w-6 h-6 text-[#1E3A5F]" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{event.title}</p>
                          <div className="flex items-center gap-3 text-sm text-gray-500">
                            <span>{event.date}</span>
                            <span>•</span>
                            <span>{event.startTime}</span>
                            {event.location && (
                              <>
                                <span>•</span>
                                <span>{event.location}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <Badge variant="outline">
                          {t.eventTypes[event.eventType as keyof typeof t.eventTypes] || event.eventType}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">{t.quickActions}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Button
                    variant="outline"
                    className="h-auto py-4 flex-col"
                    onClick={() => setActiveTab('documents')}
                  >
                    <FileText className="w-6 h-6 text-[#1E3A5F] mb-2" />
                    <span className="text-sm">{t.viewDocuments}</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto py-4 flex-col"
                    onClick={() => setActiveTab('messages')}
                  >
                    <MessageSquare className="w-6 h-6 text-[#C4A35A] mb-2" />
                    <span className="text-sm">{t.sendMessage}</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto py-4 flex-col"
                    onClick={() => setActiveTab('upload')}
                  >
                    <Upload className="w-6 h-6 text-green-600 mb-2" />
                    <span className="text-sm">{t.uploadDocuments}</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto py-4 flex-col"
                    onClick={() => setActiveTab('invoices')}
                  >
                    <DollarSign className="w-6 h-6 text-purple-600 mb-2" />
                    <span className="text-sm">{t.viewInvoices}</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Documents Tab */}
        {activeTab === 'documents' && (
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder={t.searchDocuments}
                className="pl-10 bg-white border-gray-200"
              />
            </div>

            {/* Documents List */}
            {caseData.LawDocument.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="py-12 text-center">
                  <Folder className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">{t.noDocuments}</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-3">
                {caseData.LawDocument.map(doc => {
                  const FileIcon = getFileIcon(doc.mimeType);
                  return (
                    <Card key={doc.id} className="hover:shadow-md transition-shadow cursor-pointer group">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-lg bg-[#1E3A5F]/10 flex items-center justify-center flex-shrink-0">
                            <FileIcon className="w-6 h-6 text-[#1E3A5F]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">{doc.name}</p>
                            <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                              <span>{formatFileSize(doc.fileSize, t)}</span>
                              <span>•</span>
                              <span>{doc.documentDate}</span>
                            </div>
                          </div>
                          <Badge className={`${getCategoryColor(doc.category)} hidden sm:inline-flex`}>
                            {doc.category}
                          </Badge>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setPreviewDoc(doc)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Eye className="w-4 h-4 text-gray-500" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDownloadDocument(doc.id)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Download className="w-4 h-4 text-[#C4A35A]" />
                            </Button>
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Invoices Tab */}
        {activeTab === 'invoices' && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                      <ArrowDownRight className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs text-green-600">{t.totalPaid}</p>
                      <p className="text-xl font-bold text-green-700">
                        {formatCurrency(invoices.reduce((sum, inv) => sum + inv.amountPaid, 0))}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                      <ArrowUpRight className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-xs text-amber-600">{t.outstanding}</p>
                      <p className="text-xl font-bold text-amber-700">{formatCurrency(totalOutstanding)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Invoices List */}
            {invoices.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="py-12 text-center">
                  <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">{t.noInvoices}</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {invoices.map(invoice => {
                  const statusConfig = getInvoiceStatusConfig(invoice.status);
                  const StatusIcon = statusConfig.icon;
                  return (
                    <Card 
                      key={invoice.id} 
                      className="hover:shadow-md transition-shadow cursor-pointer group"
                      onClick={() => setInvoiceDialog(invoice)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-lg ${statusConfig.bgColor} flex items-center justify-center flex-shrink-0`}>
                            <StatusIcon className={`w-6 h-6 ${statusConfig.color}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900">{invoice.invoiceNumber}</p>
                            <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {invoice.issueDate}
                              </span>
                              <span>•</span>
                              <span>{t.due}: {invoice.dueDate}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-gray-900">{formatCurrency(invoice.total)}</p>
                            {invoice.balanceDue > 0 && (
                              <p className="text-sm text-amber-600">
                                {formatCurrency(invoice.balanceDue)} {language === 'en' ? 'due' : 'pendiente'}
                              </p>
                            )}
                          </div>
                          <Badge className={`${statusConfig.bgColor} ${statusConfig.color} border-0`}>
                            {t.invoiceStatuses[invoice.status as keyof typeof t.invoiceStatuses]}
                          </Badge>
                        </div>
                        
                        {invoice.balanceDue > 0 && (
                          <div className="mt-3 flex justify-end">
                            <Button
                              size="sm"
                              className="bg-[#C4A35A] hover:bg-[#B8943D]"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedInvoice(invoice);
                                setPaymentDialogOpen(true);
                              }}
                            >
                              <CreditCard className="w-4 h-4 mr-2" />
                              {t.payNow}
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Messages Tab */}
        {activeTab === 'messages' && (
          <Card className="h-[600px] flex flex-col">
            <CardHeader className="pb-3 border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Scale className="w-5 h-5 text-[#1E3A5F]" />
                  {t.secureMessages}
                </CardTitle>
                <Badge variant="outline" className="text-xs">
                  {caseData.leadAttorneyName || 'Attorney'}
                </Badge>
              </div>
            </CardHeader>

            {/* Messages Area */}
            <CardContent className="flex-1 overflow-y-auto p-4">
              {caseData.LawClientMessage.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <Scale className="w-12 h-12 text-gray-300 mb-3" />
                  <p className="text-gray-500">{t.noMessages}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {caseData.LawClientMessage.map((message) => {
                    const isClient = message.senderType === 'client';
                    return (
                      <div key={message.id} className={`flex ${isClient ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] ${isClient ? 'order-2' : 'order-1'}`}>
                          <div className={`flex items-center gap-2 mb-1 ${isClient ? 'justify-end' : 'justify-start'}`}>
                            {!isClient && (
                              <div className="w-6 h-6 rounded-full bg-[#1E3A5F] flex items-center justify-center">
                                <Scale className="w-3 h-3 text-white" />
                              </div>
                            )}
                            <span className="text-xs text-gray-500">
                              {isClient ? t.you : message.senderName}
                            </span>
                            <span className="text-xs text-gray-400">
                              {new Date(message.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                            </span>
                          </div>
                          <div className={`rounded-2xl px-4 py-3 ${
                            isClient 
                              ? 'bg-[#1E3A5F] text-white rounded-tr-none' 
                              : 'bg-gray-100 text-gray-900 rounded-tl-none'
                          }`}>
                            {message.subject && (
                              <p className={`font-medium mb-1 text-sm ${isClient ? 'text-[#C4A35A]' : 'text-[#1E3A5F]'}`}>
                                {message.subject}
                              </p>
                            )}
                            <p className="text-sm whitespace-pre-wrap">{message.message}</p>
                          </div>
                          {isClient && (
                            <div className="flex justify-end mt-1">
                              {message.isRead ? (
                                <div className="flex items-center gap-1 text-[#C4A35A]">
                                  <CheckCheck className="w-4 h-4" />
                                  <span className="text-xs">{t.read}</span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1 text-gray-400">
                                  <Check className="w-4 h-4" />
                                  <span className="text-xs">{t.sent}</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>

            {/* Input Area */}
            <div className="border-t p-4">
              <div className="flex gap-2">
                <input
                  type="file"
                  multiple
                  className="hidden"
                  id="message-attachment"
                  onChange={(e) => setMessageAttachments(Array.from(e.target.files || []))}
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => document.getElementById('message-attachment')?.click()}
                  className="flex-shrink-0"
                >
                  <Paperclip className="w-4 h-4" />
                </Button>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSendMessage(); }}
                  placeholder={t.typeMessage}
                  className="flex-1 px-3 py-2 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#C4A35A]"
                />
                <Button
                  className="bg-[#C4A35A] hover:bg-[#B8943D] flex-shrink-0 px-6"
                  onClick={handleSendMessage}
                  disabled={sendingMessage || (!newMessage.trim() && messageAttachments.length === 0)}
                >
                  {sendingMessage ? (
                    <div className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Upload Tab */}
        {activeTab === 'upload' && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t.uploadTitle}</CardTitle>
              <p className="text-sm text-gray-500">{t.uploadDescription}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div 
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-[#C4A35A] transition-colors"
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                <input
                  type="file"
                  multiple
                  className="hidden"
                  id="file-upload"
                  onChange={(e) => setUploadFiles(Array.from(e.target.files || []))}
                />
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 font-medium">{t.selectFiles}</p>
                <p className="text-gray-400 text-sm mt-1">{t.dragDrop}</p>
                <p className="text-gray-400 text-xs mt-4">{t.supportedFormats}</p>
              </div>

              {uploadFiles.length > 0 && (
                <div className="space-y-2">
                  {uploadFiles.map((file, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <File className="w-5 h-5 text-gray-500" />
                      <span className="flex-1 text-sm">{file.name}</span>
                      <span className="text-xs text-gray-400">{formatFileSize(file.size, t)}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setUploadFiles(files => files.filter((_, i) => i !== idx))}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <Button
                className="w-full bg-[#C4A35A] hover:bg-[#B8943D]"
                disabled={uploadFiles.length === 0 || uploading}
                onClick={handleUploadDocuments}
              >
                {uploading ? (
                  <>
                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-white/30 border-t-white rounded-full" />
                    {t.uploading}
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    {t.upload}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Document Preview Dialog */}
      <Dialog open={!!previewDoc} onOpenChange={() => setPreviewDoc(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <File className="w-5 h-5 text-[#1E3A5F]" />
              {previewDoc?.name}
            </DialogTitle>
          </DialogHeader>
          {previewDoc && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-xs text-gray-500">{t.category}</p>
                  <p className="font-medium">{previewDoc.category}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">{t.fileSize}</p>
                  <p className="font-medium">{formatFileSize(previewDoc.fileSize, t)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">{t.date}</p>
                  <p className="font-medium">{previewDoc.documentDate}</p>
                </div>
              </div>
              <div className="border rounded-lg p-8 bg-gray-50 min-h-[300px] flex items-center justify-center">
                {previewDoc.mimeType.startsWith('image/') ? (
                  <img src={previewDoc.fileUrl} alt={previewDoc.name} className="max-w-full max-h-[400px] object-contain" />
                ) : (
                  <div className="text-center">
                    <File className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">
                      {language === 'en' ? 'Preview not available for this file type' : 'Vista previa no disponible'}
                    </p>
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setPreviewDoc(null)}>
                  {language === 'en' ? 'Close' : 'Cerrar'}
                </Button>
                <Button 
                  className="bg-[#C4A35A] hover:bg-[#B8943D]"
                  onClick={() => {
                    handleDownloadDocument(previewDoc.id);
                    setPreviewDoc(null);
                  }}
                >
                  <Download className="w-4 h-4 mr-2" />
                  {t.download}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-[#1E3A5F]" />
              {t.paymentTitle}
            </DialogTitle>
          </DialogHeader>
          {selectedInvoice && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-500">{language === 'en' ? 'Invoice' : 'Factura'}</span>
                  <span className="font-medium">{selectedInvoice.invoiceNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">{language === 'en' ? 'Amount Due' : 'Monto Pendiente'}</span>
                  <span className="font-bold text-lg text-[#1E3A5F]">{formatCurrency(selectedInvoice.balanceDue)}</span>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-medium">{t.selectPaymentMethod}</p>
                
                <Button
                  variant="outline"
                  className="w-full justify-start h-auto py-4"
                  onClick={() => handlePayment('wipay')}
                  disabled={paymentProcessing}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium">{t.payWithWiPay}</p>
                      <p className="text-xs text-gray-500">{t.wiPayDescription}</p>
                    </div>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start h-auto py-4"
                  onClick={() => handlePayment('bank_transfer')}
                  disabled={paymentProcessing}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                      <Banknote className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium">{t.bankTransfer}</p>
                      <p className="text-xs text-gray-500">{t.bankTransferDescription}</p>
                    </div>
                  </div>
                </Button>
              </div>

              <Separator />

              <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                <p className="text-xs text-amber-700 font-medium mb-2">{t.referenceNote}</p>
                <p className="text-sm text-amber-600">{selectedInvoice.invoiceNumber}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white mt-8">
        <div className="max-w-7xl mx-auto px-4 py-4 text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} {t.securePortal} • {language === 'en' ? 'Powered by NexusOS' : 'Desarrollado por NexusOS'}</p>
        </div>
      </footer>
    </div>
  );
}

export default function ClientPortalPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-[#1E3A5F] border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    }>
      <ClientPortalContent />
    </Suspense>
  );
}
