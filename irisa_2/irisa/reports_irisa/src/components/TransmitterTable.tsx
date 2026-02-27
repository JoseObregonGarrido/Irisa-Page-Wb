import { FC } from 'react';
import InputField from '../components/InputField';
import { MaHeader, MaSensorHeader, MaRowFields, MaSensorRowFields } from './MaFields';
import { RtdHeader, RtdSensorHeader, RtdRowFields, RtdSensorRowFields } from './RtdFields';
import { MvHeader, MvTransHeader, MvRowFields, MvTransRowFields } from './MvFields';
import { TxHeader, TxSensorHeader, TxRowFields, TxSensorRowFields } from './TxFields';

export interface Measurement {
    percentage: string; idealUE: string; patronUE: string; ueTransmitter: string;
    idealmA: string; maTransmitter: string; idealohm?: string; ohmTransmitter?: string; 
    idealmV?: string; mvTransmitter?: string; idealTX?: string; txTransmitter?: string;
    errorUE: string; errormA: string; errorPercentage: string;
}

interface TransmitterTableProps {
    measurements: Measurement[];
    onMeasurementsChange: (measurements: Measurement[]) => void;
    outputUnit: 'mA' | 'ohm';
    setOutputUnit: (unit: 'mA' | 'ohm') => void;
    hasUeTransmitter: boolean;
    setHasUeTransmitter: (show: boolean) => void;
}

const TransmitterTable: FC<TransmitterTableProps> = ({ 
    measurements, onMeasurementsChange, outputUnit, setOutputUnit, hasUeTransmitter, setHasUeTransmitter 
}) => {
    
    const isMaRTD = outputUnit === 'mA';

    const calculateErrors = (m: Measurement) => {
        const idealUEValue = parseFloat(m.idealUE) || 0;
        const ueTransmitterValue = parseFloat(m.ueTransmitter) || 0;
        const idealVal = isMaRTD ? parseFloat(m.idealmA || "0") : parseFloat(m.idealmV || "0");
        const measuredVal = isMaRTD ? parseFloat(m.maTransmitter || "0") : parseFloat(m.mvTransmitter || "0");
        const errorUEValue = ueTransmitterValue - idealUEValue; 
        const errorVal = measuredVal - idealVal; 
        const divisor = isMaRTD ? 16 : 100; 
        const errorPercentage = (errorVal / (divisor === 0 ? 1 : divisor)) * 100; 
        
        return {
            ...m,
            errorUE: errorUEValue.toFixed(3),
            errormA: errorVal.toFixed(3),
            errorPercentage: errorPercentage.toFixed(2)
        };
    };

    const handleChange = (index: number, field: keyof Measurement, value: string) => {
        const newMeasurements = [...measurements];
        newMeasurements[index] = { ...newMeasurements[index], [field]: value };
        newMeasurements[index] = calculateErrors(newMeasurements[index]);
        onMeasurementsChange(newMeasurements);
    };

    const gridCols = hasUeTransmitter ? 'lg:grid-cols-12' : 'lg:grid-cols-10';

    return (
        <div className="mt-8 w-full bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-teal-600 to-emerald-600 px-4 py-4 sm:px-6">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-lg font-bold text-white tracking-tight">Mediciones de transmisor</h3>
                        
                        {/* Selector de modo */}
                        <div className="flex bg-black/20 p-1 rounded-lg border border-white/10">
                            <button 
                                type="button"
                                onClick={() => setOutputUnit('mA')} 
                                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${isMaRTD ? 'bg-white text-teal-700 shadow' : 'text-white'}`}
                            >
                                mA / RTD
                            </button>
                            <button 
                                type="button"
                                onClick={() => setOutputUnit('ohm')} 
                                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${!isMaRTD ? 'bg-white text-teal-700 shadow' : 'text-white'}`}
                            >
                                mV / TX
                            </button>
                        </div>

                        {/* AQUÍ SE USA setHasUeTransmitter PARA QUITAR EL WARNING */}
                        <button
                            type="button"
                            onClick={() => setHasUeTransmitter(!hasUeTransmitter)}
                            className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${hasUeTransmitter ? 'bg-white text-teal-700 shadow' : 'bg-white/10 border-white/20 text-white hover:bg-white/20'}`}
                        >
                            {hasUeTransmitter ? 'Ocultar UE' : 'Mostrar UE'}
                        </button>
                    </div>

                    <button 
                        onClick={() => onMeasurementsChange([...measurements, { percentage: "", idealUE: "", patronUE: "", ueTransmitter: "", idealmA:"", idealohm: "", maTransmitter: "", ohmTransmitter: "", idealmV: "", mvTransmitter: "", idealTX: "", txTransmitter: "", errorUE: "", errormA: "", errorPercentage: "" }])} 
                        className="px-4 py-2 bg-white text-teal-700 font-bold rounded-lg shadow-md hover:bg-teal-50"
                    >
                        Nueva fila
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <div className="min-w-full lg:min-w-[1300px] inline-block align-middle">
                    {/* Header Dinámico */}
                    <div className={`hidden lg:grid ${gridCols} bg-gray-50 border-b border-gray-200 text-[10px] font-bold text-gray-500 tracking-wider`}>
                        <div className="px-2 py-4 text-center">Ideal UE</div>
                        {isMaRTD ? <MaHeader /> : <MvHeader />}
                        {isMaRTD ? <RtdHeader /> : <TxHeader />}
                        <div className="px-2 py-4 text-center">Patrón UE</div>
                        {hasUeTransmitter && <div className="px-2 py-4 text-center">UE trans.</div>}
                        {isMaRTD ? <MaSensorHeader /> : <MvTransHeader />}
                        {isMaRTD ? <RtdSensorHeader /> : <TxSensorHeader />}
                        <div className="px-2 py-4 text-center">% Rango</div>
                        {hasUeTransmitter && <div className="px-2 py-4 text-center bg-red-50 text-red-700">Error UE</div>}
                        <div className="px-2 py-4 text-center bg-red-50 text-red-700">Error {isMaRTD ? 'mA' : 'mV'}</div>
                        <div className="px-2 py-4 text-center bg-red-50 text-red-700">Error %</div>
                        <div className="px-2 py-4 text-center">Acción</div>
                    </div>

                    {/* Cuerpo de Tabla */}
                    <div className="p-4 lg:p-0 space-y-4 lg:space-y-0 lg:divide-y lg:divide-gray-200 bg-gray-50 lg:bg-white">
                        {measurements.map((m, index) => (
                            <div key={index} className={`bg-white p-4 lg:p-0 lg:grid ${gridCols} lg:items-center hover:bg-teal-50/30 transition-colors`}>
                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:contents gap-4">
                                    <div className="lg:px-2 lg:py-3"><InputField label="Ideal UE" unit="UE" value={m.idealUE} onChange={(e:any) => handleChange(index, 'idealUE', e.target.value)} /></div>
                                    
                                    {isMaRTD ? <MaRowFields m={m} index={index} handleChange={handleChange} /> : <MvRowFields m={m} index={index} handleChange={handleChange} />}
                                    {isMaRTD ? <RtdRowFields m={m} index={index} handleChange={handleChange} /> : <TxRowFields m={m} index={index} handleChange={handleChange} />}
                                    
                                    <div className="lg:px-2 lg:py-3"><InputField label="Patrón UE" unit="UE" value={m.patronUE} onChange={(e:any) => handleChange(index, 'patronUE', e.target.value)} /></div>
                                    {hasUeTransmitter && <div className="lg:px-2 lg:py-3"><InputField label="UE trans." unit="UE" value={m.ueTransmitter} onChange={(e:any) => handleChange(index, 'ueTransmitter', e.target.value)} /></div>}
                                    
                                    {isMaRTD ? <MaSensorRowFields m={m} index={index} handleChange={handleChange} /> : <MvTransRowFields m={m} index={index} handleChange={handleChange} />}
                                    {isMaRTD ? <RtdSensorRowFields m={m} index={index} handleChange={handleChange} /> : <TxSensorRowFields m={m} index={index} handleChange={handleChange} />}
                                    
                                    <div className="lg:px-2 lg:py-3"><InputField label="% Rango" unit="%" value={m.percentage} onChange={(e:any) => handleChange(index, 'percentage', e.target.value)} /></div>
                                    {hasUeTransmitter && <div className="lg:px-2 lg:py-3 lg:bg-red-50/20"><InputField label="Error UE" unit="UE" value={m.errorUE} isError readOnly /></div>}
                                    <div className="lg:px-2 lg:py-3 lg:bg-red-50/20"><InputField label={isMaRTD ? 'Error mA' : 'Error mV'} unit={isMaRTD ? 'mA' : 'mV'} value={m.errormA} isError readOnly /></div>
                                    <div className="lg:px-2 lg:py-3 lg:bg-red-50/20"><InputField label="Error %" unit="%" value={m.errorPercentage} isError readOnly /></div>
                                    
                                    <div className="col-span-2 sm:col-span-3 lg:col-span-1 flex justify-center">
                                        <button onClick={() => onMeasurementsChange(measurements.filter((_, i) => i !== index))} className="text-red-500 hover:bg-red-50 p-2 rounded-full">
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