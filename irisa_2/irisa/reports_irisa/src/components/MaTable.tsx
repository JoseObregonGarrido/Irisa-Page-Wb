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

const MaTable: React.FC<any> = ({ measurements, onChange, hasUeTransmitter, onRemove }) => {
    // Definimos la clase de grid según las columnas necesarias
    const gridColsClass = hasUeTransmitter ? 'lg:grid-cols-9' : 'lg:grid-cols-7';

    return (
        <div className="overflow-x-auto w-full">
            <div className="min-w-full lg:min-w-[1000px] inline-block align-middle">
                {/* HEADER */}
                <div className={`hidden lg:grid ${gridColsClass} bg-gray-50 border-b border-gray-200 text-[10px] font-bold text-gray-500 uppercase tracking-wider`}>
                    <div className="px-2 py-4 text-center">Ideal UE</div>
                    <div className="px-2 py-4 text-center">Ideal mA</div>
                    <div className="px-2 py-4 text-center">Patrón UE</div>
                    {hasUeTransmitter && <div className="px-2 py-4 text-center">UE trans.</div>}
                    <div className="px-2 py-4 text-center">mA trans.</div>
                    <div className="px-2 py-4 text-center">% Rango</div>
                    {hasUeTransmitter && <div className="px-2 py-4 text-center bg-red-50 text-red-700">Err UE</div>}
                    <div className="px-2 py-4 text-center bg-red-50 text-red-700">Err mA</div>
                    <div className="px-2 py-4 text-center bg-red-50 text-red-700">Err %</div>
                    <div className="px-2 py-4 text-center">Acción</div>
                </div>

                {/* FILAS - Quitamos el style de JS y usamos clases puras */}
                <div className="bg-white divide-y divide-gray-200">
                    {measurements.map((m: Measurement, index: number) => (
                        <div key={index} className={`grid grid-cols-2 sm:grid-cols-3 ${gridColsClass} p-4 lg:p-0 lg:items-center hover:bg-gray-50 transition-colors`}>
                            <div className="lg:p-2"><InputField label="Ideal UE" unit="UE" value={m.idealUE} onChange={(e:any) => onChange(index, 'idealUE', e.target.value)} /></div>
                            <div className="lg:p-2"><InputField label="Ideal mA" unit="mA" value={m.idealmA} onChange={(e:any) => onChange(index, 'idealmA', e.target.value)} /></div>
                            <div className="lg:p-2"><InputField label="Patrón UE" unit="UE" value={m.patronUE} onChange={(e:any) => onChange(index, 'patronUE', e.target.value)} /></div>
                            {hasUeTransmitter && <div className="lg:p-2"><InputField label="UE trans." unit="UE" value={m.ueTransmitter} onChange={(e:any) => onChange(index, 'ueTransmitter', e.target.value)} /></div>}
                            <div className="lg:p-2"><InputField label="mA trans." unit="mA" value={m.maTransmitter} onChange={(e:any) => onChange(index, 'maTransmitter', e.target.value)} /></div>
                            <div className="lg:p-2"><InputField label="% Rango" unit="%" value={m.percentage} onChange={(e:any) => onChange(index, 'percentage', e.target.value)} /></div>
                            {hasUeTransmitter && <div className="lg:p-2 lg:bg-red-50/30"><InputField label="Err UE" unit="UE" value={m.errorUE} isError readOnly /></div>}
                            <div className="lg:p-2 lg:bg-red-50/30"><InputField label="Err mA" unit="mA" value={m.errormA} isError readOnly /></div>
                            <div className="lg:p-2 lg:bg-red-50/30"><InputField label="Err %" unit="%" value={m.errorPercentage} isError readOnly /></div>
                            <div className="flex justify-center items-center py-2 lg:py-0 col-span-2 sm:col-span-3 lg:col-span-1">
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

export default MaTable;