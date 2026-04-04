'use client';

import React from 'react';
import { useLanguage } from './language-context';
import { Mail, Phone, MessageCircle, Facebook, Instagram, Linkedin, Twitter } from 'lucide-react';

export function Footer() {
  const { t } = useLanguage();

  const socialLinks = [
    { name: 'Facebook', icon: Facebook, href: '#' },
    { name: 'Instagram', icon: Instagram, href: '#' },
    { name: 'LinkedIn', icon: Linkedin, href: '#' },
    { name: 'Twitter', icon: Twitter, href: '#' },
  ];

  return (
    <footer className="relative border-t border-[var(--glass-border)]">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[var(--nexus-violet)] to-[var(--nexus-fuchsia)] flex items-center justify-center">
                <span className="text-white font-bold text-lg">N</span>
              </div>
              <span className="text-xl font-bold text-gradient-violet" style={{ fontFamily: 'var(--font-cormorant)' }}>
                AETHEL OS
              </span>
            </div>
            <p className="text-[var(--text-mid)] text-sm mb-4 leading-relaxed">
              {t.footer.description}
            </p>
            <p className="text-[var(--text-dim)] text-sm italic" style={{ fontFamily: 'var(--font-cormorant)' }}>
              "{t.footer.tagline}"
            </p>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="font-bold text-[var(--text-primary)] mb-4">{t.footer.links.product}</h4>
            <ul className="space-y-2">
              <li>
                <a href="#features" className="text-[var(--text-mid)] hover:text-[var(--nexus-violet-lite)] transition-colors text-sm">
                  {t.footer.links.features}
                </a>
              </li>
              <li>
                <a href="#pricing" className="text-[var(--text-mid)] hover:text-[var(--nexus-violet-lite)] transition-colors text-sm">
                  {t.footer.links.pricing}
                </a>
              </li>
              <li>
                <a href="#industries" className="text-[var(--text-mid)] hover:text-[var(--nexus-violet-lite)] transition-colors text-sm">
                  {t.footer.links.industries}
                </a>
              </li>
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-bold text-[var(--text-primary)] mb-4">{t.footer.links.company}</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-[var(--text-mid)] hover:text-[var(--nexus-violet-lite)] transition-colors text-sm">
                  {t.footer.links.about}
                </a>
              </li>
              <li>
                <a href="#" className="text-[var(--text-mid)] hover:text-[var(--nexus-violet-lite)] transition-colors text-sm">
                  {t.footer.links.contact}
                </a>
              </li>
              <li>
                <a href="#" className="text-[var(--text-mid)] hover:text-[var(--nexus-violet-lite)] transition-colors text-sm">
                  {t.footer.links.careers}
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold text-[var(--text-primary)] mb-4">{t.footer.contact.title}</h4>
            <ul className="space-y-3">
              <li>
                <a href={`mailto:${t.footer.contact.email}`} className="flex items-center gap-2 text-[var(--text-mid)] hover:text-[var(--nexus-violet-lite)] transition-colors text-sm">
                  <Mail className="w-4 h-4" />
                  {t.footer.contact.email}
                </a>
              </li>
              <li>
                <a href={`tel:${t.footer.contact.phone}`} className="flex items-center gap-2 text-[var(--text-mid)] hover:text-[var(--nexus-violet-lite)] transition-colors text-sm">
                  <Phone className="w-4 h-4" />
                  {t.footer.contact.phone}
                </a>
              </li>
              <li>
                <a href="https://wa.me/18681234567" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[var(--text-mid)] hover:text-[var(--nexus-gold)] transition-colors text-sm">
                  <MessageCircle className="w-4 h-4" />
                  {t.footer.contact.whatsapp}
                </a>
              </li>
            </ul>

            {/* Social Links */}
            <div className="flex gap-3 mt-6">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  className="w-9 h-9 rounded-lg bg-[var(--glass)] border border-[var(--glass-border)] flex items-center justify-center text-[var(--text-mid)] hover:text-[var(--nexus-violet-lite)] hover:border-[var(--nexus-violet)]/50 transition-all"
                  aria-label={social.name}
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-[var(--glass-border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-[var(--text-dim)] text-sm">
              {t.footer.copyright}
            </p>
            <div className="flex gap-6">
              <a href="#" className="text-[var(--text-dim)] hover:text-[var(--text-mid)] transition-colors text-sm">
                {t.footer.links.terms}
              </a>
              <a href="#" className="text-[var(--text-dim)] hover:text-[var(--text-mid)] transition-colors text-sm">
                {t.footer.links.privacy}
              </a>
              <a href="#" className="text-[var(--text-dim)] hover:text-[var(--text-mid)] transition-colors text-sm">
                {t.footer.links.refund}
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
