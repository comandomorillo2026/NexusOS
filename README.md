# AETHEL OS

> **Sistema de Gestión Empresarial Multi-Industria para el Caribe**
>
> Business Management System for the Caribbean Market

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://aethel-os.vercel.app)
[![Built with Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![Database](https://img.shields.io/badge/Database-Supabase-3FCF8E?style=for-the-badge&logo=supabase)](https://supabase.com)
[![Email](https://img.shields.io/badge/Email-Resend-000000?style=for-the-badge)](https://resend.com)

---

## 🌐 URLs de Producción

| Servicio | URL |
|----------|-----|
| **Producción** | https://aethel-os.vercel.app |
| **Login** | https://aethel-os.vercel.app/login |
| **Admin** | https://aethel-os.vercel.app/admin |

---

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                      AETHEL OS                               │
│                   Multi-Tenant SaaS                          │
├─────────────────────────────────────────────────────────────┤
│  Frontend          │  Backend         │  Database           │
│  ─────────         │  ────────        │  ────────           │
│  Next.js 16        │  API Routes      │  Supabase           │
│  React 19          │  Prisma ORM      │  PostgreSQL         │
│  Tailwind CSS 4    │  NextAuth.js     │  (Neon-compatible)  │
│  shadcn/ui         │  Resend Email    │                     │
└─────────────────────────────────────────────────────────────┘
```

---

## 🏢 Industrias Soportadas

| Industria | Slug | Descripción |
|-----------|------|-------------|
| 🏥 Clínicas | `clinic` | Gestión médica, citas, pacientes |
| 💇 Belleza | `beauty` | Salones, SPA, membresías |
| ⚖️ Bufetes | `lawfirm` | Casos legales, clientes, documentos |
| 💉 Enfermería | `nurse` | Cuidados en casa, turnos |
| 🧁 Panaderías | `bakery` | Pedidos, catálogo, POS |
| 💊 Farmacias | `pharmacy` | Inventario, recetas |
| 🛒 Retail | `retail` | Tiendas, inventario, ventas |
| 🛡️ Seguros | `insurance` | Pólizas, reclamaciones |

---

## 🔐 Credenciales de Demo

### Super Admin (Landlord)
```
Email: admin@aethel.tt
Password: Aethel2024!
```

### Tenants de Demo
| Industria | Email | Password |
|-----------|-------|----------|
| Clínica | clinic@aethel.tt | Demo2024! |
| Bufete | lawfirm@aethel.tt | Demo2024! |
| Belleza | beauty@aethel.tt | Demo2024! |
| Enfermería | nurse@aethel.tt | Demo2024! |

---

## ⚙️ Variables de Entorno

Ver archivo `.env.example` para la configuración completa.

### Críticas (Requeridas)
```bash
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="your-secret"
NEXTAUTH_URL="https://aethel-os.vercel.app"
```

### Email (Resend)
```bash
RESEND_API_KEY="re_xxx"
EMAIL_FROM="AETHEL OS <noreply@aethel.tt>"
```

### Pagos (Trinidad & Tobago)
```bash
WIPAY_API_KEY="xxx"
WIPAY_ENVIRONMENT="sandbox"
```

---

## 🚀 Instalación Local

```bash
# Clonar repositorio
git clone https://github.com/comandomorillo2026/AETHEL-OS.git
cd AETHEL-OS

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus valores

# Generar Prisma Client
npx prisma generate

# Ejecutar en desarrollo
npm run dev
```

---

## 📁 Estructura del Proyecto

```
src/
├── app/                    # App Router (Next.js 16)
│   ├── api/               # API Routes
│   │   ├── auth/          # Autenticación
│   │   ├── admin/         # APIs de Admin
│   │   └── [industry]/    # APIs por industria
│   ├── [industry]/        # Páginas por industria
│   └── admin/             # Panel de Admin
├── components/            # Componentes React
│   ├── auth/              # Componentes de auth
│   ├── admin/             # Componentes de admin
│   └── ui/                # Componentes UI (shadcn)
├── lib/                   # Utilidades
│   ├── auth/              # Lógica de autenticación
│   ├── db.ts              # Prisma Client
│   └── email/             # Servicio de email
└── prisma/
    └── schema.prisma      # Esquema de base de datos
```

---

## 🔒 Seguridad

- **Autenticación**: NextAuth.js con JWT
- **Contraseñas**: bcrypt con 12 rounds
- **Sesiones**: Cookies HTTP-only
- **CSRF**: Protección con SameSite cookies
- **Rate Limiting**: Implementado en rutas sensibles

### Endpoints Protegidos
Los endpoints de diagnóstico y debug requieren autenticación en producción:
- `/api/debug` - Requiere header `x-debug-secret`
- `/api/diagnostic` - Requiere header `x-diagnostic-secret`
- `/api/seed` - Requiere header `x-seed-secret`

---

## 📊 Características

### ✅ Implementado
- [x] Multi-tenancy con roles
- [x] Autenticación con "Recordarme"
- [x] Recuperación de contraseña por email
- [x] Panel de administración (Landlord)
- [x] Sistema de notificaciones broadcast
- [x] Términos y condiciones
- [x] Logs de actividad
- [x] Múltiples industrias
- [x] API REST completa

### 🚧 En Desarrollo
- [ ] Pagos en línea (WiPay, Artim)
- [ ] Notificaciones push
- [ ] Reportes avanzados
- [ ] Dashboard analytics
- [ ] Mobile app (PWA)

---

## 🛠️ Tecnologías

| Categoría | Tecnología |
|-----------|------------|
| Framework | Next.js 16, React 19 |
| Styling | Tailwind CSS 4, shadcn/ui |
| Database | Supabase PostgreSQL |
| ORM | Prisma |
| Auth | NextAuth.js |
| Email | Resend |
| Hosting | Vercel |
| Version Control | GitHub |

---

## 📞 Soporte

- **Email**: soporte@aethel.tt
- **Documentación**: [docs.aethel.tt](https://docs.aethel.tt)

---

## 📄 Licencia

Propiedad de AETHEL OS - Todos los derechos reservados.

---

**Desarrollado con ❤️ para el mercado del Caribe**
