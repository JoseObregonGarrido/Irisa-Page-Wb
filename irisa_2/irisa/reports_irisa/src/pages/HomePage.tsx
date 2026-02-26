import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

// Services
import { logout } from '../services/authService';
import { generatePDFReport } from '../services/pdfService';
// IMPORTANTE: Importamos el tipo desde el servicio ahora
import { PressureSwitchTest } from '../services/pressureSwitchTest';

// Components
import TransmitterTable, { type Measurement } from '../components/TransmitterTable';
import PressureSwitchTable from '../components/PressureSwitchTable'; // Quitamos el type import de aquí
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
    // Aquí usamos el tipo que viene del servicio
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
        if (!showChart) {
            alert("Por favor, active 'Ver Gráfico' antes de generar el PDF para incluir las imágenes.");
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
        const confirmed = window.confirm('¿Está seguro de que desea limpiar todos los campos?');
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
                                <p className="text-sm text-gray-600 uppercase tracking-wider">Gestión de Instrumentación</p>
                            </div>
                        </div>
                        <button onClick={handleLogout} className="flex items-center p-2 sm:px-4 sm:py-2 text-white bg-gradient-to-r from-red-500 to-red-600 rounded-lg hover:from-red-600 hover:to-red-700 transition-all shadow-md transform hover:scale-105">
                            <svg className="w-5 h-5 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                            <span className="hidden sm:block font-medium">Cerrar Sesión</span>
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto p-6 lg:p-8">
                <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                    <div className="bg-gradient-to-r from-teal-600 to-emerald-600 px-8 py-6 text-white">
                        <h2 className="text-2xl font-bold flex items-center">
                            <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                            Generación de Reporte Técnico
                        </h2>
                    </div>

                    <div className="p-8">
                        <form className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {/* Inputs del formulario (se mantienen igual que tu original) */}
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700">Nombre del Instrumentista</label>
                                <input type="text" value={instrumentistName} onChange={(e) => setInstrumentistName(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none" placeholder="Nombre completo" />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700">Código</label>
                                <input type="text" value={instrumentistCode} onChange={(e) => setInstrumentistCode(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none" placeholder="Ej: 8298" />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700">Tipo de Dispositivo</label>
                                <select value={deviceType} onChange={(e) => setDeviceType(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none">
                                    <option value="">Seleccione...</option>
                                    <option value="transmitter">Transmisor</option>
                                    <option value="pressure_switch">Presostato</option>
                                    <option value="thermostat">Termostato</option>
                                </select>
                            </div>
                            {/* ... Resto de los campos (Marca, Modelo, Serial, etc.) ... */}
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700">Marca del Equipo</label>
                                <input type="text" value={deviceBrand} onChange={(e) => setDeviceBrand(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none" placeholder="Ej: Foxboro" />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700">Modelo del Equipo</label>
                                <input type="text" value={deviceModel} onChange={(e) => setDeviceModel(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none" placeholder="Ej: IMT25" />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700">Serial</label>
                                <input type="text" value={deviceSerial} onChange={(e) => setDeviceSerial(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none" placeholder="Serial" />
                            </div>
                            <div className="space-y-2 md:col-span-2 lg:col-span-3">
                                <label className="block text-sm font-semibold text-gray-700">Observaciones Técnicas</label>
                                <textarea value={observations} onChange={(e) => setObservations(e.target.value)} rows={3} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none" />
                            </div>
                        </form>

                        {/* Sección de Tablas Dinámicas */}
                        <div className="mt-10">
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
                                <PressureSwitchTable 
                                    tests={pressureSwitchTests} 
                                    onTestsChange={setPressureSwitchTests} 
                                />
                            )}
                            {deviceType === 'thermostat' && (
                                <ThermostatTable 
                                    tests={thermostatTests} 
                                    onTestsChange={setThermostatTests} 
                                />
                            )}
                        </div>

                        {/* Botones de Acción */}
                        <div className="mt-8 flex flex-wrap gap-4 justify-center bg-gray-50 p-6 rounded-xl border">
                            <button onClick={() => setShowChart(!showChart)} className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-lg shadow transition-all transform hover:scale-105">
                                {showChart ? 'Ocultar Análisis' : 'Ver Análisis Gráfico'}
                            </button>
                            <button onClick={handleGeneratePdf} className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg shadow transition-all transform hover:scale-105">
                                Generar Documento PDF
                            </button>
                            <button onClick={handleClearForm} className="px-6 py-3 bg-gray-400 hover:bg-gray-500 text-white font-bold rounded-lg shadow transition-all">
                                Limpiar Todo
                            </button>
                        </div>

                        {/* Render de Gráficos */}
                        <div className="mt-6">
                            {showChart && (
                                <div className="bg-white rounded-xl shadow-inner p-4 border border-gray-200">
                                    {deviceType === 'transmitter' && <TransmitterChart ref={transmitterChartRef} data={transmitterMeasurements} outputUnit={outputUnit} />}
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