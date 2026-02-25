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
    hasUeTransmitter?: boolean; 
    outputUnit?: 'mA' | 'Ω';    
    transmitterMeasurements?: any[];
}

// Mantenemos la lógica de cálculo idéntica a la tabla para consistencia
const calculateRowErrors = (m: any, unit: 'mA' | 'Ω') => {
    const patronUe = parseFloat(m.patronUe) || 0;
    const ueTransmitter = parseFloat(m.ueTransmitter) || 0;
    const idealMa = parseFloat(m.idealMa) || 0;
    const maTransmitter = parseFloat(m.maTransmitter) || 0;
    
    const errorUe = ueTransmitter - patronUe; 
    const errorMa = maTransmitter - idealMa;
    
    const divisor = unit === 'mA' ? 16 : 100; 
    const errorPercentage = (errorMa / divisor) * 100; 
    
    return {
        errorUe: errorUe.toFixed(3),
        errorMa: errorMa.toFixed(3),
        errorPercentage: errorPercentage.toFixed(2)
    };
};

export const generatePDFReport = async (data: ReportData, chartImages?: string[]): Promise<void> => {
    const pdf = new jsPDF();
    
    // --- LÓGICA DE SINCRONIZACIÓN CON LA TABLA ---
    const measurements = data.transmitterMeasurements || [];
    const unit = data.outputUnit || 'mA';
    
    // Si no se define explícitamente, verificamos si hay algún valor en ueTransmitter para mostrar la columna
    const hasUE = data.hasUeTransmitter !== undefined 
        ? data.hasUeTransmitter 
        : measurements.some(m => m.ueTransmitter && m.ueTransmitter !== "" && m.ueTransmitter !== "0");

    let yPos = 20;
    const colors = { 
        risaraldaGreen: [20, 110, 90], // Ajustado a un verde más institucional si prefieres
        errorBg: [254, 242, 242],
        errorText: [185, 28, 28],
        lightGray: [245, 245, 245] 
    };

    const addHeader = (title: string) => {
        if (yPos + 40 > 280) { pdf.addPage(); yPos = 20; }
        pdf.setDrawColor(119, 158, 79).setLineWidth(0.8).line(20, yPos, 190, yPos);
        yPos += 10;
        pdf.setFontSize(11).setFont('helvetica', 'bold').setTextColor(60).text(title, 20, yPos);
        yPos += 8;
    };

    try {
        // Logo y Encabezado
        try {
            const b64Logo = await getBase64ImageFromUrl(logo);
            pdf.addImage(b64Logo, 'PNG', 20, 12, 50, 20);
        } catch { console.warn("Logo no cargado"); }
        
        pdf.setFontSize(16).setFont('helvetica', 'bold').setTextColor(0).text('REPORTE DE CALIBRACIÓN', 80, 25);
        yPos = 45;

        // Información del Equipo
        addHeader('ESPECIFICACIONES DEL INSTRUMENTO');
        autoTable(pdf, {
            startY: yPos,
            margin: { left: 20, right: 20 },
            body: [
                ['TAG / Código', data.deviceCode, 'Marca/Modelo', `${data.deviceBrand} / ${data.deviceModel}`],
                ['Instrumentista', data.instrumentistName, 'Orden de Trabajo', data.workOrder],
                ['Rango de Medida', `${data.deviceRange} ${data.unity}`, 'Fecha de Revisión', data.reviewDate ? new Date(data.reviewDate).toLocaleDateString() : 'N/A']
            ],
            styles: { fontSize: 9, cellPadding: 3 },
            columnStyles: { 
                0: { fontStyle: 'bold', fillColor: colors.lightGray, cellWidth: 35 },
                2: { fontStyle: 'bold', fillColor: colors.lightGray, cellWidth: 35 }
            }
        });
        yPos = (pdf as any).lastAutoTable.finalY + 15;

        // Tabla de Mediciones (Lógica de Espejo)
        if (data.deviceType === 'transmitter' && measurements.length) {
            addHeader(`RESULTADOS DE LAS MEDICIONES (Salida en ${unit})`);

            // Definición dinámica de columnas igual que en el Header Desktop de tu componente
            const headers = [
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

            const body = measurements.map(m => {
                // Recalculamos para asegurar que el PDF sea veraz aunque el estado de React no haya actualizado un campo
                const calcs = calculateRowErrors(m, unit);
                
                const row = [
                    m.idealUe, 
                    m.idealMa, 
                    m.patronUe,
                    ...(hasUE ? [m.ueTransmitter] : []),
                    m.maTransmitter, 
                    m.percentage,
                    ...(hasUE ? [calcs.errorUe] : []),
                    calcs.errorMa, 
                    calcs.errorPercentage
                ];
                return row;
            });

            autoTable(pdf, {
                startY: yPos,
                head: [headers],
                body: body,
                theme: 'grid',
                headStyles: { 
                    fillColor: [119, 158, 79], 
                    halign: 'center', 
                    fontSize: 8,
                    fontStyle: 'bold' 
                },
                styles: { fontSize: 8, halign: 'center', cellPadding: 2.5 },
                didParseCell: (dataCell: any) => {
                    const headerText = headers[dataCell.column.index];
                    // Aplicar el estilo rojo a las columnas de error igual que en el InputField `isError`
                    if (dataCell.section === 'body' && headerText.startsWith('Err')) {
                        dataCell.cell.styles.fillColor = colors.errorBg;
                        dataCell.cell.styles.textColor = colors.errorText;
                        dataCell.cell.styles.fontStyle = 'bold';
                    }
                }
            });
            yPos = (pdf as any).lastAutoTable.finalY + 15;
        }

        // Gráficos
        if (chartImages && chartImages.length > 0) {
            chartImages.forEach((img, i) => {
                const titles = ['Curva de Respuesta', 'Errores de Calibración'];
                if (yPos + 80 > 280) { pdf.addPage(); yPos = 20; }
                addHeader(`ANÁLISIS GRÁFICO: ${titles[i] || 'Gráfico'}`);
                pdf.addImage(img, 'PNG', 30, yPos, 150, 70);
                yPos += 85;
            });
        }

        // Observaciones
        if (data.observations) {
            addHeader('OBSERVACIONES Y NOTAS TÉCNICAS');
            pdf.setFontSize(9).setFont('helvetica', 'normal').setTextColor(40);
            const splitText = pdf.splitTextToSize(data.observations, 170);
            pdf.text(splitText, 20, yPos);
        }

        pdf.save(`Reporte_${data.deviceCode || 'Instrumento'}_${data.workOrder}.pdf`);
    } catch (e) { 
        console.error("Error generando PDF:", e); 
    }
};

const getBase64ImageFromUrl = async (url: string): Promise<string> => {
    const res = await fetch(url);
    const blob = await res.blob();
    return new Promise(resolve => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
    });
};