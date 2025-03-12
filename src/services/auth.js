import axios from 'axios';
import CryptoJS from 'crypto-js';

// 보안 설정
const SECRET_KEY = process.env.REACT_APP_SECRET_KEY || 'your-secret-key';
const API_URL = process.env.REACT_APP_API_URL || 'https://your-api-domain.com';

// 비밀번호 암호화
const encryptPassword = (password) => {
  return CryptoJS.AES.encrypt(password, SECRET_KEY).toString();
};

// 세션 토큰 관리
const getToken = () => sessionStorage.getItem('adminToken');
const setToken = (token) => sessionStorage.setItem('adminToken', token);
const removeToken = () => sessionStorage.removeItem('adminToken');

// API 인스턴스 생성
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // CORS 쿠키 전송 허용
});

// 요청 인터셉터 - 토큰 추가
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 응답 인터셉터 - 토큰 만료 처리
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      removeToken();
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

// 인증 관련 함수들
export const authService = {
  // 로그인
  login: async (username, password) => {
    try {
      const encryptedPassword = encryptPassword(password);
      const response = await api.post('/auth/login', {
        username,
        password: encryptedPassword,
      });
      
      if (response.data.token) {
        setToken(response.data.token);
        return { success: true };
      }
      return { success: false, error: '로그인에 실패했습니다.' };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || '로그인 중 오류가 발생했습니다.' 
      };
    }
  },

  // 로그아웃
  logout: async () => {
    try {
      await api.post('/auth/logout');
      removeToken();
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      removeToken();
      return { success: false, error: '로그아웃 중 오류가 발생했습니다.' };
    }
  },

  // 인증 상태 확인
  checkAuth: async () => {
    try {
      const response = await api.get('/auth/check');
      return { success: true, user: response.data.user };
    } catch (error) {
      removeToken();
      return { success: false };
    }
  },
};

export const isAuthenticated = () => {
  const token = getToken();
  return !!token;
}; 