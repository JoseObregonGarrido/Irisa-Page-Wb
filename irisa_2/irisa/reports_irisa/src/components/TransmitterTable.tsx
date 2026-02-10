import React from 'react';

export interface Measurement {
    percentage: string;      // Porcentaje de rango (0-100%)
    idealUe: string;        // Valor ideal de entrada (UE)
    patronUe: string;       // Valor del patrón (UE)
    ueTransmitter: string;  // Valor medido de entrada (UE)
    idealMa: string;        // Valor ideal de salida (mA)
    maTransmitter: string;  // Valor medido de salida (mA)
    errorUe: string;        // Error de entrada (UE)
    errorMa: string;        // Error de salida (mA)
    errorPercentage: string; // Porcentaje de error
}

interface TransmitterTableProps {
    measurements: Measurement[];
    onMeasurementsChange: (measurements: Measurement[]) => void;
}

const TransmitterTable: React.FC<TransmitterTableProps> = ({ measurements, onMeasurementsChange }) => {
    const handleAddRow = () => {
        onMeasurementsChange([...measurements, { percentage: "", idealUe: "", patronUe: "", ueTransmitter: "", idealMa:"", maTransmitter: "", errorUe: "", errorMa: "", errorPercentage: "" }]);
    };

    const handleDeleteRow = (indexToDelete: number) => {
        const newMeasurements = measurements.filter((_, index) => index !== indexToDelete);
        onMeasurementsChange(newMeasurements);
    };  

    const calculateErrors = (measurement: Measurement) => {
        const patronUe = parseFloat(measurement.patronUe) || 0;
        const ueTransmitter = parseFloat(measurement.ueTransmitter) || 0;
        const idealMa = parseFloat(measurement.idealMa) || 0;
        const idealUe = parseFloat(measurement.idealUe) || 0;
        const maTransmitter = parseFloat(measurement.maTransmitter) || 0;
        
        const errorUe = ueTransmitter - patronUe; 
        const errorMa = idealMa - maTransmitter;    
        const errorPercentage = (errorMa / 16) * 100; 
        
        return {
            ...measurement,
            errorUe: errorUe.toFixed(3),
            errorMa: errorMa.toFixed(3),
            errorPercentage: errorPercentage.toFixed(2)
        };
    };

    const handleChange = (index: number, field: keyof Measurement, value: string) => {
        const newMeasurements = [...measurements];
        newMeasurements[index] = { ...newMeasurements[index], [field]: value };
        
        const relevantFields: (keyof Measurement)[] = ["patronUe", "ueTransmitter", "idealMa", "maTransmitter", "idealUe"];
        if (relevantFields.includes(field)) {
            newMeasurements[index] = calculateErrors(newMeasurements[index]);
        }
        
        onMeasurementsChange(newMeasurements);
    };

    return (
        <div className="mt-8">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-teal-600 to-emerald-600 rounded-t-xl px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <svg className="w-6 h-6 text-white mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <h3 className="text-xl font-bold text-white">Mediciones del Transmisor</h3>
                    </div>
                    <button 
                        onClick={handleAddRow} 
                        className="flex items-center px-4 py-2 bg-black bg-opacity-20 hover:bg-opacity-30 text-white font-semibold rounded-lg transition-all duration-200 backdrop-blur-sm"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Añadir Medición
                    </button>
                </div>
                <p className="text-teal-100 mt-2 text-sm">Registre las mediciones de calibración y los valores de error del transmisor</p>
            </div>

            {/* Table Container */}
            <div className="bg-white rounded-b-xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th scope="col" className="px-3 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                    <div className="flex items-center">
                                        <svg className="w-4 h-4 mr-1 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                        </svg>
                                        <span className="hidden lg:inline">Ideal UE</span>
                                        <span className="lg:hidden">I.UE</span>
                                    </div>
                                </th>
                                <th scope="col" className="px-3 py-4 text-left text-xs font-bold text-gray-700 tracking-wider">
                                    <div className="flex items-center">
                                        <svg className="w-4 h-4 mr-1 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4" />
                                        </svg>
                                        <span className="hidden lg:inline">IDEAL mA</span>
                                        <span className="lg:hidden">I.mA</span>
                                    </div>
                                </th>
                                <th scope="col" className="px-3 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                    <div className="flex items-center">
                                        <svg className="w-4 h-4 mr-1 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span className="hidden lg:inline">Patrón UE</span>
                                        <span className="lg:hidden">P.UE</span>
                                    </div>
                                </th>
                                <th scope="col" className="px-3 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                    <div className="flex items-center">
                                        <svg className="w-4 h-4 mr-1 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                        <span className="hidden lg:inline">UE Transmisor</span>
                                        <span className="lg:hidden">UE.T</span>
                                    </div>
                                </th>
                                <th scope="col" className="px-3 py-4 text-left text-xs font-bold text-gray-700 tracking-wider">
                                    <div className="flex items-center">
                                        <svg className="w-4 h-4 mr-1 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                        <span className="hidden lg:inline">mA TRANSMISOR</span>
                                        <span className="lg:hidden">mA.T</span>
                                    </div>
                                </th>
                                <th scope="col" className="px-3 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                    <div className="flex items-center">
                                        <svg className="w-4 h-4 mr-1 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                        </svg>
                                        <span className="hidden sm:inline">Porcentaje</span>
                                        <span className="sm:hidden">%</span>
                                    </div>
                                </th>
                                <th scope="col" className="px-3 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider bg-red-50">
                                    <div className="flex items-center">
                                        <svg className="w-4 h-4 mr-1 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span className="hidden lg:inline">Error UE</span>
                                        <span className="lg:hidden">E.UE</span>
                                    </div>
                                </th>
                                <th scope="col" className="px-3 py-4 text-left text-xs font-bold text-gray-700 tracking-wider bg-red-50">
                                    <div className="flex items-center">
                                        <svg className="w-4 h-4 mr-1 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span className="hidden lg:inline">ERROR mA</span>
                                        <span className="lg:hidden">E.mA</span>
                                    </div>
                                </th>
                                <th scope="col" className="px-3 py-4 text-left text-xs font-bold text-gray-700 tracking-wider bg-red-50">
                                    <div className="flex items-center">
                                        <svg className="w-4 h-4 mr-1 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span className="hidden lg:inline">ERROR %</span>
                                        <span className="lg:hidden">E.%</span>
                                    </div>
                                </th>
                                <th scope="col" className="px-3 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {measurements.map((measurement, index) => (
                                <tr key={index} className="hover:bg-gray-50 transition-colors duration-150">
                                    {/* 
                                         Se elimino el mapeo dinamico con Object.keys() 
                                        que causaba desorden en las columnas. Ahora cada columna está 
                                        explicitamente definida con su campo correspondiente para garantizar 
                                        el orden correcto: idealUe → idealMa → patronUe → ueTransmitter → 
                                        maTransmitter → percentage → errorUe → errorMa → errorPercentage
                                    */}
                                    
                                    {/* Columna 1: Ideal UE - Valor ideal de unidades de entrada */}
                                    <td className="px-3 py-3 whitespace-nowrap">
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={measurement.idealUe}
                                                onChange={(e) => handleChange(index, 'idealUe', e.target.value)}
                                                className="w-full px-2 py-2 pr-8 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white"
                                                placeholder="0.00"
                                            />
                                            <span className="absolute right-2 top-2 text-xs text-gray-500">UE</span>
                                        </div>
                                    </td>

                                    {/* Columna 2: Ideal mA - Valor ideal de miliamperios */}
                                    <td className="px-3 py-3 whitespace-nowrap">
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={measurement.idealMa}
                                                onChange={(e) => handleChange(index, 'idealMa', e.target.value)}
                                                className="w-full px-2 py-2 pr-8 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white"
                                                placeholder="0.00"
                                            />
                                            <span className="absolute right-2 top-2 text-xs text-gray-500">mA</span>
                                        </div>
                                    </td>

                                    {/* Columna 3: Patrón UE - Valor del patrón de referencia */}
                                    <td className="px-3 py-3 whitespace-nowrap">
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={measurement.patronUe}
                                                onChange={(e) => handleChange(index, 'patronUe', e.target.value)}
                                                className="w-full px-2 py-2 pr-8 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white"
                                                placeholder="0.00"
                                            />
                                            <span className="absolute right-2 top-2 text-xs text-gray-500">UE</span>
                                        </div>
                                    </td>

                                    {/* Columna 4: UE Transmisor - Valor medido del transmisor en UE */}
                                    <td className="px-3 py-3 whitespace-nowrap">
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={measurement.ueTransmitter}
                                                onChange={(e) => handleChange(index, 'ueTransmitter', e.target.value)}
                                                className="w-full px-2 py-2 pr-8 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white"
                                                placeholder="0.00"
                                            />
                                            <span className="absolute right-2 top-2 text-xs text-gray-500">UE</span>
                                        </div>
                                    </td>

                                    {/* Columna 5: mA Transmisor - Valor medido del transmisor en mA */}
                                    <td className="px-3 py-3 whitespace-nowrap">
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={measurement.maTransmitter}
                                                onChange={(e) => handleChange(index, 'maTransmitter', e.target.value)}
                                                className="w-full px-2 py-2 pr-8 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white"
                                                placeholder="0.00"
                                            />
                                            <span className="absolute right-2 top-2 text-xs text-gray-500">mA</span>
                                        </div>
                                    </td>

                                    {/* Columna 6: Porcentaje - Porcentaje del rango de calibración */}
                                    <td className="px-3 py-3 whitespace-nowrap">
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={measurement.percentage}
                                                onChange={(e) => handleChange(index, 'percentage', e.target.value)}
                                                className="w-full px-2 py-2 pr-8 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white"
                                                placeholder="0.00"
                                            />
                                            <span className="absolute right-2 top-2 text-xs text-gray-500">%</span>
                                        </div>
                                    </td>

                                    {/* Columna 7: Error UE - Campo calculado automáticamente (readonly) */}
                                    <td className="px-3 py-3 whitespace-nowrap bg-red-50">
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={measurement.errorUe}
                                                className="w-full px-2 py-2 pr-8 text-sm border border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-red-50"
                                                placeholder="0.00"
                                                readOnly
                                            />
                                            <span className="absolute right-2 top-2 text-xs text-red-500">UE</span>
                                        </div>
                                    </td>

                                    {/* Columna 8: Error mA - Campo calculado automáticamente (readonly) */}
                                    <td className="px-3 py-3 whitespace-nowrap bg-red-50">
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={measurement.errorMa}
                                                className="w-full px-2 py-2 pr-8 text-sm border border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-red-50"
                                                placeholder="0.00"
                                                readOnly
                                            />
                                            <span className="absolute right-2 top-2 text-xs text-red-500">mA</span>
                                        </div>
                                    </td>

                                    {/* Columna 9: Error Porcentaje - Campo calculado automáticamente (readonly) */}
                                    <td className="px-3 py-3 whitespace-nowrap bg-red-50">
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={measurement.errorPercentage}
                                                className="w-full px-2 py-2 pr-8 text-sm border border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-red-50"
                                                placeholder="0.00"
                                                readOnly
                                            />
                                            <span className="absolute right-2 top-2 text-xs text-red-500">%</span>
                                        </div>
                                    </td>

                                    {/* Columna 10: Botón de eliminar fila */}
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
                {measurements.length === 0 && (
                    <div className="text-center py-12">
                        <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <h3 className="text-lg font-medium text-gray-700 mb-2">No hay mediciones registradas</h3>
                        <p className="text-gray-500 mb-4">Agregue una fila para comenzar a registrar las mediciones del transmisor</p>
                        <button 
                            onClick={handleAddRow}
                            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Agregar Primera Medición
                        </button>
                    </div>
                )}

                {/* Summary Section */}
                {measurements.length > 0 && (
                    <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="flex items-center text-sm text-gray-600">
                                <svg className="w-4 h-4 mr-2 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                                <span className="font-medium">Total de puntos:</span>
                                <span className="ml-1 font-bold text-teal-600">{measurements.length}</span>
                            </div>
                            {/* 
                                Cambio en el calculo del Rango UE
                                Antes usaba: Math.min/max(...measurements.map(m => parseFloat(m.idealUe)))
                                Ahora usa correctamente: measurement.idealUe para el rango UE
                            */}
                            <div className="flex items-center text-sm">
                                <span className="text-gray-600 mr-2">Rango UE:</span>
                                <span className="text-blue-600 font-medium">
                                    {measurements.length > 0 
                                        ? `${Math.min(...measurements.map(m => parseFloat(m.idealUe) || 0)).toFixed(2)} - ${Math.max(...measurements.map(m => parseFloat(m.idealUe) || 0)).toFixed(2)} UE` 
                                        : 'N/A'}
                                </span>
                            </div>
                            {/* 
                                Cambio en el calculo del Rango mA
                                Antes usaba: Math.min/max(...measurements.map(m => parseFloat(m.maTransmitter)))
                                Ahora usa correctamente: measurement.idealMa para el rango mA
                            */}
                            <div className="flex items-center text-sm">
                                <span className="text-gray-600 mr-2">Rango mA:</span>
                                <span className="text-red-600 font-medium">
                                    {measurements.length > 0 
                                        ? `${Math.min(...measurements.map(m => parseFloat(m.idealMa) || 0)).toFixed(2)} - ${Math.max(...measurements.map(m => parseFloat(m.idealMa) || 0)).toFixed(2)} mA` 
                                        : 'N/A'}
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Calibration Status */}
                {measurements.length > 0 && (
                    <div className="bg-gradient-to-r from-blue-50 to-green-50 px-6 py-3 border-t border-gray-200">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center text-sm">
                                <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                                <span className="text-blue-700 font-medium">Señal de Entrada (UE)</span>
                            </div>
                            <div className="flex items-center text-sm">
                                <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                                <span className="text-red-700 font-medium">Señal de Salida (mA)</span>
                            </div>
                            <div className="flex items-center text-sm">
                                <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                                <span className="text-yellow-700 font-medium">Análisis de Errores</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default TransmitterTable;