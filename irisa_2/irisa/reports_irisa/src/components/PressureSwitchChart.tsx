import React, { useState, useMemo, useRef, useImperativeHandle, forwardRef } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  Legend, ResponsiveContainer, ReferenceLine, AreaChart, Area 
} from 'recharts';
import { toPng } from 'html-to-image';

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

const PressureSwitchChart = forwardRef<any, PressureSwitchChartProps>(({ tests, data }, ref) => {
    const rawData = tests || data || [];
    const [activeView, setActiveView] = useState<ChartView>('sequence');

    // Refs para capturas
    const sequenceRef = useRef<HTMLDivElement>(null);
    const complianceRef = useRef<HTMLDivElement>(null);
    const differentialRef = useRef<HTMLDivElement>(null);

    const processedData = useMemo(() => {
        // Datos de ejemplo si no hay datos reales
        const sampleData: PressureSwitchTest[] = [
            { typeTest: 'RISING', appliedPressure: '15.0', realPressureChange: '14.8', stateContact: 'CERRADO', meetsSpecification: true },
            { typeTest: 'FALLING', appliedPressure: '12.0', realPressureChange: '12.2', stateContact: 'ABIERTO', meetsSpecification: true }
        ];
        
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

    // --- Función de Captura para PDF ---
    const captureAllCharts = async () => {
        const captures: string[] = [];
        const refs = [sequenceRef, complianceRef, differentialRef];
        
        for (const chartRef of refs) {
            if (chartRef.current) {
                try {
                    const dataUrl = await toPng(chartRef.current, { 
                        backgroundColor: '#ffffff',
                        pixelRatio: 2,
                        cacheBust: true 
                    });
                    captures.push(dataUrl);
                } catch (err) {
                    console.error("Error capturando gráfico presostato:", err);
                }
            }
        }
        return captures;
    };

    useImperativeHandle(ref, () => ({
        captureAllCharts
    }));

    // --- Sub-componentes de Renderizado ---
    const renderSequenceChart = () => (
        <div className="h-80 w-full bg-white p-4">
            <h4 className="text-sm font-bold text-gray-500 mb-4 text-center uppercase">Secuencia de Presiones</h4>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={processedData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis dataKey="index" />
                    <YAxis />
                    <Tooltip />
                    <Legend verticalAlign="top" />
                    <Line type="monotone" dataKey="appliedPressure" stroke="#6366f1" name="Aplicada" strokeWidth={3} dot={{ r: 5 }} isAnimationActive={false} />
                    <Line type="monotone" dataKey="realPressure" stroke="#10b981" name="Real" strokeWidth={3} dot={{ r: 5 }} isAnimationActive={false} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );

    const renderDifferentialChart = () => (
        <div className="h-80 w-full bg-white p-4">
            <h4 className="text-sm font-bold text-gray-500 mb-4 text-center uppercase">Desviación (Diferencial)</h4>
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={processedData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="index" />
                    <YAxis />
                    <Tooltip />
                    <ReferenceLine y={0} stroke="#ef4444" strokeDasharray="5 5" />
                    <Area type="monotone" dataKey="differential" stroke="#f59e0b" fill="#fef3c7" name="PSI" isAnimationActive={false} />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );

    const renderComplianceStats = () => (
        <div className="grid grid-cols-2 gap-4 p-4 bg-white">
            <div className="rounded-xl border border-green-100 bg-green-50 p-6 text-center">
                <p className="text-xs font-bold text-green-600 uppercase">Conformes</p>
                <p className="text-3xl font-black text-green-700">{stats.compliant}</p>
            </div>
            <div className="rounded-xl border border-red-100 bg-red-50 p-6 text-center">
                <p className="text-xs font-bold text-red-600 uppercase">Fallidos</p>
                <p className="text-3xl font-black text-red-700">{stats.total - stats.compliant}</p>
            </div>
        </div>
    );

    const chartViews = [
        { id: 'sequence', name: 'Secuencia', icon: '📈' },
        { id: 'compliance', name: 'Conformidad', icon: '✅' },
        { id: 'differential', name: 'Diferencial', icon: '📊' }
    ];

    return (
        <div className="mt-8 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-6 py-5">
                <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-orange-500 p-2 text-white">
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    </div>
                    <h3 className="text-lg font-bold text-white">Análisis de Presostato</h3>
                </div>
            </div>

            <div className="flex border-b bg-gray-50/50">
                {chartViews.map((view) => (
                    <button
                        key={view.id}
                        onClick={() => setActiveView(view.id as ChartView)}
                        className={`flex-1 py-4 text-sm font-semibold transition-all ${
                            activeView === view.id ? 'bg-white text-orange-600 border-b-2 border-orange-500' : 'text-gray-500'
                        }`}
                    >
                        {view.icon} {view.name}
                    </button>
                ))}
            </div>

            <div className="p-6">
                {activeView === 'sequence' && renderSequenceChart()}
                {activeView === 'differential' && renderDifferentialChart()}
                {activeView === 'compliance' && renderComplianceStats()}

                {/* Contenedor invisible para capturas del PDF */}
                <div style={{ position: 'absolute', left: '-9999px', top: 0, width: '800px' }}>
                    <div ref={sequenceRef}>{renderSequenceChart()}</div>
                    <div ref={differentialRef}>{renderDifferentialChart()}</div>
                    <div ref={complianceRef}>{renderComplianceStats()}</div>
                </div>

                <div className="mt-8 flex gap-6 border-t pt-6 text-xs font-bold text-gray-400 uppercase">
                    <span>Ascendentes: {stats.rising}</span>
                    <span>Descendentes: {stats.falling}</span>
                    <span className="ml-auto">Total: {stats.total}</span>
                </div>
            </div>
        </div>
    );
});

export default PressureSwitchChart;