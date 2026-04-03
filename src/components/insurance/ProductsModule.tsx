'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Building2,
  Heart,
  Activity,
  Car,
  Home,
  Plane,
  Scale,
  Plus,
  Search,
  Settings,
  FileText,
  CheckCircle,
  Edit,
} from 'lucide-react';

const mockProducts = [
  { id: '1', code: 'TERM-20', name: 'Term Life 20 Year', nameEs: 'Seguro de Vida Temporal 20 Años', lob: 'LIFE', type: 'INDIVIDUAL', basePremium: 2.45, sumInsuredMin: 100000, sumInsuredMax: 5000000, entryAgeMin: 18, entryAgeMax: 65, status: 'active', policies: 234 },
  { id: '2', code: 'WHOLE-LIFE-65', name: 'Whole Life to 65', nameEs: 'Vida Entera hasta 65', lob: 'LIFE', type: 'INDIVIDUAL', basePremium: 8.75, sumInsuredMin: 50000, sumInsuredMax: 2000000, entryAgeMin: 18, entryAgeMax: 60, status: 'active', policies: 89 },
  { id: '3', code: 'COMPREHENSIVE-MOTOR', name: 'Comprehensive Motor', nameEs: 'Motor Comprensivo', lob: 'MOTOR', type: 'INDIVIDUAL', basePremium: 4.5, sumInsuredMin: 50000, sumInsuredMax: 2000000, entryAgeMin: null, entryAgeMax: null, status: 'active', policies: 312 },
  { id: '4', code: 'THIRD-PARTY-MOTOR', name: 'Third Party Motor', nameEs: 'Motor Terceros', lob: 'MOTOR', type: 'INDIVIDUAL', basePremium: 1.2, sumInsuredMin: null, sumInsuredMax: null, entryAgeMin: null, entryAgeMax: null, status: 'active', policies: 156 },
  { id: '5', code: 'HOMEOWNERS-PLUS', name: 'Homeowners Plus', nameEs: 'Propietarios Plus', lob: 'PROPERTY', type: 'INDIVIDUAL', basePremium: 0.85, sumInsuredMin: 500000, sumInsuredMax: 10000000, entryAgeMin: null, entryAgeMax: null, status: 'active', policies: 198 },
  { id: '6', code: 'HEALTH-EXECUTIVE', name: 'Executive Health Plan', nameEs: 'Plan de Salud Ejecutivo', lob: 'HEALTH', type: 'INDIVIDUAL', basePremium: 24000, sumInsuredMin: 500000, sumInsuredMax: 2000000, entryAgeMin: 18, entryAgeMax: 65, status: 'active', policies: 145 },
  { id: '7', code: 'MARINE-CARGO', name: 'Marine Cargo Insurance', nameEs: 'Seguro de Carga Marítima', lob: 'MARINE', type: 'CORPORATE', basePremium: 0.15, sumInsuredMin: 100000, sumInsuredMax: 50000000, entryAgeMin: null, entryAgeMax: null, status: 'active', policies: 56 },
  { id: '8', code: 'GENERAL-LIABILITY', name: 'General Liability', nameEs: 'Responsabilidad Civil General', lob: 'LIABILITY', type: 'CORPORATE', basePremium: 0.45, sumInsuredMin: 500000, sumInsuredMax: 10000000, entryAgeMin: null, entryAgeMax: null, status: 'active', policies: 50 },
];

const lobConfig = {
  LIFE: { icon: Heart, color: 'text-pink-400', bgColor: 'bg-pink-500/10' },
  HEALTH: { icon: Activity, color: 'text-emerald-400', bgColor: 'bg-emerald-500/10' },
  MOTOR: { icon: Car, color: 'text-blue-400', bgColor: 'bg-blue-500/10' },
  PROPERTY: { icon: Home, color: 'text-orange-400', bgColor: 'bg-orange-500/10' },
  MARINE: { icon: Plane, color: 'text-cyan-400', bgColor: 'bg-cyan-500/10' },
  LIABILITY: { icon: Scale, color: 'text-purple-400', bgColor: 'bg-purple-500/10' },
};

export default function ProductsModule() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLob, setSelectedLob] = useState('all');

  const filteredProducts = mockProducts.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLob = selectedLob === 'all' || p.lob === selectedLob;
    return matchesSearch && matchesLob;
  });

  return (
    <div className="space-y-6">
      {/* Stats by LOB */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
        {Object.entries(lobConfig).map(([key, config]) => {
          const count = mockProducts.filter(p => p.lob === key).length;
          const policies = mockProducts.filter(p => p.lob === key).reduce((s, p) => s + p.policies, 0);
          return (
            <Card key={key} className={`${config.bgColor} border-slate-700`}>
              <CardContent className="p-4 text-center">
                <config.icon className={`w-6 h-6 ${config.color} mx-auto mb-2`} />
                <p className="text-xl font-bold text-white">{count}</p>
                <p className="text-xs text-slate-400">{key}</p>
                <p className="text-xs text-slate-500">{policies} policies</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Products Table */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader className="border-b border-slate-700">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-400" />
              Product Management
            </CardTitle>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-4 h-4" />
                <Input placeholder="Search products..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 w-64 bg-slate-700/50 border-slate-600 text-white placeholder:text-white/40" />
              </div>
              <Tabs value={selectedLob} onValueChange={setSelectedLob}>
                <TabsList className="bg-slate-700/50">
                  <TabsTrigger value="all" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white text-xs">All</TabsTrigger>
                  {Object.keys(lobConfig).map((lob) => (
                    <TabsTrigger key={lob} value={lob} className="data-[state=active]:bg-blue-500 data-[state=active]:text-white text-xs">{lob}</TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
              <Button className="bg-blue-500 hover:bg-blue-600 text-white">
                <Plus className="w-4 h-4 mr-2" />New Product
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-3">
            {filteredProducts.map((product) => {
              const lobConf = lobConfig[product.lob as keyof typeof lobConfig];
              return (
                <div key={product.id} className="p-4 rounded-lg bg-slate-700/30 border border-slate-600/50 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-lg ${lobConf.bgColor} flex items-center justify-center`}>
                      <lobConf.icon className={`w-6 h-6 ${lobConf.color}`} />
                    </div>
                    <div>
                      <p className="text-white font-medium">{product.name}</p>
                      <p className="text-slate-400 text-sm">{product.code} | {product.nameEs}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-cyan-400 font-mono">{product.basePremium}%</p>
                      <p className="text-slate-400 text-xs">Base Rate</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white">{product.policies}</p>
                      <p className="text-slate-400 text-xs">Policies</p>
                    </div>
                    <div className="text-right">
                      <p className="text-slate-300 text-sm">{product.type}</p>
                      <p className="text-slate-400 text-xs">{product.entryAgeMin ? `${product.entryAgeMin}-${product.entryAgeMax} yrs` : 'All ages'}</p>
                    </div>
                    <Badge className="bg-emerald-500/20 text-emerald-300">Active</Badge>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="ghost" className="text-blue-400 hover:text-white hover:bg-blue-500/10">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="text-slate-400 hover:text-white hover:bg-slate-500/10">
                        <Settings className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
