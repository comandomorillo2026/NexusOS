const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, 
        Header, Footer, AlignmentType, PageNumber, HeadingLevel, BorderStyle, 
        WidthType, ShadingType, VerticalAlign, LevelFormat, PageBreak } = require('docx');
const fs = require('fs');

// Colores profesionales
const colors = {
  primary: "#0B1220",
  body: "#0F172A",
  secondary: "#2B2B2B",
  accent: "#F0B429",
  tableBg: "#F1F5F9",
  accentLight: "#FDF6E1"
};

const tableBorder = { style: BorderStyle.SINGLE, size: 12, color: colors.primary };
const cellBorders = { top: tableBorder, bottom: tableBorder, left: tableBorder, right: tableBorder };
const noLeftRightBorders = { top: tableBorder, bottom: tableBorder, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } };

const doc = new Document({
  styles: {
    default: { document: { run: { font: "Times New Roman", size: 24 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 36, bold: true, color: colors.primary, font: "Times New Roman" },
        paragraph: { spacing: { before: 400, after: 200 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 28, bold: true, color: colors.secondary, font: "Times New Roman" },
        paragraph: { spacing: { before: 300, after: 150 }, outlineLevel: 1 } },
      { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 24, bold: true, color: colors.secondary, font: "Times New Roman" },
        paragraph: { spacing: { before: 200, after: 100 }, outlineLevel: 2 } }
    ]
  },
  numbering: {
    config: [
      { reference: "bullet-list",
        levels: [{ level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] }
    ]
  },
  sections: [{
    properties: {
      page: { margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } }
    },
    headers: {
      default: new Header({ children: [new Paragraph({ 
        alignment: AlignmentType.RIGHT,
        children: [new TextRun({ text: "AETHEL OS - Análisis de Capacidad", color: colors.secondary, size: 20 })]
      })] })
    },
    footers: {
      default: new Footer({ children: [new Paragraph({ 
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "Página ", size: 20 }), new TextRun({ children: [PageNumber.CURRENT], size: 20 }), new TextRun({ text: " de ", size: 20 }), new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 20 })]
      })] })
    },
    children: [
      // Título principal
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 600, after: 400 },
        children: [new TextRun({ text: "ANÁLISIS DE CAPACIDAD PARA PRODUCCIÓN", bold: true, size: 48, color: colors.primary })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 600 },
        children: [new TextRun({ text: "Vercel Free + Supabase Free + GitHub Free", size: 28, color: colors.accent })]
      }),
      
      // Sección 1: Resumen Ejecutivo
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("1. Resumen Ejecutivo")] }),
      new Paragraph({
        spacing: { after: 200 },
        children: [new TextRun({ text: "Este análisis detalla la capacidad real del stack tecnológico gratuito para AETHEL OS, calculando específicamente cuántas empresas por industria pueden operar sin exceder los límites del tier gratuito. La conclusión principal es que el tier gratuito puede soportar un negocio en etapa inicial con hasta 25-30 empresas activas dependiendo de la combinación de industrias, lo cual es suficiente para validar el modelo de negocio y generar los primeros ingresos recurrentes antes de escalar a planes pagados.", size: 24 })]
      }),

      // Sección 2: Límites del Tier Gratuito
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("2. Límites Reales del Tier Gratuito")] }),
      
      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("2.1 Vercel Hobby (Free)")] }),
      new Table({
        columnWidths: [3500, 5860],
        margins: { top: 100, bottom: 100, left: 180, right: 180 },
        rows: [
          new TableRow({
            tableHeader: true,
            children: [
              new TableCell({ borders: noLeftRightBorders, shading: { fill: colors.tableBg, type: ShadingType.CLEAR }, verticalAlign: VerticalAlign.CENTER, width: { size: 3500, type: WidthType.DXA },
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Recurso", bold: true, size: 22 })] })] }),
              new TableCell({ borders: noLeftRightBorders, shading: { fill: colors.tableBg, type: ShadingType.CLEAR }, verticalAlign: VerticalAlign.CENTER, width: { size: 5860, type: WidthType.DXA },
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Límite Gratuito", bold: true, size: 22 })] })] })
            ]
          }),
          new TableRow({ children: [
            new TableCell({ borders: noLeftRightBorders, children: [new Paragraph({ children: [new TextRun({ text: "Ancho de banda", size: 22 })] })] }),
            new TableCell({ borders: noLeftRightBorders, children: [new Paragraph({ children: [new TextRun({ text: "100 GB/mes", size: 22 })] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: noLeftRightBorders, children: [new Paragraph({ children: [new TextRun({ text: "Builds", size: 22 })] })] }),
            new TableCell({ borders: noLeftRightBorders, children: [new Paragraph({ children: [new TextRun({ text: "6,000 minutos/mes", size: 22 })] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: noLeftRightBorders, children: [new Paragraph({ children: [new TextRun({ text: "Funciones Serverless", size: 22 })] })] }),
            new TableCell({ borders: noLeftRightBorders, children: [new Paragraph({ children: [new TextRun({ text: "100 GB-hora/mes", size: 22 })] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: noLeftRightBorders, children: [new Paragraph({ children: [new TextRun({ text: "Dominios personalizados", size: 22 })] })] }),
            new TableCell({ borders: noLeftRightBorders, children: [new Paragraph({ children: [new TextRun({ text: "Ilimitados (incluye SSL)", size: 22 })] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: noLeftRightBorders, children: [new Paragraph({ children: [new TextRun({ text: "Tiempo de ejecución función", size: 22 })] })] }),
            new TableCell({ borders: noLeftRightBorders, children: [new Paragraph({ children: [new TextRun({ text: "10 segundos máximo", size: 22 })] })] })
          ]})
        ]
      }),
      new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: "Tabla 1: Límites de Vercel Hobby", italics: true, size: 18, color: colors.secondary })] }),

      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("2.2 Supabase Free Tier")] }),
      new Table({
        columnWidths: [3500, 5860],
        margins: { top: 100, bottom: 100, left: 180, right: 180 },
        rows: [
          new TableRow({
            tableHeader: true,
            children: [
              new TableCell({ borders: noLeftRightBorders, shading: { fill: colors.tableBg, type: ShadingType.CLEAR }, verticalAlign: VerticalAlign.CENTER, width: { size: 3500, type: WidthType.DXA },
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Recurso", bold: true, size: 22 })] })] }),
              new TableCell({ borders: noLeftRightBorders, shading: { fill: colors.tableBg, type: ShadingType.CLEAR }, verticalAlign: VerticalAlign.CENTER, width: { size: 5860, type: WidthType.DXA },
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Límite Gratuito", bold: true, size: 22 })] })] })
            ]
          }),
          new TableRow({ children: [
            new TableCell({ borders: noLeftRightBorders, children: [new Paragraph({ children: [new TextRun({ text: "Almacenamiento base de datos", size: 22 })] })] }),
            new TableCell({ borders: noLeftRightBorders, children: [new Paragraph({ children: [new TextRun({ text: "500 MB", size: 22 })] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: noLeftRightBorders, children: [new Paragraph({ children: [new TextRun({ text: "Almacenamiento archivos", size: 22 })] })] }),
            new TableCell({ borders: noLeftRightBorders, children: [new Paragraph({ children: [new TextRun({ text: "1 GB", size: 22 })] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: noLeftRightBorders, children: [new Paragraph({ children: [new TextRun({ text: "Transferencia de datos", size: 22 })] })] }),
            new TableCell({ borders: noLeftRightBorders, children: [new Paragraph({ children: [new TextRun({ text: "5 GB/mes", size: 22 })] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: noLeftRightBorders, children: [new Paragraph({ children: [new TextRun({ text: "Conexiones concurrentes", size: 22 })] })] }),
            new TableCell({ borders: noLeftRightBorders, children: [new Paragraph({ children: [new TextRun({ text: "60 conexiones directas, 200 pool", size: 22 })] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: noLeftRightBorders, children: [new Paragraph({ children: [new TextRun({ text: "Proyectos activos", size: 22 })] })] }),
            new TableCell({ borders: noLeftRightBorders, children: [new Paragraph({ children: [new TextRun({ text: "2 proyectos (pausados tras 1 sem inactivos)", size: 22 })] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: noLeftRightBorders, children: [new Paragraph({ children: [new TextRun({ text: "Edge Functions", size: 22 })] })] }),
            new TableCell({ borders: noLeftRightBorders, children: [new Paragraph({ children: [new TextRun({ text: "500,000 invocaciones/mes", size: 22 })] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: noLeftRightBorders, children: [new Paragraph({ children: [new TextRun({ text: "Auth (usuarios)", size: 22 })] })] }),
            new TableCell({ borders: noLeftRightBorders, children: [new Paragraph({ children: [new TextRun({ text: "50,000 usuarios MAU", size: 22 })] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: noLeftRightBorders, children: [new Paragraph({ children: [new TextRun({ text: "Realtime conexiones", size: 22 })] })] }),
            new TableCell({ borders: noLeftRightBorders, children: [new Paragraph({ children: [new TextRun({ text: "200 concurrentes", size: 22 })] })] })
          ]})
        ]
      }),
      new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: "Tabla 2: Límites de Supabase Free", italics: true, size: 18, color: colors.secondary })] }),

      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("2.3 GitHub Free")] }),
      new Table({
        columnWidths: [3500, 5860],
        margins: { top: 100, bottom: 100, left: 180, right: 180 },
        rows: [
          new TableRow({
            tableHeader: true,
            children: [
              new TableCell({ borders: noLeftRightBorders, shading: { fill: colors.tableBg, type: ShadingType.CLEAR }, verticalAlign: VerticalAlign.CENTER, width: { size: 3500, type: WidthType.DXA },
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Recurso", bold: true, size: 22 })] })] }),
              new TableCell({ borders: noLeftRightBorders, shading: { fill: colors.tableBg, type: ShadingType.CLEAR }, verticalAlign: VerticalAlign.CENTER, width: { size: 5860, type: WidthType.DXA },
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Límite Gratuito", bold: true, size: 22 })] })] })
            ]
          }),
          new TableRow({ children: [
            new TableCell({ borders: noLeftRightBorders, children: [new Paragraph({ children: [new TextRun({ text: "Repositorios privados", size: 22 })] })] }),
            new TableCell({ borders: noLeftRightBorders, children: [new Paragraph({ children: [new TextRun({ text: "Ilimitados", size: 22 })] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: noLeftRightBorders, children: [new Paragraph({ children: [new TextRun({ text: "Almacenamiento", size: 22 })] })] }),
            new TableCell({ borders: noLeftRightBorders, children: [new Paragraph({ children: [new TextRun({ text: "500 MB por repositorio", size: 22 })] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: noLeftRightBorders, children: [new Paragraph({ children: [new TextRun({ text: "GitHub Actions", size: 22 })] })] }),
            new TableCell({ borders: noLeftRightBorders, children: [new Paragraph({ children: [new TextRun({ text: "2,000 minutos/mes", size: 22 })] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: noLeftRightBorders, children: [new Paragraph({ children: [new TextRun({ text: "Pages", size: 22 })] })] }),
            new TableCell({ borders: noLeftRightBorders, children: [new Paragraph({ children: [new TextRun({ text: "1 sitio por cuenta", size: 22 })] })] })
          ]})
        ]
      }),
      new Paragraph({ spacing: { after: 400 }, children: [new TextRun({ text: "Tabla 3: Límites de GitHub Free", italics: true, size: 18, color: colors.secondary })] }),

      // Sección 3: Análisis por Industria
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("3. Análisis de Consumo por Industria")] }),
      new Paragraph({
        spacing: { after: 200 },
        children: [new TextRun({ text: "A continuación se presenta el análisis detallado de consumo estimado por cada industria soportada por AETHEL OS. Los cálculos se basan en escenarios de operación 'medio-alto' donde cada empresa tiene una clientela activa y realiza transacciones regulares.", size: 24 })]
      }),

      // 3.1 Pastelerías/Panaderías
      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("3.1 Pastelerías y Panaderías")] }),
      new Paragraph({
        spacing: { after: 150 },
        children: [new TextRun({ text: "Escenario medio-alto: 80-120 pedidos diarios, inventario de 150-200 productos, catálogo público activo.", size: 24 })]
      }),
      new Table({
        columnWidths: [3500, 2930, 2930],
        margins: { top: 100, bottom: 100, left: 180, right: 180 },
        rows: [
          new TableRow({
            tableHeader: true,
            children: [
              new TableCell({ borders: noLeftRightBorders, shading: { fill: colors.tableBg, type: ShadingType.CLEAR }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Recurso", bold: true, size: 22 })] })] }),
              new TableCell({ borders: noLeftRightBorders, shading: { fill: colors.tableBg, type: ShadingType.CLEAR }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Consumo/Día", bold: true, size: 22 })] })] }),
              new TableCell({ borders: noLeftRightBorders, shading: { fill: colors.tableBg, type: ShadingType.CLEAR }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Consumo/Mes", bold: true, size: 22 })] })] })
            ]
          }),
          new TableRow({ children: [
            new TableCell({ borders: noLeftRightBorders, children: [new Paragraph({ children: [new TextRun({ text: "Registros DB (estimado)", size: 22 })] })] }),
            new TableCell({ borders: noLeftRightBorders, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "200-300", size: 22 })] })] }),
            new TableCell({ borders: noLeftRightBorders, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "~8 MB", size: 22 })] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: noLeftRightBorders, children: [new Paragraph({ children: [new TextRun({ text: "Ancho de banda", size: 22 })] })] }),
            new TableCell({ borders: noLeftRightBorders, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "50-80 MB", size: 22 })] })] }),
            new TableCell({ borders: noLeftRightBorders, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "1.5-2.4 GB", size: 22 })] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: noLeftRightBorders, children: [new Paragraph({ children: [new TextRun({ text: "API calls", size: 22 })] })] }),
            new TableCell({ borders: noLeftRightBorders, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "1,500-2,500", size: 22 })] })] }),
            new TableCell({ borders: noLeftRightBorders, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "45,000-75,000", size: 22 })] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: noLeftRightBorders, children: [new Paragraph({ children: [new TextRun({ text: "Almacenamiento archivos (fotos)", size: 22 })] })] }),
            new TableCell({ borders: noLeftRightBorders, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "5-10 MB", size: 22 })] })] }),
            new TableCell({ borders: noLeftRightBorders, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "150-300 MB", size: 22 })] })] })
          ]})
        ]
      }),
      new Paragraph({ spacing: { after: 300 }, children: [new TextRun({ text: "CAPACIDAD ESTIMADA: 30-35 pastelerías en tier gratuito", bold: true, size: 24, color: "#34D399" })] }),

      // 3.2 Clínicas
      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("3.2 Clínicas y Centros Médicos")] }),
      new Paragraph({
        spacing: { after: 150 },
        children: [new TextRun({ text: "Escenario medio-alto: 50-80 consultas diarias, historiales médicos, telemedicina activa.", size: 24 })]
      }),
      new Table({
        columnWidths: [3500, 2930, 2930],
        margins: { top: 100, bottom: 100, left: 180, right: 180 },
        rows: [
          new TableRow({
            tableHeader: true,
            children: [
              new TableCell({ borders: noLeftRightBorders, shading: { fill: colors.tableBg, type: ShadingType.CLEAR }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Recurso", bold: true, size: 22 })] })] }),
              new TableCell({ borders: noLeftRightBorders, shading: { fill: colors.tableBg, type: ShadingType.CLEAR }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Consumo/Día", bold: true, size: 22 })] })] }),
              new TableCell({ borders: noLeftRightBorders, shading: { fill: colors.tableBg, type: ShadingType.CLEAR }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Consumo/Mes", bold: true, size: 22 })] })] })
            ]
          }),
          new TableRow({ children: [
            new TableCell({ borders: noLeftRightBorders, children: [new Paragraph({ children: [new TextRun({ text: "Registros DB (pacientes, citas)", size: 22 })] })] }),
            new TableCell({ borders: noLeftRightBorders, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "150-250", size: 22 })] })] }),
            new TableCell({ borders: noLeftRightBorders, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "~15 MB", size: 22 })] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: noLeftRightBorders, children: [new Paragraph({ children: [new TextRun({ text: "Ancho de banda", size: 22 })] })] }),
            new TableCell({ borders: noLeftRightBorders, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "80-120 MB", size: 22 })] })] }),
            new TableCell({ borders: noLeftRightBorders, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "2.4-3.6 GB", size: 22 })] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: noLeftRightBorders, children: [new Paragraph({ children: [new TextRun({ text: "API calls (incluye telemedicina)", size: 22 })] })] }),
            new TableCell({ borders: noLeftRightBorders, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "3,000-5,000", size: 22 })] })] }),
            new TableCell({ borders: noLeftRightBorders, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "90,000-150,000", size: 22 })] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: noLeftRightBorders, children: [new Paragraph({ children: [new TextRun({ text: "Realtime (telemedicina)", size: 22 })] })] }),
            new TableCell({ borders: noLeftRightBorders, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "10-20 conexiones", size: 22 })] })] }),
            new TableCell({ borders: noLeftRightBorders, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "~300 conexiones-hora", size: 22 })] })] })
          ]})
        ]
      }),
      new Paragraph({ spacing: { after: 300 }, children: [new TextRun({ text: "CAPACIDAD ESTIMADA: 15-20 clínicas en tier gratuito", bold: true, size: 24, color: "#34D399" })] }),

      // 3.3 Restaurantes
      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("3.3 Restaurantes")] }),
      new Paragraph({
        spacing: { after: 150 },
        children: [new TextRun({ text: "Escenario medio-alto: 150-250 órdenes diarias, menú digital, mesas con QR, inventario.", size: 24 })]
      }),
      new Table({
        columnWidths: [3500, 2930, 2930],
        margins: { top: 100, bottom: 100, left: 180, right: 180 },
        rows: [
          new TableRow({
            tableHeader: true,
            children: [
              new TableCell({ borders: noLeftRightBorders, shading: { fill: colors.tableBg, type: ShadingType.CLEAR }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Recurso", bold: true, size: 22 })] })] }),
              new TableCell({ borders: noLeftRightBorders, shading: { fill: colors.tableBg, type: ShadingType.CLEAR }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Consumo/Día", bold: true, size: 22 })] })] }),
              new TableCell({ borders: noLeftRightBorders, shading: { fill: colors.tableBg, type: ShadingType.CLEAR }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Consumo/Mes", bold: true, size: 22 })] })] })
            ]
          }),
          new TableRow({ children: [
            new TableCell({ borders: noLeftRightBorders, children: [new Paragraph({ children: [new TextRun({ text: "Registros DB", size: 22 })] })] }),
            new TableCell({ borders: noLeftRightBorders, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "300-500", size: 22 })] })] }),
            new TableCell({ borders: noLeftRightBorders, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "~12 MB", size: 22 })] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: noLeftRightBorders, children: [new Paragraph({ children: [new TextRun({ text: "Ancho de banda (incluye menú QR)", size: 22 })] })] }),
            new TableCell({ borders: noLeftRightBorders, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "100-180 MB", size: 22 })] })] }),
            new TableCell({ borders: noLeftRightBorders, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "3-5.4 GB", size: 22 })] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: noLeftRightBorders, children: [new Paragraph({ children: [new TextRun({ text: "API calls", size: 22 })] })] }),
            new TableCell({ borders: noLeftRightBorders, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "5,000-8,000", size: 22 })] })] }),
            new TableCell({ borders: noLeftRightBorders, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "150,000-240,000", size: 22 })] })] })
          ]})
        ]
      }),
      new Paragraph({ spacing: { after: 300 }, children: [new TextRun({ text: "CAPACIDAD ESTIMADA: 18-22 restaurantes en tier gratuito", bold: true, size: 24, color: "#34D399" })] }),

      // 3.4 Bares
      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("3.4 Bares y Cantinas")] }),
      new Paragraph({
        spacing: { after: 150 },
        children: [new TextRun({ text: "Escenario medio-alto: 200-350 transacciones diarias (viernes/sábado picos), inventario de bebidas.", size: 24 })]
      }),
      new Table({
        columnWidths: [3500, 2930, 2930],
        margins: { top: 100, bottom: 100, left: 180, right: 180 },
        rows: [
          new TableRow({
            tableHeader: true,
            children: [
              new TableCell({ borders: noLeftRightBorders, shading: { fill: colors.tableBg, type: ShadingType.CLEAR }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Recurso", bold: true, size: 22 })] })] }),
              new TableCell({ borders: noLeftRightBorders, shading: { fill: colors.tableBg, type: ShadingType.CLEAR }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Consumo/Día", bold: true, size: 22 })] })] }),
              new TableCell({ borders: noLeftRightBorders, shading: { fill: colors.tableBg, type: ShadingType.CLEAR }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Consumo/Mes", bold: true, size: 22 })] })] })
            ]
          }),
          new TableRow({ children: [
            new TableCell({ borders: noLeftRightBorders, children: [new Paragraph({ children: [new TextRun({ text: "Registros DB", size: 22 })] })] }),
            new TableCell({ borders: noLeftRightBorders, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "400-600", size: 22 })] })] }),
            new TableCell({ borders: noLeftRightBorders, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "~10 MB", size: 22 })] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: noLeftRightBorders, children: [new Paragraph({ children: [new TextRun({ text: "Ancho de banda", size: 22 })] })] }),
            new TableCell({ borders: noLeftRightBorders, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "60-100 MB", size: 22 })] })] }),
            new TableCell({ borders: noLeftRightBorders, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "1.8-3 GB", size: 22 })] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: noLeftRightBorders, children: [new Paragraph({ children: [new TextRun({ text: "API calls (POS intensivo)", size: 22 })] })] }),
            new TableCell({ borders: noLeftRightBorders, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "6,000-10,000", size: 22 })] })] }),
            new TableCell({ borders: noLeftRightBorders, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "180,000-300,000", size: 22 })] })] })
          ]})
        ]
      }),
      new Paragraph({ spacing: { after: 300 }, children: [new TextRun({ text: "CAPACIDAD ESTIMADA: 20-25 bares en tier gratuito", bold: true, size: 24, color: "#34D399" })] }),

      // 3.5 Salones de Belleza
      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("3.5 Salones de Belleza y SPA")] }),
      new Paragraph({
        spacing: { after: 150 },
        children: [new TextRun({ text: "Escenario medio-alto: 30-50 citas diarias, 5-10 empleados, gestión de membresías.", size: 24 })]
      }),
      new Table({
        columnWidths: [3500, 2930, 2930],
        margins: { top: 100, bottom: 100, left: 180, right: 180 },
        rows: [
          new TableRow({
            tableHeader: true,
            children: [
              new TableCell({ borders: noLeftRightBorders, shading: { fill: colors.tableBg, type: ShadingType.CLEAR }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Recurso", bold: true, size: 22 })] })] }),
              new TableCell({ borders: noLeftRightBorders, shading: { fill: colors.tableBg, type: ShadingType.CLEAR }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Consumo/Día", bold: true, size: 22 })] })] }),
              new TableCell({ borders: noLeftRightBorders, shading: { fill: colors.tableBg, type: ShadingType.CLEAR }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Consumo/Mes", bold: true, size: 22 })] })] })
            ]
          }),
          new TableRow({ children: [
            new TableCell({ borders: noLeftRightBorders, children: [new Paragraph({ children: [new TextRun({ text: "Registros DB", size: 22 })] })] }),
            new TableCell({ borders: noLeftRightBorders, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "100-200", size: 22 })] })] }),
            new TableCell({ borders: noLeftRightBorders, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "~6 MB", size: 22 })] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: noLeftRightBorders, children: [new Paragraph({ children: [new TextRun({ text: "Ancho de banda", size: 22 })] })] }),
            new TableCell({ borders: noLeftRightBorders, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "30-50 MB", size: 22 })] })] }),
            new TableCell({ borders: noLeftRightBorders, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "0.9-1.5 GB", size: 22 })] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: noLeftRightBorders, children: [new Paragraph({ children: [new TextRun({ text: "API calls", size: 22 })] })] }),
            new TableCell({ borders: noLeftRightBorders, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "1,000-2,000", size: 22 })] })] }),
            new TableCell({ borders: noLeftRightBorders, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "30,000-60,000", size: 22 })] })] })
          ]})
        ]
      }),
      new Paragraph({ spacing: { after: 300 }, children: [new TextRun({ text: "CAPACIDAD ESTIMADA: 35-40 salones en tier gratuito", bold: true, size: 24, color: "#34D399" })] }),

      // 3.6 Bufetes de Abogados
      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("3.6 Bufetes de Abogados")] }),
      new Paragraph({
        spacing: { after: 150 },
        children: [new TextRun({ text: "Escenario medio-alto: 3-5 abogados activos, 50-100 casos, billing por horas, documentos legales.", size: 24 })]
      }),
      new Table({
        columnWidths: [3500, 2930, 2930],
        margins: { top: 100, bottom: 100, left: 180, right: 180 },
        rows: [
          new TableRow({
            tableHeader: true,
            children: [
              new TableCell({ borders: noLeftRightBorders, shading: { fill: colors.tableBg, type: ShadingType.CLEAR }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Recurso", bold: true, size: 22 })] })] }),
              new TableCell({ borders: noLeftRightBorders, shading: { fill: colors.tableBg, type: ShadingType.CLEAR }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Consumo/Día", bold: true, size: 22 })] })] }),
              new TableCell({ borders: noLeftRightBorders, shading: { fill: colors.tableBg, type: ShadingType.CLEAR }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Consumo/Mes", bold: true, size: 22 })] })] })
            ]
          }),
          new TableRow({ children: [
            new TableCell({ borders: noLeftRightBorders, children: [new Paragraph({ children: [new TextRun({ text: "Registros DB", size: 22 })] })] }),
            new TableCell({ borders: noLeftRightBorders, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "50-100", size: 22 })] })] }),
            new TableCell({ borders: noLeftRightBorders, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "~10 MB (docs)", size: 22 })] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: noLeftRightBorders, children: [new Paragraph({ children: [new TextRun({ text: "Ancho de banda", size: 22 })] })] }),
            new TableCell({ borders: noLeftRightBorders, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "20-40 MB", size: 22 })] })] }),
            new TableCell({ borders: noLeftRightBorders, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "0.6-1.2 GB", size: 22 })] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: noLeftRightBorders, children: [new Paragraph({ children: [new TextRun({ text: "API calls", size: 22 })] })] }),
            new TableCell({ borders: noLeftRightBorders, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "500-1,000", size: 22 })] })] }),
            new TableCell({ borders: noLeftRightBorders, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "15,000-30,000", size: 22 })] })] })
          ]})
        ]
      }),
      new Paragraph({ spacing: { after: 300 }, children: [new TextRun({ text: "CAPACIDAD ESTIMADA: 40-45 bufetes en tier gratuito", bold: true, size: 24, color: "#34D399" })] }),

      // 3.7 Farmacias
      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("3.7 Farmacias")] }),
      new Paragraph({
        spacing: { after: 150 },
        children: [new TextRun({ text: "Escenario medio-alto: 200-400 transacciones diarias, inventario de 500-1000 productos, recetas.", size: 24 })]
      }),
      new Table({
        columnWidths: [3500, 2930, 2930],
        margins: { top: 100, bottom: 100, left: 180, right: 180 },
        rows: [
          new TableRow({
            tableHeader: true,
            children: [
              new TableCell({ borders: noLeftRightBorders, shading: { fill: colors.tableBg, type: ShadingType.CLEAR }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Recurso", bold: true, size: 22 })] })] }),
              new TableCell({ borders: noLeftRightBorders, shading: { fill: colors.tableBg, type: ShadingType.CLEAR }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Consumo/Día", bold: true, size: 22 })] })] }),
              new TableCell({ borders: noLeftRightBorders, shading: { fill: colors.tableBg, type: ShadingType.CLEAR }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Consumo/Mes", bold: true, size: 22 })] })] })
            ]
          }),
          new TableRow({ children: [
            new TableCell({ borders: noLeftRightBorders, children: [new Paragraph({ children: [new TextRun({ text: "Registros DB", size: 22 })] })] }),
            new TableCell({ borders: noLeftRightBorders, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "500-800", size: 22 })] })] }),
            new TableCell({ borders: noLeftRightBorders, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "~20 MB", size: 22 })] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: noLeftRightBorders, children: [new Paragraph({ children: [new TextRun({ text: "Ancho de banda", size: 22 })] })] }),
            new TableCell({ borders: noLeftRightBorders, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "80-150 MB", size: 22 })] })] }),
            new TableCell({ borders: noLeftRightBorders, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "2.4-4.5 GB", size: 22 })] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: noLeftRightBorders, children: [new Paragraph({ children: [new TextRun({ text: "API calls", size: 22 })] })] }),
            new TableCell({ borders: noLeftRightBorders, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "4,000-7,000", size: 22 })] })] }),
            new TableCell({ borders: noLeftRightBorders, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "120,000-210,000", size: 22 })] })] })
          ]})
        ]
      }),
      new Paragraph({ spacing: { after: 300 }, children: [new TextRun({ text: "CAPACIDAD ESTIMADA: 12-15 farmacias en tier gratuito", bold: true, size: 24, color: "#F59E0B" })] }),

      // Sección 4: Cuello de Botella Principal
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("4. Análisis del Cuello de Botella")] }),
      new Paragraph({
        spacing: { after: 200 },
        children: [new TextRun({ text: "El recurso más limitante del tier gratuito es el ALMACENAMIENTO DE BASE DE DATOS de Supabase (500 MB). Este es el factor determinante para calcular la capacidad máxima de empresas.", size: 24 })]
      }),

      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("4.1 Distribución Óptima por Industria")] }),
      new Paragraph({
        spacing: { after: 150 },
        children: [new TextRun({ text: "Combinación recomendada para maximizar ingresos mientras se mantiene en tier gratuito:", size: 24 })]
      }),
      new Table({
        columnWidths: [2800, 1800, 2200, 2560],
        margins: { top: 100, bottom: 100, left: 180, right: 180 },
        rows: [
          new TableRow({
            tableHeader: true,
            children: [
              new TableCell({ borders: noLeftRightBorders, shading: { fill: colors.tableBg, type: ShadingType.CLEAR }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Industria", bold: true, size: 22 })] })] }),
              new TableCell({ borders: noLeftRightBorders, shading: { fill: colors.tableBg, type: ShadingType.CLEAR }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Cantidad", bold: true, size: 22 })] })] }),
              new TableCell({ borders: noLeftRightBorders, shading: { fill: colors.tableBg, type: ShadingType.CLEAR }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "DB Space", bold: true, size: 22 })] })] }),
              new TableCell({ borders: noLeftRightBorders, shading: { fill: colors.tableBg, type: ShadingType.CLEAR }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Ingresos/mes", bold: true, size: 22 })] })] })
            ]
          }),
          new TableRow({ children: [
            new TableCell({ borders: noLeftRightBorders, children: [new Paragraph({ children: [new TextRun({ text: "Pastelerías", size: 22 })] })] }),
            new TableCell({ borders: noLeftRightBorders, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "5", size: 22 })] })] }),
            new TableCell({ borders: noLeftRightBorders, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "40 MB", size: 22 })] })] }),
            new TableCell({ borders: noLeftRightBorders, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "TT$4,500", size: 22 })] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: noLeftRightBorders, children: [new Paragraph({ children: [new TextRun({ text: "Clínicas", size: 22 })] })] }),
            new TableCell({ borders: noLeftRightBorders, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "3", size: 22 })] })] }),
            new TableCell({ borders: noLeftRightBorders, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "45 MB", size: 22 })] })] }),
            new TableCell({ borders: noLeftRightBorders, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "TT$6,600", size: 22 })] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: noLeftRightBorders, children: [new Paragraph({ children: [new TextRun({ text: "Restaurantes", size: 22 })] })] }),
            new TableCell({ borders: noLeftRightBorders, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "4", size: 22 })] })] }),
            new TableCell({ borders: noLeftRightBorders, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "48 MB", size: 22 })] })] }),
            new TableCell({ borders: noLeftRightBorders, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "TT$5,200", size: 22 })] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: noLeftRightBorders, children: [new Paragraph({ children: [new TextRun({ text: "Bares", size: 22 })] })] }),
            new TableCell({ borders: noLeftRightBorders, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "3", size: 22 })] })] }),
            new TableCell({ borders: noLeftRightBorders, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "30 MB", size: 22 })] })] }),
            new TableCell({ borders: noLeftRightBorders, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "TT$3,300", size: 22 })] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: noLeftRightBorders, children: [new Paragraph({ children: [new TextRun({ text: "Salones Belleza", size: 22 })] })] }),
            new TableCell({ borders: noLeftRightBorders, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "5", size: 22 })] })] }),
            new TableCell({ borders: noLeftRightBorders, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "30 MB", size: 22 })] })] }),
            new TableCell({ borders: noLeftRightBorders, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "TT$5,500", size: 22 })] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: noLeftRightBorders, children: [new Paragraph({ children: [new TextRun({ text: "Bufetes", size: 22 })] })] }),
            new TableCell({ borders: noLeftRightBorders, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "3", size: 22 })] })] }),
            new TableCell({ borders: noLeftRightBorders, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "30 MB", size: 22 })] })] }),
            new TableCell({ borders: noLeftRightBorders, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "TT$8,400", size: 22 })] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: noLeftRightBorders, children: [new Paragraph({ children: [new TextRun({ text: "Farmacias", size: 22 })] })] }),
            new TableCell({ borders: noLeftRightBorders, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "2", size: 22 })] })] }),
            new TableCell({ borders: noLeftRightBorders, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "40 MB", size: 22 })] })] }),
            new TableCell({ borders: noLeftRightBorders, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "TT$6,400", size: 22 })] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: noLeftRightBorders, shading: { fill: colors.accentLight, type: ShadingType.CLEAR }, children: [new Paragraph({ children: [new TextRun({ text: "TOTAL", bold: true, size: 22 })] })] }),
            new TableCell({ borders: noLeftRightBorders, shading: { fill: colors.accentLight, type: ShadingType.CLEAR }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "25 empresas", bold: true, size: 22 })] })] }),
            new TableCell({ borders: noLeftRightBorders, shading: { fill: colors.accentLight, type: ShadingType.CLEAR }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "263 MB", bold: true, size: 22 })] })] }),
            new TableCell({ borders: noLeftRightBorders, shading: { fill: colors.accentLight, type: ShadingType.CLEAR }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "TT$39,900", bold: true, size: 22 })] })] })
          ]})
        ]
      }),
      new Paragraph({ spacing: { after: 400 }, children: [new TextRun({ text: "Tabla: Distribución óptima para maximizar ingresos en tier gratuito", italics: true, size: 18, color: colors.secondary })] }),

      // Sección 5: Recomendaciones
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("5. Recomendaciones Estratégicas")] }),
      
      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("5.1 Fase de Validación (0-6 meses)")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun({ text: "Usar EXCLUSIVAMENTE el tier gratuito para validar el modelo de negocio", size: 24 })] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun({ text: "Objetivo: Conseguir 10-15 clientes pagados antes de considerar upgrade", size: 24 })] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun({ text: "Implementar monitoreo proactivo de uso de almacenamiento (alertas al 70%)", size: 24 })] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun({ text: "Migrar a PostgreSQL con Supabase desde el inicio (ya decidido)", size: 24 })] }),

      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("5.2 Fase de Escalamiento (6-18 meses)")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun({ text: "Upgrade a Supabase Pro ($25/mes): 8GB DB, 100GB transfer, backup diario", size: 24 })] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun({ text: "Capacidad estimada: 150-200 empresas con plan Pro", size: 24 })] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun({ text: "Vercel Pro ($20/mes): Solo necesario si se excede ancho de banda", size: 24 })] }),

      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("5.3 Por qué PostgreSQL/Supabase es la decisión correcta")] }),
      new Paragraph({
        spacing: { after: 200 },
        children: [new TextRun({ text: "A diferencia de SQLite, PostgreSQL ofrece: integridad referencial completa con CASCADE, concurrencia real para múltiples usuarios, escalabilidad sin límites técnicos, y la posibilidad de usar características avanzadas como full-text search y JSON nativo. Supabase específicamente añade autenticación integrada, realtime subscriptions para telemedicina, y un generoso tier gratuito de 500MB que permite validar el negocio antes de invertir.", size: 24 })]
      }),

      // Conclusión
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("6. Conclusión")] }),
      new Paragraph({
        spacing: { after: 200 },
        children: [new TextRun({ text: "El stack Vercel Free + Supabase Free + GitHub Free es PERFECTAMENTE VIABLE para iniciar AETHEL OS como negocio real. Con capacidad para 25-30 empresas activas generando aproximadamente TT$35,000-45,000 mensuales en ingresos recurrentes, el tier gratuito proporciona suficiente margen para validar el modelo de negocio y generar flujo de caja positivo antes de cualquier inversión en infraestructura.", size: 24 })]
      }),
      new Paragraph({
        children: [new TextRun({ text: "La decisión de usar PostgreSQL desde el inicio es estratégicamente correcta para un proyecto con ambiciones de escala, ya que elimina la fricción de migración posterior y permite usar todas las características avanzadas que SQLite no soporta.", size: 24 })]
      })
    ]
  }]
});

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync("/home/z/my-project/download/AETHEL_OS_Analisis_Capacidad_Productivo.docx", buffer);
  console.log("Documento generado: /home/z/my-project/download/AETHEL_OS_Analisis_Capacidad_Productivo.docx");
});
