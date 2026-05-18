
import React, { useRef, useState, useEffect } from 'react';
import { Camera, Image as ImageIcon, Loader2, Upload, CameraIcon, X, Zap, ShieldCheck, Globe } from 'lucide-react';
import { analyzeMedicalImage } from '../services/geminiService';
import { AnalysisResult, Patient } from '../types';
import ImageMasker from './ImageMasker';

interface DrugScannerProps {
  onAnalysisComplete: (result: AnalysisResult) => void;
  patient: Patient;
}

const DrugScanner: React.FC<DrugScannerProps> = ({ onAnalysisComplete, patient }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processStep, setProcessStep] = useState<'masking' | 'transferring' | 'analyzing' | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [showOptions, setShowOptions] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  
  // 새 상태 추가: 마스킹 컴포넌트에 넘길 원본 이미지 데이터 URL
  const [maskerImageSrc, setMaskerImageSrc] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setShowOptions(false);
    prepareMasking(file);
  };

  const prepareMasking = (fileOrBlob: File | Blob) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setMaskerImageSrc(reader.result as string);
    };
    reader.readAsDataURL(fileOrBlob);
  };

  const handleMaskingComplete = async (maskedBase64: string, previewUrl: string) => {
    setMaskerImageSrc(null); // Close mask UI
    setPreview(previewUrl);  // Show masked image in preview
    
    setIsProcessing(true);
    setProcessStep('transferring');
    await new Promise(r => setTimeout(r, 600));

    setProcessStep('analyzing');

    try {
      const patientContext = `Age: ${patient.age}, Gender: ${patient.gender}, Conditions: ${patient.conditions.join(', ')}`;
      const result = await analyzeMedicalImage(maskedBase64, patientContext);
      onAnalysisComplete(result);
    } catch (error) {
      alert("분석 실패");
    } finally {
      setIsProcessing(false);
      setProcessStep(null);
    }
  };

  const startCamera = async () => {
    setShowOptions(false);
    setShowCamera(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (e) {
      alert("카메라 권한 필요");
      setShowCamera(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
    }
    setShowCamera(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0);
      canvas.toBlob((blob) => { if (blob) { stopCamera(); prepareMasking(blob); } }, 'image/jpeg', 0.8);
    }
  };

  return (
    <section className="mt-4 bg-white rounded-xl shadow-sm border border-slate-200 p-5 relative" aria-labelledby="scanner-title">
      <h3 id="scanner-title" className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
        <Zap className="w-4 h-4 text-teal-600 fill-teal-600" aria-hidden="true" />
        Snap & Solve (약물 스캔)
      </h3>
      
      <div 
        role="button"
        tabIndex={0}
        aria-label="약물 스캔 옵션 열기"
        className={`relative aspect-video rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 flex flex-col items-center justify-center overflow-hidden transition-colors outline-none focus:ring-2 focus:ring-teal-500 ${!isProcessing && 'hover:bg-slate-100 hover:border-teal-400 cursor-pointer'}`}
        onClick={() => !isProcessing && setShowOptions(true)}
        onKeyDown={(e) => !isProcessing && (e.key === ' ' || e.key === 'Enter') && setShowOptions(true)}
      >
        {preview && <img src={preview} alt="Scan preview" className="absolute inset-0 w-full h-full object-cover opacity-50" />}

        <div className="relative z-10 flex flex-col items-center text-center px-4" aria-live="polite">
            {isProcessing ? (
                <>
                    <Loader2 className="w-8 h-8 text-teal-600 animate-spin mb-3" aria-hidden="true" />
                    <div className="space-y-1">
                        {processStep === 'masking' && (
                            <p className="text-xs font-black text-teal-700 flex items-center gap-1.5">
                                <ShieldCheck className="w-3 h-3" /> 로컬 개인정보 가명화 중...
                            </p>
                        )}
                        {processStep === 'transferring' && (
                            <p className="text-xs font-black text-blue-700 flex items-center gap-1.5">
                                <Globe className="w-3 h-3" /> 구글 보안 서버로 패킷 전송 중...
                            </p>
                        )}
                        {processStep === 'analyzing' && (
                            <p className="text-xs font-black text-slate-700">Gemini 3.0 Pro 엔진 분석 중...</p>
                        )}
                    </div>
                </>
            ) : (
                <>
                    <div className="flex gap-2 mb-2" aria-hidden="true">
                        <div className="bg-white p-2 rounded-full shadow-sm border border-slate-100">
                            <CameraIcon className="w-5 h-5 text-teal-600" />
                        </div>
                    </div>
                    <span className="text-xs text-slate-500 font-bold">촬영 혹은 사진 업로드</span>
                    <span className="text-[10px] text-slate-400 mt-1">개인정보는 전송 전 마스킹 처리됩니다.</span>
                </>
            )}
        </div>
      </div>

      {showOptions && (
          <div className="absolute inset-0 z-20 bg-white/95 backdrop-blur-md rounded-xl p-5 flex flex-col justify-center animate-in fade-in zoom-in duration-200" role="dialog" aria-modal="true" aria-label="업로드 방식 선택">
              <p className="text-sm font-black text-center text-slate-800 mb-6 tracking-tight">Snap & Solve</p>
              <div className="grid grid-cols-2 gap-4">
                  <button onClick={startCamera} className="flex flex-col items-center justify-center gap-3 p-5 bg-teal-600 text-white rounded-2xl hover:bg-teal-700 transition-all shadow-md active:scale-95 focus:ring-2 focus:ring-teal-400 outline-none">
                      <CameraIcon className="w-8 h-8" aria-hidden="true" />
                      <span className="text-sm font-bold">직접 촬영</span>
                  </button>
                  <button onClick={() => galleryInputRef.current?.click()} className="flex flex-col items-center justify-center gap-3 p-5 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all shadow-sm active:scale-95 focus:ring-2 focus:ring-slate-400 outline-none">
                      <Upload className="w-8 h-8 text-slate-600" aria-hidden="true" />
                      <span className="text-sm font-bold text-slate-700">사진 업로드</span>
                  </button>
              </div>
              <button onClick={() => setShowOptions(false)} className="mt-6 text-xs font-bold text-slate-400 hover:text-slate-600 focus:underline outline-none">취소하기</button>
          </div>
      )}

      {showCamera && (
          <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center" role="dialog" aria-modal="true" aria-label="카메라 촬영">
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" aria-label="실시간 카메라 미리보기" />
              <div className="absolute bottom-10 flex items-center justify-around w-full px-10">
                  <button onClick={stopCamera} className="p-4 bg-white/20 rounded-full text-white focus:ring-2 focus:ring-white outline-none" aria-label="카메라 닫기">
                    <X className="w-6 h-6" />
                  </button>
                  <button onClick={capturePhoto} className="w-20 h-20 bg-white rounded-full border-8 border-slate-300/50 flex items-center justify-center outline-none focus:ring-4 focus:ring-teal-400" aria-label="사진 촬영">
                      <div className="w-14 h-14 bg-white rounded-full border-2 border-slate-900"></div>
                  </button>
                  <div className="w-14" aria-hidden="true"></div>
              </div>
              <canvas ref={canvasRef} className="hidden" />
          </div>
      )}

      <input 
        type="file" 
        ref={galleryInputRef} 
        className="hidden" 
        accept="image/*" 
        onChange={handleFileChange} 
        aria-hidden="true"
      />

      {maskerImageSrc && (
        <ImageMasker
          imageSrc={maskerImageSrc}
          onComplete={handleMaskingComplete}
          onCancel={() => setMaskerImageSrc(null)}
        />
      )}
    </section>
  );
};

export default DrugScanner;

