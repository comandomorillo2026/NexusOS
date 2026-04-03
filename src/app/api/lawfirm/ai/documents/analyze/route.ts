import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';
import { LEGAL_SYSTEM_CONTEXT } from '@/lib/ai/legal-prompts';

interface ExtractedEntity {
  type: 'person' | 'company' | 'date' | 'amount' | 'address' | 'phone' | 'email' | 'reference';
  value: string;
  context: string;
  confidence: number;
}

interface RiskItem {
  id: string;
  level: 'high' | 'medium' | 'low';
  category: string;
  description: string;
  clauseReference: string;
  recommendation: string;
}

interface CitationReference {
  id: string;
  type: 'statute' | 'case' | 'rule';
  name: string;
  reference: string;
  relevance: string;
}

interface DocumentAnalysis {
  summary: string;
  documentType: string;
  entities: ExtractedEntity[];
  risks: RiskItem[];
  citations: CitationReference[];
  keyClauses: { type: string; content: string; analysis: string }[];
  overallRiskScore: number;
  recommendations: string[];
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { document, analysisType = 'full' } = body;

    if (!document) {
      return NextResponse.json(
        { error: 'Document content is required' },
        { status: 400 }
      );
    }

    const zai = await ZAI.create();

    // Truncate document if too long
    const truncatedDoc = document.length > 8000 
      ? document.substring(0, 8000) + '\n...[truncated]' 
      : document;

    const systemPrompt = `${LEGAL_SYSTEM_CONTEXT}

You are an expert legal document analyzer for Trinidad & Tobago law. Analyze documents and provide:
1. A comprehensive summary
2. Entity extraction (persons, companies, dates, amounts, addresses)
3. Risk analysis with specific concerns for T&T legal compliance
4. Key clause identification and analysis
5. Legal citations and references
6. Practical recommendations

Always be thorough, accurate, and provide actionable insights.`;

    const userPrompt = `Analyze the following legal document comprehensively. Provide your analysis in this exact JSON format:

{
  "summary": "A comprehensive 2-3 paragraph summary of the document",
  "documentType": "The type of legal document (e.g., Employment Contract, Property Transfer Agreement)",
  "entities": [
    {
      "type": "person|company|date|amount|address|phone|email|reference",
      "value": "The extracted value",
      "context": "Surrounding context",
      "confidence": 0.0-1.0
    }
  ],
  "risks": [
    {
      "id": "unique-id",
      "level": "high|medium|low",
      "category": "Legal|Financial|Operational|Compliance",
      "description": "Detailed risk description",
      "clauseReference": "Specific clause or section",
      "recommendation": "How to mitigate this risk"
    }
  ],
  "citations": [
    {
      "id": "unique-id",
      "type": "statute|case|rule",
      "name": "Name of the statute, case, or rule",
      "reference": "Full citation",
      "relevance": "Why this is relevant to the document"
    }
  ],
  "keyClauses": [
    {
      "type": "Type of clause (e.g., Termination, Indemnity, Confidentiality)",
      "content": "The actual clause text",
      "analysis": "Analysis of the clause's implications"
    }
  ],
  "overallRiskScore": 1-10,
  "recommendations": [
    "Actionable recommendation 1",
    "Actionable recommendation 2"
  ]
}

Document to analyze:
${truncatedDoc}`;

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
      temperature: 0.2,
      max_tokens: 4000,
    });

    const responseText = completion.choices[0]?.message?.content || '';

    // Parse the JSON response
    let analysis: DocumentAnalysis;
    try {
      // Extract JSON from the response (handle potential markdown code blocks)
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No valid JSON found in response');
      }
    } catch {
      // Fallback if JSON parsing fails
      analysis = {
        summary: responseText.substring(0, 500),
        documentType: 'Unknown',
        entities: [],
        risks: [],
        citations: [],
        keyClauses: [],
        overallRiskScore: 5,
        recommendations: ['Unable to parse detailed analysis. Please try again.'],
      };
    }

    return NextResponse.json({
      success: true,
      analysis,
      timestamp: new Date().toISOString(),
      documentLength: document.length,
    });
  } catch (error) {
    console.error('Error analyzing document:', error);
    return NextResponse.json(
      { error: 'Failed to analyze document', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
