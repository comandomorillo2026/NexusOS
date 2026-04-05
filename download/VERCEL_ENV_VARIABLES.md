# Variables de Entorno para Vercel - AETHEL OS
# Copia y pega cada una en Vercel Dashboard > Settings > Environment Variables

## OBLIGATORIAS

| Nombre | Valor | Entorno |
|--------|-------|---------|
| DATABASE_URL | `postgresql://postgres.rgpdsjmyamduakbmmdhr:gzWBh98YoDyoXAb8@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require` | Production, Preview, Development |
| NEXT_PUBLIC_SUPABASE_URL | `https://rgpdsjmyamduakbmmdhr.supabase.co` | Production, Preview, Development |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJncGRzam15YW1kdWFrYm1tZGhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUzOTk1NzgsImV4cCI6MjA5MDk3NTU3OH0.qx1Ma0Ku0s1JeCUVDSP1dT1-S2LG40U4P3xxNNyXz9w` | Production, Preview, Development |
| SUPABASE_SERVICE_ROLE_KEY | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJncGRzam15YW1kdWFrYm1tZGhyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTM5OTU3OCwiZXhwIjoyMDkwOTc1NTc4fQ.uvj4UJXy2VyqywURXLTqPre_P5_eK0uU9vA7IjeUBy0` | Production, Preview, Development |
| NEXTAUTH_SECRET | `aethel-os-production-secret-key-2026-super-secure` | Production, Preview, Development |
| NEXTAUTH_URL | `https://tu-dominio.vercel.app` | Production |

## OPCIONALES (para más adelante)

| Nombre | Valor | Descripción |
|--------|-------|-------------|
| NEXT_PUBLIC_APP_NAME | `AETHEL OS` | Nombre de la app |
| NEXT_PUBLIC_APP_URL | `https://tu-dominio.vercel.app` | URL pública |

---

## PASOS PARA AGREGAR EN VERCEL:

1. Ve a: https://vercel.com/dashboard
2. Selecciona tu proyecto
3. Ve a **Settings** > **Environment Variables**
4. Para cada variable:
   - Name: (nombre de la variable)
   - Value: (valor de la tabla arriba)
   - Environment: Selecciona todos (Production, Preview, Development)
5. Haz clic en **Add**
6. Repite para cada variable

## DESPUÉS DE AGREGAR LAS VARIABLES:

1. Ve a **Deployments**
2. Haz clic en los **...** (tres puntos) del último deployment
3. Selecciona **Redeploy**
4. Esto aplicará las nuevas variables de entorno

---

## VERIFICAR CONEXIÓN:

Después del redeploy, ve a:
- Tu app: https://tu-proyecto.vercel.app
- Debería cargar sin errores de base de datos

## SI HAY ERROR DE BASE DE DATOS:

La primera vez necesitas crear las tablas. Opciones:

### Opción 1: Desde Supabase SQL Editor
Ve a: https://supabase.com/dashboard/project/rgpdsjmyamduakbmmdhr/sql
Y ejecuta el SQL generado por Prisma (ver abajo)

### Opción 2: Usar API de setup
Después del deploy, visita:
https://tu-proyecto.vercel.app/api/setup/init
Esto creará las tablas automáticamente.
