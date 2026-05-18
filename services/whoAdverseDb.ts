
export interface WhoAdverseEntry {
  drugName: string;      // 약물명
  symptom: string;       // 이상반응 증상
  mechanism: string;     // 발생 기전
  frequency: string;     // 빈도 (Common, Rare 등)
  causalityEvidence: 'Certain' | 'Probable' | 'Possible' | 'Unlikely'; // WHO 인과성 평가 등급
  description: string;   // 평가 상세 내용
  reference?: string;    // 참고 문헌 URL
}

// 사용자가 업데이트하는 DB라고 가정 (Mock Data)
export const WHO_ADVERSE_DB: WhoAdverseEntry[] = [
  {
    drugName: "Amlodipine",
    symptom: "부종",
    mechanism: "말초 혈관 확장에 따른 체액 저류 (Vasodilation)",
    frequency: "Common (>10%)",
    causalityEvidence: "Probable",
    description: "투여 중단 시 증상이 호전되며(De-challenge Positive), 약물 기전상 명확한 인과관계가 있음.",
    reference: "https://www.vigiaccess.org/"
  },
  {
    drugName: "Naproxen",
    symptom: "속쓰림",
    mechanism: "COX-1 억제에 따른 위 점막 보호 물질 감소",
    frequency: "Common",
    causalityEvidence: "Certain",
    description: "NSAIDs 계열의 전형적인 부작용으로, 재투여 시(Re-challenge) 증상 재발 가능성이 매우 높음.",
    reference: "https://www.drugs.com/sfx/naproxen-side-effects.html"
  },
  {
    drugName: "Furosemide",
    symptom: "어지러움",
    mechanism: "이뇨 작용에 따른 혈액량 감소 및 저혈압",
    frequency: "Occasional",
    causalityEvidence: "Probable",
    description: "기립성 저혈압과 연관성이 높으며, 용량 의존적으로 발생함.",
    reference: "https://www.mayoclinic.org/drugs-supplements/furosemide-oral-route/side-effects/drg-20071281"
  },
  {
    drugName: "Atorvastatin",
    symptom: "근육통",
    mechanism: "스타틴에 의한 미토콘드리아 기능 저하 가능성",
    frequency: "Rare",
    causalityEvidence: "Possible",
    description: "다른 원인(운동 등)을 배제한 후 평가 필요. CPK 수치 확인이 권장됨.",
    reference: "https://www.fda.gov/drugs/drug-safety-and-availability/fda-drug-safety-communication-important-safety-label-changes-cholesterol-lowering-statin-drugs"
  }
];

/**
 * 환자의 약물 목록과 호소 증상을 기반으로 DB를 검색합니다.
 */
export const searchWhoDb = (medications: string[], symptomQuery: string): WhoAdverseEntry[] => {
  // 약물명이나 증상 키워드가 포함된 DB 항목 추출
  return WHO_ADVERSE_DB.filter(entry => {
    const medMatch = medications.some(m => m.toLowerCase().includes(entry.drugName.toLowerCase()));
    // 증상 쿼리가 없으면 해당 약물의 모든 부작용 반환, 있으면 해당 증상만 필터링
    const symptomMatch = symptomQuery 
      ? entry.symptom.includes(symptomQuery) || symptomQuery.includes(entry.symptom)
      : true;
    
    return medMatch && symptomMatch;
  });
};
