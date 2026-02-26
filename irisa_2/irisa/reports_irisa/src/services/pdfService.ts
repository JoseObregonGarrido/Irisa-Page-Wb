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
    thermostatTests?: any[]; // Alineado con el nuevo componente
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

const getContactLabel = (t: any) => {
    // Soporte para ambos: el booleano isNO/isNC o un label directo
    if (t.isNO === true) return 'N.O (Abierto)';
    if (t.isNC === true) return 'N.C (Cerrado)';
    if (t.contactState) return t.contactState;
    return 'N/A';
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
        // --- LOGO Y TÍTULO ---
        try {
            const b64Logo = await getBase64ImageFromUrl(logo);
            pdf.addImage(b64Logo, 'PNG', 20, 12, 50, 20);
        } catch { console.warn("Logo no cargado"); }
        
        pdf.setFontSize(16).setFont('helvetica', 'bold').setTextColor(0).text('REPORTE DE CALIBRACIÓN', 80, 25);
        yPos = 45;

        // --- ESPECIFICACIONES ---
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

        // --- TABLA TRANSMISORES ---
        if (data.deviceType === 'transmitter' && measurements.length) {
            addHeader(`RESULTADOS DE LAS MEDICIONES`);
            // ... (Lógica de transmisores se mantiene igual)
            yPos = (pdf as any).lastAutoTable.finalY + 12;
        }

        // --- TABLA PRESOSTATO / TERMOSTATO ---
        const switchTests = data.thermostatTests || data.pressureSwitchTests || [];
        if ((data.deviceType === 'pressure_switch' || data.deviceType === 'thermostat') && switchTests.length) {
            const isThermostat = data.deviceType === 'thermostat';
            addHeader(`RESULTADOS DE LAS PRUEBAS (${isThermostat ? 'TERMOSTATO' : 'PRESOSTATO'})`);
            
            const unitLabel = data.unity || (isThermostat ? '°C' : 'PSI');
            const col1Label = isThermostat ? `T. Disparo (${unitLabel})` : `P. Disparada (${unitLabel})`;
            const col2Label = isThermostat ? `T. Repone (${unitLabel})` : `P. Repone (${unitLabel})`;

            const headers = [col1Label, col2Label, 'Estado Contacto'];

            const body = switchTests.map(t => {
                // Normalización de acceso a propiedades (acepta ambos formatos de interfaz)
                const disparo = t.tempDisparo || t.presionDisparada || t.pressureDisparada || '0';
                const repone = t.tempRepone || t.presionRepone || t.pressureRepone || '0';
                return [disparo, repone, getContactLabel(t)];
            });

            autoTable(pdf, {
                startY: yPos,
                head: [headers],
                body: body,
                theme: 'plain',
                headStyles: { fillColor: colors.risaraldaGreen, halign: 'center', fontSize: 8.5, fontStyle: 'bold', textColor: 255 },
                styles: { fontSize: 8.5, halign: 'center', cellPadding: 3, textColor: 40 }
            });
            yPos = (pdf as any).lastAutoTable.finalY + 12;
        }

        // --- GRÁFICOS (Capturados desde ThermostatChart) ---
        if (chartImages && chartImages.length > 0) {
            const chartTitles = [
                'Comportamiento de Disparo y Reposición',
                'Análisis de Estados de Contacto',
                'Histéresis (Diferencial Térmico)'
            ];

            chartImages.forEach((img, index) => {
                if (yPos + 95 > 280) { pdf.addPage(); yPos = 20; }
                addHeader(chartTitles[index] || 'GRÁFICA DE ANÁLISIS');
                // Ajuste de proporciones para que el gráfico no se vea estirado
                pdf.addImage(img, 'PNG', 25, yPos, 160, 80);
                yPos += 95;
            });
        }

        // --- OBSERVACIONES ---
        if (data.observations) {
            if (yPos + 40 > 280) { pdf.addPage(); yPos = 20; }
            addHeader('OBSERVACIONES Y NOTAS TÉCNICAS');
            autoTable(pdf, {
                startY: yPos,
                margin: { left: 20, right: 20 },
                body: [[data.observations]],
                styles: { fontSize: 9, cellPadding: 5, fillColor: colors.white, textColor: 60 },
                theme: 'plain'
            });
        }

        // --- PIE DE PÁGINA ---
        const pageCount = (pdf as any).internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            pdf.setPage(i);
            pdf.setFontSize(8).setTextColor(150);
            pdf.text(`Ingenio Risaralda - Generado el ${new Date().toLocaleDateString()}`, 105, 290, { align: 'center' });
            pdf.text(`Página ${i} de ${pageCount}`, 190, 290, { align: 'right' });
        }

        pdf.save(`Reporte_${data.deviceCode || 'Instrumento'}.pdf`);
    } catch (e) { console.error("Error generando PDF:", e); }
};