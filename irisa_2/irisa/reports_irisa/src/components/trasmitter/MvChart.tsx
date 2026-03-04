import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { toPng } from 'html-to-image';
import { useRef, useImperativeHandle, forwardRef } from 'react';

export interface MVMeasurement {
    percentage: string;
    idealUE?: string;
    idealmV?: string;
    sensormV?: string;
    errormV?: string;
    sensorType?: 'J' | 'K';
}

interface MVChartProps {
    measurements?: MVMeasurement[];
}

const MVChart = forwardRef<any, MVChartProps>(({ 
    measurements = []
}, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);

    // Procesamiento de datos para mV
    const processedData = measurements.map((m) => {
        const temperaturaBe = m.idealUE ? parseFloat(m.idealUE) : null;
        const idealMvVal = m.idealmV ? parseFloat(m.idealmV) : null;
        const sensorMvVal = m.sensormV ? parseFloat(m.sensormV) : null;

        return {
            percentage: parseFloat(m.percentage) || 0,
            temperatura: temperaturaBe, // Eje X es temperatura (Ideal UE)
            idealMV: idealMvVal,
            sensorMV: sensorMvVal
        };
    }).sort((a, b) => (a.temperatura || 0) - (b.temperatura || 0));

    // LÓGICA DE SALTOS DINÁMICOS PARA EL EJE Y (mV)
    const getYTicks = () => {
        if (processedData.length === 0) return [0, 5, 10, 15, 20, 25];
        
        const activeValues = processedData.flatMap(d => {
            const values = [];
            if (d.idealMV !== null) values.push(d.idealMV);
            if (d.sensorMV !== null) values.push(d.sensorMV);
            return values.filter(v => v !== null) as number[];
        });

        const maxVal = activeValues.length > 0 ? Math.max(...activeValues) : 25;
        const minVal = activeValues.length > 0 ? Math.min(...activeValues, 0) : 0; 
        
        // Ajuste de escala automático
        let step = 5;
        if (maxVal > 50) step = 10;
        if (maxVal > 100) step = 20;

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

    const yTicks = getYTicks();
    const xTicks = getXTicks();

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
            <div className="bg-gradient-to-r from-orange-600 to-red-600 px-6 py-5 text-white">
                <div className="flex items-center gap-4">
                    <span className="text-3xl">📈</span>
                    <div>
                        <h3 className="text-xl font-bold">Desviación de mV (Termopar)</h3>
                        <p className="text-orange-100 text-sm opacity-90">Ideal mV vs Sensor mV | Eje X: Temperatura (UE)</p>
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
                                    ticks={xTicks}
                                    tick={{ fontSize: 11 }}
                                    label={{ value: 'Temperatura (UE)', position: 'insideBottom', offset: -10, fontSize: 12, fontWeight: 'bold' }} 
                                />

                                <YAxis 
                                    ticks={yTicks} 
                                    domain={[yTicks[0], yTicks[yTicks.length - 1]]}
                                    tick={{ fontSize: 10 }}
                                    label={{ value: 'Voltaje (mV)', angle: -90, position: 'insideLeft', fontWeight: 'bold', fontSize: 12 }}
                                />

                                <Tooltip 
                                    contentStyle={{ borderRadius: '8px', fontSize: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    formatter={(value: any, name: string) => [value !== null ? value.toFixed(3) : '---', name]}
                                    labelFormatter={(label) => `Temperatura: ${label} UE`}
                                />
                                <Legend verticalAlign="top" height={36} />
                                
                                {/* LÍNEAS PARA mV */}
                                <Line type="monotone" dataKey="idealMV" stroke="#8b5cf6" name="Ideal mV" strokeWidth={2} dot={{ r: 4 }} isAnimationActive={false} />
                                <Line type="monotone" dataKey="sensorMV" stroke="#ec4899" name="Sensor mV" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 4 }} isAnimationActive={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>
        </div>
    );
});

export default MVChart;
