import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { toPng } from 'html-to-image';
import { useRef, useImperativeHandle, forwardRef } from 'react';

export interface Measurement {
    percentage: string;
    idealUE?: string;
    idealUe?: string;
    patronUE?: string;
    patronUe?: string;
    ueTransmitter: string;
    idealmA?: string;
    idealMa?: string;
    maTransmitter: string;
    idealohm?: string;
    ohmTransmitter?: string;
    idealMv?: string;
    mvTransmitter?: string;
    errorUE?: string;
    errorUe?: string;
    errormA?: string;
    errorMa?: string;
    errorPercentage: string;
}

interface TransmitterChartProps {
    measurements?: Measurement[];
    data?: Measurement[];
    outputUnit?: 'mA' | 'ohm' | 'mv' | string;
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

const TransmitterChart = forwardRef<any, TransmitterChartProps>(({
    measurements,
    data,
    outputUnit = 'mA',
    hasUeTransmitter = true
}, ref) => {
    const chartData = measurements || data || [];
    const containerRef = useRef<HTMLDivElement>(null);
    const isOhm = outputUnit === 'ohm';
    const isMv  = outputUnit === 'mv';

    const processedData = chartData.map((m) => {
        const idealMa    = parseFloat(m.idealmA || m.idealMa || '0');
        const ueTrans    = m.ueTransmitter ? parseFloat(m.ueTransmitter) : null;
        const idealUeVal = (m.idealUE || m.idealUe) ? parseFloat(m.idealUE || m.idealUe || '0') : null;
        const idealOhmVal  = m.idealohm      ? parseFloat(m.idealohm)      : null;
        const sensorOhmVal = m.ohmTransmitter ? parseFloat(m.ohmTransmitter) : null;
        const idealMvVal   = m.idealMv        ? parseFloat(m.idealMv)        : null;
        const sensorMvVal  = m.mvTransmitter  ? parseFloat(m.mvTransmitter)  : null;
        return {
            percentage:    parseFloat(m.percentage) || 0,
            idealUE:       idealUeVal,
            ueTransmitter: ueTrans,
            idealValue:    idealMa,
            measuredValue: parseFloat(m.maTransmitter) || 0,
            idealOhm:      idealOhmVal,
            sensorOhm:     sensorOhmVal,
            idealMv:       idealMvVal,
            sensorMv:      sensorMvVal,
        };
    }).sort((a, b) => a.idealValue - b.idealValue);

    const getYTicks = () => {
        if (processedData.length === 0) return [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20];
        const activeValues = processedData.flatMap(d => {
            const values = [d.idealValue, d.measuredValue];
            if (!isOhm && !isMv && hasUeTransmitter) {
                if (d.idealUE       !== null) values.push(d.idealUE!);
                if (d.ueTransmitter !== null) values.push(d.ueTransmitter!);
            }
            if (isOhm) {
                if (d.idealOhm  !== null) values.push(d.idealOhm!);
                if (d.sensorOhm !== null) values.push(d.sensorOhm!);
            }
            if (isMv) {
                if (d.idealMv  !== null) values.push(d.idealMv!);
                if (d.sensorMv !== null) values.push(d.sensorMv!);
            }
            return values.filter(v => v !== null) as number[];
        });
        const maxVal = activeValues.length > 0 ? Math.max(...activeValues) : 20;
        const minVal = activeValues.length > 0 ? Math.min(...activeValues, 0) : 0;
        let step = 2;
        if (maxVal > 50)   step = 10;
        if (maxVal > 200)  step = 50;
        if (maxVal > 1000) step = 200;
        const ticks: number[] = [];
        const start = Math.floor(minVal / step) * step;
        const end   = Math.ceil(maxVal  / step) * step;
        for (let i = start; i <= end; i += step) ticks.push(i);
        return ticks;
    };

    const yTicks = getYTicks();
    const xTicks = [4, 8, 12, 16, 20];

    useImperativeHandle(ref, () => ({
        captureAllCharts: async () => {
            if (containerRef.current) {
                const dataUrl = await toPng(containerRef.current, { backgroundColor: '#ffffff', pixelRatio: 2, cacheBust: true });
                return [dataUrl];
            }
            return [];
        }
    }));

    const getChartTitle    = () => isOhm ? 'Desviación de Ohm' : isMv ? 'Curva de Respuesta Termopar (mV)' : 'Curva de Respuesta del Transmisor';
    const getChartSubtitle = () => isOhm ? 'Ideal Ω vs Sensor Ω' : isMv ? 'Ideal mV vs Sensor mV' : 'Eje X: Entrada (mA) | Eje Y: Rango UE / mA';
    const getYLabel        = () => isOhm ? 'Resistencia (Ω)' : isMv ? 'Voltaje (mV)' : 'Rango UE / mA';

    const headerColor = isOhm ? 'from-teal-600 to-emerald-600' : isMv ? 'from-orange-600 to-red-600' : 'from-blue-600 to-indigo-600';

    return (
        <div className="mt-8 shadow-lg rounded-xl overflow-hidden border border-gray-200 bg-white" ref={containerRef}>
            <div className={`bg-gradient-to-r ${headerColor} px-6 py-5 text-white`}>
                <div className="flex items-center gap-4">
                    <span className="text-3xl">📈</span>
                    <div>
                        <h3 className="text-xl font-bold">{getChartTitle()}</h3>
                        <p className="text-blue-100 text-sm opacity-90">{getChartSubtitle()}</p>
                    </div>
                </div>
            </div>

            <div className="p-6 bg-white">
                {processedData.length === 0 ? (
                    <div className="text-center py-12 text-gray-400"><p>No hay datos suficientes para generar la curva de respuesta.</p></div>
                ) : (
                    <div className="h-96 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={processedData} margin={{ top: 30, right: 30, left: 20, bottom: 25 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis
                                    dataKey="idealValue" type="number" domain={[4, 20]} ticks={xTicks} tick={{ fontSize: 11 }}
                                    label={{ value: 'Señal de Entrada (mA)', position: 'insideBottom', offset: -10, fontSize: 12, fontWeight: 'bold' }}
                                />
                                <YAxis
                                    ticks={yTicks} domain={[yTicks[0], yTicks[yTicks.length - 1]]} tick={{ fontSize: 10 }}
                                    label={{ value: getYLabel(), angle: -90, position: 'insideLeft', fontWeight: 'bold', fontSize: 12 }}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', fontSize: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    formatter={(value: any, name: string) => [value !== null ? Number(value).toFixed(2) : '---', name]}
                                    labelFormatter={(label) => `Punto: ${label} mA`}
                                />
                                <Legend verticalAlign="top" height={36} />

                                {/* mA siempre presentes */}
                                <Line type="monotone" dataKey="idealValue"    stroke="#3b82f6" name="Ideal mA"  strokeWidth={2} dot={{ r: 4 }} isAnimationActive={false} label={makeLabel('Ideal mA')} />
                                <Line type="monotone" dataKey="measuredValue" stroke="#ef4444" name="Medido mA" strokeWidth={2} dot={{ r: 4 }} isAnimationActive={false} label={makeLabel('Medido mA')} />

                                {/* RTD (Ohm) */}
                                {isOhm && (
                                    <>
                                        <Line type="monotone" dataKey="idealOhm"  stroke="#10b981" name="Ideal Ohm"  strokeWidth={2} dot={{ r: 3 }} isAnimationActive={false} label={makeLabel('Ideal Ω')} />
                                        <Line type="monotone" dataKey="sensorOhm" stroke="#f59e0b" name="Sensor Ohm" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3 }} isAnimationActive={false} label={makeLabel('Sensor Ω')} />
                                    </>
                                )}

                                {/* Termopar (mV) */}
                                {isMv && (
                                    <>
                                        <Line type="monotone" dataKey="idealMv"  stroke="#8b5cf6" name="mV Ideal"  strokeWidth={2} dot={{ r: 3 }} isAnimationActive={false} label={makeLabel('Ideal mV')} />
                                        <Line type="monotone" dataKey="sensorMv" stroke="#ec4899" name="mV Sensor" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3 }} isAnimationActive={false} label={makeLabel('Sensor mV')} />
                                    </>
                                )}

                                {/* UE */}
                                {!isOhm && !isMv && hasUeTransmitter && (
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
    );
});

export default TransmitterChart;