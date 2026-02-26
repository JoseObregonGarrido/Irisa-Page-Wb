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

const capitalize = (text: string) => {
    if (!text) return '';
    const s = text.toLowerCase();
    return s.charAt(0).toUpperCase() + s.slice(1);
};

const getContactLabel = (t: any) => {
    if (t.isNO === true) return 'N.O (Abierto)';
    if (t.isNC === true) return 'N.C (Cerrado)';
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
        pdf.setFontSize(11).setFont('helvetica', 'bold').setTextColor(60).text(capitalize(title), 20, yPos);
        yPos += 8;
    };

    try {
        // --- LOGO Y TÍTULO ---
        try {
            const b64Logo = await getBase64ImageFromUrl(logo);
            pdf.addImage(b64Logo, 'PNG', 20, 12, 50, 20);
        } catch { console.warn("Logo no cargado"); }
        
        pdf.setFontSize(16).setFont('helvetica', 'bold').setTextColor(0).text('Reporte de calibración', 80, 25);
        yPos = 45;

        // --- ESPECIFICACIONES ---
        addHeader('Especificaciones del instrumento');
        autoTable(pdf, {
            startY: yPos,
            margin: { left: 20, right: 20 },
            body: [
                ['Nombre del equipo', data.deviceName, 'Código del equipo', data.deviceCode],
                ['Marca del equipo', data.deviceBrand, 'Modelo del equipo', data.deviceModel],
                ['Serial del instrumento', data.deviceSerial, 'Rango del instrumento', `${data.deviceRange} ${data.unity}`],
                ['Área del instrumento', data.instrumentArea, 'Tipo de dispositivo', capitalize(data.deviceType)],
                ['Nombre instrumentista', data.instrumentistName, 'Código instrumentista', data.instrumentistCode],
                ['Orden de trabajo', data.workOrder, 'Fecha de revisión', data.reviewDate || 'N/a']
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
            addHeader(`Resultados de las mediciones (Unidad: ${isOhm ? 'RTD' : 'mA'})`);
            
            // Construcción de Headers dinámicos
            const headers = ['Ideal UE', 'Ideal mA'];
            if (isOhm) headers.push('Ideal ohm');
            headers.push('Patrón UE');
            if (hasUE) headers.push('UE trans.');
            headers.push(isOhm ? 'mA sens.' : 'mA trans.');
            if (isOhm) headers.push('ohm sens.');
            headers.push('% Rango');
            if (hasUE) headers.push('Err UE');
            headers.push('Err mA', 'Err %');

            const body = measurements.map(m => {
                const row = [m.idealUE || m.idealUe, m.idealmA]; 
                if (isOhm) row.push(m.idealohm || m.idealOhm || '0');
                row.push(m.patronUE || m.patronUe);
                if (hasUE) row.push(m.ueTransmitter);
                row.push(m.maTransmitter);
                if (isOhm) row.push(m.ohmTransmitter || '0');
                row.push(m.percentage);
                if (hasUE) row.push(m.errorUE || m.errorUe);
                // Aseguramos que tome el valor de error mA que calculamos
                row.push(m.errormA || m.errorMa || '0', m.errorPercentage);
                return row;
            });

            autoTable(pdf, {
                startY: yPos,
                head: [headers],
                body: body,
                theme: 'grid',
                headStyles: { fillColor: colors.risaraldaGreen, halign: 'center', fontSize: 5.5, fontStyle: 'bold' },
                styles: { fontSize: 6, halign: 'center', cellPadding: 1 },
                columnStyles: {
                    // Estilizamos columnas de error en rojo tenue si es posible (opcional)
                }
            });
            yPos = (pdf as any).lastAutoTable.finalY + 12;
        }

        // --- TABLA PRESOSTATO / TERMOSTATO ---
        const isThermostat = data.deviceType === 'thermostat';
        const switchTests = isThermostat ? data.thermostatTests : data.pressureSwitchTests;
        
        if ((data.deviceType === 'pressure_switch' || isThermostat) && switchTests && switchTests.length) {
            addHeader(`Resultados de las pruebas (${isThermostat ? 'Termostato' : 'Presostato'})`);
            const unitLabel = data.unity || (isThermostat ? '°C' : 'psi');
            
            const headers = [
                isThermostat ? `Temp. disparo (${unitLabel})` : `Presión disparo (${unitLabel})`,
                isThermostat ? `Temp. repone (${unitLabel})` : `Presión repone (${unitLabel})`,
                'Estado contacto'
            ];

            const body = switchTests.map(t => [
                isThermostat ? (t.temperaturadeDisparo || '0') : (t.presiondeDisparo || '0'),
                isThermostat ? (t.temperaturadeRepone || '0') : (t.presiondeRepone || '0'),
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

        // --- GRÁFICOS (Capturados desde TransmitterChart con los nuevos cambios) ---
        if (chartImages && chartImages.length > 0) {
            chartImages.forEach((img) => {
                if (yPos + 95 > 280) { pdf.addPage(); yPos = 20; }
                // Título para el gráfico
                pdf.setFontSize(10).setFont('helvetica', 'bold').text("Curva de calibración y linealidad", 20, yPos);
                yPos += 5;
                pdf.addImage(img, 'PNG', 20, yPos, 170, 85);
                yPos += 95; 
            });
        }

        // --- OBSERVACIONES ---
        if (data.observations) {
            if (yPos + 40 > 280) { pdf.addPage(); yPos = 20; }
            addHeader('Observaciones y notas técnicas');
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