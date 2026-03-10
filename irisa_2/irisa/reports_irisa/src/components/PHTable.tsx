import React from 'react';

export interface PHTest {
    promedio: string;
    desviacion: string;
    voltaje: string;
    temperatura: string;
    patron: string;
    errorMv: string;   // Rango Vida = desgaste = k × (V − V₀)
    estadoElectrodo: string;
    error: string;
}

interface PHTableProps {
    tests: PHTest[];
    onTestsChange: (tests: PHTest[]) => void;
}

const BUFFER_OPTIONS = ['4', '7', '9'];

// ─── Constantes (fórmula de la foto) ─────────────────────────────────────────
const V0 = 174;  // mV — voltaje base del electrodo nuevo
const K  = 0.1;  // factor de reducción lineal

/**
 * Rango de Vida (desgaste) = k × (V − V₀)
 * Mínimo 0 mV. Si V < V₀ el electrodo está por encima de lo esperado → desgaste 0.
 */
const calcDesgaste = (voltajeMedido: number): number =>
    Math.max(0, K * (voltajeMedido - V0));

/**
 * Umbrales sobre el desgaste:
 *   OK        : desgaste ≤ 20 mV
 *   Verificar : 20 < desgaste ≤ 30 mV
 *   Agotado   : desgaste > 30 mV
 */
const getEstado = (
    desgaste: number
): { estado: string; label: string; color: string; bg: string; border: string } => {
    if (desgaste <= 20)
        return { estado: 'ok',          label: '✓ Electrodo OK',        color: 'text-green-700',  bg: 'bg-green-50',  border: 'border-green-200'  };
    if (desgaste <= 30)
        return { estado: 'advertencia', label: '⚠ Verificar electrodo', color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-200' };
    return    { estado: 'critico',     label: '✗ Electrodo agotado',   color: 'text-red-700',    bg: 'bg-red-50',    border: 'border-red-200'    };
};

// ─── Subcomponentes ───────────────────────────────────────────────────────────

const InputField = ({ label, value, onChange, unit, isError = false, readOnly = false }: any) => (
    <div className="flex flex-col w-full">
        <label className="block text-[10px] font-bold text-gray-500 mb-1 lg:hidden uppercase tracking-wider">{label}</label>
        <div className="relative w-full">
            <input
                type="text"
                value={value}
                onChange={onChange}
                readOnly={readOnly}
                className={`w-full px-3 py-2.5 pr-10 text-xs border rounded-lg focus:outline-none focus:ring-2 shadow-sm
                    ${isError
                        ? 'border-red-200 bg-red-50 focus:ring-red-400 font-bold text-red-700'
                        : 'border-gray-300 bg-white focus:ring-teal-500 text-gray-700'
                    } ${readOnly ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                placeholder="0.00"
            />
            {unit && (
                <span className={`absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-bold pointer-events-none
                    ${isError ? 'text-red-400' : 'text-gray-400'}`}>{unit}</span>
            )}
        </div>
    </div>
);

const PatronSelect = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
    <div className="flex flex-col w-full">
        <label className="block text-[10px] font-bold text-gray-500 mb-1 lg:hidden uppercase tracking-wider">Patrón Buffer</label>
        <div className="relative w-full">
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full px-3 py-2.5 text-xs border border-gray-300 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-700 shadow-sm appearance-none cursor-pointer font-bold"
            >
                <option value="">— pH —</option>
                {BUFFER_OPTIONS.map(opt => <option key={opt} value={opt}>pH {opt}</option>)}
            </select>
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-[9px]">▼</span>
        </div>
    </div>
);

const EstadoBadge = ({ errorMv }: { errorMv: string }) => {
    const val = parseFloat(errorMv);
    if (isNaN(val) || errorMv === '') {
        return (
            <div className="w-full px-3 py-2.5 text-xs border border-gray-200 bg-gray-50 rounded-lg text-gray-400 text-center font-medium">
                — Sin datos —
            </div>
        );
    }
    const { label, color, bg, border } = getEstado(val);
    return (
        <div className={`w-full px-2 py-2 text-[11px] border rounded-lg text-center font-bold ${color} ${bg} ${border}`}>
            {label}
        </div>
    );
};

// ─── Componente Principal ─────────────────────────────────────────────────────

const PHTable: React.FC<PHTableProps> = ({ tests, onTestsChange }) => {

    const handleAddRow = () => {
        onTestsChange([...tests, {
            promedio: '', desviacion: '', voltaje: '',
            temperatura: '', patron: '', errorMv: '',
            estadoElectrodo: '', error: ''
        }]);
    };

    const handleDeleteRow = (i: number) => {
        onTestsChange(tests.filter((_, idx) => idx !== i));
    };

    const recalc = (updated: PHTest): PHTest => {
        const promedio      = parseFloat(updated.promedio);
        const patron        = parseFloat(updated.patron);
        const voltajeMedido = parseFloat(updated.voltaje);

        // 1. Desviación pH
        updated.desviacion = (!isNaN(patron) && !isNaN(promedio))
            ? Math.abs(patron - promedio).toFixed(4)
            : '';

        // 2. Error %
        updated.error = (!isNaN(patron) && !isNaN(promedio) && patron !== 0)
            ? ((Math.abs(patron - promedio) / patron) * 100).toFixed(3)
            : '';

        // 3. Rango Vida = desgaste = k × (V − V₀)
        if (!isNaN(voltajeMedido)) {
            const desgaste = calcDesgaste(voltajeMedido);
            updated.errorMv         = desgaste.toFixed(2);
            updated.estadoElectrodo = getEstado(desgaste).estado;
        } else {
            updated.errorMv         = '';
            updated.estadoElectrodo = '';
        }

        return updated;
    };

    const handleChange = (index: number, field: keyof PHTest, value: string) => {
        const newTests = [...tests];
        newTests[index] = recalc({ ...newTests[index], [field]: value });
        onTestsChange(newTests);
    };

    // Banner superior de estados
    const estadosBanner = tests
        .filter(t => t.patron && t.estadoElectrodo)
        .map((t, i) => ({
            key: i,
            patron: t.patron,
            ...getEstado(parseFloat(t.errorMv))
        }));

    const gridCols = 'lg:grid-cols-[1fr_1fr_1fr_1fr_1fr_1fr_1.5fr_1fr_70px]';

    return (
        <div className="mt-8 w-full bg-white rounded-xl shadow-lg border border-gray-200">

            {/* ── Header ── */}
            <div className="bg-gradient-to-r from-teal-600 to-emerald-600 px-4 py-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white">Mediciones de pH</h3>
                        <p className="text-teal-100 text-xs">{tests.length} registro{tests.length !== 1 ? 's' : ''}</p>
                    </div>
                </div>
                <button
                    onClick={handleAddRow}
                    className="w-full sm:w-auto px-5 py-2.5 bg-white text-teal-700 hover:bg-teal-50 font-bold rounded-xl transition-all shadow-lg text-sm"
                >
                    + Nueva fila
                </button>
            </div>

            {/* ── Banner de estados ── */}
            {estadosBanner.length > 0 && (
                <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 flex flex-wrap gap-2 items-center">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mr-1">Estado electrodos:</span>
                    {estadosBanner.map(e => (
                        <span key={e.key} className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${e.color} ${e.bg} ${e.border}`}>
                            pH {e.patron} → {e.label}
                        </span>
                    ))}
                </div>
            )}

            {/* ── Tabla ── */}
            <div className="overflow-x-auto">
                <div className="w-full lg:min-w-[1200px]">

                    {/* Headers desktop */}
                    <div className={`hidden lg:grid ${gridCols} bg-gray-50 border-b border-gray-200 text-[10px] font-bold text-gray-500 uppercase tracking-wider`}>
                        <div className="px-3 py-4 text-center">Patrón Buffer</div>
                        <div className="px-3 py-4 text-center">Promedio pH</div>
                        <div className="px-3 py-4 text-center">Desviación</div>
                        <div className="px-3 py-4 text-center">Voltaje</div>
                        <div className="px-3 py-4 text-center">Temp.</div>
                        <div className="px-3 py-4 text-center bg-orange-50 text-orange-700">Rango Vida (mV)</div>
                        <div className="px-3 py-4 text-center bg-blue-50 text-blue-700">Estado Electrodo</div>
                        <div className="px-3 py-4 text-center bg-red-50 text-red-700">Error %</div>
                        <div className="px-3 py-4 text-center">Acción</div>
                    </div>

                    <div className="divide-y divide-gray-100">
                        {tests.map((test, index) => (
                            <div key={index} className="hover:bg-teal-50/20 transition-colors">

                                {/* Desktop Row */}
                                <div className={`hidden lg:grid ${gridCols} items-center`}>
                                    <div className="px-3 py-3">
                                        <PatronSelect value={test.patron} onChange={(v) => handleChange(index, 'patron', v)} />
                                    </div>
                                    <div className="px-3 py-3">
                                        <InputField unit="pH" value={test.promedio} onChange={(e: any) => handleChange(index, 'promedio', e.target.value)} />
                                    </div>
                                    <div className="px-3 py-3">
                                        <InputField unit="pH" value={test.desviacion} readOnly />
                                    </div>
                                    <div className="px-3 py-3">
                                        <InputField unit="mV" value={test.voltaje} onChange={(e: any) => handleChange(index, 'voltaje', e.target.value)} />
                                    </div>
                                    <div className="px-3 py-3">
                                        <InputField unit="°C" value={test.temperatura} onChange={(e: any) => handleChange(index, 'temperatura', e.target.value)} />
                                    </div>
                                    <div className="px-3 py-3 bg-orange-50/20">
                                        <InputField unit="mV" value={test.errorMv} readOnly />
                                    </div>
                                    <div className="px-3 py-3">
                                        <EstadoBadge errorMv={test.errorMv} />
                                    </div>
                                    <div className="px-3 py-3 bg-red-50/20">
                                        <InputField unit="%" value={test.error} isError={parseFloat(test.error) > 5} readOnly />
                                    </div>
                                    <div className="flex justify-center">
                                        <button onClick={() => handleDeleteRow(index)} className="text-red-400 hover:text-red-600 p-2">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>

                                {/* Mobile Card */}
                                <div className="lg:hidden p-4 space-y-3">
                                    <div className="grid grid-cols-2 gap-3">
                                        <PatronSelect value={test.patron} onChange={(v) => handleChange(index, 'patron', v)} />
                                        <InputField label="Promedio pH" unit="pH" value={test.promedio} onChange={(e: any) => handleChange(index, 'promedio', e.target.value)} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <InputField label="Voltaje" unit="mV" value={test.voltaje} onChange={(e: any) => handleChange(index, 'voltaje', e.target.value)} />
                                        <InputField label="Temperatura" unit="°C" value={test.temperatura} onChange={(e: any) => handleChange(index, 'temperatura', e.target.value)} />
                                    </div>
                                    <div className="grid grid-cols-3 gap-3">
                                        <InputField label="Desviación" unit="pH" value={test.desviacion} readOnly />
                                        <InputField label="Rango mV" unit="mV" value={test.errorMv} readOnly />
                                        <InputField label="Error %" unit="%" value={test.error} isError={parseFloat(test.error) > 5} readOnly />
                                    </div>
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="flex-1">
                                            <EstadoBadge errorMv={test.errorMv} />
                                        </div>
                                        <button onClick={() => handleDeleteRow(index)} className="text-red-400 hover:text-red-600 p-2 shrink-0">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>

                            </div>
                        ))}
                    </div>

                    {tests.length === 0 && (
                        <div className="text-center py-16 bg-gray-50/50">
                            <p className="text-gray-500 font-semibold">No hay registros de pH.</p>
                            <button onClick={handleAddRow} className="mt-4 text-teal-600 font-bold border-2 border-teal-600 px-6 py-2 rounded-lg hover:bg-teal-50">
                                + Agregar primero
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Footer ── */}
            <div className="px-4 py-3 border-t bg-gray-50 flex flex-wrap justify-between items-center gap-2">
                <span className="text-[10px] text-gray-400 font-mono">
                    Registros totales: {tests.length}
                </span>
                <div className="flex gap-4">
                    <span className="text-[10px] flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-green-500"/>
                        ≤ 20 mV — OK
                    </span>
                    <span className="text-[10px] flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-orange-400"/>
                        20–30 mV — Verificar
                    </span>
                    <span className="text-[10px] flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-red-500"/>
                        &gt; 30 mV — Agotado
                    </span>
                </div>
            </div>
        </div>
    );
};

export default PHTable;