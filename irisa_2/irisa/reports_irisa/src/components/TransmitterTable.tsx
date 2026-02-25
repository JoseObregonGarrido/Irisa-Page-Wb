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
    hasUeTransmitter: boolean;
    setHasUeTransmitter: (val: boolean) => void;
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
                    } ${readOnly ? 'bg-gray-50 cursor-not-allowed text-gray-600' : ''}`}
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

    const calculateErrors = (measurement: Measurement) => {
        const patronUe = parseFloat(measurement.patronUe) || 0;
        const ueTransmitter = parseFloat(measurement.ueTransmitter) || 0;
        const idealMa = parseFloat(measurement.idealMa) || 0;
        const maTransmitter = parseFloat(measurement.maTransmitter) || 0;
        
        const errorUe = ueTransmitter - patronUe; 
        const errorMa = maTransmitter - idealMa;
        
        // Divisor: 16 para mA (rango 4-20), 100 para Ohms o porcentajes
        const divisor = outputUnit === 'mA' ? 16 : 100; 
        const errorPercentage = (errorMa / divisor) * 100; 
        
        return {
            ...measurement,
            errorUe: errorUe.toFixed(3),
            errorMa: errorMa.toFixed(3),
            errorPercentage: errorPercentage.toFixed(2)
        };
    };

    const handleAddRow = () => {
        onMeasurementsChange([...measurements, { 
            percentage: "", idealUe: "", patronUe: "", ueTransmitter: "", 
            idealMa:"", maTransmitter: "", errorUe: "", errorMa: "", errorPercentage: "" 
        }]);
    };

    const handleDeleteRow = (indexToDelete: number) => {
        onMeasurementsChange(measurements.filter((_, index) => index !== indexToDelete));
    };

    const handleChange = (index: number, field: keyof Measurement, value: string) => {
        const newMeasurements = [...measurements];
        newMeasurements[index] = { ...newMeasurements[index], [field]: value };
        
        // Recalcular si cambian valores de entrada
        const relevantFields: (keyof Measurement)[] = ["patronUe", "ueTransmitter", "idealMa", "maTransmitter"];
        if (relevantFields.includes(field)) {
            newMeasurements[index] = calculateErrors(newMeasurements[index]);
        }
        
        onMeasurementsChange(newMeasurements);
    };

    const gridConfig = hasUeTransmitter ? 'lg:grid-cols-12' : 'lg:grid-cols-10';

    return (
        <div className="mt-8 w-full max-w-full overflow-hidden">
            <div className="bg-gradient-to-r from-teal-600 to-emerald-600 rounded-t-xl px-4 py-4 sm:px-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="p-2 bg-white/20 rounded-lg text-white">⚙️</div>
                        <h3 className="text-lg font-bold text-white uppercase">Mediciones Transmisor</h3>
                        
                        <div className="flex bg-black/20 p-1 rounded-lg">
                            <button onClick={() => setOutputUnit('mA')} className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${outputUnit === 'mA' ? 'bg-white text-teal-700 shadow' : 'text-white hover:bg-white/10'}`}>mA</button>
                            <button onClick={() => setOutputUnit('Ω')} className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${outputUnit === 'Ω' ? 'bg-white text-teal-700 shadow' : 'text-white hover:bg-white/10'}`}>Ω</button>
                        </div>

                        <label className="flex items-center cursor-pointer gap-2 bg-black/10 px-3 py-1.5 rounded-lg border border-white/10 hover:bg-black/20 transition-all">
                            <input 
                                type="checkbox" 
                                checked={hasUeTransmitter} 
                                onChange={(e) => setHasUeTransmitter(e.target.checked)}
                                className="w-4 h-4 accent-emerald-400"
                            />
                            <span className="text-[10px] font-bold text-white uppercase">Aplica UE Trans.</span>
                        </label>
                    </div>
                    
                    <button onClick={handleAddRow} className="w-full md:w-auto px-4 py-2 bg-white text-teal-700 hover:bg-teal-50 font-bold rounded-lg transition-all shadow-md active:scale-95 text-sm">+ FILA</button>
                </div>
            </div>

            <div className="bg-gray-100 lg:bg-white rounded-b-xl shadow-lg border border-gray-200">
                {/* Header Desktop */}
                <div className={`hidden lg:grid ${gridConfig} bg-gray-50 border-b border-gray-200 text-[10px] font-bold text-gray-600 uppercase`}>
                    <div className="px-1 py-4 text-center">Ideal UE</div>
                    <div className="px-1 py-4 text-center">Ideal {outputUnit}</div>
                    <div className="px-1 py-4 text-center">Patrón UE</div>
                    {hasUeTransmitter && <div className="px-1 py-4 text-center text-teal-600">UE Trans.</div>}
                    <div className="px-1 py-4 text-center">{outputUnit} Trans.</div>
                    <div className="px-1 py-4 text-center">% Rango</div>
                    
                    {hasUeTransmitter && <div className="px-1 py-4 text-center bg-red-50 text-red-700 border-l border-red-100">Err UE</div>}
                    <div className={`px-1 py-4 text-center bg-red-50 text-red-700 ${!hasUeTransmitter ? 'border-l border-red-100' : ''}`}>Err {outputUnit}</div>
                    <div className="px-1 py-4 text-center bg-red-50 text-red-700">Err %</div>
                    
                    <div className="px-1 py-4 text-center col-span-2">Acción</div>
                </div>

                {/* Filas */}
                <div className="p-4 lg:p-0 space-y-4 lg:space-y-0 lg:divide-y lg:divide-gray-200">
                    {measurements.map((m, index) => (
                        <div key={index} className={`bg-white p-4 lg:p-0 rounded-xl lg:rounded-none lg:grid ${gridConfig} lg:items-center hover:bg-gray-50 transition-colors`}>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:contents gap-3">
                                <div className="lg:px-1 lg:py-3"><InputField label="Ideal UE" unit="UE" value={m.idealUe} onChange={(e:any) => handleChange(index, 'idealUe', e.target.value)} /></div>
                                <div className="lg:px-1 lg:py-3"><InputField label={`Ideal ${outputUnit}`} unit={outputUnit} value={m.idealMa} onChange={(e:any) => handleChange(index, 'idealMa', e.target.value)} /></div>
                                <div className="lg:px-1 lg:py-3"><InputField label="Patrón UE" unit="UE" value={m.patronUe} onChange={(e:any) => handleChange(index, 'patronUe', e.target.value)} /></div>

                                {hasUeTransmitter && (
                                    <div className="lg:px-1 lg:py-3 border-teal-50 bg-teal-50/10"><InputField label="UE Trans." unit="UE" value={m.ueTransmitter} onChange={(e:any) => handleChange(index, 'ueTransmitter', e.target.value)} /></div>
                                )}

                                <div className="lg:px-1 lg:py-3"><InputField label={`${outputUnit} Trans.`} unit={outputUnit} value={m.maTransmitter} onChange={(e:any) => handleChange(index, 'maTransmitter', e.target.value)} /></div>
                                <div className="lg:px-1 lg:py-3"><InputField label="% Rango" unit="%" value={m.percentage} onChange={(e:any) => handleChange(index, 'percentage', e.target.value)} /></div>

                                {hasUeTransmitter && (
                                    <div className="lg:px-1 lg:py-3 lg:bg-red-50/20 border-l border-red-100"><InputField label="Err UE" unit="UE" value={m.errorUe} isError readOnly /></div>
                                )}
                                <div className={`lg:px-1 lg:py-3 lg:bg-red-50/20 ${!hasUeTransmitter ? 'border-l border-red-50' : ''}`}><InputField label={`Err ${outputUnit}`} unit={outputUnit} value={m.errorMa} isError readOnly /></div>
                                <div className="lg:px-1 lg:py-3 lg:bg-red-50/20"><InputField label="Err %" unit="%" value={m.errorPercentage} isError readOnly /></div>

                                <div className="col-span-2 md:col-span-3 lg:col-span-2 flex justify-center py-2 lg:py-0">
                                    <button onClick={() => handleDeleteRow(index)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default TransmitterTable;