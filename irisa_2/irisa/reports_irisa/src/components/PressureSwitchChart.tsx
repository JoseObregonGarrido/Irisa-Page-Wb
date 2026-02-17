import React, { useState, useMemo } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  Legend, ResponsiveContainer, ReferenceLine, AreaChart, Area 
} from 'recharts';

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

type ChartView = 'sequence' | 'compliance' | 'differential';

const PressureSwitchChart: React.FC<PressureSwitchChartProps> = ({ tests, data }) => {
    const rawData = tests || data || [];
    const [activeView, setActiveView] = useState<ChartView>('sequence');

    // 1. Datos de ejemplo centralizados
    const sampleData: PressureSwitchTest[] = [
        { typeTest: 'RISING', appliedPressure: '15.0', realPressureChange: '14.8', stateContact: 'CERRADO', meetsSpecification: true },
        { typeTest: 'FALLING', appliedPressure: '12.0', realPressureChange: '12.2', stateContact: 'ABIERTO', meetsSpecification: true },
        { typeTest: 'RISING', appliedPressure: '15.5', realPressureChange: '15.1', stateContact: 'CERRADO', meetsSpecification: true },
        { typeTest: 'FALLING', appliedPressure: '11.5', realPressureChange: '11.8', stateContact: 'ABIERTO', meetsSpecification: false },
        { typeTest: 'RISING', appliedPressure: '14.8', realPressureChange: '14.9', stateContact: 'CERRADO', meetsSpecification: true }
    ];

    // 2. Procesamiento de datos con useMemo para optimizar rendimiento
    const processedData = useMemo(() => {
        const source = rawData.length > 0 ? rawData : sampleData;
        return source.map((test, index) => {
            const applied = parseFloat(test.appliedPressure) || 0;
            const real = parseFloat(test.realPressureChange) || 0;
            
            return {
                index: index + 1,
                appliedPressure: applied,
                realPressure: real,
                differential: parseFloat((applied - real).toFixed(2)),
                isRising: test.typeTest === 'RISING',
                isFalling: test.typeTest === 'FALLING',
                meetsSpec: test.meetsSpecification,
                stateLabel: test.stateContact
            };
        });
    }, [rawData]);

    const stats = useMemo(() => ({
        rising: processedData.filter(d => d.isRising).length,
        falling: processedData.filter(d => d.isFalling).length,
        compliant: processedData.filter(d => d.meetsSpec).length,
        total: processedData.length
    }), [processedData]);

    const chartViews = [
        { id: 'sequence' as ChartView, name: 'Secuencia', icon: '📈', description: 'Comparativa de presiones por prueba' },
        { id: 'compliance' as ChartView, name: 'Conformidad', icon: '✅', description: 'Estado de cumplimiento de especificaciones' },
        { id: 'differential' as ChartView, name: 'Diferencial', icon: '📊', description: 'Desviación respecto al setpoint esperado' }
    ];

    // 3. Sub-componentes de Renderizado
    const renderSequenceChart = () => (
        <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={processedData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis dataKey="index" label={{ value: 'N° Prueba', position: 'insideBottom', offset: -5 }} />
                    <YAxis label={{ value: 'PSI', angle: -90, position: 'insideLeft' }} />
                    <Tooltip cursor={{ stroke: '#f97316', strokeWidth: 2 }} />
                    <Legend verticalAlign="top" height={36}/>
                    <Line type="monotone" dataKey="appliedPressure" stroke="#6366f1" name="Aplicada" strokeWidth={3} dot={{ r: 5 }} />
                    <Line type="monotone" dataKey="realPressure" stroke="#10b981" name="Real de Cambio" strokeWidth={3} dot={{ r: 5 }} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );

    const renderDifferentialChart = () => (
        <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={processedData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="index" />
                    <YAxis />
                    <Tooltip />
                    <ReferenceLine y={0} stroke="#ef4444" strokeDasharray="5 5" label="Ideal" />
                    <Area type="monotone" dataKey="differential" stroke="#f59e0b" fill="#fef3c7" name="Desviación (PSI)" />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );

    return (
        <div className="mt-8 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-6 py-5">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-orange-500 p-2 text-white">
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        </div>
                        <h3 className="text-lg font-bold text-white">Análisis de Presostato</h3>
                    </div>
                    {rawData.length === 0 && (
                        <span className="rounded-full bg-yellow-500/20 px-3 py-1 text-xs font-medium text-yellow-200 animate-pulse">
                            MODO DEMO
                        </span>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-100 bg-gray-50/50">
                {chartViews.map((view) => (
                    <button
                        key={view.id}
                        onClick={() => setActiveView(view.id)}
                        className={`flex flex-1 items-center justify-center gap-2 px-4 py-4 text-sm font-semibold transition-all ${
                            activeView === view.id 
                            ? 'bg-white text-orange-600 shadow-sm border-b-2 border-orange-500' 
                            : 'text-gray-500 hover:bg-gray-100'
                        }`}
                    >
                        <span>{view.icon}</span>
                        {view.name}
                    </button>
                ))}
            </div>

            <div className="p-6">
                <p className="mb-6 text-sm text-gray-500 italic">
                    {chartViews.find(v => v.id === activeView)?.description}
                </p>

                {activeView === 'sequence' && renderSequenceChart()}
                {activeView === 'differential' && renderDifferentialChart()}
                
                {activeView === 'compliance' && (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="rounded-xl border border-green-100 bg-green-50 p-6 text-center">
                            <p className="text-sm font-medium text-green-600 uppercase tracking-wider">Conformes</p>
                            <p className="mt-2 text-4xl font-black text-green-700">{stats.compliant}</p>
                        </div>
                        <div className="rounded-xl border border-red-100 bg-red-50 p-6 text-center">
                            <p className="text-sm font-medium text-red-600 uppercase tracking-wider">Fallidos</p>
                            <p className="mt-2 text-4xl font-black text-red-700">{stats.total - stats.compliant}</p>
                        </div>
                    </div>
                )}

                {/* Footer Stats */}
                <div className="mt-8 flex flex-wrap gap-6 border-t border-gray-100 pt-6 text-xs font-bold text-gray-400 uppercase tracking-widest">
                    <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-indigo-500"></span>
                        Ascendentes: {stats.rising}
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                        Descendentes: {stats.falling}
                    </div>
                    <div className="ml-auto text-gray-300">
                        Total {stats.total} registros
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PressureSwitchChart;