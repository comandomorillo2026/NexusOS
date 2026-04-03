import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST - Bulk operations on time entries
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tenantId, operation, timeEntryIds, data } = body;

    if (!tenantId || !operation || !timeEntryIds || !Array.isArray(timeEntryIds)) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    let result;

    switch (operation) {
      case 'approve':
        // Bulk approve time entries
        for (const entryId of timeEntryIds) {
          const existingApproval = await db.lawTimeEntryApproval.findUnique({
            where: { timeEntryId: entryId },
          });

          if (existingApproval) {
            await db.lawTimeEntryApproval.update({
              where: { timeEntryId: entryId },
              data: {
                status: 'approved',
                reviewedBy: data?.reviewedBy,
                reviewedByName: data?.reviewedByName,
                reviewedAt: new Date().toISOString(),
                approvalNotes: data?.notes,
              },
            });
          } else {
            await db.lawTimeEntryApproval.create({
              data: {
                tenantId,
                timeEntryId: entryId,
                submittedBy: data?.reviewedBy || 'system',
                submittedByName: data?.reviewedByName,
                submittedAt: new Date().toISOString(),
                status: 'approved',
                reviewedBy: data?.reviewedBy,
                reviewedByName: data?.reviewedByName,
                reviewedAt: new Date().toISOString(),
                approvalNotes: data?.notes,
              },
            });
          }
        }
        result = { count: timeEntryIds.length };
        break;

      case 'reject':
        // Bulk reject time entries
        for (const entryId of timeEntryIds) {
          const existingApproval = await db.lawTimeEntryApproval.findUnique({
            where: { timeEntryId: entryId },
          });

          if (existingApproval) {
            await db.lawTimeEntryApproval.update({
              where: { timeEntryId: entryId },
              data: {
                status: 'rejected',
                reviewedBy: data?.reviewedBy,
                reviewedByName: data?.reviewedByName,
                reviewedAt: new Date().toISOString(),
                rejectionReason: data?.reason,
              },
            });
          } else {
            await db.lawTimeEntryApproval.create({
              data: {
                tenantId,
                timeEntryId: entryId,
                submittedBy: data?.reviewedBy || 'system',
                submittedAt: new Date().toISOString(),
                status: 'rejected',
                reviewedBy: data?.reviewedBy,
                reviewedByName: data?.reviewedByName,
                reviewedAt: new Date().toISOString(),
                rejectionReason: data?.reason,
              },
            });
          }
        }
        result = { count: timeEntryIds.length };
        break;

      case 'toggle_billable':
        // Toggle billable status
        result = await db.lawTimeEntry.updateMany({
          where: {
            id: { in: timeEntryIds },
            tenantId,
          },
          data: {
            isBillable: data?.isBillable ?? true,
          },
        });
        break;

      case 'update_rate':
        // Update hourly rate for entries
        const entries = await db.lawTimeEntry.findMany({
          where: {
            id: { in: timeEntryIds },
            tenantId,
          },
        });

        for (const entry of entries) {
          const newAmount = entry.isBillable && entry.durationMinutes
            ? (entry.durationMinutes / 60) * (data?.rate || 0)
            : 0;
          
          await db.lawTimeEntry.update({
            where: { id: entry.id },
            data: {
              billableRate: data?.rate,
              billableAmount: newAmount,
            },
          });
        }
        result = { count: entries.length };
        break;

      case 'delete':
        // Delete entries
        result = await db.lawTimeEntry.deleteMany({
          where: {
            id: { in: timeEntryIds },
            tenantId,
          },
        });
        break;

      case 'merge':
        // Merge multiple time entries into one
        const entriesToMerge = await db.lawTimeEntry.findMany({
          where: {
            id: { in: timeEntryIds },
            tenantId,
          },
          orderBy: { date: 'asc' },
        });

        if (entriesToMerge.length < 2) {
          return NextResponse.json(
            { success: false, error: 'Need at least 2 entries to merge' },
            { status: 400 }
          );
        }

        const totalMinutes = entriesToMerge.reduce((sum, e) => sum + (e.durationMinutes || 0), 0);
        const totalAmount = entriesToMerge.reduce((sum, e) => sum + (e.billableAmount || 0), 0);
        const firstEntry = entriesToMerge[0];

        // Create merged entry
        const mergedEntry = await db.lawTimeEntry.create({
          data: {
            tenantId,
            caseId: firstEntry.caseId,
            attorneyId: firstEntry.attorneyId,
            date: firstEntry.date,
            startTime: firstEntry.startTime,
            durationMinutes: totalMinutes,
            description: entriesToMerge.map(e => e.description).filter(Boolean).join('\n'),
            activityCode: data?.activityCode || firstEntry.activityCode,
            billableRate: data?.rate || firstEntry.billableRate,
            billableAmount: totalAmount,
            isBillable: data?.isBillable ?? firstEntry.isBillable,
            isBilled: false,
          },
        });

        // Delete original entries
        await db.lawTimeEntry.deleteMany({
          where: {
            id: { in: timeEntryIds },
          },
        });

        result = { mergedEntry };
        break;

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid operation' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      data: result,
      message: `Successfully processed ${timeEntryIds.length} entries`,
    });
  } catch (error: unknown) {
    console.error('Error in bulk operation:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to process bulk operation';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
