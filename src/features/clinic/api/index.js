import axios from 'axios';

const BASE_URL = 'http://localhost:5003/api';

const api = {
  async savePatientInfo(data) {
    try {
      console.log('환자 정보 MongoDB 저장 요청:', data);
      const response = await axios.post('http://localhost:5003/api/patients', data);
      console.log('MongoDB 저장 응답:', response.data);
      return response.data;
    } catch (error) {
      console.error('MongoDB 저장 오류:', error);
      throw error;
    }
  },

  async createAppointment(data) {
    try {
      // 디버깅을 위한 데이터 로깅
      console.log('=== 예약 생성 요청 시작 ===');
      console.log('원본 데이터:', {
        patientId: data.patientId,
        date: data.date,
        time: data.time,
        symptoms: data.symptoms,
        medications: data.medications,
        preferences: data.preferences,
        stressEvents: data.stressEvents,
        stressScore: data.stressScore,
        stressLevel: data.stressLevel,
        memo: data.memo
      });

      // 데이터 정규화
      const requestData = {
        patientId: String(data.patientId || '').trim(),
        date: String(data.date || '').trim(),
        time: String(data.time || '').trim(),
        symptoms: Array.isArray(data.symptoms) ? data.symptoms.filter(Boolean).map(String) : [],
        medications: Array.isArray(data.medications) ? data.medications.filter(Boolean).map(String) : [],
        preferences: Array.isArray(data.preferences) ? data.preferences.filter(Boolean).map(String) : [],
        stressEvents: Array.isArray(data.stressEvents) ? 
          data.stressEvents
            .filter(event => event && (typeof event === 'string' || event.name))
            .map(event => ({
              name: String(typeof event === 'string' ? event : event.name || '').trim(),
              score: Number(typeof event === 'string' ? 1 : event.score || 1)
            })) : [],
        stressScore: Number(data.stressScore || 0),
        stressLevel: String(data.stressLevel || '낮음').trim(),
        memo: String(data.memo || '').trim(),
        status: 'scheduled'
      };

      // 필수 필드 검증
      if (!requestData.patientId) throw new Error('환자 ID가 누락되었습니다.');
      if (!requestData.date) throw new Error('예약 날짜가 누락되었습니다.');
      if (!requestData.time) throw new Error('예약 시간이 누락되었습니다.');

      console.log('정규화된 요청 데이터:', requestData);

      const response = await axios.post(`${BASE_URL}/appointments`, requestData, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      console.log('서버 응답:', response.data);
      return response.data;

    } catch (error) {
      console.error('=== 예약 생성 요청 실패 ===');
      console.error('에러 상세 정보:', {
        name: error.name,
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        originalData: data,
        requestData: error.config?.data
      });

      throw {
        message: error.response?.data?.message || error.message,
        response: error.response?.data,
        status: error.response?.status,
        data: data,
        error
      };
    }
  }
};

export default api; 