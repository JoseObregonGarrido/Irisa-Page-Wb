import InputField from '../components/InputField';
import { Measurement } from './TransmitterTable';

export const MvHeader = () => <div className="px-2 py-4 text-center">Ideal mV</div>;
export const MvTransHeader = () => <div className="px-2 py-4 text-center">mV trans.</div>;

export const MvRowFields = ({ m, index, handleChange }: { m: Measurement, index: number, handleChange: any }) => (
    <div className="lg:px-2 lg:py-3">
        <InputField 
            label="Ideal mV" 
            unit="mV" 
            value={m.idealmV} 
            onChange={(e: any) => handleChange(index, 'idealmV', e.target.value)} 
        />
    </div>
);

export const MvTransRowFields = ({ m, index, handleChange }: { m: Measurement, index: number, handleChange: any }) => (
    <div className="lg:px-2 lg:py-3">
        <InputField 
            label="mV trans." 
            unit="mV" 
            value={m.mvTransmitter} 
            onChange={(e: any) => handleChange(index, 'mvTransmitter', e.target.value)} 
        />
    </div>
);