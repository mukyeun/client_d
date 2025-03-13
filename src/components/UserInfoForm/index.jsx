import React, { useState, useRef, useEffect } from 'react';
import { saveUserInfo, LOCAL_STORAGE_KEY } from '../../App';  // App.js의 saveUserInfo 함수 import
import ExcelJS from 'exceljs';
import { 증상카테고리 } from '../../data/symptoms';
import { 약물카테고리 } from '../../data/medications';
import { 기호식품카테고리 } from '../../data/preferences';
import '../../styles/UserInfoForm.css';
import { read, utils } from 'xlsx';
import { useNavigate } from 'react-router-dom';
import { 스트레스카테고리, evaluateStressLevel } from '../../data/stressEvents';
import { Box, Typography, Button } from '@mui/material';
// Excel 날짜를 JavaScript Date로 변환하는 함수
const excelDateToJSDate = (excelDate) => {
  try {
    if (!excelDate) return null;
    const EXCEL_EPOCH = new Date(Date.UTC(1899, 11, 30));
    const msPerDay = 24 * 60 * 60 * 1000;
    const date = new Date(EXCEL_EPOCH.getTime() + (excelDate - 1) * msPerDay);
    
    // 유효성 검사
    if (isNaN(date.getTime())) {
      console.warn('유효하지 않은 Excel 날짜:', excelDate);
      return null;
    }
    
    return date;
  } catch (error) {
    console.error('Excel 날짜 변환 오류:', { excelDate, error });
    return null;
  }
};
// 날짜 문이터 처리 함수
const processDateValue = (rawDate) => {
  try {
    if (!rawDate) return null;
    // 숫자형 Excel 날짜
    if (typeof rawDate === 'number') {
      const date = excelDateToJSDate(rawDate);
      console.log('Excel 날짜 변환:', {
        원본: rawDate,
        변환결과: date?.toLocaleString()
      });
      return date;
    }
    // 문자열 날짜
    const dateStr = rawDate.toString().trim();
    if (!dateStr) return null;
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      console.warn('유효하지 않은 날짜 문자열:', dateStr);
      return null;
    }
    console.log('문자열 날짜 변환:', {
      원본: dateStr,
      변환결과: date.toLocaleString()
    });
    return date;
  } catch (error) {
    console.error('날짜 처리 오류:', { rawDate, error });
    return null;
  }
};
// 초기 상태를 컴포넌트 외부에 정의
const initialFormState = {
  name: '',
  residentNumber: '',
  phone: '',
  gender: '',
  height: '',
  weight: '',
  bmi: '',
  personality: '',
  workIntensity: '',
  pulse: '',
  systolicBP: '',
  diastolicBP: '',
  ab_ms: '',
  ac_ms: '',
  ad_ms: '',
  ae_ms: '',
  ba_ratio: '',
  ca_ratio: '',
  da_ratio: '',
  ea_ratio: '',
  selectedCategory: '',
  selectedSubCategory: '',
  selectedSymptom: '',
  selectedSymptoms: [],
  medication: '',
  preference: '',
  memo: '',
  pvc: '',
  bv: '',
  sv: '',
  heartRate: '',
  selectedStressEvents: [],
  stressScore: 0,
  stressLevel: '',
  stressDescription: ''
};
// 데이터 로딩 체크 함수
const checkDataLoaded = () => {
  const isLoaded = !!증상카테고리 && !!약물카테고리 && !!기호식품카테고리;
  if (!isLoaded) {
    console.error('필요한 데이터가 로드되지 않았습니다:', {
      증상카테고리: !!증상카테고리,
      약물카테고리: !!약물카테고리,
      기호식품카테고리: !!기호식품카테고리
    });
  }
  return isLoaded;
};
// 로컬 스토리지 키 상수 정의
const USER_DATA_KEY = 'ubioUserData';
// 로컬 스토리지 저장 함수
const saveToLocalStorage = (data) => {
  try {
    const existingData = JSON.parse(localStorage.getItem(USER_DATA_KEY) || '[]');
    const newData = {
      ...data,
      timestamp: new Date().toISOString() // 저장 시점 기록
    };
    
    // 기존 데이터에 추가
    existingData.push(newData);
    localStorage.setItem(USER_DATA_KEY, JSON.stringify(existingData));
    
    console.log('데이터 저장 완료:', newData);
    return true;
  } catch (error) {
    console.error('로컬 저장소 저장 실패:', error);
    return false;
  }
};
// 로컬 스토리지에서 데이터 불러오기 함수
const loadFromLocalStorage = (userName) => {
  try {
    const allData = JSON.parse(localStorage.getItem(USER_DATA_KEY) || '[]');
    
    // 해당 사용자의 데이터만 필터링
    const userData = allData
      .filter(data => data.name === userName)
      // 날짜순 정렬 (최신순)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    return userData[0] || null; // 가장 최신 데이터 반환
  } catch (error) {
    console.error('로컬 저장소 불러오기 실패:', error);
    return null;
  }
};
// UserInfoForm 컴포넌트 정의
const UserInfoForm = ({ onSubmit, initialValues = {}, mode = 'create' }) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    ...initialFormState,
    ...initialValues
  });
  const fileInputRef = useRef(null);
  const [dataAvailable, setDataAvailable] = useState(checkDataLoaded());
  const [selectedStressCategory, setSelectedStressCategory] = useState('');
  const [selectedStressItems, setSelectedStressItems] = useState([]);
  const [stressLevel, setStressLevel] = useState('');
  const [data, setData] = useState([]);  // 데이터 배열
  const [selectedItems, setSelectedItems] = useState([]);  // 선택된 항목들
  const [tableData, setTableData] = useState([]);  // 테이블 데이터
  const [selectedIds, setSelectedIds] = useState([]);  // 선택된 행의 ID들
  // initialValues가 변경될 때 폼 데이터 업데이트
  useEffect(() => {
    if (initialValues && Object.keys(initialValues).length > 0) {
      setFormData(prev => ({
        ...prev,
        ...initialValues,
        selectedSymptoms: initialValues.selectedSymptoms || [],
        // 다른 필드들은 그대로 유지
      }));
    }
  }, [initialValues]);
  // useEffect를 조건부 렌더링 이전으로 이동
  useEffect(() => {
    const loadSavedData = () => {
      try {
        const savedData = localStorage.getItem(USER_DATA_KEY);
        if (savedData) {
          const parsedData = JSON.parse(savedData);
          console.log('로드된 데이터:', parsedData);
        }
      } catch (error) {
        console.error('데이터 로드 실패:', error);
      }
    };
    loadSavedData();
  }, []);
  // useEffect에서 초기화 확인 메시지 제거
  useEffect(() => {
    // 컴포넌트 마운트 시 필요한 초기화 작업만 수행
    const loadInitialData = () => {
      try {
        // 필요한 초기화 작업이 있다면 여기서 수행
        console.log('폼 초기화 완료');
      } catch (error) {
        console.error('초기화 중 오류:', error);
      }
    };
    loadInitialData();
  }, []);
  // 스트레스 항목이 변경될 때마다 스트레스 레벨을 업데이트하는 useEffect 추가
  useEffect(() => {
    if (selectedStressItems.length > 0) {
      const totalScore = selectedStressItems.reduce((sum, item) => sum + item.score, 0);
      const evaluation = evaluateStressLevel(totalScore);
      setStressLevel(evaluation.level); // 스트레스 레벨 업데이트
    } else {
      setStressLevel(''); // 선택된 항목이 없을 때는 초기화
    }
  }, [selectedStressItems]);
  // 데이터가 로드되지 않았을 때의 렌더링
  if (!dataAvailable) {
    return <div>데이터 로딩 중...</div>;
  }
  // BMI 자동 계산 함수
  const calculateBMI = (height, weight) => {
    if (height && weight) {
      const heightInMeters = height / 100;
      const bmi = (weight / (heightInMeters * heightInMeters)).toFixed(1);
      setFormData(prev => ({ ...prev, bmi }));
    }
  };
  // 전화번호 포맷팅 함수 추가
  const formatPhoneNumber = (value) => {
    const numbers = value.replace(/[^0-9]/g, '');
    if (numbers.length <= 3) {
      return numbers;
    } else if (numbers.length <= 7) {
      return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    } else {
      return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
    }
  };
  // handleInputChange 함수 수정
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // 전화번호 입력 처리
    if (name === 'phone') {
      const formattedPhone = formatPhoneNumber(value);
      if (formattedPhone.replace(/-/g, '').length <= 11) {
        setFormData(prev => ({
          ...prev,
          [name]: formattedPhone
        }));
      }
      return;
    }
    // 신장이나 체중이 변경될 때 BMI 재계산
    if (name === 'height' || name === 'weight') {
      const height = name === 'height' ? value : formData.height;
      const weight = name === 'weight' ? value : formData.weight;
      calculateBMI(height, weight);
    }
    // 기본 입력 처리
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  const handleCategoryChange = (e) => {
    setFormData(prev => ({
      ...prev,
      selectedCategory: e.target.value,
      selectedSubCategory: '',
      selectedSymptom: ''
    }));
  };
  const handleSubCategoryChange = (e) => {
    setFormData(prev => ({
      ...prev,
      selectedSubCategory: e.target.value,
      selectedSymptom: ''
    }));
  };
  const handleSymptomChange = (e) => {
    const symptom = e.target.value;
    if (symptom && !formData.selectedSymptoms.includes(symptom)) {
      setFormData(prev => ({
        ...prev,
        selectedSymptoms: [...prev.selectedSymptoms, symptom],
        selectedSymptom: ''
      }));
    }
  };
  const removeSymptom = (symptomToRemove) => {
    setFormData(prev => ({
      ...prev,
      selectedSymptoms: prev.selectedSymptoms.filter(symptom => symptom !== symptomToRemove)
    }));
  };
  const determineGender = (secondPart) => {
    if (!secondPart) return '';
    const firstDigit = secondPart.charAt(0);
    if (['1', '3', '5'].includes(firstDigit)) {
      return 'male';
    } else if (['2', '4', '6'].includes(firstDigit)) {
      return 'female';
    }
    return '';
  };
  const formatResidentNumber = (value) => {
    const numbers = value.replace(/[^0-9]/g, '');
    if (numbers.length <= 6) return numbers;
    return `${numbers.slice(0, 6)}-${numbers.slice(6, 13)}`;
  };
  const handleResidentNumberChange = (e) => {
    const formatted = formatResidentNumber(e.target.value);
    if (formatted.replace('-', '').length <= 13) {
      setFormData(prev => ({
        ...prev,
        residentNumber: formatted,
        gender: determineGender(formatted.split('-')[1])
      }));
    }
  };
  // handleSubmit 함수 수정
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      
      // PVC 계산 전 데이터 확인
      console.log('PVC 계산 전 formData:', formData);
      
      const pvc = calculatePVC(formData);
      console.log('계산된 PVC 값:', pvc);
      
      const bv = calculateBV(formData);
      const sv = calculateSV(formData);
      const hr = formData.pulse;
      
      const newData = {
        _id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        name: formData.name,
        residentNumber: formData.residentNumber,
        gender: formData.gender,
        personality: formData.personality,
        workIntensity: formData.workIntensity,
        height: formData.height,
        weight: formData.weight,
        bmi: formData.bmi,
        pulse: formData.pulse,
        systolicBP: formData.systolicBP,
        diastolicBP: formData.diastolicBP,
        ab_ms: formData.ab_ms,
        ac_ms: formData.ac_ms,
        ad_ms: formData.ad_ms,
        ae_ms: formData.ae_ms,
        ba_ratio: formData.ba_ratio,
        ca_ratio: formData.ca_ratio,
        da_ratio: formData.da_ratio,
        ea_ratio: formData.ea_ratio,
        pvc: pvc,
        bv: bv,
        sv: sv,
        hr: hr,
        symptoms: formData.selectedSymptoms,
        medication: formData.medication,
        preference: formData.preference,
        memo: formData.memo
      };
      console.log('저장되는 데이터:', newData);
      
      const currentData = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
      currentData.push(newData);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(currentData));
      
      console.log('localStorage 저장 후:', JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY)));
      
      setFormData(initialFormState);
      navigate('/data-view');
      
    } catch (error) {
      console.error('저장 오류:', error);
      alert('저장 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };
  // Excel 날짜 변환 함수
  const parseExcelDate = (dateValue) => {
    try {
      // 숫자형 Excel 날짜
      if (typeof dateValue === 'number') {
        const EXCEL_EPOCH = new Date(Date.UTC(1899, 11, 30));
        const msPerDay = 24 * 60 * 60 * 1000;
        const date = new Date(EXCEL_EPOCH.getTime() + (dateValue - 1) * msPerDay);
        
        console.log('Excel 날짜 변환:', {
          입력값: dateValue,
          변환결과: date.toLocaleString()
        });
        
        return date;
      }
      
      // 문자열 날짜
      const dateStr = String(dateValue).trim();
      const date = new Date(dateStr);
      
      console.log('문자열 날짜 변환:', {
        입력값: dateStr,
        변환결과: date.toLocaleString()
      });
      
      return date;
    } catch (error) {
      console.error('날짜 변환 실패:', { dateValue, error });
      return null;
    }
  };
  // 파일 입력 초기화
  const clearFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  // 데이터 초기화
  const clearFormData = () => {
    setFormData(prev => ({
      ...prev,
      ab_ms: '',
      ac_ms: '',
      ad_ms: '',
      ae_ms: '',
      ba_ratio: '',
      ca_ratio: '',
      da_ratio: '',
      ea_ratio: ''
    }));
  };
  const getLatestData = (rows, userName) => {
    try {
      console.log('전체 데이터:', rows); // 디버깅
      if (!Array.isArray(rows) || rows.length < 2) {
        throw new Error('데이터가 없거나 형식이 잘못되었습니다.');
      }
      // 헤더를 제외한 실제 데이터 행들
      const dataRows = rows.slice(1);
      
      // 해당 사용자의 데이터만 필터링
      const userRows = dataRows.filter(row => {
        const rowName = row[0]?.toString().trim();
        const matches = rowName === userName;
        console.log('행 검사:', { 행이름: rowName, 검색이름: userName, 일치: matches });
        return matches;
      });
      console.log('사용자 데이터:', userRows); // 디버깅
      if (userRows.length === 0) {
        throw new Error(`${userName}님의 데이터를 찾을 수 없습니다.`);
      }
      // 가장 최근 데이터 반환
      return userRows[0];
    } catch (error) {
      console.error('데이터 처리 오류:', error);
      throw error;
    }
  };
  // JSON 데이터 다운로드 함수
  const downloadJSON = (data, filename = 'excel-data.json') => {
    try {
      const jsonStr = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      console.log('JSON 데이터 다운로드 완료');
    } catch (error) {
      console.error('JSON 다운로드 실패:', error);
    }
  };
  // 데이터 검증 함수
  const validateExcelData = (rows) => {
    if (!Array.isArray(rows) || rows.length < 2) {
      console.error('유효하지 않은 데이터 구조:', rows);
      return false;
    }
    // 헤더 검증
    const headers = rows[0];
    if (!Array.isArray(headers) || headers.length < 17) {
      console.error('유효하지 않은 헤더:', headers);
      return false;
    }
    // 데이터 행 검증
    const dataRows = rows.slice(1);
    const validRows = dataRows.filter(row => {
      if (!Array.isArray(row)) return false;
      
      const hasName = row[0]?.toString().trim();
      const hasDate = row[5] != null;
      const hasValues = row.slice(9, 17).some(val => 
        val != null && val.toString().trim() !== ''
      );
      return hasName && hasDate && hasValues;
    });
    console.log('데이터 검증 결과:', {
      전체행수: rows.length,
      유효행수: validRows.length,
      헤더: headers
    });
    return validRows.length > 0;
  };
  // 데이터 필드 검증
  const validateField = (value) => {
    if (value == null || value === undefined) return '';
    return value.toString().trim();
  };
  // 데이터 매핑 함수
  const mapExcelData = (data) => {
    try {
      // 데이터 검증
      if (!Array.isArray(data) || data.length < 17) {
        throw new Error('유효하지 않은 데이터 형식입니다.');
      }
      const mappedData = {
        ab_ms: data[9]?.toString() || '',
        ac_ms: data[10]?.toString() || '',
        ad_ms: data[11]?.toString() || '',
        ae_ms: data[12]?.toString() || '',
        ba_ratio: data[13]?.toString() || '',
        ca_ratio: data[14]?.toString() || '',
        da_ratio: data[15]?.toString() || '',
        ea_ratio: data[16]?.toString() || ''
      };
      // 데이터 유효성 검사
      const hasValidData = Object.values(mappedData).some(value => 
        value !== '' && !isNaN(parseFloat(value))
      );
      if (!hasValidData) {
        throw new Error('유효한 맥파 데이터가 없습니다.');
      }
      return mappedData;
    } catch (error) {
      console.error('데이터 매핑 오류:', error);
      throw error;
    }
  };
  // 파일 선택 버튼 클릭 핸들러
  const handleFileButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  // 맥파 데이터만 리셋하는 함수
  const resetPulseData = () => {
    setFormData(prev => ({
      ...prev,
      ab_ms: '',
      ac_ms: '',
      ad_ms: '',
      ae_ms: '',
      ba_ratio: '',
      ca_ratio: '',
      da_ratio: '',
      ea_ratio: ''
    }));
  };
  // 데이터 유효성 검사 함수
  const validatePulseData = (data) => {
    if (!Array.isArray(data)) return false;
    
    // 모든 필드가 숫자나 빈 문자열인지 확인
    const isValidFormat = Object.values(data).every(value => 
      value === '' || (!isNaN(parseFloat(value)) && isFinite(value))
    );
    if (!isValidFormat) return false;
    // 최소한 하나의 유효한 값이 있는지 확인
    const hasValidValue = Object.values(data).some(value => 
      value !== '' && !isNaN(parseFloat(value))
    );
    return hasValidValue;
  };
  // 유비오 맥파 데이터 컬럼 매핑
  const UBIO_COLUMNS = {
    NAME: 'A',           // 이름 컬럼
    DATE: 'F',          // 측정일시 컬럼
    WAVE_DATA: {
      'J': 'ab_ms',     // a-b
      'K': 'ac_ms',     // a-c
      'L': 'ad_ms',     // a-d
      'M': 'ae_ms',     // a-e
      'N': 'ba_ratio',  // b/a
      'O': 'ca_ratio',  // c/a
      'P': 'da_ratio',  // d/a
      'Q': 'ea_ratio'   // e/a
    }
  };
  // 파일 선택 핸들러 수정
  const handleFileSelect = async (event) => {
    try {
      if (!formData.name) {
        throw new Error('먼저 이름을 입력해주세요.');
      }
      const file = event.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const workbook = read(e.target.result, { type: 'array' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const rows = utils.sheet_to_json(firstSheet, { header: 1 });
          // 데이터 검증
          if (!rows || rows.length < 2) {
            throw new Error('유효하지 않은 데이터 형식입니다.');
          }
          // 사용자 이름으로 데이터 필터링
          const userName = formData.name.trim();
          const userRows = rows.slice(1).filter(row => {
            const rowName = row[0]?.toString().trim();
            return rowName === userName;
          });
          if (userRows.length === 0) {
            throw new Error(`${userName}님의 데이터를 찾을 수 없습니다.`);
          }
          // 날짜순 정렬 및 최신 데이터 선택
          const latestRow = userRows.sort((a, b) => {
            const dateA = new Date(a[5]); // F열 (측정일시)
            const dateB = new Date(b[5]);
            return dateB - dateA;
          })[0];
          // 맥파 데이터 매핑
          const waveData = {
            ab_ms: latestRow[9]?.toString() || '',    // J열
            ac_ms: latestRow[10]?.toString() || '',   // K열
            ad_ms: latestRow[11]?.toString() || '',   // L열
            ae_ms: latestRow[12]?.toString() || '',   // M열
            ba_ratio: latestRow[13]?.toString() || '', // N열
            ca_ratio: latestRow[14]?.toString() || '', // O열
            da_ratio: latestRow[15]?.toString() || '', // P열
            ea_ratio: latestRow[16]?.toString() || ''  // Q열
          };
          // 데이터 유효성 검사
          const hasValidData = Object.values(waveData).some(value => 
            value !== '' && !isNaN(parseFloat(value))
          );
          if (!hasValidData) {
            throw new Error('유효한 맥파 데이터가 없습니다.');
          }
          // 폼 데이터 업데이트
          setFormData(prev => ({
            ...prev,
            ...waveData,
            // PVC, BV, SV는 자동으로 계산됨 (기존 계산 함수 사용)
            measurementDate: new Date(latestRow[5]).toLocaleString() // 측정일시 저장
          }));
          alert(`${userName}님의 최신 맥파 데이터가 로드되었습니다.\n측정일시: ${new Date(latestRow[5]).toLocaleString()}`);
        } catch (error) {
          console.error('데이터 처리 오류:', error);
          alert(error.message);
        }
      };
      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error('파일 처리 오류:', error);
      alert(error.message);
    } finally {
      if (event?.target) {
        event.target.value = '';
      }
    }
  };
  // 날짜 파싱 캐시 추가
  const dateCache = new Map();
  function getParsedDate(dateStr) {
    if (!dateCache.has(dateStr)) {
      const [date, time] = dateStr.split(' ');
      const [month, day, year] = date.split('/');
      const [hours, minutes] = time.split(':');
      
      dateCache.set(dateStr, {
        month: parseInt(month),
        day: parseInt(day),
        year: parseInt(year),
        hours: parseInt(hours),
        minutes: parseInt(minutes)
      });
    }
    
    return dateCache.get(dateStr);
  }
  const validateFormData = () => {
    if (!formData.name?.trim()) {
      throw new Error('이름을 입력해주세요.');
    }
    const requiredFields = ['ab_ms', 'ac_ms', 'ad_ms', 'ae_ms', 'ba_ratio', 'ca_ratio', 'da_ratio', 'ea_ratio'];
    const missingFields = requiredFields.filter(field => !formData[field]?.trim());
    
    if (missingFields.length > 0) {
      throw new Error('맥파 데이터 먼 가져오세요.');
    }
    return true;
  };
  // 날짜 문자열을 Date 객체로 변환하는 함수
  const parseCustomDate = (dateStr) => {
    try {
      if (!dateStr) return null;
      
      // 문자열로 변환 및 공백 제거
      const str = dateStr.toString().trim();
      const [datePart, timePart = '00:00'] = str.split(' ');
      
      if (!datePart) return null;
      // YY-MM-DD 형식 처리
      const [year, month, day] = datePart.split('-').map(Number);
      const [hour, minute] = timePart.split(':').map(Number);
      if (!year || !month || !day) {
        console.warn('잘못된 날짜 형식:', dateStr);
        return null;
      }
      // 2000년대로 변환
      const fullYear = year < 100 ? 2000 + year : year;
      const date = new Date(fullYear, month - 1, day, hour || 0, minute || 0);
      return date;
    } catch (error) {
      console.error('날짜 파싱 오류:', { dateStr, error });
      return null;
    }
  };
  // 맥파 데이터 계산 함수들 수정
  const calculatePVC = (formData) => {
    // 입력값 (a는 직접 계산)
    const ab = parseFloat(formData.ab_ms);    // a-b = 88
    const ac = parseFloat(formData.ac_ms);    // a-c = 157
    const ad = parseFloat(formData.ad_ms);    // a-d = 205
    const ae = parseFloat(formData.ae_ms);    // a-e = 278
    const b_a = parseFloat(formData.ba_ratio); // b/a = -0.77
    const c_a = parseFloat(formData.ca_ratio); // c/a = -0.39
    const d_a = parseFloat(formData.da_ratio); // d/a = -0.25
    const e_a = parseFloat(formData.ea_ratio); // e/a = 0.18
    if ([ab, ac, ad, ae, b_a, c_a, d_a, e_a].some(isNaN)) {
      return 'NaN';
    }
    // PVC = 0.2⋅ABS(b/a) + 0.15⋅ABS(d/a) + 0.1⋅(a-e) + 0.05⋅ABS(c/a)
    const result = (
      0.2 * Math.abs(b_a) +    // 0.2 * 0.77
      0.15 * Math.abs(d_a) +   // 0.15 * 0.25
      0.1 * ae +               // 0.1 * 278
      0.05 * Math.abs(c_a)     // 0.05 * 0.39
    );
    return result.toFixed(2);
  };
  const calculateBV = (formData) => {
    const ab = parseFloat(formData.ab_ms);    // a-b = 88
    const ac = parseFloat(formData.ac_ms);    // a-c = 157
    const ad = parseFloat(formData.ad_ms);    // a-d = 205
    const ae = parseFloat(formData.ae_ms);    // a-e = 278
    const b_a = parseFloat(formData.ba_ratio); // b/a = -0.77
    const c_a = parseFloat(formData.ca_ratio); // c/a = -0.39
    const d_a = parseFloat(formData.da_ratio); // d/a = -0.25
    const e_a = parseFloat(formData.ea_ratio); // e/a = 0.18
    if ([ab, ac, ad, ae, b_a, c_a, d_a, e_a].some(isNaN)) {
      return 'NaN';
    }
    // BV = 0.15⋅ABS(c/a) + 0.1⋅((a-d)-(a-c)) + 0.1⋅(a-e)/(a-b) + 0.05⋅(a-b)
    const result = (
      0.15 * Math.abs(c_a) +   // 0.15 * 0.39
      0.1 * (ad - ac) +        // 0.1 * (205 - 157)
      0.1 * (ae / ab) +        // 0.1 * (278 / 88)
      0.05 * ab                // 0.05 * 88
    );
    return result.toFixed(2);
  };
  const calculateSV = (formData) => {
    const ab = parseFloat(formData.ab_ms);    // a-b = 88
    const ae = parseFloat(formData.ae_ms);    // a-e = 278
    const b_a = parseFloat(formData.ba_ratio); // b/a = -0.77
    const d_a = parseFloat(formData.da_ratio); // d/a = -0.25
    if ([ab, ae, b_a, d_a].some(isNaN)) {
      return 'NaN';
    }
    // SV = 0.05⋅ABS(d/a) + 0.03⋅(a-e) + 0.02⋅ABS(b/a)
    const result = (
      0.05 * Math.abs(d_a) +   // 0.05 * 0.25
      0.03 * ae +              // 0.03 * 278
      0.02 * Math.abs(b_a)     // 0.02 * 0.77
    );
    return result.toFixed(2);
  };
  // 맥파 데이터가 변경될 때 호출되는 함수
  const updatePulseCalculations = () => {
    if (formData.ab_ms && formData.ac_ms && formData.ad_ms && formData.ae_ms) {
      const a = parseFloat(formData.ab_ms);
      const b = parseFloat(formData.ba_ratio);
      const c = parseFloat(formData.ca_ratio);
      const d = parseFloat(formData.da_ratio);
      const e = parseFloat(formData.ea_ratio);
      if (!isNaN(a) && !isNaN(b) && !isNaN(c) && !isNaN(d) && !isNaN(e)) {
        setFormData(prev => ({
          ...prev,
          pvc: calculatePVC(formData),
          bv: calculateBV(formData),
          sv: calculateSV(formData)
        }));
      }
    }
  };
  // useEffect를 사용하여 맥파 데이터가 변경될 때마다 계산 실행
  useEffect(() => {
    updatePulseCalculations();
  }, [formData.ab_ms, formData.ba_ratio, formData.ca_ratio, formData.da_ratio, formData.ea_ratio]);
  // resetForm 함수 추가
  const resetForm = () => {
    setFormData({
      name: '',
      residentNumber: '',
      gender: '',
      height: '',
      weight: '',
      bmi: '',
      personality: '',
      workIntensity: '',
      pulse: '',
      systolicBP: '',
      diastolicBP: '',
      ab_ms: '',
      ac_ms: '',
      ad_ms: '',
      ae_ms: '',
      ba_ratio: '',
      ca_ratio: '',
      da_ratio: '',
      ea_ratio: '',
      selectedCategory: '',
      selectedSubCategory: '',
      selectedSymptom: '',
      selectedSymptoms: [],
      medication: '',
      preference: '',
      memo: '',
      pvc: '',
      bv: '',
      sv: '',
      heartRate: '',
      selectedStressEvents: [],
      stressScore: 0,
      stressLevel: '',
      stressDescription: ''
    });
  };
  // validateForm 함수 수정
  const validateForm = () => {
    const newErrors = {};
    let isValid = true;
    // 필수 필드 검사
    if (!formData.name?.trim()) {
      newErrors.name = '이름을 입력해주세요';
      isValid = false;
    }
    if (!formData.residentNumber?.trim()) {
      newErrors.residentNumber = '주민번호를 입력해주세요';
      isValid = false;
    }
    if (!formData.height?.toString().trim()) {
      newErrors.height = '신장을 입력해주세요';
      isValid = false;
    }
    if (!formData.weight?.toString().trim()) {
      newErrors.weight = '체중을 입력해주세요';
      isValid = false;
    }
    setValidationErrors(newErrors);
    return isValid;
  };
  // 입력 필드에 에러 메시지 표시를 위한 스타일 추가
  const getInputStyle = (fieldName) => ({
    borderColor: validationErrors[fieldName] ? 'red' : undefined
  });
  // formatDate 함수 추가
  const formatDate = (date) => {
    if (!date) return '';
    
    try {
      if (typeof date === 'number') {
        // Excel 날짜 처리
        const EXCEL_EPOCH = new Date(Date.UTC(1899, 11, 30));
        const dateObj = new Date(EXCEL_EPOCH.getTime() + (date - 1) * 86400000);
        return dateObj.toLocaleString('ko-KR', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        });
      }
      
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) return '';
      
      return dateObj.toLocaleString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch (error) {
      console.error('날짜 형 변환 오류:', error);
      return '';
    }
  };
  // DataTable 컴포넌트
  const DataTable = ({ data }) => {
    if (!data) return null;
    return (
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>측정일시</th>
              <th>이름</th>
              <th>주민등록번호</th>
              <th>성별</th>
              <th>성격</th>
              <th>노동강도</th>
              <th>신장</th>
              <th>체중</th>
              <th>BMI지수</th>
              <th>맥박</th>
              <th>수축기혈압</th>
              <th>이완기혈압</th>
              <th>a-b</th>
              <th>a-c</th>
              <th>a-d</th>
              <th>a-e</th>
              <th>b/a</th>
              <th>c/a</th>
              <th>d/a</th>
              <th>e/a</th>
              <th>pvc</th>
              <th>bv</th>
              <th>sv</th>
              <th>hr</th>
              <th>증상</th>
              <th>복용약물</th>
              <th>기호식품</th>
              <th>메모</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><input type="text" name="name" /></td>
              <td><input type="text" name="residentNumber" /></td>
              <td>
                <select name="gender">
                  <option value="">선택</option>
                  <option value="male">남성</option>
                  <option value="female">여성</option>
                </select>
              </td>
              <td><input type="text" name="personality" /></td>
              <td>
                <select 
                  className="form-select"
                  value={stressLevel}
                  onChange={(e) => setStressLevel(e.target.value)}
                >
                  <option value="">선택하세요</option>
                  <option value="낮음">낮음</option>
                  <option value="중간">중간</option>
                  <option value="높음">높음</option>
                </select>
              </td>
              <td>
                <select name="workIntensity">
                  <option value="">선택하세요</option>
                  <option value="low">낮음</option>
                  <option value="medium">보통</option>
                  <option value="high">높음</option>
                </select>
              </td>
              <td><input type="number" name="height" /></td>
              <td><input type="number" name="weight" /></td>
              <td><input type="text" name="bmi" /></td>
              <td><input type="text" name="pulse" /></td>
              <td><input type="text" name="systolicBP" /></td>
              <td><input type="text" name="diastolicBP" /></td>
              <td><input type="text" name="ab_ms" /></td>
              <td><input type="text" name="ac_ms" /></td>
              <td><input type="text" name="ad_ms" /></td>
              <td><input type="text" name="ae_ms" /></td>
              <td><input type="text" name="ba_ratio" /></td>
              <td><input type="text" name="ca_ratio" /></td>
              <td><input type="text" name="da_ratio" /></td>
              <td><input type="text" name="ea_ratio" /></td>
              <td><input type="text" name="pvc" /></td>
              <td><input type="text" name="bv" /></td>
              <td><input type="text" name="sv" /></td>
              <td><input type="text" name="hr" /></td>
              <td><input type="text" name="symptoms" /></td>
              <td>
                <select name="medication">
                  <option value="">선택</option>
                  {약물카테고리.map((약물, index) => (
                    <option key={`medication-${index}-${약물}`} value={약물}>
                      {약물}
                    </option>
                  ))}
                </select>
              </td>
              <td>
                <select name="preference">
                  <option value="">선택</option>
                  {기호식품카테고리.map((기호품, index) => (
                    <option key={`preference-${index}`} value={기호품}>{기호품}</option>
                  ))}
                </select>
              </td>
              <td><textarea name="memo" /></td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  };
  // UserInfoForm 컴포넌트 내부에 스트레스 관련 핸들러 추가
  const handleStressCategoryChange = (e) => {
    setSelectedStressCategory(e.target.value);
  };
  const handleStressItemSelect = (e) => {
    const selectedItem = JSON.parse(e.target.value);
    if (!selectedStressItems.some(item => item.name === selectedItem.name)) {
      setSelectedStressItems([...selectedStressItems, selectedItem]);
    }
  };
  const removeStressItem = (itemToRemove) => {
    const newItems = selectedStressItems.filter(item => item.name !== itemToRemove.name);
    setSelectedStressItems(newItems);
    
    // 총점 재계산
    const totalScore = newItems.reduce((sum, item) => sum + item.score, 0);
    const evaluation = evaluateStressLevel(totalScore);
    
    // 스트레스 수준을 기존 입력필드 형식으로 변환
    let stressLevel = '';
    if (evaluation.level === '높음') {
      stressLevel = '매우 높음';
    } else if (evaluation.level === '중간') {
      stressLevel = '보통';
    } else {
      stressLevel = '낮음';
    }
    
    setFormData(prev => ({
      ...prev,
      stress: stressLevel, // 기존 스트레스 입력필드에 자동 입력
      stressScore: totalScore,
      stressLevel: evaluation.level,
      stressDescription: evaluation.description
    }));
  };
  // 체크박스 선택 처리
  const handleSelect = (id) => {
    setSelectedIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id);
      } else {
        return [...prev, id];
      }
    });
  };
  // 전체 선택 처리
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allIds = tableData.map(item => item.id);
      setSelectedIds(allIds);
    } else {
      setSelectedIds([]);
    }
  };
  // 선택된 항목 삭제
  const handleDelete = () => {
    if (selectedIds.length === 0) return;
    
    if (window.confirm('선택한 항목을 삭제하시겠습니까?')) {
      // 선택되지 않은 항목만 필터링하여 새로운 배열 생성
      const newData = tableData.filter(item => !selectedIds.includes(item.id));
      setTableData(newData);
      setSelectedIds([]); // 선택 초기화
    }
  };
  const handleLaunchUBioMacpa = async () => {
    console.log('Window object:', window);
    console.log('Electron:', window.electron);  // 'electronAPI' 대신 'electron' 사용
    
    try {
      if (!window.electron) {  // 'electronAPI' 대신 'electron' 사용
        console.error('Electron API가 없습니다');
        return;
      }
      
      const result = await window.electron.launchUbio();  // 'electronAPI' 대신 'electron' 사용
      console.log('실행 결과:', result);
    } catch (error) {
      console.error('프로그램 실행 오류:', error);
      alert('유비오맥파기 프로그램 실행 중 오류가 발생했습니다.');
    }
  };
  const handlePhoneChange = (e) => {
    const { value } = e.target;
    // 숫자만 추출
    const numericValue = value.replace(/[^0-9]/g, '');
    
    // 전화번호 형식으로 포맷팅 (010-1234-5678)
    if (numericValue.length <= 11) {
      let formattedValue = numericValue;
      if (numericValue.length > 3) {
        formattedValue = numericValue.replace(/(\d{3})(\d{1,4})(\d{0,4})/, '$1-$2-$3').replace(/-+$/, '');
      }
      setFormData(prev => ({
        ...prev,
        phone: formattedValue
      }));
    }
  };
  const handleDataFetch = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/ubio-data');
      const data = await response.json();
      
      console.log('서버로부터 받은 데이터:', data);

      setFormData(prevData => ({
        ...prevData,
        // 기존 필드들
        pulse: data.pulse || '',
        systolicBP: data.systolic || '',
        diastolicBP: data.diastolic || '',
        
        // 맥파 데이터 필드들 - 필드명 수정
        ab_ms: data.ab_ms || data.timeAB || '',
        ac_ms: data.ac_ms || data.timeAC || '',
        ad_ms: data.ad_ms || data.timeAD || '',
        ae_ms: data.ae_ms || data.timeAE || '',
        ba_ratio: data.ba_ratio || data.ratioBA || '',
        ca_ratio: data.ca_ratio || data.ratioCA || '',
        da_ratio: data.da_ratio || data.ratioDA || '',
        ea_ratio: data.ea_ratio || data.ratioEA || ''
      }));

      console.log('업데이트된 formData:', formData);

    } catch (error) {
      console.error('데이터 가져오기 실패:', error);
      setError('데이터를 가져오는데 실패했습니다.');
    }
  };
  return (
    <div className="registration-container">
      <form onSubmit={handleSubmit}>
        {/* 1. 기본 정보 섹션 */}
        <div className="form-box basic-info-box shadow-box">
          <div className="section-content">
            <h2 className="section-title">
              <i className="fas fa-id-card" style={{ color: '#3498db', marginRight: '12px' }}></i>
              기본정보
            </h2>
            <div className="input-row">
              <div className="input-group">
                <label className="form-label required">이름</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="이름을 입력하세요"
                  style={getInputStyle('name')}
                />
                {error && <span className="error-message">{error}</span>}
              </div>
              
              <div className="input-group">
                <label className="form-label required">주민등록번호</label>
                <input
                  type="text"
                  name="residentNumber"
                  value={formData.residentNumber}
                  onChange={handleResidentNumberChange}
                  placeholder="123456-1234567"
                  maxLength="14"
                  style={getInputStyle('residentNumber')}
                  required
                />
                {error && <span className="error-message">{error}</span>}
              </div>

              <div className="input-group">
                <label className="form-label required">연락처</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  placeholder="010-0000-0000"
                  maxLength="13"
                  style={getInputStyle('phone')}
                  required
                />
                {error && <span className="error-message">{error}</span>}
              </div>

              <div className="input-group">
                <label className="form-label">성별</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  style={getInputStyle('gender')}
                >
                  <option value="">선택하세요</option>
                  <option value="male">남성</option>
                  <option value="female">여성</option>
                </select>
                {error && <span className="error-message">{error}</span>}
              </div>
              <div className="input-group">
                <label className="form-label">성격</label>
                <select
                  name="personality"
                  value={formData.personality}
                  onChange={handleInputChange}
                  style={getInputStyle('personality')}
                >
                  <option value="">선택하세요</option>
                  <option value="매우 급함">매우 급함</option>
                  <option value="급함">급함</option>
                  <option value="원만">원만</option>
                  <option value="느긋">느긋</option>
                  <option value="매우 느긋">매우 느긋</option>
                </select>
                {error && <span className="error-message">{error}</span>}
              </div>
              <div className="input-group">
                <label className="form-label">노동강도</label>
                <select
                  name="workIntensity"
                  value={formData.workIntensity}
                  onChange={handleInputChange}
                  style={getInputStyle('workIntensity')}
                >
                  <option value="">선택하세요</option>
                  <option value="매우 높음">매우 높음</option>
                  <option value="높음">높음</option>
                  <option value="보통">보통</option>
                  <option value="낮음">낮음</option>
                  <option value="매우 낮음">매우 낮음</option>
                </select>
                {error && <span className="error-message">{error}</span>}
              </div>
              <div className="input-group">
                <label className="form-label">신장</label>
                <input
                  type="number"
                  name="height"
                  value={formData.height}
                  onChange={handleInputChange}
                  placeholder="cm"
                  style={getInputStyle('height')}
                />
                {error && <span className="error-message">{error}</span>}
              </div>
              <div className="input-group">
                <label className="form-label">체중</label>
                <input
                  type="number"
                  name="weight"
                  value={formData.weight}
                  onChange={handleInputChange}
                  placeholder="kg"
                  style={getInputStyle('weight')}
                />
                {error && <span className="error-message">{error}</span>}
              </div>
              <div className="input-group">
                <label className="form-label">BMI 지수</label>
                <input
                  type="text"
                  name="bmi"
                  value={formData.bmi}
                  readOnly
                  placeholder="BMI"
                  style={getInputStyle('bmi')}
                />
                {error && <span className="error-message">{error}</span>}
              </div>
            </div>
          </div>
        </div>

        {/* 2. 스트레스 평가 섹션 */}
        <div className="form-box stress-box shadow-box">
          <div className="section-content">
            <h2 className="section-title">
              <i className="fas fa-brain" style={{ color: '#e84393', marginRight: '12px' }}></i>
              스트레스 평가
            </h2>
            <div className="input-row">
              <div className="input-group">
                <label className="form-label">스트레스 대분류</label>
                <select
                  className="form-select"
                  value={selectedStressCategory}
                  onChange={handleStressCategoryChange}
                >
                  <option value="">선택하세요</option>
                  {스트레스카테고리.map((category, index) => (
                    <option key={index} value={category.대분류}>
                      {category.대분류}
                    </option>
                  ))}
                </select>
              </div>
              <div className="input-group">
                <label className="form-label">스트레스 항목</label>
                <select
                  className="form-select"
                  onChange={handleStressItemSelect}
                  disabled={!selectedStressCategory}
                >
                  <option value="">선택하세요</option>
                  {selectedStressCategory && 스트레스카테고리
                    .find(category => category.대분류 === selectedStressCategory)
                    ?.중분류.map((item, index) => (
                      <option key={index} value={JSON.stringify(item)}>
                        {item.name} ({item.score}점)
                      </option>
                    ))}
                </select>
              </div>
            </div>

            {selectedStressItems.length > 0 && (
              <div className="selected-items">
                <div className="selected-items-list">
                  {selectedStressItems.map((item, index) => (
                    <div key={index} className="selected-item">
                      <span>{item.name} ({item.score}점)</span>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedStressItems(
                            selectedStressItems.filter((_, i) => i !== index)
                          );
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                <div className="stress-evaluation">
                  {(() => {
                    const totalScore = selectedStressItems.reduce((sum, item) => sum + item.score, 0);
                    const evaluation = evaluateStressLevel(totalScore);
                    return (
                      <>
                        <div className="stress-total">총점: {totalScore}점</div>
                        <div className="stress-level">
                          스트레스 수준: <span className={`level-${evaluation.level}`}>{evaluation.level}</span>
                          <div className="level-description">({evaluation.description})</div>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 3. 증상 선택 섹션 */}
        <div className="form-box symptoms-box shadow-box">
          <div className="section-content">
            <h2 className="section-title">
              <i className="fas fa-notes-medical" style={{ color: '#f39c12', marginRight: '12px' }}></i>
              증상
            </h2>
            <div className="form-row symptoms-category-row">
              <div className="form-group category">
                <label className="form-label">대분류</label>
                <select value={formData.selectedCategory} onChange={handleCategoryChange} style={getInputStyle('selectedCategory')}>
                  <option value="">선택하세요</option>
                  {Object.keys(증상카테고리).map(category => (
                    <option key={`cat-${category}`} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                {error && <span className="error-message">{error}</span>}
              </div>
              <div className="form-group subcategory">
                <label className="form-label">중분류</label>
                <select value={formData.selectedSubCategory} onChange={handleSubCategoryChange} style={getInputStyle('selectedSubCategory')}>
                  <option value="">선택하세요</option>
                  {formData.selectedCategory && 
                    Object.keys(증상카테고리[formData.selectedCategory]).map(subCategory => (
                      <option key={`subcat-${formData.selectedCategory}-${subCategory}`} value={subCategory}>
                        {subCategory}
                      </option>
                    ))
                  }
                </select>
                {error && <span className="error-message">{error}</span>}
              </div>
              <div className="form-group symptom">
                <label className="form-label">소분류</label>
                <select value={formData.selectedSymptom} onChange={handleSymptomChange} style={getInputStyle('selectedSymptom')}>
                  <option value="">선택하세요</option>
                  {formData.selectedSubCategory && 
                    증상카테고리[formData.selectedCategory][formData.selectedSubCategory].map(symptom => (
                      <option 
                        key={`sym-${formData.selectedCategory}-${formData.selectedSubCategory}-${symptom.name}`} 
                        value={symptom.name}
                      >
                        {symptom.name}
                      </option>
                    ))
                  }
                </select>
                {error && <span className="error-message">{error}</span>}
              </div>
            </div>
            <div className="selected-symptoms">
              {formData.selectedSymptoms.map((symptom, index) => (
                <span key={`selected-${index}-${symptom.replace(/\s+/g, '-')}`} className="symptom-tag">
                  {symptom}
                  <button type="button" onClick={() => removeSymptom(symptom)}>×</button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* 4. 복용약물 섹션 */}
        <div className="form-box medication-box shadow-box">
          <div className="section-content">
            <h2 className="section-title">
              <i className="fas fa-capsules" style={{ color: '#1abc9c', marginRight: '12px' }}></i>
              복용약물
            </h2>
            <div className="form-row medication-row">
              <div className="form-group medication">
                <label className="form-label">복용 중인 약물</label>
                <select
                  name="medication"
                  value={formData.medication}
                  onChange={handleInputChange}
                  style={getInputStyle('medication')}
                >
                  <option key="default-medication" value="">약물을 선택하세요</option>
                  {약물카테고리.map((약물, index) => (
                    <option key={`medication-${index}-${약물}`} value={약물}>
                      {약물}
                    </option>
                  ))}
                </select>
                {error && <span className="error-message">{error}</span>}
              </div>
              <div className="form-group preference">
                <label className="form-label">기호식품</label>
                <select
                  name="preference"
                  value={formData.preference}
                  onChange={handleInputChange}
                  style={getInputStyle('preference')}
                >
                  <option key="default" value="">기호식품을 선택하세요</option>
                  {기호식품카테고리.map((기호품, index) => (
                    <option key={`preference-${index}`} value={기호품}>{기호품}</option>
                  ))}
                </select>
                {error && <span className="error-message">{error}</span>}
              </div>
            </div>
          </div>
        </div>

        {/* 5. 혈압 및 맥박수 섹션 */}
        <div className="form-box vital-signs-box shadow-box">
          <div className="section-content">
            <h2 className="section-title">
              <i className="fas fa-heart-pulse" style={{ color: '#e74c3c', marginRight: '12px' }}></i>
              생체정보
            </h2>
            <div className="input-row">
              <div className="input-group">
                <label className="form-label">맥박</label>
                <input
                  type="text"
                  name="pulse"
                  value={formData.pulse}
                  onChange={handleInputChange}
                  placeholder="회/분"
                  style={getInputStyle('pulse')}
                />
                {error && <span className="error-message">{error}</span>}
              </div>
              <div className="input-group">
                <label className="form-label">수축기 혈압</label>
                <input
                  type="text"
                  name="systolicBP"
                  value={formData.systolicBP}
                  onChange={handleInputChange}
                  placeholder="mmHg"
                  style={getInputStyle('systolicBP')}
                />
                {error && <span className="error-message">{error}</span>}
              </div>
              <div className="input-group">
                <label className="form-label">이완기 혈압</label>
                <input
                  type="text"
                  name="diastolicBP"
                  value={formData.diastolicBP}
                  onChange={handleInputChange}
                  placeholder="mmHg"
                  style={getInputStyle('diastolicBP')}
                />
                {error && <span className="error-message">{error}</span>}
              </div>
            </div>
          </div>
        </div>

        {/* 6. 맥파분석 섹션 */}
        <div className="form-box analysis-box shadow-box">
          <div className="section-content">
            <h2 className="section-title">
              <i className="fas fa-wave-square" style={{ color: '#9b59b6', marginRight: '12px' }}></i>
              맥파분석
            </h2>
            
            {/* 버튼 섹션 */}
            <div className="form-row file-control-row" style={{ marginBottom: '40px' }}>
              <div className="form-group button-container">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept=".xlsx,.xls"
                  style={{ display: 'none' }}
                />
                <button 
                  className="launch-button"
                  onClick={handleLaunchUBioMacpa}
                  style={{ marginRight: '20px' }}
                >
                  유비오맥파기 실행
                </button>
                <button 
                  className="launch-button"
                  onClick={handleFileButtonClick}
                >
                  유비오 맥파 데이터 가져오기
                </button>
              </div>
            </div>

            {/* 입력 필드 그리드 */}
            <div style={{ 
              display: 'grid',
              gridTemplateRows: 'repeat(3, auto)',
              gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
              gap: '20px',
              width: '90%',
              margin: '0 auto',
              maxWidth: '1200px'
            }}>
              {/* 첫 번째 행: a-b, a-c, a-d, a-e */}
              <div className="form-group" style={{ minWidth: 0 }}>
                <label className="form-label" style={{ 
                  marginBottom: '8px', 
                  display: 'block',
                  whiteSpace: 'nowrap'
                }}>a-b</label>
                <input
                  type="text"
                  name="ab_ms"
                  value={formData.ab_ms}
                  onChange={handleInputChange}
                  style={{ 
                    ...getInputStyle('ab_ms'),
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '6px',
                    minWidth: '0'
                  }}
                />
              </div>
              <div className="form-group" style={{ minWidth: 0 }}>
                <label className="form-label" style={{ 
                  marginBottom: '8px', 
                  display: 'block',
                  whiteSpace: 'nowrap'
                }}>a-c</label>
                <input
                  type="text"
                  name="ac_ms"
                  value={formData.ac_ms}
                  onChange={handleInputChange}
                  style={{ 
                    ...getInputStyle('ac_ms'),
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '6px',
                    minWidth: '0'
                  }}
                />
              </div>
              <div className="form-group" style={{ minWidth: 0 }}>
                <label className="form-label" style={{ 
                  marginBottom: '8px', 
                  display: 'block',
                  whiteSpace: 'nowrap'
                }}>a-d</label>
                <input
                  type="text"
                  name="ad_ms"
                  value={formData.ad_ms}
                  onChange={handleInputChange}
                  style={{ 
                    ...getInputStyle('ad_ms'),
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '6px',
                    minWidth: '0'
                  }}
                />
              </div>
              <div className="form-group" style={{ minWidth: 0 }}>
                <label className="form-label" style={{ 
                  marginBottom: '8px', 
                  display: 'block',
                  whiteSpace: 'nowrap'
                }}>a-e</label>
                <input
                  type="text"
                  name="ae_ms"
                  value={formData.ae_ms}
                  onChange={handleInputChange}
                  style={{ 
                    ...getInputStyle('ae_ms'),
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '6px',
                    minWidth: '0'
                  }}
                />
              </div>

              {/* 두 번째 행: b/a, c/a, d/a, e/a */}
              <div className="form-group" style={{ minWidth: 0 }}>
                <label className="form-label" style={{ 
                  marginBottom: '8px', 
                  display: 'block',
                  whiteSpace: 'nowrap'
                }}>b/a</label>
                <input
                  type="text"
                  name="ba_ratio"
                  value={formData.ba_ratio}
                  onChange={handleInputChange}
                  style={{ 
                    ...getInputStyle('ba_ratio'),
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '6px',
                    minWidth: '0'
                  }}
                />
              </div>
              <div className="form-group" style={{ minWidth: 0 }}>
                <label className="form-label" style={{ 
                  marginBottom: '8px', 
                  display: 'block',
                  whiteSpace: 'nowrap'
                }}>c/a</label>
                <input
                  type="text"
                  name="ca_ratio"
                  value={formData.ca_ratio}
                  onChange={handleInputChange}
                  style={{ 
                    ...getInputStyle('ca_ratio'),
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '6px',
                    minWidth: '0'
                  }}
                />
              </div>
              <div className="form-group" style={{ minWidth: 0 }}>
                <label className="form-label" style={{ 
                  marginBottom: '8px', 
                  display: 'block',
                  whiteSpace: 'nowrap'
                }}>d/a</label>
                <input
                  type="text"
                  name="da_ratio"
                  value={formData.da_ratio}
                  onChange={handleInputChange}
                  style={{ 
                    ...getInputStyle('da_ratio'),
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '6px',
                    minWidth: '0'
                  }}
                />
              </div>
              <div className="form-group" style={{ minWidth: 0 }}>
                <label className="form-label" style={{ 
                  marginBottom: '8px', 
                  display: 'block',
                  whiteSpace: 'nowrap'
                }}>e/a</label>
                <input
                  type="text"
                  name="ea_ratio"
                  value={formData.ea_ratio}
                  onChange={handleInputChange}
                  style={{ 
                    ...getInputStyle('ea_ratio'),
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '6px',
                    minWidth: '0'
                  }}
                />
              </div>

              {/* 세 번째 행: PVC, BV, SV, HR */}
              <div className="form-group" style={{ minWidth: 0 }}>
                <label className="form-label" style={{ 
                  marginBottom: '8px', 
                  display: 'block',
                  whiteSpace: 'nowrap'
                }}>말초혈관 수축도 (PVC)</label>
                <input
                  type="text"
                  name="pvc"
                  value={calculatePVC(formData)}
                  readOnly
                  className="analysis-result"
                  style={{ 
                    ...getInputStyle('pvc'),
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '6px',
                    minWidth: '0'
                  }}
                />
              </div>
              <div className="form-group" style={{ minWidth: 0 }}>
                <label className="form-label" style={{ 
                  marginBottom: '8px', 
                  display: 'block',
                  whiteSpace: 'nowrap'
                }}>혈액 점도 (BV)</label>
                <input
                  type="text"
                  name="bv"
                  value={calculateBV(formData)}
                  readOnly
                  className="analysis-result"
                  style={{ 
                    ...getInputStyle('bv'),
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '6px',
                    minWidth: '0'
                  }}
                />
              </div>
              <div className="form-group" style={{ minWidth: 0 }}>
                <label className="form-label" style={{ 
                  marginBottom: '8px', 
                  display: 'block',
                  whiteSpace: 'nowrap'
                }}>일회박출량 (SV)</label>
                <input
                  type="text"
                  name="sv"
                  value={calculateSV(formData)}
                  readOnly
                  className="analysis-result"
                  style={{ 
                    ...getInputStyle('sv'),
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '6px',
                    minWidth: '0'
                  }}
                />
              </div>
              <div className="form-group" style={{ minWidth: 0 }}>
                <label className="form-label" style={{ 
                  marginBottom: '8px', 
                  display: 'block',
                  whiteSpace: 'nowrap'
                }}>심박수 (HR)</label>
                <input
                  type="text"
                  name="hr"
                  value={formData.pulse}
                  readOnly
                  className="analysis-result"
                  style={{ 
                    ...getInputStyle('hr'),
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '6px',
                    minWidth: '0'
                  }}
                />
              </div>
            </div>

            {/* 에러 메시지 */}
            {error && <div className="error-message" style={{ marginTop: '10px' }}>{error}</div>}
          </div>
        </div>

        {/* 7. 메모 섹션 */}
        <div className="form-box memo-box shadow-box">
          <div className="section-content">
            <h2 className="section-title">
              <i className="fas fa-pen-to-square" style={{ color: '#7f8c8d', marginRight: '12px' }}></i>
              메모
            </h2>
            <div style={{ 
              width: '90%', 
              margin: '0 auto',
              maxWidth: '1200px'
            }}>
              <div className="form-group" style={{ width: '100%' }}>
                <textarea
                  name="memo"
                  value={formData.memo}
                  onChange={handleInputChange}
                  placeholder="메모를 입력하세요"
                  style={{
                    width: '100%',
                    minHeight: '100px',
                    padding: '10px',
                    boxSizing: 'border-box',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    resize: 'vertical'
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <style jsx>{`
          .memo-box .section-content {
            max-width: 100%;
          }

          .memo-box textarea {
            font-size: 0.9rem;
            line-height: 1.5;
          }

          @media (max-width: 1400px) {
            .memo-box .section-content > div {
              width: 95%;
            }
          }

          @media (max-width: 1200px) {
            .memo-box .section-content > div {
              width: 98%;
            }
            
            .memo-box textarea {
              font-size: 0.85rem;
            }
          }

          @media (max-width: 992px) {
            .memo-box .section-content > div {
              width: 100%;
            }
            
            .memo-box textarea {
              padding: 8px;
              font-size: 0.8rem;
            }
          }
        `}</style>
        
        {/* 제출 버튼 */}
        <div className="submit-section" style={{
          display: 'flex',
          justifyContent: 'center',
          marginTop: '2rem',
          marginBottom: '2rem'
        }}>
          <button 
            type="submit" 
            className="submit-button"
            style={{
              padding: '12px 40px',
              fontSize: '1.1rem',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            저장하기
          </button>
        </div>
      </form>
    </div>
  );
}
// 컴포넌트 내보내기
export default UserInfoForm;