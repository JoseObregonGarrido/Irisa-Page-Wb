import React, { useState, useRef, useEffect } from 'react';

// --- INTERFACES ---
export interface Measurement {
    rowType?: 'mv' | 'tx';
    percentage: string;
    idealUE: string;
    patronUE: string;
    patronMA?: string; 
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

    // --- LOGICA DE CALCULO CORREGIDA ---
    const calculateErrors = (m: Measurement, allMeasurements: Measurement[]) => {
        const formatWithSign = (value: number, decimals: number) => {
            if (isNaN(value)) return "0.000";
            const sign = value > 0 ? "+" : "";
            return `${sign}${value.toFixed(decimals)}`;
        };

        const p = (val: any) => {
            const parsed = parseFloat(val);
            return isNaN(parsed) ? null : parsed;
        };

        // 1. Extraemos los valores de Ideal UE para determinar el rango del instrumento
        const valuesUE = allMeasurements
            .map(item => p(item.idealUE))
            .filter((v): v is number => v !== null);

        // 2. Definimos limites estables. Si no hay datos, usamos 0-100 para no romper el calculo.
        const minUE = valuesUE.length > 0 ? Math.min(...valuesUE) : 0;
        const maxUE = valuesUE.length > 0 ? Math.max(...valuesUE) : 100;
        
        // Evitamos division por cero si min y max son iguales
        const spanUE = maxUE === minUE ? 100 : (maxUE - minUE);

        // 3. Calculo de mA Patron (Independiente)
        const currentPatronUE = p(m.patronUE);
        let calculatedPatronMA = "";
        if (currentPatronUE !== null) {
            const ratioPatron = (currentPatronUE - minUE) / spanUE;
            calculatedPatronMA = (4 + (ratioPatron * 16)).toFixed(3);
        }

        // 4. Calculo de Ideal mA y % Rango
        const currentIdealUE = p(m.idealUE);
        let calculatedIdealMA = m.idealmA;
        let calculatedPercentage = m.percentage;

        if (currentIdealUE !== null) {
            const ratio = (currentIdealUE - minUE) / spanUE;
            calculatedIdealMA = (4 + (ratio * 16)).toFixed(3);
            calculatedPercentage = (ratio * 100).toFixed(0);
        }

        // 5. Manejo de filas especiales (mV / TX)
        if (m.rowType === 'tx') {
            const ideal = p(calculatedIdealMA);
            const real = p(m.mATX);
            const error = (real !== null && ideal !== null) ? real - ideal : 0;
            return { ...m, idealmA: calculatedIdealMA, percentage: calculatedPercentage, errormA: formatWithSign(error, 3) };
        }

        // 6. Calculos de error contra Patron
        const maTrans = p(m.maTransmitter);
        const pMA = p(calculatedPatronMA); 
        const ueTrans = p(m.ueTransmitter);
        const pUE = p(m.patronUE);
        const idealOhm = p(m.idealohm);
        const ohmTrans = p(m.ohmTransmitter);

        const errormA_val = (maTrans !== null && pMA !== null) ? maTrans - pMA : 0;
        const errorUE_val = (ueTrans !== null && pUE !== null) ? ueTrans - pUE : 0;
        const errorOhm_val = (ohmTrans !== null && idealOhm !== null) ? ohmTrans - idealOhm : 0;
        const errorPercentage = (errormA_val / 16) * 100;

        return {
            ...m,
            idealmA: calculatedIdealMA,
            patronMA: calculatedPatronMA,
            percentage: calculatedPercentage,
            errorUE: formatWithSign(errorUE_val, 3),
            errormA: formatWithSign(errormA_val, 3),
            errorPercentage: formatWithSign(errorPercentage, 2),
            errorOhm: formatWithSign(errorOhm_val, 3)
        };
    };

    const handleChange = (index: number, field: keyof Measurement, value: any) => {
        const newMeasurements = [...measurements];
        newMeasurements[index] = { ...newMeasurements[index], [field]: value };
        
        // Recalculamos toda la tabla para asegurar consistencia de rango
        const updatedMeasurements = newMeasurements.map(item => calculateErrors(item, newMeasurements));
        onMeasurementsChange(updatedMeasurements);
    };

    const addNewRow = (rowType?: 'mv' | 'tx') => {
        onMeasurementsChange([...measurements, { 
            rowType,
            percentage: "", idealUE: "", patronUE: "", patronMA: "", ueTransmitter: "", idealmA:"", 
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
                    gridCols: hasUeTransmitter ? 'lg:grid-cols-[repeat(14,minmax(0,1fr))]' : 'lg:grid-cols-[repeat(12,minmax(0,1fr))]',
                    minWidth: 'lg:min-w-[1500px]',
                    headers: ['Ideal UE', 'Ideal mA', 'Ideal Ohm', 'Patrón UE', 'mA Patrón', ...(hasUeTransmitter ? ['UE Trans.'] : []), 'mA Sensor', 'Ohm Sensor', '% Rango', ...(hasUeTransmitter ? ['Err UE'] : []), 'Err Ohm', 'Err mA', 'Err %', 'Acción']
                };
            default:
                return {
                    gridCols: hasUeTransmitter ? 'lg:grid-cols-[repeat(11,minmax(0,1fr))]' : 'lg:grid-cols-[repeat(9,minmax(0,1fr))]',
                    minWidth: 'lg:min-w-[1200px]',
                    headers: ['Ideal UE', 'Ideal mA', 'Patrón UE', 'mA Patrón', ...(hasUeTransmitter ? ['UE Trans.'] : []), 'mA Trans.', '% Rango', ...(hasUeTransmitter ? ['Err UE'] : []), 'Err mA', 'Err %', 'Acción']
                };
        }
    };

    const config = getLayoutConfig();

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
                            onClick={handleNuevaFila}
                            className="px-4 py-2 bg-white text-teal-700 font-bold rounded-lg shadow-md hover:bg-teal-50 flex items-center gap-2 transition-transform active:scale-95"
                        >
                            Nueva fila
                        </button>
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto">
                <div className={`w-full ${config.minWidth}`}>
                    <div className={`hidden lg:grid ${config.gridCols} bg-gray-50 border-b border-gray-200 text-[10px] font-bold text-gray-500 tracking-wider`}>
                        {config.headers.map((h, i) => (
                            <div key={i} className={`px-2 py-4 text-center ${h.includes('Err') ? 'bg-red-50 text-red-700 border-x border-red-100/30' : ''}`}>
                                {h}
                            </div>
                        ))}
                    </div>

                    <div className="divide-y divide-gray-200 bg-white">
                        {measurements.map((m, index) => (
                            <div key={index} className={`hidden lg:grid ${config.gridCols} lg:items-center hover:bg-teal-50/30 transition-colors`}>
                                {outputUnit === 'mA' && (
                                    <>
                                        <div className="lg:px-2 lg:py-3"><InputField label="Ideal UE" unit="UE" value={m.idealUE} onChange={(e:any) => handleChange(index, 'idealUE', e.target.value)} /></div>
                                        <div className="lg:px-2 lg:py-3"><InputField label="Ideal mA" unit="mA" value={m.idealmA} readOnly /></div>
                                        <div className="lg:px-2 lg:py-3"><InputField label="Patrón UE" unit="UE" value={m.patronUE} onChange={(e:any) => handleChange(index, 'patronUE', e.target.value)} /></div>
                                        <div className="lg:px-2 lg:py-3"><InputField label="mA Patrón" unit="mA" value={m.patronMA} readOnly /></div>
                                        {hasUeTransmitter && <div className="lg:px-2 lg:py-3"><InputField label="UE Trans." unit="UE" value={m.ueTransmitter} onChange={(e:any) => handleChange(index, 'ueTransmitter', e.target.value)} /></div>}
                                        <div className="lg:px-2 lg:py-3"><InputField label="mA Trans." unit="mA" value={m.maTransmitter} onChange={(e:any) => handleChange(index, 'maTransmitter', e.target.value)} /></div>
                                        <div className="lg:px-2 lg:py-3"><InputField label="% Rango" unit="%" value={m.percentage} readOnly /></div>
                                        {hasUeTransmitter && <div className="lg:px-2 lg:py-3 lg:bg-red-50/20"><InputField label="Err UE" unit="UE" value={m.errorUE} isError readOnly /></div>}
                                        <div className="lg:px-2 lg:py-3 lg:bg-red-50/20"><InputField label="Err mA" unit="mA" value={m.errormA} isError readOnly /></div>
                                        <div className="lg:px-2 lg:py-3 lg:bg-red-50/20"><InputField label="Err %" unit="%" value={m.errorPercentage} isError readOnly /></div>
                                        <div className="flex justify-center items-center py-2 lg:py-0">
                                            <button onClick={() => onMeasurementsChange(measurements.filter((_, i) => i !== index))} className="text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                            </button>
                                        </div>
                                    </>
                                )}
                                {/* ... (Secciones similares para Ohm y mV siguiendo la misma estructura de inputs) */}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TransmitterTable;