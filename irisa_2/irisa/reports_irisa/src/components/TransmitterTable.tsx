import React from 'react';

export interface Measurement {
    percentage: string;
    idealUe: string;
    patronUe: string;
    ueTransmitter: string;
    idealmA: string;
    idealOhm: string; // <-- Nuevo campo
    maTransmitter: string;
    errorUe: string;
    errorMa: string;
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
                value={value}
                onChange={onChange}
                readOnly={readOnly}
                className={`w-full px-2 py-2 pr-8 text-sm border rounded-lg focus:outline-none focus:ring-2 
                    ${isError 
                        ? 'border-red-200 bg-red-50 focus:ring-red-500 text-red-700 font-bold' 
                        : 'border-gray-300 bg-white focus:ring-teal-500 text-gray-700'
                    } ${readOnly ? 'cursor-not-allowed' : ''}`}
                placeholder="0.00"
            />
            <span className={`absolute right-2 top-2 text-[10px] font-bold ${isError ? 'text-red-400' : 'text-gray-400'}`}>
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
    
    const isOhm = outputUnit === 'ohm';
    const deviceLabel = isOhm ? 'Sensor' : 'Trans.';

    // --- LÓGICA DE COLUMNAS DINÁMICAS ---
    // Calculamos el número exacto de columnas para el grid de Tailwind
    let colsCount = 7; // Base: IdealUE, IdealUnit, PatrónUE, UnitTrans, %Rango, ErrUnit, Err% + Acción (que usa 1)
    if (hasUeTransmitter) colsCount += 2; // +1 UE Trans y +1 Err UE
    if (isOhm) colsCount += 1; // +1 Ideal mA extra

    const gridLayout = {
        8: 'lg:grid-cols-8',
        9: 'lg:grid-cols-9',
        10: 'lg:grid-cols-10',
        11: 'lg:grid-cols-11',
        12: 'lg:grid-cols-12'
    }[colsCount] || 'lg:grid-cols-11';

    const handleAddRow = () => {
        onMeasurementsChange([...measurements, { 
            percentage: "", idealUe: "", patronUe: "", ueTransmitter: "", 
            idealmA:"", idealOhm: "", maTransmitter: "", errorUe: "", errorMa: "", errorPercentage: "" 
        }]);
    };

    const handleDeleteRow = (indexToDelete: number) => {
        onMeasurementsChange(measurements.filter((_, index) => index !== indexToDelete));
    };

    const calculateErrors = (measurement: Measurement) => {
        const patronUe = parseFloat(measurement.patronUe) || 0;
        const ueTransmitter = parseFloat(measurement.ueTransmitter) || 0;
        const targetIdeal = isOhm ? parseFloat(measurement.idealOhm) : parseFloat(measurement.idealmA);
        const currentOutput = parseFloat(measurement.maTransmitter) || 0;
        
        const errorUe = ueTransmitter - patronUe; 
        const errorMa = currentOutput - (targetIdeal || 0);    
        const divisor = isOhm ? 100 : 16;
        const errorPercentage = (errorMa / divisor) * 100; 
        
        return {
            ...measurement,
            errorUe: errorUe.toFixed(3),
            errorMa: errorMa.toFixed(3),
            errorPercentage: errorPercentage.toFixed(2)
        };
    };

    const handleChange = (index: number, field: keyof Measurement, value: string) => {
        const newMeasurements = [...measurements];
        newMeasurements[index] = { ...newMeasurements[index], [field]: value };
        
        const relevantFields: (keyof Measurement)[] = ["patronUe", "ueTransmitter", "idealmA", "idealOhm", "maTransmitter"];
        if (relevantFields.includes(field)) {
            newMeasurements[index] = calculateErrors(newMeasurements[index]);
        }
        onMeasurementsChange(newMeasurements);
    };

    return (
        <div className="mt-8 w-full max-w-full overflow-hidden border border-gray-200 rounded-xl shadow-lg bg-white">
            {/* HEADER DE LA TABLA */}
            <div className="bg-gradient-to-r from-teal-600 to-emerald-600 px-4 py-4 sm:px-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center">
                            <div className="p-2 bg-white/20 rounded-lg mr-3">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                            </div>
                            <h3 className="text-lg font-bold text-white tracking-tight">Mediciones</h3>
                        </div>

                        {/* SELECTOR MA / SENSOR */}
                        <div className="flex bg-black/20 p-1 rounded-lg border border-white/10">
                            <button type="button" onClick={() => setOutputUnit('mA')} className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${outputUnit === 'mA' ? 'bg-white text-teal-700 shadow' : 'text-white hover:bg-white/10'}`}>mA</button>
                            <button type="button" onClick={() => setOutputUnit('ohm')} className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${outputUnit === 'ohm' ? 'bg-white text-teal-700 shadow' : 'text-white hover:bg-white/10'}`}>Sensor</button>
                        </div>

                        {/* TOGGLE UE */}
                        <button type="button" onClick={() => setHasUeTransmitter(!hasUeTransmitter)} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${hasUeTransmitter ? 'bg-white text-teal-700 shadow' : 'bg-white/10 border-white/20 text-white hover:bg-white/20'}`}>
                            {hasUeTransmitter ? 'Ocultar UE Trans.' : 'Mostrar UE Trans.'}
                        </button>
                    </div>

                    <button onClick={handleAddRow} className="w-full sm:w-auto flex items-center justify-center px-4 py-2 bg-white text-teal-700 hover:bg-teal-50 font-bold rounded-lg transition-all shadow-md active:scale-95">
                        Nueva Fila
                    </button>
                </div>
            </div>

            {/* CUERPO DE LA TABLA */}
            <div className="overflow-x-auto">
                <div className="min-w-[1000px]">
                    {/* ENCABEZADOS DESKTOP */}
                    <div className={`hidden lg:grid ${gridLayout} bg-gray-50 border-b border-gray-200 text-[10px] font-bold text-gray-600 uppercase tracking-wider`}>
                        <div className="px-2 py-4 text-center">Ideal UE</div>
                        {isOhm && <div className="px-2 py-4 text-center">Ideal mA</div>}
                        <div className="px-2 py-4 text-center">Ideal {outputUnit}</div>
                        <div className="px-2 py-4 text-center">Patrón UE</div>
                        {hasUeTransmitter && <div className="px-2 py-4 text-center">UE {deviceLabel}</div>}
                        <div className="px-2 py-4 text-center">{outputUnit} {deviceLabel}</div>
                        <div className="px-2 py-4 text-center">% Rango</div>
                        {hasUeTransmitter && <div className="px-2 py-4 text-center bg-red-50/50 text-red-600">Err UE</div>}
                        <div className="px-2 py-4 text-center bg-red-50/50 text-red-600">Err {outputUnit}</div>
                        <div className="px-2 py-4 text-center bg-red-50/50 text-red-600">Err %</div>
                        <div className="px-2 py-4 text-center">Acción</div>
                    </div>

                    {/* FILAS */}
                    <div className="divide-y divide-gray-100">
                        {measurements.map((m, index) => (
                            <div key={index} className={`grid grid-cols-1 lg:grid ${gridLayout} items-center hover:bg-gray-50 transition-colors p-4 lg:p-0`}>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:contents gap-3">
                                    <div className="lg:px-2 lg:py-3"><InputField label="Ideal UE" unit="UE" value={m.idealUe} onChange={(e:any) => handleChange(index, 'idealUe', e.target.value)} /></div>
                                    
                                    {isOhm && (
                                        <div className="lg:px-2 lg:py-3"><InputField label="Ideal mA" unit="mA" value={m.idealmA} onChange={(e:any) => handleChange(index, 'idealmA', e.target.value)} /></div>
                                    )}

                                    <div className="lg:px-2 lg:py-3">
                                        <InputField 
                                            label={`Ideal ${outputUnit}`} 
                                            unit={outputUnit} 
                                            value={isOhm ? m.idealOhm : m.idealmA} 
                                            onChange={(e:any) => handleChange(index, isOhm ? 'idealOhm' : 'idealmA', e.target.value)} 
                                        />
                                    </div>
                                    
                                    <div className="lg:px-2 lg:py-3"><InputField label="Patrón UE" unit="UE" value={m.patronUe} onChange={(e:any) => handleChange(index, 'patronUe', e.target.value)} /></div>

                                    {hasUeTransmitter && (
                                        <div className="lg:px-2 lg:py-3"><InputField label={`UE ${deviceLabel}`} unit="UE" value={m.ueTransmitter} onChange={(e:any) => handleChange(index, 'ueTransmitter', e.target.value)} /></div>
                                    )}

                                    <div className="lg:px-2 lg:py-3"><InputField label={`${outputUnit} ${deviceLabel}`} unit={outputUnit} value={m.maTransmitter} onChange={(e:any) => handleChange(index, 'maTransmitter', e.target.value)} /></div>
                                    
                                    <div className="lg:px-2 lg:py-3"><InputField label="% Rango" unit="%" value={m.percentage} onChange={(e:any) => handleChange(index, 'percentage', e.target.value)} /></div>

                                    {/* SECCIÓN DE ERRORES (Fondo rojizo) */}
                                    {hasUeTransmitter && (
                                        <div className="lg:px-2 lg:py-3 lg:bg-red-50/30"><InputField label="Err UE" unit="UE" value={m.errorUe} isError readOnly /></div>
                                    )}

                                    <div className="lg:px-2 lg:py-3 lg:bg-red-50/30"><InputField label={`Err ${outputUnit}`} unit={outputUnit} value={m.errorMa} isError readOnly /></div>
                                    <div className="lg:px-2 lg:py-3 lg:bg-red-50/30"><InputField label="Err %" unit="%" value={m.errorPercentage} isError readOnly /></div>

                                    {/* BOTÓN ELIMINAR */}
                                    <div className="flex justify-center items-center py-2 lg:py-0">
                                        <button type="button" onClick={() => handleDeleteRow(index)} className="group p-2 text-gray-400 hover:text-red-600 transition-colors">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                        </button>
                                    </div>
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