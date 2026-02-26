import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { toPng } from 'html-to-image';
import React, { useState, useRef, useImperativeHandle, forwardRef } from 'react';

export interface Measurement {
    percentage: string;
    idealUE?: string;      // Soportamos ambas variantes de casing
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

type ChartView = 'response' | 'errors' | 'percentage';

const TransmitterChart = forwardRef<any, TransmitterChartProps>(({ measurements, data, outputUnit = 'mA' }, ref) => {
    const chartData = measurements || data || [];
    const containerRef = useRef<HTMLDivElement>(null);
    const [activeView, setActiveView] = useState<ChartView>('response');
    const isOhm = outputUnit === 'ohm';

    // Normalización y procesamiento de datos
    const processDataForChart = () => {
        return chartData.map((m) => ({
            percentage: parseFloat(m.percentage) || 0,
            idealUE: parseFloat(m.idealUE || m.idealUe || "0"),
            ueTransmitter: parseFloat(m.ueTransmitter) || 0,
            idealValue: parseFloat(m.idealmA || m.idealMa || "0"), // Usado para el eje X en lógica de mA
            measuredValue: parseFloat(m.maTransmitter) || 0,
            errorValue: parseFloat(m.errormA || m.errorMa || "0"),
            errorPercentage: parseFloat(m.errorPercentage) || 0,
            errorUE: parseFloat(m.errorUE || m.errorUe || "0"),
        })).sort((a, b) => a.percentage - b.percentage);
    };

    const processedData = processDataForChart();

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

    const chartViews = [
        { 
            id: 'response' as ChartView, 
            name: 'Curva de Respuesta', 
            icon: '📈',
            description: 'Comparativa de valores ideales vs. medidos (UE y mA)'
        },
        { 
            id: 'errors' as ChartView, 
            name: 'Errores Absolutos', 
            icon: '⚠️',
            description: 'Desviaciones detectadas en la salida'
        },
        { 
            id: 'percentage' as ChartView, 
            name: 'Error Porcentual', 
            icon: '%',
            description: 'Precisión relativa sobre el fondo de escala'
        }
    ];

    const renderActiveChart = () => {
        if (processedData.length === 0) return null;

        switch (activeView) {
            case 'response':
                return (
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={processedData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis 
                                dataKey="percentage" 
                                label={{ value: 'Escala (%)', position: 'insideBottom', offset: -10, fontSize: 12 }} 
                            />
                            <YAxis tick={{ fontSize: 10 }} />
                            <Tooltip 
                                contentStyle={{ borderRadius: '8px', fontSize: '12px' }}
                                formatter={(value: any, name: string) => [value.toFixed(3), name]}
                            />
                            <Legend verticalAlign="top" height={36} />
                            
                            {/* Datos integrados del gráfico viejo y nuevo */}
                            <Line type="monotone" dataKey="idealValue" stroke="#3b82f6" name="Ideal mA" strokeWidth={2} dot={{ r: 4 }} />
                            <Line type="monotone" dataKey="measuredValue" stroke="#ef4444" name="Medido mA" strokeWidth={2} dot={{ r: 4 }} />
                            <Line type="monotone" dataKey="idealUE" stroke="#10b981" name="Ideal UE" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3 }} />
                            <Line type="monotone" dataKey="ueTransmitter" stroke="#f59e0b" name="UE Transmisor" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3 }} />
                        </LineChart>
                    </ResponsiveContainer>
                );

            case 'errors':
                return (
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={processedData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="percentage" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="errorValue" stroke="#ea580c" name="Error mA" strokeWidth={2} />
                            <Line type="monotone" dataKey="errorUE" stroke="#dc2626" name="Error UE" strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                );

            case 'percentage':
                return (
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={processedData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="percentage" />
                            <YAxis label={{ value: '% Error', angle: -90, position: 'insideLeft' }} />
                            <Tooltip formatter={(val: any) => [`${val}%`, 'Error']} />
                            <Line type="monotone" dataKey="errorPercentage" stroke="#7c3aed" name="% Error" strokeWidth={3} dot={{ r: 5 }} />
                        </LineChart>
                    </ResponsiveContainer>
                );
        }
    };

    return (
        <div className="mt-8 shadow-lg rounded-xl overflow-hidden border border-gray-200 bg-white" ref={containerRef}>
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5 text-white">
                <div className="flex items-center gap-4">
                    <span className="text-3xl">📊</span>
                    <div>
                        <h3 className="text-xl font-bold">
                            {isOhm ? 'Análisis RTD (Sensor)' : 'Análisis del Transmisor'}
                        </h3>
                        <p className="text-blue-100 text-sm opacity-90">Visualización de Linealidad y Desviación</p>
                    </div>
                </div>
            </div>

            {/* Tabs Selector */}
            <div className="flex border-b border-gray-200 bg-gray-50">
                {chartViews.map((view) => (
                    <button
                        key={view.id}
                        onClick={() => setActiveView(view.id)}
                        className={`px-6 py-3 text-sm font-medium transition-all border-b-2 ${
                            activeView === view.id
                                ? 'border-blue-500 text-blue-600 bg-white'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                        }`}
                    >
                        {view.icon} {view.name}
                    </button>
                ))}
            </div>

            {/* Chart Area */}
            <div className="p-6">
                {processedData.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                        <p>No hay datos suficientes para generar los gráficos.</p>
                    </div>
                ) : (
                    <>
                        <div className="mb-4 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                            <p className="text-sm text-blue-700">
                                {chartViews.find(v => v.id === activeView)?.description}
                            </p>
                        </div>
                        <div className="h-96 w-full">
                            {renderActiveChart()}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
});

export default TransmitterChart;