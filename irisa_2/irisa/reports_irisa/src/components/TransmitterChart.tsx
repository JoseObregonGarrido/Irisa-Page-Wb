import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter } from 'recharts';
import { toPng } from 'html-to-image';
import React, { useState, useRef, useImperativeHandle, forwardRef } from 'react';

// Importamos la interfaz desde TransmitterTable
export interface Measurement {
    percentage: string;      // Porcentaje de rango (0-100%)
    idealUe: string;        // Valor ideal de entrada (UE)
    patronUe: string;       // Valor del patrón (UE)
    ueTransmitter: string;  // Valor medido de entrada (UE)
    idealMa: string;        // Valor ideal de salida (mA)
    maTransmitter: string;  // Valor medido de salida (mA)
    errorUe: string;        // Error de entrada (UE)
    errorMa: string;        // Error de salida (mA)
    errorPercentage: string; // Porcentaje de error
}


interface TransmitterChartProps {
    measurements?: Measurement[];
    data?: Measurement[];  // Alternativa para compatibilidad
    onChartsCapture?: React.MutableRefObject<any>;
}

type ChartView = 'response' | 'errors' | 'linearity' | 'percentage';

const TransmitterChart = forwardRef<any, TransmitterChartProps>(({ measurements, data }, ref) => {
    // Usar measurements o data (para compatibilidad)
    const chartData = measurements || data || [];

    const responseRef = useRef<HTMLDivElement>(null);
    const errorsRef = useRef<HTMLDivElement>(null);
    const linearityRef = useRef<HTMLDivElement>(null);
    const percentageRef = useRef<HTMLDivElement>(null);
    
    
    const [activeView, setActiveView] = useState<ChartView>('response');

    // Transformar datos para gráficos
    const processDataForChart = () => {
        return chartData.map((measurement, index) => ({
            percentage: parseFloat(measurement.percentage) || 0,
            idealUe: parseFloat(measurement.idealUe) || 0,
            patronUe: parseFloat(measurement.patronUe) || 0,
            ueTransmitter: parseFloat(measurement.ueTransmitter) || 0,
            idealMa: parseFloat(measurement.idealMa) || 0,
            maTransmitter: parseFloat(measurement.maTransmitter) || 0,
            errorUe: parseFloat(measurement.errorUe) || 0,
            errorMa: parseFloat(measurement.errorMa) || 0,
            errorPercentage: parseFloat(measurement.errorPercentage) || 0,
        })).sort((a, b) => a.percentage - b.percentage);
    };

    const processedData = processDataForChart();

    const captureAllCharts = async () => {
    const charts = [];
    if (responseRef.current) charts.push(await toPng(responseRef.current));
    if (errorsRef.current) charts.push(await toPng(errorsRef.current));
    if (linearityRef.current) charts.push(await toPng(linearityRef.current));
    if (percentageRef.current) charts.push(await toPng(percentageRef.current));
    return charts;
};

// Exponer la función al componente padre
useImperativeHandle(ref, () => ({
    captureAllCharts
}));

    const chartViews = [
        { 
            id: 'response' as ChartView, 
            name: 'Curva de Respuesta', 
            icon: '📈',
            description: 'Valores ideales vs medidos'
        },
        { 
            id: 'errors' as ChartView, 
            name: 'Errores Absolutos', 
            icon: '⚠️',
            description: 'Desviaciones en UE y mA'
        },
        // { 
        //     id: 'linearity' as ChartView, 
        //     name: 'Análisis de Linealidad', 
        //     icon: '📊',
        //     description: 'Scatter plot de linealidad'
        // },
        { 
            id: 'percentage' as ChartView, 
            name: 'Error Porcentual', 
            icon: '%',
            description: 'Errores como porcentaje'
        }
    ];


    const renderChart = () => {
        if (processedData.length === 0) {
            return (
                <div className="text-center py-8 text-gray-500">
                    <p>No hay suficientes datos para generar el gráfico</p>
                </div>
            );
        }

   

 

        switch (activeView) {
            case 'response':
                return (
                    <div>
                        <h4 className="text-lg font-semibold text-gray-700 mb-4">Curva de Respuesta</h4>
                        <div className="h-96">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={processedData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis 
                                        dataKey="percentage" 
                                        stroke="#6b7280"
                                        tick={{ fontSize: 12 }}
                                        label={{ value: 'Porcentaje (%)', position: 'insideBottom', offset: -10, style: { textAnchor: 'middle', fontSize: 12 } }}
                                    />
                                    <YAxis 
                                        stroke="#6b7280"
                                        tick={{ fontSize: 12 }}
                                        label={{ value: 'Valor', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fontSize: 12 } }}
                                    />
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '8px' }}
                                        formatter={(value, name) => [
                                            typeof value === 'number' ? value.toFixed(2) : value, 
                                            name
                                        ]}
                                    />
                                    <Legend />
                                    <Line 
                                        type="monotone" 
                                        dataKey="idealMa" 
                                        stroke="#3b82f6" 
                                        strokeWidth={2}
                                        dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                                        name="Ideal mA"
                                    />
                                    <Line 
                                        type="monotone" 
                                        dataKey="maTransmitter" 
                                        stroke="#ef4444" 
                                        strokeWidth={2}
                                        dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                                        name="Medido mA"
                                    />
                                    <Line 
                                        type="monotone" 
                                        dataKey="idealUe" 
                                        stroke="#10b981" 
                                        strokeWidth={2}
                                        strokeDasharray="5 5"
                                        dot={{ fill: '#10b981', strokeWidth: 2, r: 3 }}
                                        name="Ideal UE"
                                    />
                                    <Line 
                                        type="monotone" 
                                        dataKey="ueTransmitter" 
                                        stroke="#f59e0b" 
                                        strokeWidth={2}
                                        strokeDasharray="5 5"
                                        dot={{ fill: '#f59e0b', strokeWidth: 2, r: 3 }}
                                        name="UE Transmisor"
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                );
                
            case 'errors':
                return (
                    <div>
                        <h4 className="text-lg font-semibold text-gray-700 mb-4">Errores Absolutos</h4>
                        <div className="h-96">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={processedData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis 
                                        dataKey="percentage" 
                                        stroke="#6b7280"
                                        tick={{ fontSize: 12 }}
                                        label={{ value: 'Porcentaje (%)', position: 'insideBottom', offset: -10, style: { textAnchor: 'middle', fontSize: 12 } }}
                                    />
                                    <YAxis 
                                        stroke="#6b7280"
                                        tick={{ fontSize: 12 }}
                                        label={{ value: 'Error', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fontSize: 12 } }}
                                    />
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '8px' }}
                                        formatter={(value, name) => [
                                            typeof value === 'number' ? value.toFixed(3) : value, 
                                            name
                                        ]}
                                    />
                                    <Legend />
                                    <Line 
                                        type="monotone" 
                                        dataKey="errorUe" 
                                        stroke="#dc2626" 
                                        strokeWidth={2}
                                        dot={{ fill: '#dc2626', strokeWidth: 2, r: 4 }}
                                        name="Error UE"
                                    />
                                    <Line 
                                        type="monotone" 
                                        dataKey="errorMa" 
                                        stroke="#ea580c" 
                                        strokeWidth={2}
                                        dot={{ fill: '#ea580c', strokeWidth: 2, r: 4 }}
                                        name="Error mA"
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                );
                
            // case 'linearity':
            //     return (
            //         <div>
            //             <h4 className="text-lg font-semibold text-gray-700 mb-4">Análisis de Linealidad</h4>
            //             <div className="h-96">
            //                 <ResponsiveContainer width="100%" height="100%">
            //                     <ScatterChart data={processedData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            //                         <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            //                         <XAxis 
            //                             type="number"
            //                             dataKey="idealMa"
            //                             stroke="#6b7280"
            //                             tick={{ fontSize: 12 }}
            //                             label={{ value: 'Ideal mA', position: 'insideBottom', offset: -10, style: { textAnchor: 'middle', fontSize: 12 } }}
            //                         />
            //                         <YAxis 
            //                             type="number"
            //                             dataKey="maTransmitter"
            //                             stroke="#6b7280"
            //                             tick={{ fontSize: 12 }}
            //                             label={{ value: 'Medido mA', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fontSize: 12 } }}
            //                         />
            //                         <Tooltip 
            //                             contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '8px' }}
            //                             formatter={(value, name) => [
            //                                 typeof value === 'number' ? value.toFixed(2) : value, 
            //                                 name
            //                             ]}
            //                         />
            //                         <Scatter 
            //                             dataKey="maTransmitter" 
            //                             fill="#8884d8"
            //                             name="Puntos Medidos"
            //                         />
            //                         <Line 
            //                             type="linear" 
            //                             dataKey="idealMa" 
            //                             stroke="#22c55e" 
            //                             strokeWidth={2}
            //                             strokeDasharray="8 8"
            //                             dot={false}
            //                             name="Línea Ideal"
            //                         />
            //                     </ScatterChart>
            //                 </ResponsiveContainer>
            //             </div>
            //         </div>
            //     );
                
            case 'percentage':
                return (
                    <div>
                        <h4 className="text-lg font-semibold text-gray-700 mb-4">Error Porcentual</h4>
                        <div className="h-96">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={processedData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis 
                                        dataKey="percentage" 
                                        stroke="#6b7280"
                                        tick={{ fontSize: 12 }}
                                        label={{ value: 'Porcentaje del Rango (%)', position: 'insideBottom', offset: -10, style: { textAnchor: 'middle', fontSize: 12 } }}
                                    />
                                    <YAxis 
                                        stroke="#6b7280"
                                        tick={{ fontSize: 12 }}
                                        label={{ value: 'Error (%)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fontSize: 12 } }}
                                    />
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '8px' }}
                                        formatter={(value, name) => [
                                            typeof value === 'number' ? `${value.toFixed(2)}%` : value, 
                                            name
                                        ]}
                                    />
                                    <Legend />
                                    <Line 
                                        type="monotone" 
                                        dataKey="errorPercentage" 
                                        stroke="#7c3aed" 
                                        strokeWidth={3}
                                        dot={{ fill: '#7c3aed', strokeWidth: 2, r: 5 }}
                                        name="Error Porcentual"
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="mt-8">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-t-xl px-6 py-4">
                <div className="flex items-center">
                    <svg className="w-6 h-6 text-white mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <h3 className="text-xl font-bold text-white">Análisis del Transmisor</h3>
                </div>
                <p className="text-blue-100 mt-2 text-sm">Visualización completa del comportamiento y errores</p>
            </div>

            {/* Pestañas */}
            <div className="bg-white border-b border-gray-200">
                <div className="flex overflow-x-auto">
                    {chartViews.map((view) => (
                        <button
                            key={view.id}
                            onClick={() => setActiveView(view.id)}
                            className={`flex-shrink-0 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                                activeView === view.id
                                    ? 'border-blue-500 text-blue-600 bg-blue-50'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                            <span className="mr-2">{view.icon}</span>
                            <span className="hidden sm:inline">{view.name}</span>
                            <span className="sm:hidden">{view.icon}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Contenido del gráfico */}
            <div className="bg-white rounded-b-xl shadow-lg border-l border-r border-b border-gray-200">
                {chartData.length === 0 ? (
                    <div className="text-center py-12">
                        <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        <h3 className="text-lg font-medium text-gray-700 mb-2">No hay datos para mostrar</h3>
                        <p className="text-gray-500">Agregue mediciones en la tabla para visualizar los gráficos</p>
                    </div>
                ) : (
                    <div className="p-6">
                        {/* Información de la pestaña activa */}
                        <div className="mb-4 p-3 bg-gray-50 rounded-lg border-l-4 border-blue-500">
                            <p className="text-sm text-gray-600">
                                {chartViews.find(view => view.id === activeView)?.description}
                            </p>
                        </div>
                        
                        {/* Contenido del gráfico según la pestaña activa */}
                        {renderChart()}
                        
                        {/* Información de los datos */}
                        <div className="mt-6 pt-4 border-t border-gray-200">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                <div className="flex items-center text-gray-600">
                                    <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                                    <span>Puntos de medición: <strong>{chartData.length}</strong></span>
                                </div>
                                <div className="flex items-center text-gray-600">
                                    <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                                    <span>Rango: <strong>0% - 100%</strong></span>
                                </div>
                                <div className="flex items-center text-gray-600">
                                    <div className="w-3 h-3 bg-orange-500 rounded-full mr-2"></div>
                                    <span>Salida: <strong>4-20 mA</strong></span>
                                </div>
                            </div>
                        </div>
                        <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
            {/* <div ref={responseRef}>{renderResponseChart()}</div>
            <div ref={errorsRef}>{renderErrorsChart()}</div>
            <div ref={linearityRef}>{renderLinearityChart()}</div>
            <div ref={percentageRef}>{renderPercentageChart()}</div> */}
        </div>
                    </div>
                )}
            </div>
        </div>
    );
});

export default TransmitterChart;