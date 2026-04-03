'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Users,
  DollarSign,
  TrendingUp,
  Phone,
  Mail,
  MapPin,
  Plus,
  Search,
  Star,
  Calendar,
} from 'lucide-react';

const mockAgents = [
  { id: '1', code: 'AGT-001', firstName: 'Robert', lastName: 'Johnson', fullName: 'Robert Johnson', email: 'robert.j@agency.com', phone: '868-123-4567', licenseNumber: 'LIC-2024-001', licenseExpiry: '2025-03-15', commissionRate: 15, totalPolicies: 87, totalPremium: 450000, totalCommission: 67500, status: 'active' },
  { id: '2', code: 'AGT-002', firstName: 'Sarah', lastName: 'Williams', fullName: 'Sarah Williams', email: 'sarah.w@agency.com', phone: '868-234-5678', licenseNumber: 'LIC-2024-002', licenseExpiry: '2025-06-20', commissionRate: 12, totalPolicies: 65, totalPremium: 320000, totalCommission: 38400, status: 'active' },
  { id: '3', code: 'AGT-003', firstName: 'Michael', lastName: 'Brown', fullName: 'Michael Brown', email: 'michael.b@agency.com', phone: '868-345-6789', licenseNumber: 'LIC-2024-003', licenseExpiry: '2024-12-31', commissionRate: 10, totalPolicies: 42, totalPremium: 180000, totalCommission: 18000, status: 'active' },
  { id: '4', code: 'AGT-004', firstName: 'Lisa', lastName: 'Chen', fullName: 'Lisa Chen', email: 'lisa.c@agency.com', phone: '868-456-7890', licenseNumber: 'LIC-2023-004', licenseExpiry: '2024-09-30', commissionRate: 12, totalPolicies: 38, totalPremium: 150000, totalCommission: 18000, status: 'license_expiring' },
];

const mockAgencies = [
  { id: '1', code: 'AGY-001', name: 'Caribbean Insurance Brokers Ltd', email: 'info@caribbeanbrokers.com', phone: '868-623-4567', commissionRate: 18, totalPolicies: 234, totalPremium: 1250000, status: 'active' },
  { id: '2', code: 'AGY-002', name: 'TT Insurance Services', email: 'contact@ttins.com', phone: '868-627-8901', commissionRate: 15, totalPolicies: 156, totalPremium: 780000, status: 'active' },
];

export default function AgentManagement() {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-blue-500/5 border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-blue-400" />
              <div>
                <p className="text-2xl font-bold text-white">{mockAgents.length}</p>
                <p className="text-xs text-blue-300/60">Active Agents</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-cyan-500/5 border-cyan-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <DollarSign className="w-8 h-8 text-cyan-400" />
              <div>
                <p className="text-2xl font-bold text-white">TT${(mockAgents.reduce((s, a) => s + a.totalPremium, 0) / 1000).toFixed(0)}K</p>
                <p className="text-xs text-cyan-300/60">Total Premium</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-emerald-500/5 border-emerald-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-emerald-400" />
              <div>
                <p className="text-2xl font-bold text-white">TT${(mockAgents.reduce((s, a) => s + a.totalCommission, 0) / 1000).toFixed(0)}K</p>
                <p className="text-xs text-emerald-300/60">Commission Paid</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-orange-500/5 border-orange-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Calendar className="w-8 h-8 text-orange-400" />
              <div>
                <p className="text-2xl font-bold text-white">{mockAgents.filter(a => a.status === 'license_expiring').length}</p>
                <p className="text-xs text-orange-300/60">License Expiring</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="agents">
        <TabsList className="bg-slate-800/50 border border-slate-700">
          <TabsTrigger value="agents" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">Agents</TabsTrigger>
          <TabsTrigger value="agencies" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">Agencies</TabsTrigger>
          <TabsTrigger value="performance" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="agents">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="border-b border-slate-700">
              <div className="flex items-center justify-between">
                <CardTitle className="text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-400" />
                  Agent Management
                </CardTitle>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-4 h-4" />
                    <Input placeholder="Search agents..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 w-64 bg-slate-700/50 border-slate-600 text-white placeholder:text-white/40" />
                  </div>
                  <Button className="bg-blue-500 hover:bg-blue-600 text-white">
                    <Plus className="w-4 h-4 mr-2" />Add Agent
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {mockAgents.map((agent) => (
                  <div key={agent.id} className="p-4 rounded-lg bg-slate-700/30 border border-slate-600/50 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold">
                        {agent.firstName[0]}{agent.lastName[0]}
                      </div>
                      <div>
                        <p className="text-white font-medium">{agent.fullName}</p>
                        <p className="text-slate-400 text-sm">{agent.code} | License: {agent.licenseNumber}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-cyan-400 font-mono">TT${agent.totalPremium.toLocaleString()}</p>
                        <p className="text-slate-400 text-xs">Premium</p>
                      </div>
                      <div className="text-right">
                        <p className="text-emerald-400 font-mono">{agent.totalPolicies} policies</p>
                        <p className="text-slate-400 text-xs">{agent.commissionRate}% commission</p>
                      </div>
                      <Badge className={agent.status === 'active' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-orange-500/20 text-orange-300'}>
                        {agent.status === 'active' ? 'Active' : 'License Expiring'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="agencies">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-400" />
                Agency Management
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {mockAgencies.map((agency) => (
                  <div key={agency.id} className="p-4 rounded-lg bg-slate-700/30 border border-slate-600/50 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center">
                        <Users className="w-6 h-6 text-purple-400" />
                      </div>
                      <div>
                        <p className="text-white font-medium">{agency.name}</p>
                        <p className="text-slate-400 text-sm">{agency.code} | {agency.phone}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-cyan-400 font-mono">TT${agency.totalPremium.toLocaleString()}</p>
                        <p className="text-slate-400 text-xs">{agency.totalPolicies} policies</p>
                      </div>
                      <Badge className="bg-emerald-500/20 text-emerald-300">Active</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-400" />
                Agent Performance Leaderboard
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 text-center">
              <Star className="w-16 h-16 text-slate-500 mx-auto mb-4" />
              <p className="text-slate-400">Detailed performance analytics coming soon</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
