import { InputField } from './InputField';

export const TableTx = ({ measurements, onMeasurementsChange }: any) => {
    const gridCols = 'lg:grid-cols-[1fr_1fr_140px_1fr_80px]';

    const handleChange = (index: number, field: string, value: any) => {
        const newM = [...measurements];
        const updatedRow = { ...newM[index], [field]: value };

        const idealMA = parseFloat(updatedRow.idealmA) || 0;
        const mATX = parseFloat(updatedRow.mATX || updatedRow.maTransmitter || 0) || 0;

        // Guardamos el error en errormA: ideal menos medición TX
        updatedRow.errormA = (idealMA - mATX).toFixed(3);

        newM[index] = updatedRow;
        onMeasurementsChange(newM);
    };

    return (
        <div className="w-full overflow-hidden">
            <div className="w-full">
                <div className={`hidden lg:grid ${gridCols} bg-gray-50 border-b border-gray-200 text-[10px] font-bold text-gray-500 uppercase tracking-wider w-full`}>
                    <div className="px-4 py-4 text-center">mA</div>
                    <div className="px-4 py-4 text-center">mA TX</div>
                    <div className="px-4 py-4 text-center">Tipo sensor</div>
                    <div className="px-4 py-4 text-center bg-red-50 text-red-700">Err mA</div>
                    <div className="px-4 py-4 text-center">Acción</div>
                </div>

                <div className="divide-y divide-gray-200 bg-white w-full">
                    {measurements.map((m: any, i: number) => (
                        <div key={i} className="group hover:bg-teal-50/30 transition-colors w-full">
                            <div className={`flex flex-col lg:grid ${gridCols} lg:items-center w-full`}>
                                <div className="p-4 lg:px-6 lg:py-3">
                                    <InputField 
                                        label="Ideal mA" 
                                        unit="mA" 
                                        value={m.idealmA} 
                                        onChange={(e:any) => handleChange(i, 'idealmA', e.target.value)} 
                                    />
                                </div>

                                <div className="p-4 lg:px-6 lg:py-3">
                                    <InputField 
                                        label="mA TX" 
                                        unit="mA" 
                                        value={m.mATX || m.maTransmitter} 
                                        onChange={(e:any) => handleChange(i, 'mATX', e.target.value)} 
                                    />
                                </div>

                                <div className="p-4 lg:px-2 lg:py-3 flex flex-col items-center justify-center">
                                    <div className="flex gap-3 bg-gray-100 p-1.5 rounded-lg border border-gray-200 shadow-sm w-fit">
                                        {['J', 'K'].map((type) => (
                                            <label key={type} className="flex items-center gap-1.5 cursor-pointer group/label">
                                                <input 
                                                    type="radio" 
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

                                <div className="p-4 lg:px-6 lg:py-3 lg:bg-red-50/20 h-full flex items-center">
                                    <InputField 
                                        label="Err mA" 
                                        unit="mA" 
                                        value={m.errormA} 
                                        isError 
                                        readOnly 
                                    />
                                </div>

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