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

const makeDot = (color: string, label: string, offset: number) =>
    (props: any) => {
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
            <g>
                <circle cx={cx} cy={cy} r={4} fill={color} stroke="#fff" strokeWidth={2} />
                <line x1={cx} y1={above ? cy - 4 : cy + 4} x2={cx} y2={tipY} stroke={color} strokeWidth={1} strokeDasharray="3 2" opacity={0.6} />
                <rect x={boxX} y={boxY} width={boxW} height={boxH} rx={4} ry={4} fill="white" stroke={color} strokeWidth={1.5} style={{ filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.15))' }} />
                <polygon points={`${cx - 4},${tipY} ${cx + 4},${tipY} ${cx},${tipY + tipDir * 5}`} fill={color} />
                <text x={cx} y={boxY + padY + fSize - 1} textAnchor="middle" fontSize={fSize} fontWeight={600} fill={color} fontFamily="system-ui, sans-serif">
                    {text}
                </text>
            </g>
        );
    };

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
    const isMv = outputUnit === 'mv';

    const processedData = chartData.map((m) => {
        const idealMa = parseFloat(m.idealmA || m.idealMa || '0');
        return {
            percentage: parseFloat(m.percentage) || 0,
            idealUE: (m.idealUE || m.idealUe) ? parseFloat(m.idealUE || m.idealUe || '0') : null,
            ueTransmitter: m.ueTransmitter ? parseFloat(m.ueTransmitter) : null,
            idealValue: idealMa,
            measuredValue: parseFloat(m.maTransmitter) || 0,
            idealOhm: m.idealohm ? parseFloat(m.idealohm) : null,
            sensorOhm: m.ohmTransmitter ? parseFloat(m.ohmTransmitter) : null,
            idealMv: m.idealMv ? parseFloat(m.idealMv) : null,
            sensorMv: m.mvTransmitter ? parseFloat(m.mvTransmitter) : null,
        };
    }).sort((a, b) => (a.idealUE ?? 0) - (b.idealUE ?? 0));

    useImperativeHandle(ref, () => ({
        captureAllCharts: async () => {
            if (containerRef.current) {
                const dataUrl = await toPng(containerRef.current, { backgroundColor: '#ffffff', pixelRatio: 2, cacheBust: true });
                return [dataUrl];
            }
            return [];
        }
    }));

    const getXKey = () => (isOhm || isMv || hasUeTransmitter) ? "idealUE" : "idealValue";
    const getXLabel = () => isOhm ? 'Temperatura Patron' : isMv ? 'Temperatura Patron' : 'EU Patron (Entrada)';
    const getYLabel = () => isOhm ? 'Resistencia (Ω)' : isMv ? 'Voltaje (mV)' : 'Salida (mA)';
    const getChartTitle = () => isOhm ? 'Desviacion de Ohm' : isMv ? 'Curva de Respuesta Termopar (mV)' : 'Curva de Respuesta del Transmisor';
    const headerColor = isOhm ? 'from-teal-600 to-emerald-600' : isMv ? 'from-orange-600 to-red-600' : 'from-blue-600 to-indigo-600';

    return (
        <div className="mt-8 shadow-lg rounded-xl overflow-hidden border border-gray-200 bg-white" ref={containerRef}>
            <div className={`bg-gradient-to-r ${headerColor} px-6 py-5 text-white`}>
                <div className="flex items-center gap-4">
                    <span className="text-3xl">📈</span>
                    <div>
                        <h3 className="text-xl font-bold">{getChartTitle()}</h3>
                        <p className="text-blue-100 text-sm opacity-90">Eje X: {getXLabel()} | Eje Y: {getYLabel()}</p>
                    </div>
                </div>
            </div>

            <div className="p-6 bg-white">
                {processedData.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                        <p>No hay datos suficientes para generar la curva.</p>
                    </div>
                ) : (
                    <div className="h-[540px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={processedData} margin={{ top: 95, right: 50, left: 20, bottom: 75 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis 
                                    dataKey={getXKey()} 
                                    type="number" 
                                    domain={['dataMin', 'dataMax']} 
                                    tick={{ fontSize: 11 }}
                                    label={{ value: getXLabel(), position: 'insideBottom', offset: -55, fontSize: 12, fontWeight: 'bold' }} 
                                />
                                <YAxis 
                                    domain={isOhm || isMv ? ['auto', 'auto'] : [4, 20]} 
                                    ticks={isOhm || isMv ? undefined : [4, 8, 12, 16, 20]}
                                    tick={{ fontSize: 10 }}
                                    label={{ value: getYLabel(), angle: -90, position: 'insideLeft', fontWeight: 'bold', fontSize: 12 }} 
                                />
                                <Tooltip />
                                <Legend verticalAlign="top" height={36} />

                                {/* --- RENDERIZADO CONDICIONAL DE LINEAS --- */}
                                {isOhm && (
                                    <>
                                        <Line type="monotone" dataKey="idealOhm" stroke="#10b981" name="Ideal Ohm" strokeWidth={2} dot={makeDot('#10b981', 'Ideal Ω', OFF.L1)} />
                                        <Line type="monotone" dataKey="sensorOhm" stroke="#f59e0b" name="Sensor Ohm" strokeWidth={2} strokeDasharray="5 5" dot={makeDot('#f59e0b', 'Sensor Ω', OFF.L3)} />
                                    </>
                                )}

                                {isMv && (
                                    <>
                                        <Line type="monotone" dataKey="idealMv" stroke="#8b5cf6" name="mV Ideal" strokeWidth={2} dot={makeDot('#8b5cf6', 'Ideal mV', OFF.L1)} />
                                        <Line type="monotone" dataKey="sensorMv" stroke="#ec4899" name="mV Sensor" strokeWidth={2} strokeDasharray="5 5" dot={makeDot('#ec4899', 'Sensor mV', OFF.L3)} />
                                    </>
                                )}

                                {!isOhm && !isMv && (
                                    <>
                                        <Line type="monotone" dataKey="idealValue" stroke="#3b82f6" name="Ideal mA" strokeWidth={2} dot={makeDot('#3b82f6', 'Ideal mA', OFF.L1)} />
                                        <Line type="monotone" dataKey="measuredValue" stroke="#ef4444" name="Medido mA" strokeWidth={2} dot={makeDot('#ef4444', 'Medido mA', OFF.L3)} />
                                        {hasUeTransmitter && (
                                            <>
                                                <Line type="monotone" dataKey="idealUE" stroke="#10b981" name="Ideal UE" strokeWidth={2} strokeDasharray="5 5" dot={makeDot('#10b981', 'Ideal UE', OFF.L2)} />
                                                <Line type="monotone" dataKey="ueTransmitter" stroke="#f59e0b" name="UE Transmisor" strokeWidth={2} strokeDasharray="5 5" dot={makeDot('#f59e0b', 'UE Trans', OFF.L4)} />
                                            </>
                                        )}
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