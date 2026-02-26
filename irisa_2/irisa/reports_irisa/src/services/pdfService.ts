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
    
    // Identificamos el grupo tecnológico
    const isMaRTD = unit === 'mA';
    const isMvTX = unit === 'ohm'; // 'ohm' es el trigger que usamos para el grupo mV/TX en el componente

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

        // --- TABLA TRANSMISORES (CON LÓGICA DINÁMICA DE GRUPOS) ---
        if (data.deviceType === 'transmitter' && measurements.length) {
            const labelTitulo = isMaRTD ? 'mA / RTD' : 'mV / TX';
            addHeader(`Resultados de las mediciones (Modo: ${labelTitulo})`);
            
            // Construcción de Headers según el grupo elegido
            const headers = [];
            if (isMaRTD) {
                headers.push('Ideal UE', 'Ideal mA', 'Ideal Ω', 'Patrón UE');
                if (hasUE) headers.push('UE trans.');
                headers.push('mA sensor', 'Ω sensor', '% Rango');
            } else {
                // Modo mV / TX
                headers.push('MV Ideal', 'Sens. mV', 'Tipo (J/K)', 'Ideal mA');
                if (hasUE) headers.push('UE trans.');
                headers.push('mA TX', 'Tipo (J/K)', '% Rango');
            }
            
            if (hasUE) headers.push('Err UE');
            headers.push(isMaRTD ? 'Err mA' : 'Err mV', 'Err %');

            const body = measurements.map(m => {
                const row = [];
                if (isMaRTD) {
                    row.push(m.idealUE, m.idealmA, m.idealohm || '0', m.patronUE);
                    if (hasUE) row.push(m.ueTransmitter);
                    row.push(m.maTransmitter, m.ohmTransmitter || '0', m.percentage);
                } else {
                    // Cuerpo para mV / TX
                    row.push(m.idealmV || '0', m.mvTransmitter || '0', m.sensorTypeMV || 'J', m.idealmA);
                    if (hasUE) row.push(m.ueTransmitter);
                    row.push(m.maTransmitter, m.sensorTypeTX || 'J', m.percentage);
                }

                if (hasUE) row.push(m.errorUE);
                row.push(m.errormA, m.errorPercentage);
                return row;
            });

            autoTable(pdf, {
                startY: yPos,
                head: [headers],
                body: body,
                theme: 'grid',
                headStyles: { fillColor: colors.risaraldaGreen, halign: 'center', fontSize: 5.5, fontStyle: 'bold' },
                styles: { fontSize: 6, halign: 'center', cellPadding: 1 },
            });
            yPos = (pdf as any).lastAutoTable.finalY + 12;
        }

        // --- LAS DEMÁS TABLAS SE MANTIENEN IGUAL ---
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

        if (chartImages && chartImages.length > 0) {
            chartImages.forEach((img) => {
                if (yPos + 95 > 280) { pdf.addPage(); yPos = 20; }
                pdf.setFontSize(10).setFont('helvetica', 'bold').text("Curva de calibración y linealidad", 20, yPos);
                yPos += 5;
                pdf.addImage(img, 'PNG', 20, yPos, 170, 85);
                yPos += 95; 
            });
        }

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