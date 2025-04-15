import axios from 'axios';

const API_URL = 'http://localhost:5003/api/patients';

// 문자열 정제 함수
const cleanString = (value) => {
  if (!value) return '';
  return value.trim();
};

// 숫자 정제 함수
const cleanNumber = (value) => {
  if (!value) return null;
  const num = parseFloat(value);
  return isNaN(num) ? null : num;
};

// 전화번호 포맷팅
const formatPhoneNumber = (phone) => {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length !== 11) return phone;
  return `${cleaned.slice(0,3)}-${cleaned.slice(3,7)}-${cleaned.slice(7)}`;
};

// 주민번호 포맷팅
const formatResidentNumber = (number) => {
  if (!number) return '';
  const cleaned = number.replace(/\D/g, '');
  if (cleaned.length !== 13) return number;
  return `${cleaned.slice(0,6)}-${cleaned.slice(6)}`;
};

// BMI 계산
const calculateBMI = (height, weight) => {
  if (!height || !weight) return null;
  const h = height / 100;
  return Number((weight / (h * h)).toFixed(1));
};

export const savePatientInfo = async (formData) => {
  try {
    // 기본 정보 정제
    const basicInfo = {
      name: cleanString(formData.name),
      residentNumber: formatResidentNumber(formData.residentNumber),
      phoneNumber: formatPhoneNumber(formData.phoneNumber),
      gender: cleanString(formData.gender),
      personality: cleanString(formData.personality),
      height: cleanNumber(formData.height),
      weight: cleanNumber(formData.weight),
      bmi: formData.bmi ? cleanNumber(formData.bmi) : calculateBMI(formData.height, formData.weight),
      bloodPressure: cleanString(formData.bloodPressure),
      workIntensity: cleanString(formData.workIntensity)
    };

    // 맥파 데이터 정제
    const pulseWave = {
      'a-b': cleanNumber(formData['a-b']),
      'a-c': cleanNumber(formData['a-c']),
      'a-d': cleanNumber(formData['a-d']),
      'a-e': cleanNumber(formData['a-e']),
      'b/a': cleanNumber(formData['b/a']),
      'c/a': cleanNumber(formData['c/a']),
      'd/a': cleanNumber(formData['d/a']),
      'e/a': cleanNumber(formData['e/a']),
      'HR': cleanNumber(formData.HR),
      'PVC': cleanNumber(formData.PVC),
      'BV': cleanNumber(formData.BV),
      'SV': cleanNumber(formData.SV)
    };

    // 스트레스 점수 계산
    const stressLevel = Array.isArray(formData.stressItems)
      ? formData.stressItems.reduce((sum, item) => sum + (Number(item.score) || 0), 0)
      : 0;

    // 서버 전송 데이터 구성
    const payload = {
      basicInfo,
      symptoms: formData.symptoms || [],
      stressLevel,
      stressItems: formData.stressItems || [],
      medications: formData.medications?.drugs || [],
      preferences: formData.medications?.preferences || [],
      pulseWave,
      measurementDate: new Date().toISOString(),
      memo: cleanString(formData.memo)
    };

    console.log('정제된 전송 데이터:', JSON.stringify(payload, null, 2));

    const response = await axios.post(API_URL, payload);

    if (response.data.success) {
      return {
        success: true,
        message: response.data.message,
        data: response.data.data
      };
    } else {
      throw new Error(response.data.message || '저장에 실패했습니다.');
    }

  } catch (error) {
    console.error('저장 오류:', error);
    throw new Error(
      error.response?.data?.message || 
      error.message || 
      '데이터 저장 중 오류가 발생했습니다.'
    );
  }
};

export default savePatientInfo; 