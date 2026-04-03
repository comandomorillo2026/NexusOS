import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';
import { LEGAL_SYSTEM_CONTEXT } from '@/lib/ai/legal-prompts';

interface DocumentDiff {
  additions: { line: number; content: string }[];
  deletions: { line: number; content: string }[];
  modifications: { line: number; old: string; new: string }[];
  summary: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { document1, document2 } = body;

    if (!document1 || !document2) {
      return NextResponse.json(
        { error: 'Both documents are required for comparison' },
        { status: 400 }
      );
    }

    const zai = await ZAI.create();

    // Truncate documents if too long
    const doc1 = document1.length > 4000 ? document1.substring(0, 4000) + '\n...[truncated]' : document1;
    const doc2 = document2.length > 4000 ? document2.substring(0, 4000) + '\n...[truncated]' : document2;

    const systemPrompt = `${LEGAL_SYSTEM_CONTEXT}

You are a legal document comparison expert for Trinidad & Tobago law. Compare two versions of documents and identify:
1. Additions (new content in the revised document)
2. Deletions (content removed from the original)
3. Modifications (content that was changed)
4. The legal significance of each change

Provide precise, detailed analysis of all differences.`;

    const userPrompt = `Compare the following two documents and provide a detailed analysis of the differences.

ORIGINAL DOCUMENT:
${doc1}

REVISED DOCUMENT:
${doc2}

Provide your comparison in this exact JSON format:
{
  "additions": [
    {
      "line": 1,
      "content": "The text that was added"
    }
  ],
  "deletions": [
    {
      "line": 1,
      "content": "The text that was removed"
    }
  ],
  "modifications": [
    {
      "line": 1,
      "old": "Original text",
      "new": "New text"
    }
  ],
  "summary": "A comprehensive summary of the changes, their legal significance, and any recommendations"
}

Focus on substantive legal changes, not minor formatting differences.`;

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
      max_tokens: 3000,
    });

    const responseText = completion.choices[0]?.message?.content || '';

    // Parse the JSON response
    let diff: DocumentDiff;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        diff = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No valid JSON found in response');
      }
    } catch {
      // Fallback
      diff = {
        additions: [],
        deletions: [],
        modifications: [],
        summary: responseText,
      };
    }

    return NextResponse.json({
      success: true,
      diff,
      timestamp: new Date().toISOString(),
      doc1Length: document1.length,
      doc2Length: document2.length,
    });
  } catch (error) {
    console.error('Error comparing documents:', error);
    return NextResponse.json(
      { error: 'Failed to compare documents', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
