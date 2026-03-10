import React, { useState } from 'react';
import TransmitterTable, { Measurement } from './TransmitterTable';

const TransmitterManager = () => {
    // 1. Estado para saber qué pestaña está activa
    const [outputUnit, setOutputUnit] = useState<'mA' | 'ohm' | 'mv'>('mA');
    const [hasUeTransmitter, setHasUeTransmitter] = useState(true);

    // 2. TRES estados independientes: uno para cada tipo de tabla
    const [measurementsMA, setMeasurementsMA] = useState<Measurement[]>([]);
    const [measurementsOHM, setMeasurementsOHM] = useState<Measurement[]>([]);
    const [measurementsMV, setMeasurementsMV] = useState<Measurement[]>([]);

    // 3. Lógica para decidir qué datos y qué función de actualización pasarle al hijo
    const getActiveContext = () => {
        switch (outputUnit) {
            case 'ohm': 
                return { data: measurementsOHM, setter: setMeasurementsOHM };
            case 'mv': 
                return { data: measurementsMV, setter: setMeasurementsMV };
            default: 
                return { data: measurementsMA, setter: setMeasurementsMA };
        }
    };

    const { data, setter } = getActiveContext();

    return (
        <div className="p-4 bg-gray-100 min-h-screen">
            <TransmitterTable 
                measurements={data} 
                onMeasurementsChange={setter} 
                outputUnit={outputUnit}
                setOutputUnit={setOutputUnit}
                hasUeTransmitter={hasUeTransmitter}
                setHasUeTransmitter={setHasUeTransmitter}
            />
        </div>
    );
};

export default TransmitterManager;