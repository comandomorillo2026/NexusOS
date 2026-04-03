# 🌐 Guía de Despliegue en Vercel - NexusOS

## 📍 Estado Actual del Servidor

### ¿Qué significa esta URL?

```
Local: http://localhost:3000
Preview: https://preview-chat-439a727e-af4c-4958-846a-03a62d413519.space.z.ai/
```

**Local (localhost:3000)**: Este es el servidor de desarrollo corriendo en tu máquina/servidor de desarrollo. Solo es accesible desde la misma máquina.

**Preview URL**: Esta es una URL de **preview temporal** generada automáticamente por el sistema de desarrollo. NO es un dominio de producción en Vercel.

---

## 🚀 Pasos para Desplegar en Vercel

### Paso 1: Crear Cuenta en Vercel
1. Ve a [vercel.com](https://vercel.com)
2. Crea una cuenta gratuita
3. Conecta tu cuenta de GitHub, GitLab o Bitbucket

### Paso 2: Preparar el Proyecto

Asegúrate de que el proyecto tenga estos archivos:

```bash
# Verificar estructura
/home/z/my-project/
├── package.json          ✅ Existe
├── next.config.ts        ✅ Existe
├── prisma/schema.prisma  ✅ Existe
├── .env                  ✅ Existe (configurar en Vercel)
└── src/                  ✅ Existe
```

### Paso 3: Crear vercel.json (Opcional pero Recomendado)

```json
{
  "buildCommand": "prisma generate && next build",
  "devCommand": "next dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["iad1"],
  "env": {
    "DATABASE_URL": "@database_url",
    "NEXTAUTH_SECRET": "@nextauth_secret",
    "NEXTAUTH_URL": "@nextauth_url"
  }
}
```

### Paso 4: Configurar Base de Datos para Producción

**IMPORTANTE**: SQLite NO es adecuado para producción en Vercel. Debes migrar a PostgreSQL:

**Opciones Recomendadas:**
1. **Vercel Postgres** (Integrado)
2. **Supabase** (Gratis hasta 500MB)
3. **Neon** (Serverless PostgreSQL)
4. **PlanetScale** (MySQL serverless)

### Paso 5: Configurar Variables de Entorno en Vercel

En el dashboard de Vercel → Settings → Environment Variables:

```env
# Base de datos (PostgreSQL recomendado)
DATABASE_URL=postgresql://user:password@host:5432/nexusos

# Autenticación
NEXTAUTH_SECRET=tu_secreto_generado
NEXTAUTH_URL=https://tu-dominio.vercel.app

# WiPay
WIPAY_API_KEY=tu_api_key
WIPAY_ACCOUNT_NUMBER=tu_account_number

# Artim
ARTIM_API_KEY=tu_api_key
ARTIM_MERCHANT_ID=tu_merchant_id
ARTIM_SECRET_KEY=tu_secret_key
ARTIM_WEBHOOK_SECRET=tu_webhook_secret

# App
APP_URL=https://tu-dominio.vercel.app
```

### Paso 6: Desplegar

**Opción A: Desde GitHub (Recomendado)**
1. Sube el código a un repositorio de GitHub
2. En Vercel: "Import Project"
3. Selecciona el repositorio
4. Configura las variables de entorno
5. Click "Deploy"

**Opción B: Desde CLI**
```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Desplegar
cd /home/z/my-project
vercel --prod
```

---

## 🌍 Configurar Dominio Personalizado

### Opción 1: Dominio de Vercel (Gratis)
Tu proyecto tendrá: `tu-proyecto.vercel.app`

### Opción 2: Dominio Personalizado
1. En Vercel Dashboard → Settings → Domains
2. Agrega tu dominio (ej: `nexusos.com`)
3. Configura los DNS en tu proveedor de dominio:

```
Tipo: A
Nombre: @
Valor: 76.76.21.21

Tipo: CNAME
Nombre: www
Valor: cname.vercel-dns.com
```

---

## 📊 Estado del Proyecto Actual

| Componente | Estado Local | Estado Vercel |
|------------|--------------|---------------|
| Next.js App | ✅ Funcionando | ⚠️ No desplegado |
| Base de Datos | ✅ SQLite local | ❌ Pendiente migración |
| WiPay Gateway | ✅ Dev mode | ⚠️ Pendiente keys |
| Artim Gateway | ✅ Dev mode | ⚠️ Pendiente keys |
| Dominio | ❌ No configurado | ❌ No configurado |

---

## 🔧 Comandos Útiles

```bash
# Generar secreto para NEXTAUTH_SECRET
openssl rand -base64 32

# Verificar build local
bun run build

# Probar migración de Prisma
bunx prisma migrate dev --name init

# Desplegar a Vercel
vercel --prod
```

---

## ⚠️ Importante

1. **SQLite no funciona en Vercel**: El filesystem es efímero. Debes usar PostgreSQL.

2. **Variables de entorno**: Nunca subas `.env` a GitHub. Configúralas en Vercel Dashboard.

3. **Webhooks**: Actualiza las URLs de webhook con tu dominio de producción:
   - WiPay: `https://tu-dominio.com/api/webhooks/wipay`
   - Artim: `https://tu-dominio.com/api/webhooks/artim`

---

## 📞 Soporte

Si necesitas ayuda con el despliegue:
1. Revisa los logs en Vercel Dashboard → Deployments → Click en deploy → Logs
2. Verifica que todas las variables de entorno estén configuradas
3. Asegúrate de que el build pase localmente primero (`bun run build`)
