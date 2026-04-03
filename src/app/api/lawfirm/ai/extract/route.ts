import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';
import { AI_PROMPTS, CLAUSE_TYPES } from '@/lib/ai/legal-prompts';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { document, clauseTypes, includeAnalysis = true } = body;

    if (!document) {
      return NextResponse.json(
        { error: 'Document content is required' },
        { status: 400 }
      );
    }

    const zai = await ZAI.create();

    const targetClauses = clauseTypes || Object.keys(CLAUSE_TYPES);

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `You are a legal document analysis assistant specialized in Trinidad & Tobago law. Extract and analyze clauses from legal documents with precision. Identify each clause by type and provide exact text quotations. Format your response as JSON with the following structure:
{
  "clauses": [
    {
      "type": "clause_type",
      "found": true/false,
      "text": "exact clause text",
      "location": "section/paragraph reference",
      "analysis": "brief analysis",
      "risk": "low/medium/high",
      "recommendation": "any recommendations"
    }
  ],
  "missingClauses": ["list of expected clauses not found"],
  "overallAssessment": "overall document assessment"
}`,
        },
        {
          role: 'user',
          content: `Extract the following clause types from this document: ${targetClauses.join(', ')}

Document:
${document}

${includeAnalysis ? 'Include analysis for each clause found.' : 'Just extract the clauses without detailed analysis.'}`,
        },
      ],
      temperature: 0.1,
      max_tokens: 4000,
    });

    let extractedData;
    try {
      const responseText = completion.choices[0]?.message?.content || '';
      // Try to parse JSON from the response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        extractedData = JSON.parse(jsonMatch[0]);
      } else {
        extractedData = { rawText: responseText };
      }
    } catch {
      extractedData = { rawText: completion.choices[0]?.message?.content || '' };
    }

    return NextResponse.json({
      success: true,
      extraction: extractedData,
      requestedTypes: targetClauses,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error extracting clauses:', error);
    return NextResponse.json(
      { error: 'Failed to extract clauses', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
