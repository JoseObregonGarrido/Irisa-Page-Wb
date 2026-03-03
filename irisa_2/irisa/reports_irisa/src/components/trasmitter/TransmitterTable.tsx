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
    sensorType?: 'J' | 'K';
    idealmV?: string;
    sensormV?: string;
    errormV?: string;
}

interface TransmitterTableProps {
    measurements: Measurement[];
    onMeasurementsChange: (measurements: Measurement[]) => void;
    outputUnit: 'mA' | 'ohm' | 'mv';
    setOutputUnit: (unit: 'mA' | 'ohm' | 'mv') => void;
    hasUeTransmitter: boolean;
    setHasUeTransmitter: (show: boolean) => void;
}

// --- SUB-COMPONENTE INPUT (MEJORADO PARA MÓVIL) ---
const InputField = ({ label, value, onChange, unit, isError = false, readOnly = false }: any) => (
    <div className="flex flex-col w-full">
        {/* Label visible solo en móvil para dar contexto a la "tarjeta" */}
        <label className="block text-[10px] font-bold text-gray-400 mb-1 lg:hidden uppercase tracking-wider">
            {label}
        </label>
        <div className="relative w-full">
            <input
                type="text"
                value={value}
                onChange={onChange}
                readOnly={readOnly}
                className={`w-full px-3 py-2.5 lg:py-2 pr-8 text-sm lg:text-xs border rounded-lg focus:outline-none focus:ring-2 transition-all
                    ${isError 
                        ? 'border-red-200 bg-red-50 focus:ring-red-500 font-bold text-red-700' 
                        : 'border-gray-300 bg-white focus:ring-teal-500 text-gray-700'
                    } ${readOnly ? 'bg-gray-50/50 cursor-not-allowed' : ''}`}
                placeholder="0.00"
            />
            <span className={`absolute right-2 top-3 lg:top-2.5 text-[10px] lg:text-[9px] font-bold ${isError ? 'text-red-400' : 'text-gray-400'}`}>
                {unit}
            </span>
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
    
    const calculateErrors = (m: Measurement) => {
        const idealUE = parseFloat(m.idealUE) || 0;
        const ueTrans = parseFloat(m.ueTransmitter) || 0;
        const idealmA = parseFloat(m.idealmA) || 0;
        const maTrans = parseFloat(m.maTransmitter) || 0;
        
        const errorUE = ueTrans - idealUE;
        const errormA = maTrans - idealmA;
        const errorPercentage = (errormA / 16) * 100;
        const errorOhm = (parseFloat(m.ohmTransmitter || "0") || 0) - (parseFloat(m.idealohm || "0") || 0);
        const errorMv = (parseFloat(m.mvTransmitter || "0") || 0) - (parseFloat(m.idealMv || "0") || 0);
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

    const getLayoutConfig = () => {
        switch (outputUnit) {
            case 'mv':
                return {
                    gridCols: 'lg:grid-cols-[1fr_1fr_120px_1fr_80px]', 
                    minWidth: 'w-full',
                    headers: ['mV ideal', 'mV sensor', 'Tipo sensor', 'Error mV', 'Acción']
                };
            case 'ohm':
                return {
                    gridCols: hasUeTransmitter ? 'lg:grid-cols-11' : 'lg:grid-cols-9',
                    minWidth: 'lg:min-w-[1200px]',
                    headers: ['Ideal UE', 'Ideal mA', 'Ideal Ohm', 'Patrón UE', ...(hasUeTransmitter ? ['UE Trans.'] : []), 'mA Sensor', 'Ohm Sensor', '% Rango', ...(hasUeTransmitter ? ['Err UE'] : []), 'Err Ohm', 'Acción']
                };
            default:
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
            {/* CABECERA PRINCIPAL */}
            <div className="bg-gradient-to-r from-teal-600 to-emerald-600 px-4 py-5 sm:px-6">
                <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-white tracking-tight italic">Mediciones</h3>
                        <button 
                            onClick={() => onMeasurementsChange([...measurements, { percentage: "", idealUE: "", patronUE: "", ueTransmitter: "", idealmA:"", idealohm: "", idealMv: "", maTransmitter: "", ohmTransmitter: "", mvTransmitter: "", errorUE: "", errormA: "", errorPercentage: "", errorOhm: "", errorMv: "", sensorType: 'J', idealmV: '', sensormV: '', errormV: '' }])}
                            className="px-3 py-1.5 bg-white text-teal-700 text-xs font-black rounded-lg shadow-md hover:bg-teal-50 uppercase"
                        >
                            + Fila
                        </button>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                        <div className="flex bg-black/20 p-1 rounded-lg border border-white/10">
                            {(['mA', 'ohm', 'mv'] as const).map((unit) => (
                                <button 
                                    key={unit}
                                    onClick={() => setOutputUnit(unit)} 
                                    className={`px-4 py-1.5 text-[10px] font-black rounded-md transition-all ${outputUnit === unit ? 'bg-white text-teal-700 shadow' : 'text-white hover:bg-white/10'}`}
                                >
                                    {unit.toUpperCase()}
                                </button>
                            ))}
                        </div>
                        {outputUnit !== 'mv' && (
                            <button
                                onClick={() => setHasUeTransmitter(!hasUeTransmitter)}
                                className={`px-3 py-1.5 rounded-lg border text-[10px] font-black transition-all ${hasUeTransmitter ? 'bg-white text-teal-700 shadow' : 'bg-white/10 border-white/20 text-white hover:bg-white/20'}`}
                            >
                                {hasUeTransmitter ? 'OCULTAR UE' : 'MOSTRAR UE'}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto">
                <div className={`w-full ${config.minWidth}`}>
                    
                    {/* HEADERS - OCULTOS EN MÓVIL */}
                    <div className={`hidden lg:grid ${config.gridCols} bg-gray-50 border-b border-gray-200 text-[10px] font-bold text-gray-500 uppercase tracking-widest`}>
                        {config.headers.map((h, i) => (
                            <div key={i} className={`px-2 py-4 text-center ${h.includes('Err') || h.includes('Error') ? 'bg-red-50 text-red-700 border-x border-red-100/50' : ''}`}>
                                {h}
                            </div>
                        ))}
                    </div>

                    {/* FILAS / CARDS */}
                    <div className="divide-y divide-gray-100">
                        {measurements.map((m, index) => (
                            <div key={index} className="relative group bg-white hover:bg-teal-50/20 transition-colors">
                                <div className={`grid grid-cols-2 gap-3 p-4 lg:p-0 lg:grid-cols-none lg:grid ${config.gridCols} lg:items-center`}>
                                    
                                    {outputUnit === 'mv' ? (
                                        <>
                                            <div className="lg:px-4 lg:py-3"><InputField label="mV ideal" unit="mV" value={m.idealmV} onChange={(e:any) => handleChange(index, 'idealmV', e.target.value)} /></div>
                                            <div className="lg:px-4 lg:py-3"><InputField label="mV sensor" unit="mV" value={m.sensormV} onChange={(e:any) => handleChange(index, 'sensormV', e.target.value)} /></div>
                                            <div className="col-span-2 lg:col-span-1 lg:px-2 lg:py-3 flex justify-center">
                                                <div className="flex gap-2 bg-gray-50 p-1 rounded-lg border border-gray-200 w-full lg:w-fit justify-center">
                                                    {['J', 'K'].map((type) => (
                                                        <button 
                                                            key={type}
                                                            onClick={() => handleChange(index, 'sensorType', type)}
                                                            className={`px-4 py-1 rounded-md text-xs font-black transition-all ${m.sensorType === type ? 'bg-orange-600 text-white shadow-sm' : 'text-gray-400 hover:bg-gray-200'}`}
                                                        >
                                                            {type}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="col-span-2 lg:col-span-1 lg:px-4 lg:py-3 lg:bg-red-50/30 h-full flex items-center">
                                                <InputField label="Error mV" unit="mV" value={m.errormV} isError readOnly />
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
                                            {hasUeTransmitter && <div className="col-span-2 lg:col-span-1 lg:px-2 lg:py-3 lg:bg-red-50/30"><InputField label="Err UE" unit="UE" value={m.errorUE} isError readOnly /></div>}
                                            <div className="col-span-2 lg:col-span-1 lg:px-2 lg:py-3 lg:bg-red-50/30"><InputField label="Err Ohm" unit="Ω" value={m.errorOhm} isError readOnly /></div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="lg:px-2 lg:py-3"><InputField label="Ideal UE" unit="UE" value={m.idealUE} onChange={(e:any) => handleChange(index, 'idealUE', e.target.value)} /></div>
                                            <div className="lg:px-2 lg:py-3"><InputField label="Ideal mA" unit="mA" value={m.idealmA} onChange={(e:any) => handleChange(index, 'idealmA', e.target.value)} /></div>
                                            <div className="lg:px-2 lg:py-3"><InputField label="Patrón UE" unit="UE" value={m.patronUE} onChange={(e:any) => handleChange(index, 'patronUE', e.target.value)} /></div>
                                            {hasUeTransmitter && <div className="lg:px-2 lg:py-3"><InputField label="UE Trans." unit="UE" value={m.ueTransmitter} onChange={(e:any) => handleChange(index, 'ueTransmitter', e.target.value)} /></div>}
                                            <div className="lg:px-2 lg:py-3"><InputField label="mA Trans." unit="mA" value={m.maTransmitter} onChange={(e:any) => handleChange(index, 'maTransmitter', e.target.value)} /></div>
                                            <div className="lg:px-2 lg:py-3"><InputField label="% Rango" unit="%" value={m.percentage} onChange={(e:any) => handleChange(index, 'percentage', e.target.value)} /></div>
                                            {hasUeTransmitter && <div className="col-span-2 lg:col-span-1 lg:px-2 lg:py-3 lg:bg-red-50/30"><InputField label="Err UE" unit="UE" value={m.errorUE} isError readOnly /></div>}
                                            <div className="col-span-2 lg:col-span-1 lg:px-2 lg:py-3 lg:bg-red-50/30"><InputField label="Err %" unit="%" value={m.errorPercentage} isError readOnly /></div>
                                        </>
                                    )}

                                    {/* BOTÓN ELIMINAR - POSICIONADO ESTRATÉGICAMENTE */}
                                    <div className="col-span-2 lg:col-span-1 flex justify-end lg:justify-center items-center pt-2 lg:pt-0">
                                        <button 
                                            onClick={() => onMeasurementsChange(measurements.filter((_, i) => i !== index))} 
                                            className="flex items-center gap-2 lg:block text-red-500 hover:bg-red-50 px-4 py-2 lg:p-2 rounded-lg transition-colors border border-red-100 lg:border-none"
                                        >
                                            <span className="lg:hidden text-[10px] font-bold uppercase">Eliminar medición</span>
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
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