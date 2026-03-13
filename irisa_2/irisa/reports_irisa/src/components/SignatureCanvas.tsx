import React, { useRef, useEffect, useState, useCallback } from 'react';

interface SignatureCanvasProps {
    label: string;
    sublabel?: string;
    onSignatureChange: (dataUrl: string | null) => void;
}

const SignatureCanvas: React.FC<SignatureCanvasProps> = ({ label, sublabel, onSignatureChange }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const isDrawing  = useRef(false);
    const [isEmpty, setIsEmpty] = useState(true);

    const getCtx = () => canvasRef.current?.getContext('2d') ?? null;

    // Configurar el canvas al montar y al redimensionar
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d')!;
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth   = 2;
        ctx.lineCap     = 'round';
        ctx.lineJoin    = 'round';
    }, []);

    const getPos = (e: React.MouseEvent | React.TouchEvent) => {
        const canvas = canvasRef.current!;
        const rect   = canvas.getBoundingClientRect();
        const scaleX = canvas.width  / rect.width;
        const scaleY = canvas.height / rect.height;
        if ('touches' in e) {
            return {
                x: (e.touches[0].clientX - rect.left) * scaleX,
                y: (e.touches[0].clientY - rect.top)  * scaleY,
            };
        }
        return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top)  * scaleY,
        };
    };

    const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
        e.preventDefault();
        isDrawing.current = true;
        const ctx = getCtx();
        if (!ctx) return;
        const { x, y } = getPos(e);
        ctx.beginPath();
        ctx.moveTo(x, y);
    };

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        e.preventDefault();
        if (!isDrawing.current) return;
        const ctx = getCtx();
        if (!ctx) return;
        const { x, y } = getPos(e);
        ctx.lineTo(x, y);
        ctx.stroke();
        setIsEmpty(false);
    };

    const endDraw = useCallback(() => {
        if (!isDrawing.current) return;
        isDrawing.current = false;
        const canvas = canvasRef.current;
        if (!canvas) return;
        onSignatureChange(canvas.toDataURL('image/png'));
    }, [onSignatureChange]);

    const clear = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d')!;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setIsEmpty(true);
        onSignatureChange(null);
    };

    return (
        <div className="flex flex-col gap-2">
            {/* Etiqueta */}
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-bold text-gray-700">{label}</p>
                    {sublabel && <p className="text-xs text-gray-400">{sublabel}</p>}
                </div>
                <button
                    type="button"
                    onClick={clear}
                    className="flex items-center gap-1 text-xs text-red-400 hover:text-red-600 font-semibold px-2 py-1 rounded-lg hover:bg-red-50 transition-all"
                >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Limpiar
                </button>
            </div>

            {/* Canvas */}
            <div className={`relative rounded-xl border-2 transition-colors overflow-hidden
                ${isEmpty ? 'border-dashed border-gray-300 bg-gray-50' : 'border-solid border-teal-400 bg-white shadow-sm'}`}>
                <canvas
                    ref={canvasRef}
                    width={500}
                    height={150}
                    className="w-full h-[130px] touch-none cursor-crosshair"
                    onMouseDown={startDraw}
                    onMouseMove={draw}
                    onMouseUp={endDraw}
                    onMouseLeave={endDraw}
                    onTouchStart={startDraw}
                    onTouchMove={draw}
                    onTouchEnd={endDraw}
                />
                {isEmpty && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <p className="text-xs text-gray-400 font-medium">Firme aquí</p>
                    </div>
                )}
            </div>

            {/* Línea de firma */}
            <div className="flex items-center gap-2 px-2">
                <div className="flex-1 h-px bg-gray-300" />
                <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">{label}</p>
                <div className="flex-1 h-px bg-gray-300" />
            </div>
        </div>
    );
};

export default SignatureCanvas;