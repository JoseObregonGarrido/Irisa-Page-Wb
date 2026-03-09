import { forwardRef, useImperativeHandle, useRef } from 'react';
import {
    LineChart, Line, BarChart, Bar,
    XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, ReferenceLine, Cell
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
    tolerancia?: string;
}

interface PHChartProps {
    tests: PHTest[];
}

const TEAL   = '#0d9488';
const PURPLE = '#7c3aed';
const RED    = '#ef4444';
const GREEN  = '#10b981';
const ORANGE = '#f97316';
const BLUE   = '#3b82f6';

const PATRON_COLORS: Record<string, string> = {
    '4': PURPLE,
    '7': TEAL,
    '9': BLUE,
};

// ─── Constantes de tolerancia dinámica (deben coincidir con PHTable) ──────────
const V0 = 174;
const T0 = 30;
const K  = 0.1;

const getToleranciaDinamica = (voltajeMedido: number): number =>
    Math.max(10, T0 - K * (voltajeMedido - V0));

const getBarColorDinamico = (errorMv: number, tolerancia: number): string => {
    if (errorMv <= tolerancia * 0.60) return GREEN;
    if (errorMv <= tolerancia)        return ORANGE;
    return RED;
};

const voltajeTeorico = (pH: number) => (7 - pH) * 59.16;

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
        return (
            <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
                No hay datos de pH para graficar.
            </div>
        );
    }

    const patronesSet = new Set(tests.map(t => t.patron).filter(Boolean));
    const patrones = Array.from(patronesSet).sort((a, b) => parseFloat(a) - parseFloat(b));
    const groupedByPatron: Record<string, typeof tests> = {};
    patrones.forEach(p => { groupedByPatron[p] = tests.filter(t => t.patron === p); });

    const errorData = tests.map((t, i) => ({
        name:    `pH ${t.patron || '?'} M${i + 1}`,
        error:   parseFloat(t.error)   || 0,
        errorMv: parseFloat(t.errorMv) || 0,
        promedio: parseFloat(t.promedio) || 0,
        patron:  t.patron || '?',
    }));

    const vidaData = tests.map((t, i) => {
        const vMedido    = parseFloat(t.voltaje) || 0;
        const errorMv    = parseFloat(t.errorMv) || 0;
        const tolerancia = t.tolerancia
            ? parseFloat(t.tolerancia)
            : getToleranciaDinamica(vMedido);
        return {
            name:       `pH ${t.patron || '?'} M${i + 1}`,
            errorMv,
            patron:     t.patron || '?',
            promedio:   parseFloat(t.promedio) || 0,
            tolerancia,
            umbralOk:   tolerancia * 0.60,
        };
    });

    const avgTol    = vidaData.reduce((s, d) => s + d.tolerancia, 0) / (vidaData.length || 1);
    const avgUmbral = avgTol * 0.60;

    const CustomTooltipPatron = ({ active, payload, patronVal }: any) => {
        if (active && payload?.length) {
            const d   = payload[0]?.payload;
            const vTeo = voltajeTeorico(parseFloat(d?.promedio || '0'));
            return (
                <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-xs">
                    <p className="font-bold text-gray-700 mb-1">Medición {d?.label}</p>
                    <p className="text-gray-500">pH promedio: <span className="font-bold">{d?.promedio}</span></p>
                    <p style={{ color: PATRON_COLORS[patronVal] || PURPLE }}>
                        Voltaje: <span className="font-bold">{d?.voltaje} mV</span>
                    </p>
                    <p className="text-gray-400">V₀ referencia: <span className="font-bold">{V0} mV</span></p>
                    <p className="text-gray-400">V. teórico Nernst: <span className="font-bold">{vTeo.toFixed(2)} mV</span></p>
                    <p className="text-orange-500">Temp: <span className="font-bold">{d?.temperatura} °C</span></p>
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
                    <p className="text-orange-500">Rango vida: <span className="font-bold">{d?.errorMv} mV</span></p>
                    <p className={err < 0.5 ? 'text-green-600' : err < 2 ? 'text-teal-600' : 'text-red-500'}>
                        Error: <span className="font-bold">{err.toFixed(3)}%</span>
                    </p>
                </div>
            );
        }
        return null;
    };

    const CustomTooltip3 = ({ active, payload }: any) => {
        if (active && payload?.length) {
            const mv  = payload[0]?.value;
            const d   = payload[0]?.payload;
            const tol = d?.tolerancia ?? T0;
            const estadoLabel = mv <= tol * 0.60 ? 'Electrodo OK'
                              : mv <= tol         ? 'Verificar electrodo'
                              :                     'Electrodo agotado';
            const estadoColor = mv <= tol * 0.60 ? 'text-green-600'
                              : mv <= tol         ? 'text-orange-500'
                              :                     'text-red-600';
            return (
                <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-xs">
                    <p className="font-bold text-gray-700 mb-1">Buffer pH {d?.patron}</p>
                    <p className="text-gray-500">pH medido: <span className="font-bold">{d?.promedio}</span></p>
                    <p className="text-orange-500">|V − {V0}|: <span className="font-bold">{mv.toFixed(2)} mV</span></p>
                    <p className="text-blue-500">Tol. dinámica: <span className="font-bold">{tol.toFixed(1)} mV</span></p>
                    <p className={estadoColor}>Estado: <span className="font-bold">{estadoLabel}</span></p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="space-y-8">

            {/* ── CHART 1 ── */}
            <div ref={chart1Ref} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                <div className="mb-5">
                    <h4 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-teal-500 inline-block"></span>
                        Curva de Respuesta del Electrodo — Voltaje por Patrón Buffer
                    </h4>
                    <p className="text-xs text-gray-400 mt-0.5">
                        Línea de color = Nernst teórico. Línea gris = V₀ {V0} mV (referencia de vida útil)
                    </p>
                </div>

                {patrones.length === 0 ? (
                    <p className="text-gray-400 text-sm text-center py-8">Seleccione un patrón buffer en la tabla para ver la gráfica.</p>
                ) : (
                    <div className={`grid gap-6 ${
                        patrones.length === 1 ? 'grid-cols-1'
                        : patrones.length === 2 ? 'grid-cols-1 md:grid-cols-2'
                        : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'
                    }`}>
                        {patrones.map(patron => {
                            const rows  = groupedByPatron[patron];
                            const color = PATRON_COLORS[patron] || PURPLE;
                            const vTeo  = voltajeTeorico(parseFloat(patron));

                            const data = rows.map((t, i) => ({
                                label:       `M${i + 1}`,
                                voltaje:     parseFloat(t.voltaje) || 0,
                                promedio:    t.promedio,
                                temperatura: t.temperatura,
                                index:       i + 1,
                            }));

                            const voltajes  = data.map(d => d.voltaje);
                            const allVals   = [...voltajes, vTeo, V0];
                            const minV      = Math.min(...allVals);
                            const maxV      = Math.max(...allVals);
                            const padding   = Math.max(10, (maxV - minV) * 0.2);
                            const domainMin = Math.floor(minV - padding);
                            const domainMax = Math.ceil(maxV + padding);

                            return (
                                <div key={patron} className="border border-gray-100 rounded-xl p-3 bg-gray-50/50">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: color }}></span>
                                            <span className="text-sm font-black text-gray-700">Buffer pH {patron}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] text-gray-400 font-medium">{rows.length} medición{rows.length !== 1 ? 'es' : ''}</span>
                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                                                V.teórico: {vTeo.toFixed(1)} mV
                                            </span>
                                        </div>
                                    </div>

                                    <ResponsiveContainer width="100%" height={220}>
                                        <LineChart data={data} margin={{ top: 10, right: 20, left: 5, bottom: 10 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                            <XAxis dataKey="label" tick={{ fontSize: 10 }}
                                                label={{ value: 'Medición', position: 'insideBottom', offset: -3, fontSize: 10 }} />
                                            <YAxis tick={{ fontSize: 9 }} domain={[domainMin, domainMax]}
                                                label={{ value: 'mV', angle: -90, position: 'insideLeft', offset: 12, fontSize: 10 }} />
                                            <Tooltip content={<CustomTooltipPatron patronVal={patron} />} />
                                            <ReferenceLine y={vTeo} stroke={color} strokeDasharray="6 3" strokeWidth={1.5}
                                                label={{ value: `Teórico ${vTeo.toFixed(1)}mV`, position: 'insideTopRight', fontSize: 8, fill: color }} />
                                            <ReferenceLine y={V0} stroke="#94a3b8" strokeDasharray="4 4" strokeWidth={1}
                                                label={{ value: `V₀ ${V0}mV`, position: 'insideBottomRight', fontSize: 8, fill: '#94a3b8' }} />
                                            <Line type="monotone" dataKey="voltaje" name="Voltaje (mV)"
                                                stroke={color} strokeWidth={2}
                                                dot={{ fill: color, r: 5, strokeWidth: 2, stroke: '#fff' }}
                                                activeDot={{ r: 7 }} isAnimationActive={false} />
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
                                                <span className="text-[10px] text-gray-500">Δ V₀: <strong>{Math.abs(avg - V0).toFixed(2)} mV</strong></span>
                                            </div>
                                        );
                                    })()}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* ── CHART 2 ── */}
            <div ref={chart2Ref} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                <div className="mb-4">
                    <h4 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-red-400 inline-block"></span>
                        Error de Medición por Buffer
                    </h4>
                    <p className="text-xs text-gray-400 mt-0.5">
                        Desviación porcentual entre el pH medido y el valor nominal del buffer
                    </p>
                </div>
                <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={errorData} margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="name" tick={{ fontSize: 9 }} interval={0} angle={-10} />
                        <YAxis label={{ value: 'Error (%)', angle: -90, position: 'insideLeft', offset: 10, fontSize: 11 }} tick={{ fontSize: 10 }} />
                        <Tooltip content={<CustomTooltip2 />} />
                        <ReferenceLine y={0} stroke="#6b7280" strokeWidth={1.5} />
                        <Bar dataKey="error" name="Error (%)" radius={[4, 4, 0, 0]} maxBarSize={60} isAnimationActive={false}>
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

            {/* ── CHART 3: Rango de Vida — tolerancia dinámica ── */}
            <div ref={chart3Ref} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                <div className="mb-4">
                    <h4 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-orange-400 inline-block"></span>
                        Rango de Vida del Electrodo — |V medido − V₀|
                    </h4>
                    <p className="text-xs text-gray-400 mt-0.5">
                        Desviación vs V₀ = {V0} mV. Tolerancia dinámica T = {T0} − {K}·(V − {V0}). Líneas = promedio del lote.
                    </p>
                </div>
                <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={vidaData} margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="name" tick={{ fontSize: 9 }} interval={0} angle={-10} />
                        <YAxis label={{ value: '|V − V₀| (mV)', angle: -90, position: 'insideLeft', offset: 10, fontSize: 11 }}
                            tick={{ fontSize: 10 }} domain={[0, 'auto']} />
                        <Tooltip content={<CustomTooltip3 />} />
                        <ReferenceLine y={avgUmbral} stroke={ORANGE} strokeDasharray="5 3" strokeWidth={1.5}
                            label={{ value: `~${avgUmbral.toFixed(0)} mV — Advertencia`, position: 'insideTopRight', fontSize: 9, fill: ORANGE }} />
                        <ReferenceLine y={avgTol} stroke={RED} strokeDasharray="5 3" strokeWidth={2}
                            label={{ value: `~${avgTol.toFixed(0)} mV — Límite crítico`, position: 'insideTopRight', fontSize: 9, fill: RED }} />
                        <Bar dataKey="errorMv" name="|V − V₀| (mV)" radius={[4, 4, 0, 0]} maxBarSize={60} isAnimationActive={false}>
                            {vidaData.map((entry, i) => (
                                <Cell key={i} fill={getBarColorDinamico(entry.errorMv, entry.tolerancia)} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap gap-4 mt-3 justify-center">
                    <span className="flex items-center gap-1.5 text-xs text-gray-500"><span className="w-3 h-3 rounded-sm bg-emerald-500 inline-block"></span> ≤ 60% T — Electrodo OK</span>
                    <span className="flex items-center gap-1.5 text-xs text-gray-500"><span className="w-3 h-3 rounded-sm bg-orange-400 inline-block"></span> 60%–100% T — Verificar</span>
                    <span className="flex items-center gap-1.5 text-xs text-gray-500"><span className="w-3 h-3 rounded-sm bg-red-500 inline-block"></span> &gt; T — Agotado</span>
                </div>
            </div>

        </div>
    );
});

PHChart.displayName = 'PHChart';
export default PHChart;