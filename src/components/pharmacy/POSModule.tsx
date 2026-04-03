'use client';

import React, { useState, useMemo } from 'react';
import {
  ShoppingCart,
  CreditCard,
  CashIcon,
  Receipt,
  User,
  Search,
  Plus,
  Minus,
  Trash2,
  Printer,
  CheckCircle,
  XCircle,
  Barcode,
  DollarSign,
  Percent,
  Shield,
  Calculator,
  Wallet,
  CardIcon
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
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
import { Separator } from '@/components/ui/separator';

// Mock data
const mockPatients = [
  { id: 'PAT-001', name: 'Maria Garcia', phone: '(868) 555-0101', copay: 25.00 },
  { id: 'PAT-002', name: 'Carlos Rodriguez', phone: '(868) 555-0102', copay: 15.00 },
  { id: 'PAT-003', name: 'Ana Martinez', phone: '(868) 555-0103', copay: 0 },
];

const mockReadyPrescriptions = [
  { 
    id: 'RX-001', 
    rxNumber: 'RX-2024-001234', 
    patientId: 'PAT-001', 
    patientName: 'Maria Garcia',
    items: [
      { drug: 'Atorvastatin 20mg', quantity: 30, unitPrice: 1.50, total: 45.00 }
    ],
    status: 'ready',
    insurance: 'National Insurance',
    copay: 25.00,
    total: 45.00
  },
  { 
    id: 'RX-002', 
    rxNumber: 'RX-2024-001235', 
    patientId: 'PAT-002', 
    patientName: 'Carlos Rodriguez',
    items: [
      { drug: 'Metformin 850mg', quantity: 60, unitPrice: 0.75, total: 45.00 },
      { drug: 'Omeprazole 20mg', quantity: 30, unitPrice: 1.25, total: 37.50 }
    ],
    status: 'ready',
    insurance: 'Green Shield',
    copay: 15.00,
    total: 82.50
  },
  { 
    id: 'RX-003', 
    rxNumber: 'RX-2024-001236', 
    patientId: 'PAT-003', 
    patientName: 'Ana Martinez',
    items: [
      { drug: 'Amoxicillin 500mg', quantity: 21, unitPrice: 1.00, total: 21.00 }
    ],
    status: 'ready',
    insurance: null,
    copay: 0,
    total: 21.00
  },
];

const paymentMethods = [
  { id: 'cash', name: 'Cash', icon: <DollarSign className="w-5 h-5" /> },
  { id: 'card', name: 'Credit/Debit Card', icon: <CreditCard className="w-5 h-5" /> },
  { id: 'insurance', name: 'Insurance', icon: <Shield className="w-5 h-5" /> },
  { id: 'mixed', name: 'Split Payment', icon: <Wallet className="w-5 h-5" /> },
];

export default function POSModule() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<typeof mockPatients[0] | null>(null);
  const [cart, setCart] = useState<typeof mockReadyPrescriptions[0]['items']>([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('cash');
  const [cashReceived, setCashReceived] = useState('');
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [activeTab, setActiveTab] = useState('queue');

  const addToCart = (prescription: typeof mockReadyPrescriptions[0]) => {
    setCart(prev => [...prev, ...prescription.items]);
  };

  const removeFromCart = (index: number) => {
    setCart(prev => prev.filter((_, i) => i !== index));
  };

  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.total, 0);
  }, [cart]);

  const tax = subtotal * 0.125; // 12.5% VAT for Trinidad
  const total = subtotal + tax;

  const change = useMemo(() => {
    const received = parseFloat(cashReceived) || 0;
    return Math.max(0, received - total);
  }, [cashReceived, total]);

  const filteredPrescriptions = useMemo(() => {
    return mockReadyPrescriptions.filter(rx => 
      rx.rxNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rx.patientName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  return (
    <div className="min-h-screen bg-[#050410] p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#10B981] to-[#059669] flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-white" />
            </div>
            Point of Sale
          </h1>
          <p className="text-[#10B981]/70 text-sm mt-1">
            Process sales and insurance claims
          </p>
        </div>
        <Button variant="outline" className="border-[rgba(16,185,129,0.3)] text-[#10B981]">
          <Printer className="w-4 h-4 mr-2" />
          Last Receipt
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Ready Prescriptions Queue */}
        <div className="lg:col-span-1">
          <Card className="bg-[rgba(16,185,129,0.03)] border-[rgba(16,185,129,0.15)]">
            <CardHeader className="border-b border-[rgba(16,185,129,0.1)]">
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <Receipt className="w-4 h-4 text-[#10B981]" />
                Ready for Pickup ({filteredPrescriptions.length})
              </CardTitle>
              <div className="relative mt-2">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#10B981]/50 w-4 h-4" />
                <Input
                  placeholder="Search Rx# or patient..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-[rgba(16,185,129,0.05)] border-[rgba(16,185,129,0.2)] text-white placeholder:text-white/40"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[500px]">
                {filteredPrescriptions.map((rx) => (
                  <div 
                    key={rx.id}
                    className="p-4 border-b border-[rgba(16,185,129,0.05)] hover:bg-[rgba(16,185,129,0.05)] cursor-pointer"
                    onClick={() => addToCart(rx)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-[#10B981] text-sm">{rx.rxNumber}</span>
                      <Badge className="bg-emerald-500/20 text-emerald-300 text-xs">Ready</Badge>
                    </div>
                    <p className="text-white font-medium">{rx.patientName}</p>
                    <div className="mt-2 text-xs text-white/50">
                      {rx.items.map((item, idx) => (
                        <p key={idx}>{item.drug} x{item.quantity}</p>
                      ))}
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-white/50 text-xs">{rx.insurance || 'Cash Pay'}</span>
                      <span className="text-white font-mono">TT${rx.total.toFixed(2)}</span>
                    </div>
                    <Button size="sm" className="w-full mt-2 bg-[#10B981] hover:bg-[#10B981]/80 text-white">
                      Add to Cart
                    </Button>
                  </div>
                ))}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Cart & Payment */}
        <div className="lg:col-span-2 space-y-6">
          {/* Cart */}
          <Card className="bg-[rgba(16,185,129,0.03)] border-[rgba(16,185,129,0.15)]">
            <CardHeader className="border-b border-[rgba(16,185,129,0.1)]">
              <CardTitle className="text-white flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-[#10B981]" />
                Cart ({cart.length} items)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {cart.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingCart className="w-12 h-12 text-white/20 mx-auto mb-3" />
                  <p className="text-white/50">No items in cart</p>
                  <p className="text-white/30 text-sm">Select a prescription from the queue to add</p>
                </div>
              ) : (
                <ScrollArea className="h-[200px]">
                  {cart.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between py-2 border-b border-[rgba(16,185,129,0.05)]">
                      <div className="flex-1">
                        <p className="text-white text-sm">{item.drug}</p>
                        <p className="text-white/50 text-xs">Qty: {item.quantity} @ TT${item.unitPrice.toFixed(2)}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-white font-mono">TT${item.total.toFixed(2)}</span>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="text-red-400 hover:bg-red-500/10"
                          onClick={() => removeFromCart(idx)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </ScrollArea>
              )}

              {/* Totals */}
              {cart.length > 0 && (
                <div className="mt-4 space-y-2">
                  <Separator className="bg-[rgba(16,185,129,0.1)]" />
                  <div className="flex justify-between text-sm">
                    <span className="text-white/70">Subtotal</span>
                    <span className="text-white font-mono">TT${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/70">VAT (12.5%)</span>
                    <span className="text-white font-mono">TT${tax.toFixed(2)}</span>
                  </div>
                  <Separator className="bg-[rgba(16,185,129,0.1)]" />
                  <div className="flex justify-between text-lg">
                    <span className="text-white font-semibold">Total</span>
                    <span className="text-[#10B981] font-bold font-mono">TT${total.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment Method */}
          <Card className="bg-[rgba(16,185,129,0.03)] border-[rgba(16,185,129,0.15)]">
            <CardHeader className="border-b border-[rgba(16,185,129,0.1)]">
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#10B981]" />
                Payment Method
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
                {paymentMethods.map((method) => (
                  <Button
                    key={method.id}
                    variant={selectedPaymentMethod === method.id ? 'default' : 'outline'}
                    className={`h-16 flex flex-col gap-1 ${
                      selectedPaymentMethod === method.id 
                        ? 'bg-[#10B981] hover:bg-[#10B981]/80 text-white' 
                        : 'border-[rgba(16,185,129,0.2)] text-[#10B981] hover:bg-[rgba(16,185,129,0.1)]'
                    }`}
                    onClick={() => setSelectedPaymentMethod(method.id)}
                  >
                    {method.icon}
                    <span className="text-xs">{method.name}</span>
                  </Button>
                ))}
              </div>

              {selectedPaymentMethod === 'cash' && (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-white/70 mb-2 block">Cash Received</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50">TT$</span>
                      <Input
                        type="number"
                        value={cashReceived}
                        onChange={(e) => setCashReceived(e.target.value)}
                        className="pl-10 bg-[rgba(16,185,129,0.05)] border-[rgba(16,185,129,0.2)] text-white text-xl font-mono"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {[20, 50, 100, 200].map((amount) => (
                      <Button
                        key={amount}
                        variant="outline"
                        className="border-[rgba(16,185,129,0.2)] text-[#10B981]"
                        onClick={() => setCashReceived(amount.toString())}
                      >
                        TT${amount}
                      </Button>
                    ))}
                  </div>
                  {parseFloat(cashReceived) >= total && (
                    <div className="p-4 rounded-lg bg-[#10B981]/10 border border-[#10B981]/20 text-center">
                      <p className="text-white/70 text-sm">Change Due</p>
                      <p className="text-3xl font-bold text-[#10B981] font-mono">TT${change.toFixed(2)}</p>
                    </div>
                  )}
                </div>
              )}

              {selectedPaymentMethod === 'card' && (
                <div className="p-4 rounded-lg bg-[rgba(16,185,129,0.05)] border border-[rgba(16,185,129,0.1)] text-center">
                  <CreditCard className="w-12 h-12 text-[#10B981]/50 mx-auto mb-2" />
                  <p className="text-white/50">Swipe, insert, or tap card on terminal</p>
                  <Button className="mt-4 bg-[#10B981] hover:bg-[#10B981]/80 text-white">
                    Confirm Payment
                  </Button>
                </div>
              )}

              {selectedPaymentMethod === 'insurance' && (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-white/70 mb-2 block">Select Insurance</label>
                    <Select>
                      <SelectTrigger className="bg-[rgba(16,185,129,0.05)] border-[rgba(16,185,129,0.2)] text-white">
                        <SelectValue placeholder="Select payer" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="national">National Insurance</SelectItem>
                        <SelectItem value="green">Green Shield</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 rounded-lg bg-[rgba(16,185,129,0.05)] border border-[rgba(16,185,129,0.1)]">
                      <p className="text-xs text-white/50">Copay</p>
                      <p className="text-xl font-bold text-white font-mono">TT$25.00</p>
                    </div>
                    <div className="p-3 rounded-lg bg-[rgba(16,185,129,0.05)] border border-[rgba(16,185,129,0.1)]">
                      <p className="text-xs text-white/50">Insurance Pays</p>
                      <p className="text-xl font-bold text-[#10B981] font-mono">TT${(total - 25).toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              className="flex-1 border-[rgba(16,185,129,0.3)] text-[#10B981]"
              onClick={() => setCart([])}
            >
              <XCircle className="w-4 h-4 mr-2" />
              Clear Cart
            </Button>
            <Button 
              className="flex-2 bg-[#10B981] hover:bg-[#10B981]/80 text-white px-8"
              disabled={cart.length === 0 || (selectedPaymentMethod === 'cash' && parseFloat(cashReceived) < total)}
              onClick={() => setShowReceiptModal(true)}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Complete Sale - TT${total.toFixed(2)}
            </Button>
          </div>
        </div>
      </div>

      {/* Receipt Modal */}
      <Dialog open={showReceiptModal} onOpenChange={setShowReceiptModal}>
        <DialogContent className="bg-[#0A0820] border-[rgba(16,185,129,0.2)] text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-[#10B981]" />
              Transaction Complete
            </DialogTitle>
          </DialogHeader>
          <div className="p-4 bg-white text-black rounded-lg font-mono text-sm">
            <div className="text-center mb-4">
              <p className="font-bold text-lg">NEXUS PHARMACY</p>
              <p className="text-xs text-gray-500">123 Frederick Street</p>
              <p className="text-xs text-gray-500">Port of Spain, Trinidad</p>
            </div>
            <Separator className="my-2" />
            <div className="space-y-1 text-xs">
              {cart.map((item, idx) => (
                <div key={idx} className="flex justify-between">
                  <span>{item.drug}</span>
                  <span>TT${item.total.toFixed(2)}</span>
                </div>
              ))}
            </div>
            <Separator className="my-2" />
            <div className="text-xs space-y-1">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>TT${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>VAT (12.5%)</span>
                <span>TT${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>TOTAL</span>
                <span>TT${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Cash</span>
                <span>TT${cashReceived}</span>
              </div>
              <div className="flex justify-between">
                <span>Change</span>
                <span>TT${change.toFixed(2)}</span>
              </div>
            </div>
            <Separator className="my-2" />
            <p className="text-center text-xs text-gray-500">Thank you for your purchase!</p>
          </div>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" className="border-[rgba(16,185,129,0.3)] text-[#10B981]">
              <Printer className="w-4 h-4 mr-2" />
              Print
            </Button>
            <Button className="bg-[#10B981] hover:bg-[#10B981]/80 text-white" onClick={() => {
              setShowReceiptModal(false);
              setCart([]);
              setCashReceived('');
            }}>
              New Sale
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
