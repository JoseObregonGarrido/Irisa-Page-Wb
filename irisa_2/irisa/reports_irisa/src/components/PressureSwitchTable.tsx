import React from 'react';

export interface PressureSwitchTest {
    typeTest: string; // Enum: 'RISING', 'FALLING'
    appliedPressure: string;
    realPressureChange: string;
    stateContact: string;
    meetsSpecification: boolean;
}

interface PressureSwitchTableProps {
    tests: PressureSwitchTest[];
    onTestsChange: (tests: PressureSwitchTest[]) => void;
}

// --- COMPONENTES EXTRAÍDOS PARA EVITAR PÉRDIDA DE FOCO ---

const TableInput = ({ value, onChange, unit, placeholder }: any) => (
    <div className="relative w-full">
        <input 
            type="text" 
            value={value} 
            onChange={onChange} 
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none" 
            placeholder={placeholder || "0.00"} 
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

const PressureSwitchTable: React.FC<PressureSwitchTableProps> = ({ tests, onTestsChange }) => {

    const handleAddRow = () => {
        onTestsChange([...tests, { typeTest: 'ASCENDENTE', appliedPressure: '', realPressureChange: '', stateContact: '', meetsSpecification: false }]);
    };

    const handleDeleteRow = (indexToDelete: number) => {
        const newTests = tests.filter((_, index) => index !== indexToDelete);
        onTestsChange(newTests);
    };

    const handleChange = (index: number, field: keyof PressureSwitchTest, value: string | boolean) => {
        const newTests = [...tests];
        newTests[index] = { ...newTests[index], [field]: value } as PressureSwitchTest;
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
            <div className="bg-gradient-to-r from-teal-600 to-emerald-600 rounded-t-xl px-4 md:px-6 py-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center">
                        <svg className="w-6 h-6 text-white mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                        </svg>
                        <h3 className="text-xl font-bold text-white uppercase tracking-tight">Pruebas de Presostato</h3>
                    </div>
                    <button 
                        onClick={handleAddRow} 
                        className="flex items-center justify-center px-4 py-2 bg-white text-teal-700 hover:bg-teal-50 font-bold rounded-lg transition-all shadow-md active:scale-95 text-sm"
                    >
                        AGREGAR FILA
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-b-xl shadow-lg border border-gray-200 overflow-hidden">
                {/* --- MODO MOBILE --- */}
                <div className="block md:hidden divide-y divide-gray-200">
                    {tests.map((test, index) => (
                        <div key={index} className="p-4 space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-bold text-teal-600 uppercase tracking-wider">Prueba #{index + 1}</span>
                                <button onClick={() => handleDeleteRow(index)} className="text-red-500 p-1 hover:bg-red-50 rounded">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                </button>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Tipo de Prueba</label>
                                    <TableSelect value={test.typeTest} onChange={(e:any) => handleChange(index, 'typeTest', e.target.value)} options={typeOptions} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Presión Aplicada</label>
                                    <TableInput value={test.appliedPressure} onChange={(e:any) => handleChange(index, 'appliedPressure', e.target.value)} unit="PSI" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Cambio Real</label>
                                    <TableInput value={test.realPressureChange} onChange={(e:any) => handleChange(index, 'realPressureChange', e.target.value)} unit="PSI" />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Estado de Contacto</label>
                                    <TableSelect value={test.stateContact} onChange={(e:any) => handleChange(index, 'stateContact', e.target.value)} options={contactOptions} />
                                </div>
                                <div className="col-span-2 flex items-center justify-between bg-teal-50 p-3 rounded-lg border border-teal-100">
                                    <span className="text-sm font-bold text-teal-800 uppercase">¿Cumple especificación?</span>
                                    <input type="checkbox" checked={test.meetsSpecification} onChange={(e) => handleChange(index, 'meetsSpecification', e.target.checked)} className="w-6 h-6 text-teal-600 rounded focus:ring-teal-500" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* --- MODO DESKTOP --- */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-4 py-4 text-left font-bold text-gray-600 uppercase tracking-wider">Tipo</th>
                                <th className="px-4 py-4 text-left font-bold text-gray-600 uppercase tracking-wider">P. Aplicada</th>
                                <th className="px-4 py-4 text-left font-bold text-gray-600 uppercase tracking-wider">Cambio Real</th>
                                <th className="px-4 py-4 text-left font-bold text-gray-600 uppercase tracking-wider">Estado</th>
                                <th className="px-4 py-4 text-center font-bold text-gray-600 uppercase tracking-wider">Cumple</th>
                                <th className="px-4 py-4 text-center font-bold text-gray-600 uppercase tracking-wider">Acción</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {tests.map((test, index) => (
                                <tr key={index} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-3 min-w-[150px]">
                                        <TableSelect value={test.typeTest} onChange={(e:any) => handleChange(index, 'typeTest', e.target.value)} options={typeOptions} />
                                    </td>
                                    <td className="px-4 py-3">
                                        <TableInput value={test.appliedPressure} onChange={(e:any) => handleChange(index, 'appliedPressure', e.target.value)} unit="PSI" />
                                    </td>
                                    <td className="px-4 py-3">
                                        <TableInput value={test.realPressureChange} onChange={(e:any) => handleChange(index, 'realPressureChange', e.target.value)} unit="PSI" />
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
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-4">
                            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                        </div>
                        <p className="text-gray-500 font-medium mb-4">No hay pruebas registradas.</p>
                        <button onClick={handleAddRow} className="text-teal-600 font-bold hover:text-teal-700 transition-colors uppercase text-sm tracking-wider">Agregar la primera ahora</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PressureSwitchTable;