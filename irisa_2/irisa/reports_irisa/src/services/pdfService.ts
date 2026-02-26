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
    outputUnit?: 'mA' | 'ohm';    
    transmitterMeasurements?: any[];
    pressureSwitchTests?: any[];
    thermostatTests?: any[];
}

const calculateRowErrors = (m: any, unit: 'mA' | 'ohm') => {
    const patronUe = parseFloat(m.patronUe) || 0;
    const ueTransmitter = parseFloat(m.ueTransmitter) || 0;
    const idealOutput = parseFloat(m.idealmA) || 0;
    const sensorOutput = parseFloat(m.maTransmitter) || 0;
    
    const errorUe = ueTransmitter - patronUe; 
    const errorOutput = idealOutput - sensorOutput; 
    
    const divisor = unit === 'mA' ? 16 : 100; 
    const errorPercentage = divisor !== 0 ? (errorOutput / divisor) * 100 : 0; 
    
    return {
        errorUe: errorUe.toFixed(3),
        errorOutput: errorOutput.toFixed(3),
        errorPercentage: errorPercentage.toFixed(2)
    };
};

export const generatePDFReport = async (data: ReportData, chartImages?: string[]): Promise<void> => {
    const pdf = new jsPDF();
    const measurements = data.transmitterMeasurements || [];
    const unit = data.outputUnit || 'mA';
    const hasUE = data.hasUeTransmitter ?? false;
    const isOhm = unit === 'ohm';

    let yPos = 20;

    const colors: { [key: string]: [number, number, number] } = { 
        risaraldaGreen: [20, 110, 90], 
        errorBg: [254, 242, 242],
        errorText: [185, 28, 28],
        lightGray: [245, 245, 245],
        white: [252, 252, 252]
    };

    const addHeader = (title: string) => {
        if (yPos + 40 > 280) { pdf.addPage(); yPos = 20; }
        pdf.setDrawColor(119, 158, 79).setLineWidth(0.8).line(20, yPos, 190, yPos);
        yPos += 10;
        pdf.setFontSize(11).setFont('helvetica', 'bold').setTextColor(60).text(title, 20, yPos);
        yPos += 8;
    };

    try {
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
            theme: 'plain',
            styles: { fontSize: 8.5, cellPadding: 3, lineWidth: 0, textColor: 50 },
            columnStyles: { 
                0: { fontStyle: 'bold', fillColor: colors.lightGray, cellWidth: 40 },
                2: { fontStyle: 'bold', fillColor: colors.lightGray, cellWidth: 40 }
            }
        });
        yPos = (pdf as any).lastAutoTable.finalY + 12;

        // --- 2. TABLA DE MEDICIONES (TRANSMISORES) ---
        if (data.deviceType === 'transmitter' && measurements.length) {
            addHeader(`RESULTADOS DE LAS MEDICIONES`);

            const headers = [
                'Ideal UE', 'Ideal mA', ...(isOhm ? ['Ideal Ohm'] : []), 'Patrón UE', 
                ...(hasUE ? ['UE Trans.'] : []), 'mA Sensor', '% Rango', 
                ...(hasUE ? ['Err UE'] : []), 'Err mA', 'Err %'
            ];

            const body = measurements.map(m => {
                const calcs = calculateRowErrors(m, unit);
                return [
                    m.idealUe, m.idealmA, ...(isOhm ? [m.idealOhm] : []), m.patronUe,
                    ...(hasUE ? [m.ueTransmitter] : []), m.maTransmitter, m.percentage,
                    ...(hasUE ? [calcs.errorUe] : []), calcs.errorOutput, calcs.errorPercentage
                ];
            });

            autoTable(pdf, {
                startY: yPos,
                head: [headers],
                body: body,
                theme: 'plain',
                headStyles: { 
                    fillColor: colors.risaraldaGreen, 
                    halign: 'center', fontSize: 7, fontStyle: 'bold', textColor: 255, lineWidth: 0 
                },
                styles: { fontSize: 7, halign: 'center', cellPadding: 2, lineWidth: 0, textColor: 40 },
                didParseCell: (dataCell: any) => {
                    const headerText = headers[dataCell.column.index];
                    if (dataCell.section === 'body' && dataCell.row.index % 2 === 1) {
                        dataCell.cell.styles.fillColor = colors.white;
                    }
                    if (dataCell.section === 'body' && headerText && headerText.startsWith('Err')) {
                        dataCell.cell.styles.fillColor = colors.errorBg;
                        dataCell.cell.styles.textColor = colors.errorText;
                        dataCell.cell.styles.fontStyle = 'bold';
                    }
                }
            });
            yPos = (pdf as any).lastAutoTable.finalY + 12;
        }

        // --- 2.1 TABLA DE MEDICIONES (PRESOSTATOS / TERMOSTATOS) ---
        const switchTests = data.pressureSwitchTests || data.thermostatTests || [];
        if ((data.deviceType === 'pressure_switch' || data.deviceType === 'thermostat') && switchTests.length) {
            const isPressure = data.deviceType === 'pressure_switch';
            addHeader(`RESULTADOS DE LAS PRUEBAS DE ${isPressure ? 'PRESIÓN' : 'TEMPERATURA'}`);

            const unitLabel = data.unity || (isPressure ? 'PSI' : '°C');
            const headers = [`Set Point (${unitLabel})`, `P. Disparada (${unitLabel})`, `P. Repone (${unitLabel})`, 'Diferencial', 'Estado Contacto'];

            const body = switchTests.map(t => {
                const disparo = parseFloat(t.pressureDisparada || t.tempDisparada) || 0;
                const repone = parseFloat(t.pressureRepone || t.tempRepone) || 0;
                const diferencial = Math.abs(disparo - repone).toFixed(2);
                
                return [
                    t.setPoint || 'N/A',
                    disparo,
                    repone,
                    diferencial,
                    t.contactState || (t.isNo ? 'N.O (Abierto)' : 'N.C (Cerrado)')
                ];
            });

            autoTable(pdf, {
                startY: yPos,
                head: [headers],
                body: body,
                theme: 'plain',
                headStyles: { fillColor: colors.risaraldaGreen, halign: 'center', fontSize: 8.5, fontStyle: 'bold', textColor: 255 },
                styles: { fontSize: 8.5, halign: 'center', cellPadding: 3, textColor: 40 },
                columnStyles: { 3: { fontStyle: 'italic' } }
            });
            yPos = (pdf as any).lastAutoTable.finalY + 12;
        }

        // --- 3. GRÁFICAS ---
        if (chartImages && chartImages.length > 0) {
            chartImages.forEach((img, index) => {
                if (yPos + 80 > 280) { pdf.addPage(); yPos = 20; }
                addHeader(index === 0 ? 'CURVA DE RESPUESTA' : 'ANÁLISIS DE ERROR');
                pdf.addImage(img, 'PNG', 25, yPos, 160, 80);
                yPos += 90;
            });
        }

        // --- 4. OBSERVACIONES ---
        if (data.observations) {
            addHeader('OBSERVACIONES Y NOTAS TÉCNICAS');
            autoTable(pdf, {
                startY: yPos,
                margin: { left: 20, right: 20 },
                body: [[data.observations]],
                styles: { fontSize: 9, cellPadding: 5, fillColor: colors.white, lineWidth: 0, textColor: 60 },
                theme: 'plain'
            });
        }

        const pageCount = (pdf as any).internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            pdf.setPage(i);
            pdf.setFontSize(8).setTextColor(150);
            pdf.text(`Ingenio Risaralda - Generado el ${new Date().toLocaleDateString()}`, 105, 290, { align: 'center' });
            pdf.text(`Página ${i} de ${pageCount}`, 190, 290, { align: 'right' });
        }

        pdf.save(`Reporte_${data.deviceCode || 'Instrumento'}.pdf`);
    } catch (e) { console.error(e); }
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