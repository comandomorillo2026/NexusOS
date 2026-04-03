import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';
import { AI_PROMPTS } from '@/lib/ai/legal-prompts';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { document, sourceLanguage = 'auto', targetLanguage, preserveFormatting = true } = body;

    if (!document) {
      return NextResponse.json(
        { error: 'Document content is required' },
        { status: 400 }
      );
    }

    if (!targetLanguage) {
      return NextResponse.json(
        { error: 'Target language is required' },
        { status: 400 }
      );
    }

    const zai = await ZAI.create();

    const detectedSource = sourceLanguage === 'auto' 
      ? (document.match(/[áéíóúñü¿¡]/i) ? 'Spanish' : 'English')
      : sourceLanguage;

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `You are a professional legal translator specialized in Caribbean legal documents, particularly for Trinidad & Tobago. Translate legal documents between English and Spanish while:
1. Maintaining legal terminology accuracy
2. Preserving formal legal tone
3. Using equivalent legal concepts (not literal translations)
4. Keeping formatting, numbering, and structure intact
5. Translating jurisdiction-specific terms appropriately

For Trinidad & Tobago specific terms:
- "High Court" = "Tribunal Superior"
- "Magistrates' Court" = "Tribunal de Magistrados"
- "Attorney-at-Law" = "Abogado"
- "Deed" = "Escritura"
- "Affidavit" = "Declaración Jurada"
${preserveFormatting ? '6. Preserving all formatting including line breaks, indentation, and spacing' : ''}`,
        },
        {
          role: 'user',
          content: AI_PROMPTS.translateDocument(document, detectedSource, targetLanguage),
        },
      ],
      temperature: 0.2,
      max_tokens: 4000,
    });

    const translatedDocument = completion.choices[0]?.message?.content || '';

    return NextResponse.json({
      success: true,
      translation: translatedDocument,
      sourceLanguage: detectedSource,
      targetLanguage,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error translating document:', error);
    return NextResponse.json(
      { error: 'Failed to translate document', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
