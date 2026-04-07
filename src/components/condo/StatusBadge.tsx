'use client';

import React from 'react';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
  const styles: Record<string, string> = {
    // Invoice statuses
    pending: 'bg-[#F0B429]/20 text-[#F0B429] border-[#F0B429]/30',
    paid: 'bg-[#34D399]/20 text-[#34D399] border-[#34D399]/30',
    partial: 'bg-[#22D3EE]/20 text-[#22D3EE] border-[#22D3EE]/30',
    overdue: 'bg-[#F87171]/20 text-[#F87171] border-[#F87171]/30',
    cancelled: 'bg-[#9D7BEA]/20 text-[#9D7BEA] border-[#9D7BEA]/30',
    
    // Unit statuses
    occupied: 'bg-[#34D399]/20 text-[#34D399] border-[#34D399]/30',
    vacant: 'bg-[#22D3EE]/20 text-[#22D3EE] border-[#22D3EE]/30',
    for_sale: 'bg-[#F0B429]/20 text-[#F0B429] border-[#F0B429]/30',
    for_rent: 'bg-[#6C3FCE]/20 text-[#B197FC] border-[#6C3FCE]/30',
    under_renovation: 'bg-[#A855F7]/20 text-[#A855F7] border-[#A855F7]/30',
    
    // Maintenance statuses
    open: 'bg-[#F0B429]/20 text-[#F0B429] border-[#F0B429]/30',
    assigned: 'bg-[#6C3FCE]/20 text-[#B197FC] border-[#6C3FCE]/30',
    in_progress: 'bg-[#22D3EE]/20 text-[#22D3EE] border-[#22D3EE]/30',
    on_hold: 'bg-[#F87171]/20 text-[#F87171] border-[#F87171]/30',
    completed: 'bg-[#34D399]/20 text-[#34D399] border-[#34D399]/30',
    
    // Reservation statuses
    confirmed: 'bg-[#34D399]/20 text-[#34D399] border-[#34D399]/30',
    
    // Vote statuses
    upcoming: 'bg-[#22D3EE]/20 text-[#22D3EE] border-[#22D3EE]/30',
    active: 'bg-[#34D399]/20 text-[#34D399] border-[#34D399]/30',
    closed: 'bg-[#9D7BEA]/20 text-[#9D7BEA] border-[#9D7BEA]/30',
    
    // Priority
    low: 'bg-[#22D3EE]/20 text-[#22D3EE] border-[#22D3EE]/30',
    normal: 'bg-[#6C3FCE]/20 text-[#B197FC] border-[#6C3FCE]/30',
    high: 'bg-[#F0B429]/20 text-[#F0B429] border-[#F0B429]/30',
    urgent: 'bg-[#F87171]/20 text-[#F87171] border-[#F87171]/30',
    emergency: 'bg-[#dc2626]/20 text-[#F87171] border-[#dc2626]/30',
  };

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
  };

  return (
    <span className={`${sizeClasses[size]} rounded font-medium border ${styles[status] || styles.pending}`}>
      {status.replace(/_/g, ' ').toUpperCase()}
    </span>
  );
}
