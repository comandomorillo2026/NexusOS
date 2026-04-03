'use client';

import React, { useState } from 'react';
import {
  Languages,
  ArrowRightLeft,
  Loader2,
  Copy,
  Download,
  Upload,
  CheckCircle,
  AlertCircle,
  FileText,
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
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface TranslationResult {
  translation: string;
  sourceLanguage: string;
  targetLanguage: string;
}

const LANGUAGES = [
  { code: 'english', name: 'English', flag: '🇬🇧' },
  { code: 'spanish', name: 'Spanish', flag: '🇪🇸' },
];

export function AITranslator() {
  const { toast } = useToast();
  const [document, setDocument] = useState('');
  const [sourceLanguage, setSourceLanguage] = useState('auto');
  const [targetLanguage, setTargetLanguage] = useState('spanish');
  const [preserveFormatting, setPreserveFormatting] = useState(true);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TranslationResult | null>(null);
  const [copied, setCopied] = useState(false);

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

  const handleTranslate = async () => {
    if (!document.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter or upload a document to translate',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/lawfirm/ai/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          document,
          sourceLanguage,
          targetLanguage,
          preserveFormatting,
        }),
      });

      if (!response.ok) throw new Error('Failed to translate');

      const data = await response.json();
      setResult(data);

      toast({ title: 'Success', description: 'Document translated successfully' });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to translate document',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSwapLanguages = () => {
    if (sourceLanguage === 'auto') {
      // If auto-detect, swap with the detected language
      if (result?.sourceLanguage) {
        const detected = result.sourceLanguage.toLowerCase();
        setSourceLanguage(targetLanguage);
        setTargetLanguage(detected === 'english' ? 'english' : 'spanish');
      }
    } else {
      const temp = sourceLanguage;
      setSourceLanguage(targetLanguage);
      setTargetLanguage(temp);
    }
    setResult(null);
  };

  const handleCopy = () => {
    if (result?.translation) {
      navigator.clipboard.writeText(result.translation);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({ title: 'Copied', description: 'Translation copied to clipboard' });
    }
  };

  const handleDownload = () => {
    if (result?.translation) {
      const blob = new Blob([result.translation], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `translated_document_${result.targetLanguage}_${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const getLanguageFlag = (code: string) => {
    const lang = LANGUAGES.find((l) => l.code === code);
    return lang?.flag || '🌐';
  };

  const getLanguageName = (code: string) => {
    if (code === 'auto') return 'Auto-detect';
    const lang = LANGUAGES.find((l) => l.code === code);
    return lang?.name || code;
  };

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <Card className="bg-[#0A0820] border-[rgba(167,139,250,0.2)]">
        <CardHeader>
          <CardTitle className="text-[#EDE9FE] flex items-center gap-2">
            <Languages className="w-5 h-5 text-[#C4A35A]" />
            AI Legal Translator
          </CardTitle>
          <CardDescription className="text-[#9D7BEA]">
            Translate legal documents between English and Spanish with legal terminology accuracy
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

          {/* Language Selection */}
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Label className="text-[#9D7BEA] text-sm mb-2 block">From</Label>
              <Select value={sourceLanguage} onValueChange={setSourceLanguage}>
                <SelectTrigger className="bg-[rgba(108,63,206,0.07)] border-[rgba(167,139,250,0.2)] text-[#EDE9FE]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#0A0820] border-[rgba(167,139,250,0.2)]">
                  <SelectItem value="auto" className="text-[#EDE9FE]">
                    🌐 Auto-detect
                  </SelectItem>
                  {LANGUAGES.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code} className="text-[#EDE9FE]">
                      {lang.flag} {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleSwapLanguages}
              className="mt-6 text-[#C4A35A] hover:text-[#EDE9FE] hover:bg-[rgba(108,63,206,0.1)]"
            >
              <ArrowRightLeft className="w-5 h-5" />
            </Button>

            <div className="flex-1">
              <Label className="text-[#9D7BEA] text-sm mb-2 block">To</Label>
              <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                <SelectTrigger className="bg-[rgba(108,63,206,0.07)] border-[rgba(167,139,250,0.2)] text-[#EDE9FE]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#0A0820] border-[rgba(167,139,250,0.2)]">
                  {LANGUAGES.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code} className="text-[#EDE9FE]">
                      {lang.flag} {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Document Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-[#9D7BEA]">Document Text</Label>
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

          {/* Options */}
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <Switch
                checked={preserveFormatting}
                onCheckedChange={setPreserveFormatting}
              />
              <span className="text-sm text-[#9D7BEA]">Preserve formatting</span>
            </label>
          </div>

          {/* Translate Button */}
          <Button
            onClick={handleTranslate}
            disabled={loading || !document.trim()}
            className="w-full bg-gradient-to-r from-[#C4A35A] to-[#d4a84a] text-white hover:opacity-90"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Translating...
              </>
            ) : (
              <>
                <Languages className="w-4 h-4 mr-2" />
                Translate Document
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Translation Result */}
      {result && (
        <Card className="bg-[#0A0820] border-[rgba(167,139,250,0.2)]">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-[#EDE9FE] flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#22D3EE]" />
                  Translation Result
                </CardTitle>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline" className="border-[#C4A35A] text-[#C4A35A]">
                    {getLanguageFlag(result.sourceLanguage.toLowerCase())} {result.sourceLanguage}
                  </Badge>
                  <ArrowRightLeft className="w-4 h-4 text-[#9D7BEA]" />
                  <Badge variant="outline" className="border-[#34D399] text-[#34D399]">
                    {getLanguageFlag(result.targetLanguage.toLowerCase())} {result.targetLanguage}
                  </Badge>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  className="border-[rgba(167,139,250,0.2)] text-[#9D7BEA]"
                >
                  {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
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
            <div className="p-4 rounded-lg bg-[rgba(108,63,206,0.05)] border border-[rgba(167,139,250,0.1)] max-h-[400px] overflow-y-auto">
              <pre className="text-sm text-[#EDE9FE] whitespace-pre-wrap font-mono">
                {result.translation}
              </pre>
            </div>

            {/* Notice */}
            <div className="mt-4 p-3 rounded-lg bg-[#22D3EE]/10 border border-[#22D3EE]/20">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-[#22D3EE] shrink-0 mt-0.5" />
                <div className="text-sm text-[#22D3EE]">
                  <strong>Legal Translation:</strong> This translation preserves legal terminology and formatting. 
                  Always have translations reviewed by a qualified legal translator for official use.
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Legal Terminology Reference */}
      <Card className="bg-[#0A0820] border-[rgba(167,139,250,0.2)]">
        <CardHeader>
          <CardTitle className="text-[#EDE9FE] text-sm">Legal Terminology Reference</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="text-[#C4A35A] font-medium mb-2">English → Spanish</h4>
              <ul className="space-y-1 text-[#9D7BEA]">
                <li>• High Court → Tribunal Superior</li>
                <li>• Magistrates' Court → Tribunal de Magistrados</li>
                <li>• Attorney-at-Law → Abogado</li>
                <li>• Affidavit → Declaración Jurada</li>
                <li>• Deed → Escritura</li>
                <li>• Plaintiff → Demandante</li>
                <li>• Defendant → Demandado</li>
              </ul>
            </div>
            <div>
              <h4 className="text-[#C4A35A] font-medium mb-2">Spanish → English</h4>
              <ul className="space-y-1 text-[#9D7BEA]">
                <li>• Juzgado → Court</li>
                <li>• Notario → Notary Public</li>
                <li>• Contrato → Contract</li>
                <li>• Demanda → Lawsuit/Claim</li>
                <li>• Sentencia → Judgment</li>
                <li>• Apelación → Appeal</li>
                <li>• Testimonio → Testimony</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default AITranslator;
