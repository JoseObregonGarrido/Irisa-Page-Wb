import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useRef, useImperativeHandle, forwardRef } from 'react';
import { toPng } from 'html-to-image';

const UnifiedChart = forwardRef<any, { measurements: any[] }>(({ measurements = [] }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);

    const processedData = measurements.map(m => ({
        temperatura: parseFloat(m.idealUE) || 0,
        idealMV: m.mode !== 'tx' ? parseFloat(m.idealmV) : null,
        sensorMV: m.mode !== 'tx' ? parseFloat(m.sensormV) : null,
        idealMA: m.mode === 'tx' ? parseFloat(m.idealmA) : null,
        maTx: m.mode === 'tx' ? parseFloat(m.mATX || m.maTransmitter) : null,
    })).sort((a, b) => a.temperatura - b.temperatura);

    useImperativeHandle(ref, () => ({
        captureAllCharts: async () => {
            if (containerRef.current) {
                return [await toPng(containerRef.current, { backgroundColor: '#ffffff', pixelRatio: 2 })];
            }
            return [];
        }
    }));

    return (
        <div className="mt-8 shadow-lg rounded-xl overflow-hidden border border-gray-200 bg-white" ref={containerRef}>
            <div className="bg-gradient-to-r from-gray-800 to-gray-700 px-6 py-5 text-white">
                <h3 className="text-xl font-bold">Gráfico Unificado: mV & Transmisor (mA)</h3>
                <p className="text-gray-300 text-sm">Eje Izq: mV | Eje Der: mA | Eje X: Temperatura</p>
            </div>
            <div className="p-6 h-96">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={processedData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis dataKey="temperatura" type="number" name="Temp" unit=" UE" tick={{fontSize: 11}} />
                        
                        {/* EJE Y IZQUIERDA (mV) */}
                        <YAxis yAxisId="left" orientation="left" stroke="#8b5cf6" label={{ value: 'mV', angle: -90, position: 'insideLeft' }} />
                        
                        {/* EJE Y DERECHA (mA) */}
                        <YAxis yAxisId="right" orientation="right" stroke="#10b981" label={{ value: 'mA', angle: 90, position: 'insideRight' }} />
                        
                        <Tooltip />
                        <Legend verticalAlign="top" height={40}/>

                        {/* Líneas mV */}
                        <Line yAxisId="left" type="monotone" dataKey="idealMV" stroke="#8b5cf6" name="Ideal mV" strokeWidth={2} dot={{r:4}} connectNulls />
                        <Line yAxisId="left" type="monotone" dataKey="sensorMV" stroke="#ec4899" name="Sensor mV" strokeDasharray="5 5" connectNulls />

                        {/* Líneas mA */}
                        <Line yAxisId="right" type="monotone" dataKey="idealMA" stroke="#10b981" name="Ideal mA" strokeWidth={2} dot={{r:4}} connectNulls />
                        <Line yAxisId="right" type="monotone" dataKey="maTx" stroke="#ef4444" name="mA TX" strokeDasharray="5 5" connectNulls />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
});

export default UnifiedChart;