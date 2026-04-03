/**
 * API Routes for Legacy System Integration - Connections
 * GET: List all integration connections
 * POST: Create a new integration connection
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getIntegrationFramework,
  IntegrationConfig,
} from '@/lib/insurance/integration-framework';
import { createMainframeAdapter, MainframeConfig } from '@/lib/insurance/adapters/mainframe-adapter';
import { createAS400Adapter, AS400Config } from '@/lib/insurance/adapters/as400-adapter';
import { createFileAdapter, FileAdapterConfig } from '@/lib/insurance/adapters/file-adapter';
import { createAPIGatewayAdapter, APIGatewayConfig } from '@/lib/insurance/adapters/api-gateway';

// In-memory storage for demo (in production, this would be database-backed)
const connectionsStore = new Map<string, IntegrationConfig>();

// GET /api/insurance/integration/connections
export async function GET(request: NextRequest) {
  try {
    const framework = getIntegrationFramework();
    const integrations = framework.getAllIntegrations();

    // Get status for each integration
    const connectionsWithStatus = await Promise.all(
      integrations.map(async (config) => {
        const status = framework.getIntegrationStatus(config.id);
        return {
          ...config,
          connectionStatus: status?.status,
          lastConnected: status?.status?.lastConnected,
          latency: status?.status?.latency,
          lastError: status?.status?.lastError,
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: connectionsWithStatus,
      total: connectionsWithStatus.length,
    });
  } catch (error) {
    console.error('Error fetching connections:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch connections',
      },
      { status: 500 }
    );
  }
}

// POST /api/insurance/integration/connections
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const framework = getIntegrationFramework();

    // Validate required fields
    if (!body.name || !body.type) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: name, type',
        },
        { status: 400 }
      );
    }

    // Generate ID
    const id = `conn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Create integration config
    const config: IntegrationConfig = {
      id,
      name: body.name,
      type: body.type,
      description: body.description,
      connectionConfig: body.connectionConfig || {},
      retryPolicy: body.retryPolicy,
      timeout: body.timeout || 30000,
      enabled: body.enabled ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Register with framework
    await framework.registerIntegration(config);

    // Create and register appropriate adapter based on type
    const adapter = await createAdapterForType(config.type, body.connectionConfig);
    if (adapter) {
      framework.registerAdapter(id, adapter);
      await adapter.initialize();
    }

    // Store in memory
    connectionsStore.set(id, config);

    return NextResponse.json({
      success: true,
      data: {
        id,
        name: config.name,
        type: config.type,
        status: 'registered',
        createdAt: config.createdAt,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating connection:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create connection',
      },
      { status: 500 }
    );
  }
}

// Helper function to create adapter based on type
async function createAdapterForType(type: string, config: Record<string, unknown>) {
  switch (type) {
    case 'mainframe':
      return createMainframeAdapter(config as unknown as MainframeConfig);
    case 'as400':
      return createAS400Adapter(config as unknown as AS400Config);
    case 'file':
      return createFileAdapter(config as unknown as FileAdapterConfig);
    case 'api':
      return createAPIGatewayAdapter(config as unknown as APIGatewayConfig);
    default:
      console.warn(`Unknown adapter type: ${type}`);
      return null;
  }
}
