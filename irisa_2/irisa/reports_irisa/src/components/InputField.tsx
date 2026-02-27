import React from 'react';

interface InputFieldProps {
    label: string;
    value: string | number | undefined;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    unit: string;
    isError?: boolean;
    readOnly?: boolean;
}

const InputField: React.FC<InputFieldProps> = ({ 
    label, 
    value, 
    onChange, 
    unit, 
    isError = false, 
    readOnly = false 
}) => (
    <div className="flex flex-col w-full">
        {/* Label visible solo en móvil (diseño original) */}
        <label className="block text-[10px] font-bold text-gray-500 mb-1 lg:hidden">
            {label}
        </label>
        
        <div className="relative w-full">
            <input
                type="text"
                value={value || ""}
                onChange={onChange}
                readOnly={readOnly}
                className={`w-full px-2 py-2 pr-7 text-xs border rounded-lg focus:outline-none focus:ring-2 
                    ${isError 
                        ? 'border-red-200 bg-red-50 focus:ring-red-500 font-bold text-red-700' 
                        : 'border-gray-300 bg-white focus:ring-teal-500 text-gray-700'
                    } ${readOnly ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                placeholder="0.00"
            />
            {/* Unidad (mA, Ω, mV, UE, %) */}
            <span className={`absolute right-1.5 top-2.5 text-[9px] font-bold ${isError ? 'text-red-400' : 'text-gray-400'}`}>
                {unit}
            </span>
        </div>
    </div>
);

export default InputField;