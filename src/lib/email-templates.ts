// CondoOS - Email Templates with Resend
// Professional email templates for condominium management

export const EMAIL_TEMPLATES = {
  // Invoice notification
  invoiceCreated: {
    subject: 'Tu factura de mantenimiento está lista - {{propertyName}}',
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #050410; color: #EDE9FE; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
    .card { background: #0A0820; border-radius: 16px; padding: 32px; border: 1px solid rgba(167,139,250,0.2); }
    .logo { text-align: center; margin-bottom: 32px; }
    .logo h1 { background: linear-gradient(135deg, #6C3FCE, #C026D3); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-size: 28px; margin: 0; }
    .amount { font-size: 48px; font-weight: bold; color: #F0B429; text-align: center; margin: 24px 0; }
    .details { background: rgba(108,63,206,0.1); border-radius: 12px; padding: 20px; margin: 24px 0; }
    .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid rgba(167,139,250,0.1); }
    .detail-row:last-child { border-bottom: none; }
    .btn { display: inline-block; background: linear-gradient(135deg, #6C3FCE, #C026D3); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 24px; }
    .footer { text-align: center; margin-top: 32px; color: #9D7BEA; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="logo">
        <h1>🏠 CondoOS</h1>
      </div>
      
      <h2 style="text-align: center; color: #EDE9FE;">Tu Factura está Lista</h2>
      
      <div class="amount">{{currency}} {{amount}}</div>
      
      <div class="details">
        <div class="detail-row">
          <span>Propiedad:</span>
          <span>{{propertyName}}</span>
        </div>
        <div class="detail-row">
          <span>Unidad:</span>
          <span>{{unitNumber}}</span>
        </div>
        <div class="detail-row">
          <span>Período:</span>
          <span>{{period}}</span>
        </div>
        <div class="detail-row">
          <span>Vencimiento:</span>
          <span style="color: #F0B429;">{{dueDate}}</span>
        </div>
      </div>
      
      <p style="text-align: center; color: #9D7BEA;">
        Evita cargos por mora realizando tu pago antes de la fecha de vencimiento.
      </p>
      
      <div style="text-align: center;">
        <a href="{{paymentLink}}" class="btn">Pagar Ahora</a>
      </div>
    </div>
    
    <div class="footer">
      <p>© 2024 CondoOS - Sistema de Gestión de Condominios</p>
      <p>{{propertyAddress}}</p>
    </div>
  </div>
</body>
</html>
    `,
  },

  // Payment reminder
  paymentReminder: {
    subject: '⏰ Recordatorio: Tu pago vence en {{days}} días',
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #050410; color: #EDE9FE; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
    .card { background: #0A0820; border-radius: 16px; padding: 32px; border: 1px solid rgba(240,180,41,0.3); }
    .alert { background: rgba(240,180,41,0.1); border-left: 4px solid #F0B429; padding: 16px; margin: 24px 0; border-radius: 0 8px 8px 0; }
    .amount { font-size: 36px; font-weight: bold; color: #F0B429; text-align: center; }
    .btn { display: inline-block; background: linear-gradient(135deg, #F0B429, #d97706); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <h2 style="text-align: center;">⏰ Recordatorio de Pago</h2>
      
      <div class="alert">
        <strong>Importante:</strong> Tu factura vence en {{days}} días. Evita cargos por mora.
      </div>
      
      <p style="text-align: center; color: #9D7BEA;">Monto a pagar:</p>
      <div class="amount">{{currency}} {{amount}}</div>
      
      <div style="text-align: center; margin-top: 24px;">
        <a href="{{paymentLink}}" class="btn">Realizar Pago</a>
      </div>
    </div>
  </div>
</body>
</html>
    `,
  },

  // Overdue notice
  overdueNotice: {
    subject: '⚠️ URGENTE: Factura vencida - {{propertyName}}',
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #050410; color: #EDE9FE; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
    .card { background: #0A0820; border-radius: 16px; padding: 32px; border: 1px solid rgba(248,113,113,0.3); }
    .alert { background: rgba(248,113,113,0.1); border-left: 4px solid #F87171; padding: 16px; margin: 24px 0; border-radius: 0 8px 8px 0; }
    .amount { font-size: 36px; font-weight: bold; color: #F87171; text-align: center; }
    .late-fee { color: #F87171; }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <h2 style="text-align: center;">⚠️ Factura Vencida</h2>
      
      <div class="alert">
        <strong>AVISO IMPORTANTE:</strong> Tu factura está vencida. Se han aplicado cargos por mora.
      </div>
      
      <p style="text-align: center; color: #9D7BEA;">Balance actual:</p>
      <div class="amount">{{currency}} {{totalAmount}}</div>
      
      <p style="text-align: center; color: #9D7BEA; font-size: 14px;">
        Incluye mora de: <span class="late-fee">{{currency}} {{lateFee}}</span>
      </p>
      
      <div style="background: rgba(108,63,206,0.1); border-radius: 8px; padding: 16px; margin-top: 24px;">
        <p style="margin: 0; color: #EDE9FE; font-size: 14px;">
          Para evitar acciones adicionales, por favor regulariza tu situación realizando el pago a la brevedad.
        </p>
      </div>
    </div>
  </div>
</body>
</html>
    `,
  },

  // Reservation confirmed
  reservationConfirmed: {
    subject: '✅ Reserva confirmada - {{amenityName}}',
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #050410; color: #EDE9FE; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
    .card { background: #0A0820; border-radius: 16px; padding: 32px; border: 1px solid rgba(52,211,153,0.3); }
    .confirmed { color: #34D399; text-align: center; font-size: 24px; margin-bottom: 24px; }
    .details { background: rgba(108,63,206,0.1); border-radius: 12px; padding: 20px; margin: 24px 0; }
    .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid rgba(167,139,250,0.1); }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="confirmed">✅ Reserva Confirmada</div>
      
      <h2 style="text-align: center;">{{amenityName}}</h2>
      
      <div class="details">
        <div class="detail-row">
          <span>Fecha:</span>
          <span>{{date}}</span>
        </div>
        <div class="detail-row">
          <span>Hora:</span>
          <span>{{startTime}} - {{endTime}}</span>
        </div>
        <div class="detail-row">
          <span>Invitados:</span>
          <span>{{guests}}</span>
        </div>
        {{#if fee}}
        <div class="detail-row">
          <span>Costo:</span>
          <span>{{currency}} {{fee}}</span>
        </div>
        {{/if}}
      </div>
      
      <p style="text-align: center; color: #9D7BEA; font-size: 14px;">
        Recuerda las reglas de uso del área común. ¡Disfruta tu evento!
      </p>
    </div>
  </div>
</body>
</html>
    `,
  },

  // Maintenance request update
  maintenanceUpdate: {
    subject: '🔧 Actualización de solicitud #{{requestNumber}}',
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #050410; color: #EDE9FE; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
    .card { background: #0A0820; border-radius: 16px; padding: 32px; border: 1px solid rgba(167,139,250,0.2); }
    .status { padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: 600; display: inline-block; }
    .status-completed { background: rgba(52,211,153,0.2); color: #34D399; }
    .status-in-progress { background: rgba(34,211,238,0.2); color: #22D3EE; }
    .status-assigned { background: rgba(240,180,41,0.2); color: #F0B429; }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <h2 style="text-align: center;">🔧 Solicitud de Mantenimiento</h2>
      
      <p style="text-align: center; color: #9D7BEA;">#{{requestNumber}}</p>
      
      <div style="text-align: center; margin: 24px 0;">
        <span class="status status-{{statusClass}}">{{status}}</span>
      </div>
      
      <div style="background: rgba(108,63,206,0.1); border-radius: 8px; padding: 16px; margin: 24px 0;">
        <p style="margin: 0 0 8px 0; color: #9D7BEA; font-size: 14px;">Problema reportado:</p>
        <p style="margin: 0; color: #EDE9FE;">{{description}}</p>
      </div>
      
      {{#if notes}}
      <div style="background: rgba(108,63,206,0.05); border-radius: 8px; padding: 16px;">
        <p style="margin: 0 0 8px 0; color: #9D7BEA; font-size: 14px;">Notas del técnico:</p>
        <p style="margin: 0; color: #EDE9FE;">{{notes}}</p>
      </div>
      {{/if}}
    </div>
  </div>
</body>
</html>
    `,
  },

  // New announcement
  newAnnouncement: {
    subject: '📢 {{title}} - {{propertyName}}',
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #050410; color: #EDE9FE; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
    .card { background: #0A0820; border-radius: 16px; padding: 32px; border: 1px solid rgba(167,139,250,0.2); }
    .priority-urgent { border-left: 4px solid #F87171; }
    .priority-high { border-left: 4px solid #F0B429; }
  </style>
</head>
<body>
  <div class="container">
    <div class="card {{priorityClass}}">
      <h2 style="margin-top: 0;">📢 {{title}}</h2>
      
      <p style="color: #9D7BEA; font-size: 14px; margin-bottom: 24px;">
        {{propertyName}} • {{date}}
      </p>
      
      <div style="color: #EDE9FE; line-height: 1.6;">
        {{content}}
      </div>
    </div>
  </div>
</body>
</html>
    `,
  },

  // Vote invitation
  voteInvitation: {
    subject: '🗳️ Tu voto es importante - {{voteTitle}}',
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #050410; color: #EDE9FE; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
    .card { background: #0A0820; border-radius: 16px; padding: 32px; border: 1px solid rgba(167,139,250,0.2); }
    .btn { display: inline-block; background: linear-gradient(135deg, #6C3FCE, #C026D3); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <h2 style="text-align: center;">🗳️ Votación Electrónica</h2>
      
      <h3 style="text-align: center; color: #B197FC;">{{voteTitle}}</h3>
      
      <p style="text-align: center; color: #EDE9FE;">{{description}}</p>
      
      <div style="background: rgba(108,63,206,0.1); border-radius: 8px; padding: 16px; margin: 24px 0;">
        <p style="margin: 0; color: #9D7BEA; font-size: 14px; text-align: center;">
          ⏰ Válido hasta: {{endDate}}<br>
          👥 Se requiere quórum: {{quorum}}%
        </p>
      </div>
      
      <div style="text-align: center;">
        <a href="{{voteLink}}" class="btn">Emitir mi Voto</a>
      </div>
    </div>
  </div>
</body>
</html>
    `,
  },

  // Payment confirmation
  paymentConfirmed: {
    subject: '✅ Pago recibido - Recibo #{{receiptNumber}}',
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #050410; color: #EDE9FE; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
    .card { background: #0A0820; border-radius: 16px; padding: 32px; border: 1px solid rgba(52,211,153,0.3); }
    .success { color: #34D399; text-align: center; font-size: 48px; margin-bottom: 16px; }
    .amount { font-size: 36px; font-weight: bold; color: #34D399; text-align: center; }
    .receipt-details { background: rgba(108,63,206,0.1); border-radius: 12px; padding: 20px; margin: 24px 0; }
    .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid rgba(167,139,250,0.1); }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="success">✓</div>
      
      <h2 style="text-align: center; margin-top: 0;">Pago Recibido</h2>
      
      <div class="amount">{{currency}} {{amount}}</div>
      
      <div class="receipt-details">
        <div class="detail-row">
          <span>Recibo #:</span>
          <span>{{receiptNumber}}</span>
        </div>
        <div class="detail-row">
          <span>Fecha:</span>
          <span>{{paymentDate}}</span>
        </div>
        <div class="detail-row">
          <span>Método:</span>
          <span>{{paymentMethod}}</span>
        </div>
        <div class="detail-row">
          <span>Unidad:</span>
          <span>{{unitNumber}}</span>
        </div>
        <div class="detail-row">
          <span>Período:</span>
          <span>{{period}}</span>
        </div>
      </div>
      
      <p style="text-align: center; color: #9D7BEA; font-size: 14px;">
        Guarda este correo como comprobante de pago.
      </p>
    </div>
  </div>
</body>
</html>
    `,
  },
};

// Helper to replace template variables
export function renderTemplate(template: string, variables: Record<string, string | number>): string {
  let result = template;
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    result = result.replace(regex, String(value));
  });
  return result;
}

// Email service configuration
export const EMAIL_CONFIG = {
  from: 'CondoOS <noreply@condoos.aethel.tt>',
  replyTo: 'soporte@condoos.aethel.tt',
};
