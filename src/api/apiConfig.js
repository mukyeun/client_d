import axios from 'axios';

// API 기본 설정
export const API_BASE_URL = 'http://localhost:5003';

export const API_CONFIG = {
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
};

// API 엔드포인트 정의
export const API_ENDPOINTS = {
  PATIENTS: {
    BASE: '/api/patients',
    SAVE: '/api/patients/save',
    GET_ONE: (id) => `/api/patients/${id}`,
    UPDATE: (id) => `/api/patients/${id}`,
    DELETE: (id) => `/api/patients/${id}`
  }
};

// axios 인스턴스 생성
const api = axios.create(API_CONFIG);

// 응답 인터셉터
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API 오류:', error);
    return Promise.reject(error);
  }
);

export default api; 