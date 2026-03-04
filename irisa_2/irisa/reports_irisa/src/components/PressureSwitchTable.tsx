import React from 'react';

// --- INTERFACES ---
export interface PressureSwitchTest {
    presiondeDisparo: string;
    presiondeRepone: string;
    isNO: boolean;
    isNC: boolean;
    setPoint?: string; 
}

interface PressureSwitchTableProps {
    tests: PressureSwitchTest[];
    onTestsChange: (tests: PressureSwitchTest[]) => void;
}

// --- COMPONENTE DE INPUT OPTIMIZADO ---
const TableInput = ({ value, onChange, label }: any) => (
    <div className="relative w-full">
        {/* Label solo visible en móvil para contexto */}
        <label className="block text-[10px] font-bold text-gray-500 mb-1 lg:hidden uppercase">
            {label}
        </label>
        <div className="relative">
            <input 
                type="text" 
                value={value} 
                onChange={onChange} 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white" 
                placeholder="0.00" 
            />
            <span className="absolute right-2 top-2.5 text-[10px] text-gray-400 font-bold uppercase">psi</span>
        </div>
    </div>
);

const PressureSwitchTable: React.FC<PressureSwitchTableProps> = ({ tests, onTestsChange }) => {

    const handleAddRow = () => {
        onTestsChange([...tests, { presiondeDisparo: '', presiondeRepone: '', isNO: false, isNC: false }]);
    };

    const handleDeleteRow = (indexToDelete: number) => {
        onTestsChange(tests.filter((_, index) => index !== indexToDelete));
    };

    const handleChange = (index: number, field: keyof PressureSwitchTest, value: any) => {
        const newTests = [...tests];
        newTests[index] = { ...newTests[index], [field]: value };
        onTestsChange(newTests);
    };

    return (
        <div className="mt-8 w-full max-w-[2560px] mx-auto">
            {/* CABECERA DINÁMICA */}
            <div className="bg-gradient-to-r from-teal-600 to-emerald-600 rounded-t-xl px-4 md:px-6 py-4 shadow-md">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center">
                        <div className="p-2 bg-white/20 rounded-lg mr-3">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                            </svg>
                        </div>
                        <h3 className="text-lg md:text-xl font-bold text-white tracking-tight">Pruebas de presostato</h3>
                    </div>
                    <button 
                        onClick={handleAddRow} 
                        className="w-full sm:w-auto flex items-center justify-center px-6 py-2.5 bg-white text-teal-700 hover:bg-teal-50 font-bold rounded-xl transition-all shadow-lg active:scale-95 text-sm"
                    >
                        + Agregar fila
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-b-xl shadow-xl border border-gray-200 overflow-hidden">
                {/* HEADERS: Solo visibles desde Laptop (1024px) en adelante para orden */}
                <div className="hidden lg:grid lg:grid-cols-[1fr_1fr_1fr_100px] bg-gray-50 border-b border-gray-200 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-center">
                    <div className="px-4 py-4">Presión de disparo</div>
                    <div className="px-4 py-4">Presión de repone</div>
                    <div className="px-4 py-4">Estado del contacto</div>
                    <div className="px-4 py-4">Acción</div>
                </div>

                {/* FILAS / CARDS */}
                <div className="divide-y divide-gray-100">
                    {tests.map((test, index) => (
                        <div 
                            key={index} 
                            className="p-4 lg:p-0 grid grid-cols-1 lg:grid-cols-[1fr_1fr_1fr_100px] lg:items-center gap-4 lg:gap-0 hover:bg-teal-50/30 transition-colors"
                        >
                            {/* Input 1 */}
                            <div className="lg:px-4 lg:py-3">
                                <TableInput 
                                    label="Disparo" 
                                    value={test.presiondeDisparo} 
                                    onChange={(e:any) => handleChange(index, 'presiondeDisparo', e.target.value)} 
                                />
                            </div>

                            {/* Input 2 */}
                            <div className="lg:px-4 lg:py-3">
                                <TableInput 
                                    label="Repone" 
                                    value={test.presiondeRepone} 
                                    onChange={(e:any) => handleChange(index, 'presiondeRepone', e.target.value)} 
                                />
                            </div>

                            {/* Checkboxes */}
                            <div className="flex flex-col lg:flex-row justify-center items-center gap-4 lg:gap-8 bg-gray-50 lg:bg-transparent p-3 lg:p-0 rounded-lg">
                                <span className="text-[10px] font-bold text-gray-500 lg:hidden uppercase">Estado del contacto</span>
                                <div className="flex gap-6">
                                    <label className="flex items-center gap-2 font-bold text-gray-700 cursor-pointer group">
                                        <input 
                                            type="checkbox" 
                                            checked={test.isNO} 
                                            onChange={(e) => handleChange(index, 'isNO', e.target.checked)} 
                                            className="w-5 h-5 text-teal-600 rounded border-gray-300 focus:ring-teal-500 transition-all" 
                                        /> 
                                        <span className="text-sm">N.O</span>
                                    </label>
                                    <label className="flex items-center gap-2 font-bold text-gray-700 cursor-pointer group">
                                        <input 
                                            type="checkbox" 
                                            checked={test.isNC} 
                                            onChange={(e) => handleChange(index, 'isNC', e.target.checked)} 
                                            className="w-5 h-5 text-teal-600 rounded border-gray-300 focus:ring-teal-500 transition-all" 
                                        /> 
                                        <span className="text-sm">N.C</span>
                                    </label>
                                </div>
                            </div>

                            {/* Botón Eliminar */}
                            <div className="flex justify-end lg:justify-center border-t lg:border-none pt-2 lg:pt-0">
                                <button 
                                    onClick={() => handleDeleteRow(index)} 
                                    className="flex items-center gap-2 lg:block text-red-500 hover:text-red-700 p-2 hover:bg-red-50 lg:rounded-full transition-all"
                                    title="Eliminar fila"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                    <span className="lg:hidden text-sm font-bold">Eliminar registro</span>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* EMPTY STATE */}
                {tests.length === 0 && (
                    <div className="text-center py-16 px-4 bg-gray-50/50">
                        <div className="mb-4 flex justify-center text-gray-300">
                            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <p className="text-gray-500 font-medium text-lg">No hay registros de presostato.</p>
                        <p className="text-gray-400 text-sm mb-6">Inicia agregando una nueva medición.</p>
                        <button onClick={handleAddRow} className="text-teal-600 font-bold hover:text-teal-700 text-sm px-6 py-2 border-2 border-teal-600 rounded-lg hover:bg-teal-50 transition-all">
                            + Agregar primera prueba
                        </button>
                    </div>
                )}
            </div>
            
            {/* FOOTER INFO (opcional para 4K/Screens grandes) */}
            <div className="mt-4 text-right">
                <p className="text-[10px] text-gray-400 font-medium">Registros totales: {tests.length}</p>
            </div>
        </div>
    );
};

export default PressureSwitchTable; 