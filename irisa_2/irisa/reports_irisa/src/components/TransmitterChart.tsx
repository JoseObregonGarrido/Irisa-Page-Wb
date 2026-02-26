import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { toPng } from 'html-to-image';
import React, { useRef, useImperativeHandle, forwardRef } from 'react';

export interface Measurement {
    percentage: string;
    idealUe: string;
    patronUe: string;
    ueTransmitter: string;
    idealmA: string;
    maTransmitter: string;
    errorUe: string;
    errorMa: string;
    errorPercentage: string;
}

interface TransmitterChartProps {
    measurements?: Measurement[];
    data?: Measurement[];
    outputUnit?: 'mA' | 'Ω' | string; 
}

const TransmitterChart = forwardRef<any, TransmitterChartProps>(({ measurements, data, outputUnit = 'mA' }, ref) => {
    const chartData = measurements || data || [];
    const responseRef = useRef<HTMLDivElement>(null);

    const labels = {
        ideal: `Ideal ${outputUnit}`,
        measured: `Medido ${outputUnit}`,
        unit: outputUnit
    };

    const processDataForChart = () => {
        return chartData.map((m) => ({
            percentage: parseFloat(m.percentage) || 0,
            idealUe: parseFloat(m.idealUe) || 0,
            ueTransmitter: parseFloat(m.ueTransmitter) || 0,
            idealValue: parseFloat(m.idealmA) || 0, 
            measuredValue: parseFloat(m.maTransmitter) || 0, 
        })).sort((a, b) => a.idealValue - b.idealValue); // Ordenado por mA (Eje X)
    };

    const processedData = processDataForChart();

    // Lógica para calcular intervalos de 5 en 5 o 10 en 10 para el eje Y
    const getYTicks = () => {
        if (processedData.length === 0) return [];
        
        const allValues = processedData.flatMap(d => [d.idealUe, d.ueTransmitter]);
        const maxVal = Math.max(...allValues);
        const minVal = Math.min(...allValues);
        
        // Decidimos el salto: si el rango es pequeño (< 50) usamos saltos de 5, si no, de 10.
        const step = (maxVal - minVal) <= 50 ? 5 : 10;
        
        const ticks = [];
        // Redondeamos el inicio y fin para que los saltos sean limpios
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
            {/* Cabecera visual */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5 text-white">
                <div className="flex items-center gap-4">
                    <span className="text-3xl">📊</span>
                    <div>
                        <h3 className="text-xl font-bold">Análisis del Transmisor ({labels.unit})</h3>
                        <p className="text-blue-100 text-sm opacity-90">Visualización de datos</p>
                    </div>
                </div>
            </div>

            {/* Menú de Pestañas (Solo Respuesta) */}
            <div className="bg-gray-50 border-b flex overflow-x-auto shadow-inner">
                <button
                    className="px-6 py-4 text-sm font-semibold transition-all border-b-2 whitespace-nowrap flex items-center gap-2 border-blue-600 text-blue-700 bg-white"
                >
                    <span>📈</span> Respuesta
                </button>
            </div>

            {/* Contenedor del Gráfico */}
            <div className="p-6 bg-white" ref={responseRef}>
                <h4 className="text-lg font-semibold text-gray-700 mb-4 text-center">Curva de Respuesta</h4>
                <div className="h-96 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={processedData} margin={{ top: 20, right: 30, left: 20, bottom: 25 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            
                            {/* X: Escala de 4-20 mA con saltos fijos */}
                            <XAxis 
                                dataKey="idealValue" 
                                type="number"
                                domain={[4, 20]}
                                ticks={[4, 8, 12, 16, 20]}
                                label={{ value: 'Escala (mA)', position: 'insideBottom', offset: -15, fontWeight: 'bold' }} 
                            />
                            
                            {/* Y: Rango UE con saltos de 5 o 10 calculados */}
                            <YAxis 
                                ticks={yTicks.length > 0 ? yTicks : undefined}
                                label={{ value: 'Rango UE', angle: -90, position: 'insideLeft', fontWeight: 'bold' }}
                                domain={['auto', 'auto']}
                            />
                            
                            <Tooltip />
                            <Legend verticalAlign="top" height={36}/>
                            
                            {/* Primera: Ideal UE vs Ideal mA */}
                            <Line 
                                type="monotone" 
                                dataKey="idealUe" 
                                stroke="#3b82f6" 
                                name="Ideal UE vs Ideal mA" 
                                strokeWidth={3} 
                                dot={{ r: 5, fill: '#3b82f6' }} 
                                isAnimationActive={false} 
                            />
                            
                            {/* Segunda: UE Transmisor vs mA Transmisor */}
                            <Line 
                                type="monotone" 
                                dataKey="ueTransmitter" 
                                stroke="#ef4444" 
                                name="UE Transmisor vs mA Transmisor" 
                                strokeWidth={2} 
                                strokeDasharray="5 5"
                                dot={{ r: 5, fill: '#ef4444' }} 
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