'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  FileText,
  FileSearch,
  Search,
  Languages,
  MessageSquare,
  Shield,
  AlertTriangle,
  Zap,
  BookOpen,
  Copy,
  Download,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Loader2,
  CheckCircle,
  AlertCircle,
  Upload,
  FileDiff,
  Eye,
  Scan,
  Users,
  Calendar,
  DollarSign,
  Building,
  Scale,
  FileCheck,
  ArrowRight,
  Bot,
  User,
  Send,
  Trash2,
  X,
  Plus,
  Minus,
  Info,
  Target,
  TrendingUp,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { TT_LEGAL_TEMPLATES, type TTTemplateKey } from '@/lib/ai/tt-legal-templates';

// ============== TYPES ==============
interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ExtractedEntity {
  type: 'person' | 'company' | 'date' | 'amount' | 'address' | 'phone' | 'email' | 'reference';
  value: string;
  context: string;
  confidence: number;
}

interface RiskItem {
  id: string;
  level: 'high' | 'medium' | 'low';
  category: string;
  description: string;
  clauseReference: string;
  recommendation: string;
}

interface CitationReference {
  id: string;
  type: 'statute' | 'case' | 'rule';
  name: string;
  reference: string;
  relevance: string;
  url?: string;
}

interface DocumentAnalysis {
  summary: string;
  documentType: string;
  entities: ExtractedEntity[];
  risks: RiskItem[];
  citations: CitationReference[];
  keyClauses: { type: string; content: string; analysis: string }[];
  overallRiskScore: number;
  recommendations: string[];
}

interface GeneratedDocument {
  content: string;
  type: string;
  timestamp: string;
}

interface DocumentDiff {
  additions: { line: number; content: string }[];
  deletions: { line: number; content: string }[];
  modifications: { line: number; old: string; new: string }[];
  summary: string;
}

// ============== MAIN COMPONENT ==============
export function AIDocumentAssistant() {
  const [activeTab, setActiveTab] = useState('overview');
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#EDE9FE] flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#C4A35A] to-[#d4a84a] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            AI Document Assistant
          </h2>
          <p className="text-[#9D7BEA] mt-1">
            Powered by AI for Trinidad & Tobago legal context
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-[#34D399] text-[#34D399]">
            <Zap className="w-3 h-3 mr-1" />
            AI Ready
          </Badge>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 lg:grid-cols-8 gap-2 bg-transparent h-auto p-0">
          <TabsTrigger
            value="overview"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#C4A35A] data-[state=active]:to-[#d4a84a] data-[state=active]:text-white bg-[rgba(108,63,206,0.07)] text-[#9D7BEA] border border-[rgba(167,139,250,0.2)]"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="generate"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#C4A35A] data-[state=active]:to-[#d4a84a] data-[state=active]:text-white bg-[rgba(108,63,206,0.07)] text-[#9D7BEA] border border-[rgba(167,139,250,0.2)]"
          >
            <FileText className="w-4 h-4 mr-1" />
            Generate
          </TabsTrigger>
          <TabsTrigger
            value="analyze"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#22D3EE] data-[state=active]:to-[#06B6D4] data-[state=active]:text-white bg-[rgba(108,63,206,0.07)] text-[#9D7BEA] border border-[rgba(167,139,250,0.2)]"
          >
            <Scan className="w-4 h-4 mr-1" />
            Analyze
          </TabsTrigger>
          <TabsTrigger
            value="compare"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#34D399] data-[state=active]:to-[#10B981] data-[state=active]:text-white bg-[rgba(108,63,206,0.07)] text-[#9D7BEA] border border-[rgba(167,139,250,0.2)]"
          >
            <FileDiff className="w-4 h-4 mr-1" />
            Compare
          </TabsTrigger>
          <TabsTrigger
            value="templates"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#EC4899] data-[state=active]:to-[#DB2777] data-[state=active]:text-white bg-[rgba(108,63,206,0.07)] text-[#9D7BEA] border border-[rgba(167,139,250,0.2)]"
          >
            <BookOpen className="w-4 h-4 mr-1" />
            Templates
          </TabsTrigger>
          <TabsTrigger
            value="citations"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#6C3FCE] data-[state=active]:to-[#C026D3] data-[state=active]:text-white bg-[rgba(108,63,206,0.07)] text-[#9D7BEA] border border-[rgba(167,139,250,0.2)]"
          >
            <Scale className="w-4 h-4 mr-1" />
            Citations
          </TabsTrigger>
          <TabsTrigger
            value="chat"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#6C3FCE] data-[state=active]:to-[#C026D3] data-[state=active]:text-white bg-[rgba(108,63,206,0.07)] text-[#9D7BEA] border border-[rgba(167,139,250,0.2)] col-span-4 lg:col-span-1"
          >
            <MessageSquare className="w-4 h-4 mr-1" />
            Chat
          </TabsTrigger>
          <TabsTrigger
            value="ocr"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#F59E0B] data-[state=active]:to-[#D97706] data-[state=active]:text-white bg-[rgba(108,63,206,0.07)] text-[#9D7BEA] border border-[rgba(167,139,250,0.2)] col-span-4 lg:col-span-1"
          >
            <Eye className="w-4 h-4 mr-1" />
            OCR
          </TabsTrigger>
        </TabsList>

        {/* Tab Contents */}
        <TabsContent value="overview" className="mt-6">
          <OverviewTab onNavigate={setActiveTab} />
        </TabsContent>
        
        <TabsContent value="generate" className="mt-6">
          <GenerateTab />
        </TabsContent>
        
        <TabsContent value="analyze" className="mt-6">
          <AnalyzeTab />
        </TabsContent>
        
        <TabsContent value="compare" className="mt-6">
          <CompareTab />
        </TabsContent>
        
        <TabsContent value="templates" className="mt-6">
          <TemplatesTab onSelectTemplate={(key) => setActiveTab('generate')} />
        </TabsContent>
        
        <TabsContent value="citations" className="mt-6">
          <CitationsTab />
        </TabsContent>
        
        <TabsContent value="chat" className="mt-6">
          <Card className="bg-[#0A0820] border-[rgba(167,139,250,0.2)]">
            <CardContent className="p-6">
              <ChatTab />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="ocr" className="mt-6">
          <OCRTab />
        </TabsContent>
      </Tabs>

      {/* Legal Reference Footer */}
      <Card className="bg-[#0A0820] border-[rgba(167,139,250,0.2)]">
        <CardHeader className="pb-2">
          <CardTitle className="text-[#EDE9FE] text-sm flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#C4A35A]" />
            Supported Legal References
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {[
              'Civil Procedure Rules 2016',
              'Companies Act Ch. 81:01',
              'Conveyancing & Property Act',
              'Employment Act',
              'Data Protection Act',
              'Matrimonial Proceedings Act',
              'T&T Constitution',
              'Wills & Probate Act',
              'Land Registration Act',
            ].map((ref, i) => (
              <Badge
                key={i}
                variant="outline"
                className="border-[rgba(167,139,250,0.2)] text-[#9D7BEA] text-xs"
              >
                {ref}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ============== OVERVIEW TAB ==============
function OverviewTab({ onNavigate }: { onNavigate: (tab: string) => void }) {
  const features = [
    {
      id: 'generate',
      name: 'Document Generator',
      description: 'Create legal documents from templates using AI',
      icon: FileText,
      color: '#C4A35A',
      capabilities: ['Contracts', 'Court Motions', 'Legal Letters', 'TT Templates'],
    },
    {
      id: 'analyze',
      name: 'Document Analyzer',
      description: 'Comprehensive document analysis with AI',
      icon: Scan,
      color: '#22D3EE',
      capabilities: ['Entity Extraction', 'Risk Analysis', 'Summary', 'Key Clauses'],
    },
    {
      id: 'compare',
      name: 'Document Comparison',
      description: 'Compare two documents side by side',
      icon: FileDiff,
      color: '#34D399',
      capabilities: ['Diff Highlighting', 'Change Summary', 'Risk Changes'],
    },
    {
      id: 'templates',
      name: 'TT Legal Templates',
      description: 'Trinidad & Tobago specific legal templates',
      icon: BookOpen,
      color: '#EC4899',
      capabilities: ['Wills', 'Property Transfer', 'Tenancy', 'Employment'],
    },
    {
      id: 'citations',
      name: 'Legal Citation Finder',
      description: 'Find relevant legal citations',
      icon: Scale,
      color: '#6C3FCE',
      capabilities: ['Statutes', 'Case Law', 'Court Rules', 'TT References'],
    },
    {
      id: 'ocr',
      name: 'OCR Scanner',
      description: 'Extract text from scanned documents',
      icon: Eye,
      color: '#F59E0B',
      capabilities: ['PDF Support', 'Image OCR', 'Handwriting', 'Tables'],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Feature Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {features.map((feature) => (
          <Card
            key={feature.id}
            className="bg-[#0A0820] border-[rgba(167,139,250,0.2)] hover:border-[rgba(167,139,250,0.4)] transition-colors cursor-pointer"
            onClick={() => onNavigate(feature.id)}
          >
            <CardHeader>
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${feature.color}20` }}
                >
                  <feature.icon className="w-6 h-6" style={{ color: feature.color }} />
                </div>
                <div>
                  <CardTitle className="text-[#EDE9FE] text-lg">{feature.name}</CardTitle>
                  <CardDescription className="text-[#9D7BEA] text-sm">
                    {feature.description}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {feature.capabilities.map((cap, i) => (
                  <Badge
                    key={i}
                    variant="outline"
                    className="border-[rgba(167,139,250,0.2)] text-[#9D7BEA]"
                  >
                    {cap}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Start Guide */}
      <Card className="bg-[#0A0820] border-[rgba(167,139,250,0.2)]">
        <CardHeader>
          <CardTitle className="text-[#EDE9FE] flex items-center gap-2">
            <Zap className="w-5 h-5 text-[#F0B429]" />
            Quick Start Guide
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[#C4A35A]/20 flex items-center justify-center shrink-0">
                  <span className="text-[#C4A35A] font-semibold">1</span>
                </div>
                <div>
                  <h4 className="font-medium text-[#EDE9FE]">Generate Documents</h4>
                  <p className="text-sm text-[#9D7BEA]">
                    Create contracts, motions, and letters from Trinidad & Tobago templates with AI assistance.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[#22D3EE]/20 flex items-center justify-center shrink-0">
                  <span className="text-[#22D3EE] font-semibold">2</span>
                </div>
                <div>
                  <h4 className="font-medium text-[#EDE9FE]">Analyze Documents</h4>
                  <p className="text-sm text-[#9D7BEA]">
                    Upload or paste documents to get summaries, extract entities, identify risks, and find citations.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[#34D399]/20 flex items-center justify-center shrink-0">
                  <span className="text-[#34D399] font-semibold">3</span>
                </div>
                <div>
                  <h4 className="font-medium text-[#EDE9FE]">Compare Versions</h4>
                  <p className="text-sm text-[#9D7BEA]">
                    Compare two document versions to see additions, deletions, and modifications.
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[#EC4899]/20 flex items-center justify-center shrink-0">
                  <span className="text-[#EC4899] font-semibold">4</span>
                </div>
                <div>
                  <h4 className="font-medium text-[#EDE9FE]">Use TT Templates</h4>
                  <p className="text-sm text-[#9D7BEA]">
                    Access pre-built templates for Wills, Property Transfer, Tenancy, and more.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[#6C3FCE]/20 flex items-center justify-center shrink-0">
                  <span className="text-[#6C3FCE] font-semibold">5</span>
                </div>
                <div>
                  <h4 className="font-medium text-[#EDE9FE]">Chat with AI</h4>
                  <p className="text-sm text-[#9D7BEA]">
                    Ask questions about documents, get drafting help, or discuss legal matters.
                  </p>
                </div>
              </div>
              <div className="p-4 rounded-lg bg-[rgba(108,63,206,0.05)] border border-[rgba(167,139,250,0.1)]">
                <div className="flex items-start gap-2">
                  <Shield className="w-5 h-5 text-[#C4A35A] shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-medium text-[#EDE9FE] text-sm">Trinidad & Tobago Context</h5>
                    <p className="text-xs text-[#9D7BEA] mt-1">
                      AI is trained on T&T legal context including Civil Procedure Rules 2016, 
                      local statutes, and Caribbean case law.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Warning */}
      <div className="p-4 rounded-lg bg-[#F59E0B]/10 border border-[#F59E0B]/20">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-[#F59E0B] shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-[#F59E0B]">Important Disclaimer</h4>
            <p className="text-sm text-[#F59E0B]/80 mt-1">
              AI-generated content should be reviewed by a qualified attorney before use. 
              This tool assists with legal work but does not replace professional legal advice.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============== GENERATE TAB ==============
function GenerateTab() {
  const { toast } = useToast();
  const [documentType, setDocumentType] = useState('');
  const [template, setTemplate] = useState<TTTemplateKey | ''>('');
  const [context, setContext] = useState('');
  const [clientInfo, setClientInfo] = useState({
    name: '',
    address: '',
    email: '',
    phone: '',
  });
  const [caseInfo, setCaseInfo] = useState({
    caseNumber: '',
    court: '',
    opposingParty: '',
    matterDescription: '',
  });
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [loading, setLoading] = useState(false);
  const [generatedDoc, setGeneratedDoc] = useState<GeneratedDocument | null>(null);
  const [copied, setCopied] = useState(false);

  const templateCategories = {
    wills: Object.keys(TT_LEGAL_TEMPLATES).filter(k => k.includes('Will') || k.includes('Probate')),
    property: Object.keys(TT_LEGAL_TEMPLATES).filter(k => k.includes('Property') || k.includes('Transfer') || k.includes('Tenancy')),
    employment: Object.keys(TT_LEGAL_TEMPLATES).filter(k => k.includes('Employment')),
    corporate: Object.keys(TT_LEGAL_TEMPLATES).filter(k => k.includes('Company') || k.includes('Shareholders') || k.includes('Director')),
    family: Object.keys(TT_LEGAL_TEMPLATES).filter(k => k.includes('Prenuptial') || k.includes('Matrimonial')),
    other: Object.keys(TT_LEGAL_TEMPLATES).filter(k => 
      !k.includes('Will') && !k.includes('Probate') && !k.includes('Property') && 
      !k.includes('Transfer') && !k.includes('Tenancy') && !k.includes('Employment') &&
      !k.includes('Company') && !k.includes('Shareholders') && !k.includes('Director') &&
      !k.includes('Prenuptial') && !k.includes('Matrimonial')
    ),
  };

  const handleGenerate = async () => {
    if (!documentType && !template) {
      toast({
        title: 'Error',
        description: 'Please select a document type or template',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/lawfirm/ai/documents/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentType,
          templateKey: template || undefined,
          context,
          clientInfo: showAdvanced ? clientInfo : undefined,
          caseInfo: showAdvanced ? caseInfo : undefined,
        }),
      });

      if (!response.ok) throw new Error('Failed to generate document');

      const data = await response.json();
      setGeneratedDoc({
        content: data.document,
        type: data.documentType,
        timestamp: data.timestamp,
      });

      toast({
        title: 'Success',
        description: 'Document generated successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to generate document',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (generatedDoc) {
      navigator.clipboard.writeText(generatedDoc.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({ title: 'Copied', description: 'Document copied to clipboard' });
    }
  };

  const handleDownload = () => {
    if (generatedDoc) {
      const blob = new Blob([generatedDoc.content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${generatedDoc.type.replace(/[^a-z0-9]/gi, '_')}_${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="space-y-6">
      {/* Generator Form */}
      <Card className="bg-[#0A0820] border-[rgba(167,139,250,0.2)]">
        <CardHeader>
          <CardTitle className="text-[#EDE9FE] flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#C4A35A]" />
            AI Document Generator
          </CardTitle>
          <CardDescription className="text-[#9D7BEA]">
            Generate professional legal documents with AI assistance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Document Type Selection */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[#9D7BEA]">Document Type</Label>
              <Input
                placeholder="e.g., Employment Contract, Cease and Desist Letter"
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value)}
                className="bg-[rgba(108,63,206,0.07)] border-[rgba(167,139,250,0.2)] text-[#EDE9FE]"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[#9D7BEA]">Or Select TT Template</Label>
              <Select value={template} onValueChange={(v) => {
                setTemplate(v as TTTemplateKey);
                setDocumentType('');
              }}>
                <SelectTrigger className="bg-[rgba(108,63,206,0.07)] border-[rgba(167,139,250,0.2)] text-[#EDE9FE]">
                  <SelectValue placeholder="Choose a template..." />
                </SelectTrigger>
                <SelectContent className="bg-[#0A0820] border-[rgba(167,139,250,0.2)]">
                  <div className="px-2 py-1 text-xs text-[#9D7BEA] uppercase">Wills & Probate</div>
                  {templateCategories.wills.map((key) => (
                    <SelectItem key={key} value={key} className="text-[#EDE9FE] focus:bg-[rgba(108,63,206,0.2)]">
                      {TT_LEGAL_TEMPLATES[key as TTTemplateKey]?.name || key}
                    </SelectItem>
                  ))}
                  <div className="px-2 py-1 text-xs text-[#9D7BEA] uppercase mt-2">Property & Conveyancing</div>
                  {templateCategories.property.map((key) => (
                    <SelectItem key={key} value={key} className="text-[#EDE9FE] focus:bg-[rgba(108,63,206,0.2)]">
                      {TT_LEGAL_TEMPLATES[key as TTTemplateKey]?.name || key}
                    </SelectItem>
                  ))}
                  <div className="px-2 py-1 text-xs text-[#9D7BEA] uppercase mt-2">Employment</div>
                  {templateCategories.employment.map((key) => (
                    <SelectItem key={key} value={key} className="text-[#EDE9FE] focus:bg-[rgba(108,63,206,0.2)]">
                      {TT_LEGAL_TEMPLATES[key as TTTemplateKey]?.name || key}
                    </SelectItem>
                  ))}
                  <div className="px-2 py-1 text-xs text-[#9D7BEA] uppercase mt-2">Corporate</div>
                  {templateCategories.corporate.map((key) => (
                    <SelectItem key={key} value={key} className="text-[#EDE9FE] focus:bg-[rgba(108,63,206,0.2)]">
                      {TT_LEGAL_TEMPLATES[key as TTTemplateKey]?.name || key}
                    </SelectItem>
                  ))}
                  <div className="px-2 py-1 text-xs text-[#9D7BEA] uppercase mt-2">Family</div>
                  {templateCategories.family.map((key) => (
                    <SelectItem key={key} value={key} className="text-[#EDE9FE] focus:bg-[rgba(108,63,206,0.2)]">
                      {TT_LEGAL_TEMPLATES[key as TTTemplateKey]?.name || key}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Context */}
          <div className="space-y-2">
            <Label className="text-[#9D7BEA]">Additional Context / Instructions</Label>
            <Textarea
              placeholder="Describe the specific requirements, parties involved, key terms you want included..."
              value={context}
              onChange={(e) => setContext(e.target.value)}
              rows={4}
              className="bg-[rgba(108,63,206,0.07)] border-[rgba(167,139,250,0.2)] text-[#EDE9FE] resize-none"
            />
          </div>

          {/* Advanced Options */}
          <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className="w-full text-[#9D7BEA] hover:text-[#EDE9FE] hover:bg-[rgba(108,63,206,0.1)]"
              >
                {showAdvanced ? <ChevronUp className="w-4 h-4 mr-2" /> : <ChevronDown className="w-4 h-4 mr-2" />}
                Advanced Options (Client/Case Info)
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 mt-4">
              {/* Client Information */}
              <div className="p-4 rounded-lg bg-[rgba(108,63,206,0.05)] border border-[rgba(167,139,250,0.1)]">
                <h4 className="text-sm font-medium text-[#EDE9FE] mb-3">Client Information</h4>
                <div className="grid md:grid-cols-2 gap-3">
                  <Input
                    placeholder="Client Name"
                    value={clientInfo.name}
                    onChange={(e) => setClientInfo({ ...clientInfo, name: e.target.value })}
                    className="bg-[rgba(108,63,206,0.07)] border-[rgba(167,139,250,0.2)] text-[#EDE9FE]"
                  />
                  <Input
                    placeholder="Address"
                    value={clientInfo.address}
                    onChange={(e) => setClientInfo({ ...clientInfo, address: e.target.value })}
                    className="bg-[rgba(108,63,206,0.07)] border-[rgba(167,139,250,0.2)] text-[#EDE9FE]"
                  />
                  <Input
                    placeholder="Email"
                    type="email"
                    value={clientInfo.email}
                    onChange={(e) => setClientInfo({ ...clientInfo, email: e.target.value })}
                    className="bg-[rgba(108,63,206,0.07)] border-[rgba(167,139,250,0.2)] text-[#EDE9FE]"
                  />
                  <Input
                    placeholder="Phone"
                    value={clientInfo.phone}
                    onChange={(e) => setClientInfo({ ...clientInfo, phone: e.target.value })}
                    className="bg-[rgba(108,63,206,0.07)] border-[rgba(167,139,250,0.2)] text-[#EDE9FE]"
                  />
                </div>
              </div>

              {/* Case Information */}
              <div className="p-4 rounded-lg bg-[rgba(108,63,206,0.05)] border border-[rgba(167,139,250,0.1)]">
                <h4 className="text-sm font-medium text-[#EDE9FE] mb-3">Case Information</h4>
                <div className="grid md:grid-cols-2 gap-3">
                  <Input
                    placeholder="Case Number"
                    value={caseInfo.caseNumber}
                    onChange={(e) => setCaseInfo({ ...caseInfo, caseNumber: e.target.value })}
                    className="bg-[rgba(108,63,206,0.07)] border-[rgba(167,139,250,0.2)] text-[#EDE9FE]"
                  />
                  <Input
                    placeholder="Court"
                    value={caseInfo.court}
                    onChange={(e) => setCaseInfo({ ...caseInfo, court: e.target.value })}
                    className="bg-[rgba(108,63,206,0.07)] border-[rgba(167,139,250,0.2)] text-[#EDE9FE]"
                  />
                  <Input
                    placeholder="Opposing Party"
                    value={caseInfo.opposingParty}
                    onChange={(e) => setCaseInfo({ ...caseInfo, opposingParty: e.target.value })}
                    className="bg-[rgba(108,63,206,0.07)] border-[rgba(167,139,250,0.2)] text-[#EDE9FE]"
                  />
                  <Input
                    placeholder="Matter Description"
                    value={caseInfo.matterDescription}
                    onChange={(e) => setCaseInfo({ ...caseInfo, matterDescription: e.target.value })}
                    className="bg-[rgba(108,63,206,0.07)] border-[rgba(167,139,250,0.2)] text-[#EDE9FE]"
                  />
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#C4A35A] to-[#d4a84a] text-white hover:opacity-90"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating Document...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Document
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Generated Document Preview */}
      {generatedDoc && (
        <Card className="bg-[#0A0820] border-[rgba(167,139,250,0.2)]">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-[#EDE9FE] flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#22D3EE]" />
                  Generated Document
                </CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="border-[#C4A35A] text-[#C4A35A]">
                    {generatedDoc.type}
                  </Badge>
                  <span className="text-xs text-[rgba(167,139,250,0.5)]">
                    {new Date(generatedDoc.timestamp).toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  className="border-[rgba(167,139,250,0.2)] text-[#9D7BEA] hover:text-[#EDE9FE]"
                >
                  {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleGenerate}
                  className="border-[rgba(167,139,250,0.2)] text-[#9D7BEA] hover:text-[#EDE9FE]"
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownload}
                  className="border-[rgba(167,139,250,0.2)] text-[#9D7BEA] hover:text-[#EDE9FE]"
                >
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <div className="p-4 rounded-lg bg-[rgba(108,63,206,0.05)] border border-[rgba(167,139,250,0.1)] max-h-[500px] overflow-y-auto">
                <pre className="text-sm text-[#EDE9FE] whitespace-pre-wrap font-mono">
                  {generatedDoc.content}
                </pre>
              </div>
            </div>
            
            {/* Warning Notice */}
            <div className="mt-4 p-3 rounded-lg bg-[#F59E0B]/10 border border-[#F59E0B]/20">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-[#F59E0B] shrink-0 mt-0.5" />
                <div className="text-sm text-[#F59E0B]">
                  <strong>AI Generated Document:</strong> This document was generated by AI and should be reviewed by a qualified attorney before use. 
                  Fill in all bracketed placeholders [LIKE THIS] with actual information.
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ============== ANALYZE TAB ==============
function AnalyzeTab() {
  const { toast } = useToast();
  const [documentText, setDocumentText] = useState('');
  const [analysis, setAnalysis] = useState<DocumentAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState<'summary' | 'entities' | 'risks' | 'clauses'>('summary');

  const handleAnalyze = async () => {
    if (!documentText.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter document text to analyze',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/lawfirm/ai/documents/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ document: documentText }),
      });

      if (!response.ok) throw new Error('Failed to analyze document');

      const data = await response.json();
      setAnalysis(data.analysis);
      
      toast({
        title: 'Analysis Complete',
        description: 'Document has been analyzed successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to analyze document',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (level: 'high' | 'medium' | 'low') => {
    switch (level) {
      case 'high': return 'text-[#EF4444] bg-[#EF4444]/10 border-[#EF4444]/30';
      case 'medium': return 'text-[#F59E0B] bg-[#F59E0B]/10 border-[#F59E0B]/30';
      case 'low': return 'text-[#22C55E] bg-[#22C55E]/10 border-[#22C55E]/30';
    }
  };

  const getEntityIcon = (type: ExtractedEntity['type']) => {
    switch (type) {
      case 'person': return <Users className="w-4 h-4" />;
      case 'company': return <Building className="w-4 h-4" />;
      case 'date': return <Calendar className="w-4 h-4" />;
      case 'amount': return <DollarSign className="w-4 h-4" />;
      case 'address': return <FileText className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Input Panel */}
      <Card className="bg-[#0A0820] border-[rgba(167,139,250,0.2)]">
        <CardHeader>
          <CardTitle className="text-[#EDE9FE] flex items-center gap-2">
            <Scan className="w-5 h-5 text-[#22D3EE]" />
            Document Input
          </CardTitle>
          <CardDescription className="text-[#9D7BEA]">
            Paste or type document text for comprehensive analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Paste your legal document here for analysis..."
            value={documentText}
            onChange={(e) => setDocumentText(e.target.value)}
            rows={15}
            className="bg-[rgba(108,63,206,0.07)] border-[rgba(167,139,250,0.2)] text-[#EDE9FE] resize-none font-mono text-sm"
          />
          
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#9D7BEA]">
              {documentText.length.toLocaleString()} characters
            </span>
            <Button
              onClick={handleAnalyze}
              disabled={loading || !documentText.trim()}
              className="bg-gradient-to-r from-[#22D3EE] to-[#06B6D4] text-white hover:opacity-90"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Scan className="w-4 h-4 mr-2" />
                  Analyze Document
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Analysis Results */}
      <Card className="bg-[#0A0820] border-[rgba(167,139,250,0.2)]">
        <CardHeader>
          <CardTitle className="text-[#EDE9FE] flex items-center gap-2">
            <Target className="w-5 h-5 text-[#34D399]" />
            Analysis Results
          </CardTitle>
          {analysis && (
            <div className="flex items-center gap-4 mt-2">
              <Badge variant="outline" className="border-[#22D3EE] text-[#22D3EE]">
                {analysis.documentType}
              </Badge>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#9D7BEA]">Risk Score:</span>
                <div className="flex items-center gap-1">
                  <Progress value={analysis.overallRiskScore * 10} className="w-16 h-2" />
                  <span className={`text-xs font-medium ${
                    analysis.overallRiskScore >= 7 ? 'text-[#EF4444]' :
                    analysis.overallRiskScore >= 4 ? 'text-[#F59E0B]' : 'text-[#22C55E]'
                  }`}>
                    {analysis.overallRiskScore}/10
                  </span>
                </div>
              </div>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {analysis ? (
            <div className="space-y-4">
              {/* Section Tabs */}
              <div className="flex gap-2">
                {(['summary', 'entities', 'risks', 'clauses'] as const).map((section) => (
                  <Button
                    key={section}
                    variant={activeSection === section ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setActiveSection(section)}
                    className={activeSection === section 
                      ? 'bg-[#C4A35A] text-white' 
                      : 'border-[rgba(167,139,250,0.2)] text-[#9D7BEA]'
                    }
                  >
                    {section.charAt(0).toUpperCase() + section.slice(1)}
                    {section === 'entities' && analysis.entities.length > 0 && (
                      <Badge className="ml-1 bg-[rgba(108,63,206,0.3)] text-[#EDE9FE]">
                        {analysis.entities.length}
                      </Badge>
                    )}
                    {section === 'risks' && analysis.risks.length > 0 && (
                      <Badge className="ml-1 bg-[#EF4444]/30 text-[#EDE9FE]">
                        {analysis.risks.length}
                      </Badge>
                    )}
                  </Button>
                ))}
              </div>

              {/* Summary Section */}
              {activeSection === 'summary' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-[rgba(108,63,206,0.05)] border border-[rgba(167,139,250,0.1)]">
                    <h4 className="text-sm font-medium text-[#EDE9FE] mb-2">Document Summary</h4>
                    <p className="text-sm text-[#9D7BEA]">{analysis.summary}</p>
                  </div>
                  
                  {analysis.recommendations.length > 0 && (
                    <div className="p-4 rounded-lg bg-[#34D399]/10 border border-[#34D399]/20">
                      <h4 className="text-sm font-medium text-[#34D399] mb-2 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        Recommendations
                      </h4>
                      <ul className="space-y-1">
                        {analysis.recommendations.map((rec, i) => (
                          <li key={i} className="text-sm text-[#9D7BEA] flex items-start gap-2">
                            <ArrowRight className="w-3 h-3 mt-1.5 text-[#34D399]" />
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Entities Section */}
              {activeSection === 'entities' && (
                <ScrollArea className="h-[400px]">
                  <div className="space-y-2">
                    {analysis.entities.map((entity, i) => (
                      <div
                        key={i}
                        className="p-3 rounded-lg bg-[rgba(108,63,206,0.05)] border border-[rgba(167,139,250,0.1)]"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="border-[#C4A35A] text-[#C4A35A]">
                            {getEntityIcon(entity.type)}
                            <span className="ml-1 capitalize">{entity.type}</span>
                          </Badge>
                          <span className="text-sm font-medium text-[#EDE9FE]">{entity.value}</span>
                        </div>
                        <p className="text-xs text-[#9D7BEA] ml-1">{entity.context}</p>
                      </div>
                    ))}
                    {analysis.entities.length === 0 && (
                      <div className="text-center py-8 text-[#9D7BEA]">
                        No entities extracted
                      </div>
                    )}
                  </div>
                </ScrollArea>
              )}

              {/* Risks Section */}
              {activeSection === 'risks' && (
                <ScrollArea className="h-[400px]">
                  <div className="space-y-2">
                    {analysis.risks.map((risk) => (
                      <div
                        key={risk.id}
                        className={`p-3 rounded-lg border ${getRiskColor(risk.level)}`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4" />
                            <span className="text-sm font-medium capitalize">{risk.level} Risk</span>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {risk.category}
                          </Badge>
                        </div>
                        <p className="text-sm text-[#EDE9FE] mb-1">{risk.description}</p>
                        <p className="text-xs text-[#9D7BEA]">
                          <strong>Clause:</strong> {risk.clauseReference}
                        </p>
                        <p className="text-xs text-[#34D399] mt-1">
                          <strong>Recommendation:</strong> {risk.recommendation}
                        </p>
                      </div>
                    ))}
                    {analysis.risks.length === 0 && (
                      <div className="text-center py-8 text-[#9D7BEA]">
                        No significant risks identified
                      </div>
                    )}
                  </div>
                </ScrollArea>
              )}

              {/* Clauses Section */}
              {activeSection === 'clauses' && (
                <ScrollArea className="h-[400px]">
                  <div className="space-y-3">
                    {analysis.keyClauses.map((clause, i) => (
                      <div
                        key={i}
                        className="p-3 rounded-lg bg-[rgba(108,63,206,0.05)] border border-[rgba(167,139,250,0.1)]"
                      >
                        <Badge variant="outline" className="border-[#22D3EE] text-[#22D3EE] mb-2">
                          {clause.type}
                        </Badge>
                        <div className="text-sm text-[#EDE9FE] font-mono bg-[rgba(0,0,0,0.2)] p-2 rounded mb-2">
                          {clause.content}
                        </div>
                        <p className="text-xs text-[#9D7BEA]">{clause.analysis}</p>
                      </div>
                    ))}
                    {analysis.keyClauses.length === 0 && (
                      <div className="text-center py-8 text-[#9D7BEA]">
                        No key clauses extracted
                      </div>
                    )}
                  </div>
                </ScrollArea>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <Scan className="w-12 h-12 text-[#9D7BEA] mx-auto mb-4 opacity-50" />
              <p className="text-[#9D7BEA]">
                Enter a document and click "Analyze" to see results
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ============== COMPARE TAB ==============
function CompareTab() {
  const { toast } = useToast();
  const [doc1, setDoc1] = useState('');
  const [doc2, setDoc2] = useState('');
  const [diff, setDiff] = useState<DocumentDiff | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCompare = async () => {
    if (!doc1.trim() || !doc2.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter both documents to compare',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/lawfirm/ai/documents/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ document1: doc1, document2: doc2 }),
      });

      if (!response.ok) throw new Error('Failed to compare documents');

      const data = await response.json();
      setDiff(data.diff);
      
      toast({
        title: 'Comparison Complete',
        description: 'Documents have been compared successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to compare documents',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Document Inputs */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="bg-[#0A0820] border-[rgba(167,139,250,0.2)]">
          <CardHeader>
            <CardTitle className="text-[#EDE9FE] flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#EF4444]" />
              Original Document
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Paste the original document..."
              value={doc1}
              onChange={(e) => setDoc1(e.target.value)}
              rows={12}
              className="bg-[rgba(108,63,206,0.07)] border-[rgba(167,139,250,0.2)] text-[#EDE9FE] resize-none font-mono text-sm"
            />
          </CardContent>
        </Card>

        <Card className="bg-[#0A0820] border-[rgba(167,139,250,0.2)]">
          <CardHeader>
            <CardTitle className="text-[#EDE9FE] flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#22C55E]" />
              Revised Document
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Paste the revised document..."
              value={doc2}
              onChange={(e) => setDoc2(e.target.value)}
              rows={12}
              className="bg-[rgba(108,63,206,0.07)] border-[rgba(167,139,250,0.2)] text-[#EDE9FE] resize-none font-mono text-sm"
            />
          </CardContent>
        </Card>
      </div>

      {/* Compare Button */}
      <div className="flex justify-center">
        <Button
          onClick={handleCompare}
          disabled={loading || !doc1.trim() || !doc2.trim()}
          className="bg-gradient-to-r from-[#34D399] to-[#10B981] text-white hover:opacity-90"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Comparing...
            </>
          ) : (
            <>
              <FileDiff className="w-4 h-4 mr-2" />
              Compare Documents
            </>
          )}
        </Button>
      </div>

      {/* Diff Results */}
      {diff && (
        <Card className="bg-[#0A0820] border-[rgba(167,139,250,0.2)]">
          <CardHeader>
            <CardTitle className="text-[#EDE9FE] flex items-center gap-2">
              <FileDiff className="w-5 h-5 text-[#34D399]" />
              Comparison Results
            </CardTitle>
            <div className="flex gap-4 mt-2">
              <Badge variant="outline" className="border-[#22C55E] text-[#22C55E]">
                <Plus className="w-3 h-3 mr-1" />
                {diff.additions.length} Additions
              </Badge>
              <Badge variant="outline" className="border-[#EF4444] text-[#EF4444]">
                <Minus className="w-3 h-3 mr-1" />
                {diff.deletions.length} Deletions
              </Badge>
              <Badge variant="outline" className="border-[#F59E0B] text-[#F59E0B]">
                <RefreshCw className="w-3 h-3 mr-1" />
                {diff.modifications.length} Modifications
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {/* Summary */}
            <div className="p-4 rounded-lg bg-[rgba(108,63,206,0.05)] border border-[rgba(167,139,250,0.1)] mb-4">
              <h4 className="text-sm font-medium text-[#EDE9FE] mb-2">Summary</h4>
              <p className="text-sm text-[#9D7BEA]">{diff.summary}</p>
            </div>

            {/* Changes List */}
            <ScrollArea className="h-[400px]">
              <div className="space-y-2">
                {diff.additions.map((add, i) => (
                  <div
                    key={`add-${i}`}
                    className="p-3 rounded-lg bg-[#22C55E]/10 border border-[#22C55E]/20"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Plus className="w-4 h-4 text-[#22C55E]" />
                      <span className="text-xs text-[#22C55E]">Line {add.line}</span>
                    </div>
                    <p className="text-sm text-[#EDE9FE] font-mono">{add.content}</p>
                  </div>
                ))}

                {diff.deletions.map((del, i) => (
                  <div
                    key={`del-${i}`}
                    className="p-3 rounded-lg bg-[#EF4444]/10 border border-[#EF4444]/20"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Minus className="w-4 h-4 text-[#EF4444]" />
                      <span className="text-xs text-[#EF4444]">Line {del.line}</span>
                    </div>
                    <p className="text-sm text-[#EDE9FE] font-mono line-through opacity-70">{del.content}</p>
                  </div>
                ))}

                {diff.modifications.map((mod, i) => (
                  <div
                    key={`mod-${i}`}
                    className="p-3 rounded-lg bg-[#F59E0B]/10 border border-[#F59E0B]/20"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <RefreshCw className="w-4 h-4 text-[#F59E0B]" />
                      <span className="text-xs text-[#F59E0B]">Line {mod.line}</span>
                    </div>
                    <p className="text-sm text-[#EF4444] font-mono line-through mb-1">{mod.old}</p>
                    <p className="text-sm text-[#22C55E] font-mono">{mod.new}</p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ============== TEMPLATES TAB ==============
function TemplatesTab({ onSelectTemplate }: { onSelectTemplate: (key: TTTemplateKey) => void }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', name: 'All Templates', icon: BookOpen },
    { id: 'wills', name: 'Wills & Probate', icon: FileText },
    { id: 'property', name: 'Property & Conveyancing', icon: Building },
    { id: 'employment', name: 'Employment', icon: Users },
    { id: 'corporate', name: 'Corporate', icon: Building },
    { id: 'family', name: 'Family Law', icon: Users },
  ];

  const filteredTemplates = Object.entries(TT_LEGAL_TEMPLATES).filter(([key, template]) => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (selectedCategory === 'all') return matchesSearch;
    if (selectedCategory === 'wills') return (key.includes('Will') || key.includes('Probate')) && matchesSearch;
    if (selectedCategory === 'property') return (key.includes('Property') || key.includes('Transfer') || key.includes('Tenancy')) && matchesSearch;
    if (selectedCategory === 'employment') return key.includes('Employment') && matchesSearch;
    if (selectedCategory === 'corporate') return (key.includes('Company') || key.includes('Shareholders') || key.includes('Director')) && matchesSearch;
    if (selectedCategory === 'family') return (key.includes('Prenuptial') || key.includes('Matrimonial')) && matchesSearch;
    
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Input
          placeholder="Search templates..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-[rgba(108,63,206,0.07)] border-[rgba(167,139,250,0.2)] text-[#EDE9FE]"
        />
        <div className="flex gap-2 flex-wrap">
          {categories.map((cat) => (
            <Button
              key={cat.id}
              variant={selectedCategory === cat.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(cat.id)}
              className={selectedCategory === cat.id 
                ? 'bg-[#C4A35A] text-white' 
                : 'border-[rgba(167,139,250,0.2)] text-[#9D7BEA]'
              }
            >
              <cat.icon className="w-4 h-4 mr-1" />
              {cat.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTemplates.map(([key, template]) => (
          <Card
            key={key}
            className="bg-[#0A0820] border-[rgba(167,139,250,0.2)] hover:border-[#C4A35A]/50 transition-colors cursor-pointer"
            onClick={() => onSelectTemplate(key as TTTemplateKey)}
          >
            <CardHeader>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#EC4899]/20 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 text-[#EC4899]" />
                </div>
                <div>
                  <CardTitle className="text-[#EDE9FE] text-base">{template.name}</CardTitle>
                  <Badge variant="outline" className="mt-1 border-[#C4A35A]/30 text-[#C4A35A] text-xs">
                    Trinidad & Tobago
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-[#9D7BEA] mb-3">{template.description}</p>
              <div className="flex flex-wrap gap-1">
                {template.variables.slice(0, 4).map((variable, i) => (
                  <Badge
                    key={i}
                    variant="outline"
                    className="border-[rgba(167,139,250,0.2)] text-[#9D7BEA] text-xs"
                  >
                    {variable}
                  </Badge>
                ))}
                {template.variables.length > 4 && (
                  <Badge
                    variant="outline"
                    className="border-[rgba(167,139,250,0.2)] text-[#9D7BEA] text-xs"
                  >
                    +{template.variables.length - 4} more
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="w-12 h-12 text-[#9D7BEA] mx-auto mb-4 opacity-50" />
          <p className="text-[#9D7BEA]">No templates found matching your search</p>
        </div>
      )}
    </div>
  );
}

// ============== CITATIONS TAB ==============
function CitationsTab() {
  const { toast } = useToast();
  const [query, setQuery] = useState('');
  const [citations, setCitations] = useState<CitationReference[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    try {
      const response = await fetch('/api/lawfirm/ai/documents/citations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) throw new Error('Failed to find citations');

      const data = await response.json();
      setCitations(data.citations);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to find citations',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const quickSearches = [
    'Civil Procedure Rules 2016',
    'Companies Act Trinidad',
    'Employment Act termination',
    'Property conveyancing requirements',
    'Matrimonial property division',
  ];

  return (
    <div className="space-y-6">
      {/* Search Input */}
      <Card className="bg-[#0A0820] border-[rgba(167,139,250,0.2)]">
        <CardHeader>
          <CardTitle className="text-[#EDE9FE] flex items-center gap-2">
            <Scale className="w-5 h-5 text-[#6C3FCE]" />
            Legal Citation Finder
          </CardTitle>
          <CardDescription className="text-[#9D7BEA]">
            Find relevant Trinidad & Tobago legal citations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Search for statutes, case law, or legal topics..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="bg-[rgba(108,63,206,0.07)] border-[rgba(167,139,250,0.2)] text-[#EDE9FE]"
            />
            <Button
              onClick={handleSearch}
              disabled={loading || !query.trim()}
              className="bg-gradient-to-r from-[#6C3FCE] to-[#C026D3] text-white hover:opacity-90"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
            </Button>
          </div>

          {/* Quick Searches */}
          <div className="flex flex-wrap gap-2">
            {quickSearches.map((qs, i) => (
              <button
                key={i}
                onClick={() => setQuery(qs)}
                className="px-3 py-1 text-xs rounded-full bg-[rgba(108,63,206,0.05)] border border-[rgba(167,139,250,0.1)] text-[#9D7BEA] hover:border-[#6C3FCE]/30 transition-colors"
              >
                {qs}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {citations.length > 0 && (
        <div className="space-y-3">
          {citations.map((citation) => (
            <Card key={citation.id} className="bg-[#0A0820] border-[rgba(167,139,250,0.2)]">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#6C3FCE]/20 flex items-center justify-center shrink-0">
                    <Scale className="w-5 h-5 text-[#6C3FCE]" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="border-[#6C3FCE] text-[#6C3FCE] capitalize">
                        {citation.type}
                      </Badge>
                      <h4 className="font-medium text-[#EDE9FE]">{citation.name}</h4>
                    </div>
                    <p className="text-sm text-[#9D7BEA] font-mono mb-2">{citation.reference}</p>
                    <p className="text-xs text-[#9D7BEA]">{citation.relevance}</p>
                  </div>
                  {citation.url && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(citation.url, '_blank')}
                      className="border-[rgba(167,139,250,0.2)] text-[#9D7BEA]"
                    >
                      <BookOpen className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {citations.length === 0 && query && !loading && (
        <div className="text-center py-12">
          <Scale className="w-12 h-12 text-[#9D7BEA] mx-auto mb-4 opacity-50" />
          <p className="text-[#9D7BEA]">Search for legal citations</p>
        </div>
      )}
    </div>
  );
}

// ============== CHAT TAB ==============
function ChatTab() {
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [document, setDocument] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/lawfirm/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          document: document || undefined,
          history: messages.map((m) => ({ role: m.role, content: m.content })),
          mode: 'general',
        }),
      });

      if (!response.ok) throw new Error('Failed to get response');

      const data = await response.json();

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to get AI response',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({ title: 'Copied', description: 'Message copied to clipboard' });
  };

  const handleClear = () => {
    setMessages([]);
    setDocument('');
    toast({ title: 'Cleared', description: 'Chat history cleared' });
  };

  const quickPrompts = [
    'Summarize this document',
    'Identify key risks',
    'Suggest improvements',
    'Explain this clause',
    'Check T&T compliance',
    'Draft a response',
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="shrink-0 border-b border-[rgba(167,139,250,0.2)] pb-4 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-[#EDE9FE] flex items-center gap-2">
              <Bot className="w-5 h-5 text-[#C4A35A]" />
              AI Legal Assistant
            </h3>
            <p className="text-sm text-[#9D7BEA]">Chat about legal documents and get instant assistance</p>
          </div>
          {messages.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="text-[#9D7BEA] hover:text-[#EDE9FE]"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Document Context */}
      {document && (
        <div className="shrink-0 mb-4 p-3 rounded-lg bg-[rgba(108,63,206,0.05)] border border-[rgba(167,139,250,0.1)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#C4A35A]" />
              <span className="text-sm text-[#EDE9FE]">Document loaded</span>
              <span className="text-xs text-[rgba(167,139,250,0.5)]">
                ({document.length} characters)
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDocument('')}
              className="text-[#9D7BEA] hover:text-[#EDE9FE] h-6 px-2"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Chat Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-4 mb-4 min-h-0"
        style={{ maxHeight: 'calc(100vh - 400px)' }}
      >
        {messages.length === 0 && (
          <div className="h-full flex items-center justify-center">
            <div className="text-center max-w-md">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#C4A35A] to-[#d4a84a] flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-lg font-medium text-[#EDE9FE] mb-2">
                How can I help you today?
              </h4>
              <p className="text-sm text-[#9D7BEA] mb-4">
                I can help with legal research, document analysis, drafting, and more.
              </p>
              
              <div className="grid grid-cols-2 gap-2">
                {quickPrompts.slice(0, 4).map((qp, i) => (
                  <button
                    key={i}
                    onClick={() => setInput(qp)}
                    className="p-3 text-left text-xs rounded-lg bg-[rgba(108,63,206,0.05)] border border-[rgba(167,139,250,0.1)] hover:border-[#C4A35A]/30 transition-colors"
                  >
                    <span className="text-[#EDE9FE]">{qp}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${
              message.role === 'user' ? 'flex-row-reverse' : ''
            }`}
          >
            <div
              className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                message.role === 'user'
                  ? 'bg-gradient-to-br from-[#6C3FCE] to-[#C026D3]'
                  : 'bg-gradient-to-br from-[#C4A35A] to-[#d4a84a]'
              }`}
            >
              {message.role === 'user' ? (
                <User className="w-4 h-4 text-white" />
              ) : (
                <Bot className="w-4 h-4 text-white" />
              )}
            </div>

            <div className={`flex-1 max-w-[80%] ${message.role === 'user' ? 'text-right' : ''}`}>
              <div
                className={`inline-block p-3 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-gradient-to-r from-[#6C3FCE] to-[#C026D3] text-white'
                    : 'bg-[rgba(108,63,206,0.07)] border border-[rgba(167,139,250,0.2)] text-[#EDE9FE]'
                }`}
              >
                <div className="text-sm whitespace-pre-wrap text-left">
                  {message.content}
                </div>
              </div>
              <div className="mt-1 flex items-center gap-2">
                <span className="text-xs text-[rgba(167,139,250,0.5)]">
                  {message.timestamp.toLocaleTimeString()}
                </span>
                {message.role === 'assistant' && (
                  <button
                    onClick={() => handleCopy(message.content)}
                    className="text-xs text-[#9D7BEA] hover:text-[#EDE9FE]"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-3">
            <div className="shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-[#C4A35A] to-[#d4a84a] flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="p-3 rounded-lg bg-[rgba(108,63,206,0.07)] border border-[rgba(167,139,250,0.2)]">
              <div className="flex items-center gap-2 text-[#9D7BEA]">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Thinking...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="shrink-0 border-t border-[rgba(167,139,250,0.2)] pt-4">
        {!document && (
          <div className="mb-3">
            <Textarea
              placeholder="Paste a document to discuss (optional)..."
              value={document}
              onChange={(e) => setDocument(e.target.value)}
              rows={2}
              className="bg-[rgba(108,63,206,0.07)] border-[rgba(167,139,250,0.2)] text-[#EDE9FE] resize-none text-sm"
            />
          </div>
        )}

        <div className="flex gap-2">
          <Textarea
            placeholder="Ask about legal matters, documents, or get drafting assistance..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={2}
            className="flex-1 bg-[rgba(108,63,206,0.07)] border-[rgba(167,139,250,0.2)] text-[#EDE9FE] resize-none"
            disabled={loading}
          />
          <Button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="self-end bg-gradient-to-r from-[#C4A35A] to-[#d4a84a] text-white hover:opacity-90"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {quickPrompts.slice(4).map((qp, i) => (
            <button
              key={i}
              onClick={() => setInput(qp)}
              className="px-3 py-1 text-xs rounded-full bg-[rgba(108,63,206,0.05)] border border-[rgba(167,139,250,0.1)] text-[#9D7BEA] hover:border-[#C4A35A]/30 transition-colors"
            >
              {qp}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============== OCR TAB ==============
function OCRTab() {
  const { toast } = useToast();
  const [extractedText, setExtractedText] = useState('');
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    setLoading(true);
    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target?.result as string;
        
        const response = await fetch('/api/lawfirm/ai/documents/ocr', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            file: base64,
            fileName: file.name,
            fileType: file.type 
          }),
        });

        if (!response.ok) throw new Error('Failed to process document');

        const data = await response.json();
        setExtractedText(data.text);
        
        toast({
          title: 'OCR Complete',
          description: `Extracted ${data.text.length} characters`,
        });
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to process document',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(extractedText);
    toast({ title: 'Copied', description: 'Text copied to clipboard' });
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Upload Area */}
      <Card className="bg-[#0A0820] border-[rgba(167,139,250,0.2)]">
        <CardHeader>
          <CardTitle className="text-[#EDE9FE] flex items-center gap-2">
            <Eye className="w-5 h-5 text-[#F59E0B]" />
            OCR Document Scanner
          </CardTitle>
          <CardDescription className="text-[#9D7BEA]">
            Extract text from scanned PDFs or images
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragOver
                ? 'border-[#F59E0B] bg-[#F59E0B]/10'
                : 'border-[rgba(167,139,250,0.3)] hover:border-[#F59E0B]/50'
            }`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.png,.jpg,.jpeg,.tiff,.bmp"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
            />
            
            <Upload className="w-12 h-12 text-[#9D7BEA] mx-auto mb-4" />
            <h4 className="text-lg font-medium text-[#EDE9FE] mb-2">
              Drop your document here
            </h4>
            <p className="text-sm text-[#9D7BEA] mb-4">
              or click to browse
            </p>
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              className="border-[#F59E0B]/30 text-[#F59E0B] hover:bg-[#F59E0B]/10"
            >
              <Upload className="w-4 h-4 mr-2" />
              Select File
            </Button>
            <p className="text-xs text-[#9D7BEA] mt-4">
              Supported: PDF, PNG, JPG, TIFF, BMP
            </p>
          </div>

          {loading && (
            <div className="mt-4 p-4 rounded-lg bg-[rgba(108,63,206,0.05)] border border-[rgba(167,139,250,0.1)]">
              <div className="flex items-center gap-3">
                <Loader2 className="w-5 h-5 text-[#F59E0B] animate-spin" />
                <div>
                  <p className="text-sm font-medium text-[#EDE9FE]">Processing document...</p>
                  <p className="text-xs text-[#9D7BEA]">This may take a moment for large documents</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Extracted Text */}
      <Card className="bg-[#0A0820] border-[rgba(167,139,250,0.2)]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-[#EDE9FE] flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#22D3EE]" />
              Extracted Text
            </CardTitle>
            {extractedText && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className="border-[rgba(167,139,250,0.2)] text-[#9D7BEA]"
              >
                <Copy className="w-4 h-4 mr-1" />
                Copy
              </Button>
            )}
          </div>
          {extractedText && (
            <p className="text-xs text-[#9D7BEA]">
              {extractedText.length.toLocaleString()} characters extracted
            </p>
          )}
        </CardHeader>
        <CardContent>
          {extractedText ? (
            <ScrollArea className="h-[400px]">
              <pre className="text-sm text-[#EDE9FE] whitespace-pre-wrap font-mono p-4 rounded-lg bg-[rgba(108,63,206,0.05)] border border-[rgba(167,139,250,0.1)]">
                {extractedText}
              </pre>
            </ScrollArea>
          ) : (
            <div className="text-center py-12">
              <Eye className="w-12 h-12 text-[#9D7BEA] mx-auto mb-4 opacity-50" />
              <p className="text-[#9D7BEA]">
                Upload a document to extract text
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default AIDocumentAssistant;
