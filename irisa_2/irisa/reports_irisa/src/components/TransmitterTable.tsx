import React, { useState } from 'react';

export interface Measurement {
    percentage: string;
    idealUE: string;
    patronUE: string;
    ueTransmitter: string;
    idealmA: string;
    idealohm?: string; 
    idealmV?: string; // Nuevo campo para mV
    maTransmitter: string; 
    ohmTransmitter?: string; 
    mvSensor?: string; // Nuevo campo para mV
    sensorType?: 'J' | 'K'; // Checkboxes
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
    
    // Estado para el nuevo selector mV / TX
    const [inputMode, setInputMode] = useState<'mV' | 'TX'>('TX');
    const isOhm = outputUnit === 'ohm';
    const isMV = inputMode === 'mV';

    // Cálculo dinámico de columnas (simplificado para los nuevos modos)
    // mV tiene 4 cols base + UE/Errores opcionales. TX tiene 4 cols base + UE/Errores.
    let colsCount = isMV ? 4 : 4; 
    if (hasUeTransmitter) colsCount += 1;
    colsCount += 2; // Errores fijos

    const gridCols = `lg:grid-cols-${colsCount + 1}`; // +1 por la acción

    const calculateErrors = (measurement: Measurement) => {
        const idealUEValue = parseFloat(measurement.idealUE) || 0;
        const ueTransmitterValue = parseFloat(measurement.ueTransmitter) || 0;
        const idealVal = parseFloat(measurement.idealmA) || 0;
        const measuredVal = parseFloat(measurement.maTransmitter) || 0;
        
        const errorUEValue = ueTransmitterValue - idealUEValue; 
        const errorVal = measuredVal - idealVal; 
        const divisor = 16; 
        const errorPercentage = (errorVal / divisor) * 100; 
        
        return {
            ...measurement,
            errorUE: errorUEValue.toFixed(3),
            errormA: errorVal.toFixed(3),
            errorPercentage: errorPercentage.toFixed(2)
        };
    };

    const handleChange = (index: number, field: keyof Measurement, value: any) => {
        const newMeasurements = [...measurements];
        newMeasurements[index] = { ...newMeasurements[index], [field]: value };
        
        const relevantFields: (keyof Measurement)[] = ["idealUE", "ueTransmitter", "idealmA", "maTransmitter", "idealmV", "mvSensor"];
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
                        <h3 className="text-lg font-bold text-white tracking-tight">Mediciones</h3>
                        
                        {/* Selector Salida: mA / RTD */}
                        <div className="flex bg-black/20 p-1 rounded-lg border border-white/10">
                            <button type="button" onClick={() => setOutputUnit('mA')} className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${outputUnit === 'mA' ? 'bg-white text-teal-700 shadow' : 'text-white hover:bg-white/10'}`}>mA</button>
                            <button type="button" onClick={() => setOutputUnit('ohm')} className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${outputUnit === 'ohm' ? 'bg-white text-teal-700 shadow' : 'text-white hover:bg-white/10'}`}>RTD</button>
                        </div>

                        {/* NUEVO Selector Entrada: mV / TX */}
                        <div className="flex bg-black/20 p-1 rounded-lg border border-white/10">
                            <button type="button" onClick={() => setInputMode('mV')} className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${inputMode === 'mV' ? 'bg-white text-teal-700 shadow' : 'text-white hover:bg-white/10'}`}>mV</button>
                            <button type="button" onClick={() => setInputMode('TX')} className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${inputMode === 'TX' ? 'bg-white text-teal-700 shadow' : 'text-white hover:bg-white/10'}`}>TX</button>
                        </div>

                        <button
                            type="button"
                            onClick={() => setHasUeTransmitter(!hasUeTransmitter)}
                            className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${hasUeTransmitter ? 'bg-white text-teal-700 shadow' : 'bg-white/10 border-white/20 text-white hover:bg-white/20'}`}
                        >
                            {hasUeTransmitter ? 'Ocultar UE' : 'Mostrar UE'}
                        </button>
                    </div>
                    
                    <button onClick={() => onMeasurementsChange([...measurements, { percentage: "", idealUE: "", patronUE: "", ueTransmitter: "", idealmA:"", idealohm: "", idealmV: "", maTransmitter: "", ohmTransmitter: "", mvSensor: "", sensorType: 'J', errorUE: "", errormA: "", errorPercentage: "" }])} className="px-4 py-2 bg-white text-teal-700 font-bold rounded-lg shadow-md hover:bg-teal-50">Nueva fila</button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <div className="min-w-full inline-block align-middle">
                    {/* Headers Dinámicos */}
                    <div className={`hidden lg:grid ${gridCols} bg-gray-50 border-b border-gray-200 text-[10px] font-bold text-gray-500 tracking-wider`}>
                        {isMV ? (
                            <>
                                <div className="px-2 py-4 text-center">mV Ideal</div>
                                <div className="px-2 py-4 text-center">mV Sensor</div>
                            </>
                        ) : (
                            <>
                                <div className="px-2 py-4 text-center">Ideal mA</div>
                                <div className="px-2 py-4 text-center">mATX</div>
                            </>
                        )}
                        <div className="px-2 py-4 text-center">Tipo Sensor</div>
                        {hasUeTransmitter && <div className="px-2 py-4 text-center">UE Transmisor</div>}
                        <div className="px-2 py-4 text-center bg-red-50 text-red-700">Error mA</div>
                        <div className="px-2 py-4 text-center bg-red-50 text-red-700">Error %</div>
                        <div className="px-2 py-4 text-center">Acción</div>
                    </div>

                    {/* Body de la Tabla */}
                    <div className="p-4 lg:p-0 space-y-4 lg:space-y-0 lg:divide-y lg:divide-gray-200 bg-gray-50 lg:bg-white">
                        {measurements.map((m, index) => (
                            <div key={index} className={`bg-white p-4 lg:p-0 lg:grid ${gridCols} lg:items-center hover:bg-teal-50/30 transition-colors`}>
                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:contents gap-4">
                                    
                                    {/* Columnas 1 y 2 (mV o mA) */}
                                    {isMV ? (
                                        <>
                                            <div className="lg:px-2 lg:py-3"><InputField label="mV Ideal" unit="mV" value={m.idealmV} onChange={(e:any) => handleChange(index, 'idealmV', e.target.value)} /></div>
                                            <div className="lg:px-2 lg:py-3"><InputField label="mV Sensor" unit="mV" value={m.mvSensor} onChange={(e:any) => handleChange(index, 'mvSensor', e.target.value)} /></div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="lg:px-2 lg:py-3"><InputField label="Ideal mA" unit="mA" value={m.idealmA} onChange={(e:any) => handleChange(index, 'idealmA', e.target.value)} /></div>
                                            <div className="lg:px-2 lg:py-3"><InputField label="mATX" unit="mA" value={m.maTransmitter} onChange={(e:any) => handleChange(index, 'maTransmitter', e.target.value)} /></div>
                                        </>
                                    )}

                                    {/* Columna 3: Tipo Sensor Checkboxes */}
                                    <div className="lg:px-2 lg:py-3 flex items-center justify-center gap-4">
                                        <div className="flex items-center gap-1">
                                            <input 
                                                type="checkbox" 
                                                checked={m.sensorType === 'J'} 
                                                onChange={() => handleChange(index, 'sensorType', 'J')}
                                                className="w-3 h-3 text-teal-600 rounded"
                                            />
                                            <span className="text-[10px] font-bold text-gray-600">J</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <input 
                                                type="checkbox" 
                                                checked={m.sensorType === 'K'} 
                                                onChange={() => handleChange(index, 'sensorType', 'K')}
                                                className="w-3 h-3 text-teal-600 rounded"
                                            />
                                            <span className="text-[10px] font-bold text-gray-600">K</span>
                                        </div>
                                    </div>

                                    {/* Columna UE Opcional */}
                                    {hasUeTransmitter && (
                                        <div className="lg:px-2 lg:py-3"><InputField label="UE Transmisor" unit="UE" value={m.ueTransmitter} onChange={(e:any) => handleChange(index, 'ueTransmitter', e.target.value)} /></div>
                                    )}

                                    {/* Errores */}
                                    <div className="lg:px-2 lg:py-3 lg:bg-red-50/20"><InputField label="Error mA" unit="mA" value={m.errormA} isError readOnly /></div>
                                    <div className="lg:px-2 lg:py-3 lg:bg-red-50/20"><InputField label="Error %" unit="%" value={m.errorPercentage} isError readOnly /></div>

                                    {/* Acción */}
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