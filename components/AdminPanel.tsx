
import React, { useState } from 'react';
import { ShieldCheck, ArrowLeft, CheckCircle, XCircle, Eye, X } from 'lucide-react';
import { Pharmacist } from '../types';

interface AdminPanelProps {
  onBack: () => void;
  users: Pharmacist[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onBack, users, onApprove, onReject }) => {
  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 animate-in fade-in duration-500" role="main">
      <div className="bg-slate-900 text-white p-8">
        <div className="flex items-center justify-between max-w-6xl mx-auto w-full">
            <div className="flex items-center gap-4">
                <button
                  onClick={onBack}
                  className="p-3 hover:bg-white/10 rounded-2xl transition-colors focus:ring-2 focus:ring-white outline-none"
                  aria-label="대시보드로 돌아가기"
                >
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <div>
                    <h2 className="text-2xl font-black tracking-tighter flex items-center gap-2">
                        System Control
                    </h2>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Manual Approval Console</p>
                </div>
            </div>
            <div className="bg-teal-500/20 px-4 py-2 rounded-xl border border-teal-500/30" role="status">
                <span className="text-[10px] font-black text-teal-400 block uppercase mb-1">Gatekeeper Mode</span>
                <span className="text-xs font-bold text-white">SYSTEM OPERATIONAL</span>
            </div>
        </div>
      </div>

      <div className="flex-1 max-w-6xl mx-auto w-full p-6 overflow-hidden">
        <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-200 overflow-hidden flex flex-col h-full">
            <UserManager users={users} onApprove={onApprove} onReject={onReject} />
        </div>
      </div>
    </div>
  );
};

interface UserManagerProps {
    users: Pharmacist[];
    onApprove: (id: string) => void;
    onReject: (id: string) => void;
}

const UserManager: React.FC<UserManagerProps> = ({ users, onApprove, onReject }) => {
    // Filter only PENDING users
    const pendingUsers = (users || []).filter(u => u.status === 'PENDING');
    const [viewingImage, setViewingImage] = useState<string | null>(null);

    return (
        <div className="p-8 flex flex-col h-full relative">
            <div className="mb-10 flex items-center justify-between">
                <div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">가입 승인 대기 목록</h3>
                    <p className="text-sm font-bold text-slate-400">자동 승인 기준(100점) 미달 건입니다. 면허증 원본을 확인해주세요.</p>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-2 hide-scrollbar" role="list">
                {pendingUsers.map((u) => (
                    <div key={u.id} role="listitem" className="p-6 bg-slate-50 border border-slate-100 rounded-[2rem] hover:border-slate-300 transition-all">
                        <div className="flex items-start justify-between">
                            <div className="space-y-3 flex-1 mr-4">
                                <div className="flex items-center gap-3">
                                    <span className="text-lg font-black text-slate-900">{u.name}</span>
                                    <span className="px-2 py-0.5 bg-white border border-slate-200 text-slate-400 font-mono text-xs rounded-lg">ID: {u.id}</span>
                                    <span className="text-[10px] text-slate-400 font-bold">{u.requestDate}</span>
                                </div>
                                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-inner" aria-label="요청 상세 정보">
                                     <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                                         <div><span className="text-slate-400 font-bold">면허번호:</span> {u.licenseNumber}</div>
                                         {/* Note: Birth date is handled in verification logic but not stored in Pharmacist type currently, focusing on License Image */}
                                     </div>
                                     <button 
                                        onClick={() => setViewingImage(u.licenseImage || null)}
                                        className="flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-600 font-bold text-xs transition-colors w-full justify-center"
                                     >
                                         <Eye className="w-3 h-3" /> 제출된 면허증 이미지 보기
                                     </button>
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <button 
                                    onClick={() => onApprove(u.id)}
                                    className="p-3 bg-teal-600 text-white rounded-2xl hover:bg-teal-700 transition-all shadow-lg hover:shadow-teal-500/20 focus:ring-2 focus:ring-teal-400 outline-none flex items-center justify-center gap-2"
                                    aria-label={`${u.name} 약사 승인`}
                                >
                                    <CheckCircle className="w-5 h-5" />
                                    <span className="text-xs font-bold">승인</span>
                                </button>
                                <button 
                                    onClick={() => onReject(u.id)}
                                    className="p-3 bg-white text-slate-400 border border-slate-200 rounded-2xl hover:text-red-500 hover:border-red-200 transition-all focus:ring-2 focus:ring-red-400 outline-none flex items-center justify-center gap-2"
                                    aria-label={`${u.name} 약사 가입 거절`}
                                >
                                    <XCircle className="w-5 h-5" />
                                    <span className="text-xs font-bold">거절</span>
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
                {pendingUsers.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-slate-300 py-20" role="status">
                        <CheckCircle className="w-16 h-16 mb-4 opacity-20" aria-hidden="true" />
                        <p className="font-black">승인 대기 중인 요청이 없습니다.</p>
                    </div>
                )}
            </div>

            {/* Image Viewer Modal */}
            {viewingImage && (
                <div className="absolute inset-0 z-50 bg-black/80 rounded-[2.5rem] flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="relative max-w-full max-h-full">
                        <button 
                            onClick={() => setViewingImage(null)}
                            className="absolute -top-10 right-0 text-white hover:text-slate-200"
                        >
                            <X className="w-6 h-6" />
                        </button>
                        <img src={viewingImage} alt="Submitted License" className="max-w-full max-h-[600px] rounded-lg border-4 border-white shadow-2xl" />
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPanel;
