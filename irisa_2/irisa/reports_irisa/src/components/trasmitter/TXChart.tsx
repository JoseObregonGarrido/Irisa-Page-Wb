import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { toPng } from 'html-to-image';
import { useRef, useImperativeHandle, forwardRef } from 'react';

export interface TXMeasurement {
    percentage: string;
    idealUE?: string;
    idealmA?: string;
    maTransmitter?: string; // used as mA TX
}

interface TXChartProps {
    measurements?: TXMeasurement[];
}

const TXChart = forwardRef<any, TXChartProps>(({ 
    measurements = []
}, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);

    // process data
    const processedData = measurements.map(m => {
        const idealMA = m.idealmA ? parseFloat(m.idealmA) : null;
        const maTx = m.maTransmitter ? parseFloat(m.maTransmitter) : null;
        return {
            temperatura: m.idealUE ? parseFloat(m.idealUE) : null,
            idealMA,
            maTx
        };
    }).sort((a,b)=> (a.temperatura||0) - (b.temperatura||0));

    const getYTicks = () => {
        if (processedData.length === 0) return [0,5,10,15,20];
        const vals = processedData.flatMap(d=>[d.idealMA,d.maTx].filter(v=>v!==null) as number[]);
        const max = vals.length?Math.max(...vals):20;
        const min = vals.length?Math.min(...vals,0):0;
        let step=5;
        if(max>50) step=10;
        if(max>100) step=20;
        const ticks=[];
        const start=Math.floor(min/step)*step;
        const end=Math.ceil(max/step)*step;
        for(let i=start;i<=end;i+=step) ticks.push(i);
        return ticks;
    };
    const getXTicks = () => {
        if (processedData.length===0) return [];
        const temps = processedData.map(d=>d.temperatura).filter(t=>t!==null) as number[];
        if(temps.length===0) return [];
        const min= Math.min(...temps);
        const max= Math.max(...temps);
        let step=10;
        if(max-min>100) step=20;
        if(max-min>500) step=50;
        const ticks=[];
        const start=Math.floor(min/step)*step;
        const end=Math.ceil(max/step)*step;
        for(let i=start;i<=end;i+=step) ticks.push(i);
        return ticks.length>0?ticks:[min,max];
    };

    const yTicks = getYTicks();
    const xTicks = getXTicks();

    useImperativeHandle(ref, ()=>({
        captureAllCharts: async ()=>{
            if(containerRef.current){
                const url=await toPng(containerRef.current,{backgroundColor:'#ffffff',pixelRatio:2,cacheBust:true});
                return [url];
            }
            return [];
        }
    }));

    return (
        <div className="mt-8 shadow-lg rounded-xl overflow-hidden border border-gray-200 bg-white" ref={containerRef}>
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-5 text-white">
                <div className="flex items-center gap-4">
                    <span className="text-3xl">📈</span>
                    <div>
                        <h3 className="text-xl font-bold">Ideal mA vs mA TX</h3>
                        <p className="text-purple-100 text-sm opacity-90">Eje X: Ideal UE (temperatura) | Eje Y: mA</p>
                    </div>
                </div>
            </div>
            <div className="p-6 bg-white">
                {processedData.length===0? (
                    <div className="text-center py-12 text-gray-400">
                        <p>No hay datos suficientes para generar la curva.</p>
                    </div>
                ):(
                    <div className="h-96 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={processedData} margin={{top:20,right:30,left:20,bottom:25}}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="temperatura" type="number" ticks={xTicks} tick={{fontSize:11}} label={{value:'Temperatura (UE)',position:'insideBottom',offset:-10,fontSize:12,fontWeight:'bold'}} />
                                <YAxis ticks={yTicks} domain={[yTicks[0],yTicks[yTicks.length-1]]} tick={{fontSize:10}} label={{value:'mA',angle:-90,position:'insideLeft',fontWeight:'bold',fontSize:12}} />
                                <Tooltip contentStyle={{borderRadius:'8px',fontSize:'12px',border:'none',boxShadow:'0 4px 6px -1px rgb(0 0 0 / 0.1)'}} formatter={(v:any,name:string)=>[v!==null?v.toFixed(3):'---',name]} labelFormatter={label=>`Temperatura: ${label} UE`} />
                                <Legend verticalAlign="top" height={36} />
                                <Line type="monotone" dataKey="idealMA" stroke="#3b82f6" name="Ideal mA" strokeWidth={2} dot={{r:4}} isAnimationActive={false} />
                                <Line type="monotone" dataKey="maTx" stroke="#ef4444" name="mA TX" strokeWidth={2} strokeDasharray="5 5" dot={{r:4}} isAnimationActive={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>
        </div>
    );
});

export default TXChart;