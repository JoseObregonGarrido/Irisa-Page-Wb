import React, { useState, useMemo, useRef, useImperativeHandle, forwardRef } from 'react';
import { 
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
    ResponsiveContainer, ScatterChart, Scatter, ReferenceLine, ZAxis 
} from 'recharts';
import { toPng } from 'html-to-image';

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

const ThermostatChart = forwardRef<any, ThermostatChartProps>(({ tests, data }, ref) => {
    const chartData = tests || data || [];
    const [activeView, setActiveView] = useState<ChartView>('sequence');

    // Refs para capturas
    const sequenceRef = useRef<HTMLDivElement>(null);
    const hysteresisRef = useRef<HTMLDivElement>(null);
    const complianceRef = useRef<HTMLDivElement>(null);
    const differentialRef = useRef<HTMLDivElement>(null);

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

    // --- Función de Captura para PDF ---
    const captureAllCharts = async () => {
        const captures: string[] = [];
        const refs = [sequenceRef, hysteresisRef, complianceRef, differentialRef];
        
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
                    console.error("Error capturando gráfico termostato:", err);
                }
            }
        }
        return captures;
    };

    useImperativeHandle(ref, () => ({
        captureAllCharts
    }));

    // --- Renders Individuales ---

    const renderSequence = () => (
        <div className="h-96 w-full bg-white p-4">
            <h4 className="text-lg font-semibold text-gray-700 mb-4 text-center">Secuencia de Actuación</h4>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={processedData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="index" label={{ value: 'Prueba #', position: 'insideBottom', offset: -5 }} />
                    <YAxis label={{ value: '°C', angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Legend verticalAlign="top" />
                    <Line name="Temp. Aplicada" type="monotone" dataKey="appliedTemperature" stroke="#f59e0b" isAnimationActive={false} />
                    <Line name="Temp. Real Cambio" type="monotone" dataKey="realTemperature" stroke="#10b981" strokeWidth={3} isAnimationActive={false} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );

    const renderHysteresis = () => {
        const rising = processedData.filter(d => d.isRising);
        const falling = processedData.filter(d => d.isFalling);
        return (
            <div className="h-96 w-full bg-white p-4">
                <h4 className="text-lg font-semibold text-gray-700 mb-4 text-center">Gráfico de Histéresis</h4>
                <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                        <CartesianGrid />
                        <XAxis type="number" dataKey="realTemperature" name="Temp" unit="°C" domain={['auto', 'auto']} />
                        <YAxis type="number" dataKey="contactState" name="Estado" ticks={[0, 1]} tickFormatter={(val) => val === 1 ? 'CERRADO' : 'ABIERTO'} />
                        <ZAxis range={[100, 101]} />
                        <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                        <Legend verticalAlign="top" />
                        <Scatter name="Ascendente (ON/OFF)" data={rising} fill="#ef4444" shape="circle" isAnimationActive={false} />
                        <Scatter name="Descendente (OFF/ON)" data={falling} fill="#3b82f6" shape="diamond" isAnimationActive={false} />
                    </ScatterChart>
                </ResponsiveContainer>
            </div>
        );
    };

    const renderCompliance = () => {
        const compliant = processedData.filter(d => d.meetsSpec).length;
        return (
            <div className="p-8 bg-white">
                 <h4 className="text-lg font-semibold text-gray-700 mb-6 text-center">Resumen de Conformidad</h4>
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-6 bg-green-50 border border-green-200 rounded-xl text-center">
                        <p className="text-green-800 font-bold text-4xl">{compliant}</p>
                        <p className="text-green-600 font-medium">Exitosas</p>
                    </div>
                    <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-center">
                        <p className="text-red-800 font-bold text-4xl">{processedData.length - compliant}</p>
                        <p className="text-red-600 font-medium">Fallidas</p>
                    </div>
                </div>
            </div>
        );
    };

    const renderDifferential = () => (
        <div className="h-96 w-full bg-white p-4">
            <h4 className="text-lg font-semibold text-gray-700 mb-4 text-center">Análisis de Error</h4>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={processedData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="index" />
                    <YAxis />
                    <Tooltip />
                    <ReferenceLine y={0} stroke="#000" strokeWidth={2} />
                    <Line name="Error Térmico" type="step" dataKey="differential" stroke="#8b5cf6" dot={{ r: 6 }} isAnimationActive={false} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );

    const chartViews = [
        { id: 'sequence', name: 'Secuencia', icon: '📈', description: 'Temperaturas por orden de ejecución' },
        { id: 'hysteresis', name: 'Histéresis', icon: '🌡️', description: 'Puntos de conmutación térmica' },
        { id: 'compliance', name: 'Conformidad', icon: '✅', description: 'Cumplimiento de especificaciones' },
        { id: 'differential', name: 'Diferencial', icon: '📊', description: 'Desviación aplicada vs real' }
    ];

    return (
        <div className="mt-8 font-sans">
            <div className="bg-gradient-to-r from-slate-700 to-slate-900 rounded-t-xl px-6 py-5 shadow-lg text-white">
                <div className="flex items-center">
                    <span className="text-2xl mr-3">🌡️</span>
                    <h3 className="text-xl font-bold">Análisis de Termostato</h3>
                </div>
            </div>

            <div className="bg-white border-b flex overflow-x-auto">
                {chartViews.map((view) => (
                    <button
                        key={view.id}
                        onClick={() => setActiveView(view.id as ChartView)}
                        className={`px-6 py-4 text-sm font-semibold transition-all border-b-2 whitespace-nowrap
                            ${activeView === view.id ? 'border-blue-500 text-blue-600 bg-blue-50' : 'border-transparent text-gray-500 hover:bg-gray-50'}`}
                    >
                        {view.icon} {view.name}
                    </button>
                ))}
            </div>

            <div className="bg-white p-6 rounded-b-xl shadow-md border border-gray-100">
                {processedData.length === 0 ? (
                    <div className="py-20 text-center text-gray-400">No hay datos suficientes.</div>
                ) : (
                    <>
                        {activeView === 'sequence' && renderSequence()}
                        {activeView === 'hysteresis' && renderHysteresis()}
                        {activeView === 'compliance' && renderCompliance()}
                        {activeView === 'differential' && renderDifferential()}

                        {/* Oculto para exportación */}
                        <div style={{ position: 'absolute', left: '-9999px', top: 0, width: '800px' }}>
                            <div ref={sequenceRef}>{renderSequence()}</div>
                            <div ref={hysteresisRef}>{renderHysteresis()}</div>
                            <div ref={complianceRef}>{renderCompliance()}</div>
                            <div ref={differentialRef}>{renderDifferential()}</div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
});

export default ThermostatChart;