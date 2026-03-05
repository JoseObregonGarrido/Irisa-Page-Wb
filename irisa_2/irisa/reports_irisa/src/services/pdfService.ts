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
    // Usamos orientación horizontal para que las gráficas quepan bien
    const pdf = new jsPDF({ orientation: 'landscape' });
    const pageW = pdf.internal.pageSize.getWidth();   // 297mm
    const pageH = pdf.internal.pageSize.getHeight();  // 210mm
    const marginX = 15;
    const contentW = pageW - marginX * 2;

    const measurements = data.transmitterMeasurements || [];
    const unit = data.outputUnit || 'mA';
    const hasUE = data.hasUeTransmitter ?? false;
    
    const isOhm = unit === 'ohm';
    const isMv  = unit === 'mv';

    let yPos = 20;

    const colors: { [key: string]: [number, number, number] } = { 
        risaraldaGreen:     [20, 110, 90], 
        orangeThermocouple: [230, 126, 34],
        purpleTX:           [109, 40, 217],
        lightGray:          [245, 245, 245],
        white:              [252, 252, 252]
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
        } catch { console.warn("Logo no cargado"); }
        
        pdf.setFontSize(16).setFont('helvetica', 'bold').setTextColor(0)
           .text('REPORTE DE CALIBRACIÓN', pageW / 2, 25, { align: 'center' });
        yPos = 45;

        // --- ESPECIFICACIONES ---
        addHeader('Especificaciones del instrumento');
        autoTable(pdf, {
            startY: yPos,
            margin: { left: marginX, right: marginX },
            body: [
                ['Nombre del equipo',      data.deviceName,       'Código del equipo',      data.deviceCode],
                ['Marca del equipo',       data.deviceBrand,      'Modelo del equipo',       data.deviceModel],
                ['Serial del instrumento', data.deviceSerial,     'Rango del instrumento',   `${data.deviceRange} ${data.unity}`],
                ['Área del instrumento',   data.instrumentArea,   'Tipo de dispositivo',     capitalize(data.deviceType)],
                ['Nombre instrumentista',  data.instrumentistName,'Código instrumentista',   data.instrumentistCode],
                ['Orden de trabajo',       data.workOrder,        'Fecha de revisión',       data.reviewDate || 'N/a']
            ],
            theme: 'plain',
            styles: { fontSize: 8.5, cellPadding: 3, textColor: 50 },
            columnStyles: { 
                0: { fontStyle: 'bold', fillColor: colors.lightGray, cellWidth: 45 },
                2: { fontStyle: 'bold', fillColor: colors.lightGray, cellWidth: 45 }
            }
        });
        yPos = (pdf as any).lastAutoTable.finalY + 12;

        // --- TABLA TRANSMISORES ---
        if (data.deviceType === 'transmitter' && measurements.length) {

            if (isMv) {
                // Separar filas por rowType
                const mvRows = measurements.filter(m => !m.rowType || m.rowType === 'mv');
                const txRows = measurements.filter(m => m.rowType === 'tx');

                // Tabla mV
                if (mvRows.length > 0) {
                    addHeader('Resultados de las mediciones - Termopar (mV)');
                    autoTable(pdf, {
                        startY: yPos,
                        margin: { left: marginX, right: marginX },
                        head: [['mV Ideal', 'mV Sensor', 'Tipo Sensor', 'Error mV']],
                        body: mvRows.map(m => [
                            m.idealmV     || '0',
                            m.sensormV    || '0',
                            m.sensorType  || 'N/A',
                            m.errormV     || '0'
                        ]),
                        theme: 'grid',
                        headStyles: { fillColor: colors.orangeThermocouple, halign: 'center', fontSize: 8, fontStyle: 'bold' },
                        styles: { fontSize: 8, halign: 'center', cellPadding: 2.5 }
                    });
                    yPos = (pdf as any).lastAutoTable.finalY + 12;
                }

                // Tabla TX
                if (txRows.length > 0) {
                    addHeader('Resultados de las mediciones - Transmisor (TX)');
                    autoTable(pdf, {
                        startY: yPos,
                        margin: { left: marginX, right: marginX },
                        head: [['Ideal mA', 'mA TX', 'Tipo Sensor', 'Err mA']],
                        body: txRows.map(m => [
                            m.idealmA    || '0',
                            m.mATX       || '0',
                            m.sensorType || 'N/A',
                            m.errormA    || '0'
                        ]),
                        theme: 'grid',
                        headStyles: { fillColor: colors.purpleTX, halign: 'center', fontSize: 8, fontStyle: 'bold' },
                        styles: { fontSize: 8, halign: 'center', cellPadding: 2.5 }
                    });
                    yPos = (pdf as any).lastAutoTable.finalY + 12;
                }

            } else {
                // Tabla mA / ohm (sin cambios)
                const reportTypeLabel = isOhm ? 'RTD' : 'mA';
                addHeader(`Resultados de las mediciones - ${reportTypeLabel}`);

                const headers: string[] = ['Ideal UE', 'Ideal mA'];
                if (isOhm) headers.push('Ideal Ohm');
                headers.push('Patrón UE');
                if (hasUE) headers.push('UE Trans.');
                headers.push(isOhm ? 'mA Sens.' : 'mA Trans.');
                if (isOhm) headers.push('Ohm Sens.');
                if (hasUE) headers.push('Err UE');
                headers.push('Err mA');
                headers.push('Err %');

                const body = measurements.map(m => {
                    const row: any[] = [m.idealUE || m.idealUe, m.idealmA];
                    if (isOhm) row.push(m.idealohm || m.idealOhm || '0');
                    row.push(m.patronUE || m.patronUe);
                    if (hasUE) row.push(m.ueTransmitter);
                    row.push(m.maTransmitter);
                    if (isOhm) row.push(m.ohmTransmitter || '0');
                    if (hasUE) row.push(m.errorUE || '0.000');
                    row.push(m.errormA || '0.000');
                    row.push(m.errorPercentage || '0.00');
                    return row;
                });

                autoTable(pdf, {
                    startY: yPos,
                    margin: { left: marginX, right: marginX },
                    head: [headers],
                    body,
                    theme: 'grid',
                    headStyles: { fillColor: colors.risaraldaGreen, halign: 'center', fontSize: 8, fontStyle: 'bold' },
                    styles: { fontSize: 8, halign: 'center', cellPadding: 2.5 }
                });
                yPos = (pdf as any).lastAutoTable.finalY + 12;
            }
        }

        // --- PRESOSTATO / TERMOSTATO ---
        const isThermostat = data.deviceType === 'thermostat';
        const switchTests = isThermostat ? data.thermostatTests : data.pressureSwitchTests;
        
        if ((data.deviceType === 'pressure_switch' || isThermostat) && switchTests && switchTests.length) {
            addHeader(isThermostat ? 'RESULTADOS TERMOSTATO' : 'RESULTADOS PRESOSTATO');
            const unitLabel = data.unity || (isThermostat ? '°C' : 'psi');
            
            const headers = [
                isThermostat ? `Temp. disparo (${unitLabel})` : `Presión disparo (${unitLabel})`,
                isThermostat ? `Temp. repone (${unitLabel})`  : `Presión repone (${unitLabel})`,
                'Estado contacto'
            ];

            autoTable(pdf, {
                startY: yPos,
                margin: { left: marginX, right: marginX },
                head: [headers],
                body: switchTests.map(t => [
                    isThermostat ? (t.temperaturadeDisparo || '0') : (t.presiondeDisparo || '0'),
                    isThermostat ? (t.temperaturadeRepone  || '0') : (t.presiondeRepone  || '0'),
                    getContactLabel(t)
                ]),
                theme: 'grid',
                headStyles: { fillColor: colors.risaraldaGreen, halign: 'center', fontSize: 8.5, fontStyle: 'bold' },
                styles: { fontSize: 8.5, halign: 'center', cellPadding: 3, textColor: 40 }
            });
            yPos = (pdf as any).lastAutoTable.finalY + 12;
        }

        // --- GRÁFICAS: página nueva, tamaño completo ---
        if (chartImages && chartImages.length > 0) {
            chartImages.forEach((img) => {
                pdf.addPage();
                yPos = 15;

                const chartTitle = data.deviceType === 'transmitter'
                    ? (unit === 'ohm' ? 'DESVIACIÓN DE OHM (RTD)'
                    : unit === 'mv'  ? 'ANÁLISIS mV / TX'
                    : 'CURVA DE RESPUESTA DEL TRANSMISOR')
                    : 'CURVA DE CALIBRACIÓN Y LINEALIDAD';

                pdf.setFontSize(11).setFont('helvetica', 'bold').setTextColor(60)
                   .text(chartTitle, pageW / 2, yPos, { align: 'center' });
                yPos += 8;

                // Imagen ocupa casi toda la página horizontal
                const imgH = pageH - yPos - 15;
                pdf.addImage(img, 'PNG', marginX, yPos, contentW, imgH);
            });
        }

        // --- OBSERVACIONES ---
        if (data.observations) {
            if (yPos + 40 > pageH - 15) { pdf.addPage(); yPos = 20; }
            addHeader('OBSERVACIONES Y NOTAS TÉCNICAS');
            autoTable(pdf, {
                startY: yPos,
                margin: { left: marginX, right: marginX },
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
            pdf.text(`Ingenio Risaralda - Generado el ${new Date().toLocaleDateString()}`, pageW / 2, pageH - 5, { align: 'center' });
            pdf.text(`Página ${i} de ${pageCount}`, pageW - marginX, pageH - 5, { align: 'right' });
        }

        pdf.save(`Reporte_${data.deviceCode || 'Instrumento'}.pdf`);
    } catch (e) { console.error("Error generando PDF:", e); }
};