import { Language } from '../types';

export const TRANSLATIONS: Record<Language, Record<string, string>> = {
  ko: {
    // Header
    role_pharmacist: "약사님",
    logout: "로그아웃",
    
    // Patient Profile
    patient_conditions: "기저질환",
    data_source: "데이터 소스",
    connected: "연결됨",
    cond_hypertension: "고혈압",
    cond_arthritis: "관절염",
    cond_kidney: "신장 질환(eGFR < 60)",
    visit_home: "방문 약료",
    visit_pharmacy: "약국 방문",
    
    // Scanner
    scan_title: "Snap & Solve (약물 보따리 스캔)",
    scan_placeholder: "촬영 혹은 사진 업로드",
    scan_subtext: "처방전, 약봉투, 약통 스캔",
    scan_analyzing: "Gemini 분석 중...",
    scan_camera: "직접 촬영",
    scan_upload: "사진 업로드",
    scan_cancel: "취소하기",
    scan_guide: "처방전이나 약통을 사각형 안에 맞춰주세요",
    scan_privacy: "* 개인정보 보호를 위해 이미지는 서버에 저장되지 않습니다.",
    
    // Dashboard
    waiting_title: "대기 중",
    waiting_desc: "좌측 패널에서 약물 사진을 스캔해주세요.",
    report_title: "임상 분석 리포트",
    dur_connected: "DUR DB 연결됨",
    engine_ver: "지식 엔진 v2.0 (Local)",
    risk_factors: "분석된 임상 위험 요소",
    verified: "검증됨",
    cause: "원인",
    recommendation: "권고",
    med_list: "인식된 약물 리스트",
    
    // Smart Output
    guide_title: "Patient Guide",
    mode_list: "리스트형",
    mode_pictogram: "그림형 (노인용)",
    guide_header: "복약 안내문",
    guide_warning: "절대 같이 드시지 마세요",
    guide_caution: "꼭 지켜주세요",
    guide_senior_title: "어르신 맞춤 복약지도",
    action_print: "출력하기",
    action_send: "전송하기",
    
    // Common
    unknown: "알 수 없음",
    alert_red: "심각",
    alert_yellow: "주의",
    alert_green: "양호"
  },
  en: {
    role_pharmacist: "RPh",
    logout: "Logout",
    patient_conditions: "Conditions",
    data_source: "Data Source",
    connected: "Connected",
    cond_hypertension: "Hypertension",
    cond_arthritis: "Arthritis",
    cond_kidney: "CKD (eGFR < 60)",
    visit_home: "Home Visit",
    visit_pharmacy: "Pharmacy Visit",

    scan_title: "Snap & Solve (Medication Scan)",
    scan_placeholder: "Take Photo or Upload",
    scan_subtext: "Prescriptions, pill bags, bottles",
    scan_analyzing: "Gemini Analyzing...",
    scan_camera: "Camera",
    scan_upload: "Upload",
    scan_cancel: "Cancel",
    scan_guide: "Align medication within the frame",
    scan_privacy: "* Images are processed locally for privacy.",
    waiting_title: "Ready to Scan",
    waiting_desc: "Scan medication using the left panel.",
    report_title: "Clinical Analysis Report",
    dur_connected: "DUR DB Active",
    engine_ver: "Knowledge Engine v2.0 (Local)",
    risk_factors: "Identified Clinical Risks",
    verified: "Verified",
    cause: "Reason",
    recommendation: "Action",
    med_list: "Recognized Medications",
    guide_title: "Patient Guide",
    mode_list: "List View",
    mode_pictogram: "Pictogram (Senior)",
    guide_header: "Medication Guide",
    guide_warning: "Do Not Take Together",
    guide_caution: "Please Follow",
    guide_senior_title: "Senior-Friendly Guide",
    action_print: "Print",
    action_send: "Send",
    unknown: "Unknown",
    alert_red: "Critical",
    alert_yellow: "Warning",
    alert_green: "Safe"
  }
};
