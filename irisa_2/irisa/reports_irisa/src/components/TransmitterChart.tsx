import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter } from 'recharts';
import { toPng } from 'html-to-image';
import React, { useState, useRef, useImperativeHandle, forwardRef } from 'react';

// Interfaz de mediciones
export interface Measurement {
    percentage: string;
    idealUe: string;
    patronUe: string;
    ueTransmitter: string;
    idealMa: string;
    maTransmitter: string;
    errorUe: string;
    errorMa: string;
    errorPercentage: string;
}

interface TransmitterChartProps {
    measurements?: Measurement[];
    data?: Measurement[];
    onChartsCapture?: React.MutableRefObject<any>;
    outputUnit?: 'mA' | 'Ω'; 
}

type ChartView = 'response' | 'errors' | 'linearity' | 'percentage';

const TransmitterChart = forwardRef<any, TransmitterChartProps>(({ measurements, data, outputUnit = 'mA' }, ref) => {
    const chartData = measurements || data || [];
    const [activeView, setActiveView] = useState<ChartView>('response');

    const responseRef = useRef<HTMLDivElement>(null);
    const errorsRef = useRef<HTMLDivElement>(null);
    const linearityRef = useRef<HTMLDivElement>(null);
    const percentageRef = useRef<HTMLDivElement>(null);

    // Procesamos los datos mapeando dinámicamente según la unidad seleccionada
    const processDataForChart = () => {
        return chartData.map((measurement) => {
            // Nota: Aquí asumo que si la unidad es Ω, los valores vienen en los mismos campos 
            // pero el usuario los ingresó como Ohmios, o el padre ya hizo el cambio.
            return {
                percentage: parseFloat(measurement.percentage) || 0,
                idealUe: parseFloat(measurement.idealUe) || 0,
                patronUe: parseFloat(measurement.patronUe) || 0,
                ueTransmitter: parseFloat(measurement.ueTransmitter) || 0,
                // Valores de salida (mA o Ω)
                idealValue: parseFloat(measurement.idealMa) || 0, 
                measuredValue: parseFloat(measurement.maTransmitter) || 0, 
                errorUe: parseFloat(measurement.errorUe) || 0,
                errorValue: parseFloat(measurement.errorMa) || 0, 
                errorPercentage: parseFloat(measurement.errorPercentage) || 0,
            };
        }).sort((a, b) => a.percentage - b.percentage);
    };

    const processedData = processDataForChart();

    const captureAllCharts = async () => {
        const captures: string[] = [];
        const refs = [responseRef, errorsRef, linearityRef, percentageRef];
        for (const chartRef of refs) {
            if (chartRef.current) {
                try {
                    const dataUrl = await toPng(chartRef.current, { 
                        backgroundColor: '#ffffff',
                        pixelRatio: 2, 
                        cacheBust: true,
                    });
                    captures.push(dataUrl);
                } catch (err) {
                    console.error("Error capturando gráfico:", err);
                }
            }
        }
        return captures;
    };

    useImperativeHandle(ref, () => ({
        captureAllCharts
    }));

    // --- Renderizado de Gráficos ---

    const renderResponseChart = () => (
        <div className="h-96 w-full bg-white p-4">
            <h4 className="text-lg font-semibold text-gray-700 mb-4 text-center">Curva de Respuesta</h4>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart key={`res-${outputUnit}`} data={processedData} margin={{ top: 5, right: 30, left: 20, bottom: 25 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="percentage" label={{ value: '% Rango', position: 'insideBottom', offset: -10 }} />
                    <YAxis label={{ value: `Unidades (${outputUnit})`, angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Legend verticalAlign="top" />
                    <Line type="monotone" dataKey="idealValue" stroke="#3b82f6" name={`Ideal ${outputUnit}`} strokeWidth={2} isAnimationActive={false} />
                    <Line type="monotone" dataKey="measuredValue" stroke="#ef4444" name={`Medido ${outputUnit}`} strokeWidth={2} isAnimationActive={false} />
                    <Line type="monotone" dataKey="idealUe" stroke="#10b981" name="Ideal UE" strokeDasharray="5 5" isAnimationActive={false} />
                    <Line type="monotone" dataKey="ueTransmitter" stroke="#f59e0b" name="UE Transmisor" strokeDasharray="5 5" isAnimationActive={false} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );

    const renderErrorsChart = () => (
        <div className="h-96 w-full bg-white p-4">
            <h4 className="text-lg font-semibold text-gray-700 mb-4 text-center">Errores Absolutos</h4>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart key={`err-${outputUnit}`} data={processedData} margin={{ top: 5, right: 30, left: 20, bottom: 25 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="percentage" label={{ value: '% Rango', position: 'insideBottom', offset: -10 }} />
                    <YAxis label={{ value: `Error (${outputUnit})`, angle: -90, position: 'insideLeft' }} />
                    <Tooltip formatter={(val: number) => val.toFixed(4)} />
                    <Legend verticalAlign="top" />
                    <Line type="monotone" dataKey="errorUe" stroke="#dc2626" name="Error UE" strokeWidth={2} isAnimationActive={false} />
                    <Line type="monotone" dataKey="errorValue" stroke="#ea580c" name={`Error ${outputUnit}`} strokeWidth={2} isAnimationActive={false} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );

    const renderLinearityChart = () => {
        // ESCALA DINÁMICA: 4 a 20 para mA, automático para Ohmios
        const linDomain = outputUnit === 'mA' ? [4, 20] : ['auto', 'auto'];

        return (
            <div className="h-96 w-full bg-white p-4">
                <h4 className="text-lg font-semibold text-gray-700 mb-4 text-center">Análisis de Linealidad</h4>
                <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart key={`lin-${outputUnit}`} margin={{ top: 20, right: 30, left: 20, bottom: 25 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                            type="number" 
                            dataKey="idealValue" 
                            name={`Ideal ${outputUnit}`} 
                            unit={outputUnit} 
                            domain={linDomain}
                            label={{ value: `Ideal ${outputUnit}`, position: 'insideBottom', offset: -10 }} 
                        />
                        <YAxis 
                            type="number" 
                            dataKey="measuredValue" 
                            name={`Medido ${outputUnit}`} 
                            unit={outputUnit} 
                            domain={linDomain}
                            label={{ value: `Medido ${outputUnit}`, angle: -90, position: 'insideLeft' }} 
                        />
                        <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                        <Legend verticalAlign="top" />
                        <Scatter name={`Puntos (${outputUnit})`} data={processedData} fill="#8884d8" isAnimationActive={false} />
                    </ScatterChart>
                </ResponsiveContainer>
            </div>
        );
    };

    const renderPercentageChart = () => (
        <div className="h-96 w-full bg-white p-4">
            <h4 className="text-lg font-semibold text-gray-700 mb-4 text-center">Error Porcentual</h4>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={processedData} margin={{ top: 5, right: 30, left: 20, bottom: 25 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="percentage" label={{ value: '% Rango', position: 'insideBottom', offset: -10 }} />
                    <YAxis label={{ value: '% Error', angle: -90, position: 'insideLeft' }} />
                    <Tooltip formatter={(val: number) => `${val.toFixed(3)}%`} />
                    <Line type="monotone" dataKey="errorPercentage" stroke="#7c3aed" name="% Error (SPAN)" strokeWidth={3} dot={{ r: 6 }} isAnimationActive={false} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );

    const chartViews = [
        { id: 'response' as ChartView, name: 'Respuesta', icon: '📈', description: `Valores ideales vs medidos en ${outputUnit}` },
        { id: 'errors' as ChartView, name: 'Errores', icon: '⚠️', description: `Desviaciones en UE y ${outputUnit}` },
        { id: 'linearity' as ChartView, name: 'Linealidad', icon: '📊', description: `Análisis de regresión en ${outputUnit}` },
        { id: 'percentage' as ChartView, name: 'Error %', icon: '%', description: 'Errores como porcentaje del SPAN' }
    ];

    return (
        <div className="mt-8">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-t-xl px-6 py-4 text-white">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">📊</span>
                        <div>
                            <h3 className="text-xl font-bold">Análisis del Transmisor</h3>
                            <p className="text-blue-100 text-sm">Salida configurada en: {outputUnit}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white border-b flex overflow-x-auto">
                {chartViews.map((view) => (
                    <button
                        key={view.id}
                        onClick={() => setActiveView(view.id)}
                        className={`px-6 py-3 text-sm font-medium transition-all border-b-2 whitespace-nowrap ${
                            activeView === view.id ? 'border-blue-500 text-blue-600 bg-blue-50' : 'border-transparent text-gray-500 hover:bg-gray-50'
                        }`}
                    >
                        {view.icon} {view.name}
                    </button>
                ))}
            </div>

            <div className="bg-white rounded-b-xl shadow-md p-6">
                {chartData.length === 0 ? (
                    <div className="py-20 text-center text-gray-400">
                        <p>No hay datos suficientes para graficar</p>
                    </div>
                ) : (
                    <>
                        <div className="mb-4 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400 text-sm text-blue-700">
                            {chartViews.find(v => v.id === activeView)?.description}
                        </div>
                        
                        {activeView === 'response' && renderResponseChart()}
                        {activeView === 'errors' && renderErrorsChart()}
                        {activeView === 'linearity' && renderLinearityChart()}
                        {activeView === 'percentage' && renderPercentageChart()}

                        {/* Captura oculta para PDF */}
                        <div style={{ position: 'absolute', left: '-9999px', top: 0, width: '800px' }}>
                            <div ref={responseRef}>{renderResponseChart()}</div>
                            <div ref={errorsRef}>{renderErrorsChart()}</div>
                            <div ref={linearityRef}>{renderLinearityChart()}</div>
                            <div ref={percentageRef}>{renderPercentageChart()}</div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
});

export default TransmitterChart;