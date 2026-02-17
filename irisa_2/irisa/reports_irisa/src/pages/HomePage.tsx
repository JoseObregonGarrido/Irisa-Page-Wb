import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

// Services
import { logout } from '../services/authService';
import { generatePDFReport } from '../services/pdfService';

// Hooks
import useLocalStorage from './hooks/useLocalStorage';

// Components
import TransmitterTable, { type Measurement } from '../components/TransmitterTable';
import PressureSwitchTable, { type PressureSwitchTest } from '../components/PressureSwitchTable';
import ThermostatTable, { type ThermostatTest } from '../components/ThermostatTable';
import TransmitterChart from '../components/TransmitterChart';
import PressureSwitchChart from '../components/PressureSwitchChart';
import ThermostatChart from '../components/ThermostatChart';

const HomePage: React.FC = () => {
    const navigate = useNavigate();

    // --- State Persistente con LocalStorage ---
    // Usamos prefijos como 'ir_' (Ingenio Risaralda) para no colisionar con otros sitios
    const [instrumentistName, setInstrumentistName] = useLocalStorage('ir_name', '');
    const [instrumentistCode, setInstrumentistCode] = useLocalStorage('ir_code', '');
    const [deviceType, setDeviceType] = useLocalStorage('ir_device_type', '');
    const [workOrder, setWorkOrder] = useLocalStorage('ir_work_order', '');
    const [instrumentArea, setInstrumentArea] = useLocalStorage('ir_area', '');
    const [reviewDate, setReviewDate] = useLocalStorage('ir_date', '');

    const [deviceName, setDeviceName] = useLocalStorage('ir_dev_name', '');
    const [deviceBrand, setDeviceBrand] = useLocalStorage('ir_dev_brand', '');
    const [deviceModel, setDeviceModel] = useLocalStorage('ir_dev_model', '');
    const [deviceSerial, setDeviceSerial] = useLocalStorage('ir_dev_serial', '');
    const [deviceRange, setDeviceRange] = useLocalStorage('ir_dev_range', '');
    const [unity, setUnity] = useLocalStorage('ir_unity', '');
    const [deviceCode, setDeviceCode] = useLocalStorage('ir_dev_code', '');
    const [observations, setObservations] = useLocalStorage('ir_obs', '');

    // --- Tablas de Mediciones (Arrays persistentes) ---
    const [transmitterMeasurements, setTransmitterMeasurements] = useLocalStorage<Measurement[]>('ir_table_trans', []);
    const [pressureSwitchTests, setPressureSwitchTests] = useLocalStorage<PressureSwitchTest[]>('ir_table_press', []);
    const [thermostatTests, setThermostatTests] = useLocalStorage<ThermostatTest[]>('ir_table_therm', []);

    // Estado de UI (Este no hace falta persistirlo al recargar)
    const [showChart, setShowChart] = useState(false);
    const chartRef = useRef<HTMLDivElement>(null);

    // --- Handlers ---
    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleGeneratePdf = async () => {
        const reportData = {
            instrumentistName, instrumentistCode, deviceType, workOrder,
            instrumentArea, reviewDate, deviceName, deviceBrand,
            deviceModel, deviceSerial, deviceRange, unity,
            deviceCode, observations, transmitterMeasurements,
            pressureSwitchTests, thermostatTests,
        };

        try {
            await generatePDFReport(reportData, chartRef.current);
        } catch (error) {
            console.error("Error al generar PDF:", error);
            alert("Error al generar el PDF. Revisa la consola.");
        }
    };

    const handleClearForm = () => {
        const confirmed = window.confirm('¿Está seguro de que desea limpiar todos los campos? Esta acción borrará los datos guardados en el navegador.');

        if (confirmed) {
            // Al asignar valores vacíos, useLocalStorage limpia el navegador automáticamente
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
                                <p className="text-sm text-gray-600">Sistema de Gestión de Instrumentos</p>
                            </div>
                        </div>
                        <button onClick={handleLogout} className="flex items-center p-2 sm:px-4 text-white bg-red-500 rounded-lg hover:bg-red-600 transition-all">
                            <span className="hidden sm:block">Cerrar Sesión</span>
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto p-6 lg:p-8">
                <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                    <div className="bg-gradient-to-r from-teal-600 to-emerald-600 px-8 py-6 text-white">
                        <h2 className="text-2xl font-bold">Crear Nuevo Reporte</h2>
                    </div>

                    <div className="p-8">
                        {/* El Formulario usa los mismos inputs que ya tenías */}
                        <form className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700">Nombre del Instrumentista</label>
                                <input
                                    type="text"
                                    value={instrumentistName}
                                    onChange={(e) => setInstrumentistName(e.target.value)}
                                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700">Tipo de Dispositivo</label>
                                <select
                                    value={deviceType}
                                    onChange={(e) => setDeviceType(e.target.value)}
                                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                                >
                                    <option value="">Seleccione un dispositivo</option>
                                    <option value="transmitter">Transmisor</option>
                                    <option value="pressure_switch">Presostato</option>
                                    <option value="thermostat">Termostato</option>
                                </select>
                            </div>
                            
                            {/* ... Resto de los inputs (puedes copiar los de tu código original) ... */}
                            {/* Asegúrate de conectar cada value con su estado correspondiente */}
                        </form>

                        {/* Tablas Dinámicas */}
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

                        {/* Botones de Acción */}
                        <div className="mt-8 flex flex-wrap gap-4 justify-center bg-gray-50 p-6 rounded-xl">
                            <button onClick={() => setShowChart(!showChart)} className="px-6 py-3 bg-emerald-500 text-white rounded-lg shadow-md hover:bg-emerald-600">
                                {showChart ? 'Ocultar Gráfico' : 'Ver Gráfico'}
                            </button>
                            <button onClick={handleGeneratePdf} className="px-6 py-3 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600">
                                Generar PDF
                            </button>
                            <button onClick={handleClearForm} className="px-6 py-3 bg-gray-500 text-white rounded-lg shadow-md hover:bg-gray-600">
                                Limpiar Formulario
                            </button>
                        </div>

                        {/* Área del Gráfico */}
                        {showChart && (
                            <div ref={chartRef} className="mt-6 p-4 border rounded-xl bg-white shadow-inner">
                                <h3 className="font-bold mb-4">Visualización: {getDeviceTypeLabel(deviceType)}</h3>
                                {deviceType === 'transmitter' && <TransmitterChart data={transmitterMeasurements} />}
                                {deviceType === 'pressure_switch' && <PressureSwitchChart data={pressureSwitchTests} />}
                                {deviceType === 'thermostat' && <ThermostatChart data={thermostatTests} />}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default HomePage;