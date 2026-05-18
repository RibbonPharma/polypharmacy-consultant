# Contributing to PharmGni

먼저 기여에 관심을 가져주셔서 감사합니다! PharmGni는 약사와 개발자가 함께 만드는 오픈소스 다제약물 관리 도구입니다.

## 기여 방법 (How to Contribute)

### 1. 이슈 먼저 (Issue First)
- 버그 수정이든 기능 제안이든 **먼저 Issue를 열어주세요**.
- 중복 작업을 방지하고, 방향이 맞는지 먼저 논의합니다.

### 2. 개발 환경 설정

```bash
git clone https://github.com/RibbonPharma/polypharmacy-consultant.git
cd polypharmacy-consultant
npm install
cp .env.example .env.local   # Gemini API 키 입력
npm run dev
```

### 3. 브랜치 규칙

| 유형 | 형식 | 예시 |
|---|---|---|
| 기능 추가 | `feat/설명` | `feat/soap-template-library` |
| 버그 수정 | `fix/설명` | `fix/ocr-hangul-encoding` |
| 문서 | `docs/설명` | `docs/update-readme` |
| 리팩토링 | `refactor/설명` | `refactor/dur-engine` |
| 기타 | `chore/설명` | `chore/update-deps` |

### 4. 커밋 메시지 규칙

[Conventional Commits](https://www.conventionalcommits.org/) 형식을 따릅니다.

```
feat: 약물 템플릿 라이브러리 추가
fix: 한글 OCR 인코딩 오류 수정
docs: README 설치 가이드 보완
```

### 5. Pull Request

- PR 제목은 커밋 메시지 규칙과 동일하게 작성해 주세요.
- PR 본문에는 **변경 이유**, **테스트 방법**을 포함해 주세요.
- 리뷰어가 지정되기 전까지 머지하지 마세요.

## 임상 관련 기여 시 유의사항

- 약물 상호작용, DUR 규칙 등 임상 데이터를 추가/수정할 경우 **참고 문헌(출처)을 반드시 명시**해 주세요.
- 식약처 DUR 기준, WHO 가이드라인, Beers Criteria 등 공신력 있는 출처를 우선합니다.

## 개인정보 관련 주의

- 실제 환자 정보, 처방 이미지, 개인 식별 데이터를 절대 커밋하지 마세요.
- Mock 데이터만 사용해 주세요.

## 행동 강령

[CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md)를 준수해 주세요.
