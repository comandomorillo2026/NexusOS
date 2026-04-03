import { NextResponse } from 'next/server';
import { FilingManager } from '@/lib/insurance/filing-generator';
import { ComplianceMonitor } from '@/lib/insurance/compliance-monitor';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { filingId, submittedBy } = body;

    if (!filingId) {
      return NextResponse.json(
        { error: 'Filing ID is required' },
        { status: 400 }
      );
    }

    const filing = FilingManager.getFiling(filingId);
    if (!filing) {
      return NextResponse.json(
        { error: 'Filing not found', id: filingId },
        { status: 404 }
      );
    }

    // Check if filing is approved
    if (filing.status !== 'APPROVED') {
      return NextResponse.json(
        { error: 'Filing must be approved before submission', status: filing.status },
        { status: 400 }
      );
    }

    // Check electronic signature
    if (!filing.electronicSignature) {
      return NextResponse.json(
        { error: 'Electronic signature is required before submission' },
        { status: 400 }
      );
    }

    try {
      // Submit to regulator
      const result = FilingManager.submitToRegulator(filingId, submittedBy || 'system');

      // Mark filing as submitted in compliance monitor
      ComplianceMonitor.markFilingSubmitted(
        filing.jurisdictionCode,
        filing.filingRequirementId,
        submittedBy || 'system'
      );

      return NextResponse.json({
        success: true,
        data: {
          filing: result,
          submittedAt: result.metadata.submittedAt,
          documents: result.documents.map(d => ({
            format: d.format,
            filename: d.filename,
            mimeType: d.mimeType,
            checksum: d.checksum,
          })),
        },
        message: `Filing submitted successfully to regulator`,
      });
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Failed to submit filing' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error submitting filing:', error);
    return NextResponse.json(
      { error: 'Failed to submit filing' },
      { status: 500 }
    );
  }
}
