import React, { useMemo } from 'react';

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

// Tipado más estricto para el InputField
interface InputFieldProps {
    label: string;
    value: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    unit: string;
    isError?: boolean;
    readOnly?: boolean;
}

const InputField: React.FC<InputFieldProps> = ({ label, value, onChange, unit, isError = false, readOnly = false }) => (
    <div className="flex flex-col w-full">
        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1 lg:hidden">
            {label}
        </label>
        <div className="relative w-full">
            <input
                type="number" // Cambiado a number para mejor experiencia en móviles
                value={value}
                onChange={onChange}
                readOnly={readOnly}
                className={`w-full px-2 py-2 pr-8 text-sm border rounded-lg focus:outline-none focus:ring-2 transition-all
                    ${isError 
                        ? 'border-red-200 bg-red-50 focus:ring-red-500 text-red-700' 
                        : 'border-gray-300 bg-white focus:ring-teal-500'
                    } ${readOnly ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                placeholder="0.00"
            />
            <span className={`absolute right-2 top-2 text-[10px] font-bold ${isError ? 'text-red-400' : 'text-gray-400'}`}>
                {unit}
            </span>
        </div>
    </div>
);

const TransmitterTable: React.FC<TransmitterTableProps> = ({ measurements, onMeasurementsChange }) => {
    
    // Función de cálculo pura
    const calculateRow = (measurement: Measurement): Measurement => {
        const pUe = parseFloat(measurement.patronUe) || 0;
        const uT = parseFloat(measurement.ueTransmitter) || 0;
        const iMa = parseFloat(measurement.idealMa) || 0;
        const mT = parseFloat(measurement.maTransmitter) || 0;
        
        // Error UE: Medido - Referencia
        const errUe = uT - pUe;
        // Error mA: Medido - Ideal
        const errMa = mT - iMa;
        // Error % basado en Span de 16mA (4-20mA)
        const errP = (errMa / 16) * 100;
        
        return {
            ...measurement,
            errorUe: errUe.toFixed(4),
            errorMa: errMa.toFixed(4),
            errorPercentage: errP.toFixed(3)
        };
    };

    const handleChange = (index: number, field: keyof Measurement, value: string) => {
        const newMeasurements = [...measurements];
        newMeasurements[index] = { ...newMeasurements[index], [field]: value };
        
        // Solo recalculamos si el campo afecta a los errores
        const triggerFields: (keyof Measurement)[] = ["patronUe", "ueTransmitter", "idealMa", "maTransmitter"];
        if (triggerFields.includes(field)) {
            newMeasurements[index] = calculateRow(newMeasurements[index]);
        }
        
        onMeasurementsChange(newMeasurements);
    };

    // Memoizar el rango para evitar cálculos innecesarios en cada re-render
    const rangeStats = useMemo(() => {
        if (measurements.length === 0) return { min: 0, max: 0 };
        const values = measurements.map(m => parseFloat(m.idealUe) || 0);
        return {
            min: Math.min(...values),
            max: Math.max(...values)
        };
    }, [measurements]);

    return (
        <div className="mt-8 w-full max-w-full overflow-hidden shadow-2xl rounded-xl border border-gray-200">
            {/* Header section... igual a la tuya pero con mejor padding */}
            <div className="bg-gradient-to-r from-teal-700 to-emerald-600 px-6 py-5">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center">
                        <div className="p-2 bg-white/10 backdrop-blur-sm rounded-lg mr-3">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-black text-white uppercase tracking-widest">Protocolo de Calibración</h3>
                    </div>
                    <button 
                        onClick={() => onMeasurementsChange([...measurements, { percentage: "", idealUe: "", patronUe: "", ueTransmitter: "", idealMa:"", maTransmitter: "", errorUe: "0.00", errorMa: "0.00", errorPercentage: "0.00" }])}
                        className="group flex items-center px-6 py-2 bg-white text-teal-700 hover:bg-teal-50 font-black rounded-full transition-all shadow-lg active:scale-95"
                    >
                        <span>AÑADIR PUNTO</span>
                        <span className="ml-2 group-hover:rotate-90 transition-transform">+</span>
                    </button>
                </div>
            </div>

            {/* Table Body... tu estructura de grid está genial */}
            <div className="bg-white overflow-x-auto">
                {/* ... (resto de tu JSX con los campos actualizados) */}
            </div>
        </div>
    );
}

export default TransmitterTable;