'use client';

import React, { useState } from 'react';
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
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AIDocumentGenerator } from './AIDocumentGenerator';
import { AIDocumentSummarizer } from './AIDocumentSummarizer';
import { AIClauseExtractor } from './AIClauseExtractor';
import { AITranslator } from './AITranslator';
import { AIChat } from './AIChat';

const AI_FEATURES = [
  {
    id: 'generate',
    name: 'Document Generator',
    description: 'Create legal documents from templates and prompts',
    icon: FileText,
    color: '#C4A35A',
    capabilities: ['Contracts', 'Court Motions', 'Legal Letters', 'Custom Documents'],
  },
  {
    id: 'summarize',
    name: 'Document Summarizer',
    description: 'Get instant summaries of legal documents',
    icon: FileSearch,
    color: '#22D3EE',
    capabilities: ['Key Points', 'Parties', 'Obligations', 'Risks'],
  },
  {
    id: 'extract',
    name: 'Clause Extractor',
    description: 'Identify and analyze key clauses',
    icon: Search,
    color: '#34D399',
    capabilities: ['Termination', 'Indemnity', 'Liability', 'Dispute Resolution'],
  },
  {
    id: 'translate',
    name: 'Legal Translator',
    description: 'Translate documents between English and Spanish',
    icon: Languages,
    color: '#EC4899',
    capabilities: ['Legal Terminology', 'Formatting', 'Caribbean Context'],
  },
  {
    id: 'chat',
    name: 'AI Assistant',
    description: 'Chat with AI about legal matters',
    icon: MessageSquare,
    color: '#6C3FCE',
    capabilities: ['Research', 'Drafting', 'Analysis', 'Q&A'],
  },
];

export function AIAssistantHub() {
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
        <TabsList className="grid grid-cols-5 lg:grid-cols-6 gap-2 bg-transparent h-auto p-0">
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
            value="summarize"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#22D3EE] data-[state=active]:to-[#06B6D4] data-[state=active]:text-white bg-[rgba(108,63,206,0.07)] text-[#9D7BEA] border border-[rgba(167,139,250,0.2)]"
          >
            <FileSearch className="w-4 h-4 mr-1" />
            Summarize
          </TabsTrigger>
          <TabsTrigger
            value="extract"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#34D399] data-[state=active]:to-[#10B981] data-[state=active]:text-white bg-[rgba(108,63,206,0.07)] text-[#9D7BEA] border border-[rgba(167,139,250,0.2)]"
          >
            <Search className="w-4 h-4 mr-1" />
            Extract
          </TabsTrigger>
          <TabsTrigger
            value="translate"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#EC4899] data-[state=active]:to-[#DB2777] data-[state=active]:text-white bg-[rgba(108,63,206,0.07)] text-[#9D7BEA] border border-[rgba(167,139,250,0.2)]"
          >
            <Languages className="w-4 h-4 mr-1" />
            Translate
          </TabsTrigger>
          <TabsTrigger
            value="chat"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#6C3FCE] data-[state=active]:to-[#C026D3] data-[state=active]:text-white bg-[rgba(108,63,206,0.07)] text-[#9D7BEA] border border-[rgba(167,139,250,0.2)] col-span-5 lg:col-span-1"
          >
            <MessageSquare className="w-4 h-4 mr-1" />
            Chat
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-6">
          {/* Feature Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {AI_FEATURES.map((feature) => (
              <Card
                key={feature.id}
                className="bg-[#0A0820] border-[rgba(167,139,250,0.2)] hover:border-[rgba(167,139,250,0.4)] transition-colors cursor-pointer"
                onClick={() => setActiveTab(feature.id)}
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

          {/* Quick Start */}
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
                        Create contracts, motions, and letters from templates with AI assistance.
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
                        Upload or paste documents to get summaries, extract clauses, and identify risks.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#EC4899]/20 flex items-center justify-center shrink-0">
                      <span className="text-[#EC4899] font-semibold">3</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-[#EDE9FE]">Translate</h4>
                      <p className="text-sm text-[#9D7BEA]">
                        Convert documents between English and Spanish with legal terminology accuracy.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#34D399]/20 flex items-center justify-center shrink-0">
                      <span className="text-[#34D399] font-semibold">4</span>
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
          <div className="mt-6 p-4 rounded-lg bg-[#F59E0B]/10 border border-[#F59E0B]/20">
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
        </TabsContent>

        {/* Document Generator Tab */}
        <TabsContent value="generate" className="mt-6">
          <AIDocumentGenerator />
        </TabsContent>

        {/* Document Summarizer Tab */}
        <TabsContent value="summarize" className="mt-6">
          <AIDocumentSummarizer />
        </TabsContent>

        {/* Clause Extractor Tab */}
        <TabsContent value="extract" className="mt-6">
          <AIClauseExtractor />
        </TabsContent>

        {/* Translator Tab */}
        <TabsContent value="translate" className="mt-6">
          <AITranslator />
        </TabsContent>

        {/* Chat Tab */}
        <TabsContent value="chat" className="mt-6">
          <Card className="bg-[#0A0820] border-[rgba(167,139,250,0.2)]">
            <CardContent className="p-6">
              <AIChat />
            </CardContent>
          </Card>
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

export default AIAssistantHub;
