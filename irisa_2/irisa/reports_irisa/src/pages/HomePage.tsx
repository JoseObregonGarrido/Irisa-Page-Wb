import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

// Services
import { logout } from '../services/authService';
import { generatePDFReport, type ReportData } from '../services/pdfService';

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

    const [instrumentist, setInstrumentist] = useLocalStorage('ir_staff', { name: '', code: '' });
    const [workInfo, setWorkInfo] = useLocalStorage('ir_work', { order: '', area: '', date: '', deviceType: '' });
    const [deviceDetails, setDeviceDetails] = useLocalStorage('ir_dev_details', {
        name: '', brand: '', model: '', serial: '', range: '', unity: '', code: '', observations: ''
    });

    const [transmitterMeasurements, setTransmitterMeasurements] = useLocalStorage<Measurement[]>('ir_table_trans', []);
    const [pressureSwitchTests, setPressureSwitchTests] = useLocalStorage<PressureSwitchTest[]>('ir_table_press', []);
    const [thermostatTests, setThermostatTests] = useLocalStorage<ThermostatTest[]>('ir_table_therm', []);

    const [outputUnit, setOutputUnit] = useLocalStorage<'mA' | 'Ω'>('ir_output_unit', 'mA');
    const [hasUeTransmitter, setHasUeTransmitter] = useLocalStorage('ir_has_ue', false);

    const [showChart, setShowChart] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);

    const transmitterChartRef = useRef<any>(null);
    const pressureSwitchChartRef = useRef<any>(null);
    const thermostatChartRef = useRef<any>(null);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleGeneratePdf = async () => {
        if (!workInfo.deviceType) {
            alert("Por favor, seleccione un tipo de dispositivo.");
            return;
        }

        setIsGenerating(true);

        // 1. Captura de imágenes de gráficos
        const chartImages: string[] = [];
        try {
            if (showChart) {
                const activeRef = 
                    workInfo.deviceType === 'transmitter' ? transmitterChartRef :
                    workInfo.deviceType === 'pressure_switch' ? pressureSwitchChartRef : 
                    thermostatChartRef;

                if (activeRef.current?.getChartImages) {
                    chartImages.push(...activeRef.current.getChartImages());
                }
            }

            // 2. Mapeo Correcto a ReportData
            const reportData: ReportData = {
                instrumentistName: instrumentist.name,
                instrumentistCode: instrumentist.code,
                deviceType: workInfo.deviceType,
                workOrder: workInfo.order,
                instrumentArea: workInfo.area,
                reviewDate: workInfo.date,
                deviceName: deviceDetails.name,
                deviceBrand: deviceDetails.brand,
                deviceModel: deviceDetails.model,
                deviceSerial: deviceDetails.serial,
                deviceRange: deviceDetails.range,
                unity: deviceDetails.unity,
                deviceCode: deviceDetails.code,
                observations: deviceDetails.observations,
                outputUnit: outputUnit,
                hasUeTransmitter: hasUeTransmitter,
                transmitterMeasurements: transmitterMeasurements,
                pressureSwitchTests: pressureSwitchTests,
                thermostatTests: thermostatTests
            };

            await generatePDFReport(reportData, chartImages);
        } catch (error) {
            console.error("Error generating PDF:", error);
            alert("Error al generar el PDF.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleClearForm = () => {
        if (window.confirm('¿Desea limpiar todos los campos?')) {
            setInstrumentist({ name: '', code: '' });
            setWorkInfo({ order: '', area: '', date: '', deviceType: '' });
            setDeviceDetails({ name: '', brand: '', model: '', serial: '', range: '', unity: '', code: '', observations: '' });
            setTransmitterMeasurements([]);
            setPressureSwitchTests([]);
            setThermostatTests([]);
            setShowChart(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow-md border-b-4 border-teal-600">
                <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-teal-700 rounded-lg text-white">
                            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20"><path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" /></svg>
                        </div>
                        <div>
                            <h1 className="text-xl font-black text-gray-800 uppercase">Ingenio Risaralda</h1>
                            <p className="text-xs font-bold text-teal-600 tracking-widest uppercase">Metrología Industrial</p>
                        </div>
                    </div>
                    <button onClick={handleLogout} className="text-sm font-bold text-red-600 hover:text-red-800 flex items-center gap-2 border border-red-200 px-3 py-1.5 rounded-md">
                        SALIR
                    </button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto p-4 md:p-8">
                <div className="bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden">
                    <div className="bg-gradient-to-r from-teal-700 to-emerald-700 px-8 py-6 text-white">
                        <h2 className="text-2xl font-bold">Generación de Reporte Técnico</h2>
                    </div>

                    <div className="p-6 md:p-10">
                        {/* Datos del Instrumentista */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-gray-500 uppercase">Instrumentista</label>
                                <input 
                                    type="text" 
                                    value={instrumentist.name} 
                                    onChange={(e) => setInstrumentist({...instrumentist, name: e.target.value})}
                                    className="border-b-2 border-gray-200 py-2 focus:border-teal-500 outline-none font-medium"
                                />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-gray-500 uppercase">Tipo de Dispositivo</label>
                                <select 
                                    value={workInfo.deviceType} 
                                    onChange={(e) => setWorkInfo({...workInfo, deviceType: e.target.value})}
                                    className="bg-gray-50 border-none rounded p-2 text-gray-800 font-bold focus:ring-2 focus:ring-teal-500"
                                >
                                    <option value="">Seleccione...</option>
                                    <option value="transmitter">Transmisor</option>
                                    <option value="pressure_switch">Presostato</option>
                                    <option value="thermostat">Termostato</option>
                                </select>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-gray-500 uppercase">Unidad de Salida</label>
                                <div className="flex gap-2">
                                    {['mA', 'Ω'].map(u => (
                                        <button 
                                            key={u}
                                            onClick={() => setOutputUnit(u as 'mA' | 'Ω')}
                                            className={`flex-1 py-1 rounded font-bold border ${outputUnit === u ? 'bg-teal-600 text-white' : 'bg-white text-gray-400'}`}
                                        >
                                            {u}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Tablas Dinámicas */}
                        <div className="mb-10 min-h-[300px]">
                            {workInfo.deviceType === 'transmitter' && (
                                <TransmitterTable 
                                    measurements={transmitterMeasurements} 
                                    onMeasurementsChange={setTransmitterMeasurements}
                                    outputUnit={outputUnit}
                                    setOutputUnit={setOutputUnit}
                                    hasUeTransmitter={hasUeTransmitter}
                                    setHasUeTransmitter={setHasUeTransmitter}
                                />
                            )}
                            {workInfo.deviceType === 'pressure_switch' && (
                                <PressureSwitchTable tests={pressureSwitchTests} onTestsChange={setPressureSwitchTests} />
                            )}
                            {workInfo.deviceType === 'thermostat' && (
                                <ThermostatTable tests={thermostatTests} onTestsChange={setThermostatTests} />
                            )}
                        </div>

                        {/* Acciones */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <button onClick={() => setShowChart(!showChart)} className="px-6 py-3 rounded-lg font-bold bg-gray-100 text-gray-600 border border-gray-200">
                                {showChart ? 'CERRAR GRÁFICOS' : 'VISUALIZAR GRÁFICOS'}
                            </button>
                            <button onClick={handleGeneratePdf} disabled={isGenerating} className="px-6 py-3 rounded-lg font-bold text-white bg-teal-600 shadow-lg disabled:bg-gray-400">
                                {isGenerating ? 'PROCESANDO...' : 'GENERAR REPORTE PDF'}
                            </button>
                            <button onClick={handleClearForm} className="px-6 py-3 bg-white text-gray-400 font-bold border border-gray-200 rounded-lg hover:text-red-500">
                                LIMPIAR TODO
                            </button>
                        </div>

                        {/* Panel de Gráficos */}
                        {showChart && workInfo.deviceType && (
                            <div className="mt-10 p-6 bg-gray-50 rounded-2xl border border-gray-200">
                                {workInfo.deviceType === 'transmitter' && <TransmitterChart ref={transmitterChartRef} data={transmitterMeasurements} />}
                                {workInfo.deviceType === 'pressure_switch' && <PressureSwitchChart ref={pressureSwitchChartRef} tests={pressureSwitchTests} />}
                                {workInfo.deviceType === 'thermostat' && <ThermostatChart ref={thermostatChartRef} tests={thermostatTests} />}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default HomePage;