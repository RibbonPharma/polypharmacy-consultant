
import React, { useState } from 'react';
import { AnalysisResult } from '../types';
import { Printer, Smartphone, FileText, Image as ImageIcon, ClipboardList, CheckSquare } from 'lucide-react';

interface SmartOutputProps {
  analysis: AnalysisResult | null;
}

const SmartOutput: React.FC<SmartOutputProps> = ({ analysis }) => {
  const [mode, setMode] = useState<'pharmacist' | 'patient'>('pharmacist');

  if (!analysis) {
    return (
       <div className="h-full bg-slate-50 rounded-xl border border-dashed border-slate-300 flex items-center justify-center text-slate-400 text-sm" role="status">
          분석이 완료되면 다제약물 관리사업 서식이 생성됩니다.
       </div>
    );
  }

  return (
    <section className="h-full bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col" aria-labelledby="guide-title">
      <div className="p-5 border-b border-slate-100">
        <h2 id="guide-title" className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-indigo-600" />
          다제약물 관리사업 결과 보고서
        </h2>
        
        <div className="flex bg-slate-100 p-1 rounded-lg" role="tablist" aria-label="보고서 표시 모드">
            <button 
                onClick={() => setMode('pharmacist')}
                role="tab"
                aria-selected={mode === 'pharmacist'}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-bold rounded-md transition-all outline-none focus:ring-2 focus:ring-indigo-500 ${
                    mode === 'pharmacist' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
            >
                <FileText className="w-4 h-4" aria-hidden="true" /> 공단 제출용 (상담기록지)
            </button>
            <button 
                onClick={() => setMode('patient')}
                role="tab"
                aria-selected={mode === 'patient'}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-bold rounded-md transition-all outline-none focus:ring-2 focus:ring-indigo-500 ${
                    mode === 'patient' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
            >
                <ImageIcon className="w-4 h-4" aria-hidden="true" /> 대상자 발송용 (결과지)
            </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 bg-slate-50" role="tabpanel">
         {mode === 'pharmacist' ? (
             <div className="bg-white border border-slate-200 shadow-sm p-6 min-h-[300px] text-sm">
                <div className="border-b-2 border-slate-900 pb-3 mb-5">
                    <h3 className="text-xl font-black text-center text-slate-900">다제약물 관리사업 상담 기록지(1차)</h3>
                </div>
                
                <div className="space-y-6">
                    {analysis.soapNote ? (
                        <section>
                            <h4 className="font-bold bg-slate-100 p-2 mb-3 flex items-center gap-2"><CheckSquare className="w-4 h-4"/> 3. SOAP 노트 자동 초안</h4>
                            <div className="space-y-3 pl-2 text-xs">
                                <div><strong className="text-slate-700">S (주관적 정보):</strong> {analysis.soapNote.subjective}</div>
                                <div><strong className="text-slate-700">O (객관적 정보):</strong> {analysis.soapNote.objective}</div>
                                <div><strong className="text-slate-700">A (평가):</strong> {analysis.soapNote.assessment}</div>
                                <div><strong className="text-slate-700">P (계획):</strong> {analysis.soapNote.plan}</div>
                            </div>
                        </section>
                    ) : null}

                    <section>
                        <h4 className="font-bold bg-slate-100 p-2 mb-3 flex items-center gap-2"><CheckSquare className="w-4 h-4"/> 4. 상담의견 (약물관련문제)</h4>
                        
                        <div className="space-y-4 pl-2">
                            <div>
                                <p className="font-bold text-slate-700 mb-1">4-1. 복약이행도 평가</p>
                                <p className="text-xs text-slate-600">□ 복약이행도 낮은 약물이 있습니다 (AI 추정)</p>
                            </div>
                            
                            <div>
                                <p className="font-bold text-slate-700 mb-1">4-2. 의약품 중복투약</p>
                                {analysis.alerts.filter(a => a.reason.includes('중복')).length > 0 ? (
                                    <ul className="list-disc pl-5 text-xs text-red-600">
                                        {analysis.alerts.filter(a => a.reason.includes('중복')).map((a, i) => (
                                            <li key={i}>{a.drugsInvolved.join(', ')}</li>
                                        ))}
                                    </ul>
                                ) : <p className="text-xs text-slate-500">□ 해당사항 없음</p>}
                            </div>

                            <div>
                                <p className="font-bold text-slate-700 mb-1">4-3. 약물 이상반응 (부작용) 평가</p>
                                {analysis.alerts.filter(a => a.title.includes('부작용') || a.title.includes('이상')).length > 0 ? (
                                    <ul className="list-disc pl-5 text-xs text-red-600">
                                        {analysis.alerts.filter(a => a.title.includes('부작용') || a.title.includes('이상')).map((a, i) => (
                                            <li key={i}>{a.reason}</li>
                                        ))}
                                    </ul>
                                ) : <p className="text-xs text-slate-500">□ 해당사항 없음</p>}
                            </div>

                            <div>
                                <p className="font-bold text-slate-700 mb-1">4-4. 약물-약물 상호작용 평가</p>
                                {analysis.alerts.filter(a => a.title.includes('상호작용') || a.reason.includes('상호작용')).length > 0 ? (
                                    <ul className="list-disc pl-5 text-xs text-red-600">
                                        {analysis.alerts.filter(a => a.title.includes('상호작용') || a.reason.includes('상호작용')).map((a, i) => (
                                            <li key={i}>{a.drugsInvolved.join(' ↔ ')} : {a.action}</li>
                                        ))}
                                    </ul>
                                ) : <p className="text-xs text-slate-500">□ 해당사항 없음</p>}
                            </div>
                        </div>
                    </section>

                    <section>
                        <h4 className="font-bold bg-slate-100 p-2 mb-3 flex items-center gap-2"><CheckSquare className="w-4 h-4"/> 5. 의약품 사용 교육 (집중관리약제)</h4>
                        <div className="pl-2">
                             <p className="text-xs text-amber-700 font-bold mb-2">
                                ※ AI가 스캔을 통해 다음의 집중관리 대상 약군을 감지했습니다.
                             </p>
                             <div className="flex flex-wrap gap-2">
                                {['항응고제', 'NSAIDs', '인슐린', '흡입기'].map(cat => (
                                     <span key={cat} className="px-2 py-1 bg-white border border-slate-300 rounded text-xs">{cat} 교육 필요</span>
                                ))}
                             </div>
                        </div>
                    </section>
                </div>
             </div>
         ) : (
             <div className="bg-white border border-slate-200 shadow-sm p-6 min-h-[300px]">
                <div className="bg-red-50 text-center p-3 rounded-lg border border-red-100 mb-6">
                    <h3 className="text-xl font-bold text-red-700 tracking-tight">상 담 결 과 서</h3>
                    <p className="text-xs text-red-600 mt-1">국민건강보험공단 다제약물 관리사업</p>
                </div>
                
                <div className="space-y-5 text-slate-800">
                    <p className="text-sm font-medium">
                        안녕하십니까? 귀하의 약물상담 결과를 안내해 드립니다.<br/>
                        안전한 약물 사용을 위해 아래 내용을 참고하시기 바라며, 자세한 내용은 의사선생님과 상담하시기 바랍니다.
                    </p>

                    <div className="bg-slate-50 p-4 border border-slate-200 rounded-lg space-y-4">
                        {(analysis.alerts || []).filter(a => a.level === 'RED').length > 0 && (
                            <div>
                                <h4 className="font-bold text-red-700 flex items-center gap-1 mb-2">
                                    <span className="w-4 h-4 rounded-full bg-red-600 text-white flex items-center justify-center text-[10px]">!</span>
                                    의사 선생님과 꼭 상의해야 할 약물
                                </h4>
                                <ul className="list-disc pl-6 text-sm space-y-2">
                                    {(analysis.alerts || []).filter(a => a.level === 'RED').map((alert, i) => (
                                        <li key={i}>
                                            <span className="font-bold">{alert.drugsInvolved.join(', ')}</span><br/>
                                            <span className="text-slate-600">{alert.action}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <div>
                            <h4 className="font-bold text-teal-700 flex items-center gap-1 mb-2">
                                <span className="w-4 h-4 rounded-full bg-teal-600 text-white flex items-center justify-center text-[10px]">✓</span>
                                어르신, 이렇게 복용/보관해주세요
                            </h4>
                            <ul className="list-disc pl-6 text-sm space-y-2 text-slate-700">
                                <li><strong>관절염약</strong>과 <strong>위장약</strong>은 증상이 좋아져도 처방받은 기간 동안은 꾸준히 드세요.</li>
                                <li>드시고 계신 <strong>혈압약</strong>은 자몽 주스와 함께 드시면 부작용이 커질 수 있으니 물과 함께 드세요.</li>
                            </ul>
                        </div>
                    </div>

                    <p className="text-xs text-slate-400 mt-5 border-t pt-3">
                        * 만성질환자 중 10개 이상 약물을 복용하는 환자에 대해 가정방문을 통해 약물의 안전한 사용관리를 제공하는 사업입니다.
                    </p>
                </div>
             </div>
         )}
      </div>

       <div className="p-5 border-t border-slate-100 bg-white grid grid-cols-2 gap-3 hidden-print">
        <button 
            onClick={() => window.print()}
            className="flex items-center justify-center gap-2 py-3 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-700 transition-colors focus:ring-2 focus:ring-slate-900 outline-none" aria-label="안내문 인쇄">
            <Printer className="w-4 h-4" aria-hidden="true" /> {mode === 'pharmacist' ? '전산시스템 등록(복사)' : '결과서 인쇄'}
        </button>
        <button className="flex items-center justify-center gap-2 py-3 bg-indigo-50 text-indigo-700 rounded-xl font-bold hover:bg-indigo-100 transition-colors focus:ring-2 focus:ring-indigo-500 outline-none" aria-label="카카오톡 또는 문자로 전송">
            <Smartphone className="w-4 h-4" aria-hidden="true" /> {mode === 'pharmacist' ? 'AI 기록 초안 생성' : '보호자에게 전송'}
        </button>
      </div>
    </section>
  );
};

export default SmartOutput;

