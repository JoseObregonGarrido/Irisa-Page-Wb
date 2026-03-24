import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { toPng } from 'html-to-image';
import { useRef, useImperativeHandle, forwardRef } from 'react';

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

// Cajita SVG personalizada
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

const TransmitterChart = forwardRef<any, TransmitterChartProps>(({ measurements, data }, ref) => {
    const chartData = measurements || data || [];
    const containerRef = useRef<HTMLDivElement>(null);

    // Procesamiento de datos
    const processedData = chartData.map((m) => {
        const xEU = parseFloat(m.idealUE || m.idealUe || '0');
        const yIdealMA = parseFloat(m.idealmA || m.idealMa || '0');
        const yMeasmA = parseFloat(m.maTransmitter) || 0;
        const yIdealEU = parseFloat(m.idealUE || m.idealUe || '0');
        const yMeasEU = m.ueTransmitter ? parseFloat(m.ueTransmitter) : null;

        return {
            xEU: xEU,
            yIdealMA: yIdealMA,
            yMeasmA: yMeasmA,
            yIdealEU: yIdealEU,
            yMeasEU: yMeasEU,
        };
    }).sort((a, b) => a.xEU - b.xEU);

    // Calcular rangos dinámicos para EU
    const euValues = processedData.flatMap(d => [d.yIdealEU, d.yMeasEU].filter(v => v !== null && v !== undefined));
    const minEU = euValues.length > 0 ? Math.min(...euValues) : 0;
    const maxEU = euValues.length > 0 ? Math.max(...euValues) : 100;
    const euRange = [Math.floor(minEU * 0.9), Math.ceil(maxEU * 1.1)];

    useImperativeHandle(ref, () => ({
        captureAllCharts: async () => {
            if (containerRef.current) {
                return [await toPng(containerRef.current, { backgroundColor: '#ffffff', pixelRatio: 2 })];
            }
            return [];
        }
    }));

    return (
        <div className="space-y-8 p-4" ref={containerRef}>
            {/* GRÁFICA 1: mA vs EU Patrón */}
            <div className="shadow-lg rounded-xl overflow-hidden border border-gray-200 bg-white">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5 text-white">
                    <div className="flex items-center gap-4">
                        <span className="text-3xl">⚡</span>
                        <div>
                            <h3 className="text-xl font-bold">Gráfica 1: Salida en mA</h3>
                            <p className="text-blue-100 text-sm opacity-90">EU Patrón (X) vs mA (Y) | Ideal vs Medido</p>
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-white">
                    <div className="h-[480px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={processedData} margin={{ top: 70, right: 30, left: 20, bottom: 60 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />

                                <XAxis
                                    dataKey="xEU"
                                    type="number"
                                    domain={['dataMin', 'dataMax']}
                                    tick={{ fontSize: 11 }}
                                    label={{ value: 'EU Patrón (Entrada)', position: 'insideBottom', offset: -40, fontSize: 12, fontWeight: 'bold' }}
                                />
                                <YAxis
                                    ticks={[4, 8, 12, 16, 20]}
                                    domain={[4, 20]}
                                    tick={{ fontSize: 11 }}
                                    label={{ value: 'Salida (mA)', angle: -90, position: 'insideLeft', fontWeight: 'bold', fontSize: 12 }}
                                />

                                <Tooltip
                                    formatter={(val: any) => [`${Number(val).toFixed(2)} mA`, ""]}
                                    labelFormatter={(label) => `EU Patrón: ${label}`}
                                />
                                <Legend verticalAlign="top" height={36} />

                                <Line type="monotone" dataKey="yIdealMA" stroke="#3b82f6" name="mA Ideal" strokeWidth={2}
                                    dot={makeDot('#3b82f6', 'Ideal', OFF.TOP)}
                                    isAnimationActive={false} />

                                <Line type="monotone" dataKey="yMeasmA" stroke="#10b981" name="mA Medido" strokeWidth={3}
                                    dot={makeDot('#10b981', 'Real', OFF.BOTTOM)}
                                    activeDot={{ r: 6 }}
                                    isAnimationActive={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* GRÁFICA 2: EU vs EU Patrón */}
            <div className="shadow-lg rounded-xl overflow-hidden border border-gray-200 bg-white">
                <div className="bg-gradient-to-r from-amber-600 to-orange-600 px-6 py-5 text-white">
                    <div className="flex items-center gap-4">
                        <span className="text-3xl">📊</span>
                        <div>
                            <h3 className="text-xl font-bold">Gráfica 2: Entrada en EU</h3>
                            <p className="text-amber-100 text-sm opacity-90">EU Patrón (X) vs EU (Y) | Ideal vs Medido</p>
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-white">
                    <div className="h-[480px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={processedData} margin={{ top: 70, right: 30, left: 20, bottom: 60 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />

                                <XAxis
                                    dataKey="xEU"
                                    type="number"
                                    domain={['dataMin', 'dataMax']}
                                    tick={{ fontSize: 11 }}
                                    label={{ value: 'EU Patrón (Entrada)', position: 'insideBottom', offset: -40, fontSize: 12, fontWeight: 'bold' }}
                                />
                                <YAxis
                                    domain={euRange}
                                    tick={{ fontSize: 11 }}
                                    label={{ value: 'EU Medido', angle: -90, position: 'insideLeft', fontWeight: 'bold', fontSize: 12 }}
                                />

                                <Tooltip
                                    formatter={(val: any) => [`${Number(val).toFixed(2)} EU`, ""]}
                                    labelFormatter={(label) => `EU Patrón: ${label}`}
                                />
                                <Legend verticalAlign="top" height={36} />

                                <Line type="monotone" dataKey="yIdealEU" stroke="#8b5cf6" name="EU Ideal" strokeWidth={2}
                                    dot={makeDot('#8b5cf6', 'Ideal', OFF.TOP)}
                                    isAnimationActive={false} />

                                <Line type="monotone" dataKey="yMeasEU" stroke="#f59e0b" name="EU Medido" strokeWidth={3}
                                    dot={makeDot('#f59e0b', 'Real', OFF.BOTTOM)}
                                    activeDot={{ r: 6 }}
                                    isAnimationActive={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
});

export default TransmitterChart;