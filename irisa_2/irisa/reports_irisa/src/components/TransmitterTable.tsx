import React from 'react';

export interface Measurement {
    percentage: string;
    idealUe: string;
    patronUe: string;
    ueTransmitter: string;
    idealMa: string;
    maTransmitter: string;
    errorUe: string;
    errorMa: string;
    errorPercentage: string;
}

interface TransmitterTableProps {
    measurements: Measurement[];
    onMeasurementsChange: (measurements: Measurement[]) => void;
    outputUnit: 'mA' | 'Ω';
    setOutputUnit: (unit: 'mA' | 'Ω') => void;
    // Agregamos las props que faltaban para corregir el error de TS
    hasUeTransmitter: boolean;
    setHasUeTransmitter: (show: boolean) => void;
}

const InputField = ({ label, value, onChange, unit, isError = false, readOnly = false }: any) => (
    <div className="flex flex-col w-full">
        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1 lg:hidden">
            {label}
        </label>
        <div className="relative w-full">
            <input
                type="text"
                value={value}
                onChange={onChange}
                readOnly={readOnly}
                className={`w-full px-2 py-2 pr-8 text-sm border rounded-lg focus:outline-none focus:ring-2 
                    ${isError 
                        ? 'border-red-200 bg-red-50 focus:ring-red-500' 
                        : 'border-gray-300 bg-white focus:ring-teal-500'
                    } ${readOnly ? 'cursor-not-allowed' : ''}`}
                placeholder="0.00"
            />
            <span className={`absolute right-2 top-2 text-[10px] font-bold ${isError ? 'text-red-400' : 'text-gray-400'}`}>
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
    
    const handleAddRow = () => {
        onMeasurementsChange([...measurements, { 
            percentage: "", idealUe: "", patronUe: "", ueTransmitter: "", 
            idealMa:"", maTransmitter: "", errorUe: "", errorMa: "", errorPercentage: "" 
        }]);
    };

    const handleDeleteRow = (indexToDelete: number) => {
        const newMeasurements = measurements.filter((_, index) => index !== indexToDelete);
        onMeasurementsChange(newMeasurements);
    };

    const calculateErrors = (measurement: Measurement) => {
        const patronUe = parseFloat(measurement.patronUe) || 0;
        const ueTransmitter = parseFloat(measurement.ueTransmitter) || 0;
        const idealMa = parseFloat(measurement.idealMa) || 0;
        const maTransmitter = parseFloat(measurement.maTransmitter) || 0;
        
        const errorUe = ueTransmitter - patronUe; 
        const errorMa = maTransmitter - idealMa;    
        const errorPercentage = (errorMa / 16) * 100; 
        
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
        
        const relevantFields: (keyof Measurement)[] = ["patronUe", "ueTransmitter", "idealMa", "maTransmitter"];
        if (relevantFields.includes(field)) {
            newMeasurements[index] = calculateErrors(newMeasurements[index]);
        }
        
        onMeasurementsChange(newMeasurements);
    };

    // Calculamos el número de columnas dinámicamente para el grid
    const gridCols = hasUeTransmitter ? 'lg:grid-cols-11' : 'lg:grid-cols-7';

    return (
        <div className="mt-8 w-full max-w-full overflow-hidden">
            <div className="bg-gradient-to-r from-teal-600 to-emerald-600 rounded-t-xl px-4 py-4 sm:px-6">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center">
                            <div className="p-2 bg-white/20 rounded-lg mr-3">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <h3 className="text-lg sm:text-xl font-bold text-white uppercase tracking-tight">Mediciones</h3>
                        </div>

                        {/* --- SWITCH DE UNIDADES --- */}
                        <div className="flex bg-black/20 p-1 rounded-lg border border-white/10">
                            <button
                                onClick={() => setOutputUnit('mA')}
                                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${outputUnit === 'mA' ? 'bg-white text-teal-700 shadow' : 'text-white hover:bg-white/10'}`}
                            >
                                mA
                            </button>
                            <button
                                onClick={() => setOutputUnit('Ω')}
                                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${outputUnit === 'Ω' ? 'bg-white text-teal-700 shadow' : 'text-white hover:bg-white/10'}`}
                            >
                                Ohmios (Ω)
                            </button>
                        </div>

                        {/* --- SWITCH MOSTRAR/OCULTAR UE --- */}
                        <button
                            type="button"
                            onClick={() => setHasUeTransmitter(!hasUeTransmitter)}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${
                                hasUeTransmitter 
                                ? 'bg-emerald-100 border-emerald-300 text-emerald-700' 
                                : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                            }`}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={hasUeTransmitter ? "M15 12a3 3 0 11-6 0 3 3 0 016 0z" : "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"} />
                            </svg>
                            {hasUeTransmitter ? 'CON UE' : 'SIN UE'}
                        </button>
                    </div>

                    <button 
                        onClick={handleAddRow} 
                        className="w-full sm:w-auto flex items-center justify-center px-4 py-2 bg-white text-teal-700 hover:bg-teal-50 font-bold rounded-lg transition-all shadow-md active:scale-95"
                    >
                        NUEVA FILA
                    </button>
                </div>
            </div>

            <div className="bg-gray-100 lg:bg-white rounded-b-xl shadow-lg border border-gray-200">
                {/* HEADERS DESKTOP */}
                <div className={`hidden lg:grid ${gridCols} bg-gray-50 border-b border-gray-200 text-[10px] font-bold text-gray-600 uppercase tracking-wider`}>
                    {hasUeTransmitter && <div className="px-2 py-4 text-center border-r border-gray-100">Ideal UE</div>}
                    <div className="px-2 py-4 text-center">Ideal {outputUnit}</div>
                    {hasUeTransmitter && <div className="px-2 py-4 text-center border-r border-gray-100">Patrón UE</div>}
                    {hasUeTransmitter && <div className="px-2 py-4 text-center border-r border-gray-100">UE Trans.</div>}
                    <div className="px-2 py-4 text-center">{outputUnit} Trans.</div>
                    <div className="px-2 py-4 text-center">% Rango</div>
                    {hasUeTransmitter && <div className="px-2 py-4 text-center bg-red-50/50">Err UE</div>}
                    <div className="px-2 py-4 text-center bg-red-50/50">Err {outputUnit}</div>
                    <div className="px-2 py-4 text-center bg-red-50/50">Err %</div>
                    <div className="px-2 py-4 text-center col-span-2">Acción</div>
                </div>

                <div className="p-4 lg:p-0 space-y-4 lg:space-y-0 lg:divide-y lg:divide-gray-200">
                    {measurements.map((m, index) => (
                        <div key={index} className={`bg-white p-4 lg:p-0 rounded-xl lg:rounded-none shadow-sm lg:shadow-none border lg:border-none border-gray-200 lg:grid ${gridCols} lg:items-center hover:bg-gray-50 transition-colors`}>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:contents gap-3">
                                
                                {hasUeTransmitter && (
                                    <div className="lg:px-2 lg:py-3 text-center border-r border-gray-50">
                                        <InputField label="Ideal UE" unit="UE" value={m.idealUe} onChange={(e:any) => handleChange(index, 'idealUe', e.target.value)} />
                                    </div>
                                )}
                                
                                <div className="lg:px-2 lg:py-3 text-center">
                                    <InputField label={`Ideal ${outputUnit}`} unit={outputUnit} value={m.idealMa} onChange={(e:any) => handleChange(index, 'idealMa', e.target.value)} />
                                </div>

                                {hasUeTransmitter && (
                                    <div className="lg:px-2 lg:py-3 text-center border-r border-gray-50">
                                        <InputField label="Patrón UE" unit="UE" value={m.patronUe} onChange={(e:any) => handleChange(index, 'patronUe', e.target.value)} />
                                    </div>
                                )}

                                {hasUeTransmitter && (
                                    <div className="lg:px-2 lg:py-3 text-center border-r border-gray-50">
                                        <InputField label="UE Trans." unit="UE" value={m.ueTransmitter} onChange={(e:any) => handleChange(index, 'ueTransmitter', e.target.value)} />
                                    </div>
                                )}

                                <div className="lg:px-2 lg:py-3 text-center">
                                    <InputField label={`${outputUnit} Trans.`} unit={outputUnit} value={m.maTransmitter} onChange={(e:any) => handleChange(index, 'maTransmitter', e.target.value)} />
                                </div>
                                <div className="lg:px-2 lg:py-3 text-center">
                                    <InputField label="% Rango" unit="%" value={m.percentage} onChange={(e:any) => handleChange(index, 'percentage', e.target.value)} />
                                </div>

                                {hasUeTransmitter && (
                                    <div className="lg:px-2 lg:py-3 text-center lg:bg-red-50/30">
                                        <InputField label="Err UE" unit="UE" value={m.errorUe} isError readOnly />
                                    </div>
                                )}

                                <div className="lg:px-2 lg:py-3 text-center lg:bg-red-50/30">
                                    <InputField label={`Err ${outputUnit}`} unit={outputUnit} value={m.errorMa} isError readOnly />
                                </div>
                                <div className="lg:px-2 lg:py-3 text-center lg:bg-red-50/30">
                                    <InputField label="Err %" unit="%" value={m.errorPercentage} isError readOnly />
                                </div>
                                <div className="col-span-2 md:col-span-3 lg:col-span-2 flex justify-center items-center py-2 lg:py-0">
                                    <button
                                        onClick={() => handleDeleteRow(index)}
                                        className="w-full lg:w-auto flex items-center justify-center px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg border border-red-100 lg:border-none transition-colors"
                                    >
                                        <svg className="w-5 h-5 lg:w-4 lg:h-4 mr-2 lg:mr-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1-1H8a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                        <span className="lg:hidden font-bold text-sm uppercase">Eliminar Medición</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {measurements.length > 0 && (
                    <div className="bg-gray-50 p-4 border-t border-gray-200">
                        <div className="flex flex-wrap gap-4 text-xs font-bold uppercase text-gray-500 justify-around">
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-teal-500"></span>
                                Puntos: <span className="text-teal-700">{measurements.length}</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default TransmitterTable;