export const InputField = ({ label, value, onChange, unit, isError = false, readOnly = false }: any) => {
    const inputWidth = Math.max(value.toString().length, 6) + 5;
    return (
        <div className="flex flex-col min-w-fit group">
            <label className="block text-[9px] font-black text-gray-400 uppercase mb-1 tracking-wider whitespace-nowrap group-focus-within:text-teal-600 transition-colors">
                {label}
            </label>
            <div className="relative inline-flex items-center">
                <input
                    type="text" value={value} onChange={onChange} readOnly={readOnly}
                    style={{ width: `${inputWidth}ch` }} 
                    className={`px-3 py-2 pr-8 text-xs border rounded-lg focus:outline-none focus:ring-2 transition-all
                        ${isError ? 'border-red-200 bg-red-50 focus:ring-red-500 font-bold text-red-700' 
                                  : 'border-gray-300 bg-white focus:ring-teal-500 text-gray-700 hover:border-gray-400'} 
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