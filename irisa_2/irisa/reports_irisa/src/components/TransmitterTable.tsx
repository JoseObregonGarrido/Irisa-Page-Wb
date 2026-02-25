import React from 'react';

export interface Measurement {
    percentage: string;
    idealUe: string;
    patronUe: string;
    ueTransmitter: string;
    idealmA: string;
    idealOhm?: string; // Agregado para independencia en modo sensor
    maTransmitter: string;
    errorUe: string;
    errorMa: string;
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
    const deviceLabel = isOhm ? 'Sensor' : 'Transmisor';

    let colsCount = 8; 
    if (hasUeTransmitter) colsCount += 2; 
    if (isOhm) colsCount += 1;

    const gridCols = {
        8: 'lg:grid-cols-8',
        9: 'lg:grid-cols-9',
        10: 'lg:grid-cols-10',
        11: 'lg:grid-cols-11',
        12: 'lg:grid-cols-12'
    }[colsCount] || 'lg:grid-cols-11';

    const desktopMinWidth = hasUeTransmitter ? (isOhm ? 'lg:min-w-[1250px]' : 'lg:min-w-[1050px]') : 'lg:min-w-[950px]';

    const handleAddRow = () => {
        onMeasurementsChange([...measurements, { 
            percentage: "", idealUe: "", patronUe: "", ueTransmitter: "", 
            idealmA:"", idealOhm: "", maTransmitter: "", errorUe: "", errorMa: "", errorPercentage: "" 
        }]);
    };

    const handleDeleteRow = (indexToDelete: number) => {
        const newMeasurements = measurements.filter((_, index) => index !== indexToDelete);
        onMeasurementsChange(newMeasurements);
    };

    const calculateErrors = (measurement: Measurement) => {
        const patronUe = parseFloat(measurement.patronUe) || 0;
        const ueTransmitter = parseFloat(measurement.ueTransmitter) || 0;
        
        // Resultado de ideal ohm = ideal mA - ohm sensor
        // Si es ohm, comparamos contra idealOhm, si no contra idealmA
        const targetIdeal = isOhm ? (parseFloat(measurement.idealOhm || "0") || 0) : (parseFloat(measurement.idealmA) || 0);
        const maTransmitter = parseFloat(measurement.maTransmitter) || 0;
        
        const errorUe = ueTransmitter - patronUe; 
        const errorMa = maTransmitter - targetIdeal;    
        
        const divisor = isOhm ? 100 : 16;
        const errorPercentage = (errorMa / divisor) * 100; 
        
        return {
            ...measurement,
            errorUe: errorUe.toFixed(3),
            errorMa: errorMa.toFixed(3),
            errorPercentage: errorPercentage.toFixed(2)
        };
    };

    const handleChange = (index: number, field: keyof Measurement, value: string) => {
        const newMeasurements = [...measurements];
        newMeasurements[index] = { ...newMeasurements[index], [field]: value };
        
        const relevantFields: (keyof Measurement)[] = ["patronUe", "ueTransmitter", "idealmA", "idealOhm", "maTransmitter"];
        if (relevantFields.includes(field)) {
            newMeasurements[index] = calculateErrors(newMeasurements[index]);
        }
        onMeasurementsChange(newMeasurements);
    };

    return (
        <div className="mt-8 w-full bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            {/* Header Superior */}
            <div className="bg-gradient-to-r from-teal-600 to-emerald-600 px-4 py-4 sm:px-6">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center">
                            <div className="p-2 bg-white/20 rounded-lg mr-3">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-bold text-white tracking-tight">Mediciones</h3>
                        </div>

                        <div className="flex bg-black/20 p-1 rounded-lg border border-white/10">
                            <button type="button" onClick={() => setOutputUnit('mA')} className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${outputUnit === 'mA' ? 'bg-white text-teal-700 shadow' : 'text-white hover:bg-white/10'}`}>mA</button>
                            <button type="button" onClick={() => setOutputUnit('ohm')} className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${outputUnit === 'ohm' ? 'bg-white text-teal-700 shadow' : 'text-white hover:bg-white/10'}`}>Sensor</button>
                        </div>

                        <button
                            type="button"
                            onClick={() => setHasUeTransmitter(!hasUeTransmitter)}
                            className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${hasUeTransmitter ? 'bg-white text-teal-700 shadow' : 'bg-white/10 border-white/20 text-white hover:bg-white/20'}`}
                        >
                            {hasUeTransmitter ? 'Ocultar UE Transmisor' : 'Mostrar UE Transmisor'}
                        </button>
                    </div>

                    <button onClick={handleAddRow} className="w-full sm:w-auto px-4 py-2 bg-white text-teal-700 hover:bg-teal-50 font-bold rounded-lg transition-all shadow-md active:scale-95">
                        Nueva Fila
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto lg:overflow-x-auto">
                <div className={`min-w-full ${desktopMinWidth} inline-block align-middle`}>
                    
                    {/* HEADERS DESKTOP */}
                    <div className={`hidden lg:grid ${gridCols} bg-gray-50 border-b border-gray-200 text-[10px] font-bold text-gray-500 uppercase tracking-wider`}>
                        <div className="px-2 py-4 text-center">Ideal UE</div>
                        {isOhm && <div className="px-2 py-4 text-center">Ideal mA</div>}
                        <div className="px-2 py-4 text-center">Ideal {outputUnit}</div>
                        <div className="px-2 py-4 text-center">Patrón UE</div>
                        {hasUeTransmitter && <div className="px-2 py-4 text-center">UE {deviceLabel}</div>}
                        <div className="px-2 py-4 text-center">mA {deviceLabel}</div>
                        <div className="px-2 py-4 text-center">% Rango</div>
                        {hasUeTransmitter && <div className="px-2 py-4 text-center bg-red-50 text-red-700">Err UE</div>}
                        <div className="px-2 py-4 text-center bg-red-50 text-red-700">Err mA</div>
                        <div className="px-2 py-4 text-center bg-red-50 text-red-700">Err %</div>
                        <div className="px-2 py-4 text-center">Acción</div>
                    </div>

                    {/* CUERPO */}
                    <div className="p-4 lg:p-0 space-y-4 lg:space-y-0 lg:divide-y lg:divide-gray-200 bg-gray-50 lg:bg-white">
                        {measurements.map((m, index) => (
                            <div key={index} className={`bg-white p-4 lg:p-0 rounded-xl lg:rounded-none shadow-sm lg:shadow-none border lg:border-none border-gray-200 lg:grid ${gridCols} lg:items-center hover:bg-teal-50/30 transition-colors`}>
                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:contents gap-4">
                                    <div className="lg:px-2 lg:py-3"><InputField label="Ideal UE" unit="UE" value={m.idealUe} onChange={(e:any) => handleChange(index, 'idealUe', e.target.value)} /></div>
                                    
                                    {isOhm && (
                                        <div className="lg:px-2 lg:py-3"><InputField label="Ideal mA" unit="mA" value={m.idealmA} onChange={(e:any) => handleChange(index, 'idealmA', e.target.value)} /></div>
                                    )}

                                    {/* Ideal Ohm ahora es independiente de Ideal mA */}
                                    <div className="lg:px-2 lg:py-3"><InputField label={`Ideal ${outputUnit}`} unit={outputUnit} value={isOhm ? (m.idealOhm || "") : m.idealmA} onChange={(e:any) => handleChange(index, isOhm ? 'idealOhm' : 'idealmA', e.target.value)} /></div>
                                    
                                    <div className="lg:px-2 lg:py-3"><InputField label="Patrón UE" unit="UE" value={m.patronUe} onChange={(e:any) => handleChange(index, 'patronUe', e.target.value)} /></div>

                                    {hasUeTransmitter && (
                                        <div className="lg:px-2 lg:py-3"><InputField label="UE Transmisor" unit="UE" value={m.ueTransmitter} onChange={(e:any) => handleChange(index, 'ueTransmitter', e.target.value)} /></div>
                                    )}

                                    <div className="lg:px-2 lg:py-3"><InputField label={`mA ${deviceLabel}`} unit="mA" value={m.maTransmitter} onChange={(e:any) => handleChange(index, 'maTransmitter', e.target.value)} /></div>
                                    <div className="lg:px-2 lg:py-3"><InputField label="% Rango" unit="%" value={m.percentage} onChange={(e:any) => handleChange(index, 'percentage', e.target.value)} /></div>

                                    {hasUeTransmitter && (
                                        <div className="lg:px-2 lg:py-3 lg:bg-red-50/20"><InputField label="Err UE" unit="UE" value={m.errorUe} isError readOnly /></div>
                                    )}

                                    <div className="lg:px-2 lg:py-3 lg:bg-red-50/20"><InputField label="Err mA" unit="mA" value={m.errorMa} isError readOnly /></div>
                                    <div className="lg:px-2 lg:py-3 lg:bg-red-50/20"><InputField label="Err %" unit="%" value={m.errorPercentage} isError readOnly /></div>

                                    <div className="col-span-2 sm:col-span-3 lg:col-span-1 flex justify-center items-center pt-2 lg:pt-0 border-t lg:border-none border-gray-100 mt-2 lg:mt-0">
                                        <button
                                            type="button"
                                            onClick={() => handleDeleteRow(index)}
                                            className="w-full lg:w-auto p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg lg:rounded-full transition-all flex items-center justify-center gap-2"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                            <span className="lg:hidden font-bold text-xs uppercase">Eliminar Medición</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            {measurements.length === 0 && (
                <div className="p-12 text-center text-gray-400 text-sm italic bg-gray-50">
                    No hay mediciones registradas.
                </div>
            )}
        </div>
    );
}

export default TransmitterTable;