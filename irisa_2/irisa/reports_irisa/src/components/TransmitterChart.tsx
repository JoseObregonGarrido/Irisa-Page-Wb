import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter } from 'recharts';
import { toPng } from 'html-to-image';
import React, { useState, useRef, useImperativeHandle, forwardRef } from 'react';

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
    outputUnit?: 'mA' | 'Ω' | string; 
}

type ChartView = 'response' | 'errors' | 'linearity' | 'percentage';

const TransmitterChart = forwardRef<any, TransmitterChartProps>(({ measurements, data, outputUnit = 'mA' }, ref) => {
    const chartData = measurements || data || [];
    const [activeView, setActiveView] = useState<ChartView>('response');

    // Mapeo dinámico de etiquetas basado en la unidad
    const labels = {
        ideal: `Ideal ${outputUnit}`,
        measured: `Medido ${outputUnit}`,
        error: `Error ${outputUnit}`,
        unit: outputUnit
    };

    const responseRef = useRef<HTMLDivElement>(null);
    const errorsRef = useRef<HTMLDivElement>(null);
    const linearityRef = useRef<HTMLDivElement>(null);
    const percentageRef = useRef<HTMLDivElement>(null);

    const processDataForChart = () => {
        return chartData.map((m) => ({
            percentage: parseFloat(m.percentage) || 0,
            idealUe: parseFloat(m.idealUe) || 0,
            patronUe: parseFloat(m.patronUe) || 0,
            ueTransmitter: parseFloat(m.ueTransmitter) || 0,
            idealValue: parseFloat(m.idealMa) || 0, 
            measuredValue: parseFloat(m.maTransmitter) || 0, 
            errorUe: parseFloat(m.errorUe) || 0,
            errorValue: parseFloat(m.errorMa) || 0, 
            errorPercentage: parseFloat(m.errorPercentage) || 0,
        })).sort((a, b) => a.percentage - b.percentage);
    };

    const processedData = processDataForChart();

    useImperativeHandle(ref, () => ({
        captureAllCharts: async () => {
            const captures: string[] = [];
            const refs = [responseRef, errorsRef, linearityRef, percentageRef];
            for (const chartRef of refs) {
                if (chartRef.current) {
                    const dataUrl = await toPng(chartRef.current, { backgroundColor: '#ffffff', pixelRatio: 2 });
                    captures.push(dataUrl);
                }
            }
            return captures;
        }
    }));

    // --- Renders usando el objeto 'labels' ---

    const renderResponseChart = () => (
        <div className="h-96 w-full bg-white p-4">
            <h4 className="text-lg font-semibold text-gray-700 mb-4 text-center">Curva de Respuesta</h4>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart key={`res-${outputUnit}`} data={processedData} margin={{ top: 5, right: 30, left: 20, bottom: 25 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="percentage" label={{ value: '% Rango', position: 'insideBottom', offset: -10 }} />
                    <YAxis label={{ value: `Unidades (${labels.unit})`, angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Legend verticalAlign="top" />
                    <Line type="monotone" dataKey="idealValue" stroke="#3b82f6" name={labels.ideal} strokeWidth={2} isAnimationActive={false} />
                    <Line type="monotone" dataKey="measuredValue" stroke="#ef4444" name={labels.measured} strokeWidth={2} isAnimationActive={false} />
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
                    <XAxis dataKey="percentage" />
                    <YAxis label={{ value: `Error (${labels.unit})`, angle: -90, position: 'insideLeft' }} />
                    <Tooltip formatter={(val: number, name: string) => [val.toFixed(4), name]} />
                    <Legend verticalAlign="top" />
                    <Line type="monotone" dataKey="errorUe" stroke="#dc2626" name="Error UE" strokeWidth={2} isAnimationActive={false} />
                    <Line type="monotone" dataKey="errorValue" stroke="#ea580c" name={labels.error} strokeWidth={2} isAnimationActive={false} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );

    const renderLinearityChart = () => {
        const domain = outputUnit === 'mA' ? [4, 20] : ['auto', 'auto'];
        return (
            <div className="h-96 w-full bg-white p-4">
                <h4 className="text-lg font-semibold text-gray-700 mb-4 text-center">Análisis de Linealidad</h4>
                <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart key={`lin-${outputUnit}`} margin={{ top: 20, right: 30, left: 20, bottom: 25 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" dataKey="idealValue" name={labels.ideal} unit={labels.unit} domain={domain} />
                        <YAxis type="number" dataKey="measuredValue" name={labels.measured} unit={labels.unit} domain={domain} />
                        <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                        <Legend verticalAlign="top" />
                        <Scatter name={`Puntos (${labels.unit})`} data={processedData} fill="#8884d8" isAnimationActive={false} />
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
                    <XAxis dataKey="percentage" />
                    <YAxis label={{ value: '% Error', angle: -90, position: 'insideLeft' }} />
                    <Tooltip formatter={(val: number) => [`${val.toFixed(3)}%`, "Error"]} />
                    <Line type="monotone" dataKey="errorPercentage" stroke="#7c3aed" name="% Error" strokeWidth={3} isAnimationActive={false} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );

    return (
        <div className="mt-8 shadow-lg rounded-xl overflow-hidden border border-gray-100">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5 text-white">
                <div className="flex items-center gap-4">
                    <span className="text-3xl">📊</span>
                    <div>
                        <h3 className="text-xl font-bold">Análisis del Transmisor ({labels.unit})</h3>
                        <p className="text-blue-100 text-sm opacity-90">Visualización dinámica de datos</p>
                    </div>
                </div>
            </div>

            <div className="bg-gray-50 border-b flex overflow-x-auto shadow-inner">
                {[
                    { id: 'response', name: 'Respuesta', icon: '📈' },
                    { id: 'errors', name: 'Errores', icon: '⚠️' },
                    { id: 'linearity', name: 'Linealidad', icon: '📊' },
                    { id: 'percentage', name: 'Error %', icon: '%' }
                ].map((view) => (
                    <button
                        key={view.id}
                        onClick={() => setActiveView(view.id as ChartView)}
                        className={`px-6 py-4 text-sm font-semibold transition-all border-b-2 whitespace-nowrap flex items-center gap-2 ${
                            activeView === view.id ? 'border-blue-600 text-blue-700 bg-white' : 'border-transparent text-gray-500 hover:bg-gray-100'
                        }`}
                    >
                        <span>{view.icon}</span> {view.name}
                    </button>
                ))}
            </div>

            <div className="p-6 bg-white">
                {activeView === 'response' && renderResponseChart()}
                {activeView === 'errors' && renderErrorsChart()}
                {activeView === 'linearity' && renderLinearityChart()}
                {activeView === 'percentage' && renderPercentageChart()}

                {/* Capturas ocultas */}
                <div style={{ position: 'absolute', left: '-9999px', top: 0, width: '800px' }}>
                    <div ref={responseRef}>{renderResponseChart()}</div>
                    <div ref={errorsRef}>{renderErrorsChart()}</div>
                    <div ref={linearityRef}>{renderLinearityChart()}</div>
                    <div ref={percentageRef}>{renderPercentageChart()}</div>
                </div>
            </div>
        </div>
    );
});

export default TransmitterChart;