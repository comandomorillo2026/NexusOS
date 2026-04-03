"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Bot,
  Send,
  X,
  Minimize2,
  Maximize2,
  Sparkles,
  User,
  Loader2,
  ChefHat,
  Calculator,
  TrendingUp,
  Package,
  Wheat,
  Trash2,
  Heart,
  Calendar,
  AlertTriangle,
  Lightbulb,
  DollarSign,
  Scale,
  Leaf,
  Sun,
  Mic,
  MicOff,
  MessageSquare,
  RefreshCw,
  Copy,
  Check
} from 'lucide-react';
import { toast } from 'sonner';

// ============================================
// TYPES
// ============================================

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  action?: string;
  data?: Record<string, unknown>;
}

interface QuickAction {
  id: string;
  icon: React.ElementType;
  label: string;
  labelEn: string;
  prompt: string;
  promptEn: string;
  color: string;
}

interface CostCalculation {
  ingredients: Array<{ name: string; quantity: number; unit: string; cost: number }>;
  portions: number;
  laborCost: number;
  overheadCost: number;
}

// ============================================
// QUICK ACTIONS CONFIGURATION
// ============================================

const quickActions: QuickAction[] = [
  {
    id: 'recipe-cost',
    icon: Calculator,
    label: 'Calcular Costo',
    labelEn: 'Calculate Cost',
    prompt: '¿Cuánto cuesta hacer',
    promptEn: 'How much does it cost to make',
    color: 'bg-blue-500'
  },
  {
    id: 'pricing',
    icon: DollarSign,
    label: 'Sugerir Precio',
    labelEn: 'Suggest Price',
    prompt: '¿Qué precio debo cobrar por',
    promptEn: 'What price should I charge for',
    color: 'bg-green-500'
  },
  {
    id: 'recipe-gen',
    icon: ChefHat,
    label: 'Generar Receta',
    labelEn: 'Generate Recipe',
    prompt: 'Genera una receta para',
    promptEn: 'Generate a recipe for',
    color: 'bg-orange-500'
  },
  {
    id: 'substitute',
    icon: Wheat,
    label: 'Sustitutos',
    labelEn: 'Substitutes',
    prompt: '¿Qué puedo usar en lugar de',
    promptEn: 'What can I use instead of',
    color: 'bg-amber-500'
  },
  {
    id: 'waste',
    icon: Trash2,
    label: 'Reducir Desperdicio',
    labelEn: 'Reduce Waste',
    prompt: '¿Cómo puedo reducir el desperdicio de',
    promptEn: 'How can I reduce waste of',
    color: 'bg-red-500'
  },
  {
    id: 'demand',
    icon: TrendingUp,
    label: 'Predecir Demanda',
    labelEn: 'Predict Demand',
    prompt: '¿Cuánto debo producir de',
    promptEn: 'How much should I produce of',
    color: 'bg-purple-500'
  },
  {
    id: 'allergens',
    icon: AlertTriangle,
    label: 'Detectar Alérgenos',
    labelEn: 'Detect Allergens',
    prompt: '¿Qué alérgenos tiene',
    promptEn: 'What allergens does',
    color: 'bg-pink-500'
  },
  {
    id: 'seasonal',
    icon: Sun,
    label: 'Productos Estacionales',
    labelEn: 'Seasonal Products',
    prompt: '¿Qué productos son ideales para esta temporada?',
    promptEn: 'What products are ideal for this season?',
    color: 'bg-yellow-500'
  }
];

// ============================================
// MAIN COMPONENT
// ============================================

interface BakeryAIAssistantProps {
  isOpen?: boolean;
  onClose?: () => void;
  language?: 'en' | 'es';
  tenantId?: string;
}

export function BakeryAIAssistant({
  isOpen: externalIsOpen,
  onClose,
  language = 'es',
  tenantId = 'bakery-demo-001'
}: BakeryAIAssistantProps) {
  // State
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const [isListening, setIsListening] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  // Cost Calculator State
  const [costCalc, setCostCalc] = useState<CostCalculation>({
    ingredients: [{ name: '', quantity: 0, unit: 'g', cost: 0 }],
    portions: 10,
    laborCost: 0,
    overheadCost: 0
  });

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Use external or internal open state
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;

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

  // Initialize with welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          role: 'assistant',
          content: language === 'es'
            ? `¡Hola! 👋 Soy **BakeryAI**, tu asistente especializado en panadería y pastelería.

Puedo ayudarte con:

• 📊 **Costos y Precios** - Calcula el costo real de tus recetas
• 📝 **Recetas** - Genera nuevas recetas o escala las existentes  
• 📈 **Producción** - Optimiza tu plan de producción diario
• 🌾 **Ingredientes** - Encuentra sustitutos y alternativas
• ♻️ **Desperdicio** - Reduce mermas y ahorra dinero
• ⚠️ **Alérgenos** - Detecta alérgenos en tus productos

**¿En qué puedo ayudarte hoy?**`
            : `Hello! 👋 I'm **BakeryAI**, your specialized bakery and pastry assistant.

I can help you with:

• 📊 **Costs & Pricing** - Calculate the real cost of your recipes
• 📝 **Recipes** - Generate new recipes or scale existing ones
• 📈 **Production** - Optimize your daily production plan
• 🌾 **Ingredients** - Find substitutes and alternatives
• ♻️ **Waste** - Reduce waste and save money
• ⚠️ **Allergens** - Detect allergens in your products

**How can I help you today?**`,
          timestamp: new Date()
        }
      ]);
    }
  }, [language, messages.length]);

  // ============================================
  // API CALLS
  // ============================================

  const callAPI = useCallback(async (action: string, data: Record<string, unknown>) => {
    const response = await fetch('/api/bakery/ai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-tenant-id': tenantId,
        'x-language': language
      },
      body: JSON.stringify({ action, data })
    });

    if (!response.ok) {
      throw new Error('API call failed');
    }

    return response.json();
  }, [tenantId, language]);

  // ============================================
  // CHAT FUNCTIONS
  // ============================================

  const sendMessage = async (messageText?: string) => {
    const text = messageText || input.trim();
    if (!text || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const conversationHistory = messages.slice(-10).map(m => ({
        role: m.role,
        content: m.content
      }));

      const result = await callAPI('chat', {
        message: text,
        conversationHistory
      });

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: result.response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: language === 'es'
          ? '❌ Error de conexión. Por favor intenta de nuevo.'
          : '❌ Connection error. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
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

  // ============================================
  // COST CALCULATOR
  // ============================================

  const handleCalculateCost = async () => {
    const validIngredients = costCalc.ingredients.filter(i => i.name && i.quantity > 0);
    if (validIngredients.length === 0) {
      toast.error(language === 'es' ? 'Agrega al menos un ingrediente' : 'Add at least one ingredient');
      return;
    }

    setIsLoading(true);
    try {
      const result = await callAPI('analyzeRecipeCost', {
        ingredients: validIngredients.map(i => ({
          name: i.name,
          quantity: i.quantity,
          unit: i.unit,
          unitCost: i.cost
        })),
        portions: costCalc.portions,
        laborCost: costCalc.laborCost,
        overheadCost: costCalc.overheadCost
      });

      const { result: costResult } = result;

      const message: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: language === 'es'
          ? `📊 **Análisis de Costo de Receta**

💰 **Costo Total de Ingredientes:** TT$${costResult.totalIngredientCost.toFixed(2)}
📦 **Costo por Porción:** TT$${costResult.totalCostPerPortion.toFixed(2)}

**Desglose:**
${costResult.breakdown.map((b: { ingredient: string; quantity: number; unit: string; cost: number; percentage: number }) => 
  `• ${b.ingredient}: ${b.quantity} ${b.unit} = TT$${b.cost.toFixed(2)} (${b.percentage.toFixed(1)}%)`
).join('\n')}`
          : `📊 **Recipe Cost Analysis**

💰 **Total Ingredient Cost:** TT$${costResult.totalIngredientCost.toFixed(2)}
📦 **Cost Per Portion:** TT$${costResult.totalCostPerPortion.toFixed(2)}

**Breakdown:**
${costResult.breakdown.map((b: { ingredient: string; quantity: number; unit: string; cost: number; percentage: number }) => 
  `• ${b.ingredient}: ${b.quantity} ${b.unit} = TT$${b.cost.toFixed(2)} (${b.percentage.toFixed(1)}%)`
).join('\n')}`,
        timestamp: new Date(),
        action: 'cost-analysis',
        data: costResult
      };

      setMessages(prev => [...prev, message]);
      setActiveTab('chat');
    } catch (error) {
      toast.error(language === 'es' ? 'Error al calcular' : 'Error calculating');
    } finally {
      setIsLoading(false);
    }
  };

  const addIngredient = () => {
    setCostCalc(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, { name: '', quantity: 0, unit: 'g', cost: 0 }]
    }));
  };

  const updateIngredient = (index: number, field: string, value: string | number) => {
    setCostCalc(prev => ({
      ...prev,
      ingredients: prev.ingredients.map((ing, i) =>
        i === index ? { ...ing, [field]: value } : ing
      )
    }));
  };

  const removeIngredient = (index: number) => {
    setCostCalc(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index)
    }));
  };

  // ============================================
  // VOICE INPUT
  // ============================================

  const toggleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error(language === 'es' ? 'Reconocimiento de voz no soportado' : 'Voice recognition not supported');
      return;
    }

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.lang = language === 'es' ? 'es-ES' : 'en-US';
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = false;

    recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setIsListening(false);
    };

    recognitionRef.current.onerror = () => {
      setIsListening(false);
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current.start();
    setIsListening(true);
  };

  // ============================================
  // UTILITY FUNCTIONS
  // ============================================

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast.success(language === 'es' ? 'Copiado al portapapeles' : 'Copied to clipboard');
  };

  const clearChat = () => {
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: language === 'es'
          ? '¡Chat limpiado! ¿En qué puedo ayudarte?'
          : 'Chat cleared! How can I help you?',
        timestamp: new Date()
      }
    ]);
  };

  const handleOpenChange = (open: boolean) => {
    if (externalIsOpen === undefined) {
      setInternalIsOpen(open);
    }
    if (!open && onClose) {
      onClose();
    }
  };

  // ============================================
  // RENDER
  // ============================================

  if (!isOpen) return null;

  return (
    <div
      className={`fixed z-50 transition-all duration-300 ${
        isMinimized
          ? 'bottom-4 right-4 w-80'
          : 'bottom-4 right-4 w-[500px] h-[700px] max-h-[85vh]'
      }`}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-[#F97316] to-[#EA580C] rounded-t-xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
            <ChefHat className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-white">BakeryAI</h3>
            <p className="text-xs text-white/70">
              {language === 'es' ? 'Tu asistente de panadería' : 'Your bakery assistant'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={clearChat}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            title={language === 'es' ? 'Limpiar chat' : 'Clear chat'}
          >
            <RefreshCw className="w-4 h-4 text-white" />
          </button>
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            {isMinimized ? (
              <Maximize2 className="w-4 h-4 text-white" />
            ) : (
              <Minimize2 className="w-4 h-4 text-white" />
            )}
          </button>
          <button
            onClick={() => handleOpenChange(false)}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      {/* Main Content - Hidden when minimized */}
      {!isMinimized && (
        <div className="bg-white border-x border-gray-200 flex-1 overflow-hidden flex flex-col rounded-b-xl shadow-xl">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-3 m-2">
              <TabsTrigger value="chat" className="text-xs">
                <MessageSquare className="w-4 h-4 mr-1" />
                {language === 'es' ? 'Chat' : 'Chat'}
              </TabsTrigger>
              <TabsTrigger value="calculator" className="text-xs">
                <Calculator className="w-4 h-4 mr-1" />
                {language === 'es' ? 'Costos' : 'Costs'}
              </TabsTrigger>
              <TabsTrigger value="actions" className="text-xs">
                <Sparkles className="w-4 h-4 mr-1" />
                {language === 'es' ? 'Acciones' : 'Actions'}
              </TabsTrigger>
            </TabsList>

            {/* Chat Tab */}
            <TabsContent value="chat" className="flex-1 flex flex-col m-0 overflow-hidden">
              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      {message.role === 'assistant' && (
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#F97316] to-[#EA580C] flex items-center justify-center flex-shrink-0">
                          <ChefHat className="w-4 h-4 text-white" />
                        </div>
                      )}
                      <div
                        className={`max-w-[85%] p-3 rounded-xl text-sm ${
                          message.role === 'user'
                            ? 'bg-[#F97316] text-white'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        <div className="whitespace-pre-wrap prose prose-sm max-w-none">
                          {message.content.split('\n').map((line, i) => {
                            // Simple markdown-like formatting
                            if (line.startsWith('**') && line.endsWith('**')) {
                              return <strong key={i}>{line.slice(2, -2)}</strong>;
                            }
                            if (line.startsWith('• ')) {
                              return <div key={i} className="flex gap-2"><span>•</span><span>{line.slice(2)}</span></div>;
                            }
                            return <div key={i}>{line}</div>;
                          })}
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs opacity-50">
                            {message.timestamp.toLocaleTimeString(language === 'es' ? 'es' : 'en', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                          {message.role === 'assistant' && (
                            <button
                              onClick={() => copyToClipboard(message.content, message.id)}
                              className="opacity-0 group-hover:opacity-100 hover:opacity-100 transition-opacity"
                            >
                              {copiedId === message.id ? (
                                <Check className="w-3 h-3 text-green-500" />
                              ) : (
                                <Copy className="w-3 h-3 text-gray-400" />
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                      {message.role === 'user' && (
                        <div className="w-8 h-8 rounded-lg bg-[#FBBF24] flex items-center justify-center flex-shrink-0">
                          <User className="w-4 h-4 text-amber-900" />
                        </div>
                      )}
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#F97316] to-[#EA580C] flex items-center justify-center">
                        <ChefHat className="w-4 h-4 text-white animate-pulse" />
                      </div>
                      <div className="bg-gray-100 p-3 rounded-xl">
                        <Loader2 className="w-4 h-4 animate-spin text-[#F97316]" />
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Quick Actions in Chat */}
              {messages.length <= 2 && (
                <div className="px-4 pb-2">
                  <p className="text-xs text-gray-500 mb-2">
                    {language === 'es' ? 'Acciones rápidas:' : 'Quick actions:'}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {quickActions.slice(0, 4).map((action) => (
                      <button
                        key={action.id}
                        onClick={() => setInput(language === 'es' ? action.prompt : action.promptEn)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${action.color} text-white text-xs hover:opacity-90 transition-opacity`}
                      >
                        <action.icon className="w-3 h-3" />
                        {language === 'es' ? action.label : action.labelEn}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input */}
              <div className="p-4 border-t border-gray-200">
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <textarea
                      ref={inputRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder={language === 'es' ? 'Escribe tu mensaje...' : 'Type your message...'}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:border-[#F97316] transition-colors pr-12"
                      rows={2}
                      disabled={isLoading}
                    />
                    <button
                      onClick={toggleVoiceInput}
                      className={`absolute right-3 bottom-3 p-1.5 rounded-lg transition-colors ${
                        isListening ? 'bg-red-100 text-red-500' : 'text-gray-400 hover:text-gray-600'
                      }`}
                      title={language === 'es' ? 'Entrada de voz' : 'Voice input'}
                    >
                      {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    </button>
                  </div>
                  <button
                    onClick={() => sendMessage()}
                    disabled={!input.trim() || isLoading}
                    className="px-4 rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </TabsContent>

            {/* Calculator Tab */}
            <TabsContent value="calculator" className="flex-1 flex flex-col m-0 overflow-hidden">
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      {language === 'es' ? 'Ingredientes' : 'Ingredients'}
                    </label>
                    <div className="space-y-2 mt-2">
                      {costCalc.ingredients.map((ing, index) => (
                        <div key={index} className="flex gap-2 items-center">
                          <Input
                            placeholder={language === 'es' ? 'Nombre' : 'Name'}
                            value={ing.name}
                            onChange={(e) => updateIngredient(index, 'name', e.target.value)}
                            className="flex-1"
                          />
                          <Input
                            type="number"
                            placeholder="Qty"
                            value={ing.quantity || ''}
                            onChange={(e) => updateIngredient(index, 'quantity', parseFloat(e.target.value) || 0)}
                            className="w-16"
                          />
                          <select
                            value={ing.unit}
                            onChange={(e) => updateIngredient(index, 'unit', e.target.value)}
                            className="w-16 border border-gray-200 rounded-md px-2 py-2 text-sm"
                          >
                            <option value="g">g</option>
                            <option value="kg">kg</option>
                            <option value="ml">ml</option>
                            <option value="L">L</option>
                            <option value="unidad">ud</option>
                          </select>
                          <Input
                            type="number"
                            placeholder="TT$"
                            value={ing.cost || ''}
                            onChange={(e) => updateIngredient(index, 'cost', parseFloat(e.target.value) || 0)}
                            className="w-20"
                          />
                          {costCalc.ingredients.length > 1 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeIngredient(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={addIngredient}
                      className="mt-2"
                    >
                      + {language === 'es' ? 'Agregar Ingrediente' : 'Add Ingredient'}
                    </Button>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        {language === 'es' ? 'Porciones' : 'Portions'}
                      </label>
                      <Input
                        type="number"
                        value={costCalc.portions}
                        onChange={(e) => setCostCalc(prev => ({ ...prev, portions: parseInt(e.target.value) || 1 }))}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        {language === 'es' ? 'Mano de Obra' : 'Labor Cost'}
                      </label>
                      <Input
                        type="number"
                        value={costCalc.laborCost || ''}
                        onChange={(e) => setCostCalc(prev => ({ ...prev, laborCost: parseFloat(e.target.value) || 0 }))}
                        placeholder="TT$"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        {language === 'es' ? 'Gastos Gen.' : 'Overhead'}
                      </label>
                      <Input
                        type="number"
                        value={costCalc.overheadCost || ''}
                        onChange={(e) => setCostCalc(prev => ({ ...prev, overheadCost: parseFloat(e.target.value) || 0 }))}
                        placeholder="TT$"
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <Button
                    onClick={handleCalculateCost}
                    disabled={isLoading}
                    className="w-full bg-[#F97316] hover:bg-[#EA580C]"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <Calculator className="w-4 h-4 mr-2" />
                    )}
                    {language === 'es' ? 'Calcular Costo' : 'Calculate Cost'}
                  </Button>
                </div>
              </ScrollArea>
            </TabsContent>

            {/* Quick Actions Tab */}
            <TabsContent value="actions" className="flex-1 overflow-auto m-0 p-4">
              <div className="grid grid-cols-2 gap-3">
                {quickActions.map((action) => (
                  <Card
                    key={action.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => {
                      setInput(language === 'es' ? action.prompt : action.promptEn);
                      setActiveTab('chat');
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${action.color} text-white`}>
                          <action.icon className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">
                            {language === 'es' ? action.label : action.labelEn}
                          </p>
                          <p className="text-xs text-gray-500">
                            {language === 'es' ? action.prompt.slice(0, 30) + '...' : action.promptEn.slice(0, 30) + '...'}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>

          {/* Footer */}
          <div className="p-2 border-t border-gray-200 bg-gray-50">
            <p className="text-xs text-center text-gray-400">
              BakeryAI • {language === 'es' ? 'Asistente de Panadería' : 'Bakery Assistant'} • NexusOS
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// FLOATING BUTTON COMPONENT
// ============================================

export function BakeryAIButton({
  onClick,
  isOpen,
  language = 'es'
}: {
  onClick: () => void;
  isOpen: boolean;
  language?: 'en' | 'es';
}) {
  if (isOpen) return null;

  return (
    <button
      onClick={onClick}
      className="fixed bottom-4 right-4 z-40 w-14 h-14 rounded-full bg-gradient-to-r from-[#F97316] to-[#EA580C] flex items-center justify-center shadow-lg hover:scale-110 transition-transform group"
      title={language === 'es' ? 'Abrir BakeryAI' : 'Open BakeryAI'}
    >
      <ChefHat className="w-6 h-6 text-white" />
      <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#FBBF24] rounded-full flex items-center justify-center">
        <Sparkles className="w-2.5 h-2.5 text-amber-900" />
      </span>
    </button>
  );
}

// ============================================
// FULL PAGE ASSISTANT COMPONENT
// ============================================

export function BakeryAIPage({ language = 'es', tenantId }: { language?: 'en' | 'es'; tenantId?: string }) {
  const [activeSection, setActiveSection] = useState<'chat' | 'pricing' | 'recipes'>('chat');

  return (
    <div className="h-full flex flex-col">
      <div className="bg-gradient-to-r from-[#F97316] to-[#EA580C] p-6 rounded-t-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
            <ChefHat className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">BakeryAI</h1>
            <p className="text-white/80">
              {language === 'es'
                ? 'Tu asistente inteligente para panadería'
                : 'Your intelligent bakery assistant'}
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 bg-white border border-gray-200 rounded-b-xl overflow-hidden">
        <BakeryAIAssistant
          isOpen={true}
          language={language}
          tenantId={tenantId}
        />
      </div>
    </div>
  );
}

// Export default
export default BakeryAIAssistant;
