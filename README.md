# PharmGni 2.0 (팜지니 2.0)

PharmGni 2.0은 **약사를 위한 AI 기반 임상 보조 시스템(Clinical Decision Support System)** 입니다.
다제약물 검토(DUR), 약물 상호작용 분석, 처방전 스캔 기반의 환자 맞춤형 복약지도, 그리고 약사 면허 자동 검증까지 — 약국 현장의 임상 의사결정을 한 화면에서 지원합니다.

> **현재 상태:** 약사회·연구·시연용 프로토타입. 실제 환자 데이터 운영 환경 도입 전, 아래 **보안 및 개인정보** 섹션의 사전 요구사항을 반드시 확인하세요.

---

## 📸 스크린샷 (Screenshots)

<!-- TODO: 이미지 파일을 `docs/screenshots/` 경로에 추가한 후 아래 경로를 갱신하세요 -->

| 환자 관리 (Patient List) | 임상 대시보드 (Clinical Dashboard) | 스마트 복약 안내문 (Smart Output) |
| :---: | :---: | :---: |
| _준비 중_ | _준비 중_ | _준비 중_ |

---

## ✨ 주요 기능 (Features)

### 🔍 1. 처방전 스캔 및 분석 (Vision AI)
- 인쇄된 처방전·약 봉투 이미지를 업로드하면 **환자 정보 / 약물 목록 / 상병 코드(ICD)** 를 자동 추출합니다.
- Google Gemini Vision (`gemini-3-pro-preview`, Thinking Mode) 기반.
- 전송 전 **로컬 마스킹(`simulateLocalMasking`)** 단계를 거쳐 개인정보 노출을 최소화합니다.

### 💊 2. 임상 약학 분석 (Clinical Analysis)
- **DUR 로컬 엔진**(`services/durEngine.ts`)으로 1차 약물 상호작용·중복 처방·금기 검토.
- AI 기반 2차 분석으로 **노인주의 약물(Beers Criteria)**, 신기능·간기능 고려 용량 조정 후보를 식별.
- 위험도(AlertLevel)에 따라 우선순위가 자동 정렬됩니다.

### 🤖 3. AI 임상 비서 (Clinical Assistant)
- 내장된 **WHO 부작용 데이터베이스**(`services/whoAdverseDb.ts`)와 약학 지식을 결합하여 **원인 의심 약물(ADR) 인과성 평가**를 보조합니다.
- 약사가 환자 사례를 자연어로 질문하면 임상적 근거와 함께 답변을 제공합니다.

### 📋 4. 환자 맞춤형 복약 안내문 (Smart Output)
- 환자가 이해하기 쉬운 언어로 **스마트 복약 안내문**을 생성합니다.
- 다국어 출력 지원 구조(`utils/translations.ts`).
- 프린트 전용 스타일이 포함되어 즉시 출력 가능합니다.

### 👤 5. 환자 관리 (Patient Management)
- 환자 목록 관리 및 프로필 편집(`PatientManagement`, `PatientProfile`).
- 스캔 결과는 선택된 환자 프로필에 자동 병합됩니다(이름·연령·성별·상병코드).

### 🔐 6. 약사 면허 자동 검증 + 관리자 패널 (Auxiliary)
- 회원가입 시 **약사 면허증 OCR 검증**(`LicenseVerifier`, 100점 자동 승인제, 개인정보 자동 마스킹)을 거칩니다.
- 관리자 권한 계정은 가입 신청을 승인·반려할 수 있습니다.

---

## 🛠️ 기술 스택 (Tech Stack)

| Layer | Stack |
| --- | --- |
| Frontend | React 19, TypeScript |
| Build Tool | Vite 6 |
| Styling | Tailwind CSS (CDN), Noto Sans KR |
| Icons | lucide-react |
| AI | Google Gemini (`@google/genai`, `gemini-3-pro-preview`) |
| 외부 연동 (예정) | My Healthway (`services/myHealthwayService.ts`) |

---

## 🚀 시작하기 (Getting Started)

### 사전 요구사항 (Prerequisites)
- **Node.js v18 이상** (v20 LTS 권장)
- npm (또는 yarn / pnpm)
- **Google Gemini API Key** — [Google AI Studio](https://aistudio.google.com/app/apikey)에서 발급

### 설치 및 실행 (Installation & Run)

**1. 저장소 클론 (Clone the repository)**
```bash
git clone https://github.com/RibbonPharma/polypharmacy-consultant.git
cd polypharmacy-consultant
```

**2. 패키지 설치 (Install dependencies)**
```bash
npm install
```

**3. 환경변수 설정 (Environment Variables)**

프로젝트 루트에 `.env.local` 파일을 생성하고 Gemini API 키를 입력합니다.

```env
# .env.local
GEMINI_API_KEY=your_gemini_api_key_here
```

> ℹ️ `vite.config.ts`에서 `GEMINI_API_KEY`를 `process.env.API_KEY` 및 `process.env.GEMINI_API_KEY` 두 변수로 노출합니다. 별도 설정 없이 그대로 사용 가능합니다.

**4. 개발 서버 실행 (Start dev server)**
```bash
npm run dev
```
기본적으로 `http://localhost:3000` 에서 실행됩니다. (`host: 0.0.0.0`으로 외부 접속도 허용)

**5. 프로덕션 빌드 (Build for production)**
```bash
npm run build      # dist/ 디렉터리로 정적 파일 생성
npm run preview    # 빌드 결과 로컬 프리뷰
```

---

## 📁 프로젝트 구조 (Project Structure)

```
polypharmacy-consultant/
├── App.tsx                       # 최상위 컴포넌트 (라우팅·전역 상태)
├── index.tsx                     # React 엔트리 포인트
├── index.html                    # Tailwind CDN, Noto Sans KR 폰트 로드
├── mockData.ts                   # 초기 사용자(관리자/약사) 시드 데이터
├── types.ts                      # 공통 타입 정의 (Patient, AnalysisResult 등)
├── vite.config.ts                # Vite 설정 + 환경변수 매핑
│
├── components/                   # UI 컴포넌트
│   ├── LoginScreen.tsx           # 로그인 / 회원가입 (면허증 OCR 포함)
│   ├── AdminPanel.tsx            # 관리자 패널 (회원 승인/반려)
│   ├── Header.tsx
│   ├── PatientManagement.tsx     # 환자 목록
│   ├── PatientProfile.tsx        # 환자 프로필 편집
│   ├── DrugScanner.tsx           # 처방전 스캔 입력
│   ├── ImageMasker.tsx           # 이미지 마스킹 보조 UI
│   ├── ClinicalDashboard.tsx     # 분석 결과 대시보드
│   ├── ClinicalAssistant.tsx     # AI 임상 비서 (Q&A)
│   └── SmartOutput.tsx           # 환자용 복약 안내문 출력
│
├── services/                     # 외부 연동 / 비즈니스 로직
│   ├── geminiService.ts          # Gemini Vision·LLM 호출
│   ├── durEngine.ts              # 로컬 DUR 검토 엔진
│   ├── whoAdverseDb.ts           # WHO 부작용 DB
│   ├── licenseService.ts         # 면허증 OCR 검증 (마스킹·점수 산정)
│   └── myHealthwayService.ts     # 마이헬스웨이 연동 (placeholder)
│
└── utils/
    ├── legalText.ts              # 약관·개인정보 처리 방침
    └── translations.ts           # 다국어 리소스
```

---

## 🔒 보안 및 개인정보 (Data Privacy)

PharmGni는 환자 정보를 다루므로 다음 사항을 **반드시** 확인해 주세요.

### 현재 구현된 마스킹
- **면허증 OCR**: `LicenseVerifier.maskSensitiveData()`에서 주민등록번호(`######-*******`) 및 휴대전화번호 정규식 마스킹을 수행합니다.
- **처방전 이미지**: `simulateLocalMasking()` 단계가 분석 전 0.5초 동안 실행됩니다. **현재는 시뮬레이션 지연만 존재하며, 실제 픽셀 단위 비식별화는 구현되어 있지 않습니다.**

### 실서비스 도입 전 필수 작업
- ⚠️ 처방전 이미지의 환자 식별 정보(이름·주민등록번호·연락처 등)를 **프론트엔드 단계에서 픽셀 마스킹** 하거나, **온디바이스 NER 모델**을 통해 비식별화한 뒤 API로 전송해야 합니다.
- ⚠️ Gemini API 호출 시 키가 클라이언트 번들에 포함됩니다. **운영 환경에서는 백엔드 프록시**를 통해 키를 보호하고, 요청별 사용량을 제어하세요.
- ⚠️ 개인정보보호법·의료법·약사법 및 관련 고시(개인정보의 안전성 확보조치 기준 등)를 준수하는 데이터 흐름 검토가 선행되어야 합니다.

---

## 🗺️ 로드맵 (Roadmap)

- [ ] 처방전 이미지 실제 비식별화 로직 (NER 또는 픽셀 마스킹) 구현
- [ ] 백엔드 프록시를 통한 API 키 보호
- [ ] 마이헬스웨이(My Healthway) 실연동
- [ ] DUR 로컬 엔진 룰셋 확장 (식약처 DUR 기준 동기화)
- [ ] 다제약물 관리사업(공단) SOAP↔보고서 변환 모듈

---

## 📄 라이선스 (License)

이 프로젝트는 **Apache License 2.0**을 따릅니다.
상업적 이용, 복제, 수정 및 배포가 자유롭게 가능합니다.

단, 본 프로젝트의 코드를 기반으로 수정·배포·상업적 이용을 하는 경우 **반드시 `NOTICE` 파일에 명시된 원작자 표기(저작권 및 출처) 사항을 유지**해야 합니다.

자세한 내용은 [`LICENSE`](./LICENSE) 및 [`NOTICE`](./NOTICE) 파일을 참고해 주세요.

---

## 🤝 기여 및 문의 (Contributing & Contact)

이슈·기능 제안은 GitHub Issues로 남겨주세요.
임상·정책·연구 협업 문의는 저장소 소유자(`RibbonPharma`)에게 연락 바랍니다.
