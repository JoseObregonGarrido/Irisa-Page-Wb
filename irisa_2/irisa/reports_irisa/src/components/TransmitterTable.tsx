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
}

interface TransmitterTableProps {
    measurements: Measurement[];
    onMeasurementsChange: (measurements: Measurement[]) => void;
    outputUnit: 'mA' | 'ohm';
    setOutputUnit: (unit: 'mA' | 'ohm') => void;
    hasUeTransmitter: boolean;
    setHasUeTransmitter: (show: boolean) => void;
}

const InputField = ({ label, value, onChange, unit, isError = false, readOnly = false }: any) => (
    <div className="flex flex-col w-full">
        <label className="block text-[10px] font-bold text-gray-500 mb-1 lg:hidden">
            {label}
        </label>
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
            <span className={`absolute right-1.5 top-2.5 text-[9px] font-bold ${isError ? 'text-red-400' : 'text-gray-400'}`}>
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
    
    const isOhm = outputUnit === 'ohm';
    
    let colsCount = 8; 
    if (hasUeTransmitter) colsCount += 2; 
    if (isOhm) colsCount += 2; 

    const gridCols = {
        8: 'lg:grid-cols-8',
        9: 'lg:grid-cols-9',
        10: 'lg:grid-cols-10',
        11: 'lg:grid-cols-11',
        12: 'lg:grid-cols-12'
    }[colsCount] || 'lg:grid-cols-12';

    const desktopMinWidth = isOhm ? 'lg:min-w-[1350px]' : 'lg:min-w-[1000px]';

    const calculateErrors = (measurement: Measurement) => {
        const idealUEValue = parseFloat(measurement.idealUE) || 0;
        const ueTransmitterValue = parseFloat(measurement.ueTransmitter) || 0;
        const idealVal = isOhm ? (parseFloat(measurement.idealohm || '0') || 0) : (parseFloat(measurement.idealmA) || 0);
        const measuredVal = isOhm ? (parseFloat(measurement.ohmTransmitter || '0') || 0) : (parseFloat(measurement.maTransmitter) || 0);
        
        const errorUEValue = ueTransmitterValue - idealUEValue; 
        const errorVal = measuredVal - idealVal; 
        
        const divisor = isOhm ? 100 : 16;
        const errorPercentage = (errorVal / divisor) * 100; 
        
        return {
            ...measurement,
            errorUE: errorUEValue.toFixed(3),
            errormA: errorVal.toFixed(3),
            errorPercentage: errorPercentage.toFixed(2)
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
        <div className="mt-8 w-full bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-teal-600 to-emerald-600 px-4 py-4 sm:px-6">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-lg font-bold text-white tracking-tight">Mediciones de transmisor</h3>
                        <div className="flex bg-black/20 p-1 rounded-lg border border-white/10">
                            <button type="button" onClick={() => setOutputUnit('mA')} className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${outputUnit === 'mA' ? 'bg-white text-teal-700 shadow' : 'text-white hover:bg-white/10'}`}>mA</button>
                            <button type="button" onClick={() => setOutputUnit('ohm')} className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${outputUnit === 'ohm' ? 'bg-white text-teal-700 shadow' : 'text-white hover:bg-white/10'}`}>ohm</button>
                        </div>
                        <button
                            type="button"
                            onClick={() => setHasUeTransmitter(!hasUeTransmitter)}
                            className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${hasUeTransmitter ? 'bg-white text-teal-700 shadow' : 'bg-white/10 border-white/20 text-white hover:bg-white/20'}`}
                        >
                            {hasUeTransmitter ? 'Ocultar UE transmisor' : 'Mostrar UE transmisor'}
                        </button>
                    </div>
                    <button onClick={() => onMeasurementsChange([...measurements, { percentage: "", idealUE: "", patronUE: "", ueTransmitter: "", idealmA:"", idealohm: "", maTransmitter: "", ohmTransmitter: "", errorUE: "", errormA: "", errorPercentage: "" }])} className="px-4 py-2 bg-white text-teal-700 font-bold rounded-lg shadow-md hover:bg-teal-50">Nueva fila</button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <div className={`min-w-full ${desktopMinWidth} inline-block align-middle`}>
                    <div className={`hidden lg:grid ${gridCols} bg-gray-50 border-b border-gray-200 text-[10px] font-bold text-gray-500 tracking-wider`}>
                        <div className="px-2 py-4 text-center">Ideal UE</div>
                        <div className="px-2 py-4 text-center">Ideal mA</div>
                        {isOhm && <div className="px-2 py-4 text-center">Ideal ohm</div>}
                        <div className="px-2 py-4 text-center">Patrón UE</div>
                        {hasUeTransmitter && <div className="px-2 py-4 text-center">UE transmisor</div>}
                        {/* CORRECCIÓN AQUÍ: Label dinámico según unidad */}
                        <div className="px-2 py-4 text-center">{isOhm ? 'mA sensor' : 'mA transmisor'}</div>
                        {isOhm && <div className="px-2 py-4 text-center">ohm sensor</div>}
                        <div className="px-2 py-4 text-center">% Rango</div>
                        {hasUeTransmitter && <div className="px-2 py-4 text-center bg-red-50 text-red-700">Error UE</div>}
                        <div className="px-2 py-4 text-center bg-red-50 text-red-700">{isOhm ? 'Error ohm' : 'Error mA'}</div>
                        <div className="px-2 py-4 text-center bg-red-50 text-red-700">Error %</div>
                        <div className="px-2 py-4 text-center">Acción</div>
                    </div>

                    <div className="p-4 lg:p-0 space-y-4 lg:space-y-0 lg:divide-y lg:divide-gray-200 bg-gray-50 lg:bg-white">
                        {measurements.map((m, index) => (
                            <div key={index} className={`bg-white p-4 lg:p-0 lg:grid ${gridCols} lg:items-center hover:bg-teal-50/30 transition-colors`}>
                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:contents gap-4">
                                    <div className="lg:px-2 lg:py-3"><InputField label="Ideal UE" unit="UE" value={m.idealUE} onChange={(e:any) => handleChange(index, 'idealUE', e.target.value)} /></div>
                                    <div className="lg:px-2 lg:py-3"><InputField label="Ideal mA" unit="mA" value={m.idealmA} onChange={(e:any) => handleChange(index, 'idealmA', e.target.value)} /></div>
                                    {isOhm && <div className="lg:px-2 lg:py-3"><InputField label="Ideal ohm" unit="Ω" value={m.idealohm} onChange={(e:any) => handleChange(index, 'idealohm', e.target.value)} /></div>}
                                    <div className="lg:px-2 lg:py-3"><InputField label="Patrón UE" unit="UE" value={m.patronUE} onChange={(e:any) => handleChange(index, 'patronUE', e.target.value)} /></div>
                                    {hasUeTransmitter && <div className="lg:px-2 lg:py-3"><InputField label="UE transmisor" unit="UE" value={m.ueTransmitter} onChange={(e:any) => handleChange(index, 'ueTransmitter', e.target.value)} /></div>}
                                    {/* CORRECCIÓN AQUÍ: Label dinámico para móviles también */}
                                    <div className="lg:px-2 lg:py-3"><InputField label={isOhm ? 'mA sensor' : 'mA transmisor'} unit="mA" value={m.maTransmitter} onChange={(e:any) => handleChange(index, 'maTransmitter', e.target.value)} /></div>
                                    {isOhm && <div className="lg:px-2 lg:py-3"><InputField label="ohm sensor" unit="Ω" value={m.ohmTransmitter} onChange={(e:any) => handleChange(index, 'ohmTransmitter', e.target.value)} /></div>}
                                    <div className="lg:px-2 lg:py-3"><InputField label="% Rango" unit="%" value={m.percentage} onChange={(e:any) => handleChange(index, 'percentage', e.target.value)} /></div>
                                    {hasUeTransmitter && <div className="lg:px-2 lg:py-3 lg:bg-red-50/20"><InputField label="Error UE" unit="UE" value={m.errorUE} isError readOnly /></div>}
                                    <div className="lg:px-2 lg:py-3 lg:bg-red-50/20"><InputField label={isOhm ? 'Error ohm' : 'Error mA'} unit={isOhm ? 'Ω' : 'mA'} value={m.errormA} isError readOnly /></div>
                                    <div className="lg:px-2 lg:py-3 lg:bg-red-50/20"><InputField label="Error %" unit="%" value={m.errorPercentage} isError readOnly /></div>
                                    <div className="col-span-2 sm:col-span-3 lg:col-span-1 flex justify-center">
                                        <button onClick={() => onMeasurementsChange(measurements.filter((_, i) => i !== index))} className="text-red-500 hover:bg-red-50 p-2 rounded-full">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
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