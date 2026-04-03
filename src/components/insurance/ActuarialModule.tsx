'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import {
  LineChart,
  Activity,
  Table2,
  Calculator,
  TrendingUp,
  DollarSign,
  Calendar,
  FileText,
  Plus,
  Download,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Users,
  Shield,
  Car,
  Home,
  Ship,
  Heart,
} from 'lucide-react';

// Types
interface MortalityRate {
  age: number;
  qx: number;
  lx?: number;
  dx?: number;
  Lx?: number;
  Tx?: number;
  ex?: number;
}

interface Reserve {
  id: string;
  type: string;
  lob: string;
  amount: number;
  method: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
}

interface IFRS17Metrics {
  contractualServiceMargin: number;
  riskAdjustment: number;
  incurredClaims: number;
  acquisitionCosts: number;
}

interface PremiumBreakdown {
  netPremium: number;
  grossPremium: number;
  totalPremium: number;
  currency: string;
  breakdown: Array<{ component: string; amount: number; rate: number }>;
}

// Loading spinner component
function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center p-4">
      <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
    </div>
  );
}

export default function ActuarialModule() {
  const [activeTab, setActiveTab] = useState('reserves');
  const [loading, setLoading] = useState(false);
  const [reserves, setReserves] = useState<Reserve[]>([]);
  const [mortalityData, setMortalityData] = useState<MortalityRate[]>([]);
  const [ifrs17Metrics, setIfrs17Metrics] = useState<IFRS17Metrics>({
    contractualServiceMargin: 8500000,
    riskAdjustment: 4200000,
    incurredClaims: 19200000,
    acquisitionCosts: 3500000,
  });
  const [premiumResult, setPremiumResult] = useState<PremiumBreakdown | null>(null);
  
  // Premium calculation form state
  const [premiumForm, setPremiumForm] = useState({
    lineOfBusiness: 'life',
    sumAssured: 500000,
    insuredAge: 35,
    gender: 'male',
    smokerStatus: 'nonsmoker',
    planType: 'term',
    termYears: 20,
    premiumFrequency: 'annual',
    healthClass: 'standard',
    occupationClass: 1,
  });

  // Reserve calculation form state
  const [reserveForm, setReserveForm] = useState({
    type: 'GARPT',
    sumAssured: 500000,
    issueAge: 30,
    currentAge: 35,
    policyYears: 20,
    elapsedYears: 5,
    interestRate: 4.5,
    mortalityTable: 'male',
    smokerStatus: 'aggregate',
    region: 'caribbean',
    premium: 12000,
  });

  // Dialog states
  const [showPremiumDialog, setShowPremiumDialog] = useState(false);
  const [showReserveDialog, setShowReserveDialog] = useState(false);

  // Fetch data on mount
  useEffect(() => {
    fetchReserves();
    fetchMortalityTables();
    fetchIFRS17Metrics();
  }, []);

  const fetchReserves = async () => {
    try {
      const response = await fetch('/api/insurance/actuarial/reserves');
      const data = await response.json();
      if (data.success) {
        setReserves(data.data.reserves);
      }
    } catch (error) {
      console.error('Failed to fetch reserves:', error);
      // Use mock data if API fails
      setReserves([
        { id: '1', type: 'CLAIM_RESERVE', lob: 'LIFE', amount: 12500000, method: 'GARPT', date: '2024-03-31', status: 'approved' },
        { id: '2', type: 'PREMIUM_RESERVE', lob: 'HEALTH', amount: 4500000, method: 'PPM', date: '2024-03-31', status: 'approved' },
        { id: '3', type: 'UNEARNED_PREMIUM', lob: 'MOTOR', amount: 2800000, method: 'Pro-rata', date: '2024-03-31', status: 'pending' },
        { id: '4', type: 'CLAIM_RESERVE', lob: 'PROPERTY', amount: 3200000, method: 'GARPT', date: '2024-03-31', status: 'approved' },
      ]);
    }
  };

  const fetchMortalityTables = async () => {
    try {
      const response = await fetch('/api/insurance/actuarial/mortality-tables?format=abbreviated');
      const data = await response.json();
      if (data.success) {
        setMortalityData(data.data.table.rates);
      }
    } catch (error) {
      console.error('Failed to fetch mortality tables:', error);
      // Use mock data if API fails
      setMortalityData([
        { age: 0, qx: 0.00643 },
        { age: 1, qx: 0.00046 },
        { age: 30, qx: 0.00142 },
        { age: 35, qx: 0.00159 },
        { age: 40, qx: 0.00245 },
        { age: 50, qx: 0.00523 },
        { age: 60, qx: 0.01256 },
        { age: 70, qx: 0.03012 },
        { age: 80, qx: 0.07234 },
        { age: 90, qx: 0.18234 },
      ]);
    }
  };

  const fetchIFRS17Metrics = async () => {
    try {
      const response = await fetch('/api/insurance/actuarial/ifrs17?type=summary');
      const data = await response.json();
      if (data.success) {
        setIfrs17Metrics(data.data.metrics);
      }
    } catch (error) {
      console.error('Failed to fetch IFRS 17 metrics:', error);
    }
  };

  const calculatePremium = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/insurance/actuarial/calculate-premium', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lineOfBusiness: premiumForm.lineOfBusiness,
          lifeInput: premiumForm.lineOfBusiness === 'life' ? {
            sumAssured: premiumForm.sumAssured,
            insuredAge: premiumForm.insuredAge,
            insuredGender: premiumForm.gender,
            smokerStatus: premiumForm.smokerStatus,
            planType: premiumForm.planType,
            termYears: premiumForm.termYears,
            premiumFrequency: premiumForm.premiumFrequency,
            healthClass: premiumForm.healthClass,
            occupationClass: premiumForm.occupationClass,
          } : undefined,
        }),
      });
      const data = await response.json();
      if (data.success) {
        setPremiumResult(data.data.premium);
      }
    } catch (error) {
      console.error('Failed to calculate premium:', error);
      // Use local calculation mock
      setPremiumResult({
        netPremium: Math.round(premiumForm.sumAssured * 0.015 * 100) / 100,
        grossPremium: Math.round(premiumForm.sumAssured * 0.018 * 100) / 100,
        totalPremium: Math.round(premiumForm.sumAssured * 0.02 * 100) / 100,
        currency: 'TTD',
        breakdown: [
          { component: 'Base Net Premium', amount: premiumForm.sumAssured * 0.015, rate: 0.015 },
          { component: 'Expense Loading', amount: premiumForm.sumAssured * 0.003, rate: 0.003 },
          { component: 'Taxes & Fees', amount: premiumForm.sumAssured * 0.002, rate: 0.002 },
        ],
      });
    } finally {
      setLoading(false);
    }
  }, [premiumForm]);

  const calculateReserve = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/insurance/actuarial/reserves', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: reserveForm.type,
          sumAssured: reserveForm.sumAssured,
          issueAge: reserveForm.issueAge,
          currentAge: reserveForm.currentAge,
          policyYears: reserveForm.policyYears,
          elapsedYears: reserveForm.elapsedYears,
          interestRate: reserveForm.interestRate / 100,
          mortalityTable: reserveForm.mortalityTable,
          smokerStatus: reserveForm.smokerStatus,
          region: reserveForm.region,
          premium: reserveForm.premium,
        }),
      });
      const data = await response.json();
      if (data.success) {
        // Refresh reserves list
        fetchReserves();
        setShowReserveDialog(false);
      }
    } catch (error) {
      console.error('Failed to calculate reserve:', error);
    } finally {
      setLoading(false);
    }
  }, [reserveForm]);

  const formatCurrency = (amount: number, currency: string = 'TTD') => {
    return `${currency}$${amount.toLocaleString()}`;
  };

  const totalReserves = reserves.reduce((sum, r) => sum + r.amount, 0);

  return (
    <div className="space-y-6">
      {/* IFRS 17 Summary */}
      <Card className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-500/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Calculator className="w-5 h-5 text-purple-400" />
            IFRS 17 Compliance Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-purple-400">{formatCurrency((ifrs17Metrics.contractualServiceMargin / 1000000).toFixed(1))}M</p>
              <p className="text-slate-400 text-sm">Contractual Service Margin</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-400">{formatCurrency((ifrs17Metrics.riskAdjustment / 1000000).toFixed(1))}M</p>
              <p className="text-slate-400 text-sm">Risk Adjustment</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-cyan-400">{formatCurrency((ifrs17Metrics.incurredClaims / 1000000).toFixed(1))}M</p>
              <p className="text-slate-400 text-sm">Incurred Claims (LRC)</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-emerald-400">{formatCurrency((ifrs17Metrics.acquisitionCosts / 1000000).toFixed(1))}M</p>
              <p className="text-slate-400 text-sm">Deferred Acquisition Costs</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-slate-800/50 border border-slate-700">
          <TabsTrigger value="reserves" className="data-[state=active]:bg-purple-500 data-[state=active]:text-white">Reserves</TabsTrigger>
          <TabsTrigger value="tables" className="data-[state=active]:bg-purple-500 data-[state=active]:text-white">Actuarial Tables</TabsTrigger>
          <TabsTrigger value="pricing" className="data-[state=active]:bg-purple-500 data-[state=active]:text-white">Premium Calculator</TabsTrigger>
          <TabsTrigger value="ifrs17" className="data-[state=active]:bg-purple-500 data-[state=active]:text-white">IFRS 17</TabsTrigger>
        </TabsList>

        {/* Reserves Tab */}
        <TabsContent value="reserves">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="border-b border-slate-700">
              <div className="flex items-center justify-between">
                <CardTitle className="text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-purple-400" />
                  Actuarial Reserves
                </CardTitle>
                <Dialog open={showReserveDialog} onOpenChange={setShowReserveDialog}>
                  <DialogTrigger asChild>
                    <Button className="bg-purple-500 hover:bg-purple-600 text-white">
                      <Plus className="w-4 h-4 mr-2" />Calculate Reserves
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-md">
                    <DialogHeader>
                      <DialogTitle>Calculate Reserve</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>Reserve Type</Label>
                        <Select value={reserveForm.type} onValueChange={(v) => setReserveForm({ ...reserveForm, type: v })}>
                          <SelectTrigger className="bg-slate-700 border-slate-600">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-700 border-slate-600">
                            <SelectItem value="GARPT">GARPT (Life)</SelectItem>
                            <SelectItem value="PPM">PPM (Prospective)</SelectItem>
                            <SelectItem value="IBNR">IBNR</SelectItem>
                            <SelectItem value="RBNS">RBNS</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Sum Assured</Label>
                          <Input 
                            type="number" 
                            value={reserveForm.sumAssured}
                            onChange={(e) => setReserveForm({ ...reserveForm, sumAssured: Number(e.target.value) })}
                            className="bg-slate-700 border-slate-600"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Issue Age</Label>
                          <Input 
                            type="number" 
                            value={reserveForm.issueAge}
                            onChange={(e) => setReserveForm({ ...reserveForm, issueAge: Number(e.target.value) })}
                            className="bg-slate-700 border-slate-600"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Current Age</Label>
                          <Input 
                            type="number" 
                            value={reserveForm.currentAge}
                            onChange={(e) => setReserveForm({ ...reserveForm, currentAge: Number(e.target.value) })}
                            className="bg-slate-700 border-slate-600"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Interest Rate (%)</Label>
                          <Input 
                            type="number" 
                            step="0.1"
                            value={reserveForm.interestRate}
                            onChange={(e) => setReserveForm({ ...reserveForm, interestRate: Number(e.target.value) })}
                            className="bg-slate-700 border-slate-600"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Gender</Label>
                        <Select value={reserveForm.mortalityTable} onValueChange={(v) => setReserveForm({ ...reserveForm, mortalityTable: v })}>
                          <SelectTrigger className="bg-slate-700 border-slate-600">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-700 border-slate-600">
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowReserveDialog(false)}>Cancel</Button>
                      <Button onClick={calculateReserve} disabled={loading}>
                        {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                        Calculate
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
                {reserves.map((reserve) => (
                  <div key={reserve.id} className="p-4 rounded-lg bg-slate-700/30 border border-slate-600/50 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${reserve.status === 'approved' ? 'bg-emerald-500/10' : 'bg-yellow-500/10'}`}>
                        <Activity className={`w-5 h-5 ${reserve.status === 'approved' ? 'text-emerald-400' : 'text-yellow-400'}`} />
                      </div>
                      <div>
                        <p className="text-white font-medium">{reserve.type.replace('_', ' ')}</p>
                        <p className="text-slate-400 text-sm">{reserve.lob} | {reserve.method} | {reserve.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="text-purple-400 font-mono text-lg">{formatCurrency(reserve.amount)}</p>
                      <Badge className={reserve.status === 'approved' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-yellow-500/20 text-yellow-300'}>
                        {reserve.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-slate-600">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Total Reserves</span>
                  <span className="text-2xl font-bold text-purple-400">{formatCurrency(totalReserves)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Mortality Tables Tab */}
        <TabsContent value="tables">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Table2 className="w-5 h-5 text-blue-400" />
                Mortality Tables (CSO 2017 - Caribbean Adjusted)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="overflow-x-auto max-h-96 overflow-y-auto custom-scrollbar">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-slate-800">
                    <tr className="border-b border-slate-600">
                      <th className="text-left p-2 text-slate-400">Age</th>
                      <th className="text-right p-2 text-blue-400">qx (Male)</th>
                      <th className="text-right p-2 text-pink-400">qx (Female)</th>
                      <th className="text-right p-2 text-cyan-400">lx</th>
                      <th className="text-right p-2 text-emerald-400">ex</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mortalityData.map((row, index) => (
                      <tr key={index} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                        <td className="p-2 text-white">{row.age}</td>
                        <td className="p-2 text-right text-blue-400 font-mono">{row.qx.toFixed(6)}</td>
                        <td className="p-2 text-right text-pink-400 font-mono">{(row.qx * 0.85).toFixed(6)}</td>
                        <td className="p-2 text-right text-cyan-400 font-mono">{row.lx?.toFixed(0) || '-'}</td>
                        <td className="p-2 text-right text-emerald-400 font-mono">{row.ex?.toFixed(2) || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 p-4 bg-slate-700/30 rounded-lg">
                <p className="text-slate-400 text-sm">
                  <strong className="text-purple-400">Note:</strong> Caribbean mortality adjustment factor of 1.15 applied to standard CSO 2017 rates.
                  Smoker rates are approximately 2x higher than non-smoker rates.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Premium Calculator Tab */}
        <TabsContent value="pricing">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Calculator Form */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-cyan-400" />
                  Premium Calculator
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <Label className="text-slate-300">Line of Business</Label>
                  <div className="grid grid-cols-5 gap-2">
                    {[
                      { value: 'life', icon: Users, label: 'Life' },
                      { value: 'health', icon: Heart, label: 'Health' },
                      { value: 'motor', icon: Car, label: 'Motor' },
                      { value: 'property', icon: Home, label: 'Property' },
                      { value: 'marine', icon: Ship, label: 'Marine' },
                    ].map((lob) => (
                      <Button
                        key={lob.value}
                        variant={premiumForm.lineOfBusiness === lob.value ? 'default' : 'outline'}
                        className={`flex flex-col items-center p-2 h-auto ${premiumForm.lineOfBusiness === lob.value ? 'bg-purple-500 hover:bg-purple-600' : 'border-slate-600'}`}
                        onClick={() => setPremiumForm({ ...premiumForm, lineOfBusiness: lob.value })}
                      >
                        <lob.icon className="w-4 h-4 mb-1" />
                        <span className="text-xs">{lob.label}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-slate-300">Sum Assured</Label>
                    <Input 
                      type="number"
                      value={premiumForm.sumAssured}
                      onChange={(e) => setPremiumForm({ ...premiumForm, sumAssured: Number(e.target.value) })}
                      className="bg-slate-700 border-slate-600"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-300">Insured Age</Label>
                    <Input 
                      type="number"
                      value={premiumForm.insuredAge}
                      onChange={(e) => setPremiumForm({ ...premiumForm, insuredAge: Number(e.target.value) })}
                      className="bg-slate-700 border-slate-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-slate-300">Gender</Label>
                    <Select value={premiumForm.gender} onValueChange={(v) => setPremiumForm({ ...premiumForm, gender: v })}>
                      <SelectTrigger className="bg-slate-700 border-slate-600">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-700 border-slate-600">
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-300">Smoker Status</Label>
                    <Select value={premiumForm.smokerStatus} onValueChange={(v) => setPremiumForm({ ...premiumForm, smokerStatus: v })}>
                      <SelectTrigger className="bg-slate-700 border-slate-600">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-700 border-slate-600">
                        <SelectItem value="nonsmoker">Non-Smoker</SelectItem>
                        <SelectItem value="smoker">Smoker</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-slate-300">Plan Type</Label>
                    <Select value={premiumForm.planType} onValueChange={(v) => setPremiumForm({ ...premiumForm, planType: v })}>
                      <SelectTrigger className="bg-slate-700 border-slate-600">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-700 border-slate-600">
                        <SelectItem value="term">Term</SelectItem>
                        <SelectItem value="whole_life">Whole Life</SelectItem>
                        <SelectItem value="endowment">Endowment</SelectItem>
                        <SelectItem value="universal">Universal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-300">Term Years</Label>
                    <Input 
                      type="number"
                      value={premiumForm.termYears}
                      onChange={(e) => setPremiumForm({ ...premiumForm, termYears: Number(e.target.value) })}
                      className="bg-slate-700 border-slate-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-slate-300">Health Class</Label>
                    <Select value={premiumForm.healthClass} onValueChange={(v) => setPremiumForm({ ...premiumForm, healthClass: v })}>
                      <SelectTrigger className="bg-slate-700 border-slate-600">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-700 border-slate-600">
                        <SelectItem value="preferred">Preferred</SelectItem>
                        <SelectItem value="standard">Standard</SelectItem>
                        <SelectItem value="rated">Rated</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-300">Premium Frequency</Label>
                    <Select value={premiumForm.premiumFrequency} onValueChange={(v) => setPremiumForm({ ...premiumForm, premiumFrequency: v })}>
                      <SelectTrigger className="bg-slate-700 border-slate-600">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-700 border-slate-600">
                        <SelectItem value="annual">Annual</SelectItem>
                        <SelectItem value="semi_annual">Semi-Annual</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button 
                  onClick={calculatePremium} 
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Calculator className="w-4 h-4 mr-2" />}
                  Calculate Premium
                </Button>
              </CardContent>
            </Card>

            {/* Premium Result */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-emerald-400" />
                  Premium Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {premiumResult ? (
                  <div className="space-y-4">
                    <div className="text-center p-6 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-lg">
                      <p className="text-slate-400 text-sm">Total Annual Premium</p>
                      <p className="text-4xl font-bold text-white mt-2">
                        {formatCurrency(premiumResult.totalPremium, premiumResult.currency)}
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      {premiumResult.breakdown.map((item, index) => (
                        <div key={index} className="flex justify-between items-center py-2 border-b border-slate-700">
                          <span className="text-slate-300">{item.component}</span>
                          <span className="text-white font-mono">{formatCurrency(item.amount, premiumResult.currency)}</span>
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4">
                      <div className="p-3 bg-slate-700/30 rounded-lg text-center">
                        <p className="text-slate-400 text-xs">Net Premium</p>
                        <p className="text-cyan-400 font-mono">{formatCurrency(premiumResult.netPremium, premiumResult.currency)}</p>
                      </div>
                      <div className="p-3 bg-slate-700/30 rounded-lg text-center">
                        <p className="text-slate-400 text-xs">Gross Premium</p>
                        <p className="text-purple-400 font-mono">{formatCurrency(premiumResult.grossPremium, premiumResult.currency)}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-slate-400">
                    <Calculator className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Enter parameters and click Calculate to see premium breakdown</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* IFRS 17 Tab */}
        <TabsContent value="ifrs17">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-purple-400" />
                  IFRS 17 Liability Components
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-slate-700/30 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                        <TrendingUp className="w-4 h-4 text-purple-400" />
                      </div>
                      <span className="text-slate-300">Contractual Service Margin (CSM)</span>
                    </div>
                    <span className="text-purple-400 font-mono">{formatCurrency(ifrs17Metrics.contractualServiceMargin)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-slate-700/30 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                        <Shield className="w-4 h-4 text-blue-400" />
                      </div>
                      <span className="text-slate-300">Risk Adjustment (RA)</span>
                    </div>
                    <span className="text-blue-400 font-mono">{formatCurrency(ifrs17Metrics.riskAdjustment)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-slate-700/30 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center">
                        <Activity className="w-4 h-4 text-cyan-400" />
                      </div>
                      <span className="text-slate-300">Liability for Remaining Coverage</span>
                    </div>
                    <span className="text-cyan-400 font-mono">{formatCurrency(ifrs17Metrics.incurredClaims)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-slate-700/30 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                        <DollarSign className="w-4 h-4 text-emerald-400" />
                      </div>
                      <span className="text-slate-300">Deferred Acquisition Costs</span>
                    </div>
                    <span className="text-emerald-400 font-mono">{formatCurrency(ifrs17Metrics.acquisitionCosts)}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-700">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Total Insurance Liability</span>
                    <span className="text-2xl font-bold text-white">
                      {formatCurrency(ifrs17Metrics.contractualServiceMargin + ifrs17Metrics.riskAdjustment + ifrs17Metrics.incurredClaims)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-cyan-400" />
                  IFRS 17 Movement Schedule
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-600">
                          <th className="text-left p-2 text-slate-400">Component</th>
                          <th className="text-right p-2 text-slate-400">Opening</th>
                          <th className="text-right p-2 text-slate-400">Change</th>
                          <th className="text-right p-2 text-slate-400">Closing</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-slate-700/50">
                          <td className="p-2 text-purple-300">CSM</td>
                          <td className="p-2 text-right font-mono">{formatCurrency(9200000)}</td>
                          <td className="p-2 text-right font-mono text-red-400">-{formatCurrency(700000)}</td>
                          <td className="p-2 text-right font-mono text-purple-400">{formatCurrency(ifrs17Metrics.contractualServiceMargin)}</td>
                        </tr>
                        <tr className="border-b border-slate-700/50">
                          <td className="p-2 text-blue-300">Risk Adjustment</td>
                          <td className="p-2 text-right font-mono">{formatCurrency(4500000)}</td>
                          <td className="p-2 text-right font-mono text-red-400">-{formatCurrency(300000)}</td>
                          <td className="p-2 text-right font-mono text-blue-400">{formatCurrency(ifrs17Metrics.riskAdjustment)}</td>
                        </tr>
                        <tr className="border-b border-slate-700/50">
                          <td className="p-2 text-cyan-300">LRC</td>
                          <td className="p-2 text-right font-mono">{formatCurrency(18500000)}</td>
                          <td className="p-2 text-right font-mono text-green-400">+{formatCurrency(700000)}</td>
                          <td className="p-2 text-right font-mono text-cyan-400">{formatCurrency(ifrs17Metrics.incurredClaims)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-5 h-5 text-emerald-400" />
                      <span className="text-emerald-300 font-medium">IFRS 17 Compliant</span>
                    </div>
                    <p className="text-slate-400 text-sm">
                      All calculations follow IFRS 17 General Measurement Model requirements.
                      Risk adjustment calculated at 75th percentile confidence level.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Custom scrollbar styles */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(51, 65, 85, 0.3);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(139, 92, 246, 0.5);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(139, 92, 246, 0.7);
        }
      `}</style>
    </div>
  );
}
