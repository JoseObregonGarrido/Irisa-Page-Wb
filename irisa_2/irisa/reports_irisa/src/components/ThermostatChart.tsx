import React, { useState, useMemo, useRef, useImperativeHandle, forwardRef } from 'react';
import { 
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
    ResponsiveContainer, ScatterChart, Scatter, ReferenceLine, ZAxis 
} from 'recharts';
import { toPng } from 'html-to-image';

// ACTUALIZACIÓN: Interfaz alineada con ThermostatTable y HomePage
export interface ThermostatTest {
    temperaturadeDisparo: string;
    temperaturadeRepone: string;
    isNO: boolean;
    isNC: boolean;
}

interface ThermostatChartProps {
    tests?: ThermostatTest[];
    data?: ThermostatTest[];
}

type ChartView = 'sequence' | 'contacts' | 'differential';

const ThermostatChart = forwardRef<any, ThermostatChartProps>(({ tests, data }, ref) => {
    const chartData = tests || data || [];
    const [activeView, setActiveView] = useState<ChartView>('sequence');

    // Refs para capturas
    const sequenceRef = useRef<HTMLDivElement>(null);
    const contactsRef = useRef<HTMLDivElement>(null);
    const differentialRef = useRef<HTMLDivElement>(null);

    // Mapeo de los nuevos datos para Recharts
    const processedData = useMemo(() => {
        return chartData.map((test, index) => {
            const disparo = parseFloat(test.temperaturadeDisparo) || 0;
            const repone = parseFloat(test.temperaturadeRepone) || 0;
            
            return {
                index: index + 1,
                temperaturadeDisparo: disparo,
                temperaturadeRepone: repone,
                noState: test.isNO ? 1 : 0,
                ncState: test.isNC ? 1 : 0,
                differential: Math.abs(disparo - repone), // Diferencial térmico real
            };
        });
    }, [chartData]);

    // --- Función de Captura para PDF ---
    const captureAllCharts = async () => {
        const captures: string[] = [];
        const refs = [sequenceRef, contactsRef, differentialRef];
        
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
                    console.error("error capturando gráfico termostato:", err);
                }
            }
        }
        return captures;
    };

    useImperativeHandle(ref, () => ({
        captureAllCharts
    }));

    // --- Renders Actualizados ---

    const renderSequence = () => (
        <div className="h-96 w-full bg-white p-4">
            <h4 className="text-lg font-semibold text-gray-700 mb-4 text-center">secuencia de temperaturas</h4>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={processedData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="index" label={{ value: 'prueba #', position: 'insideBottom', offset: -5 }} />
                    <YAxis label={{ value: '°c', angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Legend verticalAlign="top" />
                    <Line name="t. disparo" type="monotone" dataKey="temperaturadeDisparo" stroke="#ef4444" strokeWidth={3} dot={{ r: 6 }} isAnimationActive={false} />
                    <Line name="t. repone" type="monotone" dataKey="temperaturadeRepone" stroke="#3b82f6" strokeWidth={3} dot={{ r: 6 }} isAnimationActive={false} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );

    const renderContacts = () => (
        <div className="h-96 w-full bg-white p-4">
            <h4 className="text-lg font-semibold text-gray-700 mb-4 text-center">estado de contactos (activo/inactivo)</h4>
            <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 20 }}>
                    <CartesianGrid />
                    <XAxis type="number" dataKey="index" name="prueba" unit="#" />
                    <YAxis type="number" dataKey="state" name="estado" ticks={[0, 1]} tickFormatter={(val) => val === 1 ? 'activo' : 'inactivo'} />
                    <ZAxis range={[100, 101]} />
                    <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                    <Legend verticalAlign="top" />
                    <Scatter name="n.o (normal abierto)" data={processedData.map(d => ({ index: d.index, state: d.noState }))} fill="#10b981" shape="square" isAnimationActive={false} />
                    <Scatter name="n.c (normal cerrado)" data={processedData.map(d => ({ index: d.index, state: d.ncState }))} fill="#8b5cf6" shape="circle" isAnimationActive={false} />
                </ScatterChart>
            </ResponsiveContainer>
        </div>
    );

    const renderDifferential = () => (
        <div className="h-96 w-full bg-white p-4">
            <h4 className="text-lg font-semibold text-gray-700 mb-4 text-center">análisis de diferencial (histéresis)</h4>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={processedData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="index" />
                    <YAxis label={{ value: 'Δ °c', angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Line name="diferencial real" type="step" dataKey="differential" stroke="#f59e0b" strokeWidth={2} dot={{ r: 5 }} isAnimationActive={false} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );

    const chartViews = [
        { id: 'sequence', name: 'temperaturas', icon: '📈' },
        { id: 'contacts', name: 'contactos', icon: '🔌' },
        { id: 'differential', name: 'diferencial', icon: '📊' }
    ];

    return (
        <div className="mt-8 font-sans">
            <div className="bg-gradient-to-r from-slate-700 to-slate-900 rounded-t-xl px-6 py-5 shadow-lg text-white">
                <div className="flex items-center">
                    <span className="text-2xl mr-3">🌡️</span>
                    <h3 className="text-xl font-bold">análisis de termostato</h3>
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
                    <div className="py-20 text-center text-gray-400">no hay datos suficientes para graficar.</div>
                ) : (
                    <>
                        {activeView === 'sequence' && renderSequence()}
                        {activeView === 'contacts' && renderContacts()}
                        {activeView === 'differential' && renderDifferential()}

                        {/* Oculto para exportación PDF */}
                        <div style={{ position: 'absolute', left: '-9999px', top: 0, width: '800px' }}>
                            <div ref={sequenceRef}>{renderSequence()}</div>
                            <div ref={contactsRef}>{renderContacts()}</div>
                            <div ref={differentialRef}>{renderDifferential()}</div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
});

export default ThermostatChart;