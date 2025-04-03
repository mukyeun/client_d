// 입력값 유효성 검사
export const isValidNumber = (value) => {
  return !isNaN(value) && value !== '' && value !== null;
};

// PVC (말초혈관 수축도) 계산
export const calculatePVC = (data) => {
  const { ba_ratio } = data;
  if (!isValidNumber(ba_ratio)) return '';

  const pvc = parseFloat(ba_ratio);
  if (pvc >= 0.7) return '정상';
  if (pvc >= 0.6) return '경도';
  if (pvc >= 0.5) return '중등도';
  return '중증';
};

// BV (혈액 점도) 계산
export const calculateBV = (data) => {
  const { da_ratio } = data;
  if (!isValidNumber(da_ratio)) return '';

  const bv = parseFloat(da_ratio);
  if (bv <= 0.45) return '정상';
  if (bv <= 0.55) return '경도';
  if (bv <= 0.65) return '중등도';
  return '중증';
};

// SV (일회박출량) 계산
export const calculateSV = (data) => {
  const { ca_ratio } = data;
  if (!isValidNumber(ca_ratio)) return '';

  const sv = parseFloat(ca_ratio);
  if (sv >= 0.9) return '정상';
  if (sv >= 0.8) return '경도';
  if (sv >= 0.7) return '중등도';
  return '중증';
};

// Excel 파일 데이터 파싱
export const parseExcelData = (data) => {
  // Excel 파일의 J~R 열에서 데이터 추출
  return {
    ab_ms: data['J'] || '',      // J열
    ac_ms: data['K'] || '',      // K열
    ad_ms: data['L'] || '',      // L열
    ae_ms: data['M'] || '',      // M열
    ba_ratio: data['N'] || '',   // N열
    ca_ratio: data['O'] || '',   // O열
    da_ratio: data['P'] || '',   // P열
    ea_ratio: data['Q'] || '',   // Q열
    pulse: data['R'] || ''       // R열 (HR)
  };
};

// 상수 정의
export const WAVE_ANALYSIS_CONSTRAINTS = {
  ab_ms: { min: 0, max: 1000, unit: 'ms' },
  ac_ms: { min: 0, max: 1000, unit: 'ms' },
  ad_ms: { min: 0, max: 1000, unit: 'ms' },
  ae_ms: { min: 0, max: 1000, unit: 'ms' },
  ba_ratio: { min: 0, max: 1, unit: 'ratio' },
  ca_ratio: { min: 0, max: 1, unit: 'ratio' },
  da_ratio: { min: 0, max: 1, unit: 'ratio' },
  ea_ratio: { min: 0, max: 1, unit: 'ratio' },
  pulse: { min: 40, max: 200, unit: 'bpm' }
};

// 개별 필드 유효성 검사
export const validateField = (name, value) => {
  if (!WAVE_ANALYSIS_CONSTRAINTS[name]) {
    return null;
  }

  const { min, max, unit } = WAVE_ANALYSIS_CONSTRAINTS[name];
  const numValue = parseFloat(value);

  if (value === '' || value === null) {
    return `${name} 값이 필요합니다.`;
  }

  if (isNaN(numValue)) {
    return `${name}: 올바른 숫자 형식이 아닙니다.`;
  }

  if (numValue < min || numValue > max) {
    return `${name}: 값이 허용 범위를 벗어났습니다. (${min}~${max} ${unit})`;
  }

  return null;
};

// 데이터 일관성 검사
export const validateDataConsistency = (data) => {
  // ms 값들의 순서 검사
  const timeValues = ['ab_ms', 'ac_ms', 'ad_ms', 'ae_ms'].map(key => parseFloat(data[key]));
  for (let i = 1; i < timeValues.length; i++) {
    if (timeValues[i] <= timeValues[i-1]) {
      return `시간 값의 순서가 올바르지 않습니다: ${timeValues[i-1]} >= ${timeValues[i]}`;
    }
  }

  // ratio 값들의 합이 1을 초과하는지 검사
  const ratioSum = ['ba_ratio', 'ca_ratio', 'da_ratio', 'ea_ratio']
    .map(key => parseFloat(data[key]))
    .reduce((sum, val) => sum + val, 0);
  
  if (ratioSum > 1) {
    return `비율 값들의 합이 1을 초과합니다: ${ratioSum.toFixed(2)}`;
  }

  return null;
};

// 전체 데이터 유효성 검사 (기존 함수 수정)
export const validateWaveData = (data) => {
  // 필수 필드 검사
  for (const field of Object.keys(WAVE_ANALYSIS_CONSTRAINTS)) {
    const fieldError = validateField(field, data[field]);
    if (fieldError) {
      return fieldError;
    }
  }

  // 데이터 일관성 검사
  const consistencyError = validateDataConsistency(data);
  if (consistencyError) {
    return consistencyError;
  }

  return null;
};

// 입력값 정규화
export const normalizeValue = (name, value) => {
  if (!value || !WAVE_ANALYSIS_CONSTRAINTS[name]) {
    return value;
  }

  const numValue = parseFloat(value);
  if (isNaN(numValue)) {
    return value;
  }

  // ms 단위는 정수로 반올림
  if (WAVE_ANALYSIS_CONSTRAINTS[name].unit === 'ms') {
    return Math.round(numValue).toString();
  }

  // ratio는 소수점 3자리까지
  if (WAVE_ANALYSIS_CONSTRAINTS[name].unit === 'ratio') {
    return numValue.toFixed(3);
  }

  // bpm은 정수로 반올림
  if (WAVE_ANALYSIS_CONSTRAINTS[name].unit === 'bpm') {
    return Math.round(numValue).toString();
  }

  return value;
}; 