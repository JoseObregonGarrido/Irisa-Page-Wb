import InputField from '../components/InputField'
import { Measurement } from './TransmitterTable';

export const RtdHeader = () => <div className="px-2 py-4 text-center">Ideal Ω</div>;
export const RtdSensorHeader = () => <div className="px-2 py-4 text-center">Ω sensor</div>;

export const RtdRowFields = ({ m, index, handleChange }: { m: Measurement, index: number, handleChange: any }) => (
    <div className="lg:px-2 lg:py-3">
        <InputField 
            label="Ideal Ω" 
            unit="Ω" 
            value={m.idealohm} 
            onChange={(e: any) => handleChange(index, 'idealohm', e.target.value)} 
        />
    </div>
);

export const RtdSensorRowFields = ({ m, index, handleChange }: { m: Measurement, index: number, handleChange: any }) => (
    <div className="lg:px-2 lg:py-3">
        <InputField 
            label="Ω sensor" 
            unit="Ω" 
            value={m.ohmTransmitter} 
            onChange={(e: any) => handleChange(index, 'ohmTransmitter', e.target.value)} 
        />
    </div>
);