import { TableMA } from './TableMA';
import { TableRTD } from './TableRTD';
import { TableMV } from './TableMV';
import { TableTx} from './TableTX';

const TransmitterTable = ({ 
    measurements, 
    onMeasurementsChange, 
    outputUnit, 
    setOutputUnit, 
    hasUeTransmitter 
}: any) => {

    const addNewRow = () => {
        // Objeto unificado con todos los campos para evitar errores de undefined en las tablas hijas
        onMeasurementsChange([...measurements, { 
            // Comunes e Identificación
            idealUE: "", 
            idealmA: "", 
            patronUE: "", 
            ueTransmitter: "", 
            maTransmitter: "",
            percentage: "", 
            
            // Campos específicos RTD (Ohm)
            idealohm: "", 
            ohmTransmitter: "", 
            
            // Campos específicos TC (mV)
            idealmV: "",
            sensormV: "",
            sensorType: "J", 

            // Campos específicos TX 
            mATX: "",
            
            // Errores calculados
            errorUE: "", 
            errormA: "", 
            errorPercentage: "", 
            errorOhm: "",
            errormV: ""
        }]);
    };

    return (
        <div className="mt-8 w-full bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            {/* Toolbar / Header */}
            <div className="bg-gradient-to-r from-teal-600 to-emerald-600 px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-lg font-bold text-white tracking-tight">Mediciones del transmisor</h3>
                    <div className="flex bg-black/20 p-1 rounded-lg border border-white/10">
                        {(['mA', 'ohm', 'mv', 'tx'] as const).map((unit) => (
                            <button 
                                key={unit}
                                onClick={() => setOutputUnit(unit)} 
                                className={`px-4 py-1 text-[11px] font-bold rounded-md transition-all ${outputUnit === unit ? 'bg-white text-teal-700 shadow' : 'text-white hover:bg-white/10'}`}
                            >
                                {unit === 'ohm' ? 'RTD' : unit === 'mv' ? 'mV / TC' : unit.toUpperCase()}
                            </button>
                        ))}
                    </div>
                </div>
                
                <button 
                    onClick={addNewRow} 
                    className="px-5 py-2 bg-white text-teal-700 font-bold rounded-lg shadow-md hover:bg-teal-50 transition-transform active:scale-95 flex items-center gap-2"
                >
                    <span className="text-xl">+</span> Nueva fila
                </button>
            </div>

            {/* Renderizado Condicional de Tablas según outputUnit */}
            <div className="w-full overflow-x-auto">
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