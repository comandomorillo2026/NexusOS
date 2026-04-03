'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Send,
  Paperclip,
  User,
  Scale,
  Check,
  CheckCheck,
  Clock,
  File,
  X,
} from 'lucide-react';

interface Message {
  id: string;
  senderType: 'client' | 'attorney';
  senderName: string;
  subject?: string;
  message: string;
  attachments?: Array<{
    name: string;
    url: string;
    size: number;
  }>;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
}

interface ClientMessagingProps {
  messages: Message[];
  attorneyName: string;
  onSendMessage: (message: string, attachments?: File[]) => Promise<void>;
  language?: 'en' | 'es';
}

const translations = {
  en: {
    title: 'Secure Messages',
    placeholder: 'Type your message to your attorney...',
    send: 'Send',
    sending: 'Sending...',
    attach: 'Attach File',
    noMessages: 'No messages yet. Start a conversation with your attorney.',
    today: 'Today',
    yesterday: 'Yesterday',
    you: 'You',
    attorney: 'Attorney',
    secureNote: 'Messages are encrypted and only visible to you and your attorney.',
  },
  es: {
    title: 'Mensajes Seguros',
    placeholder: 'Escriba su mensaje a su abogado...',
    send: 'Enviar',
    sending: 'Enviando...',
    attach: 'Adjuntar Archivo',
    noMessages: 'Sin mensajes aún. Inicie una conversación con su abogado.',
    today: 'Hoy',
    yesterday: 'Ayer',
    you: 'Usted',
    attorney: 'Abogado',
    secureNote: 'Los mensajes están encriptados y solo visibles para usted y su abogado.',
  },
};

const formatMessageDate = (dateStr: string, t: typeof translations.en) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return t.today;
  if (diffDays === 1) return t.yesterday;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const formatTime = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
};

export function ClientMessaging({
  messages,
  attorneyName,
  onSendMessage,
  language = 'en',
}: ClientMessagingProps) {
  const [newMessage, setNewMessage] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const t = translations[language];

  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() && attachments.length === 0) return;

    setIsSending(true);
    try {
      await onSendMessage(newMessage, attachments);
      setNewMessage('');
      setAttachments([]);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachments(prev => [...prev, ...files]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="pb-3 border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Scale className="w-5 h-5 text-[#1E3A5F]" />
            {t.title}
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            {attorneyName}
          </Badge>
        </div>
      </CardHeader>

      {/* Messages Area */}
      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea ref={scrollRef} className="h-full p-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <Scale className="w-12 h-12 text-gray-300 mb-3" />
              <p className="text-gray-500">{t.noMessages}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message, index) => {
                const isClient = message.senderType === 'client';
                const showDate = index === 0 || 
                  formatMessageDate(messages[index - 1].createdAt, t) !== formatMessageDate(message.createdAt, t);

                return (
                  <div key={message.id}>
                    {/* Date Separator */}
                    {showDate && (
                      <div className="flex items-center justify-center my-4">
                        <span className="px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-500">
                          {formatMessageDate(message.createdAt, t)}
                        </span>
                      </div>
                    )}

                    {/* Message Bubble */}
                    <div className={`flex ${isClient ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] ${isClient ? 'order-2' : 'order-1'}`}>
                        {/* Sender Info */}
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
                            {formatTime(message.createdAt)}
                          </span>
                        </div>

                        {/* Message Content */}
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

                          {/* Attachments */}
                          {message.attachments && message.attachments.length > 0 && (
                            <div className="mt-2 space-y-1">
                              {message.attachments.map((att, idx) => (
                                <div 
                                  key={idx}
                                  className={`flex items-center gap-2 px-2 py-1 rounded ${
                                    isClient ? 'bg-white/10' : 'bg-white'
                                  }`}
                                >
                                  <File className={`w-4 h-4 ${isClient ? 'text-white/70' : 'text-gray-500'}`} />
                                  <span className={`text-xs ${isClient ? 'text-white/90' : 'text-gray-700'}`}>
                                    {att.name}
                                  </span>
                                  <span className={`text-xs ${isClient ? 'text-white/50' : 'text-gray-400'}`}>
                                    ({formatFileSize(att.size)})
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Read Status */}
                        {isClient && (
                          <div className="flex justify-end mt-1">
                            {message.isRead ? (
                              <div className="flex items-center gap-1 text-[#C4A35A]">
                                <CheckCheck className="w-4 h-4" />
                                <span className="text-xs">{language === 'en' ? 'Read' : 'Leído'}</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1 text-gray-400">
                                <Check className="w-4 h-4" />
                                <span className="text-xs">{language === 'en' ? 'Sent' : 'Enviado'}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </CardContent>

      {/* Input Area */}
      <div className="border-t p-4">
        {/* Attachments Preview */}
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {attachments.map((file, idx) => (
              <div key={idx} className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-lg">
                <File className="w-4 h-4 text-gray-500" />
                <span className="text-xs text-gray-700">{file.name}</span>
                <span className="text-xs text-gray-400">({formatFileSize(file.size)})</span>
                <button
                  onClick={() => removeAttachment(idx)}
                  className="ml-1 text-gray-400 hover:text-red-500"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
          <Button
            variant="outline"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            className="flex-shrink-0"
          >
            <Paperclip className="w-4 h-4" />
          </Button>
          <Textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={t.placeholder}
            className="min-h-[44px] max-h-[120px] resize-none"
            rows={1}
          />
          <Button
            className="bg-[#C4A35A] hover:bg-[#B8943D] flex-shrink-0 px-6"
            onClick={handleSend}
            disabled={isSending || (!newMessage.trim() && attachments.length === 0)}
          >
            {isSending ? (
              <div className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>

        <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {t.secureNote}
        </p>
      </div>
    </Card>
  );
}

export default ClientMessaging;
