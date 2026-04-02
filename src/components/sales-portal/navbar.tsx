'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from './language-context';
import { Menu, X, Globe, LogIn, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Navbar() {
  const { lang, setLang, t } = useLanguage();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { href: '#features', label: t.nav.features },
    { href: '#industries', label: t.nav.industries },
    { href: '#pricing', label: t.nav.pricing },
    { href: '#testimonials', label: t.nav.testimonials },
    { href: '#faq', label: t.nav.faq },
  ];

  const toggleLanguage = () => {
    setLang(lang === 'en' ? 'es' : 'en');
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'navbar-glass py-3' : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <a href="#" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#6C3FCE] to-[#C026D3] flex items-center justify-center">
              <span className="text-white font-bold text-lg">N</span>
            </div>
            <span className="text-xl font-bold text-gradient-violet" style={{ fontFamily: 'var(--font-cormorant)' }}>
              NexusOS
            </span>
          </a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-[var(--text-mid)] hover:text-[var(--text-primary)] transition-colors text-sm font-medium"
              >
                {item.label}
              </a>
            ))}
          </div>

          {/* Right Section */}
          <div className="hidden md:flex items-center gap-3">
            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--glass-border)] text-[var(--text-mid)] hover:text-[var(--text-primary)] hover:border-[var(--nexus-violet)] transition-all text-sm"
            >
              <Globe className="w-4 h-4" />
              <span>{lang === 'en' ? '🇬🇧 EN' : '🇪🇸 ES'}</span>
            </button>

            {/* Direct Access Button - PROMINENT */}
            <Link
              href="/direct-access?type=admin"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[#6C3FCE] to-[#C026D3] text-white font-medium hover:opacity-90 transition-all text-sm shadow-lg shadow-purple-500/20"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>{lang === 'en' ? 'Control Tower' : 'Torre de Control'}</span>
            </Link>

            {/* Login Button - Goes to Admin Control Tower */}
            <Link
              href="/admin"
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[var(--glass-border)] text-[var(--text-mid)] hover:text-[var(--text-primary)] hover:border-[var(--nexus-violet)] transition-all text-sm"
            >
              <LogIn className="w-4 h-4" />
              <span>{lang === 'en' ? 'Login' : 'Iniciar Sesión'}</span>
            </Link>

            {/* CTA Button */}
            <a href="#apply">
              <Button className="btn-gold text-sm">
                {t.nav.getStarted}
              </Button>
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-[var(--text-primary)]"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 py-4 border-t border-[var(--glass-border)]">
            <div className="flex flex-col gap-4">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-[var(--text-mid)] hover:text-[var(--text-primary)] transition-colors text-base"
                >
                  {item.label}
                </a>
              ))}

              {/* Mobile Direct Access Button */}
              <Link
                href="/direct-access?type=admin"
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-gradient-to-r from-[#6C3FCE] to-[#C026D3] text-white font-medium text-center"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>{lang === 'en' ? 'Control Tower' : 'Torre de Control'}</span>
              </Link>

              <div className="flex items-center gap-4 pt-4 border-t border-[var(--glass-border)]">
                <button
                  onClick={toggleLanguage}
                  className="flex items-center gap-2 text-[var(--text-mid)]"
                >
                  <Globe className="w-4 h-4" />
                  <span>{lang === 'en' ? '🇬🇧 EN' : '🇪🇸 ES'}</span>
                </button>
                <Link
                  href="/admin"
                  className="flex items-center gap-2 text-[var(--text-mid)]"
                >
                  <LogIn className="w-4 h-4" />
                  <span>{lang === 'en' ? 'Login' : 'Iniciar Sesión'}</span>
                </Link>
                <a href="#apply" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button className="btn-gold text-sm">
                    {t.nav.getStarted}
                  </Button>
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
