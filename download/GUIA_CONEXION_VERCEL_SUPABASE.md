# 🚀 GUÍA VISUAL: Conectar Supabase con Vercel

## Paso 1: Integración Automática (5 minutos)

### 1.1 Abre Supabase
```
URL: https://supabase.com/dashboard/project/rgpdsjmyamduakbmmdhr/settings/integrations
```

### 1.2 Busca Vercel y haz clic en "Install"
```
┌─────────────────────────────────────────────────┐
│  Integrations                                   │
├─────────────────────────────────────────────────┤
│                                                 │
│  [logo Vercel] Vercel Integration               │
│  Connect your Vercel teams to your Supabase     │
│  organization.                                  │
│                                                 │
│  [Install Vercel Integration]  ← CLIC AQUÍ      │
│                                                 │
└─────────────────────────────────────────────────┘
```

### 1.3 Autoriza en Vercel
```
┌─────────────────────────────────────────────────┐
│  Authorize Supabase                             │
├─────────────────────────────────────────────────┤
│                                                 │
│  Supabase wants to access your Vercel account   │
│                                                 │
│  ☑ Access to all teams                          │
│  o O specific teams                             │
│                                                 │
│  [Authorize]  ← CLIC AQUÍ                       │
│                                                 │
└─────────────────────────────────────────────────┘
```

### 1.4 Selecciona tu proyecto
```
┌─────────────────────────────────────────────────┐
│  Configure Integration                          │
├─────────────────────────────────────────────────┤
│                                                 │
│  Vercel Projects:                               │
│  o aethel-os (o el nombre que tengas)           │
│  o Create new project                           │
│                                                 │
│  Supabase Project:                              │
│  ● aethel-os-production                         │
│                                                 │
│  [Connect Project]  ← CLIC AQUÍ                 │
│                                                 │
└─────────────────────────────────────────────────┘
```

### 1.5 ¡Listo! Las variables se configuran automáticamente
```
┌─────────────────────────────────────────────────┐
│  ✅ Integration Complete                        │
├─────────────────────────────────────────────────┤
│                                                 │
│  Environment variables added to Vercel:         │
│  ✓ SUPABASE_URL                                 │
│  ✓ SUPABASE_ANON_KEY                            │
│  ✓ SUPABASE_SERVICE_ROLE_KEY                    │
│  ✓ DATABASE_URL                                 │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## Paso 2: Agregar Variables Faltantes

La integración agrega las de Supabase, pero necesitas agregar estas manualmente:

### 2.1 Ve a Vercel Dashboard
```
https://vercel.com/dashboard → Tu proyecto → Settings → Environment Variables
```

### 2.2 Agrega estas variables:

#### Variable 1: NEXTAUTH_SECRET
```
Name:  NEXTAUTH_SECRET
Value: aethel-os-production-secret-key-2026-super-secure
Env:   ☑ Production  ☑ Preview  ☑ Development
```

#### Variable 2: NEXTAUTH_URL
```
Name:  NEXTAUTH_URL
Value: https://tu-proyecto.vercel.app  ← Cambia por tu URL real
Env:   ☑ Production
```

---

## Paso 3: Crear Tablas en la Base de Datos

### Opción A: Desde tu computadora (con internet)
```bash
# En tu proyecto local
npx prisma db push
```

### Opción B: Desde Supabase SQL Editor
1. Ve a: https://supabase.com/dashboard/project/rgpdsjmyamduakbmmdhr/sql
2. Ejecuta el SQL generado

### Opción C: Usar API de inicialización (después del deploy)
Visita: `https://tu-proyecto.vercel.app/api/setup/init`

---

## Paso 4: Redeploy

```
Vercel Dashboard → Deployments → [...] → Redeploy
```

---

## ✅ Verificación

1. Abre tu app: `https://tu-proyecto.vercel.app`
2. Ve a `/admin` - Torre de Control
3. Deberías ver el dashboard sin errores

---

## 🆘 Si hay problemas:

| Error | Solución |
|-------|----------|
| "Can't reach database" | Verifica DATABASE_URL usa el pooler |
| "P1001" | La URL debe tener `?pgbouncer=true` |
| "Tenant not found" | Usa formato: `postgres.PROJECT_REF:PASSWORD@pooler` |
| Tablas no existen | Ejecuta `npx prisma db push` o usa `/api/setup/init` |

---

## 📞 URLs Importantes:

| Servicio | URL |
|----------|-----|
| Supabase Dashboard | https://supabase.com/dashboard/project/rgpdsjmyamduakbmmdhr |
| Supabase SQL Editor | https://supabase.com/dashboard/project/rgpdsjmyamduakbmmdhr/sql |
| Supabase Integrations | https://supabase.com/dashboard/project/rgpdsjmyamduakbmmdhr/settings/integrations |
| Vercel Dashboard | https://vercel.com/dashboard |
