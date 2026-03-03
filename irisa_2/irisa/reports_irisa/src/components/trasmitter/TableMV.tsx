import { InputField } from './InputField';

export const TableMV = ({ measurements, onMeasurementsChange }: any) => {
    // Ajustamos las proporciones: 1fr para inputs (crecen igual), 160px para el selector de sensor
    const gridCols = 'lg:grid-cols-[1fr_1fr_160px_1fr_80px]';

    const handleChange = (index: number, field: string, value: any) => {
        const newM = [...measurements];
        const updatedRow = { ...newM[index], [field]: value };
        
        // Lógica de cálculo: Error = Sensor - Ideal
        const idealVal = parseFloat(updatedRow.idealmV) || 0;
        const sensorVal = parseFloat(updatedRow.sensormV) || 0;
        
        updatedRow.errormV = (sensorVal - idealVal).toFixed(3);

        newM[index] = updatedRow;
        onMeasurementsChange(newM);
    };

    return (
        <div className="w-full">
            <div className="min-w-full">
                {/* Header Desktop - bg-gray-50 para diferenciar la cabecera */}
                <div className={`hidden lg:grid ${gridCols} bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider`}>
                    <div className="px-6 py-4 text-center">mV ideal</div>
                    <div className="px-6 py-4 text-center">mV sensor</div>
                    <div className="px-6 py-4 text-center">Tipo sensor</div>
                    <div className="px-6 py-4 text-center text-red-600">Error mV</div>
                    <div className="px-6 py-4 text-center">Acción</div>
                </div>

                {/* Filas - Eliminamos paddings laterales innecesarios para que pegue a los bordes */}
                <div className="divide-y divide-gray-200 bg-white">
                    {measurements.map((m: any, i: number) => (
                        <div key={i} className="hover:bg-teal-50/30 transition-colors">
                            <div className={`flex flex-col lg:grid ${gridCols} lg:items-center p-4 lg:p-0`}>
                                
                                {/* MV IDEAL */}
                                <div className="lg:px-6 lg:py-4">
                                    <InputField 
                                        label="mV ideal" 
                                        unit="mV" 
                                        value={m.idealmV} 
                                        onChange={(e:any) => handleChange(i, 'idealmV', e.target.value)} 
                                    />
                                </div>

                                {/* MV SENSOR */}
                                <div className="lg:px-6 lg:py-4">
                                    <InputField 
                                        label="mV sensor" 
                                        unit="mV" 
                                        value={m.sensormV} 
                                        onChange={(e:any) => handleChange(i, 'sensormV', e.target.value)} 
                                    />
                                </div>
                                
                                {/* TIPO SENSOR (J / K) */}
                                <div className="lg:px-6 lg:py-4 flex flex-col items-center justify-center">
                                    <label className="text-[10px] font-black text-gray-400 uppercase mb-2 lg:hidden">Tipo Sensor</label>
                                    <div className="flex gap-4 bg-gray-50 p-2 rounded-lg border border-gray-200 shadow-sm px-4 w-full justify-center">
                                        {['J', 'K'].map((type) => (
                                            <label key={type} className="flex items-center gap-2 cursor-pointer group">
                                                <input 
                                                    type="checkbox" 
                                                    checked={m.sensorType === type} 
                                                    onChange={() => handleChange(i, 'sensorType', type)} 
                                                    className="w-4 h-4 accent-orange-600 rounded border-gray-300 transition-transform group-hover:scale-110" 
                                                />
                                                <span className={`text-sm font-bold ${m.sensorType === type ? 'text-orange-700' : 'text-gray-400'}`}>
                                                    {type}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* ERROR mV */}
                                <div className="lg:px-6 lg:py-4 lg:bg-red-50/30 h-full flex items-center">
                                    <InputField 
                                        label="Error mV" 
                                        unit="mV" 
                                        value={m.errormV} 
                                        isError 
                                        readOnly 
                                    />
                                </div>

                                {/* ACCIÓN (ELIMINAR) */}
                                <div className="flex justify-center items-center py-4 lg:py-0">
                                    <button 
                                        onClick={() => onMeasurementsChange(measurements.filter((_:any, idx:any) => idx !== i))} 
                                        className="text-red-500 hover:bg-red-100 p-2 rounded-full transition-colors shadow-sm lg:shadow-none border border-red-100 lg:border-none"
                                        title="Eliminar fila"
                                    >
                                        <svg className="w-6 h-6 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};