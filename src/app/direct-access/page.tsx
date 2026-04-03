'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

// Demo credentials - works without backend
const QUICK_ACCESS: Record<string, { email: string; password: string; redirect: string; name: string }> = {
  admin: { email: 'admin@nexusos.tt', password: 'admin123', redirect: '/admin', name: 'Super Admin' },
  clinic: { email: 'clinic@demo.tt', password: 'demo123', redirect: '/clinic', name: 'Dr. Juan Martínez' },
  lawfirm: { email: 'lawfirm@demo.tt', password: 'demo123', redirect: '/lawfirm', name: 'Carlos Pérez' },
  beauty: { email: 'beauty@demo.tt', password: 'demo123', redirect: '/beauty', name: 'Ana Gómez' },
  nurse: { email: 'nurse@demo.tt', password: 'demo123', redirect: '/nurse', name: 'María Rodríguez' },
  bakery: { email: 'bakery@demo.tt', password: 'demo123', redirect: '/bakery', name: 'Pedro González' },
  pharmacy: { email: 'pharmacy@demo.tt', password: 'demo123', redirect: '/pharmacy', name: 'Laura Fernández' },
  insurance: { email: 'insurance@demo.tt', password: 'demo123', redirect: '/insurance', name: 'Roberto Trinidad' },
};

const VALID_TYPES = Object.keys(QUICK_ACCESS);

export default function DirectAccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Conectando...');

  useEffect(() => {
    const autoLogin = async () => {
      const type = searchParams.get('type') || 'admin';

      if (!VALID_TYPES.includes(type)) {
        setStatus('error');
        setMessage(`Tipo inválido. Use: ${VALID_TYPES.join(', ')}`);
        return;
      }

      const creds = QUICK_ACCESS[type];
      setMessage(`Accediendo como ${creds.email}...`);

      try {
        // Store auth in localStorage
        const authData = {
          email: creds.email,
          name: creds.name,
          redirect: creds.redirect,
          authenticatedAt: new Date().toISOString()
        };

        localStorage.setItem('nexusos-demo-auth', JSON.stringify(authData));

        setStatus('success');
        setMessage('¡Acceso autorizado! Redirigiendo...');

        setTimeout(() => {
          router.push(creds.redirect);
        }, 800);
      } catch (err) {
        console.error('[DIRECT_ACCESS] Error:', err);
        setStatus('error');
        setMessage('Error de conexión');
        setTimeout(() => router.push('/login'), 2000);
      }
    };

    autoLogin();
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050410]">
      <div className="aurora-bg" />
      <div className="relative z-10 flex flex-col items-center gap-6 p-8">
        <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#6C3FCE] to-[#C026D3] flex items-center justify-center shadow-lg shadow-purple-500/20">
          {status === 'loading' && <Loader2 className="w-12 h-12 text-white animate-spin" />}
          {status === 'success' && <CheckCircle className="w-12 h-12 text-green-400" />}
          {status === 'error' && <XCircle className="w-12 h-12 text-red-400" />}
        </div>
        <div className="text-center">
          <h1 className="text-3xl font-bold text-[#EDE9FE] mb-2" style={{ fontFamily: 'var(--font-cormorant)' }}>
            NexusOS
          </h1>
          <p className={`text-sm font-medium ${status === 'error' ? 'text-red-400' : status === 'success' ? 'text-green-400' : 'text-[#9D7BEA]'}`}>
            {message}
          </p>
        </div>

        {/* Quick access buttons for all types */}
        {status === 'error' && (
          <div className="mt-4 flex flex-wrap gap-2 justify-center">
            {VALID_TYPES.map((t) => (
              <button
                key={t}
                onClick={() => router.push(`/direct-access?type=${t}`)}
                className="px-3 py-1.5 text-xs rounded-lg bg-[rgba(108,63,206,0.2)] text-[#9D7BEA] hover:bg-[rgba(108,63,206,0.4)] transition-colors border border-[rgba(167,139,250,0.2)]"
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
