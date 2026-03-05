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

// --- Helpers de ticks reutilizables ---
const getYTicks = (values: number[]) => {
    if (values.length === 0) return [0, 5, 10, 15, 20, 25];
    const max = Math.max(...values);
    const min = Math.min(...values, 0);
    let step = 5;
    if (max > 50) step = 10;
    if (max > 100) step = 20;
    const ticks = [];
    const start = Math.floor(min / step) * step;
    const end = Math.ceil(max / step) * step;
    for (let i = start; i <= end; i += step) ticks.push(i);
    return ticks;
};

const getXTicks = (temps: number[]) => {
    if (temps.length === 0) return [];
    const min = Math.min(...temps);
    const max = Math.max(...temps);
    let step = 10;
    if (max - min > 100) step = 20;
    if (max - min > 500) step = 50;
    const ticks = [];
    const start = Math.floor(min / step) * step;
    const end = Math.ceil(max / step) * step;
    for (let i = start; i <= end; i += step) ticks.push(i);
    return ticks.length > 0 ? ticks : [min, max];
};

const MVChart = forwardRef<any, MVChartProps>(({ measurements = [] }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);

    // --- Separar filas por tipo ---
    const mvRows = measurements.filter(m => !m.rowType || m.rowType === 'mv');
    const txRows = measurements.filter(m => m.rowType === 'tx');

    // --- Datos para gráfico mV ---
    const mvData = mvRows.map(m => ({
        temperatura: m.idealUE ? parseFloat(m.idealUE) : null,
        idealMV: m.idealmV ? parseFloat(m.idealmV) : null,
        sensorMV: m.sensormV ? parseFloat(m.sensormV) : null,
    })).sort((a, b) => (a.temperatura || 0) - (b.temperatura || 0));

    // --- Datos para gráfico TX ---
    const txData = txRows.map(m => ({
        temperatura: m.idealUE ? parseFloat(m.idealUE) : null,
        idealMA: m.idealmA ? parseFloat(m.idealmA) : null,
        maTX: m.mATX ? parseFloat(m.mATX) : null,
    })).sort((a, b) => (a.temperatura || 0) - (b.temperatura || 0));

    // --- Ticks mV ---
    const mvYVals = mvData.flatMap(d => [d.idealMV, d.sensorMV].filter(v => v !== null) as number[]);
    const mvXVals = mvData.map(d => d.temperatura).filter(t => t !== null) as number[];
    const mvYTicks = getYTicks(mvYVals);
    const mvXTicks = getXTicks(mvXVals);

    // --- Ticks TX ---
    const txYVals = txData.flatMap(d => [d.idealMA, d.maTX].filter(v => v !== null) as number[]);
    const txXVals = txData.map(d => d.temperatura).filter(t => t !== null) as number[];
    const txYTicks = getYTicks(txYVals);
    const txXTicks = getXTicks(txXVals);

    useImperativeHandle(ref, () => ({
        captureAllCharts: async () => {
            if (containerRef.current) {
                const dataUrl = await toPng(containerRef.current, {
                    backgroundColor: '#ffffff',
                    pixelRatio: 2,
                    cacheBust: true
                });
                return [dataUrl];
            }
            return [];
        }
    }));

    const hasMvData = mvData.length > 0;
    const hasTxData = txData.length > 0;

    if (!hasMvData && !hasTxData) {
        return (
            <div className="mt-8 shadow-lg rounded-xl overflow-hidden border border-gray-200 bg-white">
                <div className="bg-gradient-to-r from-orange-600 to-red-600 px-6 py-5 text-white">
                    <h3 className="text-xl font-bold">Análisis mV / TX</h3>
                </div>
                <div className="text-center py-12 text-gray-400">
                    <p>No hay datos suficientes para generar los gráficos.</p>
                </div>
            </div>
        );
    }

    return (
        <div ref={containerRef} className="space-y-6">

            {/* ── GRÁFICO mV ── */}
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
                        <div className="h-96 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={mvData} margin={{ top: 20, right: 30, left: 20, bottom: 25 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis
                                        dataKey="temperatura"
                                        type="number"
                                        ticks={mvXTicks}
                                        tick={{ fontSize: 11 }}
                                        label={{ value: 'Temperatura (UE)', position: 'insideBottom', offset: -10, fontSize: 12, fontWeight: 'bold' }}
                                    />
                                    <YAxis
                                        ticks={mvYTicks}
                                        domain={[mvYTicks[0], mvYTicks[mvYTicks.length - 1]]}
                                        tick={{ fontSize: 10 }}
                                        label={{ value: 'Voltaje (mV)', angle: -90, position: 'insideLeft', fontWeight: 'bold', fontSize: 12 }}
                                    />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '8px', fontSize: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        formatter={(value: any, name: string) => [value !== null ? value.toFixed(3) : '---', name]}
                                        labelFormatter={(label) => `Temperatura: ${label} UE`}
                                    />
                                    <Legend verticalAlign="top" height={36} />
                                    <Line type="monotone" dataKey="idealMV" stroke="#8b5cf6" name="Ideal mV" strokeWidth={2} dot={{ r: 4 }} isAnimationActive={false} />
                                    <Line type="monotone" dataKey="sensorMV" stroke="#ec4899" name="Sensor mV" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 4 }} isAnimationActive={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            )}

            {/* ── GRÁFICO TX ── */}
            {hasTxData && (
                <div className="shadow-lg rounded-xl overflow-hidden border border-gray-200 bg-white">
                    <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-5 text-white">
                        <div className="flex items-center gap-4">
                            <span className="text-3xl">📈</span>
                            <div>
                                <h3 className="text-xl font-bold">Ideal mA vs mA TX</h3>
                                <p className="text-purple-100 text-sm opacity-90">Eje X: Ideal UE (temperatura) | Eje Y: mA</p>
                            </div>
                        </div>
                    </div>
                    <div className="p-6 bg-white">
                        <div className="h-96 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={txData} margin={{ top: 20, right: 30, left: 20, bottom: 25 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis
                                        dataKey="temperatura"
                                        type="number"
                                        ticks={txXTicks}
                                        tick={{ fontSize: 11 }}
                                        label={{ value: 'Temperatura (UE)', position: 'insideBottom', offset: -10, fontSize: 12, fontWeight: 'bold' }}
                                    />
                                    <YAxis
                                        ticks={txYTicks}
                                        domain={[txYTicks[0], txYTicks[txYTicks.length - 1]]}
                                        tick={{ fontSize: 10 }}
                                        label={{ value: 'mA', angle: -90, position: 'insideLeft', fontWeight: 'bold', fontSize: 12 }}
                                    />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '8px', fontSize: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        formatter={(value: any, name: string) => [value !== null ? value.toFixed(3) : '---', name]}
                                        labelFormatter={(label) => `Temperatura: ${label} UE`}
                                    />
                                    <Legend verticalAlign="top" height={36} />
                                    <Line type="monotone" dataKey="idealMA" stroke="#3b82f6" name="Ideal mA" strokeWidth={2} dot={{ r: 4 }} isAnimationActive={false} />
                                    <Line type="monotone" dataKey="maTX" stroke="#ef4444" name="mA TX" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 4 }} isAnimationActive={false} />
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