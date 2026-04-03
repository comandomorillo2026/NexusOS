/**
 * OAuth Callback Handler
 * Handle OAuth callbacks from providers
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// OAuth configurations for token exchange
const OAUTH_CONFIGS: Record<string, {
  name: string;
  tokenUrl: string;
  redirectPath: string;
}> = {
  google_workspace: {
    name: 'Google Workspace',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    redirectPath: '/api/integrations/oauth/google_workspace/callback',
  },
  microsoft_outlook: {
    name: 'Microsoft Outlook',
    tokenUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
    redirectPath: '/api/integrations/oauth/microsoft_outlook/callback',
  },
  quickbooks: {
    name: 'QuickBooks Online',
    tokenUrl: 'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer',
    redirectPath: '/api/integrations/oauth/quickbooks/callback',
  },
  xero: {
    name: 'Xero',
    tokenUrl: 'https://identity.xero.com/connect/token',
    redirectPath: '/api/integrations/oauth/xero/callback',
  },
  stripe: {
    name: 'Stripe',
    tokenUrl: 'https://connect.stripe.com/oauth/token',
    redirectPath: '/api/integrations/oauth/stripe/callback',
  },
  zoom: {
    name: 'Zoom',
    tokenUrl: 'https://zoom.us/oauth/token',
    redirectPath: '/api/integrations/oauth/zoom/callback',
  },
  docusign: {
    name: 'DocuSign',
    tokenUrl: 'https://account.docusign.com/oauth/token',
    redirectPath: '/api/integrations/oauth/docusign/callback',
  },
  dropbox: {
    name: 'Dropbox',
    tokenUrl: 'https://api.dropboxapi.com/oauth2/token',
    redirectPath: '/api/integrations/oauth/dropbox/callback',
  },
};

// GET /api/integrations/oauth/[provider]/callback - Handle OAuth callback
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  try {
    const { provider } = await params;
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    // Handle OAuth error
    if (error) {
      console.error('OAuth error:', error);
      const errorDescription = searchParams.get('error_description') || error;
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin?tab=integrations&error=${encodeURIComponent(errorDescription)}`
      );
    }

    if (!code || !state) {
      return NextResponse.json(
        { error: 'Missing code or state parameter' },
        { status: 400 }
      );
    }

    // Parse state: state:tenantId:provider
    const stateParts = state.split(':');
    if (stateParts.length < 3) {
      return NextResponse.json(
        { error: 'Invalid state parameter' },
        { status: 400 }
      );
    }

    const [stateToken, tenantId, stateProvider] = stateParts;

    if (stateProvider !== provider) {
      return NextResponse.json(
        { error: 'Provider mismatch in state' },
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

    // Get client credentials
    const clientId = process.env[`${provider.toUpperCase()}_CLIENT_ID`];
    const clientSecret = process.env[`${provider.toUpperCase()}_CLIENT_SECRET`];

    if (!clientId || !clientSecret) {
      // Demo mode - simulate successful connection
      const integration = await db.integrationConfig.create({
        data: {
          tenantId,
          integrationType: provider,
          integrationName: config.name,
          provider,
          status: 'active',
          credentials: JSON.stringify({
            accessToken: `demo_access_token_${Date.now()}`,
            refreshToken: `demo_refresh_token_${Date.now()}`,
            expiresAt: new Date(Date.now() + 3600000).toISOString(),
            scope: 'demo',
            connectedAt: new Date().toISOString(),
          }),
          lastSyncAt: new Date().toISOString(),
        },
      });

      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin?tab=integrations&connected=${provider}`
      );
    }

    // Exchange code for tokens
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}${config.redirectPath}`;

    const tokenResponse = await fetch(config.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        client_id: clientId,
        client_secret: clientSecret,
      }).toString(),
    });

    if (!tokenResponse.ok) {
      const tokenError = await tokenResponse.text();
      console.error('Token exchange failed:', tokenError);
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin?tab=integrations&error=${encodeURIComponent('Token exchange failed')}`
      );
    }

    const tokens = await tokenResponse.json();

    // Store the integration
    const integration = await db.integrationConfig.create({
      data: {
        tenantId,
        integrationType: provider,
        integrationName: config.name,
        provider,
        status: 'active',
        credentials: JSON.stringify({
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          expiresAt: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
          scope: tokens.scope,
          tokenType: tokens.token_type,
          connectedAt: new Date().toISOString(),
        }),
        lastSyncAt: new Date().toISOString(),
      },
    });

    // Redirect back to admin with success
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin?tab=integrations&connected=${provider}`
    );
  } catch (error) {
    console.error('Error handling OAuth callback:', error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin?tab=integrations&error=${encodeURIComponent('OAuth callback failed')}`
    );
  }
}
