// services/pdfService.ts
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import 'jspdf-autotable';
import { toPng } from 'html-to-image';
import logo from '../assets/logo_slogan_2.png'

// Extend jsPDF types for autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export interface ReportData {
  instrumentistName: string;
  instrumentistCode: string;
  deviceType: string;
  workOrder: string;
  instrumentArea: string;
  reviewDate: string;
  deviceName: string;
  deviceBrand : string,
  deviceModel: string,
  deviceSerial: string,
  deviceRange: string;
  unity:string,
  deviceCode: string,
  observations: string;
  transmitterMeasurements?: Array<{
    percentage: string;
    idealUe: string;
    patronUe: string;
    ueTransmitter: string;
    idealMa: string;
    maTransmitter: string;
    errorUe: string;
    errorMa: string;
    errorPercentage: string;
  }>;
  pressureSwitchTests?: Array<{
    typeTest: string;
    appliedPressure: string;
    realPressureChange: string;
    stateContact: string;
    meetsSpecification: boolean;
  }>;
  thermostatTests?: Array<{
    typeTest: string;
    appliedTemperature: string;
    realTemperatureChange: string;
    stateContact: string;
    meetsSpecification: boolean;
  }>;
}

export const generatePDFReport = async (
  data: ReportData,
  chartElement?: HTMLElement | null
): Promise<void> => {
  const pdf = new jsPDF();
  let yPosition = 20;

  //Logo del ingenio
  try {
    const logoBase64 = await getBase64ImageFromUrl(logo);
    
    // Logo en esquina superior izquierda - más grande y profesional
    const logoWidth = 60;   // Ancho del logo
    const logoHeight = 25;  // Alto del logo (manteniendo proporción aproximada)
    const logoX = 20;       // Posición X (margen izquierdo)
    const logoY = 15;       // Posición Y (margen superior)
    
    pdf.addImage(logoBase64, 'PNG', logoX, logoY, logoWidth, logoHeight, '', 'SLOW');
    
    // Ajustamos la yPosition para dar espacio al logo
    yPosition = logoY + logoHeight + 10; // Logo + espaciado
    
  } catch (e) {
    console.warn("No se pudo cargar el logo", e);
    yPosition = 20; // Posición por defecto si no hay logo
  }

  //Paleta de colores
  const colors = {
    black: [0, 0, 0],              // Negro principal
    darkGray: [51, 51, 51],        // Gris oscuro para texto secundario
    mediumGray: [128, 128, 128],   // Gris medio para líneas
    lightGray: [245, 245, 245],    // Gris muy claro para fondos
    white: [255, 255, 255],        // Blanco
    risaraldaGreen: [119, 158, 79] // Verde corporativo basado en el logo
  };

  const PAGE_MARGINS = {
    top: 20,
    bottom: 30, // Espacio reservado para pie de página
    maxContentY: 275 // 297 (A4) - 22 (margen inferior)
  };

  const typography = {
    title: { size: 18, weight: 'bold' as const },      // Título más grande
    subtitle: { size: 12, weight: 'normal' as const }, // Subtítulo
    section: { size: 12, weight: 'bold' as const },
    body: { size: 10, weight: 'normal' as const },
    small: { size: 8, weight: 'normal' as const }
  };

  // === HELPERS OPTIMIZADOS ===
  const addText = (text: string, x: number, y: number, maxWidth: number = 170) => {
    const lines = pdf.splitTextToSize(text, maxWidth);
    pdf.text(lines, x, y);
    return y + (lines.length * 5); // Espaciado reducido
  };

  const checkNewPage = (requiredSpace: number = 25) => {
    if (yPosition + requiredSpace > PAGE_MARGINS.maxContentY) {
      pdf.addPage();
      yPosition = PAGE_MARGINS.top;
      return true; // Indica que se creó una nueva página
    }
    return false;
  };

  const addSectionHeader = (title: string) => {
    const SECTION_HEIGHT = 25; // Espacio que ocupa el header completo
    
    if (yPosition + SECTION_HEIGHT > PAGE_MARGINS.maxContentY) {
      pdf.addPage();
      yPosition = PAGE_MARGINS.top;
    }
    
    // Línea superior con color corporativo
    pdf.setDrawColor(...colors.risaraldaGreen);
    pdf.setLineWidth(0.8);
    pdf.line(20, yPosition, 190, yPosition);
    
    yPosition += 10;
    pdf.setFontSize(typography.section.size)
       .setFont('helvetica', typography.section.weight)
       .setTextColor(...colors.black);
    pdf.text(title, 20, yPosition);
    
    yPosition += 12;
  };

  try {
    // Encabezado
    
    // Título principal - alineado a la derecha del logo
    pdf.setFontSize(typography.title.size)
       .setFont('helvetica', typography.title.weight)
       .setTextColor(...colors.black);
    
    // Posicionar título a la derecha del logo
    const titleX = 90; // Después del logo
    const titleY = 25; // Alineado verticalmente con el logo
    
    pdf.text('REPORTE TÉCNICO DE', titleX, titleY);
    pdf.text('INSTRUMENTACIÓN', titleX, titleY + 8);
    
    // Subtítulo de la empresa
    pdf.setFontSize(typography.subtitle.size)
       .setFont('helvetica', typography.subtitle.weight)
       .setTextColor(...colors.darkGray);
    pdf.text('Ingenio Risaralda S.A.', titleX, titleY + 18);
    
    // Línea divisoria profesional debajo del encabezado
    yPosition = Math.max(yPosition, titleY + 25);
    pdf.setDrawColor(...colors.risaraldaGreen);
    pdf.setLineWidth(1);
    pdf.line(20, yPosition, 190, yPosition);
    yPosition += 20;

    // === INFORMACIÓN GENERAL OPTIMIZADA ===
    addSectionHeader('INFORMACIÓN GENERAL');

    const generalData = [
      ['Nombre del instrumentista', data.instrumentistName || 'N/A'],
      ['Código del instrumentista', data.instrumentistCode || 'N/A'],
      ['Tipo de dispositivo', getDeviceTypeLabel(data.deviceType)],
      ['Orden de Trabajo', data.workOrder || 'N/A'],
      ['Área del equipo', data.instrumentArea || 'N/A'],
      ['Fecha de Revisión', data.reviewDate ? formatDate(data.reviewDate) : 'N/A'],
      ['Nombre del Equipo', data.deviceName || 'N/A'],
      ['Marca del Equipo', data.deviceBrand || 'N/A'],
      ['Modelo del Equipo', data.deviceModel || 'N/A'],
      ['Serial del Equipo', data.deviceSerial || 'N/A'],
      ['Rango del Equipo', data.deviceRange || 'N/A'],
      ['Unidades', data.unity || 'N/A'],
      ['Código del equipo', data.deviceCode || 'N/A']
    ];

    // Tabla con estilo más profesional
    autoTable(pdf, {
      body: generalData,
      startY: yPosition,
      margin: { left: 20, right: 20 },
      showHead: false,
      styles: { 
        fontSize: typography.body.size,
        cellPadding: { top: 4, right: 8, bottom: 4, left: 8 },
        textColor: colors.darkGray,
        lineColor: colors.mediumGray,
        lineWidth: 0.1
      },
      columnStyles: {
        0: { 
          fontStyle: 'bold',
          textColor: colors.black,
          cellWidth: 55,
          fillColor: [249, 249, 249]
        },
        1: { 
          cellWidth: 'auto'
        }
      },
      alternateRowStyles: { 
        fillColor: colors.lightGray
      }
    });

    yPosition = (pdf as any).lastAutoTable.finalY + 15;

    // Tablas de mediciones
    
    // Transmisor
    if (data.deviceType === 'transmitter' && data.transmitterMeasurements?.length) {
      addSectionHeader('MEDICIONES - TRANSMISOR');

      const tableData = data.transmitterMeasurements.map(m => [
        m.percentage || '-',
        m.idealUe || '-',
        m.patronUe || '-',
        m.ueTransmitter || '-',
        m.idealMa || '-',
        m.maTransmitter || '-',
        m.errorPercentage || '-'
      ]);

      autoTable(pdf, {
        head: [['%', 'Ideal UE', 'Patrón UE', 'UE Tx', 'Ideal mA', 'mA Tx', 'Error %']],
        body: tableData,
        startY: yPosition,
        margin: { left: 20, right: 20 },
        styles: { 
          fontSize: typography.small.size,
          cellPadding: 3,
          textColor: colors.darkGray,
          lineColor: colors.mediumGray,
          lineWidth: 0.1,
          halign: 'center'
        },
        headStyles: { 
          fillColor: colors.risaraldaGreen,
          textColor: colors.white,
          fontStyle: 'bold',
          fontSize: typography.small.size
        },
        alternateRowStyles: { 
          fillColor: colors.lightGray
        }
      });

      yPosition = (pdf as any).lastAutoTable.finalY + 15;
    }

    // Presostato
    if (data.deviceType === 'pressure_switch' && data.pressureSwitchTests?.length) {
      addSectionHeader('PRUEBAS - PRESOSTATO');

      const tableData = data.pressureSwitchTests.map(t => [
        translateTestType(t.typeTest) || '-',
        t.appliedPressure || '-',
        t.realPressureChange || '-',
        t.stateContact || '-',
        t.meetsSpecification ? '✓' : '✗'
      ]);

      autoTable(pdf, {
        head: [['Tipo Prueba', 'P. Aplicada', 'Cambio Real', 'Estado', 'OK']],
        body: tableData,
        startY: yPosition,
        margin: { left: 20, right: 20 },
        styles: { 
          fontSize: typography.small.size,
          cellPadding: 3,
          textColor: colors.darkGray,
          lineColor: colors.mediumGray,
          lineWidth: 0.1
        },
        headStyles: { 
          fillColor: colors.risaraldaGreen,
          textColor: colors.white,
          fontStyle: 'bold'
        },
        columnStyles: {
          4: { 
            halign: 'center',
            fontStyle: 'bold'
          }
        },
        alternateRowStyles: { 
          fillColor: colors.lightGray
        }
      });

      yPosition = (pdf as any).lastAutoTable.finalY + 15;
    }

    // Termostato
    if (data.deviceType === 'thermostat' && data.thermostatTests?.length) {
      addSectionHeader('PRUEBAS - TERMOSTATO');

      const tableData = data.thermostatTests.map(t => [
        translateTestType(t.typeTest) || '-', 
        t.appliedTemperature || '-',
        t.realTemperatureChange || '-',
        t.stateContact || '-',
        t.meetsSpecification ? '✓' : '✗'
      ]);

      autoTable(pdf, {
        head: [['Tipo Prueba', 'T. Aplicada', 'Cambio Real', 'Estado', 'OK']],
        body: tableData,
        startY: yPosition,
        margin: { left: 20, right: 20 },
        styles: { 
          fontSize: typography.small.size,
          cellPadding: 3,
          textColor: colors.darkGray,
          lineColor: colors.mediumGray,
          lineWidth: 0.1
        },
        headStyles: { 
          fillColor: colors.risaraldaGreen,
          textColor: colors.white,
          fontStyle: 'bold'
        },
        columnStyles: {
          4: { 
            halign: 'center',
            fontStyle: 'bold'
          }
        },
        alternateRowStyles: { 
          fillColor: colors.lightGray
        }
      });

      yPosition = (pdf as any).lastAutoTable.finalY + 15;
    }

    // Apartado del grafico
    if (chartElement) {
      const CHART_HEIGHT = 135; // Altura total del gráfico + marco
      const CHART_SECTION_HEIGHT = CHART_HEIGHT + 25; // Incluye título y espaciado
      
      // Verificar ANTES si hay espacio suficiente para título + gráfico
      if (yPosition + CHART_SECTION_HEIGHT > PAGE_MARGINS.maxContentY) {
        pdf.addPage();
        yPosition = PAGE_MARGINS.top;
      }
      
      try {
        const chartImage = await toPng(chartElement, {
          quality: 0.9,        
          pixelRatio: 2,    
          backgroundColor: 'white',
          cacheBust: false
        });
        addSectionHeader('GRÁFICO DE CALIBRACIÓN');

        // Marco profesional
        pdf.setDrawColor(...colors.risaraldaGreen);
        pdf.setLineWidth(1);
        pdf.roundedRect(20, yPosition, 170, CHART_HEIGHT, 3, 3);

        pdf.addImage(chartImage, 'PNG', 23, yPosition + 3, 166, 134, '', 'MEDIUM');
        yPosition += CHART_HEIGHT + 10;
        
      } catch (error) {
        console.error('Error al capturar gráfico:', error);
        addSectionHeader('GRÁFICO DE CALIBRACIÓN');
        
        pdf.setFontSize(typography.body.size)
          .setTextColor(...colors.darkGray);
        pdf.text('Gráfico no disponible', 25, yPosition);
        yPosition += 20;
      }
    }

     // Observaciones
    if (data.observations) {
      addSectionHeader('OBSERVACIONES');
      
      pdf.setFontSize(typography.body.size)
         .setFont('helvetica', typography.body.weight)
         .setTextColor(...colors.darkGray);
      
      // Marco profesional para observaciones
      pdf.setDrawColor(...colors.mediumGray);
      pdf.setFillColor(...colors.lightGray);
      pdf.setLineWidth(0.3);
      pdf.roundedRect(20, yPosition - 5, 170, 20, 2, 2, 'FD'); 
      
      yPosition = addText(data.observations, 25, yPosition + 3, 160);
      yPosition += 15;
    }
    
    // Pie de pagina
    const totalPages = pdf.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      
      // Línea superior con color corporativo
      pdf.setDrawColor(...colors.risaraldaGreen);
      pdf.setLineWidth(0.5);
      pdf.line(20, 285, 190, 285);
      
      pdf.setFontSize(typography.small.size)
         .setFont('helvetica', typography.small.weight)
         .setTextColor(...colors.darkGray);
      
      const timestamp = new Date().toLocaleDateString('es-ES');
      pdf.text(`Generado: ${timestamp}`, 20, 290);
      pdf.text(`Página ${i} de ${totalPages}`, 190, 290, { align: 'right' });
    }

    //Descarga del PDF
    const filename = `reporte-instrumentacion-${data.workOrder || 'general'}-${Date.now()}.pdf`;
    pdf.save(filename);

  } catch (error) {
    console.error('Error generando PDF:', error);
    throw new Error('Error al generar reporte PDF');
  }
};

// Funciones auxiliares

const getBase64ImageFromUrl = async (imageUrl: string): Promise<string> => {
  const response = await fetch(imageUrl);
  const blob = await response.blob();
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      resolve(result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

const translateTestType = (testType: string): string => {
  if (!testType) return '';
  
  const translations: Record<string, string> = {
    'falling': 'Decreciente',
    'rising': 'Ascendente'
  };
  
  const normalizedType = testType.toLowerCase().trim();
  return translations[normalizedType] || testType;
};

const getDeviceTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    transmitter: 'Transmisor',
    pressure_switch: 'Presostato', 
    thermostat: 'Termostato'
  };
  return labels[type] || type;
};

const formatDate = (dateString: string): string => {
  try {
    return new Date(dateString).toLocaleDateString('es-ES');
  } catch {
    return dateString;
  }
};