
import React, { useState, useEffect } from 'react';
import { Patient } from '../types';
import { User, AlertCircle, FileText, Edit2, Save, X, Stethoscope, ScanLine } from 'lucide-react';

interface PatientProfileProps {
  patient: Patient;
  onUpdate: (updatedPatient: Patient) => void;
}

const PatientProfile: React.FC<PatientProfileProps> = ({ patient, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Patient>(patient);
  const [conditionsInput, setConditionsInput] = useState(patient.conditions.join(', '));
  const [showHistory, setShowHistory] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [historyData, setHistoryData] = useState<any[]>([]);

  const handleFetchHistory = async () => {
    if (showHistory) {
      setShowHistory(false);
      return;
    }
    
    setIsLoadingHistory(true);
    setShowHistory(true);
    try {
      const { fetchMyHealthwayHistory } = await import('../services/myHealthwayService');
      const data = await fetchMyHealthwayHistory(patient.id);
      setHistoryData(data);
    } catch (error) {
      console.error("데이터를 불러오는데 실패했습니다.", error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // Sync state when props change
  useEffect(() => {
    setFormData(patient);
    setConditionsInput(patient.conditions.join(', '));
  }, [patient]);

  const handleSave = () => {
    const updatedConditions = conditionsInput.split(',').map(c => c.trim()).filter(c => c !== '');
    const updatedPatient = {
        ...formData,
        conditions: updatedConditions,
        age: Number(formData.age), // Ensure number
        eGFR: formData.eGFR ? Number(formData.eGFR) : undefined
    };
    onUpdate(updatedPatient);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData(patient);
    setConditionsInput(patient.conditions.join(', '));
    setIsEditing(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 h-full relative group flex flex-col">
      {!isEditing && (
        <button 
            onClick={() => setIsEditing(true)}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
            aria-label="환자 정보 수정"
        >
            <Edit2 className="w-4 h-4" />
        </button>
      )}

      {isEditing ? (
        // EDIT MODE
        <div className="space-y-4 overflow-y-auto pr-1">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
                <h3 className="text-sm font-black text-slate-900">환자 정보 수정</h3>
                <div className="flex gap-2">
                     <button onClick={handleCancel} className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-md"><X className="w-4 h-4"/></button>
                     <button onClick={handleSave} className="p-1.5 text-teal-600 hover:bg-teal-50 rounded-md"><Save className="w-4 h-4"/></button>
                </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                    <label className="text-[10px] font-bold text-slate-400 block mb-1">성명</label>
                    <input 
                        type="text" 
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        className="w-full px-2 py-1.5 text-sm font-bold border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                    />
                </div>
                <div>
                    <label className="text-[10px] font-bold text-slate-400 block mb-1">나이</label>
                    <input 
                        type="number" 
                        value={formData.age}
                        onChange={e => setFormData({...formData, age: Number(e.target.value)})}
                        className="w-full px-2 py-1.5 text-sm font-bold border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                    />
                </div>
                <div>
                     <label className="text-[10px] font-bold text-slate-400 block mb-1">성별</label>
                     <select 
                        value={formData.gender}
                        onChange={e => setFormData({...formData, gender: e.target.value as 'M' | 'F'})}
                        className="w-full px-2 py-1.5 text-sm font-bold border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none bg-white"
                     >
                         <option value="M">남성 (M)</option>
                         <option value="F">여성 (F)</option>
                     </select>
                </div>
                <div className="col-span-2">
                    <label className="text-[10px] font-bold text-slate-400 block mb-1">생년월일 (YYYY.MM.DD)</label>
                    <input 
                        type="text" 
                        value={formData.birthDate}
                        onChange={e => setFormData({...formData, birthDate: e.target.value})}
                        className="w-full px-2 py-1.5 text-sm font-bold border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                    />
                </div>
                <div>
                    <label className="text-[10px] font-bold text-slate-400 block mb-1">방문 유형</label>
                     <select 
                        value={formData.visitType}
                        onChange={e => setFormData({...formData, visitType: e.target.value as 'Home' | 'Pharmacy'})}
                        className="w-full px-2 py-1.5 text-sm font-bold border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none bg-white"
                     >
                         <option value="Pharmacy">약국 방문</option>
                         <option value="Home">방문 약료</option>
                     </select>
                </div>
                <div>
                    <label className="text-[10px] font-bold text-slate-400 block mb-1">eGFR</label>
                    <input 
                        type="number" 
                        value={formData.eGFR || ''}
                        onChange={e => setFormData({...formData, eGFR: Number(e.target.value)})}
                        placeholder="Optional"
                        className="w-full px-2 py-1.5 text-sm font-bold border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                    />
                </div>
                <div className="col-span-2">
                    <label className="text-[10px] font-bold text-slate-400 block mb-1">기저질환 (직접 입력)</label>
                    <textarea 
                        value={conditionsInput}
                        onChange={e => setConditionsInput(e.target.value)}
                        placeholder="예: 고혈압, 당뇨, 관절염 (쉼표로 구분)"
                        className="w-full px-2 py-1.5 text-sm font-bold border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none resize-none h-20"
                    />
                </div>
            </div>
            <button 
                onClick={handleSave}
                className="w-full py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-black transition-colors"
            >
                정보 수정 완료
            </button>
        </div>
      ) : (
        // VIEW MODE
        <>
            <div className="flex items-center gap-3 mb-6 shrink-0">
                <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center border-2 border-slate-200">
                <User className="w-7 h-7 text-slate-400" />
                </div>
                <div>
                <h2 className="text-lg font-bold text-slate-900">{patient.name} <span className="text-slate-400 font-normal text-sm">({patient.gender}/{patient.age})</span></h2>
                <p className="text-xs text-slate-500">{patient.birthDate} | {patient.visitType} Visit</p>
                </div>
            </div>

            <div className="space-y-5 overflow-y-auto flex-1 pr-1 hide-scrollbar">
                {/* 1. 기저질환 (Manual Input) */}
                <div>
                    <label className="text-xs font-bold text-slate-400 uppercase mb-2 flex items-center gap-1">
                        <Stethoscope className="w-3 h-3" /> 기저질환 (History)
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {patient.conditions.length > 0 ? patient.conditions.map((c, i) => (
                            <span key={i} className="px-2.5 py-1 bg-red-50 text-red-700 text-xs font-semibold rounded-md border border-red-100">
                                {c}
                            </span>
                        )) : (
                            <span className="text-xs text-slate-400 italic">등록된 기저질환 없음</span>
                        )}
                        {patient.eGFR && patient.eGFR < 60 && (
                            <span className="px-2.5 py-1 bg-amber-50 text-amber-700 text-xs font-semibold rounded-md border border-amber-100 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" /> eGFR {patient.eGFR} (Low)
                            </span>
                        )}
                    </div>
                </div>

                {/* 2. DUR (약물안전사용서비스) 실시간 연동 */}
                <div className="pt-4 border-t border-slate-100">
                    <label className="text-xs font-bold text-slate-400 uppercase mb-2 flex items-center justify-between">
                        <div className="flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> 실시간 DUR 점검
                        </div>
                        <span className="text-[10px] text-teal-600 font-bold px-1.5 py-0.5 bg-teal-50 border border-teal-100 rounded">심평원 연동망</span>
                    </label>
                    <div className="flex items-center justify-between text-xs bg-white p-2.5 rounded-lg border border-slate-200">
                        <div className="flex flex-col">
                            <span className="text-slate-700 font-bold">병용금기 / 중복처방 검토</span>
                            <span className="text-[10px] text-slate-400">현재 조제 대상 약물 기준 단기 검토</span>
                        </div>
                        <span className="text-teal-600 font-bold flex items-center gap-1 bg-teal-50 px-2 py-1 rounded">
                            <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse"></span> Active
                        </span>
                    </div>
                </div>

                {/* 3. 건강정보 고속도로 (의료 마이데이터) */}
                <div className="pt-4 border-t border-slate-100">
                    <label className="text-xs font-bold text-slate-400 uppercase mb-2 flex items-center justify-between">
                        <div className="flex items-center gap-1">
                            <FileText className="w-3 h-3" /> 과거 진료/투약 이력
                        </div>
                        <span className="text-[10px] text-indigo-500 font-bold px-1.5 py-0.5 bg-indigo-50 border border-indigo-100 rounded">의료 마이데이터</span>
                    </label>
                    <p className="text-[10px] text-slate-500 mb-2 leading-tight">
                        타 병원 및 약국에서의 1년 이상 장기 진료/투약 내역과 상세 상병 궤적을 조회합니다.
                    </p>
                    <button 
                         onClick={handleFetchHistory}
                         disabled={isLoadingHistory}
                         className="w-full py-2.5 px-3 bg-white border border-indigo-200 text-indigo-700 rounded-lg text-sm font-bold flex items-center justify-center gap-2 hover:bg-indigo-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                    >
                         {isLoadingHistory ? (
                             <span className="flex items-center gap-2 text-indigo-600">
                                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-700"></span> 마이데이터 동의망 접속 중...
                             </span>
                         ) : (
                             <><ScanLine className="w-4 h-4" /> {showHistory ? '마이데이터 이력 닫기' : '건강정보 고속도로 조회하기'}</>
                         )}
                    </button>
                    
                    {showHistory && (
                        <div className="mt-3 space-y-2">
                            {historyData.map((history, idx) => (
                                <div key={idx} className="bg-white border border-slate-200 p-2.5 rounded-lg transition-all animate-in fade-in slide-in-from-top-1 shadow-sm">
                                    <div className="flex justify-between items-center mb-1.5 border-b border-slate-50 pb-1.5">
                                        <span className="text-xs font-bold text-slate-800">{history.clinicName}</span>
                                        <span className="text-[10px] font-mono text-slate-500">{history.date}</span>
                                    </div>
                                    <div className="text-xs text-slate-700 mb-2 flex items-start gap-1">
                                        <span className="text-[10px] bg-slate-100 text-slate-500 px-1 font-bold rounded">상병</span> 
                                        {history.diagnosis}
                                    </div>
                                    <div className="flex flex-wrap gap-1">
                                        {history.prescriptions.map((px: string, pIdx: number) => (
                                            <span key={pIdx} className="px-1.5 py-0.5 bg-indigo-50 border border-indigo-100 text-indigo-700 font-medium rounded text-[10px]">{px}</span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
      )}
    </div>
  );
};

export default PatientProfile;
