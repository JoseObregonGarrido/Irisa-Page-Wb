import React from 'react';
import { Measurement } from '../components/TransmitterTable';

// InputField compartido (podrías moverlo a un archivo UI aparte)
const InputField = ({ label, value, onChange, unit, isError = false, readOnly = false }: any) => (
    <div className="flex flex-col w-full">
        <label className="block text-[10px] font-bold text-gray-500 mb-1 lg:hidden">{label}</label>
        <div className="relative w-full">
            <input
                type="text" value={value} onChange={onChange} readOnly={readOnly}
                className={`w-full px-2 py-2 pr-7 text-xs border rounded-lg focus:outline-none focus:ring-2 
                    ${isError ? 'border-red-200 bg-red-50 focus:ring-red-500 font-bold text-red-700' : 'border-gray-300 bg-white focus:ring-teal-500 text-gray-700'} 
                    ${readOnly ? 'bg-gray-50 cursor-not-allowed' : ''}`}
            />
            <span className={`absolute right-1.5 top-2.5 text-[9px] font-bold ${isError ? 'text-red-400' : 'text-gray-400'}`}>{unit}</span>
        </div>
    </div>
);

const MaRtdTable: React.FC<any> = ({ measurements, onMeasurementsChange, hasUeTransmitter }) => {
    const gridCols = hasUeTransmitter ? 'lg:grid-cols-12' : 'lg:grid-cols-10';

    const calculate = (m: Measurement) => {
        const errUE = (parseFloat(m.ueTransmitter) || 0) - (parseFloat(m.idealUE) || 0);
        const errMa = (parseFloat(m.maTransmitter) || 0) - (parseFloat(m.idealmA) || 0);
        return { 
            ...m, 
            errorUE: errUE.toFixed(3), 
            errormA: errMa.toFixed(3), 
            errorPercentage: ((errMa / 16) * 100).toFixed(2) 
        };
    };

    const handleChange = (index: number, field: keyof Measurement, value: string) => {
        const newArr = [...measurements];
        newArr[index] = calculate({ ...newArr[index], [field]: value });
        onMeasurementsChange(newArr);
    };

    return (
        <div className="overflow-x-auto">
            <div className="min-w-full lg:min-w-[1300px] inline-block align-middle">
                <div className={`hidden lg:grid ${gridCols} bg-gray-50 border-b border-gray-200 text-[10px] font-bold text-gray-500 tracking-wider`}>
                    <div className="px-2 py-4 text-center">Ideal UE</div>
                    <div className="px-2 py-4 text-center">Ideal mA</div>
                    <div className="px-2 py-4 text-center">Ideal Ω</div>
                    <div className="px-2 py-4 text-center">Patrón UE</div>
                    {hasUeTransmitter && <div className="px-2 py-4 text-center">UE trans.</div>}
                    <div className="px-2 py-4 text-center">mA sensor</div>
                    <div className="px-2 py-4 text-center">Ω sensor</div>
                    <div className="px-2 py-4 text-center">% Rango</div>
                    {hasUeTransmitter && <div className="px-2 py-4 text-center bg-red-50 text-red-700">Error UE</div>}
                    <div className="px-2 py-4 text-center bg-red-50 text-red-700">Error mA</div>
                    <div className="px-2 py-4 text-center bg-red-50 text-red-700">Error %</div>
                    <div className="px-2 py-4 text-center">Acción</div>
                </div>
                {measurements.map((m: any, i: number) => (
                    <div key={i} className={`lg:grid ${gridCols} lg:items-center hover:bg-teal-50/30 border-b`}>
                        <div className="grid grid-cols-2 lg:contents p-4 lg:p-0 gap-4">
                            <InputField label="Ideal UE" unit="UE" value={m.idealUE} onChange={(e:any) => handleChange(i, 'idealUE', e.target.value)} />
                            <InputField label="Ideal mA" unit="mA" value={m.idealmA} onChange={(e:any) => handleChange(i, 'idealmA', e.target.value)} />
                            <InputField label="Ideal Ω" unit="Ω" value={m.idealohm} onChange={(e:any) => handleChange(i, 'idealohm', e.target.value)} />
                            <InputField label="Patrón UE" unit="UE" value={m.patronUE} onChange={(e:any) => handleChange(i, 'patronUE', e.target.value)} />
                            {hasUeTransmitter && <InputField label="UE trans." unit="UE" value={m.ueTransmitter} onChange={(e:any) => handleChange(i, 'ueTransmitter', e.target.value)} />}
                            <InputField label="mA sensor" unit="mA" value={m.maTransmitter} onChange={(e:any) => handleChange(i, 'maTransmitter', e.target.value)} />
                            <InputField label="Ω sensor" unit="Ω" value={m.ohmTransmitter} onChange={(e:any) => handleChange(i, 'ohmTransmitter', e.target.value)} />
                            <InputField label="% Rango" unit="%" value={m.percentage} onChange={(e:any) => handleChange(i, 'percentage', e.target.value)} />
                            {hasUeTransmitter && <InputField label="Error UE" unit="UE" value={m.errorUE} isError readOnly />}
                            <InputField label="Error mA" unit="mA" value={m.errormA} isError readOnly />
                            <InputField label="Error %" unit="%" value={m.errorPercentage} isError readOnly />
                            <button onClick={() => onMeasurementsChange(measurements.filter((_:any, idx:number) => idx !== i))} className="text-red-500 m-auto">🗑️</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
export default MaRtdTable;