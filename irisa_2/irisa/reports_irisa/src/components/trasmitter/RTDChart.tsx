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

// ── Etiqueta personalizada: prefijo + 2 decimales ─────────────────────────────
const makeLabel = (prefix: string) => (props: any) => {
    const { x, y, value } = props;
    if (value === null || value === undefined) return <g/>;
    return (
        <text x={x} y={y - 8} fill="#374151" fontSize={10} textAnchor="middle" fontWeight={500}>
            {`${prefix}: ${Number(value).toFixed(2)}`}
        </text>
    );
};

const RTDChart = forwardRef<any, RTDChartProps>(({
    measurements = [],
    hasUeTransmitter = true
}, ref) => {
    const chart1Ref = useRef<HTMLDivElement>(null);
    const chart2Ref = useRef<HTMLDivElement>(null);

    // ── CHART 1: eje X = temperatura (UE) ────────────────────────────────────
    const processedData = measurements.map((m) => {
        const idealUeVal   = m.idealUE        ? parseFloat(m.idealUE)        : null;
        const idealOhmVal  = m.idealohm       ? parseFloat(m.idealohm)       : null;
        const sensorOhmVal = m.ohmTransmitter ? parseFloat(m.ohmTransmitter) : null;
        const ueTransVal   = m.ueTransmitter  ? parseFloat(m.ueTransmitter)  : null;
        return {
            percentage:    parseFloat(m.percentage) || 0,
            temperatura:   idealUeVal,
            idealOhm:      idealOhmVal,
            sensorOhm:     sensorOhmVal,
            idealUE:       idealUeVal,
            ueTransmitter: ueTransVal,
        };
    }).sort((a, b) => (a.temperatura || 0) - (b.temperatura || 0));

    // ── CHART 2: eje X = idealMA (igual que TransmitterChart) ─────────────────
    const processedDataMA = measurements.map((m) => {
        const idealMaVal  = parseFloat(m.idealmA       || '0');
        const maSensorVal = parseFloat(m.maTransmitter || '0');
        const idealUeVal  = m.idealUE       ? parseFloat(m.idealUE)       : null;
        const ueTransVal  = m.ueTransmitter ? parseFloat(m.ueTransmitter) : null;
        return {
            idealValue:    idealMaVal,
            measuredValue: maSensorVal,
            idealUE:       idealUeVal,
            ueTransmitter: ueTransVal,
        };
    }).sort((a, b) => a.idealValue - b.idealValue);

    // ── Ticks Ohm ────────────────────────────────────────────────────────────
    const getYTicksOhm = () => {
        if (processedData.length === 0) return [0, 10, 20, 30, 40, 50];
        const vals = processedData.flatMap(d => {
            const v: number[] = [];
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
        const ticks: number[] = [];
        for (let i = Math.floor(minVal/step)*step; i <= Math.ceil(maxVal/step)*step; i += step) ticks.push(i);
        return ticks;
    };

    // ── Ticks mA ─────────────────────────────────────────────────────────────
    const getYTicksMA = () => {
        if (processedDataMA.length === 0) return [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20];
        const activeValues = processedDataMA.flatMap(d => {
            const values: number[] = [d.idealValue, d.measuredValue];
            if (hasUeTransmitter) {
                if (d.idealUE       !== null) values.push(d.idealUE!);
                if (d.ueTransmitter !== null) values.push(d.ueTransmitter!);
            }
            return values;
        });
        const maxVal = activeValues.length ? Math.max(...activeValues) : 20;
        const minVal = activeValues.length ? Math.min(...activeValues, 0) : 0;
        let step = 2;
        if (maxVal > 50)   step = 10;
        if (maxVal > 200)  step = 50;
        if (maxVal > 1000) step = 200;
        const ticks: number[] = [];
        for (let i = Math.floor(minVal/step)*step; i <= Math.ceil(maxVal/step)*step; i += step) ticks.push(i);
        return ticks;
    };

    // ── Ticks X chart1 (temperatura) ─────────────────────────────────────────
    const getXTicks = () => {
        if (processedData.length === 0) return [];
        const temps = processedData.map(d => d.temperatura).filter(t => t !== null) as number[];
        if (!temps.length) return [];
        const minT = Math.min(...temps), maxT = Math.max(...temps);
        let step = 10;
        if (maxT - minT > 100) step = 20;
        if (maxT - minT > 500) step = 50;
        const ticks: number[] = [];
        for (let i = Math.floor(minT/step)*step; i <= Math.ceil(maxT/step)*step; i += step) ticks.push(i);
        return ticks.length ? ticks : [minT, maxT];
    };

    const yTicksOhm = getYTicksOhm();
    const yTicksMA  = getYTicksMA();
    const xTicks    = getXTicks();
    const xTicksMA  = [4, 8, 12, 16, 20];

    // ── Captura ───────────────────────────────────────────────────────────────
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
    const margin       = { top: 30, right: 30, left: 20, bottom: 25 };
    const noData       = <div className="text-center py-12 text-gray-400"><p>No hay datos suficientes para generar la curva de respuesta.</p></div>;

    return (
        <div className="space-y-6">

            {/* ── CHART 1: Ohm vs Temperatura ───────────────────────────────── */}
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
                    {processedData.length === 0 ? noData : (
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
                                    <Tooltip contentStyle={tooltipStyle}
                                        formatter={(value: any, name: string) => [value !== null ? Number(value).toFixed(2) : '---', name]}
                                        labelFormatter={(label) => `Temperatura: ${label} UE`}
                                    />
                                    <Legend verticalAlign="top" height={36} />
                                    <Line type="monotone" dataKey="idealOhm"  stroke="#10b981" name="Ideal Ohm"  strokeWidth={2} dot={{ r: 4 }} isAnimationActive={false} label={makeLabel('Ideal Ω')} />
                                    <Line type="monotone" dataKey="sensorOhm" stroke="#f59e0b" name="Sensor Ohm" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 4 }} isAnimationActive={false} label={makeLabel('Sensor Ω')} />
                                    {hasUeTransmitter && (
                                        <>
                                            <Line type="monotone" dataKey="idealUE"       stroke="#3b82f6" name="Ideal UE"      strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3 }} isAnimationActive={false} connectNulls={false} label={makeLabel('Ideal UE')} />
                                            <Line type="monotone" dataKey="ueTransmitter" stroke="#ef4444" name="UE Transmisor" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3 }} isAnimationActive={false} connectNulls={false} label={makeLabel('UE TX')} />
                                        </>
                                    )}
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>
            </div>

            {/* ── CHART 2: mA — idéntico a TransmitterChart ─────────────────── */}
            <div className="shadow-lg rounded-xl overflow-hidden border border-gray-200 bg-white" ref={chart2Ref}>
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5 text-white">
                    <div className="flex items-center gap-4">
                        <span className="text-3xl">📈</span>
                        <div>
                            <h3 className="text-xl font-bold">Curva de Respuesta del Transmisor</h3>
                            <p className="text-blue-100 text-sm opacity-90">Eje X: Entrada (mA) | Eje Y: Rango UE / mA</p>
                        </div>
                    </div>
                </div>
                <div className="p-6 bg-white">
                    {processedDataMA.length === 0 ? noData : (
                        <div className="h-96 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={processedDataMA} margin={margin}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis
                                        dataKey="idealValue" type="number" domain={[4, 20]} ticks={xTicksMA} tick={{ fontSize: 11 }}
                                        label={{ value: 'Señal de Entrada (mA)', position: 'insideBottom', offset: -10, fontSize: 12, fontWeight: 'bold' }}
                                    />
                                    <YAxis
                                        ticks={yTicksMA} domain={[yTicksMA[0], yTicksMA[yTicksMA.length - 1]]} tick={{ fontSize: 10 }}
                                        label={{ value: 'Rango UE / mA', angle: -90, position: 'insideLeft', fontWeight: 'bold', fontSize: 12 }}
                                    />
                                    <Tooltip contentStyle={tooltipStyle}
                                        formatter={(value: any, name: string) => [value !== null ? Number(value).toFixed(2) : '---', name]}
                                        labelFormatter={(label) => `Punto: ${label} mA`}
                                    />
                                    <Legend verticalAlign="top" height={36} />
                                    <Line type="monotone" dataKey="idealValue"    stroke="#3b82f6" name="Ideal mA"      strokeWidth={2} dot={{ r: 4 }} isAnimationActive={false} label={makeLabel('Ideal mA')} />
                                    <Line type="monotone" dataKey="measuredValue" stroke="#ef4444" name="Medido mA"     strokeWidth={2} dot={{ r: 4 }} isAnimationActive={false} label={makeLabel('Medido mA')} />
                                    {hasUeTransmitter && (
                                        <>
                                            <Line type="monotone" dataKey="idealUE"       stroke="#10b981" name="Ideal UE"      strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3 }} isAnimationActive={false} connectNulls={false} label={makeLabel('Ideal UE')} />
                                            <Line type="monotone" dataKey="ueTransmitter" stroke="#f59e0b" name="UE Transmisor" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3 }} isAnimationActive={false} connectNulls={false} label={makeLabel('UE TX')} />
                                        </>
                                    )}
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