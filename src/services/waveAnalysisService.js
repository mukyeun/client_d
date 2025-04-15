import axios from 'axios';
import { API_BASE_URL, API_ENDPOINTS, API_TIMEOUT } from '../config';

// axios 인스턴스 생성
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT
});

/**
 * 맥파 분석 관련 API 서비스
 */
export const waveAnalysisService = {
  /**
   * 유비오맥파기 실행
   */
  launchDevice: async () => {
    try {
      const response = await api.post(API_ENDPOINTS.WAVE_ANALYSIS.LAUNCH);
      return response.data;
    } catch (error) {
      throw new Error('맥파기 실행 중 오류가 발생했습니다.');
    }
  },

  /**
   * 환자 이름으로 맥파 데이터 조회
   */
  fetchWaveDataByName: async (name) => {
    try {
      const response = await api.get(API_ENDPOINTS.WAVE_ANALYSIS.FETCH_DATA, {
        params: { name }
      });
      return response.data;
    } catch (error) {
      throw new Error('맥파 데이터를 가져오는 중 오류가 발생했습니다.');
    }
  },

  /**
   * 최신 맥파 데이터 가져오기
   */
  fetchLatestWaveData: async () => {
    try {
      const response = await api.get(API_ENDPOINTS.WAVE_ANALYSIS.FETCH_LATEST);
      return response.data;
    } catch (error) {
      throw new Error('최신 맥파 데이터를 가져오는 중 오류가 발생했습니다.');
    }
  },

  /**
   * 맥파 데이터 저장
   */
  saveWaveData: async (data) => {
    try {
      const response = await api.post(API_ENDPOINTS.WAVE_ANALYSIS.SAVE, data);
      return response.data;
    } catch (error) {
      throw new Error('맥파 데이터 저장 중 오류가 발생했습니다.');
    }
  }
}; 