'use client';

import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  FileText,
  Pill,
  Users,
  Calendar,
  Download,
  Printer,
  Filter,
  ChevronDown,
  ChevronUp,
  Activity,
  AlertTriangle,
  Clock,
  CheckCircle,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Mock analytics data
const revenueData = {
  today: 15420.50,
  week: 98750.00,
  month: 412300.00,
  year: 4850000.00,
  trend: 12.5
};

const prescriptionStats = {
  total: 1245,
  new: 156,
  refills: 1089,
  averagePerDay: 47,
  averageWaitTime: 12
};

const topDrugs = [
  { name: 'Metformin 500mg', dispensed: 245, trend: 12, revenue: 7350.00 },
  { name: 'Atorvastatin 20mg', dispensed: 198, trend: 8, revenue: 8910.00 },
  { name: 'Lisinopril 10mg', dispensed: 187, trend: -3, revenue: 5610.00 },
  { name: 'Omeprazole 20mg', dispensed: 156, trend: 15, revenue: 7020.00 },
  { name: 'Levothyroxine 50mcg', dispensed: 143, trend: 0, revenue: 4290.00 },
  { name: 'Amlodipine 5mg', dispensed: 132, trend: 5, revenue: 3960.00 },
  { name: 'Metoprolol 25mg', dispensed: 121, trend: 3, revenue: 3630.00 },
  { name: 'Gabapentin 300mg', dispensed: 115, trend: -2, revenue: 5750.00 }
];

const hourlyDistribution = [
  { hour: '8AM', count: 12 },
  { hour: '9AM', count: 28 },
  { hour: '10AM', count: 45 },
  { hour: '11AM', count: 52 },
  { hour: '12PM', count: 38 },
  { hour: '1PM', count: 25 },
  { hour: '2PM', count: 42 },
  { hour: '3PM', count: 48 },
  { hour: '4PM', count: 35 },
  { hour: '5PM', count: 28 },
  { hour: '6PM', count: 18 },
  { hour: '7PM', count: 8 }
];

const insuranceBreakdown = [
  { payer: 'National Insurance', claims: 456, paid: 125000, pending: 12000 },
  { payer: 'Green Shield', claims: 312, paid: 89000, pending: 5600 },
  { payer: 'Private Pay', claims: 289, paid: 45000, pending: 0 },
  { payer: 'Other Insurance', claims: 188, paid: 52000, pending: 3400 }
];

const inventoryAlerts = {
  lowStock: 23,
  expiring30Days: 15,
  expiring90Days: 42,
  outOfStock: 5,
  reorderNeeded: 18
};

const performanceMetrics = {
  fillRate: 98.5,
  accuracy: 99.7,
  customerSatisfaction: 4.8,
  averageWaitTime: 12,
  adherenceRate: 94.5
};

export default function ReportsModule() {
  const [timeRange, setTimeRange] = useState('month');
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="min-h-screen bg-[#050410] p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#10B981] to-[#059669] flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            Analytics & Reports
          </h1>
          <p className="text-[#10B981]/70 text-sm mt-1">
            Pharmacy performance metrics and insights
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40 bg-[rgba(16,185,129,0.05)] border-[rgba(16,185,129,0.2)] text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="border-[rgba(16,185,129,0.3)] text-[#10B981]">
            <Printer className="w-4 h-4 mr-2" />
            Print Report
          </Button>
          <Button className="bg-[#10B981] hover:bg-[#10B981]/80 text-white">
            <Download className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-[rgba(16,185,129,0.1)] mb-4">
          <TabsTrigger value="overview" className="data-[state=active]:bg-[#10B981] data-[state=active]:text-white">Overview</TabsTrigger>
          <TabsTrigger value="prescriptions" className="data-[state=active]:bg-[#10B981] data-[state=active]:text-white">Prescriptions</TabsTrigger>
          <TabsTrigger value="inventory" className="data-[state=active]:bg-[#10B981] data-[state=active]:text-white">Inventory</TabsTrigger>
          <TabsTrigger value="financial" className="data-[state=active]:bg-[#10B981] data-[state=active]:text-white">Financial</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-[rgba(16,185,129,0.03)] border-[rgba(16,185,129,0.15)]">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-white/50 uppercase">Revenue</p>
                    <p className="text-2xl font-bold text-white font-mono">TT${revenueData.month.toLocaleString()}</p>
                    <div className="flex items-center gap-1 mt-1">
                      {revenueData.trend > 0 ? (
                        <>
                          <ArrowUpRight className="w-3 h-3 text-emerald-400" />
                          <span className="text-xs text-emerald-400">+{revenueData.trend}%</span>
                        </>
                      ) : (
                        <>
                          <ArrowDownRight className="w-3 h-3 text-red-400" />
                          <span className="text-xs text-red-400">{revenueData.trend}%</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-[#10B981]/20 flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-[#10B981]" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[rgba(16,185,129,0.03)] border-[rgba(16,185,129,0.15)]">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-white/50 uppercase">Prescriptions</p>
                    <p className="text-2xl font-bold text-white">{prescriptionStats.total}</p>
                    <p className="text-xs text-white/40 mt-1">{prescriptionStats.averagePerDay}/day avg</p>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[rgba(16,185,129,0.03)] border-[rgba(16,185,129,0.15)]">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-white/50 uppercase">Fill Rate</p>
                    <p className="text-2xl font-bold text-white">{performanceMetrics.fillRate}%</p>
                    <Progress value={performanceMetrics.fillRate} className="h-1 mt-2 bg-[rgba(16,185,129,0.1)]" />
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[rgba(16,185,129,0.03)] border-[rgba(16,185,129,0.15)]">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-white/50 uppercase">Avg Wait Time</p>
                    <p className="text-2xl font-bold text-white">{performanceMetrics.averageWaitTime} min</p>
                    <p className="text-xs text-white/40 mt-1">Target: 15 min</p>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-purple-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Top Drugs */}
            <Card className="bg-[rgba(16,185,129,0.03)] border-[rgba(16,185,129,0.15)]">
              <CardHeader className="border-b border-[rgba(16,185,129,0.1)]">
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#10B981]" />
                  Top Dispensed Drugs
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-3">
                  {topDrugs.slice(0, 6).map((drug, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <span className="text-white/40 w-6 text-sm">#{idx + 1}</span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-white text-sm">{drug.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-[#10B981] font-mono text-sm">{drug.dispensed}</span>
                            <span className={`text-xs flex items-center ${drug.trend > 0 ? 'text-emerald-400' : drug.trend < 0 ? 'text-red-400' : 'text-white/40'}`}>
                              {drug.trend > 0 ? <ChevronUp className="w-3 h-3" /> : drug.trend < 0 ? <ChevronDown className="w-3 h-3" /> : null}
                              {Math.abs(drug.trend)}%
                            </span>
                          </div>
                        </div>
                        <Progress value={(drug.dispensed / 245) * 100} className="h-1 bg-[rgba(16,185,129,0.1)]" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Hourly Distribution */}
            <Card className="bg-[rgba(16,185,129,0.03)] border-[rgba(16,185,129,0.15)]">
              <CardHeader className="border-b border-[rgba(16,185,129,0.1)]">
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[#10B981]" />
                  Hourly Distribution
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="flex items-end justify-between h-40 gap-1">
                  {hourlyDistribution.map((h, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center">
                      <div 
                        className="w-full bg-[#10B981]/60 rounded-t transition-all hover:bg-[#10B981]"
                        style={{ height: `${(h.count / 52) * 100}%` }}
                      />
                      <span className="text-xs text-white/40 mt-1 rotate-45">{h.hour}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Insurance Breakdown */}
            <Card className="bg-[rgba(16,185,129,0.03)] border-[rgba(16,185,129,0.15)]">
              <CardHeader className="border-b border-[rgba(16,185,129,0.1)]">
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-[#10B981]" />
                  Insurance Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-3">
                  {insuranceBreakdown.map((ins, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-[rgba(16,185,129,0.05)] border border-[rgba(16,185,129,0.1)]">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white font-medium">{ins.payer}</span>
                        <Badge className="bg-[#10B981]/20 text-[#10B981]">{ins.claims} claims</Badge>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-white/50">Paid:</span>
                        <span className="text-emerald-400 font-mono">TT${ins.paid.toLocaleString()}</span>
                      </div>
                      {ins.pending > 0 && (
                        <div className="flex justify-between text-sm mt-1">
                          <span className="text-white/50">Pending:</span>
                          <span className="text-yellow-400 font-mono">TT${ins.pending.toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <Card className="bg-[rgba(16,185,129,0.03)] border-[rgba(16,185,129,0.15)]">
              <CardHeader className="border-b border-[rgba(16,185,129,0.1)]">
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[#10B981]" />
                  Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-white/60">Fill Rate</span>
                    <span className="text-white font-mono">{performanceMetrics.fillRate}%</span>
                  </div>
                  <Progress value={performanceMetrics.fillRate} className="h-2 bg-[rgba(16,185,129,0.1)]" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-white/60">Dispensing Accuracy</span>
                    <span className="text-white font-mono">{performanceMetrics.accuracy}%</span>
                  </div>
                  <Progress value={performanceMetrics.accuracy} className="h-2 bg-[rgba(16,185,129,0.1)]" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-white/60">Customer Satisfaction</span>
                    <span className="text-white font-mono">{performanceMetrics.customerSatisfaction}/5.0</span>
                  </div>
                  <Progress value={performanceMetrics.customerSatisfaction * 20} className="h-2 bg-[rgba(16,185,129,0.1)]" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-white/60">Patient Adherence Rate</span>
                    <span className="text-white font-mono">{performanceMetrics.adherenceRate}%</span>
                  </div>
                  <Progress value={performanceMetrics.adherenceRate} className="h-2 bg-[rgba(16,185,129,0.1)]" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="prescriptions">
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <Card className="bg-[rgba(16,185,129,0.03)] border-[rgba(16,185,129,0.15)]">
              <CardContent className="p-4 text-center">
                <p className="text-4xl font-bold text-white">{prescriptionStats.total}</p>
                <p className="text-white/50 text-sm">Total Prescriptions</p>
              </CardContent>
            </Card>
            <Card className="bg-[rgba(16,185,129,0.03)] border-[rgba(16,185,129,0.15)]">
              <CardContent className="p-4 text-center">
                <p className="text-4xl font-bold text-white">{prescriptionStats.new}</p>
                <p className="text-white/50 text-sm">New Prescriptions</p>
              </CardContent>
            </Card>
            <Card className="bg-[rgba(16,185,129,0.03)] border-[rgba(16,185,129,0.15)]">
              <CardContent className="p-4 text-center">
                <p className="text-4xl font-bold text-white">{prescriptionStats.refills}</p>
                <p className="text-white/50 text-sm">Refills</p>
              </CardContent>
            </Card>
          </div>
          <Card className="bg-[rgba(16,185,129,0.03)] border-[rgba(16,185,129,0.15)]">
            <CardHeader>
              <CardTitle className="text-white text-sm">Prescription Trends</CardTitle>
            </CardHeader>
            <CardContent className="p-4 text-center text-white/50">
              Prescription trend charts will be displayed here
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inventory">
          <div className="grid md:grid-cols-5 gap-4 mb-6">
            <Card className="bg-[rgba(234,179,8,0.03)] border-[rgba(234,179,8,0.15)]">
              <CardContent className="p-4 text-center">
                <p className="text-3xl font-bold text-yellow-400">{inventoryAlerts.lowStock}</p>
                <p className="text-white/50 text-xs">Low Stock</p>
              </CardContent>
            </Card>
            <Card className="bg-[rgba(239,68,68,0.03)] border-[rgba(239,68,68,0.15)]">
              <CardContent className="p-4 text-center">
                <p className="text-3xl font-bold text-red-400">{inventoryAlerts.outOfStock}</p>
                <p className="text-white/50 text-xs">Out of Stock</p>
              </CardContent>
            </Card>
            <Card className="bg-[rgba(249,115,22,0.03)] border-[rgba(249,115,22,0.15)]">
              <CardContent className="p-4 text-center">
                <p className="text-3xl font-bold text-orange-400">{inventoryAlerts.expiring30Days}</p>
                <p className="text-white/50 text-xs">Expiring 30 Days</p>
              </CardContent>
            </Card>
            <Card className="bg-[rgba(16,185,129,0.03)] border-[rgba(16,185,129,0.15)]">
              <CardContent className="p-4 text-center">
                <p className="text-3xl font-bold text-[#10B981]">{inventoryAlerts.expiring90Days}</p>
                <p className="text-white/50 text-xs">Expiring 90 Days</p>
              </CardContent>
            </Card>
            <Card className="bg-[rgba(59,130,246,0.03)] border-[rgba(59,130,246,0.15)]">
              <CardContent className="p-4 text-center">
                <p className="text-3xl font-bold text-blue-400">{inventoryAlerts.reorderNeeded}</p>
                <p className="text-white/50 text-xs">Reorder Needed</p>
              </CardContent>
            </Card>
          </div>
          <Card className="bg-[rgba(16,185,129,0.03)] border-[rgba(16,185,129,0.15)]">
            <CardHeader>
              <CardTitle className="text-white text-sm">Inventory Valuation</CardTitle>
            </CardHeader>
            <CardContent className="p-4 text-center text-white/50">
              Inventory valuation charts will be displayed here
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial">
          <div className="grid md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-[rgba(16,185,129,0.03)] border-[rgba(16,185,129,0.15)]">
              <CardContent className="p-4">
                <p className="text-xs text-white/50 uppercase">Today</p>
                <p className="text-xl font-bold text-white font-mono">TT${revenueData.today.toLocaleString()}</p>
              </CardContent>
            </Card>
            <Card className="bg-[rgba(16,185,129,0.03)] border-[rgba(16,185,129,0.15)]">
              <CardContent className="p-4">
                <p className="text-xs text-white/50 uppercase">This Week</p>
                <p className="text-xl font-bold text-white font-mono">TT${revenueData.week.toLocaleString()}</p>
              </CardContent>
            </Card>
            <Card className="bg-[rgba(16,185,129,0.03)] border-[rgba(16,185,129,0.15)]">
              <CardContent className="p-4">
                <p className="text-xs text-white/50 uppercase">This Month</p>
                <p className="text-xl font-bold text-white font-mono">TT${revenueData.month.toLocaleString()}</p>
              </CardContent>
            </Card>
            <Card className="bg-[rgba(16,185,129,0.03)] border-[rgba(16,185,129,0.15)]">
              <CardContent className="p-4">
                <p className="text-xs text-white/50 uppercase">This Year</p>
                <p className="text-xl font-bold text-white font-mono">TT${revenueData.year.toLocaleString()}</p>
              </CardContent>
            </Card>
          </div>
          <Card className="bg-[rgba(16,185,129,0.03)] border-[rgba(16,185,129,0.15)]">
            <CardHeader>
              <CardTitle className="text-white text-sm">Revenue Trends</CardTitle>
            </CardHeader>
            <CardContent className="p-4 text-center text-white/50">
              Revenue trend charts will be displayed here
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
