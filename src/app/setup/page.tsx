'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Check, X, Loader2, Database, Shield, Users, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function SetupPage() {
  const [status, setStatus] = useState<'checking' | 'ready' | 'initializing' | 'success' | 'error'>('checking');
  const [result, setResult] = useState<{
    initialized?: boolean;
    adminCount?: number;
    tenantCount?: number;
    users?: string[];
    credentials?: Record<string, { email: string; password: string }>;
    error?: string;
  }>({});

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      const response = await fetch('/api/setup/init');
      const data = await response.json();
      setResult(data);
      
      if (data.initialized) {
        setStatus('success');
      } else {
        setStatus('ready');
      }
    } catch (error) {
      setStatus('error');
      setResult({ error: 'Failed to check status' });
    }
  };

  const initialize = async () => {
    setStatus('initializing');
    try {
      const response = await fetch('/api/setup/init', { method: 'POST' });
      const data = await response.json();
      setResult(data);
      
      if (data.success) {
        setStatus('success');
      } else {
        setStatus('error');
      }
    } catch (error) {
      setStatus('error');
      setResult({ error: 'Failed to initialize' });
    }
  };

  return (
    <div className="min-h-screen bg-[#050410] flex items-center justify-center p-4">
      <div className="aurora-bg" />
      
      <div className="relative z-10 w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#6C3FCE] to-[#C026D3] flex items-center justify-center mx-auto mb-4">
            <Database className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-[#EDE9FE] mb-2">
            Configuración de AETHEL OS
          </h1>
          <p className="text-[#9D7BEA]">
            Inicialización de la Base de Datos
          </p>
        </div>

        {/* Status Card */}
        <Card className="glass-card p-6 mb-6">
          {status === 'checking' && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-[#6C3FCE]" />
              <span className="ml-3 text-[#EDE9FE]">Verificando estado...</span>
            </div>
          )}

          {status === 'ready' && (
            <div className="text-center py-6">
              <AlertCircle className="w-16 h-16 text-[#F0B429] mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-[#EDE9FE] mb-2">
                Base de Datos Vacía
              </h2>
              <p className="text-[#9D7BEA] mb-6">
                La base de datos no tiene usuarios configurados. 
                Haz clic en el botón para crear los usuarios iniciales.
              </p>
              
              <Button
                onClick={initialize}
                className="bg-gradient-to-r from-[#6C3FCE] to-[#C026D3] text-white py-6 px-8 text-lg"
              >
                <Database className="w-5 h-5 mr-2" />
                Inicializar Base de Datos
              </Button>
            </div>
          )}

          {status === 'initializing' && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-[#6C3FCE]" />
              <span className="ml-3 text-[#EDE9FE]">Creando usuarios y datos iniciales...</span>
            </div>
          )}

          {status === 'success' && (
            <div className="py-4">
              <div className="flex items-center justify-center mb-6">
                <Check className="w-16 h-16 text-[#10B981]" />
              </div>
              <h2 className="text-xl font-semibold text-[#EDE9FE] text-center mb-4">
                ¡Sistema Listo!
              </h2>
              <p className="text-[#9D7BEA] text-center mb-6">
                La base de datos está configurada. Puedes iniciar sesión con las siguientes credenciales:
              </p>

              {/* Credentials */}
              <div className="space-y-3">
                {result.credentials?.admin && (
                  <div className="flex items-center gap-3 p-4 rounded-lg bg-[#6C3FCE]/10 border border-[#6C3FCE]/30">
                    <Shield className="w-6 h-6 text-[#6C3FCE]" />
                    <div className="flex-1">
                      <p className="text-[#EDE9FE] font-medium">Super Admin</p>
                      <p className="text-sm text-[#9D7BEA]">
                        {result.credentials.admin.email} / {result.credentials.admin.password}
                      </p>
                    </div>
                  </div>
                )}

                {result.credentials?.clinic && (
                  <div className="flex items-center gap-3 p-4 rounded-lg bg-[#22D3EE]/10 border border-[#22D3EE]/30">
                    <Users className="w-6 h-6 text-[#22D3EE]" />
                    <div className="flex-1">
                      <p className="text-[#EDE9FE] font-medium">Clínica Demo</p>
                      <p className="text-sm text-[#9D7BEA]">
                        {result.credentials.clinic.email} / {result.credentials.clinic.password}
                      </p>
                    </div>
                  </div>
                )}

                {result.credentials?.bakery && (
                  <div className="flex items-center gap-3 p-4 rounded-lg bg-[#F0B429]/10 border border-[#F0B429]/30">
                    <Users className="w-6 h-6 text-[#F0B429]" />
                    <div className="flex-1">
                      <p className="text-[#EDE9FE] font-medium">Panadería Demo</p>
                      <p className="text-sm text-[#9D7BEA]">
                        {result.credentials.bakery.email} / {result.credentials.bakery.password}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Login Button */}
              <div className="mt-8 text-center">
                <Link href="/login">
                  <Button className="bg-gradient-to-r from-[#10B981] to-[#059669] text-white py-6 px-8 text-lg">
                    Ir a Iniciar Sesión
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center py-6">
              <X className="w-16 h-16 text-[#EF4444] mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-[#EDE9FE] mb-2">
                Error
              </h2>
              <p className="text-[#EF4444] mb-6">
                {result.error || 'Ocurrió un error al inicializar'}
              </p>
              <Button
                onClick={checkStatus}
                variant="outline"
                className="border-[#EF4444] text-[#EF4444]"
              >
                Reintentar
              </Button>
            </div>
          )}
        </Card>

        {/* Info */}
        <div className="text-center">
          <p className="text-sm text-[rgba(167,139,250,0.5)]">
            Este proceso crea los usuarios demo iniciales.
            <br />
            En producción, deberías cambiar estas contraseñas.
          </p>
        </div>
      </div>
    </div>
  );
}
