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
    outputUnit?: 'mA' | 'ohm' | 'mv';
    transmitterMeasurements?: any[];
    pressureSwitchTests?: any[];
    thermostatTests?: any[];
    phTests?: any[];
    signatureInstrumentista?: string;
    signatureJefe?: string;
}

// --- Fórmulas pH (Se mantienen intactas) ---
const V0 = 174;
const T0 = 30;
const calcRangoVida = (v: number): number => Math.max(0, Math.min(T0, T0 - (v - V0)));
const getEstadoPH = (t: number): 'OK' | 'Verificar' | 'Agotado' => {
    if (t >= 20) return 'OK';
    if (t >= 10) return 'Verificar';
    return 'Agotado';
};

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
    const pdf = new jsPDF({ orientation: 'landscape' });
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();
    const marginX = 15;
    const contentW = pageW - marginX * 2;

    const measurements = data.transmitterMeasurements || [];
    const unit = data.outputUnit || 'mA';
    const hasUE = data.hasUeTransmitter ?? false;
    const isOhm = unit === 'ohm';
    const isMv = unit === 'mv';

    let yPos = 20;

    const colors: { [key: string]: [number, number, number] } = {
        risaraldaGreen: [20, 110, 90],
        orangeThermocouple: [230, 126, 34],
        purpleTX: [109, 40, 217],
        tealPH: [13, 148, 136],
        lightGray: [245, 245, 245],
        white: [252, 252, 252],
        green: [21, 128, 61],
        orange: [180, 90, 0],
        red: [200, 30, 30],
    };

    const addHeader = (title: string) => {
        if (yPos + 40 > pageH - 15) { pdf.addPage(); yPos = 20; }
        pdf.setDrawColor(119, 158, 79).setLineWidth(0.8).line(marginX, yPos, pageW - marginX, yPos);
        yPos += 10;
        pdf.setFontSize(11).setFont('helvetica', 'bold').setTextColor(60).text(title.toUpperCase(), marginX, yPos);
        yPos += 8;
    };

    try {
        // --- LOGO ---
        try {
            const b64Logo = await getBase64ImageFromUrl(logo);
            pdf.addImage(b64Logo, 'PNG', marginX, 12, 50, 20);
        } catch { console.warn('Logo no cargado'); }

        pdf.setFontSize(16).setFont('helvetica', 'bold').setTextColor(0)
           .text('REPORTE DE CALIBRACIÓN', pageW / 2, 25, { align: 'center' });
        yPos = 45;

        // --- ESPECIFICACIONES ---
        addHeader('Especificaciones del instrumento');
        autoTable(pdf, {
            startY: yPos,
            margin: { left: marginX, right: marginX },
            body: [
                ['Nombre del equipo', data.deviceName, 'Código del equipo', data.deviceCode],
                ['Marca del equipo', data.deviceBrand, 'Modelo del equipo', data.deviceModel],
                ['Serial del instrumento', data.deviceSerial, 'Rango del instrumento', `${data.deviceRange} ${data.unity}`],
                ['Área del instrumento', data.instrumentArea, 'Tipo de dispositivo', capitalize(data.deviceType)],
                ['Nombre instrumentista', data.instrumentistName, 'Código instrumentista', data.instrumentistCode],
                ['Orden de trabajo', data.workOrder, 'Fecha de revisión', data.reviewDate || 'N/a'],
            ],
            theme: 'plain',
            styles: { fontSize: 8.5, cellPadding: 3, textColor: 50 },
            columnStyles: {
                0: { fontStyle: 'bold', fillColor: colors.lightGray, cellWidth: 45 },
                2: { fontStyle: 'bold', fillColor: colors.lightGray, cellWidth: 45 },
            },
        });
        yPos = (pdf as any).lastAutoTable.finalY + 12;

        // --- TRANSMISORES ---
        if (data.deviceType === 'transmitter' && measurements.length) {
            if (isMv) {
                const mvRows = measurements.filter(m => !m.rowType || m.rowType === 'mv');
                const txRows = measurements.filter(m => m.rowType === 'tx');
                if (mvRows.length > 0) {
                    addHeader('Resultados de las mediciones - Termopar (mV)');
                    autoTable(pdf, {
                        startY: yPos, margin: { left: marginX, right: marginX },
                        head: [['mV Ideal', 'mV Sensor', 'Tipo Sensor', 'Error mV']],
                        body: mvRows.map(m => [m.idealmV || '0', m.sensormV || '0', m.sensorType || 'N/A', m.errormV || '0']),
                        theme: 'grid',
                        headStyles: { fillColor: colors.orangeThermocouple, halign: 'center', fontSize: 8, fontStyle: 'bold' },
                        styles: { fontSize: 8, halign: 'center', cellPadding: 2.5 },
                    });
                    yPos = (pdf as any).lastAutoTable.finalY + 12;
                }
                if (txRows.length > 0) {
                    addHeader('Resultados de las mediciones - Transmisor (TX)');
                    autoTable(pdf, {
                        startY: yPos, margin: { left: marginX, right: marginX },
                        head: [['Ideal mA', 'mA TX', 'Tipo Sensor', 'Err mA']],
                        body: txRows.map(m => [m.idealmA || '0', m.mATX || '0', m.sensorType || 'N/A', m.errormA || '0']),
                        theme: 'grid',
                        headStyles: { fillColor: colors.purpleTX, halign: 'center', fontSize: 8, fontStyle: 'bold' },
                        styles: { fontSize: 8, halign: 'center', cellPadding: 2.5 },
                    });
                    yPos = (pdf as any).lastAutoTable.finalY + 12;
                }
            } else {
                addHeader(`Resultados de las mediciones - ${isOhm ? 'RTD' : 'mA'}`);
                
                // Columnas dinámicas según el tipo
                const headers: string[] = ['Ideal UE', 'Ideal mA'];
                if (isOhm) headers.push('Ideal Ohm');
                headers.push('Patrón UE');
                if (hasUE) headers.push('UE Trans.');
                headers.push('mA Trans.'); // Simplificado
                if (isOhm) headers.push('Ohm Sens.');
                if (hasUE) headers.push('Err UE');
                headers.push('Err mA', 'Err %');

                const body = measurements.map(m => {
                    const row: any[] = [m.idealUE || m.idealUe, m.idealmA];
                    if (isOhm) row.push(m.idealohm || m.idealOhm || '0');
                    row.push(m.patronUE || m.patronUe);
                    if (hasUE) row.push(m.ueTransmitter);
                    row.push(m.maTransmitter);
                    if (isOhm) row.push(m.ohmTransmitter || '0');
                    if (hasUE) row.push(m.errorUE || '0.000');
                    row.push(m.errormA || '0.000', m.errorPercentage || '0.00');
                    return row;
                });

                autoTable(pdf, {
                    startY: yPos, margin: { left: marginX, right: marginX },
                    head: [headers], body, theme: 'grid',
                    headStyles: { fillColor: colors.risaraldaGreen, halign: 'center', fontSize: 7.5, fontStyle: 'bold' },
                    styles: { fontSize: 7.5, halign: 'center', cellPadding: 2 },
                });
                yPos = (pdf as any).lastAutoTable.finalY + 12;
            }
        }

        // --- PRESOSTATO / TERMOSTATO (Se mantiene intacto) ---
        const isThermostat = data.deviceType === 'thermostat';
        const switchTests = isThermostat ? data.thermostatTests : data.pressureSwitchTests;
        if ((data.deviceType === 'pressure_switch' || isThermostat) && switchTests?.length) {
            addHeader(isThermostat ? 'RESULTADOS TERMOSTATO' : 'RESULTADOS PRESOSTATO');
            const unitLabel = data.unity || (isThermostat ? '°C' : 'psi');
            autoTable(pdf, {
                startY: yPos, margin: { left: marginX, right: marginX },
                head: [[
                    isThermostat ? `Temp. disparo (${unitLabel})` : `Presión disparo (${unitLabel})`,
                    isThermostat ? `Temp. repone (${unitLabel})` : `Presión repone (${unitLabel})`,
                    'Estado contacto',
                ]],
                body: switchTests.map(t => [
                    isThermostat ? (t.temperaturadeDisparo || '0') : (t.presiondeDisparo || '0'),
                    isThermostat ? (t.temperaturadeRepone || '0') : (t.presiondeRepone || '0'),
                    getContactLabel(t),
                ]),
                theme: 'grid',
                headStyles: { fillColor: colors.risaraldaGreen, halign: 'center', fontSize: 8.5, fontStyle: 'bold' },
                styles: { fontSize: 8.5, halign: 'center', cellPadding: 3, textColor: 40 },
            });
            yPos = (pdf as any).lastAutoTable.finalY + 12;
        }

        // --- TABLA pH (Se mantiene intacta) ---
        if (data.deviceType === 'ph' && data.phTests?.length) {
            addHeader('RESULTADOS MEDICIONES DE pH');
            autoTable(pdf, {
                startY: yPos,
                margin: { left: marginX, right: marginX },
                head: [['Patrón Buffer', 'Promedio pH', 'Desviación', 'Voltaje (mV)', 'Temp (°C)', 'Rango Vida (mV)', 'Estado Electrodo', 'Error %']],
                body: data.phTests.map(t => {
                    const voltaje = parseFloat(t.voltaje);
                    const mvGuardado = parseFloat(t.errorMv);
                    const rangoVida = !isNaN(mvGuardado) && t.errorMv !== '' ? mvGuardado : !isNaN(voltaje) ? calcRangoVida(voltaje) : 0;
                    const estado = getEstadoPH(rangoVida);
                    return [
                        t.patron ? `pH ${t.patron}` : '—',
                        t.promedio || '0', t.desviacion || '0', t.voltaje || '0', t.temperatura || '0',
                        rangoVida.toFixed(2), estado, t.error ? `${t.error}%` : '0%',
                    ];
                }),
                theme: 'grid',
                headStyles: { fillColor: colors.tealPH, halign: 'center', fontSize: 8, fontStyle: 'bold' },
                styles: { fontSize: 8, halign: 'center', cellPadding: 2.5 },
                columnStyles: {
                    5: { textColor: colors.orange, fontStyle: 'bold' },
                    6: { fontStyle: 'bold' },
                    7: { textColor: colors.red, fontStyle: 'bold' },
                },
                didParseCell: (hookData: any) => {
                    if (hookData.column.index === 6 && hookData.section === 'body') {
                        const v = hookData.cell.text[0];
                        if (v === 'OK') hookData.cell.styles.textColor = colors.green;
                        else if (v === 'Verificar') hookData.cell.styles.textColor = colors.orange;
                        else if (v === 'Agotado') hookData.cell.styles.textColor = colors.red;
                    }
                },
            });
            yPos = (pdf as any).lastAutoTable.finalY + 12;
        }

        // --- OBSERVACIONES ---
        if (data.observations) {
            if (yPos + 40 > pageH - 15) { pdf.addPage(); yPos = 20; }
            addHeader('OBSERVACIONES Y NOTAS TÉCNICAS');
            autoTable(pdf, {
                startY: yPos, margin: { left: marginX, right: marginX },
                body: [[data.observations]],
                styles: { fontSize: 9, cellPadding: 5, fillColor: colors.white, textColor: 60 },
                theme: 'plain',
            });
            yPos = (pdf as any).lastAutoTable.finalY + 12;
        }

        // --- FIRMAS ---
        if (data.signatureInstrumentista || data.signatureJefe) {
            if (yPos + 60 > pageH - 15) { pdf.addPage(); yPos = 20; }
            addHeader('FIRMAS DE CONFORMIDAD');
            const firmaW = (contentW / 2) - 10;
            const firmaH = 30;
            const firmaY = yPos + 5;

            if (data.signatureInstrumentista) pdf.addImage(data.signatureInstrumentista, 'PNG', marginX, firmaY, firmaW, firmaH);
            pdf.setDrawColor(180).line(marginX, firmaY + firmaH + 2, marginX + firmaW, firmaY + firmaH + 2);
            pdf.setFontSize(8).text('INSTRUMENTISTA: ' + (data.instrumentistName || ''), marginX, firmaY + firmaH + 7);

            const xRight = marginX + firmaW + 20;
            if (data.signatureJefe) pdf.addImage(data.signatureJefe, 'PNG', xRight, firmaY, firmaW, firmaH);
            pdf.setDrawColor(180).line(xRight, firmaY + firmaH + 2, xRight + firmaW, firmaY + firmaH + 2);
            pdf.setFontSize(8).text('JEFE / SUPERVISOR', xRight, firmaY + firmaH + 7);
        }

        // --- GRÁFICAS (Adaptado a múltiples imágenes) ---
        if (chartImages?.length) {
            const chartTitles: { [key: string]: string[] } = {
                transmitter_mA: ['CURVA DE RESPUESTA DEL TRANSMISOR (mA)'],
                transmitter_ohm: ['RELACIÓN DE RESISTENCIA (Ohm)', 'SALIDA DE CORRIENTE (mA)'],
                transmitter_mv: ['ANÁLISIS mV / TX'],
                pressure_switch: ['CURVA DE CALIBRACIÓN Y LINEALIDAD'],
                thermostat: ['CURVA DE CALIBRACIÓN Y LINEALIDAD'],
                ph: ['VOLTAJE vs pH', 'ERROR BUFFER (%)', 'RANGO DE VIDA'],
            };
            const deviceKey = data.deviceType === 'transmitter' ? `transmitter_${unit}` : data.deviceType;
            const titles = chartTitles[deviceKey] || ['ANÁLISIS GRÁFICO'];

            chartImages.forEach((img, index) => {
                pdf.addPage();
                pdf.setFontSize(11).setFont('helvetica', 'bold').setTextColor(60)
                   .text(titles[index] ?? titles[titles.length - 1], pageW / 2, 15, { align: 'center' });
                // Ajuste de imagen para que no se deforme
                pdf.addImage(img, 'PNG', marginX, 25, contentW, pageH - 45);
            });
        }

        // --- PIE DE PÁGINA ---
        const pageCount = (pdf as any).internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            pdf.setPage(i);
            pdf.setFontSize(8).setTextColor(150);
            pdf.text(`Ingenio Risaralda - Generado el ${new Date().toLocaleDateString()}`, pageW / 2, pageH - 5, { align: 'center' });
            pdf.text(`Página ${i} de ${pageCount}`, pageW - marginX, pageH - 5, { align: 'right' });
        }

        pdf.save(`Reporte_${data.deviceCode || 'Instrumento'}.pdf`);
    } catch (e) {
        console.error('Error generando PDF:', e);
    }
};