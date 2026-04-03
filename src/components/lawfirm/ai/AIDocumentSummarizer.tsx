'use client';

import React, { useState } from 'react';
import {
  FileSearch,
  Upload,
  Loader2,
  Copy,
  Download,
  FileText,
  AlertCircle,
  List,
  CheckCircle2,
  Clock,
  DollarSign,
  Users,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
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
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface SummaryResult {
  documentType: string;
  keyParties: string[];
  mainObligations: string[];
  importantDates: string[];
  financialTerms: string[];
  keyRisks: string[];
  notableClauses: string[];
  overallAssessment: string;
}

export function AIDocumentSummarizer() {
  const { toast } = useToast();
  const [document, setDocument] = useState('');
  const [detailLevel, setDetailLevel] = useState<'brief' | 'standard' | 'detailed'>('standard');
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [structuredSummary, setStructuredSummary] = useState<SummaryResult | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setDocument(event.target?.result as string);
        toast({ title: 'File Uploaded', description: `${file.name} loaded successfully` });
      };
      reader.readAsText(file);
    }
  };

  const handleSummarize = async () => {
    if (!document.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter or upload a document to summarize',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/lawfirm/ai/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ document, detailLevel }),
      });

      if (!response.ok) throw new Error('Failed to summarize');

      const data = await response.json();
      setSummary(data.summary);

      // Try to parse structured data from summary
      try {
        const parsed = parseSummaryToStructured(data.summary);
        setStructuredSummary(parsed);
      } catch {
        setStructuredSummary(null);
      }

      toast({ title: 'Success', description: 'Document summarized successfully' });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to summarize document',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const parseSummaryToStructured = (text: string): SummaryResult | null => {
    // Simple parsing - in production this would be more sophisticated
    const lines = text.split('\n');
    const result: SummaryResult = {
      documentType: '',
      keyParties: [],
      mainObligations: [],
      importantDates: [],
      financialTerms: [],
      keyRisks: [],
      notableClauses: [],
      overallAssessment: '',
    };

    let currentSection = '';
    for (const line of lines) {
      const lowerLine = line.toLowerCase();
      if (lowerLine.includes('document type') || lowerLine.includes('type:')) {
        currentSection = 'documentType';
        result.documentType = line.replace(/^[*:]*\s*/, '').trim();
      } else if (lowerLine.includes('parties') || lowerLine.includes('party')) {
        currentSection = 'keyParties';
      } else if (lowerLine.includes('obligation')) {
        currentSection = 'mainObligations';
      } else if (lowerLine.includes('date') || lowerLine.includes('deadline')) {
        currentSection = 'importantDates';
      } else if (lowerLine.includes('financial') || lowerLine.includes('payment')) {
        currentSection = 'financialTerms';
      } else if (lowerLine.includes('risk')) {
        currentSection = 'keyRisks';
      } else if (lowerLine.includes('clause')) {
        currentSection = 'notableClauses';
      } else if (lowerLine.includes('overall') || lowerLine.includes('assessment')) {
        currentSection = 'overallAssessment';
      } else if (line.trim().startsWith('-') || line.trim().startsWith('•') || line.trim().match(/^\d\./)) {
        const content = line.replace(/^[-•\d.]\s*/, '').trim();
        if (content && currentSection && Array.isArray((result as Record<string, unknown>)[currentSection])) {
          ((result as Record<string, unknown>)[currentSection] as string[]).push(content);
        }
      } else if (currentSection === 'overallAssessment' && line.trim()) {
        result.overallAssessment += line.trim() + ' ';
      }
    }

    return result;
  };

  const handleCopy = () => {
    if (summary) {
      navigator.clipboard.writeText(summary);
      toast({ title: 'Copied', description: 'Summary copied to clipboard' });
    }
  };

  const handleDownload = () => {
    if (summary) {
      const blob = new Blob([summary], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `document_summary_${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <Card className="bg-[#0A0820] border-[rgba(167,139,250,0.2)]">
        <CardHeader>
          <CardTitle className="text-[#EDE9FE] flex items-center gap-2">
            <FileSearch className="w-5 h-5 text-[#C4A35A]" />
            AI Document Summarizer
          </CardTitle>
          <CardDescription className="text-[#9D7BEA]">
            Get instant summaries of legal documents with key points highlighted
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* File Upload */}
          <div className="flex items-center gap-4">
            <label className="flex-1">
              <div className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-[rgba(167,139,250,0.3)] rounded-lg cursor-pointer hover:border-[#C4A35A] transition-colors">
                <Upload className="w-5 h-5 text-[#9D7BEA]" />
                <span className="text-[#9D7BEA]">Upload Document (.txt, .doc)</span>
                <input
                  type="file"
                  accept=".txt,.doc,.docx"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            </label>
          </div>

          {/* Document Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#9D7BEA]">Or paste document text:</span>
              <span className="text-xs text-[rgba(167,139,250,0.5)]">
                {document.length} characters
              </span>
            </div>
            <Textarea
              placeholder="Paste your legal document here..."
              value={document}
              onChange={(e) => setDocument(e.target.value)}
              rows={10}
              className="bg-[rgba(108,63,206,0.07)] border-[rgba(167,139,250,0.2)] text-[#EDE9FE] resize-none"
            />
          </div>

          {/* Detail Level */}
          <div className="flex items-center gap-4">
            <span className="text-sm text-[#9D7BEA]">Detail Level:</span>
            <Select value={detailLevel} onValueChange={(v) => setDetailLevel(v as typeof detailLevel)}>
              <SelectTrigger className="w-40 bg-[rgba(108,63,206,0.07)] border-[rgba(167,139,250,0.2)] text-[#EDE9FE]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#0A0820] border-[rgba(167,139,250,0.2)]">
                <SelectItem value="brief" className="text-[#EDE9FE]">Brief (3-5 points)</SelectItem>
                <SelectItem value="standard" className="text-[#EDE9FE]">Standard</SelectItem>
                <SelectItem value="detailed" className="text-[#EDE9FE]">Detailed Analysis</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Summarize Button */}
          <Button
            onClick={handleSummarize}
            disabled={loading || !document.trim()}
            className="w-full bg-gradient-to-r from-[#C4A35A] to-[#d4a84a] text-white hover:opacity-90"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing Document...
              </>
            ) : (
              <>
                <FileSearch className="w-4 h-4 mr-2" />
                Summarize Document
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Structured Summary */}
      {structuredSummary && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Document Type */}
          {structuredSummary.documentType && (
            <Card className="bg-[#0A0820] border-[rgba(167,139,250,0.2)]">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-[#9D7BEA] flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Document Type
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[#EDE9FE] font-medium">{structuredSummary.documentType}</p>
              </CardContent>
            </Card>
          )}

          {/* Key Parties */}
          {structuredSummary.keyParties.length > 0 && (
            <Card className="bg-[#0A0820] border-[rgba(167,139,250,0.2)]">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-[#9D7BEA] flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Key Parties
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1">
                  {structuredSummary.keyParties.slice(0, 5).map((party, i) => (
                    <li key={i} className="text-[#EDE9FE] text-sm flex items-center gap-2">
                      <CheckCircle2 className="w-3 h-3 text-[#22D3EE]" />
                      {party}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Important Dates */}
          {structuredSummary.importantDates.length > 0 && (
            <Card className="bg-[#0A0820] border-[rgba(167,139,250,0.2)]">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-[#9D7BEA] flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Important Dates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1">
                  {structuredSummary.importantDates.slice(0, 5).map((date, i) => (
                    <li key={i} className="text-[#EDE9FE] text-sm">{date}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Financial Terms */}
          {structuredSummary.financialTerms.length > 0 && (
            <Card className="bg-[#0A0820] border-[rgba(167,139,250,0.2)]">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-[#9D7BEA] flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Financial Terms
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1">
                  {structuredSummary.financialTerms.slice(0, 5).map((term, i) => (
                    <li key={i} className="text-[#EDE9FE] text-sm">{term}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Key Risks */}
          {structuredSummary.keyRisks.length > 0 && (
            <Card className="bg-[#0A0820] border-[rgba(167,139,250,0.2)]">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-[#9D7BEA] flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-[#F59E0B]" />
                  Key Risks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1">
                  {structuredSummary.keyRisks.slice(0, 5).map((risk, i) => (
                    <li key={i} className="text-[#EDE9FE] text-sm">{risk}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Main Obligations */}
          {structuredSummary.mainObligations.length > 0 && (
            <Card className="bg-[#0A0820] border-[rgba(167,139,250,0.2)] md:col-span-2 lg:col-span-3">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-[#9D7BEA] flex items-center gap-2">
                  <List className="w-4 h-4" />
                  Main Obligations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="grid md:grid-cols-2 gap-2">
                  {structuredSummary.mainObligations.map((obligation, i) => (
                    <li key={i} className="text-[#EDE9FE] text-sm flex items-start gap-2">
                      <CheckCircle2 className="w-3 h-3 text-[#34D399] mt-1 shrink-0" />
                      {obligation}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Full Summary Text */}
      {summary && (
        <Card className="bg-[#0A0820] border-[rgba(167,139,250,0.2)]">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-[#EDE9FE]">Full Summary</CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  className="border-[rgba(167,139,250,0.2)] text-[#9D7BEA]"
                >
                  <Copy className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownload}
                  className="border-[rgba(167,139,250,0.2)] text-[#9D7BEA]"
                >
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="p-4 rounded-lg bg-[rgba(108,63,206,0.05)] border border-[rgba(167,139,250,0.1)]">
              <div className="text-sm text-[#EDE9FE] whitespace-pre-wrap">
                {summary}
              </div>
            </div>

            {/* Disclaimer */}
            <div className="mt-4 p-3 rounded-lg bg-[#F59E0B]/10 border border-[#F59E0B]/20">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-[#F59E0B] shrink-0 mt-0.5" />
                <div className="text-sm text-[#F59E0B]">
                  <strong>AI Summary:</strong> This is an AI-generated summary. Always review the original document for complete understanding.
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default AIDocumentSummarizer;
