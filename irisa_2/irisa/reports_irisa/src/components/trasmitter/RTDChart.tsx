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

const RTDChart = forwardRef<any, RTDChartProps>(({ 
    measurements = [],
    hasUeTransmitter = true 
}, ref) => {
    const chart1Ref = useRef<HTMLDivElement>(null); // Ohm
    const chart2Ref = useRef<HTMLDivElement>(null); // mA

    // ── Datos procesados compartidos ─────────────────────────────────────────
    const processedData = measurements.map((m) => {
        const idealUeVal  = m.idealUE     ? parseFloat(m.idealUE)     : null;
        const idealOhmVal = m.idealohm    ? parseFloat(m.idealohm)    : null;
        const sensorOhmVal= m.ohmTransmitter ? parseFloat(m.ohmTransmitter) : null;
        const ueTransVal  = m.ueTransmitter  ? parseFloat(m.ueTransmitter)  : null;
        const idealMaVal  = m.idealmA     ? parseFloat(m.idealmA)     : null;
        const maSensorVal = m.maTransmitter  ? parseFloat(m.maTransmitter)  : null;

        return {
            percentage:    parseFloat(m.percentage) || 0,
            temperatura:   idealUeVal,
            idealOhm:      idealOhmVal,
            sensorOhm:     sensorOhmVal,
            idealUE:       idealUeVal,
            ueTransmitter: ueTransVal,
            idealMA:       idealMaVal,
            sensorMA:      maSensorVal,
        };
    }).sort((a, b) => (a.temperatura || 0) - (b.temperatura || 0));
    // ─────────────────────────────────────────────────────────────────────────

    // ── Ticks Ohm (eje Y chart1) ─────────────────────────────────────────────
    const getYTicksOhm = () => {
        if (processedData.length === 0) return [0, 10, 20, 30, 40, 50];
        const vals = processedData.flatMap(d => {
            const v = [];
            if (d.idealOhm    !== null) v.push(d.idealOhm!);
            if (d.sensorOhm   !== null) v.push(d.sensorOhm!);
            if (hasUeTransmitter && d.idealUE       !== null) v.push(d.idealUE!);
            if (hasUeTransmitter && d.ueTransmitter !== null) v.push(d.ueTransmitter!);
            return v;
        });
        const maxVal = vals.length ? Math.max(...vals) : 50;
        const minVal = vals.length ? Math.min(...vals, 0) : 0;
        let step = 10;
        if (maxVal > 200)  step = 50;
        if (maxVal > 1000) step = 200;
        const ticks = [];
        for (let i = Math.floor(minVal/step)*step; i <= Math.ceil(maxVal/step)*step; i += step) ticks.push(i);
        return ticks;
    };

    // ── Ticks mA (eje Y chart2) ──────────────────────────────────────────────
    const getYTicksMA = () => {
        if (processedData.length === 0) return [4, 8, 12, 16, 20];
        const vals = processedData.flatMap(d => {
            const v = [];
            if (d.idealMA  !== null) v.push(d.idealMA!);
            if (d.sensorMA !== null) v.push(d.sensorMA!);
            return v;
        });
        const maxVal = vals.length ? Math.max(...vals) : 20;
        const minVal = vals.length ? Math.min(...vals, 4) : 4;
        let step = 2;
        if (maxVal > 50)  step = 10;
        if (maxVal > 200) step = 50;
        const ticks = [];
        for (let i = Math.floor(minVal/step)*step; i <= Math.ceil(maxVal/step)*step; i += step) ticks.push(i);
        return ticks;
    };

    // ── Ticks X compartidos (temperatura) ───────────────────────────────────
    const getXTicks = () => {
        if (processedData.length === 0) return [];
        const temps = processedData.map(d => d.temperatura).filter(t => t !== null) as number[];
        if (!temps.length) return [];
        const minT = Math.min(...temps), maxT = Math.max(...temps);
        let step = 10;
        if (maxT - minT > 100) step = 20;
        if (maxT - minT > 500) step = 50;
        const ticks = [];
        for (let i = Math.floor(minT/step)*step; i <= Math.ceil(maxT/step)*step; i += step) ticks.push(i);
        return ticks.length ? ticks : [minT, maxT];
    };

    const yTicksOhm = getYTicksOhm();
    const yTicksMA  = getYTicksMA();
    const xTicks    = getXTicks();

    // ── Captura ambos charts ─────────────────────────────────────────────────
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

    const tooltipStyle = { borderRadius: '8px', fontSize: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' };
    const margin = { top: 20, right: 30, left: 20, bottom: 25 };

    return (
        <div className="space-y-6">

            {/* ── CHART 1: Ohm vs Temperatura ── */}
            <div className="mt-8 shadow-lg rounded-xl overflow-hidden border border-gray-200 bg-white" ref={chart1Ref}>
                <div className="bg-gradient-to-r from-teal-600 to-emerald-600 px-6 py-5 text-white">
                    <div className="flex items-center gap-4">
                        <span className="text-3xl">📈</span>
                        <div>
                            <h3 className="text-xl font-bold">Desviación de Ohm (RTD)</h3>
                            <p className="text-teal-100 text-sm opacity-90">Ideal Ω vs Sensor Ω | Eje X: Temperatura (UE)</p>
                        </div>
                    </div>
                </div>
                <div className="p-6 bg-white">
                    {processedData.length === 0 ? (
                        <div className="text-center py-12 text-gray-400"><p>No hay datos suficientes para generar la curva de respuesta.</p></div>
                    ) : (
                        <div className="h-96 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={processedData} margin={margin}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis
                                        dataKey="temperatura" type="number" ticks={xTicks} tick={{ fontSize: 11 }}
                                        label={{ value: 'Temperatura (UE)', position: 'insideBottom', offset: -10, fontSize: 12, fontWeight: 'bold' }}
                                    />
                                    <YAxis
                                        ticks={yTicksOhm} domain={[yTicksOhm[0], yTicksOhm[yTicksOhm.length - 1]]} tick={{ fontSize: 10 }}
                                        label={{ value: 'Resistencia (Ω)', angle: -90, position: 'insideLeft', fontWeight: 'bold', fontSize: 12 }}
                                    />
                                    <Tooltip
                                        contentStyle={tooltipStyle}
                                        formatter={(value: any, name: string) => [value !== null ? Number(value).toFixed(3) : '---', name]}
                                        labelFormatter={(label) => `Temperatura: ${label} UE`}
                                    />
                                    <Legend verticalAlign="top" height={36} />
                                    <Line type="monotone" dataKey="idealOhm"  stroke="#10b981" name="Ideal Ohm"   strokeWidth={2} dot={{ r: 4 }} isAnimationActive={false} />
                                    <Line type="monotone" dataKey="sensorOhm" stroke="#f59e0b" name="Sensor Ohm"  strokeWidth={2} strokeDasharray="5 5" dot={{ r: 4 }} isAnimationActive={false} />
                                    {hasUeTransmitter && (
                                        <>
                                            <Line type="monotone" dataKey="idealUE"       stroke="#3b82f6" name="Ideal UE"       strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3 }} isAnimationActive={false} connectNulls={false} />
                                            <Line type="monotone" dataKey="ueTransmitter" stroke="#ef4444" name="UE Transmisor"  strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3 }} isAnimationActive={false} connectNulls={false} />
                                        </>
                                    )}
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>
            </div>

            {/* ── CHART 2: mA vs Temperatura ── */}
            <div className="shadow-lg rounded-xl overflow-hidden border border-gray-200 bg-white" ref={chart2Ref}>
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5 text-white">
                    <div className="flex items-center gap-4">
                        <span className="text-3xl">📉</span>
                        <div>
                            <h3 className="text-xl font-bold">Curva de Respuesta del Transmisor (mA)</h3>
                            <p className="text-blue-100 text-sm opacity-90">Ideal mA vs Sensor mA | Eje X: Temperatura (UE)</p>
                        </div>
                    </div>
                </div>
                <div className="p-6 bg-white">
                    {processedData.length === 0 ? (
                        <div className="text-center py-12 text-gray-400"><p>No hay datos suficientes para generar la curva de respuesta.</p></div>
                    ) : (
                        <div className="h-96 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={processedData} margin={margin}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis
                                        dataKey="temperatura" type="number" ticks={xTicks} tick={{ fontSize: 11 }}
                                        label={{ value: 'Temperatura (UE)', position: 'insideBottom', offset: -10, fontSize: 12, fontWeight: 'bold' }}
                                    />
                                    <YAxis
                                        ticks={yTicksMA} domain={[yTicksMA[0], yTicksMA[yTicksMA.length - 1]]} tick={{ fontSize: 10 }}
                                        label={{ value: 'Corriente (mA)', angle: -90, position: 'insideLeft', fontWeight: 'bold', fontSize: 12 }}
                                    />
                                    <Tooltip
                                        contentStyle={tooltipStyle}
                                        formatter={(value: any, name: string) => [value !== null ? Number(value).toFixed(3) : '---', name]}
                                        labelFormatter={(label) => `Temperatura: ${label} UE`}
                                    />
                                    <Legend verticalAlign="top" height={36} />
                                    <Line type="monotone" dataKey="idealMA"  stroke="#3b82f6" name="Ideal mA"  strokeWidth={2} dot={{ r: 4 }} isAnimationActive={false} />
                                    <Line type="monotone" dataKey="sensorMA" stroke="#ef4444" name="Sensor mA" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 4 }} isAnimationActive={false} />
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