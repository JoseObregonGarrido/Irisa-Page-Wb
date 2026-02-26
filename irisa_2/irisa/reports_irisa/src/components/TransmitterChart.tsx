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
            patronUE: parseFloat(m.patronUE) || 0,
            ueTransmitter: parseFloat(m.ueTransmitter) || 0,
            idealValue: parseFloat(m.idealmA) || 0, 
            measuredValue: parseFloat(m.maTransmitter) || 0,
            deviation: parseFloat(m.errormA) || 0 
        })).sort((a, b) => a.idealValue - b.idealValue);
    };

    const processedData = processDataForChart();

    const getYTicks = () => {
        if (processedData.length === 0) return [0, 4, 8, 12, 16, 20];
        const allValues = processedData.flatMap(d => [d.idealUE, d.ueTransmitter]);
        const maxVal = Math.max(...allValues);
        const minVal = Math.min(...allValues, 0);
        const ticks = [];
        const start = Math.floor(minVal / 4) * 4;
        const end = Math.ceil(maxVal / 4) * 4;
        for (let i = start; i <= end; i += 4) { ticks.push(i); }
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
                        <p className="text-blue-100 text-sm opacity-90">Gráfico de Linealidad y Desviación</p>
                    </div>
                </div>
            </div>

            {/* Este es el contenedor que se captura para el PDF */}
            <div className="p-6 bg-white" ref={responseRef}>
                <h4 className="text-lg font-semibold text-gray-700 mb-4 text-center">Curva de Respuesta vs Ideal</h4>
                
                <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={processedData} margin={{ top: 20, right: 30, left: 20, bottom: 25 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis 
                                dataKey="idealValue" 
                                type="number"
                                domain={[4, 20]}
                                ticks={[4, 8, 12, 16, 20]}
                                label={{ value: labels.xAxis, position: 'insideBottom', offset: -15, fontWeight: 'bold', fontSize: 10 }} 
                            />
                            <YAxis 
                                domain={[yTicks[0], yTicks[yTicks.length - 1]]} 
                                ticks={yTicks}
                                label={{ value: labels.yAxis, angle: -90, position: 'insideLeft', fontWeight: 'bold', fontSize: 10 }}
                            />
                            <Tooltip 
                                contentStyle={{ borderRadius: '8px', fontSize: '12px' }}
                                // Aquí mostramos TODO lo que pediste en el Tooltip
                                formatter={(value: any, name: string, props: any) => {
                                    const { payload } = props;
                                    if (name === "Ideal UE") return [value.toFixed(2), "Ideal UE"];
                                    if (name === "UE Real") return [value.toFixed(2), "UE Transmisor"];
                                    if (name === "Desviación mA") return [`${value.toFixed(3)} mA`, "Error"];
                                    return [value, name];
                                }}
                            />
                            <Legend verticalAlign="top" height={36} iconType="circle" />
                            
                            <Line type="monotone" dataKey="idealUE" stroke="#3b82f6" name="Ideal UE" strokeWidth={3} dot={{ r: 4 }} isAnimationActive={false} />
                            <Line type="monotone" dataKey="ueTransmitter" stroke="#ef4444" name="UE Real" strokeWidth={3} strokeDasharray="5 5" dot={{ r: 4 }} isAnimationActive={false} />
                            <Line type="monotone" dataKey="deviation" stroke="#f59e0b" name="Desviación mA" strokeWidth={2} dot={{ r: 3 }} isAnimationActive={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* TABLA DE RESUMEN INFERIOR (Aparecerá en el PDF) */}
                <div className="mt-6 overflow-hidden border border-gray-200 rounded-lg">
                    <table className="w-full text-[10px] text-left">
                        <thead className="bg-gray-50 text-gray-600 uppercase font-bold">
                            <tr>
                                <th className="px-3 py-2 border-b">% Rango</th>
                                <th className="px-3 py-2 border-b">Ideal UE</th>
                                <th className="px-3 py-2 border-b">Ideal mA</th>
                                <th className="px-3 py-2 border-b">Patrón UE</th>
                                <th className="px-3 py-2 border-b">UE Trans.</th>
                                <th className="px-3 py-2 border-b">mA Trans.</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {processedData.map((d, i) => (
                                <tr key={i} className="hover:bg-gray-50">
                                    <td className="px-3 py-1.5 font-semibold text-blue-600">{d.percentage}%</td>
                                    <td className="px-3 py-1.5">{d.idealUE}</td>
                                    <td className="px-3 py-1.5">{d.idealValue}</td>
                                    <td className="px-3 py-1.5">{d.patronUE}</td>
                                    <td className="px-3 py-1.5 font-medium text-red-600">{d.ueTransmitter}</td>
                                    <td className="px-3 py-1.5">{d.measuredValue}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
});

export default TransmitterChart;