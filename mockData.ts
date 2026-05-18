import { Pharmacist } from './types';

// 데모 모드용 가상 약사 계정 (인증 없이 시연 시 사용)
export const DEMO_PHARMACIST: Pharmacist = {
  id: 'demo',
  name: '데모 약사',
  licenseNumber: 'DEMO-0000',
  isVerified: true,
  role: 'USER',
  status: 'ACTIVE',
};

// 초기 시스템 테스트 유저 데이터 (오픈소스 공개용 샘플)
// ⚠️  비밀번호는 데모용 placeholder입니다. 실제 운영 환경에서는 반드시
//     bcrypt 등 단방향 해시로 저장하고, 데이터베이스 인증으로 교체해야 합니다.
export const INITIAL_USERS: Pharmacist[] = [
  {
    id: 'admin',
    name: '관리자',
    licenseNumber: '00000',
    isVerified: true,
    role: 'ADMIN',
    status: 'ACTIVE',
    requestDate: '2024-01-01',
    password: 'REPLACE_WITH_HASHED_PASSWORD'
  },
  {
    id: 'pharmacist_1',
    name: '김약사',
    licenseNumber: '12345',
    isVerified: true,
    role: 'USER',
    status: 'ACTIVE',
    requestDate: '2024-02-15',
    password: 'REPLACE_WITH_HASHED_PASSWORD'
  }
];
