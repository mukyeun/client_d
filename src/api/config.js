import axios from 'axios';
import { API_ENDPOINTS, BASE_URL } from './endpoints';
import { sanitizeFormData } from '../utils/dataUtils';

/**
 * Axios 인스턴스 설정
 */
const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

/**
 * 응답 인터셉터
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API 오류:', {
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      url: error.config?.url,
      method: error.config?.method
    });

    // 에러 응답 구조화
    const enhancedError = new Error(
      error.response?.data?.message || 
      error.message || 
      '서버 통신 중 오류가 발생했습니다.'
    );
    enhancedError.status = error.response?.status;
    enhancedError.data = error.response?.data;

    return Promise.reject(enhancedError);
  }
);

/**
 * 환자 정보 저장 API
 */
export const savePatientInfo = async (formData) => {
  try {
    console.debug('>> API 호출 전 데이터:', formData);

    // 데이터 정제
    const cleanedData = sanitizeFormData(formData);
    console.debug('>> 정제된 전송 데이터:', cleanedData);

    // API 요청
    const response = await api.post(API_ENDPOINTS.patients, cleanedData);

    // 응답 처리
    if (response.data.success) {
      return {
        success: true,
        message: response.data.message || '저장되었습니다.',
        data: response.data.data
      };
    }

    // 실패 응답 처리
    throw new Error(
      response.data.message || 
      '서버에서 오류가 발생했습니다.'
    );

  } catch (error) {
    console.error('환자 정보 저장 실패:', error);

    // 에러 응답 구조화
    throw new Error(
      error.response?.data?.message || 
      error.message || 
      '환자 정보 저장에 실패했습니다.'
    );
  }
};

/**
 * API 상태 체크
 */
export const checkApiHealth = async () => {
  try {
    const response = await api.get('/health');
    return response.data.status === 'ok';
  } catch (error) {
    console.error('API 상태 체크 실패:', error);
    return false;
  }
};

export default api;

// 응답 처리 헬퍼 함수
export const handleResponse = (response) => {
  if (response.data.success) {
    return response.data;
  }
  throw new Error(response.data.message || '서버 오류가 발생했습니다.');
};

// 환자 검색
export const searchPatient = async (params) => {
  try {
    const response = await api.get(API_ENDPOINTS.patients + '/search', { params });
    return response.data;
  } catch (error) {
    console.error('Error searching patient:', error);
    throw new Error('환자 검색 중 오류가 발생했습니다.');
  }
};

// 환자 목록 조회
export const getPatientList = async () => {
  try {
    const response = await api.get(API_ENDPOINTS.patients);
    return response.data;
  } catch (error) {
    console.error('Error fetching patient list:', error);
    throw new Error('환자 목록을 불러오는데 실패했습니다.');
  }
};

// 환자 정보 업데이트
export const updatePatientInfo = async (residentNumber, data) => {
  try {
    const response = await api.put(API_ENDPOINTS.patients + '/' + residentNumber, data);
    return response.data;
  } catch (error) {
    console.error('Error updating patient info:', error);
    if (error.response?.status === 404) {
      throw new Error('환자 정보를 찾을 수 없습니다.');
    }
    throw new Error('업데이트 중 오류가 발생했습니다.');
  }
};

// 환자 정보 삭제
export const deletePatientInfo = async (id) => {
  try {
    const response = await api.delete(API_ENDPOINTS.patients + '/' + id);
    return handleResponse(response);
  } catch (error) {
    console.error('Error deleting patient info:', error);
    throw error;
  }
};
