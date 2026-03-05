export const InputField = ({ label, value, onChange, unit, isError = false, readOnly = false }: any) => {
    // Forzamos a que siempre sea un string para evitar errores de .length o .toString()
    const safeValue = String(value ?? ""); 
    const inputWidth = Math.max(safeValue.length, 6) + 4;

    return (
        <div className="flex flex-col min-w-fit group">
            <label className="block text-[9px] font-black text-gray-400 uppercase mb-1 tracking-wider whitespace-nowrap">
                {label}
            </label>
            <div className="relative inline-flex items-center">
                <input
                    type="text" 
                    value={safeValue} 
                    onChange={onChange} 
                    readOnly={readOnly}
                    style={{ width: `${inputWidth}ch` }} 
                    className={`px-3 py-2 pr-8 text-xs border rounded-lg focus:outline-none transition-all
                        ${isError ? 'border-red-200 bg-red-50 text-red-700 font-bold' 
                                  : 'border-gray-300 bg-white text-gray-700'} 
                        ${readOnly ? 'bg-gray-50 opacity-80 cursor-not-allowed' : 'shadow-sm'}`}
                    placeholder="0.00"
                />
                <span className={`absolute right-2 text-[9px] font-bold pointer-events-none ${isError ? 'text-red-400' : 'text-gray-400'}`}>
                    {unit}
                </span>
            </div>
        </div>
    );
};