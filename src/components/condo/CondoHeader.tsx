'use client';

import React from 'react';
import { Building2, Bell, Settings, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CondoHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightContent?: React.ReactNode;
}

export function CondoHeader({ 
  title, 
  subtitle, 
  showBack, 
  onBack, 
  rightContent 
}: CondoHeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-[#0A0820]/90 backdrop-blur-xl border-b border-[rgba(167,139,250,0.1)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6C3FCE] to-[#C026D3] flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-[#EDE9FE]">{title}</h1>
              {subtitle && (
                <p className="text-xs text-[#9D7BEA]">{subtitle}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {rightContent}
            <Button 
              variant="ghost" 
              size="icon"
              className="text-[#9D7BEA] hover:text-[#EDE9FE] hover:bg-[rgba(108,63,206,0.2)]"
            >
              <Bell className="w-5 h-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              className="text-[#9D7BEA] hover:text-[#EDE9FE] hover:bg-[rgba(108,63,206,0.2)]"
            >
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
