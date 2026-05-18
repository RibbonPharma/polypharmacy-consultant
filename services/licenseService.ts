
import { Pharmacist, UserStatus } from "../types";

export interface LicenseVerifyResult {
  score: number;
  passed: boolean;
  logs: string[];
  maskedOcrText: string;
  extractedName?: string;
  extractedLicenseNo?: string;
}

export class LicenseVerifier {
  // 100점 이상 자동 승인 기준
  private readonly AUTO_APPROVAL_SCORE = 100;

  public maskSensitiveData(text: string): string {
    const rrnPattern = /(\d{6})[- ]?([1-4]\d{6})/g;
    let masked = text.replace(rrnPattern, '$1-*******');
    const phonePattern = /01[016789][- ]?(\d{3,4})[- ]?(\d{4})/g;
    masked = masked.replace(phonePattern, '010-****-****');
    return masked;
  }

  public calculateScore(ocrText: string, userName: string, userBirth: string): { score: number, logs: string[] } {
    let score = 0;
    const logs: string[] = [];
    
    // OCR 텍스트 정규화: 공백 및 줄바꿈 제거 (엄격한 비교를 위해)
    const cleanText = ocrText.replace(/\s/g, '').replace(/\n/g, '');
    const cleanName = userName.replace(/\s/g, '');

    // 1. 성명 일치 (+30)
    if (cleanText.includes(cleanName)) {
      score += 30;
      logs.push(`성명 일치 확인 (+30): ${userName}`);
    } else {
      logs.push(`성명 불일치 또는 미인식 (입력: ${userName})`);
    }

    // 2. 생년월일 일치 (+30) - 다중 포맷 지원
    // 입력값(YYYYMMDD)을 파싱하여 다양한 면허증 표기법과 대조
    let isBirthMatch = false;

    if (userBirth.length === 8) {
        const year = userBirth.substring(0, 4);       // 1990
        const shortYear = userBirth.substring(2, 4);  // 90
        const month = userBirth.substring(4, 6);      // 01
        const day = userBirth.substring(6, 8);        // 05
        
        const monthInt = parseInt(month, 10).toString(); // 1 (0 제거)
        const dayInt = parseInt(day, 10).toString();     // 5 (0 제거)

        // 체크할 패턴들 (cleanText는 공백이 없으므로 패턴도 공백 없이 생성)
        const patterns = [
            `${shortYear}${month}${day}`,           // 900105 (주민번호 앞자리 스타일)
            `${year}년${monthInt}월${dayInt}일`,    // 1990년1월5일 (한글 포맷, 0 생략)
            `${year}년${month}월${day}일`           // 1990년01월05일 (한글 포맷, 0 포함)
        ];

        // 디버깅을 위해 패턴 로깅 (실제 운영 시에는 제거 가능)
        // console.log("Checking Patterns:", patterns);

        // 하나라도 매칭되면 성공
        if (patterns.some(p => cleanText.includes(p))) {
            isBirthMatch = true;
        }
    }

    if (isBirthMatch) {
      score += 30;
      logs.push(`생년월일 일치 확인 (+30): ${userBirth}`);
    } else {
      logs.push(`생년월일 불일치 또는 미인식 (입력: ${userBirth})`);
    }

    // 3. 한약사 키워드 감지 (-100) -> 즉시 거절 사유
    if (cleanText.includes("한약사")) {
      score -= 100;
      logs.push("경고: '한약사' 키워드 감지 (-100)");
    }

    // 4. 약사 키워드 검증 (+50)
    const hasYaksa = cleanText.includes("약사");
    const hasHanYaksa = cleanText.includes("한약사");
    if (hasYaksa && !hasHanYaksa) {
      score += 50;
      logs.push("정식 '약사' 면허 키워드 검증 (+50)");
    }

    // 5. 발급 기관 확인 (+10)
    if (cleanText.includes("보건복지부") || cleanText.includes("장관")) {
      score += 10;
      logs.push("정부 기관 인영(보건복지부) 확인 (+10)");
    }

    return { score, logs };
  }
}

/**
 * 모의 OCR 처리 함수
 */
export const requestLicenseApproval = async (file: File, name: string, birth: string): Promise<LicenseVerifyResult> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const verifier = new LicenseVerifier();
      
      // 생년월일 파싱 (YYYYMMDD -> YYYY, M, D)
      let koreanDate = "0000년 0월 0일";
      let rrnFront = "000000";

      if (birth.length === 8) {
          const year = birth.substring(0, 4);
          const month = parseInt(birth.substring(4, 6), 10);
          const day = parseInt(birth.substring(6, 8), 10);
          koreanDate = `${year}년 ${month}월 ${day}일`; // 면허증 포맷 시뮬레이션
          rrnFront = birth.substring(2);
      }

      // [수정] 랜덤 실패 로직 제거
      // 파일명에 'fail' 또는 'error'가 포함된 경우에만 의도적으로 실패 처리하고,
      // 그 외에는 항상 사용자가 입력한 올바른 정보를 바탕으로 면허증 텍스트를 생성합니다.
      const shouldFail = file.name.toLowerCase().includes('fail') || file.name.toLowerCase().includes('error');
      const isSimulationSuccess = !shouldFail;

      let mockOcrText = "";

      if (isSimulationSuccess) {
          // 성공 시뮬레이션: 입력받은 이름과 생년월일을 그대로 사용하여 텍스트 생성
          mockOcrText = `
            대한민국 보건복지부 약사면허증
            성명: ${name}
            생년월일: ${koreanDate}
            주민등록번호: ${rrnFront}-1******
            면허번호: 제12345호
            위 사람은 약사법 제7조에 따라 약사의 면허를 받았음을 증명합니다.
            보건복지부장관 (인)
          `;
      } else {
          // 의도적 실패 시뮬레이션 (이름 오타, 날짜 불일치)
          mockOcrText = `
            대한민국 보건복지부 약사면허증
            성명: ${name.slice(0, 1)}O${name.slice(2)} (인식불량)
            생년월일: 1900년 1월 1일
            면허번호: 제12345호
            약사법 제7조
          `;
      }

      const { score, logs } = verifier.calculateScore(mockOcrText, name, birth);
      const safeOcrText = verifier.maskSensitiveData(mockOcrText);

      resolve({
        score,
        passed: score >= 100, // 100점 이상 자동 승인 기준
        logs,
        maskedOcrText: safeOcrText,
        extractedName: isSimulationSuccess ? name : undefined,
        extractedLicenseNo: '12345'
      });
    }, 2000);
  });
};
