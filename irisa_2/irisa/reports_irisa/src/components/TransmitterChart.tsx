import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { toPng } from 'html-to-image';
import React, { useRef, useImperativeHandle, forwardRef } from 'react';

export interface Measurement {
    percentage: string;
    idealUE: string;
    patronUE: string;
    ueTransmitter: string;
    idealmA: string;
    maTransmitter: string;
    errorUE: string;
    errormA: string;
    errorPercentage: string;
}

interface TransmitterChartProps {
    measurements?: Measurement[];
    data?: Measurement[];
    outputUnit?: 'mA' | 'ohm' | string; 
}

const TransmitterChart = forwardRef<any, TransmitterChartProps>(({ measurements, data, outputUnit = 'mA' }, ref) => {
    const chartData = measurements || data || [];
    const responseRef = useRef<HTMLDivElement>(null);
    const isOhm = outputUnit === 'ohm';

    // Labels dinámicos para que coincidan con la lógica de la tabla
    const labels = {
        title: isOhm ? 'Análisis del Sensor' : 'Análisis del Transmisor',
        xAxis: isOhm ? 'Escala (mA sensor)' : 'Escala (mA)',
        yAxis: 'Rango UE',
        measuredLine: isOhm ? 'mA sensor (Real)' : 'mA transmisor (Real)',
        unit: outputUnit
    };

    const processDataForChart = () => {
        return chartData.map((m) => ({
            percentage: parseFloat(m.percentage) || 0,
            idealUE: parseFloat(m.idealUE || (m as any).idealUe) || 0,
            ueTransmitter: parseFloat(m.ueTransmitter) || 0,
            // Usamos maTransmitter para el eje X ya que es la variable común
            idealValue: parseFloat(m.idealmA) || 0, 
            measuredValue: parseFloat(m.maTransmitter) || 0, 
        })).sort((a, b) => a.idealValue - b.idealValue);
    };

    const processedData = processDataForChart();

    const getYTicks = () => {
        if (processedData.length === 0) return [];
        const allValues = processedData.flatMap(d => [d.idealUE, d.ueTransmitter]);
        const maxVal = Math.max(...allValues);
        const minVal = Math.min(...allValues);
        
        const range = maxVal - minVal;
        let step = 10;
        if (range <= 10) step = 1;
        else if (range <= 50) step = 5;

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
        captureAllCharts: async () => {
            if (responseRef.current) {
                const dataUrl = await toPng(responseRef.current, { backgroundColor: '#ffffff', pixelRatio: 2 });
                return [dataUrl];
            }
            return [];
        }
    }));

    return (
        <div className="mt-8 shadow-lg rounded-xl overflow-hidden border border-gray-100 bg-white">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5 text-white">
                <div className="flex items-center gap-4">
                    <span className="text-3xl">📊</span>
                    <div>
                        <h3 className="text-xl font-bold">{labels.title} ({labels.unit})</h3>
                        <p className="text-blue-100 text-sm opacity-90">Visualización detallada de curva de error</p>
                    </div>
                </div>
            </div>

            <div className="p-6 bg-white" ref={responseRef}>
                <h4 className="text-lg font-semibold text-gray-700 mb-4 text-center">Curva de Respuesta</h4>
                <div className="h-96 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={processedData} margin={{ top: 20, right: 30, left: 20, bottom: 25 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            
                            <XAxis 
                                dataKey="idealValue" 
                                type="number"
                                domain={[4, 20]}
                                ticks={[4, 8, 12, 16, 20]}
                                label={{ value: labels.xAxis, position: 'insideBottom', offset: -15, fontWeight: 'bold' }} 
                            />
                            
                            <YAxis 
                                domain={['dataMin - 2', 'dataMax + 2']} 
                                ticks={yTicks}
                                label={{ value: labels.yAxis, angle: -90, position: 'insideLeft', fontWeight: 'bold' }}
                            />
                            
                            <Tooltip />
                            <Legend verticalAlign="top" height={36}/>
                            
                            <Line 
                                type="monotone" 
                                dataKey="idealUE" 
                                stroke="#3b82f6" 
                                name="Ideal UE" 
                                strokeWidth={3} 
                                dot={{ r: 6, fill: '#3b82f6' }} 
                                isAnimationActive={false} 
                            />
                            
                            <Line 
                                type="monotone" 
                                dataKey="ueTransmitter" 
                                stroke="#ef4444" 
                                name="UE transmisor (Real)" 
                                strokeWidth={3} 
                                strokeDasharray="8 4"
                                dot={{ r: 6, fill: '#ef4444', strokeWidth: 2, stroke: '#fff' }} 
                                connectNulls 
                                isAnimationActive={false} 
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
});

export default TransmitterChart;