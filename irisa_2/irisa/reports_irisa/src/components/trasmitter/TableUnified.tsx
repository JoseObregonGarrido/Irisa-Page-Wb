import { InputField } from './InputField';

export const TableUnified = ({ measurements, onMeasurementsChange }: any) => {
    // Añadimos una columna extra para el selector de modo
    const gridCols = 'lg:grid-cols-[100px_1fr_1fr_140px_1fr_80px]';

    const handleChange = (index: number, field: string, value: any) => {
        const newM = [...measurements];
        const updatedRow = { ...newM[index], [field]: value };
        
        // Lógica de cálculo según el modo de la fila
        if (updatedRow.mode === 'tx') {
            const idealMA = parseFloat(updatedRow.idealmA) || 0;
            const mATX = parseFloat(updatedRow.mATX || updatedRow.maTransmitter || 0) || 0;
            updatedRow.errormA = (idealMA - mATX).toFixed(3);
        } else {
            const idealVal = parseFloat(updatedRow.idealmV) || 0;
            const sensorVal = parseFloat(updatedRow.sensormV) || 0;
            updatedRow.errormV = (idealVal - sensorVal).toFixed(3);
        }

        newM[index] = updatedRow;
        onMeasurementsChange(newM);
    };

    return (
        <div className="w-full overflow-hidden border border-gray-200 rounded-xl shadow-sm">
            <div className={`hidden lg:grid ${gridCols} bg-gray-50 border-b border-gray-200 text-[10px] font-bold text-gray-500 uppercase tracking-wider`}>
                <div className="px-4 py-4 text-center">Modo</div>
                <div className="px-4 py-4 text-center">Referencia Ideal</div>
                <div className="px-4 py-4 text-center">Lectura Sensor</div>
                <div className="px-4 py-4 text-center">Tipo sensor</div>
                <div className="px-4 py-4 text-center bg-red-50 text-red-700">Error</div>
                <div className="px-4 py-4 text-center">Acción</div>
            </div>

            <div className="divide-y divide-gray-200 bg-white">
                {measurements.map((m: any, i: number) => {
                    const isTX = m.mode === 'tx';
                    return (
                        <div key={i} className="group hover:bg-teal-50/30 transition-colors">
                            <div className={`flex flex-col lg:grid ${gridCols} lg:items-center`}>
                                
                                {/* SELECTOR DE MODO */}
                                <div className="p-4 lg:px-2 flex justify-center">
                                    <select 
                                        value={m.mode || 'mv'} 
                                        onChange={(e) => handleChange(i, 'mode', e.target.value)}
                                        className="text-[10px] font-bold border rounded-md p-1.5 bg-gray-50 text-gray-700 focus:ring-2 focus:ring-orange-500 outline-none"
                                    >
                                        <option value="mv">Modo mV</option>
                                        <option value="tx">Modo TX</option>
                                    </select>
                                </div>

                                {/* INPUTS DINÁMICOS SEGÚN MODO */}
                                <div className="p-4 lg:px-6 lg:py-3">
                                    <InputField 
                                        label={isTX ? "Ideal mA" : "mV ideal"} 
                                        unit={isTX ? "mA" : "mV"} 
                                        value={isTX ? m.idealmA : m.idealmV} 
                                        onChange={(e:any) => handleChange(i, isTX ? 'idealmA' : 'idealmV', e.target.value)} 
                                    />
                                </div>

                                <div className="p-4 lg:px-6 lg:py-3">
                                    <InputField 
                                        label={isTX ? "mA TX" : "mV sensor"} 
                                        unit={isTX ? "mA" : "mV"} 
                                        value={isTX ? (m.mATX || m.maTransmitter) : m.sensormV} 
                                        onChange={(e:any) => handleChange(i, isTX ? 'mATX' : 'sensormV', e.target.value)} 
                                    />
                                </div>

                                {/* TIPO SENSOR */}
                                <div className="p-4 lg:px-2 lg:py-3 flex flex-col items-center justify-center">
                                    <div className="flex gap-3 bg-gray-100 p-1.5 rounded-lg border border-gray-200">
                                        {['J', 'K'].map((type) => (
                                            <label key={type} className="flex items-center gap-1.5 cursor-pointer">
                                                <input 
                                                    type="radio" 
                                                    checked={m.sensorType === type} 
                                                    onChange={() => handleChange(i, 'sensorType', type)} 
                                                    className="w-3.5 h-3.5 accent-orange-600" 
                                                />
                                                <span className={`text-xs font-bold ${m.sensorType === type ? 'text-orange-700' : 'text-gray-400'}`}>{type}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* ERROR DINÁMICO */}
                                <div className="p-4 lg:px-6 lg:py-3 lg:bg-red-50/20 h-full flex items-center">
                                    <InputField 
                                        label="Error" 
                                        unit={isTX ? "mA" : "mV"} 
                                        value={isTX ? m.errormA : m.errormV} 
                                        isError readOnly 
                                    />
                                </div>

                                <div className="p-4 lg:py-3 flex justify-center items-center">
                                    <button onClick={() => onMeasurementsChange(measurements.filter((_:any, idx:any) => idx !== i))} className="text-red-400 hover:text-red-600 p-2">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};