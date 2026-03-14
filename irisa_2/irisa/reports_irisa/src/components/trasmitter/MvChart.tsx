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

// ── Cajita SVG siempre visible ────────────────────────────────────────────────
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

// ── Helpers de ticks ──────────────────────────────────────────────────────────
const getYTicks = (values: number[]) => {
    if (values.length === 0) return [0, 5, 10, 15, 20, 25];
    const max = Math.max(...values);
    const min = Math.min(...values, 0);
    let step = 5;
    if (max > 50)  step = 10;
    if (max > 100) step = 20;
    const ticks: number[] = [];
    for (let i = Math.floor(min/step)*step; i <= Math.ceil(max/step)*step; i += step) ticks.push(i);
    return ticks;
};

const getXTicks = (vals: number[]) => {
    if (vals.length === 0) return [];
    const min = Math.min(...vals), max = Math.max(...vals);
    let step = 10;
    if (max - min > 100) step = 20;
    if (max - min > 500) step = 50;
    if (max - min <= 20) step = 2;   // rango mA (4-20)
    const ticks: number[] = [];
    for (let i = Math.floor(min/step)*step; i <= Math.ceil(max/step)*step; i += step) ticks.push(i);
    return ticks.length > 0 ? ticks : [min, max];
};

const MVChart = forwardRef<any, MVChartProps>(({ measurements = [] }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);

    const mvRows = measurements.filter(m => !m.rowType || m.rowType === 'mv');
    const txRows = measurements.filter(m => m.rowType === 'tx');

    // ── mV: eje X = temperatura (idealUE) ────────────────────────────────────
    const mvData = mvRows.map(m => ({
        ejeX:    m.idealUE  ? parseFloat(m.idealUE)  : null,
        idealMV: m.idealmV  ? parseFloat(m.idealmV)  : null,
        sensorMV:m.sensormV ? parseFloat(m.sensormV) : null,
    })).sort((a, b) => (a.ejeX || 0) - (b.ejeX || 0));

    // ── TX: eje X = idealmA ───────────────────────────────────────────────────
    const txData = txRows.map(m => ({
        ejeX:   m.idealmA ? parseFloat(m.idealmA) : null,
        idealMA:m.idealmA ? parseFloat(m.idealmA) : null,
        maTX:   m.mATX    ? parseFloat(m.mATX)    : null,
    })).sort((a, b) => (a.ejeX || 0) - (b.ejeX || 0));

    const mvYVals  = mvData.flatMap(d => [d.idealMV,  d.sensorMV].filter(v => v !== null) as number[]);
    const mvXVals  = mvData.map(d => d.ejeX).filter(t => t !== null) as number[];
    const mvYTicks = getYTicks(mvYVals);
    const mvXTicks = getXTicks(mvXVals);

    const txYVals  = txData.flatMap(d => [d.idealMA, d.maTX].filter(v => v !== null) as number[]);
    const txXVals  = txData.map(d => d.ejeX).filter(t => t !== null) as number[];
    const txYTicks = getYTicks(txYVals);
    const txXTicks = getXTicks(txXVals);

    useImperativeHandle(ref, () => ({
        captureAllCharts: async () => {
            if (containerRef.current) {
                const dataUrl = await toPng(containerRef.current, { backgroundColor: '#ffffff', pixelRatio: 2, cacheBust: true });
                return [dataUrl];
            }
            return [];
        }
    }));

    const hasMvData = mvData.length > 0;
    const hasTxData = txData.length > 0;
    const tooltipStyle = { borderRadius: '8px', fontSize: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' };

    if (!hasMvData && !hasTxData) {
        return (
            <div className="mt-8 shadow-lg rounded-xl overflow-hidden border border-gray-200 bg-white">
                <div className="bg-gradient-to-r from-orange-600 to-red-600 px-6 py-5 text-white">
                    <h3 className="text-xl font-bold">Análisis mV / TX</h3>
                </div>
                <div className="text-center py-12 text-gray-400"><p>No hay datos suficientes para generar los gráficos.</p></div>
            </div>
        );
    }

    return (
        <div ref={containerRef} className="space-y-6">

            {/* ── GRÁFICO mV — eje X: temperatura ─────────────────────────── */}
            {hasMvData && (
                <div className="shadow-lg rounded-xl overflow-hidden border border-gray-200 bg-white">
                    <div className="bg-gradient-to-r from-orange-600 to-red-600 px-6 py-5 text-white">
                        <div className="flex items-center gap-4">
                            <span className="text-3xl">📈</span>
                            <div>
                                <h3 className="text-xl font-bold">Desviación de mV (Termopar)</h3>
                                <p className="text-orange-100 text-sm opacity-90">Ideal mV vs Sensor mV | Eje X: Temperatura (UE)</p>
                            </div>
                        </div>
                    </div>
                    <div className="p-6 bg-white">
                        <div className="h-[700px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={mvData} margin={{ top: 95, right: 50, left: 20, bottom: 80 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis dataKey="ejeX" type="number" ticks={mvXTicks} tick={{ fontSize: 11 }}
                                        label={{ value: 'Temperatura (UE)', position: 'insideBottom', offset: -55, fontSize: 12, fontWeight: 'bold' }} />
                                    <YAxis ticks={mvYTicks} domain={[mvYTicks[0], mvYTicks[mvYTicks.length - 1]]} tick={{ fontSize: 10 }}
                                        label={{ value: 'Voltaje (mV)', angle: -90, position: 'insideLeft', fontWeight: 'bold', fontSize: 12 }} />
                                    <Tooltip contentStyle={tooltipStyle}
                                        formatter={(v: any, n: string) => [v !== null ? Number(v).toFixed(2) : '---', n]}
                                        labelFormatter={(l) => `Temperatura: ${l} UE`} />
                                    <Legend verticalAlign="top" height={36} />
                                    <Line type="monotone" dataKey="idealMV"  stroke="#8b5cf6" name="Ideal mV"  strokeWidth={2}
                                        dot={makeDot('#8b5cf6', 'Ideal mV',  OFF.L1)} activeDot={{ r: 6 }} isAnimationActive={false} />
                                    <Line type="monotone" dataKey="sensorMV" stroke="#ec4899" name="Sensor mV" strokeWidth={2} strokeDasharray="5 5"
                                        dot={makeDot('#ec4899', 'Sensor mV', OFF.L3)} activeDot={{ r: 6 }} isAnimationActive={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            )}

            {/* ── GRÁFICO TX — eje X: Ideal mA ─────────────────────────────── */}
            {hasTxData && (
                <div className="shadow-lg rounded-xl overflow-hidden border border-gray-200 bg-white">
                    <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-5 text-white">
                        <div className="flex items-center gap-4">
                            <span className="text-3xl">📈</span>
                            <div>
                                <h3 className="text-xl font-bold">Ideal mA vs mA TX</h3>
                                <p className="text-purple-100 text-sm opacity-90">Eje X: Ideal mA | Eje Y: mA TX</p>
                            </div>
                        </div>
                    </div>
                    <div className="p-6 bg-white">
                        <div className="h-[700px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={txData} margin={{ top: 95, right: 50, left: 20, bottom: 80 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis dataKey="ejeX" type="number" ticks={txXTicks} tick={{ fontSize: 11 }}
                                        label={{ value: 'Señal de Entrada (mA)', position: 'insideBottom', offset: -55, fontSize: 12, fontWeight: 'bold' }} />
                                    <YAxis ticks={txYTicks} domain={[txYTicks[0], txYTicks[txYTicks.length - 1]]} tick={{ fontSize: 10 }}
                                        label={{ value: 'mA TX', angle: -90, position: 'insideLeft', fontWeight: 'bold', fontSize: 12 }} />
                                    <Tooltip contentStyle={tooltipStyle}
                                        formatter={(v: any, n: string) => [v !== null ? Number(v).toFixed(2) : '---', n]}
                                        labelFormatter={(l) => `Ideal mA: ${l}`} />
                                    <Legend verticalAlign="top" height={36} />
                                    <Line type="monotone" dataKey="idealMA" stroke="#3b82f6" name="Ideal mA" strokeWidth={2}
                                        dot={makeDot('#3b82f6', 'Ideal mA', OFF.L1)} activeDot={{ r: 6 }} isAnimationActive={false} />
                                    <Line type="monotone" dataKey="maTX"    stroke="#ef4444" name="mA TX"    strokeWidth={2} strokeDasharray="5 5"
                                        dot={makeDot('#ef4444', 'mA TX',    OFF.L3)} activeDot={{ r: 6 }} isAnimationActive={false} />
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