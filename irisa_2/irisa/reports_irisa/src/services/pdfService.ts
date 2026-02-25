import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import logo from '../assets/logo_slogan_2.png';

declare module 'jspdf' {
<<<<<<< HEAD
<<<<<<< HEAD
  interface jsPDF { 
    autoTable: (options: any) => jsPDF;
  }
=======
    interface jsPDF {
        autoTable: (options: any) => jsPDF;
    }
>>>>>>> parent of 48f416d (Revert "Cambios para generar reporte")
=======
    interface jsPDF {
        autoTable: (options: any) => jsPDF;
    }
>>>>>>> parent of 48f416d (Revert "Cambios para generar reporte")
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
<<<<<<< HEAD
<<<<<<< HEAD
    
=======
>>>>>>> parent of 48f416d (Revert "Cambios para generar reporte")
=======
>>>>>>> parent of 48f416d (Revert "Cambios para generar reporte")
    const hasUE = data.hasUeTransmitter !== undefined 
        ? data.hasUeTransmitter 
        : measurements.some(m => m.ueTransmitter && m.ueTransmitter !== "" && m.ueTransmitter !== "0");

    let yPos = 20;
    const colors = { 
<<<<<<< HEAD
<<<<<<< HEAD
        risaraldaGreen: [20, 110, 90], 
=======
        risaraldaGreen: [119, 158, 79],
>>>>>>> parent of 48f416d (Revert "Cambios para generar reporte")
=======
        risaraldaGreen: [119, 158, 79],
>>>>>>> parent of 48f416d (Revert "Cambios para generar reporte")
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
<<<<<<< HEAD
<<<<<<< HEAD
=======
        // 1. Encabezado con Logo
>>>>>>> parent of 48f416d (Revert "Cambios para generar reporte")
=======
        // 1. Encabezado con Logo
>>>>>>> parent of 48f416d (Revert "Cambios para generar reporte")
        try {
            const b64Logo = await getBase64ImageFromUrl(logo);
            pdf.addImage(b64Logo, 'PNG', 20, 12, 55, 22);
        } catch { console.warn("Logo no disponible"); }
        
        pdf.setFontSize(16).setFont('helvetica', 'bold').setTextColor(0).text('REPORTE DE CALIBRACIÓN', 85, 28);
        yPos = 50;

<<<<<<< HEAD
<<<<<<< HEAD
        // --- 1. ESPECIFICACIONES DEL INSTRUMENTO ---
        addHeader('ESPECIFICACIONES DEL INSTRUMENTO');
=======
        // 2. Información Completa del Instrumento y Trabajo
        addHeader('ESPECIFICACIONES TÉCNICAS Y DATOS DE CAMPO');
>>>>>>> parent of 48f416d (Revert "Cambios para generar reporte")
=======
        // 2. Información Completa del Instrumento y Trabajo
        addHeader('ESPECIFICACIONES TÉCNICAS Y DATOS DE CAMPO');
>>>>>>> parent of 48f416d (Revert "Cambios para generar reporte")
        autoTable(pdf, {
            startY: yPos,
            margin: { left: 20, right: 20 },
            body: [
<<<<<<< HEAD
<<<<<<< HEAD
                ['Nombre del equipo', data.deviceName, 'Código del Equipo', data.deviceCode],
                ['Marca del Equipo', data.deviceBrand, 'Modelo del Equipo', data.deviceModel],
                ['Serial del Instrumento', data.deviceSerial, 'Rango / Unidades', `${data.deviceRange} ${data.unity}`],
                ['Área del Instrumento', data.instrumentArea, 'Tipo de Dispositivo', data.deviceType],
                ['Nombre Instrumentista', data.instrumentistName, 'Código Instrumentista', data.instrumentistCode],
                ['Orden de Trabajo', data.workOrder, 'Fecha de Revisión', data.reviewDate ? new Date(data.reviewDate).toLocaleDateString() : 'N/A']
=======
=======
>>>>>>> parent of 48f416d (Revert "Cambios para generar reporte")
                ['Nombre del Equipo', data.deviceName, 'TAG / Código', data.deviceCode],
                ['Marca / Modelo', `${data.deviceBrand} / ${data.deviceModel}`, 'Serial', data.deviceSerial],
                ['Rango / Unidad', `${data.deviceRange} ${data.unity}`, 'Tipo Dispositivo', data.deviceType.toUpperCase()],
                ['Área', data.instrumentArea, 'Orden Trabajo', data.workOrder],
                ['Instrumentista', data.instrumentistName, 'Código Personal', data.instrumentistCode],
                ['Fecha Revisión', data.reviewDate || 'N/A', '', '']
<<<<<<< HEAD
>>>>>>> parent of 48f416d (Revert "Cambios para generar reporte")
=======
>>>>>>> parent of 48f416d (Revert "Cambios para generar reporte")
            ],
            styles: { fontSize: 8.5, cellPadding: 2.5 },
            columnStyles: { 
                0: { fontStyle: 'bold', fillColor: colors.lightGray, cellWidth: 40 },
                2: { fontStyle: 'bold', fillColor: colors.lightGray, cellWidth: 40 }
            }
        });
        yPos = (pdf as any).lastAutoTable.finalY + 12;

<<<<<<< HEAD
<<<<<<< HEAD
        // --- 2. TABLA DE MEDICIONES ---
        if (data.deviceType === 'transmitter' && measurements.length) {
            addHeader(`RESULTADOS DE LAS MEDICIONES (Salida en ${unit})`);

=======
        // 3. Tabla de Mediciones (Solo si es Transmisor)
        if (data.deviceType === 'transmitter' && measurements.length) {
            addHeader(`RESULTADOS DE LAS MEDICIONES (Salida en ${unit})`);
>>>>>>> parent of 48f416d (Revert "Cambios para generar reporte")
=======
        // 3. Tabla de Mediciones (Solo si es Transmisor)
        if (data.deviceType === 'transmitter' && measurements.length) {
            addHeader(`RESULTADOS DE LAS MEDICIONES (Salida en ${unit})`);
>>>>>>> parent of 48f416d (Revert "Cambios para generar reporte")
            const headers = [
                'Ideal UE', `Ideal ${unit}`, 'Patrón UE', 
                ...(hasUE ? ['UE Trans.'] : []), 
                `${unit} Trans.`, '% Rango', 
                ...(hasUE ? ['Err UE'] : []), 
                `Err ${unit}`, 'Err %'
            ];
            
            const body = measurements.map(m => {
                const calcs = calculateRowErrors(m, unit);
                return [
<<<<<<< HEAD
<<<<<<< HEAD
                    m.idealUe, m.idealMa, m.patronUe,
                    ...(hasUE ? [m.ueTransmitter] : []),
                    m.maTransmitter, m.percentage,
                    ...(hasUE ? [calcs.errorUe] : []),
=======
=======
>>>>>>> parent of 48f416d (Revert "Cambios para generar reporte")
                    m.idealUe, m.idealMa, m.patronUe, 
                    ...(hasUE ? [m.ueTransmitter] : []), 
                    m.maTransmitter, m.percentage, 
                    ...(hasUE ? [calcs.errorUe] : []), 
<<<<<<< HEAD
>>>>>>> parent of 48f416d (Revert "Cambios para generar reporte")
=======
>>>>>>> parent of 48f416d (Revert "Cambios para generar reporte")
                    calcs.errorMa, calcs.errorPercentage
                ];
            });

            autoTable(pdf, {
                startY: yPos,
                head: [headers],
                body: body,
                theme: 'grid',
<<<<<<< HEAD
<<<<<<< HEAD
                headStyles: { fillColor: [119, 158, 79], halign: 'center', fontSize: 7.5, fontStyle: 'bold' },
                styles: { fontSize: 7.5, halign: 'center', cellPadding: 2 },
                didParseCell: (dataCell: any) => {
                    const headerText = headers[dataCell.column.index];
                    if (dataCell.section === 'body' && headerText.startsWith('Err')) {
                        dataCell.cell.styles.fillColor = colors.errorBg;
                        dataCell.cell.styles.textColor = colors.errorText;
                        dataCell.cell.styles.fontStyle = 'bold';
=======
=======
>>>>>>> parent of 48f416d (Revert "Cambios para generar reporte")
                headStyles: { fillColor: colors.risaraldaGreen, halign: 'center', fontSize: 7.5, fontStyle: 'bold' },
                styles: { fontSize: 7.5, halign: 'center', cellPadding: 2 },
                didParseCell: (d: any) => {
                    if (d.section === 'body' && headers[d.column.index].startsWith('Err')) {
                        d.cell.styles.fillColor = colors.errorBg;
                        d.cell.styles.textColor = colors.errorText;
                        d.cell.styles.fontStyle = 'bold';
<<<<<<< HEAD
>>>>>>> parent of 48f416d (Revert "Cambios para generar reporte")
=======
>>>>>>> parent of 48f416d (Revert "Cambios para generar reporte")
                    }
                }
            });
            yPos = (pdf as any).lastAutoTable.finalY + 12;
        }

<<<<<<< HEAD
<<<<<<< HEAD
        // --- 3. GRÁFICOS ---
=======
        // 4. Gráficos
>>>>>>> parent of 48f416d (Revert "Cambios para generar reporte")
=======
        // 4. Gráficos
>>>>>>> parent of 48f416d (Revert "Cambios para generar reporte")
        if (chartImages && chartImages.length > 0) {
            chartImages.forEach((img, i) => {
                if (yPos + 85 > 285) { pdf.addPage(); yPos = 20; }
                const chartTitles = ['Curva de Respuesta', 'Análisis de Errores', 'Linealidad'];
                addHeader(`ANÁLISIS GRÁFICO: ${chartTitles[i] || 'Gráfico de Calibración'}`);
                pdf.addImage(img, 'PNG', 30, yPos, 150, 75);
                yPos += 85;
            });
        }

<<<<<<< HEAD
<<<<<<< HEAD
        // --- 4. OBSERVACIONES (OCUPANDO TODO EL ESPACIO) ---
        if (data.observations) {
            addHeader('OBSERVACIONES Y NOTAS TÉCNICAS');
            autoTable(pdf, {
                startY: yPos,
                margin: { left: 20, right: 20 },
                body: [[data.observations]],
                styles: { 
                    fontSize: 9, 
                    cellPadding: 5, 
                    fillColor: [250, 250, 250], 
                    textColor: 40,
                    lineColor: [200, 200, 200],
                    lineWidth: 0.1
                },
                theme: 'plain'
            });
=======
=======
>>>>>>> parent of 48f416d (Revert "Cambios para generar reporte")
        // 5. Observaciones
        if (data.observations) {
            addHeader('OBSERVACIONES Y NOTAS TÉCNICAS');
            pdf.setFontSize(9).setFont('helvetica', 'normal').setTextColor(40);
            pdf.text(pdf.splitTextToSize(data.observations, 170), 20, yPos);
<<<<<<< HEAD
>>>>>>> parent of 48f416d (Revert "Cambios para generar reporte")
=======
>>>>>>> parent of 48f416d (Revert "Cambios para generar reporte")
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