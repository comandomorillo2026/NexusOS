import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';
import { AI_PROMPTS } from '@/lib/ai/legal-prompts';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { document, detailLevel = 'standard' } = body;

    if (!document) {
      return NextResponse.json(
        { error: 'Document content is required' },
        { status: 400 }
      );
    }

    const zai = await ZAI.create();

    const detailInstructions = {
      brief: 'Provide a brief summary in 3-5 bullet points.',
      standard: 'Provide a comprehensive summary with all key elements.',
      detailed: 'Provide an extensive analysis including clause-by-clause breakdown.',
    };

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `You are a legal document analysis assistant specialized in Trinidad & Tobago law. Summarize legal documents clearly and accurately, highlighting key legal implications and obligations. ${detailInstructions[detailLevel as keyof typeof detailInstructions]}`,
        },
        {
          role: 'user',
          content: AI_PROMPTS.summarizeDocument(document),
        },
      ],
      temperature: 0.2,
      max_tokens: 3000,
    });

    const summary = completion.choices[0]?.message?.content || '';

    return NextResponse.json({
      success: true,
      summary,
      detailLevel,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error summarizing document:', error);
    return NextResponse.json(
      { error: 'Failed to summarize document', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
