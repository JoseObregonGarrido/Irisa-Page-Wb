import InputField from '../components/InputField'
import { Measurement } from './TransmitterTable';

export const TxHeader = () => <div className="px-2 py-4 text-center">Ideal TX (mV)</div>;
export const TxSensorHeader = () => <div className="px-2 py-4 text-center">TX sensor</div>;

export const TxRowFields = ({ m, index, handleChange }: { m: Measurement, index: number, handleChange: any }) => (
    <div className="lg:px-2 lg:py-3">
        <InputField 
            label="Ideal TX" 
            unit="mV" 
            value={m.idealTX} 
            onChange={(e: any) => handleChange(index, 'idealTX', e.target.value)} 
        />
    </div>
);

export const TxSensorRowFields = ({ m, index, handleChange }: { m: Measurement, index: number, handleChange: any }) => (
    <div className="lg:px-2 lg:py-3">
        <InputField 
            label="TX sensor" 
            unit="mV" 
            value={m.txTransmitter} 
            onChange={(e: any) => handleChange(index, 'txTransmitter', e.target.value)} 
        />
    </div>
);