// [통합 대상 — v2 목표]
// 건강정보 고속도로 (보건복지부·심평원 의료 마이데이터 인프라) 연동 서비스.
// 현재는 Mock 구현으로, 실 API 연동 시 한국보건의료정보원(PHR) Open API로 교체합니다.
// 참고: https://www.k-health.com / PHR API 사양 확정 후 이 파일을 교체하세요.
// 연동 전제 조건: ISMS-P 인증 취득, 개인정보보호법 마이데이터 동의 파이프라인 구축.

export interface HealthHistory {
  date: string;
  clinicName: string;
  diagnosis: string;
  prescriptions: string[];
}

export const fetchMyHealthwayHistory = async (_patientId: string): Promise<HealthHistory[]> => {
  // Mock: 실 API 연동 전까지 네트워크 지연을 시뮬레이션합니다 (1.5초).
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
