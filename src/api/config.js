import axios from 'axios';

// baseURL 설정
const instance = axios.create({
  baseURL: 'http://localhost:5003', // 서버 기본 URL
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 요청 인터셉터
instance.interceptors.request.use(
  (config) => {
    console.log('API 요청:', config.url);
    return config;
  },
  (error) => {
    console.error('API 요청 오류:', error);
    return Promise.reject(error);
  }
);

// 응답 인터셉터
instance.interceptors.response.use(
  (response) => {
    console.log('API 응답:', response.data);
    return response;
  },
  (error) => {
    console.error('API 에러:', error.response?.data);
    return Promise.reject(error);
  }
);

export default instance;

export const API_BASE_URL = 'http://localhost:5003/api';

export const API_ENDPOINTS = {
    PATIENTS: '/patients',
    PULSE_RECORDS: '/pulse-records',
    APPOINTMENTS: '/appointments',
    UBIO: '/ubio-data'
};

export const handleResponse = async (response) => {
    if (!response.ok) {
        const error = await response.json().catch(() => ({ 
            message: `서버 오류가 발생했습니다. (${response.status})` 
        }));
        throw new Error(error.message);
    }
    return response.json();
}; 