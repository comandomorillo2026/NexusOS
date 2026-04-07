'use client';

import React from 'react';
import { TrendingUp, TrendingDown, LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  color?: 'violet' | 'green' | 'gold' | 'red' | 'blue' | 'cyan';
}

export function StatCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend, 
  trendUp,
  color = 'violet'
}: StatCardProps) {
  const colorClasses = {
    violet: 'from-[#6C3FCE] to-[#C026D3]',
    green: 'from-[#34D399] to-[#059669]',
    gold: 'from-[#F0B429] to-[#d97706]',
    red: 'from-[#F87171] to-[#dc2626]',
    blue: 'from-[#22D3EE] to-[#3B82F6]',
    cyan: 'from-[#06B6D4] to-[#0891B2]',
  };

  return (
    <Card className="bg-[#0A0820]/80 border-[rgba(167,139,250,0.2)] hover:border-[rgba(167,139,250,0.4)] transition-all">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[#9D7BEA] text-sm">{title}</p>
            <p className="text-2xl font-bold text-[#EDE9FE] mt-1">{value}</p>
            {subtitle && (
              <p className="text-xs text-[rgba(167,139,250,0.6)] mt-1">{subtitle}</p>
            )}
            {trend && (
              <div className={`flex items-center gap-1 mt-2 text-xs ${trendUp ? 'text-[#34D399]' : 'text-[#F87171]'}`}>
                {trendUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {trend}
              </div>
            )}
          </div>
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
