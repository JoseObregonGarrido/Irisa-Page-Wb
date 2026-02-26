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
    if (t.isNO === true) return 'n.o (abierto)';
    if (t.isNC === true) return 'n.c (cerrado)';
    if (t.contactState) return t.contactState.toLowerCase();
    return 'n/a';
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
        pdf.setFontSize(11).setFont('helvetica', 'bold').setTextColor(60).text(title.toLowerCase(), 20, yPos);
        yPos += 8;
    };

    try {
        // --- LOGO Y TÍTULO ---
        try {
            const b64Logo = await getBase64ImageFromUrl(logo);
            pdf.addImage(b64Logo, 'PNG', 20, 12, 50, 20);
        } catch { console.warn("Logo no cargado"); }
        
        pdf.setFontSize(16).setFont('helvetica', 'bold').setTextColor(0).text('reporte de calibración', 80, 25);
        yPos = 45;

        // --- ESPECIFICACIONES ---
        addHeader('especificaciones del instrumento');
        autoTable(pdf, {
            startY: yPos,
            margin: { left: 20, right: 20 },
            body: [
                ['nombre del equipo', data.deviceName, 'código del equipo', data.deviceCode],
                ['marca del equipo', data.deviceBrand, 'modelo del equipo', data.deviceModel],
                ['serial del instrumento', data.deviceSerial, 'rango del instrumento', `${data.deviceRange} ${data.unity}`],
                ['área del instrumento', data.instrumentArea, 'tipo de dispositivo', data.deviceType.toLowerCase()],
                ['nombre instrumentista', data.instrumentistName, 'código instrumentista', data.instrumentistCode],
                ['orden de trabajo', data.workOrder, 'fecha de revisión', data.reviewDate || 'n/a']
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
            addHeader(`resultados de las mediciones (unidad: ${unit.toLowerCase()})`);
            const headers = ['ideal ue', 'ideal ma'];
            if (isOhm) headers.push('ideal ohm');
            headers.push('patrón ue');
            if (hasUE) headers.push('ue trans.');
            headers.push('ma sensor', '% rango');
            if (hasUE) headers.push('err ue');
            headers.push('err ma', 'err %');

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
        }

        // --- TABLA PRESOSTATO / TERMOSTATO ---
        const isThermostat = data.deviceType === 'thermostat';
        const switchTests = isThermostat ? data.thermostatTests : data.pressureSwitchTests;
        
        if ((data.deviceType === 'pressure_switch' || isThermostat) && switchTests && switchTests.length) {
            addHeader(`resultados de las pruebas (${isThermostat ? 'termostato' : 'presostato'})`);
            
            const unitLabel = data.unity || (isThermostat ? '°c' : 'psi');
            
            const headers = [
                isThermostat ? `temp. disparo (${unitLabel})` : `presión disparada (${unitLabel})`,
                isThermostat ? `temp. repone (${unitLabel})` : `presión repone (${unitLabel})`,
                'estado contacto'
            ];

            // AQUÍ LA CORRECCIÓN CLAVE: Mapear a las variables correctas que vienen del componente
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

        // --- GRÁFICOS (PARA TODOS LOS TIPOS) ---
        if (chartImages && chartImages.length > 0) {
            chartImages.forEach((img) => {
                if (yPos + 85 > 280) { pdf.addPage(); yPos = 20; }
                pdf.addImage(img, 'PNG', 25, yPos, 160, 80);
                yPos += 85; 
            });
        }

        // --- OBSERVACIONES ---
        if (data.observations) {
            if (yPos + 40 > 280) { pdf.addPage(); yPos = 20; }
            addHeader('observaciones y notas técnicas');
            autoTable(pdf, {
                startY: yPos,
                margin: { left: 20, right: 20 },
                body: [[data.observations.toLowerCase()]],
                styles: { fontSize: 9, cellPadding: 5, fillColor: colors.white, textColor: 60 },
                theme: 'plain'
            });
        }

        // --- PIE DE PÁGINA ---
        const pageCount = (pdf as any).internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            pdf.setPage(i);
            pdf.setFontSize(8).setTextColor(150);
            pdf.text(`ingenio risaralda - generado el ${new Date().toLocaleDateString()}`, 105, 290, { align: 'center' });
            pdf.text(`página ${i} de ${pageCount}`, 190, 290, { align: 'right' });
        }

        pdf.save(`reporte_${data.deviceCode || 'instrumento'}.pdf`);
    } catch (e) { console.error("error generando pdf:", e); }
};