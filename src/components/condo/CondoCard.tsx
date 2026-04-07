'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface CondoCardProps {
  title?: string;
  description?: string;
  icon?: LucideIcon;
  children: React.ReactNode;
  className?: string;
  headerAction?: React.ReactNode;
  noPadding?: boolean;
}

export function CondoCard({ 
  title, 
  description, 
  icon: Icon, 
  children, 
  className = '',
  headerAction,
  noPadding = false
}: CondoCardProps) {
  return (
    <Card className={`bg-[#0A0820]/80 border-[rgba(167,139,250,0.2)] hover:border-[rgba(167,139,250,0.4)] transition-all ${className}`}>
      {title && (
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {Icon && (
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6C3FCE] to-[#C026D3] flex items-center justify-center">
                  <Icon className="w-4 h-4 text-white" />
                </div>
              )}
              <div>
                <CardTitle className="text-[#EDE9FE] text-lg">{title}</CardTitle>
                {description && (
                  <CardDescription className="text-[#9D7BEA]">{description}</CardDescription>
                )}
              </div>
            </div>
            {headerAction}
          </div>
        </CardHeader>
      )}
      <CardContent className={noPadding ? 'p-0' : ''}>
        {children}
      </CardContent>
    </Card>
  );
}
