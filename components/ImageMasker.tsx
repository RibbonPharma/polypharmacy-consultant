import React, { useRef, useState, useEffect } from 'react';
import { X, Check, ShieldAlert } from 'lucide-react';

interface ImageMaskerProps {
  imageSrc: string;
  onComplete: (maskedBase64: string, previewUrl: string) => void;
  onCancel: () => void;
}

const ImageMasker: React.FC<ImageMaskerProps> = ({ imageSrc, onComplete, onCancel }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState<{ x: number, y: number } | null>(null);
  const [currentPos, setCurrentPos] = useState<{ x: number, y: number } | null>(null);
  const [boxes, setBoxes] = useState<{ x: number, y: number, w: number, h: number }[]>([]);
  const [imageObj, setImageObj] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
      setImageObj(img);
      drawCanvas(img, boxes);
    };
  }, [imageSrc]);

  useEffect(() => {
    if (imageObj) {
      drawCanvas(imageObj, boxes, startPos, currentPos);
    }
  }, [boxes, startPos, currentPos, imageObj]);

  const drawCanvas = (img: HTMLImageElement, boxesToDraw: any[], currentStart?: any, currentEnd?: any) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 캔버스 크기를 원본 이미지 크기에 맞춥니다 (고해상도 유지)
    if (canvas.width !== img.naturalWidth) canvas.width = img.naturalWidth;
    if (canvas.height !== img.naturalHeight) canvas.height = img.naturalHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);

    ctx.fillStyle = 'black';
    boxesToDraw.forEach(box => {
      ctx.fillRect(box.x, box.y, box.w, box.h);
    });

    if (currentStart && currentEnd) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      const x = Math.min(currentStart.x, currentEnd.x);
      const y = Math.min(currentStart.y, currentEnd.y);
      const w = Math.abs(currentStart.x - currentEnd.x);
      const h = Math.abs(currentStart.y - currentEnd.y);
      ctx.fillRect(x, y, w, h);
    }
  };

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  const handlePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    // 기본 터치 스크롤 방지는 부모 컨테이너 CSS 속성(touch-action: none)으로 해결
    setIsDrawing(true);
    setStartPos(getCoordinates(e));
    setCurrentPos(getCoordinates(e));
  };

  const handlePointerMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    setCurrentPos(getCoordinates(e));
  };

  const handlePointerUp = () => {
    if (!isDrawing || !startPos || !currentPos) return;
    setIsDrawing(false);
    
    const w = Math.abs(currentPos.x - startPos.x);
    const h = Math.abs(currentPos.y - startPos.y);

    // 너무 작은 드래그는 무시
    if (w > 5 && h > 5) {
      setBoxes([...boxes, {
        x: Math.min(startPos.x, currentPos.x),
        y: Math.min(startPos.y, currentPos.y),
        w,
        h
      }]);
    }
    setStartPos(null);
    setCurrentPos(null);
  };

  const undoLastBox = () => {
    setBoxes(boxes.slice(0, -1));
  };

  const handleComplete = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    const base64 = dataUrl.split(',')[1];
    onComplete(base64, dataUrl);
  };

  return (
    <div className="fixed inset-0 z-[200] bg-slate-900 flex flex-col" role="dialog" aria-label="개인정보 마스킹 화면">
      <div className="flex-none p-4 bg-slate-800 text-white flex justify-between items-center shadow-lg">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-amber-400" />
          <span className="font-bold text-sm">개인정보 마스킹 (필수)</span>
        </div>
        <button onClick={onCancel} className="p-2 bg-slate-700 rounded-full hover:bg-slate-600 transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>
      
      <div className="flex-none p-3 bg-slate-800 border-t border-slate-700 text-xs text-slate-300 text-center">
        이미지에서 환자 이름, 주민번호 등 데이터 외부 전송을 막기 위해<br/>
        <strong className="text-white">가리고 싶은 영역을 드래그하세요.</strong>
      </div>

      <div 
        ref={containerRef}
        className="flex-1 overflow-auto bg-black flex items-center justify-center p-4 relative"
        style={{ touchAction: 'none' }}
      >
        <canvas
          ref={canvasRef}
          className="max-w-full max-h-full object-contain cursor-crosshair border border-slate-700"
          onMouseDown={handlePointerDown}
          onMouseMove={handlePointerMove}
          onMouseUp={handlePointerUp}
          onMouseLeave={handlePointerUp}
          onTouchStart={handlePointerDown}
          onTouchMove={handlePointerMove}
          onTouchEnd={handlePointerUp}
        />
      </div>

      <div className="flex-none p-4 bg-slate-800 flex justify-between items-center safe-bottom">
        <button 
          onClick={undoLastBox} 
          disabled={boxes.length === 0}
          className="px-4 py-2 text-sm font-medium text-slate-300 disabled:opacity-50"
        >
          실행 취소
        </button>
        <button 
          onClick={handleComplete}
          className="flex items-center gap-2 px-6 py-3 bg-teal-500 hover:bg-teal-400 text-white rounded-lg font-bold shadow-lg transition-colors"
        >
          <Check className="w-5 h-5" />
          마스킹 완료 및 전송
        </button>
      </div>
    </div>
  );
};

export default ImageMasker;
