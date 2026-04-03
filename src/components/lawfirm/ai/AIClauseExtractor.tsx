'use client';

import React, { useState } from 'react';
import {
  Search,
  Upload,
  Loader2,
  Copy,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  FileSearch,
  ChevronRight,
  ChevronDown,
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
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { CLAUSE_TYPES } from '@/lib/ai/legal-prompts';

interface ExtractedClause {
  type: string;
  found: boolean;
  text: string;
  location: string;
  analysis: string;
  risk: 'low' | 'medium' | 'high';
  recommendation: string;
}

interface ExtractionResult {
  clauses: ExtractedClause[];
  missingClauses: string[];
  overallAssessment: string;
}

export function AIClauseExtractor() {
  const { toast } = useToast();
  const [document, setDocument] = useState('');
  const [selectedClauses, setSelectedClauses] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ExtractionResult | null>(null);
  const [expandedClause, setExpandedClause] = useState<string | null>(null);

  const allClauseTypes = Object.entries(CLAUSE_TYPES).map(([key, value]) => ({
    id: key,
    ...value,
  }));

  const handleSelectAll = () => {
    if (selectedClauses.length === allClauseTypes.length) {
      setSelectedClauses([]);
    } else {
      setSelectedClauses(allClauseTypes.map((c) => c.id));
    }
  };

  const handleClauseToggle = (clauseId: string) => {
    setSelectedClauses((prev) =>
      prev.includes(clauseId)
        ? prev.filter((c) => c !== clauseId)
        : [...prev, clauseId]
    );
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setDocument(event.target?.result as string);
        toast({ title: 'File Uploaded', description: `${file.name} loaded` });
      };
      reader.readAsText(file);
    }
  };

  const handleExtract = async () => {
    if (!document.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter or upload a document',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/lawfirm/ai/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          document,
          clauseTypes: selectedClauses.length > 0 ? selectedClauses : undefined,
          includeAnalysis: true,
        }),
      });

      if (!response.ok) throw new Error('Failed to extract');

      const data = await response.json();
      setResult(data.extraction);

      toast({ title: 'Success', description: 'Clauses extracted successfully' });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to extract clauses',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high':
        return 'bg-[#EF4444]/20 text-[#EF4444] border-[#EF4444]/30';
      case 'medium':
        return 'bg-[#F59E0B]/20 text-[#F59E0B] border-[#F59E0B]/30';
      case 'low':
        return 'bg-[#22C55E]/20 text-[#22C55E] border-[#22C55E]/30';
      default:
        return 'bg-[#9D7BEA]/20 text-[#9D7BEA] border-[#9D7BEA]/30';
    }
  };

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case 'high':
        return <XCircle className="w-4 h-4" />;
      case 'medium':
        return <AlertTriangle className="w-4 h-4" />;
      case 'low':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Info className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <Card className="bg-[#0A0820] border-[rgba(167,139,250,0.2)]">
        <CardHeader>
          <CardTitle className="text-[#EDE9FE] flex items-center gap-2">
            <FileSearch className="w-5 h-5 text-[#C4A35A]" />
            AI Clause Extractor
          </CardTitle>
          <CardDescription className="text-[#9D7BEA]">
            Extract and analyze key clauses from legal documents
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* File Upload */}
          <label className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-[rgba(167,139,250,0.3)] rounded-lg cursor-pointer hover:border-[#C4A35A] transition-colors">
            <Upload className="w-5 h-5 text-[#9D7BEA]" />
            <span className="text-[#9D7BEA]">Upload Document</span>
            <input
              type="file"
              accept=".txt,.doc,.docx"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          {/* Document Input */}
          <Textarea
            placeholder="Or paste document text here..."
            value={document}
            onChange={(e) => setDocument(e.target.value)}
            rows={8}
            className="bg-[rgba(108,63,206,0.07)] border-[rgba(167,139,250,0.2)] text-[#EDE9FE] resize-none"
          />

          {/* Clause Type Selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#9D7BEA]">Select clauses to extract:</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSelectAll}
                className="text-[#C4A35A] hover:text-[#EDE9FE]"
              >
                {selectedClauses.length === allClauseTypes.length ? 'Deselect All' : 'Select All'}
              </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {allClauseTypes.map((clause) => (
                <label
                  key={clause.id}
                  className="flex items-center gap-2 p-2 rounded-lg bg-[rgba(108,63,206,0.05)] border border-[rgba(167,139,250,0.1)] cursor-pointer hover:border-[#C4A35A]/50 transition-colors"
                >
                  <Checkbox
                    checked={selectedClauses.includes(clause.id)}
                    onCheckedChange={() => handleClauseToggle(clause.id)}
                  />
                  <span className="text-sm text-[#EDE9FE]">{clause.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Extract Button */}
          <Button
            onClick={handleExtract}
            disabled={loading || !document.trim()}
            className="w-full bg-gradient-to-r from-[#C4A35A] to-[#d4a84a] text-white hover:opacity-90"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Extracting Clauses...
              </>
            ) : (
              <>
                <Search className="w-4 h-4 mr-2" />
                Extract Clauses
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <div className="space-y-4">
          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-4">
            <Card className="bg-[#0A0820] border-[rgba(167,139,250,0.2)]">
              <CardContent className="pt-4">
                <div className="text-2xl font-bold text-[#22C55E]">
                  {result.clauses?.filter((c) => c.found).length || 0}
                </div>
                <div className="text-sm text-[#9D7BEA]">Clauses Found</div>
              </CardContent>
            </Card>
            <Card className="bg-[#0A0820] border-[rgba(167,139,250,0.2)]">
              <CardContent className="pt-4">
                <div className="text-2xl font-bold text-[#F59E0B]">
                  {result.clauses?.filter((c) => c.risk === 'medium' || c.risk === 'high').length || 0}
                </div>
                <div className="text-sm text-[#9D7BEA]">Need Review</div>
              </CardContent>
            </Card>
            <Card className="bg-[#0A0820] border-[rgba(167,139,250,0.2)]">
              <CardContent className="pt-4">
                <div className="text-2xl font-bold text-[#EF4444]">
                  {result.missingClauses?.length || 0}
                </div>
                <div className="text-sm text-[#9D7BEA]">Missing Clauses</div>
              </CardContent>
            </Card>
          </div>

          {/* Extracted Clauses */}
          {result.clauses && result.clauses.length > 0 && (
            <Card className="bg-[#0A0820] border-[rgba(167,139,250,0.2)]">
              <CardHeader>
                <CardTitle className="text-[#EDE9FE]">Extracted Clauses</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="max-h-[500px]">
                  <div className="space-y-3">
                    {result.clauses.map((clause, index) => (
                      <div
                        key={index}
                        className="rounded-lg bg-[rgba(108,63,206,0.05)] border border-[rgba(167,139,250,0.1)] overflow-hidden"
                      >
                        <button
                          onClick={() => setExpandedClause(expandedClause === `${index}` ? null : `${index}`)}
                          className="w-full p-4 flex items-center justify-between hover:bg-[rgba(108,63,206,0.1)] transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            {clause.found ? (
                              <CheckCircle className="w-5 h-5 text-[#22C55E]" />
                            ) : (
                              <XCircle className="w-5 h-5 text-[#EF4444]" />
                            )}
                            <span className="font-medium text-[#EDE9FE]">
                              {clause.type}
                            </span>
                            <Badge className={getRiskColor(clause.risk)}>
                              {getRiskIcon(clause.risk)}
                              <span className="ml-1 capitalize">{clause.risk} Risk</span>
                            </Badge>
                          </div>
                          {expandedClause === `${index}` ? (
                            <ChevronDown className="w-5 h-5 text-[#9D7BEA]" />
                          ) : (
                            <ChevronRight className="w-5 h-5 text-[#9D7BEA]" />
                          )}
                        </button>
                        
                        {expandedClause === `${index}` && (
                          <div className="px-4 pb-4 space-y-3 border-t border-[rgba(167,139,250,0.1)] pt-3">
                            {clause.text && (
                              <div>
                                <span className="text-xs text-[#9D7BEA] uppercase">Clause Text:</span>
                                <div className="mt-1 p-3 rounded bg-[rgba(108,63,206,0.1)] text-sm text-[#EDE9FE] italic">
                                  "{clause.text}"
                                </div>
                              </div>
                            )}
                            {clause.location && (
                              <div>
                                <span className="text-xs text-[#9D7BEA] uppercase">Location:</span>
                                <p className="text-sm text-[#EDE9FE]">{clause.location}</p>
                              </div>
                            )}
                            {clause.analysis && (
                              <div>
                                <span className="text-xs text-[#9D7BEA] uppercase">Analysis:</span>
                                <p className="text-sm text-[#EDE9FE]">{clause.analysis}</p>
                              </div>
                            )}
                            {clause.recommendation && (
                              <div>
                                <span className="text-xs text-[#9D7BEA] uppercase">Recommendation:</span>
                                <p className="text-sm text-[#34D399]">{clause.recommendation}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}

          {/* Missing Clauses */}
          {result.missingClauses && result.missingClauses.length > 0 && (
            <Card className="bg-[#0A0820] border-[#EF4444]/30">
              <CardHeader>
                <CardTitle className="text-[#EF4444] flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Missing Clauses
                </CardTitle>
                <CardDescription className="text-[#9D7BEA]">
                  These clauses are typically expected but were not found in the document
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {result.missingClauses.map((clause, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="border-[#EF4444]/30 text-[#EF4444]"
                    >
                      {clause}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Overall Assessment */}
          {result.overallAssessment && (
            <Card className="bg-[#0A0820] border-[rgba(167,139,250,0.2)]">
              <CardHeader>
                <CardTitle className="text-[#EDE9FE]">Overall Assessment</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[#EDE9FE]">{result.overallAssessment}</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

export default AIClauseExtractor;
