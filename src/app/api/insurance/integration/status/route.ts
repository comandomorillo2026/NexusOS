/**
 * API Routes for Legacy System Integration - Status
 * GET: Get integration status and metrics
 */

import { NextRequest, NextResponse } from 'next/server';
import { getIntegrationFramework } from '@/lib/insurance/integration-framework';
import { getEntityMappingService } from '@/lib/insurance/legacy-mapping';

// GET /api/insurance/integration/status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const integrationId = searchParams.get('integrationId');
    const includeAudit = searchParams.get('includeAudit') === 'true';
    const auditLimit = parseInt(searchParams.get('auditLimit') || '50');

    const framework = getIntegrationFramework();
    const mappingService = getEntityMappingService();

    // If specific integration requested
    if (integrationId) {
      const status = framework.getIntegrationStatus(integrationId);

      if (!status) {
        return NextResponse.json(
          {
            success: false,
            error: `Integration not found: ${integrationId}`,
          },
          { status: 404 }
        );
      }

      // Test connection if connected
      const adapter = framework.getAdapter(integrationId);
      let connectionTest: { success: boolean; latency: number; error?: string } | undefined;
      if (adapter) {
        connectionTest = await adapter.testConnection();
      }

      // Get audit log if requested
      let auditLog: Awaited<ReturnType<typeof framework.getAuditLog>> | undefined;
      if (includeAudit) {
        auditLog = framework.getAuditLog(integrationId, auditLimit);
      }

      // Get active sync operations
      const activeSyncs = framework.getActiveSyncOperations().filter(
        op => op.integrationId === integrationId
      );

      return NextResponse.json({
        success: true,
        data: {
          config: {
            id: status.config.id,
            name: status.config.name,
            type: status.config.type,
            enabled: status.config.enabled,
          },
          connection: {
            status: status.status?.status || 'disconnected',
            lastConnected: status.status?.lastConnected,
            latency: status.status?.latency,
            lastError: status.status?.lastError,
          },
          connectionTest,
          activeSyncs: activeSyncs.map(sync => ({
            syncId: sync.id,
            entityType: sync.entityType,
            direction: sync.direction,
            status: sync.status,
            progress: sync.totalRecords > 0
              ? (sync.processedRecords / sync.totalRecords) * 100
              : 0,
          })),
          auditLog,
        },
      });
    }

    // Return overall status
    const integrations = framework.getAllIntegrations();
    const activeSyncs = framework.getActiveSyncOperations();

    // Calculate overall metrics
    const metrics = {
      totalIntegrations: integrations.length,
      activeIntegrations: integrations.filter(i => i.enabled).length,
      connectedIntegrations: 0,
      disconnectedIntegrations: 0,
      errorIntegrations: 0,
      activeSyncOperations: activeSyncs.length,
    };

    // Count by status
    for (const integration of integrations) {
      const status = framework.getIntegrationStatus(integration.id);
      const connectionStatus = status?.status?.status;

      if (connectionStatus === 'connected') {
        metrics.connectedIntegrations++;
      } else if (connectionStatus === 'error') {
        metrics.errorIntegrations++;
      } else {
        metrics.disconnectedIntegrations++;
      }
    }

    // Get recent audit entries
    const recentAudit = includeAudit ? framework.getAuditLog(undefined, auditLimit) : null;

    // Get available mappings
    const mappings = mappingService.getAllMappings().map(m => ({
      name: m.name,
      sourceSystem: m.sourceSystem,
      sourceEntity: m.sourceEntity,
      targetEntity: m.targetEntity,
      fieldCount: m.fieldMappings.length,
    }));

    // Build integration summary
    const integrationSummary = await Promise.all(
      integrations.map(async (integration) => {
        const status = framework.getIntegrationStatus(integration.id);
        const adapter = framework.getAdapter(integration.id);
        let health = 'unknown';

        if (adapter) {
          try {
            const testResult = await adapter.testConnection();
            health = testResult.success ? 'healthy' : 'unhealthy';
          } catch {
            health = 'unhealthy';
          }
        }

        return {
          id: integration.id,
          name: integration.name,
          type: integration.type,
          enabled: integration.enabled,
          status: status?.status?.status || 'disconnected',
          health,
          lastConnected: status?.status?.lastConnected,
          latency: status?.status?.latency,
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: {
        metrics,
        integrations: integrationSummary,
        activeSyncOperations: activeSyncs.map(sync => ({
          syncId: sync.id,
          integrationId: sync.integrationId,
          entityType: sync.entityType,
          direction: sync.direction,
          status: sync.status,
          progress: sync.totalRecords > 0
            ? Math.round((sync.processedRecords / sync.totalRecords) * 100)
            : 0,
          startedAt: sync.startedAt,
        })),
        availableMappings: mappings,
        auditLog: recentAudit,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Error fetching integration status:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch status',
      },
      { status: 500 }
    );
  }
}

// PATCH /api/insurance/integration/status - Update integration status
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { integrationId, action } = body;

    if (!integrationId || !action) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: integrationId, action',
        },
        { status: 400 }
      );
    }

    const framework = getIntegrationFramework();
    const status = framework.getIntegrationStatus(integrationId);

    if (!status) {
      return NextResponse.json(
        {
          success: false,
          error: `Integration not found: ${integrationId}`,
        },
        { status: 404 }
      );
    }

    let result;
    switch (action) {
      case 'connect':
        result = await framework.connect(integrationId);
        return NextResponse.json({
          success: true,
          data: {
            integrationId,
            action: 'connect',
            status: result.status,
            latency: result.latency,
          },
        });

      case 'disconnect':
        await framework.disconnect(integrationId);
        return NextResponse.json({
          success: true,
          data: {
            integrationId,
            action: 'disconnect',
            status: 'disconnected',
          },
        });

      case 'test':
        const testResult = await framework.testConnection(integrationId);
        return NextResponse.json({
          success: true,
          data: {
            integrationId,
            action: 'test',
            success: testResult.success,
            latency: testResult.latency,
            error: testResult.error,
          },
        });

      default:
        return NextResponse.json(
          {
            success: false,
            error: `Unknown action: ${action}`,
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error updating integration status:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update status',
      },
      { status: 500 }
    );
  }
}
