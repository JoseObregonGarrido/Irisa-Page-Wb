import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { toPng } from 'html-to-image';
import { useRef, useImperativeHandle, forwardRef } from 'react';

export interface Measurement {
    idealohm?: string;
    ohmTransmitter?: string;
    idealmA?: string;
    maTransmitter?: string;
    percentage?: string;
    errorOhm?: string;
    errormA?: string;
}

interface OhmChartProps {
    measurements?: Measurement[];
    data?: Measurement[];
}

const OhmChart = forwardRef<any, OhmChartProps>(({ 
    measurements, 
    data 
}, ref) => {
    const chartData = measurements || data || [];
    const containerRef = useRef<HTMLDivElement>(null);

    // Procesamiento de datos para el gráfico
    const processedData = chartData.map((m, index) => {
        const idealOhm = parseFloat(m.idealohm || "0");
        const ohmSensor = parseFloat(m.ohmTransmitter || "0");
        const idealmA = parseFloat(m.idealmA || "0");

        return {
            index: index + 1,
            idealOhm: idealOhm,
            ohmSensor: ohmSensor,
            idealmA: idealmA,
            deviation: Math.abs(ohmSensor - idealOhm).toFixed(3)
        };
    });

    // Cálculo dinámico del eje Y
    const getYTicks = () => {
        if (processedData.length === 0) return [0, 50, 100, 150, 200];
        
        const ohmValues = processedData.flatMap(d => [d.idealOhm, d.ohmSensor]).filter(v => v !== null);
        const maxVal = ohmValues.length > 0 ? Math.max(...ohmValues) : 200;
        const minVal = ohmValues.length > 0 ? Math.min(...ohmValues, 0) : 0;
        
        let step = 50;
        if (maxVal > 500) step = 100;
        if (maxVal > 1000) step = 200;

        const ticks = [];
        const start = Math.floor(minVal / step) * step;
        const end = Math.ceil(maxVal / step) * step;
        
        for (let i = start; i <= end; i += step) {
            ticks.push(i);
        }
        return ticks;
    };

    const yTicks = getYTicks();

    useImperativeHandle(ref, () => ({
        captureChart: async () => {
            if (containerRef.current) {
                const dataUrl = await toPng(containerRef.current, {
                    backgroundColor: '#ffffff',
                    pixelRatio: 2,
                    cacheBust: true
                });
                return dataUrl;
            }
            return '';
        }
    }));

    return (
        <div className="mt-8 shadow-lg rounded-xl overflow-hidden border border-gray-200 bg-white" ref={containerRef}>
            <div className="bg-gradient-to-r from-teal-600 to-emerald-600 px-6 py-5 text-white">
                <div className="flex items-center gap-4">
                    <span className="text-3xl">📊</span>
                    <div>
                        <h3 className="text-xl font-bold"> Desviacion de  (Ohm)</h3>
                        <p className="text-teal-100 text-sm opacity-90">Ideal Ohm vs Ohm Sensor</p>
                    </div>
                </div>
            </div>

            <div className="p-6 bg-white">
                {processedData.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                        <p>No hay datos suficientes para generar la desviacion de el RTD.</p>
                    </div>
                ) : (
                    <div className="h-96 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={processedData} margin={{ top: 20, right: 30, left: 20, bottom: 25 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                
                                <XAxis 
                                    dataKey="index" 
                                    label={{ value: 'Medición #', position: 'insideBottom', offset: -10, fontSize: 12, fontWeight: 'bold' }} 
                                />

                                <YAxis 
                                    ticks={yTicks}
                                    domain={[yTicks[0], yTicks[yTicks.length - 1]]}
                                    label={{ value: 'Resistencia (Ω)', angle: -90, position: 'insideLeft', fontWeight: 'bold', fontSize: 12 }}
                                />

                                <Tooltip 
                                    contentStyle={{ borderRadius: '8px', fontSize: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    formatter={(value: any, name: string) => [value !== null ? value.toFixed(3) : '---', name]}
                                    labelFormatter={(label) => `Medición: ${label}`}
                                />
                                <Legend verticalAlign="top" height={36} />
                                
                                {/* Líneas de datos */}
                                <Line 
                                    type="monotone" 
                                    dataKey="idealOhm" 
                                    stroke="#10b981" 
                                    name="Ideal Ohm" 
                                    strokeWidth={2.5} 
                                    dot={{ r: 5 }} 
                                    isAnimationActive={false} 
                                />
                                <Line 
                                    type="monotone" 
                                    dataKey="ohmSensor" 
                                    stroke="#f59e0b" 
                                    name="Ohm Sensor" 
                                    strokeWidth={2.5} 
                                    strokeDasharray="5 5" 
                                    dot={{ r: 5 }} 
                                    isAnimationActive={false} 
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>
        </div>
    );
});

OhmChart.displayName = 'OhmChart';

export default OhmChart;
