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

// Estructura para separar las mediciones por unidad
interface IndependentMeasurements {
    mA: Measurement[];
    ohm: Measurement[];
    mv: Measurement[];
}

interface TransmitterTableProps {
    allMeasurements: IndependentMeasurements;
    onAllMeasurementsChange: (measurements: IndependentMeasurements) => void;
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
    allMeasurements, 
    onAllMeasurementsChange,
    outputUnit,
    setOutputUnit,
    hasUeTransmitter,
    setHasUeTransmitter
}) => {
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Obtener mediciones actuales según la pestaña activa
    const currentMeasurements = allMeasurements[outputUnit] || [];

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // --- LÓGICA DE CÁLCULOS REINTEGRADA ---
    const calculateErrors = (m: Measurement) => {
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
        const newCurrent = [...currentMeasurements];
        let updatedRow = { ...newCurrent[index], [field]: value };
        
        // Aplicamos el cálculo antes de guardar
        newCurrent[index] = calculateErrors(updatedRow);
        
        onAllMeasurementsChange({
            ...allMeasurements,
            [outputUnit]: newCurrent
        });
    };

    const addNewRow = (rowType?: 'mv' | 'tx') => {
        const newRow: Measurement = { 
            rowType,
            percentage: "", idealUE: "", patronUE: "", ueTransmitter: "", idealmA:"", 
            idealohm: "", idealMv: "", maTransmitter: "", ohmTransmitter: "", mvTransmitter: "", 
            errorUE: "", errormA: "", errorPercentage: "", errorOhm: "", errorMv: "", 
            sensorType: 'J', idealmV: '', sensormV: '', errormV: '', mATX: ''
        };

        onAllMeasurementsChange({
            ...allMeasurements,
            [outputUnit]: [...currentMeasurements, newRow]
        });
        setShowDropdown(false);
    };

    const deleteRow = (index: number) => {
        onAllMeasurementsChange({
            ...allMeasurements,
            [outputUnit]: currentMeasurements.filter((_, i) => i !== index)
        });
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

    return (
        <div className="mt-8 w-full bg-white rounded-xl shadow-lg border border-gray-200">
            {/* CABECERA CON SELECTOR DE UNIDADES */}
            <div className="bg-gradient-to-r from-teal-600 to-emerald-600 px-4 py-4 sm:px-6">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-lg font-bold text-white tracking-tight">Mediciones</h3>
                        <div className="flex bg-black/20 p-1 rounded-lg border border-white/10">
                            {(['mA', 'ohm', 'mv'] as const).map((unit) => (
                                <button 
                                    key={unit}
                                    type="button" 
                                    onClick={() => setOutputUnit(unit)} 
                                    className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${outputUnit === unit ? 'bg-white text-teal-700 shadow' : 'text-white hover:bg-white/10'}`}
                                >
                                    {unit === 'ohm' ? 'RTD' : unit === 'mv' ? 'mV' : 'mA'}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="relative" ref={dropdownRef}>
                        <button 
                            onClick={handleNuevaFila}
                            className="px-4 py-2 bg-white text-teal-700 font-bold rounded-lg shadow-md hover:bg-teal-50 flex items-center gap-2 transition-transform active:scale-95"
                        >
                            Nueva fila ({outputUnit.toUpperCase()})
                        </button>
                        {showDropdown && outputUnit === 'mv' && (
                            <div className="absolute right-0 mt-2 w-24 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
                                <button onClick={() => addNewRow('mv')} className="w-full flex items-center justify-center px-4 py-3 hover:bg-orange-50 text-sm font-black text-orange-700 group-hover:text-orange-900 transition-colors">mV</button>
                                <button onClick={() => addNewRow('tx')} className="w-full flex items-center justify-center px-4 py-3 hover:bg-blue-50 text-sm font-black text-blue-700 group-hover:text-blue-900 border-t border-gray-100 transition-colors">TX</button>
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
                            <div key={i} className={`px-2 py-4 text-center ${h.includes('Err') ? 'bg-red-50 text-red-700 border-x border-red-100/30' : ''}`}>
                                {h}
                            </div>
                        ))}
                    </div>

                    {/* CUERPO INDEPENDIENTE */}
                    <div className="divide-y divide-gray-200 bg-white">
                        {currentMeasurements.map((m, index) => (
                            <div key={index} className={`hidden lg:grid ${config.gridCols} items-center hover:bg-teal-50/30 transition-colors`}>
                                {outputUnit === 'mv' ? (
                                    <>
                                        <div className="px-2 py-3 flex justify-center"><span className="text-[9px] font-black uppercase px-2 py-1 rounded-full border bg-orange-100 text-orange-700">{m.rowType}</span></div>
                                        <div className="px-2 py-3"><InputField unit={m.rowType === 'tx' ? 'mA' : 'mV'} value={m.rowType === 'tx' ? m.idealmA : m.idealmV} onChange={(e:any) => handleChange(index, m.rowType === 'tx' ? 'idealmA' : 'idealmV', e.target.value)} /></div>
                                        <div className="px-2 py-3"><InputField unit={m.rowType === 'tx' ? 'mA' : 'mV'} value={m.rowType === 'tx' ? m.mATX : m.sensormV} onChange={(e:any) => handleChange(index, m.rowType === 'tx' ? 'mATX' : 'sensormV', e.target.value)} /></div>
                                        <div className="px-2 py-3 flex justify-center">
                                            <div className="flex gap-2 bg-gray-100 p-1 rounded-md">
                                                {['J', 'K'].map(t => (
                                                    <button key={t} onClick={() => handleChange(index, 'sensorType', t)} className={`px-2 py-1 text-[10px] font-bold rounded ${m.sensorType === t ? 'bg-orange-500 text-white' : 'text-gray-400'}`}>{t}</button>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="px-2 py-3 bg-red-50/20"><InputField value={m.rowType === 'tx' ? m.errormA : m.errormV} isError readOnly unit={m.rowType === 'tx' ? 'mA' : 'mV'} /></div>
                                    </>
                                ) : (
                                    <>
                                        <div className="px-2 py-3"><InputField unit="UE" value={m.idealUE} onChange={(e:any) => handleChange(index, 'idealUE', e.target.value)} /></div>
                                        <div className="px-2 py-3"><InputField unit="mA" value={m.idealmA} onChange={(e:any) => handleChange(index, 'idealmA', e.target.value)} /></div>
                                        {outputUnit === 'ohm' && <div className="px-2 py-3"><InputField unit="Ω" value={m.idealohm} onChange={(e:any) => handleChange(index, 'idealohm', e.target.value)} /></div>}
                                        <div className="px-2 py-3"><InputField unit="UE" value={m.patronUE} onChange={(e:any) => handleChange(index, 'patronUE', e.target.value)} /></div>
                                        {hasUeTransmitter && <div className="px-2 py-3"><InputField unit="UE" value={m.ueTransmitter} onChange={(e:any) => handleChange(index, 'ueTransmitter', e.target.value)} /></div>}
                                        <div className="px-2 py-3"><InputField unit="mA" value={m.maTransmitter} onChange={(e:any) => handleChange(index, 'maTransmitter', e.target.value)} /></div>
                                        {outputUnit === 'ohm' && <div className="px-2 py-3"><InputField unit="Ω" value={m.ohmTransmitter} onChange={(e:any) => handleChange(index, 'ohmTransmitter', e.target.value)} /></div>}
                                        <div className="px-2 py-3"><InputField unit="%" value={m.percentage} onChange={(e:any) => handleChange(index, 'percentage', e.target.value)} /></div>
                                        {hasUeTransmitter && <div className="px-2 py-3 bg-red-50/20"><InputField value={m.errorUE} isError readOnly unit="UE" /></div>}
                                        {outputUnit === 'ohm' && <div className="px-2 py-3 bg-red-50/20"><InputField value={m.errorOhm} isError readOnly unit="Ω" /></div>}
                                        <div className="px-2 py-3 bg-red-50/20"><InputField value={m.errormA} isError readOnly unit="mA" /></div>
                                        <div className="px-2 py-3 bg-red-50/20"><InputField value={m.errorPercentage} isError readOnly unit="%" /></div>
                                    </>
                                )}
                                <div className="px-2 py-3 flex justify-center"><button onClick={() => deleteRow(index)} className="text-red-500 hover:bg-red-50 p-1 rounded-full"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TransmitterTable;