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
    deviceType: 'transmitter' | 'pressure_switch' | 'thermostat' | string;
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

const getContactLabel = (t: any) => {
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
    
    let yPos = 20;

    const colors: { [key: string]: [number, number, number] } = { 
        risaraldaGreen: [20, 110, 90], 
        lightGray: [245, 245, 245],
        white: [252, 252, 252]
    };

    const addHeader = (title: string) => {
        if (yPos + 45 > 280) { pdf.addPage(); yPos = 20; }
        pdf.setDrawColor(119, 158, 79).setLineWidth(0.8).line(20, yPos, 190, yPos);
        yPos += 10;
        pdf.setFontSize(11).setFont('helvetica', 'bold').setTextColor(60).text(title.toUpperCase(), 20, yPos);
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
        addHeader('Especificaciones del Instrumento');
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

        // --- TABLA TRANSMISORES (Calibración 5 puntos) ---
        if (data.deviceType === 'transmitter' && measurements.length) {
            addHeader(`Resultados de las Mediciones (Transmisor)`);
            const headers = [['%', 'Ideal UE', 'Patrón UE', 'Ideal Output', 'Medido Output', 'Error %']];
            const body = measurements.map(m => [
                m.percentage + '%',
                m.idealUe,
                m.patronUe,
                m.idealmA,
                m.maTransmitter,
                m.errorPercentage + '%'
            ]);

            autoTable(pdf, {
                startY: yPos,
                head: headers,
                body: body,
                headStyles: { fillColor: colors.risaraldaGreen, textColor: 255 },
                styles: { fontSize: 8, halign: 'center' }
            });
            yPos = (pdf as any).lastAutoTable.finalY + 12;
        }

        // --- TABLA PRESOSTATO / TERMOSTATO ---
        const switchTests = data.thermostatTests || data.pressureSwitchTests || [];
        if ((data.deviceType === 'pressure_switch' || data.deviceType === 'thermostat') && switchTests.length) {
            const isThermostat = data.deviceType === 'thermostat';
            addHeader(`Resultados de las Pruebas (${isThermostat ? 'Termostato' : 'Presostato'})`);
            
            const unitLabel = data.unity || (isThermostat ? '°C' : 'PSI');
            const col1Label = isThermostat ? `T. Disparo (${unitLabel})` : `P. Disparada (${unitLabel})`;
            const col2Label = isThermostat ? `T. Repone (${unitLabel})` : `P. Repone (${unitLabel})`;

            const body = switchTests.map(t => [
                t.tempDisparo || t.presionDisparada || '0',
                t.tempRepone || t.presionRepone || '0',
                getContactLabel(t)
            ]);

            autoTable(pdf, {
                startY: yPos,
                head: [[col1Label, col2Label, 'Estado Contacto']],
                body: body,
                headStyles: { fillColor: colors.risaraldaGreen, textColor: 255 },
                styles: { fontSize: 8.5, halign: 'center' }
            });
            yPos = (pdf as any).lastAutoTable.finalY + 12;
        }

        // --- GRÁFICOS DINÁMICOS SEGÚN DISPOSITIVO ---
        if (chartImages && chartImages.length > 0) {
            let chartTitles: string[] = [];

            // Lógica para que los títulos coincidan con los tabs de cada chart
            if (data.deviceType === 'transmitter') {
                chartTitles = ['Curva de Respuesta (Ideal vs Real)'];
            } else if (data.deviceType === 'pressure_switch') {
                chartTitles = [
                    'Disparada vs Repone (Presión)', 
                    'Histéresis (Diferencial PSI)', 
                    'Análisis de Contactos'
                ];
            } else if (data.deviceType === 'thermostat') {
                chartTitles = [
                    'Secuencia de Temperaturas', 
                    'Estado de Contactos (On/Off)', 
                    'Análisis de Diferencial Térmico'
                ];
            }

            chartImages.forEach((img, index) => {
                if (yPos + 95 > 280) { pdf.addPage(); yPos = 20; }
                const title = chartTitles[index] || `Gráfica de Análisis ${index + 1}`;
                addHeader(title);
                pdf.addImage(img, 'PNG', 25, yPos, 160, 80);
                yPos += 95;
            });
        }

        // --- OBSERVACIONES ---
        if (data.observations) {
            if (yPos + 40 > 280) { pdf.addPage(); yPos = 20; }
            addHeader('Observaciones y Notas Técnicas');
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
            pdf.text(`Ingenio Risaralda © 2026 - Reporte generado por Sistema de Calibración`, 105, 290, { align: 'center' });
            pdf.text(`Página ${i} de ${pageCount}`, 190, 290, { align: 'right' });
        }

        pdf.save(`Reporte_${data.deviceCode || 'Calibracion'}.pdf`);
    } catch (e) { 
        console.error("Error generando PDF:", e); 
    }
};