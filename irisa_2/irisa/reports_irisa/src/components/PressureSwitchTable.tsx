import React from 'react';

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

const TableInput = ({ value, onChange, label, unit = 'psi' }: any) => (
    <div className="w-full">
        <label className="block text-[10px] font-bold text-gray-500 mb-1 lg:hidden uppercase tracking-wider">
            {label}
        </label>
        <div className="relative">
            <input 
                type="text" 
                value={value} 
                onChange={onChange} 
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white pr-10 shadow-sm" 
                placeholder="0.00" 
            />
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 font-bold uppercase pointer-events-none">{unit}</span>
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
        <div className="mt-8 w-full">
            {/* CABECERA */}
            <div className="bg-gradient-to-r from-teal-600 to-emerald-600 rounded-t-xl px-4 sm:px-6 py-4 shadow-md">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/20 rounded-lg shrink-0">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">Pruebas de presostato</h3>
                            <p className="text-teal-100 text-xs mt-0.5">{tests.length} registro{tests.length !== 1 ? 's' : ''}</p>
                        </div>
                    </div>
                    <button 
                        onClick={handleAddRow} 
                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-white text-teal-700 hover:bg-teal-50 font-bold rounded-xl transition-all shadow-lg active:scale-95 text-sm"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                        </svg>
                        Nueva fila
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-b-xl shadow-xl border border-gray-200 overflow-hidden">

                {/* HEADERS DESKTOP (≥1024px) */}
                <div className="hidden lg:grid lg:grid-cols-[1fr_1fr_180px_80px] bg-gray-50 border-b border-gray-200 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-center">
                    <div className="px-4 py-4">Presión de disparo</div>
                    <div className="px-4 py-4">Presión de repone</div>
                    <div className="px-4 py-4">Estado del contacto</div>
                    <div className="px-4 py-4">Acción</div>
                </div>

                {/* FILAS */}
                <div className="divide-y divide-gray-100">
                    {tests.map((test, index) => (
                        <div key={index} className="hover:bg-teal-50/20 transition-colors">

                            {/* MÓVIL (< 768px): card apilada */}
                            <div className="lg:hidden p-4 space-y-3">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs font-black text-gray-400 uppercase tracking-wider">
                                        Registro #{index + 1}
                                    </span>
                                    <button 
                                        onClick={() => handleDeleteRow(index)} 
                                        className="flex items-center gap-1.5 text-red-400 hover:text-red-600 text-xs font-bold px-2 py-1 rounded-lg hover:bg-red-50 transition-all"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                        Eliminar
                                    </button>
                                </div>

                                {/* Inputs en grid 2 columnas desde 375px */}
                                <div className="grid grid-cols-1 min-[375px]:grid-cols-2 gap-3">
                                    <TableInput label="Presión de disparo" value={test.presiondeDisparo} onChange={(e:any) => handleChange(index, 'presiondeDisparo', e.target.value)} />
                                    <TableInput label="Presión de repone" value={test.presiondeRepone} onChange={(e:any) => handleChange(index, 'presiondeRepone', e.target.value)} />
                                </div>

                                {/* Contactos */}
                                <div className="flex items-center gap-6 bg-gray-50 rounded-lg px-4 py-3 border border-gray-100">
                                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Contacto:</span>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" checked={test.isNO} onChange={(e) => handleChange(index, 'isNO', e.target.checked)} className="w-4 h-4 text-teal-600 rounded border-gray-300 focus:ring-teal-500" />
                                        <span className="text-sm font-bold text-gray-700">N.O</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" checked={test.isNC} onChange={(e) => handleChange(index, 'isNC', e.target.checked)} className="w-4 h-4 text-teal-600 rounded border-gray-300 focus:ring-teal-500" />
                                        <span className="text-sm font-bold text-gray-700">N.C</span>
                                    </label>
                                </div>
                            </div>

                            {/* TABLET (768px - 1023px): 2 columnas */}
                            <div className="hidden md:flex lg:hidden items-center gap-4 px-6 py-4">
                                <div className="flex-1 grid grid-cols-2 gap-4">
                                    <TableInput label="Presión de disparo" value={test.presiondeDisparo} onChange={(e:any) => handleChange(index, 'presiondeDisparo', e.target.value)} />
                                    <TableInput label="Presión de repone" value={test.presiondeRepone} onChange={(e:any) => handleChange(index, 'presiondeRepone', e.target.value)} />
                                </div>
                                <div className="flex items-center gap-4 bg-gray-50 rounded-lg px-4 py-2.5 border border-gray-100 shrink-0">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" checked={test.isNO} onChange={(e) => handleChange(index, 'isNO', e.target.checked)} className="w-4 h-4 text-teal-600 rounded" />
                                        <span className="text-sm font-bold text-gray-700">N.O</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" checked={test.isNC} onChange={(e) => handleChange(index, 'isNC', e.target.checked)} className="w-4 h-4 text-teal-600 rounded" />
                                        <span className="text-sm font-bold text-gray-700">N.C</span>
                                    </label>
                                </div>
                                <button onClick={() => handleDeleteRow(index)} className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-full transition-all shrink-0">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </div>

                            {/* DESKTOP (≥1024px): fila en grid */}
                            <div className="hidden lg:grid lg:grid-cols-[1fr_1fr_180px_80px] lg:items-center">
                                <div className="px-4 py-3">
                                    <TableInput label="Disparo" value={test.presiondeDisparo} onChange={(e:any) => handleChange(index, 'presiondeDisparo', e.target.value)} />
                                </div>
                                <div className="px-4 py-3">
                                    <TableInput label="Repone" value={test.presiondeRepone} onChange={(e:any) => handleChange(index, 'presiondeRepone', e.target.value)} />
                                </div>
                                <div className="px-4 py-3 flex justify-center gap-6">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" checked={test.isNO} onChange={(e) => handleChange(index, 'isNO', e.target.checked)} className="w-4 h-4 text-teal-600 rounded border-gray-300 focus:ring-teal-500" />
                                        <span className="text-sm font-bold text-gray-700">N.O</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" checked={test.isNC} onChange={(e) => handleChange(index, 'isNC', e.target.checked)} className="w-4 h-4 text-teal-600 rounded border-gray-300 focus:ring-teal-500" />
                                        <span className="text-sm font-bold text-gray-700">N.C</span>
                                    </label>
                                </div>
                                <div className="flex justify-center">
                                    <button onClick={() => handleDeleteRow(index)} className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-full transition-all">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                        </div>
                    ))}
                </div>

                {/* EMPTY STATE */}
                {tests.length === 0 && (
                    <div className="text-center py-16 px-4 bg-gray-50/50">
                        <div className="mb-4 flex justify-center text-gray-300">
                            <svg className="w-14 h-14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <p className="text-gray-500 font-semibold text-base">No hay registros de presostato.</p>
                        <p className="text-gray-400 text-sm mt-1 mb-5">Inicia agregando una nueva medición.</p>
                        <button onClick={handleAddRow} className="text-teal-600 font-bold hover:text-teal-700 text-sm px-6 py-2 border-2 border-teal-600 rounded-lg hover:bg-teal-50 transition-all">
                            + Agregar primera prueba
                        </button>
                    </div>
                )}
            </div>

            <div className="mt-2 text-right">
                <p className="text-[10px] text-gray-400 font-medium">Registros totales: {tests.length}</p>
            </div>
        </div>
    );
};

export default PressureSwitchTable;