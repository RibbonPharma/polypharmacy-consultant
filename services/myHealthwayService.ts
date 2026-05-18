export interface HealthHistory {
  date: string;
  clinicName: string;
  diagnosis: string;
  prescriptions: string[];
}

// 건강정보 고속도로 (의료 마이데이터) 모의 연동 서비스
// 실제 서비스 도입 시 한국보건의료정보원(PHR) API로 교체 필요
export const fetchMyHealthwayHistory = async (patientId: string): Promise<HealthHistory[]> => {
  // 실제 API 호출 대신 네트워크 지연을 시뮬레이션 (1.5초)
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          clinicName: '연세내과의원',
          date: '2026.04.15',
          diagnosis: '본태성 (원발성) 고혈압',
          prescriptions: ['암로디핀베실산염정5mg', '로사르탄칼륨정50mg']
        },
        {
          clinicName: '튼튼정형외과',
          date: '2026.03.02',
          diagnosis: '무릎 관절증',
          prescriptions: ['세레콕시브캡슐200mg', '에페리손염산염정50mg']
        }
      ]);
    }, 1500);
  });
};
