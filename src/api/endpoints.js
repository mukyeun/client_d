/**
 * API 엔드포인트 정의
 */
export const API_ENDPOINTS = {
  // 환자 관련 엔드포인트
  patients: '/api/patients',
  patientDetail: (id) => `/api/patients/${id}`,
  
  // 맥파 데이터 관련 엔드포인트
  pulseRecords: '/api/patients/wave-data',
  pulseRecordDetail: (id) => `/api/patients/wave-data/${id}`,
  
  // 예약 관련 엔드포인트
  appointments: '/api/appointments',
  appointmentDetail: (id) => `/api/appointments/${id}`,
  
  // 기타 엔드포인트
  search: '/api/search',
  statistics: '/api/statistics'
};

// 환경별 기본 URL
export const BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:4000';

// API 버전
export const API_VERSION = 'v1';

export default {
  API_ENDPOINTS,
  BASE_URL,
  API_VERSION
}; 