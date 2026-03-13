import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { toPng } from 'html-to-image';
import { useRef, useImperativeHandle, forwardRef } from 'react';

export interface RTDMeasurement {
    percentage: string;
    idealUE?: string;
    patronUE?: string;
    ueTransmitter?: string;
    idealmA?: string;
    maTransmitter?: string;
    idealohm?: string;
    ohmTransmitter?: string;
    errorUE?: string;
    errormA?: string;
    errorOhm?: string;
    errorPercentage?: string;
}

interface RTDChartProps {
    measurements?: RTDMeasurement[];
    hasUeTransmitter?: boolean;
}

const RTDChart = forwardRef<any, RTDChartProps>(({ 
    measurements = [],
    hasUeTransmitter = true 
}, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);

    // Procesamiento de datos único para ambas gráficas
    const processedData = measurements.map((m) => {
        const idealUeVal = m.idealUE ? parseFloat(m.idealUE) : null;
        return {
            temperatura: idealUeVal,
            idealOhm: m.idealohm ? parseFloat(m.idealohm) : null,
            sensorOhm: m.ohmTransmitter ? parseFloat(m.ohmTransmitter) : null,
            idealmA: m.idealmA ? parseFloat(m.idealmA) : null,
            maTransmitter: m.maTransmitter ? parseFloat(m.maTransmitter) : null,
            idealUE: idealUeVal,
            ueTransmitter: m.ueTransmitter ? parseFloat(m.ueTransmitter) : null,
        };
    }).sort((a, b) => (a.temperatura || 0) - (b.temperatura || 0));

    // Lógica de Ticks para el Eje X (Común)
    const getXTicks = () => {
        const temps = processedData.map(d => d.temperatura).filter(t => t !== null) as number[];
        if (temps.length === 0) return [];
        const min = Math.min(...temps), max = Math.max(...temps);
        let step = (max - min) / 4 || 10;
        const ticks = [];
        for (let i = min; i <= max; i += step) ticks.push(Number(i.toFixed(1)));
        return ticks;
    };

    const xTicks = getXTicks();

    useImperativeHandle(ref, () => ({
        captureAllCharts: async () => {
            if (containerRef.current) {
                return [await toPng(containerRef.current, { backgroundColor: '#ffffff', pixelRatio: 2 })];
            }
            return [];
        }
    }));

    if (processedData.length === 0) {
        return <div className="text-center py-12 text-gray-400">No hay datos suficientes.</div>;
    }

    return (
        <div ref={containerRef} className="space-y-8 bg-white p-4">
            
            {/* --- GRÁFICA 1: RESISTENCIA (OHM) --- */}
            <div className="shadow-lg rounded-xl overflow-hidden border border-gray-200">
                <div className="bg-gradient-to-r from-teal-600 to-emerald-600 px-6 py-4 text-white">
                    <h3 className="text-lg font-bold">Relación de Resistencia (Ω)</h3>
                    <p className="text-xs opacity-90 text-teal-50">Eje X: Temperatura (UE)</p>
                </div>
                <div className="h-80 w-full p-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={processedData} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                            <XAxis dataKey="temperatura" type="number" ticks={xTicks} domain={['auto', 'auto']} tick={{fontSize: 10}} label={{ value: 'Temp (UE)', position: 'insideBottom', offset: -10, fontSize: 11 }} />
                            <YAxis tick={{fontSize: 10}} label={{ value: 'Ohm (Ω)', angle: -90, position: 'insideLeft', fontSize: 11 }} />
                            <Tooltip formatter={(v: any) => v?.toFixed(3)} />
                            <Legend verticalAlign="top" height={36}/>
                            <Line type="monotone" dataKey="idealOhm" stroke="#10b981" name="Ideal Ohm" strokeWidth={2} dot={{ r: 3 }} />
                            <Line type="monotone" dataKey="sensorOhm" stroke="#f59e0b" name="Sensor Ohm" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* --- GRÁFICA 2: CORRIENTE (mA) --- */}
            <div className="shadow-lg rounded-xl overflow-hidden border border-gray-200">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 text-white">
                    <h3 className="text-lg font-bold">Salida de Corriente (mA)</h3>
                    <p className="text-xs opacity-90 text-blue-50">Eje X: Temperatura (UE)</p>
                </div>
                <div className="h-80 w-full p-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={processedData} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                            <XAxis dataKey="temperatura" type="number" ticks={xTicks} domain={['auto', 'auto']} tick={{fontSize: 10}} label={{ value: 'Temp (UE)', position: 'insideBottom', offset: -10, fontSize: 11 }} />
                            <YAxis domain={[4, 20]} tick={{fontSize: 10}} label={{ value: 'mA', angle: -90, position: 'insideLeft', fontSize: 11 }} />
                            <Tooltip formatter={(v: any) => v?.toFixed(3)} />
                            <Legend verticalAlign="top" height={36}/>
                            <Line type="monotone" dataKey="idealmA" stroke="#3b82f6" name="Ideal mA" strokeWidth={2} dot={{ r: 3 }} />
                            <Line type="monotone" dataKey="maTransmitter" stroke="#ef4444" name="Medido mA" strokeWidth={2} dot={{ r: 3 }} />
                            {hasUeTransmitter && (
                                <Line type="monotone" dataKey="ueTransmitter" stroke="#8b5cf6" name="UE Transmisor" strokeWidth={1} strokeDasharray="3 3" dot={false} />
                            )}
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
});

export default RTDChart;