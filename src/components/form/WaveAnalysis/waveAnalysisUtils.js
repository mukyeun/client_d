// 입력값이 유효한 숫자인지 확인
export const isValidNumber = (value) =>
  value !== '' && value !== null && !isNaN(parseFloat(value));

/**
 * 맥파 데이터 계산 헬퍼 함수들
 */

// 숫자 변환 유틸리티
const toNumber = (val) => {
  if (val === null || val === undefined || val === '') return null;
  const num = parseFloat(val);
  return isNaN(num) ? null : num;
};

/**
 * PVC(Peripheral Vascular Compliance) 계산
 * PVC = 0.2*ABS(b/a) + 0.15*ABS(d/a) + 0.1*(a-e) + 0.05*ABS(c/a)
 */
export const calculatePVC = (data) => {
  const ab = toNumber(data['a-b']);
  const hr = toNumber(data['HR']);

  if (ab === null || hr === null) {
    console.warn('⚠️ PVC 계산 실패:', { ab, hr });
    return NaN;
  }

  return ab / (60 / hr);  // 맥파속도 공식
};

/**
 * BV(Blood Viscosity) 계산
 * BV = 0.15*ABS(c/a) + 0.1*((a-d)-(a-c)) + 0.1*(a-e)/(a-b) + 0.05*(a-b)
 */
export const calculateBV = (data) => {
  const ab = toNumber(data['a-b']);
  const hr = toNumber(data['HR']);
  const ba = toNumber(data['b/a']);

  if (ab === null || hr === null || ba === null) {
    console.warn('⚠️ BV 계산 실패:', { ab, hr, ba });
    return NaN;
  }

  // 혈관나이 계산 공식
  const pvc = calculatePVC(data);
  if (isNaN(pvc)) return NaN;

  return (pvc * 0.5) + (Math.abs(ba) * 10);  // 예시 공식
};

/**
 * SV(Stroke Volume) 계산
 * SV = 0.05*ABS(d/a) + 0.03*(a-e) + 0.02*ABS(b/a)
 */
export const calculateSV = (data) => {
  const ba = toNumber(data['b/a']);
  const ca = toNumber(data['c/a']);
  const da = toNumber(data['d/a']);
  const ea = toNumber(data['e/a']);

  if ([ba, ca, da, ea].some(val => val === null)) {
    console.warn('⚠️ SV 계산 실패:', { ba, ca, da, ea });
    return NaN;
  }

  // 혈관탄성도 계산 공식
  return (Math.abs(ba) + Math.abs(ca) + Math.abs(da) + Math.abs(ea)) / 4 * 100;  // 예시 공식
};

// Excel 데이터 파싱 (J~R 열)
export const parseExcelData = (latest, EXCEL_COLUMNS) => {
  return {
    'a-b': toNumber(latest[EXCEL_COLUMNS['a-b']]),
    'a-c': toNumber(latest[EXCEL_COLUMNS['a-c']]),
    'a-d': toNumber(latest[EXCEL_COLUMNS['a-d']]),
    'a-e': toNumber(latest[EXCEL_COLUMNS['a-e']]),
    'b/a': toNumber(latest[EXCEL_COLUMNS['b/a']]),
    'c/a': toNumber(latest[EXCEL_COLUMNS['c/a']]),
    'd/a': toNumber(latest[EXCEL_COLUMNS['d/a']]),
    'e/a': toNumber(latest[EXCEL_COLUMNS['e/a']]),
    'HR': toNumber(latest[EXCEL_COLUMNS['HR']])
  };
};

// 유효성 제약 범위
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

// 단일 필드 유효성 검사
export const validateField = (name, value) => {
  const constraint = WAVE_ANALYSIS_CONSTRAINTS[name];
  if (!constraint) return null;

  const { min, max, unit } = constraint;
  const numValue = parseFloat(value);

  if (value === '' || value === null) {
    return `${name} 값이 필요합니다.`;
  }
  if (isNaN(numValue)) {
    return `${name} 값은 숫자여야 합니다.`;
  }
  if (numValue < min || numValue > max) {
    return `${name} 값은 ${min}~${max} ${unit} 범위여야 합니다.`;
  }

  return null;
};

// 시간 순서 및 비율 합계 검사
export const validateDataConsistency = (data) => {
  const times = ['ab_ms', 'ac_ms', 'ad_ms', 'ae_ms'].map((key) => parseFloat(data[key]));
  for (let i = 1; i < times.length; i++) {
    if (times[i] <= times[i - 1]) {
      return `시간 순서 오류: ${times[i - 1]} >= ${times[i]}`;
    }
  }

  const ratioSum = ['ba_ratio', 'ca_ratio', 'da_ratio', 'ea_ratio']
    .map((key) => parseFloat(data[key]))
    .reduce((sum, val) => sum + val, 0);

  if (ratioSum > 1) {
    return `비율 합계가 1을 초과합니다. (합: ${ratioSum.toFixed(2)})`;
  }

  return null;
};

// 전체 데이터 유효성 검사
export const validateWaveData = (data) => {
  for (const field of Object.keys(WAVE_ANALYSIS_CONSTRAINTS)) {
    const error = validateField(field, data[field]);
    if (error) return error;
  }

  return validateDataConsistency(data);
};

// 입력값 정규화 처리
export const normalizeValue = (name, value) => {
  if (!WAVE_ANALYSIS_CONSTRAINTS[name]) return value;

  const numValue = parseFloat(value);
  if (isNaN(numValue)) return value;

  const { unit } = WAVE_ANALYSIS_CONSTRAINTS[name];
  if (unit === 'ms' || unit === 'bpm') return Math.round(numValue).toString();
  if (unit === 'ratio') return numValue.toFixed(3);

  return value;
};

// 맥파 분석 입력 필드 정의
export const waveInputs = [
  { label: 'ab (ms)', name: 'ab_ms', placeholder: 'ab 간격' },
  { label: 'ac (ms)', name: 'ac_ms', placeholder: 'ac 간격' },
  { label: 'ad (ms)', name: 'ad_ms', placeholder: 'ad 간격' },
  { label: 'ae (ms)', name: 'ae_ms', placeholder: 'ae 간격' },
  { label: 'ba 비율', name: 'ba_ratio', placeholder: 'ba 비율' },
  { label: 'ca 비율', name: 'ca_ratio', placeholder: 'ca 비율' },
  { label: 'da 비율', name: 'da_ratio', placeholder: 'da 비율' },
  { label: 'ea 비율', name: 'ea_ratio', placeholder: 'ea 비율' },
  { label: '심박수 (HR)', name: 'hr', placeholder: '심박수' },
  { label: '맥파 속도 (PVC)', name: 'pvc', placeholder: '맥파 속도' },
  { label: '혈관 나이 (BV)', name: 'bv', placeholder: '혈관 나이' },
  { label: '혈관 탄성도 (SV)', name: 'sv', placeholder: '혈관 탄성도' }
];

// 맥파 데이터가 변경될 때 자동 계산 업데이트
export const updatePulseCalculations = (formData, setFormData) => {
  const ab = parseFloat(formData.ab_ms);
  const ac = parseFloat(formData.ac_ms);
  const ad = parseFloat(formData.ad_ms);
  const ae = parseFloat(formData.ae_ms);
  const b_a = parseFloat(formData.ba_ratio);
  const c_a = parseFloat(formData.ca_ratio);
  const d_a = parseFloat(formData.da_ratio);
  const e_a = parseFloat(formData.ea_ratio);

  if ([ab, ac, ad, ae, b_a, c_a, d_a, e_a].some(isNaN)) return;

  setFormData((prev) => ({
    ...prev,
    pvc: calculatePVC(formData),
    bv: calculateBV(formData),
    sv: calculateSV(formData)
  }));
}; 