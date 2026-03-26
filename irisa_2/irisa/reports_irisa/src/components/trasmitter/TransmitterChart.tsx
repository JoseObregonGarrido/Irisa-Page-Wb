import React, { useMemo, useRef, useImperativeHandle, forwardRef } from 'react';
import { 
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
    ResponsiveContainer, ReferenceLine, ReferenceArea, Label 
} from 'recharts';
import { toPng } from 'html-to-image';

// --- INTERFACES ---
export interface Measurement {
    percentage: string;
    idealUE?: string;
    idealUe?: string;
    ueTransmitter: string; // Este seria el UE T
    idealmA?: string;
    idealMa?: string;
    maTransmitter: string; // Este es el mA Tr.
    idealmV?: string;      // Soporte para valor patron en mV si aplica
    maPatron?: string;     // mA Pat.
    patronUE?: string;     // Patron UE
}

interface TransmitterChartProps {
    measurements?: Measurement[];
    data?: Measurement[];
}

// --- HELPER: TOOLTIP PERSONALIZADO (PUNTOS) ---
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

        const above   = offset < 0;
        const boxY    = above ? cy + offset - boxH : cy + offset;
        const tipY    = above ? boxY + boxH : boxY;
        const tipDir  = above ? 1 : -1;
        const boxX    = cx - boxW / 2;

        return (
            <g key={`dot-${label}-${cx}`}>
                <circle cx={cx} cy={cy} r={4} fill={color} stroke="#fff" strokeWidth={2} />
                <line x1={cx} y1={above ? cy - 4 : cy + 4} x2={cx} y2={tipY}
                    stroke={color} strokeWidth={1} strokeDasharray="3 2" opacity={0.6} />
                <rect x={boxX} y={boxY} width={boxW} height={boxH} rx={4} ry={4}
                    fill="white" stroke={color} strokeWidth={1.5}
                    style={{ filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.15))' }} />
                <polygon points={`${cx - 4},${tipY} ${cx + 4},${tipY} ${cx},${tipY + tipDir * 5}`} fill={color} />
                <text x={cx} y={boxY + padY + fSize - 1} textAnchor="middle" fontSize={fSize} fontWeight={600} fill={color} fontFamily="system-ui, sans-serif">
                    {text}
                </text>
            </g>
        );
    };

// --- COMPONENTE PRINCIPAL ---
const TransmitterChart = forwardRef<any, TransmitterChartProps>(({ measurements, data }, ref) => {
    const chartData = measurements || data || [];
    const containerRef = useRef<HTMLDivElement>(null);

    // --- LOGICA DE PROCESAMIENTO E INGENIERIA ---
    const { processedData, metrics } = useMemo(() => {
        const sorted = chartData.map((m: any) => {
            const maPat = parseFloat(m.maPatron || m.idealmA || m.idealMa || '0');
            const patUE = parseFloat(m.patronUE || m.idealUE || m.idealUe || m.idealmV || '0');
            const maTr = parseFloat(m.maTransmitter || '0');
            const ueT = parseFloat(m.ueTransmitter || '0');

            return {
                xEU: patUE,        // Eje X: Patron UE
                yPatron: maPat,    // Linea 1: mA Pat.
                yTransmitter: maTr,// Linea 2: mA Tr.
                ueT: ueT           // Dato extra para el tooltip
            };
        }).sort((a, b) => a.xEU - b.xEU);

        if (sorted.length === 0) return { processedData: [], metrics: { zeroErr: 0, spanErr: 0, eMax: 0, xMax: 0 } };

        // Calculos de error basados en los 4-20mA ideales
        const zeroErr = sorted[0].yTransmitter - 4;
        const spanErr = sorted[sorted.length - 1].yTransmitter - 20;

        let eMax = 0;
        let xMax = 0;
        sorted.forEach(p => {
            const err = Math.abs(p.yTransmitter - p.yPatron);
            if (err > eMax) {
                eMax = err;
                xMax = p.xEU;
            }
        });

        return { processedData: sorted, metrics: { zeroErr, spanErr, eMax, xMax } };
    }, [chartData]);

    useImperativeHandle(ref, () => ({
        captureAllCharts: async () => {
            if (containerRef.current) {
                return [await toPng(containerRef.current, { backgroundColor: '#ffffff', pixelRatio: 2 })];
            }
            return [];
        }
    }));

    return (
        <div className="mt-8 shadow-2xl rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 font-sans" ref={containerRef}>
            {/* HEADER CON METRICAS */}
            <div className="bg-slate-900 px-8 py-6 text-white flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h3 className="text-xl font-bold tracking-tight text-emerald-400">ANALIZADOR DE RESPUESTA</h3>
                    <p className="text-slate-400 text-xs uppercase tracking-widest">mA Pat vs Patron UE | UE T vs mA Tr</p>
                </div>
                <div className="flex gap-4">
                    <MetricCard label="Error Zero" value={metrics.zeroErr} />
                    <MetricCard label="Error Span" value={metrics.spanErr} />
                    <MetricCard label="Error Max" value={metrics.eMax} highlight />
                </div>
            </div>

            <div className="p-6 bg-white">
                <div className="h-[520px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={processedData} margin={{ top: 40, right: 30, left: 20, bottom: 60 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                            
                            <XAxis 
                                dataKey="xEU" 
                                type="number" 
                                domain={['dataMin', 'dataMax']}
                                label={{ value: 'PATRON UE (REFERENCIA)', position: 'insideBottom', offset: -40, fontSize: 12, fontWeight: 700, fill: '#64748b' }}
                            />
                            
                            <YAxis 
                                type="number"
                                domain={[0, 22]} 
                                ticks={[4, 8, 12, 16, 20]} 
                                label={{ value: 'CORRIENTE (mA)', angle: -90, position: 'insideLeft', fontWeight: 700, fill: '#64748b' }}
                            />

                            <ReferenceArea y1={0} y2={4} fill="#f8fafc" />
                            <ReferenceLine y={4} stroke="#cbd5e1" strokeDasharray="4 4" />

                            {metrics.eMax > 0 && (
                                <ReferenceLine x={metrics.xMax} stroke="#ef4444" strokeDasharray="3 3">
                                    <Label value="Punto eMax" position="top" fill="#ef4444" fontSize={10} fontWeight="bold" />
                                </ReferenceLine>
                            )}

                            <Tooltip 
                                cursor={{ stroke: '#e2e8f0', strokeWidth: 1 }}
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                formatter={(value: any, name: string) => {
                                    if (name === 'yPatron') return [value.toFixed(3) + ' mA', 'mA Patron'];
                                    return [value.toFixed(3) + ' Transmisor', ' Transmisor'];
                                }}
                            />
                            <Legend verticalAlign="top" align="right" height={40} />
                            
                            {/* Linea mA Pat vs Patron UE (Azul) */}
                            <Line 
                                type="monotone" 
                                dataKey="yPatron" 
                                stroke="#3b82f6" 
                                name="mA Patron" 
                                strokeWidth={2} 
                                strokeDasharray="5 5"
                                dot={false}
                                isAnimationActive={false} 
                            />

                            {/* Linea mA Tr vs Patron UE (Verde) */}
                            <Line 
                                type="monotone" 
                                dataKey="yTransmitter" 
                                stroke="#10b981" 
                                name="Transmisor" 
                                strokeWidth={4}
                                dot={makeDot('#10b981', 'mA Tr', 25)}
                                activeDot={{ r: 6 }}
                                isAnimationActive={true} 
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
});

const MetricCard = ({ label, value, highlight }: any) => (
    <div className={`px-4 py-1 rounded-lg ${highlight ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-slate-800'}`}>
        <p className="text-[9px] uppercase font-bold text-slate-400 leading-none mb-1">{label}</p>
        <p className={`text-lg font-mono font-bold ${highlight ? 'text-emerald-400' : 'text-white'}`}>
            {value > 0 ? '+' : ''}{value.toFixed(3)}<span className="text-[10px] ml-0.5">mA</span>
        </p>
    </div>
);

TransmitterChart.displayName = 'TransmitterChart';

export default TransmitterChart;