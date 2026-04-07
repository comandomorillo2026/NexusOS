'use client';

import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingSpinner({ size = 'md', className = '' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className={`${sizeClasses[size]} rounded-xl bg-gradient-to-br from-[#6C3FCE] to-[#C026D3] animate-pulse`} />
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050410]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#6C3FCE] to-[#C026D3] animate-pulse" />
        <p className="text-[#9D7BEA] text-sm">Cargando...</p>
      </div>
    </div>
  );
}
