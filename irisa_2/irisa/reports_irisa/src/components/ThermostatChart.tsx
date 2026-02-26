import React, { useState, useMemo, useRef, useImperativeHandle, forwardRef } from 'react';
import { 
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
    ResponsiveContainer, ScatterChart, Scatter, ReferenceLine, ZAxis 
} from 'recharts';
import { toPng } from 'html-to-image';

// ACTUALIZACIÓN: Interfaz alineada con ThermostatTable y HomePage
export interface ThermostatTest {
    tempDisparo: string;
    tempRepone: string;
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
            const disparo = parseFloat(test.tempDisparo) || 0;
            const repone = parseFloat(test.tempRepone) || 0;
            
            return {
                index: index + 1,
                tempDisparo: disparo,
                tempRepone: repone,
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
                    console.error("Error capturando gráfico termostato:", err);
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
            <h4 className="text-lg font-semibold text-gray-700 mb-4 text-center">Secuencia de Temperaturas</h4>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={processedData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="index" label={{ value: 'Prueba #', position: 'insideBottom', offset: -5 }} />
                    <YAxis label={{ value: '°C', angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Legend verticalAlign="top" />
                    <Line name="T. Disparo" type="monotone" dataKey="tempDisparo" stroke="#ef4444" strokeWidth={3} dot={{ r: 6 }} isAnimationActive={false} />
                    <Line name="T. Repone" type="monotone" dataKey="tempRepone" stroke="#3b82f6" strokeWidth={3} dot={{ r: 6 }} isAnimationActive={false} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );

    const renderContacts = () => (
        <div className="h-96 w-full bg-white p-4">
            <h4 className="text-lg font-semibold text-gray-700 mb-4 text-center">Estado de Contactos (Activo/Inactivo)</h4>
            <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 20 }}>
                    <CartesianGrid />
                    <XAxis type="number" dataKey="index" name="Prueba" unit="#" />
                    <YAxis type="number" dataKey="state" name="Estado" ticks={[0, 1]} tickFormatter={(val) => val === 1 ? 'ACTIVO' : 'INACTIVO'} />
                    <ZAxis range={[100, 101]} />
                    <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                    <Legend verticalAlign="top" />
                    <Scatter name="N.O (Normal Abierto)" data={processedData.map(d => ({ index: d.index, state: d.noState }))} fill="#10b981" shape="square" isAnimationActive={false} />
                    <Scatter name="N.C (Normal Cerrado)" data={processedData.map(d => ({ index: d.index, state: d.ncState }))} fill="#8b5cf6" shape="circle" isAnimationActive={false} />
                </ScatterChart>
            </ResponsiveContainer>
        </div>
    );

    const renderDifferential = () => (
        <div className="h-96 w-full bg-white p-4">
            <h4 className="text-lg font-semibold text-gray-700 mb-4 text-center">Análisis de Diferencial (Hysteresis)</h4>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={processedData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="index" />
                    <YAxis label={{ value: 'Δ °C', angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Line name="Diferencial Real" type="step" dataKey="differential" stroke="#f59e0b" strokeWidth={2} dot={{ r: 5 }} isAnimationActive={false} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );

    const chartViews = [
        { id: 'sequence', name: 'Temperaturas', icon: '📈' },
        { id: 'contacts', name: 'Contactos', icon: '🔌' },
        { id: 'differential', name: 'Diferencial', icon: '📊' }
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
                    <div className="py-20 text-center text-gray-400">No hay datos suficientes para graficar.</div>
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