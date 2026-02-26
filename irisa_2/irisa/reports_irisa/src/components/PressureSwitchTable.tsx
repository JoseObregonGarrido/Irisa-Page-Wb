import React from 'react';

// Interfaz limpia para Presostato
export interface PressureSwitchTest {
    presionDisparo: string;
    presionRepone: string;
    isNO: boolean;
    isNC: boolean;
    setPoint?: string; // Agregado para coincidir con el PDF si se usa
}

interface PressureSwitchTableProps {
    tests: PressureSwitchTest[];
    onTestsChange: (tests: PressureSwitchTest[]) => void;
}

// --- COMPONENTE DE INPUT ---
const TableInput = ({ value, onChange, placeholder }: any) => (
    <div className="relative w-full">
        <input 
            type="text" 
            value={value} 
            onChange={onChange} 
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none" 
            placeholder={placeholder || "0.00"} 
        />
        <span className="absolute right-2 top-2 text-[10px] text-gray-400 font-bold">PSI</span>
    </div>
);

// --- COMPONENTE PRINCIPAL ---
const PressureSwitchTable: React.FC<PressureSwitchTableProps> = ({ tests, onTestsChange }) => {

    const handleAddRow = () => {
        onTestsChange([...tests, { presionDisparo: '', presionRepone: '', isNO: false, isNC: false }]);
    };

    const handleDeleteRow = (indexToDelete: number) => {
        const newTests = tests.filter((_, index) => index !== indexToDelete);
        onTestsChange(newTests);
    };

    const handleChange = (index: number, field: keyof PressureSwitchTest, value: any) => {
        const newTests = [...tests];
        newTests[index] = { ...newTests[index], [field]: value };
        onTestsChange(newTests);
    };

    return (
        <div className="mt-8">
            <div className="bg-gradient-to-r from-teal-600 to-emerald-600 rounded-t-xl px-4 md:px-6 py-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center">
                        <svg className="w-6 h-6 text-white mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                        </svg>
                        <h3 className="text-xl font-bold text-white  tracking-tight">Pruebas de Presostato</h3>
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
                                <span className="text-xs font-bold text-teal-600  tracking-wider">Prueba #{index + 1}</span>
                                <button onClick={() => handleDeleteRow(index)} className="text-red-500 p-1 hover:bg-red-50 rounded">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                </button>
                            </div>
                            
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1 ">Presion disparada en valor de PSI</label>
                                    <TableInput value={test.presionDisparo} onChange={(e:any) => handleChange(index, 'presionDisparo', e.target.value)} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1 ">Presion repone en valor de PSI</label>
                                    <TableInput value={test.presionRepone} onChange={(e:any) => handleChange(index, 'presionRepone', e.target.value)} />
                                </div>
                                <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                                    <label className="block text-xs font-bold text-gray-500 mb-2 ">Estado contacto</label>
                                    <div className="flex gap-4">
                                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                            <input type="checkbox" checked={test.isNO} onChange={(e) => handleChange(index, 'isNO', e.target.checked)} className="w-5 h-5 text-teal-600 rounded" /> N.O
                                        </label>
                                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                            <input type="checkbox" checked={test.isNC} onChange={(e) => handleChange(index, 'isNC', e.target.checked)} className="w-5 h-5 text-teal-600 rounded" /> N.C
                                        </label>
                                    </div>
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
                                <th className="px-4 py-4 text-left font-bold text-gray-600  tracking-wider">Presion disparada en valor de PSI</th>
                                <th className="px-4 py-4 text-left font-bold text-gray-600  tracking-wider">Presion repone en valor de PSI</th>
                                <th className="px-4 py-4 text-center font-bold text-gray-600 uppercase tracking-wider">Estado contacto</th>
                                <th className="px-4 py-4 text-center font-bold text-gray-600 uppercase tracking-wider">Acción</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {tests.map((test, index) => (
                                <tr key={index} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-3">
                                        <TableInput value={test.presionDisparo} onChange={(e:any) => handleChange(index, 'presionDisparo', e.target.value)} />
                                    </td>
                                    <td className="px-4 py-3">
                                        <TableInput value={test.presionRepone} onChange={(e:any) => handleChange(index, 'presionRepone', e.target.value)} />
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex justify-center gap-6">
                                            <label className="flex items-center gap-2 font-bold text-gray-600">
                                                <input type="checkbox" checked={test.isNO} onChange={(e) => handleChange(index, 'isNO', e.target.checked)} className="w-5 h-5 text-teal-600 rounded focus:ring-teal-500" /> N.O
                                            </label>
                                            <label className="flex items-center gap-2 font-bold text-gray-600">
                                                <input type="checkbox" checked={test.isNC} onChange={(e) => handleChange(index, 'isNC', e.target.checked)} className="w-5 h-5 text-teal-600 rounded focus:ring-teal-500" /> N.C
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

                {/* Empty State */}
                {tests.length === 0 && (
                    <div className="text-center py-12 px-4 bg-gray-50/50">
                        <p className="text-gray-500 font-medium mb-4">No hay registros de presostato.</p>
                        <button onClick={handleAddRow} className="text-teal-600 font-bold hover:text-teal-700  text-sm tracking-wider">Agregar Prueba</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PressureSwitchTable;