import { InputField } from './InputField';

export const TableMA = ({ measurements, onMeasurementsChange, hasUeTransmitter }: any) => {
    // Definimos las columnas exactas. 10 si hay UE, 8 si no.
    const gridClass = hasUeTransmitter ? "lg:grid-cols-10" : "lg:grid-cols-8";

    const handleChange = (index: number, field: string, value: string) => {
        const newM = [...measurements];
        const updatedRow = { ...newM[index], [field]: value };
        
        const idealmA = parseFloat(updatedRow.idealmA) || 0;
        const maTrans = parseFloat(updatedRow.maTransmitter) || 0;
        const idealUE = parseFloat(updatedRow.idealUE) || 0;
        const ueTrans = parseFloat(updatedRow.ueTransmitter) || 0;

        // Cálculos
        updatedRow.errorUE = (ueTrans - idealUE).toFixed(3);
        updatedRow.errormA = (maTrans - idealmA).toFixed(3);
        updatedRow.errorPercentage = (((maTrans - idealmA) / 16) * 100).toFixed(2);

        newM[index] = updatedRow;
        onMeasurementsChange(newM);
    };

    return (
        <div className="overflow-x-auto w-full">
            <div className="min-w-[1000px] lg:min-w-full">
                {/* HEADER DESKTOP */}
                <div className={`hidden lg:grid ${gridClass} bg-gray-50 border-b border-gray-200 text-[10px] font-bold text-gray-500 uppercase tracking-wider`}>
                    <div className="px-2 py-4 text-center">Ideal UE</div>
                    <div className="px-2 py-4 text-center">Ideal mA</div>
                    <div className="px-2 py-4 text-center">Patrón UE</div>
                    {hasUeTransmitter && <div className="px-2 py-4 text-center">UE Trans.</div>}
                    <div className="px-2 py-4 text-center">mA Trans.</div>
                    <div className="px-2 py-4 text-center">% Rango</div>
                    
                    {/* ZONA DE ERRORES (ROJA) */}
                    {hasUeTransmitter && <div className="px-2 py-4 text-center bg-red-50 text-red-700 border-l border-red-100">Err UE</div>}
                    <div className="px-2 py-4 text-center bg-red-50 text-red-700">Err mA</div>
                    <div className="px-2 py-4 text-center bg-red-50 text-red-700">Err %</div>
                    <div className="px-2 py-4 text-center">Acción</div>
                </div>

                {/* FILAS */}
                <div className="divide-y divide-gray-200 bg-white">
                    {measurements.map((m: any, i: number) => (
                        <div key={i} className={`flex flex-nowrap lg:grid ${gridClass} items-center p-4 lg:p-0 gap-4 lg:gap-0`}>
                            <div className="lg:px-2 lg:py-3"><InputField label="Ideal UE" unit="UE" value={m.idealUE} onChange={(e:any) => handleChange(i, 'idealUE', e.target.value)} /></div>
                            <div className="lg:px-2 lg:py-3"><InputField label="Ideal mA" unit="mA" value={m.idealmA} onChange={(e:any) => handleChange(i, 'idealmA', e.target.value)} /></div>
                            <div className="lg:px-2 lg:py-3"><InputField label="Patrón UE" unit="UE" value={m.patronUE} onChange={(e:any) => handleChange(i, 'patronUE', e.target.value)} /></div>
                            {hasUeTransmitter && (
                                <div className="lg:px-2 lg:py-3"><InputField label="UE Trans." unit="UE" value={m.ueTransmitter} onChange={(e:any) => handleChange(i, 'ueTransmitter', e.target.value)} /></div>
                            )}
                            <div className="lg:px-2 lg:py-3"><InputField label="mA Trans." unit="mA" value={m.maTransmitter} onChange={(e:any) => handleChange(i, 'maTransmitter', e.target.value)} /></div>
                            <div className="lg:px-2 lg:py-3"><InputField label="% Rango" unit="%" value={m.percentage} onChange={(e:any) => handleChange(i, 'percentage', e.target.value)} /></div>
                            
                            {/* COLUMNAS DE ERROR */}
                            {hasUeTransmitter && (
                                <div className="lg:px-2 lg:py-3 lg:bg-red-50/20 border-l border-red-100"><InputField label="Err UE" unit="UE" value={m.errorUE} isError readOnly /></div>
                            )}
                            <div className="lg:px-2 lg:py-3 lg:bg-red-50/20">
                                <InputField label="Err mA" unit="mA" value={m.errormA} isError readOnly />
                            </div>
                            <div className="lg:px-2 lg:py-3 lg:bg-red-50/20">
                                <InputField label="Err %" unit="%" value={m.errorPercentage} isError readOnly />
                            </div>
                            
                            <div className="flex justify-center">
                                <button onClick={() => onMeasurementsChange(measurements.filter((_:any, idx:any) => idx !== i))} className="text-red-500 hover:bg-red-50 p-2 rounded-full transition-all">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};