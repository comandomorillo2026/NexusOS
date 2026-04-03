import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';
import { LEGAL_SYSTEM_CONTEXT, AI_PROMPTS } from '@/lib/ai/legal-prompts';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, document, history = [], mode = 'general' } = body;

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    const zai = await ZAI.create();

    // Build conversation history
    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      {
        role: 'system',
        content: `${LEGAL_SYSTEM_CONTEXT}

You are an AI legal assistant for a law firm in Trinidad & Tobago. You help attorneys with:
- Document drafting and review
- Legal research and analysis
- Case strategy discussions
- Client communication drafting
- Contract review and risk assessment
- Citation and reference finding

Always be professional, accurate, and helpful. When citing cases or statutes, use proper legal citation format for Trinidad & Tobago.

Mode: ${mode}
${document ? `\nYou have access to the following document for reference:\n${document.substring(0, 5000)}...` : ''}`,
      },
    ];

    // Add conversation history
    for (const msg of history) {
      messages.push({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      });
    }

    // Add current message
    const userMessage = document 
      ? AI_PROMPTS.chatAboutDocument(document, message)
      : message;
    
    messages.push({
      role: 'user',
      content: userMessage,
    });

    const completion = await zai.chat.completions.create({
      messages,
      temperature: 0.3,
      max_tokens: 2000,
    });

    const response = completion.choices[0]?.message?.content || '';

    return NextResponse.json({
      success: true,
      response,
      mode,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error in AI chat:', error);
    return NextResponse.json(
      { error: 'Failed to process chat message', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
