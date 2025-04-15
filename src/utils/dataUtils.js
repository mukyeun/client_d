import { format } from 'date-fns';
import { cleanString } from './formatters';

// 숫자 데이터 안전하게 변환 (한 번만 선언)
const safeNumber = (value) => {
  if (value === null || value === undefined) return null;
  const num = Number(value);
  return isNaN(num) ? null : num;
};

const formatPhoneNumber = (phone) => {
  if (!phone) return '';
  const cleaned = phone.replace(/[^\d]/g, '');
  if (cleaned.length === 11) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7)}`;
  } else if (cleaned.length === 10) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  } else if (cleaned.length === 8) {
    return `${cleaned.slice(0, 4)}-${cleaned.slice(4)}`;
  }
  return phone;
};

const getGenderFromRRN = (rrn) => {
  if (!rrn) return '';
  const genderDigit = rrn.split('-')[1]?.[0];
  if (!genderDigit) return '';
  return ['1', '3'].includes(genderDigit) ? 'male' : ['2', '4'].includes(genderDigit) ? 'female' : '';
};

const calculateBMI = (height, weight) => {
  if (!height || !weight) return 0;
  const h = height / 100;
  return Number((weight / (h * h)).toFixed(1));
};

const DEFAULT_PULSE_WAVE = {
  hr: 75,
  pvc: 0.0,
  bv: 1.2,
  sv: 70.0,
  lastUpdated: null
};

const PULSE_WAVE_RANGES = {
  hr: { min: 40, max: 200 },
  pvc: { min: 0, max: 20 },
  bv: { min: 0, max: 100 },
  sv: { min: 0, max: 100 }
};

const calculatePulseValues = (wave) => {
  try {
    console.log('📊 맥파 계산 입력값:', wave);
    const HR = safeNumber(wave['HR']) || safeNumber(wave.hr);
    const ab = safeNumber(wave['a-b']);
    const ac = safeNumber(wave['a-c']);
    const ad = safeNumber(wave['a-d']);
    const ae = safeNumber(wave['a-e']);
    const b_a = safeNumber(wave['b/a']);
    const c_a = safeNumber(wave['c/a']);
    const d_a = safeNumber(wave['d/a']);

    if ([ab, ae, b_a, d_a].some(v => isNaN(v))) {
      console.warn('⚠️ 일부 맥파 값이 유효하지 않음:', { ab, ae, b_a, d_a });
      return null;
    }

    const BV = (
      0.15 * Math.abs(c_a) +
      0.1 * (ad - ac) +
      0.1 * (ae / ab) +
      0.05 * ab
    ).toFixed(2);

    const SV = (
      0.05 * Math.abs(d_a) +
      0.03 * ae +
      0.02 * Math.abs(b_a)
    ).toFixed(2);

    const PVC = Math.abs(b_a * 0.15).toFixed(2);

    console.log('🔢 계산된 맥파 값:', { HR, PVC, BV, SV, rawValues: { ab, ac, ad, ae, b_a, c_a, d_a } });

    return {
      hr: HR,
      pvc: Number(PVC),
      bv: Number(BV),
      sv: Number(SV)
    };
  } catch (error) {
    console.error('❌ 맥파 계산 중 오류:', error);
    return null;
  }
};

// 맥파 데이터 키 상수
const PULSE_WAVE_KEYS = {
  SNAKE_CASE: 'pulse_wave',
  CAMEL_CASE: 'pulseWave'
};

// 안전한 맥파 데이터 접근
const getPulseWaveData = (records) => {
  if (!records) {
    console.warn('⚠️ records 객체가 없음');
    return null;
  }

  // 데이터 접근 시도
  const pulseWave = records[PULSE_WAVE_KEYS.CAMEL_CASE] || records[PULSE_WAVE_KEYS.SNAKE_CASE];
  
  if (!pulseWave) {
    console.warn('⚠️ 맥파 데이터 없음:', {
      availableKeys: Object.keys(records),
      searchedKeys: Object.values(PULSE_WAVE_KEYS)
    });
    return null;
  }

  console.log('✅ 맥파 데이터 발견:', {
    keyFound: records[PULSE_WAVE_KEYS.CAMEL_CASE] ? 'pulseWave' : 'pulse_wave',
    dataKeys: Object.keys(pulseWave)
  });

  return pulseWave;
};

/**
 * 안전한 숫자 변환 (undefined, null, NaN 처리)
 */
const toNumber = (value) => {
  if (value === null || value === undefined || value === '') return 0;
  const num = Number(parseFloat(value));
  return isNaN(num) ? 0 : num;
};

/**
 * 맥파 데이터 정규화
 */
const normalizeWaveData = (data) => {
  // 기존 기본정보 섹션의 심박수 체크 제거
  const hr = {
    original: data?.records?.pulseWave?.heartRate, // 맥파분석 섹션의 심박수 사용
    normalized: data?.records?.pulseWave?.heartRate || 0,
    type: typeof data?.records?.pulseWave?.heartRate
  };

  // 심박수 데이터 검증
  if (!hr.original) {
    console.warn('⚠️ HR 데이터 누락:', hr);
    throw new Error('HR 데이터가 누락되었습니다');
  }

  return {
    ...data,
    records: {
      ...data.records,
      heartRate: hr.normalized,  // 맥파분석 섹션의 심박수로 설정
      pulseWave: {
        ...data.records.pulseWave,
        heartRate: hr.normalized  // 맥파분석 섹션의 심박수로 설정
      }
    }
  };
};

/**
 * 기본 정보 검증
 */
const validateBasicInfo = (basicInfo) => {
  if (!basicInfo || typeof basicInfo !== 'object') {
    console.warn('⚠️ basicInfo가 없거나 유효하지 않음:', basicInfo);
    return false;
  }

  const name = cleanString(basicInfo.name);
  const residentNumber = cleanString(basicInfo.residentNumber);

  if (!name || !residentNumber) {
    console.warn('⚠️ 필수 기본 정보 누락:', { name, residentNumber });
    return false;
  }

  return true;
};

/**
 * 숫자값 안전하게 추출 (객체 또는 원시값)
 */
const extractNumericValue = (field) => {
  // value 객체인 경우
  if (typeof field === 'object' && field !== null && 'value' in field) {
    return Number(field.value) || 0;
  }
  // 직접 숫자로 변환
  return Number(field) || 0;
};

/**
 * 문자열 안전하게 정제
 */
const sanitizeString = (str) => (typeof str === 'string' && str.trim() === '' ? null : str);

// 숫자 필드 정제 함수 개선
const sanitizeNumber = (value) => {
  if (value === '' || value === null || value === undefined) return null;
  const num = Number(value);
  return isNaN(num) ? null : num;
};

/**
 * 객체의 특정 필드들을 숫자로 정제
 */
const sanitizeNumberFields = (obj, fields) => {
  if (!obj || typeof obj !== 'object') return obj;
  
  const result = { ...obj };
  fields.forEach(field => {
    if (field in result) {
      result[field] = sanitizeNumber(result[field]);
    }
  });
  return result;
};

/**
 * medications 구조 정제 및 필수 필드 보장
 */
const sanitizeMedications = (medications) => {
  // 기본 구조 정의 (모든 필수 필드 포함)
  const defaultMedications = {
    drugs: [],
    preferences: [],
    allergies: [],      // ✅ 필수 필드
    sideEffects: [],    // ✅ 필수 필드
  };

  if (!medications) return defaultMedications;

  // 기존 데이터와 기본값 병합
  const result = {
    ...defaultMedications,
    ...medications,
    // medications.medications가 있으면 drugs로 이동
    drugs: medications.medications || medications.drugs || [],
    // 각 배열 필드가 undefined면 빈 배열로 설정
    preferences: medications.preferences || [],
    allergies: medications.allergies || [],
    sideEffects: medications.sideEffects || []
  };

  // medications 필드 제거 (이미 drugs로 이동됨)
  delete result.medications;

  // 데이터 구조 로깅
  console.log('💊 정제된 medications:', {
    hasAllFields: [
      'drugs',
      'preferences',
      'allergies',
      'sideEffects'
    ].every(field => Array.isArray(result[field])),
    fieldLengths: {
      drugs: result.drugs.length,
      preferences: result.preferences.length,
      allergies: result.allergies.length,
      sideEffects: result.sideEffects.length
    }
  });

  return result;
};

/**
 * 맥파 데이터 검증 및 변환
 */
const validatePulseWave = (pulseWave) => {
  if (!pulseWave || typeof pulseWave !== 'object') {
    console.warn('⚠️ 맥파 데이터 객체 누락:', pulseWave);
    return null;
  }

  // 각 필드 안전하게 변환
  const converted = {
    hr: safeNumber(pulseWave.hr),
    pvc: safeNumber(pulseWave.pvc),
    bv: safeNumber(pulseWave.bv),
    sv: safeNumber(pulseWave.sv),
    'a-b': safeNumber(pulseWave['a-b']),
    'a-c': safeNumber(pulseWave['a-c']),
    'a-d': safeNumber(pulseWave['a-d']),
    'a-e': safeNumber(pulseWave['a-e'])
  };

  // HR 필수 검증
  if (converted.hr === null) {
    console.warn('⚠️ HR 데이터 누락 또는 유효하지 않음:', {
      original: pulseWave.hr,
      converted: converted.hr
    });
    return null;
  }

  return converted;
};

/**
 * 전체 폼 데이터 정제
 */
const sanitizeFormData = (formData) => {
  try {
    // 기본 정보의 숫자 필드 정제
    const basicInfo = sanitizeNumberFields(
      {
        name: sanitizeString(formData.basicInfo?.name),
        residentNumber: sanitizeString(formData.basicInfo?.residentNumber),
        gender: sanitizeString(formData.basicInfo?.gender),
        personality: sanitizeString(formData.basicInfo?.personality),
        height: formData.basicInfo?.height,
        weight: formData.basicInfo?.weight,
        bmi: formData.basicInfo?.bmi,
        bloodPressure: sanitizeString(formData.basicInfo?.bloodPressure),
        workIntensity: sanitizeString(formData.basicInfo?.workIntensity)
      },
      ['height', 'weight', 'bmi']  // ✅ 숫자로 변환할 필드들
    );

    // records의 숫자 필드 정제
    const records = {
      heartRate: sanitizeNumber(formData.records?.heartRate),
      pulseWave: sanitizeNumberFields(
        formData.records?.pulseWave || {},
        ['heartRate', 'elasticityScore', 'PVC', 'BV', 'SV', 
         'a-b', 'a-c', 'a-d', 'a-e', 'b/a', 'c/a', 'd/a', 'e/a',
         'systolicBP', 'diastolicBP', 'pulsePressure']
      ),
      stress: formData.records?.stress || {},
      symptoms: Array.isArray(formData.records?.symptoms) ? formData.records.symptoms : [],
      medications: sanitizeMedications(formData.records?.medications),
      memo: sanitizeString(formData.records?.memo)
    };

    // 데이터 검증 로깅
    console.log('📊 정제된 숫자 필드:', {
      basicInfo: {
        height: basicInfo.height,
        weight: basicInfo.weight,
        bmi: basicInfo.bmi
      },
      pulseWave: {
        heartRate: records.pulseWave.heartRate,
        elasticityScore: records.pulseWave.elasticityScore
      }
    });

    // medications 구조 최종 검증
    console.log('📋 최종 medications 구조:', {
      hasAllRequiredFields: [
        'drugs',
        'preferences',
        'allergies',
        'sideEffects'
      ].every(field => Array.isArray(records.medications[field])),
      fields: Object.keys(records.medications)
    });

    return {
      basicInfo,
      records
    };

  } catch (error) {
    console.error('❌ 데이터 정제 중 오류:', error);
    throw new Error('데이터 정제 중 오류가 발생했습니다.');
  }
};

/**
 * 숫자형으로 안전하게 변환 (더 엄격한 버전)
 */
const toStrictNumber = (val) => {
  if (val === null || val === undefined) return undefined;
  const num = Number(val);
  return isNaN(num) ? undefined : num;
};

/**
 * 서버 전송용 스키마로 변환
 */
const transformToServerSchema = (sanitized) => {
  try {
    // 1. 기본 검증
    if (!sanitized?.basicInfo?.name || !sanitized?.basicInfo?.residentNumber) {
      console.warn('⚠️ 기본 정보 누락');
      return null;
    }

    // 2. records 데이터 접근
    const latestRecord = Array.isArray(sanitized.records) 
      ? sanitized.records[0] 
      : sanitized.records;

    if (!latestRecord) {
      console.warn('⚠️ 측정 기록 누락');
      return null;
    }

    // 3. 맥파 데이터에서 value 추출 및 숫자 변환
    const pulseWaveData = {
      hr: Number(extractNumericValue(latestRecord.hr)),
      pvc: Number(extractNumericValue(latestRecord.pvc)),
      bv: Number(extractNumericValue(latestRecord.bv)),
      sv: Number(extractNumericValue(latestRecord.sv)),
      'a-b': Number(extractNumericValue(latestRecord['a-b'])),
      'a-c': Number(extractNumericValue(latestRecord['a-c'])),
      'a-d': Number(extractNumericValue(latestRecord['a-d'])),
      'a-e': Number(extractNumericValue(latestRecord['a-e']))
    };

    // 4. HR 데이터 타입 검증
    if (typeof pulseWaveData.hr !== 'number' || isNaN(pulseWaveData.hr)) {
      console.warn('⚠️ HR 데이터 타입 오류:', {
        originalValue: latestRecord.hr,
        extractedValue: extractNumericValue(latestRecord.hr),
        finalValue: pulseWaveData.hr
      });
      return null;
    }

    // 5. 서버 전송 페이로드 구성
    const payload = {
      basicInfo: {
        name: sanitizeString(sanitized.basicInfo.name),
        residentNumber: sanitizeString(sanitized.basicInfo.residentNumber),
        gender: sanitizeString(sanitized.basicInfo.gender),
        personality: sanitizeString(sanitized.basicInfo.personality)
      },
      records: [{
        measurementDate: new Date().toISOString(),
        pulseWave: pulseWaveData,
        symptoms: latestRecord.symptoms || [],
        stress: latestRecord.stress || {},
        medications: latestRecord.medications || {},
        memo: sanitizeString(latestRecord.memo)
      }]
    };

    // 6. 최종 데이터 검증 로그
    console.log('✨ 최종 변환 데이터:', {
      hr: { value: pulseWaveData.hr, type: typeof pulseWaveData.hr },
      pvc: { value: pulseWaveData.pvc, type: typeof pulseWaveData.pvc },
      hasRecords: Array.isArray(payload.records)
    });

    return payload;

  } catch (error) {
    console.error('❌ 데이터 변환 중 오류:', error);
    return null;
  }
};

// 모든 export를 한 곳에서 관리
export {
  sanitizeFormData,
  transformToServerSchema,
  normalizeWaveData,
  calculatePulseValues,
  safeNumber,  // 한 번만 export
  cleanString,
  sanitizeString,
  sanitizeNumber,
  sanitizeNumberFields,
  sanitizeMedications
};
