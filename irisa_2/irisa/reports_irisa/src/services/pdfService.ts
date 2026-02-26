import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import logo from '../assets/logo_slogan_2.png';

// --- CONFIGURACIÓN BASE Y HELPERS ---
const colors = {
    primary: [20, 110, 90] as [number, number, number], // Verde Ingenio
    grayBg: [245, 245, 245] as [number, number, number],
};

const getBase64 = async (url: string): Promise<string> => {
    const res = await fetch(url);
    const blob = await res.blob();
    return new Promise(resolve => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
    });
};

// --- 1. FUNCIÓN PARA TRANSMISORES ---
export const generateTransmitterPDF = async (data: any, measurements: any[], chartImages?: string[]) => {
    const pdf = new jsPDF();
    let yPos = 45;

    // Header y Logo
    const b64 = await getBase64(logo);
    pdf.addImage(b64, 'PNG', 20, 12, 50, 20);
    pdf.setFontSize(16).setFont('helvetica', 'bold').text('REPORTE DE CALIBRACIÓN: TRANSMISOR', 80, 25);

    // Tabla de Especificaciones
    autoTable(pdf, {
        startY: yPos,
        body: [
            ['Equipo', data.deviceName, 'Código', data.deviceCode],
            ['Rango', `${data.deviceRange} ${data.unity}`, 'Salida', data.outputUnit]
        ],
        theme: 'plain',
        styles: { fontSize: 9 },
        columnStyles: { 0: { fontStyle: 'bold', fillColor: colors.grayBg }, 2: { fontStyle: 'bold', fillColor: colors.grayBg } }
    });

    yPos = (pdf as any).lastAutoTable.finalY + 10;

    // Tabla de Mediciones Dinámica
    const headers = ['% Rango', `Ideal (${data.unity})`, `Ideal (${data.outputUnit})` ];
    if (data.outputUnit === 'ohm') headers.push('Ideal Ohm');
    headers.push(`Patrón (${data.unity})`);
    if (data.hasUeTransmitter) headers.push(`Lectura TX`);
    headers.push(`${data.outputUnit === 'mA' ? 'mA' : 'Ohm'} Medido`, 'Err %');

    autoTable(pdf, {
        startY: yPos,
        head: [headers],
        body: measurements.map(m => {
            const row = [m.percentage + '%', m.idealUe, m.idealmA];
            if (data.outputUnit === 'ohm') row.push(m.idealOhm || '-');
            row.push(m.patronUe);
            if (data.hasUeTransmitter) row.push(m.ueTransmitter);
            row.push(m.maTransmitter, m.errorPercentage + '%');
            return row;
        }),
        headStyles: { fillColor: colors.primary },
        styles: { fontSize: 8, halign: 'center' }
    });

    // Gráficas
    if (chartImages) {
        chartImages.forEach(img => {
            pdf.addPage();
            pdf.text('CURVA DE RESPUESTA Y ERROR', 20, 20);
            pdf.addImage(img, 'PNG', 20, 30, 170, 85);
        });
    }

    pdf.save(`Transmisor_${data.deviceCode}.pdf`);
};

// --- 2. FUNCIÓN PARA TERMOSTATOS ---
export const generateThermostatPDF = async (data: any, tests: any[], chartImages?: string[]) => {
    const pdf = new jsPDF();
    let yPos = 45;

    const b64 = await getBase64(logo);
    pdf.addImage(b64, 'PNG', 20, 12, 50, 20);
    pdf.setFontSize(16).setFont('helvetica', 'bold').text('REPORTE DE PRUEBAS: TERMOSTATO', 80, 25);

    // Especificaciones
    autoTable(pdf, {
        startY: yPos,
        body: [
            ['Equipo', data.deviceName, 'TAG', data.deviceCode],
            ['Marca', data.deviceBrand, 'Modelo', data.deviceModel],
            ['Rango Setpoint', data.deviceRange, 'Unidad', '°C']
        ],
        theme: 'plain',
        styles: { fontSize: 9 },
        columnStyles: { 0: { fontStyle: 'bold', fillColor: colors.grayBg }, 2: { fontStyle: 'bold', fillColor: colors.grayBg } }
    });

    yPos = (pdf as any).lastAutoTable.finalY + 10;

    // Tabla de Pruebas de Termostato
    autoTable(pdf, {
        startY: yPos,
        head: [['Prueba', 'Temp. Disparo (°C)', 'Temp. Repone (°C)', 'Contacto']],
        body: tests.map((t, i) => [
            `#${i + 1}`,
            t.tempDisparo,
            t.tempRepone,
            `${t.isNO ? 'N.O' : ''} ${t.isNC ? 'N.C' : ''}`.trim() || 'N/A'
        ]),
        headStyles: { fillColor: [234, 88, 12] }, // Naranja para Termostatos
        styles: { fontSize: 10, halign: 'center' }
    });

    // Gráficas
    if (chartImages) {
        const labels = ['CICLO TÉRMICO', 'ESTADO DE CONTACTOS'];
        chartImages.forEach((img, i) => {
            pdf.addPage();
            pdf.setFontSize(12).text(labels[i] || 'GRÁFICA DE PRUEBA', 20, 20);
            pdf.addImage(img, 'PNG', 20, 30, 170, 85);
        });
    }

    pdf.save(`Termostato_${data.deviceCode}.pdf`);
};