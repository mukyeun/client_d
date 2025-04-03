// 검색 관련 상수
export const SEARCH_PLACEHOLDER = '환자 검색...';
export const SEARCH_ERROR_MESSAGE = "검색어를 입력하세요";

// API 엔드포인트
export const API_ENDPOINTS = {
  USER_INFO: '/api/user-info',
  APPOINTMENTS: '/api/appointments',
  SEARCH: '/api/user-info/search'
};

// 폼 필드 상수
export const FORM_FIELDS = {
  NAME: 'name',
  RESIDENT_NUMBER: 'residentNumber',
  GENDER: 'gender',
  PHONE: 'phone',
  HEIGHT: 'height',
  WEIGHT: 'weight',
  BMI: 'bmi'
};

// 메시지
export const MESSAGES = {
  SAVE_SUCCESS: '저장이 완료되었습니다.',
  SAVE_ERROR: '저장 중 오류가 발생했습니다.',
  DELETE_SUCCESS: '삭제가 완료되었습니다.',
  DELETE_ERROR: '삭제 중 오류가 발생했습니다.',
  VALIDATION_ERROR: '필수 항목을 입력해주세요.',
  NETWORK_ERROR: '서버 연결에 실패했습니다.'
};

// 기타 상수
export const DEFAULT_VALUES = {
  gender: '남자',
  height: 0,
  weight: 0,
  bmi: 0
};

// 복용약물 목록 추가
export const MEDICATIONS = [
  '혈압약',
  '당뇨약',
  '고지혈증약',
  '진통제',
  '소화제',
  '수면제',
  '항생제',
  '비타민',
  '영양제',
  '한약',
  '기타'
];

// 기호식품 목록 추가
export const PREFERENCES = [
  '커피',
  '술',
  '담배',
  '탄산음료',
  '초콜릿',
  '패스트푸드',
  '라면',
  '기타'
]; 