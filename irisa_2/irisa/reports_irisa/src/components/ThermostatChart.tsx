import React, { useState, useMemo } from 'react';
import { 
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
    ResponsiveContainer, ScatterChart, Scatter, ReferenceLine, ZAxis 
} from 'recharts';

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
    // Cambiado a 'sequence' como default ya que 'hysteresis' requiere lógica específica
    const [activeView, setActiveView] = useState<ChartView>('sequence');

    const chartViews = [
        { 
            id: 'sequence' as ChartView, 
            name: 'Secuencia Térmica', 
            icon: '📈',
            description: 'Temperaturas de cambio por orden de ejecución'
        },
        { 
            id: 'hysteresis' as ChartView, 
            name: 'Histéresis', 
            icon: '🌡️',
            description: 'Puntos de conmutación térmica (Ascendente vs Descendente)'
        },
        { 
            id: 'compliance' as ChartView, 
            name: 'Conformidad', 
            icon: '✅',
            description: 'Análisis de cumplimiento de especificaciones'
        },
        { 
            id: 'differential' as ChartView, 
            name: 'Diferencial', 
            icon: '📊',
            description: 'Desviación entre temperatura aplicada y real'
        }
    ];

    // Memorizar el procesamiento de datos para evitar cálculos innecesarios
    const processedData = useMemo(() => {
        return chartData.map((test, index) => {
            const applied = parseFloat(test.appliedTemperature) || 0;
            const real = parseFloat(test.realTemperatureChange) || 0;
            
            return {
                index: index + 1,
                appliedTemperature: applied,
                realTemperature: real,
                contactState: test.stateContact === 'CERRADO' ? 1 : 0,
                type: test.typeTest,
                isRising: test.typeTest === 'RISING',
                isFalling: test.typeTest === 'FALLING',
                meetsSpec: test.meetsSpecification,
                differential: real - applied,
                stateLabel: test.stateContact
            };
        });
    }, [chartData]);

    const renderChart = () => {
        if (processedData.length === 0) return null;

        switch (activeView) {
            case 'sequence':
                return (
                    <div className="h-96 w-100">
                        <h4 className="text-lg font-semibold text-gray-700 mb-4">Secuencia de Actuación</h4>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={processedData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="index" label={{ value: 'Prueba #', position: 'insideBottom', offset: -5 }} />
                                <YAxis label={{ value: '°C', angle: -90, position: 'insideLeft' }} />
                                <Tooltip />
                                <Legend />
                                <Line name="Temp. Aplicada" type="monotone" dataKey="appliedTemperature" stroke="#f59e0b" />
                                <Line name="Temp. Real Cambio" type="monotone" dataKey="realTemperature" stroke="#10b981" strokeWidth={3} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                );

            case 'hysteresis':
                const rising = processedData.filter(d => d.isRising);
                const falling = processedData.filter(d => d.isFalling);
                return (
                    <div className="h-96 w-100">
                        <h4 className="text-lg font-semibold text-gray-700 mb-4">Gráfico de Histéresis (Puntos de Cambio)</h4>
                        <ResponsiveContainer width="100%" height="100%">
                            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                <CartesianGrid />
                                <XAxis type="number" dataKey="realTemperature" name="Temp" unit="°C" domain={['auto', 'auto']} />
                                <YAxis type="number" dataKey="contactState" name="Estado" ticks={[0, 1]} tickFormatter={(val) => val === 1 ? 'CERRADO' : 'ABIERTO'} />
                                <ZAxis range={[100, 101]} />
                                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                                <Legend />
                                <Scatter name="Ascendente (ON/OFF)" data={rising} fill="#ef4444" shape="circle" />
                                <Scatter name="Descendente (OFF/ON)" data={falling} fill="#3b82f6" shape="diamond" />
                            </ScatterChart>
                        </ResponsiveContainer>
                    </div>
                );

            case 'compliance':
                const compliant = processedData.filter(d => d.meetsSpec).length;
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-6 bg-green-50 border border-green-200 rounded-xl">
                            <p className="text-green-800 font-bold text-4xl">{compliant}</p>
                            <p className="text-green-600">Pruebas Exitosas</p>
                        </div>
                        <div className="p-6 bg-red-50 border border-red-200 rounded-xl">
                            <p className="text-red-800 font-bold text-4xl">{processedData.length - compliant}</p>
                            <p className="text-red-600">Fuera de Especificación</p>
                        </div>
                    </div>
                );

            case 'differential':
                return (
                    <div className="h-96 w-100">
                        <h4 className="text-lg font-semibold text-gray-700 mb-4">Análisis de Error (Real - Aplicada)</h4>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={processedData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="index" />
                                <YAxis />
                                <Tooltip />
                                <ReferenceLine y={0} stroke="#000" strokeWidth={2} />
                                <Line name="Error Térmico" type="step" dataKey="differential" stroke="#8b5cf6" dot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="mt-8 font-sans">
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-700 to-slate-900 rounded-t-xl px-6 py-5 shadow-lg">
                <div className="flex items-center text-white">
                    <span className="text-2xl mr-3">🌡️</span>
                    <div>
                        <h3 className="text-xl font-bold">Análisis de Termostato</h3>
                        <p className="text-slate-300 text-xs uppercase tracking-wider">Control de Calidad Térmica</p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white border-b border-gray-200 flex overflow-x-auto no-scrollbar">
                {chartViews.map((view) => (
                    <button
                        key={view.id}
                        onClick={() => setActiveView(view.id)}
                        className={`px-6 py-4 text-sm font-semibold transition-all border-b-2 flex items-center space-x-2 whitespace-nowrap
                            ${activeView === view.id 
                                ? 'border-blue-500 text-blue-600 bg-blue-50' 
                                : 'border-transparent text-gray-500 hover:bg-gray-50'}`}
                    >
                        <span>{view.icon}</span>
                        <span>{view.name}</span>
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="bg-white p-6 rounded-b-xl shadow-md border border-gray-100">
                {chartData.length === 0 ? (
                    <div className="py-20 text-center text-gray-400">
                        <p className="text-5xl mb-4">📊</p>
                        <p>No hay datos disponibles para graficar.</p>
                    </div>
                ) : (
                    <>
                        <div className="mb-6 p-3 bg-blue-50 text-blue-700 rounded-lg text-sm border-l-4 border-blue-400">
                            {chartViews.find(v => v.id === activeView)?.description}
                        </div>
                        {renderChart()}
                    </>
                )}
            </div>
        </div>
    );
};

export default ThermostatChart;