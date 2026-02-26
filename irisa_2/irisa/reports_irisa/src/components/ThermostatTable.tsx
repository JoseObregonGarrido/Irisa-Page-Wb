import React from 'react';

export interface ThermostatTest {
    tempDisparo: string;
    tempRepone: string;
    isNO: boolean;
    isNC: boolean;
}

interface ThermostatTableProps {
    tests: ThermostatTest[];
    onTestsChange: (tests: ThermostatTest[]) => void;
}

const TableInput = ({ value, onChange, placeholder }: any) => (
    <div className="relative w-full">
        <input 
            type="text" 
            value={value} 
            onChange={onChange} 
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none" 
            placeholder={placeholder || "0.0"} 
        />
        <span className="absolute right-2 top-2 text-[10px] text-gray-400 font-bold">°C</span>
    </div>
);

const ThermostatTable: React.FC<ThermostatTableProps> = ({ tests, onTestsChange }) => {

    const handleAddRow = () => {
        onTestsChange([...tests, { tempDisparo: '', tempRepone: '', isNO: false, isNC: false }]);
    };

    const handleDeleteRow = (indexToDelete: number) => {
        const newTests = tests.filter((_, index) => index !== indexToDelete);
        onTestsChange(newTests);
    };

    const handleChange = (index: number, field: keyof ThermostatTest, value: any) => {
        const newTests = [...tests];
        newTests[index] = { ...newTests[index], [field]: value };
        onTestsChange(newTests);
    };

    return (
        <div className="mt-8">
            <div className="bg-gradient-to-r from-orange-600 to-amber-600 rounded-t-xl px-4 md:px-6 py-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center">
                        <svg className="w-6 h-6 text-white mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        <h3 className="text-xl font-bold text-white tracking-tight">Pruebas de termostato</h3>
                    </div>
                    <button 
                        onClick={handleAddRow} 
                        className="flex items-center justify-center px-4 py-2 bg-white text-orange-700 hover:bg-orange-50 font-bold rounded-lg transition-all shadow-md active:scale-95 text-sm"
                    >
                        Agregar fila
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-b-xl shadow-lg border border-gray-200 overflow-hidden">
                {/* MODO MOBILE */}
                <div className="block md:hidden divide-y divide-gray-200">
                    {tests.map((test, index) => (
                        <div key={index} className="p-4 space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-bold text-orange-600 tracking-wider">Prueba #{index + 1}</span>
                                <button onClick={() => handleDeleteRow(index)} className="text-red-500 p-1 hover:bg-red-50 rounded">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                </button>
                            </div>
                            
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">Temp. disparo (°C)</label>
                                    <TableInput value={test.tempDisparo} onChange={(e:any) => handleChange(index, 'tempDisparo', e.target.value)} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">Temp. repone (°C)</label>
                                    <TableInput value={test.tempRepone} onChange={(e:any) => handleChange(index, 'tempRepone', e.target.value)} />
                                </div>
                                <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                                    <label className="block text-xs font-bold text-gray-500 mb-2">Estado contacto</label>
                                    <div className="flex gap-4">
                                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 cursor-pointer">
                                            <input type="checkbox" checked={test.isNO} onChange={(e) => handleChange(index, 'isNO', e.target.checked)} className="w-5 h-5 text-orange-600 rounded focus:ring-orange-500" /> N.O
                                        </label>
                                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 cursor-pointer">
                                            <input type="checkbox" checked={test.isNC} onChange={(e) => handleChange(index, 'isNC', e.target.checked)} className="w-5 h-5 text-orange-600 rounded focus:ring-orange-500" /> N.C
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* MODO DESKTOP */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-4 py-4 text-left font-bold text-gray-600 tracking-wider">Temp. disparo</th>
                                <th className="px-4 py-4 text-left font-bold text-gray-600 tracking-wider">Temp. repone</th>
                                <th className="px-4 py-4 text-center font-bold text-gray-600 tracking-wider">Estado contacto</th>
                                <th className="px-4 py-4 text-center font-bold text-gray-600 tracking-wider">Acción</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {tests.map((test, index) => (
                                <tr key={index} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-3">
                                        <TableInput value={test.tempDisparo} onChange={(e:any) => handleChange(index, 'tempDisparo', e.target.value)} />
                                    </td>
                                    <td className="px-4 py-3">
                                        <TableInput value={test.tempRepone} onChange={(e:any) => handleChange(index, 'tempRepone', e.target.value)} />
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex justify-center gap-6">
                                            <label className="flex items-center gap-2 font-bold text-gray-600 cursor-pointer hover:text-orange-600 transition-colors">
                                                <input type="checkbox" checked={test.isNO} onChange={(e) => handleChange(index, 'isNO', e.target.checked)} className="w-5 h-5 text-orange-600 rounded focus:ring-orange-500" /> N.O
                                            </label>
                                            <label className="flex items-center gap-2 font-bold text-gray-600 cursor-pointer hover:text-orange-600 transition-colors">
                                                <input type="checkbox" checked={test.isNC} onChange={(e) => handleChange(index, 'isNC', e.target.checked)} className="w-5 h-5 text-orange-600 rounded focus:ring-orange-500" /> N.C
                                            </label>
                                        </div>
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

                {tests.length === 0 && (
                    <div className="text-center py-12 px-4 bg-gray-50/50">
                        <p className="text-gray-500 font-medium mb-4">No hay registros de termostato.</p>
                        <button onClick={handleAddRow} className="text-orange-600 font-bold hover:text-orange-700 text-sm tracking-wider">Agregar prueba</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ThermostatTable;