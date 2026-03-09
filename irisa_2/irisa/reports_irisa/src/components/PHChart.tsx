import { forwardRef, useImperativeHandle, useRef } from 'react';
import {
    LineChart, Line, BarChart, Bar,
    XAxis, YAxis, CartesianGrid, Tooltip,
    Legend, ReferenceLine, Cell, ResponsiveContainer
} from 'recharts';

interface PHTest {
    promedio: string;
    desviacion: string;
    voltaje: string;
    temperatura: string;
    patron: string;
    error: string;
}

interface PHChartProps {
    tests: PHTest[];
}

const TEAL   = '#0d9488';
const PURPLE = '#7c3aed';
const RED    = '#ef4444';
const GREEN  = '#10b981';

const PHChart = forwardRef(({ tests }: PHChartProps, ref) => {
    const chart1Ref = useRef<HTMLDivElement>(null);
    const chart2Ref = useRef<HTMLDivElement>(null);

    useImperativeHandle(ref, () => ({
        getChartElements: () => ({
            chart1: chart1Ref.current,
            chart2: chart2Ref.current,
        })
    }));

    if (!tests || tests.length === 0) {
        return (
            <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
                No hay datos de pH para graficar.
            </div>
        );
    }

    // Chart 1: Voltaje vs Patrón Buffer — ordenado por patrón
    const curvaData = tests
        .map((t, i) => ({
            name: `M${i + 1}`,
            patron: parseFloat(t.patron) || 0,
            voltaje: parseFloat(t.voltaje) || 0,
            promedio: parseFloat(t.promedio) || 0,
            temperatura: parseFloat(t.temperatura) || 0,
        }))
        .sort((a, b) => a.patron - b.patron);

    // Chart 2: Error por medición
    const errorData = tests.map((t, i) => ({
        name: `pH ${t.patron || '?'} (M${i + 1})`,
        error: parseFloat(t.error) || 0,
        promedio: parseFloat(t.promedio) || 0,
        patron: t.patron || '?',
    }));

    const CustomTooltip1 = ({ active, payload }: any) => {
        if (active && payload?.length) {
            const d = payload[0]?.payload;
            return (
                <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-xs">
                    <p className="font-bold text-gray-700 mb-1">{d?.name}</p>
                    <p className="text-teal-600">Patrón buffer: <span className="font-bold">pH {d?.patron}</span></p>
                    <p className="text-gray-500">Promedio medido: <span className="font-bold">{d?.promedio} pH</span></p>
                    <p className="text-purple-600">Voltaje: <span className="font-bold">{payload[0]?.value} mV</span></p>
                    <p className="text-orange-500">Temp: <span className="font-bold">{d?.temperatura} °C</span></p>
                </div>
            );
        }
        return null;
    };

    const CustomTooltip2 = ({ active, payload }: any) => {
        if (active && payload?.length) {
            const err = payload[0]?.value;
            const d = payload[0]?.payload;
            return (
                <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-xs">
                    <p className="font-bold text-gray-700 mb-1">Buffer pH {d?.patron}</p>
                    <p className="text-gray-600">Promedio medido: <span className="font-bold">{d?.promedio} pH</span></p>
                    <p className={Math.abs(err) < 0.1 ? 'text-green-600' : Math.abs(err) < 0.3 ? 'text-teal-600' : 'text-red-500'}>
                        Error: <span className="font-bold">{err} pH</span>
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="space-y-8">

            {/* CHART 1: Voltaje vs Patrón Buffer */}
            <div ref={chart1Ref} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                <div className="mb-4">
                    <h4 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-teal-500 inline-block"></span>
                        Curva de respuesta del electrodo — Voltaje vs Patrón Buffer
                    </h4>
                    <p className="text-xs text-gray-400 mt-0.5">
                        Relación lineal esperada (ecuación de Nernst: ~59.16 mV/pH a 25°C)
                    </p>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={curvaData} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis
                            dataKey="patron"
                            label={{ value: 'Patrón Buffer (pH)', position: 'insideBottom', offset: -5, fontSize: 11 }}
                            tick={{ fontSize: 10 }}
                            type="number"
                            domain={[3, 10]}
                            ticks={[4, 7, 9]}
                        />
                        <YAxis
                            label={{ value: 'Voltaje (mV)', angle: -90, position: 'insideLeft', offset: 10, fontSize: 11 }}
                            tick={{ fontSize: 10 }}
                        />
                        <Tooltip content={<CustomTooltip1 />} />
                        <Legend wrapperStyle={{ fontSize: 11 }} />
                        <ReferenceLine y={0} stroke="#d1d5db" strokeDasharray="4 4" />
                        <Line
                            type="monotone"
                            dataKey="voltaje"
                            name="Voltaje (mV)"
                            stroke={PURPLE}
                            strokeWidth={2.5}
                            dot={{ fill: PURPLE, r: 5, strokeWidth: 2, stroke: '#fff' }}
                            activeDot={{ r: 7 }}
                            isAnimationActive={false}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* CHART 2: Error por medición */}
            <div ref={chart2Ref} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                <div className="mb-4">
                    <h4 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-red-400 inline-block"></span>
                        Error por medición (Promedio − Patrón Buffer)
                    </h4>
                    <p className="text-xs text-gray-400 mt-0.5">
                        Diferencia entre el promedio medido y el valor del patrón buffer
                    </p>
                </div>
                <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={errorData} margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="name" tick={{ fontSize: 9 }} interval={0} angle={-10} />
                        <YAxis
                            label={{ value: 'Error (pH)', angle: -90, position: 'insideLeft', offset: 10, fontSize: 11 }}
                            tick={{ fontSize: 10 }}
                        />
                        <Tooltip content={<CustomTooltip2 />} />
                        <ReferenceLine y={0} stroke="#6b7280" strokeWidth={1.5} />
                        <Bar dataKey="error" name="Error pH" radius={[4, 4, 0, 0]} maxBarSize={60} isAnimationActive={false}>
                            {errorData.map((entry, i) => (
                                <Cell
                                    key={i}
                                    fill={Math.abs(entry.error) < 0.1 ? GREEN : Math.abs(entry.error) < 0.3 ? TEAL : RED}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap gap-4 mt-3 justify-center">
                    <span className="flex items-center gap-1.5 text-xs text-gray-500">
                        <span className="w-3 h-3 rounded-sm bg-emerald-500 inline-block"></span> Error {'<'} 0.1 pH (Excelente)
                    </span>
                    <span className="flex items-center gap-1.5 text-xs text-gray-500">
                        <span className="w-3 h-3 rounded-sm bg-teal-500 inline-block"></span> Error {'<'} 0.3 pH (Aceptable)
                    </span>
                    <span className="flex items-center gap-1.5 text-xs text-gray-500">
                        <span className="w-3 h-3 rounded-sm bg-red-500 inline-block"></span> Error ≥ 0.3 pH (Revisar)
                    </span>
                </div>
            </div>

        </div>
    );
});

PHChart.displayName = 'PHChart';
export default PHChart;