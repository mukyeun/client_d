// 숫자 변환 헬퍼 함수
const parseNumber = (value) => {
  const num = parseFloat(value);
  return isNaN(num) ? null : num;
};

// BMI 계산
export const calculateBMI = (height, weight) => {
  const h = parseNumber(height);
  const w = parseNumber(weight);
  if (!h || !w) return null;
  const bmi = w / ((h / 100) ** 2);
  return Math.round(bmi * 10) / 10;
};

// 주민번호 관련 유틸리티
export const residentNumberUtils = {
  format: (value) => {
    if (!value) return '';
    const cleaned = value.replace(/\D/g, '').slice(0, 13);
    if (cleaned.length <= 6) return cleaned;
    return `${cleaned.slice(0, 6)}-${cleaned.slice(6)}`;
  },

  getGender: (value) => {
    if (!value) return '';
    const genderDigit = value.replace(/\D/g, '')?.charAt(6);
    if (['1', '3', '5'].includes(genderDigit)) return 'male';
    if (['2', '4', '6'].includes(genderDigit)) return 'female';
    return '';
  },

  getAge: (value) => {
    if (!value) return null;
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length < 7) return null;
    
    const birthYear = parseInt(cleaned.slice(0, 2));
    const genderDigit = cleaned.charAt(6);
    const century = ['1', '2', '5', '6'].includes(genderDigit) ? 1900 : 2000;
    const fullYear = century + birthYear;
    
    const today = new Date();
    const age = today.getFullYear() - fullYear;
    return age;
  }
};

// 전화번호 포맷팅
export const phoneNumberUtils = {
  format: (value) => {
    if (!value) return '';
    const cleaned = value.replace(/\D/g, '').slice(0, 11);
    if (cleaned.length <= 3) return cleaned;
    if (cleaned.length <= 7) return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7)}`;
  },

  isValid: (value) => {
    const cleaned = value?.replace(/\D/g, '');
    return cleaned?.length === 11;
  }
};

// 혈압 포맷팅
export const bloodPressureUtils = {
  format: (diastolic, systolic) => {
    const d = parseNumber(diastolic);
    const s = parseNumber(systolic);
    if (!d || !s) return '';
    return `${d}/${s}`;
  },

  parse: (value) => {
    if (!value) return { diastolic: null, systolic: null };
    const [diastolic, systolic] = value.split('/').map(parseNumber);
    return { diastolic, systolic };
  },

  isValid: (diastolic, systolic) => {
    const d = parseNumber(diastolic);
    const s = parseNumber(systolic);
    return d > 0 && s > 0 && d < s;
  }
};

// React Hook 사용을 위한 커스텀 훅
export const useFormattedInputs = (formData, setFormData) => {
  const updateBasicInfo = (updates) => {
    setFormData(prev => ({
      ...prev,
      basicInfo: {
        ...prev.basicInfo,
        ...updates
      }
    }));
  };

  return {
    handleResidentNumberChange: (value) => {
      const formatted = residentNumberUtils.format(value);
      updateBasicInfo({
        residentNumber: formatted,
        gender: residentNumberUtils.getGender(formatted)
      });
    },

    handlePhoneNumberChange: (value) => {
      updateBasicInfo({
        phoneNumber: phoneNumberUtils.format(value)
      });
    },

    handleHeightWeightChange: (height, weight) => {
      const bmi = calculateBMI(height, weight);
      updateBasicInfo({ height, weight, bmi });
    },

    handleBloodPressureChange: (diastolic, systolic) => {
      updateBasicInfo({
        bloodPressure: bloodPressureUtils.format(diastolic, systolic)
      });
    }
  };
};

export default {
  calculateBMI,
  residentNumberUtils,
  phoneNumberUtils,
  bloodPressureUtils,
  useFormattedInputs
}; 