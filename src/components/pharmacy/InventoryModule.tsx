'use client';

import React, { useState, useMemo } from 'react';
import {
  Package,
  AlertTriangle,
  Snowflake,
  Plus,
  Search,
  Filter,
  Download,
  Clock,
  TrendingUp,
  TrendingDown,
  Box,
  RefreshCw,
  Eye,
  Edit2,
  Trash2,
  ChevronDown,
  ChevronUp,
  Thermometer,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Mock inventory data
const mockInventory = [
  {
    id: '1',
    ndc: '0093-3107-01',
    drugName: 'Atorvastatin 10mg',
    batchNumber: 'BTH-2024-001',
    lotNumber: 'LOT-A12345',
    expiryDate: '2025-06-15',
    quantityReceived: 500,
    quantityRemaining: 245,
    quantityReserved: 50,
    location: 'Aisle 3, Shelf B',
    storageZone: 'Room Temperature',
    minStockLevel: 100,
    reorderPoint: 150,
    unitCost: 0.15,
    status: 'available',
    supplierName: 'Teva Distributor'
  },
  {
    id: '2',
    ndc: '00591-5623-01',
    drugName: 'Metformin 500mg',
    batchNumber: 'BTH-2024-002',
    lotNumber: 'LOT-M23456',
    expiryDate: '2025-03-20',
    quantityReceived: 1000,
    quantityRemaining: 75,
    quantityReserved: 25,
    location: 'Aisle 2, Shelf A',
    storageZone: 'Room Temperature',
    minStockLevel: 200,
    reorderPoint: 300,
    unitCost: 0.08,
    status: 'low_stock',
    supplierName: 'Mylan Pharma'
  },
  {
    id: '3',
    ndc: '00069-3060-01',
    drugName: 'Insulin Glargine 100u/mL',
    batchNumber: 'BTH-2024-003',
    lotNumber: 'LOT-I34567',
    expiryDate: '2024-12-01',
    quantityReceived: 50,
    quantityRemaining: 12,
    quantityReserved: 5,
    location: 'Refrigerator 1',
    storageZone: 'Refrigerated',
    minStockLevel: 20,
    reorderPoint: 30,
    unitCost: 85.00,
    status: 'expiring_soon',
    supplierName: 'Sanofi Direct'
  },
  {
    id: '4',
    ndc: '00406-0512-01',
    drugName: 'Alprazolam 0.5mg',
    batchNumber: 'BTH-2024-004',
    lotNumber: 'LOT-X45678',
    expiryDate: '2026-01-15',
    quantityReceived: 200,
    quantityRemaining: 180,
    quantityReserved: 30,
    location: 'Controlled Safe A',
    storageZone: 'Room Temperature',
    minStockLevel: 50,
    reorderPoint: 75,
    unitCost: 0.45,
    status: 'available',
    supplierName: 'Mallinckrodt'
  },
  {
    id: '5',
    ndc: '00456-1401-01',
    drugName: 'Oxycodone 10mg ER',
    batchNumber: 'BTH-2024-005',
    lotNumber: 'LOT-O56789',
    expiryDate: '2025-09-30',
    quantityReceived: 100,
    quantityRemaining: 45,
    quantityReserved: 20,
    location: 'Controlled Safe B',
    storageZone: 'Room Temperature',
    minStockLevel: 30,
    reorderPoint: 50,
    unitCost: 2.08,
    status: 'available',
    supplierName: 'Purdue Pharma'
  },
  {
    id: '6',
    ndc: '00781-1506-01',
    drugName: 'Amoxicillin 500mg',
    batchNumber: 'BTH-2024-006',
    lotNumber: 'LOT-AM6789',
    expiryDate: '2024-08-15',
    quantityReceived: 500,
    quantityRemaining: 120,
    quantityReserved: 0,
    location: 'Aisle 1, Shelf C',
    storageZone: 'Room Temperature',
    minStockLevel: 100,
    reorderPoint: 150,
    unitCost: 0.52,
    status: 'expired',
    supplierName: 'Sandoz'
  },
  {
    id: '7',
    ndc: '00173-0713-01',
    drugName: 'Omeprazole 20mg',
    batchNumber: 'BTH-2024-007',
    lotNumber: 'LOT-OM7890',
    expiryDate: '2025-11-20',
    quantityReceived: 300,
    quantityRemaining: 280,
    quantityReserved: 20,
    location: 'Aisle 4, Shelf A',
    storageZone: 'Room Temperature',
    minStockLevel: 100,
    reorderPoint: 150,
    unitCost: 0.73,
    status: 'available',
    supplierName: 'AstraZeneca'
  },
  {
    id: '8',
    ndc: '00093-7184-01',
    drugName: 'Lisinopril 10mg',
    batchNumber: 'BTH-2024-008',
    lotNumber: 'LOT-L89012',
    expiryDate: '2025-04-10',
    quantityReceived: 400,
    quantityRemaining: 0,
    quantityReserved: 0,
    location: 'Aisle 2, Shelf D',
    storageZone: 'Room Temperature',
    minStockLevel: 150,
    reorderPoint: 200,
    unitCost: 0.10,
    status: 'out_of_stock',
    supplierName: 'Teva Distributor'
  }
];

const storageZones = ['All', 'Room Temperature', 'Refrigerated', 'Frozen'];
const statusFilters = ['All', 'available', 'low_stock', 'out_of_stock', 'expiring_soon', 'expired', 'quarantined'];

export default function InventoryModule() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedZone, setSelectedZone] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [showReorderOnly, setShowReorderOnly] = useState(false);
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<typeof mockInventory[0] | null>(null);
  const [activeTab, setActiveTab] = useState('inventory');

  const filteredInventory = useMemo(() => {
    return mockInventory.filter(item => {
      const matchesSearch = 
        item.drugName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.ndc.includes(searchTerm) ||
        item.lotNumber.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesZone = selectedZone === 'All' || item.storageZone === selectedZone;
      const matchesStatus = selectedStatus === 'All' || item.status === selectedStatus;
      const needsReorder = !showReorderOnly || item.quantityRemaining <= item.reorderPoint;

      return matchesSearch && matchesZone && matchesStatus && needsReorder;
    });
  }, [searchTerm, selectedZone, selectedStatus, showReorderOnly]);

  const stats = useMemo(() => {
    const total = mockInventory.length;
    const lowStock = mockInventory.filter(i => i.status === 'low_stock').length;
    const outOfStock = mockInventory.filter(i => i.status === 'out_of_stock').length;
    const expiring = mockInventory.filter(i => i.status === 'expiring_soon' || i.status === 'expired').length;
    const needsReorder = mockInventory.filter(i => i.quantityRemaining <= i.reorderPoint).length;
    const totalValue = mockInventory.reduce((sum, i) => sum + (i.quantityRemaining * i.unitCost), 0);

    return { total, lowStock, outOfStock, expiring, needsReorder, totalValue };
  }, []);

  const getStatusBadge = (status: string) => {
    const config: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
      available: { color: 'bg-emerald-500/20 text-emerald-300', icon: <CheckCircle className="w-3 h-3" />, label: 'Available' },
      low_stock: { color: 'bg-yellow-500/20 text-yellow-300', icon: <AlertTriangle className="w-3 h-3" />, label: 'Low Stock' },
      out_of_stock: { color: 'bg-red-500/20 text-red-300', icon: <XCircle className="w-3 h-3" />, label: 'Out of Stock' },
      expiring_soon: { color: 'bg-orange-500/20 text-orange-300', icon: <Clock className="w-3 h-3" />, label: 'Expiring Soon' },
      expired: { color: 'bg-red-600/20 text-red-400', icon: <XCircle className="w-3 h-3" />, label: 'Expired' },
      quarantined: { color: 'bg-purple-500/20 text-purple-300', icon: <AlertCircle className="w-3 h-3" />, label: 'Quarantined' }
    };

    const c = config[status] || config.available;
    return (
      <Badge className={`${c.color} flex items-center gap-1`}>
        {c.icon}
        {c.label}
      </Badge>
    );
  };

  const getStockPercentage = (item: typeof mockInventory[0]) => {
    const percentage = (item.quantityRemaining / item.quantityReceived) * 100;
    if (percentage > 50) return 'bg-emerald-500';
    if (percentage > 25) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="min-h-screen bg-[#050410] p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#10B981] to-[#059669] flex items-center justify-center">
              <Package className="w-5 h-5 text-white" />
            </div>
            Inventory Management
          </h1>
          <p className="text-[#10B981]/70 text-sm mt-1">
            Track stock levels, batches, and expiration dates
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="border-[rgba(16,185,129,0.3)] text-[#10B981]">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button className="bg-[#10B981] hover:bg-[#10B981]/80 text-white" onClick={() => setShowReceiveModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Receive Stock
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
        <Card className="bg-[rgba(16,185,129,0.03)] border-[rgba(16,185,129,0.15)]">
          <CardContent className="p-4">
            <p className="text-xs text-[#10B981]/70 uppercase">Total Items</p>
            <p className="text-2xl font-bold text-white">{stats.total}</p>
          </CardContent>
        </Card>
        <Card className="bg-[rgba(234,179,8,0.03)] border-[rgba(234,179,8,0.15)]">
          <CardContent className="p-4">
            <p className="text-xs text-yellow-400/70 uppercase">Low Stock</p>
            <p className="text-2xl font-bold text-yellow-400">{stats.lowStock}</p>
          </CardContent>
        </Card>
        <Card className="bg-[rgba(239,68,68,0.03)] border-[rgba(239,68,68,0.15)]">
          <CardContent className="p-4">
            <p className="text-xs text-red-400/70 uppercase">Out of Stock</p>
            <p className="text-2xl font-bold text-red-400">{stats.outOfStock}</p>
          </CardContent>
        </Card>
        <Card className="bg-[rgba(249,115,22,0.03)] border-[rgba(249,115,22,0.15)]">
          <CardContent className="p-4">
            <p className="text-xs text-orange-400/70 uppercase">Expiring/Expired</p>
            <p className="text-2xl font-bold text-orange-400">{stats.expiring}</p>
          </CardContent>
        </Card>
        <Card className="bg-[rgba(16,185,129,0.03)] border-[rgba(16,185,129,0.15)]">
          <CardContent className="p-4">
            <p className="text-xs text-[#10B981]/70 uppercase">Need Reorder</p>
            <p className="text-2xl font-bold text-[#10B981]">{stats.needsReorder}</p>
          </CardContent>
        </Card>
        <Card className="bg-[rgba(16,185,129,0.03)] border-[rgba(16,185,129,0.15)]">
          <CardContent className="p-4">
            <p className="text-xs text-[#10B981]/70 uppercase">Total Value</p>
            <p className="text-xl font-bold text-white font-mono">TT${stats.totalValue.toFixed(2)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-[rgba(16,185,129,0.03)] border-[rgba(16,185,129,0.15)] mb-6">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#10B981]/50 w-4 h-4" />
              <Input
                placeholder="Search by drug, NDC, or lot..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-[rgba(16,185,129,0.05)] border-[rgba(16,185,129,0.2)] text-white placeholder:text-white/40"
              />
            </div>
            <Select value={selectedZone} onValueChange={setSelectedZone}>
              <SelectTrigger className="bg-[rgba(16,185,129,0.05)] border-[rgba(16,185,129,0.2)] text-white">
                <SelectValue placeholder="Storage Zone" />
              </SelectTrigger>
              <SelectContent>
                {storageZones.map(zone => (
                  <SelectItem key={zone} value={zone}>{zone}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="bg-[rgba(16,185,129,0.05)] border-[rgba(16,185,129,0.2)] text-white">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {statusFilters.map(status => (
                  <SelectItem key={status} value={status}>
                    {status === 'All' ? 'All Status' : status.replace('_', ' ').toUpperCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <label className="flex items-center gap-2 text-sm text-white cursor-pointer">
              <input
                type="checkbox"
                checked={showReorderOnly}
                onChange={(e) => setShowReorderOnly(e.target.checked)}
                className="rounded border-[rgba(16,185,129,0.3)] bg-[rgba(16,185,129,0.05)]"
              />
              <AlertTriangle className="w-4 h-4 text-orange-400" />
              Show items needing reorder
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Inventory Table */}
      <Card className="bg-[rgba(16,185,129,0.03)] border-[rgba(16,185,129,0.15)]">
        <CardContent className="p-0">
          <ScrollArea className="h-[500px]">
            <Table>
              <TableHeader className="sticky top-0 bg-[#0A0820]">
                <TableRow className="border-b border-[rgba(16,185,129,0.1)] hover:bg-transparent">
                  <TableHead className="text-[#10B981]">Drug</TableHead>
                  <TableHead className="text-[#10B981]">Lot/Batch</TableHead>
                  <TableHead className="text-[#10B981]">Expiry</TableHead>
                  <TableHead className="text-[#10B981]">Stock Level</TableHead>
                  <TableHead className="text-[#10B981]">Location</TableHead>
                  <TableHead className="text-[#10B981]">Storage</TableHead>
                  <TableHead className="text-[#10B981]">Status</TableHead>
                  <TableHead className="text-[#10B981] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInventory.map((item) => (
                  <TableRow 
                    key={item.id}
                    className="border-b border-[rgba(16,185,129,0.05)] hover:bg-[rgba(16,185,129,0.05)]"
                  >
                    <TableCell className="text-white">
                      <div>
                        <p className="font-medium">{item.drugName}</p>
                        <p className="text-xs text-white/50 font-mono">{item.ndc}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-white/70">
                      <div>
                        <p className="font-mono text-xs">{item.lotNumber}</p>
                        <p className="text-xs text-white/40">{item.batchNumber}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-white">
                      <span className={`font-mono text-sm ${
                        item.status === 'expired' ? 'text-red-400' : 
                        item.status === 'expiring_soon' ? 'text-orange-400' : 'text-white'
                      }`}>
                        {new Date(item.expiryDate).toLocaleDateString()}
                      </span>
                    </TableCell>
                    <TableCell className="text-white">
                      <div className="w-32">
                        <div className="flex justify-between text-xs mb-1">
                          <span>{item.quantityRemaining} left</span>
                          <span className="text-white/40">/ {item.quantityReceived}</span>
                        </div>
                        <Progress 
                          value={(item.quantityRemaining / item.quantityReceived) * 100} 
                          className={`h-2 bg-[rgba(16,185,129,0.1)] ${getStockPercentage(item)}`}
                        />
                        {item.quantityRemaining <= item.reorderPoint && (
                          <p className="text-xs text-orange-400 mt-1">Reorder at {item.reorderPoint}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-white/70 text-sm">{item.location}</TableCell>
                    <TableCell className="text-white">
                      <div className="flex items-center gap-1">
                        {item.storageZone === 'Refrigerated' && <Snowflake className="w-4 h-4 text-blue-400" />}
                        {item.storageZone === 'Frozen' && <Thermometer className="w-4 h-4 text-purple-400" />}
                        <span className="text-sm">{item.storageZone}</span>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(item.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-1 justify-end">
                        <Button size="sm" variant="ghost" className="text-[#10B981] hover:bg-[rgba(16,185,129,0.1)]">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="text-[#10B981] hover:bg-[rgba(16,185,129,0.1)]">
                          <Edit2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Receive Stock Modal */}
      <Dialog open={showReceiveModal} onOpenChange={setShowReceiveModal}>
        <DialogContent className="bg-[#0A0820] border-[rgba(16,185,129,0.2)] text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-[#10B981]" />
              Receive New Stock
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <label className="text-sm text-white/70">NDC Code *</label>
              <Input className="bg-[rgba(16,185,129,0.05)] border-[rgba(16,185,129,0.2)] text-white" placeholder="Search or scan NDC" />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-white/70">Drug Name</label>
              <Input className="bg-[rgba(16,185,129,0.05)] border-[rgba(16,185,129,0.2)] text-white" disabled placeholder="Auto-filled" />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-white/70">Lot Number *</label>
              <Input className="bg-[rgba(16,185,129,0.05)] border-[rgba(16,185,129,0.2)] text-white" placeholder="Enter lot number" />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-white/70">Batch Number</label>
              <Input className="bg-[rgba(16,185,129,0.05)] border-[rgba(16,185,129,0.2)] text-white" placeholder="Enter batch number" />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-white/70">Quantity Received *</label>
              <Input type="number" className="bg-[rgba(16,185,129,0.05)] border-[rgba(16,185,129,0.2)] text-white" placeholder="0" />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-white/70">Expiration Date *</label>
              <Input type="date" className="bg-[rgba(16,185,129,0.05)] border-[rgba(16,185,129,0.2)] text-white" />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-white/70">Storage Location</label>
              <Input className="bg-[rgba(16,185,129,0.05)] border-[rgba(16,185,129,0.2)] text-white" placeholder="e.g., Aisle 3, Shelf B" />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-white/70">Storage Zone</label>
              <Select>
                <SelectTrigger className="bg-[rgba(16,185,129,0.05)] border-[rgba(16,185,129,0.2)] text-white">
                  <SelectValue placeholder="Select zone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Room Temperature">Room Temperature</SelectItem>
                  <SelectItem value="Refrigerated">Refrigerated</SelectItem>
                  <SelectItem value="Frozen">Frozen</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-white/70">Unit Cost (TT$)</label>
              <Input type="number" step="0.01" className="bg-[rgba(16,185,129,0.05)] border-[rgba(16,185,129,0.2)] text-white" placeholder="0.00" />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-white/70">Supplier</label>
              <Input className="bg-[rgba(16,185,129,0.05)] border-[rgba(16,185,129,0.2)] text-white" placeholder="Supplier name" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="border-[rgba(16,185,129,0.3)] text-[#10B981]" onClick={() => setShowReceiveModal(false)}>
              Cancel
            </Button>
            <Button className="bg-[#10B981] hover:bg-[#10B981]/80 text-white">
              Receive Stock
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
