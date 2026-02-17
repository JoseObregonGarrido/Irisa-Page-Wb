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
}

// 1. COMPONENTE FUERA PARA EVITAR PERDER EL FOCO
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

const TransmitterTable: React.FC<TransmitterTableProps> = ({ measurements, onMeasurementsChange }) => {
    
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
        const errorMa = idealMa - maTransmitter;    
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

    return (
        <div className="mt-8 w-full max-w-full overflow-hidden">
            <div className="bg-gradient-to-r from-teal-600 to-emerald-600 rounded-t-xl px-4 py-4 sm:px-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center">
                        <div className="p-2 bg-white/20 rounded-lg mr-3">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <h3 className="text-lg sm:text-xl font-bold text-white uppercase tracking-tight">Mediciones</h3>
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
                <div className="hidden lg:grid grid-cols-11 bg-gray-50 border-b border-gray-200 text-[10px] font-bold text-gray-600 uppercase tracking-wider">
                    <div className="px-2 py-4 text-center">Ideal UE</div>
                    <div className="px-2 py-4 text-center">Ideal mA</div>
                    <div className="px-2 py-4 text-center">Patrón UE</div>
                    <div className="px-2 py-4 text-center">UE Trans.</div>
                    <div className="px-2 py-4 text-center">mA Trans.</div>
                    <div className="px-2 py-4 text-center">% Rango</div>
                    <div className="px-2 py-4 text-center bg-red-50">Err UE</div>
                    <div className="px-2 py-4 text-center bg-red-50">Err mA</div>
                    <div className="px-2 py-4 text-center bg-red-50">Err %</div>
                    <div className="px-2 py-4 text-center col-span-2">Acción</div>
                </div>

                <div className="p-4 lg:p-0 space-y-4 lg:space-y-0 lg:divide-y lg:divide-gray-200">
                    {measurements.map((m, index) => (
                        <div key={index} className="bg-white p-4 lg:p-0 rounded-xl lg:rounded-none shadow-sm lg:shadow-none border lg:border-none border-gray-200 lg:grid lg:grid-cols-11 lg:items-center hover:bg-gray-50 transition-colors">
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:contents gap-3">
                                <div className="lg:px-2 lg:py-3 text-center">
                                    <InputField label="Ideal UE" unit="UE" value={m.idealUe} onChange={(e:any) => handleChange(index, 'idealUe', e.target.value)} />
                                </div>
                                <div className="lg:px-2 lg:py-3 text-center">
                                    <InputField label="Ideal mA" unit="mA" value={m.idealMa} onChange={(e:any) => handleChange(index, 'idealMa', e.target.value)} />
                                </div>
                                <div className="lg:px-2 lg:py-3 text-center">
                                    <InputField label="Patrón UE" unit="UE" value={m.patronUe} onChange={(e:any) => handleChange(index, 'patronUe', e.target.value)} />
                                </div>
                                <div className="lg:px-2 lg:py-3 text-center">
                                    <InputField label="UE Trans." unit="UE" value={m.ueTransmitter} onChange={(e:any) => handleChange(index, 'ueTransmitter', e.target.value)} />
                                </div>
                                <div className="lg:px-2 lg:py-3 text-center">
                                    <InputField label="mA Trans." unit="mA" value={m.maTransmitter} onChange={(e:any) => handleChange(index, 'maTransmitter', e.target.value)} />
                                </div>
                                <div className="lg:px-2 lg:py-3 text-center">
                                    <InputField label="% Rango" unit="%" value={m.percentage} onChange={(e:any) => handleChange(index, 'percentage', e.target.value)} />
                                </div>
                                <div className="lg:px-2 lg:py-3 text-center lg:bg-red-50/30">
                                    <InputField label="Err UE" unit="UE" value={m.errorUe} isError readOnly />
                                </div>
                                <div className="lg:px-2 lg:py-3 text-center lg:bg-red-50/30">
                                    <InputField label="Err mA" unit="mA" value={m.errorMa} isError readOnly />
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
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                Rango UE: <span className="text-blue-700">
                                    {Math.min(...measurements.map(m => parseFloat(m.idealUe) || 0))} - {Math.max(...measurements.map(m => parseFloat(m.idealUe) || 0))}
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default TransmitterTable;