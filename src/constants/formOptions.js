export const FORM_RULES = {
  name: [
    { required: true, message: '이름을 입력해주세요' },
    { min: 2, message: '이름은 최소 2자 이상이어야 합니다' }
  ],
  residentNumber: [
    { required: true, message: '주민번호를 입력해주세요' },
    { pattern: /^\d{6}-\d{7}$/, message: '올바른 주민번호 형식이 아닙니다 (예: 123456-1234567)' }
  ],
  phoneNumber: [
    { required: true, message: '전화번호를 입력해주세요' },
    { pattern: /^01[0-9]-?\d{3,4}-?\d{4}$/, message: '올바른 전화번호 형식이 아닙니다' }
  ],
  height: [
    { required: true, message: '신장을 입력해주세요' },
    { type: 'number', min: 100, max: 250, message: '100-250cm 사이의 값을 입력해주세요' }
  ],
  weight: [
    { required: true, message: '체중을 입력해주세요' },
    { type: 'number', min: 30, max: 200, message: '30-200kg 사이의 값을 입력해주세요' }
  ],
  systolic: [
    { type: 'number', min: 70, max: 200, message: '70-200 사이의 값을 입력해주세요' }
  ],
  diastolic: [
    { type: 'number', min: 40, max: 130, message: '40-130 사이의 값을 입력해주세요' }
  ],
  stressAnswers: [
    { required: true, message: '스트레스 평가를 완료해주세요' }
  ]
};

export const FORM_HELP_TEXT = {
  residentNumber: '주민번호 형식: 123456-1234567',
  phoneNumber: '전화번호 형식: 010-1234-5678',
  height: '단위: cm',
  weight: '단위: kg',
  systolic: '수축기 혈압 (단위: mmHg)',
  diastolic: '이완기 혈압 (단위: mmHg)'
};

export const FIELD_LABELS = {
  name: '이름',
  residentNumber: '주민번호',
  phoneNumber: '전화번호',
  height: '신장',
  weight: '체중',
  bmi: 'BMI',
  systolic: '수축기 혈압',
  diastolic: '이완기 혈압',
  medications: '복용약물',
  preferences: '기호식품',
  memo: '메모',
  stressAnswers: '스트레스 평가',
  symptoms: '증상'
};

export const STRESS_EVALUATION = {
  ranges: [
    { min: 0, max: 4, level: '정상', description: '스트레스가 낮은 수준입니다.' },
    { min: 5, max: 8, level: '경미', description: '약간의 스트레스가 있습니다.' },
    { min: 9, max: 12, level: '중등도', description: '관리가 필요한 스트레스 수준입니다.' },
    { min: 13, max: 16, level: '심각', description: '전문가와 상담이 필요한 수준입니다.' }
  ]
};

export const INITIAL_FORM_VALUES = {
  name: '',
  residentNumber: '',
  phoneNumber: '',
  gender: '',
  personality: '',
  workIntensity: '',
  height: '',
  weight: '',
  bmi: '',
  systolic: '',
  diastolic: '',
  medications: [],
  preferences: [],
  memo: '',
  stressAnswers: {},
  selectedSymptoms: []
}; 