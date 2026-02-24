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
    hasUeTransmitter: boolean; 
    outputUnit: 'mA' | 'Ω'; 
    transmitterMeasurements?: any[];
}

export const generatePDFReport = async (data: ReportData, chartImages?: string[]): Promise<void> => {
    const pdf = new jsPDF();
    const unit = data.outputUnit || 'mA';
    const hasUE = !!data.hasUeTransmitter;
    let yPos = 20;

    const colors = { risaraldaGreen: [119, 158, 79], lightGray: [245, 245, 245] };

    const addHeader = (title: string) => {
        if (yPos + 30 > 275) { pdf.addPage(); yPos = 20; }
        pdf.setDrawColor(...colors.risaraldaGreen).setLineWidth(0.8).line(20, yPos, 190, yPos);
        yPos += 10;
        pdf.setFontSize(12).setFont('helvetica', 'bold').setTextColor(0).text(title, 20, yPos);
        yPos += 10;
    };

    try {
        // Logo y Título
        try {
            const b64Logo = await getBase64ImageFromUrl(logo);
            pdf.addImage(b64Logo, 'PNG', 20, 15, 55, 22);
        } catch { console.warn("Logo fail"); }
        
        pdf.setFontSize(18).setFont('helvetica', 'bold').text('REPORTE DE INSTRUMENTACIÓN', 85, 28);
        yPos = 50;

        // Info General
        addHeader('INFORMACIÓN GENERAL');
        autoTable(pdf, {
            startY: yPos,
            margin: { left: 20 },
            body: [
                ['Instrumentista', data.instrumentistName],
                ['Orden de Trabajo', data.workOrder],
                ['Equipo', `${data.deviceName} [${data.deviceCode}]`],
                ['Rango', `${data.deviceRange} ${data.unity}`],
                ['Fecha', data.reviewDate ? new Date(data.reviewDate).toLocaleDateString() : 'N/A']
            ],
            styles: { fontSize: 10 },
            columnStyles: { 0: { fontStyle: 'bold', fillColor: colors.lightGray, cellWidth: 50 } }
        });
        yPos = (pdf as any).lastAutoTable.finalY + 15;

        // Tabla de Mediciones Dinámica (Basada en TransmitterTable)
        if (data.deviceType === 'transmitter' && data.transmitterMeasurements?.length) {
            addHeader(`PRUEBA DE SALIDA (${unit})`);

            // Construcción dinámica de cabeceras igual que en el componente React
            const headers = [
                'Ideal UE', 
                `Ideal ${unit}`, 
                'Patrón UE', 
                ...(hasUE ? ['UE Trans.'] : []), 
                `${unit} Trans.`, 
                '% Rango', 
                ...(hasUE ? ['Err UE'] : []), 
                `Err ${unit}`, 
                'Err %'
            ];

            // Mapeo de datos respetando las columnas activas
            const body = data.transmitterMeasurements.map(m => [
                m.idealUe, 
                m.idealMa, 
                m.patronUe,
                ...(hasUE ? [m.ueTransmitter] : []),
                m.maTransmitter, 
                m.percentage,
                ...(hasUE ? [m.errorUe] : []),
                m.errorMa, 
                m.errorPercentage
            ]);

            autoTable(pdf, {
                startY: yPos,
                head: [headers],
                body: body,
                headStyles: { fillColor: colors.risaraldaGreen, halign: 'center', fontSize: 8 },
                styles: { fontSize: 7.5, halign: 'center', cellPadding: 2 },
                // Estilo especial para columnas de error (Fondo rojo suave como en la web)
                didParseCell: (dataCell: any) => {
                    const errorHeaders = ['Err UE', `Err ${unit}`, 'Err %'];
                    if (dataCell.section === 'body' && errorHeaders.includes(headers[dataCell.column.index])) {
                        dataCell.cell.styles.fillColor = [254, 242, 242]; // Red-50
                        dataCell.cell.styles.textColor = [185, 28, 28];  // Red-700
                    }
                }
            });
            yPos = (pdf as any).lastAutoTable.finalY + 15;
        }

        // Gráficos
        if (chartImages?.length) {
            chartImages.forEach((img, i) => {
                const titles = ['Curva de Respuesta', 'Errores Absolutos', 'Linealidad', 'Error Porcentual'];
                addHeader(`ANÁLISIS: ${titles[i] || 'Gráfico'}`);
                pdf.addImage(img, 'PNG', 25, yPos, 160, 75);
                yPos += 85;
            });
        }

        // Observaciones
        if (data.observations) {
            addHeader('OBSERVACIONES');
            const splitText = pdf.splitTextToSize(data.observations, 165);
            pdf.setFontSize(10).setFont('helvetica', 'normal').text(splitText, 20, yPos);
        }

        pdf.save(`Reporte_${data.workOrder || 'Instrumentacion'}.pdf`);
    } catch (e) { 
        console.error("PDF Error:", e); 
    }
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