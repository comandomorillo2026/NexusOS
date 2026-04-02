'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  X, 
  Minimize2, 
  Maximize2, 
  Sparkles,
  User,
  Loader2,
  Code,
  FileText,
  Lightbulb,
  Wrench,
  MessageSquare
} from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AIAssistantProps {
  isOpen: boolean;
  onClose: () => void;
}

// System prompt for NexusOS Assistant
const SYSTEM_PROMPT = `Eres NexusAssistant, el asistente AI integrado de NexusOS - una plataforma SaaS multi-tenant para el Caribe.

Tu rol es ayudar al SUPER_ADMIN (dueño del sistema) con:

1. **Desarrollo y Código**:
   - Crear nuevos módulos y componentes
   - Reparar errores en el código
   - Optimizar rendimiento
   - Implementar nuevas funcionalidades

2. **Gestión del Sistema**:
   - Crear y configurar tenants
   - Gestionar industrias y planes
   - Monitorear capacidad (Vercel/GitHub limits)
   - Revisar leads y facturación

3. **Consultas Técnicas**:
   - Explicar arquitectura del sistema
   - Sugerir mejores prácticas
   - Ayudar con integraciones (WiPay, Stripe, etc.)

4. **Soporte Operativo**:
   - Responder preguntas sobre el negocio
   - Analizar métricas y datos
   - Generar reportes y documentación

Contexto del sistema:
- Tecnologías: Next.js 16, TypeScript, Tailwind CSS 4, Prisma, shadcn/ui
- Deployment: Vercel (https://nexus-os-alpha.vercel.app)
- Base de datos: SQLite (desarrollo) / PostgreSQL (producción)
- Industrias: Panaderías, Clínicas, Salones, Retail, Bufetes, etc.

Responde siempre en español (o inglés si el usuario escribe en inglés).
Sé conciso pero completo. Usa código cuando sea necesario.
Si necesitas más contexto, pregunta.`;

export function AIAssistant({ isOpen, onClose }: AIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: '¡Hola! 👋 Soy tu asistente NexusOS. Puedo ayudarte con:\n\n• **Crear** nuevos módulos y páginas\n• **Reparar** errores y bugs\n• **Optimizar** el rendimiento\n• **Configurar** tenants y planes\n• **Responder** preguntas técnicas\n\n¿En qué puedo ayudarte hoy?',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input on open
  useEffect(() => {
    if (isOpen && !isMinimized) {
      inputRef.current?.focus();
    }
  }, [isOpen, isMinimized]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Call AI API
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            ...messages.map((m) => ({ role: m.role, content: m.content })),
            { role: 'user', content: userMessage.content },
          ],
        }),
      });

      const data = await response.json();
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.content || 'Lo siento, hubo un error al procesar tu solicitud. Por favor intenta de nuevo.',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('AI Assistant error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '❌ Error de conexión. Verifica tu conexión a internet e intenta de nuevo.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Quick action buttons
  const quickActions = [
    { icon: Code, label: 'Crear módulo', prompt: 'Ayúdame a crear un nuevo módulo para...' },
    { icon: Wrench, label: 'Reparar error', prompt: 'Tengo un error en el código:' },
    { icon: Lightbulb, label: 'Sugerencia', prompt: '¿Qué mejoras sugerirías para el sistema?' },
    { icon: FileText, label: 'Documentar', prompt: 'Genera documentación para...' },
  ];

  if (!isOpen) return null;

  return (
    <div 
      className={`fixed z-[100] transition-all duration-300 ${
        isMinimized 
          ? 'bottom-4 right-4 w-80' 
          : 'bottom-4 right-4 w-[450px] h-[600px] max-h-[85vh]'
      }`}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-[#6C3FCE] to-[#C026D3] rounded-t-xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-white">NexusAssistant</h3>
            <p className="text-xs text-white/70">Tu asistente AI privado</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            {isMinimized ? <Maximize2 className="w-4 h-4 text-white" /> : <Minimize2 className="w-4 h-4 text-white" />}
          </button>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      {/* Chat Area - Hidden when minimized */}
      {!isMinimized && (
        <>
          <div className="bg-[#0A0820] h-[450px] overflow-hidden flex flex-col border-x border-[rgba(167,139,250,0.2)]">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ maxHeight: '400px' }}>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6C3FCE] to-[#C026D3] flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] p-3 rounded-xl text-sm ${
                      message.role === 'user'
                        ? 'bg-[#6C3FCE] text-white'
                        : 'bg-[rgba(108,63,206,0.2)] text-[#EDE9FE] border border-[rgba(167,139,250,0.2)]'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{message.content}</div>
                    <span className="text-xs opacity-50 mt-1 block">
                      {message.timestamp.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  {message.role === 'user' && (
                    <div className="w-8 h-8 rounded-lg bg-[#F0B429] flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-[#050410]" />
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6C3FCE] to-[#C026D3] flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white animate-pulse" />
                  </div>
                  <div className="bg-[rgba(108,63,206,0.2)] border border-[rgba(167,139,250,0.2)] p-3 rounded-xl">
                    <Loader2 className="w-4 h-4 animate-spin text-[#9D7BEA]" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions */}
            {messages.length <= 2 && (
              <div className="px-4 pb-2">
                <p className="text-xs text-[#9D7BEA] mb-2">Acciones rápidas:</p>
                <div className="flex flex-wrap gap-2">
                  {quickActions.map((action, i) => (
                    <button
                      key={i}
                      onClick={() => setInput(action.prompt)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[rgba(108,63,206,0.2)] border border-[rgba(167,139,250,0.2)] text-xs text-[#EDE9FE] hover:bg-[rgba(108,63,206,0.3)] transition-colors"
                    >
                      <action.icon className="w-3 h-3" />
                      {action.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="p-4 border-t border-[rgba(167,139,250,0.2)]">
              <div className="flex gap-2">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Escribe tu mensaje..."
                  className="flex-1 bg-[rgba(108,63,206,0.1)] border border-[rgba(167,139,250,0.2)] rounded-xl px-4 py-3 text-[#EDE9FE] placeholder-[rgba(167,139,250,0.5)] resize-none focus:outline-none focus:border-[#6C3FCE] transition-colors"
                  rows={2}
                  disabled={isLoading}
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || isLoading}
                  className="px-4 rounded-xl bg-gradient-to-r from-[#6C3FCE] to-[#C026D3] text-white hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-[#0A0820] rounded-b-xl p-2 border-x border-b border-[rgba(167,139,250,0.2)]">
            <p className="text-xs text-center text-[rgba(167,139,250,0.5)]">
              NexusAssistant • Solo visible para SUPER_ADMIN
            </p>
          </div>
        </>
      )}
    </div>
  );
}

// Floating button to open the assistant
export function AIAssistantButton({ 
  onClick, 
  isOpen 
}: { 
  onClick: () => void; 
  isOpen: boolean;
}) {
  if (isOpen) return null;
  
  return (
    <button
      onClick={onClick}
      className="fixed bottom-4 right-4 z-40 w-14 h-14 rounded-full bg-gradient-to-r from-[#6C3FCE] to-[#C026D3] flex items-center justify-center shadow-lg hover:scale-110 transition-transform group"
      title="Abrir Asistente AI"
    >
      <MessageSquare className="w-6 h-6 text-white" />
      <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#F0B429] rounded-full flex items-center justify-center">
        <Sparkles className="w-2.5 h-2.5 text-[#050410]" />
      </span>
    </button>
  );
}
