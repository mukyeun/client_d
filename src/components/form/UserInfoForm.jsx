import React, { useState, useEffect, useCallback } from 'react';
import { Button, message } from 'antd';
import { FormContainer, ButtonGroup } from './styles';
import BasicInfoSection from './BasicInfoSection';
import SymptomSection from './SymptomSection';
import StressSection from './StressSection';
import MedicationSection from './MedicationSection';
import MemoSection from './MemoSection';
import WaveAnalysis from './WaveAnalysis';
import { sanitizeFormData } from '../../utils/dataUtils';
import { savePatientInfo } from '../../api/patientApi';
import styled from 'styled-components';
import { Form } from 'antd';

const UserInfoForm = () => {
  // ✅ 완전한 초기 상태 정의
  const initialState = {
    basicInfo: {
      name: '',
      residentNumber: '',
      gender: '',
      phone: '',
      personality: '',
      height: '',
      weight: '',
      bmi: '',
      workIntensity: '',
      diastolicPressure: '',
      systolicPressure: '',
      heartRate: null
    },
    records: {
      symptoms: {
        items: [],
        severity: '',
        duration: '',
        frequency: ''
      },
      stress: {
        items: [],
        level: '',
        totalScore: 0
      },
      medications: {
        drugs: [],
        preferences: [],
        allergies: [],
        sideEffects: []
      },
      pulseWave: {
        'a-b': null,
        'a-c': null,
        'a-d': null,
        'a-e': null,
        'b/a': null,
        'c/a': null,
        'd/a': null,
        'e/a': null,
        HR: null,
        PVC: null,
        BV: null,
        SV: null,
        lastUpdated: null
      },
      diagnosis: {
        items: [],
        notes: ''
      },
      memo: ''
    }
  };

  const [formData, setFormData] = useState(initialState);

  // ✅ 상태 변경 추적
  useEffect(() => {
    console.log('🩺 UserInfoForm formData 업데이트:', {
      basicInfo: formData.basicInfo,
      records: formData.records
    });
  }, [formData]);

  // ✅ 안전한 상태 업데이트 함수들
  const handleBasicInfoChange = useCallback((updatedBasicInfo) => {
    setFormData(prev => ({
      ...prev,
      basicInfo: updatedBasicInfo
    }));
  }, []);

  const handlePulseWaveChange = useCallback((updatedData) => {
    setFormData(prev => ({
      ...prev,
      records: {
        ...prev.records,
        pulseWave: {
          ...updatedData.records.pulseWave,
          lastUpdated: new Date().toISOString()
        }
      }
    }));
  }, []);

  const handleMedicationsChange = useCallback((updatedMedications) => {
    setFormData(prev => ({
      ...prev,
      records: {
        ...prev.records,
        medications: updatedMedications
      }
    }));
  }, []);

  const handleStressChange = useCallback((updatedStress) => {
    setFormData(prev => ({
      ...prev,
      records: {
        ...prev.records,
        stress: updatedStress
      }
    }));
  }, []);

  const validateForm = () => {
    const newErrors = {};
    const { basicInfo } = formData;

    if (!basicInfo.name?.trim()) {
      newErrors.name = '이름을 입력해주세요';
    }
    if (!basicInfo.residentNumber?.trim()) {
      newErrors.residentNumber = '주민등록번호를 입력해주세요';
    }
    if (!basicInfo.phone?.trim()) {
      newErrors.phone = '전화번호를 입력해주세요';
    }

    return Object.keys(newErrors).length === 0;
  };

  const handleSectionChange = (section, data) => {
    setFormData(prev => ({
      ...prev,
      [section]: data
    }));
  };

  const handleBasicInputChange = (section, name, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [name]: value
      }
    }));
    // 에러 상태 초기화
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async () => {
    try {
      if (!validateForm()) return;

      // ✅ HR 값을 수동 입력값으로 덮어쓰기
      const updatedFormData = {
        ...formData,
        records: {
          ...formData.records,
          pulseWave: {
            ...formData.records.pulseWave,
            hr: formData.basicInfo.heartRate  // basicInfo의 heartRate를 pulseWave.hr로 복사
          }
        }
      };

      console.log('📝 제출 전 데이터:', {
        'basicInfo.heartRate': formData.basicInfo.heartRate,
        'pulseWave.hr': updatedFormData.records.pulseWave.hr
      });

      const cleanData = sanitizeFormData(updatedFormData);
      const response = await savePatientInfo(cleanData);

      if (response.success) {
        message.success('✅ 환자 정보가 저장되었습니다.');
        setFormData(prev => ({
          ...prev,
          basicInfo: { ...prev.basicInfo, _id: response.data._id }
        }));
      } else {
        throw new Error(response.message || '저장 실패');
      }
    } catch (error) {
      console.error('❌ 저장 중 오류:', error);
      message.error(error.message || '저장 중 오류가 발생했습니다');
    }
  };

  return (
    <StyledForm>
      <BasicInfoSection
        formData={formData}
        onBasicInfoChange={handleBasicInfoChange}
      />
      <SymptomSection 
        data={formData.records.symptoms} 
        onChange={(data) => handleSectionChange('records', { 
          ...formData.records, 
          symptoms: data 
        })} 
      />
      <StressSection 
        data={formData.records.stress}
        onChange={(data) => handleSectionChange('records', { 
          ...formData.records, 
          stress: data 
        })} 
      />
      <MedicationSection 
        data={formData.records.medications} 
        onChange={(data) => handleSectionChange('records', { 
          ...formData.records, 
          medications: data 
        })} 
      />
      <WaveAnalysis 
        formData={formData}
        onPulseWaveChange={handlePulseWaveChange}
      />
      <MemoSection 
        data={formData.records.memo} 
        onChange={(data) => handleSectionChange('records', { 
          ...formData.records, 
          memo: data 
        })} 
      />

      <ButtonGroup>
        <Button type="primary" onClick={handleSubmit}>
          모든 정보 저장하기
        </Button>
      </ButtonGroup>
    </StyledForm>
  );
};

const StyledForm = styled(Form)`
  padding: 24px;
`;

export default UserInfoForm; 