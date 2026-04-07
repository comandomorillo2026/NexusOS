import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Fetch financial reports
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get('propertyId');
    const reportType = searchParams.get('reportType') || 'summary';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const year = searchParams.get('year') || new Date().getFullYear().toString();

    if (!propertyId) {
      return NextResponse.json({ error: 'Property ID required' }, { status: 400 });
    }

    // Get property details
    const property = await db.condoProperty.findUnique({
      where: { id: propertyId },
      include: {
        units: {
          include: {
            invoices: true,
            payments: true
          }
        },
        bankAccounts: true,
        budgets: {
          where: { fiscalYear: parseInt(year) }
        }
      }
    });

    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    // Calculate financial data
    const invoices = await db.condoInvoice.findMany({
      where: { 
        propertyId,
        invoiceDate: startDate && endDate ? { gte: startDate, lte: endDate } : undefined
      }
    });

    const payments = await db.condoPayment.findMany({
      where: { 
        propertyId,
        paymentDate: startDate && endDate ? { gte: startDate, lte: endDate } : undefined
      }
    });

    // Calculate totals
    const totalInvoiced = invoices.reduce((sum, inv) => sum + inv.total, 0);
    const totalCollected = payments.reduce((sum, p) => sum + p.amount, 0);
    const totalPending = invoices
      .filter(inv => ['pending', 'overdue', 'partial'].includes(inv.status))
      .reduce((sum, inv) => sum + inv.balanceDue, 0);
    const totalOverdue = invoices
      .filter(inv => inv.status === 'overdue')
      .reduce((sum, inv) => sum + inv.balanceDue, 0);

    // Monthly breakdown
    const monthlyData = [];
    for (let month = 0; month < 12; month++) {
      const monthStart = new Date(parseInt(year), month, 1).toISOString().split('T')[0];
      const monthEnd = new Date(parseInt(year), month + 1, 0).toISOString().split('T')[0];
      
      const monthInvoices = invoices.filter(inv => 
        inv.invoiceDate >= monthStart && inv.invoiceDate <= monthEnd
      );
      const monthPayments = payments.filter(p => 
        p.paymentDate >= monthStart && p.paymentDate <= monthEnd
      );

      monthlyData.push({
        month: month + 1,
        monthName: new Date(parseInt(year), month, 1).toLocaleString('es', { month: 'short' }),
        invoiced: monthInvoices.reduce((sum, inv) => sum + inv.total, 0),
        collected: monthPayments.reduce((sum, p) => sum + p.amount, 0),
        invoices: monthInvoices.length,
        payments: monthPayments.length,
      });
    }

    // Accounts receivable aging
    const now = new Date();
    const aging = {
      current: 0,      // 0-30 days
      days30: 0,       // 31-60 days
      days60: 0,       // 61-90 days
      days90: 0,       // 90+ days
    };

    invoices
      .filter(inv => ['pending', 'overdue', 'partial'].includes(inv.status))
      .forEach(inv => {
        const dueDate = new Date(inv.dueDate);
        const daysPastDue = Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysPastDue <= 30) aging.current += inv.balanceDue;
        else if (daysPastDue <= 60) aging.days30 += inv.balanceDue;
        else if (daysPastDue <= 90) aging.days60 += inv.balanceDue;
        else aging.days90 += inv.balanceDue;
      });

    // Balance sheet data
    const assets = {
      cash: property.bankAccounts.reduce((sum, acc) => sum + acc.currentBalance, 0),
      receivables: totalPending,
      prepaids: 0,
      total: 0
    };
    assets.total = assets.cash + assets.receivables + assets.prepaids;

    const liabilities = {
      deposits: 0,
      prepayments: 0,
      payables: 0,
      total: 0
    };
    liabilities.total = liabilities.deposits + liabilities.prepayments + liabilities.payables;

    const equity = {
      fundBalance: assets.total - liabilities.total,
      retainedEarnings: 0,
      total: 0
    };
    equity.total = equity.fundBalance + equity.retainedEarnings;

    // Budget comparison
    const budget = property.budgets[0];
    const budgetComparison = budget ? {
      totalBudgeted: budget.totalBudgeted,
      totalActual: totalCollected,
      variance: budget.totalBudgeted - totalCollected,
      variancePercent: budget.totalBudgeted > 0 
        ? ((budget.totalBudgeted - totalCollected) / budget.totalBudgeted * 100).toFixed(1)
        : 0
    } : null;

    // Unit statistics
    const unitStats = {
      total: property.units.length,
      occupied: property.units.filter(u => u.status === 'occupied').length,
      vacant: property.units.filter(u => u.status === 'vacant').length,
      occupancyRate: property.units.length > 0 
        ? (property.units.filter(u => u.status === 'occupied').length / property.units.length * 100).toFixed(1)
        : 0,
      averageFee: property.units.reduce((sum, u) => sum + u.monthlyFee, 0) / property.units.length || 0,
    };

    const report = {
      property: {
        name: property.name,
        address: property.address,
        city: property.city,
        currency: property.currency,
      },
      period: {
        year: parseInt(year),
        startDate: startDate || `${year}-01-01`,
        endDate: endDate || `${year}-12-31`,
      },
      summary: {
        totalInvoiced,
        totalCollected,
        totalPending,
        totalOverdue,
        collectionRate: totalInvoiced > 0 
          ? ((totalCollected / totalInvoiced) * 100).toFixed(1)
          : 0,
      },
      monthlyData,
      aging,
      balanceSheet: {
        assets,
        liabilities,
        equity,
      },
      budgetComparison,
      unitStats,
    };

    return NextResponse.json({ report });
  } catch (error) {
    console.error('Error generating report:', error);
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 });
  }
}
