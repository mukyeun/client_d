import { useState } from 'react';
import { message } from 'antd';
import { waveAnalysisService } from '../../../services/waveAnalysisService';

/**
 * 유비오 맥파기 실행 및 데이터 가져오기 관련 커스텀 훅
 */
export const useWaveAnalysis = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * 유비오 맥파기 실행 함수
   */
  const launchUBioDevice = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 개발 환경에서는 목업 데이터 사용
      if (process.env.NODE_ENV === 'development') {
        await new Promise(resolve => setTimeout(resolve, 1000));
        message.success('UBio 맥파기가 실행되었습니다.');
        return;
      }

      await waveAnalysisService.launchDevice();
      message.success('UBio 맥파기가 실행되었습니다.');
    } catch (err) {
      setError('UBio 맥파기 실행 중 오류 발생');
      message.error('UBio 맥파기 실행 중 오류 발생');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * 맥파 측정 데이터 가져오기
   */
  const fetchWaveDataFromDevice = async (name) => {
    try {
      setLoading(true);
      setError(null);

      // 개발 환경에서는 목업 데이터 사용
      if (process.env.NODE_ENV === 'development') {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return {
          ab_ms: 105,
          ac_ms: 160,
          ad_ms: 240,
          ae_ms: 280,
          ba_ratio: 0.72,
          ca_ratio: 1.12,
          da_ratio: 1.8,
          ea_ratio: 2.1,
          pulse: 74
        };
      }

      const data = name 
        ? await waveAnalysisService.fetchWaveDataByName(name)
        : await waveAnalysisService.fetchLatestWaveData();

      message.success('UBio 측정 데이터를 가져왔습니다.');
      return data;
    } catch (err) {
      setError('맥파 데이터를 가져오는 중 오류 발생');
      message.error('맥파 데이터를 가져오는 중 오류 발생');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    launchUBioDevice,
    fetchWaveDataFromDevice
  };
};