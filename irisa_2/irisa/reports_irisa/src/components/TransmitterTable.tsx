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
    setHasUeTransmitter: (value: boolean) => void;
}

const InputField = ({ label, value, onChange, unit, isError = false, readOnly = false }: any) => (
    <div className="flex flex-col w-full">
        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1 lg:hidden">{label}</label>
        <div className="relative w-full">
            <input
                type="text"
                value={value}
                onChange={onChange}
                readOnly={readOnly}
                className={`w-full px-2 py-2 pr-8 text-sm border rounded-lg focus:outline-none focus:ring-2 
                    ${isError ? 'border-red-200 bg-red-50 focus:ring-red-500' : 'border-gray-300 bg-white focus:ring-teal-500'} 
                    ${readOnly ? 'bg-gray-50 cursor-not-allowed text-gray-600' : ''}`}
                placeholder="0.00"
            />
            <span className={`absolute right-2 top-2 text-[10px] font-bold ${isError ? 'text-red-400' : 'text-gray-400'}`}>{unit}</span>
        </div>
    </div>
);

const TransmitterTable: React.FC<TransmitterTableProps> = ({ 
    measurements, onMeasurementsChange, outputUnit, setOutputUnit, hasUeTransmitter, setHasUeTransmitter 
}) => {

    const calculateErrors = (m: Measurement) => {
        const patronUe = parseFloat(m.patronUe) || 0;
        const ueTrans = parseFloat(m.ueTransmitter) || 0;
        const idealOut = parseFloat(m.idealMa) || 0;
        const realOut = parseFloat(m.maTransmitter) || 0;
        
        const errorUe = ueTrans - patronUe;
        const errorOut = realOut - idealOut;
        const divisor = outputUnit === 'mA' ? 16 : 100; // Span típico
        const errorPerc = (errorOut / divisor) * 100;

        return {
            ...m,
            errorUe: errorUe.toFixed(3),
            errorMa: errorOut.toFixed(3),
            errorPercentage: errorPerc.toFixed(2)
        };
    };

    const handleChange = (index: number, field: keyof Measurement, value: string) => {
        const newMeasurements = [...measurements];
        newMeasurements[index] = { ...newMeasurements[index], [field]: value };
        
        if (["patronUe", "ueTransmitter", "idealMa", "maTransmitter"].includes(field)) {
            newMeasurements[index] = calculateErrors(newMeasurements[index]);
        }
        onMeasurementsChange(newMeasurements);
    };

    const gridCols = hasUeTransmitter ? 'lg:grid-cols-12' : 'lg:grid-cols-10';

    return (
        <div className="mt-8 w-full overflow-hidden border border-gray-200 rounded-xl shadow-sm bg-white">
            {/* Header / Controls */}
            <div className="bg-slate-50 border-b border-gray-200 p-4 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <h3 className="font-bold text-gray-700 uppercase text-sm tracking-wider">Prueba de Salida</h3>
                    <div className="flex bg-gray-200 p-1 rounded-lg">
                        {(['mA', 'Ω'] as const).map(u => (
                            <button key={u} onClick={() => setOutputUnit(u)} 
                                className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${outputUnit === u ? 'bg-white text-teal-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                                {u}
                            </button>
                        ))}
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input type="checkbox" checked={hasUeTransmitter} onChange={e => setHasUeTransmitter(e.target.checked)} className="w-4 h-4 accent-teal-600" />
                        <span className="text-xs font-semibold text-gray-600 uppercase">Aplica UE</span>
                    </label>
                </div>
                <button onClick={() => onMeasurementsChange([...measurements, { percentage: "", idealUe: "", patronUe: "", ueTransmitter: "", idealMa:"", maTransmitter: "", errorUe: "", errorMa: "", errorPercentage: "" }])}
                    className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm">
                    + AÑADIR PUNTO
                </button>
            </div>

            {/* Table Header Desktop */}
            <div className={`hidden lg:grid ${gridCols} bg-gray-50 border-b text-[10px] font-bold text-gray-500 uppercase text-center`}>
                <div className="py-3">Ideal UE</div><div className="py-3">Ideal {outputUnit}</div><div className="py-3">Patrón UE</div>
                {hasUeTransmitter && <div className="py-3 text-teal-700 bg-teal-50/50">UE Trans.</div>}
                <div className="py-3">{outputUnit} Trans.</div><div className="py-3">% Rango</div>
                {hasUeTransmitter && <div className="py-3 bg-red-50 text-red-700">Err UE</div>}
                <div className="py-3 bg-red-50 text-red-700 border-l border-red-100">Err {outputUnit}</div>
                <div className="py-3 bg-red-50 text-red-700">Err %</div>
                <div className="py-3 col-span-2">Acciones</div>
            </div>

            {/* Rows */}
            <div className="divide-y divide-gray-100">
                {measurements.map((m, i) => (
                    <div key={i} className={`p-4 lg:p-0 lg:grid ${gridCols} lg:items-center hover:bg-gray-50 transition-colors`}>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:contents gap-4">
                            <div className="lg:px-1"><InputField label="Ideal UE" unit="UE" value={m.idealUe} onChange={(e:any) => handleChange(i, 'idealUe', e.target.value)} /></div>
                            <div className="lg:px-1"><InputField label={`Ideal ${outputUnit}`} unit={outputUnit} value={m.idealMa} onChange={(e:any) => handleChange(i, 'idealMa', e.target.value)} /></div>
                            <div className="lg:px-1"><InputField label="Patrón UE" unit="UE" value={m.patronUe} onChange={(e:any) => handleChange(i, 'patronUe', e.target.value)} /></div>
                            {hasUeTransmitter && <div className="lg:px-1 lg:bg-teal-50/20"><InputField label="UE Trans." unit="UE" value={m.ueTransmitter} onChange={(e:any) => handleChange(i, 'ueTransmitter', e.target.value)} /></div>}
                            <div className="lg:px-1"><InputField label={`${outputUnit} Trans.`} unit={outputUnit} value={m.maTransmitter} onChange={(e:any) => handleChange(i, 'maTransmitter', e.target.value)} /></div>
                            <div className="lg:px-1"><InputField label="% Rango" unit="%" value={m.percentage} onChange={(e:any) => handleChange(i, 'percentage', e.target.value)} /></div>
                            {hasUeTransmitter && <div className="lg:px-1 lg:bg-red-50/10"><InputField label="Err UE" unit="UE" value={m.errorUe} isError readOnly /></div>}
                            <div className="lg:px-1 lg:bg-red-50/10"><InputField label={`Err ${outputUnit}`} unit={outputUnit} value={m.errorMa} isError readOnly /></div>
                            <div className="lg:px-1 lg:bg-red-50/10"><InputField label="Err %" unit="%" value={m.errorPercentage} isError readOnly /></div>
                            <div className="col-span-2 lg:col-span-2 flex justify-center">
                                <button onClick={() => onMeasurementsChange(measurements.filter((_, idx) => idx !== i))} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TransmitterTable;