import React, { useState } from 'react';
import { Search, UserPlus, FileDown, ShieldCheck, Trash2, CheckCircle2 } from 'lucide-react';
import { Patient } from '../types';

interface PatientManagementProps {
  onSelectPatient: (patient: Patient) => void;
}

// 초기 환자 데이터 (비어있는 상태로 시작)
const MOCK_PATIENTS: Patient[] = [];

const PatientManagement: React.FC<PatientManagementProps> = ({ onSelectPatient }) => {
  const [patients, setPatients] = useState<Patient[]>(MOCK_PATIENTS);
  const [searchTerm, setSearchTerm] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  
  // 신규 등록 폼 상태
  const [newName, setNewName] = useState('');
  const [newBirthDate, setNewBirthDate] = useState('');
  const [newGender, setNewGender] = useState<'M'|'F'>('M');
  const [newPhone, setNewPhone] = useState('');
  const [consentGiven, setConsentGiven] = useState(false);

  const filteredPatients = patients.filter(p => 
    p.name.includes(searchTerm) || p.birthDate.includes(searchTerm)
  );

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!consentGiven) {
      alert('개인정보 수집 및 이용, 민감정보 처리 동의가 필요합니다.');
      return;
    }
    if (!newName || !newBirthDate || !newPhone) {
      alert('필수 정보를 모두 입력해주세요.');
      return;
    }

    const newPatient: Patient = {
      id: `p-${Date.now()}`,
      name: newName,
      birthDate: newBirthDate,
      age: new Date().getFullYear() - parseInt(newBirthDate.substring(0, 4)),
      gender: newGender,
      conditions: [],
      diagnosisCodes: [],
      visitType: 'Pharmacy'
    };

    setPatients([newPatient, ...patients]);
    setIsRegistering(false);
    
    // 폼 초기화
    setNewName('');
    setNewBirthDate('');
    setNewPhone('');
    setConsentGiven(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('개인정보보호법 제36조에 따라 해당 환자의 모든 정보가 파기됩니다. 계속하시겠습니까?')) {
      alert('환자 정보가 삭제되었습니다. (감사 로그 보존: 3년)');
      setPatients(patients.filter(p => p.id !== id));
    }
  };

  const handleSyncBilling = () => {
    alert('청구 프로그램(PM2000, PharmIT3000 등)과 연동하여 최근 환자 목록과 처방 내역을 가져옵니다. (Mock)');
  };

  return (
    <div className="p-6 h-full flex flex-col gap-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">환자 관리</h2>
          <p className="text-sm text-slate-500 mt-1">상담을 진행할 환자를 검색하거나 새로 등록하세요.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleSyncBilling}
            className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-lg font-bold hover:bg-indigo-100 transition-colors"
          >
            <FileDown className="w-4 h-4" />
            청구 프로그램 연동
          </button>
          <button 
            onClick={() => setIsRegistering(!isRegistering)}
            className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg font-bold hover:bg-slate-800 transition-colors"
          >
            {isRegistering ? '목록으로 돌아가기' : <><UserPlus className="w-4 h-4" /> 신규 환자 등록</>}
          </button>
        </div>
      </div>

      {isRegistering ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 max-w-2xl mx-auto w-full">
          <h3 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-3">신규 환자 정보 입력</h3>
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">이름</label>
                <input type="text" value={newName} onChange={e => setNewName(e.target.value)} className="w-full border border-slate-200 rounded p-2 text-sm" placeholder="홍길동" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">생년월일 (YYYY.MM.DD)</label>
                <input type="text" value={newBirthDate} onChange={e => setNewBirthDate(e.target.value)} className="w-full border border-slate-200 rounded p-2 text-sm" placeholder="1950.01.01" />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">연락처</label>
                <input type="text" value={newPhone} onChange={e => setNewPhone(e.target.value)} className="w-full border border-slate-200 rounded p-2 text-sm" placeholder="***-****-****" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">성별</label>
                <select value={newGender} onChange={e => setNewGender(e.target.value as 'M'|'F')} className="w-full border border-slate-200 rounded p-2 text-sm">
                  <option value="M">남성</option>
                  <option value="F">여성</option>
                </select>
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-slate-100">
               <label className="flex items-start gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer">
                  <input type="checkbox" checked={consentGiven} onChange={e => setConsentGiven(e.target.checked)} className="mt-1" />
                  <div>
                    <span className="text-sm font-bold text-slate-700 flex items-center gap-1"><ShieldCheck className="w-4 h-4 text-teal-600"/> (필수) 개인정보 및 민감정보 처리 동의</span>
                    <p className="text-xs text-slate-500 mt-1">상담을 위해 환자의 개인정보(이름, 생년월일, 연락처) 및 민감정보(투약이력, 상병정보)를 수집, 이용, 제공하는 것에 동의합니다.</p>
                  </div>
               </label>
            </div>

            <div className="pt-4 flex justify-end">
              <button type="submit" className="bg-teal-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-teal-700 transition-colors">
                저장 및 관리 시작
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col flex-1 overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex gap-4 items-center bg-slate-50/50">
             <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="이름, 생년월일, 연락처로 검색 (2글자 이상)"
                  className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
             </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredPatients.map(p => (
                  <div key={p.id} className="border border-slate-200 rounded-xl p-4 hover:border-teal-400 hover:shadow-md transition-all group bg-white cursor-pointer" onClick={() => onSelectPatient(p)}>
                     <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2">
                           <h3 className="font-bold text-lg text-slate-800">{p.name}</h3>
                           <span className="text-xs font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{p.gender === 'M' ? '남' : '여'}, {p.age}세</span>
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); handleDelete(p.id); }} className="text-slate-300 hover:text-red-500 transition-colors p-1" title="환자 정보 삭제">
                          <Trash2 className="w-4 h-4" />
                        </button>
                     </div>
                     <div className="space-y-1 text-sm text-slate-600 mb-4">
                        <p><span className="text-slate-400 w-16 inline-block">생년월일</span> {p.birthDate}</p>
                        <p className="truncate"><span className="text-slate-400 w-16 inline-block">기저질환</span> {p.conditions.length > 0 ? p.conditions.join(', ') : '없음'}</p>
                     </div>
                     <div className="border-t border-slate-100 pt-3 flex justify-between items-center text-xs">
                        <span className="text-slate-400">최근 상담: 2026.04.15</span>
                        <div className="flex items-center gap-1 text-teal-600 font-bold group-hover:underline">
                           상담 시작하기
                        </div>
                     </div>
                  </div>
                ))}
                {filteredPatients.length === 0 && (
                  <div className="col-span-full py-10 text-center text-slate-400">
                    검색 결과가 없습니다.
                  </div>
                )}
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientManagement;
