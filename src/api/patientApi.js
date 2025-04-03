import api from './config';

const BASE_URL = '/api/patients';

// 환자 정보 저장
export const savePatient = async (patientData) => {
  try {
    const response = await api.post('/patients', patientData);
    return response.data;
  } catch (error) {
    console.error('환자 정보 저장 실패:', error);
    throw new Error('환자 정보 저장에 실패했습니다.');
  }
};

// 환자 목록 조회
export const getPatients = async () => {
  try {
    const response = await api.get('/patient-info');
    return response.data;
  } catch (error) {
    console.error('환자 정보 조회 실패:', error);
    throw error;
  }
};

// 환자 정보 저장 API
export const savePatientInfo = async (formData) => {
  try {
    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData)
    });

    if (!response.ok) {
      throw new Error('서버 응답 오류');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API 호출 오류:', error);
    throw error;
  }
};

// 환자 정보 조회 API
export const getPatientInfo = async (id) => {
  try {
    const response = await fetch(`${BASE_URL}/${id}`);
    if (!response.ok) {
      throw new Error('서버 응답 오류');
    }
    return await response.json();
  } catch (error) {
    console.error('API 호출 오류:', error);
    throw error;
  }
};

// 환자 검색
export const searchPatient = async ({ name, residentNumber }) => {
  try {
    const response = await api.get(`${BASE_URL}/search`, {
      params: { name, residentNumber }
    });
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('검색 API 에러:', error);
    return {
      success: false,
      error: error.response?.data?.message || '검색 중 오류가 발생했습니다.'
    };
  }
};

// 고급 검색
export const advancedSearch = async (params) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(`${BASE_URL}/advanced-search?${queryString}`);
    return response.data;
};

// 환자 정보 수정
export const updatePatientInfo = async (id, patientData) => {
  try {
    const response = await api.put(`${BASE_URL}/${id}`, patientData);
    return response.data;
  } catch (error) {
    console.error('환자 정보 수정 실패:', error);
    throw new Error('환자 정보 수정에 실패했습니다.');
  }
};

// 환자 정보 삭제
export const deletePatientInfo = async (id) => {
  try {
    const response = await api.delete(`${BASE_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error('환자 정보 삭제 실패:', error);
    throw error;
  }
};

// 맥파 데이터 조회 API
export const getWaveformData = async (userName) => {
  try {
    const response = await api.get(`/excel-data?userName=${encodeURIComponent(userName)}`);
    console.log('맥파 데이터 응답:', response.data);
    return response.data;
  } catch (error) {
    console.error('맥파 데이터 조회 실패:', error);
    throw error;
  }
};

export const patientApi = {
  // 환자 목록 조회
  getPatientList: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await fetch(`${BASE_URL}?${queryString}`);
      if (!response.ok) {
        throw new Error('서버 응답 오류');
      }
      return await response.json();
    } catch (error) {
      console.error('API 호출 오류:', error);
      throw error;
    }
  }
}; 