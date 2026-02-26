import React from 'react';

// Interfaz actualizada según tu dibujo
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

// --- COMPONENTES ATÓMICOS ---

const TableInput = ({ value, onChange, unit }: any) => (
    <div className="relative w-full">
        <input 
            type="number" 
            step="0.1"
            value={value} 
            onChange={onChange} 
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none" 
            placeholder="0.0" 
        />
        {unit && <span className="absolute right-2 top-2 text-[10px] text-gray-400 font-bold">{unit}</span>}
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
            {/* Header con estilo similar al dibujo */}
            <div className="bg-gradient-to-r from-slate-700 to-slate-800 rounded-t-xl px-4 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="bg-orange-500 p-1.5 rounded-lg text-white">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                        </div>
                        <h3 className="text-lg font-bold text-white uppercase tracking-wider">Pruebas de Termostato</h3>
                    </div>
                    <button 
                        onClick={handleAddRow} 
                        className="px-4 py-2 bg-orange-500 text-white hover:bg-orange-600 font-bold rounded-lg transition-all shadow-md text-xs uppercase"
                    >
                        + Agregar Fila
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-b-xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-4 py-4 text-left text-[11px] font-black text-gray-500 uppercase tracking-wider">Temp. Disparo</th>
                                <th className="px-4 py-4 text-left text-[11px] font-black text-gray-500 uppercase tracking-wider">Temp. Repone</th>
                                <th className="px-4 py-4 text-center text-[11px] font-black text-gray-500 uppercase tracking-wider">Estado N.O</th>
                                <th className="px-4 py-4 text-center text-[11px] font-black text-gray-500 uppercase tracking-wider">Estado N.C</th>
                                <th className="px-4 py-4 text-center text-[11px] font-black text-gray-500 uppercase tracking-wider">Acción</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {tests.map((test, index) => (
                                <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                                    {/* Temperatura Disparo */}
                                    <td className="px-4 py-3">
                                        <TableInput 
                                            value={test.tempDisparo} 
                                            onChange={(e: any) => handleChange(index, 'tempDisparo', e.target.value)} 
                                            unit="°C" 
                                        />
                                    </td>
                                    {/* Temperatura Repone */}
                                    <td className="px-4 py-3">
                                        <TableInput 
                                            value={test.tempRepone} 
                                            onChange={(e: any) => handleChange(index, 'tempRepone', e.target.value)} 
                                            unit="°C" 
                                        />
                                    </td>
                                    {/* Checkbox N.O */}
                                    <td className="px-4 py-3 text-center">
                                        <label className="inline-flex items-center cursor-pointer group">
                                            <input 
                                                type="checkbox" 
                                                checked={test.isNO} 
                                                onChange={(e) => handleChange(index, 'isNO', e.target.checked)}
                                                className="hidden"
                                            />
                                            <div className={`w-10 h-10 flex items-center justify-center rounded-xl border-2 transition-all ${test.isNO ? 'bg-blue-500 border-blue-600 text-white shadow-inner' : 'bg-white border-gray-200 text-gray-300 hover:border-blue-200'}`}>
                                                <span className="text-[10px] font-black">N.O</span>
                                            </div>
                                        </label>
                                    </td>
                                    {/* Checkbox N.C */}
                                    <td className="px-4 py-3 text-center">
                                        <label className="inline-flex items-center cursor-pointer group">
                                            <input 
                                                type="checkbox" 
                                                checked={test.isNC} 
                                                onChange={(e) => handleChange(index, 'isNC', e.target.checked)}
                                                className="hidden"
                                            />
                                            <div className={`w-10 h-10 flex items-center justify-center rounded-xl border-2 transition-all ${test.isNC ? 'bg-purple-500 border-purple-600 text-white shadow-inner' : 'bg-white border-gray-200 text-gray-300 hover:border-purple-200'}`}>
                                                <span className="text-[10px] font-black">N.C</span>
                                            </div>
                                        </label>
                                    </td>
                                    {/* Botón Eliminar */}
                                    <td className="px-4 py-3 text-center">
                                        <button 
                                            onClick={() => handleDeleteRow(index)} 
                                            className="text-gray-400 hover:text-red-500 transition-colors p-2"
                                            title="Eliminar Prueba"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {tests.length === 0 && (
                    <div className="py-10 text-center bg-gray-50/30">
                        <p className="text-gray-400 text-sm italic">Sin datos de temperatura. Agregue una fila para registrar.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ThermostatTable;