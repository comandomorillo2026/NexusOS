import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/beauty/products - List products
// POST /api/beauty/products - Create product
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId');
    const category = searchParams.get('category');
    const lowStock = searchParams.get('lowStock');

    const where: any = { isActive: true };
    if (tenantId) where.tenantId = tenantId;
    if (category) where.category = category;

    let products = await db.beautyProduct.findMany({
      where,
      orderBy: { name: 'asc' },
    });

    // Filter low stock if requested
    if (lowStock === 'true') {
      products = products.filter(p => p.quantityInStock <= (p.reorderLevel || 5));
    }

    return NextResponse.json({ success: true, products });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ success: false, error: 'Error al obtener productos' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tenantId, name, description, sku, barcode, category, brand, costPrice, sellingPrice, quantityInStock, reorderLevel } = body;

    const product = await db.beautyProduct.create({
      data: {
        tenantId,
        name,
        description,
        sku,
        barcode,
        category,
        brand,
        costPrice: parseFloat(costPrice),
        sellingPrice: parseFloat(sellingPrice),
        quantityInStock: parseInt(quantityInStock) || 0,
        reorderLevel: reorderLevel ? parseInt(reorderLevel) : null,
      },
    });

    return NextResponse.json({ success: true, product });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ success: false, error: 'Error al crear producto' }, { status: 500 });
  }
}
