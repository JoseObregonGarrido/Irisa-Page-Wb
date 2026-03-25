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
    
    // Seleccion dinamica de datos segun el modo activo
    const measurements = outputUnit === 'mA'  ? measurementsMA
                       : outputUnit === 'ohm' ? measurementsOhm
                       : measurementsMV;

    const onMeasurementsChange = outputUnit === 'mA'  ? onMeasurementsMAChange
                               : outputUnit === 'ohm' ? onMeasurementsOhmChange
                               : onMeasurementsMVChange;

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
        const formatWithSign = (value: number, decimals: number) => {
            if (isNaN(value)) return "0.000";
            const sign = value > 0 ? "+" : "";
            return `${sign}${value.toFixed(decimals)}`;
        };

        const p = (val: any) => {
            const parsed = parseFloat(val);
            return isNaN(parsed) ? null : parsed;
        };

        // Lógica para modo mV (Termocuplas)
        if (outputUnit === 'mv') {
            if (m.rowType === 'tx') {
                const ideal = p(m.idealmA);
                const real = p(m.mATX);
                const error = (real !== null && ideal !== null) ? real - ideal : 0;
                return { ...m, errormA: formatWithSign(error, 3) };
            }
            if (m.rowType === 'mv') {
                const ideal = p(m.idealmV);
                const real = p(m.sensormV);
                const error = (real !== null && ideal !== null) ? real - ideal : 0;
                return { ...m, errormV: formatWithSign(error, 3) };
            }
        }

        // Lógica para modos estándar (mA y Ohm)
        const idealUE = p(m.idealUE);
        const ueTrans = p(m.ueTransmitter);
        const idealmA = p(m.idealmA);
        const maTrans = p(m.maTransmitter);
        const idealOhm = p(m.idealohm);
        const ohmTrans = p(m.ohmTransmitter);

        const errorUE = (ueTrans !== null && idealUE !== null) ? ueTrans - idealUE : 0;
        const errormA = (maTrans !== null && idealmA !== null) ? maTrans - idealmA : 0;
        const errorPercentage = (errormA / 16) * 100;
        const errorOhm = (ohmTrans !== null && idealOhm !== null) ? ohmTrans - idealOhm : 0;

        return {
            ...m,
            errorUE: formatWithSign(errorUE, 3),
            errormA: formatWithSign(errormA, 3),
            errorPercentage: formatWithSign(errorPercentage, 2),
            errorOhm: formatWithSign(errorOhm, 3)
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
            rowType: rowType || (outputUnit === 'mv' ? 'mv' : undefined),
            percentage: "", idealUE: "", patronUE: "", ueTransmitter: "", idealmA:"", 
            idealohm: "", idealMv: "", maTransmitter: "", ohmTransmitter: "", mvTransmitter: "", 
            errorUE: "", errormA: "", errorPercentage: "", errorOhm: "", errorMv: "", 
            sensorType: 'J', idealmV: '', sensormV: '', errormV: '', mATX: ''
        }]);
        setShowDropdown(false);
    };

    const getLayoutConfig = () => {
        switch (outputUnit) {
            case 'mv':
                return {
                    gridCols: 'lg:grid-cols-[80px_1fr_1fr_140px_1fr_80px]', 
                    minWidth: 'lg:min-w-[950px]',
                    headers: ['Tipo', 'Ideal (mV/mA)', 'Medido (mV/mA)', 'Sensor', 'Error', 'Accion']
                };
            case 'ohm':
                return {
                    gridCols: hasUeTransmitter ? 'lg:grid-cols-[repeat(13,minmax(0,1fr))]' : 'lg:grid-cols-[repeat(11,minmax(0,1fr))]',
                    minWidth: 'lg:min-w-[1400px]',
                    headers: ['Ideal UE', 'Ideal mA', 'Ideal Ohm', 'Patron UE', ...(hasUeTransmitter ? ['UE Trans.'] : []), 'mA Sensor', 'Ohm Sensor', '% Rango', ...(hasUeTransmitter ? ['Err UE'] : []), 'Err Ohm', 'Err mA', 'Err %', 'Accion']
                };
            default:
                return {
                    gridCols: hasUeTransmitter ? 'lg:grid-cols-[repeat(10,minmax(0,1fr))]' : 'lg:grid-cols-[repeat(8,minmax(0,1fr))]',
                    minWidth: 'lg:min-w-[1100px]',
                    headers: ['Ideal UE', 'Ideal mA', 'Patron UE', ...(hasUeTransmitter ? ['UE Trans.'] : []), 'mA Trans.', '% Rango', ...(hasUeTransmitter ? ['Err UE'] : []), 'Err mA', 'Err %', 'Accion']
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

    return (
        <div className="mt-8 w-full bg-white rounded-xl shadow-lg border border-gray-200">
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
                            onClick={() => outputUnit === 'mv' ? setShowDropdown(!showDropdown) : addNewRow()}
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
                                <button onClick={() => addNewRow('mv')} className="w-full px-4 py-3 hover:bg-orange-50 text-sm font-black text-orange-700">mV</button>
                                <button onClick={() => addNewRow('tx')} className="w-full px-4 py-3 hover:bg-blue-50 text-sm font-black text-blue-700 border-t border-gray-100">TX</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto">
                <div className={`w-full ${config.minWidth}`}>
                    {/* HEADERS */}
                    <div className={`hidden lg:grid ${config.gridCols} bg-gray-50 border-b border-gray-200 text-[10px] font-bold text-gray-500 tracking-wider`}>
                        {config.headers.map((h, i) => (
                            <div key={i} className={`px-2 py-4 text-center ${h.includes('Err') ? 'bg-red-50 text-red-700' : ''}`}>
                                {h}
                            </div>
                        ))}
                    </div>

                    {/* CUERPO */}
                    <div className="divide-y divide-gray-200 bg-white">
                        {measurements.map((m, index) => (
                            <div key={index} className={`hidden lg:grid ${config.gridCols} items-center hover:bg-teal-50/30 transition-colors`}>
                                {outputUnit === 'mv' ? (
                                    <>
                                        <div className="px-2 py-3 flex justify-center"><RowTypeBadge type={m.rowType ?? 'mv'} /></div>
                                        <div className="px-4 py-3">
                                            <InputField unit={m.rowType === 'tx' ? 'mA' : 'mV'} value={m.rowType === 'tx' ? m.idealmA : m.idealmV} onChange={(e:any) => handleChange(index, m.rowType === 'tx' ? 'idealmA' : 'idealmV', e.target.value)} />
                                        </div>
                                        <div className="px-4 py-3">
                                            <InputField unit={m.rowType === 'tx' ? 'mA' : 'mV'} value={m.rowType === 'tx' ? m.mATX : m.sensormV} onChange={(e:any) => handleChange(index, m.rowType === 'tx' ? 'mATX' : 'sensormV', e.target.value)} />
                                        </div>
                                        <div className="px-4 py-3 flex justify-center">
                                            <div className="flex gap-3 bg-gray-100 p-1.5 rounded-lg border border-gray-200">
                                                {['J', 'K'].map((type) => (
                                                    <label key={type} className="flex items-center gap-1 cursor-pointer">
                                                        <input type="radio" checked={m.sensorType === type} onChange={() => handleChange(index, 'sensorType', type as any)} className="w-3.5 h-3.5 accent-orange-600" />
                                                        <span className={`text-xs font-bold ${m.sensorType === type ? 'text-orange-700' : 'text-gray-400'}`}>{type}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="px-4 py-3 bg-red-50/20">
                                            <InputField unit={m.rowType === 'tx' ? 'mA' : 'mV'} value={m.rowType === 'tx' ? m.errormA : m.errormV} isError readOnly />
                                        </div>
                                    </>
                                ) : outputUnit === 'ohm' ? (
                                    <>
                                        <div className="px-1 py-3"><InputField unit="UE" value={m.idealUE} onChange={(e:any) => handleChange(index, 'idealUE', e.target.value)} /></div>
                                        <div className="px-1 py-3"><InputField unit="mA" value={m.idealmA} onChange={(e:any) => handleChange(index, 'idealmA', e.target.value)} /></div>
                                        <div className="px-1 py-3"><InputField unit="Ω" value={m.idealohm} onChange={(e:any) => handleChange(index, 'idealohm', e.target.value)} /></div>
                                        <div className="px-1 py-3"><InputField unit="UE" value={m.patronUE} onChange={(e:any) => handleChange(index, 'patronUE', e.target.value)} /></div>
                                        {hasUeTransmitter && <div className="px-1 py-3"><InputField unit="UE" value={m.ueTransmitter} onChange={(e:any) => handleChange(index, 'ueTransmitter', e.target.value)} /></div>}
                                        <div className="px-1 py-3"><InputField unit="mA" value={m.maTransmitter} onChange={(e:any) => handleChange(index, 'maTransmitter', e.target.value)} /></div>
                                        <div className="px-1 py-3"><InputField unit="Ω" value={m.ohmTransmitter} onChange={(e:any) => handleChange(index, 'ohmTransmitter', e.target.value)} /></div>
                                        <div className="px-1 py-3"><InputField unit="%" value={m.percentage} onChange={(e:any) => handleChange(index, 'percentage', e.target.value)} /></div>
                                        {hasUeTransmitter && <div className="px-1 py-3 bg-red-50/20"><InputField unit="UE" value={m.errorUE} isError readOnly /></div>}
                                        <div className="px-1 py-3 bg-red-50/20"><InputField unit="Ω" value={m.errorOhm} isError readOnly /></div>
                                        <div className="px-1 py-3 bg-red-50/20"><InputField unit="mA" value={m.errormA} isError readOnly /></div>
                                        <div className="px-1 py-3 bg-red-50/20"><InputField unit="%" value={m.errorPercentage} isError readOnly /></div>
                                    </>
                                ) : (
                                    <>
                                        <div className="px-2 py-3"><InputField unit="UE" value={m.idealUE} onChange={(e:any) => handleChange(index, 'idealUE', e.target.value)} /></div>
                                        <div className="px-2 py-3"><InputField unit="mA" value={m.idealmA} onChange={(e:any) => handleChange(index, 'idealmA', e.target.value)} /></div>
                                        <div className="px-2 py-3"><InputField unit="UE" value={m.patronUE} onChange={(e:any) => handleChange(index, 'patronUE', e.target.value)} /></div>
                                        {hasUeTransmitter && <div className="px-2 py-3"><InputField unit="UE" value={m.ueTransmitter} onChange={(e:any) => handleChange(index, 'ueTransmitter', e.target.value)} /></div>}
                                        <div className="px-2 py-3"><InputField unit="mA" value={m.maTransmitter} onChange={(e:any) => handleChange(index, 'maTransmitter', e.target.value)} /></div>
                                        <div className="px-2 py-3"><InputField unit="%" value={m.percentage} onChange={(e:any) => handleChange(index, 'percentage', e.target.value)} /></div>
                                        {hasUeTransmitter && <div className="px-2 py-3 bg-red-50/20"><InputField unit="UE" value={m.errorUE} isError readOnly /></div>}
                                        <div className="px-2 py-3 bg-red-50/20"><InputField unit="mA" value={m.errormA} isError readOnly /></div>
                                        <div className="px-2 py-3 bg-red-50/20"><InputField unit="%" value={m.errorPercentage} isError readOnly /></div>
                                    </>
                                )}
                                <div className="flex justify-center">
                                    <button onClick={() => onMeasurementsChange(measurements.filter((_, i) => i !== index))} className="text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </button>
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