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

const V0 = 174;
const T0 = 30;

const calcRangoVida = (v: number): number =>
    Math.max(0, Math.min(T0, T0 - (v - V0)));

const getEstadoPH = (t: number): 'OK' | 'Verificar' | 'Agotado' => {
    if (t >= 20) return 'OK';
    if (t >= 10) return 'Verificar';
    return 'Agotado';
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

const deviceTypeMap: { [key: string]: string } = {
    'transmitter': 'TRANSMISOR',
    'pressure_switch': 'PRESOSTATO',
    'thermostat': 'TERMOSTATO',
    'ph': 'pH'
};

export const generatePDFReport = async (data: ReportData, chartImages?: string[]): Promise<void> => {
    const pdf = new jsPDF({ orientation: 'landscape' });
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();
    const marginX = 15;
    const contentW = pageW - marginX * 2;

    const measurements = data.transmitterMeasurements || [];
    const unit  = data.outputUnit || 'mA';
    const hasUE = data.hasUeTransmitter ?? false;
    const isOhm = unit === 'ohm';
    const isMv  = unit === 'mv';

    let yPos = 20;

    const colors: { [key: string]: [number, number, number] } = {
        risaraldaGreen:     [20, 110, 90],
        orangeThermocouple: [230, 126, 34],
        purpleTX:           [109, 40, 217],
        tealPH:             [13, 148, 136],
        lightGray:          [245, 245, 245],
        white:              [252, 252, 252],
        green:              [21, 128, 61],
        orange:             [180, 90, 0],
        red:                [200, 30, 30],
    };

    const addHeader = (title: string, customY?: number) => {
        const targetY = customY || yPos;
        if (targetY + 40 > pageH - 15) { pdf.addPage(); yPos = 20; }
        else { yPos = targetY; }
        
        pdf.setDrawColor(119, 158, 79).setLineWidth(0.8).line(marginX, yPos, pageW - marginX, yPos);
        yPos += 10;
        pdf.setFontSize(11).setFont('helvetica', 'bold').setTextColor(60).text(title.toUpperCase(), marginX, yPos);
        yPos += 8;
    };

    try {
        // Logo y Titulo Principal
        try {
            const b64Logo = await getBase64ImageFromUrl(logo);
            pdf.addImage(b64Logo, 'PNG', marginX, 12, 50, 20);
        } catch { console.warn('Logo no cargado'); }

        pdf.setFontSize(16).setFont('helvetica', 'bold').setTextColor(0)
           .text('REPORTE DE CALIBRACIÓN', pageW / 2, 25, { align: 'center' });
        yPos = 45;

        // Secciones de datos (Especificaciones, Mediciones, Observaciones)
        addHeader('Especificaciones del instrumento');
        const deviceTypeSpanish = deviceTypeMap[data.deviceType] || data.deviceType;

        autoTable(pdf, {
            startY: yPos,
            margin: { left: marginX, right: marginX },
            body: [
                ['Nombre del equipo',      data.deviceName,        'Código del equipo',    data.deviceCode],
                ['Marca del equipo',       data.deviceBrand,       'Modelo del equipo',    data.deviceModel],
                ['Serial del instrumento', data.deviceSerial,      'Rango del instrumento',`${data.deviceRange} ${data.unity}`],
                ['Área del instrumento',   data.instrumentArea,    'Tipo de dispositivo',  deviceTypeSpanish],
                ['Nombre instrumentista',  data.instrumentistName, 'Código instrumentista',data.instrumentistCode],
                ['Orden de trabajo',       data.workOrder,         'Fecha de revisión',    data.reviewDate || 'N/a'],
            ],
            theme: 'plain',
            styles: { fontSize: 8.5, cellPadding: 3, textColor: 50 },
            columnStyles: {
                0: { fontStyle: 'bold', fillColor: colors.lightGray, cellWidth: 45 },
                2: { fontStyle: 'bold', fillColor: colors.lightGray, cellWidth: 45 },
            },
        });
        yPos = (pdf as any).lastAutoTable.finalY + 12;

        // Renderizado de tablas segun tipo de equipo...
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
                const headers = ['Ideal UE', 'Ideal mA', isOhm ? 'Ideal Ohm' : null, 'Patrón UE', hasUE ? 'UE Trans.' : null, isOhm ? 'mA Sens.' : 'mA Trans.', isOhm ? 'Ohm Sens.' : null, hasUE ? 'Err UE' : null, 'Err mA', 'Err %', isOhm ? 'Err Ohm' : null].filter(Boolean) as string[];
                const body = measurements.map(m => {
                    const row = [m.idealUE || m.idealUe, m.idealmA];
                    if (isOhm) row.push(m.idealohm || m.idealOhm || '0');
                    row.push(m.patronUE || m.patronUe);
                    if (hasUE) row.push(m.ueTransmitter);
                    row.push(m.maTransmitter);
                    if (isOhm) row.push(m.ohmTransmitter || '0');
                    if (hasUE) row.push(m.errorUE || '0.000');
                    row.push(m.errormA || '0.000', m.errorPercentage || '0.00');
                    if (isOhm) row.push(m.errorOhm || '0.000');
                    return row;
                });
                autoTable(pdf, {
                    startY: yPos, margin: { left: marginX, right: marginX },
                    head: [headers], body, theme: 'grid',
                    headStyles: { fillColor: colors.risaraldaGreen, halign: 'center', fontSize: 8, fontStyle: 'bold' },
                    styles: { fontSize: 8, halign: 'center', cellPadding: 2.5 },
                });
                yPos = (pdf as any).lastAutoTable.finalY + 12;
            }
        }

        // Seccion de Switch/Termostato/pH...
        const isThermostat = data.deviceType === 'thermostat';
        const switchTests = isThermostat ? data.thermostatTests : data.pressureSwitchTests;
        if ((data.deviceType === 'pressure_switch' || isThermostat) && switchTests?.length) {
            addHeader(isThermostat ? 'RESULTADOS TERMOSTATO' : 'RESULTADOS PRESOSTATO');
            autoTable(pdf, {
                startY: yPos, margin: { left: marginX, right: marginX },
                head: [[isThermostat ? 'Temp. disparo' : 'Presión disparo', isThermostat ? 'Temp. repone' : 'Presión repone', 'Estado contacto']],
                body: switchTests.map(t => [isThermostat ? t.temperaturadeDisparo : t.presiondeDisparo, isThermostat ? t.temperaturadeRepone : t.presiondeRepone, getContactLabel(t)]),
                theme: 'grid',
                headStyles: { fillColor: colors.risaraldaGreen, halign: 'center', fontSize: 8.5, fontStyle: 'bold' },
                styles: { fontSize: 8.5, halign: 'center', cellPadding: 3 },
            });
            yPos = (pdf as any).lastAutoTable.finalY + 12;
        }

        if (data.deviceType === 'ph' && data.phTests?.length) {
            addHeader('RESULTADOS MEDICIONES DE pH');
            autoTable(pdf, {
                startY: yPos, margin: { left: marginX, right: marginX },
                head: [['Patrón Buffer', 'Promedio pH', 'Voltaje (mV)', 'Rango Vida (mV)', 'Estado Electrodo', 'Error %']],
                body: data.phTests.map(t => [t.patron, t.promedio, t.voltaje, calcRangoVida(parseFloat(t.voltaje)).toFixed(2), getEstadoPH(calcRangoVida(parseFloat(t.voltaje))), `${t.error}%`]),
                theme: 'grid',
                headStyles: { fillColor: colors.tealPH, halign: 'center', fontSize: 8, fontStyle: 'bold' },
                styles: { fontSize: 8, halign: 'center', cellPadding: 2.5 },
            });
            yPos = (pdf as any).lastAutoTable.finalY + 12;
        }

        if (data.observations) {
            addHeader('OBSERVACIONES Y NOTAS TÉCNICAS');
            autoTable(pdf, {
                startY: yPos, margin: { left: marginX, right: marginX },
                body: [[data.observations]],
                styles: { fontSize: 9, cellPadding: 5, fillColor: colors.white, textColor: 60 },
                theme: 'plain',
            });
            yPos = (pdf as any).lastAutoTable.finalY + 12;
        }

        // --- 1. GRÁFICAS (Siguiente página si existen) ---
        if (chartImages?.length) {
            chartImages.forEach((img) => {
                pdf.addPage();
                pdf.setFontSize(11).setFont('helvetica', 'bold').setTextColor(60)
                   .text('ANÁLISIS GRÁFICO', pageW / 2, 15, { align: 'center' });
                pdf.addImage(img, 'PNG', marginX, 25, contentW, pageH - 60);
                yPos = pageH - 30; // Posicionamos yPos al final de la gráfica
            });
        }

        // --- 2. FIRMAS (Garantizado que sea lo último) ---
        if (data.signatureInstrumentista || data.signatureJefe) {
            // Si después de las gráficas o tablas no hay espacio (80 unidades), saltamos de página
            if (yPos + 80 > pageH - 20) {
                pdf.addPage();
                yPos = 20;
            } else {
                yPos += 15;
            }

            addHeader('FIRMAS DE CONFORMIDAD', yPos);
            
            const firmaW = 60; 
            const firmaH = 25;
            const firmaY = yPos + 5;

            // Instrumentista
            if (data.signatureInstrumentista) {
                pdf.addImage(data.signatureInstrumentista, 'PNG', marginX + 10, firmaY, firmaW, firmaH);
            }
            pdf.setDrawColor(180).setLineWidth(0.5).line(marginX, firmaY + firmaH + 2, marginX + 80, firmaY + firmaH + 2);
            pdf.setFontSize(8).setFont('helvetica', 'bold').setTextColor(80).text('INSTRUMENTISTA', marginX + 40, firmaY + firmaH + 7, { align: 'center' });
            pdf.setFontSize(7).setFont('helvetica', 'normal').text(data.instrumentistName || '', marginX + 40, firmaY + firmaH + 11, { align: 'center' });
        }

        // Numeración de páginas
        const pageCount = (pdf as any).internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            pdf.setPage(i);
            pdf.setFontSize(8).setTextColor(150);
            pdf.text(`Ingenio Risaralda - Generado el ${new Date().toLocaleDateString()}`, pageW / 2, pageH - 5, { align: 'center' });
            pdf.text(`Página ${i} de ${pageCount}`, pageW - marginX, pageH - 5, { align: 'right' });
        }

        pdf.save(`Reporte_${data.deviceType || 'Instrumento'}.pdf`);
    } catch (e) {
        console.error('Error generando PDF:', e);
    }
};