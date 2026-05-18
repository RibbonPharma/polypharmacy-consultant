# PharmGni 2.0 (팜지니 2.0)

PharmGni 2.0은 약사를 위한 AI 기반 임상 보조 시스템입니다. 다제약물 검토(DUR), 상호작용 분석, 처방전 스캔을 통한 환자 맞춤형 복약지도를 지원합니다.

## 주요 기능
- **처방전 스캔 및 분석 (Vision AI)**: 인쇄된 처방전이나 약 투약 봉투를 스캔하여 환자 정보 및 약물 목록, 상병 코드를 자동 추출합니다.
- **임상 약학 분석**: 추출된 약물 목록을 기반으로 약물 상호작용, 노인 주의 약물(Beers Criteria 등)을 분석합니다.
- **AI 임상 비서**: WHO 의약품 부작용 데이터베이스와 약학 지식을 바탕으로 원인 의심 약물(ADR) 인과성을 평가를 돕습니다.
- **환자 맞춤형 복약 안내문**: 환자가 이해하기 쉬운 언어로 스마트 복약 안내문을 생성합니다.

## 시작하기 (Getting Started)

### 사전 요구사항
- Node.js (v18 이상 권장)
- npm 또는 yarn
- **Google Gemini API Key** (Vision 기능 및 자연어 처리에 사용)

### 설치 및 실행 방법

1. 저장소 클론 (Clone the repository)
```bash
git clone https://github.com/your-repo/pharmgni.git
cd pharmgni
```

2. 패키지 설치 (Install dependencies)
```bash
npm install
```

3. 환경변수 설정 (Environment Variables)
프로젝트 루트 경로에 `.env` 또는 `.env.local` 파일을 생성하고( `.env.example` 참고 ) Gemini API 키를 입력합니다.
```env
# .env.local
GEMINI_API_KEY=your_gemini_api_key_here
```

4. 개발 서버 실행 (Start dev server)
```bash
npm run dev
```
기본적으로 `http://localhost:3000` 에서 실행됩니다.

## 보안 및 개인정보 (Data Privacy)
- 현재 처방전 스캔 이미지는 분석을 위해 AI 모델로 전송됩니다.
- **주의:** 실제 운영 환경 도입 시, 이미지 내 환자 개인정보(이름, 주민번호 등)를 서버 전송 전에 로컬(Front-end)에서 완벽히 마스킹(비식별화)하는 강력한 로직 또는 NER 모델 연동이 필수적입니다. 현재 코드에는 0.5초의 시뮬레이션 지연 로직(`simulateLocalMasking`)이 포함되어 있습니다.

## 라이선스 (License)

이 프로젝트는 **Apache License 2.0**을 따릅니다. 
상업적 이용, 복제, 수정 및 배포가 자유롭게 가능합니다. 

단, 본 프로젝트의 코드를 기반으로 수정 및 배포, 상업적 이용을 하실 경우 **반드시 `NOTICE` 파일에 명시된 원작자 표기(저작권 및 출처) 사항을 유지해야** 합니다.
자세한 내용은 `LICENSE` 및 `NOTICE` 파일을 참고해 주세요.
