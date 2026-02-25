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
    pressureSwitchTests?: any[];
    thermostatTests?: any[];
}

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
    
    const measurements = data.transmitterMeasurements || [];
    const unit = data.outputUnit || 'mA';
    const hasUE = data.hasUeTransmitter !== undefined 
        ? data.hasUeTransmitter 
        : measurements.some(m => m.ueTransmitter && m.ueTransmitter !== "" && m.ueTransmitter !== "0");

    let yPos = 20;
    const colors = { 
        risaraldaGreen: [119, 158, 79],
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
        // 1. Encabezado con Logo
        try {
            const b64Logo = await getBase64ImageFromUrl(logo);
            pdf.addImage(b64Logo, 'PNG', 20, 12, 55, 22);
        } catch { console.warn("Logo no disponible"); }
        
        pdf.setFontSize(16).setFont('helvetica', 'bold').setTextColor(0).text('REPORTE DE CALIBRACIÓN', 85, 28);
        yPos = 50;

        // 2. Información Completa del Instrumento y Trabajo
        addHeader('ESPECIFICACIONES TÉCNICAS Y DATOS DE CAMPO');
        autoTable(pdf, {
            startY: yPos,
            margin: { left: 20, right: 20 },
            body: [
                ['Nombre del Equipo', data.deviceName, 'TAG / Código', data.deviceCode],
                ['Marca / Modelo', `${data.deviceBrand} / ${data.deviceModel}`, 'Serial', data.deviceSerial],
                ['Rango / Unidad', `${data.deviceRange} ${data.unity}`, 'Tipo Dispositivo', data.deviceType.toUpperCase()],
                ['Área', data.instrumentArea, 'Orden Trabajo', data.workOrder],
                ['Instrumentista', data.instrumentistName, 'Código Personal', data.instrumentistCode],
                ['Fecha Revisión', data.reviewDate || 'N/A', '', '']
            ],
            styles: { fontSize: 8.5, cellPadding: 2.5 },
            columnStyles: { 
                0: { fontStyle: 'bold', fillColor: colors.lightGray, cellWidth: 35 },
                2: { fontStyle: 'bold', fillColor: colors.lightGray, cellWidth: 35 }
            }
        });
        yPos = (pdf as any).lastAutoTable.finalY + 12;

        // 3. Tabla de Mediciones (Solo si es Transmisor)
        if (data.deviceType === 'transmitter' && measurements.length) {
            addHeader(`RESULTADOS DE LAS MEDICIONES (Salida en ${unit})`);
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
                headStyles: { fillColor: colors.risaraldaGreen, halign: 'center', fontSize: 7.5, fontStyle: 'bold' },
                styles: { fontSize: 7.5, halign: 'center', cellPadding: 2 },
                didParseCell: (d: any) => {
                    if (d.section === 'body' && headers[d.column.index].startsWith('Err')) {
                        d.cell.styles.fillColor = colors.errorBg;
                        d.cell.styles.textColor = colors.errorText;
                        d.cell.styles.fontStyle = 'bold';
                    }
                }
            });
            yPos = (pdf as any).lastAutoTable.finalY + 12;
        }

        // 4. Gráficos
        if (chartImages && chartImages.length > 0) {
            chartImages.forEach((img, i) => {
                if (yPos + 85 > 285) { pdf.addPage(); yPos = 20; }
                const chartTitles = ['Curva de Respuesta', 'Análisis de Errores', 'Linealidad'];
                addHeader(`ANÁLISIS GRÁFICO: ${chartTitles[i] || 'Gráfico de Calibración'}`);
                pdf.addImage(img, 'PNG', 30, yPos, 150, 75);
                yPos += 85;
            });
        }

        // 5. Observaciones
        if (data.observations) {
            addHeader('OBSERVACIONES Y NOTAS TÉCNICAS');
            pdf.setFontSize(9).setFont('helvetica', 'normal').setTextColor(40);
            pdf.text(pdf.splitTextToSize(data.observations, 170), 20, yPos);
        }

        pdf.save(`Reporte_${data.deviceCode || 'Instrumento'}_${data.workOrder || 'OT'}.pdf`);
    } catch (e) { 
        console.error("Error crítico en PDF Service:", e); 
    }
};

const getBase64ImageFromUrl = async (url: string): Promise<string> => {
    const res = await fetch(url);
    const blob = await res.blob();
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};