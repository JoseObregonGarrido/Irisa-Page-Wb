import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter } from 'recharts';
import { toPng } from 'html-to-image';
import React, { useState, useRef, useImperativeHandle, forwardRef } from 'react';

export interface Measurement {
    percentage: string;
    idealUe: string;
    patronUe: string;
    ueTransmitter: string;
    idealMa: string; // Usaremos este campo para mA o Ω
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

    // Mapeo dinámico: convertimos idealMa a idealValue para que la gráfica no sepa qué unidad es
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

    // --- Gráficos con etiquetas dinámicas ---

    const renderResponseChart = () => (
        <div className="h-96 w-full bg-white p-4">
            <h4 className="text-lg font-semibold text-gray-700 mb-4 text-center">Curva de Respuesta</h4>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart key={`res-${outputUnit}`} data={processedData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="percentage" />
                    <YAxis label={{ value: outputUnit, angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Legend verticalAlign="top" />
                    {/* Aquí cambiamos el "name" dinámicamente */}
                    <Line type="monotone" dataKey="idealValue" stroke="#3b82f6" name={`Ideal ${outputUnit}`} strokeWidth={2} isAnimationActive={false} />
                    <Line type="monotone" dataKey="measuredValue" stroke="#ef4444" name={`Medido ${outputUnit}`} strokeWidth={2} isAnimationActive={false} />
                    <Line type="monotone" dataKey="idealUe" stroke="#10b981" name="Ideal UE" strokeDasharray="5 5" isAnimationActive={false} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );

    const renderErrorsChart = () => (
        <div className="h-96 w-full bg-white p-4">
            <h4 className="text-lg font-semibold text-gray-700 mb-4 text-center">Errores Absolutos</h4>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart key={`err-${outputUnit}`} data={processedData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="percentage" />
                    <YAxis label={{ value: outputUnit, angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="errorValue" stroke="#ea580c" name={`Error ${outputUnit}`} strokeWidth={2} isAnimationActive={false} />
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
                    <ScatterChart key={`lin-${outputUnit}`}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" dataKey="idealValue" name={`Ideal ${outputUnit}`} unit={outputUnit} domain={domain} />
                        <YAxis type="number" dataKey="measuredValue" name={`Medido ${outputUnit}`} unit={outputUnit} domain={domain} />
                        <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                        <Legend />
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
                <LineChart data={processedData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="percentage" />
                    <YAxis unit="%" />
                    <Tooltip />
                    <Line type="monotone" dataKey="errorPercentage" stroke="#7c3aed" name="% Error" strokeWidth={3} isAnimationActive={false} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );

    return (
        <div className="mt-8 border rounded-xl overflow-hidden shadow-sm">
            <div className="bg-slate-800 p-4 text-white">
                <h3 className="font-bold">Análisis del Transmisor ({outputUnit})</h3>
            </div>
            <div className="flex border-b bg-gray-50">
                {(['response', 'errors', 'linearity', 'percentage'] as ChartView[]).map((view) => (
                    <button 
                        key={view} 
                        onClick={() => setActiveView(view)}
                        className={`px-4 py-2 text-sm font-medium ${activeView === view ? 'bg-white border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
                    >
                        {view.toUpperCase()}
                    </button>
                ))}
            </div>
            <div className="p-4 bg-white">
                {activeView === 'response' && renderResponseChart()}
                {activeView === 'errors' && renderErrorsChart()}
                {activeView === 'linearity' && renderLinearityChart()}
                {activeView === 'percentage' && renderPercentageChart()}

                {/* Contenedor oculto para capturas PNG */}
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