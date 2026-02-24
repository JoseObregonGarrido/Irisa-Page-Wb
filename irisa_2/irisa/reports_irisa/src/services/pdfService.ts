// services/pdfService.ts
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import 'jspdf-autotable';
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
  // ... otros campos (pressureSwitchTests, etc)
}

export const generatePDFReport = async (
  data: ReportData,
  chartImages?: string[] // Ahora recibe directamente las imágenes en Base64
): Promise<void> => {
  const pdf = new jsPDF();
  let yPosition = 20;

  // --- Paleta de colores y tipografía (Igual que tu código) ---
  const colors = {
    black: [0, 0, 0],
    darkGray: [51, 51, 51],
    mediumGray: [128, 128, 128],
    lightGray: [245, 245, 245],
    white: [255, 255, 255],
    risaraldaGreen: [119, 158, 79]
  };

  const PAGE_MARGINS = { top: 20, bottom: 30, maxContentY: 275 };

  const typography = {
    title: { size: 18, weight: 'bold' as const },
    section: { size: 12, weight: 'bold' as const },
    body: { size: 10, weight: 'normal' as const },
    small: { size: 8, weight: 'normal' as const }
  };

  // --- Funciones auxiliares de dibujo ---
  const addSectionHeader = (title: string) => {
    if (yPosition + 25 > PAGE_MARGINS.maxContentY) {
      pdf.addPage();
      yPosition = PAGE_MARGINS.top;
    }
    pdf.setDrawColor(...colors.risaraldaGreen);
    pdf.setLineWidth(0.8);
    pdf.line(20, yPosition, 190, yPosition);
    yPosition += 10;
    pdf.setFontSize(typography.section.size).setFont('helvetica', 'bold').setTextColor(...colors.black);
    pdf.text(title, 20, yPosition);
    yPosition += 12;
  };

  try {
    // 1. Logo y Encabezado
    try {
      const logoBase64 = await getBase64ImageFromUrl(logo);
      pdf.addImage(logoBase64, 'PNG', 20, 15, 60, 25);
    } catch (e) { console.warn("Logo no cargado"); }

    pdf.setFontSize(typography.title.size).setFont('helvetica', 'bold');
    pdf.text('REPORTE TÉCNICO DE', 90, 25);
    pdf.text('INSTRUMENTACIÓN', 90, 33);
    yPosition = 55;

    // 2. Información General
    addSectionHeader('INFORMACIÓN GENERAL');
    const generalData = [
      ['Nombre del instrumentista', data.instrumentistName || 'N/A'],
      ['Orden de Trabajo', data.workOrder || 'N/A'],
      ['Equipo', `${data.deviceName} (${data.deviceCode}`],
      ['Rango', `${data.deviceRange} ${data.unity}`],
      ['Fecha', data.reviewDate ? formatDate(data.reviewDate) : 'N/A'],
    ];

    autoTable(pdf, {
      body: generalData,
      startY: yPosition,
      margin: { left: 20 },
      styles: { fontSize: typography.body.size },
      columnStyles: { 0: { fontStyle: 'bold', cellWidth: 55, fillColor: [249, 249, 249] } }
    });
    yPosition = (pdf as any).lastAutoTable.finalY + 15;

    // 3. Tabla de Mediciones
    if (data.deviceType === 'transmitter' && data.transmitterMeasurements?.length) {
      addSectionHeader('MEDICIONES - TRANSMISOR');
      const tableData = data.transmitterMeasurements.map(m => [
        m.percentage, m.idealUe, m.ueTransmitter, m.idealMa, m.maTransmitter, m.errorPercentage
      ]);
      autoTable(pdf, {
        head: [['%', 'Ideal UE', 'Tx UE', 'Ideal mA', 'Tx mA', 'Error %']],
        body: tableData,
        startY: yPosition,
        headStyles: { fillColor: colors.risaraldaGreen },
        styles: { fontSize: typography.small.size, halign: 'center' }
      });
      yPosition = (pdf as any).lastAutoTable.finalY + 15;
    }

    // 4. SECCIÓN DE GRÁFICAS (Aquí integramos)
    if (chartImages && chartImages.length > 0) {
      const chartTitles = ['Curva de Respuesta', 'Errores Absolutos', 'Análisis de Linealidad', 'Error Porcentual'];
      
      for (let i = 0; i < chartImages.length; i++) {
        const CHART_HEIGHT = 80;
        
        // Verificar si la gráfica cabe en la página actual
        if (yPosition + CHART_HEIGHT + 20 > PAGE_MARGINS.maxContentY) {
          pdf.addPage();
          yPosition = PAGE_MARGINS.top;
        }

        addSectionHeader(`ANÁLISIS: ${chartTitles[i] || `Gráfico ${i + 1}`}`);
        
        // Recuadro para la gráfica
        pdf.setDrawColor(...colors.risaraldaGreen);
        pdf.setLineWidth(0.1);
        pdf.roundedRect(20, yPosition, 170, CHART_HEIGHT, 2, 2);
        
        // Insertar imagen
        pdf.addImage(chartImages[i], 'PNG', 22, yPosition + 2, 166, CHART_HEIGHT - 4);
        
        yPosition += CHART_HEIGHT + 15;
      }
    }

    // 5. Observaciones y Pie de página
    if (data.observations) {
      addSectionHeader('OBSERVACIONES');
      pdf.setFontSize(typography.body.size).setFont('helvetica', 'normal');
      const lines = pdf.splitTextToSize(data.observations, 160);
      pdf.text(lines, 25, yPosition);
    }

    // Enumeración de páginas
    const totalPages = pdf.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      pdf.setFontSize(typography.small.size).setTextColor(...colors.darkGray);
      pdf.text(`Página ${i} de ${totalPages}`, 190, 290, { align: 'right' });
    }

    pdf.save(`reporte-${data.workOrder || 'instrumentacion'}.pdf`);

  } catch (error) {
    console.error('Error generando PDF:', error);
    throw error;
  }
};

// Auxiliares (getBase64ImageFromUrl, formatDate, etc. se mantienen igual)
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

const formatDate = (dateString: string): string => {
  try { return new Date(dateString).toLocaleDateString('es-ES'); } 
  catch { return dateString; }
};