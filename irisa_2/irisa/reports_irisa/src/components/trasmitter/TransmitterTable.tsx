import React, { useState, useRef, useEffect } from 'react';
import { TableMA } from './TableMA';
import { TableRTD } from './TableRTD';
import { TableMV } from './TableMV';

const TransmitterTable = ({ 
    measurements, 
    onMeasurementsChange, 
    outputUnit, 
    setOutputUnit, 
    hasUeTransmitter 
}: any) => {
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Cerrar dropdown al hacer click fuera
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const addNewRow = (rowType?: 'mv' | 'tx') => {
        onMeasurementsChange([...measurements, { 
            rowType: rowType ?? undefined,
            // Comunes
            idealUE: "", 
            idealmA: "", 
            patronUE: "", 
            ueTransmitter: "", 
            maTransmitter: "",
            percentage: "", 
            // RTD (Ohm)
            idealohm: "", 
            ohmTransmitter: "", 
            // TC (mV)
            idealMV: "",
            sensorMV: "",
            idealmV: "",
            sensormV: "",
            errormV: "",
            sensorType: "J",
            // TX 
            mATX: "",
            // Errores
            errorUE: "", 
            errormA: "", 
            errorPercentage: "", 
            errorOhm: "",
            errorMV: ""
        }]);
        setShowDropdown(false);
    };

    const handleNuevaFila = () => {
        if (outputUnit === 'mv') {
            setShowDropdown(!showDropdown);
        } else {
            addNewRow();
        }
    };

    return (
        <div className="mt-8 w-full bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            {/* Toolbar */}
            <div className="bg-gradient-to-r from-teal-600 to-emerald-600 px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-3">
                    <h3 className="text-lg font-bold text-white">Mediciones</h3>
                    <div className="flex bg-black/20 p-1 rounded-lg border border-white/10">
                        <button 
                            onClick={() => setOutputUnit('mA')} 
                            className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${outputUnit === 'mA' ? 'bg-white text-teal-700 shadow' : 'text-white hover:bg-white/10'}`}
                        >
                            mA
                        </button>
                        <button 
                            onClick={() => setOutputUnit('ohm')} 
                            className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${outputUnit === 'ohm' ? 'bg-white text-teal-700 shadow' : 'text-white hover:bg-white/10'}`}
                        >
                            RTD
                        </button>
                        <button 
                            onClick={() => setOutputUnit('mv')} 
                            className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${outputUnit === 'mv' ? 'bg-white text-teal-700 shadow' : 'text-white hover:bg-white/10'}`}
                        >
                            mV / TC
                        </button>
                        {/* TX eliminado — ahora vive dentro de mV */}
                    </div>
                </div>

                {/* Botón Nueva fila con dropdown en tab mV */}
                <div className="relative" ref={dropdownRef}>
                    <button 
                        onClick={handleNuevaFila}
                        className="px-4 py-2 bg-white text-teal-700 font-bold rounded-lg shadow-md hover:bg-teal-50 transition-transform active:scale-95 flex items-center gap-2"
                    >
                        Nueva fila
                        {outputUnit === 'mv' && (
                            <svg className={`w-3.5 h-3.5 transition-transform ${showDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                            </svg>
                        )}
                    </button>

                    {showDropdown && outputUnit === 'mv' && (
                        <div className="absolute right-0 mt-2 w-24 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
                            <button
                                onClick={() => addNewRow('mv')}
                                className="w-full flex items-center justify-center px-4 py-3 hover:bg-orange-50 transition-colors group"
                            >
                                <span className="text-sm font-black text-orange-700 group-hover:text-orange-900">mV</span>
                            </button>
                            <button
                                onClick={() => addNewRow('tx')}
                                className="w-full flex items-center justify-center px-4 py-3 hover:bg-blue-50 transition-colors group border-t border-gray-100"
                            >
                                <span className="text-sm font-black text-blue-700 group-hover:text-blue-900">TX</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Selector de Tabla Condicional */}
            <div className="w-full">
                {outputUnit === 'mA' && (
                    <TableMA 
                        measurements={measurements} 
                        onMeasurementsChange={onMeasurementsChange} 
                        hasUeTransmitter={hasUeTransmitter} 
                    />
                )}
                
                {outputUnit === 'ohm' && (
                    <TableRTD 
                        measurements={measurements} 
                        onMeasurementsChange={onMeasurementsChange} 
                        hasUeTransmitter={hasUeTransmitter} 
                    />
                )}

                {outputUnit === 'mv' && (
                    <TableMV 
                        measurements={measurements} 
                        onMeasurementsChange={onMeasurementsChange} 
                    />
                )}
            </div>
        </div>
    );
};

export default TransmitterTable;