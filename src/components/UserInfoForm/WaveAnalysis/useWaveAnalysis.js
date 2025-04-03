import { useState, useRef, useEffect } from 'react';
import { message } from 'antd';
import * as XLSX from 'xlsx';
import { 
  calculatePVC, 
  calculateBV, 
  calculateSV, 
  parseExcelData,
  validateWaveData,
  validateField,
  normalizeValue
} from './waveAnalysisUtils';

export const useWaveAnalysis = () => {
  // 초기 상태 설정
  const [formData, setFormData] = useState({
    name: '',
    ab_ms: '',
    ac_ms: '',
    ad_ms: '',
    ae_ms: '',
    ba_ratio: '',
    ca_ratio: '',
    da_ratio: '',
    ea_ratio: '',
    hr: '',
    pvc: '',
    bv: '',
    sv: '',
    measurementDate: ''
  });

  const [error, setError] = useState(null);
  const [loading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const clearErrors = () => {
    setValidationErrors({});
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const validateData = (data) => {
    const newErrors = {};
    Object.entries(data).forEach(([key, value]) => {
      if (!value || value.trim() === '') {
        newErrors[key] = '필수 입력값입니다';
      } else if (isNaN(parseFloat(value))) {
        newErrors[key] = '숫자만 입력 가능합니다';
      }
    });
    setValidationErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLaunchUBioMacpa = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/launch-ubio', {
        method: 'POST'
      });
      
      if (!response.ok) {
        throw new Error('U-Bio Macpa 실행 실패');
      }
      
      message.success('U-Bio Macpa가 실행되었습니다.');
    } catch (error) {
      console.error('U-Bio 실행 오류:', error);
      message.error('U-Bio Macpa 실행 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDataFetch = async () => {
    try {
      setIsLoading(true);
      setValidationErrors({});

      const response = await fetch('/api/patients/wave-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('데이터 가져오기 실패');
      }

      const { data, measurementDate } = await response.json();

      // 맥파 데이터 계산 및 HR 데이터 포함
      const calculatedData = {
        ...data,
        pvc: calculatePVC(data),
        bv: calculateBV(data),
        sv: calculateSV(data),
        hr: data.hr || ''  // R열의 심박수 데이터
      };

      // 폼 데이터 업데이트
      setFormData(prev => ({
        ...prev,
        ...calculatedData
      }));

      message.success(`맥파 데이터가 로드되었습니다. (측정일: ${new Date(measurementDate).toLocaleDateString()})`);

    } catch (error) {
      console.error('데이터 가져오기 오류:', error);
      message.error(error.message || '데이터 가져오기 중 오류가 발생했습니다.');
      setValidationErrors({ general: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  // 맥파 데이터가 변경될 때마다 계산 실행
  useEffect(() => {
    if (formData.ab_ms && formData.ac_ms && formData.ad_ms && formData.ae_ms &&
        formData.ba_ratio && formData.ca_ratio && formData.da_ratio && formData.ea_ratio) {
      const pvc = calculatePVC(formData);
      const bv = calculateBV(formData);
      const sv = calculateSV(formData);

      setFormData(prev => ({
        ...prev,
        pvc,
        bv,
        sv
      }));
    }
  }, [formData.ab_ms, formData.ac_ms, formData.ad_ms, formData.ae_ms,
      formData.ba_ratio, formData.ca_ratio, formData.da_ratio, formData.ea_ratio]);

  // 입력 필드 스타일 함수
  const getInputStyle = (fieldName) => {
    const baseStyle = {
      width: '100%',
      boxSizing: 'border-box',
    };

    if (validationErrors[fieldName]) {
      return {
        ...baseStyle,
        borderColor: '#ff4d4f',
      };
    }

    return baseStyle;
  };

  // 데이터 초기화 함수
  const resetFormData = () => {
    setFormData({
      name: '',
      ab_ms: '',
      ac_ms: '',
      ad_ms: '',
      ae_ms: '',
      ba_ratio: '',
      ca_ratio: '',
      da_ratio: '',
      ea_ratio: '',
      hr: '',
      pvc: '',
      bv: '',
      sv: '',
      measurementDate: ''
    });
    setError(null);
    setValidationErrors({});
  };

  // 계산 함수들
  const calculatePVC = (data) => {
    const ab = parseFloat(data.ab_ms);
    const ae = parseFloat(data.ae_ms);
    const b_a = parseFloat(data.ba_ratio);
    const c_a = parseFloat(data.ca_ratio);
    const d_a = parseFloat(data.da_ratio);

    if ([ab, ae, b_a, c_a, d_a].some(isNaN)) {
      return 'NaN';
    }

    return (
      0.2 * Math.abs(b_a) +
      0.15 * Math.abs(d_a) +
      0.1 * ae +
      0.05 * Math.abs(c_a)
    ).toFixed(2);
  };

  const calculateBV = (data) => {
    const ab = parseFloat(data.ab_ms);
    const ac = parseFloat(data.ac_ms);
    const ad = parseFloat(data.ad_ms);
    const ae = parseFloat(data.ae_ms);
    const c_a = parseFloat(data.ca_ratio);

    if ([ab, ac, ad, ae, c_a].some(isNaN)) {
      return 'NaN';
    }

    return (
      0.15 * Math.abs(c_a) +
      0.1 * (ad - ac) +
      0.1 * (ae / ab) +
      0.05 * ab
    ).toFixed(2);
  };

  const calculateSV = (data) => {
    const ab = parseFloat(data.ab_ms);
    const ae = parseFloat(data.ae_ms);
    const b_a = parseFloat(data.ba_ratio);
    const d_a = parseFloat(data.da_ratio);

    if ([ab, ae, b_a, d_a].some(isNaN)) {
      return 'NaN';
    }

    return (
      0.05 * Math.abs(d_a) +
      0.03 * ae +
      0.02 * Math.abs(b_a)
    ).toFixed(2);
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
      'Q': 'ea_ratio',  // e/a
      'R': 'hr'         // 심박수
    }
  };

  // 파일 선택 핸들러
  const handleFileSelect = async (event, currentFormData, setFormData) => {
    console.log('파일 처리 시작');
    
    try {
      const file = event.target.files[0];
      if (!file) {
        console.log('파일이 선택되지 않음');
        return;
      }

      console.log('선택된 파일:', file.name);

      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          console.log('파일 읽기 완료');
          const workbook = XLSX.read(e.target.result, { type: 'array' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const rows = XLSX.utils.sheet_to_json(firstSheet, { 
            header: 1,
            raw: false
          });

          console.log('엑셀 데이터 파싱:', rows);

          // 데이터 매핑
          const latestRow = rows[rows.length - 1];
          console.log('마지막 행:', latestRow);

          setFormData(prev => ({
            ...prev,
            ab_ms: latestRow[9] || '',
            ac_ms: latestRow[10] || '',
            ad_ms: latestRow[11] || '',
            ae_ms: latestRow[12] || '',
            ba_ratio: latestRow[13] || '',
            ca_ratio: latestRow[14] || '',
            da_ratio: latestRow[15] || '',
            ea_ratio: latestRow[16] || '',
            hr: latestRow[17] || '',
            measurementDate: new Date().toLocaleString()
          }));

          console.log('데이터 업데이트 완료');
        } catch (error) {
          console.error('데이터 처리 오류:', error);
          alert('데이터 처리 중 오류가 발생했습니다.');
        }
      };

      reader.onerror = (error) => {
        console.error('파일 읽기 오류:', error);
        alert('파일을 읽는 중 오류가 발생했습니다.');
      };

      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error('전체 오류:', error);
      alert('오류가 발생했습니다.');
    }
  };

  // 맥파 데이터만 리셋하는 함수에 hr 추가
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
      ea_ratio: '',
      hr: ''  // 심박수도 리셋
    }));
  };

  return {
    formData,
    setFormData,
    handleLaunchUBioMacpa,
    handleDataFetch,
    handleInputChange,
    calculatePVC,
    calculateBV,
    calculateSV,
    error,
    loading,
    getInputStyle,
    validationErrors,
    resetFormData,
    clearErrors,
    resetPulseData,
    handleFileSelect
  };
};