import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { randomBytes } from 'crypto';
import { sendEmail } from '@/lib/email/resend';

// Token expires in 1 hour
const TOKEN_EXPIRY_MS = 60 * 60 * 1000;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email requerido' }, { status: 400 });
    }

    // Find user by email
    const user = await db.systemUser.findUnique({
      where: { email: email.toLowerCase() }
    });

    // IMPORTANT: Always return success to prevent email enumeration
    // Even if user doesn't exist, we don't reveal it
    if (!user) {
      console.log('[FORGOT_PASSWORD] User not found:', email);
      return NextResponse.json({ 
        success: true, 
        message: 'Si el email existe, recibirás instrucciones' 
      });
    }

    // Generate secure token
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_MS).toISOString();

    // Delete any existing tokens for this user
    await db.passwordResetToken.deleteMany({
      where: { userId: user.id }
    });

    // Create new token
    await db.passwordResetToken.create({
      data: {
        id: `reset_${randomBytes(8).toString('hex')}`,
        userId: user.id,
        token,
        expiresAt,
      }
    });

    // Build reset URL
    const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://aethel-os.vercel.app';
    const resetUrl = `${baseUrl}/reset-password?token=${token}`;

    // Send email
    const html = generateResetEmailHTML({
      name: user.name || 'Usuario',
      resetUrl,
      expiresHours: 1
    });

    const result = await sendEmail({
      to: email,
      subject: 'Restablecer tu contraseña - AETHEL OS',
      html
    });

    if (!result.success) {
      console.error('[FORGOT_PASSWORD] Failed to send email:', result.error);
      // Still return success to prevent enumeration
    }

    console.log('[FORGOT_PASSWORD] Reset email sent to:', email);

    return NextResponse.json({ 
      success: true, 
      message: 'Si el email existe, recibirás instrucciones' 
    });

  } catch (error) {
    console.error('[FORGOT_PASSWORD] Error:', error);
    return NextResponse.json({ 
      success: true, // Still return success to prevent enumeration
      message: 'Si el email existe, recibirás instrucciones' 
    });
  }
}

function generateResetEmailHTML(data: { name: string; resetUrl: string; expiresHours: number }): string {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Restablecer Contraseña - AETHEL OS</title>
  <style>
    body { font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif; background: #050410; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
    .logo { width: 64px; height: 64px; background: linear-gradient(135deg, #6C3FCE 0%, #C026D3 100%); border-radius: 16px; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px; }
    .logo-text { color: white; font-size: 24px; font-weight: bold; }
    .card { background: rgba(108, 63, 206, 0.07); border: 1px solid rgba(167, 139, 250, 0.2); border-radius: 16px; padding: 32px; }
    .title { color: #EDE9FE; font-size: 24px; font-weight: bold; margin: 0 0 16px; text-align: center; font-family: 'Cormorant Garamond', serif; }
    .content { color: #EDE9FE; font-size: 16px; line-height: 1.6; text-align: center; }
    .content p { margin: 0 0 16px; }
    .button { display: inline-block; background: linear-gradient(135deg, #6C3FCE 0%, #C026D3 100%); color: white; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; margin: 24px 0; }
    .warning { color: #F87171; font-size: 14px; margin-top: 24px; }
    .footer { color: rgba(167, 139, 250, 0.5); font-size: 14px; text-align: center; margin-top: 32px; }
    .code-box { background: rgba(108, 63, 206, 0.15); border-radius: 12px; padding: 20px; margin: 24px 0; text-align: center; }
    .code { font-family: monospace; font-size: 14px; color: #9D7BEA; word-break: break-all; }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">
      <span class="logo-text">A</span>
    </div>

    <div class="card">
      <h1 class="title">Restablecer tu Contraseña</h1>

      <div class="content">
        <p>Hola <strong>${data.name}</strong>,</p>
        <p>Recibimos una solicitud para restablecer tu contraseña. Haz clic en el botón de abajo para crear una nueva:</p>

        <div style="text-align: center;">
          <a href="${data.resetUrl}" class="button">Restablecer Contraseña</a>
        </div>

        <div class="code-box">
          <p style="margin: 0 0 8px; color: #9D7BEA; font-size: 12px;">O copia este enlace en tu navegador:</p>
          <p class="code">${data.resetUrl}</p>
        </div>

        <p class="warning">⚠️ Este enlace expirará en ${data.expiresHours} hora(s) por seguridad.</p>

        <p style="color: rgba(167, 139, 250, 0.7); font-size: 14px; margin-top: 24px;">
          Si no solicitaste este cambio, puedes ignorar este email de forma segura.
        </p>
      </div>
    </div>

    <div class="footer">
      <p>© 2026 AETHEL OS. Todos los derechos reservados.</p>
      <p>Soporte: <a href="mailto:soporte@aethel.tt" style="color: #9D7BEA;">soporte@aethel.tt</a></p>
    </div>
  </div>
</body>
</html>
  `;
}
