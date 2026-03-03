import React from 'react';

// --- INTERFACES ---
export interface Measurement {
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
    // Campos nuevos para la lógica de mV pura
    sensorType?: 'J' | 'K';
    idealmV?: string;
    sensormV?: string;
    errormV?: string;

    // Campos nuevos para la logica de tx pura
    idealTx?: string;
    mATX?: string;
    sensorTypeTx?: 'J' | 'K';
}

interface TransmitterTableProps {
    measurements: Measurement[];
    onMeasurementsChange: (measurements: Measurement[]) => void;
    outputUnit: 'mA' | 'ohm' | 'mv'| 'tx';
    setOutputUnit: (unit: 'mA' | 'ohm' | 'mv'| 'tx') => void;
    hasUeTransmitter: boolean;
    setHasUeTransmitter: (show: boolean) => void;
}

// --- SUB-COMPONENTE INPUT ---
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
    measurements, 
    onMeasurementsChange,
    outputUnit,
    setOutputUnit,
    hasUeTransmitter,
    setHasUeTransmitter
}) => {
    
    // --- LÓGICA DE CÁLCULO ---
    const calculateErrors = (m: Measurement) => {
        const idealUE = parseFloat(m.idealUE) || 0;
        const ueTrans = parseFloat(m.ueTransmitter) || 0;
        const idealmA = parseFloat(m.idealmA) || 0;
        const maTrans = parseFloat(m.maTransmitter) || 0;
        
        // Errores base
        const errorUE = ueTrans - idealUE;
        const errormA = maTrans - idealmA;
        const errorPercentage = (errormA / 16) * 100;

        // Errores específicos (RTD y mV Anterior)
        const errorOhm = (parseFloat(m.ohmTransmitter || "0") || 0) - (parseFloat(m.idealohm || "0") || 0);
        const errorMv = (parseFloat(m.mvTransmitter || "0") || 0) - (parseFloat(m.idealMv || "0") || 0);
        
        // Error mV para la nueva tabla pura
        const errorMvPuro = (parseFloat(m.sensormV || "0") || 0) - (parseFloat(m.idealmV || "0") || 0);

        return {
            ...m,
            errorUE: errorUE.toFixed(3),
            errormA: errormA.toFixed(3),
            errorPercentage: errorPercentage.toFixed(2),
            errorOhm: errorOhm.toFixed(3),
            errorMv: errorMv.toFixed(3),
            errormV: errorMvPuro.toFixed(3)
        };
    };

    const handleChange = (index: number, field: keyof Measurement, value: any) => {
        const newMeasurements = [...measurements];
        newMeasurements[index] = { ...newMeasurements[index], [field]: value };
        newMeasurements[index] = calculateErrors(newMeasurements[index]);
        onMeasurementsChange(newMeasurements);
    };

    // --- CONFIGURACIÓN DE SWITCH (Layouts) ---
    const getLayoutConfig = () => {
        switch (outputUnit) {
            case 'mv':
                return {
                    gridCols: 'lg:grid-cols-[1fr_1fr_140px_1fr_80px]', 
                    minWidth: 'lg:min-w-[850px]',
                    headers: ['mV ideal', 'mV sensor', 'Tipo sensor', 'Error mV', 'Acción']
                };
            case 'ohm':
                return {
                    gridCols: hasUeTransmitter ? 'lg:grid-cols-11' : 'lg:grid-cols-9',
                    minWidth: 'lg:min-w-[1300px]',
                    headers: ['Ideal UE', 'Ideal mA', 'Ideal Ohm', 'Patrón UE', ...(hasUeTransmitter ? ['UE Trans.'] : []), 'mA Sensor', 'Ohm Sensor', '% Rango', ...(hasUeTransmitter ? ['Err UE'] : []), 'Err Ohm', 'Acción']
                };
                case 'tx':
                return {
                    gridCols: 'lg:grid-cols-[1fr_1fr_140px_1fr_80px]', 
                    minWidth: 'lg:min-w-[850px]',
                    headers: ['ideal mA', 'mA TX', 'Acción']
                };
            default: // mA
                return {
                    gridCols: hasUeTransmitter ? 'lg:grid-cols-9' : 'lg:grid-cols-7',
                    minWidth: 'lg:min-w-[1000px]',
                    headers: ['Ideal UE', 'Ideal mA', 'Patrón UE', ...(hasUeTransmitter ? ['UE Trans.'] : []), 'mA Trans.', '% Rango', ...(hasUeTransmitter ? ['Err UE'] : []), 'Err %', 'Acción']
                };

        }
    };

    const config = getLayoutConfig();

    return (
        <div className="mt-8 w-full bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            {/* CABECERA */}
            <div className="bg-gradient-to-r from-teal-600 to-emerald-600 px-4 py-4 sm:px-6">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-lg font-bold text-white tracking-tight">Mediciones de transmisor</h3>
                        <div className="flex bg-black/20 p-1 rounded-lg border border-white/10">
                            {(['mA', 'ohm', 'mv', 'tx'] as const).map((unit) => (
                                <button 
                                    key={unit}
                                    type="button" 
                                    onClick={() => setOutputUnit(unit)} 
                                    className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${outputUnit === unit ? 'bg-white text-teal-700 shadow' : 'text-white hover:bg-white/10'}`}
                                >
                                    {unit === 'ohm' ? 'RTD' : unit === 'mv' ? 'mV' : unit === 'tx' ? 'TX' : 'mA'}
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
                    <button onClick={() => onMeasurementsChange([...measurements, { percentage: "", idealUE: "", patronUE: "", ueTransmitter: "", idealmA:"", idealohm: "", idealMv: "", maTransmitter: "", ohmTransmitter: "", mvTransmitter: "", errorUE: "", errormA: "", errorPercentage: "", errorOhm: "", errorMv: "", sensorType: 'J', idealmV: '', sensormV: '', errormV: '' }])} className="px-4 py-2 bg-white text-teal-700 font-bold rounded-lg shadow-md hover:bg-teal-50">Nueva fila</button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <div className={`min-w-full ${config.minWidth} inline-block align-middle`}>
                    
                    {/* HEADERS DINÁMICOS */}
                    <div className={`hidden lg:grid ${config.gridCols} bg-gray-50 border-b border-gray-200 text-[10px] font-bold text-gray-500 tracking-wider`}>
                        {config.headers.map((h, i) => (
                            <div key={i} className={`px-2 py-4 text-center ${h.includes('Err') || h.includes('Error') ? 'bg-red-50 text-red-700' : ''}`}>{h}</div>
                        ))}
                    </div>

                    {/* CUERPO - SWITCH DE RENDERIZADO */}
                    <div className="p-4 lg:p-0 space-y-4 lg:space-y-0 lg:divide-y lg:divide-gray-200 bg-gray-50 lg:bg-white">
                        {measurements.map((m, index) => (
                            <div key={index} className={`bg-white p-4 lg:p-0 lg:grid ${config.gridCols} lg:items-center hover:bg-teal-50/30 transition-colors`}>
                                
                                {outputUnit === 'mv' ? (
                                    /* --- VISTA MV PURA (NUEVA) --- */
                                    <>
                                        <div className="lg:px-4 lg:py-3"><InputField label="mV ideal" unit="mV" value={m.idealmV} onChange={(e:any) => handleChange(index, 'idealmV', e.target.value)} /></div>
                                        <div className="lg:px-4 lg:py-3"><InputField label="mV sensor" unit="mV" value={m.sensormV} onChange={(e:any) => handleChange(index, 'sensormV', e.target.value)} /></div>
                                        <div className="lg:px-4 lg:py-3 flex flex-col items-center justify-center">
                                            <div className="flex gap-3 bg-gray-100 p-1.5 rounded-lg border border-gray-200 shadow-sm">
                                                {['J', 'K'].map((type) => (
                                                    <label key={type} className="flex items-center gap-1 cursor-pointer group">
                                                        <input 
                                                            type="checkbox" 
                                                            checked={m.sensorType === type} 
                                                            onChange={() => handleChange(index, 'sensorType', type)} 
                                                            className="w-3.5 h-3.5 accent-orange-600" 
                                                        />
                                                        <span className={`text-xs font-bold ${m.sensorType === type ? 'text-orange-700' : 'text-gray-400'}`}>{type}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="lg:px-4 lg:py-3 lg:bg-red-50/20"><InputField label="Error mV" unit="mV" value={m.errormV} isError readOnly /></div>
                                    </>
                                ) : outputUnit === 'tx' ? (
                                    /* --- VISTA TX PURA (NUEVA) --- */
                                    <>
                                        <div className="lg:px-2 lg:py-3"><InputField label="Ideal mA" unit="mA" value={m.idealmA} onChange={(e:any) => handleChange(index, 'idealmA', e.target.value)} /></div>
                                        <div className="lg:px-2 lg:py-3"><InputField label="mA TX" unit="mA" value={m.maTransmitter} onChange={(e:any) => handleChange(index, 'maTransmitter', e.target.value)} /></div>
                                        <div className="lg:px-2 lg:py-3 flex flex-col items-center justify-center">
                                            <div className="flex gap-3 bg-gray-100 p-1.5 rounded-lg border border-gray-200 shadow-sm">
                                                {['J', 'K'].map((type) => (
                                                    <label key={type} className="flex items-center gap-1 cursor-pointer group">
                                                        <input
                                                            type="radio"
                                                            checked={m.sensorType === type} 
                                                            onChange={() => handleChange(index, 'sensorType', type)} 
                                                            className="w-3.5 h-3.5 accent-orange-600" 
                                                        />
                                                        <span className={`text-xs font-bold ${m.sensorType === type ? 'text-orange-700' : 'text-gray-400'}`}>{type}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="lg:px-4 lg:py-3 lg:bg-red-50/20"><InputField label="Error mV" unit="mV" value={m.errormV} isError readOnly /></div>
                                    </>
                                ): outputUnit === 'ohm' ? (
                                    /* --- VISTA RTD (OHM) --- */
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
                                    </>
                                ) : (
                                    /* --- VISTA mA (ESTÁNDAR) --- */
                                    <>
                                        <div className="lg:px-2 lg:py-3"><InputField label="Ideal UE" unit="UE" value={m.idealUE} onChange={(e:any) => handleChange(index, 'idealUE', e.target.value)} /></div>
                                        <div className="lg:px-2 lg:py-3"><InputField label="Ideal mA" unit="mA" value={m.idealmA} onChange={(e:any) => handleChange(index, 'idealmA', e.target.value)} /></div>
                                        <div className="lg:px-2 lg:py-3"><InputField label="Patrón UE" unit="UE" value={m.patronUE} onChange={(e:any) => handleChange(index, 'patronUE', e.target.value)} /></div>
                                        {hasUeTransmitter && <div className="lg:px-2 lg:py-3"><InputField label="UE Trans." unit="UE" value={m.ueTransmitter} onChange={(e:any) => handleChange(index, 'ueTransmitter', e.target.value)} /></div>}
                                        <div className="lg:px-2 lg:py-3"><InputField label="mA Trans." unit="mA" value={m.maTransmitter} onChange={(e:any) => handleChange(index, 'maTransmitter', e.target.value)} /></div>
                                        <div className="lg:px-2 lg:py-3"><InputField label="% Rango" unit="%" value={m.percentage} onChange={(e:any) => handleChange(index, 'percentage', e.target.value)} /></div>
                                        {hasUeTransmitter && <div className="lg:px-2 lg:py-3 lg:bg-red-50/20"><InputField label="Err UE" unit="UE" value={m.errorUE} isError readOnly /></div>}
                                        <div className="lg:px-2 lg:py-3 lg:bg-red-50/20"><InputField label="Err %" unit="%" value={m.errorPercentage} isError readOnly /></div>
                                    </>
                                )}

                                {/* BOTÓN ELIMINAR */}
                                <div className="flex justify-center items-center py-2 lg:py-0">
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