import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { toPng } from 'html-to-image';
import React, { useRef, useImperativeHandle, forwardRef } from 'react';

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
    errorUE?: string;
    errorUe?: string;
    errormA?: string;
    errorMa?: string;
    errorPercentage: string;
}

interface TransmitterChartProps {
    measurements?: Measurement[];
    data?: Measurement[];
    outputUnit?: 'mA' | 'ohm' | string;
}

const TransmitterChart = forwardRef<any, TransmitterChartProps>(({ measurements, data, outputUnit = 'mA' }, ref) => {
    const chartData = measurements || data || [];
    const containerRef = useRef<HTMLDivElement>(null);
    const isOhm = outputUnit === 'ohm';

    // Normalización y procesamiento de datos incluyendo desviación
    const processedData = chartData.map((m) => ({
        percentage: parseFloat(m.percentage) || 0,
        idealUE: parseFloat(m.idealUE || m.idealUe || "0"),
        ueTransmitter: parseFloat(m.ueTransmitter) || 0,
        idealValue: parseFloat(m.idealmA || m.idealMa || "0"),
        measuredValue: parseFloat(m.maTransmitter) || 0,
        deviation: parseFloat(m.errormA || m.errorMa || "0"), // Desviación de corriente
    })).sort((a, b) => a.percentage - b.percentage);

    // LÓGICA DE SALTOS DE 4 EN 4 PARA EL EJE Y
    const getYTicks = () => {
        if (processedData.length === 0) return [0, 4, 8, 12, 16, 20];
        
        const allValues = processedData.flatMap(d => [d.idealUE, d.ueTransmitter]);
        const maxVal = Math.max(...allValues);
        const minVal = Math.min(...allValues, 0); 
        
        const ticks = [];
        const start = Math.floor(minVal / 4) * 4;
        const end = Math.ceil(maxVal / 4) * 4;
        
        for (let i = start; i <= end; i += 4) {
            ticks.push(i);
        }
        return ticks;
    };

    const yTicks = getYTicks();

    // Exponer captura para PDF
    useImperativeHandle(ref, () => ({
        captureAllCharts: async () => {
            if (containerRef.current) {
                const dataUrl = await toPng(containerRef.current, {
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
        <div className="mt-8 shadow-lg rounded-xl overflow-hidden border border-gray-200 bg-white" ref={containerRef}>
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5 text-white">
                <div className="flex items-center gap-4">
                    <span className="text-3xl">📈</span>
                    <div>
                        <h3 className="text-xl font-bold">
                            {isOhm ? 'Curva de Respuesta RTD' : 'Curva de Respuesta del Transmisor'}
                        </h3>
                        <p className="text-blue-100 text-sm opacity-90">Saltos de 4 unidades y análisis de desviación</p>
                    </div>
                </div>
            </div>

            {/* Chart Area */}
            <div className="p-6 bg-white">
                {processedData.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                        <p>No hay datos suficientes para generar la curva de respuesta.</p>
                    </div>
                ) : (
                    <div className="h-96 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={processedData} margin={{ top: 20, right: 30, left: 20, bottom: 25 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                
                                <XAxis 
                                    dataKey="percentage" 
                                    label={{ value: '4-20 mA', position: 'insideBottom', offset: -10, fontSize: 12, fontWeight: 'bold' }} 
                                />

                                <YAxis 
                                    ticks={yTicks} 
                                    domain={[yTicks[0], yTicks[yTicks.length - 1]]}
                                    tick={{ fontSize: 10 }}
                                    label={{ value: 'Rango UE / Desviación', angle: -90, position: 'insideLeft', fontWeight: 'bold', fontSize: 12 }}
                                />

                                <Tooltip 
                                    contentStyle={{ borderRadius: '8px', fontSize: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    formatter={(value: any, name: string) => [value.toFixed(3), name]}
                                />
                                <Legend verticalAlign="top" height={36} />
                                
                                {/* Líneas principales de respuesta */}
                                <Line type="monotone" dataKey="idealValue" stroke="#3b82f6" name="Ideal mA" strokeWidth={2} dot={{ r: 4 }} isAnimationActive={false} />
                                <Line type="monotone" dataKey="measuredValue" stroke="#ef4444" name="Medido mA" strokeWidth={2} dot={{ r: 4 }} isAnimationActive={false} />
                                <Line type="monotone" dataKey="idealUE" stroke="#10b981" name="Ideal UE" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3 }} isAnimationActive={false} />
                                <Line type="monotone" dataKey="ueTransmitter" stroke="#f59e0b" name="UE Transmisor" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3 }} isAnimationActive={false} />
                                
                                {/* Línea de Desviación */}
                                <Line type="monotone" dataKey="deviation" stroke="#8b5cf6" name="Desviación mA" strokeWidth={2} dot={{ r: 3 }} isAnimationActive={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>
        </div>
    );
});

export default TransmitterChart;