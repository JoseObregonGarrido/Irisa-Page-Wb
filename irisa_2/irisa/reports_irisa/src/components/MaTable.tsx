import React from 'react';
import { Measurement } from './TransmitterTable';

interface MaTableProps {
    measurements: Measurement[];
    onChange: (index: number, field: keyof Measurement, value: string) => void;
    hasUeTransmitter: boolean;
    onRemove: (index: number) => void;
}

const TableInput = ({ label, value, onChange, unit, isError = false, readOnly = false, bgColor = 'bg-white' }: any) => (
    <div className="flex flex-col w-full">
        {/* Label visible solo en mobile */}
        <label className="block lg:hidden text-[10px] font-bold text-gray-400 mb-1 uppercase tracking-wider">{label}</label>
        <div className="relative w-full">
            <input
                type="text" value={value} onChange={onChange} readOnly={readOnly}
                className={`w-full px-2 py-2 pr-7 text-xs border rounded-lg focus:outline-none focus:ring-2 
                    ${isError ? 'border-red-200 bg-red-50 focus:ring-red-500 font-bold text-red-700' 
                    : `border-gray-300 ${bgColor} focus:ring-teal-500 text-gray-700`} ${readOnly ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                placeholder="0.00"
            />
            <span className={`absolute right-1.5 top-2.5 text-[9px] font-bold ${isError ? 'text-red-400' : 'text-gray-400'}`}>{unit}</span>
        </div>
    </div>
);

const MaTable: React.FC<MaTableProps> = ({ measurements, onChange, hasUeTransmitter, onRemove }) => {
    return (
        <div className="w-full">
            {/* VISTA DESKTOP (TABLA) - Se oculta en mobile (hidden lg:block) */}
            <div className="hidden lg:block overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-max">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr className="text-[10px] font-bold text-gray-500 uppercase">
                            <th className="px-3 py-4 text-center">%</th>
                            {hasUeTransmitter && (
                                <>
                                    <th className="px-3 py-4 text-center">Ideal UE</th>
                                    <th className="px-3 py-4 text-center">Patrón UE</th>
                                </>
                            )}
                            <th className="px-3 py-4 text-center">Ideal mA</th>
                            <th className="px-3 py-4 text-center">Tx mA</th>
                            <th className="px-3 py-4 text-center bg-red-50 text-red-700">Err mA</th>
                            <th className="px-3 py-4 text-center bg-red-50 text-red-700">% Err</th>
                            <th className="px-3 py-4 text-center">Acción</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {measurements.map((m: Measurement, index: number) => (
                            <tr key={index} className="hover:bg-gray-50">
                                <td className="p-2"><TableInput unit="%" value={m.percentage} onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(index, 'percentage', e.target.value)} /></td>
                                {hasUeTransmitter && (
                                    <>
                                        <td className="p-2"><TableInput unit="UE" value={m.idealUE} onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(index, 'idealUE', e.target.value)} /></td>
                                        <td className="p-2"><TableInput unit="UE" value={m.patronUE} onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(index, 'patronUE', e.target.value)} /></td>
                                    </>
                                )}
                                <td className="p-2"><TableInput unit="mA" value={m.idealmA} onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(index, 'idealmA', e.target.value)} /></td>
                                <td className="p-2"><TableInput unit="mA" value={m.maTransmitter} onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(index, 'maTransmitter', e.target.value)} bgColor="bg-teal-50" /></td>
                                <td className="p-2"><TableInput unit="mA" value={m.errormA} readOnly isError /></td>
                                <td className="p-2"><TableInput unit="%" value={m.errorPercentage} readOnly isError /></td>
                                <td className="p-2 text-center">
                                    <button onClick={() => onRemove(index)} className="text-red-500 p-2 hover:bg-red-50 rounded-full">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* VISTA MOBILE (CARDS) - Se oculta en desktop (block lg:hidden) */}
            <div className="block lg:hidden space-y-4 p-4 bg-gray-50">
                {measurements.map((m: Measurement, index: number) => (
                    <div key={index} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 relative">
                        <div className="absolute top-2 right-2">
                            <button onClick={() => onRemove(index)} className="text-red-400 p-2"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <TableInput label="% Rango" unit="%" value={m.percentage} onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(index, 'percentage', e.target.value)} />
                            <div className="invisible lg:block">spacer</div>
                            {hasUeTransmitter && (
                                <>
                                    <TableInput label="Ideal UE" unit="UE" value={m.idealUE} onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(index, 'idealUE', e.target.value)} />
                                    <TableInput label="Patrón UE" unit="UE" value={m.patronUE} onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(index, 'patronUE', e.target.value)} />
                                </>
                            )}
                            <TableInput label="Ideal mA" unit="mA" value={m.idealmA} onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(index, 'idealmA', e.target.value)} />
                            <TableInput label="Tx mA" unit="mA" value={m.maTransmitter} onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(index, 'maTransmitter', e.target.value)} bgColor="bg-teal-50" />
                            <TableInput label="Error mA" unit="mA" value={m.errormA} readOnly isError />
                            <TableInput label="% Error" unit="%" value={m.errorPercentage} readOnly isError />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MaTable;