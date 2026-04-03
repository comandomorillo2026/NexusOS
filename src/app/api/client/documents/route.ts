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

// POST - Upload document
export async function POST(request: NextRequest) {
  try {
    const tokenData = await verifyToken(request);

    if (!tokenData) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized access' },
        { status: 401 }
      );
    }

    // Check permissions
    const permissions = tokenData.permissions.split(',');
    if (!permissions.includes('upload_docs')) {
      return NextResponse.json(
        { success: false, error: 'Upload permission denied' },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const category = formData.get('category') as string || 'other';
    const description = formData.get('description') as string || '';

    if (!files || files.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No files provided' },
        { status: 400 }
      );
    }

    // Get case info for tenant
    const caseData = await db.lawCase.findFirst({
      where: { id: tokenData.caseId },
      select: { tenantId: true, LawClient: { select: { fullName: true } } },
    });

    if (!caseData) {
      return NextResponse.json(
        { success: false, error: 'Case not found' },
        { status: 404 }
      );
    }

    const uploadedDocuments = [];

    for (const file of files) {
      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        continue; // Skip files that are too large
      }

      // In a real implementation, upload to cloud storage
      // For now, we'll just create the database record
      const fileUrl = `/uploads/client-documents/${Date.now()}-${file.name}`;

      const document = await db.lawDocument.create({
        data: {
          tenantId: caseData.tenantId,
          caseId: tokenData.caseId,
          name: file.name,
          description: description,
          category: category,
          fileUrl: fileUrl,
          fileSize: file.size,
          mimeType: file.type || 'application/octet-stream',
          documentDate: new Date().toISOString().split('T')[0],
          status: 'draft',
          createdBy: `client:${tokenData.clientId}`,
        },
      });

      uploadedDocuments.push(document);

      // Create activity log
      await db.activityLog.create({
        data: {
          tenantId: caseData.tenantId,
          userId: tokenData.clientId,
          userEmail: '',
          userName: caseData.LawClient?.fullName || 'Client',
          action: 'UPLOAD_DOCUMENT',
          entityType: 'LawDocument',
          entityId: document.id,
          description: `Client uploaded document: ${file.name}`,
        },
      });
    }

    return NextResponse.json({
      success: true,
      documents: uploadedDocuments,
      message: `Successfully uploaded ${uploadedDocuments.length} document(s)`,
    });
  } catch (error) {
    console.error('Upload document error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to upload documents' },
      { status: 500 }
    );
  }
}
