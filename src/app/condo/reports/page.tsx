'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart,
  FileText,
  Download,
  Calendar,
  Building2,
  Users,
  CreditCard,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { AuroraBackground, CondoHeader, StatCard, PageLoader, CondoCard } from '@/components/condo';

// Types
interface FinancialReport {
  property: {
    name: string;
    address: string;
    city: string;
    currency: string;
  };
  period: {
    year: number;
    startDate: string;
    endDate: string;
  };
  summary: {
    totalInvoiced: number;
    totalCollected: number;
    totalPending: number;
    totalOverdue: number;
    collectionRate: string;
  };
  monthlyData: Array<{
    month: number;
    monthName: string;
    invoiced: number;
    collected: number;
    invoices: number;
    payments: number;
  }>;
  aging: {
    current: number;
    days30: number;
    days60: number;
    days90: number;
  };
  balanceSheet: {
    assets: {
      cash: number;
      receivables: number;
      prepaids: number;
      total: number;
    };
    liabilities: {
      deposits: number;
      prepayments: number;
      payables: number;
      total: number;
    };
    equity: {
      fundBalance: number;
      retainedEarnings: number;
      total: number;
    };
  };
  unitStats: {
    total: number;
    occupied: number;
    vacant: number;
    occupancyRate: string;
    averageFee: number;
  };
  budgetComparison?: {
    totalBudgeted: number;
    totalActual: number;
    variance: number;
    variancePercent: string;
  };
}

// Simple Bar Chart Component
function SimpleBarChart({ data, height = 200 }: { data: Array<{ label: string; value: number; color?: string }>; height?: number }) {
  const maxValue = Math.max(...data.map(d => d.value));
  
  return (
    <div className="flex items-end justify-between gap-1" style={{ height }}>
      {data.map((item, index) => (
        <div key={index} className="flex-1 flex flex-col items-center gap-1">
          <div 
            className="w-full rounded-t transition-all duration-300"
            style={{ 
              height: maxValue > 0 ? `${(item.value / maxValue) * (height - 30)}px` : '0px',
              backgroundColor: item.color || '#6C3FCE',
              minHeight: '4px'
            }}
          />
          <span className="text-[10px] text-[#9D7BEA] rotate-0 truncate w-full text-center">
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function ReportsPage() {
  const searchParams = useSearchParams();
  const propertyId = searchParams.get('propertyId') || 'default';

  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState<FinancialReport | null>(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [activeTab, setActiveTab] = useState('summary');

  useEffect(() => {
    fetchReport();
  }, [propertyId, selectedYear]);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/condo/reports?propertyId=${propertyId}&year=${selectedYear}`);
      const data = await res.json();
      setReport(data.report);
    } catch (error) {
      console.error('Error fetching report:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportToPDF = () => {
    // In production, this would generate a PDF
    alert('Exportando a PDF...');
  };

  const exportToExcel = () => {
    // In production, this would generate an Excel file
    alert('Exportando a Excel...');
  };

  if (loading) {
    return <PageLoader />;
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-[#050410] flex items-center justify-center">
        <p className="text-[#9D7BEA]">No hay datos disponibles</p>
      </div>
    );
  }

  // Chart data
  const monthlyChartData = report.monthlyData.map(m => ({
    label: m.monthName,
    value: m.collected,
    color: '#34D399'
  }));

  const agingChartData = [
    { label: '0-30', value: report.aging.current, color: '#34D399' },
    { label: '31-60', value: report.aging.days30, color: '#F0B429' },
    { label: '61-90', value: report.aging.days60, color: '#F87171' },
    { label: '90+', value: report.aging.days90, color: '#dc2626' },
  ];

  return (
    <div className="min-h-screen bg-[#050410]">
      <AuroraBackground />
      
      <CondoHeader 
        title="Reportes Contables" 
        subtitle={report.property.name}
        rightContent={
          <div className="flex gap-2">
            <Select value={selectedYear.toString()} onValueChange={(v) => setSelectedYear(parseInt(v))}>
              <SelectTrigger className="w-28 bg-[#0A0820] border-[rgba(167,139,250,0.2)] text-[#EDE9FE]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#0A0820] border-[rgba(167,139,250,0.2)]">
                {[2024, 2023, 2022].map(year => (
                  <SelectItem key={year} value={year.toString()} className="text-[#EDE9FE]">
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={exportToPDF} className="border-[rgba(167,139,250,0.2)] text-[#9D7BEA]">
              <FileText className="w-4 h-4 mr-2" />
              PDF
            </Button>
            <Button variant="outline" onClick={exportToExcel} className="border-[rgba(167,139,250,0.2)] text-[#9D7BEA]">
              <Download className="w-4 h-4 mr-2" />
              Excel
            </Button>
          </div>
        }
      />

      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Total Facturado"
            value={`$${report.summary.totalInvoiced.toLocaleString()}`}
            icon={FileText}
            color="violet"
          />
          <StatCard
            title="Total Cobrado"
            value={`$${report.summary.totalCollected.toLocaleString()}`}
            icon={DollarSign}
            color="green"
            trend={`${report.summary.collectionRate}% de cobro`}
            trendUp={parseFloat(report.summary.collectionRate) > 90}
          />
          <StatCard
            title="Por Cobrar"
            value={`$${report.summary.totalPending.toLocaleString()}`}
            icon={Clock}
            color="gold"
          />
          <StatCard
            title="Vencido"
            value={`$${report.summary.totalOverdue.toLocaleString()}`}
            icon={AlertTriangle}
            color="red"
          />
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-[#0A0820] border border-[rgba(167,139,250,0.2)] mb-6">
            <TabsTrigger value="summary">Resumen</TabsTrigger>
            <TabsTrigger value="balance">Balance General</TabsTrigger>
            <TabsTrigger value="aging">Antigüedad</TabsTrigger>
            <TabsTrigger value="monthly">Mensual</TabsTrigger>
          </TabsList>

          {/* Summary Tab */}
          <TabsContent value="summary">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Collection Chart */}
              <CondoCard title="Cobranza Mensual" icon={BarChart3}>
                <div className="h-[250px]">
                  <SimpleBarChart data={monthlyChartData} height={220} />
                </div>
              </CondoCard>

              {/* Unit Stats */}
              <CondoCard title="Estadísticas de Unidades" icon={Building2}>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-3 rounded-lg bg-[rgba(108,63,206,0.1)]">
                      <p className="text-2xl font-bold text-[#EDE9FE]">{report.unitStats.total}</p>
                      <p className="text-xs text-[#9D7BEA]">Total</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-[rgba(52,211,153,0.1)]">
                      <p className="text-2xl font-bold text-[#34D399]">{report.unitStats.occupied}</p>
                      <p className="text-xs text-[#9D7BEA]">Ocupadas</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-[rgba(34,211,238,0.1)]">
                      <p className="text-2xl font-bold text-[#22D3EE]">{report.unitStats.vacant}</p>
                      <p className="text-xs text-[#9D7BEA]">Vacías</p>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-[#9D7BEA]">Ocupación</span>
                      <span className="text-[#EDE9FE]">{report.unitStats.occupancyRate}%</span>
                    </div>
                    <Progress value={parseFloat(report.unitStats.occupancyRate)} className="h-3 bg-[rgba(167,139,250,0.1)]" />
                  </div>

                  <div className="pt-4 border-t border-[rgba(167,139,250,0.1)]">
                    <div className="flex justify-between">
                      <span className="text-[#9D7BEA]">Cuota Promedio</span>
                      <span className="text-[#F0B429] font-medium">
                        ${report.unitStats.averageFee.toLocaleString()}/mes
                      </span>
                    </div>
                  </div>
                </div>
              </CondoCard>

              {/* Budget Comparison */}
              {report.budgetComparison && (
                <CondoCard title="Comparación Presupuestaria" icon={PieChart} className="lg:col-span-2">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 rounded-lg bg-[rgba(108,63,206,0.1)]">
                      <p className="text-[#9D7BEA] text-sm mb-1">Presupuestado</p>
                      <p className="text-2xl font-bold text-[#EDE9FE]">
                        ${report.budgetComparison.totalBudgeted.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-[rgba(52,211,153,0.1)]">
                      <p className="text-[#9D7BEA] text-sm mb-1">Real</p>
                      <p className="text-2xl font-bold text-[#34D399]">
                        ${report.budgetComparison.totalActual.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-[rgba(248,113,113,0.1)]">
                      <p className="text-[#9D7BEA] text-sm mb-1">Variación</p>
                      <p className={`text-2xl font-bold ${report.budgetComparison.variance >= 0 ? 'text-[#34D399]' : 'text-[#F87171]'}`}>
                        ${Math.abs(report.budgetComparison.variance).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-[rgba(240,180,41,0.1)]">
                      <p className="text-[#9D7BEA] text-sm mb-1">% Variación</p>
                      <p className={`text-2xl font-bold ${parseFloat(report.budgetComparison.variancePercent) >= 0 ? 'text-[#34D399]' : 'text-[#F87171]'}`}>
                        {report.budgetComparison.variancePercent}%
                      </p>
                    </div>
                  </div>
                </CondoCard>
              )}

              {/* Quick Actions */}
              <CondoCard title="Acciones Rápidas" icon={CreditCard} className="lg:col-span-2">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button variant="outline" className="h-auto py-4 flex-col gap-2 bg-[rgba(108,63,206,0.1)] border-[rgba(167,139,250,0.2)] hover:bg-[rgba(108,63,206,0.2)]">
                    <FileText className="w-6 h-6 text-[#B197FC]" />
                    <span className="text-[#EDE9FE]">Estado de Cuenta</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 flex-col gap-2 bg-[rgba(108,63,206,0.1)] border-[rgba(167,139,250,0.2)] hover:bg-[rgba(108,63,206,0.2)]">
                    <Users className="w-6 h-6 text-[#22D3EE]" />
                    <span className="text-[#EDE9FE]">Morosos</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 flex-col gap-2 bg-[rgba(108,63,206,0.1)] border-[rgba(167,139,250,0.2)] hover:bg-[rgba(108,63,206,0.2)]">
                    <DollarSign className="w-6 h-6 text-[#34D399]" />
                    <span className="text-[#EDE9FE]">Flujo de Caja</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 flex-col gap-2 bg-[rgba(108,63,206,0.1)] border-[rgba(167,139,250,0.2)] hover:bg-[rgba(108,63,206,0.2)]">
                    <BarChart3 className="w-6 h-6 text-[#F0B429]" />
                    <span className="text-[#EDE9FE]">Comparativo</span>
                  </Button>
                </div>
              </CondoCard>
            </div>
          </TabsContent>

          {/* Balance Sheet Tab */}
          <TabsContent value="balance">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Assets */}
              <CondoCard title="Activos" icon={TrendingUp}>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[#9D7BEA]">Efectivo</span>
                    <span className="text-[#EDE9FE]">${report.balanceSheet.assets.cash.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#9D7BEA]">Cuentas por Cobrar</span>
                    <span className="text-[#EDE9FE]">${report.balanceSheet.assets.receivables.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#9D7BEA]">Pagos Anticipados</span>
                    <span className="text-[#EDE9FE]">${report.balanceSheet.assets.prepaids.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-[rgba(167,139,250,0.1)]">
                    <span className="text-[#EDE9FE] font-medium">Total Activos</span>
                    <span className="text-[#34D399] font-bold">${report.balanceSheet.assets.total.toLocaleString()}</span>
                  </div>
                </div>
              </CondoCard>

              {/* Liabilities */}
              <CondoCard title="Pasivos" icon={TrendingDown}>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[#9D7BEA]">Depósitos</span>
                    <span className="text-[#EDE9FE]">${report.balanceSheet.liabilities.deposits.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#9D7BEA]">Pagos Anticipados</span>
                    <span className="text-[#EDE9FE]">${report.balanceSheet.liabilities.prepayments.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#9D7BEA]">Cuentas por Pagar</span>
                    <span className="text-[#EDE9FE]">${report.balanceSheet.liabilities.payables.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-[rgba(167,139,250,0.1)]">
                    <span className="text-[#EDE9FE] font-medium">Total Pasivos</span>
                    <span className="text-[#F87171] font-bold">${report.balanceSheet.liabilities.total.toLocaleString()}</span>
                  </div>
                </div>
              </CondoCard>

              {/* Equity */}
              <CondoCard title="Patrimonio" icon={CheckCircle}>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[#9D7BEA]">Fondo de Reserva</span>
                    <span className="text-[#EDE9FE]">${report.balanceSheet.equity.fundBalance.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#9D7BEA]">Resultados Acumulados</span>
                    <span className="text-[#EDE9FE]">${report.balanceSheet.equity.retainedEarnings.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-[rgba(167,139,250,0.1)]">
                    <span className="text-[#EDE9FE] font-medium">Total Patrimonio</span>
                    <span className="text-[#6C3FCE] font-bold">${report.balanceSheet.equity.total.toLocaleString()}</span>
                  </div>
                </div>
              </CondoCard>

              {/* Balance Equation */}
              <Card className="lg:col-span-3 bg-gradient-to-r from-[#6C3FCE]/10 to-[#C026D3]/10 border-[rgba(167,139,250,0.2)]">
                <CardContent className="p-6">
                  <div className="flex items-center justify-center gap-8 text-lg">
                    <div className="text-center">
                      <p className="text-[#9D7BEA] text-sm">Activos</p>
                      <p className="text-2xl font-bold text-[#34D399]">${report.balanceSheet.assets.total.toLocaleString()}</p>
                    </div>
                    <span className="text-[#9D7BEA] text-2xl">=</span>
                    <div className="text-center">
                      <p className="text-[#9D7BEA] text-sm">Pasivos</p>
                      <p className="text-2xl font-bold text-[#F87171]">${report.balanceSheet.liabilities.total.toLocaleString()}</p>
                    </div>
                    <span className="text-[#9D7BEA] text-2xl">+</span>
                    <div className="text-center">
                      <p className="text-[#9D7BEA] text-sm">Patrimonio</p>
                      <p className="text-2xl font-bold text-[#B197FC]">${report.balanceSheet.equity.total.toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Aging Tab */}
          <TabsContent value="aging">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Aging Chart */}
              <CondoCard title="Antigüedad de Cartera" icon={Clock}>
                <div className="h-[250px]">
                  <SimpleBarChart data={agingChartData} height={220} />
                </div>
              </CondoCard>

              {/* Aging Details */}
              <CondoCard title="Detalle por Período" icon={AlertTriangle}>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 rounded-lg bg-[rgba(52,211,153,0.1)]">
                    <div>
                      <p className="text-[#EDE9FE]">0-30 días</p>
                      <p className="text-xs text-[#9D7BEA]">Facturas corrientes</p>
                    </div>
                    <p className="text-xl font-bold text-[#34D399]">${report.aging.current.toLocaleString()}</p>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-[rgba(240,180,41,0.1)]">
                    <div>
                      <p className="text-[#EDE9FE]">31-60 días</p>
                      <p className="text-xs text-[#9D7BEA]">Primer recordatorio</p>
                    </div>
                    <p className="text-xl font-bold text-[#F0B429]">${report.aging.days30.toLocaleString()}</p>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-[rgba(248,113,113,0.1)]">
                    <div>
                      <p className="text-[#EDE9FE]">61-90 días</p>
                      <p className="text-xs text-[#9D7BEA]">Segundo recordatorio</p>
                    </div>
                    <p className="text-xl font-bold text-[#F87171]">${report.aging.days60.toLocaleString()}</p>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-[rgba(220,38,38,0.1)]">
                    <div>
                      <p className="text-[#EDE9FE]">90+ días</p>
                      <p className="text-xs text-[#9D7BEA]">Cobranza judicial</p>
                    </div>
                    <p className="text-xl font-bold text-[#F87171]">${report.aging.days90.toLocaleString()}</p>
                  </div>
                </div>
              </CondoCard>

              {/* Collection Rate */}
              <CondoCard title="Tasa de Cobranza" icon={TrendingUp} className="lg:col-span-2">
                <div className="flex items-center justify-center gap-8 py-4">
                  <div className="relative">
                    <svg className="w-32 h-32 transform -rotate-90">
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="rgba(167,139,250,0.2)"
                        strokeWidth="12"
                        fill="none"
                      />
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="url(#gradient)"
                        strokeWidth="12"
                        fill="none"
                        strokeDasharray={`${parseFloat(report.summary.collectionRate) * 3.52} 352`}
                        strokeLinecap="round"
                      />
                      <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#6C3FCE" />
                          <stop offset="100%" stopColor="#34D399" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl font-bold text-[#EDE9FE]">{report.summary.collectionRate}%</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[#EDE9FE]">Factor de Cobranza</p>
                    <p className="text-sm text-[#9D7BEA]">
                      De cada $100 facturados, se han cobrado ${report.summary.collectionRate}
                    </p>
                    <Badge className={parseFloat(report.summary.collectionRate) >= 90 ? 'bg-[#34D399]/20 text-[#34D399]' : 'bg-[#F0B429]/20 text-[#F0B429]'}>
                      {parseFloat(report.summary.collectionRate) >= 90 ? 'Excelente' : parseFloat(report.summary.collectionRate) >= 80 ? 'Bueno' : 'Necesita atención'}
                    </Badge>
                  </div>
                </div>
              </CondoCard>
            </div>
          </TabsContent>

          {/* Monthly Tab */}
          <TabsContent value="monthly">
            <CondoCard title="Detalle Mensual" icon={Calendar} noPadding>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-[rgba(167,139,250,0.1)] hover:bg-transparent">
                      <TableHead className="text-[#9D7BEA]">Mes</TableHead>
                      <TableHead className="text-right text-[#9D7BEA]">Facturado</TableHead>
                      <TableHead className="text-right text-[#9D7BEA]">Cobrado</TableHead>
                      <TableHead className="text-right text-[#9D7BEA]">Facturas</TableHead>
                      <TableHead className="text-right text-[#9D7BEA]">Pagos</TableHead>
                      <TableHead className="text-right text-[#9D7BEA]">% Cobro</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {report.monthlyData.map(month => (
                      <TableRow key={month.month} className="border-b border-[rgba(167,139,250,0.05)] hover:bg-[rgba(108,63,206,0.05)]">
                        <TableCell className="text-[#EDE9FE] capitalize">{month.monthName}</TableCell>
                        <TableCell className="text-right text-[#EDE9FE]">${month.invoiced.toLocaleString()}</TableCell>
                        <TableCell className="text-right text-[#34D399]">${month.collected.toLocaleString()}</TableCell>
                        <TableCell className="text-right text-[#B197FC]">{month.invoices}</TableCell>
                        <TableCell className="text-right text-[#B197FC]">{month.payments}</TableCell>
                        <TableCell className="text-right">
                          <span className={`font-medium ${
                            month.invoiced > 0 && (month.collected / month.invoiced * 100) >= 90 
                              ? 'text-[#34D399]' 
                              : month.invoiced > 0 && (month.collected / month.invoiced * 100) >= 70 
                                ? 'text-[#F0B429]' 
                                : 'text-[#F87171]'
                          }`}>
                            {month.invoiced > 0 ? ((month.collected / month.invoiced) * 100).toFixed(0) : 0}%
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CondoCard>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
