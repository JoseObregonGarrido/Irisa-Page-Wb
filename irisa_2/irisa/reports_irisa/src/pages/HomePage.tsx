import React, { useState, useRef } from 'react';
import { flushSync } from 'react-dom';
import { toPng } from 'html-to-image';
import { useNavigate } from 'react-router-dom';

// Services
import { logout } from '../services/authService';
import { generatePDFReport } from '../services/pdfService';

// Components
import TransmitterTable, { type Measurement } from '../components/trasmitter/TransmitterTable';
import PressureSwitchTable, { type PressureSwitchTest } from '../components/PressureSwitchTable';
import ThermostatTable, { type ThermostatTest } from '../components/ThermostatTable';
import TransmitterChart from '../components/trasmitter/TransmitterChart';
import RTDChart from '../components/trasmitter/RTDChart';
import MvChart from '../components/trasmitter/MvChart';
import PHTable, { type PHTest } from '../components/PHTable';
import PHChart from '../components/PHChart';
import PressureSwitchChart from '../components/PressureSwitchChart';
import ThermostatChart from '../components/ThermostatChart';

// Hooks
import useLocalStorage from './hooks/useLocalStorage';

const HomePage: React.FC = () => {
    const navigate = useNavigate();

    // --- ESTADOS DE CABECERA ---
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

    // --- NUEVA LÓGICA DE TABLAS INDEPENDIENTES ---
    // Separamos el transmisor en 3 estados según la unidad de salida
    const [measurementsMA, setMeasurementsMA] = useLocalStorage<Measurement[]>('ir_table_ma', []);
    const [measurementsOHM, setMeasurementsOHM] = useLocalStorage<Measurement[]>('ir_table_ohm', []);
    const [measurementsMV, setMeasurementsMV] = useLocalStorage<Measurement[]>('ir_table_mv', []);

    // Tablas de otros dispositivos (se mantienen igual)
    const [pressureSwitchTests, setPressureSwitchTests] = useLocalStorage<PressureSwitchTest[]>('ir_table_press', []);
    const [thermostatTests, setThermostatTests] = useLocalStorage<ThermostatTest[]>('ir_table_therm', []);
    const [phTests, setPhTests] = useLocalStorage<PHTest[]>('ir_table_ph', []);

    // Configuración de visualización
    const [outputUnit, setOutputUnit] = useLocalStorage<'mA' | 'ohm' | 'mv'>('ir_output_unit', 'mA');
    const [hasUeTransmitter, setHasUeTransmitter] = useLocalStorage<boolean>('ir_has_ue', false);

    // Efecto para controlar la visibilidad de UE según la unidad
    React.useEffect(() => {
        if (outputUnit === 'mv') {
            setHasUeTransmitter(false);
        } else {
            setHasUeTransmitter(true);
        }
    }, [outputUnit, setHasUeTransmitter]);

    const [showChart, setShowChart] = useState(false);

    // Refs para gráficas
    const transmitterChartRef = useRef<any>(null);
    const rtdChartRef = useRef<any>(null);
    const mvChartRef = useRef<any>(null);
    const pressureSwitchChartRef = useRef<any>(null);
    const thermostatChartRef = useRef<any>(null);
    const phChartRef = useRef<any>(null);

    // Helper para obtener las mediciones activas del transmisor
    const getActiveMeasurements = () => {
        if (outputUnit === 'ohm') return measurementsOHM;
        if (outputUnit === 'mv') return measurementsMV;
        return measurementsMA;
    };

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
            // AQUÍ PASAMOS LOS DATOS DE LA TABLA QUE ESTÁ VIENDO EL USUARIO
            transmitterMeasurements: getActiveMeasurements(),
            pressureSwitchTests,
            thermostatTests,
            phTests,
            outputUnit,
            hasUeTransmitter,
        };

        const wasShowingChart = showChart;
        flushSync(() => {
            setShowChart(true);
        });

        let chartImages: string[] = [];
        try {
            await new Promise(r => setTimeout(r, 1000));

            if (deviceType === 'transmitter' && outputUnit === 'ohm' && rtdChartRef.current) {
                chartImages = await rtdChartRef.current.captureAllCharts();
            } else if (deviceType === 'transmitter' && outputUnit === 'mv' && mvChartRef.current) {
                chartImages = await mvChartRef.current.captureAllCharts();
            } else if (deviceType === 'transmitter' && outputUnit === 'mA' && transmitterChartRef.current) {
                chartImages = await transmitterChartRef.current.captureAllCharts();
            } else if (deviceType === 'pressure_switch' && pressureSwitchChartRef.current) {
                chartImages = await pressureSwitchChartRef.current.captureAllCharts();
            } else if (deviceType === 'thermostat' && thermostatChartRef.current) {
                chartImages = await thermostatChartRef.current.captureAllCharts();
            } else if (deviceType === 'ph' && phChartRef.current) {
                const els = phChartRef.current.getChartElements();
                const captured: string[] = [];
                for (const el of [els.chart1, els.chart2, els.chart3]) {
                    if (!el) continue;
                    const orig = el.style.width;
                    el.style.width = '1100px';
                    await new Promise(r => setTimeout(r, 400));
                    try {
                        const dataUrl = await toPng(el, { backgroundColor: '#ffffff', pixelRatio: 2 });
                        captured.push(dataUrl);
                    } finally {
                        el.style.width = orig;
                    }
                }
                chartImages = captured;
            }
        } catch (chartError) {
            console.warn("Gráfica no capturada:", chartError);
        } finally {
            if (!wasShowingChart) setShowChart(false);
        }

        try {
            await generatePDFReport(reportData, chartImages);
        } catch (error) {
            console.error("Error al generar PDF:", error);
            alert("Hubo un error al generar el PDF.");
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
            // LIMPIAMOS LAS 3 TABLAS DEL TRANSMISOR
            setMeasurementsMA([]);
            setMeasurementsOHM([]);
            setMeasurementsMV([]);
            setPressureSwitchTests([]);
            setThermostatTests([]);
            setPhTests([]);
            setOutputUnit('mA');
            setHasUeTransmitter(false);
            setShowChart(false);
        }
    };

    const getDeviceTypeLabel = (type: string) => {
        const labels: { [key: string]: string } = {
            'transmitter': 'Transmisor',
            'pressure_switch': 'Presostato',
            'thermostat': 'Termostato',
            'ph': 'Medidor de pH'
        };
        return labels[type] || "Dispositivo no seleccionado";
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            {/* Header omitido por brevedad, se mantiene igual */}
            
            <main className="max-w-[98%] mx-auto p-4 lg:p-6">
                <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                    {/* Banner de título omitido, se mantiene igual */}

                    <div className="p-3 sm:p-4 lg:p-8">
                        {/* Formulario de cabecera omitido, se mantiene igual */}

                        <div className="mt-8">
                            {deviceType === 'transmitter' && (
                                <div className="w-full overflow-x-auto pb-4 custom-scrollbar">
                                    <div className="lg:min-w-[1000px]">
                                        <TransmitterTable
                                            // PASAMOS DINÁMICAMENTE LOS DATOS Y EL SETTER SEGÚN LA UNIDAD
                                            measurements={
                                                outputUnit === 'ohm' ? measurementsOHM : 
                                                outputUnit === 'mv' ? measurementsMV : measurementsMA
                                            }
                                            onMeasurementsChange={
                                                outputUnit === 'ohm' ? setMeasurementsOHM : 
                                                outputUnit === 'mv' ? setMeasurementsMV : setMeasurementsMA
                                            }
                                            outputUnit={outputUnit}
                                            setOutputUnit={setOutputUnit}
                                            hasUeTransmitter={hasUeTransmitter}
                                            setHasUeTransmitter={setHasUeTransmitter}
                                        />
                                    </div>
                                </div>
                            )}
                            {deviceType === 'pressure_switch' && (
                                <PressureSwitchTable tests={pressureSwitchTests} onTestsChange={setPressureSwitchTests} />
                            )}
                            {deviceType === 'thermostat' && (
                                <ThermostatTable tests={thermostatTests} onTestsChange={setThermostatTests} />
                            )}
                            {deviceType === 'ph' && (
                                <PHTable tests={phTests} onTestsChange={setPhTests} />
                            )}
                        </div>

                        {/* Botonera de acciones */}
                        <div className="mt-8 p-6 bg-gray-50 rounded-xl border border-gray-200">
                            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                                <button onClick={() => setShowChart(!showChart)} className="w-full sm:w-auto flex items-center justify-center px-6 py-2.5 text-sm bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-semibold rounded-lg shadow-md transition-all duration-200 transform hover:scale-105">
                                    {showChart ? 'Ocultar Gráfico' : 'Ver Gráfico'}
                                </button>
                                <button onClick={handleGeneratePdf} className="w-full sm:w-auto flex items-center justify-center px-6 py-2.5 text-sm bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-lg shadow-md transition-all duration-200 transform hover:scale-105">
                                    Generar PDF
                                </button>
                                <button onClick={handleClearForm} className="w-full sm:w-auto flex items-center justify-center px-6 py-2.5 text-sm bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-semibold rounded-lg shadow-md transition-all duration-200 transform hover:scale-105">
                                    Limpiar Formulario
                                </button>
                            </div>
                        </div>

                        <div className="mt-6">
                            {showChart && (
                                <div className="bg-white rounded-xl shadow-inner p-4 border border-gray-200">
                                    <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">
                                        Análisis Gráfico: {getDeviceTypeLabel(deviceType)}
                                    </h3>
                                    {/* PASAMOS LOS DATOS ESPECÍFICOS A CADA GRÁFICA */}
                                    {deviceType === 'transmitter' && outputUnit === 'ohm' && (
                                        <RTDChart ref={rtdChartRef} measurements={measurementsOHM} hasUeTransmitter={hasUeTransmitter} />
                                    )}
                                    {deviceType === 'transmitter' && outputUnit === 'mv' && (
                                        <MvChart ref={mvChartRef} measurements={measurementsMV} />
                                    )}
                                    {deviceType === 'transmitter' && outputUnit === 'mA' && (
                                        <TransmitterChart ref={transmitterChartRef} data={measurementsMA} />
                                    )}
                                    {deviceType === 'pressure_switch' && <PressureSwitchChart ref={pressureSwitchChartRef} tests={pressureSwitchTests} />}
                                    {deviceType === 'thermostat' && <ThermostatChart ref={thermostatChartRef} tests={thermostatTests} />}
                                    {deviceType === 'ph' && <PHChart ref={phChartRef} tests={phTests} />}
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