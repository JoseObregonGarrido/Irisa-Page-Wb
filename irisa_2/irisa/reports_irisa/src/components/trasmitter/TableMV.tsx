import { InputField } from './InputField';

export const TableMV = ({ measurements, onMeasurementsChange }: any) => {
    // CAMBIO CLAVE: Usamos 1fr para que las columnas de datos se expandan equitativamente
    // 140px para el tipo de sensor y 80px para la acción se mantienen fijos para no deformarse
    const gridCols = 'lg:grid-cols-[1fr_1fr_140px_1fr_80px]';

    const handleChange = (index: number, field: string, value: any) => {
        const newM = [...measurements];
        const updatedRow = { ...newM[index], [field]: value };
        
        const idealVal = parseFloat(updatedRow.idealmV) || 0;
        const sensorVal = parseFloat(updatedRow.sensormV) || 0;
        
        updatedRow.errormV = (idealVal - sensorVal ).toFixed(3);

        newM[index] = updatedRow;
        onMeasurementsChange(newM);
    };

    return (
        <div className="w-full overflow-hidden">
            <div className="w-full">
                {/* Header Desktop - Ahora con w-full y el grid expansivo */}
                <div className={`hidden lg:grid ${gridCols} bg-gray-50 border-b border-gray-200 text-[10px] font-bold text-gray-500 uppercase tracking-wider w-full`}>
                    <div className="px-4 py-4 text-center">mV ideal</div>
                    <div className="px-4 py-4 text-center">mV sensor</div>
                    <div className="px-4 py-4 text-center">Tipo sensor</div>
                    <div className="px-4 py-4 text-center bg-red-50 text-red-700">Error mV</div>
                    <div className="px-4 py-4 text-center">Acción</div>
                </div>

                {/* Filas */}
                <div className="divide-y divide-gray-200 bg-white w-full">
                    {measurements.map((m: any, i: number) => (
                        <div key={i} className="group hover:bg-teal-50/30 transition-colors w-full">
                            <div className={`flex flex-col lg:grid ${gridCols} lg:items-center w-full`}>
                                
                                {/* MV IDEAL */}
                                <div className="p-4 lg:px-6 lg:py-3">
                                    <InputField 
                                        label="mV ideal" 
                                        unit="mV" 
                                        value={m.idealmV} 
                                        onChange={(e:any) => handleChange(i, 'idealmV', e.target.value)} 
                                    />
                                </div>

                                {/* MV SENSOR */}
                                <div className="p-4 lg:px-6 lg:py-3">
                                    <InputField 
                                        label="mV sensor" 
                                        unit="mV" 
                                        value={m.sensormV} 
                                        onChange={(e:any) => handleChange(i, 'sensormV', e.target.value)} 
                                    />
                                </div>
                                
                                {/* TIPO SENSOR */}
                                <div className="p-4 lg:px-2 lg:py-3 flex flex-col items-center justify-center">
                                    <div className="flex gap-3 bg-gray-100 p-1.5 rounded-lg border border-gray-200 shadow-sm w-fit">
                                        {['J', 'K'].map((type) => (
                                            <label key={type} className="flex items-center gap-1.5 cursor-pointer group/label">
                                                <input 
                                                    type="checkbox" 
                                                    checked={m.sensorType === type} 
                                                    onChange={() => handleChange(i, 'sensorType', type)} 
                                                    className="w-3.5 h-3.5 accent-orange-600 rounded" 
                                                />
                                                <span className={`text-xs font-bold ${m.sensorType === type ? 'text-orange-700' : 'text-gray-400'}`}>
                                                    {type}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* ERROR mV */}
                                <div className="p-4 lg:px-6 lg:py-3 lg:bg-red-50/20 h-full flex items-center">
                                    <InputField 
                                        label="Error mV" 
                                        unit="mV" 
                                        value={m.errormV} 
                                        isError 
                                        readOnly 
                                    />
                                </div>

                                {/* ACCIÓN */}
                                <div className="p-4 lg:py-3 flex justify-center items-center">
                                    <button 
                                        onClick={() => onMeasurementsChange(measurements.filter((_:any, idx:any) => idx !== i))} 
                                        className="text-red-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-full transition-all"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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