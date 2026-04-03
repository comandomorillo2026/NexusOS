import { NextResponse } from 'next/server';
import {
  FilingManager,
  FilingGenerator,
  ValidationEngine,
  FilingData,
} from '@/lib/insurance/filing-generator';
import { getJurisdictionByCode, getFilingRequirement } from '@/lib/insurance/jurisdictions';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const jurisdictionCode = searchParams.get('jurisdiction');
    const filingId = searchParams.get('id');
    const status = searchParams.get('status');

    // Get specific filing by ID
    if (filingId) {
      const filing = FilingManager.getFiling(filingId);
      if (!filing) {
        return NextResponse.json(
          { error: 'Filing not found', id: filingId },
          { status: 404 }
        );
      }
      
      // Include summary
      const summary = FilingGenerator.generateFilingSummary(filing);
      
      return NextResponse.json({
        success: true,
        data: filing,
        summary,
      });
    }

    // Get filings by jurisdiction
    let filings: FilingData[];
    if (jurisdictionCode) {
      filings = FilingManager.getFilingsByJurisdiction(jurisdictionCode);
    } else {
      filings = FilingManager.getAllFilings();
    }

    // Filter by status if provided
    if (status) {
      filings = filings.filter(f => f.status === status);
    }

    // Sort by creation date (most recent first)
    filings.sort((a, b) => 
      b.metadata.createdAt.getTime() - a.metadata.createdAt.getTime()
    );

    return NextResponse.json({
      success: true,
      data: filings,
      count: filings.length,
    });
  } catch (error) {
    console.error('Error fetching filings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch filings' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, ...data } = body;

    // Create new filing
    if (action === 'create') {
      const { jurisdictionCode, filingRequirementId, reportingPeriod, createdBy, initialData } = data;

      // Validate jurisdiction and filing requirement
      const jurisdiction = getJurisdictionByCode(jurisdictionCode);
      if (!jurisdiction) {
        return NextResponse.json(
          { error: 'Invalid jurisdiction code', jurisdictionCode },
          { status: 400 }
        );
      }

      const filingReq = getFilingRequirement(jurisdictionCode, filingRequirementId);
      if (!filingReq) {
        return NextResponse.json(
          { error: 'Invalid filing requirement', filingRequirementId },
          { status: 400 }
        );
      }

      // Create filing
      const filing = FilingManager.createFiling(
        jurisdictionCode,
        filingRequirementId,
        reportingPeriod,
        createdBy || 'system'
      );

      // Add initial data if provided
      if (initialData && Object.keys(initialData).length > 0) {
        FilingManager.updateFiling(filing.id, initialData);
      }

      return NextResponse.json({
        success: true,
        data: filing,
        message: 'Filing created successfully',
      });
    }

    // Update filing data
    if (action === 'update') {
      const { filingId, data: filingData } = data;

      const filing = FilingManager.getFiling(filingId);
      if (!filing) {
        return NextResponse.json(
          { error: 'Filing not found', filingId },
          { status: 404 }
        );
      }

      const updatedFiling = FilingManager.updateFiling(filingId, filingData);
      const validationSummary = ValidationEngine.getValidationSummary(
        updatedFiling.validationResults || []
      );

      return NextResponse.json({
        success: true,
        data: updatedFiling,
        validation: validationSummary,
      });
    }

    // Submit for review
    if (action === 'submit-review') {
      const { filingId } = data;

      const filing = FilingManager.getFiling(filingId);
      if (!filing) {
        return NextResponse.json(
          { error: 'Filing not found', filingId },
          { status: 404 }
        );
      }

      try {
        const updatedFiling = FilingManager.submitForReview(filingId);
        return NextResponse.json({
          success: true,
          data: updatedFiling,
          message: 'Filing submitted for review',
        });
      } catch (error) {
        return NextResponse.json(
          { error: error instanceof Error ? error.message : 'Failed to submit filing' },
          { status: 400 }
        );
      }
    }

    // Approve filing
    if (action === 'approve') {
      const { filingId, approvedBy } = data;

      const filing = FilingManager.getFiling(filingId);
      if (!filing) {
        return NextResponse.json(
          { error: 'Filing not found', filingId },
          { status: 404 }
        );
      }

      try {
        const updatedFiling = FilingManager.approveFiling(filingId, approvedBy || 'system');
        return NextResponse.json({
          success: true,
          data: updatedFiling,
          message: 'Filing approved',
        });
      } catch (error) {
        return NextResponse.json(
          { error: error instanceof Error ? error.message : 'Failed to approve filing' },
          { status: 400 }
        );
      }
    }

    // Add electronic signature
    if (action === 'sign') {
      const { filingId, signer } = data;

      const filing = FilingManager.getFiling(filingId);
      if (!filing) {
        return NextResponse.json(
          { error: 'Filing not found', filingId },
          { status: 404 }
        );
      }

      const signature = FilingGenerator.createElectronicSignature(
        signer.name,
        signer.title,
        signer.email,
        signer.certificateId || 'CERT-DEFAULT',
        signer.ipAddress || '0.0.0.0'
      );

      const updatedFiling = FilingManager.addElectronicSignature(filingId, signature);

      return NextResponse.json({
        success: true,
        data: updatedFiling,
        message: 'Electronic signature added',
      });
    }

    // Generate document
    if (action === 'generate') {
      const { filingId, format } = data;

      const filing = FilingManager.getFiling(filingId);
      if (!filing) {
        return NextResponse.json(
          { error: 'Filing not found', filingId },
          { status: 404 }
        );
      }

      try {
        const document = FilingGenerator.generateDocument(
          filing.jurisdictionCode,
          filing.filingRequirementId,
          filing.data,
          format || 'XML'
        );

        return NextResponse.json({
          success: true,
          data: {
            id: filingId,
            document: {
              format: document.format,
              filename: document.filename,
              mimeType: document.mimeType,
              generatedAt: document.generatedAt,
              checksum: document.checksum,
              // Don't include full content in response for large files
              contentLength: typeof document.content === 'string' 
                ? document.content.length 
                : document.content.length,
            },
          },
        });
      } catch (error) {
        return NextResponse.json(
          { error: error instanceof Error ? error.message : 'Failed to generate document' },
          { status: 400 }
        );
      }
    }

    // Get pre-submission checklist
    if (action === 'checklist') {
      const { filingId } = data;

      const filing = FilingManager.getFiling(filingId);
      if (!filing) {
        return NextResponse.json(
          { error: 'Filing not found', filingId },
          { status: 404 }
        );
      }

      const checklist = FilingGenerator.generatePreSubmissionChecklist(
        filing.jurisdictionCode,
        filing.filingRequirementId,
        filing
      );

      return NextResponse.json({
        success: true,
        data: checklist,
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error processing filing request:', error);
    return NextResponse.json(
      { error: 'Failed to process filing request' },
      { status: 500 }
    );
  }
}
