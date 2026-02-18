// services/pdfService.ts
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import 'jspdf-autotable';
import { toPng } from 'html-to-image';
import logo from '../assets/logo_slogan_2.png';

// Extender tipos de jsPDF para autoTable
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
  transmitterMeasurements?: Array<{
    percentage: string;
    idealUe: string;
    patronUe: string;
    ueTransmitter: string;
    idealMa: string;
    maTransmitter: string;
    errorUe: string;
    errorMa: string;
    errorPercentage: string;
  }>;
  pressureSwitchTests?: Array<{
    typeTest: string;
    appliedPressure: string;
    realPressureChange: string;
    stateContact: string;
    meetsSpecification: boolean;
  }>;
  thermostatTests?: Array<{
    typeTest: string;
    appliedTemperature: string;
    realTemperatureChange: string;
    stateContact: string;
    meetsSpecification: boolean;
  }>;
}

export const generatePDFReport = async (
  data: ReportData,
  chartElements?: (HTMLElement | null)[] // Ahora recibe un arreglo para las 3 graficas
): Promise<void> => {
  const pdf = new jsPDF();
  let yPosition = 20;

  // Logo del ingenio
  try {
    const logoBase64 = await getBase64ImageFromUrl(logo);
    const logoWidth = 60;
    const logoHeight = 25;
    const logoX = 20;
    const logoY = 15;
    pdf.addImage(logoBase64, 'PNG', logoX, logoY, logoWidth, logoHeight, '', 'SLOW');
    yPosition = logoY + logoHeight + 10;
  } catch (e) {
    console.warn("No se pudo cargar el logo", e);
    yPosition = 20;
  }

  // Paleta de colores corporativa
  const colors = {
    black: [0, 0, 0],
    darkGray: [51, 51, 51],
    mediumGray: [128, 128, 128],
    lightGray: [245, 245, 245],
    white: [255, 255, 255],
    risaraldaGreen: [119, 158