import React from 'react';

export interface ThermostatTest {
    typeTest: string; // Enum: 'ASCENDENTE', 'DESCENDENTE'
    appliedTemperature: string;
    realTemperatureChange: string;
    stateContact: string;
    meetsSpecification: boolean;
}

interface ThermostatTableProps {
    tests: ThermostatTest[];
    onTestsChange: (tests: ThermostatTest[]) => void;
}

// --- COMPONENTES ATÓMICOS PARA MANTENER EL FOCO ---

const TableInput = ({ value, onChange, unit, placeholder }: any) => (
    <div className="relative w-full">
        <input 
            type="text" 
            value={value} 
            onChange={onChange} 
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none" 
            placeholder={placeholder || "0.0"} 
        />
        {unit && <span className="absolute right-2 top-2 text-[10px] text-gray-400 font-bold">{unit}</span>}
    </div>
);

const TableSelect = ({ value, onChange, options }: any) => (
    <select
        value={value}
        onChange={onChange}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white"
    >
        {options.map((opt: any) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
    </select>
);

// --- COMPONENTE PRINCIPAL ---

const ThermostatTable: React.FC<ThermostatTableProps> = ({ tests, onTestsChange }) => {

    const handleAddRow = () => {
        onTestsChange([...tests, { typeTest: 'ASCENDENTE', appliedTemperature: '', realTemperatureChange: '', stateContact: '', meetsSpecification: false }]);
    };

    const handleDeleteRow = (indexToDelete: number) => {
        const newTests = tests.filter((_, index) => index !== indexToDelete);
        onTestsChange(newTests);
    };

    const handleChange = (index: number, field: keyof ThermostatTest, value: string | boolean) => {
        const newTests = [...tests];
        newTests[index] = { ...newTests[index], [field]: value } as ThermostatTest;
        onTestsChange(newTests);
    };

    const typeOptions = [
        { value: 'ASCENDENTE', label: 'Ascendente' },
        { value: 'DESCENDENTE', label: 'Descendente' }
    ];

    const contactOptions = [
        { value: '', label: 'Seleccionar...' },
        { value: 'ABIERTO', label: 'Abierto' },
        { value: 'CERRADO', label: 'Cerrado' },
        { value: 'NO_CAMBIO', label: 'Sin Cambio' }
    ];

    return (
        <div className="mt-8">
            {/* Header */}
            <div className="bg-gradient-to-r from-teal-600 to-emerald-600 rounded-t-xl px-4 py-4 md:px-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center">
                        <svg className="w-6 h-6 text-white mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-1v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-1c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-1" />
                        </svg>
                        <h3 className="text-xl font-bold text-white uppercase tracking-tight">Pruebas de Termostato</h3>
                    </div>
                    <button 
                        onClick={handleAddRow} 
                        className="w-full sm:w-auto flex items-center justify-center px-4 py-2 bg-white text-teal-700 hover:bg-teal-50 font-bold rounded-lg transition-all shadow-md active:scale-95 text-sm"
                    >
                        AGREGAR PRUEBA
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-b-xl shadow-lg border border-gray-200 overflow-hidden">
                {/* --- MOBILE VIEW --- */}
                <div className="block md:hidden divide-y divide-gray-200">
                    {tests.map((test, index) => (
                        <div key={index} className="p-4 space-y-4">
                            <div className="flex justify-between items-center border-b pb-2">
                                <span className="text-xs font-bold text-teal-600 uppercase tracking-widest">Prueba #{index + 1}</span>
                                <button onClick={() => handleDeleteRow(index)} className="p-2 text-red-500 bg-red-50 rounded-full">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase">Tipo de Prueba</label>
                                    <TableSelect value={test.typeTest} onChange={(e:any) => handleChange(index, 'typeTest', e.target.value)} options={typeOptions} />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-gray-400 uppercase">Temp. Aplicada</label>
                                    <TableInput value={test.appliedTemperature} onChange={(e:any) => handleChange(index, 'appliedTemperature', e.target.value)} unit="°C" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-gray-400 uppercase">Cambio Real</label>
                                    <TableInput value={test.realTemperatureChange} onChange={(e:any) => handleChange(index, 'realTemperatureChange', e.target.value)} unit="°C" />
                                </div>
                                <div className="col-span-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase">Estado Contacto</label>
                                    <TableSelect value={test.stateContact} onChange={(e:any) => handleChange(index, 'stateContact', e.target.value)} options={contactOptions} />
                                </div>
                                <div className="col-span-2 flex items-center justify-between bg-teal-50 p-3 rounded-lg border border-teal-100">
                                    <span className="text-sm font-bold text-teal-800 uppercase">¿Cumple Especificación?</span>
                                    <input type="checkbox" checked={test.meetsSpecification} onChange={(e) => handleChange(index, 'meetsSpecification', e.target.checked)} className="w-6 h-6 text-teal-600 rounded focus:ring-teal-500" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* --- DESKTOP VIEW --- */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-4 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Tipo de Prueba</th>
                                <th className="px-4 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Temp. Aplicada</th>
                                <th className="px-4 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Cambio Real</th>
                                <th className="px-4 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Estado</th>
                                <th className="px-4 py-4 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">Cumple</th>
                                <th className="px-4 py-4 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">Acción</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {tests.map((test, index) => (
                                <tr key={index} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-3 min-w-[150px]">
                                        <TableSelect value={test.typeTest} onChange={(e:any) => handleChange(index, 'typeTest', e.target.value)} options={typeOptions} />
                                    </td>
                                    <td className="px-4 py-3">
                                        <TableInput value={test.appliedTemperature} onChange={(e:any) => handleChange(index, 'appliedTemperature', e.target.value)} unit="°C" />
                                    </td>
                                    <td className="px-4 py-3">
                                        <TableInput value={test.realTemperatureChange} onChange={(e:any) => handleChange(index, 'realTemperatureChange', e.target.value)} unit="°C" />
                                    </td>
                                    <td className="px-4 py-3 min-w-[150px]">
                                        <TableSelect value={test.stateContact} onChange={(e:any) => handleChange(index, 'stateContact', e.target.value)} options={contactOptions} />
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <input type="checkbox" checked={test.meetsSpecification} onChange={(e) => handleChange(index, 'meetsSpecification', e.target.checked)} className="w-5 h-5 text-teal-600 border-gray-300 rounded focus:ring-teal-500" />
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <button onClick={() => handleDeleteRow(index)} className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded-full transition-colors">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Empty State */}
                {tests.length === 0 && (
                    <div className="text-center py-12 px-4 bg-gray-50/50">
                        <p className="text-gray-500 italic">No hay registros. Presione "Agregar Prueba" para comenzar.</p>
                    </div>
                )}

                {/* Footer Summary */}
                {tests.length > 0 && (
                    <div className="bg-gray-50 px-4 py-4 border-t border-gray-200">
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-bold uppercase tracking-tight">
                            <div className="flex gap-6">
                                <span className="text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">Conformes: {tests.filter(t => t.meetsSpecification).length}</span>
                                <span className="text-red-600 bg-red-50 px-3 py-1 rounded-full border border-red-100">No conformes: {tests.filter(t => !t.meetsSpecification).length}</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ThermostatTable;