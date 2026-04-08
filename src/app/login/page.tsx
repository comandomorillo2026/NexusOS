'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Mail, Lock, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Wait for client-side mount to avoid hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success && data.user) {
        // Store user in localStorage for session persistence
        localStorage.setItem('nexus_user', JSON.stringify(data.user));
        
        // Redirect based on user role
        if (data.redirectPath) {
          window.location.href = data.redirectPath;
        } else if (data.user.role === 'SUPER_ADMIN' || data.user.role === 'ADMIN') {
          window.location.href = '/admin';
        } else {
          window.location.href = '/clinic';
        }
      } else {
        setError(data.error || 'Credenciales inválidas');
        setIsLoading(false);
      }
    } catch (err) {
      setError('Error de conexión. Intenta de nuevo.');
      setIsLoading(false);
    }
  };

  const fillDemo = (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
  };

  // Show loading skeleton during hydration
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050410]">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#6C3FCE] to-[#C026D3] animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050410] p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#6C3FCE] to-[#C026D3] flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-[#EDE9FE]">AETHEL OS</h1>
          <p className="text-[#9D7BEA] text-sm mt-1">Acceso al Sistema</p>
        </div>

        <div className="bg-[rgba(108,63,206,0.1)] border border-[rgba(167,139,250,0.2)] rounded-xl p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="text-sm text-[#9D7BEA] block mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400/50" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-lg bg-[rgba(108,63,206,0.07)] border border-[rgba(167,139,250,0.2)] text-white placeholder-purple-300/30 focus:border-purple-500 focus:outline-none"
                  placeholder="correo@ejemplo.com"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-[#9D7BEA] block mb-1">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400/50" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 rounded-lg bg-[rgba(108,63,206,0.07)] border border-[rgba(167,139,250,0.2)] text-white placeholder-purple-300/30 focus:border-purple-500 focus:outline-none"
                  placeholder="••••••••"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-400/50 hover:text-purple-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Verificando...
                </>
              ) : (
                'Iniciar Sesión'
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-purple-500/20">
            <p className="text-xs text-purple-300/50 text-center mb-3">Credenciales de acceso:</p>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => fillDemo('admin@aethel.tt', 'Aethel2024!')}
                className="w-full text-left p-2 rounded bg-purple-500/10 text-purple-300 hover:bg-purple-500/20 text-sm"
                disabled={isLoading}
              >
                👑 Admin: admin@aethel.tt / Aethel2024!
              </button>
              <button
                type="button"
                onClick={() => fillDemo('clinic@aethel.tt', 'Demo2024!')}
                className="w-full text-left p-2 rounded bg-purple-500/10 text-purple-300 hover:bg-purple-500/20 text-sm"
                disabled={isLoading}
              >
                🏥 Clínica: clinic@aethel.tt / Demo2024!
              </button>
              <button
                type="button"
                onClick={() => fillDemo('lawfirm@aethel.tt', 'Demo2024!')}
                className="w-full text-left p-2 rounded bg-purple-500/10 text-purple-300 hover:bg-purple-500/20 text-sm"
                disabled={isLoading}
              >
                ⚖️ Bufete: lawfirm@aethel.tt / Demo2024!
              </button>
              <button
                type="button"
                onClick={() => fillDemo('beauty@aethel.tt', 'Demo2024!')}
                className="w-full text-left p-2 rounded bg-purple-500/10 text-purple-300 hover:bg-purple-500/20 text-sm"
                disabled={isLoading}
              >
                💇 Salón: beauty@aethel.tt / Demo2024!
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
