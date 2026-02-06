import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter, ReferenceLine } from 'recharts';

// Interfaz del termostato
export interface ThermostatTest {
    typeTest: string; // 'RISING' or 'FALLING'
    appliedTemperature: string;
    realTemperatureChange: string;
    stateContact: string; // 'ABIERTO', 'CERRADO', 'NO_CAMBIO'
    meetsSpecification: boolean;
}

interface ThermostatChartProps {
    tests?: ThermostatTest[];
    data?: ThermostatTest[];
}

type ChartView = 'hysteresis' | 'sequence' | 'compliance' | 'differential';

const ThermostatChart: React.FC<ThermostatChartProps> = ({ tests, data }) => {
    const chartData = tests || data || [];
    const [activeView, setActiveView] = useState<ChartView>('hysteresis');

    const chartViews = [
        // { 
        //     id: 'hysteresis' as ChartView, 
        //     name: 'Histéresis', 
        //     icon: '🌡️',
        //     description: 'Puntos de conmutación térmica y banda muerta'
        // },
        { 
            id: 'sequence' as ChartView, 
            name: 'Secuencia Térmica', 
            icon: '📈',
            description: 'Temperaturas de cambio por prueba'
        },
        // { 
        //     id: 'compliance' as ChartView,             name: 'Conformidad', 
        //     icon: '✅',
        //     description: 'Análisis de especificaciones térmicas'
        // },
        // { 
        //     id: 'differential' as ChartView, 
        //     name: 'Diferencial Térmico', 
        //     icon: '📊',
        //     description: 'Desviación del setpoint de temperatura'
        // }
    ];

    // Transformar datos para gráficos
    const processDataForChart = () => {
        return chartData.map((test, index) => {
            const appliedTemperature = parseFloat(test.appliedTemperature) || 0;
            const realTemperature = parseFloat(test.realTemperatureChange) || 0;
            
            // Convertir estado del contacto a valor numérico
            let contactState = 0.5; // Default para NO_CAMBIO
            if (test.stateContact === 'CERRADO') contactState = 1;
            if (test.stateContact === 'ABIERTO') contactState = 0;
            
            return {
                index: index + 1,
                appliedTemperature,
                realTemperature,
                contactState,
                type: test.typeTest,
                stateLabel: test.stateContact,
                meetsSpec: test.meetsSpecification,
                differential: appliedTemperature - realTemperature,
                // Para el gráfico de histéresis
                isRising: test.typeTest === 'RISING',
                isFalling: test.typeTest === 'FALLING'
            };
        }).sort((a, b) => a.realTemperature - b.realTemperature);
    };

    const processedData = processDataForChart();

    const processDataForHysteresis = () => {
    // Separar primero por tipo de test
    const risingTests = chartData.filter(test => test.typeTest === 'RISING');
    const fallingTests = chartData.filter(test => test.typeTest === 'FALLING');
    
    // Procesar rama ascendente
    const risingData = risingTests.map((test, index) => {
        const temperature = parseFloat(test.realTemperatureChange) || 0;
        const contactState = test.stateContact === 'CERRADO' ? 1 : 0;
        
        return {
            temperature,
            contactState,
            type: 'RISING',
            stateLabel: test.stateContact,
            meetsSpec: test.meetsSpecification
        };
    }).sort((a, b) => a.temperature - b.temperature);
    
    // Procesar rama descendente
    const fallingData = fallingTests.map((test, index) => {
        const temperature = parseFloat(test.realTemperatureChange) || 0;
        const contactState = test.stateContact === 'CERRADO' ? 1 : 0;
        
        return {
            temperature,
            contactState,
            type: 'FALLING',
            stateLabel: test.stateContact,
            meetsSpec: test.meetsSpecification
        };
    }).sort((a, b) => a.temperature - b.temperature);
    
    return { risingData, fallingData };
};

    // Separar datos por tipo para histéresis
    const risingData = processedData.filter(d => d.isRising);
    const fallingData = processedData.filter(d => d.isFalling);

    const renderChart = () => {
        if (processedData.length === 0) {
            return (
                <div className="text-center py-8 text-gray-500">
                    <p>No hay suficientes datos para generar el gráfico</p>
                </div>
            );
        }

        switch (activeView) {
            case 'sequence':
                return (
                    <div>
                        <h4 className="text-lg font-semibold text-gray-700 mb-4">Secuencia de Actuación Térmica</h4>
                        <div className="h-96">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={processedData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis 
                                        dataKey="index"
                                        stroke="#6b7280"
                                        tick={{ fontSize: 12 }}
                                        label={{ value: 'Número de Prueba', position: 'insideBottom', offset: -10, style: { textAnchor: 'middle', fontSize: 12 } }}
                                    />
                                    <YAxis 
                                        stroke="#6b7280"
                                        tick={{ fontSize: 12 }}
                                        label={{ value: 'Temperatura (°C)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fontSize: 12 } }}
                                    />
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '8px' }}
                                        formatter={(value, name) => [
                                            `${typeof value === 'number' ? value.toFixed(2) : value}°C`, 
                                            name
                                        ]}
                                    />
                                    <Legend />
                                    <Line 
                                        type="monotone" 
                                        dataKey="appliedTemperature" 
                                        stroke="#f59e0b" 
                                        strokeWidth={2}
                                        dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
                                        name="Temperatura Aplicada"
                                    />
                                    <Line 
                                        type="monotone" 
                                        dataKey="realTemperature" 
                                        stroke="#10b981" 
                                        strokeWidth={2}
                                        dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                                        name="Temperatura Real de Cambio"
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                );

            // case 'compliance':
            //     const compliantTests = processedData.filter(d => d.meetsSpec).length;
            //     const nonCompliantTests = processedData.length - compliantTests;
                
            //     return (
            //         <div>
            //             <h4 className="text-lg font-semibold text-gray-700 mb-4">Análisis de Conformidad Térmica</h4>
            //             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            //                 <div className="p-6 bg-green-50 rounded-lg border border-green-200">
            //                     <div className="flex items-center mb-4">
            //                         <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
            //                             <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            //                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            //                             </svg>
            //                         </div>
            //                         <div className="ml-4">
            //                             <h3 className="text-lg font-semibold text-green-800">Conformes</h3>
            //                             <p className="text-green-600">Cumplen especificaciones térmicas</p>
            //                         </div>
            //                     </div>
            //                     <div className="text-3xl font-bold text-green-700">{compliantTests}</div>
            //                     <div className="text-sm text-green-600">
            //                         {processedData.length > 0 ? ((compliantTests / processedData.length) * 100).toFixed(1) : 0}% del total
            //                     </div>
            //                 </div>
                            
            //                 <div className="p-6 bg-red-50 rounded-lg border border-red-200">
            //                     <div className="flex items-center mb-4">
            //                         <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center">
            //                             <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            //                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            //                             </svg>
            //                         </div>
            //                         <div className="ml-4">
            //                             <h3 className="text-lg font-semibold text-red-800">No Conformes</h3>
            //                             <p className="text-red-600">No cumplen especificaciones térmicas</p>
            //                         </div>
            //                     </div>
            //                     <div className="text-3xl font-bold text-red-700">{nonCompliantTests}</div>
            //                     <div className="text-sm text-red-600">
            //                         {processedData.length > 0 ? ((nonCompliantTests / processedData.length) * 100).toFixed(1) : 0}% del total
            //                     </div>
            //                 </div>
            //             </div>
                        
            //             {/* Estadísticas adicionales para termostatos */}
            //             <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            //                 <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            //                     <div className="flex items-center">
            //                         <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3">
            //                             <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            //                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            //                             </svg>
            //                         </div>
            //                         <div>
            //                             <p className="text-sm text-blue-600">Temp. Mínima</p>
            //                             <p className="font-bold text-blue-800">
            //                                 {processedData.length > 0 ? Math.min(...processedData.map(d => d.realTemperature)).toFixed(1) : 0}°C
            //                             </p>
            //                         </div>
            //                     </div>
            //                 </div>
                            
            //                 <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
            //                     <div className="flex items-center">
            //                         <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center mr-3">
            //                             <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            //                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            //                             </svg>
            //                         </div>
            //                         <div>
            //                             <p className="text-sm text-amber-600">Temp. Promedio</p>
            //                             <p className="font-bold text-amber-800">
            //                                 {processedData.length > 0 ? (processedData.reduce((sum, d) => sum + d.realTemperature, 0) / processedData.length).toFixed(1) : 0}°C
            //                             </p>
            //                         </div>
            //                     </div>
            //                 </div>
                            
            //                 <div className="p-4 bg-red-50 rounded-lg border border-red-200">
            //                     <div className="flex items-center">
            //                         <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center mr-3">
            //                             <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            //                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            //                             </svg>
            //                         </div>
            //                         <div>
            //                             <p className="text-sm text-red-600">Temp. Máxima</p>
            //                             <p className="font-bold text-red-800">
            //                                 {processedData.length > 0 ? Math.max(...processedData.map(d => d.realTemperature)).toFixed(1) : 0}°C
            //                             </p>
            //                         </div>
            //                     </div>
            //                 </div>
            //             </div>
            //         </div>
            //     );

            // case 'differential':
            //     return (
            //         <div>
            //             <h4 className="text-lg font-semibold text-gray-700 mb-4">Diferencial Térmico</h4>
            //             <div className="h-96">
            //                 <ResponsiveContainer width="100%" height="100%">
            //                     <LineChart data={processedData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            //                         <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            //                         <XAxis 
            //                             dataKey="index"
            //                             stroke="#6b7280"
            //                             tick={{ fontSize: 12 }}
            //                             label={{ value: 'Número de Prueba', position: 'insideBottom', offset: -10, style: { textAnchor: 'middle', fontSize: 12 } }}
            //                         />
            //                         <YAxis 
            //                             stroke="#6b7280"
            //                             tick={{ fontSize: 12 }}
            //                             label={{ value: 'Diferencial (°C)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fontSize: 12 } }}
            //                         />
            //                         <Tooltip 
            //                             contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '8px' }}
            //                             formatter={(value, name) => [
            //                                 `${typeof value === 'number' ? value.toFixed(2) : value}°C`, 
            //                                 name
            //                             ]}
            //                         />
            //                         <Legend />
            //                         <ReferenceLine y={0} stroke="#6b7280" strokeDasharray="5 5" label="Setpoint Térmico Ideal" />
            //                         <Line 
            //                             type="monotone" 
            //                             dataKey="differential" 
            //                             stroke="#8b5cf6" 
            //                             strokeWidth={2}
            //                             dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
            //                             name="Desviación del Setpoint"
            //                         />
            //                     </LineChart>
            //                 </ResponsiveContainer>
            //             </div>
                        
            //             {/* Análisis del diferencial térmico */}
            //             <div className="mt-4 p-4 bg-purple-50 rounded-lg border-l-4 border-purple-500">
            //                 <h5 className="font-semibold text-purple-800 mb-2">Análisis del Diferencial Térmico</h5>
            //                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-purple-700">
            //                     <div>
            //                         <span className="font-medium">Desviación Promedio:</span>
            //                         <span className="ml-2">
            //                             {processedData.length > 0 ? (processedData.reduce((sum, d) => sum + Math.abs(d.differential), 0) / processedData.length).toFixed(2) : 0}°C
            //                         </span>
            //                     </div>
            //                     <div>
            //                         <span className="font-medium">Máxima Desviación:</span>
            //                         <span className="ml-2">
            //                             {processedData.length > 0 ? Math.max(...processedData.map(d => Math.abs(d.differential))).toFixed(2) : 0}°C
            //                         </span>
            //                     </div>
            //                     <div>
            //                         <span className="font-medium">Precisión:</span>
            //                         <span className="ml-2">
            //                             ±{processedData.length > 0 ? (processedData.reduce((sum, d) => sum + Math.abs(d.differential), 0) / processedData.length).toFixed(2) : 0}°C
            //                         </span>
            //                     </div>
            //                 </div>
            //             </div>
            //         </div>
            //     );

            default:
                return null;
        }
    };

    return (
        <div className="mt-8">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-blue-600 to-red-600 rounded-t-xl px-6 py-4">
                <div className="flex items-center">
                    <svg className="w-6 h-6 text-white mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-1v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-1c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-1" />
                    </svg>
                    <h3 className="text-xl font-bold text-white">Análisis del Termostato</h3>
                </div>
                <p className="text-blue-100 mt-2 text-sm">Visualización actuación</p>
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
                        </button>
                    ))}
                </div>
            </div>

            {/* Contenido del gráfico */}
            <div className="bg-white rounded-b-xl shadow-lg border-l border-r border-b border-gray-200">
                {chartData.length === 0 ? (
                    <div className="text-center py-12">
                        <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-1v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-1c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-1" />
                        </svg>
                        <h3 className="text-lg font-medium text-gray-700 mb-2">No hay datos para mostrar</h3>
                        <p className="text-gray-500">Agregue pruebas del termostato para visualizar los gráficos térmicos</p>
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
                                    <span>Total pruebas: <strong>{chartData.length}</strong></span>
                                </div>
                                <div className="flex items-center text-gray-600">
                                    <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                                    <span>Ascendentes: <strong>{processedData.filter(d => d.isRising).length}</strong></span>
                                </div>
                                <div className="flex items-center text-gray-600">
                                    <div className="w-3 h-3 bg-blue-600 rounded-full mr-2"></div>
                                    <span>Descendentes: <strong>{processedData.filter(d => d.isFalling).length}</strong></span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ThermostatChart;