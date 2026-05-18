
import React, { useState, useEffect } from 'react';
import { Pill, LogOut, Settings, ShieldCheck, Users, KeyRound, X, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { UserRole } from '../types';
import { isApiKeyConfigured, saveApiKey } from '../services/geminiService';

interface HeaderProps {
    pharmacistName: string;
    role: UserRole;
    onLogout: () => void;
    onToggleAdmin?: () => void;
    onGoToPatientList?: () => void;
}

const Header: React.FC<HeaderProps> = ({ pharmacistName, role, onLogout, onToggleAdmin, onGoToPatientList }) => {
  const isAdmin = role === 'ADMIN';
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [keyInput, setKeyInput] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);
  const [keyOk, setKeyOk] = useState(isApiKeyConfigured());

  useEffect(() => {
    setKeyOk(isApiKeyConfigured());
  }, [showKeyModal]);

  const handleSave = () => {
    if (!keyInput.trim()) return;
    saveApiKey(keyInput);
    setSaved(true);
    setKeyOk(true);
    setTimeout(() => {
      setSaved(false);
      setShowKeyModal(false);
      setKeyInput('');
    }, 1200);
  };

  return (
    <>
      <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6 sticky top-0 z-50" role="banner">
        <div
          className={`flex items-center gap-2 ${onGoToPatientList ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
          onClick={onGoToPatientList}
          role="button"
          tabIndex={0}
          aria-label="메인 화면으로 (환자 목록)"
        >
          <div className="bg-teal-600 p-1.5 rounded-lg shadow-sm" aria-hidden="true">
            <Pill className="text-white w-6 h-6" />
          </div>
          <span className="text-xl font-black text-slate-900 tracking-tight">PharmGni</span>
          <div className="flex gap-1 items-center ml-2">
            <span className="text-[10px] font-black bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full uppercase">PRO</span>
            {isAdmin && (
              <span className="text-[10px] font-black bg-indigo-600 text-white px-2 py-0.5 rounded-full uppercase flex items-center gap-1">
                <ShieldCheck className="w-2.5 h-2.5" /> ADMIN
              </span>
            )}
          </div>
        </div>

        <nav className="flex items-center gap-4" aria-label="User menu">
          {onGoToPatientList && (
            <button
              onClick={onGoToPatientList}
              className="p-2 hover:bg-slate-100 text-slate-600 rounded-xl transition-all flex items-center gap-2 font-bold text-xs focus:ring-2 focus:ring-slate-500 outline-none"
              aria-label="환자 목록 보기"
            >
              <Users className="w-5 h-5" />
              <span className="hidden lg:inline">환자 목록</span>
            </button>
          )}

          {/* API 키 설정 버튼 */}
          <button
            onClick={() => setShowKeyModal(true)}
            className={`relative p-2 rounded-xl transition-all flex items-center gap-1.5 font-bold text-xs focus:ring-2 outline-none ${
              keyOk
                ? 'hover:bg-teal-50 text-teal-600 focus:ring-teal-400'
                : 'hover:bg-red-50 text-red-500 focus:ring-red-400'
            }`}
            aria-label="Gemini API 키 설정"
            title={keyOk ? 'API 키 설정됨' : 'API 키 미설정 — 클릭하여 입력'}
          >
            <KeyRound className="w-5 h-5" />
            {!keyOk && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-500 border-2 border-white" />
            )}
            <span className="hidden lg:inline">{keyOk ? 'API 키' : 'API 키 설정'}</span>
          </button>

          <div className="text-right hidden md:block">
            <p className="text-sm font-bold text-slate-800">{pharmacistName} {isAdmin ? '관리자님' : '약사님'}</p>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{isAdmin ? 'System Control' : 'Clinical Practice'}</p>
          </div>

          {isAdmin && (
            <button
              onClick={onToggleAdmin}
              className="p-2 hover:bg-indigo-50 text-indigo-600 rounded-xl transition-all flex items-center gap-2 font-bold text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
              aria-label="관리자 패널 열기"
            >
              <Settings className="w-5 h-5" />
              <span className="hidden lg:inline">Admin Panel</span>
            </button>
          )}

          <div className="h-6 w-[1px] bg-slate-200 mx-1" aria-hidden="true" />

          <button
            onClick={onLogout}
            className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-xl transition-colors flex items-center gap-1 focus:ring-2 focus:ring-red-500 outline-none"
            aria-label="로그아웃"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </nav>
      </header>

      {/* API 키 모달 */}
      {showKeyModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="API 키 설정">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900">Gemini API 키 설정</h3>
              </div>
              <button onClick={() => setShowKeyModal(false)} className="p-1 text-slate-400 hover:text-slate-700 rounded-lg" aria-label="닫기">
                <X className="w-5 h-5" />
              </button>
            </div>

            {keyOk && !saved && (
              <div className="mb-4 flex items-center gap-2 text-sm text-teal-700 bg-teal-50 border border-teal-200 rounded-lg px-3 py-2">
                <CheckCircle className="w-4 h-4 shrink-0" />
                API 키가 설정되어 있습니다. 변경하려면 새 키를 입력하세요.
              </div>
            )}

            <p className="text-xs text-slate-500 mb-3">
              <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" className="text-indigo-600 underline">Google AI Studio</a>에서 발급한 키를 입력하세요.
              세션 동안만 유지되며, 페이지를 닫으면 초기화됩니다.
            </p>

            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={keyInput}
                onChange={e => setKeyInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSave()}
                placeholder="AIza..."
                className="w-full pr-10 pl-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowKey(v => !v)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                aria-label={showKey ? '키 숨기기' : '키 보기'}
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <button
              onClick={handleSave}
              disabled={!keyInput.trim()}
              className={`mt-4 w-full py-2.5 rounded-lg font-bold text-sm transition-colors focus:ring-2 outline-none ${
                saved
                  ? 'bg-teal-600 text-white'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-40'
              }`}
            >
              {saved ? '✓ 저장 완료!' : '저장'}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
