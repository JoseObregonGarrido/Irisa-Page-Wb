import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { toPng } from 'html-to-image';
import { useRef, useImperativeHandle, forwardRef } from 'react';

// Mantengo tu interfaz de datos original intacta
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

// Cajita SVG personalizada (permanente)
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

    // --- CAMBIO CLAVE: TRANSFORMACION DE DATOS ---
    // Mapeamos los datos para que tengan la estructura correcta de linealidad
    const processedData = chartData.map((m) => {
        const xEU     = parseFloat(m.idealUE || m.idealUe || '0');
        const yIdeal  = parseFloat(m.idealmA || m.idealMa || '0');
        const yMeasmA = parseFloat(m.maTransmitter) || 0;
        const yMeasUE = m.ueTransmitter ? parseFloat(m.ueTransmitter) : null;
        
        return {
            // Eje X: Unidades de Ingenieria Patron
            xEU: xEU, 
            // Eje Y: Valores a graficar
            yIdeal: yIdeal,
            yMeasmA: yMeasmA,
            yMeasUE: yMeasUE, 
        };
    }).sort((a, b) => a.xEU - b.xEU); // Aseguramos que estén ordenados en X

    useImperativeHandle(ref, () => ({
        captureAllCharts: async () => {
            if (containerRef.current) {
                return [await toPng(containerRef.current, { backgroundColor: '#ffffff', pixelRatio: 2 })];
            }
            return [];
        }
    }));

    return (
        <div className="mt-8 shadow-lg rounded-xl overflow-hidden border border-gray-200 bg-white" ref={containerRef}>
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5 text-white">
                <div className="flex items-center gap-4">
                    <span className="text-3xl">📈</span>
                    <div>
                        <h3 className="text-xl font-bold">Curva de Respuesta del Transmisor</h3>
                        <p className="text-blue-100 text-sm opacity-90">Eje X: Entrada Física (EU Patron) | Eje Y: Salida Eléctrica (mA)</p>
                    </div>
                </div>
            </div>

            <div className="p-6 bg-white">
                <div className="h-[520px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={processedData} margin={{ top: 70, right: 30, left: 20, bottom: 60 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            
                            {/* --- CAMBIO CLAVE EN EJES --- */}
                            <XAxis 
                                dataKey="xEU" 
                                type="number" 
                                domain={['dataMin', 'dataMax']} // Adaptable al rango del sensor (0-200, 0-1000, etc.)
                                tick={{ fontSize: 11 }}
                                label={{ value: 'EU Patron (Entrada)', position: 'insideBottom', offset: -40, fontSize: 12, fontWeight: 'bold' }}
                            />
                            <YAxis 
                                ticks={[4, 8, 12, 16, 20]} 
                                domain={[4, 20]} // Eje Y exclusivo para mA
                                tick={{ fontSize: 11 }}
                                label={{ value: 'Salida (mA)', angle: -90, position: 'insideLeft', fontWeight: 'bold', fontSize: 12 }}
                            />

                            <Tooltip 
                                formatter={(val: any) => [`${Number(val).toFixed(2)} mA`, ""]}
                                labelFormatter={(label) => `Punto EU: ${label}`}
                            />
                            <Legend verticalAlign="top" height={36} />
                            
                            {/* --- CAMBIO CLAVE EN LINEAS --- */}
                            {/* Referencia Ideal - Como la linea azul del tablero */}
                            <Line type="monotone" dataKey="yIdeal" stroke="#3b82f6" name="Ideal (mA)" strokeWidth={2}
                                dot={makeDot('#3b82f6', 'Ideal', OFF.TOP)}
                                isAnimationActive={false} />

                            {/* Salida Real Medida - Como la linea verde del tablero */}
                            <Line type="monotone" dataKey="yMeasmA" stroke="#10b981" name="Medido (mA Transmisor)" strokeWidth={3}
                                dot={makeDot('#10b981', 'Real', OFF.BOTTOM)}
                                activeDot={{ r: 6 }}
                                isAnimationActive={false} />
                                
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
});

export default TransmitterChart;