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
    const containerOhmRef = useRef<HTMLDivElement>(null);
    const containerMaRef = useRef<HTMLDivElement>(null);

    // Procesamiento de datos
    const processedData = measurements.map((m) => {
        const idealUeVal = m.idealUE ? parseFloat(m.idealUE) : 0;
        const idealMaVal = m.idealmA ? parseFloat(m.idealmA) : 0;
        const maTransVal = m.maTransmitter ? parseFloat(m.maTransmitter) : 0;
        const idealOhmVal = m.idealohm ? parseFloat(m.idealohm) : 0;
        const sensorOhmVal = m.ohmTransmitter ? parseFloat(m.ohmTransmitter) : 0;

        return {
            temperatura: idealUeVal,
            idealOhm: idealOhmVal,
            sensorOhm: sensorOhmVal,
            idealMa: idealMaVal,
            maTransmitter: maTransVal,
        };
    }).sort((a, b) => a.temperatura - b.temperatura);

    // Lógica de Ticks
    const getYTicksOhm = () => {
        const values = processedData.flatMap(d => [d.idealOhm, d.sensorOhm]);
        const maxVal = Math.max(...values, 100);
        const minVal = Math.min(...values, 0);
        let step = maxVal > 500 ? 100 : 20;
        const ticks = [];
        for (let i = Math.floor(minVal/step)*step; i <= Math.ceil(maxVal/step)*step; i += step) ticks.push(i);
        return ticks;
    };

    useImperativeHandle(ref, () => ({
        captureAllCharts: async () => {
            const images = [];
            const options = { backgroundColor: '#ffffff', pixelRatio: 2, cacheBust: true };
            
            if (containerOhmRef.current) {
                const imgOhm = await toPng(containerOhmRef.current, options);
                images.push(imgOhm);
            }
            if (containerMaRef.current) {
                const imgMa = await toPng(containerMaRef.current, options);
                images.push(imgMa);
            }
            return images;
        }
    }));

    if (processedData.length === 0) return <div className="p-10 text-center text-gray-400">Sin datos para gráficas</div>;

    return (
        <div className="flex flex-col gap-10 mt-8">
            {/* GRÁFICA 1: RESISTENCIA (OHM) */}
            <div className="shadow-lg rounded-xl overflow-hidden border border-gray-200 bg-white" ref={containerOhmRef}>
                <div className="bg-gradient-to-r from-teal-600 to-emerald-600 px-6 py-5 text-white">
                    <h3 className="text-xl font-bold">📈 Desviación de Ohm (RTD)</h3>
                    <p className="text-teal-50 text-sm">Ideal Ω vs Sensor Ω | Eje X: Temperatura</p>
                </div>
                <div className="p-6 h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={processedData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="temperatura" type="number" domain={['auto', 'auto']} label={{ value: '°C', position: 'insideBottomRight', offset: -5 }} />
                            <YAxis ticks={getYTicksOhm()} label={{ value: 'Ω', angle: -90, position: 'insideLeft' }} />
                            <Tooltip />
                            <Legend verticalAlign="top"/>
                            <Line type="monotone" dataKey="idealOhm" stroke="#10b981" name="Ideal Ohm" strokeWidth={3} dot={{ r: 4 }} isAnimationActive={false} />
                            <Line type="monotone" dataKey="sensorOhm" stroke="#f59e0b" name="Sensor Ohm" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 4 }} isAnimationActive={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* GRÁFICA 2: TRANSMISOR (mA) */}
            <div className="shadow-lg rounded-xl overflow-hidden border border-gray-200 bg-white" ref={containerMaRef}>
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5 text-white">
                    <h3 className="text-xl font-bold">📉 Curva de Respuesta del Transmisor</h3>
                    <p className="text-blue-50 text-sm">Entrada (Temp) vs Salida (mA)</p>
                </div>
                <div className="p-6 h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={processedData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="temperatura" type="number" domain={['auto', 'auto']} />
                            <YAxis domain={[4, 20]} ticks={[4, 8, 12, 16, 20]} label={{ value: 'mA', angle: -90, position: 'insideLeft' }} />
                            <Tooltip />
                            <Legend verticalAlign="top"/>
                            <Line type="monotone" dataKey="idealMa" stroke="#3b82f6" name="mA Ideal" strokeWidth={3} dot={{ r: 4 }} isAnimationActive={false} />
                            <Line type="monotone" dataKey="maTransmitter" stroke="#ef4444" name="mA Transmisor" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 4 }} isAnimationActive={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
});

export default RTDChart;