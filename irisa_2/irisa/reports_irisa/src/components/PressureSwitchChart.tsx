import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter, ReferenceLine } from 'recharts';

// Interfaz del presostato
export interface PressureSwitchTest {
    typeTest: string; // 'RISING' or 'FALLING'
    appliedPressure: string;
    realPressureChange: string;
    stateContact: string; // 'ABIERTO', 'CERRADO', 'NO_CAMBIO'
    meetsSpecification: boolean;
}

interface PressureSwitchChartProps {
    tests?: PressureSwitchTest[];
    data?: PressureSwitchTest[];
}

type ChartView = 'hysteresis' | 'sequence' | 'compliance' | 'differential';

const PressureSwitchChart: React.FC<PressureSwitchChartProps> = ({ tests, data }) => {
    const chartData = tests || data || [];
    const [activeView, setActiveView] = useState<ChartView>('hysteresis');

    const chartViews = [
        // { 
        //     id: 'hysteresis' as ChartView, 
        //     name: 'Histéresis', 
        //     icon: '🔄',
        //     description: 'Puntos de conmutación y banda muerta'
        // },
        { 
            id: 'sequence' as ChartView, 
            name: 'Secuencia de Actuación', 
            icon: '📈',
            description: 'Presiones de cambio por prueba'
        },
        // { 
        //     id: 'compliance' as ChartView, 
        //     name: 'Conformidad', 
        //     icon: '✅',
        //     description: 'Análisis de especificaciones'
        // },
        // { 
        //     id: 'differential' as ChartView, 
        //     name: 'Diferencial', 
        //     icon: '📊',
        //     description: 'Desviación del setpoint'
        // }
    ];

    // Transformar datos para gráficos
    const processDataForChart = () => {
        return chartData.map((test, index) => {
            const appliedPressure = parseFloat(test.appliedPressure) || 0;
            const realPressure = parseFloat(test.realPressureChange) || 0;
            
            // Convertir estado del contacto a valor numérico
            let contactState = 0.5; // Default para NO_CAMBIO
            if (test.stateContact === 'CERRADO') contactState = 1;
            if (test.stateContact === 'ABIERTO') contactState = 0;
            
            return {
                index: index + 1,
                appliedPressure,
                realPressure,
                contactState,
                type: test.typeTest,
                stateLabel: test.stateContact,
                meetsSpec: test.meetsSpecification,
                differential: appliedPressure - realPressure,
                // Para el gráfico de histéresis
                isRising: test.typeTest === 'RISING',
                isFalling: test.typeTest === 'FALLING'
            };
        }).sort((a, b) => a.realPressure - b.realPressure);
    };

    const processedData = processDataForChart();

    
    const risingData = processedData.filter(d => d.isRising);
    const fallingData = processedData.filter(d => d.isFalling);

    // Crear datos de ejemplo para pruebas
    const createSampleData = () => {
        return [
            { typeTest: 'RISING', appliedPressure: '15.0', realPressureChange: '14.8', stateContact: 'CERRADO', meetsSpecification: true },
            { typeTest: 'FALLING', appliedPressure: '12.0', realPressureChange: '12.2', stateContact: 'ABIERTO', meetsSpecification: true },
            { typeTest: 'RISING', appliedPressure: '15.5', realPressureChange: '15.1', stateContact: 'CERRADO', meetsSpecification: true },
            { typeTest: 'FALLING', appliedPressure: '11.5', realPressureChange: '11.8', stateContact: 'ABIERTO', meetsSpecification: false },
            { typeTest: 'RISING', appliedPressure: '14.8', realPressureChange: '14.9', stateContact: 'CERRADO', meetsSpecification: true }
        ];
    };

    // Si no hay datos, usar datos de ejemplo
    const displayData = chartData.length > 0 ? chartData : createSampleData();
    const processedDisplayData = displayData.map((test, index) => {
        const appliedPressure = parseFloat(test.appliedPressure) || 0;
        const realPressure = parseFloat(test.realPressureChange) || 0;
        
        let contactState = 0.5;
        if (test.stateContact === 'CERRADO') contactState = 1;
        if (test.stateContact === 'ABIERTO') contactState = 0;
        
        return {
            index: index + 1,
            appliedPressure,
            realPressure,
            contactState,
            type: test.typeTest,
            stateLabel: test.stateContact,
            meetsSpec: test.meetsSpecification,
            differential: appliedPressure - realPressure,
            isRising: test.typeTest === 'RISING',
            isFalling: test.typeTest === 'FALLING'
        };
    }).sort((a, b) => a.realPressure - b.realPressure);

    const displayRisingData = processedDisplayData.filter(d => d.isRising);
    const displayFallingData = processedDisplayData.filter(d => d.isFalling);

    const renderChart = () => {
        const dataToUse = chartData.length > 0 ? processedData : processedDisplayData;
        const risingDataToUse = chartData.length > 0 ? risingData : displayRisingData;
        const fallingDataToUse = chartData.length > 0 ? fallingData : displayFallingData;

        switch (activeView) {
            case 'sequence':
                return (
                    <div>
                        <h4 className="text-lg font-semibold text-gray-700 mb-4">Secuencia de Actuación</h4>
                        {chartData.length === 0 && (
                            <div className="mb-4 p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
                                <p className="text-sm text-yellow-700">
                                    ⚠️ Mostrando datos de ejemplo. Agregue datos reales para ver sus resultados.
                                </p>
                            </div>
                        )}
                        <div className="h-96">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={dataToUse} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
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
                                        label={{ value: 'Presión (PSI)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fontSize: 12 } }}
                                    />
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '8px' }}
                                        formatter={(value, name) => [
                                            `${typeof value === 'number' ? value.toFixed(2) : value} PSI`, 
                                            name
                                        ]}
                                    />
                                    <Legend />
                                    <Line 
                                        type="monotone" 
                                        dataKey="appliedPressure" 
                                        stroke="#8884d8" 
                                        strokeWidth={2}
                                        dot={{ fill: '#8884d8', strokeWidth: 2, r: 4 }}
                                        name="Presión Aplicada"
                                    />
                                    <Line 
                                        type="monotone" 
                                        dataKey="realPressure" 
                                        stroke="#82ca9d" 
                                        strokeWidth={2}
                                        dot={{ fill: '#82ca9d', strokeWidth: 2, r: 4 }}
                                        name="Presión Real de Cambio"
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                );

            // case 'compliance':
            //     const compliantTests = dataToUse.filter(d => d.meetsSpec).length;
            //     const nonCompliantTests = dataToUse.length - compliantTests;
                
            //     return (
            //         <div>
            //             <h4 className="text-lg font-semibold text-gray-700 mb-4">Análisis de Conformidad</h4>
            //             {chartData.length === 0 && (
            //                 <div className="mb-4 p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
            //                     <p className="text-sm text-yellow-700">
            //                         ⚠️ Mostrando datos de ejemplo. Agregue datos reales para ver sus resultados.
            //                     </p>
            //                 </div>
            //             )}
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
            //                             <p className="text-green-600">Cumplen especificaciones</p>
            //                         </div>
            //                     </div>
            //                     <div className="text-3xl font-bold text-green-700">{compliantTests}</div>
            //                     <div className="text-sm text-green-600">
            //                         {dataToUse.length > 0 ? ((compliantTests / dataToUse.length) * 100).toFixed(1) : 0}% del total
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
            //                             <p className="text-red-600">No cumplen especificaciones</p>
            //                         </div>
            //                     </div>
            //                     <div className="text-3xl font-bold text-red-700">{nonCompliantTests}</div>
            //                     <div className="text-sm text-red-600">
            //                         {dataToUse.length > 0 ? ((nonCompliantTests / dataToUse.length) * 100).toFixed(1) : 0}% del total
            //                     </div>
            //                 </div>
            //             </div>
            //         </div>
            //     );

            // case 'differential':
            //     return (
            //         <div>
            //             <h4 className="text-lg font-semibold text-gray-700 mb-4">Diferencial de Presión</h4>
            //             {chartData.length === 0 && (
            //                 <div className="mb-4 p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
            //                     <p className="text-sm text-yellow-700">
            //                         ⚠️ Mostrando datos de ejemplo. Agregue datos reales para ver sus resultados.
            //                     </p>
            //                 </div>
            //             )}
            //             <div className="h-96">
            //                 <ResponsiveContainer width="100%" height="100%">
            //                     <LineChart data={dataToUse} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
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
            //                             label={{ value: 'Diferencial (PSI)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fontSize: 12 } }}
            //                         />
            //                         <Tooltip 
            //                             contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '8px' }}
            //                             formatter={(value, name) => [
            //                                 `${typeof value === 'number' ? value.toFixed(2) : value} PSI`, 
            //                                 name
            //                             ]}
            //                         />
            //                         <Legend />
            //                         <ReferenceLine y={0} stroke="#6b7280" strokeDasharray="5 5" label="Setpoint Ideal" />
            //                         <Line 
            //                             type="monotone" 
            //                             dataKey="differential" 
            //                             stroke="#f59e0b" 
            //                             strokeWidth={2}
            //                             dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
            //                             name="Desviación del Setpoint"
            //                         />
            //                     </LineChart>
            //                 </ResponsiveContainer>
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
            <div className="bg-gradient-to-r from-orange-600 to-red-600 rounded-t-xl px-6 py-4">
                <div className="flex items-center">
                    <svg className="w-6 h-6 text-white mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                    </svg>
                    <h3 className="text-xl font-bold text-white">Análisis del Presostato</h3>
                </div>
                <p className="text-orange-100 mt-2 text-sm">Visualización de actuación </p>
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
                                    ? 'border-orange-500 text-orange-600 bg-orange-50'
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
                <div className="p-6">
                    {/* Información de la pestaña activa */}
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg border-l-4 border-orange-500">
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
                                <div className="w-3 h-3 bg-orange-500 rounded-full mr-2"></div>
                                <span>Total pruebas: <strong>{chartData.length > 0 ? chartData.length : '5 (ejemplo)'}</strong></span>
                            </div>
                            <div className="flex items-center text-gray-600">
                                <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                                <span>Ascendentes: <strong>{chartData.length > 0 ? processedData.filter(d => d.isRising).length : displayRisingData.length}</strong></span>
                            </div>
                            <div className="flex items-center text-gray-600">
                                <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                                <span>Descendentes: <strong>{chartData.length > 0 ? processedData.filter(d => d.isFalling).length : displayFallingData.length}</strong></span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PressureSwitchChart;