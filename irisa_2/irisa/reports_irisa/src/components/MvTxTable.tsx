import React from 'react';
import { Measurement } from '../components/TransmitterTable';

const InputField = ({ label, value, onChange, unit, readOnly = false }: any) => (
    <div className="flex flex-col w-full">
        <label className="block text-[10px] font-bold text-gray-400 mb-1 lg:hidden">{label}</label>
        <div className="relative w-full">
            <input
                type="text" value={value} onChange={onChange} readOnly={readOnly}
                className={`w-full px-2 py-2 pr-7 text-xs border rounded-lg focus:outline-none focus:ring-2 border-gray-300 bg-white focus:ring-orange-500 text-gray-700 ${readOnly ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                placeholder="0.00"
            />
            <span className="absolute right-1.5 top-2.5 text-[9px] font-bold text-gray-400">{unit}</span>
        </div>
    </div>
);

const MvTxTable: React.FC<any> = ({ measurements, onMeasurementsChange }) => {
    
    const handleChange = (index: number, field: keyof Measurement, value: any) => {
        const newArr = [...measurements];
        newArr[index] = { ...newArr[index], [field]: value };
        onMeasurementsChange(newArr);
    };

    return (
        <div className="overflow-x-auto">
            <div className="min-w-full lg:min-w-[1000px] inline-block align-middle">
                {/* HEADERS DESKTOP */}
                <div className="hidden lg:grid lg:grid-cols-9 bg-gray-50 border-b border-gray-200 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                    {/* Seccion MV */}
                    <div className="px-2 py-4 text-center border-r border-gray-200 bg-orange-50/50">1. MV Ideal</div>
                    <div className="px-2 py-4 text-center border-r border-gray-200 bg-orange-50/50">2. Sensor (mV)</div>
                    <div className="px-2 py-4 text-center border-r border-gray-200 bg-orange-50/50">3. Tipo (J/K)</div>
                    
                    {/* Seccion TX */}
                    <div className="px-2 py-4 text-center border-r border-gray-200 bg-blue-50/50">1. Ideal mA</div>
                    <div className="px-2 py-4 text-center border-r border-gray-200 bg-blue-50/50">2. mA TX</div>
                    <div className="px-2 py-4 text-center border-r border-gray-200 bg-blue-50/50">3. Tipo (J/K)</div>
                    
                    {/* Comunes */}
                    <div className="px-2 py-4 text-center">% Rango</div>
                    <div className="px-2 py-4 text-center bg-red-50 text-red-700">Error %</div>
                    <div className="px-2 py-4 text-center">4. Acción</div>
                </div>

                {/* FILAS */}
                {measurements.map((m: any, i: number) => (
                    <div key={i} className="lg:grid lg:grid-cols-9 lg:items-center hover:bg-gray-50 border-b border-gray-100">
                        <div className="grid grid-cols-2 lg:contents p-4 lg:p-0 gap-4">
                            
                            {/* --- SECCIÓN MV --- */}
                            <div className="lg:px-2 lg:py-3 border-r border-gray-100">
                                <InputField label="MV Ideal" unit="mV" value={m.idealmV} onChange={(e:any) => handleChange(i, 'idealmV', e.target.value)} />
                            </div>
                            <div className="lg:px-2 lg:py-3 border-r border-gray-100">
                                <InputField label="Sensor" unit="mV" value={m.mvTransmitter} onChange={(e:any) => handleChange(i, 'mvTransmitter', e.target.value)} />
                            </div>
                            <div className="lg:px-2 lg:py-3 border-r border-gray-100 flex flex-col items-center justify-center gap-1">
                                <span className="text-[9px] font-bold text-gray-400 lg:hidden">Tipo Sensor</span>
                                <div className="flex gap-2">
                                    <label className="flex items-center gap-1 text-[10px] font-bold text-gray-600">
                                        <input type="checkbox" checked={m.sensorTypeMV === 'J'} onChange={() => handleChange(i, 'sensorTypeMV', 'J')} className="w-3 h-3 accent-orange-500" /> J
                                    </label>
                                    <label className="flex items-center gap-1 text-[10px] font-bold text-gray-600">
                                        <input type="checkbox" checked={m.sensorTypeMV === 'K'} onChange={() => handleChange(i, 'sensorTypeMV', 'K')} className="w-3 h-3 accent-orange-500" /> K
                                    </label>
                                </div>
                            </div>

                            {/* --- SECCIÓN TX --- */}
                            <div className="lg:px-2 lg:py-3 border-r border-gray-100">
                                <InputField label="Ideal mA" unit="mA" value={m.idealmA} onChange={(e:any) => handleChange(i, 'idealmA', e.target.value)} />
                            </div>
                            <div className="lg:px-2 lg:py-3 border-r border-gray-100">
                                <InputField label="mA TX" unit="mA" value={m.maTransmitter} onChange={(e:any) => handleChange(i, 'maTransmitter', e.target.value)} />
                            </div>
                            <div className="lg:px-2 lg:py-3 border-r border-gray-100 flex flex-col items-center justify-center gap-1">
                                <span className="text-[9px] font-bold text-gray-400 lg:hidden">Tipo Sensor</span>
                                <div className="flex gap-2">
                                    <label className="flex items-center gap-1 text-[10px] font-bold text-gray-600">
                                        <input type="checkbox" checked={m.sensorTypeTX === 'J'} onChange={() => handleChange(i, 'sensorTypeTX', 'J')} className="w-3 h-3 accent-blue-500" /> J
                                    </label>
                                    <label className="flex items-center gap-1 text-[10px] font-bold text-gray-600">
                                        <input type="checkbox" checked={m.sensorTypeTX === 'K'} onChange={() => handleChange(i, 'sensorTypeTX', 'K')} className="w-3 h-3 accent-blue-500" /> K
                                    </label>
                                </div>
                            </div>

                            {/* --- COMUNES Y ACCIÓN --- */}
                            <div className="lg:px-2 lg:py-3">
                                <InputField label="% Rango" unit="%" value={m.percentage} onChange={(e:any) => handleChange(i, 'percentage', e.target.value)} />
                            </div>
                            <div className="lg:px-2 lg:py-3">
                                <InputField label="Error %" unit="%" value={m.errorPercentage} readOnly />
                            </div>

                            <div className="flex justify-center items-center lg:py-3">
                                <button 
                                    onClick={() => onMeasurementsChange(measurements.filter((_:any, idx:number) => idx !== i))}
                                    className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </div>

                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MvTxTable;