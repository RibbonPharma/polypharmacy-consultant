
import React, { useState } from 'react';
import Header from './components/Header';
import PatientManagement from './components/PatientManagement';
import PatientProfile from './components/PatientProfile';
import DrugScanner from './components/DrugScanner';
import ClinicalDashboard from './components/ClinicalDashboard';
import SmartOutput from './components/SmartOutput';
import ClinicalAssistant from './components/ClinicalAssistant';
import AdminPanel from './components/AdminPanel';
import LoginScreen from './components/LoginScreen';
import { Pharmacist, Patient, AnalysisResult, ViewMode, UserRole, UserStatus } from './types';
import { INITIAL_USERS, DEMO_PHARMACIST } from './mockData';

const App: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.AUTH);
  const [pharmacist, setPharmacist] = useState<Pharmacist | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  
  // Patient State (Editable)
  const [patient, setPatient] = useState<Patient | null>(null);
  
  // Simulated Database State
  const [userDB, setUserDB] = useState<Pharmacist[]>(INITIAL_USERS);

  const handleLogout = () => {
    setAnalysisResult(null);
    setPatient(null);
    setPharmacist(null);
    setViewMode(ViewMode.AUTH);
  };

  const toggleAdminPanel = () => {
    setViewMode(prev => prev === ViewMode.ADMIN_PANEL ? ViewMode.PATIENT_LIST : ViewMode.ADMIN_PANEL);
  };

  const handleSelectPatient = (p: Patient) => {
    setPatient(p);
    setViewMode(ViewMode.DASHBOARD);
  };

  // Admin Actions
  const handleAdminApprove = (id: string) => {
      setUserDB(prev => prev.map(u => u.id === id ? { ...u, status: 'ACTIVE', isVerified: true } : u));
  };

  const handleAdminReject = (id: string) => {
      setUserDB(prev => prev.map(u => u.id === id ? { ...u, status: 'REJECTED', isVerified: false } : u));
  };

  // New handler for scan completion
  const handleScanComplete = (result: AnalysisResult) => {
    setAnalysisResult(result);

    setPatient(prev => {
        if (!prev) return null;
        const updated = { ...prev };

        // 1. 환자 기본 정보 업데이트 (스캔 결과에 명시된 경우만)
        if (result.extractedPatientInfo) {
            // Safety Check: Avoid setting name if AI returned a long reasoning string
            const safeName = result.extractedPatientInfo.name;
            if (safeName && safeName.length < 20) {
                updated.name = safeName;
            }

            if (result.extractedPatientInfo.age) updated.age = result.extractedPatientInfo.age;
            if (result.extractedPatientInfo.gender) updated.gender = result.extractedPatientInfo.gender;
            if (result.extractedPatientInfo.birthDate) updated.birthDate = result.extractedPatientInfo.birthDate;
        }

        // 2. 상병코드(Diagnoses) 업데이트 (스캔 결과에 명시된 경우만)
        // 기존 Manual Conditions는 건드리지 않고, DiagnosisCodes만 새로 덮어씁니다.
        if (result.diagnoses && result.diagnoses.length > 0) {
            updated.diagnosisCodes = result.diagnoses;
        }

        return updated;
    });
  };

  if (viewMode === ViewMode.AUTH) {
      return (
          <LoginScreen
              users={userDB}
              onLogin={(user) => {
                  setPharmacist(user);
                  setViewMode(ViewMode.PATIENT_LIST);
              }}
              onDemoLogin={() => {
                  setPharmacist(DEMO_PHARMACIST);
                  setViewMode(ViewMode.PATIENT_LIST);
              }}
          />
      );
  }

  if (viewMode === ViewMode.ADMIN_PANEL && pharmacist?.role === 'ADMIN') {
      return (
          <div className="min-h-screen flex flex-col">
              <Header 
                  pharmacistName={pharmacist.name} 
                  role={pharmacist.role}
                  onLogout={handleLogout} 
                  onToggleAdmin={toggleAdminPanel}
                  onGoToPatientList={() => setViewMode(ViewMode.PATIENT_LIST)}
              />
              <AdminPanel 
                  onBack={() => setViewMode(ViewMode.PATIENT_LIST)} 
                  users={userDB}
                  onApprove={handleAdminApprove}
                  onReject={handleAdminReject}
              />
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header 
        pharmacistName={pharmacist?.name || '약사'} 
        role={pharmacist?.role || 'USER'}
        onLogout={handleLogout} 
        onToggleAdmin={toggleAdminPanel}
        onGoToPatientList={() => {
            setPatient(null);
            setAnalysisResult(null);
            setViewMode(ViewMode.PATIENT_LIST);
        }}
      />
      
      <main className="flex-1 overflow-hidden h-[calc(100vh-64px)]">
        {viewMode === ViewMode.PATIENT_LIST ? (
            <PatientManagement onSelectPatient={handleSelectPatient} />
        ) : (
            <div className="p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
              <div className="lg:col-span-3 flex flex-col h-full overflow-hidden">
                <div className="flex-none">
                  {patient && <PatientProfile 
                    patient={patient} 
                    onUpdate={(p: Patient) => setPatient(p)}
                  />}
                </div>
                <div className="mt-4 flex-1 flex flex-col overflow-hidden">
                  {patient && <ClinicalAssistant 
                    patient={patient}
                    analysis={analysisResult}
                  />}
                  {patient && <DrugScanner 
                      onAnalysisComplete={handleScanComplete} 
                      patient={patient}
                  />}
                </div>
              </div>
              <div className="lg:col-span-5 h-full overflow-hidden">
                 <ClinicalDashboard analysis={analysisResult} />
              </div>
              <div className="lg:col-span-4 h-full overflow-hidden">
                 <SmartOutput analysis={analysisResult} />
              </div>
            </div>
        )}
      </main>
    </div>
  );
};

export default App;
