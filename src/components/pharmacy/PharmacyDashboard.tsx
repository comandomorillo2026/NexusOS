'use client';

import React, { useState, useEffect } from 'react';
import {
  Pill,
  Package,
  FileText,
  Users,
  DollarSign,
  AlertTriangle,
  Clock,
  TrendingUp,
  TrendingDown,
  Calendar,
  Activity,
  Truck,
  Syringe,
  Thermometer,
  CheckCircle,
  XCircle,
  AlertCircle,
  Bell,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  RefreshCw,
  Search,
  Plus,
  Filter,
  Download,
  Printer
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Mock data for demonstration
const mockStats = {
  prescriptionsToday: 47,
  prescriptionsWeek: 312,
  prescriptionsMonth: 1245,
  pendingPrescriptions: 12,
  readyForPickup: 8,
  inProgress: 5,
  newPrescriptions: 9,
  revenueToday: 15420.50,
  revenueWeek: 98750.00,
  revenueMonth: 412300.00,
  lowStockItems: 23,
  expiringItems: 15,
  controlledSubstanceCount: 8,
  immunizationsToday: 12,
  deliveriesScheduled: 7,
  averageWaitTime: 12,
  adherenceRate: 94.5
};

const mockAlerts = [
  { id: 1, type: 'drug_interaction', severity: 'high', message: 'Potential interaction: Warfarin + Amiodarone', patient: 'John Doe', time: '5 min ago' },
  { id: 2, type: 'allergy', severity: 'critical', message: 'Penicillin allergy detected for Rx', patient: 'Jane Smith', time: '12 min ago' },
  { id: 3, type: 'low_stock', severity: 'medium', message: 'Metformin 500mg - Stock below reorder level', patient: '', time: '25 min ago' },
  { id: 4, type: 'expiry', severity: 'medium', message: 'Lisinopril 10mg batch expiring in 30 days', patient: '', time: '1 hour ago' },
  { id: 5, type: 'dose', severity: 'high', message: 'Dose exceeds recommended range', patient: 'Robert Johnson', time: '2 hours ago' },
];

const mockPendingRx = [
  { id: 1, rxNumber: 'RX-2024-001234', patient: 'Maria Garcia', drug: 'Atorvastatin 20mg', status: 'new', priority: 'routine', receivedAt: '09:15 AM' },
  { id: 2, rxNumber: 'RX-2024-001235', patient: 'Carlos Rodriguez', drug: 'Metformin 850mg', status: 'in_progress', priority: 'urgent', receivedAt: '09:30 AM' },
  { id: 3, rxNumber: 'RX-2024-001236', patient: 'Ana Martinez', drug: 'Omeprazole 20mg', status: 'new', priority: 'routine', receivedAt: '09:45 AM' },
  { id: 4, rxNumber: 'RX-2024-001237', patient: 'Luis Hernandez', drug: 'Losartan 50mg', status: 'dur_review', priority: 'stat', receivedAt: '10:00 AM' },
  { id: 5, rxNumber: 'RX-2024-001238', patient: 'Sofia Lopez', drug: 'Levothyroxine 100mcg', status: 'ready', priority: 'routine', receivedAt: '10:15 AM' },
];

const mockTopDrugs = [
  { name: 'Metformin 500mg', dispensed: 245, trend: 'up', change: 12 },
  { name: 'Atorvastatin 20mg', dispensed: 198, trend: 'up', change: 8 },
  { name: 'Lisinopril 10mg', dispensed: 187, trend: 'down', change: 3 },
  { name: 'Omeprazole 20mg', dispensed: 156, trend: 'up', change: 15 },
  { name: 'Levothyroxine 50mcg', dispensed: 143, trend: 'stable', change: 0 },
];

const mockDeliveries = [
  { id: 1, patient: 'Elderly Care Home', medications: 5, scheduledTime: '11:00 AM', status: 'out_for_delivery' },
  { id: 2, patient: 'Home Health Patient', medications: 3, scheduledTime: '02:00 PM', status: 'pending' },
  { id: 3, patient: 'Chronic Care Patient', medications: 7, scheduledTime: '04:00 PM', status: 'pending' },
];

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: number;
  color: string;
  onClick?: () => void;
}

function StatCard({ title, value, subtitle, icon, trend, trendValue, color, onClick }: StatCardProps) {
  return (
    <Card 
      className="bg-[rgba(16,185,129,0.05)] border-[rgba(16,185,129,0.2)] hover:border-[rgba(16,185,129,0.4)] transition-all cursor-pointer"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-xs text-[#10B981]/70 uppercase tracking-wider font-medium">{title}</p>
            <p className="text-2xl font-bold text-white mt-1">{value}</p>
            {subtitle && (
              <p className="text-xs text-[#10B981]/60 mt-1">{subtitle}</p>
            )}
            {trend && (
              <div className="flex items-center gap-1 mt-2">
                {trend === 'up' && <TrendingUp className="w-3 h-3 text-emerald-400" />}
                {trend === 'down' && <TrendingDown className="w-3 h-3 text-red-400" />}
                {trend === 'stable' && <Minus className="w-3 h-3 text-gray-400" />}
                <span className={`text-xs ${trend === 'up' ? 'text-emerald-400' : trend === 'down' ? 'text-red-400' : 'text-gray-400'}`}>
                  {trendValue !== undefined && `${trendValue}%`} vs last period
                </span>
              </div>
            )}
          </div>
          <div 
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${color}20` }}
          >
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function AlertItem({ alert }: { alert: typeof mockAlerts[0] }) {
  const severityColors = {
    critical: 'bg-red-500/10 border-red-500/30 text-red-400',
    high: 'bg-orange-500/10 border-orange-500/30 text-orange-400',
    medium: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400',
    low: 'bg-blue-500/10 border-blue-500/30 text-blue-400'
  };

  const severityBadge = {
    critical: 'bg-red-500 text-white',
    high: 'bg-orange-500 text-white',
    medium: 'bg-yellow-500 text-black',
    low: 'bg-blue-500 text-white'
  };

  return (
    <div className={`p-3 rounded-lg border ${severityColors[alert.severity as keyof typeof severityColors]} mb-2`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-xs font-medium uppercase">{alert.type.replace('_', ' ')}</span>
            <Badge className={`text-xs ${severityBadge[alert.severity as keyof typeof severityBadge]}`}>
              {alert.severity}
            </Badge>
          </div>
          <p className="text-sm text-white">{alert.message}</p>
          {alert.patient && (
            <p className="text-xs text-white/60 mt-1">Patient: {alert.patient}</p>
          )}
        </div>
        <span className="text-xs text-white/40">{alert.time}</span>
      </div>
    </div>
  );
}

function PrescriptionQueueItem({ rx }: { rx: typeof mockPendingRx[0] }) {
  const statusColors = {
    new: 'bg-blue-500',
    in_progress: 'bg-yellow-500',
    dur_review: 'bg-orange-500',
    ready: 'bg-emerald-500',
    filled: 'bg-gray-500'
  };

  const priorityColors = {
    routine: 'bg-gray-500/20 text-gray-300',
    urgent: 'bg-orange-500/20 text-orange-300',
    stat: 'bg-red-500/20 text-red-300'
  };

  return (
    <div className="p-3 rounded-lg bg-[rgba(16,185,129,0.05)] border border-[rgba(16,185,129,0.1)] hover:border-[rgba(16,185,129,0.3)] transition-all mb-2">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${statusColors[rx.status as keyof typeof statusColors]}`} />
            <span className="font-mono text-xs text-[#10B981]">{rx.rxNumber}</span>
            <Badge className={`text-xs ${priorityColors[rx.priority as keyof typeof priorityColors]}`}>
              {rx.priority.toUpperCase()}
            </Badge>
          </div>
          <p className="text-sm font-medium text-white mt-1">{rx.patient}</p>
          <p className="text-xs text-white/60">{rx.drug}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-white/40">{rx.receivedAt}</p>
          <Button size="sm" className="mt-2 bg-[#10B981] hover:bg-[#10B981]/80 text-white text-xs">
            Process
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function PharmacyDashboard() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedTab, setSelectedTab] = useState('overview');

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#050410] p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#10B981] to-[#059669] flex items-center justify-center">
              <Pill className="w-5 h-5 text-white" />
            </div>
            NexusPharmacy Dashboard
          </h1>
          <p className="text-[#10B981]/70 text-sm mt-1">
            {currentTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="border-[rgba(16,185,129,0.3)] text-[#10B981]">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button className="bg-[#10B981] hover:bg-[#10B981]/80 text-white">
            <Printer className="w-4 h-4 mr-2" />
            Print Reports
          </Button>
        </div>
      </div>

      {/* Top Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
        <StatCard
          title="Today's Rx"
          value={mockStats.prescriptionsToday}
          icon={<FileText className="w-5 h-5 text-[#10B981]" />}
          color="#10B981"
          trend="up"
          trendValue={8}
        />
        <StatCard
          title="Pending"
          value={mockStats.pendingPrescriptions}
          icon={<Clock className="w-5 h-5 text-yellow-400" />}
          color="#EAB308"
        />
        <StatCard
          title="Ready"
          value={mockStats.readyForPickup}
          icon={<CheckCircle className="w-5 h-5 text-emerald-400" />}
          color="#10B981"
        />
        <StatCard
          title="Revenue Today"
          value={`TT$${mockStats.revenueToday.toLocaleString()}`}
          icon={<DollarSign className="w-5 h-5 text-emerald-400" />}
          color="#10B981"
          trend="up"
          trendValue={12}
        />
        <StatCard
          title="Low Stock"
          value={mockStats.lowStockItems}
          icon={<AlertTriangle className="w-5 h-5 text-orange-400" />}
          color="#F97316"
        />
        <StatCard
          title="Immunizations"
          value={mockStats.immunizationsToday}
          icon={<Syringe className="w-5 h-5 text-purple-400" />}
          color="#A855F7"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Prescription Queue */}
        <div className="lg:col-span-2">
          <Card className="bg-[rgba(16,185,129,0.03)] border-[rgba(16,185,129,0.15)]">
            <CardHeader className="border-b border-[rgba(16,185,129,0.1)]">
              <div className="flex items-center justify-between">
                <CardTitle className="text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#10B981]" />
                  Prescription Queue
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge className="bg-blue-500/20 text-blue-300">
                    {mockPendingRx.filter(r => r.status === 'new').length} New
                  </Badge>
                  <Badge className="bg-yellow-500/20 text-yellow-300">
                    {mockPendingRx.filter(r => r.status === 'in_progress').length} In Progress
                  </Badge>
                  <Badge className="bg-emerald-500/20 text-emerald-300">
                    {mockPendingRx.filter(r => r.status === 'ready').length} Ready
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <Tabs value={selectedTab} onValueChange={setSelectedTab}>
                <TabsList className="bg-[rgba(16,185,129,0.1)] mb-4">
                  <TabsTrigger value="overview" className="data-[state=active]:bg-[#10B981] data-[state=active]:text-white">
                    All
                  </TabsTrigger>
                  <TabsTrigger value="new" className="data-[state=active]:bg-[#10B981] data-[state=active]:text-white">
                    New
                  </TabsTrigger>
                  <TabsTrigger value="urgent" className="data-[state=active]:bg-[#10B981] data-[state=active]:text-white">
                    Urgent
                  </TabsTrigger>
                  <TabsTrigger value="stat" className="data-[state=active]:bg-[#10B981] data-[state=active]:text-white">
                    STAT
                  </TabsTrigger>
                </TabsList>
                <ScrollArea className="h-[300px]">
                  {mockPendingRx.map(rx => (
                    <PrescriptionQueueItem key={rx.id} rx={rx} />
                  ))}
                </ScrollArea>
              </Tabs>
            </CardContent>
          </Card>

          {/* Top Drugs Chart */}
          <Card className="bg-[rgba(16,185,129,0.03)] border-[rgba(16,185,129,0.15)] mt-6">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#10B981]" />
                Top Dispensed Drugs (This Month)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockTopDrugs.map((drug, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <span className="text-white/40 w-6 text-sm">#{index + 1}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-white text-sm">{drug.name}</span>
                        <span className="text-[#10B981] text-sm font-mono">{drug.dispensed} Rx</span>
                      </div>
                      <Progress 
                        value={(drug.dispensed / 245) * 100} 
                        className="h-2 bg-[rgba(16,185,129,0.1)]"
                      />
                    </div>
                    <div className="flex items-center gap-1">
                      {drug.trend === 'up' && <ArrowUpRight className="w-4 h-4 text-emerald-400" />}
                      {drug.trend === 'down' && <ArrowDownRight className="w-4 h-4 text-red-400" />}
                      {drug.trend === 'stable' && <Minus className="w-4 h-4 text-gray-400" />}
                      <span className={`text-xs ${drug.trend === 'up' ? 'text-emerald-400' : drug.trend === 'down' ? 'text-red-400' : 'text-gray-400'}`}>
                        {drug.change > 0 ? `+${drug.change}%` : drug.change < 0 ? `${drug.change}%` : '0%'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Alerts & Quick Actions */}
        <div className="space-y-6">
          {/* Critical Alerts */}
          <Card className="bg-[rgba(239,68,68,0.03)] border-[rgba(239,68,68,0.2)]">
            <CardHeader className="border-b border-[rgba(239,68,68,0.1)]">
              <CardTitle className="text-white flex items-center gap-2">
                <Bell className="w-5 h-5 text-red-400" />
                DUR Alerts & Warnings
                <Badge className="bg-red-500 text-white ml-2">{mockAlerts.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <ScrollArea className="h-[250px]">
                {mockAlerts.map(alert => (
                  <AlertItem key={alert.id} alert={alert} />
                ))}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Scheduled Deliveries */}
          <Card className="bg-[rgba(16,185,129,0.03)] border-[rgba(16,185,129,0.15)]">
            <CardHeader className="border-b border-[rgba(16,185,129,0.1)]">
              <CardTitle className="text-white flex items-center gap-2">
                <Truck className="w-5 h-5 text-[#10B981]" />
                Today&apos;s Deliveries
                <Badge className="bg-[#10B981]/20 text-[#10B981] ml-2">{mockDeliveries.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-3">
                {mockDeliveries.map(delivery => (
                  <div key={delivery.id} className="p-3 rounded-lg bg-[rgba(16,185,129,0.05)] border border-[rgba(16,185,129,0.1)]">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white text-sm font-medium">{delivery.patient}</p>
                        <p className="text-white/60 text-xs">{delivery.medications} medications</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[#10B981] text-sm font-mono">{delivery.scheduledTime}</p>
                        <Badge className={`text-xs ${delivery.status === 'out_for_delivery' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-yellow-500/20 text-yellow-300'}`}>
                          {delivery.status === 'out_for_delivery' ? 'Out for Delivery' : 'Pending'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="bg-[rgba(16,185,129,0.03)] border-[rgba(16,185,129,0.15)]">
            <CardHeader>
              <CardTitle className="text-white text-sm">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-2">
              <Button variant="outline" className="border-[rgba(16,185,129,0.3)] text-[#10B981] justify-start">
                <Plus className="w-4 h-4 mr-2" />
                New Rx
              </Button>
              <Button variant="outline" className="border-[rgba(16,185,129,0.3)] text-[#10B981] justify-start">
                <Search className="w-4 h-4 mr-2" />
                Find Patient
              </Button>
              <Button variant="outline" className="border-[rgba(16,185,129,0.3)] text-[#10B981] justify-start">
                <Package className="w-4 h-4 mr-2" />
                Inventory
              </Button>
              <Button variant="outline" className="border-[rgba(16,185,129,0.3)] text-[#10B981] justify-start">
                <Syringe className="w-4 h-4 mr-2" />
                Immunization
              </Button>
              <Button variant="outline" className="border-[rgba(16,185,129,0.3)] text-[#10B981] justify-start">
                <Truck className="w-4 h-4 mr-2" />
                Delivery
              </Button>
              <Button variant="outline" className="border-[rgba(16,185,129,0.3)] text-[#10B981] justify-start">
                <Download className="w-4 h-4 mr-2" />
                Reports
              </Button>
            </CardContent>
          </Card>

          {/* Performance Metrics */}
          <Card className="bg-[rgba(16,185,129,0.03)] border-[rgba(16,185,129,0.15)]">
            <CardHeader>
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#10B981]" />
                Performance Metrics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-white/60">Avg. Wait Time</span>
                  <span className="text-white font-mono">{mockStats.averageWaitTime} min</span>
                </div>
                <Progress value={85} className="h-2 bg-[rgba(16,185,129,0.1)]" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-white/60">Adherence Rate</span>
                  <span className="text-white font-mono">{mockStats.adherenceRate}%</span>
                </div>
                <Progress value={mockStats.adherenceRate} className="h-2 bg-[rgba(16,185,129,0.1)]" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-white/60">DUR Override Rate</span>
                  <span className="text-white font-mono">2.3%</span>
                </div>
                <Progress value={2.3} className="h-2 bg-[rgba(16,185,129,0.1)]" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
