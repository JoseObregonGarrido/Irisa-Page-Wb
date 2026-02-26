import React from 'react';
import { Measurement } from '../components/TransmitterTable';

const InputField = ({ label, value, onChange, unit, isError = false, readOnly = false }: any) => (
    <div className="flex flex-col w-full">
        <label className="block text-[10px] font-bold text-gray-500 mb-1 lg:hidden">{label}</label>
        <div className="relative w-full">
            <input
                type="text" value={value} onChange={onChange} readOnly={readOnly}
                className={`w-full px-2 py-2 pr-7 text-xs border rounded-lg focus:outline-none focus:ring-2 
                    ${isError ? 'border-red-200 bg-red-50 focus:ring-red-500 font-bold text-red-700' 
                    : 'border-gray-300 bg-white focus:ring-teal-500 text-gray-700'} ${readOnly ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                placeholder="0.00"
            />
            <span className={`absolute right-1.5 top-2.5 text-[9px] font-bold ${isError ? 'text-red-400' : 'text-gray-400'}`}>{unit}</span>
        </div>
    </div>
);

const RtdTable: React.FC<any> = ({ measurements, onChange, hasUeTransmitter, onRemove }) => {
    const colsCount = 9 + (hasUeTransmitter ? 2 : 0);
    const gridCols = {
        9: 'lg:grid-cols-9',
        10: 'lg:grid-cols-10',
        11: 'lg:grid-cols-11'
    }[colsCount] || 'lg:grid-cols-11';

    return (
        <div className="overflow-x-auto">
            <div className="min-w-full lg:min-w-[1350px] inline-block align-middle">
                <div className={`hidden lg:grid ${gridCols} bg-gray-50 border-b border-gray-200 text-[10px] font-bold text-gray-500 tracking-wider`}>
                    <div className="px-2 py-4 text-center">Ideal UE</div>
                    <div className="px-2 py-4 text-center">Ideal mA</div>
                    <div className="px-2 py-4 text-center">Ideal Ω</div>
                    <div className="px-2 py-4 text-center">Patrón UE</div>
                    {hasUeTransmitter && <div className="px-2 py-4 text-center">UE transmisor</div>}
                    <div className="px-2 py-4 text-center">mA sensor</div>
                    <div className="px-2 py-4 text-center">Ω sensor</div>
                    <div className="px-2 py-4 text-center">% Rango</div>
                    {hasUeTransmitter && <div className="px-2 py-4 text-center bg-red-50 text-red-700">Error UE</div>}
                    <div className="px-2 py-4 text-center bg-red-50 text-red-700">Error mA</div>
                    <div className="px-2 py-4 text-center bg-red-50 text-red-700">Error %</div>
                    <div className="px-2 py-4 text-center">Acción</div>
                </div>

                <div className="p-4 lg:p-0 space-y-4 lg:space-y-0 lg:divide-y lg:divide-gray-200 bg-gray-50 lg:bg-white">
                    {measurements.map((m: Measurement, index: number) => (
                        <div key={index} className={`bg-white p-4 lg:p-0 grid grid-cols-2 sm:grid-cols-3 ${gridCols} lg:items-center hover:bg-emerald-50/30 transition-colors`}>
                            <div className="lg:px-2 lg:py-3"><InputField label="Ideal UE" unit="UE" value={m.idealUE} onChange={(e:any) => onChange(index, 'idealUE', e.target.value)} /></div>
                            <div className="lg:px-2 lg:py-3"><InputField label="Ideal mA" unit="mA" value={m.idealmA} onChange={(e:any) => onChange(index, 'idealmA', e.target.value)} /></div>
                            <div className="lg:px-2 lg:py-3"><InputField label="Ideal Ω" unit="Ω" value={m.idealohm} onChange={(e:any) => onChange(index, 'idealohm', e.target.value)} /></div>
                            <div className="lg:px-2 lg:py-3"><InputField label="Patrón UE" unit="UE" value={m.patronUE} onChange={(e:any) => onChange(index, 'patronUE', e.target.value)} /></div>
                            {hasUeTransmitter && <div className="lg:px-2 lg:py-3"><InputField label="UE transmisor" unit="UE" value={m.ueTransmitter} onChange={(e:any) => onChange(index, 'ueTransmitter', e.target.value)} /></div>}
                            <div className="lg:px-2 lg:py-3"><InputField label="mA sensor" unit="mA" value={m.maTransmitter} onChange={(e:any) => onChange(index, 'maTransmitter', e.target.value)} /></div>
                            <div className="lg:px-2 lg:py-3"><InputField label="Ω sensor" unit="Ω" value={m.ohmTransmitter} onChange={(e:any) => onChange(index, 'ohmTransmitter', e.target.value)} /></div>
                            <div className="lg:px-2 lg:py-3"><InputField label="% Rango" unit="%" value={m.percentage} onChange={(e:any) => onChange(index, 'percentage', e.target.value)} /></div>
                            {hasUeTransmitter && <div className="lg:px-2 lg:py-3 lg:bg-red-50/20"><InputField label="Error UE" unit="UE" value={m.errorUE} isError readOnly /></div>}
                            <div className="lg:px-2 lg:py-3 lg:bg-red-50/20"><InputField label="Error mA" unit="mA" value={m.errormA} isError readOnly /></div>
                            <div className="lg:px-2 lg:py-3 lg:bg-red-50/20"><InputField label="Error %" unit="%" value={m.errorPercentage} isError readOnly /></div>
                            {/* CORRECCIÓN AQUÍ: Quitamos los col-span para que sea una columna normal en LG */}
                            <div className="flex justify-center items-center lg:py-3">
                                <button onClick={() => onRemove(index)} className="text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default RtdTable;