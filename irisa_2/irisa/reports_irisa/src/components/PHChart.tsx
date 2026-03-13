import { forwardRef, useImperativeHandle, useRef } from 'react';
import {
    LineChart, Line, BarChart, Bar,
    XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, ReferenceLine, Cell, LabelList
} from 'recharts';

interface PHTest {
    promedio: string;
    desviacion: string;
    voltaje: string;
    temperatura: string;
    patron: string;
    errorMv: string;
    estadoElectrodo: string;
    error: string;
}

interface PHChartProps { tests: PHTest[]; }

const TEAL   = '#0d9488';
const PURPLE = '#7c3aed';
const RED    = '#ef4444';
const GREEN  = '#10b981';
const ORANGE = '#f97316';
const BLUE   = '#3b82f6';

const PATRON_COLORS: Record<string, string> = { '4': PURPLE, '7': TEAL, '9': BLUE };

const V0 = 174;
const T0 = 30;

const calcRangoVida = (v: number) => Math.max(0, Math.min(T0, T0 - (v - V0)));

const getBarColor = (t: number): string => {
    if (t >= 20) return GREEN;
    if (t >= 10) return ORANGE;
    return RED;
};

const voltajeTeorico = (pH: number) => (7 - pH) * 59.16;

// ── Etiqueta para LineChart: prefijo + 2 decimales ────────────────────────────
const makeLabel = (prefix: string) => (props: any) => {
    const { x, y, value } = props;
    if (value === null || value === undefined) return <g/>;
    return (
        <text x={x} y={y - 8} fill="#374151" fontSize={9} textAnchor="middle" fontWeight={500}>
            {`${prefix}: ${Number(value).toFixed(2)}`}
        </text>
    );
};

// ── Etiqueta para BarChart (LabelList) ────────────────────────────────────────
const BarValueLabel = (props: any) => {
    const { x, y, width, value } = props;
    if (value === null || value === undefined) return <g/>;
    return (
        <text x={x + width / 2} y={y - 5} fill="#374151" fontSize={9} textAnchor="middle" fontWeight={500}>
            {Number(value).toFixed(2)}
        </text>
    );
};

const PHChart = forwardRef(({ tests }: PHChartProps, ref) => {
    const chart1Ref = useRef<HTMLDivElement>(null);
    const chart2Ref = useRef<HTMLDivElement>(null);
    const chart3Ref = useRef<HTMLDivElement>(null);

    useImperativeHandle(ref, () => ({
        getChartElements: () => ({
            chart1: chart1Ref.current,
            chart2: chart2Ref.current,
            chart3: chart3Ref.current,
        })
    }));

    if (!tests || tests.length === 0) {
        return <div className="flex items-center justify-center h-48 text-gray-400 text-sm">No hay datos de pH para graficar.</div>;
    }

    const patronesSet = new Set(tests.map(t => t.patron).filter(Boolean));
    const patrones = Array.from(patronesSet).sort((a, b) => parseFloat(a) - parseFloat(b));
    const groupedByPatron: Record<string, typeof tests> = {};
    patrones.forEach(p => { groupedByPatron[p] = tests.filter(t => t.patron === p); });

    const errorData = tests.map((t, i) => ({
        name:     `pH ${t.patron || '?'} M${i + 1}`,
        error:    parseFloat(t.error)   || 0,
        errorMv:  parseFloat(t.errorMv) || 0,
        promedio: parseFloat(t.promedio) || 0,
        patron:   t.patron || '?',
    }));

    const vidaData = tests.map((t, i) => ({
        name:      `pH ${t.patron || '?'} M${i + 1}`,
        rangoVida: parseFloat(t.errorMv) || 0,
        patron:    t.patron || '?',
        promedio:  parseFloat(t.promedio) || 0,
        voltaje:   parseFloat(t.voltaje)  || 0,
    }));

    // ── Tooltips ──────────────────────────────────────────────────────────────
    const CustomTooltipPatron = ({ active, payload, patronVal }: any) => {
        if (active && payload?.length) {
            const d    = payload[0]?.payload;
            const vTeo = voltajeTeorico(parseFloat(d?.promedio || '0'));
            const rv   = calcRangoVida(parseFloat(d?.voltaje || '0'));
            return (
                <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-xs">
                    <p className="font-bold text-gray-700 mb-1">Medición {d?.label}</p>
                    <p className="text-gray-500">pH promedio: <span className="font-bold">{d?.promedio}</span></p>
                    <p style={{ color: PATRON_COLORS[patronVal] || PURPLE }}>Voltaje: <span className="font-bold">{Number(d?.voltaje).toFixed(2)} mV</span></p>
                    <p className="text-gray-400">V. teórico Nernst: <span className="font-bold">{vTeo.toFixed(2)} mV</span></p>
                    <p className="text-gray-400">V₀ base: <span className="font-bold">{V0} mV</span></p>
                    <p className="text-orange-500">Rango Vida: <span className="font-bold">{rv.toFixed(2)} mV</span></p>
                </div>
            );
        }
        return null;
    };

    const CustomTooltip2 = ({ active, payload }: any) => {
        if (active && payload?.length) {
            const err = payload[0]?.value;
            const d   = payload[0]?.payload;
            return (
                <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-xs">
                    <p className="font-bold text-gray-700 mb-1">Buffer pH {d?.patron}</p>
                    <p className="text-gray-600">pH medido: <span className="font-bold">{d?.promedio}</span></p>
                    <p className="text-orange-500">Rango Vida: <span className="font-bold">{Number(d?.errorMv).toFixed(2)} mV</span></p>
                    <p className={err < 0.5 ? 'text-green-600' : err < 2 ? 'text-teal-600' : 'text-red-500'}>
                        Error: <span className="font-bold">{Number(err).toFixed(2)}%</span>
                    </p>
                </div>
            );
        }
        return null;
    };

    const CustomTooltip3 = ({ active, payload }: any) => {
        if (active && payload?.length) {
            const rv  = payload[0]?.value;
            const d   = payload[0]?.payload;
            const estadoLabel = rv >= 20 ? 'Electrodo OK' : rv >= 10 ? 'Verificar' : 'Agotado';
            const estadoColor = rv >= 20 ? 'text-green-600' : rv >= 10 ? 'text-orange-500' : 'text-red-600';
            return (
                <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-xs">
                    <p className="font-bold text-gray-700 mb-1">Buffer pH {d?.patron}</p>
                    <p className="text-gray-500">Voltaje medido: <span className="font-bold">{d?.voltaje} mV</span></p>
                    <p className="text-orange-500">Rango Vida T: <span className="font-bold">{Number(rv).toFixed(2)} mV</span></p>
                    <p className="text-gray-400 text-[10px]">T = 30 − ({d?.voltaje} − {V0}) = {Number(rv).toFixed(2)}</p>
                    <p className={estadoColor}>Estado: <span className="font-bold">{estadoLabel}</span></p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="space-y-8">

            {/* ── CHART 1: Voltaje por patrón ───────────────────────────────── */}
            <div ref={chart1Ref} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                <div className="mb-5">
                    <h4 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-teal-500 inline-block"></span>
                        Curva de Respuesta del Electrodo — Voltaje por Patrón Buffer
                    </h4>
                    <p className="text-xs text-gray-400 mt-0.5">
                        Línea coloreada = Nernst teórico · Línea gris = V₀ {V0} mV (base de vida útil)
                    </p>
                </div>
                {patrones.length === 0 ? (
                    <p className="text-gray-400 text-sm text-center py-8">Seleccione un patrón buffer en la tabla para ver la gráfica.</p>
                ) : (
                    <div className={`grid gap-6 ${patrones.length === 1 ? 'grid-cols-1' : patrones.length === 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'}`}>
                        {patrones.map(patron => {
                            const rows  = groupedByPatron[patron];
                            const color = PATRON_COLORS[patron] || PURPLE;
                            const vTeo  = voltajeTeorico(parseFloat(patron));
                            const data  = rows.map((t, i) => ({
                                label: `M${i + 1}`, voltaje: parseFloat(t.voltaje) || 0,
                                promedio: t.promedio, temperatura: t.temperatura,
                            }));
                            const allVals   = [...data.map(d => d.voltaje), vTeo, V0];
                            const padding   = Math.max(10, (Math.max(...allVals) - Math.min(...allVals)) * 0.2);
                            const domainMin = Math.floor(Math.min(...allVals) - padding);
                            const domainMax = Math.ceil(Math.max(...allVals)  + padding);
                            return (
                                <div key={patron} className="border border-gray-100 rounded-xl p-3 bg-gray-50/50">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: color }}></span>
                                            <span className="text-sm font-black text-gray-700">Buffer pH {patron}</span>
                                        </div>
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                                            V.teórico: {vTeo.toFixed(1)} mV
                                        </span>
                                    </div>
                                    <ResponsiveContainer width="100%" height={220}>
                                        <LineChart data={data} margin={{ top: 25, right: 20, left: 5, bottom: 10 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                            <XAxis dataKey="label" tick={{ fontSize: 10 }} label={{ value: 'Medición', position: 'insideBottom', offset: -3, fontSize: 10 }} />
                                            <YAxis tick={{ fontSize: 9 }} domain={[domainMin, domainMax]} label={{ value: 'mV', angle: -90, position: 'insideLeft', offset: 12, fontSize: 10 }} />
                                            <Tooltip content={<CustomTooltipPatron patronVal={patron} />} />
                                            <ReferenceLine y={vTeo} stroke={color} strokeDasharray="6 3" strokeWidth={1.5}
                                                label={{ value: `Teórico ${vTeo.toFixed(1)}mV`, position: 'insideTopRight', fontSize: 8, fill: color }} />
                                            <ReferenceLine y={V0} stroke="#94a3b8" strokeDasharray="4 4" strokeWidth={1}
                                                label={{ value: `V₀ ${V0}mV`, position: 'insideBottomRight', fontSize: 8, fill: '#94a3b8' }} />
                                            <Line
                                                type="monotone" dataKey="voltaje" stroke={color} strokeWidth={2}
                                                dot={{ fill: color, r: 5, strokeWidth: 2, stroke: '#fff' }}
                                                activeDot={{ r: 7 }} isAnimationActive={false}
                                                label={makeLabel('mV')}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                    {data.length > 0 && (() => {
                                        const vs   = data.map(d => d.voltaje);
                                        const avg  = vs.reduce((a, b) => a + b, 0) / vs.length;
                                        const desv = Math.sqrt(vs.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / vs.length);
                                        return (
                                            <div className="mt-2 flex gap-3 flex-wrap justify-center">
                                                <span className="text-[10px] text-gray-500">Promedio: <strong>{avg.toFixed(2)} mV</strong></span>
                                                <span className="text-[10px] text-gray-500">Desv: <strong>{desv.toFixed(2)} mV</strong></span>
                                                <span className="text-[10px] text-gray-500">Rango Vida prom: <strong>{calcRangoVida(avg).toFixed(2)} mV</strong></span>
                                            </div>
                                        );
                                    })()}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* ── CHART 2: Error % ──────────────────────────────────────────── */}
            <div ref={chart2Ref} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                <div className="mb-4">
                    <h4 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-red-400 inline-block"></span>
                        Error de Medición por Buffer
                    </h4>
                    <p className="text-xs text-gray-400 mt-0.5">Desviación porcentual entre el pH medido y el valor nominal del buffer</p>
                </div>
                <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={errorData} margin={{ top: 25, right: 30, left: 10, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="name" tick={{ fontSize: 9 }} interval={0} angle={-10} />
                        <YAxis label={{ value: 'Error (%)', angle: -90, position: 'insideLeft', offset: 10, fontSize: 11 }} tick={{ fontSize: 10 }} />
                        <Tooltip content={<CustomTooltip2 />} />
                        <ReferenceLine y={0} stroke="#6b7280" strokeWidth={1.5} />
                        <Bar dataKey="error" radius={[4, 4, 0, 0]} maxBarSize={60} isAnimationActive={false}>
                            <LabelList dataKey="error" content={<BarValueLabel />} />
                            {errorData.map((entry, i) => (
                                <Cell key={i} fill={entry.error < 0.5 ? GREEN : entry.error < 2 ? TEAL : RED} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap gap-4 mt-3 justify-center">
                    <span className="flex items-center gap-1.5 text-xs text-gray-500"><span className="w-3 h-3 rounded-sm bg-emerald-500 inline-block"></span> Error &lt; 0.5% (Excelente)</span>
                    <span className="flex items-center gap-1.5 text-xs text-gray-500"><span className="w-3 h-3 rounded-sm bg-teal-500 inline-block"></span> Error &lt; 2% (Aceptable)</span>
                    <span className="flex items-center gap-1.5 text-xs text-gray-500"><span className="w-3 h-3 rounded-sm bg-red-500 inline-block"></span> Error ≥ 2% (Revisar)</span>
                </div>
            </div>

            {/* ── CHART 3: Rango de Vida ────────────────────────────────────── */}
            <div ref={chart3Ref} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                <div className="mb-4">
                    <h4 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-orange-400 inline-block"></span>
                        Rango de Vida del Electrodo — T = 30 − (V − {V0})
                    </h4>
                    <p className="text-xs text-gray-400 mt-0.5">
                        T alto = electrodo sano · T bajo = electrodo gastado. Máximo: {T0} mV (electrodo nuevo)
                    </p>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={vidaData} margin={{ top: 25, right: 30, left: 10, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="name" tick={{ fontSize: 9 }} interval={0} angle={-10} />
                        <YAxis
                            label={{ value: 'Rango Vida (mV)', angle: -90, position: 'insideLeft', offset: 10, fontSize: 11 }}
                            tick={{ fontSize: 10 }} domain={[0, T0 + 5]}
                        />
                        <Tooltip content={<CustomTooltip3 />} />
                        <ReferenceLine y={20} stroke={ORANGE} strokeDasharray="5 3" strokeWidth={1.5}
                            label={{ value: '20 mV — Límite OK', position: 'insideTopRight', fontSize: 9, fill: ORANGE }} />
                        <ReferenceLine y={10} stroke={RED} strokeDasharray="5 3" strokeWidth={2}
                            label={{ value: '10 mV — Límite crítico', position: 'insideTopRight', fontSize: 9, fill: RED }} />
                        <Bar dataKey="rangoVida" name="Rango Vida (mV)" radius={[4, 4, 0, 0]} maxBarSize={60} isAnimationActive={false}>
                            <LabelList dataKey="rangoVida" content={<BarValueLabel />} />
                            {vidaData.map((entry, i) => (
                                <Cell key={i} fill={getBarColor(entry.rangoVida)} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap gap-4 mt-3 justify-center">
                    <span className="flex items-center gap-1.5 text-xs text-gray-500"><span className="w-3 h-3 rounded-sm bg-emerald-500 inline-block"></span> ≥ 20 mV — Electrodo OK</span>
                    <span className="flex items-center gap-1.5 text-xs text-gray-500"><span className="w-3 h-3 rounded-sm bg-orange-400 inline-block"></span> 10–20 mV — Verificar</span>
                    <span className="flex items-center gap-1.5 text-xs text-gray-500"><span className="w-3 h-3 rounded-sm bg-red-500 inline-block"></span> &lt; 10 mV — Agotado</span>
                </div>
            </div>

        </div>
    );
});

PHChart.displayName = 'PHChart';
export default PHChart;