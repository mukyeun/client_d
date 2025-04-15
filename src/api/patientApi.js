import api from './apiConfig';
import { format } from 'date-fns';
import { cleanPayload, sanitizeFormData, transformToServerSchema } from '../utils/dataUtils';
import { API_CONFIG, API_BASE_URL, API_ENDPOINTS } from '../config';
import axios from 'axios';

// ✨ axios 인스턴스 생성
const apiInstance = api.create(API_CONFIG);

// ✨ 인터셉터 설정
apiInstance.interceptors.request.use(
  (config) => {
    console.log(`🚀 API 요청: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ API 요청 오류:', error);
    return Promise.reject(error);
  }
);

apiInstance.interceptors.response.use(
  (response) => {
    console.log(`✅ API 응답: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    if (!error.response) {
      console.error('❌ 서버 연결 실패:', error.message);
      throw new Error('서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.');
    }
    
    console.error('❌ API 응답 오류:', {
      status: error.response?.status,
      message: error.response?.data?.message || error.message
    });
    return Promise.reject(error);
  }
);

// 데이터 검증 및 정제 유틸리티
const utils = {
  // 문자열 정제
  cleanString: (str) => str?.trim() || '',
  
  // 숫자 변환
  toNumber: (value) => {
    if (!value) return null;
    const num = parseFloat(value);
    return isNaN(num) ? null : num;
  },
  
  // 주민번호 포맷팅
  formatResidentNumber: (value) => {
    if (!value) return '';
    const cleaned = value.replace(/[^0-9]/g, '');
    return cleaned.length === 13 ? `${cleaned.slice(0,6)}-${cleaned.slice(6)}` : value;
  },
  
  // 전화번호 포맷팅
  formatPhoneNumber: (value) => {
    if (!value) return '';
    const cleaned = value.replace(/[^0-9]/g, '');
    return cleaned.length === 11 ? `${cleaned.slice(0,3)}-${cleaned.slice(3,7)}-${cleaned.slice(7)}` : value;
  },
  
  // 혈압 포맷팅
  formatBloodPressure: (diastolic, systolic) => {
    if (!diastolic || !systolic) return '';
    return `${diastolic}/${systolic}`;
  },
  
  // 맥파 데이터 정제
  cleanPulseWave: (data) => {
    const fields = ['a-b', 'a-c', 'a-d', 'a-e', 'b/a', 'c/a', 'd/a', 'e/a', 'HR', 'PVC', 'BV', 'SV'];
    const cleaned = {};
    fields.forEach(field => {
      cleaned[field] = utils.toNumber(data[field]);
    });
    return cleaned;
  }
};

// 날짜 포맷팅 함수
const formatDate = (dateString) => {
  try {
    return format(new Date(dateString), 'yyyy-MM-dd HH:mm');
  } catch {
    return '-';
  }
};

// 숫자 포맷팅 함수
const formatNumber = (value, decimals = 1) => {
  if (value === null || value === undefined) return '-';
  return Number(value).toFixed(decimals);
};

// 기본 데이터 구조 정의
const DEFAULT_PATIENT_DATA = {
  basicInfo: {
    name: '',
    residentNumber: '',
    phone: '',
    gender: '',
    height: '',
    weight: '',
    bmi: '',
    age: '',
    birthDate: ''
  },
  records: {
    heartRate: '',  // records 레벨의 심박수
    stress: {
      items: [],
      level: '',
      totalScore: 0
    },
    symptoms: {},
    medications: {
      drugs: [],
      preferences: []
    },
    pulseWave: {
      heartRate: '',  // pulseWave 내부의 심박수 - 이것만 사용
      elasticityScore: '',
      PVC: '',
      BV: '',
      SV: '',
      'a-b': '',
      'a-c': '',
      'a-d': '',
      'a-e': '',
      'b/a': '',
      'c/a': '',
      'd/a': '',
      'e/a': ''
    }
  }
};

// 데이터 그리드용 컬럼 정의
export const patientGridColumns = [
  {
    field: 'measurementDate',
    headerName: '측정일시',
    width: 160,
    valueFormatter: (params) => formatDate(params.value)
  },
  {
    field: 'bloodPressure',
    headerName: '혈압',
    width: 100,
    valueFormatter: (params) => params.value || '-'
  },
  {
    field: 'bmi',
    headerName: 'BMI',
    width: 80,
    valueFormatter: (params) => formatNumber(params.value)
  },
  {
    field: 'height',
    headerName: '신장(cm)',
    width: 100,
    valueFormatter: (params) => formatNumber(params.value)
  },
  {
    field: 'weight',
    headerName: '체중(kg)',
    width: 100,
    valueFormatter: (params) => formatNumber(params.value)
  },
  {
    field: 'HR',
    headerName: 'HR',
    width: 80,
    valueGetter: (params) => params.row.pulseWave?.HR,
    valueFormatter: (params) => formatNumber(params.value)
  },
  {
    field: 'PVC',
    headerName: 'PVC',
    width: 80,
    valueGetter: (params) => params.row.pulseWave?.PVC,
    valueFormatter: (params) => formatNumber(params.value, 2)
  },
  {
    field: 'BV',
    headerName: 'BV',
    width: 80,
    valueGetter: (params) => params.row.pulseWave?.BV,
    valueFormatter: (params) => formatNumber(params.value, 2)
  },
  {
    field: 'SV',
    headerName: 'SV',
    width: 80,
    valueGetter: (params) => params.row.pulseWave?.SV,
    valueFormatter: (params) => formatNumber(params.value, 2)
  },
  {
    field: 'memo',
    headerName: '메모',
    width: 200,
    flex: 1
  }
];

// 데이터 그리드용 행 변환 함수
export const transformRecordsToRows = (records) => {
  return records.map((record, index) => ({
    id: index,
    ...record,
    measurementDate: record.measurementDate,
    pulseWave: record.pulseWave || {}
  }));
};

// ✨ 환자 목록 조회
export const getPatientList = async (params = {}) => {
  try {
    const response = await apiInstance.get(API_ENDPOINTS.PATIENTS.BASE, { params });
    return response.data;
  } catch (error) {
    console.error('목록 조회 실패:', error);
    throw new Error('환자 목록을 불러오는데 실패했습니다.');
  }
};

const updatePatientInfo = async (id, data) => {
  // ... 기존 코드 유지 ...
};

// 맥파 데이터 검증
const validateWaveData = (data) => {
  const hasRecords = Boolean(data?.records);
  const hr = data?.records?.pulseWave?.heartRate;
  const pulseWave = Boolean(data?.records?.pulseWave);

  const isValid = hasRecords && hr && pulseWave;
  
  if (!isValid) {
    console.warn('⚠️ 맥파 데이터 검증 실패:', {
      hasRecords,
      hr,
      pulseWave
    });
  }

  return isValid;
};

// 기본 정보 검증
const validateBasicInfo = (data) => {
  const hasBasicInfo = Boolean(data?.basicInfo);
  const hasName = Boolean(data?.basicInfo?.name);
  const hasResidentNumber = Boolean(data?.basicInfo?.residentNumber);

  const isValid = hasBasicInfo && hasName && hasResidentNumber;

  if (!isValid) {
    console.warn('⚠️ 기본 정보 검증 실패:', {
      hasBasicInfo,
      hasName,
      hasResidentNumber
    });
  }

  return isValid;
};

// 심박수 데이터 정규화
const normalizeHeartRate = (data) => {
  const pulseWaveHR = data?.records?.pulseWave?.heartRate;
  const recordsHR = data?.records?.heartRate;
  const basicInfoHR = data?.basicInfo?.hr;

  // 우선순위: pulseWave.heartRate > records.heartRate > basicInfo.hr
  const heartRate = pulseWaveHR || recordsHR || basicInfoHR || '';

  return {
    ...data,
    basicInfo: {
      ...data.basicInfo,
      hr: heartRate  // 심박수 통일
    },
    records: {
      ...data.records,
      heartRate: heartRate,  // 심박수 통일
      pulseWave: {
        ...data.records?.pulseWave,
        heartRate: heartRate  // 심박수 통일
      }
    }
  };
};

// 환자 정보 저장
export const savePatientInfo = async (patientData) => {
  try {
    if (!patientData || typeof patientData !== 'object') {
      throw new Error('유효하지 않은 데이터 형식입니다.');
    }

    // 1단계: basicInfo 정제
    let cleanedBasicInfo = {};
    if (patientData?.basicInfo) {
      const { hr, heartRate, HR, ...restBasicInfo } = patientData.basicInfo;
      cleanedBasicInfo = restBasicInfo;
    }

    // 2단계: pulseWave 정제
    let cleanedPulseWave = {};
    if (patientData?.records?.pulseWave) {
      const { HR, hr, ...restPulseWave } = patientData.records.pulseWave;
      cleanedPulseWave = restPulseWave;
    }

    // 3단계: records 구조 명확히 정의
    const cleanedRecords = {
      heartRate: patientData.records?.pulseWave?.heartRate,
      pulseWave: {
        ...DEFAULT_PATIENT_DATA.records.pulseWave,
        ...cleanedPulseWave,
        heartRate: patientData.records?.pulseWave?.heartRate
      },
      stress: patientData.records?.stress || {},
      symptoms: patientData.records?.symptoms || [],
      medications: patientData.records?.medications || {},
      memo: patientData.records?.memo || ''  // memo는 records 내부에 위치
    };

    // 4단계: 최종 요청 데이터 구성
    const requestData = {
      basicInfo: {
        ...DEFAULT_PATIENT_DATA.basicInfo,
        ...cleanedBasicInfo
      },
      records: cleanedRecords  // 정제된 records 사용
    };

    // 5단계: 필수 필드 검증
    if (!requestData.basicInfo.name || !requestData.basicInfo.residentNumber) {
      throw new Error('이름과 주민번호는 필수입니다.');
    }

    if (!validateWaveData(requestData)) {
      throw new Error('맥파 데이터(심박수)가 필요합니다.');
    }

    // 6단계: 데이터 구조 검증
    console.log('📤 전송 전 데이터 구조 검증:', {
      basicInfo: {
        hasHr: 'hr' in requestData.basicInfo,
        keys: Object.keys(requestData.basicInfo)
      },
      records: {
        hasMemo: Boolean(requestData.records.memo),
        memoPath: 'records.memo에 위치',
        pulseWave: {
          hasHr: 'hr' in requestData.records.pulseWave,
          hasHR: 'HR' in requestData.records.pulseWave,
          heartRate: requestData.records.pulseWave.heartRate
        }
      }
    });

    // 7단계: 최종 JSON 확인
    const finalJSON = JSON.stringify(requestData, null, 2);
    console.log('📦 최종 전송 JSON (memo 위치 확인):', finalJSON);

    const response = await axios.post('/api/patients', requestData);
    console.log('✅ 서버 응답:', response.data);

    return response.data;
  } catch (error) {
    console.error('❌ 저장 실패:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      requestData: JSON.stringify(error.config?.data, null, 2)
    });
    throw error;
  }
};

/**
 * 환자 목록 조회
 */
export const getAllPatients = async () => {
  try {
    const response = await apiInstance.get('/patients');
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('조회 오류:', error);
    throw new Error(
      error.response?.data?.message || 
      error.message || 
      '환자 목록 조회에 실패했습니다.'
    );
  }
};

/**
 * 환자 정보 삭제
 */
export const deletePatientInfo = async (patientId) => {
  try {
    await apiInstance.delete(`/patients/${patientId}`);
    return {
      success: true,
      message: '환자 정보가 삭제되었습니다.'
    };
  } catch (error) {
    console.error('삭제 오류:', error);
    throw new Error(
      error.response?.data?.message || 
      error.message || 
      '삭제에 실패했습니다.'
    );
  }
};

// ✨ 환자 정보 조회
export const getPatientInfo = async (patientId) => {
  try {
    const response = await apiInstance.get(API_ENDPOINTS.PATIENTS.GET_ONE(patientId));
    return response.data;
  } catch (error) {
    console.error('조회 실패:', error);
    throw new Error('환자 정보를 불러오는데 실패했습니다.');
  }
};

// 환자 기록 조회 API
export const fetchPatientRecords = async (residentNumber) => {
  try {
    const response = await apiInstance.get(`/patients/${residentNumber}`);
    
    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    return response.data.data;
  } catch (error) {
    console.error('기록 조회 오류:', error);
    throw new Error('환자 기록을 불러오는데 실패했습니다.');
  }
};

// 기존 API 함수들과 새로운 함수를 하나의 객체로 통합
const patientApi = {
  getAllPatients,
  getPatientInfo,
  getPatientList,
  fetchPatientRecords,
  deletePatientInfo,
  patientGridColumns,
  transformRecordsToRows,
  savePatientInfo
};

// 단일 default export 사용
export default patientApi;