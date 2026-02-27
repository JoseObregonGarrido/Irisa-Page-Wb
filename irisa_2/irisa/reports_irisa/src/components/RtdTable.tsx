import React from 'react';
import { Measurement } from '../components/TransmitterTable';

interface RtdTableProps {
    measurements: Measurement[];
    onChange: (index: number, field: keyof Measurement, value: string) => void;
    hasUeTransmitter: boolean;
    onRemove: (index: number) => void;
}

const TableInput = ({ label, value, onChange, unit, isError = false, readOnly = false, bgColor = 'bg-white' }: any) => (
    <div className="flex flex-col w-full">
        {/* Label visible solo en mobile */}
        <label className="block lg:hidden text-[10px] font-bold text-gray-500 mb-1 uppercase tracking-wider">{label}</label>
        <div className="relative w-full">
            <input
                type="text" 
                value={value} 
                onChange={onChange} 
                readOnly={readOnly}
                className={`w-full px-3 py-2 pr-8 text-xs border rounded-lg focus:outline-none focus:ring-2 transition-all
                    ${isError ? 'border-red-200 bg-red-50 focus:ring-red-500 font-bold text-red-700' 
                    : `border-gray-300 ${bgColor} focus:ring-teal-500 text-gray-700`} 
                    ${readOnly ? 'bg-gray-50 cursor-not-allowed shadow-inner' : 'shadow-sm'}`}
                placeholder="0.00"
            />
            <span className={`absolute right-2 top-2.5 text-[10px] font-bold ${isError ? 'text-red-400' : 'text-gray-400'}`}>
                {unit}
            </span>
        </div>
    </div>
);

const RtdTable: React.FC<RtdTableProps> = ({ measurements, onChange, hasUeTransmitter, onRemove }) => {
    return (
        <div className="w-full">
            {/* VISTA DESKTOP (TABLA) */}
            <div className="hidden lg:block overflow-x-auto border border-gray-200 rounded-xl">
                <table className="w-full text-left border-collapse min-w-max">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                            <th className="px-2 py-4 text-center">Ideal UE</th>
                            <th className="px-2 py-4 text-center">Ideal mA</th>
                            <th className="px-2 py-4 text-center">Ideal Ω</th>
                            <th className="px-2 py-4 text-center">Patrón UE</th>
                            {hasUeTransmitter && <th className="px-2 py-4 text-center">UE Tx.</th>}
                            <th className="px-2 py-4 text-center">mA Sensor</th>
                            <th className="px-2 py-4 text-center">Ω Sensor</th>
                            <th className="px-2 py-4 text-center">% Rango</th>
                            <th className="px-2 py-4 text-center bg-red-50 text-red-700">Err mA</th>
                            <th className="px-2 py-4 text-center bg-red-50 text-red-700">Err %</th>
                            <th className="px-2 py-4 text-center text-gray-400">Acción</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                        {measurements.map((m: Measurement, index: number) => (
                            <tr key={index} className="hover:bg-gray-50 transition-colors">
                                <td className="p-2"><TableInput unit="UE" value={m.idealUE} onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(index, 'idealUE', e.target.value)} /></td>
                                <td className="p-2"><TableInput unit="mA" value={m.idealmA} onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(index, 'idealmA', e.target.value)} /></td>
                                <td className="p-2"><TableInput unit="Ω" value={m.idealohm} onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(index, 'idealohm', e.target.value)} /></td>
                                <td className="p-2"><TableInput unit="UE" value={m.patronUE} onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(index, 'patronUE', e.target.value)} /></td>
                                {hasUeTransmitter && <td className="p-2"><TableInput unit="UE" value={m.ueTransmitter} onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(index, 'ueTransmitter', e.target.value)} /></td>}
                                <td className="p-2"><TableInput unit="mA" value={m.maTransmitter} onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(index, 'maTransmitter', e.target.value)} /></td>
                                <td className="p-2"><TableInput unit="Ω" value={m.ohmTransmitter} onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(index, 'ohmTransmitter', e.target.value)} /></td>
                                <td className="p-2"><TableInput unit="%" value={m.percentage} onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(index, 'percentage', e.target.value)} /></td>
                                <td className="p-2 bg-red-50/10"><TableInput unit="mA" value={m.errormA} readOnly isError /></td>
                                <td className="p-2 bg-red-50/10"><TableInput unit="%" value={m.errorPercentage} readOnly isError /></td>
                                <td className="p-2 text-center">
                                    <button onClick={() => onRemove(index)} className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-full transition-all">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* VISTA MOBILE (CARDS) */}
            <div className="lg:hidden space-y-6">
                {measurements.map((m: Measurement, index: number) => (
                    <div key={index} className="bg-white p-5 rounded-2xl shadow-md border border-gray-100 relative overflow-hidden">
                        {/* Indicador de fila */}
                        <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                        
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-widest">
                                Medición RTD #{index + 1}
                            </span>
                            <button 
                                onClick={() => onRemove(index)} 
                                className="bg-red-50 text-red-500 p-2 rounded-lg active:scale-95 transition-transform"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <TableInput label="Ideal UE" unit="UE" value={m.idealUE} onChange={(e: any) => onChange(index, 'idealUE', e.target.value)} />
                            <TableInput label="Ideal mA" unit="mA" value={m.idealmA} onChange={(e: any) => onChange(index, 'idealmA', e.target.value)} />
                            <TableInput label="Ideal Ω" unit="Ω" value={m.idealohm} onChange={(e: any) => onChange(index, 'idealohm', e.target.value)} />
                            <TableInput label="Patrón UE" unit="UE" value={m.patronUE} onChange={(e: any) => onChange(index, 'patronUE', e.target.value)} />
                            
                            {hasUeTransmitter && (
                                <TableInput label="UE Transmisor" unit="UE" value={m.ueTransmitter} onChange={(e: any) => onChange(index, 'ueTransmitter', e.target.value)} />
                            )}
                            
                            <TableInput label="mA Sensor" unit="mA" value={m.maTransmitter} onChange={(e: any) => onChange(index, 'maTransmitter', e.target.value)} />
                            <TableInput label="Ω Sensor" unit="Ω" value={m.ohmTransmitter} onChange={(e: any) => onChange(index, 'ohmTransmitter', e.target.value)} />
                            <TableInput label="% Rango" unit="%" value={m.percentage} onChange={(e: any) => onChange(index, 'percentage', e.target.value)} />
                            
                            {/* Resultados de error destacados */}
                            <div className="grid grid-cols-2 gap-2 mt-2 pt-4 border-t border-gray-100 col-span-full">
                                <TableInput label="Error mA" unit="mA" value={m.errormA} readOnly isError />
                                <TableInput label="Error %" unit="%" value={m.errorPercentage} readOnly isError />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RtdTable;