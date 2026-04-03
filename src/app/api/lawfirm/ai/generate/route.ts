import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';
import { AI_PROMPTS, CONTRACT_TEMPLATES, MOTION_TEMPLATES, LETTER_TEMPLATES } from '@/lib/ai/legal-prompts';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { documentType, context, template, clientInfo, caseInfo } = body;

    if (!documentType && !template) {
      return NextResponse.json(
        { error: 'Document type or template is required' },
        { status: 400 }
      );
    }

    const zai = await ZAI.create();

    // Build context from various sources
    let fullContext = context || '';
    
    if (clientInfo) {
      fullContext += `\n\nClient Information:\n${JSON.stringify(clientInfo, null, 2)}`;
    }
    
    if (caseInfo) {
      fullContext += `\n\nCase Information:\n${JSON.stringify(caseInfo, null, 2)}`;
    }

    // Check if we have a predefined template
    let templateContent = '';
    if (template) {
      const allTemplates = {
        ...CONTRACT_TEMPLATES,
        ...MOTION_TEMPLATES,
        ...LETTER_TEMPLATES,
      };
      templateContent = allTemplates[template as keyof typeof allTemplates]?.template || '';
    }

    const prompt = AI_PROMPTS.generateDocument(documentType || template, fullContext);

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `You are a legal document drafting assistant specialized in Trinidad & Tobago law. Generate professional, legally sound documents following T&T legal conventions. Include all necessary legal language, proper formatting, and ensure the document is enforceable under T&T law. ${templateContent ? `Use this template as a base structure:\n${templateContent}` : ''}`,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 4000,
    });

    const generatedDocument = completion.choices[0]?.message?.content || '';

    return NextResponse.json({
      success: true,
      document: generatedDocument,
      documentType: documentType || template,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error generating document:', error);
    return NextResponse.json(
      { error: 'Failed to generate document', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
