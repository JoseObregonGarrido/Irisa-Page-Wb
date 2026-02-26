import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import logo from '../assets/logo_slogan_2.png';

// --- CONFIGURACIÓN DE TEMAS ---
const THEMES = {
    TRANSMITTER: { primary: [20, 110, 90] as [number, number, number], title: 'TRANSMISOR' },
    THERMOSTAT: { primary: [234, 88, 12] as [number, number, number], title: 'TERMOSTATO' },
    PRESSURE: { primary: [30, 64, 175] as [number, number, number], title: 'PRESOSTATO' }
};

const GRAY_BG = [245, 245, 245] as [number, number, number];

const getBase64 = async (url: string): Promise<string> => {
    const res = await fetch(url);
    const blob = await res.blob();
    return new Promise(resolve => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
    });
};

// --- 1. GENERAR TRANSMISOR ---
export const generateTransmitterPDF = async (data: any, measurements: any[], chartImages?: string[]) => {
    const pdf = new jsPDF();
    const b64 = await getBase64(logo);
    pdf.addImage(b64, 'PNG', 20, 12, 50, 20);
    pdf.setFontSize(16).setFont('helvetica', 'bold').text(`REPORTE: ${THEMES.TRANSMITTER.title}`, 80, 25);

    autoTable(pdf, {
        startY: 45,
        body: [
            ['Equipo', data.deviceName, 'Código', data.deviceCode],
            ['Marca', data.deviceBrand, 'Modelo', data.deviceModel],
            ['Rango', `${data.deviceRange} ${data.unity}`, 'Salida', data.outputUnit]
        ],
        theme: 'plain',
        styles: { fontSize: 8.5 },
        columnStyles: { 0: { fontStyle: 'bold', fillColor: GRAY_BG }, 2: { fontStyle: 'bold', fillColor: GRAY_BG } }
    });

    const headers = ['% Rango', `Ideal (${data.unity})`, `Ideal (${data.outputUnit})` ];
    if (data.outputUnit === 'ohm') headers.push('Ideal Ohm');
    headers.push(`Patrón (${data.unity})`);
    if (data.hasUeTransmitter) headers.push(`Lectura TX`);
    headers.push(`${data.outputUnit === 'mA' ? 'mA' : 'Ohm'} Sensor`, 'Err %');

    autoTable(pdf, {
        startY: (pdf as any).lastAutoTable.finalY + 10,
        head: [headers],
        body: measurements.map(m => {
            const row = [m.percentage + '%', m.idealUe, m.idealmA];
            if (data.outputUnit === 'ohm') row.push(m.idealOhm || '-');
            row.push(m.patronUe);
            if (data.hasUeTransmitter) row.push(m.ueTransmitter);
            row.push(m.maTransmitter, m.errorPercentage + '%');
            return row;
        }),
        headStyles: { fillColor: THEMES.TRANSMITTER.primary },
        styles: { fontSize: 8, halign: 'center' }
    });

    if (chartImages) {
        chartImages.forEach(img => {
            pdf.addPage();
            pdf.text('ANÁLISIS DE CURVA Y ERROR', 20, 20);
            pdf.addImage(img, 'PNG', 20, 30, 170, 85);
        });
    }
    pdf.save(`TX_${data.deviceCode}.pdf`);
};

// --- 2. GENERAR TERMOSTATO ---
export const generateThermostatPDF = async (data: any, tests: any[], chartImages?: string[]) => {
    const pdf = new jsPDF();
    const b64 = await getBase64(logo);
    pdf.addImage(b64, 'PNG', 20, 12, 50, 20);
    pdf.setFontSize(16).setFont('helvetica', 'bold').text(`REPORTE: ${THEMES.THERMOSTAT.title}`, 80, 25);

    autoTable(pdf, {
        startY: 45,
        body: [
            ['Equipo', data.deviceName, 'TAG', data.deviceCode],
            ['Rango Setpoint', data.deviceRange, 'Unidad', '°C'],
            ['Instrumentista', data.instrumentistName, 'Fecha', data.reviewDate]
        ],
        theme: 'plain',
        styles: { fontSize: 9 },
        columnStyles: { 0: { fontStyle: 'bold', fillColor: GRAY_BG }, 2: { fontStyle: 'bold', fillColor: GRAY_BG } }
    });

    autoTable(pdf, {
        startY: (pdf as any).lastAutoTable.finalY + 10,
        head: [['Prueba', 'Temp. Disparo (°C)', 'Temp. Repone (°C)', 'Contacto']],
        body: tests.map((t, i) => [
            `#${i + 1}`,
            t.tempDisparo,
            t.tempRepone,
            `${t.isNO ? 'N.O' : ''} ${t.isNC ? 'N.C' : ''}`.trim() || 'N/A'
        ]),
        headStyles: { fillColor: THEMES.THERMOSTAT.primary },
        styles: { fontSize: 10, halign: 'center' }
    });

    if (chartImages) {
        const labels = ['ANÁLISIS TÉRMICO', 'ESTADO DE CONTACTOS'];
        chartImages.forEach((img, i) => {
            pdf.addPage();
            pdf.text(labels[i] || 'GRÁFICA', 20, 20);
            pdf.addImage(img, 'PNG', 20, 30, 170, 85);
        });
    }
    pdf.save(`TM_${data.deviceCode}.pdf`);
};

// --- 3. GENERAR PRESOSTATO ---
export const generatePressureSwitchPDF = async (data: any, tests: any[], chartImages?: string[]) => {
    const pdf = new jsPDF();
    const b64 = await getBase64(logo);
    pdf.addImage(b64, 'PNG', 20, 12, 50, 20);
    pdf.setFontSize(16).setFont('helvetica', 'bold').text(`REPORTE: ${THEMES.PRESSURE.title}`, 80, 25);

    autoTable(pdf, {
        startY: 45,
        body: [
            ['Equipo', data.deviceName, 'TAG', data.deviceCode],
            ['Rango Trabajo', data.deviceRange, 'Unidad', data.unity || 'PSI'],
            ['Instrumentista', data.instrumentistName, 'Fecha', data.reviewDate]
        ],
        theme: 'plain',
        styles: { fontSize: 9 },
        columnStyles: { 0: { fontStyle: 'bold', fillColor: GRAY_BG }, 2: { fontStyle: 'bold', fillColor: GRAY_BG } }
    });

    autoTable(pdf, {
        startY: (pdf as any).lastAutoTable.finalY + 10,
        head: [[`P. Disparo (${data.unity || 'PSI'})`, `P. Repone (${data.unity || 'PSI'})`, 'Estado Contacto']],
        body: tests.map((t) => [
            t.presionDisparada,
            t.presionRepone,
            `${t.isNO ? 'N.O' : ''} ${t.isNC ? 'N.C' : ''}`.trim() || 'N/A'
        ]),
        headStyles: { fillColor: THEMES.PRESSURE.primary },
        styles: { fontSize: 10, halign: 'center' }
    });

    if (chartImages) {
        const labels = ['CICLO DE PRESIÓN', 'COMPORTAMIENTO DE CONTACTOS'];
        chartImages.forEach((img, i) => {
            pdf.addPage();
            pdf.text(labels[i] || 'GRÁFICA', 20, 20);
            pdf.addImage(img, 'PNG', 20, 30, 170, 85);
        });
    }
    pdf.save(`PS_${data.deviceCode}.pdf`);
};