import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './styles.css';
import { 증상카테고리 } from '../../../../data/symptoms';
import { 약물카테고리 } from '../../../../data/medications';
import { 기호식품카테고리 } from '../../../../data/preferences';
import { 스트레스카테고리, evaluateStressLevel } from '../../../../data/stressEvents';
import { saveAppointment } from '../../../../App';
import userInfoIcon from '../../../../assets/icons/user-info.svg';
import stressIcon from '../../../../assets/icons/stress.svg';
import symptomsIcon from '../../../../assets/icons/symptoms.svg';
import medicationIcon from '../../../../assets/icons/medication.svg';
import memoIcon from '../../../../assets/icons/memo.svg';

// 카테고리 데이터 안전 처리
const safeCategories = {
  증상카테고리: 증상카테고리 || {},
  약물카테고리: 약물카테고리 || [],
  기호식품카테고리: 기호식품카테고리 || [],
  스트레스카테고리: 스트레스카테고리 || []
};

// 예약 가능 시간대 정의를 상수로 명확하게 설정
const AVAILABLE_TIME_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30'
];

// 상수로 API URL 정의
const SERVER_URL = 'http://localhost:5003';  // 직접 하드코딩

// 상단에 BASE_URL 상수 추가
const BASE_URL = 'http://localhost:5003';  // 서버 URL을 하드코딩

const PatientRegistration = ({ onAppointmentCreated }) => {
  const navigate = useNavigate();
  
  // 스트레스카테고리 상태 추가
  const [stressCategories, setStressCategories] = useState([]);
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    residentNumber: '',
    gender: '',
    height: '',
    weight: '',
    memo: '',
    appointmentDate: '',
    appointmentTime: '',
    personality: '',
    workIntensity: '',
    bmi: '',
    selectedCategory: '',
    selectedSubCategory: '',
    selectedSymptom: '',
    selectedSymptoms: [],
    selectedStressCategory: '',
    selectedStressEvents: [],
    totalStressScore: 0,
    stressLevel: '',
    medication: '',
    selectedMedications: [],
    preference: '',
    selectedPreferences: [],
    ab_ms: '',
    ac_ms: '',
    ad_ms: '',
    ae_ms: '',
    ba_ratio: '',
    ca_ratio: '',
    da_ratio: '',
    ea_ratio: ''
  });

  const [error, setError] = useState('');

  // 영업 시간 설정
  const BUSINESS_HOURS = {
    start: '09:00',
    end: '18:00',
    interval: 30
  };

  const [availableTimeSlots, setAvailableTimeSlots] = useState(AVAILABLE_TIME_SLOTS);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);

  // 제출 상태 추가
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 스트레스카테고리 데이터 로드
  useEffect(() => {
    console.log('Imported 스트레스카테고리:', 스트레스카테고리);
    if (스트레스카테고리) {
      setStressCategories(스트레스카테고리);
    }
  }, []);

  // API 함수들을 하나의 객체로 관리
  const api = {
    // 기존의 checkAvailability 함수
    checkAvailability: async (params) => {
      try {
        // 파라미터 유효성 검사 추가
        if (!params.date || !params.time) {
          throw new Error('날짜와 시간이 필요합니다.');
        }

        // 요청 전 상세 로깅
        console.log('📢 API 요청 상세:', {
          endpoint: `${SERVER_URL}/api/appointments/check`,
          params: {
            appointmentDate: params.date,
            appointmentTime: params.time
          }
        });

        const response = await axios.get(`${SERVER_URL}/api/appointments/check`, { 
          params: {
            appointmentDate: params.date,
            appointmentTime: params.time
          },
          headers: { 'Content-Type': 'application/json' }
        });
        
        // 응답 데이터 검증 및 로깅
        console.log('✅ API 응답 전체:', response);
        console.log('✅ API 응답 데이터:', response.data);
        
        if (!response.data) {
          throw new Error('서버 응답이 없습니다.');
        }

        return response.data;
      } catch (error) {
        // 에러 상세 정보 로깅
        console.error('❌ API 오류 상세:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
          params: params
        });
        throw new Error(error.response?.data?.message || error.message || '서버 오류가 발생했습니다.');
      }
    },

    // 환자 정보 저장 함수 추가
    savePatientInfo: async (patientData) => {
      try {
        console.log('📢 환자 정보 저장 요청:', patientData);
        
        const response = await axios.post(
          `${SERVER_URL}/api/patients`, 
          patientData,
          {
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );
        
        console.log('✅ 환자 정보 저장 응답:', response.data);
        
        if (response.data.status === 'existing') {
          const confirmContinue = window.confirm(
            '이미 등록된 환자입니다. 해당 환자로 예약을 진행하시겠습니까?'
          );
          
          if (!confirmContinue) {
            throw new Error('예약이 취소되었습니다.');
          }
          
          return {
            status: 'success',
            patient: response.data.patient
          };
        }
        
        return {
          status: 'success',
          patient: response.data.patient
        };
      } catch (error) {
        console.error('❌ 환자 정보 저장 오류:', error.response?.data || error);
        throw error;
      }
    },

    createAppointment: async (data) => {
      try {
        // 시간 형식 검증 및 변환
        const formattedTime = formatTime(data.time);
        if (!formattedTime) {
          throw new Error('올바른 시간 형식이 아닙니다. (예: 09:00, 13:30)');
        }

        const requestData = {
          ...data,
          time: formattedTime
        };

        console.log('📢 예약 생성 요청 데이터:', requestData);

        const response = await axios.post(
          `${SERVER_URL}/api/appointments`,
          requestData
        );
        
        console.log('✅ 예약 생성 응답:', response.data);
        
        if (response.data.status === 'success') {
          const { appointment, appointments } = response.data;
          console.log('📋 생성된 예약:', appointment);
          console.log('📋 전체 예약 목록:', appointments || '🔴 예약 목록 없음');
          
          return {
            status: 'success',
            appointment: appointment || null,
            appointments: appointments || [] // undefined일 경우 빈 배열 반환
          };
        }
        
        throw new Error(response.data?.message || '예약 생성 중 오류가 발생했습니다.');
      } catch (error) {
        console.error('❌ 예약 생성 오류:', error.response?.data || error);
        throw error;
      }
    }
  };

  // 시간 포맷 함수 수정
  const formatTime = (time) => {
    if (!time) return null;
    
    if (/^\d{2}:\d{2}$/.test(time)) {
      return time;
    }
    
    const match = time.match(/^(\d{1,2}):(\d{2})$/);
    if (match) {
      const [_, hours, minutes] = match;
      return `${hours.padStart(2, '0')}:${minutes}`;
    }
    
    console.error('🚨 잘못된 시간 형식:', time);
    return null;
  };

  // 예약 가능 여부 확인
  const checkAppointmentAvailability = async (date, time) => {
    try {
      // 입력값 상세 로깅
      console.log('📝 입력값 확인:', {
        rawDate: date,
        rawTime: time,
        dateType: typeof date,
        timeType: typeof time
      });

      // 입력값 검증 강화
      if (!date || typeof date !== 'string' || !date.trim()) {
        throw new Error('유효한 날짜를 입력해주세요.');
      }

      if (!time || typeof time !== 'string' || !time.trim()) {
        throw new Error('유효한 시간을 입력해주세요.');
      }

      const formattedTime = formatTime(time);
      if (!formattedTime) {
        throw new Error('올바른 시간 형식이 아닙니다. (예: 09:00, 13:30)');
      }

      const trimmedDate = date.trim();
      if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmedDate)) {
        throw new Error('올바른 날짜 형식이 아닙니다. (예: 2025-03-24)');
      }

      // API 요청 전 최종 데이터 확인
      console.log('📢 [프론트] 최종 요청 데이터:', {
        trimmedDate,
        formattedTime,
        originalDate: date,
        originalTime: time
      });

      const response = await api.checkAvailability({
        date: trimmedDate,
        time: formattedTime
      });

      console.log('✅ [프론트] 예약 확인 응답:', response);

      return response.available === true;

    } catch (error) {
      console.error('❌ [프론트] 예약 확인 오류:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        originalError: error
      });
      throw error;
    }
  };

  // 필수 입력 필드 검사
  const validateRequiredFields = () => {
    const required = ['name', 'phone', 'residentNumber', 'gender', 'appointmentDate', 'appointmentTime'];
    const missing = required.filter(field => !formData[field]);
    
    if (missing.length > 0) {
      alert(`다음 필수 항목을 입력해주세요: ${missing.join(', ')}`);
      return false;
    }
    return true;
  };

  // 입력값 변경 처리
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // 날짜가 변경되면 예약 가능한 시간대 조회
    if (name === 'appointmentDate' && value) {
      fetchAvailableTimeSlots(value);
    }
    
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      
      // BMI 자동 계산
      if (name === 'height' || name === 'weight') {
        const height = name === 'height' ? value : prev.height;
        const weight = name === 'weight' ? value : prev.weight;
        
        if (height && weight) {
          const heightInMeters = Number(height) / 100;
          const bmi = (Number(weight) / (heightInMeters * heightInMeters)).toFixed(1);
          newData.bmi = bmi;
        }
      }
      
      return newData;
    });
  };

  // 주민등록번호 처리 함수
  const handleResidentNumberChange = (e) => {
    const { value } = e.target;
    const numericValue = value.replace(/[^0-9]/g, '');
    
    if (numericValue.length <= 6) {
      setFormData(prev => ({
        ...prev,
        residentNumber: numericValue
      }));
    } else if (numericValue.length <= 13) {
      const formattedValue = `${numericValue.slice(0, 6)}-${numericValue.slice(6)}`;
      
      // 뒷자리 첫 번호로 성별 판단
      const genderDigit = numericValue[6];
      let gender = '';
      
      if (genderDigit === '1' || genderDigit === '3') {
        gender = 'male';
      } else if (genderDigit === '2' || genderDigit === '4') {
        gender = 'female';
      }

      setFormData(prev => ({
        ...prev,
        residentNumber: formattedValue,
        gender: gender // 성별 자동 설정
      }));
    }
  };

  // 증상 선택 핸들러들
  const handleCategoryChange = (e) => {
    const category = e.target.value;
    setFormData(prev => ({
      ...prev,
      selectedCategory: category,
      selectedSubCategory: '',
      selectedSymptom: ''
    }));
  };

  const handleSubCategoryChange = (e) => {
    const subCategory = e.target.value;
    setFormData(prev => ({
      ...prev,
      selectedSubCategory: subCategory,
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

  // 스트레스 대분류 선택 핸들러
  const handleStressCategoryChange = (e) => {
    setFormData(prev => ({
      ...prev,
      selectedStressCategory: e.target.value
    }));
  };

  // 스트레스 이벤트 선택 핸들러
  const handleStressEventChange = (e) => {
    if (!e.target.value) return;
    
    const selectedEvent = JSON.parse(e.target.value);
    if (!formData.selectedStressEvents.some(event => event.name === selectedEvent.name)) {
      const updatedEvents = [...formData.selectedStressEvents, selectedEvent];
      const totalScore = updatedEvents.reduce((sum, event) => sum + event.score, 0);
      const stressLevel = evaluateStressLevel(totalScore);
      
      setFormData(prev => ({
        ...prev,
        selectedStressEvents: updatedEvents,
        totalStressScore: totalScore,
        stressLevel: stressLevel.level
      }));
    }
  };

  // 선택된 스트레스 이벤트 제거
  const removeStressEvent = (eventToRemove) => {
    const updatedEvents = formData.selectedStressEvents.filter(
      event => event.name !== eventToRemove.name
    );
    const totalScore = updatedEvents.reduce((sum, event) => sum + event.score, 0);
    const stressLevel = evaluateStressLevel(totalScore);

    setFormData(prev => ({
      ...prev,
      selectedStressEvents: updatedEvents,
      totalStressScore: totalScore,
      stressLevel: stressLevel.level
    }));
  };

  // 약물 선택 핸들러
  const handleMedicationChange = (e) => {
    const medication = e.target.value;
    setFormData(prev => ({
      ...prev,
      medication: medication
    }));

    if (medication && !formData.selectedMedications.includes(medication)) {
      setFormData(prev => ({
        ...prev,
        selectedMedications: [...prev.selectedMedications, medication],
        medication: '' // 선택 후 초기화
      }));
    }
  };

  // 기호식품 선택 핸들러
  const handlePreferenceChange = (e) => {
    const preference = e.target.value;
    setFormData(prev => ({
      ...prev,
      preference: preference
    }));

    if (preference && !formData.selectedPreferences.includes(preference)) {
      setFormData(prev => ({
        ...prev,
        selectedPreferences: [...prev.selectedPreferences, preference],
        preference: '' // 선택 후 초기화
      }));
    }
  };

  // 약물 태그 삭제
  const removeMedication = (medicationToRemove) => {
    setFormData(prev => ({
      ...prev,
      selectedMedications: prev.selectedMedications.filter(med => med !== medicationToRemove)
    }));
  };

  // 기호식품 태그 삭제
  const removePreference = (preferenceToRemove) => {
    setFormData(prev => ({
      ...prev,
      selectedPreferences: prev.selectedPreferences.filter(pref => pref !== preferenceToRemove)
    }));
  };

  // API 호출 함수 분리
  const createAppointment = async (appointmentData) => {
    try {
      const response = await axios.post(
        `${SERVER_URL}/api/appointments`,
        appointmentData
      );
      
      console.log('✅ 예약 생성 응답:', response.data);
      
      if (response.data.status === 'success') {
        const { appointment, appointments } = response.data;
        console.log('📋 생성된 예약:', appointment);
        console.log('📋 전체 예약 목록:', appointments);
        
        if (!appointments) {
          console.warn('⚠️ 예약 목록이 없습니다.');
        }
        
        return {
          status: 'success',
          appointment: appointment || null,
          appointments: appointments || []
        };
      }
      
      return {
        status: 'error',
        message: response.data.message || '예약 생성에 실패했습니다.'
      };
    } catch (error) {
      console.error('❌ 예약 생성 오류:', error.response?.data || error);
      
      if (error.response?.status === 409) {
        const errorData = error.response.data;
        const { message, details } = errorData || {};
        
        const bookedTimesText = details?.bookedTimes
          ? details.bookedTimes
              .sort()
              .map(time => `- ${time}`)
              .join('\n')
          : '- ' + appointmentData.time;
        
        const confirmMessage = [
          message || '해당 시간에 이미 예약이 존재합니다.',
          '',
          '예약된 시간:',
          bookedTimesText,
          '',
          '다른 시간을 선택하시겠습니까?'
        ].join('\n');
        
        const userChoice = window.confirm(confirmMessage);
        
        if (userChoice) {
          const timeInput = document.querySelector('input[name="appointmentTime"]');
          if (timeInput) {
            timeInput.focus();
            timeInput.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'center' 
            });
            
            timeInput.style.backgroundColor = '#fff3cd';
            setTimeout(() => {
              timeInput.style.backgroundColor = '';
            }, 2000);
          }
          return { status: 'retry' };
        }
        
        return { 
          status: 'cancelled', 
          message: '예약이 취소되었습니다.' 
        };
      }
      
      return {
        status: 'error',
        message: error.response?.data?.message || '예약 생성 중 오류가 발생했습니다.'
      };
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateRequiredFields()) {
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      // 1. 환자 정보 저장
      const patientResponse = await api.savePatientInfo({
        name: formData.name,
        phone: formData.phone,
        residentNumber: formData.residentNumber,
        gender: formData.gender
      });

      if (patientResponse.status === 'success') {
        // 2. 예약 정보 생성
        const appointmentData = {
          patientId: patientResponse.patient._id,
          date: formData.appointmentDate,
          time: formData.appointmentTime,
          symptoms: formData.selectedSymptoms,
          medications: formData.selectedMedications,
          stressEvents: formData.selectedStressEvents,
          memo: formData.memo
        };

        const appointmentResponse = await api.createAppointment(appointmentData);

        if (appointmentResponse.status === 'success') {
          // 3. 예약 확인 페이지로 이동
          navigate('/clinic/appointment-confirmation', {
            state: {
              appointmentData: appointmentResponse.appointment,
              patientData: patientResponse.patient
            },
            replace: true // 뒤로 가기 방지
          });
          return; // 함수 종료
        }
      }
    } catch (error) {
      console.error('예약 처리 중 오류 발생:', error);
      setError(error.response?.data?.message || '예약 처리 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 스트레스 점수 계산 함수
  const calculateTotalStressScore = (scores) => {
    return Object.values(scores).reduce((total, score) => total + Number(score || 0), 0);
  };

  // 스트레스 레벨 결정 함수
  const determineStressLevel = (scores) => {
    const total = calculateTotalStressScore(scores);
    if (total >= 15) return '높음';
    if (total >= 8) return '중간';
    return '낮음';
  };

  // 현재 날짜 구하기
  const today = new Date().toISOString().split('T')[0];

  // 선택된 날짜의 예약 가능한 시간대 조회
  const fetchAvailableTimeSlots = async (selectedDate) => {
    if (!selectedDate) return;
    
    setIsCheckingAvailability(true);
    try {
      // 초기에 모든 시간대를 사용 가능으로 설정
      setAvailableTimeSlots(AVAILABLE_TIME_SLOTS);

      // 해당 날짜의 모든 시간대 확인
      const availabilityPromises = AVAILABLE_TIME_SLOTS.map(async (time) => {
        try {
          const formattedTime = formatTime(time);
          if (!formattedTime) {
            console.error(`잘못된 시간 형식: ${time}`);
            return { time, available: false };
          }

          console.log('예약 확인 요청:', {
            date: selectedDate,
            time: formattedTime
          });

          const response = await api.checkAvailability({
            date: selectedDate.trim(),
            time: formattedTime.trim()
          });

          return {
            time,
            available: response.available
          };
        } catch (error) {
          console.error(`시간대 ${time} 확인 중 오류:`, error);
          return { time, available: true }; // 오류 시 기본적으로 가능하다고 설정
        }
      });

      const results = await Promise.all(availabilityPromises);
      const availableTimes = results
        .filter(result => result.available)
        .map(result => result.time);

      console.log('사용 가능한 시간대:', availableTimes);
      setAvailableTimeSlots(availableTimes);
    } catch (error) {
      console.error('예약 가능 시간 조회 중 오류:', error);
      // 오류 발생 시 기본 시간대 표시
      setAvailableTimeSlots(AVAILABLE_TIME_SLOTS);
    } finally {
      setIsCheckingAvailability(false);
    }
  };

  const getInputStyle = (fieldName) => {
    // 필요한 스타일링 로직 추가
    return {};
  };

  // 유비오 데이터 가져오기 함수
  const handleDataFetch = async () => {
    try {
      console.log('유비오 데이터 요청 시작');
      
      const response = await fetch('http://localhost:5003/api/ubio-data', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('받은 데이터:', result);

      if (result.success && result.data) {
        // 폼 데이터 업데이트
        setFormData(prev => ({
          ...prev,
          ab_ms: result.data.ab_ms || '',
          ac_ms: result.data.ac_ms || '',
          ad_ms: result.data.ad_ms || '',
          ae_ms: result.data.ae_ms || '',
          ba_ratio: result.data.ba_ratio || '',
          ca_ratio: result.data.ca_ratio || '',
          da_ratio: result.data.da_ratio || '',
          ea_ratio: result.data.ea_ratio || ''
        }));

        alert('유비오 맥파 데이터를 성공적으로 가져왔습니다.');
      } else {
        throw new Error('데이터 형식이 올바르지 않습니다.');
      }
    } catch (error) {
      console.error('데이터 가져오기 실패:', error);
      alert('유비오 데이터를 가져오는데 실패했습니다.');
    }
  };

  // 파일 선택 핸들러 수정
  const handleFileSelect = async (event) => {
    try {
      // 파일 선택 후 서버로 데이터 요청
      await handleDataFetch();
    } catch (error) {
      console.error('파일 처리 오류:', error);
      alert('데이터 처리 중 오류가 발생했습니다.');
    } finally {
      if (event?.target) {
        event.target.value = '';
      }
    }
  };

  return (
    <div className="patient-registration">
      <form onSubmit={handleSubmit}>
        {/* 1. 기본 정보 섹션 */}
        <div className="form-box analysis-box enhanced-box shadow-box">
          <div className="section-marker red"></div>
          <div className="section-content">
            <h2 className="section-title large-title">
              <img src={userInfoIcon} alt="" className="section-icon" />
              <span>기본 정보</span>
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
                  onChange={handleInputChange}
                  placeholder="연락처를 입력하세요"
                  style={getInputStyle('phone')}
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
                  disabled={formData.residentNumber.length > 7} // 주민번호 입력 시 성별 선택 비활성화
                >
                  <option value="">선택</option>
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
        <div className="form-box analysis-box enhanced-box shadow-box">
          <div className="section-marker orange"></div>
          <div className="section-content">
            <h2 className="section-title large-title">
              <img src={stressIcon} alt="" className="section-icon" />
              <span>스트레스 평가</span>
            </h2>
            <div className="form-group stress-assessment">
              <div className="stress-select-container">
                {/* 스트레스 대분류 선택 */}
                <div className="stress-select-row">
                  <span className="form-label">스트레스 대분류</span>
                  <div className="select-wrapper">
                    <select
                      value={formData.selectedStressCategory}
                      onChange={handleStressCategoryChange}
                      style={getInputStyle('stressCategory')}
                    >
                      <option value="">선택하세요</option>
                      {스트레스카테고리?.map((category, idx) => (
                        <option key={`stress-category-${idx}`} value={category.대분류}>
                          {category.대분류}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* 스트레스 소분류(이벤트) 선택 */}
                <div className="stress-select-row">
                  <span className="form-label">스트레스 소분류</span>
                  <div className="select-wrapper">
                    <select
                      value=""
                      onChange={handleStressEventChange}
                      disabled={!formData.selectedStressCategory}
                      style={getInputStyle('stressEvents')}
                    >
                      <option value="">선택하세요</option>
                      {formData.selectedStressCategory && 
                        스트레스카테고리
                            ?.find(category => category.대분류 === formData.selectedStressCategory)
                            ?.중분류?.map((event, eventIdx) => (
                              <option 
                                key={`stress-event-${eventIdx}`}
                                value={JSON.stringify(event)}
                              >
                                {event.name} ({event.score}점)
                              </option>
                            ))
                      }
                    </select>
                  </div>
                </div>
              </div>

              {/* 선택된 스트레스 이벤트 표시 */}
              <div className="selected-stress-events">
                {formData.selectedStressEvents?.map((event, index) => (
                  <span key={`selected-stress-${index}`} className="stress-event-tag">
                    {event.name} ({event.score}점)
                    <button 
                      type="button" 
                      onClick={() => removeStressEvent(event)}
                      className="remove-event"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>

              {/* 총점 및 스트레스 수준 표시 */}
              {formData.selectedStressEvents?.length > 0 && (
                <div className="stress-summary">
                  <p>총점: {formData.totalStressScore}점</p>
                  <p>스트레스 수준: {formData.stressLevel}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 3. 증상 선택 섹션 */}
        <div className="form-box analysis-box enhanced-box shadow-box">
          <div className="section-marker yellow"></div>
          <div className="section-content">
            <h2 className="section-title large-title">
              <img src={symptomsIcon} alt="" className="section-icon" />
              <span>증상 선택</span>
            </h2>
            <div className="form-row symptoms-category-row">
              <div className="form-group category">
                <label className="form-label">대분류</label>
                <select 
                  value={formData.selectedCategory} 
                  onChange={handleCategoryChange}
                  style={getInputStyle('selectedCategory')}
                >
                  <option value="">선택하세요</option>
                  {Object.keys(safeCategories.증상카테고리).map(category => (
                    <option key={`cat-${category}`} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group subcategory">
                <label className="form-label">중분류</label>
                <select 
                  value={formData.selectedSubCategory} 
                  onChange={handleSubCategoryChange}
                  style={getInputStyle('selectedSubCategory')}
                >
                  <option value="">선택하세요</option>
                  {formData.selectedCategory && 
                    Object.keys(safeCategories.증상카테고리[formData.selectedCategory] || {}).map(subCategory => (
                      <option key={`subcat-${formData.selectedCategory}-${subCategory}`} value={subCategory}>
                        {subCategory}
                      </option>
                    ))
                  }
                </select>
              </div>
              <div className="form-group symptom">
                <label className="form-label">소분류</label>
                <select 
                  value={formData.selectedSymptom} 
                  onChange={handleSymptomChange}
                  style={getInputStyle('selectedSymptom')}
                >
                  <option value="">선택하세요</option>
                  {formData.selectedSubCategory && 
                    safeCategories.증상카테고리[formData.selectedCategory]?.[formData.selectedSubCategory]?.map(symptom => (
                      <option 
                        key={`sym-${formData.selectedCategory}-${formData.selectedSubCategory}-${symptom.name}`} 
                        value={symptom.name}
                      >
                        {symptom.name}
                      </option>
                    ))
                  }
                </select>
              </div>
            </div>
            
            <div className="selected-symptoms">
              {formData.selectedSymptoms?.map((symptom, index) => (
                <span 
                  key={`selected-${index}-${symptom.replace(/\s+/g, '-')}`} 
                  className="symptom-tag"
                >
                  {symptom}
                  <button 
                    type="button" 
                    onClick={() => removeSymptom(symptom)}
                    className="remove-symptom"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* 4. 복용약물 섹션 */}
        <div className="form-box analysis-box enhanced-box shadow-box">
          <div className="section-marker green"></div>
          <div className="section-content">
            <h2 className="section-title large-title">
              <img src={medicationIcon} alt="" className="section-icon" />
              <span>복용약물</span>
            </h2>
            <div className="form-row medication-row">
              <div className="form-group medication">
                <label className="form-label">복용 중인 약물</label>
                <select
                  name="medication"
                  value={formData.medication}
                  onChange={handleMedicationChange}
                  style={getInputStyle('medication')}
                >
                  <option value="">약물을 선택하세요</option>
                  {safeCategories.약물카테고리.map((약물, index) => (
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
                  onChange={handlePreferenceChange}
                  style={getInputStyle('preference')}
                >
                  <option value="">기호식품을 선택하세요</option>
                  {safeCategories.기호식품카테고리.map((기호품, index) => (
                    <option key={`preference-${index}`} value={기호품}>
                      {기호품}
                    </option>
                  ))}
                </select>
                {error && <span className="error-message">{error}</span>}
              </div>
            </div>

            {/* 선택된 약물 태그들 */}
            <div className="selected-items">
              <div className="selected-medications">
                {formData.selectedMedications.map((medication, index) => (
                  <span 
                    key={`selected-med-${index}-${medication.replace(/\s+/g, '-')}`} 
                    className="symptom-tag"
                  >
                    {medication}
                    <button 
                      type="button" 
                      onClick={() => removeMedication(medication)}
                      className="remove-symptom"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>

              {/* 선택된 기호식품 태그들 */}
              <div className="selected-preferences">
                {formData.selectedPreferences.map((preference, index) => (
                  <span 
                    key={`selected-pref-${index}-${preference.replace(/\s+/g, '-')}`} 
                    className="symptom-tag"
                  >
                    {preference}
                    <button 
                      type="button" 
                      onClick={() => removePreference(preference)}
                      className="remove-symptom"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 5. 예약 정보 섹션 */}
        <div className="form-box analysis-box enhanced-box shadow-box">
          <div className="section-marker blue"></div>
          <div className="section-content">
            <h2 className="section-title large-title">
              <img src={memoIcon} alt="" className="section-icon" />
              <span>예약 정보</span>
            </h2>
            <div className="input-row">
              <div className="input-group">
                <label className="form-label required">예약 날짜</label>
                <input
                  type="date"
                  name="appointmentDate"
                  value={formData.appointmentDate}
                  onChange={handleInputChange}
                  min={today}
                  className="form-input"
                  required
                />
              </div>
              <div className="input-group">
                <label className="form-label required">예약 시간</label>
                <select
                  name="appointmentTime"
                  value={formData.appointmentTime}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                  disabled={isCheckingAvailability}
                >
                  <option value="">시간을 선택하세요</option>
                  {AVAILABLE_TIME_SLOTS.map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
                {isCheckingAvailability && (
                  <div className="loading-message">예약 가능한 시간을 확인하고 있습니다...</div>
                )}
              </div>
              <div className="input-group full-width">
                <label className="form-label">메모</label>
                <textarea
                  name="memo"
                  value={formData.memo}
                  onChange={handleInputChange}
                  className="form-input"
                  style={getInputStyle('memo')}
                  placeholder="추가 참고사항이나 메모를 입력하세요."
                  rows="4"
                />
                {error && <span className="error-message">{error}</span>}
              </div>
            </div>
          </div>
        </div>

        {/* 제출 버튼 */}
        <div className="submit-section" style={{
          display: 'flex',
          justifyContent: 'center',
          marginTop: '30px',
          marginBottom: '30px'
        }}>
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="submit-button"
          >
            {isSubmitting ? '저장 중...' : '예약하기'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PatientRegistration; 

<style jsx>{`
  .submit-button:hover {
    background-color: #357ABD;
  }
`}</style> 