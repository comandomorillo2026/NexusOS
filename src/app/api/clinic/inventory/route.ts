import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/clinic/inventory - List inventory items
// POST /api/clinic/inventory - Create inventory item
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId');
    const category = searchParams.get('category');
    const lowStock = searchParams.get('lowStock');

    const where: any = { isActive: true };
    if (tenantId) where.tenantId = tenantId;
    if (category) where.category = category;

    let items = await db.inventoryItem.findMany({
      where,
      orderBy: { name: 'asc' },
    });

    // Filter low stock if requested
    if (lowStock === 'true') {
      items = items.filter(item => item.quantityInStock <= (item.reorderLevel || 5));
    }

    return NextResponse.json({ success: true, items });
  } catch (error) {
    console.error('Error fetching inventory:', error);
    return NextResponse.json({ success: false, error: 'Error al obtener inventario' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      tenantId,
      sku,
      name,
      description,
      category,
      unitOfMeasure,
      quantityInStock,
      reorderLevel,
      costPrice,
      sellingPrice,
      location,
      supplier,
      expiryDate,
      lotNumber,
    } = body;

    const item = await db.inventoryItem.create({
      data: {
        tenantId,
        sku,
        name,
        description,
        category,
        unitOfMeasure,
        quantityInStock: parseInt(quantityInStock) || 0,
        reorderLevel: reorderLevel ? parseInt(reorderLevel) : null,
        costPrice: costPrice ? parseFloat(costPrice) : null,
        sellingPrice: sellingPrice ? parseFloat(sellingPrice) : null,
        location,
        supplier,
        expiryDate,
        lotNumber,
      },
    });

    return NextResponse.json({ success: true, item });
  } catch (error) {
    console.error('Error creating inventory item:', error);
    return NextResponse.json({ success: false, error: 'Error al crear item de inventario' }, { status: 500 });
  }
}
