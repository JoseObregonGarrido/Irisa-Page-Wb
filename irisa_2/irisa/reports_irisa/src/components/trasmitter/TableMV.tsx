import { InputField } from './InputField';

export const TableMV = ({ measurements, onMeasurementsChange }: any) => {
    // Definicion de columnas: Tipo | Ideal | Medido | Sensor(J/K) | Error | Accion
    const gridCols = 'lg:grid-cols-[80px_1fr_1fr_120px_1fr_80px]';

    const handleChange = (index: number, field: string, value: any) => {
        const newM = [...measurements];
        const updatedRow = { ...newM[index], [field]: value };

        // Calculo automatico segun el tipo de fila
        if (updatedRow.rowType === 'tx') {
            const ideal = parseFloat(updatedRow.idealmA) || 0;
            const real  = parseFloat(updatedRow.mATX) || 0;
            updatedRow.errormA = (ideal - real).toFixed(3);
        } else {
            const ideal = parseFloat(updatedRow.idealmV) || 0;
            const real  = parseFloat(updatedRow.sensormV) || 0;
            updatedRow.errormV = (ideal - real).toFixed(3);
        }

        newM[index] = updatedRow;
        onMeasurementsChange(newM);
    };

    const RowTypeBadge = ({ type }: { type: 'mv' | 'tx' }) => (
        <span className={`text-[10px] font-bold uppercase px-3 py-1 rounded-md tracking-tighter border
            ${type === 'mv' 
                ? 'bg-orange-50 text-orange-600 border-orange-200' 
                : 'bg-blue-50 text-blue-600 border-blue-200'}`}>
            {type === 'mv' ? 'Termopar' : 'Transm.'}
        </span>
    );

    return (
        <div className="w-full overflow-x-auto rounded-xl border border-gray-200 shadow-sm bg-white">
            <div className="min-w-[900px]">
                {/* Cabecera */}
                <div className={`grid ${gridCols} bg-gray-50 border-b border-gray-200 text-[11px] font-bold text-gray-500 uppercase`}>
                    <div className="px-4 py-4 text-center">Tipo</div>
                    <div className="px-4 py-4 text-center border-l border-gray-200">Referencia Ideal</div>
                    <div className="px-4 py-4 text-center border-l border-gray-200">Valor Medido</div>
                    <div className="px-4 py-4 text-center border-l border-gray-200">Sensor</div>
                    <div className="px-4 py-4 text-center bg-red-50/50 text-red-600 border-l border-gray-200">Error Calc.</div>
                    <div className="px-4 py-4 text-center border-l border-gray-200">---</div>
                </div>

                {/* Cuerpo de la tabla */}
                <div className="divide-y divide-gray-100">
                    {measurements.map((m: any, i: number) => {
                        const isTX = m.rowType === 'tx';
                        
                        return (
                            <div key={i} className="grid ${gridCols} items-center group hover:bg-gray-50/50 transition-colors">
                                
                                {/* 1. TIPO */}
                                <div className="p-3 flex justify-center">
                                    <RowTypeBadge type={m.rowType ?? 'mv'} />
                                </div>

                                {/* 2. IDEAL */}
                                <div className="p-3 border-l border-gray-100">
                                    <InputField 
                                        label={isTX ? "Ideal mA" : "Ideal mV"} 
                                        unit={isTX ? "mA" : "mV"} 
                                        value={isTX ? m.idealmA : m.idealmV} 
                                        onChange={(e: any) => handleChange(i, isTX ? 'idealmA' : 'idealmV', e.target.value)} 
                                    />
                                </div>

                                {/* 3. MEDIDO */}
                                <div className="p-3 border-l border-gray-100">
                                    <InputField 
                                        label={isTX ? "Salida TX" : "Sensor mV"} 
                                        unit={isTX ? "mA" : "mV"} 
                                        value={isTX ? m.mATX : m.sensormV} 
                                        onChange={(e: any) => handleChange(i, isTX ? 'mATX' : 'sensormV', e.target.value)} 
                                    />
                                </div>

                                {/* 4. TIPO SENSOR (Solo visible para mV) */}
                                <div className="p-3 border-l border-gray-100 flex justify-center">
                                    {!isTX ? (
                                        <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200">
                                            {['J', 'K'].map((type) => (
                                                <button
                                                    key={type}
                                                    onClick={() => handleChange(i, 'sensorType', type)}
                                                    className={`px-3 py-1 text-[10px] font-black rounded-md transition-all ${
                                                        m.sensorType === type 
                                                        ? 'bg-white text-orange-600 shadow-sm' 
                                                        : 'text-gray-400 hover:text-gray-600'
                                                    }`}
                                                >
                                                    {type}
                                                </button>
                                            ))}
                                        </div>
                                    ) : (
                                        <span className="text-[10px] text-gray-300 font-medium italic">N/A (TX)</span>
                                    )}
                                </div>

                                {/* 5. ERROR (Solo Lectura) */}
                                <div className="p-3 border-l border-gray-100 bg-red-50/10">
                                    <InputField 
                                        label="Error" 
                                        unit={isTX ? "mA" : "mV"} 
                                        value={isTX ? m.errormA : m.errormV} 
                                        isError 
                                        readOnly 
                                    />
                                </div>

                                {/* 6. ACCION */}
                                <div className="p-3 border-l border-gray-100 flex justify-center">
                                    <button
                                        onClick={() => onMeasurementsChange(measurements.filter((_: any, idx: any) => idx !== i))}
                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                                        title="Eliminar fila"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};