import React, { useState } from 'react';
import { Shield, AlertTriangle } from 'lucide-react';
import { Pharmacist } from '../types';

interface LoginScreenProps {
  users: Pharmacist[];
  onLogin: (user: Pharmacist) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ users, onLogin }) => {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = users.find(u => u.id === userId && u.password === password);
    
    if (user) {
      if (user.status === 'ACTIVE') {
        onLogin(user);
      } else {
        setError('계정이 승인되지 않았거나 비활성화 상태입니다.');
      }
    } else {
      setError('아이디 또는 비밀번호가 잘못되었습니다.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="flex justify-center text-blue-600 mb-4">
          <Shield className="h-12 w-12" />
        </div>
        <h2 className="mt-2 text-3xl font-extrabold text-slate-900 tracking-tight">
          AI 임상 약사 보조 시스템
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          테스트 계정: admin/admin 또는 pharmacist_1/password123
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-slate-200">
          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label htmlFor="userId" className="block text-sm font-medium text-slate-700">
                아이디
              </label>
              <div className="mt-1">
                <input
                  id="userId"
                  name="userId"
                  type="text"
                  required
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                비밀번호
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            {error && (
              <div className="text-sm text-red-600 flex items-center gap-1">
                <AlertTriangle className="h-4 w-4" />
                {error}
              </div>
            )}

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                로그인
              </button>
            </div>
          </form>
        </div>
        
        {/* 법적 면책 조항 (Legal Disclaimer) */}
        <div className="mt-8 bg-amber-50 border border-amber-200 rounded-md p-4 text-sm text-amber-800 flex items-start gap-3 shadow-sm">
          <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold block mb-1">법적 면책 조항 (Disclaimer)</span>
            본 AI 서비스는 약사의 임상적 판단을 보조하는 도구이며, 최종 조제 및 복약지도의 책임은 담당 약사에게 있습니다. 의료 목적의 확정적 진단이나 권고가 아니므로 주의하여 사용하시기 바랍니다.
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default LoginScreen;
