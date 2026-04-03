'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Lock, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';

interface ClientPortalLoginProps {
  onLogin: (accessCode: string) => Promise<void>;
  isLoading?: boolean;
  error?: string;
  language?: 'en' | 'es';
}

const translations = {
  en: {
    title: 'Client Portal',
    subtitle: 'Access your case information securely',
    accessCode: 'Access Code',
    accessCodePlaceholder: 'Enter your 8-digit access code',
    accessCodeHint: 'Enter the code provided by your attorney',
    login: 'Access Portal',
    loggingIn: 'Verifying...',
    error: 'Invalid access code. Please check and try again.',
    footer: 'Need help? Contact your attorney directly.',
    secureNote: 'Your information is protected with end-to-end encryption',
  },
  es: {
    title: 'Portal del Cliente',
    subtitle: 'Acceda a su información de caso de forma segura',
    accessCode: 'Código de Acceso',
    accessCodePlaceholder: 'Ingrese su código de 8 dígitos',
    accessCodeHint: 'Ingrese el código proporcionado por su abogado',
    login: 'Acceder al Portal',
    loggingIn: 'Verificando...',
    error: 'Código de acceso inválido. Por favor verifique e intente nuevamente.',
    footer: '¿Necesita ayuda? Contacte a su abogado directamente.',
    secureNote: 'Su información está protegida con encriptación de extremo a extremo',
  },
};

export function ClientPortalLogin({
  onLogin,
  isLoading = false,
  error,
  language = 'en',
}: ClientPortalLoginProps) {
  const [accessCode, setAccessCode] = useState('');
  const [localError, setLocalError] = useState('');

  const t = translations[language];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');

    // Validate access code format (8 alphanumeric characters)
    const codeRegex = /^[A-Za-z0-9]{8}$/;
    if (!codeRegex.test(accessCode)) {
      setLocalError(language === 'en' 
        ? 'Access code must be exactly 8 characters (letters and numbers only)'
        : 'El código de acceso debe tener exactamente 8 caracteres (letras y números)');
      return;
    }

    await onLogin(accessCode.toUpperCase());
  };

  const handleCodeChange = (value: string) => {
    // Only allow alphanumeric characters, auto-uppercase
    const cleaned = value.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    if (cleaned.length <= 8) {
      setAccessCode(cleaned);
      setLocalError('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1E3A5F] to-[#0F1F2F] flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo and Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-[#C4A35A] to-[#B8943D] shadow-lg mb-4">
            <Scale className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: 'var(--font-cormorant)' }}>
            {t.title}
          </h1>
          <p className="text-gray-400">{t.subtitle}</p>
        </div>

        {/* Login Card */}
        <Card className="bg-white/10 backdrop-blur-xl border-white/20">
          <CardHeader className="text-center pb-2">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#C4A35A]/20 mb-3 mx-auto">
              <Lock className="w-6 h-6 text-[#C4A35A]" />
            </div>
            <CardTitle className="text-white text-lg">{t.accessCode}</CardTitle>
            <CardDescription className="text-gray-400">
              {t.accessCodeHint}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Error Alert */}
              {(error || localError) && (
                <Alert className="bg-red-500/20 border-red-500/30 text-red-200">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error || localError}</AlertDescription>
                </Alert>
              )}

              {/* Access Code Input */}
              <div className="space-y-2">
                <Label htmlFor="accessCode" className="text-gray-300 sr-only">
                  {t.accessCode}
                </Label>
                <Input
                  id="accessCode"
                  type="text"
                  value={accessCode}
                  onChange={(e) => handleCodeChange(e.target.value)}
                  placeholder={t.accessCodePlaceholder}
                  className="text-center text-2xl tracking-[0.5em] font-mono bg-white/5 border-white/20 text-white placeholder:text-gray-500 focus:border-[#C4A35A] focus:ring-[#C4A35A]"
                  disabled={isLoading}
                  autoComplete="off"
                />
                <p className="text-xs text-gray-500 text-center">
                  {accessCode.length}/8 characters
                </p>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-[#C4A35A] to-[#B8943D] hover:from-[#B8943D] hover:to-[#A88530] text-white font-semibold py-6"
                disabled={isLoading || accessCode.length !== 8}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-white/30 border-t-white rounded-full" />
                    {t.loggingIn}
                  </>
                ) : (
                  <>
                    {t.login}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            {/* Security Note */}
            <div className="mt-6 flex items-center gap-2 text-xs text-gray-400">
              <Shield className="w-4 h-4" />
              <span>{t.secureNote}</span>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-gray-500 text-sm mt-6">
          {t.footer}
        </p>
      </div>
    </div>
  );
}

// Import Scale icon
import { Scale } from 'lucide-react';

export default ClientPortalLogin;
