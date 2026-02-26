import React, { useState } from 'react';

export interface Measurement {
    percentage: string;
    idealUE: string;
    patronUE: string;
    ueTransmitter: string;
    idealmA: string;
    idealohm?: string; 
    idealmV?: string; 
    maTransmitter: string; 
    ohmTransmitter?: string; 
    mvSensor?: string; 
    sensorType?: 'J' | 'K'; 
    errorUE: string;
    errormA: string;
    errorPercentage: string;
}

interface TransmitterTableProps {
    measurements: Measurement[];
    onMeasurementsChange: (measurements: Measurement[]) => void;
    outputUnit: 'mA' | 'ohm';
    setOutputUnit: (unit: 'mA' | 'ohm') => void;
    hasUeTransmitter: boolean;
    setHasUeTransmitter: (show: boolean) => void;
}

const InputField = ({ label, value, onChange, unit, isError = false, readOnly = false }: any) => (
    <div className="flex flex-col w-full">
        <label className="block text-[10px] font-bold text-gray-500 mb-1 lg:hidden">
            {label}
        </label>
        <div className="relative w-full">
            <input
                type="text"
                value={value || ""}
                onChange={onChange}
                readOnly={readOnly}
                className={`w-full px-2 py-2 pr-7 text-xs border rounded-lg focus:outline-none focus:ring-2 
                    ${isError 
                        ? 'border-red-200 bg-red-50 focus:ring-red-500 font-bold text-red-700' 
                        : 'border-gray-300 bg-white focus:ring-teal-500 text-gray-700'
                    } ${readOnly ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                placeholder="0.00"
            />
            <span className={`absolute right-1.5 top-2.5 text-[9px] font-bold ${isError ? 'text-red-400' : 'text-gray-400'}`}>
                {unit}
            </span>
        </div>
    </div>
);

const TransmitterTable: React.FC<TransmitterTableProps> = ({ 
    measurements, 
    onMeasurementsChange,
    outputUnit,
    setOutputUnit,
    hasUeTransmitter,
    setHasUeTransmitter
}) => {
    const [inputMode, setInputMode] = useState<'mV' | 'TX'>('TX');

    // Identificadores de modo para facilitar el renderizado
    const isRTD = outputUnit === 'ohm';
    const isMA_TX = outputUnit === 'mA' && inputMode === 'TX';
    const isMA_MV = outputUnit === 'mA' && inputMode === 'mV';

    // Cálculo dinámico de columnas para el Grid de Tailwind
    const getGridCols = () => {
        let cols = 0;
        if (isRTD) cols = 3; // Ideal Ohm, Sensor Ohm, % Rango
        if (isMA_TX) cols = 3; // Ideal mA, mATX, Tipo
        if (isMA_MV) cols = 3; // mV Ideal, mV Sensor, Tipo
        
        if (hasUeTransmitter) cols += 1;
        cols += 2; // Error mA, Error %
        return `lg:grid-cols-${cols + 1}`; // +1 para acción
    };

    const handleChange = (index: number, field: keyof Measurement, value: any) => {
        const newMeasurements = [...measurements];
        newMeasurements[index] = { ...newMeasurements[index], [field]: value };
        
        // Aquí puedes integrar tu lógica de calculateErrors
        onMeasurementsChange(newMeasurements);
    };

    return (
        <div className="mt-8 w-full bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            {/* --- HEADER / CONTROLES --- */}
            <div className="bg-gradient-to-r from-teal-600 to-emerald-600 px-4 py-4 sm:px-6">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-lg font-bold text-white tracking-tight">Panel de Mediciones</h3>
                        
                        {/* Selector Salida */}
                        <div className="flex bg-black/20 p-1 rounded-lg border border-white/10">
                            <button onClick={() => setOutputUnit('mA')} className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${outputUnit === 'mA' ? 'bg-white text-teal-700 shadow' : 'text-white hover:bg-white/10'}`}>mA</button>
                            <button onClick={() => setOutputUnit('ohm')} className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${outputUnit === 'ohm' ? 'bg-white text-teal-700 shadow' : 'text-white hover:bg-white/10'}`}>RTD</button>
                        </div>

                        {/* Selector Sub-modo (Solo visible en mA) */}
                        {outputUnit === 'mA' && (
                            <div className="flex bg-black/20 p-1 rounded-lg border border-white/10">
                                <button onClick={() => setInputMode('TX')} className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${inputMode === 'TX' ? 'bg-white text-teal-700 shadow' : 'text-white hover:bg-white/10'}`}>TX</button>
                                <button onClick={() => setInputMode('mV')} className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${inputMode === 'mV' ? 'bg-white text-teal-700 shadow' : 'text-white hover:bg-white/10'}`}>mV</button>
                            </div>
                        )}

                        <button
                            onClick={() => setHasUeTransmitter(!hasUeTransmitter)}
                            className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${hasUeTransmitter ? 'bg-white text-teal-700 shadow' : 'bg-white/10 border-white/20 text-white hover:bg-white/20'}`}
                        >
                            {hasUeTransmitter ? 'Ocultar UE' : 'Mostrar UE'}
                        </button>
                    </div>
                    
                    <button 
                        onClick={() => onMeasurementsChange([...measurements, { percentage: "", idealUE: "", patronUE: "", ueTransmitter: "", idealmA:"", idealohm: "", idealmV: "", maTransmitter: "", ohmTransmitter: "", mvSensor: "", sensorType: 'J', errorUE: "", errormA: "", errorPercentage: "" }])} 
                        className="px-4 py-2 bg-white text-teal-700 font-bold rounded-lg shadow-md hover:bg-teal-50 transition-colors"
                    >
                        Nueva fila
                    </button>
                </div>
            </div>

            {/* --- TABLA --- */}
            <div className="overflow-x-auto">
                <div className="min-w-full inline-block align-middle">
                    
                    {/* Encabezados Dinámicos */}
                    <div className={`hidden lg:grid ${getGridCols()} bg-gray-100 border-b border-gray-200 text-[10px] font-black text-gray-600 uppercase tracking-wider`}>
                        {isRTD && (
                            <>
                                <div className="px-2 py-4 text-center">Ideal Ohm</div>
                                <div className="px-2 py-4 text-center">Ohm Sensor</div>
                                <div className="px-2 py-4 text-center">% Rango</div>
                            </>
                        )}
                        {isMA_TX && (
                            <>
                                <div className="px-2 py-4 text-center">Ideal mA</div>
                                <div className="px-2 py-4 text-center">mATX</div>
                                <div className="px-2 py-4 text-center">Tipo</div>
                            </>
                        )}
                        {isMA_MV && (
                            <>
                                <div className="px-2 py-4 text-center">mV Ideal</div>
                                <div className="px-2 py-4 text-center">mV Sensor</div>
                                <div className="px-2 py-4 text-center">Tipo</div>
                            </>
                        )}
                        {hasUeTransmitter && <div className="px-2 py-4 text-center">UE Trans.</div>}
                        <div className="px-2 py-4 text-center bg-red-100/50 text-red-800">Error mA</div>
                        <div className="px-2 py-4 text-center bg-red-100/50 text-red-800">Error %</div>
                        <div className="px-2 py-4 text-center">Acción</div>
                    </div>

                    {/* Cuerpo de la Tabla */}
                    <div className="divide-y divide-gray-200 bg-white">
                        {measurements.map((m, index) => (
                            <div key={index} className={`grid grid-cols-1 lg:grid ${getGridCols()} items-center hover:bg-teal-50/30 transition-colors p-4 lg:p-0`}>
                                
                                {/* Renderizado de Inputs según el Modo Seleccionado */}
                                {isRTD && (
                                    <>
                                        <div className="lg:px-2 lg:py-3"><InputField label="Ideal Ohm" unit="Ω" value={m.idealohm} onChange={(e:any) => handleChange(index, 'idealohm', e.target.value)} /></div>
                                        <div className="lg:px-2 lg:py-3"><InputField label="Ohm Sensor" unit="Ω" value={m.ohmTransmitter} onChange={(e:any) => handleChange(index, 'ohmTransmitter', e.target.value)} /></div>
                                        <div className="lg:px-2 lg:py-3"><InputField label="% Rango" unit="%" value={m.percentage} onChange={(e:any) => handleChange(index, 'percentage', e.target.value)} /></div>
                                    </>
                                )}

                                {isMA_TX && (
                                    <>
                                        <div className="lg:px-2 lg:py-3"><InputField label="Ideal mA" unit="mA" value={m.idealmA} onChange={(e:any) => handleChange(index, 'idealmA', e.target.value)} /></div>
                                        <div className="lg:px-2 lg:py-3"><InputField label="mATX" unit="mA" value={m.maTransmitter} onChange={(e:any) => handleChange(index, 'maTransmitter', e.target.value)} /></div>
                                        <div className="lg:px-2 lg:py-3 flex justify-center gap-3">
                                            {['J', 'K'].map(t => (
                                                <label key={t} className="flex items-center gap-1 cursor-pointer">
                                                    <input type="checkbox" checked={m.sensorType === t} onChange={() => handleChange(index, 'sensorType', t)} className="w-3 h-3 text-teal-600 rounded" />
                                                    <span className="text-[10px] font-bold">{t}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </>
                                )}

                                {isMA_MV && (
                                    <>
                                        <div className="lg:px-2 lg:py-3"><InputField label="mV Ideal" unit="mV" value={m.idealmV} onChange={(e:any) => handleChange(index, 'idealmV', e.target.value)} /></div>
                                        <div className="lg:px-2 lg:py-3"><InputField label="mV Sensor" unit="mV" value={m.mvSensor} onChange={(e:any) => handleChange(index, 'mvSensor', e.target.value)} /></div>
                                        <div className="lg:px-2 lg:py-3 flex justify-center gap-3">
                                            {['J', 'K'].map(t => (
                                                <label key={t} className="flex items-center gap-1 cursor-pointer">
                                                    <input type="checkbox" checked={m.sensorType === t} onChange={() => handleChange(index, 'sensorType', t)} className="w-3 h-3 text-teal-600 rounded" />
                                                    <span className="text-[10px] font-bold">{t}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </>
                                )}

                                {hasUeTransmitter && (
                                    <div className="lg:px-2 lg:py-3"><InputField label="UE Trans" unit="UE" value={m.ueTransmitter} onChange={(e:any) => handleChange(index, 'ueTransmitter', e.target.value)} /></div>
                                )}

                                {/* Campos de Error (Comunes a todos) */}
                                <div className="lg:px-2 lg:py-3 lg:bg-red-50/20"><InputField label="Error mA" unit="mA" value={m.errormA} isError readOnly /></div>
                                <div className="lg:px-2 lg:py-3 lg:bg-red-50/20"><InputField label="Error %" unit="%" value={m.errorPercentage} isError readOnly /></div>

                                {/* Botón Eliminar */}
                                <div className="flex justify-center py-2 lg:py-0">
                                    <button onClick={() => onMeasurementsChange(measurements.filter((_, i) => i !== index))} className="text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TransmitterTable;