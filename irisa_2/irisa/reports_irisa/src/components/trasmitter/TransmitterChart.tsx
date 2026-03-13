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

// ── Cajita SVG siempre visible ────────────────────────────────────────────────
// offset: negativo = arriba del punto, positivo = abajo del punto
const makeDot = (color: string, label: string, offset: number) =>
    (props: any) => {
        const { cx, cy, value } = props;
        if (value === null || value === undefined || cx === undefined || cy === undefined) {
            return <g />;
        }

        const text  = `${label}: ${Number(value).toFixed(2)}`;
        const fSize = 10;
        const padX  = 7;
        const padY  = 4;
        const charW = fSize * 0.58;
        const boxW  = text.length * charW + padX * 2;
        const boxH  = fSize + padY * 2;

        // Si offset negativo la cajita está arriba, si positivo abajo
        const above  = offset < 0;
        const boxY   = above ? cy + offset - boxH : cy + offset;
        const tipY   = above ? boxY + boxH : boxY;          // base del triángulo
        const tipDir = above ? 1 : -1;                       // punta hacia abajo o arriba
        const boxX   = cx - boxW / 2;

        // Línea vertical desde el punto hasta la cajita
        const lineY1 = above ? cy - 4 : cy + 4;
        const lineY2 = above ? tipY   : tipY;

        return (
            <g>
                {/* Dot */}
                <circle cx={cx} cy={cy} r={4} fill={color} stroke="#fff" strokeWidth={2} />

                {/* Línea conectora */}
                <line x1={cx} y1={lineY1} x2={cx} y2={lineY2}
                    stroke={color} strokeWidth={1} strokeDasharray="3 2" opacity={0.6} />

                {/* Cajita */}
                <rect
                    x={boxX} y={boxY} width={boxW} height={boxH}
                    rx={4} ry={4}
                    fill="white" stroke={color} strokeWidth={1.5}
                    style={{ filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.15))' }}
                />

                {/* Triángulo punta */}
                <polygon
                    points={`
                        ${cx - 4},${tipY}
                        ${cx + 4},${tipY}
                        ${cx},${tipY + tipDir * 5}
                    `}
                    fill={color}
                />

                {/* Texto */}
                <text
                    x={cx} y={boxY + padY + fSize - 1}
                    textAnchor="middle"
                    fontSize={fSize}
                    fontWeight={600}
                    fill={color}
                    fontFamily="system-ui, sans-serif"
                >
                    {text}
                </text>
            </g>
        );
    };

// Offsets escalonados para 4 líneas — bien separados
const OFF = { L1: -80, L2: -45, L3: 22, L4: 57 };

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
        const idealOhmVal  = m.idealohm       ? parseFloat(m.idealohm)       : null;
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
                const dataUrl = await toPng(containerRef.current, {
                    backgroundColor: '#ffffff', pixelRatio: 2, cacheBust: true
                });
                return [dataUrl];
            }
            return [];
        }
    }));

    const getChartTitle    = () => isOhm ? 'Desviación de Ohm' : isMv ? 'Curva de Respuesta Termopar (mV)' : 'Curva de Respuesta del Transmisor';
    const getChartSubtitle = () => isOhm ? 'Ideal Ω vs Sensor Ω' : isMv ? 'Ideal mV vs Sensor mV' : 'Eje X: Entrada (mA) | Eje Y: Rango UE / mA';
    const getYLabel        = () => isOhm ? 'Resistencia (Ω)' : isMv ? 'Voltaje (mV)' : 'Rango UE / mA';
    const headerColor      = isOhm ? 'from-teal-600 to-emerald-600' : isMv ? 'from-orange-600 to-red-600' : 'from-blue-600 to-indigo-600';

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
                    <div className="text-center py-12 text-gray-400">
                        <p>No hay datos suficientes para generar la curva de respuesta.</p>
                    </div>
                ) : (
                    // Alto generoso + márgenes amplios para que las cajitas no se corten
                    <div className="h-[540px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={processedData} margin={{ top: 95, right: 50, left: 20, bottom: 75 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis
                                    dataKey="idealValue" type="number" domain={[4, 20]} ticks={xTicks} tick={{ fontSize: 11 }}
                                    label={{ value: 'Señal de Entrada (mA)', position: 'insideBottom', offset: -55, fontSize: 12, fontWeight: 'bold' }}
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

                                {/* ── mA (2 líneas → L1 arriba, L3 abajo) ── */}
                                <Line type="monotone" dataKey="idealValue"
                                    stroke="#3b82f6" name="Ideal mA" strokeWidth={2}
                                    dot={makeDot('#3b82f6', 'Ideal mA', OFF.L1)}
                                    activeDot={{ r: 6 }} isAnimationActive={false} />
                                <Line type="monotone" dataKey="measuredValue"
                                    stroke="#ef4444" name="Medido mA" strokeWidth={2}
                                    dot={makeDot('#ef4444', 'Medido mA', OFF.L3)}
                                    activeDot={{ r: 6 }} isAnimationActive={false} />

                                {/* ── RTD (4 líneas → L1 L2 arriba, L3 L4 abajo) ── */}
                                {isOhm && (
                                    <>
                                        <Line type="monotone" dataKey="idealOhm"
                                            stroke="#10b981" name="Ideal Ohm" strokeWidth={2}
                                            dot={makeDot('#10b981', 'Ideal Ω', OFF.L1)}
                                            activeDot={{ r: 6 }} isAnimationActive={false} />
                                        <Line type="monotone" dataKey="sensorOhm"
                                            stroke="#f59e0b" name="Sensor Ohm" strokeWidth={2} strokeDasharray="5 5"
                                            dot={makeDot('#f59e0b', 'Sensor Ω', OFF.L3)}
                                            activeDot={{ r: 6 }} isAnimationActive={false} />
                                    </>
                                )}

                                {/* ── Termopar mV ── */}
                                {isMv && (
                                    <>
                                        <Line type="monotone" dataKey="idealMv"
                                            stroke="#8b5cf6" name="mV Ideal" strokeWidth={2}
                                            dot={makeDot('#8b5cf6', 'Ideal mV', OFF.L1)}
                                            activeDot={{ r: 6 }} isAnimationActive={false} />
                                        <Line type="monotone" dataKey="sensorMv"
                                            stroke="#ec4899" name="mV Sensor" strokeWidth={2} strokeDasharray="5 5"
                                            dot={makeDot('#ec4899', 'Sensor mV', OFF.L3)}
                                            activeDot={{ r: 6 }} isAnimationActive={false} />
                                    </>
                                )}

                                {/* ── UE (4 líneas → L1 L2 L3 L4) ── */}
                                {!isOhm && !isMv && hasUeTransmitter && (
                                    <>
                                        <Line type="monotone" dataKey="idealValue"
                                            stroke="#3b82f6" name="Ideal mA" strokeWidth={2}
                                            dot={makeDot('#3b82f6', 'Ideal mA', OFF.L1)}
                                            activeDot={{ r: 6 }} isAnimationActive={false} />
                                        <Line type="monotone" dataKey="idealUE"
                                            stroke="#10b981" name="Ideal UE" strokeWidth={2} strokeDasharray="5 5"
                                            dot={makeDot('#10b981', 'Ideal UE', OFF.L2)}
                                            activeDot={{ r: 6 }} isAnimationActive={false} connectNulls={false} />
                                        <Line type="monotone" dataKey="measuredValue"
                                            stroke="#ef4444" name="Medido mA" strokeWidth={2}
                                            dot={makeDot('#ef4444', 'Medido mA', OFF.L3)}
                                            activeDot={{ r: 6 }} isAnimationActive={false} />
                                        <Line type="monotone" dataKey="ueTransmitter"
                                            stroke="#f59e0b" name="UE Transmisor" strokeWidth={2} strokeDasharray="5 5"
                                            dot={makeDot('#f59e0b', 'UE TX', OFF.L4)}
                                            activeDot={{ r: 6 }} isAnimationActive={false} connectNulls={false} />
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