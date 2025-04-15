import { message } from 'antd';
import { sanitizeFormData } from '../../utils/dataUtils';
import { savePatientInfo } from '../../api/patientApi';

/**
 * 진료 기록 데이터 구조화
 */
const buildMedicalRecord = (refinedData, formState) => {
  return {
    // 증상 및 스트레스
    symptoms: refinedData.symptoms || [],
    stressItems: formState.stressItems || [],
    
    // 약물 정보
    medications: {
      drugs: refinedData.medications?.drugs || [],
      preferences: refinedData.medications?.preferences || []
    },
    
    // 맥파 데이터
    pulseWave: refinedData.pulseWave || {},
    
    // 신체 측정값
    bloodPressure: refinedData.basicInfo?.bloodPressure || '',
    height: refinedData.basicInfo?.height || null,
    weight: refinedData.basicInfo?.weight || null,
    bmi: refinedData.basicInfo?.bmi || null,
    
    // 기타 정보
    phoneNumber: refinedData.basicInfo?.phoneNumber || '',
    workIntensity: refinedData.basicInfo?.workIntensity || '',
    memo: refinedData.basicInfo?.memo || '',
    
    // 측정 일시
    measurementDate: refinedData.measurementDate || new Date().toISOString()
  };
};

/**
 * 폼 제출 핸들러
 */
export const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    // 1. 데이터 검증 및 정제
    const refinedData = sanitizeFormData(formState);
    console.log('정제된 데이터:', refinedData);

    // 2. 백엔드 스키마에 맞게 데이터 구조화
    const transformedPayload = {
      // 기본 정보
      basicInfo: {
        name: refinedData.basicInfo.name,
        residentNumber: refinedData.basicInfo.residentNumber,
        gender: refinedData.basicInfo.gender,
        personality: refinedData.basicInfo.personality
      },
      
      // 진료 기록 (배열)
      records: [buildMedicalRecord(refinedData, formState)]
    };

    console.log('최종 전송 데이터:', transformedPayload);

    // 3. API 호출
    const response = await savePatientInfo(transformedPayload);
    
    if (response.success) {
      message.success('환자 정보가 저장되었습니다.');
      navigate('/');
    } else {
      throw new Error(response.message || '저장에 실패했습니다.');
    }

  } catch (error) {
    console.error('저장 오류:', error);
    message.error(error.message || '저장 중 오류가 발생했습니다.');
  }
};

export default handleSubmit; 