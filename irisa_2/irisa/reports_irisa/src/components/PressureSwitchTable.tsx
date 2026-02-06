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
        onTestsChange([...tests, { typeTest: 'RISING', appliedPressure: '', realPressureChange: '', stateContact: '', meetsSpecification: false }]);
    };

    const handleDeleteRow = (indexToDelete: number) => {
    const newTests = tests.filter((_, index) => index !== indexToDelete);
    onTestsChange(newTests);
};

    const handleChange = (index: number, field: keyof PressureSwitchTest, value: string | boolean) => {
        const newTests = [...tests];
        newTests[index] = { ...newTests[index], [field]: value };
        onTestsChange(newTests);
    };

    return (

    <div className="mt-8">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-teal-600 to-emerald-600 rounded-t-xl px-6 py-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <svg className="w-6 h-6 text-white mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                    </svg>
                    <h3 className="text-xl font-bold text-white">Pruebas de Presostato</h3>
                </div>
                <button 
                    onClick={handleAddRow} 
                    className="flex items-center px-4 py-2 bg-black bg-opacity-20 hover:bg-opacity-30 text-white font-semibold rounded-lg transition-all duration-200 backdrop-blur-sm"
                >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Agregar Fila
                </button>
            </div>
            <p className="text-teal-100 mt-2 text-sm">Configure las pruebas de presión ascendente y descendente para el presostato</p>
        </div>

        {/* Table Container */}
        <div className="bg-white rounded-b-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th scope="col" className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                <div className="flex items-center">
                                    <svg className="w-4 h-4 mr-2 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v6a2 2 0 002 2h2m0-8H5m4 0V5a2 2 0 012-2h2a2 2 0 012 2v8" />
                                    </svg>
                                    Tipo de Prueba
                                </div>
                            </th>
                            <th scope="col" className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                <div className="flex items-center">
                                    <svg className="w-4 h-4 mr-2 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                    </svg>
                                    Presión Aplicada
                                </div>
                            </th>
                            <th scope="col" className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                <div className="flex items-center">
                                    <svg className="w-4 h-4 mr-2 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4" />
                                    </svg>
                                    Cambio Real de Presión
                                </div>
                            </th>
                            <th scope="col" className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                <div className="flex items-center">
                                    <svg className="w-4 h-4 mr-2 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3" />
                                    </svg>
                                    Estado de Contacto
                                </div>
                            </th>
                            <th scope="col" className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                <div className="flex items-center">
                                    <svg className="w-4 h-4 mr-2 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Cumple Especificaciones
                                </div>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {tests.map((test, index) => (
                            <tr key={index} className="hover:bg-gray-50 transition-colors duration-150">
                                <td className="px-4 py-4 whitespace-nowrap">
                                    <select
                                        value={test.typeTest}
                                        onChange={(e) => handleChange(index, 'typeTest', e.target.value)}
                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white transition-colors"
                                    >
                                        <option value="ASCENDENTE">Ascendente</option>
                                        <option value="DESCENDENTE">Descendente</option>
                                    </select>
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap">
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={test.appliedPressure}
                                            onChange={(e) => handleChange(index, 'appliedPressure', e.target.value)}
                                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                                            placeholder="0.00"
                                        />
                                        <span className="absolute right-3 top-2 text-xs text-gray-500">PSI</span>
                                    </div>
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap">
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={test.realPressureChange}
                                            onChange={(e) => handleChange(index, 'realPressureChange', e.target.value)}
                                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                                            placeholder="0.00"
                                        />
                                        <span className="absolute right-3 top-2 text-xs text-gray-500">PSI</span>
                                    </div>
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap">
                                    <select
                                        value={test.stateContact}
                                        onChange={(e) => handleChange(index, 'stateContact', e.target.value)}
                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white transition-colors"
                                    >
                                        <option value="">Seleccionar estado</option>
                                        <option value="ABIERTO">Abierto</option>
                                        <option value="CERRADO">Cerrado</option>
                                        <option value="NO_CAMBIO">Sin Cambio</option>
                                    </select>
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap">
                                    <div className="flex items-center justify-center">
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={test.meetsSpecification}
                                                onChange={(e) => handleChange(index, 'meetsSpecification', e.target.checked)}
                                                className="sr-only peer"
                                            />
                                            <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                                            <span className="ml-3 text-sm font-medium text-gray-700">
                                                {test.meetsSpecification ? (
                                                    <span className="flex items-center text-green-600">
                                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                        Sí
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center text-red-600">
                                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                        No
                                                    </span>
                                                )}
                                            </span>
                                        </label>
                                    </div>
                                </td>
                                 <td className="px-3 py-3 whitespace-nowrap text-center">
                                    <button
                                        onClick={() => handleDeleteRow(index)}
                                        className="p-1 text-red-600 hover:text-red-800 hover:bg-red-100 rounded transition-colors duration-150"
                                        title="Eliminar medición"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Empty State */}
            {tests.length === 0 && (
                <div className="text-center py-12">
                    <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v6a2 2 0 002 2h2m0-8H5m4 0V5a2 2 0 012-2h2a2 2 0 012 2v8" />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-700 mb-2">No hay pruebas configuradas</h3>
                    <p className="text-gray-500 mb-4">Agregue una fila para comenzar a registrar las pruebas del presostato</p>
                    <button 
                        onClick={handleAddRow}
                        className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Agregar Primera Prueba
                    </button>
                </div>
            )}

            {/* Summary Section */}
            {tests.length > 0 && (
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center text-sm text-gray-600">
                            <svg className="w-4 h-4 mr-2 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            <span className="font-medium">Total de pruebas:</span>
                            <span className="ml-1 font-bold text-teal-600">{tests.length}</span>
                        </div>
                        <div className="flex items-center text-sm">
                            <span className="text-gray-600 mr-2">Conformes:</span>
                            <span className="flex items-center text-green-600 font-medium">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {tests.filter(test => test.meetsSpecification).length}
                            </span>
                            <span className="text-gray-400 mx-2">|</span>
                            <span className="text-gray-600 mr-2">No conformes:</span>
                            <span className="flex items-center text-red-600 font-medium">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {tests.filter(test => !test.meetsSpecification).length}
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    </div>
);
}

export default PressureSwitchTable;
