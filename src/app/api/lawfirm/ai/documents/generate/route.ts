import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';
import { TT_LEGAL_TEMPLATES, type TTTemplateKey } from '@/lib/ai/tt-legal-templates';
import { LEGAL_SYSTEM_CONTEXT } from '@/lib/ai/legal-prompts';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      documentType, 
      templateKey, 
      context, 
      clientInfo, 
      caseInfo,
      variables 
    } = body;

    if (!documentType && !templateKey) {
      return NextResponse.json(
        { error: 'Document type or template key is required' },
        { status: 400 }
      );
    }

    const zai = await ZAI.create();

    // Get template if specified
    let templateContent = '';
    let templateName = documentType;
    
    if (templateKey && TT_LEGAL_TEMPLATES[templateKey as TTTemplateKey]) {
      const template = TT_LEGAL_TEMPLATES[templateKey as TTTemplateKey];
      templateContent = template.template;
      templateName = template.name;
    }

    // Build context from various sources
    let fullContext = context || '';
    
    if (clientInfo) {
      fullContext += `\n\nClient Information:\n${JSON.stringify(clientInfo, null, 2)}`;
    }
    
    if (caseInfo) {
      fullContext += `\n\nCase Information:\n${JSON.stringify(caseInfo, null, 2)}`;
    }

    if (variables) {
      fullContext += `\n\nVariables to Fill:\n${JSON.stringify(variables, null, 2)}`;
    }

    const systemPrompt = `${LEGAL_SYSTEM_CONTEXT}

You are a legal document drafting assistant specialized in Trinidad & Tobago law. Generate professional, legally sound documents following T&T legal conventions. 

Requirements:
1. Use proper legal terminology and formatting
2. Include all necessary clauses for enforceability in T&T
3. Reference applicable T&T legislation where relevant
4. Use clear section numbering
5. Include signature blocks with witness requirements
6. Add any necessary schedules or appendices
7. Fill in all placeholders with reasonable example values if actual values not provided
8. Ensure compliance with Trinidad & Tobago legal requirements
${templateContent ? `\nUse the following template as a base structure:\n${templateContent}` : ''}`;

    const userPrompt = `Generate a ${templateName || documentType} document.

${fullContext ? `Context and Instructions:\n${fullContext}` : ''}

Please generate a complete, professional legal document for Trinidad & Tobago jurisdiction.`;

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: userPrompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 4000,
    });

    const generatedDocument = completion.choices[0]?.message?.content || '';

    return NextResponse.json({
      success: true,
      document: generatedDocument,
      documentType: templateName || documentType,
      timestamp: new Date().toISOString(),
      wordCount: generatedDocument.split(/\s+/).length,
    });
  } catch (error) {
    console.error('Error generating document:', error);
    return NextResponse.json(
      { error: 'Failed to generate document', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
