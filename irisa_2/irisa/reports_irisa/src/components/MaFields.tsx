import InputField from '../components/InputField'
import { Measurement } from './TransmitterTable';

export const MaHeader = () => <div className="px-2 py-4 text-center">Ideal mA</div>;
export const MaSensorHeader = () => <div className="px-2 py-4 text-center">mA sensor</div>;

export const MaRowFields = ({ m, index, handleChange }: { m: Measurement, index: number, handleChange: any }) => (
    <div className="lg:px-2 lg:py-3">
        <InputField 
            label="Ideal mA" 
            unit="mA" 
            value={m.idealmA} 
            onChange={(e: any) => handleChange(index, 'idealmA', e.target.value)} 
        />
    </div>
);

export const MaSensorRowFields = ({ m, index, handleChange }: { m: Measurement, index: number, handleChange: any }) => (
    <div className="lg:px-2 lg:py-3">
        <InputField 
            label="mA sensor" 
            unit="mA" 
            value={m.maTransmitter} 
            onChange={(e: any) => handleChange(index, 'maTransmitter', e.target.value)} 
        />
    </div>
);