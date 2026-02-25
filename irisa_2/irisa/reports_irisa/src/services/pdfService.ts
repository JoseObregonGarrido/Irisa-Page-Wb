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
    outputUnit?: 'mA' | 'omh';    
    transmitterMeasurements?: any[];
}

const calculateRowErrors = (m: any, unit: 'mA' | 'omh') => {
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
    
    const measurements = data.transmitterMeasurements || [];
    const unit = data.outputUnit || 'mA';
    
    // Esta variable ahora obedece al booleano que el usuario marque en la interfaz
    const hasUE = data.hasUeTransmitter !== undefined 
        ? data.hasUeTransmitter 
        : measurements.some(m => m.ueTransmitter && m.ueTransmitter !== "" && m.ueTransmitter !== "0");

    let yPos = 20;
    const colors = { 
        risaraldaGreen: [20, 110, 90], 
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
        // Logo y Título
        try {
            const b64Logo = await getBase64ImageFromUrl(logo);
            pdf.addImage(b64Logo, 'PNG', 20, 12, 50, 20);
        } catch { console.warn("Logo no cargado"); }
        
        pdf.setFontSize(16).setFont('helvetica', 'bold').setTextColor(0).text('REPORTE DE CALIBRACIÓN', 80, 25);
        yPos = 45;

        // --- 1. ESPECIFICACIONES ---
        addHeader('ESPECIFICACIONES DEL INSTRUMENTO');
        autoTable(pdf, {
            startY: yPos,
            margin: { left: 20, right: 20 },
            body: [
                ['Nombre del equipo', data.deviceName, 'Código del Equipo', data.deviceCode],
                ['Marca del Equipo', data.deviceBrand, 'Modelo del Equipo', data.deviceModel],
                ['Serial del Instrumento', data.deviceSerial, 'Rango del instrumento', `${data.deviceRange} ${data.unity}`],
                ['Área del Instrumento', data.instrumentArea, 'Tipo de Dispositivo', data.deviceType.toUpperCase()],
                ['Nombre Instrumentista', data.instrumentistName, 'Código Instrumentista', data.instrumentistCode],
                ['Orden de Trabajo', data.workOrder, 'Fecha de Revisión', data.reviewDate || 'N/A']
            ],
            styles: { fontSize: 8.5, cellPadding: 2.5 },
            columnStyles: { 
                0: { fontStyle: 'bold', fillColor: colors.lightGray, cellWidth: 40 },
                2: { fontStyle: 'bold', fillColor: colors.lightGray, cellWidth: 40 }
            }
        });
        yPos = (pdf as any).lastAutoTable.finalY + 12;

        // --- 2. TABLA DE MEDICIONES (Dinamizada por hasUE) ---
        if (data.deviceType.toLowerCase().includes('transmitter') || measurements.length) {
            addHeader(`RESULTADOS DE LAS MEDICIONES (Salida en ${unit})`);

            const headers = [
                'Ideal UE', `Ideal ${unit}`, 'Patrón UE', 
                ...(hasUE ? ['UE Trans.'] : []), // Aparece si hasUE es true
                `${unit} Trans.`, '% Rango', 
                ...(hasUE ? ['Err UE'] : []),    // Aparece si hasUE es true
                `Err ${unit}`, 'Err %'
            ];

            const body = measurements.map(m => {
                const calcs = calculateRowErrors(m, unit);
                return [
                    m.idealUe, m.idealMa, m.patronUe,
                    ...(hasUE ? [m.ueTransmitter] : []),
                    m.maTransmitter, m.percentage,
                    ...(hasUE ? [calcs.errorUe] : []),
                    calcs.errorMa, calcs.errorPercentage
                ];
            });

            autoTable(pdf, {
                startY: yPos,
                head: [headers],
                body: body,
                theme: 'grid',
                headStyles: { fillColor: [119, 158, 79], halign: 'center', fontSize: 7.5, fontStyle: 'bold' },
                styles: { fontSize: 7.5, halign: 'center', cellPadding: 2 },
                didParseCell: (dataCell: any) => {
                    const headerText = headers[dataCell.column.index];
                    if (dataCell.section === 'body' && headerText && headerText.startsWith('Err')) {
                        dataCell.cell.styles.fillColor = colors.errorBg;
                        dataCell.cell.styles.textColor = colors.errorText;
                        dataCell.cell.styles.fontStyle = 'bold';
                    }
                }
            });
            yPos = (pdf as any).lastAutoTable.finalY + 12;
        }

        // --- 3. GRÁFICOS ---
        if (chartImages && chartImages.length > 0) {
            chartImages.forEach((img, i) => {
                const titles = ['Curva de Respuesta', 'Análisis de Errores'];
                if (yPos + 80 > 280) { pdf.addPage(); yPos = 20; }
                addHeader(`ANÁLISIS GRÁFICO: ${titles[i] || 'Gráfico de Calibración'}`);
                pdf.addImage(img, 'PNG', 30, yPos, 150, 70);
                yPos += 85;
            });
        }

        // --- 4. OBSERVACIONES ---
        if (data.observations) {
            addHeader('OBSERVACIONES Y NOTAS TÉCNICAS');
            autoTable(pdf, {
                startY: yPos,
                margin: { left: 20, right: 20 },
                body: [[data.observations]],
                styles: { 
                    fontSize: 9, 
                    cellPadding: 5, 
                    fillColor: [250, 250, 250], 
                    textColor: 40,
                    lineColor: [200, 200, 200],
                    lineWidth: 0.1,
                    overflow: 'linebreak'
                },
                theme: 'plain'
            });
        }

        pdf.save(`Reporte_${data.deviceCode || 'Instrumento'}_OT_${data.workOrder}.pdf`);
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