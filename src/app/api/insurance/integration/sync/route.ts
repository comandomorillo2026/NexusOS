/**
 * API Routes for Legacy System Integration - Sync
 * POST: Trigger a synchronization operation
 */

import { NextRequest, NextResponse } from 'next/server';
import { getIntegrationFramework, SyncOptions } from '@/lib/insurance/integration-framework';
import { getEntityMappingService } from '@/lib/insurance/legacy-mapping';

// POST /api/insurance/integration/sync
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const framework = getIntegrationFramework();

    // Validate required fields
    if (!body.integrationId || !body.entityType || !body.direction) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: integrationId, entityType, direction',
        },
        { status: 400 }
      );
    }

    const { integrationId, entityType, direction, options } = body;

    // Get the adapter
    const adapter = framework.getAdapter(integrationId);
    if (!adapter) {
      return NextResponse.json(
        {
          success: false,
          error: `Integration not found: ${integrationId}`,
        },
        { status: 404 }
      );
    }

    // Get entity mapping if specified
    const mappingService = getEntityMappingService();
    const mapping = mappingService.getMapping(entityType);

    // Build sync options
    const syncOptions: SyncOptions = {
      batchSize: options?.batchSize || 100,
      filter: options?.filter,
      mapping: mapping ? {
        id: `mapping-${entityType}`,
        name: mapping.name,
        sourceFormat: mapping.sourceEntity,
        targetFormat: mapping.targetEntity,
        mappings: mapping.fieldMappings,
        transformations: [],
        validation: mapping.validations,
      } : undefined,
      dryRun: options?.dryRun || false,
    };

    // Execute sync based on direction
    let syncOperation;
    if (direction === 'import') {
      syncOperation = await framework.syncImport(integrationId, entityType, syncOptions);
    } else if (direction === 'export') {
      // For export, we need data
      if (!body.data || !Array.isArray(body.data)) {
        return NextResponse.json(
          {
            success: false,
            error: 'Export requires data array',
          },
          { status: 400 }
        );
      }
      syncOperation = await framework.syncExport(integrationId, entityType, body.data, syncOptions);
    } else if (direction === 'bidirectional') {
      // First import, then export
      const importResult = await framework.syncImport(integrationId, entityType, syncOptions);

      // Transform imported data and export back
      if (importResult.successCount > 0) {
        // In a real scenario, we'd transform and export
        syncOperation = importResult;
      } else {
        syncOperation = importResult;
      }
    } else {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid direction: ${direction}. Must be 'import', 'export', or 'bidirectional'`,
        },
        { status: 400 }
      );
    }

    // Get audit trail
    const auditLog = framework.getAuditLog(integrationId, 20);

    return NextResponse.json({
      success: syncOperation.status === 'completed' || syncOperation.status === 'partial',
      data: {
        syncId: syncOperation.id,
        integrationId: syncOperation.integrationId,
        direction: syncOperation.direction,
        entityType: syncOperation.entityType,
        status: syncOperation.status,
        totalRecords: syncOperation.totalRecords,
        processedRecords: syncOperation.processedRecords,
        successCount: syncOperation.successCount,
        errorCount: syncOperation.errorCount,
        startedAt: syncOperation.startedAt,
        completedAt: syncOperation.completedAt,
        errors: syncOperation.errors.slice(0, 10), // Return first 10 errors
      },
      auditTrail: auditLog.slice(-5),
    });
  } catch (error) {
    console.error('Error during sync:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Sync operation failed',
      },
      { status: 500 }
    );
  }
}

// GET /api/insurance/integration/sync?syncId=xxx
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const syncId = searchParams.get('syncId');

    if (!syncId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing syncId parameter',
        },
        { status: 400 }
      );
    }

    const framework = getIntegrationFramework();
    const syncOperation = framework.getSyncOperation(syncId);

    if (!syncOperation) {
      return NextResponse.json(
        {
          success: false,
          error: `Sync operation not found: ${syncId}`,
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        syncId: syncOperation.id,
        integrationId: syncOperation.integrationId,
        direction: syncOperation.direction,
        entityType: syncOperation.entityType,
        status: syncOperation.status,
        totalRecords: syncOperation.totalRecords,
        processedRecords: syncOperation.processedRecords,
        successCount: syncOperation.successCount,
        errorCount: syncOperation.errorCount,
        startedAt: syncOperation.startedAt,
        completedAt: syncOperation.completedAt,
        errors: syncOperation.errors,
      },
    });
  } catch (error) {
    console.error('Error fetching sync status:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch sync status',
      },
      { status: 500 }
    );
  }
}
