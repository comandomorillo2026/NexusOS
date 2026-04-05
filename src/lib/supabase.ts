import { createClient } from '@supabase/supabase-js';

// ============================================
// SUPABASE CLIENT CONFIGURATION
// ============================================

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// ============================================
// CLIENTE PÚBLICO (para uso en frontend)
// ============================================
// Este cliente usa la clave anónima y respeta las políticas RLS
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// ============================================
// CLIENTE ADMIN (para uso en backend/API routes)
// ============================================
// Este cliente usa la clave de servicio y puede saltar RLS
// ⚠️ SOLO usar en el servidor, NUNCA exponer al cliente
export const supabaseAdmin = supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null;

// ============================================
// TIPOS
// ============================================
export type SupabaseClient = typeof supabase;
export type SupabaseAdminClient = typeof supabaseAdmin;

// ============================================
// HELPERS
// ============================================

/**
 * Obtiene el usuario actual desde la sesión de Supabase
 */
export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) {
    console.error('Error getting user:', error);
    return null;
  }
  return user;
}

/**
 * Obtiene la sesión actual
 */
export async function getCurrentSession() {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) {
    console.error('Error getting session:', error);
    return null;
  }
  return session;
}

/**
 * Verifica si el usuario está autenticado
 */
export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser();
  return !!user;
}

/**
 * Obtiene el tenant_id del usuario desde los metadatos
 */
export function getUserTenantId(userId: string): string | null {
  // Este valor se establece cuando el usuario se registra o se asigna a un tenant
  return null; // Implementar según la lógica de multi-tenant
}

// ============================================
// ROW LEVEL SECURITY HELPERS
// ============================================

/**
 * Configura el contexto RLS para las consultas
 * Esto permite que las políticas RLS filtren automáticamente por tenant
 */
export async function setTenantContext(tenantId: string) {
  if (!supabaseAdmin) {
    throw new Error('Supabase admin client not available');
  }
  
  // Usar la función de PostgreSQL para establecer el contexto
  const { error } = await supabaseAdmin.rpc('set_tenant_context', {
    tenant_id: tenantId
  });
  
  if (error) {
    console.error('Error setting tenant context:', error);
    throw error;
  }
}

export default supabase;
