import { useState, useCallback } from 'react';
import axios from 'axios';
import { message } from 'antd';
import { API_ENDPOINTS } from '../utils/constants';
import { validateWaveData } from '../utils/validation';
import { calculatePVC, calculateBV, calculateSV } from '../utils/calculations';

export const useVitals = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const processWaveData = useCallback(async (waveData) => {
    try {
      setLoading(true);
      setError(null);

      // 데이터 유효성 검사
      validateWaveData(waveData);

      // 계산 수행
      const pvc = calculatePVC(waveData);
      const bv = calculateBV(waveData);
      const sv = calculateSV(waveData);

      return {
        pvc,
        bv,
        sv
      };
    } catch (err) {
      setError(err.message);
      message.error(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    processWaveData
  };
}; 