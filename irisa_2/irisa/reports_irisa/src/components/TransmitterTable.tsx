import React from 'react';

export interface Measurement {
    percentage: string;
    idealUE: string;
    patronUE: string;
    ueTransmitter: string;
    idealmA: string;
    idealohm?: string; 
    maTransmitter: string; 
    ohmTransmitter?: string; 
    errorUE: string;
    errormA: string;
    errorPercentage: string;
    errorOhm?: string;
}

interface TransmitterTableProps {
    measurements: Measurement[];
    onMeasurementsChange: (measurements: Measurement[]) => void;
    outputUnit: 'mA' | 'ohm';
    setOutputUnit: (unit: 'mA' | 'ohm') => void;
    hasUeTransmitter: boolean;
    setHasUeTransmitter: (show: boolean) => void;
}

// INPUT RESIZABLE: Con margen extra para que no quede apretado
const InputField = ({ label, value, onChange, unit, isError = false, readOnly = false }: any) => {
    // Calculamos el ancho basado en caracteres. 
    // Usamos un mínimo de 6 para el placeholder y sumamos 5 de padding/margen.
    const inputWidth = Math.max(value.toString().length, 6) + 5;

    return (
        <div className="flex flex-col min-w-fit group">
            <label className="block text-[9px] font-black text-gray-400 uppercase mb-1 tracking-wider whitespace-nowrap group-focus-within:text-teal-600 transition-colors">
                {label}
            </label>
            <div className="relative inline-flex items-center">
                <input
                    type="text"
                    value={value}
                    onChange={onChange}
                    readOnly={readOnly}
                    style={{ width: `${inputWidth}ch` }} 
                    className={`px-3 py-2 pr-8 text-xs border rounded-lg focus:outline-none focus:ring-2 transition-all
                        ${isError 
                            ? 'border-red-200 bg-red-50 focus:ring-red-500 font-bold text-red-700' 
                            : 'border-gray-300 bg-white focus:ring-teal-500 text-gray-700 hover:border-gray-400'
                        } ${readOnly ? 'bg-gray-50 cursor-not-allowed opacity-80' : 'shadow-sm'}`}
                    placeholder="0.00"
                />
                <span className={`absolute right-2 text-[9px] font-bold pointer-events-none ${isError ? 'text-red-400' : 'text-gray-400'}`}>
                    {unit}
                </span>
            </div>
        </div>
    );
};

const TransmitterTable: React.FC<TransmitterTableProps> = ({ 
    measurements, 
    onMeasurementsChange,
    outputUnit,
    setOutputUnit,
    hasUeTransmitter,
    setHasUeTransmitter
}) => {
    
    const isOhm = outputUnit === 'ohm';
    
    let colsCount = 8; 
    if (hasUeTransmitter) colsCount += 2; 
    if (isOhm) colsCount += 3;

    const gridCols = {
        8: 'lg:grid-cols-8',
        9: 'lg:grid-cols-9',
        10: 'lg:grid-cols-10',
        11: 'lg:grid-cols-11',
        12: 'lg:grid-cols-12',
        13: 'lg:grid-cols-[repeat(13,minmax(0,1fr))]',
    }[colsCount] || 'lg:grid-cols-12';

    const desktopMinWidth = isOhm ? 'lg:min-w-[1450px]' : 'lg:min-w-[1000px]';

    const calculateErrors = (measurement: Measurement) => {
        const idealUEValue = parseFloat(measurement.idealUE) || 0;
        const ueTransmitterValue = parseFloat(measurement.ueTransmitter) || 0;
        const idealVal = parseFloat(measurement.idealmA) || 0;
        const measuredVal = parseFloat(measurement.maTransmitter) || 0;
        const idealOhmVal = parseFloat(measurement.idealohm || "0") || 0;
        const sensorOhmVal = parseFloat(measurement.ohmTransmitter || "0") || 0;
        const errorOhmValue = sensorOhmVal - idealOhmVal;

        const errorUEValue = ueTransmitterValue - idealUEValue; 
        const errorVal = measuredVal - idealVal; 
        const divisor = 16; 
        const errorPercentage = (errorVal / divisor) * 100; 
        
        return {
            ...measurement,
            errorUE: errorUEValue.toFixed(3),
            errormA: errorVal.toFixed(3),
            errorPercentage: errorPercentage.toFixed(2),
            errorOhm: errorOhmValue.toFixed(3)
        };
    };

    const handleChange = (index: number, field: keyof Measurement, value: string) => {
        const newMeasurements = [...measurements];
        newMeasurements[index] = { ...newMeasurements[index], [field]: value };
        const relevantFields: (keyof Measurement)[] = ["idealUE", "patronUE", "ueTransmitter", "idealmA", "maTransmitter", "idealohm", "ohmTransmitter"];
        if (relevantFields.includes(field)) {
            newMeasurements[index] = calculateErrors(newMeasurements[index]);
        }
        onMeasurementsChange(newMeasurements);
    };

    return (
        <div className="mt-8 w-full bg-transparent lg:bg-white rounded-xl lg:shadow-lg lg:border border-gray-200 overflow-hidden">
            {/* Header / Toolbar */}
            <div className="bg-gradient-to-r from-teal-600 to-emerald-600 px-4 py-4 sm:px-6 rounded-t-xl lg:rounded-none">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-lg font-bold text-white tracking-tight">Mediciones de transmisor</h3>
                        <div className="flex bg-black/20 p-1 rounded-lg border border-white/10">
                            <button type="button" onClick={() => setOutputUnit('mA')} className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${outputUnit === 'mA' ? 'bg-white text-teal-700 shadow' : 'text-white hover:bg-white/10'}`}>mA</button>
                            <button type="button" onClick={() => setOutputUnit('ohm')} className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${outputUnit === 'ohm' ? 'bg-white text-teal-700 shadow' : 'text-white hover:bg-white/10'}`}>RTD</button>
                        </div>
                        <button
                            type="button"
                            onClick={() => setHasUeTransmitter(!hasUeTransmitter)}
                            className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${hasUeTransmitter ? 'bg-white text-teal-700 shadow' : 'bg-white/10 border-white/20 text-white hover:bg-white/20'}`}
                        >
                            {hasUeTransmitter ? 'Ocultar UE' : 'Mostrar UE'}
                        </button>
                    </div>
                    <button onClick={() => onMeasurementsChange([...measurements, { percentage: "", idealUE: "", patronUE: "", ueTransmitter: "", idealmA:"", idealohm: "", maTransmitter: "", ohmTransmitter: "", errorUE: "", errormA: "", errorPercentage: "", errorOhm: "" }])} className="w-full md:w-auto px-4 py-2 bg-white text-teal-700 font-bold rounded-lg shadow-md hover:bg-teal-50 transition-transform active:scale-95">Nueva fila</button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <div className={`min-w-full ${desktopMinWidth}`}>
                    
                    {/* Header solo para Desktop */}
                    <div className={`hidden lg:grid ${gridCols} bg-gray-50 border-b border-gray-200 text-[10px] font-bold text-gray-500 tracking-wider uppercase`}>
                        <div className="px-2 py-4 text-center">Ideal UE</div>
                        <div className="px-2 py-4 text-center">Ideal mA</div>
                        {isOhm && <div className="px-2 py-4 text-center">Ideal ohm</div>}
                        <div className="px-2 py-4 text-center">Patrón UE</div>
                        {hasUeTransmitter && <div className="px-2 py-4 text-center">UE transmisor</div>}
                        <div className="px-2 py-4 text-center">mA Salida</div>
                        {isOhm && <div className="px-2 py-4 text-center">ohm sensor</div>}
                        <div className="px-2 py-4 text-center">% Rango</div>
                        {hasUeTransmitter && <div className="px-2 py-4 text-center bg-red-50 text-red-700 border-l border-red-100 uppercase">Error UE</div>}
                        {isOhm && <div className="px-2 py-4 text-center bg-red-50 text-red-700 uppercase">Error ohm</div>}
                        <div className="px-2 py-4 text-center bg-red-50 text-red-700 uppercase">Error mA</div>
                        <div className="px-2 py-4 text-center bg-red-50 text-red-700 uppercase">Error %</div>
                        <div className="px-2 py-4 text-center uppercase">Acción</div>
                    </div>

                    {/* Contenedor de Filas */}
                    <div className="p-3 lg:p-0 space-y-4 lg:space-y-0 lg:divide-y lg:divide-gray-200 bg-gray-100 lg:bg-white">
                        {measurements.map((m, index) => (
                            <div key={index} className="relative bg-white rounded-xl lg:rounded-none shadow-sm lg:shadow-none border border-gray-200 lg:border-none overflow-hidden">
                                
                                {/* Header Fila Mobile */}
                                <div className="flex lg:hidden justify-between items-center px-4 py-2 bg-gray-50 border-b border-gray-100">
                                    <span className="text-[10px] font-black text-teal-700 uppercase tracking-tighter">Medición #{index + 1}</span>
                                    <button 
                                        onClick={() => onMeasurementsChange(measurements.filter((_, i) => i !== index))}
                                        className="text-red-500 hover:bg-red-100 p-1.5 rounded-md transition-colors"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </button>
                                </div>

                                {/* Scroll Horizontal Mobile */}
                                <div className="overflow-x-auto lg:overflow-visible">
                                    <div className={`flex flex-nowrap lg:grid ${gridCols} lg:items-center p-4 lg:p-0 gap-4 lg:gap-0 min-w-max lg:min-w-full`}>
                                        
                                        <div className="lg:px-2 lg:py-3"><InputField label="Ideal UE" unit="UE" value={m.idealUE} onChange={(e:any) => handleChange(index, 'idealUE', e.target.value)} /></div>
                                        <div className="lg:px-2 lg:py-3"><InputField label="Ideal mA" unit="mA" value={m.idealmA} onChange={(e:any) => handleChange(index, 'idealmA', e.target.value)} /></div>
                                        {isOhm && <div className="lg:px-2 lg:py-3"><InputField label="Ideal ohm" unit="Ω" value={m.idealohm} onChange={(e:any) => handleChange(index, 'idealohm', e.target.value)} /></div>}
                                        <div className="lg:px-2 lg:py-3"><InputField label="Patrón UE" unit="UE" value={m.patronUE} onChange={(e:any) => handleChange(index, 'patronUE', e.target.value)} /></div>
                                        {hasUeTransmitter && <div className="lg:px-2 lg:py-3"><InputField label="UE Trans." unit="UE" value={m.ueTransmitter} onChange={(e:any) => handleChange(index, 'ueTransmitter', e.target.value)} /></div>}
                                        <div className="lg:px-2 lg:py-3"><InputField label={isOhm ? 'mA sensor' : 'mA trans.'} unit="mA" value={m.maTransmitter} onChange={(e:any) => handleChange(index, 'maTransmitter', e.target.value)} /></div>
                                        {isOhm && <div className="lg:px-2 lg:py-3"><InputField label="ohm sensor" unit="Ω" value={m.ohmTransmitter} onChange={(e:any) => handleChange(index, 'ohmTransmitter', e.target.value)} /></div>}
                                        <div className="lg:px-2 lg:py-3"><InputField label="% Rango" unit="%" value={m.percentage} onChange={(e:any) => handleChange(index, 'percentage', e.target.value)} /></div>
                                        
                                        {/* ERRORES */}
                                        {hasUeTransmitter && <div className="lg:px-2 lg:py-3 lg:bg-red-50/30"><InputField label="Err UE" unit="UE" value={m.errorUE} isError readOnly /></div>}
                                        {isOhm && <div className="lg:px-2 lg:py-3 lg:bg-red-50/30"><InputField label="Err Ω" unit="Ω" value={m.errorOhm} isError readOnly /></div>}
                                        <div className="lg:px-2 lg:py-3 lg:bg-red-50/30"><InputField label="Err mA" unit="mA" value={m.errormA} isError readOnly /></div>
                                        <div className="lg:px-2 lg:py-3 lg:bg-red-50/30"><InputField label="Err %" unit="%" value={m.errorPercentage} isError readOnly /></div>
                                        
                                        {/* Borrar Desktop */}
                                        <div className="hidden lg:flex justify-center lg:px-2">
                                            <button onClick={() => onMeasurementsChange(measurements.filter((_, i) => i !== index))} className="text-red-500 hover:bg-red-50 p-2 rounded-full transition-all active:scale-90">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                            </button>
                                        </div>
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