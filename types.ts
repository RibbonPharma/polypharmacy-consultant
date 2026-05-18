
export interface Diagnosis {
  code: string; // 상병코드 (ICD-10 등)
  name: string; // 병명
}

export interface Patient {
  id: string;
  name: string;
  birthDate: string;
  age: number;
  gender: 'M' | 'F';
  conditions: string[]; // 환자가 구두로 호소한 만성/기저질환 (수동 입력)
  diagnosisCodes: Diagnosis[]; // 처방전 스캔을 통해 입력된 금번 상병/진단 (자동 추출)
  eGFR?: number;
  visitType: 'Home' | 'Pharmacy';
}

export enum AlertLevel {
  RED = 'RED',
  YELLOW = 'YELLOW',
  GREEN = 'GREEN'
}

export interface ClinicalAlert {
  level: AlertLevel;
  title: string;
  reason: string;
  action: string;
  drugsInvolved: string[];
  isVerifiedByLocalDB?: boolean;
  reference?: string;
}

export interface Medication {
  name: string;
  ingredient: string;
  dosage: string;
  frequency: string;
  category?: string;
}

export interface ExtractedPatientInfo {
  name?: string;
  age?: number;
  gender?: 'M' | 'F';
  birthDate?: string;
}

export interface SOAPNote {
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
}

export interface AnalysisResult {
  medications: Medication[];
  alerts: ClinicalAlert[];
  summary: string;
  extractedPatientInfo?: ExtractedPatientInfo; // 스캔된 환자 정보 (명시된 경우만)
  diagnoses?: Diagnosis[]; // 스캔된 상병코드 및 병명
  soapNote?: SOAPNote; // 자동 생성된 SOAP 노트 초안
  isVerifiedByPharmacist?: boolean;
}

export type UserRole = 'USER' | 'ADMIN';
export type UserStatus = 'PENDING' | 'ACTIVE' | 'REJECTED';

export interface Pharmacist {
  id: string; // Login ID
  name: string;
  licenseNumber: string;
  isVerified: boolean;
  role: UserRole;
  status: UserStatus;
  requestDate?: string;
  password?: string;
  licenseImage?: string; // URL or Base64 of the uploaded license
}

export enum ViewMode {
  LANDING = 'LANDING',
  AUTH = 'AUTH',
  DASHBOARD = 'DASHBOARD',
  PATIENT_LIST = 'PATIENT_LIST',
  VERIFICATION = 'VERIFICATION',
  ADMIN_PANEL = 'ADMIN_PANEL'
}

export type Language = 'ko' | 'en';
