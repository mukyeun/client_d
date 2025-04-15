/**
 * 기본 설정값 (다른 설정이 참조하기 전에 먼저 정의)
 */
const DEFAULT_CONFIG = {
  PORT: '5003',
  API_TIMEOUT: 30000,
  DATE_FORMAT: 'YYYY-MM-DD HH:mm:ss',
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,
  HEALTH_CHECK_INTERVAL: 30000
};

/**
 * 환경별 API 기본 URL 설정
 */
const API_URL = process.env.REACT_APP_API_URL || 
  (process.env.NODE_ENV === 'development' 
    ? `http://localhost:${DEFAULT_CONFIG.PORT}/api`
    : 'https://api.your-domain.com/api');

/**
 * 설정 객체들을 개별적으로 export (default export 사용하지 않음)
 */
export const API_CONFIG = {
  baseURL: API_URL,
  timeout: DEFAULT_CONFIG.API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json'
  }
};

export const API_ENDPOINTS = {
  PATIENTS: {
    BASE: '/patients',
    GET_ONE: (id) => `/patients/${id}`,
    SAVE: '/patients'
  },
  WAVE_ANALYSIS: {
    LAUNCH: '/wave-analysis/launch',
    FETCH_DATA: '/wave-analysis/data',
    FETCH_LATEST: '/wave-analysis/latest',
    SAVE: '/wave-analysis/save'
  }
};

export const CONFIG = {
  ...DEFAULT_CONFIG,
  API_URL,
  HEALTH_CHECK: {
    endpoint: '/health',
    interval: DEFAULT_CONFIG.HEALTH_CHECK_INTERVAL
  }
};

/**
 * 서버 상태 확인 함수
 */
export const checkServerHealth = async () => {
  try {
    const response = await fetch(`${API_URL}/health`);
    return response.ok;
  } catch (error) {
    console.error('서버 상태 확인 실패:', error);
    return false;
  }
}; 