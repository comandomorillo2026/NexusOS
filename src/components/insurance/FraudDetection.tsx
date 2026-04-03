'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Brain,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Activity,
  Shield,
  Eye,
  Settings,
  Zap,
  BarChart3,
} from 'lucide-react';

const fraudIndicators = [
  { code: 'FI-001', name: 'Late Claim Reporting', category: 'CLAIM_FRAUD', weight: 0.8, threshold: 30, description: 'Claims reported >30 days after occurrence' },
  { code: 'FI-002', name: 'Multiple Similar Claims', category: 'CLAIM_FRAUD', weight: 1.2, threshold: 3, description: 'Multiple claims with similar characteristics' },
  { code: 'FI-003', name: 'High Value vs Policy', category: 'CLAIM_FRAUD', weight: 1.0, threshold: 0.7, description: 'Claim amount >70% of sum insured' },
  { code: 'FI-004', name: 'New Policy Claims', category: 'CLAIM_FRAUD', weight: 0.6, threshold: 90, description: 'Claims within 90 days of policy inception' },
  { code: 'FI-005', name: 'Inflated Estimates', category: 'CLAIM_FRAUD', weight: 0.9, threshold: 1.5, description: 'Repair estimates >1.5x market average' },
  { code: 'FI-006', name: 'Address Anomalies', category: 'APPLICATION_FRAUD', weight: 0.7, threshold: null, description: 'Multiple policies at same address' },
];

const aiModels = [
  { name: 'Claim Fraud Detection', version: 'v2.3', accuracy: 94.2, precision: 91.8, recall: 89.5, status: 'active', lastTrained: '2024-03-01' },
  { name: 'Underwriting Risk Scoring', version: 'v1.8', accuracy: 87.5, precision: 85.2, recall: 88.1, status: 'active', lastTrained: '2024-02-15' },
  { name: 'Lapse Prediction', version: 'v1.2', accuracy: 82.3, precision: 79.8, recall: 84.2, status: 'active', lastTrained: '2024-01-20' },
];

const recentAlerts = [
  { id: 1, type: 'HIGH_RISK', claimNumber: 'CLM-2024-000341', score: 0.78, flags: ['Late reporting', 'Multiple similar claims', 'High value'], status: 'pending_review' },
  { id: 2, type: 'MEDIUM_RISK', claimNumber: 'CLM-2024-000339', score: 0.35, flags: ['New policy claim'], status: 'cleared' },
  { id: 3, type: 'HIGH_RISK', policyNumber: 'POL-2024-001248', score: 0.62, flags: ['Address anomaly', 'Multiple applications'], status: 'under_investigation' },
];

export default function FraudDetection() {
  return (
    <div className="space-y-6">
      {/* AI Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-amber-500/5 border-amber-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Brain className="w-8 h-8 text-amber-400" />
              <div>
                <p className="text-2xl font-bold text-white">3</p>
                <p className="text-xs text-amber-300/60">AI Models Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-red-500/5 border-red-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-8 h-8 text-red-400" />
              <div>
                <p className="text-2xl font-bold text-white">2</p>
                <p className="text-xs text-red-300/60">High Risk Alerts</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-emerald-500/5 border-emerald-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-emerald-400" />
              <div>
                <p className="text-2xl font-bold text-white">94.2%</p>
                <p className="text-xs text-emerald-300/60">Detection Accuracy</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-cyan-500/5 border-cyan-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-cyan-400" />
              <div>
                <p className="text-2xl font-bold text-white">TT$1.2M</p>
                <p className="text-xs text-cyan-300/60">Fraud Prevented YTD</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="alerts">
        <TabsList className="bg-slate-800/50 border border-slate-700">
          <TabsTrigger value="alerts" className="data-[state=active]:bg-amber-500 data-[state=active]:text-white">Live Alerts</TabsTrigger>
          <TabsTrigger value="models" className="data-[state=active]:bg-amber-500 data-[state=active]:text-white">AI Models</TabsTrigger>
          <TabsTrigger value="indicators" className="data-[state=active]:bg-amber-500 data-[state=active]:text-white">Fraud Indicators</TabsTrigger>
          <TabsTrigger value="analytics" className="data-[state=active]:bg-amber-500 data-[state=active]:text-white">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="alerts">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                Real-time Fraud Alerts
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {recentAlerts.map((alert) => (
                  <div key={alert.id} className={`p-4 rounded-lg border ${
                    alert.type === 'HIGH_RISK' ? 'bg-red-500/5 border-red-500/30' : 'bg-yellow-500/5 border-yellow-500/30'
                  }`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          alert.type === 'HIGH_RISK' ? 'bg-red-500/10' : 'bg-yellow-500/10'
                        }`}>
                          <AlertTriangle className={`w-5 h-5 ${alert.type === 'HIGH_RISK' ? 'text-red-400' : 'text-yellow-400'}`} />
                        </div>
                        <div>
                          <p className="text-white font-medium">
                            {alert.claimNumber || alert.policyNumber}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Progress value={alert.score * 100} className={`h-2 w-20 ${alert.score > 0.5 ? 'bg-red-500' : 'bg-yellow-500'}`} />
                            <span className={`text-sm ${alert.score > 0.5 ? 'text-red-400' : 'text-yellow-400'}`}>
                              {(alert.score * 100).toFixed(0)}% Risk
                            </span>
                          </div>
                        </div>
                      </div>
                      <Badge className={
                        alert.status === 'pending_review' ? 'bg-orange-500/20 text-orange-300' :
                        alert.status === 'cleared' ? 'bg-emerald-500/20 text-emerald-300' :
                        'bg-red-500/20 text-red-300'
                      }>
                        {alert.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {alert.flags.map((flag, i) => (
                        <Badge key={i} className="bg-slate-600/30 text-slate-300 text-xs">{flag}</Badge>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                      <Button size="sm" className="bg-blue-500 hover:bg-blue-600 text-white">
                        <Eye className="w-4 h-4 mr-2" />Review
                      </Button>
                      <Button size="sm" variant="outline" className="border-slate-600 text-slate-300">
                        <Zap className="w-4 h-4 mr-2" />Quick Action
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="models">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-400" />
                AI Model Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {aiModels.map((model, i) => (
                  <div key={i} className="p-4 rounded-lg bg-slate-700/30 border border-slate-600/50">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-white font-medium">{model.name}</p>
                      <Badge className="bg-emerald-500/20 text-emerald-300">{model.version}</Badge>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Accuracy</span>
                        <span className="text-emerald-400">{model.accuracy}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Precision</span>
                        <span className="text-blue-400">{model.precision}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Recall</span>
                        <span className="text-purple-400">{model.recall}%</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-slate-600">
                        <span className="text-slate-400">Last Trained</span>
                        <span className="text-slate-300">{model.lastTrained}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="indicators">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-cyan-400" />
                Fraud Indicator Rules
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3">
                {fraudIndicators.map((indicator) => (
                  <div key={indicator.code} className="p-4 rounded-lg bg-slate-700/30 border border-slate-600/50 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                        <Activity className="w-5 h-5 text-cyan-400" />
                      </div>
                      <div>
                        <p className="text-white font-medium">{indicator.name}</p>
                        <p className="text-slate-400 text-sm">{indicator.code} | {indicator.category.replace('_', ' ')}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-cyan-400 font-mono">Weight: {indicator.weight}</p>
                        <p className="text-slate-400 text-sm">{indicator.description}</p>
                      </div>
                      <Badge className="bg-emerald-500/20 text-emerald-300">Active</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-emerald-400" />
                Fraud Analytics Dashboard
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 text-center">
              <BarChart3 className="w-16 h-16 text-slate-500 mx-auto mb-4" />
              <p className="text-slate-400">Advanced fraud analytics coming soon</p>
              <p className="text-slate-500 text-sm mt-2">Historical trends, geographic heat maps, and pattern analysis</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
