import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// LEDES 1998B format field definitions
const LEDES_FIELDS = [
  'INVOICE_DATE',
  'INVOICE_NUMBER',
  'CLIENT_ID',
  'LAW_FIRM_MATTER_ID',
  'INVOICE_TOTAL',
  'BILLING_START_DATE',
  'BILLING_END_DATE',
  'INVOICE_DESCRIPTION',
  'LINE_ITEM_NUMBER',
  'EXP_FEE_INV_ADJ_TYPE',
  'LINE_ITEM_NUMBER_OF_UNITS',
  'LINE_ITEM_ADJUSTMENT_AMOUNT',
  'LINE_ITEM_TOTAL',
  'LINE_ITEM_DATE',
  'LINE_ITEM_TASK_CODE',
  'LINE_ITEM_EXPENSE_CODE',
  'LINE_ITEM_ACTIVITY_CODE',
  'TIMEKEEPER_ID',
  'LINE_ITEM_UNIT_COST',
  'LINE_ITEM_TIMEKEEPER_NAME',
  'LINE_ITEM_DESCRIPTION',
  'LAW_FIRM_ID',
  'LAW_FIRM_NAME',
  'CLIENT_NAME',
  'MATTER_NAME',
];

// POST - Generate LEDES export
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tenantId, timeEntryIds, clientId, caseId, format = 'LEDES1998B' } = body;

    if (!tenantId || !timeEntryIds || !Array.isArray(timeEntryIds)) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Fetch time entries
    const timeEntries = await db.lawTimeEntry.findMany({
      where: {
        id: { in: timeEntryIds },
        tenantId,
      },
      include: {
        case: {
          select: {
            caseNumber: true,
            title: true,
            clientName: true,
            clientId: true,
          },
        },
        attorney: {
          select: {
            fullName: true,
            barNumber: true,
          },
        },
      },
    });

    if (timeEntries.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No time entries found' },
        { status: 404 }
      );
    }

    // Get firm settings
    const settings = await db.lawSettings.findUnique({
      where: { tenantId },
    });

    // Generate export number
    const exportNumber = `LEDES-${Date.now()}`;

    // Calculate totals
    const totalMinutes = timeEntries.reduce((sum, e) => sum + (e.durationMinutes || 0), 0);
    const totalAmount = timeEntries.reduce((sum, e) => sum + (e.billableAmount || 0), 0);

    // Determine date range
    const dates = timeEntries.map((e) => e.date).sort();
    const startDate = dates[0];
    const endDate = dates[dates.length - 1];

    // Generate LEDES content
    let ledesContent = '';

    if (format === 'LEDES1998B') {
      // Header row
      ledesContent += LEDES_FIELDS.join('|') + '\n';

      // Line items
      timeEntries.forEach((entry, index) => {
        const row = [
          formatDate(new Date()), // INVOICE_DATE
          exportNumber, // INVOICE_NUMBER
          clientId || entry.case?.clientId || 'CLIENT001', // CLIENT_ID
          entry.case?.caseNumber || 'MATTER001', // LAW_FIRM_MATTER_ID
          totalAmount.toFixed(2), // INVOICE_TOTAL
          startDate, // BILLING_START_DATE
          endDate, // BILLING_END_DATE
          `Legal services for ${entry.case?.title || 'Matter'}`, // INVOICE_DESCRIPTION
          (index + 1).toString(), // LINE_ITEM_NUMBER
          'F', // EXP_FEE_INV_ADJ_TYPE (F = Fee)
          (entry.durationMinutes ? (entry.durationMinutes / 60).toFixed(2) : '0.00'), // LINE_ITEM_NUMBER_OF_UNITS
          '0.00', // LINE_ITEM_ADJUSTMENT_AMOUNT
          (entry.billableAmount || 0).toFixed(2), // LINE_ITEM_TOTAL
          entry.date, // LINE_ITEM_DATE
          mapActivityToTaskCode(entry.activityCode), // LINE_ITEM_TASK_CODE
          '', // LINE_ITEM_EXPENSE_CODE
          entry.activityCode?.toUpperCase() || 'A106', // LINE_ITEM_ACTIVITY_CODE
          entry.attorney?.barNumber || 'TK001', // TIMEKEEPER_ID
          (entry.billableRate || 0).toFixed(2), // LINE_ITEM_UNIT_COST
          entry.attorney?.fullName || 'Unknown Attorney', // LINE_ITEM_TIMEKEEPER_NAME
          entry.description?.replace(/\n/g, ' ') || '', // LINE_ITEM_DESCRIPTION
          settings?.taxId || 'FIRM001', // LAW_FIRM_ID
          settings?.firmName || 'Law Firm', // LAW_FIRM_NAME
          entry.case?.clientName || 'Client', // CLIENT_NAME
          entry.case?.title || 'Matter', // MATTER_NAME
        ];

        ledesContent += row.join('|') + '\n';
      });
    }

    // Save export record
    await db.lawLedesExport.create({
      data: {
        tenantId,
        exportNumber,
        exportDate: new Date().toISOString().split('T')[0],
        clientId,
        caseId,
        startDate,
        endDate,
        timeEntryIds: JSON.stringify(timeEntryIds),
        totalTime: totalMinutes,
        totalAmount,
        status: 'generated',
        format,
      },
    });

    // Return as downloadable file
    return new NextResponse(ledesContent, {
      headers: {
        'Content-Type': 'text/plain',
        'Content-Disposition': `attachment; filename="${exportNumber}.txt"`,
      },
    });
  } catch (error: unknown) {
    console.error('Error generating LEDES export:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate LEDES export';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

// GET - List LEDES exports
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const tenantId = searchParams.get('tenantId');

    if (!tenantId) {
      return NextResponse.json(
        { success: false, error: 'tenantId is required' },
        { status: 400 }
      );
    }

    const exports = await db.lawLedesExport.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    return NextResponse.json({
      success: true,
      data: exports,
    });
  } catch (error: unknown) {
    console.error('Error fetching LEDES exports:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch exports';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

// Helper functions
function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

function mapActivityToTaskCode(activityCode: string | null): string {
  const mapping: Record<string, string> = {
    research: 'A103',
    drafting: 'A101',
    meeting: 'A107',
    court: 'A109',
    calls: 'A106',
    review: 'A103',
    investigation: 'A104',
    negotiation: 'A108',
    consultation: 'A105',
    general: 'A100',
  };

  return mapping[activityCode || 'general'] || 'A100';
}
