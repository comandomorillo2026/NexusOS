'use client';

import React, { useState } from 'react';
import {
  FileText,
  Sparkles,
  Copy,
  Download,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Loader2,
  CheckCircle,
  AlertCircle,
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
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { CONTRACT_TEMPLATES, MOTION_TEMPLATES, LETTER_TEMPLATES } from '@/lib/ai/legal-prompts';

interface GeneratedDocument {
  content: string;
  type: string;
  timestamp: string;
}

export function AIDocumentGenerator() {
  const { toast } = useToast();
  const [documentType, setDocumentType] = useState('');
  const [template, setTemplate] = useState('');
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

  const allTemplates = {
    ...CONTRACT_TEMPLATES,
    ...MOTION_TEMPLATES,
    ...LETTER_TEMPLATES,
  };

  const templateCategories = {
    contracts: Object.keys(CONTRACT_TEMPLATES),
    motions: Object.keys(MOTION_TEMPLATES),
    letters: Object.keys(LETTER_TEMPLATES),
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
      const response = await fetch('/api/lawfirm/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentType,
          template,
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
              <Label className="text-[#9D7BEA]">Or Select Template</Label>
              <Select value={template} onValueChange={(v) => {
                setTemplate(v);
                setDocumentType('');
              }}>
                <SelectTrigger className="bg-[rgba(108,63,206,0.07)] border-[rgba(167,139,250,0.2)] text-[#EDE9FE]">
                  <SelectValue placeholder="Choose a template..." />
                </SelectTrigger>
                <SelectContent className="bg-[#0A0820] border-[rgba(167,139,250,0.2)]">
                  <div className="px-2 py-1 text-xs text-[#9D7BEA] uppercase">Contracts</div>
                  {templateCategories.contracts.map((key) => (
                    <SelectItem key={key} value={key} className="text-[#EDE9FE] focus:bg-[rgba(108,63,206,0.2)]">
                      {allTemplates[key as keyof typeof allTemplates]?.name || key}
                    </SelectItem>
                  ))}
                  <div className="px-2 py-1 text-xs text-[#9D7BEA] uppercase mt-2">Court Documents</div>
                  {templateCategories.motions.map((key) => (
                    <SelectItem key={key} value={key} className="text-[#EDE9FE] focus:bg-[rgba(108,63,206,0.2)]">
                      {allTemplates[key as keyof typeof allTemplates]?.name || key}
                    </SelectItem>
                  ))}
                  <div className="px-2 py-1 text-xs text-[#9D7BEA] uppercase mt-2">Letters</div>
                  {templateCategories.letters.map((key) => (
                    <SelectItem key={key} value={key} className="text-[#EDE9FE] focus:bg-[rgba(108,63,206,0.2)]">
                      {allTemplates[key as keyof typeof allTemplates]?.name || key}
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

export default AIDocumentGenerator;
