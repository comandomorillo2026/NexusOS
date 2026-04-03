'use client';

import React from 'react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  AlertTriangle,
  Activity,
  DollarSign,
  FileText,
  Users,
  Clock,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface InsuranceDashboardProps {
  stats: {
    totalPolicies: number;
    activePolicies: number;
    totalPremium: number;
    totalClaims: number;
    pendingClaims: number;
    claimsPaidYTD: number;
    lossRatio: number;
    combinedRatio: number;
    policiesByLob: Record<string, number>;
    premiumByLob: Record<string, number>;
  };
  kpis: Array<{
    name: string;
    value: number;
    target: number;
    trend: string;
  }>;
  activities: Array<{
    id: number;
    type: string;
    message: string;
    time: string;
    user: string;
  }>;
  lobConfig: Record<string, { name: string; icon: React.ElementType; color: string; bgColor: string }>;
}

const activityTypeColors: Record<string, string> = {
  POLICY_ISSUED: 'bg-emerald-500/20 text-emerald-300',
  CLAIM_FILED: 'bg-amber-500/20 text-amber-300',
  REINSURANCE_CEDING: 'bg-blue-500/20 text-blue-300',
  FRAUD_ALERT: 'bg-red-500/20 text-red-300',
  REGULATORY_FILING: 'bg-purple-500/20 text-purple-300',
};

export default function InsuranceDashboard({ stats, kpis, activities, lobConfig }: InsuranceDashboardProps) {
  const formatCurrency = (val: number) => 
    val >= 1000000 ? `TT$${(val / 1000000).toFixed(2)}M` : `TT$${(val / 1000).toFixed(0)}K`;

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {kpis.map((kpi, i) => (
          <Card key={i} className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-400 text-sm">{kpi.name}</span>
                {kpi.trend === 'up' ? (
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-400" />
                )}
              </div>
              <p className="text-2xl font-bold text-white mb-1">
                {typeof kpi.value === 'number' && kpi.name.includes('Ratio') 
                  ? `${kpi.value}%` 
                  : kpi.value}
              </p>
              <div className="flex items-center gap-2">
                <Progress 
                  value={(kpi.value / kpi.target) * 100} 
                  className="h-1.5 flex-1" 
                />
                <span className="text-xs text-slate-500">Target: {kpi.target}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Premium by LOB */}
        <Card className="lg:col-span-2 bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-400" />
              Premium by Line of Business
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {Object.entries(stats.premiumByLob).map(([lob, premium]) => {
                const config = lobConfig[lob];
                const percentage = (premium / stats.totalPremium) * 100;
                return (
                  <div key={lob} className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg ${config?.bgColor || 'bg-slate-500/10'} flex items-center justify-center`}>
                      {config?.icon && <config.icon className={`w-5 h-5 ${config?.color || 'text-slate-400'}`} />}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span className="text-white font-medium">{config?.name || lob}</span>
                        <span className="text-emerald-400 font-bold">{formatCurrency(premium)}</span>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                    <span className="text-slate-400 text-sm w-12 text-right">{percentage.toFixed(1)}%</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-cyan-400" />
              Key Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-emerald-400" />
                  <span className="text-emerald-400">GWP YTD</span>
                </div>
                <span className="text-white font-bold text-xl">{formatCurrency(stats.totalPremium)}</span>
              </div>
            </div>
            
            <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-400" />
                  <span className="text-blue-400">Active Policies</span>
                </div>
                <span className="text-white font-bold text-xl">{stats.activePolicies.toLocaleString()}</span>
              </div>
            </div>
            
            <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-400" />
                  <span className="text-amber-400">Pending Claims</span>
                </div>
                <span className="text-white font-bold text-xl">{stats.pendingClaims}</span>
              </div>
            </div>
            
            <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-400" />
                  <span className="text-purple-400">Claims Paid YTD</span>
                </div>
                <span className="text-white font-bold text-xl">{formatCurrency(stats.claimsPaidYTD)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-400" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-3">
            {activities.map((activity) => (
              <div 
                key={activity.id} 
                className="flex items-center justify-between p-3 rounded-lg bg-slate-700/30 hover:bg-slate-700/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Badge className={activityTypeColors[activity.type] || 'bg-slate-500/20 text-slate-300'}>
                    {activity.type.replace(/_/g, ' ')}
                  </Badge>
                  <div>
                    <p className="text-white text-sm">{activity.message}</p>
                    <p className="text-slate-500 text-xs">by {activity.user}</p>
                  </div>
                </div>
                <span className="text-slate-400 text-sm">{activity.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
