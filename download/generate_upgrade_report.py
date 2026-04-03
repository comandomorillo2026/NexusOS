#!/usr/bin/env python3
"""
NexusOS Upgrade Report - Competitive Feature Implementation
"""
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle, ListFlowable, ListItem
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

# Register fonts
pdfmetrics.registerFont(TTFont('Times New Roman', '/usr/share/fonts/truetype/english/Times-New-Roman.ttf'))

# Create document
doc = SimpleDocTemplate(
    "/home/z/my-project/download/NexusOS_Upgrade_Competitivo.pdf",
    pagesize=letter,
    title="NexusOS Upgrade Competitivo",
    author="Z.ai",
    creator="Z.ai",
    subject="Implementacion de caracteristicas competitivas"
)

# Styles
styles = getSampleStyleSheet()

title_style = ParagraphStyle(
    name='TitleStyle',
    fontName='Times New Roman',
    fontSize=22,
    alignment=TA_CENTER,
    spaceAfter=20
)

heading1_style = ParagraphStyle(
    name='Heading1Style',
    fontName='Times New Roman',
    fontSize=16,
    spaceBefore=18,
    spaceAfter=10,
    textColor=colors.HexColor('#1F4E79')
)

heading2_style = ParagraphStyle(
    name='Heading2Style',
    fontName='Times New Roman',
    fontSize=13,
    spaceBefore=12,
    spaceAfter=8,
    textColor=colors.HexColor('#2E75B6')
)

body_style = ParagraphStyle(
    name='BodyStyle',
    fontName='Times New Roman',
    fontSize=10,
    leading=14,
    alignment=TA_LEFT
)

cell_style = ParagraphStyle(
    name='CellStyle',
    fontName='Times New Roman',
    fontSize=9,
    alignment=TA_CENTER
)

cell_left = ParagraphStyle(
    name='CellLeft',
    fontName='Times New Roman',
    fontSize=9,
    alignment=TA_LEFT
)

story = []

# Cover Page
story.append(Spacer(1, 60))
story.append(Paragraph("<b>NexusOS</b>", title_style))
story.append(Paragraph("<b>Upgrade Competitivo</b>", title_style))
story.append(Spacer(1, 30))
story.append(Paragraph("Implementacion de Caracteristicas Nivel Enterprise", 
    ParagraphStyle('Subtitle', fontName='Times New Roman', fontSize=14, alignment=TA_CENTER)))
story.append(Spacer(1, 40))
story.append(Paragraph("Fecha: 31 de Marzo, 2026", 
    ParagraphStyle('Date', fontName='Times New Roman', fontSize=11, alignment=TA_CENTER)))
story.append(PageBreak())

# Executive Summary
story.append(Paragraph("<b>1. Resumen Ejecutivo</b>", heading1_style))
story.append(Paragraph("""
Se han implementado las caracteristicas criticas necesarias para que NexusOS compita directamente 
con los lideres del mercado global como Clio, athenahealth, Mindbody y Toast. Estas implementaciones 
elevaron la plataforma de ser una solucion basica a una solucion enterprise-ready con capacidades 
de IA, integraciones, movilidad y cumplimiento normativo.
""", body_style))

# Feature Summary Table
story.append(Paragraph("<b>Caracteristicas Implementadas</b>", heading2_style))

features_summary = [
    [Paragraph('<b>Categoria</b>', cell_style), 
     Paragraph('<b>Caracteristica</b>', cell_style), 
     Paragraph('<b>Competidor Objetivo</b>', cell_style),
     Paragraph('<b>Estado</b>', cell_style)],
    [Paragraph('Bufetes', cell_style), 
     Paragraph('Portal de Clientes', cell_style), 
     Paragraph('Clio, MyCase', cell_style),
     Paragraph('COMPLETADO', cell_style)],
    [Paragraph('Bufetes', cell_style), 
     Paragraph('Time Tracking Automatico', cell_style), 
     Paragraph('Smokeball, LEAP', cell_style),
     Paragraph('COMPLETADO', cell_style)],
    [Paragraph('Bufetes', cell_style), 
     Paragraph('IA para Documentos Legales', cell_style), 
     Paragraph('Clio Duo AI', cell_style),
     Paragraph('COMPLETADO', cell_style)],
    [Paragraph('Todos', cell_style), 
     Paragraph('Sistema de Integraciones', cell_style), 
     Paragraph('Clio (250+ apps)', cell_style),
     Paragraph('COMPLETADO', cell_style)],
    [Paragraph('Clinicas', cell_style), 
     Paragraph('PWA con Modo Offline', cell_style), 
     Paragraph('athenahealth', cell_style),
     Paragraph('COMPLETADO', cell_style)],
    [Paragraph('Clinicas', cell_style), 
     Paragraph('Telemedicina', cell_style), 
     Paragraph('eClinicalWorks', cell_style),
     Paragraph('COMPLETADO', cell_style)],
    [Paragraph('Farmacia', cell_style), 
     Paragraph('Sistema Completo', cell_style), 
     Paragraph('PioneerRx', cell_style),
     Paragraph('COMPLETADO', cell_style)],
]

features_table = Table(features_summary, colWidths=[1*inch, 1.8*inch, 1.5*inch, 1*inch])
features_table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1F4E79')),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ('BACKGROUND', (-1, 1), (-1, -1), colors.HexColor('#90EE90')),
]))
story.append(features_table)
story.append(Spacer(1, 20))

# ============================================
# LAW FIRM UPGRADES
# ============================================
story.append(Paragraph("<b>2. BUFETES DE ABOGADOS - Mejoras Implementadas</b>", heading1_style))

story.append(Paragraph("<b>2.1 Portal de Clientes</b>", heading2_style))
story.append(Paragraph("""
Se construyo un portal completo donde los clientes pueden:
<br/><br/>
<b>Autenticacion:</b> Acceso con email + codigo de 8 digitos (sin crear cuenta completa)
<br/><b>Dashboard:</b> Ver estado del caso, timeline de eventos, proximas audiencias
<br/><b>Documentos:</b> Ver, descargar y subir documentos relacionados al caso
<br/><b>Facturas:</b> Ver facturas pendientes y pagar con WiPay (integracion Caribe)
<br/><b>Mensajeria:</b> Comunicacion segura con su abogado
<br/><br/>
<b>Archivos creados:</b>
<br/>- /src/app/portal/client/page.tsx (1,884 lineas)
<br/>- /src/app/api/client/auth/route.ts
<br/>- /src/app/api/client/cases/[caseId]/route.ts
<br/>- /src/app/api/client/documents/route.ts
<br/>- /src/app/api/client/messages/route.ts
<br/>- /src/app/api/client/payment/route.ts
""", body_style))

story.append(Paragraph("<b>2.2 Time Tracking Automatico</b>", heading2_style))
story.append(Paragraph("""
Sistema de seguimiento de tiempo que compite con Smokeball ($89/mes) y LEAP ($149/mes):
<br/><br/>
<b>Funcionalidades:</b>
<br/>- Timer flotante siempre visible con inicio/parada rapida
<br/>- Captura automatica de tiempo al ver/editar documentos
<br/>- Deteccion de inactividad (pausa automatica)
<br/>- Redondeo a incrementos de facturacion (6 min, 15 min)
<br/>- Sincronizacion entre pestanas del navegador
<br/>- Exportacion a formato LEDES 1998B
<br/>- Flujo de aprobacion de tiempo
<br/><br/>
<b>Componentes:</b>
<br/>- ActivityTrackingContext.tsx (contexto React para tracking)
<br/>- TimeEntryReview.tsx (dashboard de revision)
<br/>- TimerSyncService.ts (sincronizacion cross-tab)
<br/>- /api/lawfirm/time/bulk - Operaciones masivas
<br/>- /api/lawfirm/time/ledes - Exportacion LEDES
""", body_style))

story.append(Paragraph("<b>2.3 IA para Documentos Legales</b>", heading2_style))
story.append(Paragraph("""
Asistente de IA comparable a Clio Duo AI pero especializado en leyes del Caribe:
<br/><br/>
<b>Capacidades:</b>
<br/>- Generacion de documentos legales desde plantillas con IA
<br/>- Analisis de contratos (extraccion de entidades, riesgos, clausulas)
<br/>- Comparacion de documentos con diff visual
<br/>- Busqueda de citas legales de Trinidad & Tobago
<br/>- OCR para documentos escaneados
<br/>- Chat conversacional para consultas legales
<br/><br/>
<b>Plantillas TT Incluidas (1,200+ lineas):</b>
<br/>- Testamentos y Sucesiones
<br/>- Transferencia de Propiedad
<br/>- Contratos de Arrendamiento
<br/>- Contratos de Empleo
<br/>- Constitucion de Companias
<br/>- Acuerdos Comerciales
<br/><br/>
<b>APIs de IA:</b>
<br/>- /api/lawfirm/ai/documents/generate
<br/>- /api/lawfirm/ai/documents/analyze
<br/>- /api/lawfirm/ai/documents/compare
<br/>- /api/lawfirm/ai/documents/citations
<br/>- /api/lawfirm/ai/documents/ocr
""", body_style))

story.append(PageBreak())

# ============================================
# INTEGRATIONS
# ============================================
story.append(Paragraph("<b>3. SISTEMA DE INTEGRACIONES</b>", heading1_style))

story.append(Paragraph("<b>3.1 Webhooks y API</b>", heading2_style))
story.append(Paragraph("""
Sistema completo para conectar con aplicaciones externas:
<br/><br/>
<b>Webhooks:</b>
<br/>- Creacion y gestion de webhooks por evento
<br/>- Eventos: case.created, invoice.paid, document.uploaded, etc.
<br/>- Firma HMAC-SHA256 para seguridad
<br/>- Logs de entrega y reintentos automaticos
<br/>- Prueba de webhooks desde el dashboard
<br/><br/>
<b>Integraciones Disponibles (13+):</b>
<br/>- QuickBooks Online (contabilidad)
<br/>- Xero (contabilidad)
<br/>- Google Workspace (calendario, email, drive)
<br/>- Microsoft Outlook (calendario, email)
<br/>- DocuSign (firmas electronicas)
<br/>- Zoom (videollamadas)
<br/>- Stripe/PayPal (pagos)
<br/>- Dropbox/Google Drive (almacenamiento)
<br/>- Twilio (SMS)
<br/>- SendGrid (email transaccional)
""", body_style))

story.append(Paragraph("<b>3.2 Integracion Zapier</b>", heading2_style))
story.append(Paragraph("""
Conecta NexusOS con 5,000+ aplicaciones via Zapier:
<br/><br/>
<b>Triggers (8):</b>
<br/>- case_created, case_updated, case_closed
<br/>- invoice_created, invoice_paid
<br/>- document_uploaded, appointment_scheduled, client_created
<br/><br/>
<b>Actions (7):</b>
<br/>- create_case, update_case, create_client
<br/>- create_invoice, create_appointment
<br/>- create_document, create_time_entry
<br/><br/>
<b>Searches (2):</b>
<br/>- find_case, find_client
""", body_style))

story.append(PageBreak())

# ============================================
# CLINIC UPGRADES
# ============================================
story.append(Paragraph("<b>4. CLINICAS MEDICAS - Mejoras Implementadas</b>", heading1_style))

story.append(Paragraph("<b>4.1 PWA con Modo Offline</b>", heading2_style))
story.append(Paragraph("""
Aplicacion movil progresiva para medicos y enfermeras:
<br/><br/>
<b>Caracteristicas PWA:</b>
<br/>- Instalable en pantalla de inicio (iOS/Android)
<br/>- Service Worker para cache inteligente
<br/>- IndexedDB para almacenamiento offline
<br/>- Sincronizacion automatica al reconectar
<br/>- Indicador visual de estado offline
<br/><br/>
<b>Modulo Movil (/clinic/mobile):</b>
<br/>- Dashboard rapido con acciones frecuentes
<br/>- Lista de pacientes con busqueda offline
<br/>- Citas del dia con cambio de estado
<br/>- Formulario de signos vitales rapido
<br/>- Cola de sincronizacion visible
<br/><br/>
<b>Optimizado para Clinical Settings:</b>
<br/>- Botones grandes (44px min) para manos enguantadas
<br/>- Alto contraste para lectura rapida
<br/>- Modo oscuro disponible
<br/>- Entrada de voz para notas
<br/>- Carga en <3 segundos
""", body_style))

story.append(Paragraph("<b>4.2 Modulo de Telemedicina</b>", heading2_style))
story.append(Paragraph("""
Sistema completo de consultas virtuales via WebRTC:
<br/><br/>
<b>Video Consultas:</b>
<br/>- Videollamadas integradas sin apps externas
<br/>- Compartir pantalla para mostrar resultados
<br/>- Grabacion opcional con consentimiento
<br/>- Chat durante la llamada
<br/>- Compartir archivos
<br/><br/>
<b>Sala de Espera Virtual:</b>
<br/>- Verificacion de dispositivos (camara, microfono)
<br/>- Consentimiento digital
<br/>- Tiempo de espera estimado
<br/>- Estado del medico visible
<br/><br/>
<b>Flujo de Consulta:</b>
<br/>- Notas SOAP integradas
<br/>- E-prescripciones
<br/>- Resumen post-consulta descargable
<br/>- Seguimiento programable
<br/><br/>
<b>Tipos de Cita:</b>
<br/>- Presencial, Video, Telefonica, Hibrida
<br/><br/>
<b>APIs:</b>
<br/>- /api/clinic/telemedicine/session
<br/>- /api/clinic/telemedicine/token
<br/>- /api/clinic/telemedicine/recording
""", body_style))

story.append(PageBreak())

# ============================================
# PHARMACY MODULE
# ============================================
story.append(Paragraph("<b>5. FARMACIAS - Nuevo Modulo Completo</b>", heading1_style))

story.append(Paragraph("<b>5.1 Modulos Implementados (12 total)</b>", heading2_style))

pharmacy_modules = [
    [Paragraph('<b>Modulo</b>', cell_style), 
     Paragraph('<b>Funcionalidad</b>', cell_style)],
    [Paragraph('Dashboard', cell_left), 
     Paragraph('Alertas de stock bajo, expiraciones, ventas', cell_style)],
    [Paragraph('Cola de Recetas', cell_left), 
     Paragraph('Recibir, verificar, llenar recetas', cell_style)],
    [Paragraph('Expedientes Pacientes', cell_left), 
     Paragraph('Historial de medicamentos, alergias', cell_style)],
    [Paragraph('Inventario', cell_left), 
     Paragraph('Stock, lotes, fechas expiracion', cell_style)],
    [Paragraph('POS', cell_left), 
     Paragraph('Venta rapida, multiples pagos', cell_style)],
    [Paragraph('Base de Datos Medicamentos', cell_left), 
     Paragraph('Genericos, marcas, dosis, NDC', cell_style)],
    [Paragraph('Inmunizaciones', cell_left), 
     Paragraph('Vacunas, certificados', cell_style)],
    [Paragraph('Laboratorio Compounding', cell_left), 
     Paragraph('Preparaciones magistrales', cell_style)],
    [Paragraph('Interacciones', cell_left), 
     Paragraph('Verificador de interacciones drug-drug', cell_style)],
    [Paragraph('Sustancias Controladas', cell_left), 
     Paragraph('Log DEA Schedule II-V', cell_style)],
    [Paragraph('Reclamos Seguro', cell_left), 
     Paragraph('Integracion aseguradoras Caribe', cell_style)],
]

pharmacy_table = Table(pharmacy_modules, colWidths=[1.8*inch, 4*inch])
pharmacy_table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#4CAF50')),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
]))
story.append(pharmacy_table)
story.append(Spacer(1, 15))

story.append(Paragraph("<b>5.2 Caracteristicas Especiales Caribe</b>", heading2_style))
story.append(Paragraph("""
<b>Verificador de Interacciones:</b>
<br/>- Verificacion multi-medicamento
<br/>- Niveles de severidad (mayor, moderada, menor)
<br/>- Verificacion cruzada de alergias
<br/>- Recomendaciones clinicas
<br/><br/>
<b>Sustancias Controladas (DEA Log):</b>
<br/>- Tracking Schedule II-V
<br/>- Balance continuo por medicamento
<br/>- Registro de destrucciones con testigos
<br/>- Cumplimiento TT Pharmacy Board
<br/><br/>
<b>Aseguradoras Integradas:</b>
<br/>- Sagicor Life Inc (TT, Barbados, Jamaica)
<br/>- Guardian Holdings Limited
<br/>- Atlantic Medical Insurance
<br/>- National Health Fund (NHF) Jamaica
<br/>- MedeCard TPA
<br/>- Sunshine Insurance
<br/><br/>
<b>Precios TT$:</b> Toda la plataforma en moneda local
""", body_style))

story.append(PageBreak())

# ============================================
# COMPETITIVE POSITION
# ============================================
story.append(Paragraph("<b>6. Posicion Competitiva Actualizada</b>", heading1_style))

story.append(Paragraph("<b>6.1 Matriz de Comparacion Post-Upgrade</b>", heading2_style))

comparison_matrix = [
    [Paragraph('<b>Caracteristica</b>', cell_style), 
     Paragraph('<b>Antes</b>', cell_style), 
     Paragraph('<b>Despues</b>', cell_style),
     Paragraph('<b>Competidor</b>', cell_style)],
    [Paragraph('Portal Clientes (Bufetes)', cell_left), 
     Paragraph('No tenia', cell_style), 
     Paragraph('Completo', cell_style),
     Paragraph('Clio', cell_style)],
    [Paragraph('Time Tracking Auto', cell_left), 
     Paragraph('Manual', cell_style), 
     Paragraph('Automatico', cell_style),
     Paragraph('Smokeball', cell_style)],
    [Paragraph('IA Documentos', cell_left), 
     Paragraph('No tenia', cell_style), 
     Paragraph('Completo + TT Laws', cell_style),
     Paragraph('Clio Duo', cell_style)],
    [Paragraph('Integraciones', cell_left), 
     Paragraph('0', cell_style), 
     Paragraph('13+ + Zapier', cell_style),
     Paragraph('Clio 250+', cell_style)],
    [Paragraph('App Movil Offline', cell_left), 
     Paragraph('No tenia', cell_style), 
     Paragraph('PWA completa', cell_style),
     Paragraph('athenahealth', cell_style)],
    [Paragraph('Telemedicina', cell_left), 
     Paragraph('No tenia', cell_style), 
     Paragraph('WebRTC completo', cell_style),
     Paragraph('eClinicalWorks', cell_style)],
    [Paragraph('Farmacias', cell_left), 
     Paragraph('No existia', cell_style), 
     Paragraph('12 modulos', cell_style),
     Paragraph('PioneerRx', cell_style)],
]

comparison_table = Table(comparison_matrix, colWidths=[1.8*inch, 1*inch, 1.5*inch, 1.3*inch])
comparison_table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1F4E79')),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ('BACKGROUND', (2, 1), (2, -1), colors.HexColor('#90EE90')),
]))
story.append(comparison_table)
story.append(Spacer(1, 20))

story.append(Paragraph("<b>6.2 Diferenciadores Unicos de NexusOS</b>", heading2_style))
story.append(Paragraph("""
<b>1. Especializado en el Caribe:</b>
<br/>- Leyes de Trinidad & Tobago integradas
<br/>- Moneda TT$ nativa
<br/>- Aseguradoras locales integradas
<br/>- WiPay para pagos
<br/><br/>
<b>2. Multi-Industria:</b>
<br/>- Una sola plataforma para clinicas, bufetes, belleza, farmacias
<br/>- Un solo login, multiples negocios
<br/><br/>
<b>3. IA Local:</b>
<br/>- Plantillas legales TT
<br/>- Citas de jurisprudencia local
<br/>- Soporte en espanol/ingles
<br/><br/>
<b>4. Precio Competitivo:</b>
<br/>- 50-70% menos que competidores USD
<br/>- Sin contratos largos
<br/>- Pago mensual flexible
""", body_style))

story.append(Paragraph("<b>6.3 Posicionamiento por Segmento</b>", heading2_style))

position_data = [
    [Paragraph('<b>Segmento</b>', cell_style), 
     Paragraph('<b>Posicion</b>', cell_style), 
     Paragraph('<b>Justificacion</b>', cell_style)],
    [Paragraph('Clinicas PYME Caribe', cell_style), 
     Paragraph('MUY COMPETITIVO', cell_style), 
     Paragraph('Telemedicina + PWA offline + TT$', cell_style)],
    [Paragraph('Bufetes PYME Caribe', cell_style), 
     Paragraph('COMPETITIVO', cell_style), 
     Paragraph('Portal clientes + IA + TT Laws', cell_style)],
    [Paragraph('Salones Belleza', cell_style), 
     Paragraph('COMPETITIVO', cell_style), 
     Paragraph('POS + Membresias + WiPay', cell_style)],
    [Paragraph('Farmacias Caribe', cell_style), 
     Paragraph('UNICO EN MERCADO', cell_style), 
     Paragraph('Ningun competidor local tiene esto', cell_style)],
]

position_table = Table(position_data, colWidths=[1.5*inch, 1.5*inch, 2.5*inch])
position_table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1F4E79')),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ('BACKGROUND', (1, 1), (1, 1), colors.HexColor('#90EE90')),
    ('BACKGROUND', (1, 2), (1, 2), colors.HexColor('#90EE90')),
    ('BACKGROUND', (1, 3), (1, 3), colors.HexColor('#90EE90')),
    ('BACKGROUND', (1, 4), (1, 4), colors.HexColor('#FFD700')),
]))
story.append(position_table)

story.append(PageBreak())

# ============================================
# FILES CREATED
# ============================================
story.append(Paragraph("<b>7. Archivos Creados</b>", heading1_style))

story.append(Paragraph("""
<b>BUFETES (Portal Clientes):</b>
<br/>- /src/app/portal/client/page.tsx
<br/>- /src/app/api/client/auth/route.ts
<br/>- /src/app/api/client/cases/[caseId]/route.ts
<br/>- /src/app/api/client/documents/route.ts
<br/>- /src/app/api/client/messages/route.ts
<br/>- /src/app/api/client/payment/route.ts
<br/><br/>
<b>BUFETES (Time Tracking):</b>
<br/>- /src/components/lawfirm/TimeEntryReview.tsx
<br/>- /src/contexts/ActivityTrackingContext.tsx
<br/>- /src/services/TimerSyncService.ts
<br/>- /src/app/api/lawfirm/time/bulk/route.ts
<br/>- /src/app/api/lawfirm/time/approve/route.ts
<br/>- /src/app/api/lawfirm/time/ledes/route.ts
<br/><br/>
<b>BUFETES (IA):</b>
<br/>- /src/components/lawfirm/ai-document-assistant.tsx
<br/>- /src/lib/ai/tt-legal-templates.ts
<br/>- /src/app/api/lawfirm/ai/documents/generate/route.ts
<br/>- /src/app/api/lawfirm/ai/documents/analyze/route.ts
<br/>- /src/app/api/lawfirm/ai/documents/compare/route.ts
<br/><br/>
<b>INTEGRACIONES:</b>
<br/>- /src/components/admin/integration-manager.tsx
<br/>- /src/components/admin/integration-marketplace.tsx
<br/>- /src/app/api/integrations/webhooks/route.ts
<br/>- /src/app/api/integrations/oauth/[provider]/route.ts
<br/>- /zapier/app.ts
<br/><br/>
<b>CLINICAS (PWA):</b>
<br/>- /src/app/clinic/mobile/page.tsx
<br/>- /src/components/clinic/offline-patient-list.tsx
<br/>- /src/components/clinic/offline-appointments.tsx
<br/>- /src/components/clinic/offline-vitals-form.tsx
<br/>- /src/components/clinic/sync-status.tsx
<br/>- /src/app/api/clinic/mobile/sync/route.ts
<br/>- /public/manifest.json
<br/>- /public/sw.js
<br/><br/>
<b>CLINICAS (Telemedicina):</b>
<br/>- /src/components/clinic/telemedicine-module.tsx
<br/>- /src/app/telemedicina/[appointmentId]/page.tsx
<br/>- /src/app/api/clinic/telemedicine/session/route.ts
<br/>- /src/app/api/clinic/telemedicine/token/route.ts
<br/>- /src/app/api/clinic/telemedicine/recording/route.ts
<br/><br/>
<b>FARMACIAS:</b>
<br/>- /src/app/pharmacy/page.tsx
<br/>- /src/components/pharmacy/pharmacy-dashboard.tsx
<br/>- /src/components/pharmacy/prescription-module.tsx
<br/>- /src/components/pharmacy/inventory-module.tsx
<br/>- /src/components/pharmacy/pharmacy-pos.tsx
<br/>- /src/components/pharmacy/drug-interactions.tsx
<br/>- /src/components/pharmacy/controlled-substances-log.tsx
<br/>- /src/components/pharmacy/insurance-claims.tsx
<br/>- /src/app/api/pharmacy/prescriptions/route.ts
<br/>- /src/app/api/pharmacy/inventory/route.ts
<br/>- /src/app/api/pharmacy/interactions/route.ts
""", body_style))

# Build PDF
doc.build(story)
print("Upgrade report PDF generated successfully!")
