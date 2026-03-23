import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { toPng } from 'html-to-image';
import { useRef, useImperativeHandle, forwardRef } from 'react';

export interface RTDMeasurement {
    percentage: string;
    idealUE?: string;
    patronUE?: string;
    ueTransmitter?: string;
    idealmA?: string;
    maTransmitter?: string;
    idealohm?: string;
    ohmTransmitter?: string;
    errorUE?: string;
    errormA?: string;
    errorOhm?: string;
    errorPercentage?: string;
}

interface RTDChartProps {
    measurements?: RTDMeasurement[];
    hasUeTransmitter?: boolean;
}

// ── Cajita SVG optimizada para comparativa ────────────────────────────────────
const makeDot = (color: string, label: string, offset: number) =>
    (props: any) => {
        const { cx, cy, value } = props;
        if (value === null || value === undefined || cx === undefined || cy === undefined) return <g />;

        const text  = `${label}: ${Number(value).toFixed(2)}`;
        const fSize = 10;
        const padX  = 6;
        const padY  = 3;
        const charW = fSize * 0.55;
        const boxW  = text.length * charW + padX * 2;
        const boxH  = fSize + padY * 2;

        const above  = offset < 0;
        const boxY   = above ? cy + offset - boxH : cy + offset;
        const tipY   = above ? boxY + boxH : boxY;
        const tipDir = above ? 1 : -1;
        const boxX   = cx - boxW / 2;
        const lineY1 = above ? cy - 4 : cy + 4;

        return (
            <g>
                <circle cx={cx} cy={cy} r={3.5} fill={color} stroke="#fff" strokeWidth={1.5} />
                <line x1={cx} y1={lineY1} x2={cx} y2={tipY}
                    stroke={color} strokeWidth={1} strokeDasharray="2 2" opacity={0.5} />
                <rect x={boxX} y={boxY} width={boxW} height={boxH}
                    rx={3} ry={3} fill="white" stroke={color} strokeWidth={1}
                    style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))' }} />
                <text x={cx} y={boxY + padY + fSize - 1}
                    textAnchor="middle" fontSize={fSize} fontWeight={600}
                    fill={color} fontFamily="Inter, system-ui, sans-serif">
                    {text}
                </text>
            </g>
        );
    };

// Offsets para que no choquen las etiquetas de comparativa
const OFF = { PATRON: -55, MEDIDO: 15 };

const RTDChart = forwardRef<any, RTDChartProps>(({
    measurements = [],
    hasUeTransmitter = true
}, ref) => {
    const chart1Ref = useRef<HTMLDivElement>(null);
    const chart2Ref = useRef<HTMLDivElement>(null);

    // ── Proceso de Datos: Eje X = Temperatura Ideal ───────────────────────────
    const processedData = measurements.map((m) => ({
        percentage:    parseFloat(m.percentage) || 0,
        temperatura:   m.idealUE ? parseFloat(m.idealUE) : 0,
        idealOhm:      m.idealohm ? parseFloat(m.idealohm) : null,
        sensorOhm:     m.ohmTransmitter ? parseFloat(m.ohmTransmitter) : null,
        idealUE:       m.idealUE ? parseFloat(m.idealUE) : null,
        ueTransmitter: m.ueTransmitter ? parseFloat(m.ueTransmitter) : null,
        idealmA:       m.idealmA ? parseFloat(m.idealmA) : null,
        maTransmitter: m.maTransmitter ? parseFloat(m.maTransmitter) : null,
    })).sort((a, b) => a.temperatura - b.temperatura);

    useImperativeHandle(ref, () => ({
        captureAllCharts: async () => {
            const images: string[] = [];
            for (const r of [chart1Ref, chart2Ref]) {
                if (r.current) {
                    const url = await toPng(r.current, { backgroundColor: '#ffffff', pixelRatio: 2, cacheBust: true });
                    images.push(url);
                }
            }
            return images;
        }
    }));

    const noData = <div className="text-center py-12 text-gray-400"><p>No hay datos suficientes para generar la grafica.</p></div>;

    return (
        <div className="space-y-8">
            {/* CHART 1: RESISTENCIA (Ohm) - Lo que entra vs Lo que lee el sensor */}
            <div className="shadow-lg rounded-xl overflow-hidden border border-gray-200 bg-white" ref={chart1Ref}>
                <div className="bg-gradient-to-r from-teal-600 to-emerald-600 px-6 py-4 text-white">
                    <h3 className="text-lg font-bold">Respuesta Electrica: Ohm Ideal vs Medido</h3>
                    <p className="text-teal-100 text-xs opacity-90">Comprobacion de la precision del sensor RTD</p>
                </div>
                <div className="p-6">
                    {processedData.length === 0 ? noData : (
                        <div className="h-[500px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={processedData} margin={{ top: 60, right: 30, left: 10, bottom: 40 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                    <XAxis dataKey="temperatura" tick={{fontSize: 11}} label={{ value: 'Temperatura (UE)', position: 'bottom', offset: 20 }} />
                                    <YAxis tick={{fontSize: 11}} label={{ value: 'Resistencia (Ohm)', angle: -90, position: 'insideLeft' }} />
                                    <Tooltip />
                                    <Legend verticalAlign="top" align="right" />
                                    
                                    <Line type="monotone" dataKey="idealOhm" name="Patron (Ideal)" stroke="#10b981" strokeWidth={3} 
                                        dot={makeDot('#10b981', 'Patron', OFF.PATRON)} isAnimationActive={false} />
                                    
                                    <Line type="monotone" dataKey="sensorOhm" name="Medido (Sensor)" stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 5"
                                        dot={makeDot('#f59e0b', 'Sensor', OFF.MEDIDO)} isAnimationActive={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>
            </div>

            {/* CHART 2: TRANSMISION (mA) - Lo que deberia dar vs Lo que entrega el TX */}
            <div className="shadow-lg rounded-xl overflow-hidden border border-gray-200 bg-white" ref={chart2Ref}>
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 text-white">
                    <h3 className="text-lg font-bold">Curva de Salida: mA Ideal vs Transmitido</h3>
                    <p className="text-blue-100 text-xs opacity-90">Evaluacion del error de conversion del transmisor (4-20mA)</p>
                </div>
                <div className="p-6">
                    {processedData.length === 0 ? noData : (
                        <div className="h-[500px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={processedData} margin={{ top: 60, right: 30, left: 10, bottom: 40 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                    <XAxis dataKey="temperatura" tick={{fontSize: 11}} label={{ value: 'Temperatura (UE)', position: 'bottom', offset: 20 }} />
                                    <YAxis domain={[4, 20]} ticks={[4, 8, 12, 16, 20]} tick={{fontSize: 11}} />
                                    <Tooltip />
                                    <Legend verticalAlign="top" align="right" />

                                    <Line type="monotone" dataKey="idealmA" name="Salida Esperada" stroke="#3b82f6" strokeWidth={3}
                                        dot={makeDot('#3b82f6', 'Ideal', OFF.PATRON)} isAnimationActive={false} />

                                    <Line type="monotone" dataKey="maTransmitter" name="Salida Real TX" stroke="#ef4444" strokeWidth={2} strokeDasharray="5 5"
                                        dot={makeDot('#ef4444', 'Real', OFF.MEDIDO)} isAnimationActive={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
});

export default RTDChart;