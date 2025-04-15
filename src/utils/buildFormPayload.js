/**
 * 데이터 변환 유틸리티
 */

// 기본값 정의
const DEFAULT_VALUES = {
  bmi: 0,
  memo: '',
  stressLevel: 1,
  bloodPressure: '0/0',
  pulseWave: {
    'a-b': 0, 'a-c': 0, 'a-d': 0, 'a-e': 0,
    'b/a': 0, 'c/a': 0, 'd/a': 0, 'e/a': 0,
    HR: 0, PVC: 0, BV: 0, SV: 0
  }
};

/**
 * 숫자 변환 (기본값 보장)
 */
const safeNumber = (value, defaultValue = 0) => {
  if (value === null || value === undefined || value === '') return defaultValue;
  const num = Number(value);
  return isNaN(num) ? defaultValue : num;
};

/**
 * 스트레스 레벨 계산 (최소값 보장)
 */
const calculateStressLevel = (stressItems) => {
  if (!Array.isArray(stressItems) || !stressItems.length) {
    return DEFAULT_VALUES.stressLevel;
  }
  const total = stressItems.reduce((sum, item) => sum + (Number(item.score) || 0), 0);
  return Math.max(DEFAULT_VALUES.stressLevel, Math.round(total / stressItems.length));
};

/**
 * 맥파 데이터 정제
 */
const cleanPulseWave = (formData) => {
  return {
    'a-b': safeNumber(formData.ab_ms),
    'a-c': safeNumber(formData.ac_ms),
    'a-d': safeNumber(formData.ad_ms),
    'a-e': safeNumber(formData.ae_ms),
    'b/a': safeNumber(formData.ba_ratio),
    'c/a': safeNumber(formData.ca_ratio),
    'd/a': safeNumber(formData.da_ratio),
    'e/a': safeNumber(formData.ea_ratio),
    HR: safeNumber(formData.hr),
    PVC: safeNumber(formData.pvc),
    BV: safeNumber(formData.bv),
    SV: safeNumber(formData.sv)
  };
};

/**
 * 혈압 문자열 생성
 */
const formatBloodPressure = (systolic, diastolic) => {
  const sys = safeNumber(systolic);
  const dia = safeNumber(diastolic);
  return sys && dia ? `${sys}/${dia}` : DEFAULT_VALUES.bloodPressure;
};

/**
 * 폼 데이터를 API 페이로드로 변환
 */
export const buildFormPayload = (formState) => {
  console.log('원본 폼 데이터:', formState);

  try {
    // 기본 정보 (환자 정보)
    const basicInfo = {
      name: (formState.name || '').trim(),
      residentNumber: (formState.residentNumber || '').trim(),
      gender: formState.gender || 'unknown',
      personality: formState.personality || '보통'
    };

    // 필수 필드 검증
    if (!basicInfo.name || !basicInfo.residentNumber) {
      throw new Error('이름과 주민번호는 필수입니다.');
    }

    // 진료 기록
    const record = {
      // 측정값
      height: safeNumber(formState.height),
      weight: safeNumber(formState.weight),
      bmi: safeNumber(formState.bmi, DEFAULT_VALUES.bmi),
      bloodPressure: formatBloodPressure(
        formState.systolicPressure,
        formState.diastolicPressure
      ),
      
      // 연락처 및 상태
      phoneNumber: (formState.phone || formState.phoneNumber || '').trim(),
      workIntensity: formState.workIntensity || '보통',
      
      // 증상 및 스트레스
      symptoms: Array.isArray(formState.symptoms)
        ? formState.symptoms.filter(Boolean)
        : [],
      stressItems: Array.isArray(formState.stressItems)
        ? formState.stressItems.filter(Boolean)
        : [],
      
      // 약물 정보
      medications: {
        drugs: Array.isArray(formState.medications)
          ? formState.medications.filter(Boolean)
          : [],
        preferences: Array.isArray(formState.preferences)
          ? formState.preferences.filter(Boolean)
          : []
      },
      
      // 맥파 데이터
      pulseWave: cleanPulseWave(formState),
      
      // 메모 및 날짜
      memo: formState.memo?.trim() || DEFAULT_VALUES.memo,
      measurementDate: new Date().toISOString()
    };

    // 최종 페이로드 구성
    const payload = {
      basicInfo,
      records: [record] // 진료 기록을 배열로 감싸기
    };

    console.log('변환된 페이로드:', payload);
    return payload;

  } catch (error) {
    console.error('페이로드 생성 오류:', error);
    throw error;
  }
};

export default buildFormPayload; 