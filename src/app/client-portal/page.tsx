'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ClientPortalLogin } from '@/components/lawfirm/portal';
import { createPortalSession } from './actions';

export default function ClientPortalPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState<'en' | 'es'>('en');

  // Check for language preference from URL or browser
  useEffect(() => {
    const langParam = searchParams.get('lang');
    if (langParam === 'es' || langParam === 'en') {
      setLanguage(langParam);
    } else if (typeof navigator !== 'undefined') {
      const browserLang = navigator.language.split('-')[0];
      if (browserLang === 'es') {
        setLanguage('es');
      }
    }
  }, [searchParams]);

  const handleLogin = async (accessCode: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await createPortalSession(accessCode);
      
      if (result.success && result.caseId) {
        // Store portal session info
        sessionStorage.setItem('portalAccessCode', accessCode);
        sessionStorage.setItem('portalClientId', result.clientId || '');
        sessionStorage.setItem('portalCaseId', result.caseId);
        sessionStorage.setItem('portalPermissions', result.permissions || '');
        sessionStorage.setItem('portalLanguage', language);
        
        // Redirect to case view
        router.push(`/client-portal/case/${result.caseId}`);
      } else {
        setError(result.error || 'Invalid access code');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ClientPortalLogin
      onLogin={handleLogin}
      isLoading={isLoading}
      error={error || undefined}
      language={language}
    />
  );
}
