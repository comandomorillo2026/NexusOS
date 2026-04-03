'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  Calendar, 
  Users, 
  FileText, 
  Settings, 
  Stethoscope,
  Scale,
  Scissors,
  Heart,
  type LucideIcon
} from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  href: string;
  industry?: string;
}

const INDUSTRY_NAVS: Record<string, NavItem[]> = {
  clinic: [
    { id: 'home', label: 'Inicio', icon: Home, href: '/clinic' },
    { id: 'appointments', label: 'Citas', icon: Calendar, href: '/clinic?tab=appointments' },
    { id: 'patients', label: 'Pacientes', icon: Users, href: '/clinic?tab=patients' },
    { id: 'records', label: 'Expedientes', icon: FileText, href: '/clinic?tab=records' },
    { id: 'settings', label: 'Config', icon: Settings, href: '/clinic?tab=settings' },
  ],
  nurse: [
    { id: 'home', label: 'Inicio', icon: Home, href: '/nurse' },
    { id: 'visits', label: 'Visitas', icon: Calendar, href: '/nurse?tab=visits' },
    { id: 'patients', label: 'Pacientes', icon: Users, href: '/nurse?tab=patients' },
    { id: 'vitals', label: 'Signos', icon: Heart, href: '/nurse?tab=vitals' },
    { id: 'settings', label: 'Config', icon: Settings, href: '/nurse?tab=settings' },
  ],
  lawfirm: [
    { id: 'home', label: 'Inicio', icon: Home, href: '/lawfirm' },
    { id: 'cases', label: 'Casos', icon: Scale, href: '/lawfirm?tab=cases' },
    { id: 'clients', label: 'Clientes', icon: Users, href: '/lawfirm?tab=clients' },
    { id: 'documents', label: 'Docs', icon: FileText, href: '/lawfirm?tab=documents' },
    { id: 'settings', label: 'Config', icon: Settings, href: '/lawfirm?tab=settings' },
  ],
  beauty: [
    { id: 'home', label: 'Inicio', icon: Home, href: '/beauty' },
    { id: 'appointments', label: 'Citas', icon: Calendar, href: '/beauty?tab=appointments' },
    { id: 'clients', label: 'Clientes', icon: Users, href: '/beauty?tab=clients' },
    { id: 'pos', label: 'POS', icon: Scissors, href: '/beauty?tab=pos' },
    { id: 'settings', label: 'Config', icon: Settings, href: '/beauty?tab=settings' },
  ],
};

interface MobileNavProps {
  industry?: 'clinic' | 'nurse' | 'lawfirm' | 'beauty';
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export function MobileNav({ industry, activeTab, onTabChange }: MobileNavProps) {
  const pathname = usePathname();
  
  // Auto-detect industry from path
  const detectedIndustry = industry || 
    (pathname.includes('clinic') ? 'clinic' :
     pathname.includes('nurse') ? 'nurse' :
     pathname.includes('lawfirm') ? 'lawfirm' :
     pathname.includes('beauty') ? 'beauty' : null);

  // Get navigation items for industry
  const navItems = detectedIndustry ? INDUSTRY_NAVS[detectedIndustry] : getDefaultNav(pathname);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#0A0820]/95 backdrop-blur-xl border-t border-[rgba(167,139,250,0.2)] pb-safe">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center justify-around h-16">
          {navItems.map((item) => {
            const isActive = activeTab === item.id || (!activeTab && item.id === 'home');
            
            return (
              <NavItemButton
                key={item.id}
                item={item}
                isActive={isActive}
                onClick={() => onTabChange?.(item.id)}
              />
            );
          })}
        </div>
      </div>
    </nav>
  );
}

interface NavItemButtonProps {
  item: NavItem;
  isActive: boolean;
  onClick?: () => void;
}

function NavItemButton({ item, isActive, onClick }: NavItemButtonProps) {
  const Icon = item.icon;
  
  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={`flex flex-col items-center justify-center w-full h-full py-2 transition-colors touch-target ${
        isActive
          ? 'text-[#F0B429]'
          : 'text-gray-500 hover:text-gray-300'
      }`}
    >
      <div className={`p-1.5 rounded-lg transition-colors ${
        isActive ? 'bg-[#F0B429]/20' : ''
      }`}>
        <Icon className={`w-5 h-5 ${isActive ? 'text-[#F0B429]' : ''}`} />
      </div>
      <span className={`text-xs mt-0.5 ${isActive ? 'font-medium' : ''}`}>
        {item.label}
      </span>
    </Link>
  );
}

function getDefaultNav(pathname: string): NavItem[] {
  if (pathname.includes('clinic')) return INDUSTRY_NAVS.clinic;
  if (pathname.includes('nurse')) return INDUSTRY_NAVS.nurse;
  if (pathname.includes('lawfirm')) return INDUSTRY_NAVS.lawfirm;
  if (pathname.includes('beauty')) return INDUSTRY_NAVS.beauty;
  
  // Default navigation
  return [
    { id: 'home', label: 'Inicio', icon: Home, href: '/' },
    { id: 'portal', label: 'Portal', icon: Stethoscope, href: '/portal' },
    { id: 'settings', label: 'Config', icon: Settings, href: '/login' },
  ];
}

// Industry icon component
export function IndustryIcon({ industry, className = '' }: { industry: string; className?: string }) {
  const icons: Record<string, LucideIcon> = {
    clinic: Stethoscope,
    nurse: Heart,
    lawfirm: Scale,
    beauty: Scissors,
  };
  
  const Icon = icons[industry] || Home;
  return <Icon className={className} />;
}

// Header component for mobile
export function MobileHeader({ 
  title, 
  subtitle,
  industry,
  onMenuClick 
}: { 
  title: string;
  subtitle?: string;
  industry?: 'clinic' | 'nurse' | 'lawfirm' | 'beauty';
  onMenuClick?: () => void;
}) {
  return (
    <header className="sticky top-0 z-40 bg-[#0A0820]/95 backdrop-blur-xl border-b border-[rgba(167,139,250,0.1)]">
      <div className="flex items-center justify-between px-4 h-14">
        <div className="flex items-center gap-3">
          {industry && (
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6C3FCE] to-[#C026D3] flex items-center justify-center">
              <IndustryIcon industry={industry} className="w-4 h-4 text-white" />
            </div>
          )}
          <div>
            <h1 className="font-semibold text-[#EDE9FE]">{title}</h1>
            {subtitle && <p className="text-xs text-[#9D7BEA]">{subtitle}</p>}
          </div>
        </div>
        
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="p-2 rounded-lg hover:bg-white/5 transition-colors"
          >
            <Settings className="w-5 h-5 text-gray-400" />
          </button>
        )}
      </div>
    </header>
  );
}

// Pull to refresh component
export function PullToRefresh({ onRefresh }: { onRefresh: () => Promise<void> }) {
  const [isPulling, setIsPulling] = React.useState(false);
  const [pullDistance, setPullDistance] = React.useState(0);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const startY = React.useRef(0);
  const threshold = 80;

  React.useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      if (window.scrollY === 0) {
        startY.current = e.touches[0].clientY;
        setIsPulling(true);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isPulling) return;
      
      const currentY = e.touches[0].clientY;
      const distance = Math.max(0, currentY - startY.current);
      setPullDistance(Math.min(distance, threshold * 1.5));
    };

    const handleTouchEnd = async () => {
      if (pullDistance >= threshold && !isRefreshing) {
        setIsRefreshing(true);
        try {
          await onRefresh();
        } finally {
          setIsRefreshing(false);
        }
      }
      setPullDistance(0);
      setIsPulling(false);
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isPulling, pullDistance, isRefreshing, onRefresh]);

  if (pullDistance === 0 && !isRefreshing) return null;

  const progress = Math.min(pullDistance / threshold, 1);
  const rotate = progress * 360;

  return (
    <div 
      className="absolute top-0 left-0 right-0 flex items-center justify-center z-50 transition-transform"
      style={{ 
        transform: `translateY(${Math.min(pullDistance, threshold)}px)`,
      }}
    >
      <div className={`w-8 h-8 rounded-full bg-[#6C3FCE] flex items-center justify-center ${
        isRefreshing ? 'animate-spin' : ''
      }`}>
        <svg 
          className="w-5 h-5 text-white" 
          style={{ transform: `rotate(${isRefreshing ? 0 : rotate}deg)` }}
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2"
        >
          <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 .34-.03.67-.08 1h2.02c.05-.33.06-.66.06-1 0-4.42-3.58-8-8-8z" />
          <path d="M6 12c0-1.66.68-3.16 1.76-4.24L7.05 7.05C5.78 8.32 5 10.07 5 12c0 .34.03.67.08 1h2.02c-.05-.33-.1-.66-.1-1z" />
        </svg>
      </div>
    </div>
  );
}

export default MobileNav;
