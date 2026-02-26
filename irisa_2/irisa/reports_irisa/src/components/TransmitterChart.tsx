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
    idealohm?: string;
    ohmTransmitter?: string;
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

    // Normalización centrada en mA y RTD (ohm)
    const processedData = chartData.map((m) => {
        const pct = parseFloat(m.percentage) || 0;
        return {
            percentage: pct,
            // Valores de Corriente (mA)
            idealmA: parseFloat(m.idealmA || m.idealMa || "0"),
            maTransmitter: parseFloat(m.maTransmitter) || 0,
            // Valores de Resistencia (Solo si es RTD)
            idealOhm: isOhm ? parseFloat(m.idealohm || "0") : null,
            ohmTransmitter: isOhm ? parseFloat(m.ohmTransmitter || "0") : null,
            // Unidades de Ingeniería (UE)
            idealUE: parseFloat(m.idealUE || m.idealUe || "0"),
            ueTransmitter: parseFloat(m.ueTransmitter) || 0,
            // Error / Desviación
            deviation: parseFloat(m.errormA || m.errorMa || "0"),
        };
    }).sort((a, b) => a.percentage - b.percentage);

    // LÓGICA DE ESCALA PARA EJE Y
    const getYTicks = () => {
        if (processedData.length === 0) return [0, 4, 8, 12, 16, 20];
        
        // Buscamos el máximo entre mA y UE para que la escala los cubra a ambos
        const allValues = processedData.flatMap(d => [
            d.idealmA, d.maTransmitter, d.idealUE, d.ueTransmitter
        ]);
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
            <div className="bg-gradient-to-r from-teal-600 to-emerald-600 px-6 py-5 text-white">
                <div className="flex items-center gap-4">
                    <span className="text-3xl">📈</span>
                    <div>
                        <h3 className="text-xl font-bold">
                            {isOhm ? 'Curva de Respuesta RTD' : 'Curva de Respuesta mA'}
                        </h3>
                        <p className="text-teal-100 text-sm opacity-90">Visualización de linealidad y error</p>
                    </div>
                </div>
            </div>

            <div className="p-6 bg-white">
                {processedData.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                        <p>No hay datos suficientes para generar el gráfico.</p>
                    </div>
                ) : (
                    <div className="h-96 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={processedData} margin={{ top: 20, right: 30, left: 20, bottom: 25 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                
                                <XAxis 
                                    dataKey="percentage" 
                                    label={{ value: 'Escala (%)', position: 'insideBottom', offset: -10, fontSize: 12, fontWeight: 'bold' }} 
                                />

                                <YAxis 
                                    ticks={yTicks} 
                                    domain={[yTicks[0], yTicks[yTicks.length - 1]]}
                                    tick={{ fontSize: 10 }}
                                    label={{ value: 'Valor / Desviación', angle: -90, position: 'insideLeft', fontWeight: 'bold', fontSize: 12 }}
                                />

                                <Tooltip 
                                    contentStyle={{ borderRadius: '8px', fontSize: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    formatter={(value: any, name: string) => [value ? value.toFixed(3) : '0.000', name]}
                                />
                                <Legend verticalAlign="top" height={36} />
                                
                                {/* LINEAS mA */}
                                <Line type="monotone" dataKey="idealmA" stroke="#3b82f6" name="Ideal mA" strokeWidth={2} dot={{ r: 4 }} isAnimationActive={false} />
                                <Line type="monotone" dataKey="maTransmitter" stroke="#ef4444" name="Medido mA" strokeWidth={2} dot={{ r: 4 }} isAnimationActive={false} />
                                
                                {/* LINEAS UE (Ingeniería) */}
                                <Line type="monotone" dataKey="idealUE" stroke="#10b981" name="Ideal UE" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3 }} isAnimationActive={false} />
                                <Line type="monotone" dataKey="ueTransmitter" stroke="#f59e0b" name="UE Transmisor" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3 }} isAnimationActive={false} />
                                
                                {/* LINEAS OHM (Solo aparecen si es RTD) */}
                                {isOhm && (
                                    <>
                                        <Line type="monotone" dataKey="idealOhm" stroke="#6366f1" name="Ideal Ω" strokeWidth={1} dot={{ r: 2 }} isAnimationActive={false} />
                                        <Line type="monotone" dataKey="ohmTransmitter" stroke="#ec4899" name="Medido Ω" strokeWidth={1} dot={{ r: 2 }} isAnimationActive={false} />
                                    </>
                                )}

                                {/* LINEA DE DESVIACIÓN */}
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