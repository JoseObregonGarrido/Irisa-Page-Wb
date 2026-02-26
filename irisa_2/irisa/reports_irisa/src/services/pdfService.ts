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
    const hasUE = data.hasUeTransmitter ?? false;
    const isOhm = unit === 'ohm';

    let yPos = 20;

    const colors: { [key: string]: [number, number, number] } = { 
        risaraldaGreen: [20, 110, 90], 
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
            styles: { fontSize: 8.5, cellPadding: 3, textColor: 50 },
            columnStyles: { 
                0: { fontStyle: 'bold', fillColor: colors.lightGray, cellWidth: 40 },
                2: { fontStyle: 'bold', fillColor: colors.lightGray, cellWidth: 40 }
            }
        });
        yPos = (pdf as any).lastAutoTable.finalY + 12;

        // --- TABLA TRANSMISORES ---
        if (data.deviceType === 'transmitter' && measurements.length) {
            addHeader(`RESULTADOS DE LAS MEDICIONES (UNIDAD: ${unit.toUpperCase()})`);
            const headers = ['Ideal UE', 'Ideal mA'];
            if (isOhm) headers.push('Ideal Ohm');
            headers.push('Patrón UE');
            if (hasUE) headers.push('UE Trans.');
            headers.push('mA Sensor', '% Rango');
            if (hasUE) headers.push('Err UE');
            headers.push('Err mA', 'Err %');

            const body = measurements.map(m => {
                const row = [m.idealUe, m.idealmA];
                if (isOhm) row.push(m.idealOhm || '0');
                row.push(m.patronUe);
                if (hasUE) row.push(m.ueTransmitter);
                row.push(m.maTransmitter, m.percentage);
                if (hasUE) row.push(m.errorUe);
                row.push(m.errorMa, m.errorPercentage);
                return row;
            });

            autoTable(pdf, {
                startY: yPos,
                head: [headers],
                body: body,
                theme: 'grid',
                headStyles: { fillColor: colors.risaraldaGreen, halign: 'center', fontSize: 7, fontStyle: 'bold' },
                styles: { fontSize: 7, halign: 'center', cellPadding: 2 }
            });
            yPos = (pdf as any).lastAutoTable.finalY + 12;

            // --- GRÁFICOS (SOLO PARA TRANSMISORES) ---
            if (chartImages && chartImages.length > 0) {
                chartImages.forEach((img) => {
                    if (yPos + 85 > 280) { pdf.addPage(); yPos = 20; }
                    pdf.addImage(img, 'PNG', 25, yPos, 160, 80);
                    yPos += 85; 
                });
            }
        }

        // --- TABLA PRESOSTATO / TERMOSTATO (SIN GRÁFICOS) ---
        const switchTests = (data.deviceType === 'thermostat') ? data.thermostatTests : data.pressureSwitchTests;
        
        if ((data.deviceType === 'pressure_switch' || data.deviceType === 'thermostat') && switchTests && switchTests.length) {
            const isThermostat = data.deviceType === 'thermostat';
            addHeader(`RESULTADOS DE LAS PRUEBAS (${isThermostat ? 'TERMOSTATO' : 'PRESOSTATO'})`);
            
            const unitLabel = data.unity || (isThermostat ? '°C' : 'PSI');
            
            const headers = [
                isThermostat ? `Temp. Disparo (${unitLabel})` : `Presión Disparada (${unitLabel})`,
                isThermostat ? `Temp. Repone (${unitLabel})` : `Presión Repone (${unitLabel})`,
                'Estado Contacto'
            ];

            const body = switchTests.map(t => [
                isThermostat ? (t.tempDisparo || '0') : (t.presionDisparo || '0'),
                isThermostat ? (t.tempRepone || '0') : (t.presionRepone || '0'),
                getContactLabel(t)
            ]);

            autoTable(pdf, {
                startY: yPos,
                head: [headers],
                body: body,
                theme: 'grid',
                headStyles: { fillColor: colors.risaraldaGreen, halign: 'center', fontSize: 8.5, fontStyle: 'bold' },
                styles: { fontSize: 8.5, halign: 'center', cellPadding: 3, textColor: 40 }
            });
            yPos = (pdf as any).lastAutoTable.finalY + 12;
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