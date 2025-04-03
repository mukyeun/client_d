// 날짜 포맷팅 함수
export const formatDate = (date) => {
  if (!date) {
    return '';
  }

  const d = new Date(date);
  
  // 유효하지 않은 날짜인 경우
  if (isNaN(d.getTime())) {
    return '';
  }

  // 한국 시간대로 포맷팅
  return d.toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    fractionalSecondDigits: 3
  });
};

// 날짜 비교 함수
export const compareDates = (date1, date2) => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return d1.getTime() - d2.getTime();
};

// 날짜가 유효한지 확인하는 함수
export const isValidDate = (date) => {
  const d = new Date(date);
  return !isNaN(d.getTime());
}; 