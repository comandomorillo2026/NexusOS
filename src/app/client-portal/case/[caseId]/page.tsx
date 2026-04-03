'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Briefcase,
  FileText,
  DollarSign,
  MessageSquare,
  Upload,
  Calendar,
  LogOut,
  Scale,
  Bell,
  Globe,
  Menu,
  X,
  Clock,
  User,
} from 'lucide-react';
import {
  CaseStatusView,
  ClientDocuments,
  ClientInvoices,
  ClientMessaging,
  ClientUpload,
} from '@/components/lawfirm/portal';
import { getPortalCaseInfo } from '../actions';

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
  LawClient: {
    id: string;
    fullName: string;
    email?: string;
    phone: string;
  };
  LawDocument: Array<{
    id: string;
    name: string;
    category: string;
    fileSize: number;
    mimeType: string;
    documentDate: string;
    description?: string;
    fileUrl: string;
  }>;
  LawInvoice: Array<{
    id: string;
    invoiceNumber: string;
    issueDate: string;
    dueDate: string;
    paidDate: string | null;
    items: string;
    subtotal: number;
    discount: number;
    tax: number;
    total: number;
    amountPaid: number;
    balanceDue: number;
    status: string;
    paymentMethod?: string;
  }>;
  LawCalendarEvent: Array<{
    id: string;
    title: string;
    eventType: string;
    date: string;
    startTime: string;
    endTime?: string;
    location?: string;
    courtroom?: string;
    notes?: string;
  }>;
  LawClientMessage: Array<{
    id: string;
    senderType: string;
    senderName: string;
    subject?: string;
    message: string;
    attachments?: string;
    isRead: boolean;
    readAt?: string;
    createdAt: string;
  }>;
}

const translations = {
  en: {
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
  },
  es: {
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
  },
};

function ClientPortalCaseContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const caseId = params.caseId as string;

  const [caseData, setCaseData] = useState<CaseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState<'en' | 'es'>('en');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const t = translations[language];

  // Check for stored session and language
  useEffect(() => {
    const storedLang = sessionStorage.getItem('portalLanguage');
    if (storedLang === 'es' || storedLang === 'en') {
      setLanguage(storedLang);
    } else {
      const langParam = searchParams.get('lang');
      if (langParam === 'es' || langParam === 'en') {
        setLanguage(langParam);
      }
    }
  }, [searchParams]);

  // Fetch case data
  useEffect(() => {
    async function fetchCaseData() {
      try {
        const result = await getPortalCaseInfo(caseId);
        if (result.success && result.caseData) {
          setCaseData(result.caseData as CaseData);
        } else {
          setError(result.error || 'Failed to load case');
        }
      } catch (err) {
        setError('An error occurred loading your case');
      } finally {
        setLoading(false);
      }
    }

    if (caseId) {
      fetchCaseData();
    }
  }, [caseId]);

  const handleLogout = () => {
    sessionStorage.clear();
    router.push('/client-portal');
  };

  const handleDownloadDocument = async (docId: string) => {
    // In a real implementation, this would trigger a download
    console.log('Download document:', docId);
  };

  const handleDownloadInvoice = async (invoiceId: string) => {
    // In a real implementation, this would trigger a download
    console.log('Download invoice:', invoiceId);
  };

  const handleSendMessage = async (message: string, attachments?: File[]) => {
    // In a real implementation, this would send the message via API
    console.log('Send message:', message, attachments);
  };

  const handleUploadDocuments = async (files: File[], category: string, description: string) => {
    // In a real implementation, this would upload via API
    console.log('Upload files:', files, category, description);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-[#1E3A5F] border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-500">{language === 'en' ? 'Loading...' : 'Cargando...'}</p>
        </div>
      </div>
    );
  }

  if (error || !caseData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <Scale className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <p className="text-gray-700 mb-4">{error || 'Case not found'}</p>
            <Button onClick={() => router.push('/client-portal')}>
              {language === 'en' ? 'Back to Login' : 'Volver al Inicio'}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Mock timeline data
  const timeline = [
    { id: '1', date: caseData.openDate, title: language === 'en' ? 'Case Opened' : 'Caso Abierto', description: language === 'en' ? 'Initial consultation completed' : 'Consulta inicial completada', status: 'completed' as const },
    { id: '2', date: caseData.openDate, title: language === 'en' ? 'Documents Filed' : 'Documentos Presentados', description: language === 'en' ? 'Initial documents submitted to court' : 'Documentos iniciales enviados al tribunal', status: 'completed' as const },
    ...(caseData.stage ? [{ id: '3', date: new Date().toISOString().split('T')[0], title: language === 'en' ? 'Current Stage' : 'Etapa Actual', description: caseData.stage, status: 'current' as const }] : []),
    { id: '4', date: '', title: language === 'en' ? 'Resolution' : 'Resolución', description: language === 'en' ? 'Case conclusion' : 'Conclusión del caso', status: 'pending' as const },
  ];

  // Parse invoice items
  const invoices = caseData.LawInvoice.map(inv => ({
    ...inv,
    items: typeof inv.items === 'string' ? JSON.parse(inv.items) : inv.items,
  }));

  // Mock payments (would come from trust transactions in real implementation)
  const payments = invoices
    .filter(inv => inv.amountPaid > 0)
    .map(inv => ({
      id: inv.id,
      date: inv.paidDate || inv.issueDate,
      amount: inv.amountPaid,
      method: inv.paymentMethod || 'transfer',
      reference: inv.invoiceNumber,
    }));

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
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="bg-transparent">
                  <TabsTrigger value="dashboard" className="data-[state=active]:bg-[#1E3A5F] data-[state=active]:text-white">
                    <Briefcase className="w-4 h-4 mr-2" />
                    {t.dashboard}
                  </TabsTrigger>
                  <TabsTrigger value="documents" className="data-[state=active]:bg-[#1E3A5F] data-[state=active]:text-white">
                    <FileText className="w-4 h-4 mr-2" />
                    {t.documents}
                  </TabsTrigger>
                  <TabsTrigger value="invoices" className="data-[state=active]:bg-[#1E3A5F] data-[state=active]:text-white">
                    <DollarSign className="w-4 h-4 mr-2" />
                    {t.invoices}
                  </TabsTrigger>
                  <TabsTrigger value="messages" className="data-[state=active]:bg-[#1E3A5F] data-[state=active]:text-white">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    {t.messages}
                  </TabsTrigger>
                  <TabsTrigger value="upload" className="data-[state=active]:bg-[#1E3A5F] data-[state=active]:text-white">
                    <Upload className="w-4 h-4 mr-2" />
                    {t.upload}
                  </TabsTrigger>
                </TabsList>
              </Tabs>
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
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6 mt-0">
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
                      {caseData.status}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Case Status View */}
            <CaseStatusView
              caseData={{
                caseNumber: caseData.caseNumber,
                title: caseData.title,
                status: caseData.status,
                stage: caseData.stage || '',
                progress: caseData.progress,
                practiceArea: caseData.practiceArea,
                court: caseData.court || '',
                judge: caseData.judge || '',
                openDate: caseData.openDate,
                nextDeadline: caseData.nextDeadline || '',
                nextDeadlineDesc: caseData.nextDeadlineDesc || '',
                leadAttorneyName: caseData.leadAttorneyName || '',
                description: caseData.description || '',
                timeline,
              }}
              language={language}
            />

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
                        <Badge variant="outline">{event.eventType}</Badge>
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
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents" className="mt-0">
            <ClientDocuments
              documents={caseData.LawDocument}
              onDownload={handleDownloadDocument}
              language={language}
            />
          </TabsContent>

          {/* Invoices Tab */}
          <TabsContent value="invoices" className="mt-0">
            <ClientInvoices
              invoices={invoices}
              payments={payments}
              onDownloadInvoice={handleDownloadInvoice}
              language={language}
            />
          </TabsContent>

          {/* Messages Tab */}
          <TabsContent value="messages" className="mt-0">
            <ClientMessaging
              messages={caseData.LawClientMessage.map(m => ({
                ...m,
                attachments: m.attachments ? JSON.parse(m.attachments) : undefined,
              }))}
              attorneyName={caseData.leadAttorneyName || 'Your Attorney'}
              onSendMessage={handleSendMessage}
              language={language}
            />
          </TabsContent>

          {/* Upload Tab */}
          <TabsContent value="upload" className="mt-0">
            <ClientUpload
              onUpload={handleUploadDocuments}
              language={language}
            />
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white mt-8">
        <div className="max-w-7xl mx-auto px-4 py-4 text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} {t.securePortal} • {language === 'en' ? 'Powered by NexusOS' : 'Desarrollado por NexusOS'}</p>
        </div>
      </footer>
    </div>
  );
}

export default function ClientPortalCasePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-[#1E3A5F] border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    }>
      <ClientPortalCaseContent />
    </Suspense>
  );
}
