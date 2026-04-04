/**
 * AETHEL OS - Professional Email Service
 * Bilingual support (ES/EN) for the Caribbean market
 */

interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
}

interface WelcomeEmailData {
  name: string;
  email: string;
  businessName: string;
  industry: string;
  loginUrl: string;
  language?: 'es' | 'en';
}

// System branding
const BRAND = {
  name: 'AETHEL OS',
  shortName: 'AETHEL',
  tagline: {
    es: 'Sistema de Gestión Empresarial para el Caribe',
    en: 'Business Management System for the Caribbean'
  },
  supportEmail: 'soporte@aethel.tt',
  logoText: 'A'
};

// Industry translations
const industryNames: Record<string, Record<string, string>> = {
  clinic: { es: 'Clínica Médica', en: 'Medical Clinic' },
  nurse: { es: 'Cuidados de Enfermería', en: 'Nursing Care' },
  lawfirm: { es: 'Bufete de Abogados', en: 'Law Firm' },
  beauty: { es: 'Salón de Belleza', en: 'Beauty Salon' },
  retail: { es: 'Tienda', en: 'Retail Store' },
  bakery: { es: 'Panadería', en: 'Bakery' },
  pharmacy: { es: 'Farmacia', en: 'Pharmacy' },
  insurance: { es: 'Aseguradora', en: 'Insurance Company' },
};

// Bilingual text
const translations = {
  es: {
    welcome: '¡Bienvenido a AETHEL OS!',
    systemReady: 'Tu sistema de gestión está listo',
    hello: 'Hola',
    thanksJoining: '¡Gracias por unirte a AETHEL OS! Tu cuenta ha sido creada exitosamente y tu sistema de gestión para',
    readyToUse: 'está listo para usar.',
    business: 'Negocio',
    industry: 'Industria',
    accessEmail: 'Email de acceso',
    withAethel: 'Con AETHEL OS tendrás acceso a:',
    clientManagement: 'Gestión completa de clientes y pacientes',
    appointmentSystem: 'Sistema de citas y calendario',
    billingControl: 'Facturación y control de pagos',
    businessReports: 'Reportes y análisis de tu negocio',
    andMore: 'Y mucho más...',
    accessSystem: 'Acceder a Mi Sistema',
    questions: 'Si tienes alguna pregunta, no dudes en contactarnos. Estamos aquí para ayudarte a hacer crecer tu negocio.',
    rightsReserved: 'Todos los derechos reservados.',
    support: 'Soporte',
    passwordReset: 'Restablecer Contraseña',
    resetRequest: 'Recibimos una solicitud para restablecer tu contraseña. Haz clic en el botón de abajo para crear una nueva:',
    resetButton: 'Restablecer Contraseña',
    resetWarning: 'Este enlace expirará en 24 horas. Si no solicitaste este cambio, puedes ignorar este email.',
    systemReadyTitle: '¡Tu Sistema Está Listo!',
    yourSystemFor: 'Tu sistema de gestión para',
    configured: 'ha sido configurado y está listo para usar.',
    credentialsTitle: 'Tus Credenciales de Acceso',
    loginUrl: 'URL de Acceso:',
    email: 'Email:',
    tempPassword: 'Contraseña Temporal:',
    securityWarning: 'Por seguridad, cambia esta contraseña después de tu primer inicio de sesión.',
    accessNow: 'Acceder a Mi Sistema',
    whatYouCanDo: 'Lo que puedes hacer ahora:',
    registerClients: 'Registrar tus clientes y pacientes',
    createAppointments: 'Crear citas y gestionar tu calendario',
    generateInvoices: 'Generar facturas y recibir pagos',
    viewReports: 'Ver reportes de tu negocio',
    customizeSettings: 'Personalizar la configuración',
    needHelp: 'Si necesitas ayuda, contáctanos en',
    emailSentTo: 'Este email fue enviado a',
  },
  en: {
    welcome: 'Welcome to AETHEL OS!',
    systemReady: 'Your management system is ready',
    hello: 'Hello',
    thanksJoining: 'Thank you for joining AETHEL OS! Your account has been successfully created and your management system for',
    readyToUse: 'is ready to use.',
    business: 'Business',
    industry: 'Industry',
    accessEmail: 'Access email',
    withAethel: 'With AETHEL OS you have access to:',
    clientManagement: 'Complete client and patient management',
    appointmentSystem: 'Appointments and calendar system',
    billingControl: 'Invoicing and payment control',
    businessReports: 'Business reports and analytics',
    andMore: 'And much more...',
    accessSystem: 'Access My System',
    questions: 'If you have any questions, don\'t hesitate to contact us. We\'re here to help you grow your business.',
    rightsReserved: 'All rights reserved.',
    support: 'Support',
    passwordReset: 'Reset Password',
    resetRequest: 'We received a request to reset your password. Click the button below to create a new one:',
    resetButton: 'Reset Password',
    resetWarning: 'This link will expire in 24 hours. If you did not request this change, you can ignore this email.',
    systemReadyTitle: 'Your System Is Ready!',
    yourSystemFor: 'Your management system for',
    configured: 'has been configured and is ready to use.',
    credentialsTitle: 'Your Access Credentials',
    loginUrl: 'Login URL:',
    email: 'Email:',
    tempPassword: 'Temporary Password:',
    securityWarning: 'For security, please change this password after your first login.',
    accessNow: 'Access My System',
    whatYouCanDo: 'What you can do now:',
    registerClients: 'Register your clients and patients',
    createAppointments: 'Create appointments and manage your calendar',
    generateInvoices: 'Generate invoices and receive payments',
    viewReports: 'View business reports',
    customizeSettings: 'Customize your settings',
    needHelp: 'If you need help, contact us at',
    emailSentTo: 'This email was sent to',
  }
};

/**
 * Send an email using Resend API
 */
export async function sendEmail({ to, subject, html, from }: EmailOptions): Promise<{ success: boolean; error?: string }> {
  const resendApiKey = process.env.RESEND_API_KEY;
  
  // Use verified domain from Resend, or configured one
  // Format: "Display Name <email@domain.com>"
  const emailFrom = from || process.env.EMAIL_FROM || `${BRAND.name} <onboarding@resend.dev>`;

  // If no API key, log and return success (for development)
  if (!resendApiKey || resendApiKey === 're_your_resend_api_key_here') {
    console.log('[EMAIL DEV MODE] Would send email:', { to, subject, from: emailFrom });
    console.log('[EMAIL DEV MODE] HTML length:', html.length);
    return { success: true };
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: emailFrom,
        to: Array.isArray(to) ? to : [to],
        subject,
        html,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('[EMAIL ERROR]', error);
      return { success: false, error };
    }

    const data = await response.json();
    console.log('[EMAIL SENT]', data);
    return { success: true };
  } catch (error) {
    console.error('[EMAIL ERROR]', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Generate base email HTML template with AETHEL OS branding
 */
function getBaseEmailTemplate(content: string, language: 'es' | 'en' = 'es'): string {
  const t = translations[language];
  
  return `
<!DOCTYPE html>
<html lang="${language}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${BRAND.name}</title>
  <style>
    body { 
      font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif; 
      background: linear-gradient(180deg, #050410 0%, #0F0E1A 100%); 
      margin: 0; 
      padding: 0;
      min-height: 100vh;
    }
    .container { max-width: 640px; margin: 0 auto; padding: 40px 20px; }
    .logo { 
      width: 80px; 
      height: 80px; 
      background: linear-gradient(135deg, #6C3FCE 0%, #C026D3 100%); 
      border-radius: 20px; 
      display: flex; 
      align-items: center; 
      justify-content: center; 
      margin: 0 auto 32px;
      box-shadow: 0 20px 40px rgba(108, 63, 206, 0.3);
    }
    .logo-text { color: white; font-size: 32px; font-weight: bold; }
    .card { 
      background: rgba(108, 63, 206, 0.07); 
      border: 1px solid rgba(167, 139, 250, 0.2); 
      border-radius: 24px; 
      padding: 40px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    }
    .title { 
      color: #EDE9FE; 
      font-size: 32px; 
      font-weight: bold; 
      margin: 0 0 8px; 
      text-align: center; 
      font-family: 'Cormorant Garamond', serif; 
    }
    .subtitle { 
      color: #F0B429; 
      font-size: 20px; 
      text-align: center; 
      margin: 0 0 32px; 
      font-weight: 600; 
    }
    .content { color: #EDE9FE; font-size: 16px; line-height: 1.7; }
    .content p { margin: 0 0 16px; }
    .highlight-box { 
      background: rgba(108, 63, 206, 0.15); 
      border-radius: 12px; 
      padding: 24px; 
      margin: 24px 0; 
    }
    .highlight-box p { margin: 10px 0; }
    .highlight-label { color: #9D7BEA; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; }
    .highlight-value { color: #EDE9FE; font-size: 16px; font-weight: 500; }
    .button { 
      display: inline-block; 
      background: linear-gradient(135deg, #F0B429 0%, #d97706 100%); 
      color: #050410; 
      padding: 18px 36px; 
      border-radius: 14px; 
      text-decoration: none; 
      font-weight: 700; 
      margin: 28px 0; 
      text-align: center; 
      font-size: 16px;
      box-shadow: 0 10px 30px rgba(240, 180, 41, 0.3);
    }
    .footer { 
      color: rgba(167, 139, 250, 0.6); 
      font-size: 13px; 
      text-align: center; 
      margin-top: 40px; 
      line-height: 1.6;
    }
    .footer a { color: #9D7BEA; }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">
      <span class="logo-text">${BRAND.logoText}</span>
    </div>
    <div class="card">
      ${content}
    </div>
    <div class="footer">
      <p>© 2026 ${BRAND.name} - ${BRAND.tagline[language]}</p>
      <p>${t.support}: <a href="mailto:${BRAND.supportEmail}">${BRAND.supportEmail}</a></p>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Generate welcome email HTML template (BILINGUAL)
 */
export function generateWelcomeEmailHTML(data: WelcomeEmailData): string {
  const language = data.language || 'es';
  const t = translations[language];
  const industryName = industryNames[data.industry]?.[language] || data.industry;

  const content = `
    <h1 class="title">${t.welcome}</h1>
    <p class="subtitle">${t.systemReady}</p>

    <div class="content">
      <p>${t.hello} <strong>${data.name}</strong>,</p>
      <p>${t.thanksJoining} <strong>${data.businessName}</strong> ${t.readyToUse}</p>

      <div class="highlight-box">
        <p><span class="highlight-label">${t.business}</span><br><span class="highlight-value">${data.businessName}</span></p>
        <p><span class="highlight-label">${t.industry}</span><br><span class="highlight-value">${industryName}</span></p>
        <p><span class="highlight-label">${t.accessEmail}</span><br><span class="highlight-value">${data.email}</span></p>
      </div>

      <p>${t.withAethel}</p>
      <ul style="color: #EDE9FE; padding-left: 20px;">
        <li>${t.clientManagement}</li>
        <li>${t.appointmentSystem}</li>
        <li>${t.billingControl}</li>
        <li>${t.businessReports}</li>
        <li>${t.andMore}</li>
      </ul>

      <div style="text-align: center;">
        <a href="${data.loginUrl}" class="button">${t.accessSystem}</a>
      </div>

      <p>${t.questions}</p>
    </div>
  `;

  return getBaseEmailTemplate(content, language);
}

/**
 * Generate password reset email HTML template (BILINGUAL)
 */
export function generatePasswordResetEmailHTML(data: { name: string; resetUrl: string; language?: 'es' | 'en' }): string {
  const language = data.language || 'es';
  const t = translations[language];

  const content = `
    <h1 class="title">${t.passwordReset}</h1>

    <div class="content" style="text-align: center;">
      <p>${t.hello} <strong>${data.name}</strong>,</p>
      <p>${t.resetRequest}</p>

      <div style="text-align: center;">
        <a href="${data.resetUrl}" class="button">${t.resetButton}</a>
      </div>

      <p style="color: #F87171; font-size: 14px; margin-top: 24px;">${t.resetWarning}</p>
    </div>
  `;

  return getBaseEmailTemplate(content, language);
}

/**
 * Generate tenant welcome email HTML with temporary password (BILINGUAL)
 */
export function generateTenantWelcomeEmailHTML(data: {
  userName: string;
  businessName: string;
  loginUrl: string;
  email: string;
  tempPassword: string;
  industry: string;
  language?: 'es' | 'en';
}): string {
  const language = data.language || 'es';
  const t = translations[language];
  const industryName = industryNames[data.industry]?.[language] || data.industry;

  const content = `
    <h1 class="title">${t.systemReadyTitle}</h1>
    <p class="subtitle">${data.businessName}</p>

    <div class="content">
      <p>${t.hello} <strong>${data.userName}</strong>,</p>
      <p>${t.yourSystemFor} <strong>${industryName}</strong> ${t.configured}</p>

      <div style="background: linear-gradient(135deg, rgba(240, 180, 41, 0.1) 0%, rgba(108, 63, 206, 0.1) 100%); border: 2px solid #F0B429; border-radius: 16px; padding: 28px; margin: 28px 0;">
        <p style="color: #F0B429; font-size: 14px; text-transform: uppercase; letter-spacing: 2px; text-align: center; margin: 0 0 20px; font-weight: 600;">🔐 ${t.credentialsTitle}</p>
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 14px 0; border-bottom: 1px solid rgba(167, 139, 250, 0.1);">
          <span style="color: #9D7BEA; font-size: 14px;">${t.loginUrl}</span>
          <span style="color: #EDE9FE; font-size: 13px; font-family: 'DM Mono', monospace;">${data.loginUrl}</span>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 14px 0; border-bottom: 1px solid rgba(167, 139, 250, 0.1);">
          <span style="color: #9D7BEA; font-size: 14px;">${t.email}</span>
          <span style="color: #EDE9FE; font-size: 15px; font-weight: 600; font-family: 'DM Mono', monospace;">${data.email}</span>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 14px 0;">
          <span style="color: #9D7BEA; font-size: 14px;">${t.tempPassword}</span>
          <span style="color: #F0B429; font-size: 22px; font-weight: 700; letter-spacing: 2px;">${data.tempPassword}</span>
        </div>
      </div>

      <div style="background: rgba(248, 113, 113, 0.1); border: 1px solid rgba(248, 113, 113, 0.3); border-radius: 10px; padding: 18px; margin: 24px 0;">
        <p style="color: #F87171; font-size: 14px; margin: 0;">⚠️ ${t.securityWarning}</p>
      </div>

      <div style="text-align: center;">
        <a href="${data.loginUrl}" class="button">🚀 ${t.accessNow}</a>
      </div>

      <div style="background: rgba(108, 63, 206, 0.1); border-radius: 14px; padding: 24px; margin: 28px 0;">
        <h3 style="color: #EDE9FE; font-size: 16px; margin: 0 0 14px;">✨ ${t.whatYouCanDo}</h3>
        <ul style="color: #9D7BEA; font-size: 14px; margin: 0; padding-left: 20px;">
          <li style="margin: 10px 0;">${t.registerClients}</li>
          <li style="margin: 10px 0;">${t.createAppointments}</li>
          <li style="margin: 10px 0;">${t.generateInvoices}</li>
          <li style="margin: 10px 0;">${t.viewReports}</li>
          <li style="margin: 10px 0;">${t.customizeSettings}</li>
        </ul>
      </div>

      <p>${t.needHelp} <a href="mailto:${BRAND.supportEmail}" style="color: #9D7BEA;">${BRAND.supportEmail}</a></p>
    </div>
  `;

  return getBaseEmailTemplate(content, language);
}

/**
 * Send welcome email to new users
 */
export async function sendWelcomeEmail(data: WelcomeEmailData): Promise<{ success: boolean; error?: string }> {
  const html = generateWelcomeEmailHTML(data);
  const language = data.language || 'es';
  const t = translations[language];

  return sendEmail({
    to: data.email,
    subject: language === 'es' 
      ? `¡Bienvenido a ${BRAND.name}! - Tu sistema para ${data.businessName} está listo`
      : `Welcome to ${BRAND.name}! - Your system for ${data.businessName} is ready`,
    html,
  });
}

/**
 * Send password reset email (BILINGUAL)
 */
export async function sendPasswordResetEmail(data: { name: string; email: string; resetUrl: string; language?: 'es' | 'en' }): Promise<{ success: boolean; error?: string }> {
  const html = generatePasswordResetEmailHTML({ name: data.name, resetUrl: data.resetUrl, language: data.language });
  const language = data.language || 'es';
  const t = translations[language];

  return sendEmail({
    to: data.email,
    subject: language === 'es' 
      ? `Restablecer tu contraseña - ${BRAND.name}`
      : `Reset your password - ${BRAND.name}`,
    html,
  });
}

/**
 * Send welcome email to new tenant with temporary password (BILINGUAL)
 */
export async function sendTenantWelcomeEmail(data: {
  to: string;
  userName: string;
  businessName: string;
  loginUrl: string;
  email: string;
  tempPassword: string;
  industry: string;
  language?: 'es' | 'en';
}): Promise<{ success: boolean; error?: string }> {
  const html = generateTenantWelcomeEmailHTML({
    userName: data.userName,
    businessName: data.businessName,
    loginUrl: data.loginUrl,
    email: data.email,
    tempPassword: data.tempPassword,
    industry: data.industry,
    language: data.language
  });
  
  const language = data.language || 'es';

  return sendEmail({
    to: data.to,
    subject: language === 'es'
      ? `🚀 ¡Tu Sistema ${BRAND.name} Está Listo! - ${data.businessName}`
      : `🚀 Your ${BRAND.name} System Is Ready! - ${data.businessName}`,
    html,
  });
}
