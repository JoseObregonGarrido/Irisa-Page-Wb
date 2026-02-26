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

    // --- ESTADOS PARA TRANSMISORES ---
    const [outputUnit, setOutputUnit] = useLocalStorage<'mA' | 'ohm'>('ir_output_unit', 'mA');
    const [hasUeTransmitter, setHasUeTransmitter] = useLocalStorage<boolean>('ir_has_ue', false);

    const [showChart, setShowChart] = useState(false);

    // --- Refs para captura de gráficos ---
    const transmitterChartRef = useRef<any>(null);
    const pressureSwitchChartRef = useRef<any>(null);
    const thermostatChartRef = useRef<any>(null);

    // --- Handlers ---
    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleGeneratePdf = async () => {
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
            outputUnit,
            hasUeTransmitter, 
        };

        try {
            let chartImages: string[] = [];

            if (deviceType === 'transmitter' && transmitterChartRef.current) {
                chartImages = await transmitterChartRef.current.captureAllCharts();
            } else if (deviceType === 'pressure_switch' && pressureSwitchChartRef.current) {
                chartImages = await pressureSwitchChartRef.current.captureAllCharts();
            } else if (deviceType === 'thermostat' && thermostatChartRef.current) {
                chartImages = await thermostatChartRef.current.captureAllCharts();
            }

            await generatePDFReport(reportData, chartImages);
            
        } catch (error) {
            console.error("Error al generar PDF:", error);
            alert("Hubo un error al generar las gráficas para el PDF.");
        }
    };

    const handleClearForm = () => {
        const confirmed = window.confirm('¿Está seguro de que desea limpiar todos los campos? Esta acción no se puede deshacer.');

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
            setOutputUnit('mA');
            setHasUeTransmitter(false);
            setShowChart(false);
        }
    };

    const getDeviceTypeLabel = (type: string) => {
        const labels: { [key: string]: string } = {
            'transmitter': 'Transmisor',
            'pressure_switch': 'Presostato',
            'thermostat': 'Termostato'
        };
        return labels[type] || "Dispositivo no seleccionado";
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
                                <p className="text-sm text-gray-600">Sistema de Gestión de Instrumentos</p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="flex items-center justify-center p-2 sm:px-4 sm:py-2 text-white bg-gradient-to-r from-red-500 to-red-600 rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                            title="Cerrar Sesión"
                        >
                            <svg className="w-5 h-5 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            <span className="hidden sm:block font-medium">Cerrar Sesión</span>
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
                        <p className="text-teal-100 mt-2">Complete la información del instrumento y las mediciones correspondientes</p>
                    </div>

                    <div className="p-8">
                        <form className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {/* Información Personal y de Trabajo */}
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700">Nombre del Instrumentista</label>
                                <input type="text" value={instrumentistName} onChange={(e) => setInstrumentistName(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none" placeholder="Ingrese el nombre completo" required />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700">Código de Instrumentista</label>
                                <input type="text" value={instrumentistCode} onChange={(e) => setInstrumentistCode(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none" placeholder="Ej: 8298" />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700">Tipo de Dispositivo</label>
                                <select value={deviceType} onChange={(e) => setDeviceType(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none">
                                    <option value="">Seleccione un dispositivo</option>
                                    <option value="transmitter">Transmisor</option>
                                    <option value="pressure_switch">Presostato</option>
                                    <option value="thermostat">Termostato</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700">Orden de Trabajo</label>
                                <input type="text" value={workOrder} onChange={(e) => setWorkOrder(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none" placeholder="Ej: OT-2024-001" />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700">Área del Instrumento</label>
                                <input type="text" value={instrumentArea} onChange={(e) => setInstrumentArea(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none" placeholder="Ej: Refinería, Destilería" />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700">Fecha de Revisión</label>
                                <input type="datetime-local" value={reviewDate} onChange={(e) => setReviewDate(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none" />
                            </div>

                            {/* Detalles del Equipo */}
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700">Nombre del equipo</label>
                                <input type="text" value={deviceName} onChange={(e) => setDeviceName(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none" placeholder="Ej: Medidor nivel..." />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700">Marca del Equipo</label>
                                <input type="text" value={deviceBrand} onChange={(e) => setDeviceBrand(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none" placeholder="Ej: Foxboro" />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700">Modelo del Equipo</label>
                                <input type="text" value={deviceModel} onChange={(e) => setDeviceModel(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none" placeholder="Ej: IMT25" />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700">Serial del Instrumento</label>
                                <input type="text" value={deviceSerial} onChange={(e) => setDeviceSerial(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none" placeholder="Ej: B11748" />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700">Rango del instrumento</label>
                                <input type="text" value={deviceRange} onChange={(e) => setDeviceRange(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none" placeholder="LRV: 10.5 URV: 99.5" />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700">Unidades</label>
                                <input type="text" value={unity} onChange={(e) => setUnity(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none" placeholder="Ej: PSI, mmH2O" />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700">Codigo del Equipo</label>
                                <input type="text" value={deviceCode} onChange={(e) => setDeviceCode(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none" placeholder="Ej: 3344542" />
                            </div>
                            <div className="space-y-2 md:col-span-2 lg:col-span-3">
                                <label className="block text-sm font-semibold text-gray-700">Observaciones</label>
                                <textarea value={observations} onChange={(e) => setObservations(e.target.value)} rows={4} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none resize-vertical" placeholder="Ingrese observaciones adicionales..." />
                            </div>
                        </form>

                        {deviceType && (
                            <div className="mt-8 p-4 bg-teal-50 border border-teal-200 rounded-lg">
                                <div className="flex items-center">
                                    <svg className="w-5 h-5 text-teal-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span className="text-sm font-medium text-teal-800">
                                        Configurando mediciones para: <strong>{getDeviceTypeLabel(deviceType)}</strong>
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Sección de Tablas Dinámicas */}
                        <div className="mt-8">
                            {deviceType === 'transmitter' && (
                                <TransmitterTable 
                                    measurements={transmitterMeasurements} 
                                    onMeasurementsChange={setTransmitterMeasurements}
                                    outputUnit={outputUnit}
                                    setOutputUnit={setOutputUnit}
                                    hasUeTransmitter={hasUeTransmitter}
                                    setHasUeTransmitter={setHasUeTransmitter}
                                />
                            )}
                            {deviceType === 'pressure_switch' && (
                                <PressureSwitchTable tests={pressureSwitchTests} onTestsChange={setPressureSwitchTests} />
                            )}
                            {deviceType === 'thermostat' && (
                                <ThermostatTable tests={thermostatTests} onTestsChange={setThermostatTests} />
                            )}
                        </div>

                        {/* Botonera de Acciones */}
                        <div className="mt-8 p-6 bg-gray-50 rounded-xl border border-gray-200">
                            <div className="flex flex-col sm:flex-row flex-wrap gap-4 justify-center items-center">
                                {/* EL BOTÓN SE MUESTRA SÓLO SI ES TRANSMISOR */}
                                {deviceType === 'transmitter' && (
                                    <button onClick={() => setShowChart(!showChart)} className="w-full sm:w-auto flex items-center justify-center px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-semibold rounded-lg shadow-md transition-all duration-200 transform hover:scale-105">
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                                        {showChart ? 'Ocultar Gráfico' : 'Ver Gráfico'}
                                    </button>
                                )}
                                <button onClick={handleGeneratePdf} className="w-full sm:w-auto flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-lg shadow-md transition-all duration-200 transform hover:scale-105">
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                    Generar PDF
                                </button>
                                <button onClick={handleClearForm} className="w-full sm:w-auto flex items-center justify-center px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-semibold rounded-lg shadow-md transition-all duration-200 transform hover:scale-105">
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    Limpiar Formulario
                                </button>
                            </div>
                        </div>

                        {/* Sección de Gráficos */}
                        <div className="mt-6">
                            {showChart && (
                                <div className="bg-white rounded-xl shadow-inner p-4 border border-gray-200">
                                    <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2 flex items-center">
                                        <span className="bg-teal-100 text-teal-700 p-1.5 rounded-lg mr-2">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" /></svg>
                                        </span>
                                        Análisis Gráfico: {getDeviceTypeLabel(deviceType)}
                                    </h3>
                                    {deviceType === 'transmitter' && <TransmitterChart ref={transmitterChartRef} data={transmitterMeasurements} />}
                                    {deviceType === 'pressure_switch' && <PressureSwitchChart ref={pressureSwitchChartRef} tests={pressureSwitchTests} />}
                                    {deviceType === 'thermostat' && <ThermostatChart ref={thermostatChartRef} tests={thermostatTests} />}
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