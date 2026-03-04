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

    // Procesamiento de datos para RTD
    const processedData = measurements.map((m) => {
        const idealUeVal = m.idealUE ? parseFloat(m.idealUE) : null;
        const idealOhmVal = m.idealohm ? parseFloat(m.idealohm) : null;
        const sensorOhmVal = m.ohmTransmitter ? parseFloat(m.ohmTransmitter) : null;
        const ueTransVal = m.ueTransmitter ? parseFloat(m.ueTransmitter) : null;

        return {
            percentage: parseFloat(m.percentage) || 0,
            temperatura: idealUeVal, // Eje X ahora es temperatura (Ideal UE)
            idealOhm: idealOhmVal,
            sensorOhm: sensorOhmVal,
            idealUE: idealUeVal,
            ueTransmitter: ueTransVal
        };
    }).sort((a, b) => (a.temperatura || 0) - (b.temperatura || 0));

    // LÓGICA DE SALTOS DINÁMICOS PARA EL EJE Y
    const getYTicks = () => {
        if (processedData.length === 0) return [0, 10, 20, 30, 40, 50];
        
        const activeValues = processedData.flatMap(d => {
            const values = [];
            if (d.idealOhm !== null) values.push(d.idealOhm);
            if (d.sensorOhm !== null) values.push(d.sensorOhm);
            if (hasUeTransmitter && d.idealUE !== null) values.push(d.idealUE);
            if (hasUeTransmitter && d.ueTransmitter !== null) values.push(d.ueTransmitter);
            return values.filter(v => v !== null) as number[];
        });

        const maxVal = activeValues.length > 0 ? Math.max(...activeValues) : 50;
        const minVal = activeValues.length > 0 ? Math.min(...activeValues, 0) : 0; 
        
        // Ajuste de escala automático
        let step = 10;
        if (maxVal > 200) step = 50;
        if (maxVal > 1000) step = 200;

        const ticks = [];
        const start = Math.floor(minVal / step) * step;
        const end = Math.ceil(maxVal / step) * step;
        
        for (let i = start; i <= end; i += step) {
            ticks.push(i);
        }
        return ticks;
    };

    // LÓGICA DE SALTOS DINÁMICOS PARA EL EJE X (TEMPERATURA)
    const getXTicks = () => {
        if (processedData.length === 0) return [];
        
        const temperaturas = processedData
            .map(d => d.temperatura)
            .filter(t => t !== null) as number[];
        
        if (temperaturas.length === 0) return [];
        
        const minTemp = Math.min(...temperaturas);
        const maxTemp = Math.max(...temperaturas);
        
        // Generar ticks distribuidos
        let step = 10;
        if (maxTemp - minTemp > 100) step = 20;
        if (maxTemp - minTemp > 500) step = 50;
        
        const ticks = [];
        const start = Math.floor(minTemp / step) * step;
        const end = Math.ceil(maxTemp / step) * step;
        
        for (let i = start; i <= end; i += step) {
            ticks.push(i);
        }
        return ticks.length > 0 ? ticks : [minTemp, maxTemp];
    };

    useImperativeHandle(ref, () => ({
        captureAllCharts: async () => {
            if (containerRef.current) {
                const dataUrl = await toPng(containerRef.current, {
                    backgroundColor: '#ffffff',
                    pixelRatio: 2,
                    cacheBust: true
                });
                return [dataUrl];
            }
            return [];
        }
    }));

    return (
        <div className="mt-8 shadow-lg rounded-xl overflow-hidden border border-gray-200 bg-white" ref={containerRef}>
            <div className="bg-gradient-to-r from-teal-600 to-emerald-600 px-6 py-5 text-white">
                <div className="flex items-center gap-4">
                    <span className="text-3xl">📈</span>
                    <div>
                        <h3 className="text-xl font-bold">Desviación de Ohm (RTD)</h3>
                        <p className="text-blue-100 text-sm opacity-90">Ideal Ω vs Sensor Ω | Eje X: Entrada (mA)</p>
                    </div>
                </div>
            </div>

            <div className="p-6 bg-white">
                {processedData.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                        <p>No hay datos suficientes para generar la curva de respuesta.</p>
                    </div>
                ) : (
                    <div className="h-96 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={processedData} margin={{ top: 20, right: 30, left: 20, bottom: 25 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                
                                <XAxis 
                                    dataKey="temperatura" 
                                    type="number"
                                    ticks={getXTicks()}
                                    tick={{ fontSize: 11 }}
                                    label={{ value: 'Temperatura (UE)', position: 'insideBottom', offset: -10, fontSize: 12, fontWeight: 'bold' }} 
                                />

                                <YAxis 
                                    ticks={yTicks} 
                                    domain={[yTicks[0], yTicks[yTicks.length - 1]]}
                                    tick={{ fontSize: 10 }}
                                    label={{ value: 'Resistencia (Ω)', angle: -90, position: 'insideLeft', fontWeight: 'bold', fontSize: 12 }}
                                />

                                <Tooltip 
                                    contentStyle={{ borderRadius: '8px', fontSize: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    formatter={(value: any, name: string) => [value !== null ? value.toFixed(3) : '---', name]}
                                    labelFormatter={(label) => `Temperatura: ${label} UE`}
                                />
                                <Legend verticalAlign="top" height={36} />
                                
                                {/* LÍNEAS PARA OHMS */}
                                <Line type="monotone" dataKey="idealOhm" stroke="#10b981" name="Ideal Ohm" strokeWidth={2} dot={{ r: 4 }} isAnimationActive={false} />
                                <Line type="monotone" dataKey="sensorOhm" stroke="#f59e0b" name="Sensor Ohm" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 4 }} isAnimationActive={false} />
                                
                                {/* LÍNEAS PARA UE (SOLO SI ESTÁ HABILITADO) */}
                                {hasUeTransmitter && (
                                    <>
                                        <Line type="monotone" dataKey="idealUE" stroke="#3b82f6" name="Ideal UE" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3 }} isAnimationActive={false} connectNulls={false} />
                                        <Line type="monotone" dataKey="ueTransmitter" stroke="#ef4444" name="UE Transmisor" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3 }} isAnimationActive={false} connectNulls={false} />
                                    </>
                                )}
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>
        </div>
    );
});

export default RTDChart;
