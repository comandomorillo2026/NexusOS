'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  Send,
  Loader2,
  Bot,
  User,
  Copy,
  RotateCcw,
  FileText,
  Sparkles,
  Trash2,
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
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AIChatProps {
  initialDocument?: string;
  mode?: 'general' | 'document' | 'research';
}

export function AIChat({ initialDocument = '', mode = 'general' }: AIChatProps) {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [document, setDocument] = useState(initialDocument);
  const [loading, setLoading] = useState(false);
  const [currentMode, setCurrentMode] = useState(mode);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
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
          mode: currentMode,
        }),
      });

      if (!response.ok) throw new Error('Failed to get response');

      const data = await response.json();

      const assistantMessage: Message = {
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
    { label: 'Summarize this document', prompt: 'Please provide a comprehensive summary of this document.' },
    { label: 'Identify key risks', prompt: 'What are the main legal risks in this document?' },
    { label: 'Suggest improvements', prompt: 'How can this document be improved?' },
    { label: 'Explain this clause', prompt: 'Please explain the meaning and implications of the highlighted clause.' },
    { label: 'Check compliance', prompt: 'Does this document comply with Trinidad & Tobago law?' },
    { label: 'Draft a response', prompt: 'Help me draft a professional response to this document.' },
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
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-[#C4A35A] text-[#C4A35A]">
              {currentMode} mode
            </Badge>
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
              Clear
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
              
              {/* Quick Prompts */}
              <div className="grid grid-cols-2 gap-2">
                {quickPrompts.slice(0, 4).map((qp, i) => (
                  <button
                    key={i}
                    onClick={() => setInput(qp.prompt)}
                    className="p-3 text-left text-xs rounded-lg bg-[rgba(108,63,206,0.05)] border border-[rgba(167,139,250,0.1)] hover:border-[#C4A35A]/30 transition-colors"
                  >
                    <span className="text-[#EDE9FE]">{qp.label}</span>
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
            {/* Avatar */}
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

            {/* Message Content */}
            <div
              className={`flex-1 max-w-[80%] ${
                message.role === 'user' ? 'text-right' : ''
              }`}
            >
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
        {/* Document Input (if not provided) */}
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

        {/* Chat Input */}
        <div className="flex gap-2">
          <Textarea
            ref={inputRef}
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

        {/* Quick Actions */}
        <div className="mt-3 flex flex-wrap gap-2">
          {quickPrompts.slice(4).map((qp, i) => (
            <button
              key={i}
              onClick={() => setInput(qp.prompt)}
              className="px-3 py-1 text-xs rounded-full bg-[rgba(108,63,206,0.05)] border border-[rgba(167,139,250,0.1)] text-[#9D7BEA] hover:border-[#C4A35A]/30 transition-colors"
            >
              {qp.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AIChat;
