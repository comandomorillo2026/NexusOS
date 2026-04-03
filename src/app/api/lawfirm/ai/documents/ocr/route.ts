import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { file, fileName, fileType } = body;

    if (!file) {
      return NextResponse.json(
        { error: 'File data is required' },
        { status: 400 }
      );
    }

    // For OCR, we use the AI to process the image/PDF content
    // The file should be a base64 encoded string
    const zai = await ZAI.create();

    // Determine if it's an image or PDF
    const isImage = fileType?.startsWith('image/');
    const isPDF = fileType === 'application/pdf';

    if (!isImage && !isPDF) {
      return NextResponse.json(
        { error: 'Unsupported file type. Please upload an image or PDF.' },
        { status: 400 }
      );
    }

    // For PDFs, we need to extract text differently
    // For images, we can use the vision capabilities
    let extractedText = '';

    if (isImage) {
      // Use vision model for images
      try {
        const completion = await zai.chat.completions.create({
          messages: [
            {
              role: 'system',
              content: `You are an OCR (Optical Character Recognition) system specialized in reading legal documents from Trinidad & Tobago. 
              
Your task is to:
1. Extract ALL text from the image accurately
2. Preserve formatting and structure as much as possible
3. Include all names, dates, amounts, and legal terms
4. Note any unclear or illegible sections with [ILLEGIBLE]

Output only the extracted text, no explanations.`,
            },
            {
              role: 'user',
              content: [
                {
                  type: 'image',
                  image: file,
                },
                {
                  type: 'text',
                  text: 'Extract all text from this document image. Preserve formatting and structure.',
                },
              ] as unknown as string,
            },
          ],
          temperature: 0.1,
          max_tokens: 4000,
        });

        extractedText = completion.choices[0]?.message?.content || '';
      } catch (visionError) {
        console.error('Vision API error:', visionError);
        // Fallback for vision errors
        extractedText = `[OCR processing failed for image. Please try again or use a different image format.

Error: ${visionError instanceof Error ? visionError.message : 'Unknown error'}]`;
      }
    } else {
      // For PDFs, we would typically use a PDF parsing library
      // Since we're using AI SDK, we'll process as text if available
      // In production, you'd want to use a proper PDF parsing library
      
      // Simulated response for PDF - in production use pdf-parse or similar
      extractedText = `[PDF processing requires server-side PDF parsing.

For production implementation:
1. Use pdf-parse or pdfjs-dist for text extraction
2. For scanned PDFs, convert to images first
3. Then use vision API for OCR

File: ${fileName}
Type: ${fileType}]`;

      // If the file contains embedded text data (base64 text)
      try {
        const decoded = Buffer.from(file.split(',')[1] || file, 'base64').toString('utf-8');
        if (decoded && decoded.length > 100 && !decoded.includes('PDF')) {
          extractedText = decoded.substring(0, 8000);
        }
      } catch {
        // Not a text file, continue with placeholder
      }
    }

    // Post-process the extracted text
    const processedText = extractedText
      .replace(/\[ILLEGIBLE\]/g, '[?]') // Standardize illegible markers
      .trim();

    return NextResponse.json({
      success: true,
      text: processedText,
      fileName,
      fileType,
      timestamp: new Date().toISOString(),
      characterCount: processedText.length,
      wordCount: processedText.split(/\s+/).filter(Boolean).length,
    });
  } catch (error) {
    console.error('Error processing document:', error);
    return NextResponse.json(
      { error: 'Failed to process document', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
