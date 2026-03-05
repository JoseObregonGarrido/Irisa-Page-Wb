import { TableMA } from './TableMA';
import { TableRTD } from './TableRTD';
import { TableMV } from './TableMV';
import { TableTx } from './TableTX';

const TransmitterTable = ({ 
    measurements, 
    onMeasurementsChange, 
    outputUnit, 
    setOutputUnit, 
    hasUeTransmitter 
}: any) => {

    const addNewRow = () => {
        // Objeto unificado con todos los campos para evitar errores de undefined
        onMeasurementsChange([...measurements, { 
            // Comunes
            idealUE: "", 
            idealmA: "", 
            patronUE: "", 
            ueTransmitter: "", 
            maTransmitter: "",
            percentage: "", 
            
            // RTD (Ohm)
            idealohm: "", 
            ohmTransmitter: "", 
            
            // TC (mV)
            idealMV: "",
            sensorMV: "",
            sensorType: "J", // Valor inicial por defecto

            //TX 
            mATX: "",
            
            // Errores
            errorUE: "", 
            errormA: "", 
            errorPercentage: "", 
            errorOhm: "",
            errorMV: ""
        }]);
    };

    return (
        <div className="mt-8 w-full bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            {/* Toolbar */}
            <div className="bg-gradient-to-r from-teal-600 to-emerald-600 px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-3">
                    <h3 className="text-lg font-bold text-white">Mediciones</h3>
                    <div className="flex bg-black/20 p-1 rounded-lg border border-white/10">
                        <button 
                            onClick={() => setOutputUnit('mA')} 
                            className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${outputUnit === 'mA' ? 'bg-white text-teal-700 shadow' : 'text-white hover:bg-white/10'}`}
                        >
                            mA
                        </button>
                        <button 
                            onClick={() => setOutputUnit('ohm')} 
                            className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${outputUnit === 'ohm' ? 'bg-white text-teal-700 shadow' : 'text-white hover:bg-white/10'}`}
                        >
                            RTD
                        </button>
                        <button 
                            onClick={() => setOutputUnit('mv')} 
                            className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${outputUnit === 'mv' ? 'bg-white text-teal-700 shadow' : 'text-white hover:bg-white/10'}`}
                        >
                            mV / TC
                        </button>
                        <button 
                            onClick={() => setOutputUnit('tx')} 
                            className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${outputUnit === 'tx' ? 'bg-white text-teal-700 shadow' : 'text-white hover:bg-white/10'}`}
                        >
                            TX
                        </button>
                    </div>
                </div>
                <button 
                    onClick={addNewRow} 
                    className="px-4 py-2 bg-white text-teal-700 font-bold rounded-lg shadow-md hover:bg-teal-50 transition-transform active:scale-95"
                >
                    Nueva fila
                </button>
            </div>

            {/* Selector de Tabla Condicional */}
            <div className="w-full">
                {outputUnit === 'mA' && (
                    <TableMA 
                        measurements={measurements} 
                        onMeasurementsChange={onMeasurementsChange} 
                        hasUeTransmitter={hasUeTransmitter} 
                    />
                )}
                
                {outputUnit === 'ohm' && (
                    <TableRTD 
                        measurements={measurements} 
                        onMeasurementsChange={onMeasurementsChange} 
                        hasUeTransmitter={hasUeTransmitter} 
                    />
                )}

                {outputUnit === 'mv' && (
                    <TableMV 
                        measurements={measurements} 
                        onMeasurementsChange={onMeasurementsChange} 
                        hasUeTransmitter={hasUeTransmitter} 
                    />
                )}

                {outputUnit === 'tx' && (
                    <TableTx 
                        measurements={measurements} 
                        onMeasurementsChange={onMeasurementsChange} 
                        hasUeTransmitter={hasUeTransmitter}
                    />
                )}
            </div>
        </div>
    );
};

export default TransmitterTable;