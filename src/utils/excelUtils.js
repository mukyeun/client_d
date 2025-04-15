import * as XLSX from 'xlsx';

/**
 * 엑셀 파일에서 맥파 데이터 추출
 * @param {File} file - 엑셀 파일
 * @returns {Promise<Object>} 파싱된 맥파 데이터
 */
export const parsePulseWaveExcel = async (file) => {
  try {
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    console.debug('📊 엑셀 데이터 파싱:', { rows: jsonData.length });
    return extractLatestPulseWaveData(jsonData);
  } catch (error) {
    console.error('❌ 엑셀 파싱 오류:', error);
    throw new Error('엑셀 파일 읽기에 실패했습니다.');
  }
};

/**
 * 최신 맥파 데이터 추출
 * @param {Array} data - 파싱된 엑셀 데이터
 * @returns {Object} 최신 맥파 데이터
 */
const extractLatestPulseWaveData = (data) => {
  if (!data?.length) {
    console.warn('⚠️ 데이터가 비어있습니다.');
    return null;
  }

  // 측정일자 기준 정렬
  const sortedData = [...data].sort((a, b) => {
    return new Date(b['측정일자']) - new Date(a['측정일자']);
  });

  const latest = sortedData[0];
  console.debug('📅 최신 데이터:', latest);

  // 맥파 데이터 추출 및 정제
  const pulseWave = {
    'a-b': toNumber(latest['a-b']),
    'a-c': toNumber(latest['a-c']),
    'a-d': toNumber(latest['a-d']),
    'a-e': toNumber(latest['a-e']),
    'b/a': toNumber(latest['b/a']),
    'c/a': toNumber(latest['c/a']),
    'd/a': toNumber(latest['d/a']),
    'e/a': toNumber(latest['e/a']),
    HR: toNumber(latest['HR']),
    PVC: toNumber(latest['PVC']),
    BV: toNumber(latest['BV']),
    SV: toNumber(latest['SV'])
  };

  console.debug('💫 추출된 맥파 데이터:', pulseWave);
  return pulseWave;
};

// 숫자 변환 헬퍼
const toNumber = (value) => {
  const num = Number(value);
  return isNaN(num) ? null : num;
};

/**
 * 엑셀에서 특정 사용자의 가장 최신 데이터를 가진 행을 찾아 반환
 * @param {Array} rows - 엑셀에서 추출된 행 배열
 * @param {string} targetName - 찾고자 하는 사용자 이름
 * @returns {Object|null} - 해당 사용자의 최신 데이터 행
 */
export const findLatestUserRow = (rows, targetName) => {
  if (!Array.isArray(rows) || rows.length === 0 || !targetName) return null;

  // 이름 정규화 함수
  const normalize = (str) => {
    if (!str) return '';
    return str.toString()
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '')
      .normalize('NFC');
  };

  const normalizedTarget = normalize(targetName);

  // 해당 사용자의 모든 데이터 행 찾기
  const userRows = rows.filter(row => {
    const rowName = normalize(row[EXCEL_COLUMNS.NAME]);
    return rowName === normalizedTarget;
  });

  if (userRows.length === 0) return null;

  // 날짜 기준으로 정렬하여 최신 데이터 반환
  return userRows.sort((a, b) => {
    const dateA = new Date(a[EXCEL_COLUMNS.DATE]);
    const dateB = new Date(b[EXCEL_COLUMNS.DATE]);
    return dateB - dateA;  // 내림차순 정렬
  })[0];
};

// Excel 열 인덱스 상수
const EXCEL_COLUMNS = {
  NAME: 0,
  DATE: 5,
  'a-b': 9,
  'a-c': 10,
  'a-d': 11,
  'a-e': 12,
  'b/a': 13,
  'c/a': 14,
  'd/a': 15,
  'e/a': 16,
  'HR': 17
}; 