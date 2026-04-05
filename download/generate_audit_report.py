#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
AETHEL OS - Informe de Auditoría Completa
Generado automáticamente por Z.ai
"""

from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY
from reportlab.lib import colors
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase.pdfmetrics import registerFontFamily
from reportlab.lib.units import inch

# Register fonts
pdfmetrics.registerFont(TTFont('SimHei', '/usr/share/fonts/truetype/chinese/SimHei.ttf'))
pdfmetrics.registerFont(TTFont('Times New Roman', '/usr/share/fonts/truetype/english/Times-New-Roman.ttf'))

# Register font families for bold tags
registerFontFamily('SimHei', normal='SimHei', bold='SimHei')
registerFontFamily('Times New Roman', normal='Times New Roman', bold='Times New Roman')

# Create document
doc = SimpleDocTemplate(
    "/home/z/my-project/download/AETHEL_OS_Auditoria_Completa.pdf",
    pagesize=letter,
    title="AETHEL OS - Auditoría Completa",
    author="Z.ai",
    creator="Z.ai",
    subject="Estado actual del proyecto AETHEL OS"
)

styles = getSampleStyleSheet()

# Custom styles
title_style = ParagraphStyle(
    name='TitleStyle',
    fontName='Times New Roman',
    fontSize=28,
    leading=34,
    alignment=TA_CENTER,
    spaceAfter=12
)

subtitle_style = ParagraphStyle(
    name='SubtitleStyle',
    fontName='Times New Roman',
    fontSize=14,
    leading=18,
    alignment=TA_CENTER,
    textColor=colors.HexColor('#666666'),
    spaceAfter=24
)

heading1_style = ParagraphStyle(
    name='Heading1Style',
    fontName='Times New Roman',
    fontSize=18,
    leading=22,
    alignment=TA_LEFT,
    spaceBefore=18,
    spaceAfter=12,
    textColor=colors.HexColor('#1F4E79')
)

heading2_style = ParagraphStyle(
    name='Heading2Style',
    fontName='Times New Roman',
    fontSize=14,
    leading=18,
    alignment=TA_LEFT,
    spaceBefore=12,
    spaceAfter=8,
    textColor=colors.HexColor('#2E75B6')
)

body_style = ParagraphStyle(
    name='BodyStyle',
    fontName='Times New Roman',
    fontSize=11,
    leading=16,
    alignment=TA_LEFT,
    spaceAfter=8
)

# Table styles
header_style = ParagraphStyle(
    name='TableHeader',
    fontName='Times New Roman',
    fontSize=10,
    textColor=colors.white,
    alignment=TA_CENTER
)

cell_style = ParagraphStyle(
    name='TableCell',
    fontName='Times New Roman',
    fontSize=10,
    textColor=colors.black,
    alignment=TA_LEFT
)

cell_center = ParagraphStyle(
    name='TableCellCenter',
    fontName='Times New Roman',
    fontSize=10,
    textColor=colors.black,
    alignment=TA_CENTER
)

story = []

# Cover Page
story.append(Spacer(1, 120))
story.append(Paragraph("<b>AETHEL OS</b>", title_style))
story.append(Paragraph("Informe de Auditoría Completa", subtitle_style))
story.append(Spacer(1, 24))
story.append(Paragraph("Estado del Proyecto y Verificación de Funcionalidad", ParagraphStyle(
    name='CoverDesc',
    fontName='Times New Roman',
    fontSize=12,
    alignment=TA_CENTER,
    textColor=colors.HexColor('#666666')
)))
story.append(Spacer(1, 48))
story.append(Paragraph("Fecha: 5 de Abril, 2026", ParagraphStyle(
    name='CoverDate',
    fontName='Times New Roman',
    fontSize=12,
    alignment=TA_CENTER
)))
story.append(Paragraph("Generado por: Z.ai", ParagraphStyle(
    name='CoverAuthor',
    fontName='Times New Roman',
    fontSize=12,
    alignment=TA_CENTER
)))
story.append(PageBreak())

# Executive Summary
story.append(Paragraph("<b>1. Resumen Ejecutivo</b>", heading1_style))
story.append(Paragraph(
    "Este informe presenta una auditoría exhaustiva del proyecto AETHEL OS (anteriormente NexusOS), "
    "una plataforma SaaS multi-tenant diseñada para empresas del Caribe. El análisis cubre el estado "
    "actual del código, funcionalidad de los módulos, sistema de traducciones, y preparación para producción.",
    body_style
))
story.append(Spacer(1, 12))

# Summary Table
summary_data = [
    [Paragraph('<b>Aspecto</b>', header_style), Paragraph('<b>Estado</b>', header_style), Paragraph('<b>Observación</b>', header_style)],
    [Paragraph('Estructura del Proyecto', cell_style), Paragraph('✓ OK', cell_center), Paragraph('Completa y bien organizada', cell_style)],
    [Paragraph('Sistema de Traducciones', cell_style), Paragraph('⚠ Parcial', cell_center), Paragraph('Botones existen pero textos hardcodeados', cell_style)],
    [Paragraph('Toggle Tema (Dark/Light)', cell_style), Paragraph('✓ OK', cell_center), Paragraph('Funcional en todas las páginas', cell_style)],
    [Paragraph('Toggle Idioma (ES/EN)', cell_style), Paragraph('⚠ Parcial', cell_center), Paragraph('Botón funciona pero módulos no traducidos', cell_style)],
    [Paragraph('Build del Proyecto', cell_style), Paragraph('✗ Error', cell_center), Paragraph('Error en configuración Prisma', cell_style)],
    [Paragraph('Industrias Activas', cell_style), Paragraph('✓ OK', cell_center), Paragraph('8 industrias implementadas', cell_style)],
    [Paragraph('Bares/Restaurantes', cell_style), Paragraph('✗ Falta', cell_center), Paragraph('No implementado (solicitado)', cell_style)],
    [Paragraph('Proyecto NexusOS', cell_style), Paragraph('✓ Activo', cell_center), Paragraph('Duplicado/backup del proyecto principal', cell_style)],
]

summary_table = Table(summary_data, colWidths=[2*inch, 1*inch, 3.5*inch])
summary_table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1F4E79')),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('BACKGROUND', (0, 1), (-1, -1), colors.white),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('LEFTPADDING', (0, 0), (-1, -1), 8),
    ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ('TOPPADDING', (0, 0), (-1, -1), 6),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
]))
story.append(summary_table)
story.append(Spacer(1, 18))

# Section 2: Project Structure
story.append(Paragraph("<b>2. Estructura del Proyecto</b>", heading1_style))
story.append(Paragraph(
    "El proyecto está construido con Next.js 16.1.1, TypeScript, Tailwind CSS 4, shadcn/ui, y Prisma ORM. "
    "La arquitectura sigue el patrón App Router de Next.js con soporte multi-tenant.",
    body_style
))
story.append(Spacer(1, 12))

story.append(Paragraph("<b>2.1 Directorios Principales</b>", heading2_style))
dirs_data = [
    [Paragraph('<b>Directorio</b>', header_style), Paragraph('<b>Propósito</b>', header_style)],
    [Paragraph('/src/app/', cell_style), Paragraph('Páginas del App Router (Next.js)', cell_style)],
    [Paragraph('/src/app/api/', cell_style), Paragraph('API Routes (100+ endpoints)', cell_style)],
    [Paragraph('/src/components/', cell_style), Paragraph('Componentes React por industria', cell_style)],
    [Paragraph('/src/lib/', cell_style), Paragraph('Utilidades, traducciones, integraciones', cell_style)],
    [Paragraph('/src/contexts/', cell_style), Paragraph('Contextos React (Theme, Auth)', cell_style)],
    [Paragraph('/prisma/', cell_style), Paragraph('Esquema de base de datos (80+ modelos)', cell_style)],
    [Paragraph('/NexusOS/', cell_style), Paragraph('Backup/duplicado del proyecto', cell_style)],
]
dirs_table = Table(dirs_data, colWidths=[2.5*inch, 4*inch])
dirs_table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1F4E79')),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('BACKGROUND', (0, 1), (-1, -1), colors.white),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('LEFTPADDING', (0, 0), (-1, -1), 8),
    ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ('TOPPADDING', (0, 0), (-1, -1), 6),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
]))
story.append(dirs_table)
story.append(Spacer(1, 18))

# Section 3: Industries
story.append(Paragraph("<b>3. Industrias Implementadas</b>", heading1_style))
story.append(Paragraph(
    "El sistema soporta 8 industrias diferentes, cada una con sus propios módulos, componentes y APIs. "
    "La siguiente tabla muestra el estado de cada industria:",
    body_style
))
story.append(Spacer(1, 12))

industries_data = [
    [Paragraph('<b>Industria</b>', header_style), Paragraph('<b>Ruta</b>', header_style), Paragraph('<b>Módulos</b>', header_style), Paragraph('<b>Estado</b>', header_style)],
    [Paragraph('Clínicas', cell_style), Paragraph('/clinic', cell_style), Paragraph('10+', cell_center), Paragraph('✓ Activo', cell_center)],
    [Paragraph('Enfermería', cell_style), Paragraph('/nurse', cell_style), Paragraph('8+', cell_center), Paragraph('✓ Activo', cell_center)],
    [Paragraph('Salones de Belleza', cell_style), Paragraph('/beauty', cell_style), Paragraph('12+', cell_center), Paragraph('✓ Activo', cell_center)],
    [Paragraph('Panaderías', cell_style), Paragraph('/bakery', cell_style), Paragraph('11+', cell_center), Paragraph('✓ Activo', cell_center)],
    [Paragraph('Bufetes de Abogados', cell_style), Paragraph('/lawfirm', cell_style), Paragraph('10+', cell_center), Paragraph('✓ Activo', cell_center)],
    [Paragraph('Farmacias', cell_style), Paragraph('/pharmacy', cell_style), Paragraph('12+', cell_center), Paragraph('✓ Activo', cell_center)],
    [Paragraph('Seguros', cell_style), Paragraph('/insurance', cell_style), Paragraph('40+', cell_center), Paragraph('✓ Activo', cell_center)],
    [Paragraph('Retail', cell_style), Paragraph('/retail', cell_style), Paragraph('7+', cell_center), Paragraph('✓ Activo', cell_center)],
    [Paragraph('Bares', cell_style), Paragraph('N/A', cell_style), Paragraph('-', cell_center), Paragraph('✗ No implementado', cell_center)],
    [Paragraph('Restaurantes', cell_style), Paragraph('N/A', cell_style), Paragraph('-', cell_center), Paragraph('✗ No implementado', cell_center)],
]
ind_table = Table(industries_data, colWidths=[1.8*inch, 1*inch, 1*inch, 1.5*inch])
ind_table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1F4E79')),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('BACKGROUND', (0, 1), (-1, -2), colors.white),
    ('BACKGROUND', (0, -2), (-1, -1), colors.HexColor('#FFEBEE')),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('LEFTPADDING', (0, 0), (-1, -1), 8),
    ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ('TOPPADDING', (0, 0), (-1, -1), 6),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
]))
story.append(ind_table)
story.append(Spacer(1, 18))

# Section 4: Translation System
story.append(Paragraph("<b>4. Sistema de Traducciones ES/EN</b>", heading1_style))
story.append(Paragraph(
    "El proyecto tiene un sistema de traducciones implementado, pero con inconsistencias en su aplicación:",
    body_style
))
story.append(Spacer(1, 12))

story.append(Paragraph("<b>4.1 Archivos de Traducción Existentes</b>", heading2_style))
trans_data = [
    [Paragraph('<b>Archivo</b>', header_style), Paragraph('<b>Contenido</b>', header_style), Paragraph('<b>Estado</b>', header_style)],
    [Paragraph('/src/lib/translations.ts', cell_style), Paragraph('Traducciones completas ES/EN para Sales Portal', cell_style), Paragraph('✓ Completo', cell_center)],
    [Paragraph('/src/lib/industry-translations.ts', cell_style), Paragraph('Traducciones por industria (8 industrias)', cell_style), Paragraph('✓ Completo', cell_center)],
    [Paragraph('/src/contexts/theme-context.tsx', cell_style), Paragraph('Contexto con toggle de idioma', cell_style), Paragraph('✓ Funcional', cell_center)],
]
trans_table = Table(trans_data, colWidths=[2.5*inch, 3*inch, 1*inch])
trans_table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1F4E79')),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('BACKGROUND', (0, 1), (-1, -1), colors.white),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('LEFTPADDING', (0, 0), (-1, -1), 8),
    ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ('TOPPADDING', (0, 0), (-1, -1), 6),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
]))
story.append(trans_table)
story.append(Spacer(1, 12))

story.append(Paragraph("<b>4.2 Problema Identificado</b>", heading2_style))
story.append(Paragraph(
    "Los botones de toggle de idioma EXISTEN y FUNCIONAN en DashboardLayout y ClinicLayout. Sin embargo, "
    "los textos de los menús de las páginas de industria (Beauty, Bakery, etc.) están HARDCODEADOS en español "
    "y NO usan el sistema de traducciones. Esto significa que al hacer clic en el botón de cambio de idioma, "
    "el botón cambia pero los textos de la interfaz permanecen en español.",
    body_style
))
story.append(Spacer(1, 8))

problem_data = [
    [Paragraph('<b>Componente</b>', header_style), Paragraph('<b>Botón Idioma</b>', header_style), Paragraph('<b>Textos Traducidos</b>', header_style)],
    [Paragraph('Página Principal (/)', cell_style), Paragraph('✓ Sí', cell_center), Paragraph('✓ Sí (inline)', cell_center)],
    [Paragraph('DashboardLayout', cell_style), Paragraph('✓ Sí', cell_center), Paragraph('✗ No (hardcoded)', cell_center)],
    [Paragraph('ClinicLayout', cell_style), Paragraph('✓ Sí', cell_center), Paragraph('✗ No (hardcoded)', cell_center)],
    [Paragraph('Beauty Page', cell_style), Paragraph('✓ Heredado', cell_center), Paragraph('✗ No (hardcoded)', cell_center)],
    [Paragraph('Bakery Page', cell_style), Paragraph('✓ Heredado', cell_center), Paragraph('✗ No (hardcoded)', cell_center)],
]
prob_table = Table(problem_data, colWidths=[2.5*inch, 1.5*inch, 1.5*inch])
prob_table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1F4E79')),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('BACKGROUND', (0, 1), (-1, -1), colors.white),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('LEFTPADDING', (0, 0), (-1, -1), 8),
    ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ('TOPPADDING', (0, 0), (-1, -1), 6),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
]))
story.append(prob_table)
story.append(Spacer(1, 18))

# Section 5: Build Status
story.append(Paragraph("<b>5. Estado del Build</b>", heading1_style))
story.append(Paragraph(
    "El build del proyecto presenta un error en la configuración de Prisma:",
    body_style
))
story.append(Spacer(1, 12))

error_text = """
Error: Failed to load config file as a TypeScript/JavaScript module.
Error: ENOTDIR: not a directory, lstat '/home/z/my-project/.config/prisma'
"""
story.append(Paragraph(error_text, ParagraphStyle(
    name='ErrorText',
    fontName='Times New Roman',
    fontSize=10,
    leading=14,
    textColor=colors.HexColor('#C0392B'),
    backColor=colors.HexColor('#FDEDEC'),
    leftIndent=20,
    rightIndent=20,
    spaceBefore=8,
    spaceAfter=8
)))
story.append(Paragraph(
    "Este error debe ser corregido antes de poder realizar el deploy a producción. "
    "El problema está relacionado con la configuración del directorio de Prisma.",
    body_style
))
story.append(Spacer(1, 18))

# Section 6: NexusOS Project
story.append(Paragraph("<b>6. Proyecto NexusOS</b>", heading1_style))
story.append(Paragraph(
    "Existe un directorio /NexusOS/ que contiene una copia del proyecto principal. Análisis:",
    body_style
))
story.append(Spacer(1, 12))

nexus_data = [
    [Paragraph('<b>Aspecto</b>', header_style), Paragraph('<b>Observación</b>', header_style)],
    [Paragraph('Estructura', cell_style), Paragraph('Idéntica al proyecto principal (/src/)', cell_style)],
    [Paragraph('Package.json', cell_style), Paragraph('Mismas dependencias', cell_style)],
    [Paragraph('Prisma Schema', cell_style), Paragraph('Mismo esquema de base de datos', cell_style)],
    [Paragraph('Screenshots', cell_style), Paragraph('Contiene capturas de pantalla en /upload/', cell_style)],
    [Paragraph('Documentos', cell_style), Paragraph('Contiene documentos generados en /download/', cell_style)],
    [Paragraph('Vercel Config', cell_style), Paragraph('Tiene vercel.json (para deploy)', cell_style)],
]
nexus_table = Table(nexus_data, colWidths=[2*inch, 4.5*inch])
nexus_table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1F4E79')),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('BACKGROUND', (0, 1), (-1, -1), colors.white),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('LEFTPADDING', (0, 0), (-1, -1), 8),
    ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ('TOPPADDING', (0, 0), (-1, -1), 6),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
]))
story.append(nexus_table)
story.append(Spacer(1, 12))

story.append(Paragraph(
    "<b>Recomendación:</b> Consolidar los proyectos. Usar NexusOS como el proyecto de deploy principal "
    "o eliminar el duplicado para evitar confusión. Los dos links activos que menciona probablemente "
    "corresponden a deploys separados de ambos directorios.",
    body_style
))
story.append(Spacer(1, 18))

# Section 7: Recommendations
story.append(Paragraph("<b>7. Recomendaciones Prioritarias</b>", heading1_style))

recs_data = [
    [Paragraph('<b>Prioridad</b>', header_style), Paragraph('<b>Tarea</b>', header_style), Paragraph('<b>Impacto</b>', header_style)],
    [Paragraph('🔴 Crítica', cell_style), Paragraph('Corregir error de build en Prisma', cell_style), Paragraph('No se puede hacer deploy', cell_style)],
    [Paragraph('🔴 Crítica', cell_style), Paragraph('Implementar traducciones en módulos de industria', cell_style), Paragraph('Sistema bilingüe incompleto', cell_style)],
    [Paragraph('🟠 Alta', cell_style), Paragraph('Crear módulos para Bares y Restaurantes', cell_style), Paragraph('Industrias solicitadas faltantes', cell_style)],
    [Paragraph('🟠 Alta', cell_style), Paragraph('Consolidar proyecto NexusOS', cell_style), Paragraph('Confusión de código duplicado', cell_style)],
    [Paragraph('🟡 Media', cell_style), Paragraph('Verificar funcionalidad de todos los botones', cell_style), Paragraph('UX/usabilidad', cell_style)],
    [Paragraph('🟡 Media', cell_style), Paragraph('Implementar POS offline para Bares/Restaurantes', cell_style), Paragraph('Funcionalidad clave', cell_style)],
]
recs_table = Table(recs_data, colWidths=[1.2*inch, 3*inch, 2.3*inch])
recs_table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1F4E79')),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('BACKGROUND', (0, 1), (-1, -1), colors.white),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('LEFTPADDING', (0, 0), (-1, -1), 8),
    ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ('TOPPADDING', (0, 0), (-1, -1), 6),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
]))
story.append(recs_table)
story.append(Spacer(1, 18))

# Section 8: Conclusion
story.append(Paragraph("<b>8. Conclusión</b>", heading1_style))
story.append(Paragraph(
    "AETHEL OS es un proyecto robusto con una arquitectura sólida y un conjunto completo de módulos para 8 industrias. "
    "Sin embargo, NO está 100% listo para los más altos chequeos de viabilidad. Los principales problemas son:",
    body_style
))
story.append(Spacer(1, 12))

story.append(Paragraph("1. <b>Error de Build:</b> El proyecto no compila actualmente debido a un error de configuración de Prisma.", body_style))
story.append(Paragraph("2. <b>Traducciones Incompletas:</b> Los botones de cambio de idioma existen, pero los textos de los módulos de industria no se traducen al cambiar el idioma.", body_style))
story.append(Paragraph("3. <b>Industrias Faltantes:</b> Bares y Restaurantes (solicitados) no están implementados.", body_style))
story.append(Paragraph("4. <b>Código Duplicado:</b> El directorio NexusOS duplica el proyecto principal, creando confusión.", body_style))
story.append(Spacer(1, 12))

story.append(Paragraph(
    "<b>Veredicto:</b> El proyecto está aproximadamente al 75% de preparación para producción. "
    "Requiere trabajo adicional en traducciones, build, y las industrias solicitadas para alcanzar "
    "el 100% de viabilidad.",
    body_style
))

# Build PDF
doc.build(story)
print("PDF generado exitosamente: /home/z/my-project/download/AETHEL_OS_Auditoria_Completa.pdf")
