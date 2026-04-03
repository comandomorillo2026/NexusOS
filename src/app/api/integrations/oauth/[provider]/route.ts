/**
 * OAuth Integration API Routes
 * Handle OAuth authorization for various providers
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import crypto from 'crypto';

// OAuth configurations for each provider
const OAUTH_CONFIGS: Record<string, {
  name: string;
  authUrl: string;
  tokenUrl: string;
  scope: string;
  clientId?: string;
  clientSecret?: string;
  redirectPath: string;
}> = {
  google_workspace: {
    name: 'Google Workspace',
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    scope: 'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/userinfo.profile',
    redirectPath: '/api/integrations/oauth/google_workspace/callback',
  },
  microsoft_outlook: {
    name: 'Microsoft Outlook',
    authUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
    tokenUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
    scope: 'openid profile email offline_access Calendars.ReadWrite Mail.ReadWrite',
    redirectPath: '/api/integrations/oauth/microsoft_outlook/callback',
  },
  quickbooks: {
    name: 'QuickBooks Online',
    authUrl: 'https://appcenter.intuit.com/connect/oauth2',
    tokenUrl: 'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer',
    scope: 'com.intuit.quickbooks.accounting',
    redirectPath: '/api/integrations/oauth/quickbooks/callback',
  },
  xero: {
    name: 'Xero',
    authUrl: 'https://login.xero.com/identity/connect/authorize',
    tokenUrl: 'https://identity.xero.com/connect/token',
    scope: 'openid profile email accounting.transactions accounting.contacts',
    redirectPath: '/api/integrations/oauth/xero/callback',
  },
  stripe: {
    name: 'Stripe',
    authUrl: 'https://connect.stripe.com/oauth/authorize',
    tokenUrl: 'https://connect.stripe.com/oauth/token',
    scope: 'read_write',
    redirectPath: '/api/integrations/oauth/stripe/callback',
  },
  zoom: {
    name: 'Zoom',
    authUrl: 'https://zoom.us/oauth/authorize',
    tokenUrl: 'https://zoom.us/oauth/token',
    scope: 'meeting:write meeting:read user:read',
    redirectPath: '/api/integrations/oauth/zoom/callback',
  },
  docusign: {
    name: 'DocuSign',
    authUrl: 'https://account.docusign.com/oauth/auth',
    tokenUrl: 'https://account.docusign.com/oauth/token',
    scope: 'signature',
    redirectPath: '/api/integrations/oauth/docusign/callback',
  },
  dropbox: {
    name: 'Dropbox',
    authUrl: 'https://www.dropbox.com/oauth2/authorize',
    tokenUrl: 'https://api.dropboxapi.com/oauth2/token',
    scope: 'files.content.write files.content.read',
    redirectPath: '/api/integrations/oauth/dropbox/callback',
  },
};

// Generate a secure state token
function generateState(): string {
  return crypto.randomBytes(32).toString('hex');
}

// GET /api/integrations/oauth/[provider] - Initiate OAuth flow
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  try {
    const { provider } = await params;
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId');

    if (!tenantId) {
      return NextResponse.json(
        { error: 'tenantId is required' },
        { status: 400 }
      );
    }

    const config = OAUTH_CONFIGS[provider];
    if (!config) {
      return NextResponse.json(
        { error: `Unknown OAuth provider: ${provider}` },
        { status: 400 }
      );
    }

    // Get client credentials from environment or database
    const clientId = process.env[`${provider.toUpperCase()}_CLIENT_ID`] || 'demo_client_id';
    const clientSecret = process.env[`${provider.toUpperCase()}_CLIENT_SECRET`] || 'demo_client_secret';

    if (!clientId || !clientSecret) {
      return NextResponse.json(
        { error: `OAuth not configured for provider: ${provider}` },
        { status: 400 }
      );
    }

    // Generate state for CSRF protection
    const state = generateState();
    
    // Store state in database for verification
    await db.integrationConfig.create({
      data: {
        tenantId,
        integrationType: 'oauth',
        integrationName: config.name,
        provider,
        status: 'pending',
        credentials: JSON.stringify({
          state,
          clientId,
          initiatedAt: new Date().toISOString(),
        }),
      },
    });

    // Build authorization URL
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}${config.redirectPath}`;
    
    const authParams = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: config.scope,
      state: `${state}:${tenantId}:${provider}`,
      access_type: 'offline', // For refresh tokens
      prompt: 'consent', // Force consent to get refresh token
    });

    const authUrl = `${config.authUrl}?${authParams.toString()}`;

    // For development/demo, return the URL instead of redirecting
    if (process.env.NODE_ENV === 'development' || clientId === 'demo_client_id') {
      return NextResponse.json({
        authUrl,
        provider,
        state,
        message: 'OAuth flow initiated (demo mode)',
      });
    }

    // Redirect to OAuth provider
    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error('Error initiating OAuth:', error);
    return NextResponse.json(
      { error: 'Failed to initiate OAuth flow' },
      { status: 500 }
    );
  }
}

// DELETE /api/integrations/oauth/[provider] - Disconnect integration
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  try {
    const { provider } = await params;
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId');

    if (!tenantId) {
      return NextResponse.json(
        { error: 'tenantId is required' },
        { status: 400 }
      );
    }

    // Find and delete the integration
    const integration = await db.integrationConfig.findFirst({
      where: {
        tenantId,
        provider,
        integrationType: 'oauth',
      },
    });

    if (!integration) {
      return NextResponse.json(
        { error: 'Integration not found' },
        { status: 404 }
      );
    }

    // Delete the integration
    await db.integrationConfig.delete({
      where: { id: integration.id },
    });

    return NextResponse.json({
      success: true,
      message: `Disconnected ${provider}`,
    });
  } catch (error) {
    console.error('Error disconnecting OAuth:', error);
    return NextResponse.json(
      { error: 'Failed to disconnect integration' },
      { status: 500 }
    );
  }
}
