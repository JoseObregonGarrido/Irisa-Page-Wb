// services/pdfService.ts
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import logo from '../assets/logo_slogan_2.png';

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
  hasUeTransmitter: boolean; // Controla si se ven las columnas de UE Trans y Err UE
  outputUnit: 'mA' | 'Ω';    // Define si la unidad es mA u Ohmios
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
}

export const generatePDFReport = async (
  data: ReportData,
  chartImages?: string[]
): Promise<void> => {
  const pdf = new jsPDF();
  let yPosition = 20;

  const colors = {
    black: [0, 0, 0],
    risaraldaGreen: [119, 158, 79],
    lightGray: [249, 249, 249],
    errorBg: [255, 245, 245] // Un tono rojizo muy suave para las columnas de error
  };

  const PAGE_MARGINS = { top: 20, bottom: 30, maxContentY: 275 };

  const addSectionHeader = (title: string) => {
    if (yPosition + 25 > PAGE_MARGINS.maxContentY) {
      pdf.addPage();
      yPosition = PAGE_MARGINS.top;
    }
    pdf.setDrawColor(...colors.risaraldaGreen);
    pdf.setLineWidth(0.8);
    pdf.line(20, yPosition, 190, yPosition);
    yPosition += 10;
    pdf.setFontSize(12).setFont('helvetica', 'bold').setTextColor(...colors.black);
    pdf.text(title, 20, yPosition);
    yPosition += 12;
  };

  try {
    // 1. Logo y Encabezado
    try {
      const logoBase64 = await getBase64ImageFromUrl(logo);
      pdf.addImage(logoBase64, 'PNG', 20, 15, 60, 25);
    } catch (e) { console.warn("Logo no cargado"); }

    pdf.setFontSize(18).setFont('helvetica', 'bold');
    pdf.text('REPORTE TÉCNICO DE', 90, 25);
    pdf.text('INSTRUMENTACIÓN', 90, 33);
    yPosition = 55;

    // 2. Información General
    addSectionHeader('INFORMACIÓN GENERAL');
    const generalData = [
      ['Nombre del instrumentista', data.instrumentistName || 'N/A'],
      ['Orden de Trabajo', data.workOrder || 'N/A'],
      ['Equipo', `${data.deviceName} - ${data.deviceCode}`], 
      ['Rango', `${data.deviceRange} ${data.unity}`],
      ['Fecha', data.reviewDate ? formatDate(data.reviewDate) : 'N/A'],
    ];

    autoTable(pdf, {
      body: generalData,
      startY: yPosition,
      margin: { left: 20 },
      styles: { fontSize: 10 },
      columnStyles: { 0: { fontStyle: 'bold', cellWidth: 55, fillColor: colors.lightGray } }
    });
    yPosition = (pdf as any).lastAutoTable.finalY + 15;

    // 3. Tabla de Mediciones Dinámica
    if (data.deviceType === 'transmitter' && data.transmitterMeasurements?.length) {
      const unit = data.outputUnit; 
      const hasUE = data.hasUeTransmitter;

      addSectionHeader(`PRUEBA DE CALIBRACIÓN (${unit})`);

      // Definición de Cabeceras idéntica a tu TransmitterTable.tsx
      const headRow = [
        'Ideal UE',
        `Ideal ${unit}`,
        'Patrón UE',
        ...(hasUE ? ['UE Trans.'] : []),
        `${unit} Trans.`,
        '% Rango',
        ...(hasUE ? ['Err UE'] : []),
        `Err ${unit}`,
        'Err %'
      ];

      // Mapeo de datos respetando las columnas activas
      const bodyRows = data.transmitterMeasurements.map(m => [
        m.idealUe,
        m.idealMa,
        m.patronUe,
        ...(hasUE ? [m.ueTransmitter] : []),
        m.maTransmitter,
        m.percentage,
        ...(hasUE ? [m.errorUe] : []),
        m.errorMa,
        m.errorPercentage
      ]);

      autoTable(pdf, {
        head: [headRow],
        body: bodyRows,
        startY: yPosition,
        margin: { left: 20, right: 20 },
        headStyles: { fillColor: colors.risaraldaGreen, fontSize: 7, halign: 'center' },
        styles: { fontSize: 7, halign: 'center', cellPadding: 2 },
        // Aplicamos el color de fondo a las columnas de error (las últimas 2 o 3)
        didParseCell: (dataCell: any) => {
            const totalCols = headRow.length;
            // Si es una de las últimas 3 columnas (los errores), le ponemos un color diferente
            if (dataCell.section === 'body' && dataCell.column.index >= totalCols - (hasUE ? 3 : 2)) {
                dataCell.cell.styles.fillColor = [255, 248, 248]; 
                dataCell.cell.styles.textColor = [180, 0, 0];
            }
        }
      });
      
      yPosition = (pdf as any).lastAutoTable.finalY + 15;
    }

    // 4. Gráficas y Observaciones (Se mantiene igual...)
    if (chartImages && chartImages.length > 0) {
      const chartTitles = ['Curva de Respuesta', 'Errores Absolutos', 'Linealidad', 'Error %'];
      for (let i = 0; i < chartImages.length; i++) {
        const CHART_HEIGHT = 75;
        if (yPosition + CHART_HEIGHT + 20 > PAGE_MARGINS.maxContentY) {
          pdf.addPage();
          yPosition = PAGE_MARGINS.top;
        }
        addSectionHeader(`ANÁLISIS: ${chartTitles[i]}`);
        pdf.addImage(chartImages[i], 'PNG', 25, yPosition, 160, CHART_HEIGHT);
        yPosition += CHART_HEIGHT + 15;
      }
    }

    if (data.observations) {
      addSectionHeader('OBSERVACIONES');
      pdf.setFontSize(10).setFont('helvetica', 'normal').setTextColor(0,0,0);
      const lines = pdf.splitTextToSize(data.observations, 160);
      pdf.text(lines, 25, yPosition);
    }

    // Pie de página
    const totalPages = pdf.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      pdf.setFontSize(8).setTextColor(128, 128, 128);
      pdf.text(`Página ${i} de ${totalPages}`, 105, 290, { align: 'center' });
    }

    pdf.save(`reporte-${data.workOrder || 'calibracion'}.pdf`);
  } catch (error) {
    console.error('Error:', error);
  }
};

// ... Auxiliares (getBase64ImageFromUrl, formatDate) se mantienen igual