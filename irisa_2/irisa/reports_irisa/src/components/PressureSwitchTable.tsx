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

    return (
        <div className="mt-8">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-teal-600 to-emerald-600 rounded-t-xl px-4 md:px-6 py-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center">
                        <svg className="w-6 h-6 text-white mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                        </svg>
                        <h3 className="text-xl font-bold text-white">Pruebas de Presostato</h3>
                    </div>
                    <button 
                        onClick={handleAddRow} 
                        className="flex items-center justify-center px-4 py-2 bg-black bg-opacity-20 hover:bg-opacity-30 text-white font-semibold rounded-lg transition-all backdrop-blur-sm text-sm"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Agregar Fila
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-b-xl shadow-lg border border-gray-200 overflow-hidden">
                {/* --- MODO MOBILE (Cards) --- */}
                <div className="block md:hidden divide-y divide-gray-200">
                    {tests.map((test, index) => (
                        <div key={index} className="p-4 space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-bold text-teal-600 uppercase tracking-wider">Prueba #{index + 1}</span>
                                <button onClick={() => handleDeleteRow(index)} className="text-red-500 p-1">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                </button>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Tipo de Prueba</label>
                                    <select
                                        value={test.typeTest}
                                        onChange={(e) => handleChange(index, 'typeTest', e.target.value)}
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                                    >
                                        <option value="ASCENDENTE">Ascendente</option>
                                        <option value="DESCENDENTE">Descendente</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Presión Aplicada</label>
                                    <div className="relative">
                                        <input type="text" value={test.appliedPressure} onChange={(e) => handleChange(index, 'appliedPressure', e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="0.00" />
                                        <span className="absolute right-2 top-2 text-[10px] text-gray-400">PSI</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Cambio Real</label>
                                    <div className="relative">
                                        <input type="text" value={test.realPressureChange} onChange={(e) => handleChange(index, 'realPressureChange', e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="0.00" />
                                        <span className="absolute right-2 top-2 text-[10px] text-gray-400">PSI</span>
                                    </div>
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Estado de Contacto</label>
                                    <select value={test.stateContact} onChange={(e) => handleChange(index, 'stateContact', e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm">
                                        <option value="">Seleccionar...</option>
                                        <option value="ABIERTO">Abierto</option>
                                        <option value="CERRADO">Cerrado</option>
                                        <option value="NO_CAMBIO">Sin Cambio</option>
                                    </select>
                                </div>
                                <div className="col-span-2 flex items-center justify-between bg-gray-50 p-2 rounded-lg">
                                    <span className="text-sm font-medium text-gray-700">¿Cumple especificación?</span>
                                    <input type="checkbox" checked={test.meetsSpecification} onChange={(e) => handleChange(index, 'meetsSpecification', e.target.checked)} className="w-5 h-5 text-teal-600 rounded focus:ring-teal-500" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* --- MODO DESKTOP (Tabla) --- */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-4 py-4 text-left font-bold text-gray-700 uppercase tracking-wider">Tipo</th>
                                <th className="px-4 py-4 text-left font-bold text-gray-700 uppercase tracking-wider">P. Aplicada</th>
                                <th className="px-4 py-4 text-left font-bold text-gray-700 uppercase tracking-wider">Cambio Real</th>
                                <th className="px-4 py-4 text-left font-bold text-gray-700 uppercase tracking-wider">Estado</th>
                                <th className="px-4 py-4 text-center font-bold text-gray-700 uppercase tracking-wider">Cumple</th>
                                <th className="px-4 py-4 text-center font-bold text-gray-700 uppercase tracking-wider">Acción</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {tests.map((test, index) => (
                                <tr key={index} className="hover:bg-gray-50">
                                    <td className="px-4 py-3">
                                        <select value={test.typeTest} onChange={(e) => handleChange(index, 'typeTest', e.target.value)} className="w-full border-gray-300 rounded-md focus:ring-teal-500">
                                            <option value="ASCENDENTE">Ascendente</option>
                                            <option value="DESCENDENTE">Descendente</option>
                                        </select>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="relative">
                                            <input type="text" value={test.appliedPressure} onChange={(e) => handleChange(index, 'appliedPressure', e.target.value)} className="w-full border-gray-300 rounded-md pr-8" placeholder="0.00" />
                                            <span className="absolute right-2 top-2 text-xs text-gray-400">PSI</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="relative">
                                            <input type="text" value={test.realPressureChange} onChange={(e) => handleChange(index, 'realPressureChange', e.target.value)} className="w-full border-gray-300 rounded-md pr-8" placeholder="0.00" />
                                            <span className="absolute right-2 top-2 text-xs text-gray-400">PSI</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <select value={test.stateContact} onChange={(e) => handleChange(index, 'stateContact', e.target.value)} className="w-full border-gray-300 rounded-md">
                                            <option value="">Seleccionar...</option>
                                            <option value="ABIERTO">Abierto</option>
                                            <option value="CERRADO">Cerrado</option>
                                            <option value="NO_CAMBIO">Sin Cambio</option>
                                        </select>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <input type="checkbox" checked={test.meetsSpecification} onChange={(e) => handleChange(index, 'meetsSpecification', e.target.checked)} className="w-5 h-5 text-teal-600 border-gray-300 rounded focus:ring-teal-500" />
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <button onClick={() => handleDeleteRow(index)} className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded-full">
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
                    <div className="text-center py-12 px-4">
                        <p className="text-gray-500 mb-4">No hay pruebas registradas.</p>
                        <button onClick={handleAddRow} className="text-teal-600 font-bold hover:underline">Agregar la primera ahora</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PressureSwitchTable;