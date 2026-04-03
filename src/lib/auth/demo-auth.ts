// Demo authentication that works without database
// This provides immediate access for demo purposes

export interface DemoUser {
  id: string;
  email: string;
  name: string;
  role: 'SUPER_ADMIN' | 'TENANT_ADMIN' | 'TENANT_USER';
  tenantId?: string;
  tenantSlug?: string;
  tenantName?: string;
  industrySlug?: string;
}

export const DEMO_USERS: Record<string, DemoUser> = {
  'admin@nexusos.tt': {
    id: 'demo-admin-1',
    email: 'admin@nexusos.tt',
    name: 'Super Admin',
    role: 'SUPER_ADMIN',
  },
  'clinic@demo.tt': {
    id: 'demo-clinic-1',
    email: 'clinic@demo.tt',
    name: 'Dr. Juan Martínez',
    role: 'TENANT_ADMIN',
    tenantId: 'tenant-clinic-1',
    tenantSlug: 'clinica-demo',
    tenantName: 'Clínica San Fernando',
    industrySlug: 'clinic',
  },
  'lawfirm@demo.tt': {
    id: 'demo-lawfirm-1',
    email: 'lawfirm@demo.tt',
    name: 'Carlos Pérez',
    role: 'TENANT_ADMIN',
    tenantId: 'tenant-lawfirm-1',
    tenantSlug: 'bufete-perez',
    tenantName: 'Bufete Pérez & Asociados',
    industrySlug: 'lawfirm',
  },
  'beauty@demo.tt': {
    id: 'demo-beauty-1',
    email: 'beauty@demo.tt',
    name: 'Ana Gómez',
    role: 'TENANT_ADMIN',
    tenantId: 'tenant-beauty-1',
    tenantSlug: 'salon-bella-vista',
    tenantName: 'Salón Bella Vista',
    industrySlug: 'beauty',
  },
  'nurse@demo.tt': {
    id: 'demo-nurse-1',
    email: 'nurse@demo.tt',
    name: 'María Rodríguez',
    role: 'TENANT_ADMIN',
    tenantId: 'tenant-nurse-1',
    tenantSlug: 'enfermeria-cuidados',
    tenantName: 'Enfermería Cuidados del Hogar',
    industrySlug: 'nurse',
  },
  'bakery@demo.tt': {
    id: 'demo-bakery-1',
    email: 'bakery@demo.tt',
    name: 'Pedro González',
    role: 'TENANT_ADMIN',
    tenantId: 'tenant-bakery-1',
    tenantSlug: 'panaderia-dulce',
    tenantName: 'Panadería Dulce',
    industrySlug: 'bakery',
  },
  'pharmacy@demo.tt': {
    id: 'demo-pharmacy-1',
    email: 'pharmacy@demo.tt',
    name: 'Laura Fernández',
    role: 'TENANT_ADMIN',
    tenantId: 'tenant-pharmacy-1',
    tenantSlug: 'farmacia-central',
    tenantName: 'Farmacia Central',
    industrySlug: 'pharmacy',
  },
  'insurance@demo.tt': {
    id: 'demo-insurance-1',
    email: 'insurance@demo.tt',
    name: 'Roberto Trinidad',
    role: 'TENANT_ADMIN',
    tenantId: 'tenant-insurance-1',
    tenantSlug: 'seguros-caribe',
    tenantName: 'Seguros Caribe',
    industrySlug: 'insurance',
  },
};

export const DEMO_PASSWORDS: Record<string, string> = {
  'admin@nexusos.tt': 'admin123',
  'clinic@demo.tt': 'demo123',
  'lawfirm@demo.tt': 'demo123',
  'beauty@demo.tt': 'demo123',
  'nurse@demo.tt': 'demo123',
  'bakery@demo.tt': 'demo123',
  'pharmacy@demo.tt': 'demo123',
  'insurance@demo.tt': 'demo123',
};

export function verifyDemoCredentials(email: string, password: string): DemoUser | null {
  const emailLower = email.toLowerCase();
  const user = DEMO_USERS[emailLower];
  const expectedPassword = DEMO_PASSWORDS[emailLower];

  if (user && expectedPassword === password) {
    return user;
  }

  return null;
}

export function getRedirectPath(user: DemoUser): string {
  if (user.role === 'SUPER_ADMIN') {
    return '/admin';
  }

  const industryRoutes: Record<string, string> = {
    clinic: '/clinic',
    nurse: '/nurse',
    lawfirm: '/lawfirm',
    beauty: '/beauty',
    bakery: '/bakery',
    pharmacy: '/pharmacy',
    insurance: '/insurance',
  };

  return industryRoutes[user.industrySlug || ''] || '/clinic';
}
