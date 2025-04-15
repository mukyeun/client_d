/**
 * 문자열 정제 유틸리티
 */
export const cleanString = (str) => {
  if (!str) return '';
  return String(str).trim();
};

/**
 * 숫자 포맷팅 유틸리티
 */
export const formatNumber = (value, digits = 1) => {
  if (value === null || value === undefined) return '-';
  const num = Number(value);
  return isNaN(num) ? '-' : num.toFixed(digits);
};

/**
 * 날짜 포맷팅 유틸리티
 */
export const formatDate = (value) => {
  if (!value) return '-';
  try {
    const date = new Date(value);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return '-';
  }
};

/**
 * 전화번호 포맷팅
 */
export const formatPhoneNumber = (value) => {
  if (!value) return '';
  const cleaned = String(value).replace(/\D/g, '');
  const match = cleaned.match(/^(\d{3})(\d{4})(\d{4})$/);
  return match ? `${match[1]}-${match[2]}-${match[3]}` : value;
};

/**
 * 주민번호 관련 유틸리티
 */
export const residentNumberUtils = {
  format: (value) => {
    if (!value) return '';
    const cleaned = String(value).replace(/\D/g, '');
    const match = cleaned.match(/^(\d{6})(\d{7})$/);
    return match ? `${match[1]}-${match[2]}` : value;
  },
  validate: (value) => {
    if (!value) return false;
    const cleaned = String(value).replace(/\D/g, '');
    return /^\d{13}$/.test(cleaned);
  },
  getGender: (residentNumber) => {
    if (!residentNumber) return '';
    const genderDigit = residentNumber.replace(/[^0-9]/g, '')?.charAt(6);
    if (['1', '3', '5'].includes(genderDigit)) return 'male';
    if (['2', '4', '6'].includes(genderDigit)) return 'female';
    return '';
  },
  getBirthDate: (residentNumber) => {
    if (!residentNumber) return '';
    const cleaned = residentNumber.replace(/[^0-9]/g, '');
    if (cleaned.length < 7) return '';
    
    const yearPrefix = ['3', '4', '5', '6'].includes(cleaned.charAt(6)) ? '20' : '19';
    const year = yearPrefix + cleaned.slice(0, 2);
    const month = cleaned.slice(2, 4);
    const day = cleaned.slice(4, 6);
    
    return `${year}-${month}-${day}`;
  }
};

export default {
  residentNumberUtils,
  formatPhoneNumber,
  formatDate,
  formatNumber,
  cleanString
}; 