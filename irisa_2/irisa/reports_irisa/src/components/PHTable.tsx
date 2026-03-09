import React from 'react';

export interface PHTest {
    promedio: string;
    desviacion: string;
    voltaje: string;
    temperatura: string;
    patron: string;
    errorMv: string;   // calculado: |Voltaje medido - Voltaje teórico Nernst|
    estadoElectrodo: string; // 'ok' | 'advertencia' | 'critico'
    error: string;     // calculado: |(patron - promedio) / patron| × 100 %
}

interface PHTableProps {
    tests: PHTest[];
    onTestsChange: (tests: PHTest[]) => void;
}

const BUFFER_OPTIONS = ['4', '7', '9'];

// Voltaje teórico de Nernst: V = (7 - pH) * 59.16  a 25°C
const voltajeTeorico = (pH: number) => (7 - pH) * 59.16;

// Tolerancia: < 59mV aceptable, 59-80mV advertencia, >80mV crítico (electrodo agotado)
const getEstado = (errorMv: number): { estado: string; label: string; color: string; bg: string; border: string } => {
    if (errorMv <= 20)  return { estado: 'ok',          label: '✓ Electrodo OK',         color: 'text-green-700',  bg: 'bg-green-50',  border: 'border-green-200' };
    if (errorMv <= 30)  return { estado: 'advertencia', label: '⚠ Verificar electrodo',  color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-200' };
    return              { estado: 'critico',             label: '✗ Electrodo agotado',    color: 'text-red-700',    bg: 'bg-red-50',    border: 'border-red-200' };
};

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
                {BUFFER_OPTIONS.map(opt => (
                    <option key={opt} value={opt}>pH {opt}</option>
                ))}
            </select>
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-[9px]">▼</span>
        </div>
    </div>
);

// Badge de estado del electrodo
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

const PHTable: React.FC<PHTableProps> = ({ tests, onTestsChange }) => {

    const handleAddRow = () => {
        onTestsChange([...tests, {
            promedio: '', desviacion: '', voltaje: '',
            temperatura: '', patron: '', errorMv: '', estadoElectrodo: '', error: ''
        }]);
    };

    const handleDeleteRow = (i: number) => {
        onTestsChange(tests.filter((_, idx) => idx !== i));
    };

    const recalc = (updated: PHTest): PHTest => {
        const promedio      = parseFloat(updated.promedio);
        const patron        = parseFloat(updated.patron);
        const voltajeMedido = parseFloat(updated.voltaje);

        // Desviación = |patron - promedio| (auto-calculada)
        if (!isNaN(patron) && !isNaN(promedio)) {
            updated.desviacion = Math.abs(patron - promedio).toFixed(4);
        } else {
            updated.desviacion = '';
        }

        // Error % = |(patron - promedio) / patron| × 100
        if (!isNaN(patron) && !isNaN(promedio) && patron !== 0) {
            updated.error = ((Math.abs(patron - promedio) / patron) * 100).toFixed(3);
        } else {
            updated.error = '';
        }

        // Error mV = |Voltaje medido - Voltaje teórico Nernst|
        if (!isNaN(promedio) && !isNaN(voltajeMedido)) {
            const vTeorico = voltajeTeorico(promedio);
            const diff = Math.abs(voltajeMedido - vTeorico);
            updated.errorMv = diff.toFixed(2);
            updated.estadoElectrodo = getEstado(diff).estado;
        } else {
            updated.errorMv = '';
            updated.estadoElectrodo = '';
        }

        return updated;
    };

    const handleChange = (index: number, field: keyof PHTest, value: string) => {
        const newTests = [...tests];
        newTests[index] = recalc({ ...newTests[index], [field]: value });
        onTestsChange(newTests);
    };

    // 9 columnas: patrón | promedio | desviación | voltaje | temp | rango mV | estado | error % | acción
    const gridCols = 'lg:grid-cols-[1fr_1fr_1fr_1fr_1fr_1fr_1.4fr_1fr_70px]';

    // Resumen general de estado de todos los electrodos
    const resumen = tests.map((t, i) => {
        const val = parseFloat(t.errorMv);
        if (isNaN(val) || t.errorMv === '') return null;
        return { index: i + 1, patron: t.patron, ...getEstado(val) };
    }).filter(Boolean);

    return (
        <div className="mt-8 w-full bg-white rounded-xl shadow-lg border border-gray-200">
            {/* CABECERA */}
            <div className="bg-gradient-to-r from-teal-600 to-emerald-600 px-4 py-4 sm:px-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/20 rounded-lg shrink-0">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">Mediciones de pH</h3>
                            <p className="text-teal-100 text-xs mt-0.5">{tests.length} registro{tests.length !== 1 ? 's' : ''}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleAddRow}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-white text-teal-700 hover:bg-teal-50 font-bold rounded-xl transition-all shadow-lg active:scale-95 text-sm"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                        </svg>
                        Nueva fila
                    </button>
                </div>
            </div>

            {/* RESUMEN DE ESTADO — solo si hay datos */}
            {resumen.length > 0 && (
                <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex flex-wrap gap-2">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider self-center mr-1">Estado electrodos:</span>
                    {resumen.map((r: any) => (
                        <span key={r!.index} className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${r!.color} ${r!.bg} ${r!.border}`}>
                            pH {r!.patron} → {r!.label}
                        </span>
                    ))}
                </div>
            )}

            <div className="overflow-x-auto">
                <div className="w-full lg:min-w-[1200px]">

                    {/* HEADERS DESKTOP */}
                    <div className={`hidden lg:grid ${gridCols} bg-gray-50 border-b border-gray-200 text-[10px] font-bold text-gray-500 uppercase tracking-wider`}>
                        <div className="px-3 py-4 text-center">Patrón Buffer</div>
                        <div className="px-3 py-4 text-center">Promedio pH</div>
                        <div className="px-3 py-4 text-center">Desviación</div>
                        <div className="px-3 py-4 text-center">Voltaje</div>
                        <div className="px-3 py-4 text-center">Temperatura</div>
                        <div className="px-3 py-4 text-center bg-orange-50 text-orange-700">Rango Vida (mV)</div>
                        <div className="px-3 py-4 text-center bg-blue-50 text-blue-700">Estado Electrodo</div>
                        <div className="px-3 py-4 text-center bg-red-50 text-red-700">Error %</div>
                        <div className="px-3 py-4 text-center">Acción</div>
                    </div>

                    {/* FILAS */}
                    <div className="divide-y divide-gray-100">
                        {tests.map((test, index) => (
                            <div key={index} className="hover:bg-teal-50/20 transition-colors">

                                {/* MÓVIL */}
                                <div className="lg:hidden p-4 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">#{index + 1}</span>
                                        <button onClick={() => handleDeleteRow(index)} className="flex items-center gap-1 text-red-400 hover:text-red-600 text-xs font-bold px-2 py-1 rounded-lg hover:bg-red-50 transition-all">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                            Eliminar
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="col-span-2">
                                            <PatronSelect value={test.patron} onChange={(v) => handleChange(index, 'patron', v)} />
                                        </div>
                                        <InputField label="Promedio pH" unit="pH" value={test.promedio} onChange={(e: any) => handleChange(index, 'promedio', e.target.value)} />
                                        <InputField label="Desviación"  unit="pH" value={test.desviacion} readOnly />
                                        <InputField label="Voltaje"     unit="mV" value={test.voltaje} onChange={(e: any) => handleChange(index, 'voltaje', e.target.value)} />
                                        <InputField label="Temperatura" unit="°C" value={test.temperatura} onChange={(e: any) => handleChange(index, 'temperatura', e.target.value)} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="bg-orange-50/40 rounded-lg p-2 border border-orange-100">
                                            <InputField label="Rango Vida mV" unit="mV" value={test.errorMv} readOnly />
                                        </div>
                                        <div className="bg-red-50/40 rounded-lg p-2 border border-red-100">
                                            <InputField label="Error %" unit="%" value={test.error} isError readOnly />
                                        </div>
                                    </div>
                                    <div className="col-span-2">
                                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Estado Electrodo</p>
                                        <EstadoBadge errorMv={test.errorMv} />
                                    </div>
                                </div>

                                {/* DESKTOP */}
                                <div className={`hidden lg:grid ${gridCols} lg:items-center`}>
                                    <div className="px-3 py-3"><PatronSelect value={test.patron} onChange={(v) => handleChange(index, 'patron', v)} /></div>
                                    <div className="px-3 py-3"><InputField unit="pH" value={test.promedio}   onChange={(e: any) => handleChange(index, 'promedio',   e.target.value)} /></div>
                                    <div className="px-3 py-3"><InputField unit="pH" value={test.desviacion} readOnly /></div>
                                    <div className="px-3 py-3"><InputField unit="mV" value={test.voltaje}    onChange={(e: any) => handleChange(index, 'voltaje',    e.target.value)} /></div>
                                    <div className="px-3 py-3"><InputField unit="°C" value={test.temperatura} onChange={(e: any) => handleChange(index, 'temperatura', e.target.value)} /></div>
                                    <div className="px-3 py-3 bg-orange-50/20"><InputField unit="mV" value={test.errorMv} readOnly /></div>
                                    <div className="px-3 py-3"><EstadoBadge errorMv={test.errorMv} /></div>
                                    <div className="px-3 py-3 bg-red-50/20"><InputField unit="%" value={test.error} isError readOnly /></div>
                                    <div className="flex justify-center items-center">
                                        <button onClick={() => handleDeleteRow(index)} className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-full transition-all">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* EMPTY STATE */}
                    {tests.length === 0 && (
                        <div className="text-center py-16 px-4 bg-gray-50/50">
                            <div className="mb-4 flex justify-center text-gray-300">
                                <svg className="w-14 h-14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                </svg>
                            </div>
                            <p className="text-gray-500 font-semibold text-base">No hay registros de pH.</p>
                            <p className="text-gray-400 text-sm mt-1 mb-5">Inicia agregando una nueva medición.</p>
                            <button onClick={handleAddRow} className="text-teal-600 font-bold hover:text-teal-700 text-sm px-6 py-2 border-2 border-teal-600 rounded-lg hover:bg-teal-50 transition-all">
                                + Agregar primera medición
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Nota técnica */}
            <div className="px-4 py-3 border-t border-gray-100 flex flex-wrap items-center gap-4">
                <p className="text-[10px] text-gray-400 font-medium">Registros totales: {tests.length}</p>
                <div className="flex flex-wrap gap-3 ml-auto">
                    <span className="flex items-center gap-1.5 text-[10px] text-gray-500"><span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block"></span> ≤ 20 mV — OK</span>
                    <span className="flex items-center gap-1.5 text-[10px] text-gray-500"><span className="w-2.5 h-2.5 rounded-full bg-orange-400 inline-block"></span> 20–30 mV — Verificar</span>
                    <span className="flex items-center gap-1.5 text-[10px] text-gray-500"><span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block"></span> &gt; 30 mV — Agotado</span>
                </div>
            </div>
        </div>
    );
};

export default PHTable;