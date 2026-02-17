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

    return (
        <div className="mt-8">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-teal-600 to-emerald-600 rounded-t-xl px-4 py-4 md:px-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center">
                        <svg className="w-6 h-6 text-white mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-1v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-1c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-1" />
                        </svg>
                        <h3 className="text-xl font-bold text-white">Pruebas de Termostato</h3>
                    </div>
                    <button 
                        onClick={handleAddRow} 
                        className="w-full sm:w-auto flex items-center justify-center px-4 py-2 bg-black bg-opacity-20 hover:bg-opacity-30 text-white font-semibold rounded-lg transition-all duration-200 backdrop-blur-sm"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Agregar Prueba
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-b-xl shadow-lg border border-gray-200 overflow-hidden">
                {/* --- MOBILE VIEW (Cards) --- */}
                <div className="block md:hidden divide-y divide-gray-200">
                    {tests.map((test, index) => (
                        <div key={index} className="p-4 space-y-4 relative bg-white">
                            <div className="flex justify-between items-center border-b pb-2">
                                <span className="text-xs font-bold text-teal-600 uppercase">Prueba #{index + 1}</span>
                                <button 
                                    onClick={() => handleDeleteRow(index)}
                                    className="p-2 text-red-500 bg-red-50 rounded-full"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="text-xs font-semibold text-gray-500 uppercase">Tipo de Prueba</label>
                                    <select
                                        value={test.typeTest}
                                        onChange={(e) => handleChange(index, 'typeTest', e.target.value)}
                                        className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500"
                                    >
                                        <option value="ASCENDENTE">Ascendente</option>
                                        <option value="DESCENDENTE">Descendente</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="text-xs font-semibold text-gray-500 uppercase">Temp. Aplicada</label>
                                    <div className="relative mt-1">
                                        <input
                                            type="number"
                                            value={test.appliedTemperature}
                                            onChange={(e) => handleChange(index, 'appliedTemperature', e.target.value)}
                                            className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg text-sm"
                                            placeholder="0.0"
                                        />
                                        <span className="absolute right-2 top-2 text-xs text-gray-400">°C</span>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-semibold text-gray-500 uppercase">Cambio Real</label>
                                    <div className="relative mt-1">
                                        <input
                                            type="number"
                                            value={test.realTemperatureChange}
                                            onChange={(e) => handleChange(index, 'realTemperatureChange', e.target.value)}
                                            className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg text-sm"
                                            placeholder="0.0"
                                        />
                                        <span className="absolute right-2 top-2 text-xs text-gray-400">°C</span>
                                    </div>
                                </div>

                                <div className="col-span-2">
                                    <label className="text-xs font-semibold text-gray-500 uppercase">Estado Contacto</label>
                                    <select
                                        value={test.stateContact}
                                        onChange={(e) => handleChange(index, 'stateContact', e.target.value)}
                                        className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                    >
                                        <option value="">Seleccionar...</option>
                                        <option value="ABIERTO">Abierto</option>
                                        <option value="CERRADO">Cerrado</option>
                                        <option value="NO_CAMBIO">Sin Cambio</option>
                                    </select>
                                </div>

                                <div className="col-span-2 flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                                    <span className="text-sm font-medium text-gray-700">Cumple Especificación</span>
                                    <input
                                        type="checkbox"
                                        checked={test.meetsSpecification}
                                        onChange={(e) => handleChange(index, 'meetsSpecification', e.target.checked)}
                                        className="w-5 h-5 text-teal-600 rounded focus:ring-teal-500"
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* --- DESKTOP VIEW (Table) --- */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Tipo de Prueba</th>
                                <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Temp. Aplicada</th>
                                <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Cambio Real</th>
                                <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Estado</th>
                                <th className="px-4 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Cumple</th>
                                <th className="px-4 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Acción</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {tests.map((test, index) => (
                                <tr key={index} className="hover:bg-gray-50">
                                    <td className="px-4 py-4">
                                        <select
                                            value={test.typeTest}
                                            onChange={(e) => handleChange(index, 'typeTest', e.target.value)}
                                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-teal-500"
                                        >
                                            <option value="ASCENDENTE">Ascendente</option>
                                            <option value="DESCENDENTE">Descendente</option>
                                        </select>
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={test.appliedTemperature}
                                                onChange={(e) => handleChange(index, 'appliedTemperature', e.target.value)}
                                                className="w-full px-3 py-2 pr-8 text-sm border border-gray-300 rounded-lg"
                                            />
                                            <span className="absolute right-3 top-2 text-xs text-gray-500">°C</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={test.realTemperatureChange}
                                                onChange={(e) => handleChange(index, 'realTemperatureChange', e.target.value)}
                                                className="w-full px-3 py-2 pr-8 text-sm border border-gray-300 rounded-lg"
                                            />
                                            <span className="absolute right-3 top-2 text-xs text-gray-500">°C</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4">
                                        <select
                                            value={test.stateContact}
                                            onChange={(e) => handleChange(index, 'stateContact', e.target.value)}
                                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                                        >
                                            <option value="">Seleccionar...</option>
                                            <option value="ABIERTO">Abierto</option>
                                            <option value="CERRADO">Cerrado</option>
                                            <option value="NO_CAMBIO">Sin Cambio</option>
                                        </select>
                                    </td>
                                    <td className="px-4 py-4 text-center">
                                        <input
                                            type="checkbox"
                                            checked={test.meetsSpecification}
                                            onChange={(e) => handleChange(index, 'meetsSpecification', e.target.checked)}
                                            className="w-5 h-5 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                                        />
                                    </td>
                                    <td className="px-4 py-4 text-center">
                                        <button onClick={() => handleDeleteRow(index)} className="text-red-600 hover:text-red-800 p-2">
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
                        <p className="text-gray-500 italic">No hay registros. Presione "Agregar Prueba" para comenzar.</p>
                    </div>
                )}

                {/* Footer Summary - Responsive */}
                {tests.length > 0 && (
                    <div className="bg-gray-50 px-4 py-4 border-t border-gray-200">
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm font-medium">
                            <div className="flex gap-4">
                                <span className="text-green-600">Conformes: {tests.filter(t => t.meetsSpecification).length}</span>
                                <span className="text-red-600">No conformes: {tests.filter(t => !t.meetsSpecification).length}</span>
                            </div>
                            <div className="text-gray-600 bg-white px-3 py-1 rounded-full border border-gray-200">
                                Rango: {Math.min(...tests.map(t => parseFloat(t.appliedTemperature) || 0))}°C - {Math.max(...tests.map(t => parseFloat(t.appliedTemperature) || 0))}°C
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ThermostatTable;