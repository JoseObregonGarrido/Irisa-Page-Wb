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
        })).sort((a, b) => a.idealValue - b.idealValue);
    };

    const processedData = processDataForChart();

    // CLAVE: Cálculo de ticks para que se note la separación
    const getYTicks = () => {
        if (processedData.length === 0) return [];
        const allValues = processedData.flatMap(d => [d.idealUe, d.ueTransmitter]);
        const maxVal = Math.max(...allValues);
        const minVal = Math.min(...allValues);
        
        // Si el error es muy pequeño, reducimos el paso para dar más detalle
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
                        <h3 className="text-xl font-bold">Análisis del Transmisor ({labels.unit})</h3>
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
                                label={{ value: 'Escala (mA)', position: 'insideBottom', offset: -15, fontWeight: 'bold' }} 
                            />
                            
                            <YAxis 
                                // CLAVE: Usamos 'auto' con padding para que las líneas se separen
                                domain={['dataMin - 2', 'dataMax + 2']} 
                                ticks={yTicks}
                                label={{ value: 'Rango UE', angle: -90, position: 'insideLeft', fontWeight: 'bold' }}
                            />
                            
                            <Tooltip />
                            <Legend verticalAlign="top" height={36}/>
                            
                            {/* Línea Ideal: Azul sólida */}
                            <Line 
                                type="monotone" 
                                dataKey="idealUe" 
                                stroke="#3b82f6" 
                                name="Ideal UE" 
                                strokeWidth={3} 
                                dot={{ r: 6, fill: '#3b82f6' }} 
                                isAnimationActive={false} 
                            />
                            
                            {/* Línea Medida: Roja discontinua para que se note la separación */}
                            <Line 
                                type="monotone" 
                                dataKey="ueTransmitter" 
                                stroke="#ef4444" 
                                name="UE Transmisor (Real)" 
                                strokeWidth={3} 
                                strokeDasharray="8 4" // Esto hace que se entienda cuál es cuál incluso si están cerca
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