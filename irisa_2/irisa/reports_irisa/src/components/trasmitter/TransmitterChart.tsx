import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceArea, ReferenceLine, Label } from 'recharts';
import { toPng } from 'html-to-image';
import { useRef, useImperativeHandle, forwardRef, useMemo } from 'react';

// --- Interfaces ---
export interface Measurement {
    percentage: string;
    idealUE?: string;
    idealUe?: string;
    ueTransmitter: string;
    idealmA?: string;
    idealMa?: string;
    maTransmitter: string;
}

interface TransmitterChartProps {
    measurements?: Measurement[];
    data?: Measurement[];
}

interface ProcessedPoint {
    xEU: number;
    yIdeal: number;
    yMeasmA: number;
    yIdealUE: number;
    yMeasUE: number | null;
}

// --- Componentes Internos ---

const makeDot = (color: string, label: string, offset: number) => (props: any) => {
    const { cx, cy, value } = props;
    if (value === null || value === undefined || cx === undefined || cy === undefined) return <g />;

    const text = `${label}: ${Number(value).toFixed(2)}`;
    const fSize = 10;
    const padX = 7;
    const padY = 4;
    const charW = fSize * 0.58;
    const boxW = text.length * charW + padX * 2;
    const boxH = fSize + padY * 2;

    const above = offset < 0;
    const boxY = above ? cy + offset - boxH : cy + offset;
    const tipY = above ? boxY + boxH : boxY;
    const tipDir = above ? 1 : -1;
    const boxX = cx - boxW / 2;

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

const OFF = { TOP: -45, BOTTOM: 25 };

const MetricCard = ({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) => (
    <div className={`px-3 py-2 rounded-lg ${highlight ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-blue-600/20 border border-blue-400/20'}`}>
        <p className="text-[9px] uppercase font-bold text-blue-100 leading-none mb-1">{label}</p>
        <p className={`text-base font-mono font-bold ${highlight ? 'text-emerald-300' : 'text-blue-100'}`}>
            {value > 0 ? '+' : ''}{value.toFixed(3)}<span className="text-[9px] ml-0.5">mA</span>
        </p>
    </div>
);

// --- Componente Principal ---

const TransmitterChart = forwardRef<any, TransmitterChartProps>(({ measurements, data }, ref) => {
    const chartData = measurements || data || [];
    const containerRef = useRef<HTMLDivElement>(null);

    const { processedData, euMin, euMax, metrics } = useMemo(() => {
        const sorted: ProcessedPoint[] = chartData
            .map((m) => {
                const xEU = parseFloat(m.idealUE || m.idealUe || '0');
                const yIdeal = parseFloat(m.idealmA || m.idealMa || '0');
                const yMeasmA = parseFloat(m.maTransmitter) || 0;
                const yMeasUE = m.ueTransmitter ? parseFloat(m.ueTransmitter) : null;

                return {
                    xEU,
                    yIdeal,
                    yMeasmA,
                    yIdealUE: xEU,
                    yMeasUE,
                };
            })
            .sort((a, b) => a.xEU - b.xEU);

        const euValues = sorted
            .map((d) => [d.yIdealUE, d.yMeasUE])
            .flat()
            .filter((v): v is number => v !== null);

        const eMin = euValues.length > 0 ? Math.floor(Math.min(...euValues) * 0.95) : 0;
        const eMaxVal = euValues.length > 0 ? Math.ceil(Math.max(...euValues) * 1.05) : 100;

        let zeroErr = 0, spanErr = 0, eMaxError = 0, xMaxError = 0;
        if (sorted.length > 0) {
            zeroErr = sorted[0].yMeasmA - 4;
            spanErr = sorted[sorted.length - 1].yMeasmA - 20;
            sorted.forEach(p => {
                const err = Math.abs(p.yMeasmA - p.yIdeal);
                if (err > eMaxError) {
                    eMaxError = err;
                    xMaxError = p.xEU;
                }
            });
        }

        return {
            processedData: sorted,
            euMin: eMin,
            euMax: eMaxVal,
            metrics: { zeroErr, spanErr, eMax: eMaxError, xMax: xMaxError }
        };
    }, [chartData]);

    useImperativeHandle(ref, () => ({
        captureAllCharts: async () => {
            if (containerRef.current) {
                await new Promise(resolve => setTimeout(resolve, 150));
                return [await toPng(containerRef.current, { 
                    backgroundColor: '#ffffff', 
                    pixelRatio: 2,
                    cacheBust: true 
                })];
            }
            return [];
        },
    }));

    return (
        <div className="mt-8 shadow-2xl rounded-2xl overflow-hidden border border-slate-200 bg-slate-50" ref={containerRef}>
            {/* HEADER */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6 text-white flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h3 className="text-xl font-bold tracking-tight">Análisis de Linealidad del Transmisor</h3>
                    <p className="text-blue-100 text-xs uppercase tracking-widest mt-1">Protocolo 4-20mA con Desviación</p>
                </div>
                <div className="flex gap-3">
                    <MetricCard label="Error Zero" value={metrics.zeroErr} />
                    <MetricCard label="Error Span" value={metrics.spanErr} />
                    <MetricCard label="Error Máx" value={metrics.eMax} highlight />
                </div>
            </div>

            <div className="p-6 bg-white space-y-8">
                {/* GRÁFICA 1: mA vs EU */}
                <div className="border-b-2 border-gray-100 pb-8">
                    <div className="mb-4">
                        <h4 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                            <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                            Gráfica 1: Salida en mA vs Entrada EU Patrón
                        </h4>
                    </div>
                    <div className="h-[480px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={processedData} margin={{ top: 60, right: 30, left: 20, bottom: 60 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis 
                                    dataKey="xEU" 
                                    type="number" 
                                    domain={['dataMin', 'dataMax']} 
                                    label={{ value: 'EU Patrón (Entrada)', position: 'insideBottom', offset: -40, fontSize: 12, fontWeight: 'bold' }} 
                                />
                                <YAxis 
                                    ticks={[4, 8, 12, 16, 20]} 
                                    domain={[4, 20]} 
                                    label={{ value: 'Salida (mA)', angle: -90, position: 'insideLeft', fontWeight: 'bold', fontSize: 12 }} 
                                />
                                
                                {processedData.length > 0 && (
                                    <ReferenceArea 
                                        x1={processedData[0].xEU}
                                        x2={processedData[processedData.length - 1].xEU}
                                        y1={4}
                                        y2={20}
                                        fill="#fca5a5"
                                        fillOpacity={0.05}
                                    />
                                )}

                                {metrics.eMax > 0 && (
                                    <ReferenceLine x={metrics.xMax} stroke="#ef4444" strokeDasharray="3 3">
                                        <Label value="eMax" position="top" fill="#ef4444" fontSize={10} fontWeight="bold" />
                                    </ReferenceLine>
                                )}
                                <Tooltip formatter={(val: any) => [`${Number(val).toFixed(3)} mA`]} />
                                <Legend verticalAlign="top" height={36} />
                                <Line type="monotone" dataKey="yIdeal" stroke="#3b82f6" name="mA Ideal" strokeWidth={2} strokeDasharray="5 5" dot={false} isAnimationActive={false} />
                                <Line type="monotone" dataKey="yMeasmA" stroke="#10b981" name="mA Medido" strokeWidth={3} dot={makeDot('#10b981', 'Real', OFF.BOTTOM)} isAnimationActive={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* GRÁFICA 2: EU vs EU */}
                <div>
                    <div className="mb-4">
                        <h4 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                            <span className="w-3 h-3 bg-amber-500 rounded-full"></span>
                            Gráfica 2: EU Medido vs EU Patrón
                        </h4>
                    </div>
                    <div className="h-[480px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={processedData} margin={{ top: 60, right: 30, left: 20, bottom: 60 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="xEU" type="number" domain={['dataMin', 'dataMax']} label={{ value: 'EU Patrón (Entrada)', position: 'insideBottom', offset: -40, fontSize: 12, fontWeight: 'bold' }} />
                                <YAxis domain={[euMin, euMax]} label={{ value: `EU (${euMin}-${euMax})`, angle: -90, position: 'insideLeft', fontWeight: 'bold', fontSize: 12 }} />
                                
                                {processedData.length > 0 && (
                                    <ReferenceArea 
                                        x1={processedData[0].xEU}
                                        x2={processedData[processedData.length - 1].xEU}
                                        y1={euMin}
                                        y2={euMax}
                                        fill="#fca5a5"
                                        fillOpacity={0.05}
                                    />
                                )}

                                <Tooltip formatter={(val: any) => [`${Number(val).toFixed(3)}`]} />
                                <Legend verticalAlign="top" height={36} />
                                <Line type="monotone" dataKey="yIdealUE" stroke="#f59e0b" name="EU Ideal (1:1)" strokeWidth={2} strokeDasharray="5 5" dot={false} isAnimationActive={false} />
                                <Line type="monotone" dataKey="yMeasUE" stroke="#ef4444" name="EU Medido" strokeWidth={3} dot={makeDot('#ef4444', 'Real', OFF.BOTTOM)} isAnimationActive={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* LEYENDA */}
                <div className="mt-6 bg-slate-50 p-4 rounded-lg border border-slate-200 flex flex-wrap items-center justify-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-red-100 border border-red-200 rounded"></div>
                        <span className="text-sm font-semibold text-gray-700">Zona de Trabajo</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-6 border-t-2 border-dashed border-blue-500"></div>
                        <span className="text-sm font-semibold text-gray-700">Referencia Ideal</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-6 border-t-4 border-green-500"></div>
                        <span className="text-sm font-semibold text-gray-700">Medición Real</span>
                    </div>
                </div>
            </div>
        </div>
    );
});

TransmitterChart.displayName = 'TransmitterChart';

export default TransmitterChart;