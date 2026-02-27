import React from 'react';
import { Measurement } from '../components/TransmitterTable';

// Componente de celda simplificado para evitar el colapso
const TableInput = ({ value, onChange, unit, isError = false, readOnly = false }: any) => (
    <div className="relative min-w-[90px]">
        <input
            type="text" 
            value={value} 
            onChange={onChange} 
            readOnly={readOnly}
            className={`w-full px-2 py-1.5 pr-6 text-[11px] border rounded focus:outline-none focus:ring-1 
                ${isError ? 'border-red-200 bg-red-50 text-red-700 font-bold' 
                : 'border-gray-300 bg-white focus:ring-teal-500 text-gray-700'} 
                ${readOnly ? 'bg-gray-50 cursor-not-allowed' : ''}`}
            placeholder="0.00"
        />
        <span className={`absolute right-1 top-2 text-[8px] font-bold ${isError ? 'text-red-400' : 'text-gray-400'}`}>
            {unit}
        </span>
    </div>
);

const RtdTable: React.FC<any> = ({ measurements, onChange, hasUeTransmitter, onRemove }) => {
    return (
        <div className="w-full overflow-x-auto">
            {/* min-w-max asegura que la tabla no se encoja menos de lo que ocupan sus inputs */}
            <table className="w-full border-collapse min-w-max">
                <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-[10px] font-bold text-gray-500 uppercase">
                        <th className="px-2 py-3 text-center">Ideal UE</th>
                        <th className="px-2 py-3 text-center">Ideal mA</th>
                        <th className="px-2 py-3 text-center">Ideal Ω</th>
                        <th className="px-2 py-3 text-center">Patrón UE</th>
                        {hasUeTransmitter && <th className="px-2 py-3 text-center">UE Trans.</th>}
                        <th className="px-2 py-3 text-center">mA Sensor</th>
                        <th className="px-2 py-3 text-center">Ω Sensor</th>
                        <th className="px-2 py-3 text-center">% Rango</th>
                        {hasUeTransmitter && <th className="px-2 py-3 text-center bg-red-50 text-red-700">Err UE</th>}
                        <th className="px-2 py-3 text-center bg-red-50 text-red-700">Err mA</th>
                        <th className="px-2 py-3 text-center bg-red-50 text-red-700">Err %</th>
                        <th className="px-2 py-3 text-center">Acción</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                    {measurements.map((m: Measurement, index: number) => (
                        <tr key={index} className="hover:bg-gray-50 transition-colors">
                            <td className="p-2"><TableInput unit="UE" value={m.idealUE} onChange={(e:any) => onChange(index, 'idealUE', e.target.value)} /></td>
                            <td className="p-2"><TableInput unit="mA" value={m.idealmA} onChange={(e:any) => onChange(index, 'idealmA', e.target.value)} /></td>
                            <td className="p-2"><TableInput unit="Ω" value={m.idealohm} onChange={(e:any) => onChange(index, 'idealohm', e.target.value)} /></td>
                            <td className="p-2"><TableInput unit="UE" value={m.patronUE} onChange={(e:any) => onChange(index, 'patronUE', e.target.value)} /></td>
                            
                            {hasUeTransmitter && (
                                <td className="p-2"><TableInput unit="UE" value={m.ueTransmitter} onChange={(e:any) => onChange(index, 'ueTransmitter', e.target.value)} /></td>
                            )}
                            
                            <td className="p-2"><TableInput unit="mA" value={m.maTransmitter} onChange={(e:any) => onChange(index, 'maTransmitter', e.target.value)} /></td>
                            <td className="p-2"><TableInput unit="Ω" value={m.ohmTransmitter} onChange={(e:any) => onChange(index, 'ohmTransmitter', e.target.value)} /></td>
                            <td className="p-2"><TableInput unit="%" value={m.percentage} onChange={(e:any) => onChange(index, 'percentage', e.target.value)} /></td>
                            
                            {hasUeTransmitter && (
                                <td className="p-2 bg-red-50/30"><TableInput unit="UE" value={m.errorUE} isError readOnly /></td>
                            )}
                            
                            <td className="p-2 bg-red-50/30"><TableInput unit="mA" value={m.errormA} isError readOnly /></td>
                            <td className="p-2 bg-red-50/30"><TableInput unit="%" value={m.errorPercentage} isError readOnly /></td>
                            
                            <td className="p-2 text-center">
                                <button 
                                    onClick={() => onRemove(index)} 
                                    className="text-red-500 hover:bg-red-100 p-1.5 rounded-full transition-colors"
                                    title="Eliminar fila"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

export default RtdTable;