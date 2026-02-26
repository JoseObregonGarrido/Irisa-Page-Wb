import React from 'react';
import MaRtdTable from '../components/MaRtdTable';
import MvTxTable from '../components/MvTxTable';

export interface Measurement {
    percentage: string;
    idealUE: string;
    patronUE: string;
    ueTransmitter: string;
    // mA / RTD
    idealmA: string;
    maTransmitter: string;
    idealohm?: string;
    ohmTransmitter?: string;
    // mV / TX
    idealmV?: string;
    mvTransmitter?: string;
    idealTX?: string;
    txTransmitter?: string;
    
    // --- NUEVOS CAMPOS ACTUALIZADOS ---
    sensorTypeMV?: 'J' | 'K'; 
    sensorTypeTX?: 'J' | 'K';
    // ----------------------------------

    // Errores
    errorUE: string;
    errormA: string; // Error de salida principal (mA o mV)
    errorPercentage: string;
}

interface TransmitterTableProps {
    measurements: Measurement[];
    onMeasurementsChange: (measurements: Measurement[]) => void;
    outputUnit: 'mA' | 'ohm'; // mA = Pack mA/RTD, ohm = Pack mV/TX
    setOutputUnit: (unit: 'mA' | 'ohm') => void;
    hasUeTransmitter: boolean;
    setHasUeTransmitter: (show: boolean) => void;
}

const TransmitterTable: React.FC<TransmitterTableProps> = (props) => {
    const { measurements, onMeasurementsChange, outputUnit, setOutputUnit, hasUeTransmitter, setHasUeTransmitter } = props;

    const addNewRow = () => {
        const newRow: Measurement = {
            percentage: "", 
            idealUE: "", 
            patronUE: "", 
            ueTransmitter: "",
            idealmA: "", 
            maTransmitter: "", 
            idealohm: "", 
            ohmTransmitter: "",
            idealmV: "", 
            mvTransmitter: "", 
            idealTX: "", 
            txTransmitter: "",
            // Inicializamos tipos por defecto para evitar errores de undefined
            sensorTypeMV: 'J',
            sensorTypeTX: 'J',
            errorUE: "", 
            errormA: "", 
            errorPercentage: ""
        };
        onMeasurementsChange([...measurements, newRow]);
    };

    return (
        <div className="mt-8 w-full bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            {/* Header compartido */}
            <div className="bg-gradient-to-r from-teal-600 to-emerald-600 px-4 py-4 sm:px-6">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-lg font-bold text-white tracking-tight">Mediciones de transmisor</h3>
                        
                        <div className="flex bg-black/20 p-1 rounded-lg border border-white/10">
                            <button 
                                type="button" 
                                onClick={() => setOutputUnit('mA')} 
                                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${outputUnit === 'mA' ? 'bg-white text-teal-700 shadow' : 'text-white hover:bg-white/10'}`}
                            >
                                mA / RTD
                            </button>
                            <button 
                                type="button" 
                                onClick={() => setOutputUnit('ohm')} 
                                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${outputUnit === 'ohm' ? 'bg-white text-teal-700 shadow' : 'text-white hover:bg-white/10'}`}
                            >
                                mV / TX
                            </button>
                        </div>

                        {/* SE MANTIENE EL BOTÓN DE MOSTRAR/OCULTAR UE */}
                        <button
                            type="button"
                            onClick={() => setHasUeTransmitter(!hasUeTransmitter)}
                            className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${hasUeTransmitter ? 'bg-white text-teal-700 shadow' : 'bg-white/10 border-white/20 text-white hover:bg-white/20'}`}
                        >
                            {hasUeTransmitter ? 'Ocultar UE' : 'Mostrar UE'}
                        </button>
                    </div>
                    <button 
                        onClick={addNewRow}
                        className="px-4 py-2 bg-white text-teal-700 font-bold rounded-lg shadow-md hover:bg-teal-50"
                    >
                        Nueva fila
                    </button>
                </div>
            </div>

            {/* Renderizado condicional de la tabla según el modo */}
            {/* Se pasan todas las props (incluyendo hasUeTransmitter) mediante el spread {...props} */}
            {outputUnit === 'mA' ? (
                <MaRtdTable {...props} />
            ) : (
                <MvTxTable {...props} />
            )}
        </div>
    );
}

export default TransmitterTable;