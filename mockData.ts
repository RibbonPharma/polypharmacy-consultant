import { Pharmacist } from './types';

// 초기 시스템 테스트 유저 데이터 (오픈소스 공개용 샘플)
// 주의: 실제 운영 환경에서는 데이터베이스와 연동하여 사용자 인증을 처리해야 합니다.
export const INITIAL_USERS: Pharmacist[] = [
  {
    id: 'admin',
    name: '관리자',
    licenseNumber: '00000',
    isVerified: true,
    role: 'ADMIN',
    status: 'ACTIVE',
    requestDate: '2024-01-01',
    password: 'admin' // 예시 비밀번호. 실사용시 암호화 필요
  },
  {
    id: 'pharmacist_1',
    name: '김약사',
    licenseNumber: '12345',
    isVerified: true,
    role: 'USER',
    status: 'ACTIVE',
    requestDate: '2024-02-15',
    password: 'password123'
  }
];
