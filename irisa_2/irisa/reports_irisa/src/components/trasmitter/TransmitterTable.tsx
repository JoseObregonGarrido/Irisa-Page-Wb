import React, { useState, useRef, useEffect } from 'react';

// --- INTERFACES ---
export interface Measurement {
    rowType?: 'mv' | 'tx';
    percentage: string;
    idealUE: string;
    patronUE: string;
    ueTransmitter: string;
    idealmA: string;
    idealohm?: string; 
    idealMv?: string; 
    maTransmitter: string; 
    ohmTransmitter?: string; 
    mvTransmitter?: string; 
    errorUE: string;
    errormA: string;
    errorPercentage: string;
    errorOhm?: string;
    errorMv?: string;
    sensorType?: 'J' | 'K';
    idealmV?: string;
    sensormV?: string;
    errormV?: string;
    idealTx?: string;
    mATX?: string;
    sensorTypeTx?: 'J' | 'K';
}

// ── CAMBIO 1: 3 arrays separados en vez de uno solo ──────────────────────────
interface TransmitterTableProps {
    measurementsMA: Measurement[];
    onMeasurementsMAChange: (m: Measurement[]) => void;
    measurementsOhm: Measurement[];
    onMeasurementsOhmChange: (m: Measurement[]) => void;
    measurementsMV: Measurement[];
    onMeasurementsMVChange: (m: Measurement[]) => void;
    outputUnit: 'mA' | 'ohm' | 'mv';
    setOutputUnit: (unit: 'mA' | 'ohm' | 'mv') => void;
    hasUeTransmitter: boolean;
    setHasUeTransmitter: (show: boolean) => void;
}
// ─────────────────────────────────────────────────────────────────────────────

const InputField = ({ label, value, onChange, unit, isError = false, readOnly = false }: any) => (
    <div className="flex flex-col w-full">
        <label className="block text-[10px] font-bold text-gray-500 mb-1 lg:hidden">{label}</label>
        <div className="relative w-full">
            <input
                type="text"
                value={value}
                onChange={onChange}
                readOnly={readOnly}
                className={`w-full px-2 py-2 pr-7 text-xs border rounded-lg focus:outline-none focus:ring-2 
                    ${isError 
                        ? 'border-red-200 bg-red-50 focus:ring-red-500 font-bold text-red-700' 
                        : 'border-gray-300 bg-white focus:ring-teal-500 text-gray-700'
                    } ${readOnly ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                placeholder="0.00"
            />
            <span className={`absolute right-1.5 top-2.5 text-[9px] font-bold ${isError ? 'text-red-400' : 'text-gray-400'}`}>{unit}</span>
        </div>
    </div>
);

const TransmitterTable: React.FC<TransmitterTableProps> = ({ 
    measurementsMA, onMeasurementsMAChange,
    measurementsOhm, onMeasurementsOhmChange,
    measurementsMV, onMeasurementsMVChange,
    outputUnit,
    setOutputUnit,
    hasUeTransmitter,
    setHasUeTransmitter
}) => {
    // ── CAMBIO 2: seleccionar array activo según modo ─────────────────────────
    const measurements = outputUnit === 'mA'  ? measurementsMA
                       : outputUnit === 'ohm' ? measurementsOhm
                       : measurementsMV;

    const onMeasurementsChange = outputUnit === 'mA'  ? onMeasurementsMAChange
                               : outputUnit === 'ohm' ? onMeasurementsOhmChange
                               : onMeasurementsMVChange;
    // ─────────────────────────────────────────────────────────────────────────

    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    
    const calculateErrors = (m: Measurement) => {
    // Fila TX del modo mV: solo calcula error de mA TX
    if (m.rowType === 'tx') {
        const idealmA = parseFloat(m.idealmA ?? '0');
        const mATX    = parseFloat(m.mATX    ?? '0');
        const errormA = (isNaN(mATX) ? 0 : mATX) - (isNaN(idealmA) ? 0 : idealmA);
        return { ...m, errormA: errormA.toFixed(3) };
    }

    // Fila mV del modo mV: solo calcula error de mV
    if (m.rowType === 'mv') {
        const idealVal  = parseFloat(m.idealmV  ?? '0');
        const sensorVal = parseFloat(m.sensormV ?? '0');
        const errormV = (isNaN(idealVal) ? 0 : idealVal) - (isNaN(sensorVal) ? 0 : sensorVal);
        return { ...m, errormV: errormV.toFixed(3) };
    }

    // Filas normales (mA y ohm)
    const idealUE = parseFloat(m.idealUE) || 0;
    const ueTrans = parseFloat(m.ueTransmitter) || 0;
    const idealmA = parseFloat(m.idealmA) || 0;
    const maTrans = parseFloat(m.maTransmitter) || 0;
    const errorUE = ueTrans - idealUE;
    const errormA = maTrans - idealmA;
    const errorPercentage = (errormA / 16) * 100;
    const errorOhm = (parseFloat(m.ohmTransmitter || "0") || 0) - (parseFloat(m.idealohm || "0") || 0);
    const errorMvPuro = (parseFloat(m.sensormV || "0") || 0) - (parseFloat(m.idealmV || "0") || 0);
    return {
        ...m,
        errorUE: errorUE.toFixed(3),
        errormA: errormA.toFixed(3),
        errorPercentage: errorPercentage.toFixed(2),
        errorOhm: errorOhm.toFixed(3),
        errormV: errorMvPuro.toFixed(3)
    };
};

    const handleChange = (index: number, field: keyof Measurement, value: any) => {
        const newMeasurements = [...measurements];
        newMeasurements[index] = { ...newMeasurements[index], [field]: value };
        newMeasurements[index] = calculateErrors(newMeasurements[index]);
        onMeasurementsChange(newMeasurements);
    };

    const addNewRow = (rowType?: 'mv' | 'tx') => {
        onMeasurementsChange([...measurements, { 
            rowType,
            percentage: "", idealUE: "", patronUE: "", ueTransmitter: "", idealmA:"", 
            idealohm: "", idealMv: "", maTransmitter: "", ohmTransmitter: "", mvTransmitter: "", 
            errorUE: "", errormA: "", errorPercentage: "", errorOhm: "", errorMv: "", 
            sensorType: 'J', idealmV: '', sensormV: '', errormV: '', mATX: ''
        }]);
        setShowDropdown(false);
    };

    const handleNuevaFila = () => {
        if (outputUnit === 'mv') {
            setShowDropdown(!showDropdown);
        } else {
            addNewRow();
        }
    };

    const getLayoutConfig = () => {
        switch (outputUnit) {
            case 'mv':
                return {
                    gridCols: 'lg:grid-cols-[56px_1fr_1fr_140px_1fr_80px]', 
                    minWidth: 'lg:min-w-[950px]',
                    headers: ['Tipo', 'mV / mA ideal', 'mV / mA medido', 'Sensor', 'Error', 'Acción']
                };
            case 'ohm':
                return {
                    gridCols: hasUeTransmitter ? 'lg:grid-cols-[repeat(13,minmax(0,1fr))]' : 'lg:grid-cols-[repeat(11,minmax(0,1fr))]',
                    minWidth: 'lg:min-w-[1400px]',
                    headers: ['Ideal UE', 'Ideal mA', 'Ideal Ohm', 'Patrón UE', ...(hasUeTransmitter ? ['UE Trans.'] : []), 'mA Sensor', 'Ohm Sensor', '% Rango', ...(hasUeTransmitter ? ['Err UE'] : []), 'Err Ohm', 'Err mA', 'Err %', 'Acción']
                };
            default:
                return {
                    gridCols: hasUeTransmitter ? 'lg:grid-cols-[repeat(10,minmax(0,1fr))]' : 'lg:grid-cols-[repeat(8,minmax(0,1fr))]',
                    minWidth: 'lg:min-w-[1100px]',
                    headers: ['Ideal UE', 'Ideal mA', 'Patrón UE', ...(hasUeTransmitter ? ['UE Trans.'] : []), 'mA Trans.', '% Rango', ...(hasUeTransmitter ? ['Err UE'] : []), 'Err mA', 'Err %', 'Acción']
                };
        }
    };

    const config = getLayoutConfig();

    const RowTypeBadge = ({ type }: { type: 'mv' | 'tx' }) => (
        <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-full tracking-wider
            ${type === 'mv'
                ? 'bg-orange-100 text-orange-700 border border-orange-200'
                : 'bg-blue-100 text-blue-700 border border-blue-200'}`}>
            {type}
        </span>
    );

    const DeleteBtn = ({ index }: { index: number }) => (
        <button onClick={() => onMeasurementsChange(measurements.filter((_, i) => i !== index))} className="text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
        </button>
    );

    return (
        <div className="mt-8 w-full bg-white rounded-xl shadow-lg border border-gray-200">
            {/* CABECERA */}
            <div className="bg-gradient-to-r from-teal-600 to-emerald-600 px-4 py-4 sm:px-6">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-lg font-bold text-white tracking-tight">Mediciones de transmisor</h3>
                        <div className="flex bg-black/20 p-1 rounded-lg border border-white/10">
                            {(['mA', 'ohm', 'mv'] as const).map((unit) => (
                                <button 
                                    key={unit}
                                    type="button" 
                                    onClick={() => setOutputUnit(unit)} 
                                    className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${outputUnit === unit ? 'bg-white text-teal-700 shadow' : 'text-white hover:bg-white/10'}`}
                                >
                                    {unit === 'ohm' ? 'RTD' : unit === 'mv' ? 'mV' : 'TX'}
                                </button>
                            ))}
                        </div>
                        {outputUnit !== 'mv' && (
                            <button
                                type="button"
                                onClick={() => setHasUeTransmitter(!hasUeTransmitter)}
                                className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${hasUeTransmitter ? 'bg-white text-teal-700 shadow' : 'bg-white/10 border-white/20 text-white hover:bg-white/20'}`}
                            >
                                {hasUeTransmitter ? 'Ocultar UE' : 'Mostrar UE'}
                            </button>
                        )}
                    </div>

                    <div className="relative" ref={dropdownRef}>
                        <button 
                            onClick={handleNuevaFila}
                            className="px-4 py-2 bg-white text-teal-700 font-bold rounded-lg shadow-md hover:bg-teal-50 flex items-center gap-2 transition-transform active:scale-95"
                        >
                            Nueva fila
                            {outputUnit === 'mv' && (
                                <svg className={`w-3.5 h-3.5 transition-transform ${showDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                                </svg>
                            )}
                        </button>
                        {showDropdown && outputUnit === 'mv' && (
                            <div className="absolute right-0 mt-2 w-24 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
                                <button onClick={() => addNewRow('mv')} className="w-full flex items-center justify-center px-4 py-3 hover:bg-orange-50 transition-colors group">
                                    <span className="text-sm font-black text-orange-700 group-hover:text-orange-900">mV</span>
                                </button>
                                <button onClick={() => addNewRow('tx')} className="w-full flex items-center justify-center px-4 py-3 hover:bg-blue-50 transition-colors group border-t border-gray-100">
                                    <span className="text-sm font-black text-blue-700 group-hover:text-blue-900">TX</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto">
                <div className={`w-full ${config.minWidth}`}>
                    {/* HEADERS DESKTOP */}
                    <div className={`hidden lg:grid ${config.gridCols} bg-gray-50 border-b border-gray-200 text-[10px] font-bold text-gray-500 tracking-wider`}>
                        {config.headers.map((h, i) => (
                            <div key={i} className={`px-2 py-4 text-center ${h.includes('Err') || h.includes('Error') ? 'bg-red-50 text-red-700 border-x border-red-100/30' : ''}`}>
                                {h}
                            </div>
                        ))}
                    </div>

                    {/* CUERPO */}
                    <div className="divide-y divide-gray-200 bg-gray-50 lg:bg-white">
                        {measurements.map((m, index) => (
                            <div key={index} className="hover:bg-teal-50/30 transition-colors">

                                {/* ── MÓVIL / TABLET: card apilada (< lg) ── */}
                                <div className="lg:hidden p-4 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">#{index + 1}</span>
                                            {outputUnit === 'mv' && <RowTypeBadge type={m.rowType ?? 'mv'} />}
                                        </div>
                                        <button
                                            onClick={() => onMeasurementsChange(measurements.filter((_, i) => i !== index))}
                                            className="flex items-center gap-1 text-red-400 hover:text-red-600 text-xs font-bold px-2 py-1 rounded-lg hover:bg-red-50 transition-all"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                            Eliminar
                                        </button>
                                    </div>

                                    {outputUnit === 'mv' ? (
                                        <>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    {m.rowType === 'tx'
                                                        ? <InputField label="Ideal mA" unit="mA" value={m.idealmA} onChange={(e:any) => handleChange(index, 'idealmA', e.target.value)} />
                                                        : <InputField label="mV ideal" unit="mV" value={m.idealmV} onChange={(e:any) => handleChange(index, 'idealmV', e.target.value)} />
                                                    }
                                                </div>
                                                <div>
                                                    {m.rowType === 'tx'
                                                        ? <InputField label="mA TX" unit="mA" value={m.mATX} onChange={(e:any) => handleChange(index, 'mATX', e.target.value)} />
                                                        : <InputField label="mV sensor" unit="mV" value={m.sensormV} onChange={(e:any) => handleChange(index, 'sensormV', e.target.value)} />
                                                    }
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3 items-center">
                                                <div className="flex gap-3 bg-gray-100 p-2 rounded-lg border border-gray-200">
                                                    {['J', 'K'].map((type) => (
                                                        <label key={type} className="flex items-center gap-1 cursor-pointer">
                                                            <input type="radio" checked={m.sensorType === type} onChange={() => handleChange(index, 'sensorType', type as any)} className="w-3.5 h-3.5 accent-orange-600" />
                                                            <span className={`text-xs font-bold ${m.sensorType === type ? 'text-orange-700' : 'text-gray-400'}`}>{type}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                                <div className="bg-red-50/50 rounded-lg p-1">
                                                    {m.rowType === 'tx'
                                                        ? <InputField label="Err mA" unit="mA" value={m.errormA} isError readOnly />
                                                        : <InputField label="Error mV" unit="mV" value={m.errormV} isError readOnly />
                                                    }
                                                </div>
                                            </div>
                                        </>
                                    ) : outputUnit === 'ohm' ? (
                                        <>
                                            <div className="grid grid-cols-2 gap-3">
                                                <InputField label="Ideal UE" unit="UE" value={m.idealUE} onChange={(e:any) => handleChange(index, 'idealUE', e.target.value)} />
                                                <InputField label="Ideal mA" unit="mA" value={m.idealmA} onChange={(e:any) => handleChange(index, 'idealmA', e.target.value)} />
                                                <InputField label="Ideal Ohm" unit="Ω" value={m.idealohm} onChange={(e:any) => handleChange(index, 'idealohm', e.target.value)} />
                                                <InputField label="Patrón UE" unit="UE" value={m.patronUE} onChange={(e:any) => handleChange(index, 'patronUE', e.target.value)} />
                                                {hasUeTransmitter && <InputField label="UE Trans." unit="UE" value={m.ueTransmitter} onChange={(e:any) => handleChange(index, 'ueTransmitter', e.target.value)} />}
                                                <InputField label="mA Sensor" unit="mA" value={m.maTransmitter} onChange={(e:any) => handleChange(index, 'maTransmitter', e.target.value)} />
                                                <InputField label="Ohm Sensor" unit="Ω" value={m.ohmTransmitter} onChange={(e:any) => handleChange(index, 'ohmTransmitter', e.target.value)} />
                                                <InputField label="% Rango" unit="%" value={m.percentage} onChange={(e:any) => handleChange(index, 'percentage', e.target.value)} />
                                            </div>
                                            <div className="grid grid-cols-2 gap-3 bg-red-50/40 rounded-lg p-2 border border-red-100">
                                                {hasUeTransmitter && <InputField label="Err UE" unit="UE" value={m.errorUE} isError readOnly />}
                                                <InputField label="Err Ohm" unit="Ω" value={m.errorOhm} isError readOnly />
                                                <InputField label="Err mA" unit="mA" value={m.errormA} isError readOnly />
                                                <InputField label="Err %" unit="%" value={m.errorPercentage} isError readOnly />
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="grid grid-cols-2 gap-3">
                                                <InputField label="Ideal UE" unit="UE" value={m.idealUE} onChange={(e:any) => handleChange(index, 'idealUE', e.target.value)} />
                                                <InputField label="Ideal mA" unit="mA" value={m.idealmA} onChange={(e:any) => handleChange(index, 'idealmA', e.target.value)} />
                                                <InputField label="Patrón UE" unit="UE" value={m.patronUE} onChange={(e:any) => handleChange(index, 'patronUE', e.target.value)} />
                                                {hasUeTransmitter && <InputField label="UE Trans." unit="UE" value={m.ueTransmitter} onChange={(e:any) => handleChange(index, 'ueTransmitter', e.target.value)} />}
                                                <InputField label="mA Trans." unit="mA" value={m.maTransmitter} onChange={(e:any) => handleChange(index, 'maTransmitter', e.target.value)} />
                                                <InputField label="% Rango" unit="%" value={m.percentage} onChange={(e:any) => handleChange(index, 'percentage', e.target.value)} />
                                            </div>
                                            <div className="grid grid-cols-3 gap-3 bg-red-50/40 rounded-lg p-2 border border-red-100">
                                                {hasUeTransmitter && <InputField label="Err UE" unit="UE" value={m.errorUE} isError readOnly />}
                                                <InputField label="Err mA" unit="mA" value={m.errormA} isError readOnly />
                                                <InputField label="Err %" unit="%" value={m.errorPercentage} isError readOnly />
                                            </div>
                                        </>
                                    )}
                                </div>

                                {/* ── DESKTOP: fila en grid (≥ lg) ── */}
                                <div className={`hidden lg:grid ${config.gridCols} lg:items-center`}>
                                    {outputUnit === 'mv' ? (
                                        <>
                                            <div className="lg:px-2 lg:py-3 flex justify-center items-center">
                                                <RowTypeBadge type={m.rowType ?? 'mv'} />
                                            </div>
                                            <div className="lg:px-4 lg:py-3">
                                                {m.rowType === 'tx'
                                                    ? <InputField label="Ideal mA" unit="mA" value={m.idealmA} onChange={(e:any) => handleChange(index, 'idealmA', e.target.value)} />
                                                    : <InputField label="mV ideal" unit="mV" value={m.idealmV} onChange={(e:any) => handleChange(index, 'idealmV', e.target.value)} />
                                                }
                                            </div>
                                            <div className="lg:px-4 lg:py-3">
                                                {m.rowType === 'tx'
                                                    ? <InputField label="mA TX" unit="mA" value={m.mATX} onChange={(e:any) => handleChange(index, 'mATX', e.target.value)} />
                                                    : <InputField label="mV sensor" unit="mV" value={m.sensormV} onChange={(e:any) => handleChange(index, 'sensormV', e.target.value)} />
                                                }
                                            </div>
                                            <div className="lg:px-4 lg:py-3 flex justify-center">
                                                <div className="flex gap-3 bg-gray-100 p-1.5 rounded-lg border border-gray-200 shadow-sm">
                                                    {['J', 'K'].map((type) => (
                                                        <label key={type} className="flex items-center gap-1 cursor-pointer">
                                                            <input type="radio" checked={m.sensorType === type} onChange={() => handleChange(index, 'sensorType', type as any)} className="w-3.5 h-3.5 accent-orange-600" />
                                                            <span className={`text-xs font-bold ${m.sensorType === type ? 'text-orange-700' : 'text-gray-400'}`}>{type}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="lg:px-4 lg:py-3 lg:bg-red-50/20">
                                                {m.rowType === 'tx'
                                                    ? <InputField label="Err mA" unit="mA" value={m.errormA} isError readOnly />
                                                    : <InputField label="Error mV" unit="mV" value={m.errormV} isError readOnly />
                                                }
                                            </div>
                                        </>
                                    ) : outputUnit === 'ohm' ? (
                                        <>
                                            <div className="lg:px-2 lg:py-3"><InputField label="Ideal UE" unit="UE" value={m.idealUE} onChange={(e:any) => handleChange(index, 'idealUE', e.target.value)} /></div>
                                            <div className="lg:px-2 lg:py-3"><InputField label="Ideal mA" unit="mA" value={m.idealmA} onChange={(e:any) => handleChange(index, 'idealmA', e.target.value)} /></div>
                                            <div className="lg:px-2 lg:py-3"><InputField label="Ideal Ohm" unit="Ω" value={m.idealohm} onChange={(e:any) => handleChange(index, 'idealohm', e.target.value)} /></div>
                                            <div className="lg:px-2 lg:py-3"><InputField label="Patrón UE" unit="UE" value={m.patronUE} onChange={(e:any) => handleChange(index, 'patronUE', e.target.value)} /></div>
                                            {hasUeTransmitter && <div className="lg:px-2 lg:py-3"><InputField label="UE Trans." unit="UE" value={m.ueTransmitter} onChange={(e:any) => handleChange(index, 'ueTransmitter', e.target.value)} /></div>}
                                            <div className="lg:px-2 lg:py-3"><InputField label="mA Sensor" unit="mA" value={m.maTransmitter} onChange={(e:any) => handleChange(index, 'maTransmitter', e.target.value)} /></div>
                                            <div className="lg:px-2 lg:py-3"><InputField label="Ohm Sensor" unit="Ω" value={m.ohmTransmitter} onChange={(e:any) => handleChange(index, 'ohmTransmitter', e.target.value)} /></div>
                                            <div className="lg:px-2 lg:py-3"><InputField label="% Rango" unit="%" value={m.percentage} onChange={(e:any) => handleChange(index, 'percentage', e.target.value)} /></div>
                                            {hasUeTransmitter && <div className="lg:px-2 lg:py-3 lg:bg-red-50/20"><InputField label="Err UE" unit="UE" value={m.errorUE} isError readOnly /></div>}
                                            <div className="lg:px-2 lg:py-3 lg:bg-red-50/20"><InputField label="Err Ohm" unit="Ω" value={m.errorOhm} isError readOnly /></div>
                                            <div className="lg:px-2 lg:py-3 lg:bg-red-50/20"><InputField label="Err mA" unit="mA" value={m.errormA} isError readOnly /></div>
                                            <div className="lg:px-2 lg:py-3 lg:bg-red-50/20"><InputField label="Err %" unit="%" value={m.errorPercentage} isError readOnly /></div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="lg:px-2 lg:py-3"><InputField label="Ideal UE" unit="UE" value={m.idealUE} onChange={(e:any) => handleChange(index, 'idealUE', e.target.value)} /></div>
                                            <div className="lg:px-2 lg:py-3"><InputField label="Ideal mA" unit="mA" value={m.idealmA} onChange={(e:any) => handleChange(index, 'idealmA', e.target.value)} /></div>
                                            <div className="lg:px-2 lg:py-3"><InputField label="Patrón UE" unit="UE" value={m.patronUE} onChange={(e:any) => handleChange(index, 'patronUE', e.target.value)} /></div>
                                            {hasUeTransmitter && <div className="lg:px-2 lg:py-3"><InputField label="UE Trans." unit="UE" value={m.ueTransmitter} onChange={(e:any) => handleChange(index, 'ueTransmitter', e.target.value)} /></div>}
                                            <div className="lg:px-2 lg:py-3"><InputField label="mA Trans." unit="mA" value={m.maTransmitter} onChange={(e:any) => handleChange(index, 'maTransmitter', e.target.value)} /></div>
                                            <div className="lg:px-2 lg:py-3"><InputField label="% Rango" unit="%" value={m.percentage} onChange={(e:any) => handleChange(index, 'percentage', e.target.value)} /></div>
                                            {hasUeTransmitter && <div className="lg:px-2 lg:py-3 lg:bg-red-50/20 border-l border-red-100/50"><InputField label="Err UE" unit="UE" value={m.errorUE} isError readOnly /></div>}
                                            <div className="lg:px-2 lg:py-3 lg:bg-red-50/20"><InputField label="Err mA" unit="mA" value={m.errormA} isError readOnly /></div>
                                            <div className="lg:px-2 lg:py-3 lg:bg-red-50/20"><InputField label="Err %" unit="%" value={m.errorPercentage} isError readOnly /></div>
                                        </>
                                    )}
                                    <div className="flex justify-center items-center py-2 lg:py-0">
                                        <DeleteBtn index={index} />
                                    </div>
                                </div>

                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TransmitterTable;