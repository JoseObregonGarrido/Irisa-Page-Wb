import React from 'react';
import { InputField } from './InputField';

export const TableMV = ({ measurements, onMeasurementsChange, hasUeTransmitter }: any) => {
    // Definimos columnas: 8 base + 2 si hay UE + 2 para checkboxes = 12
    const gridCols = hasUeTransmitter ? 'lg:grid-cols-12' : 'lg:grid-cols-10';

    const handleChange = (index: number, field: string, value: any) => {
        const newM = [...measurements];
        const updatedRow = { ...newM[index], [field]: value };
        
        // Lógica de cálculo para mV
        const idealMV = parseFloat(updatedRow.idealMV) || 0;
        const sensorMV = parseFloat(updatedRow.sensorMV) || 0;
        const idealmA = parseFloat(updatedRow.idealmA) || 0;
        const maTrans = parseFloat(updatedRow.maTransmitter) || 0;

        updatedRow.errorMV = (sensorMV - idealMV).toFixed(3);
        updatedRow.errormA = (maTrans - idealmA).toFixed(3);
        updatedRow.errorPercentage = (((maTrans - idealmA) / 16) * 100).toFixed(2);

        newM[index] = updatedRow;
        onMeasurementsChange(newM);
    };

    return (
        <div className="overflow-x-auto">
            <div className={`min-w-full lg:min-w-[1200px]`}>
                {/* Header Desktop */}
                <div className={`hidden lg:grid ${gridCols} bg-gray-50 border-b border-gray-200 text-[10px] font-bold text-gray-500 uppercase tracking-wider`}>
                    <div className="px-2 py-4 text-center">Ideal UE</div>
                    <div className="px-2 py-4 text-center">Ideal mA</div>
                    <div className="px-2 py-4 text-center">Ideal mV</div>
                    <div className="px-2 py-4 text-center">Tipo Sensor</div>
                    <div className="px-2 py-4 text-center">Patrón UE</div>
                    {hasUeTransmitter && <div className="px-2 py-4 text-center">UE Trans.</div>}
                    <div className="px-2 py-4 text-center">mA Salida</div>
                    <div className="px-2 py-4 text-center">mV Sensor</div>
                    {hasUeTransmitter && <div className="px-2 py-4 text-center bg-red-50 text-red-700">Err UE</div>}
                    <div className="px-2 py-4 text-center bg-red-50 text-red-700">Err mV</div>
                    <div className="px-2 py-4 text-center bg-red-50 text-red-700">Err mA</div>
                    <div className="px-2 py-4 text-center bg-red-50 text-red-700">Err %</div>
                    <div className="px-2 py-4 text-center">Acción</div>
                </div>

                {/* Filas */}
                <div className="p-3 lg:p-0 space-y-4 lg:space-y-0 lg:divide-y lg:divide-gray-200 bg-gray-100 lg:bg-white">
                    {measurements.map((m: any, i: number) => (
                        <div key={i} className="bg-white rounded-xl lg:rounded-none shadow-sm lg:shadow-none border border-gray-200 lg:border-none">
                            <div className="overflow-x-auto">
                                <div className={`flex flex-nowrap lg:grid ${gridCols} lg:items-center p-4 lg:p-0 gap-4 lg:gap-0 min-w-max lg:min-w-full`}>
                                    
                                    <div className="lg:px-2 lg:py-3"><InputField label="Ideal UE" unit="UE" value={m.idealUE} onChange={(e:any) => handleChange(i, 'idealUE', e.target.value)} /></div>
                                    <div className="lg:px-2 lg:py-3"><InputField label="Ideal mA" unit="mA" value={m.idealmA} onChange={(e:any) => handleChange(i, 'idealmA', e.target.value)} /></div>
                                    <div className="lg:px-2 lg:py-3"><InputField label="Ideal mV" unit="mV" value={m.idealMV} onChange={(e:any) => handleChange(i, 'idealMV', e.target.value)} /></div>
                                    
                                    {/* Checkboxes Tipo J / K */}
                                    <div className="lg:px-2 lg:py-3 flex flex-col items-center justify-center min-w-[80px]">
                                        <label className="text-[9px] font-black text-gray-400 uppercase mb-1">Tipo TC</label>
                                        <div className="flex gap-3 bg-gray-50 p-1.5 rounded-md border border-gray-200">
                                            <label className="flex items-center gap-1 cursor-pointer">
                                                <input type="checkbox" checked={m.sensorType === 'J'} onChange={() => handleChange(i, 'sensorType', 'J')} className="w-3 h-3 accent-teal-600" />
                                                <span className="text-[10px] font-bold text-gray-600">J</span>
                                            </label>
                                            <label className="flex items-center gap-1 cursor-pointer">
                                                <input type="checkbox" checked={m.sensorType === 'K'} onChange={() => handleChange(i, 'sensorType', 'K')} className="w-3 h-3 accent-teal-600" />
                                                <span className="text-[10px] font-bold text-gray-600">K</span>
                                            </label>
                                        </div>
                                    </div>

                                    <div className="lg:px-2 lg:py-3"><InputField label="Patrón UE" unit="UE" value={m.patronUE} onChange={(e:any) => handleChange(i, 'patronUE', e.target.value)} /></div>
                                    {hasUeTransmitter && <div className="lg:px-2 lg:py-3"><InputField label="UE Trans." unit="UE" value={m.ueTransmitter} onChange={(e:any) => handleChange(i, 'ueTransmitter', e.target.value)} /></div>}
                                    <div className="lg:px-2 lg:py-3"><InputField label="mA Salida" unit="mA" value={m.maTransmitter} onChange={(e:any) => handleChange(i, 'maTransmitter', e.target.value)} /></div>
                                    <div className="lg:px-2 lg:py-3"><InputField label="mV Sensor" unit="mV" value={m.sensorMV} onChange={(e:any) => handleChange(i, 'sensorMV', e.target.value)} /></div>
                                    
                                    {/* Errores */}
                                    {hasUeTransmitter && <div className="lg:px-2 lg:bg-red-50/30"><InputField label="Err UE" unit="UE" value={m.errorUE} isError readOnly /></div>}
                                    <div className="lg:px-2 lg:bg-red-50/30"><InputField label="Err mV" unit="mV" value={m.errorMV} isError readOnly /></div>
                                    <div className="lg:px-2 lg:bg-red-50/30"><InputField label="Err mA" unit="mA" value={m.errormA} isError readOnly /></div>
                                    <div className="lg:px-2 lg:bg-red-50/30"><InputField label="Err %" unit="%" value={m.errorPercentage} isError readOnly /></div>

                                    <div className="hidden lg:flex justify-center"><button onClick={() => onMeasurementsChange(measurements.filter((_:any, idx:any) => idx !== i))} className="text-red-500 hover:bg-red-50 p-2 rounded-full transition-all">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </button></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};