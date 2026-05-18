
import React from 'react';
import { Pill, LogOut, Settings, ShieldCheck, Users } from 'lucide-react';
import { UserRole } from '../types';

interface HeaderProps {
    pharmacistName: string;
    role: UserRole;
    onLogout: () => void;
    onToggleAdmin?: () => void;
    onGoToPatientList?: () => void;
}

const Header: React.FC<HeaderProps> = ({ pharmacistName, role, onLogout, onToggleAdmin, onGoToPatientList }) => {
  const isAdmin = role === 'ADMIN';

  return (
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
                title="환자 관리"
            >
                <Users className="w-5 h-5" />
                <span className="hidden lg:inline">환자 목록</span>
            </button>
        )}
        
        <div className="text-right hidden md:block">
           <p className="text-sm font-bold text-slate-800">{pharmacistName} {isAdmin ? '관리자님' : '약사님'}</p>
           <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{isAdmin ? 'System Control' : 'Clinical Practice'}</p>
        </div>
        
        {isAdmin && (
            <button 
                onClick={onToggleAdmin}
                className="p-2 hover:bg-indigo-50 text-indigo-600 rounded-xl transition-all flex items-center gap-2 font-bold text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                aria-label="관리자 패널 열기"
                title="관리자 콘솔"
            >
                <Settings className="w-5 h-5" />
                <span className="hidden lg:inline">Admin Panel</span>
            </button>
        )}
        
        <div className="h-6 w-[1px] bg-slate-200 mx-1" aria-hidden="true"></div>

        <button 
            onClick={onLogout} 
            className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-xl transition-colors flex items-center gap-1 focus:ring-2 focus:ring-red-500 outline-none"
            aria-label="로그아웃"
            title="로그아웃"
        >
            <LogOut className="w-5 h-5" />
        </button>
      </nav>
    </header>
  );
};

export default Header;
