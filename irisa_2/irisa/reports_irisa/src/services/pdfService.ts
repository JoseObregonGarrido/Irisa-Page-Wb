// services/pdfService.ts
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import 'jspdf-autotable';
import { toPng } from 'html-to-image';
import logo from '../assets/logo_slogan_2.png';

// Extender tipos de jsPDF para autoTable
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
  deviceBrand: string;
  deviceModel: string;
  deviceSerial: string;
  deviceRange: string;
  unity: string;
  deviceCode: string;
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
  chartElements?: (HTMLElement | null)[] // Ahora recibe un arreglo para las 3 graficas
): Promise<void> => {
  const pdf = new jsPDF();
  let yPosition = 20;

  // Logo del ingenio
  try {
    const logoBase64 = await getBase64ImageFromUrl(logo);
    const logoWidth = 60;
    const logoHeight = 25;
    const logoX = 20;
    const logoY = 15;
    pdf.addImage(logoBase64, 'PNG', logoX, logoY, logoWidth, logoHeight, '', 'SLOW');
    yPosition = logoY + logoHeight + 10;
  } catch (e) {
    console.warn("No se pudo cargar el logo", e);
    yPosition = 20;
  }

  // Paleta de colores corporativa
  const colors = {
    black: [0, 0, 0],
    darkGray: [51, 51, 51],
    mediumGray: [128, 128, 128],
    lightGray: [245, 245, 245],
    white: [255, 255, 255],
    risaraldaGreen: [119, 158, 79]
  };

  const PAGE_MARGINS = {
    top: 20,
    bottom: 30,
    maxContentY: 275
  };

  const typography = {
    title: { size: 18, weight: 'bold' as const },
    subtitle: { size: 12, weight: 'normal' as const },
    section: { size: 12, weight: 'bold' as const },
    body: { size: 10, weight: 'normal' as const },
    small: { size: 8, weight: 'normal' as const }
  };

  const addText = (text: string, x: number, y: number, maxWidth: number = 170) => {
    const lines = pdf.splitTextToSize(text, maxWidth);
    pdf.text(lines, x, y);
    return y + (lines.length * 5);
  };

  const addSectionHeader = (title: string) => {
    const SECTION_HEIGHT = 25;
    if (yPosition + SECTION_HEIGHT > PAGE_MARGINS.maxContentY) {
      pdf.addPage();
      yPosition = PAGE_MARGINS.top;
    }
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
    // Encabezado principal
    pdf.setFontSize(typography.title.size)
       .setFont('helvetica', typography.title.weight)
       .setTextColor(...colors.black);
    const titleX = 90;
    const titleY = 25;
    pdf.text('REPORTE TECNICO DE', titleX, titleY);
    pdf.text('INSTRUMENTACION', titleX, titleY + 8);

    pdf.setFontSize(typography.subtitle.size)
       .setFont('helvetica', typography.subtitle.weight)
       .setTextColor(...colors.darkGray);
    pdf.text('Ingenio Risaralda S.A.', titleX, titleY + 18);

    yPosition = Math.max(yPosition, titleY + 25);
    pdf.setDrawColor(...colors.risaraldaGreen);
    pdf.setLineWidth(1);
    pdf.line(20, yPosition, 190, yPosition);
    yPosition += 20;

    // Informacion General
    addSectionHeader('INFORMACION GENERAL');
    const generalData = [
      ['Nombre del instrumentista', data.instrumentistName || 'N/A'],
      ['Codigo del instrumentista', data.instrumentistCode || 'N/A'],
      ['Tipo de dispositivo', getDeviceTypeLabel(data.deviceType)],
      ['Orden de Trabajo', data.workOrder || 'N/A'],
      ['Area del equipo', data.instrumentArea || 'N/A'],
      ['Fecha de Revision', data.reviewDate ? formatDate(data.reviewDate) : 'N/A'],
      ['Nombre del Equipo', data.deviceName || 'N/A'],
      ['Marca del Equipo', data.deviceBrand || 'N/A'],
      ['Modelo del Equipo', data.deviceModel || 'N/A'],
      ['Serial del Equipo', data.deviceSerial || 'N/A'],
      ['Rango del Equipo', data.deviceRange || 'N/A'],
      ['Unidades', data.unity || 'N/A'],
      ['Codigo del equipo', data.deviceCode || 'N/A']
    ];

    autoTable(pdf, {
      body: generalData,
      startY: yPosition,
      margin: { left: 20, right: 20 },
      showHead: false,
      styles: { 
        fontSize: typography.body.size,
        cellPadding: 4,
        textColor: colors.darkGray,
        lineColor: colors.mediumGray,
        lineWidth: 0.1
      },
      columnStyles: {
        0: { fontStyle: 'bold', textColor: colors.black, cellWidth: 55, fillColor: [249, 249, 249] }
      },
      alternateRowStyles: { fillColor: colors.lightGray }
    });

    yPosition = (pdf as any).lastAutoTable.finalY + 15;

    // Tablas segun tipo de dispositivo
    if (data.deviceType === 'transmitter' && data.transmitterMeasurements?.length) {
      addSectionHeader('MEDICIONES - TRANSMISOR');
      const tableData = data.transmitterMeasurements.map(m => [
        m.percentage || '-', m.idealUe || '-', m.patronUe || '-', m.ueTransmitter || '-',
        m.idealMa || '-', m.maTransmitter || '-', m.errorPercentage || '-'
      ]);
      autoTable(pdf, {
        head: [['%', 'Ideal UE', 'Patron UE', 'UE Tx', 'Ideal mA', 'mA Tx', 'Error %']],
        body: tableData,
        startY: yPosition,
        styles: { fontSize: typography.small.size, halign: 'center' },
        headStyles: { fillColor: colors.risaraldaGreen }
      });
      yPosition = (pdf as any).lastAutoTable.finalY + 15;
    }

    // Seccion de Graficos (Procesa las 3 graficas del Home)
    if (chartElements && chartElements.length > 0) {
      for (let i = 0; i < chartElements.length; i++) {
        const element = chartElements[i];
        if (!element) continue;

        const CHART_HEIGHT = 100;
        if (yPosition + CHART_HEIGHT + 30 > PAGE_MARGINS.maxContentY) {
          pdf.addPage();
          yPosition = PAGE_MARGINS.top;
        }

        try {
          const chartImage = await toPng(element, {
            quality: 0.95,
            pixelRatio: 2,
            backgroundColor: 'white'
          });

          addSectionHeader(`GRAFICO DE CALIBRACION ${i + 1}`);
          pdf.setDrawColor(...colors.risaraldaGreen);
          pdf.roundedRect(20, yPosition, 170, CHART_HEIGHT, 2, 2);
          pdf.addImage(chartImage, 'PNG', 22, yPosition + 2, 166, CHART_HEIGHT - 4);
          yPosition += CHART_HEIGHT + 15;
        } catch (error) {
          console.error(`Error capturando grafico ${i + 1}:`, error);
        }
      }
    }

    // Observaciones
    if (data.observations) {
      addSectionHeader('OBSERVACIONES');
      pdf.setDrawColor(...colors.mediumGray);
      pdf.setFillColor(...colors.lightGray);
      pdf.roundedRect(20, yPosition - 5, 170, 20, 2, 2, 'FD');
      yPosition = addText(data.observations, 25, yPosition + 3, 160);
      yPosition += 15;
    }

    // Pie de pagina
    const totalPages = pdf.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      pdf.setDrawColor(...colors.risaraldaGreen);
      pdf.line(20, 285, 190, 285);
      const timestamp = new Date().toLocaleDateString('es-ES');
      pdf.setFontSize(typography.small.size).setTextColor(...colors.darkGray);
      pdf.text(`Generado: ${timestamp}`, 20, 290);
      pdf.text(`Pagina ${i} de ${totalPages}`, 190, 290, { align: 'right' });
    }

    const filename = `reporte-${data.workOrder || 'instrumentacion'}-${Date.now()}.pdf`;
    pdf.save(filename);

  } catch (error) {
    console.error('Error generando PDF:', error);
    throw new Error('Error al generar reporte PDF');
  }
};

// Auxiliares
const getBase64ImageFromUrl = async (imageUrl: string): Promise<string> => {
  const response = await fetch(imageUrl);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

const translateTestType = (testType: string): string => {
  const translations: Record<string, string> = { 'falling': 'Decreciente', 'rising': 'Ascendente' };
  return translations[testType.toLowerCase().trim()] || testType;
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