import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'nexusos-client-portal-secret-key-2024';

async function verifyToken(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  try {
    return jwt.verify(token, JWT_SECRET) as {
      accessId: string;
      caseId: string;
      clientId: string;
      tenantId: string;
      permissions: string;
      type: string;
    };
  } catch {
    return null;
  }
}

interface RouteParams {
  params: Promise<{
    documentId: string;
  }>;
}

// GET - Download document
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { documentId } = await params;
    const tokenData = await verifyToken(request);

    if (!tokenData) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized access' },
        { status: 401 }
      );
    }

    // Check permissions
    const permissions = tokenData.permissions.split(',');
    if (!permissions.includes('view_docs')) {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      );
    }

    // Get document
    const document = await db.lawDocument.findFirst({
      where: {
        id: documentId,
        caseId: tokenData.caseId,
        isDeleted: false,
      },
    });

    if (!document) {
      return NextResponse.json(
        { success: false, error: 'Document not found' },
        { status: 404 }
      );
    }

    // In a real implementation, you would stream the file from storage
    // For now, return the file URL for download
    return NextResponse.json({
      success: true,
      document: {
        id: document.id,
        name: document.name,
        fileUrl: document.fileUrl,
        mimeType: document.mimeType,
        fileSize: document.fileSize,
      },
    });
  } catch (error) {
    console.error('Get document error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve document' },
      { status: 500 }
    );
  }
}
