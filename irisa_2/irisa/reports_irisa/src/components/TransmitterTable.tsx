import React from 'react';
import MaTable from './MaTable';
import RtdTable from './RtdTable';

export interface Measurement {
    percentage: string;
    idealUE: string;
    patronUE: string;
    ueTransmitter: string;
    idealmA: string;
    idealohm?: string; 
    maTransmitter: string; 
    ohmTransmitter?: string; 
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

const TransmitterTable: React.FC<TransmitterTableProps> = ({ 
    measurements, onMeasurementsChange, outputUnit, setOutputUnit, hasUeTransmitter, setHasUeTransmitter 
}) => {
    
    const calculateErrors = (measurement: Measurement) => {
        const idealUEValue = parseFloat(measurement.idealUE) || 0;
        const ueTransmitterValue = parseFloat(measurement.ueTransmitter) || 0;
        const idealVal = parseFloat(measurement.idealmA) || 4; // 4mA base
        const measuredVal = parseFloat(measurement.maTransmitter) || 0;
        
        const errorUEValue = ueTransmitterValue - idealUEValue; 
        const errorVal = measuredVal - idealVal; 
        const errorPercentage = (errorVal / 16) * 100; 
        
        return {
            ...measurement,
            errorUE: errorUEValue.toFixed(3),
            errormA: errorVal.toFixed(3),
            errorPercentage: errorPercentage.toFixed(2)
        };
    };

    const handleChange = (index: number, field: keyof Measurement, value: string) => {
        const newMeasurements = [...measurements];
        newMeasurements[index] = { ...newMeasurements[index], [field]: value };
        
        const relevantFields: (keyof Measurement)[] = ["idealUE", "ueTransmitter", "idealmA", "maTransmitter"];
        if (relevantFields.includes(field)) {
            newMeasurements[index] = calculateErrors(newMeasurements[index]);
        }
        onMeasurementsChange(newMeasurements);
    };

    const addNewRow = () => {
        const newRow = { percentage: "", idealUE: "", patronUE: "", ueTransmitter: "", idealmA:"", idealohm: "", maTransmitter: "", ohmTransmitter: "", errorUE: "", errormA: "", errorPercentage: "" };
        onMeasurementsChange([...measurements, newRow]);
    };

    const removeRow = (index: number) => {
        onMeasurementsChange(measurements.filter((_, i) => i !== index));
    };

    return (
        <div className="mt-8 w-full bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-teal-600 to-emerald-600 px-4 py-4 sm:px-6">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-lg font-bold text-white tracking-tight">Mediciones de transmisor</h3>
                        <div className="flex bg-black/20 p-1 rounded-lg border border-white/10">
                            <button type="button" onClick={() => setOutputUnit('mA')} className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${outputUnit === 'mA' ? 'bg-white text-teal-700 shadow' : 'text-white hover:bg-white/10'}`}>mA</button>
                            <button type="button" onClick={() => setOutputUnit('ohm')} className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${outputUnit === 'ohm' ? 'bg-white text-teal-700 shadow' : 'text-white hover:bg-white/10'}`}>RTD</button>
                        </div>
                        <button onClick={() => setHasUeTransmitter(!hasUeTransmitter)} className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${hasUeTransmitter ? 'bg-white text-teal-700 shadow' : 'bg-white/10 border-white/20 text-white hover:bg-white/20'}`}>
                            {hasUeTransmitter ? 'Ocultar UE' : 'Mostrar UE'}
                        </button>
                    </div>
                    <button onClick={addNewRow} className="px-4 py-2 bg-white text-teal-700 font-bold rounded-lg shadow-md hover:bg-teal-50">Nueva fila</button>
                </div>
            </div>

            {/* RENDERIZADO CONDICIONAL */}
            {outputUnit === 'mA' ? (
                <MaTable measurements={measurements} onChange={handleChange} hasUeTransmitter={hasUeTransmitter} onRemove={removeRow} />
            ) : (
                <RtdTable measurements={measurements} onChange={handleChange} hasUeTransmitter={hasUeTransmitter} onRemove={removeRow} />
            )}
        </div>
    );
}

export default TransmitterTable;