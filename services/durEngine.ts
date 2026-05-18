
export interface CompactRule {
  drugA: string;
  drugB: string;
  severity: 'CRITICAL' | 'WARNING';
  reason: string;
  reference?: string;
}

const COMPACT_DUR_RULES_DB: CompactRule[] = [
  {
    drugA: "Clopidogrel",
    drugB: "Omeprazole",
    severity: "WARNING",
    reason: "Omeprazole이 Clopidogrel의 대사를 방해하여 항혈전 효과를 감소시킵니다. (CYP2C19 상호작용)",
    reference: "FDA Drug Safety Communication (2009)"
  },
  {
    drugA: "Warfarin",
    drugB: "NSAIDs",
    severity: "CRITICAL",
    reason: "위장관 출혈 위험이 급격히 증가합니다. 노인 환자에게 특히 치명적입니다.",
    reference: "American College of Cardiology Guidelines"
  },
  {
      drugA: "Aspirin",
      drugB: "Ibuprofen",
      severity: "WARNING",
      reason: "Ibuprofen이 Aspirin의 심혈관 보호 효과(항혈소판 작용)를 저해할 수 있습니다.",
      reference: "FDA Recommendation on Concomitant Use (2006)"
  },
  {
      drugA: "Diazepam",
      drugB: "", 
      severity: "CRITICAL",
      reason: "[Beers Criteria] 장기 작용 벤조디아제핀은 노인에게 낙상, 인지 기능 저하 위험을 높이므로 사용을 피해야 합니다.",
      reference: "AGS Beers Criteria® 2023"
  },
  {
      drugA: "Warfarin",
      drugB: "Ginseng",
      severity: "WARNING",
      reason: "[건기식 상호작용] 인삼/홍삼은 와파린의 효과를 감소시켜 혈전 위험을 높일 수 있습니다.",
      reference: "Natural Medicines Comprehensive Database"
  }
];

export const checkLocalDUR = (medications: string[]): CompactRule[] => {
  const detectedRules: CompactRule[] = [];
  const normalizedMeds = medications.map(m => m.toLowerCase());
  
  for (const rule of COMPACT_DUR_RULES_DB) {
    // Drug A 체크
    const hasA = normalizedMeds.some(m => m.includes(rule.drugA.toLowerCase()));
    
    // Drug B 체크 (빈 문자열이면 단일 약물 주의)
    const hasB = rule.drugB === "" || normalizedMeds.some(m => m.includes(rule.drugB.toLowerCase()));
    
    if (hasA && hasB) {
      detectedRules.push(rule);
    }
  }
  
  return detectedRules;
};
