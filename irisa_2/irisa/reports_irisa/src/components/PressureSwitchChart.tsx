import React, { useState, useMemo, useRef, useImperativeHandle, forwardRef } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  Legend, ResponsiveContainer, ReferenceLine, AreaChart, Area 
} from 'recharts';
import { toPng } from 'html-to-image';

export interface PressureSwitchTest {
    presionDisparada: string;
    presionRepone: string;
    isNO: boolean;
    isNC: boolean;
}

interface PressureSwitchChartProps {
    tests?: PressureSwitchTest[];
    data?: PressureSwitchTest[];
}

type ChartView = 'sequence' | 'compliance' | 'differential';

const PressureSwitchChart = forwardRef<any, PressureSwitchChartProps>(({ tests, data }, ref) => {
    const rawData = tests || data || [];
    const [activeView, setActiveView] = useState<ChartView>('sequence');

    const sequenceRef = useRef<HTMLDivElement>(null);
    const complianceRef = useRef<HTMLDivElement>(null);
    const differentialRef = useRef<HTMLDivElement>(null);

    const processedData = useMemo(() => {
        const source = rawData.length > 0 ? rawData : [];
        return source.map((test, index) => {
            const disparada = parseFloat(test.presionDisparada) || 0;
            const repone = parseFloat(test.presionRepone) || 0;
            
            return {
                index: index + 1,
                presionDisparada: disparada,
                presionRepone: repone,
                differential: parseFloat((disparada - repone).toFixed(2)),
                estado: `${test.isNO ? 'N.O' : ''} ${test.isNC ? 'N.C' : ''}`.trim()
            };
        });
    }, [rawData]);

    const stats = useMemo(() => ({
        noCount: rawData.filter(d => d.isNO).length,
        ncCount: rawData.filter(d => d.isNC).length,
        total: rawData.length
    }), [rawData]);

    const captureAllCharts = async () => {
        const captures: string[] = [];
        const refs = [sequenceRef, complianceRef, differentialRef];
        for (const chartRef of refs) {
            if (chartRef.current) {
                try {
                    const dataUrl = await toPng(chartRef.current, { 
                        backgroundColor: '#ffffff',
                        pixelRatio: 3, // Mayor densidad de pixeles para que no se pixele en el PDF
                        cacheBust: true,
                        style: { padding: '25px' } 
                    });
                    captures.push(dataUrl);
                } catch (err) {
                    console.error("Error capturando gráfico:", err);
                }
            }
        }
        return captures;
    };

    useImperativeHandle(ref, () => ({ captureAllCharts }));

    const renderSequenceChart = () => (
        <div className="h-80 w-full bg-white p-6">
            <h4 className="text-sm font-bold text-gray-400 mb-2 text-center uppercase tracking-wider">Disparada VS Repone</h4>
            <ResponsiveContainer width="100%" height="90%">
                {/* MARGIN TOP AUMENTADO A 40 PARA QUE LA LEYENDA NO CHOQUE */}
                <LineChart data={processedData} margin={{ top: 40, right: 30, left: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis dataKey="index" label={{ value: 'Muestras', position: 'insideBottom', offset: -10 }} />
                    {/* DOMAIN CON 'dataMax + 2' PARA DAR AIRE ARRIBA SIEMPRE */}
                    <YAxis unit=" PSI" domain={[0, (dataMax: number) => Math.ceil(dataMax + 2)]} />
                    <Tooltip />
                    {/* LEYENDA CON WRAPPERSTYLE PARA SEPARARLA DE LOS PUNTOS */}
                    <Legend verticalAlign="top" align="center" wrapperStyle={{ paddingBottom: '20px' }} />
                    <Line type="monotone" dataKey="presionDisparada" stroke="#f59e0b" name="Presion. Disparada" strokeWidth={3} dot={{ r: 5 }} isAnimationActive={false} />
                    <Line type="monotone" dataKey="presionRepone" stroke="#10b981" name="Presion. Repone" strokeWidth={3} dot={{ r: 5 }} isAnimationActive={false} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );

    const renderDifferentialChart = () => (
        <div className="h-80 w-full bg-white p-6">
            <h4 className="text-sm font-bold text-gray-400 mb-2 text-center uppercase tracking-wider">Histéresis (Diferencial)</h4>
            <ResponsiveContainer width="100%" height="90%">
                <AreaChart data={processedData} margin={{ top: 40, right: 30, left: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="index" />
                    <YAxis domain={[0, (dataMax: number) => Math.ceil(dataMax + 1)]} />
                    <Tooltip />
                    <Legend verticalAlign="top" align="center" wrapperStyle={{ paddingBottom: '20px' }} />
                    <ReferenceLine y={0} stroke="#ef4444" strokeDasharray="5 5" />
                    <Area type="monotone" dataKey="differential" stroke="#6366f1" fill="#e0e7ff" name="Diferencial (PSI)" isAnimationActive={false} />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );

    const renderComplianceStats = () => (
        <div className="p-6 bg-white min-h-[320px] flex flex-col justify-center">
            <h4 className="text-sm font-bold text-gray-400 mb-8 text-center uppercase tracking-wider">ANÁLISIS DE CONTACTO</h4>
            <div className="grid grid-cols-2 gap-8">
                <div className="rounded-xl border border-blue-100 bg-blue-50 p-8 text-center shadow-sm">
                    <p className="text-xs font-bold text-blue-600 uppercase mb-2">Contactos N.O</p>
                    <p className="text-4xl font-black text-blue-700">{stats.noCount}</p>
                </div>
                <div className="rounded-xl border border-purple-100 bg-purple-50 p-8 text-center shadow-sm">
                    <p className="text-xs font-bold text-purple-600 uppercase mb-2">Contactos N.C</p>
                    <p className="text-4xl font-black text-purple-700">{stats.ncCount}</p>
                </div>
            </div>
        </div>
    );

    return (
        <div className="mt-8 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-md">
            <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-6 py-5">
                <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-orange-500 p-2 text-white shadow-lg">
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    </div>
                    <h3 className="text-lg font-bold text-white uppercase tracking-tight">Análisis de Presostato</h3>
                </div>
            </div>

            <div className="flex border-b bg-gray-50/50">
                {[{ id: 'sequence', name: 'Disparada VS Response', icon: '📈' }, { id: 'differential', name: 'Histéresis (Diferencial)', icon: '📊' }, { id: 'compliance', name: 'Contactos', icon: '🔘' }].map((view) => (
                    <button
                        key={view.id}
                        onClick={() => setActiveView(view.id as ChartView)}
                        className={`flex-1 py-4 text-sm font-semibold transition-all ${activeView === view.id ? 'bg-white text-orange-600 border-b-2 border-orange-500' : 'text-gray-500 hover:bg-gray-100'}`}
                    >
                        {view.icon} {view.name}
                    </button>
                ))}
            </div>

            <div className="p-4">
                {activeView === 'sequence' && renderSequenceChart()}
                {activeView === 'differential' && renderDifferentialChart()}
                {activeView === 'compliance' && renderComplianceStats()}

                {/* Contenedor oculto optimizado para capturas PDF */}
                <div style={{ position: 'absolute', left: '-9999px', top: 0, width: '1000px' }}>
                    <div ref={sequenceRef} style={{ width: '1000px', height: '500px' }}>{renderSequenceChart()}</div>
                    <div ref={differentialRef} style={{ width: '1000px', height: '500px' }}>{renderDifferentialChart()}</div>
                    <div ref={complianceRef} style={{ width: '1000px', height: '500px' }}>{renderComplianceStats()}</div>
                </div>

                <div className="mt-4 flex gap-6 border-t border-gray-100 pt-6 px-4 text-xs font-bold text-gray-400 uppercase">
                    <span>Muestras capturadas: {stats.total}</span>
                    <span className="ml-auto">Ingenio Risaralda © 2026</span>
                </div>
            </div>
        </div>
    );
});

export default PressureSwitchChart; 