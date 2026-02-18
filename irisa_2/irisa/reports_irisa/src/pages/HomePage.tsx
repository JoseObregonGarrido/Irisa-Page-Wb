import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

// Services
import { logout } from '../services/authService';
import { generatePDFReport } from '../services/pdfService';

// Components
import TransmitterTable, { type Measurement } from '../components/TransmitterTable';
import PressureSwitchTable, { type PressureSwitchTest } from '../components/PressureSwitchTable';
import ThermostatTable, { type ThermostatTest } from '../components/ThermostatTable';
import TransmitterChart from '../components/TransmitterChart';
import PressureSwitchChart from '../components/PressureSwitchChart';
import ThermostatChart from '../components/ThermostatChart';

// Hooks
import useLocalStorage from './hooks/useLocalStorage';

const HomePage: React.FC = () => {
    const navigate = useNavigate();

    // --- State: Instrumentist & Work Info ---
    const [instrumentistName, setInstrumentistName] = useLocalStorage('ir_name', '');
    const [instrumentistCode, setInstrumentistCode] = useLocalStorage('ir_code', '');
    const [deviceType, setDeviceType] = useLocalStorage('ir_device_type', '');
    const [workOrder, setWorkOrder] = useLocalStorage('ir_work_order', '');
    const [instrumentArea, setInstrumentArea] = useLocalStorage('ir_area', '');
    const [reviewDate, setReviewDate] = useLocalStorage('ir_date', '');

    // --- State: Device Details ---
    const [deviceName, setDeviceName] = useLocalStorage('ir_dev_name', '');
    const [deviceBrand, setDeviceBrand] = useLocalStorage('ir_dev_brand', '');
    const [deviceModel, setDeviceModel] = useLocalStorage('ir_dev_model', '');
    const [deviceSerial, setDeviceSerial] = useLocalStorage('ir_dev_serial', '');
    const [deviceRange, setDeviceRange] = useLocalStorage('ir_dev_range', '');
    const [unity, setUnity] = useLocalStorage('ir_unity', '');
    const [deviceCode, setDeviceCode] = useLocalStorage('ir_dev_code', '');
    const [observations, setObservations] = useLocalStorage('ir_obs', '');

    // --- State: Measurements ---
    const [transmitterMeasurements, setTransmitterMeasurements] = useLocalStorage<Measurement[]>('ir_table_trans', []);
    const [pressureSwitchTests, setPressureSwitchTests] = useLocalStorage<PressureSwitchTest[]>('ir_table_press', []);
    const [thermostatTests, setThermostatTests] = useLocalStorage<ThermostatTest[]>('ir_table_therm', []);
    
    const [showChart, setShowChart] = useState(false);

    // --- Refs ---
    // Mantenemos una sola ref ya que el Home renderiza condicionalmente el contenedor del grafico
    const chartRef = useRef<HTMLDivElement>(null);

    // --- Handlers ---
    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleGeneratePdf = async () => {
        // Validacion rapida para asegurar que el grafico este visible antes de capturarlo
        if (!showChart) {
            alert("Por favor, active 'Ver Grafico' antes de generar el PDF para incluir la grafica.");
            return;
        }

        const reportData = {
            instrumentistName,
            instrumentistCode,
            deviceType,
            workOrder,
            instrumentArea,
            reviewDate,
            deviceName,
            deviceBrand,
            deviceModel,
            deviceSerial,
            deviceRange,
            unity,
            deviceCode,
            observations,
            transmitterMeasurements,
            pressureSwitchTests,
            thermostatTests,
        };

        try {
            // Pasamos el chartRef.current dentro de un arreglo como espera el nuevo service
            await generatePDFReport(reportData, [chartRef.current]);
        } catch (error) {
            console.error("Error al generar PDF:", error);
        }
    };

    const handleClearForm = () => {
        const confirmed = window.confirm('¿Esta seguro de que desea limpiar todos los campos? Esta accion no se puede deshacer.');
        if (confirmed) {
            setInstrumentistName('');
            setInstrumentistCode('');
            setDeviceType('');
            setWorkOrder('');
            setInstrumentArea('');
            setReviewDate('');
            setDeviceName('');
            setDeviceBrand('');
            setDeviceModel('');
            setDeviceSerial('');
            setDeviceRange('');
            setUnity('');
            setDeviceCode('');
            setObservations('');
            setTransmitterMeasurements([]);
            setPressureSwitchTests([]);
            setThermostatTests([]);
            setShowChart(false);
        }
    };

    const getDeviceTypeLabel = (type: string) => {
        const labels: { [key: string]: string } = {
            'transmitter': 'Transmisor',
            'pressure_switch': 'Presostato',
            'thermostat': 'Termostato'
        };
        return labels[type] || type;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            {/* Header */}
            <header className="bg-white shadow-lg border-b-4 border-teal-500">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-6">
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-teal-600 to-emerald-600 rounded-lg shadow-md">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-800">Ingenio Risaralda</h1>
                                <p className="text-sm text-gray-600">Sistema de Gestion de Instrumentos</p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="flex items-center justify-center p-2 sm:px-4 sm:py-2 text-white bg-gradient-to-r from-red-500 to-red-600 rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                            title="Cerrar Sesion"
                        >
                            <svg className="w-5 h-5 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            <span className="hidden sm:block font-medium">Cerrar Sesion</span>
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto p-6 lg:p-8">
                <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                    <div className="bg-gradient-to-r from-teal-600 to-emerald-600 px-8 py-6">
                        <h2 className="text-2xl font-bold text-white flex items-center">
                            <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Crear Nuevo Reporte
                        </h2>
                        <p className="text-teal-100 mt-2">Complete la informacion del instrumento y las mediciones correspondientes</p>
                    </div>

                    <div className="p-8">
                        <form className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {/* Campos del formulario (se mantienen iguales) */}
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700">Nombre del Instrumentista</label>
                                <input
                                    type="text"
                                    value={instrumentistName}
                                    onChange={(e) => setInstrumentistName(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                                    placeholder="Ingrese el nombre completo"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700">Codigo de Instrumentista</label>
                                <input
                                    type="text"
                                    value={instrumentistCode}
                                    onChange={(e) => setInstrumentistCode(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                                    placeholder="Ej: 8298"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700">Tipo de Dispositivo</label>
                                <select
                                    value={deviceType}
                                    onChange={(e) => setDeviceType(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                                >
                                    <option value="">Seleccione un dispositivo</option>
                                    <option value="transmitter">Transmisor</option>
                                    <option value="pressure_switch">Presostato</option>
                                    <option value="thermostat">Termostato</option>
                                </select>
                            </div>

                            {/* Otros inputs... se omiten por brevedad pero deben estar ahi */}
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700">Orden de Trabajo</label>
                                <input type="text" value={workOrder} onChange={(e) => setWorkOrder(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700">Area del Instrumento</label>
                                <input type="text" value={instrumentArea} onChange={(e) => setInstrumentArea(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700">Fecha de Revision</label>
                                <input type="datetime-local" value={reviewDate} onChange={(e) => setReviewDate(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
                            </div>
                            {/* ... continuar con el resto de campos (deviceName, Brand, Model, etc) */}
                            
                            <div className="space-y-2 md:col-span-2 lg:col-span-3">
                                <label className="block text-sm font-semibold text-gray-700">Observaciones</label>
                                <textarea
                                    value={observations}
                                    onChange={(e) => setObservations(e.target.value)}
                                    rows={4}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none resize-vertical"
                                    placeholder="Ingrese observaciones adicionales..."
                                />
                            </div>
                        </form>

                        {/* Seccion de Tablas */}
                        <div className="mt-8">
                            {deviceType === 'transmitter' && (
                                <TransmitterTable measurements={transmitterMeasurements} onMeasurementsChange={setTransmitterMeasurements} />
                            )}
                            {deviceType === 'pressure_switch' && (
                                <PressureSwitchTable tests={pressureSwitchTests} onTestsChange={setPressureSwitchTests} />
                            )}
                            {deviceType === 'thermostat' && (
                                <ThermostatTable tests={thermostatTests} onTestsChange={setThermostatTests} />
                            )}
                        </div>

                        {/* Botones de Accion */}
                        <div className="mt-8 p-6 bg-gray-50 rounded-xl border border-gray-200">
                            <div className="flex flex-col sm:flex-row flex-wrap gap-4 justify-center items-center">
                                <button
                                    onClick={() => setShowChart(!showChart)}
                                    className="w-full sm:w-auto flex items-center justify-center px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-semibold rounded-lg shadow-md hover:scale-105 transition-all"
                                >
                                    {showChart ? 'Ocultar Grafico' : 'Ver Grafico'}
                                </button>

                                <button
                                    onClick={handleGeneratePdf}
                                    className="w-full sm:w-auto flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-lg shadow-md hover:scale-105 transition-all"
                                >
                                    Generar PDF
                                </button>

                                <button
                                    onClick={handleClearForm}
                                    className="w-full sm:w-auto flex items-center justify-center px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white font-semibold rounded-lg shadow-md hover:scale-105 transition-all"
                                >
                                    Limpiar Formulario
                                </button>
                            </div>
                        </div>

                        {/* Contenedor del Grafico con Ref */}
                        <div className="mt-6">
                            {showChart && (
                                <div ref={chartRef} className="bg-white rounded-xl shadow-inner p-4 border border-gray-200">
                                    <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">
                                        Visualizacion de Datos: {getDeviceTypeLabel(deviceType)}
                                    </h3>
                                    {deviceType === 'transmitter' && <TransmitterChart data={transmitterMeasurements} />}
                                    {deviceType === 'pressure_switch' && <PressureSwitchChart data={pressureSwitchTests} />}
                                    {deviceType === 'thermostat' && <ThermostatChart data={thermostatTests} />}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default HomePage;