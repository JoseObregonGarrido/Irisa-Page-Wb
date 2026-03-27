import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { toPng } from 'html-to-image';
import { useRef, useImperativeHandle, forwardRef } from 'react';

export interface MVMeasurement {
    rowType?: 'mv' | 'tx';
    percentage: string;
    idealUE?: string;
    idealmV?: string;
    sensormV?: string;
    errormV?: string;
    idealmA?: string;
    mATX?: string;
    errormA?: string;
    sensorType?: 'J' | 'K';
}

interface MVChartProps {
    measurements?: MVMeasurement[];
}

const makeDot = (color: string, label: string, offset: number) =>
    (props: any) => {
        const { cx, cy, value } = props;
        if (value === null || value === undefined || cx === undefined || cy === undefined) return <g />;

        const text  = `${label}: ${Number(value).toFixed(2)}`;
        const fSize = 10;
        const padX  = 7;
        const padY  = 4;
        const charW = fSize * 0.58;
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
                <circle cx={cx} cy={cy} r={4} fill={color} stroke="#fff" strokeWidth={2} />
                <line x1={cx} y1={lineY1} x2={cx} y2={tipY}
                    stroke={color} strokeWidth={1} strokeDasharray="3 2" opacity={0.6} />
                <rect x={boxX} y={boxY} width={boxW} height={boxH}
                    rx={4} ry={4} fill="white" stroke={color} strokeWidth={1.5}
                    style={{ filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.15))' }} />
                <polygon
                    points={`${cx - 4},${tipY} ${cx + 4},${tipY} ${cx},${tipY + tipDir * 5}`}
                    fill={color} />
                <text x={cx} y={boxY + padY + fSize - 1}
                    textAnchor="middle" fontSize={fSize} fontWeight={600}
                    fill={color} fontFamily="system-ui, sans-serif">
                    {text}
                </text>
            </g>
        );
    };

const OFF = { L1: -80, L3: 22 };

const MVChart = forwardRef<any, MVChartProps>(({ measurements = [] }, ref) => {
    const chart1Ref = useRef<HTMLDivElement>(null); 
    const chart2Ref = useRef<HTMLDivElement>(null); 

    // 1. Filtrar y procesar datos de mV (Termopar)
    const mvData = measurements
        .filter(m => (!m.rowType || m.rowType === 'mv') && (m.idealmV || m.sensormV))
        .map((m, i) => ({
            // Si hay idealUE (temperatura), la usamos como eje numerico
            ejeX: m.idealUE ? parseFloat(m.idealUE) : i + 1,
            labelX: m.idealUE ? `${m.idealUE} UE` : `M${i+1}`,
            idealMV: m.idealmV ? parseFloat(m.idealmV) : null,
            sensorMV: m.sensormV ? parseFloat(m.sensormV) : null,
        }))
        .filter(d => !isNaN(d.ejeX))
        .sort((a, b) => a.ejeX - b.ejeX);

    // 2. Filtrar y procesar datos de TX (4-20mA)
    const txData = measurements
        .filter(m => m.rowType === 'tx' && (m.idealmA || m.mATX))
        .map(m => ({
            ejeX: m.idealmA ? parseFloat(m.idealmA) : null,
            idealMA: m.idealmA ? parseFloat(m.idealmA) : null,
            maTX: m.mATX ? parseFloat(m.mATX) : null,
        }))
        .filter(d => d.ejeX !== null && !isNaN(d.ejeX))
        .sort((a, b) => (a.ejeX || 0) - (b.ejeX || 0));

    useImperativeHandle(ref, () => ({
        captureAllCharts: async () => {
            const images: string[] = [];
            for (const r of [chart1Ref, chart2Ref]) {
                if (r.current && r.current.offsetHeight > 50) {
                    const url = await toPng(r.current, { backgroundColor: '#ffffff', pixelRatio: 2, cacheBust: true });
                    images.push(url);
                }
            }
            return images;
        }
    }));

    const tooltipStyle = { borderRadius: '8px', fontSize: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' };

    return (
        <div className="space-y-6">
            {/* GRAFICO 1: MILIVOLTIOS */}
            {mvData.length > 0 && (
                <div ref={chart1Ref} className="shadow-lg rounded-xl overflow-hidden border border-gray-200 bg-white">
                    <div className="bg-gradient-to-r from-orange-600 to-red-600 px-6 py-5 text-white">
                        <h3 className="text-xl font-bold">Desviacion de mV (Termopar)</h3>
                        <p className="text-orange-100 text-sm opacity-90">Comportamiento del sensor vs Tabla de referencia</p>
                    </div>
                    <div className="p-6">
                        <div className="h-[600px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={mvData} margin={{ top: 80, right: 40, left: 10, bottom: 40 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                    <XAxis 
                                        dataKey="ejeX" 
                                        type="number" 
                                        domain={['dataMin', 'dataMax']}
                                        tick={{fontSize: 11}} 
                                        label={{ value: 'Punto de Prueba (Temp / Posicion)', position: 'bottom', offset: 20 }} 
                                    />
                                    <YAxis 
                                        domain={['auto', 'auto']} 
                                        tick={{fontSize: 11}} 
                                        label={{ value: 'Voltaje (mV)', angle: -90, position: 'insideLeft' }} 
                                    />
                                    <Tooltip contentStyle={tooltipStyle} />
                                    <Legend verticalAlign="top" align="right" height={40}/>
                                    <Line type="monotone" dataKey="idealMV" name="Referencia (Ideal)" stroke="#8b5cf6" strokeWidth={3} 
                                        dot={makeDot('#8b5cf6', 'Ideal', OFF.L1)} isAnimationActive={false} connectNulls />
                                    <Line type="monotone" dataKey="sensorMV" name="Medido (Sensor)" stroke="#ec4899" strokeWidth={2} strokeDasharray="5 5"
                                        dot={makeDot('#ec4899', 'Real', OFF.L3)} isAnimationActive={false} connectNulls />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            )}

            {/* GRAFICO 2: TRANSMISOR (mA) */}
            {txData.length > 0 && (
                <div ref={chart2Ref} className="shadow-lg rounded-xl overflow-hidden border border-gray-200 bg-white">
                    <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-5 text-white">
                        <h3 className="text-xl font-bold">Salida del Transmisor (4-20mA)</h3>
                        <p className="text-purple-100 text-sm opacity-90">Precision de la conversion mV a mA</p>
                    </div>
                    <div className="p-6">
                        <div className="h-[600px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={txData} margin={{ top: 80, right: 40, left: 10, bottom: 40 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                    <XAxis 
                                        dataKey="ejeX" 
                                        type="number"
                                        domain={['dataMin', 'dataMax']}
                                        tick={{fontSize: 11}} 
                                        label={{ value: 'Entrada Ideal (mA)', position: 'bottom', offset: 20 }} 
                                    />
                                    <YAxis 
                                        domain={[3.8, 20.2]} 
                                        ticks={[4, 8, 12, 16, 20]}
                                        tick={{fontSize: 11}} 
                                        label={{ value: 'Salida Real (mA)', angle: -90, position: 'insideLeft' }} 
                                    />
                                    <Tooltip contentStyle={tooltipStyle} />
                                    <Legend verticalAlign="top" align="right" height={40} />
                                    <Line type="monotone" dataKey="idealMA" name="Ideal mA" stroke="#3b82f6" strokeWidth={3}
                                        dot={makeDot('#3b82f6', 'Referencia', OFF.L1)} isAnimationActive={false} connectNulls />
                                    <Line type="monotone" dataKey="maTX" name="Real TX" stroke="#ef4444" strokeWidth={2} strokeDasharray="5 5"
                                        dot={makeDot('#ef4444', 'Transmitido', OFF.L3)} isAnimationActive={false} connectNulls />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
});

export default MVChart;