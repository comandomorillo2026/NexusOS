import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/pharmacy/inventory - Get inventory items
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const storageZone = searchParams.get('storageZone') || '';
    const lowStock = searchParams.get('lowStock') === 'true';
    
    const inventory = await db.pharmacyInventory.findMany({
      where: {
        AND: [
          search ? {
            OR: [
              { drugName: { contains: search, mode: 'insensitive' } },
              { ndc: { contains: search } },
              { lotNumber: { contains: search, mode: 'insensitive' } },
              { batchNumber: { contains: search, mode: 'insensitive' } },
            ]
          } : {},
          status ? { status } : {},
          storageZone ? { storageZone } : {},
        ]
      },
      include: {
        PharmacyDrug: {
          select: {
            drugName: true,
            brandName: true,
            therapeuticClass: true,
            controlledSubstance: true,
          }
        }
      },
      orderBy: { drugName: 'asc' },
      take: 100
    });

    // Calculate status based on quantity and reorder point
    const processedInventory = inventory.map(item => {
      let calculatedStatus = item.status;
      if (item.quantityRemaining === 0) {
        calculatedStatus = 'out_of_stock';
      } else if (item.quantityRemaining <= (item.reorderPoint || 0)) {
        calculatedStatus = 'low_stock';
      }
      
      return {
        ...item,
        calculatedStatus,
        needsReorder: item.quantityRemaining <= (item.reorderPoint || 0)
      };
    });

    // Filter for low stock if requested
    const filteredInventory = lowStock 
      ? processedInventory.filter(item => item.needsReorder)
      : processedInventory;

    return NextResponse.json({ inventory: filteredInventory });
  } catch (error) {
    console.error('Error fetching inventory:', error);
    return NextResponse.json({ error: 'Failed to fetch inventory' }, { status: 500 });
  }
}

// POST /api/pharmacy/inventory - Receive new stock
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const inventory = await db.pharmacyInventory.create({
      data: {
        tenantId: body.tenantId || 'default',
        drugId: body.drugId,
        ndc: body.ndc,
        drugName: body.drugName,
        batchNumber: body.batchNumber,
        lotNumber: body.lotNumber,
        expiryDate: body.expiryDate,
        quantityReceived: body.quantityReceived,
        quantityRemaining: body.quantityReceived,
        location: body.location,
        storageZone: body.storageZone,
        minStockLevel: body.minStockLevel,
        maxStockLevel: body.maxStockLevel,
        reorderPoint: body.reorderPoint,
        reorderQuantity: body.reorderQuantity,
        unitCost: body.unitCost,
        totalCost: body.unitCost ? body.unitCost * body.quantityReceived : null,
        supplierName: body.supplierName,
        purchaseOrderNumber: body.purchaseOrderNumber,
        receivedDate: new Date().toISOString().split('T')[0],
        receivedBy: body.receivedBy,
        status: 'available',
      }
    });

    // Create stock transaction
    await db.pharmacyStockTransaction.create({
      data: {
        tenantId: body.tenantId || 'default',
        inventoryId: inventory.id,
        drugId: body.drugId,
        transactionType: 'receive',
        quantity: body.quantityReceived,
        quantityBefore: 0,
        quantityAfter: body.quantityReceived,
        referenceType: 'purchase_order',
        referenceId: body.purchaseOrderNumber,
        performedBy: body.receivedBy,
      }
    });

    return NextResponse.json({ inventory });
  } catch (error) {
    console.error('Error creating inventory:', error);
    return NextResponse.json({ error: 'Failed to create inventory' }, { status: 500 });
  }
}

// PATCH /api/pharmacy/inventory - Adjust inventory
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, adjustment, reason, performedBy } = body;

    const current = await db.pharmacyInventory.findUnique({
      where: { id }
    });

    if (!current) {
      return NextResponse.json({ error: 'Inventory item not found' }, { status: 404 });
    }

    const newQuantity = current.quantityRemaining + adjustment;
    
    const updated = await db.pharmacyInventory.update({
      where: { id },
      data: {
        quantityRemaining: Math.max(0, newQuantity),
        status: newQuantity <= 0 ? 'out_of_stock' : 
                newQuantity <= (current.reorderPoint || 0) ? 'low_stock' : 'available'
      }
    });

    // Create stock transaction
    await db.pharmacyStockTransaction.create({
      data: {
        tenantId: current.tenantId,
        inventoryId: id,
        drugId: current.drugId,
        transactionType: adjustment < 0 ? 'dispense' : 'adjust',
        quantity: Math.abs(adjustment),
        quantityBefore: current.quantityRemaining,
        quantityAfter: updated.quantityRemaining,
        reason,
        performedBy,
      }
    });

    return NextResponse.json({ inventory: updated });
  } catch (error) {
    console.error('Error adjusting inventory:', error);
    return NextResponse.json({ error: 'Failed to adjust inventory' }, { status: 500 });
  }
}
