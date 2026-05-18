
import React, { useState } from 'react';
import { AnalysisResult, AlertLevel } from '../types';
import { AlertTriangle, CheckCircle, Info, ShieldAlert, Database, Search, ShieldCheck, ChevronDown, ChevronUp, Activity, Pill, ExternalLink, X } from 'lucide-react';

interface ClinicalDashboardProps {
  analysis: AnalysisResult | null;
}

const ClinicalDashboard: React.FC<ClinicalDashboardProps> = ({ analysis: initialAnalysis }) => {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(initialAnalysis);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  React.useEffect(() => {
    setAnalysis(initialAnalysis);
    setExpandedIndex(null);
    setSearchTerm('');
  }, [initialAnalysis]);

  const handleVerify = () => {
    if (analysis) {
        setAnalysis({ ...analysis, isVerifiedByPharmacist: true });
    }
  };

  const toggleAlert = (idx: number) => {
    setExpandedIndex(expandedIndex === idx ? null : idx);
  };

  if (!analysis) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-white rounded-xl border border-slate-200 text-slate-400 p-10 text-center" role="status">
        <ShieldAlert className="w-16 h-16 mb-4 text-slate-200" aria-hidden="true" />
        <h3 className="text-lg font-bold text-slate-300">대기 중</h3>
        <p className="text-sm">좌측 패널에서 약물 사진을 스캔해주세요.</p>
      </div>
    );
  }

  const filteredAlerts = (analysis.alerts || []).filter(alert => {
    const term = searchTerm.toLowerCase();
    return (
        alert.title.toLowerCase().includes(term) ||
        alert.reason.toLowerCase().includes(term) ||
        alert.drugsInvolved.some(drug => drug.toLowerCase().includes(term))
    );
  });

  return (
    <article className="h-full bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden relative" aria-labelledby="dashboard-title">
      <div
        className={`px-5 py-2 flex items-center justify-between transition-colors ${analysis.isVerifiedByPharmacist ? 'bg-green-600 text-white' : 'bg-amber-500 text-white'}`}
        role="status"
      >
         <div className="flex items-center gap-2 text-xs font-black uppercase tracking-tight">
            {analysis.isVerifiedByPharmacist ? (
                <><ShieldCheck className="w-4 h-4" aria-hidden="true" /> 약사 최종 검토 완료 (CDSS Verified)</>
            ) : (
                <><Info className="w-4 h-4" aria-hidden="true" /> 약사 검토 대기 중 (AI Suggestion Only)</>
            )}
         </div>
         {!analysis.isVerifiedByPharmacist && (
            <button
                onClick={handleVerify}
                className="bg-white text-amber-600 px-3 py-1 rounded-md text-[10px] font-black hover:bg-slate-50 transition-all shadow-sm focus:ring-2 focus:ring-white outline-none"
                aria-label="모든 분석 결과 승인"
            >
                전체 결과 승인
            </button>
         )}
      </div>

      <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-start justify-between">
        <div className="max-w-[70%]">
          <h2 id="dashboard-title" className="text-lg font-bold text-slate-900 flex items-center gap-2">
            임상 분석 리포트
            <span className="text-[10px] font-bold bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full uppercase" aria-label="AI 모델: Gemini 3.0 Pro">Gemini 3.0 Pro</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1 leading-snug mb-2">{analysis.summary}</p>
        </div>
        <div className="flex flex-col items-end min-w-fit ml-4" aria-hidden="true">
            <div className="flex items-center gap-1.5 text-[10px] font-black text-teal-600 bg-white border border-teal-200 px-2 py-1 rounded-md shadow-sm">
                <Database className="w-3 h-3" />
                DUR DB 연동
            </div>
            <span className="text-[9px] text-slate-400 mt-1">v2.0 Pseudonymized</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-6 hide-scrollbar">
        {(analysis.alerts || []).length > 0 && (
            <section className="space-y-3" aria-labelledby="alerts-heading">
                <div className="flex items-center justify-between mb-3">
                    <h3 id="alerts-heading" className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2">
                        <Search className="w-3 h-3" aria-hidden="true" /> AI 제안 위험 요소
                    </h3>
                    <div className="relative group w-full max-w-[200px]">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="약물명 검색..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-8 pr-8 py-1.5 bg-slate-100 border-none rounded-lg text-xs font-bold focus:ring-2 focus:ring-slate-900 focus:outline-none transition-all placeholder:text-slate-400"
                            aria-label="위험 요소 검색"
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600 rounded-full"
                                aria-label="검색어 지우기"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        )}
                    </div>
                </div>

                <div role="list" className="space-y-3">
                    {filteredAlerts.length > 0 ? (
                        filteredAlerts.map((alert, idx) => {
                        const isExpanded = expandedIndex === idx;

                        return (
                        <div
                            key={idx}
                            role="listitem"
                            className={`rounded-xl border-l-4 shadow-sm transition-all relative overflow-hidden cursor-pointer group focus-within:ring-2 focus-within:ring-teal-500 focus-within:ring-offset-2 ${
                                alert.level === AlertLevel.RED
                                ? 'bg-red-50 border-red-500 hover:shadow-red-100'
                                : alert.level === AlertLevel.YELLOW
                                    ? 'bg-amber-50 border-amber-400 hover:shadow-amber-100'
                                    : 'bg-green-50 border-green-500 hover:shadow-green-100'
                            }`}
                            onClick={() => toggleAlert(idx)}
                            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && toggleAlert(idx)}
                            tabIndex={0}
                            aria-expanded={isExpanded}
                        >
                            <div className="p-4 flex items-start justify-between">
                                 <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-full ${
                                        alert.level === AlertLevel.RED ? 'bg-red-100' :
                                        alert.level === AlertLevel.YELLOW ? 'bg-amber-100' : 'bg-green-100'
                                    }`}>
                                        {alert.level === AlertLevel.RED && <AlertTriangle className="w-5 h-5 text-red-600" aria-hidden="true" />}
                                        {alert.level === AlertLevel.YELLOW && <Info className="w-5 h-5 text-amber-600" aria-hidden="true" />}
                                        {alert.level === AlertLevel.GREEN && <CheckCircle className="w-5 h-5 text-green-600" aria-hidden="true" />}
                                    </div>
                                    <div>
                                        <h4 className={`font-black tracking-tight text-sm ${
                                            alert.level === AlertLevel.RED ? 'text-red-900' :
                                            alert.level === AlertLevel.YELLOW ? 'text-amber-900' : 'text-green-900'
                                        }`}>
                                            {alert.title}
                                        </h4>
                                        {!isExpanded && (
                                            <p className="text-xs text-slate-500 truncate max-w-[200px] mt-0.5">
                                                {alert.reason}
                                            </p>
                                        )}
                                    </div>
                                 </div>

                                 <div className="flex items-center gap-2">
                                     {analysis.isVerifiedByPharmacist && (
                                        <CheckCircle className="w-4 h-4 text-green-600" aria-label="검토 완료됨" />
                                     )}
                                     {isExpanded ? (
                                         <ChevronUp className="w-5 h-5 text-slate-400" />
                                     ) : (
                                         <ChevronDown className="w-5 h-5 text-slate-400 group-hover:text-slate-600" />
                                     )}
                                 </div>
                            </div>

                            {isExpanded && (
                                <div
                                    className="px-4 pb-4 animate-in slide-in-from-top-1 fade-in duration-200"
                                    onClick={(e) => e.stopPropagation()}
                                    onKeyDown={(e) => e.stopPropagation()}
                                >
                                    <div className="pt-3 border-t border-black/5 space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-[10px] font-black uppercase opacity-50 mb-1">Severity & Level</p>
                                                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold ${
                                                    alert.level === AlertLevel.RED ? 'bg-red-100 text-red-800' :
                                                    alert.level === AlertLevel.YELLOW ? 'bg-amber-100 text-amber-800' :
                                                    'bg-green-100 text-green-800'
                                                }`}>
                                                    <Activity className="w-3.5 h-3.5" />
                                                    {alert.level} PRIORITY
                                                </div>
                                            </div>
                                            {alert.drugsInvolved && alert.drugsInvolved.length > 0 && (
                                                <div>
                                                    <p className="text-[10px] font-black uppercase opacity-50 mb-1">Related Drugs</p>
                                                    <div className="flex flex-wrap gap-1">
                                                        {alert.drugsInvolved.map((drug, i) => (
                                                            <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-bold text-slate-600">
                                                                <Pill className="w-2.5 h-2.5" /> {drug}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div>
                                            <p className="text-[10px] font-black uppercase opacity-50 mb-1">Mechanism / Reason</p>
                                            <div className="bg-white/50 p-3 rounded-lg border border-black/5">
                                                <p className="text-sm text-slate-800 leading-relaxed font-medium">
                                                    {alert.reason}
                                                </p>
                                            </div>
                                        </div>

                                        <div>
                                            <p className="text-[10px] font-black uppercase opacity-50 mb-1">Clinical Recommendation</p>
                                            <div className={`text-sm font-black p-3 rounded-lg flex items-start gap-2 ${
                                                alert.level === AlertLevel.RED ? 'bg-red-100 text-red-900' :
                                                alert.level === AlertLevel.YELLOW ? 'bg-amber-100 text-amber-900' :
                                                'bg-green-100 text-green-900'
                                            }`} role="alert">
                                                <span className="shrink-0 bg-white/40 px-1.5 rounded text-[10px] mt-0.5">Action</span>
                                                <span>{alert.action}</span>
                                            </div>
                                        </div>

                                        {alert.reference && (
                                            <div>
                                                <p className="text-[10px] font-black uppercase opacity-50 mb-1">Reference / Citation</p>
                                                <a
                                                    href={alert.reference.startsWith('http') ? alert.reference : `https://scholar.google.com/scholar?q=${encodeURIComponent(alert.reference)}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    title="Opens in a new tab"
                                                    className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-100 rounded-lg hover:bg-slate-100 transition-colors group/ref"
                                                    aria-label={`Open reference: ${alert.reference}`}
                                                >
                                                    <ExternalLink className="w-4 h-4 text-slate-400 group-hover/ref:text-teal-600" />
                                                    <span className="text-xs font-medium text-slate-600 group-hover/ref:text-teal-700 truncate">{alert.reference}</span>
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )})
                    ) : (
                        <div className="py-8 text-center text-slate-400">
                            <p className="text-xs font-bold">검색 결과가 없습니다.</p>
                        </div>
                    )}
                </div>
            </section>
        )}

        <section className="mt-6" aria-labelledby="medications-heading">
            <h3 id="medications-heading" className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center gap-2">
                <CheckCircle className="w-3 h-3 text-teal-500" aria-hidden="true" /> 인식된 약물 (가명화)
            </h3>
            <div className="grid grid-cols-1 gap-2" role="list">
                {(analysis.medications && analysis.medications.length > 0) ? (
                    analysis.medications.map((med, idx) => (
                    <div key={idx} role="listitem" className="p-3 bg-white border border-slate-100 rounded-xl flex items-center justify-between hover:border-teal-200 transition-colors shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-lg" aria-hidden="true">💊</div>
                            <div>
                                <p className="font-bold text-slate-800 text-sm leading-none mb-1">{med.name}</p>
                                <p className="text-[10px] text-slate-500 font-medium">{med.ingredient}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="inline-block px-2 py-1 bg-teal-50 text-teal-700 text-[10px] rounded-md font-black">
                                {med.frequency}
                            </span>
                        </div>
                    </div>
                ))
                ) : (
                    <div className="py-8 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                        <p className="text-xs font-bold">인식된 약물이 없습니다.</p>
                    </div>
                )}
            </div>
        </section>
      </div>

      <footer className="p-3 bg-slate-900 text-[9px] text-slate-500 text-center font-bold">
         AI 분석은 임상 보조 수단이며, 법적 책임은 최종 승인한 약사에게 있습니다. (의료법 제27조 준수)
      </footer>
    </article>
  );
};

export default ClinicalDashboard;
