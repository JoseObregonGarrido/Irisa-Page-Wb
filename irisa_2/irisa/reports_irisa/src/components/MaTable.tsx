import React from 'react';
import { Measurement } from './TransmitterTable';

interface MaTableProps {
    measurements: Measurement[];
    onChange: (index: number, field: keyof Measurement, value: string) => void;
    hasUeTransmitter: boolean;
    onRemove: (index: number) => void;
}

const TableInput = ({ value, onChange, unit, isError = false, readOnly = false, bgColor = 'bg-white' }: any) => (
    <div className="relative min-w-[85px]">
        <input
            type="text" 
            value={value} 
            onChange={onChange} 
            readOnly={readOnly}
            className={`w-full px-2 py-1.5 pr-7 text-[11px] border rounded focus:outline-none focus:ring-1 
                ${isError ? 'border-red-200 bg-red-50 text-red-700 font-bold' 
                : `border-gray-300 ${bgColor} focus:ring-teal-500 text-gray-700`} 
                ${readOnly ? 'bg-gray-50 cursor-not-allowed' : ''}`}
            placeholder="0.00"
        />
        <span className={`absolute right-1.5 top-2 text-[8px] font-bold ${isError ? 'text-red-400' : 'text-gray-400'}`}>
            {unit}
        </span>
    </div>
);

const MaTable: React.FC<MaTableProps> = ({ measurements, onChange, hasUeTransmitter, onRemove }) => {
    return (
        <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-max"> 
                <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
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
                        <th className="px-3 py-4 text-center bg-red-50 text-red-700">% Error</th>
                        <th className="px-3 py-4 text-center">Acción</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                    {measurements.map((m, index) => (
                        <tr key={index} className="hover:bg-gray-50 transition-colors">
                            <td className="p-2">
                                <TableInput unit="%" value={m.percentage} onChange={(e:any) => onChange(index, 'percentage', e.target.value)} />
                            </td>
                            {hasUeTransmitter && (
                                <>
                                    <td className="p-2"><TableInput unit="UE" value={m.idealUE} onChange={(e:any) => onChange(index, 'idealUE', e.target.value)} /></td>
                                    <td className="p-2"><TableInput unit="UE" value={m.patronUE} onChange={(e:any) => onChange(index, 'patronUE', e.target.value)} /></td>
                                </>
                            )}
                            <td className="p-2"><TableInput unit="mA" value={m.idealmA} onChange={(e:any) => onChange(index, 'idealmA', e.target.value)} /></td>
                            <td className="p-2"><TableInput unit="mA" value={m.maTransmitter} onChange={(e:any) => onChange(index, 'maTransmitter', e.target.value)} bgColor="bg-teal-50" /></td>
                            <td className="p-2 bg-red-50/20"><TableInput unit="mA" value={m.errormA} readOnly isError /></td>
                            <td className="p-2 bg-red-50/20"><TableInput unit="%" value={m.errorPercentage} readOnly isError /></td>
                            <td className="p-2 text-center">
                                <button 
                                    onClick={() => onRemove(index)} 
                                    className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default MaTable;