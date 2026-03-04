import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { toPng } from 'html-to-image';
import { useRef, useImperativeHandle, forwardRef } from 'react';

export interface Measurement {
    idealmV?: string;
    sensormV?: string;
    sensorType?: 'J' | 'K';
    errormV?: string;
}

interface MvChartProps {
    measurements?: Measurement[];
    data?: Measurement[];
}

const MvChart = forwardRef<any, MvChartProps>(({ 
    measurements, 
    data 
}, ref) => {
    const chartData = measurements || data || [];
    const containerRef = useRef<HTMLDivElement>(null);

    // Procesamiento de datos para el gráfico
    const processedData = chartData.map((m, index) => {
        const idealmV = parseFloat(m.idealmV || "0");
        const sensormV = parseFloat(m.sensormV || "0");

        return {
            index: index + 1,
            idealmV: idealmV,
            sensormV: sensormV,
            deviation: Math.abs(sensormV - idealmV).toFixed(3)
        };
    });

    // Cálculo dinámico del eje Y
    const getYTicks = () => {
        if (processedData.length === 0) return [0, 5, 10, 15, 20];
        
        const mvValues = processedData.flatMap(d => [d.idealmV, d.sensormV]).filter(v => v !== null);
        const maxVal = mvValues.length > 0 ? Math.max(...mvValues) : 20;
        const minVal = mvValues.length > 0 ? Math.min(...mvValues, 0) : 0;
        
        let step = 5;
        if (maxVal > 50) step = 10;
        if (maxVal > 100) step = 20;
        if (maxVal > 200) step = 50;

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
            <div className="bg-gradient-to-r from-orange-600 to-amber-600 px-6 py-5 text-white">
                <div className="flex items-center gap-4">
                    <span className="text-3xl">📊</span>
                    <div>
                        <h3 className="text-xl font-bold">Desviación de mV (Termopar)</h3>
                        <p className="text-orange-100 text-sm opacity-90">mV ideal vs mV Sensor</p>
                    </div>
                </div>
            </div>

            <div className="p-6 bg-white">
                {processedData.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                        <p>No hay datos suficientes para generar la desviación del termopar.</p>
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height={400}>
                        <LineChart data={processedData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis 
                                dataKey="index" 
                                label={{ value: 'Número de Medición', position: 'insideBottomRight', offset: -5 }}
                                stroke="#9ca3af"
                            />
                            <YAxis 
                                ticks={yTicks}
                                label={{ value: 'mV', angle: -90, position: 'insideLeft' }}
                                stroke="#9ca3af"
                            />
                            <Tooltip 
                                contentStyle={{ 
                                    backgroundColor: '#ffffff', 
                                    border: '2px solid #10b981',
                                    borderRadius: '8px'
                                }}
                                formatter={(value) => (typeof value === 'number' ? value.toFixed(2) : value)}
                            />
                            <Legend 
                                verticalAlign="top" 
                                height={36}
                                wrapperStyle={{ paddingBottom: '20px' }}
                            />
                            <Line 
                                type="monotone" 
                                dataKey="idealmV" 
                                stroke="#22c55e" 
                                strokeWidth={3}
                                dot={{ fill: '#22c55e', r: 5 }}
                                activeDot={{ r: 7 }}
                                name="mV ideal"
                                isAnimationActive={false}
                            />
                            <Line 
                                type="monotone" 
                                dataKey="sensormV" 
                                stroke="#fb923c" 
                                strokeWidth={3}
                                strokeDasharray="5 5"
                                dot={{ fill: '#fb923c', r: 5 }}
                                activeDot={{ r: 7 }}
                                name="mV Sensor"
                                isAnimationActive={false}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
});

MvChart.displayName = 'MvChart';

export default MvChart;
