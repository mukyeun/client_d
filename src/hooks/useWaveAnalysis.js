import { useState, useCallback } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5003'; // 포트 번호 수정

const calculatePVC = (data) => {
  try {
    if (!data) {
      console.log('데이터가 없습니다:', data);
      return { pvc: 0, error: '데이터가 없습니다' };
    }

    // 엑셀 파일의 J~M열에서 값 추출
    const ab = parseFloat(data['J열'] || data['a-b'] || 0);  // J열 (9)
    const ac = parseFloat(data['K열'] || data['a-c'] || 0);  // K열 (10)
    const ad = parseFloat(data['L열'] || data['a-d'] || 0);  // L열 (11)
    const ae = parseFloat(data['M열'] || data['a-e'] || 0);  // M열 (12)

    console.log('PVC 계산 값:', { ab, ac, ad, ae });

    if ([ab, ac, ad, ae].some(isNaN)) {
      return { pvc: 0, error: '유효하지 않은 값' };
    }

    const pvc = ((ab + ac + ad + ae) / 4).toFixed(2);
    return { pvc: parseFloat(pvc), error: null };
  } catch (error) {
    console.error('PVC 계산 오류:', error);
    return { pvc: 0, error: error.message };
  }
};

export const useWaveAnalysis = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [waveData, setWaveData] = useState(null);

  const handleDataFetch = useCallback(async (data) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.post(`${API_BASE_URL}/api/patients/wave-data`, data);
      
      if (response.data.success) {
        setWaveData(response.data.data);
      } else {
        throw new Error(response.data.message || '데이터 분석 실패');
      }
    } catch (err) {
      console.error('데이터 가져오기 오류:', err);
      setError(err.message || '맥파 데이터 분석 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateWaveData = useCallback((newData) => {
    if (!newData || typeof newData !== 'object') {
      console.warn('유효하지 않은 데이터:', newData);
      return;
    }

    setWaveData(prevData => {
      const normalizedData = normalizeExcelData(newData);
      const updatedData = {
        ...prevData,
        ...normalizedData
      };
      
      const pvcResult = calculatePVC(updatedData);
      return {
        ...updatedData,
        PVC: pvcResult.pvc
      };
    });
  }, []);

  const normalizeExcelData = (data) => {
    return {
      'a-b': data['J열 (9)'] || 0,    // ab_ms
      'a-c': data['K열 (10)'] || 0,   // ac_ms
      'a-d': data['L열 (11)'] || 0,   // ad_ms
      'a-e': data['M열 (12)'] || 0,   // ae_ms
      'b/a': data['N열 (13)'] || 0,   // ba
      'c/a': data['O열 (14)'] || 0,   // ca
      'd/a': data['P열 (15)'] || 0,   // da
      'e/a': data['Q열 (16)'] || 0,   // ea
      'HR': data['R열 (17)'] || 0,    // 평균맥박
      'BV': data['혈관건강지수'] || 0,
      'SV': 0  // 필요한 경우 계산
    };
  };

  return {
    loading,
    error,
    waveData,
    handleDataFetch,
    updateWaveData
  };
};

export default useWaveAnalysis; 