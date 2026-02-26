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

    const labels = {
        title: isOhm ? 'Análisis RTD (Sensor)' : 'Análisis del Transmisor',
        xAxis: isOhm ? 'Escala (mA sensor)' : 'Escala (mA)',
        yAxis: 'Rango UE / Desviación',
        unit: isOhm ? 'RTD' : 'mA'
    };

    const processDataForChart = () => {
        return chartData.map((m) => ({
            percentage: parseFloat(m.percentage) || 0,
            idealUE: parseFloat(m.idealUE || (m as any).idealUe) || 0,
            ueTransmitter: parseFloat(m.ueTransmitter) || 0,
            idealValue: parseFloat(m.idealmA) || 0, 
            measuredValue: parseFloat(m.maTransmitter) || 0,
            deviation: parseFloat(m.errormA) || 0 // Agregamos la desviación de corriente
        })).sort((a, b) => a.idealValue - b.idealValue);
    };

    const processedData = processDataForChart();

    // LÓGICA DE SALTOS DE 4 EN 4
    const getYTicks = () => {
        if (processedData.length === 0) return [0, 4, 8, 12, 16, 20];
        
        const allValues = processedData.flatMap(d => [d.idealUE, d.ueTransmitter]);
        const maxVal = Math.max(...allValues);
        const minVal = Math.min(...allValues, 0); // Empezamos desde 0 o el mínimo para ver errores negativos
        
        const ticks = [];
        // Forzamos el inicio al múltiplo de 4 inferior y el fin al superior
        const start = Math.floor(minVal / 4) * 4;
        const end = Math.ceil(maxVal / 4) * 4;
        
        for (let i = start; i <= end; i += 4) {
            ticks.push(i);
        }
        return ticks;
    };

    const yTicks = getYTicks();

    useImperativeHandle(ref, () => ({
        captureAllCharts: async () => {
            if (responseRef.current) {
                const dataUrl = await toPng(responseRef.current, { 
                    backgroundColor: '#ffffff', 
                    pixelRatio: 2,
                    cacheBust: true 
                });
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
                        <p className="text-blue-100 text-sm opacity-90">Visualización con saltos de 4 unidades y desviación</p>
                    </div>
                </div>
            </div>

            <div className="p-6 bg-white" ref={responseRef}>
                <h4 className="text-lg font-semibold text-gray-700 mb-4 text-center">Curva de Respuesta vs Ideal</h4>
                <div className="h-96 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={processedData} margin={{ top: 20, right: 30, left: 20, bottom: 25 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            
                            <XAxis 
                                dataKey="idealValue" 
                                type="number"
                                domain={[4, 20]}
                                ticks={[4, 8, 12, 16, 20]}
                                label={{ value: labels.xAxis, position: 'insideBottom', offset: -15, fontWeight: 'bold', fontSize: 12 }} 
                            />
                            
                            <YAxis 
                                domain={[yTicks[0], yTicks[yTicks.length - 1]]} 
                                ticks={yTicks} // AQUÍ SE APLICAN LOS SALTOS DE 4 EN 4
                                label={{ value: labels.yAxis, angle: -90, position: 'insideLeft', fontWeight: 'bold', fontSize: 12 }}
                            />
                            
                            <Tooltip 
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                formatter={(value: any) => [value.toFixed(3), ""]}
                            />
                            <Legend verticalAlign="top" height={36}/>
                            
                            <Line 
                                type="monotone" 
                                dataKey="idealUE" 
                                stroke="#3b82f6" 
                                name="Ideal UE" 
                                strokeWidth={3} 
                                dot={{ r: 5, fill: '#3b82f6' }} 
                                isAnimationActive={false} 
                            />
                            
                            <Line 
                                type="monotone" 
                                dataKey="ueTransmitter" 
                                stroke="#ef4444" 
                                name="UE Real" 
                                strokeWidth={3} 
                                strokeDasharray="5 5"
                                dot={{ r: 5, fill: '#ef4444' }} 
                                isAnimationActive={false} 
                            />

                            {/* LÍNEA DE DESVIACIÓN DE CORRIENTE (mA) */}
                            <Line 
                                type="monotone" 
                                dataKey="deviation" 
                                stroke="#f59e0b" 
                                name="Desviación mA" 
                                strokeWidth={2} 
                                dot={{ r: 3, fill: '#f59e0b' }} 
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