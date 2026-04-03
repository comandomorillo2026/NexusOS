import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';
import { LEGAL_SYSTEM_CONTEXT, TT_LEGAL_REFERENCES } from '@/lib/ai/legal-prompts';

interface CitationReference {
  id: string;
  type: 'statute' | 'case' | 'rule';
  name: string;
  reference: string;
  relevance: string;
  url?: string;
}

// Trinidad & Tobago legal databases and resources
const TT_LEGAL_RESOURCES = [
  {
    name: 'Laws of Trinidad and Tobago',
    url: 'http://rgd.legalaffairs.gov.tt/laws/',
    description: 'Official consolidated laws',
  },
  {
    name: 'Trinidad and Tobago Judiciary',
    url: 'https://www.ttlawcourts.org/',
    description: 'Court decisions and practice directions',
  },
  {
    name: 'UWI Law Faculty',
    url: 'https://sta.uwi.edu/faculties/law/',
    description: 'Academic resources',
  },
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, documentType } = body;

    if (!query) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      );
    }

    const zai = await ZAI.create();

    // Build context from known legal references
    const legalContext = TT_LEGAL_REFERENCES.map(ref => 
      `- ${ref.name} (${ref.type}): ${ref.description}`
    ).join('\n');

    const systemPrompt = `${LEGAL_SYSTEM_CONTEXT}

You are a legal citation expert for Trinidad & Tobago law. Find relevant citations including:
1. Statutes and Acts
2. Case law (local and Privy Council)
3. Court Rules and Practice Directions
4. Secondary sources

Trinidad & Tobago Legal References:
${legalContext}

Available Legal Resources:
${TT_LEGAL_RESOURCES.map(r => `- ${r.name}: ${r.url} - ${r.description}`).join('\n')}

Always provide accurate citations in proper legal format.`;

    const userPrompt = `Find legal citations relevant to the following query for Trinidad & Tobago:

Query: ${query}
${documentType ? `Document Type: ${documentType}` : ''}

Provide citations in this exact JSON format:
{
  "citations": [
    {
      "id": "unique-id",
      "type": "statute|case|rule",
      "name": "Full name of the statute, case, or rule",
      "reference": "Full citation in proper legal format",
      "relevance": "Why this citation is relevant to the query",
      "url": "Optional URL to the source if available"
    }
  ]
}

Provide at least 3-5 relevant citations. Focus on primary sources (statutes and cases).`;

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
      max_tokens: 2500,
    });

    const responseText = completion.choices[0]?.message?.content || '';

    // Parse the JSON response
    let citations: CitationReference[];
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        citations = parsed.citations || [];
      } else {
        throw new Error('No valid JSON found in response');
      }
    } catch {
      // Fallback citations
      citations = [
        {
          id: '1',
          type: 'statute',
          name: 'Civil Procedure Rules 2016',
          reference: 'Civil Procedure Rules 2016, Trinidad and Tobago',
          relevance: 'Governs civil litigation procedure in the High Court',
          url: 'https://www.ttlawcourts.org/',
        },
      ];
    }

    // Ensure unique IDs
    citations = citations.map((c, i) => ({
      ...c,
      id: c.id || `citation-${i + 1}`,
    }));

    return NextResponse.json({
      success: true,
      citations,
      query,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error finding citations:', error);
    return NextResponse.json(
      { error: 'Failed to find citations', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
