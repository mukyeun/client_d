import React, { useState, useCallback } from 'react';
import styled from 'styled-components';
import { Card, Input, Select, Button, Typography } from 'antd';
import BasicInfoSection from './BasicInfoSection';
import MedicationSection from './MedicationSection';
import SymptomSection from './SymptomSection';
import StressSection from './StressSection';
import WaveAnalysisSection from './WaveAnalysis';
import MemoSection from './MemoSection';

const { Title } = Typography;

// 전체 폼 컨테이너
const FormContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;

  // 모든 입력 필드의 높이를 통일
  input, 
  .ant-input,
  .ant-select-selector,
  .ant-input-number,
  .ant-picker {
    height: 36px !important;
    line-height: 36px !important;
  }

  // Select 컴포넌트의 내부 요소 높이 조정
  .ant-select-selector {
    .ant-select-selection-search-input,
    .ant-select-selection-item {
      height: 34px !important;
      line-height: 34px !important;
    }
  }

  // TextArea는 예외 처리
  textarea.ant-input {
    height: auto !important;
    min-height: 36px;
    line-height: 1.5 !important;
  }
`;

// 공통 카드 스타일
export const StyledCard = styled(Card)`
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  margin-bottom: 32px;
  background: #ffffff;
  border: none;
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 6px 24px rgba(0, 0, 0, 0.12);
    transform: translateY(-2px);
  }

  .ant-card-body {
    padding: 28px;
    
    @media (max-width: 576px) {
      padding: 20px;
    }
  }
`;

// 섹션 제목
export const SectionTitle = styled(Title)`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px !important;
  font-size: 24px !important;

  .anticon {
    font-size: 24px;
    color: #1890ff;
  }

  @media (max-width: 576px) {
    font-size: 20px !important;
    
    .anticon {
      font-size: 20px;
    }
  }
`;

// 입력 필드 컨테이너
export const FormItem = styled.div`
  margin-bottom: 24px;

  .label {
    display: flex;
    align-items: center;
    margin-bottom: 8px;
    font-weight: 500;
    color: #1f1f1f;
    font-size: 15px;
  }

  .required::after {
    content: '*';
    color: #ff4d4f;
    margin-left: 4px;
  }

  .error {
    color: #ff4d4f;
    font-size: 13px;
    margin-top: 4px;
  }
`;

// 입력 필드
export const StyledInput = styled(Input)`
  height: 40px;
  border-radius: 8px;
  border: 1.5px solid #d9d9d9;
  transition: all 0.3s ease;
  font-size: 14px;

  &:hover, &:focus {
    border-color: #1890ff;
    box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.1);
  }
`;

// 셀렉트 필드
export const StyledSelect = styled(Select)`
  .ant-select-selector {
    height: 40px !important;
    border-radius: 8px !important;
    border: 1.5px solid #d9d9d9 !important;
    padding: 4px 11px !important;

    .ant-select-selection-item {
      line-height: 30px !important;
    }
  }
`;

// 텍스트 영역
export const StyledTextArea = styled(Input.TextArea)`
  border-radius: 8px;
  border: 1.5px solid #d9d9d9;
  padding: 12px;
  min-height: 120px;
  font-size: 14px;
  line-height: 1.6;

  &:hover, &:focus {
    border-color: #1890ff;
    box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.1);
  }
`;

// 버튼
export const StyledButton = styled(Button)`
  height: 40px;
  border-radius: 8px;
  font-weight: 500;
  padding: 0 20px;
  display: flex;
  align-items: center;
  gap: 8px;

  &.ant-btn-primary {
    background: #1890ff;
    border: none;
    
    &:hover {
      background: #40a9ff;
    }
  }
`;

const UserInfoForm = () => {
  // 상태 초기화
  const [formState, setFormState] = useState({
    // 기본 정보
    name: '',
    residentNumber: '',
    phone: '',
    gender: '',
    personality: '',
    workIntensity: '',
    height: '',
    weight: '',
    bmi: '',
    
    // 증상
    symptoms: [],
    symptomDetails: '',
    
    // 스트레스
    stress: '',
    stressDetails: '',
    
    // 약물 및 기호식품
    medications: [],
    preferences: [],
    
    // 맥파 분석 데이터
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
    measurementDate: '',
    memo: '',
  });

  const [errors, setErrors] = useState({});

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    console.log('Input changed:', name, value);

    setFormState(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  }, [errors]);

  const handleFormUpdate = useCallback((updates) => {
    setFormState(prev => ({
      ...prev,
      ...updates
    }));
  }, []);

  return (
    <FormContainer>
      <BasicInfoSection 
        formData={formState}
        handleInputChange={handleInputChange}
        errors={errors}
      />
      
      <SymptomSection 
        formData={formState}
        handleInputChange={handleInputChange}
        errors={errors}
      />

      <StressSection 
        formData={formState}
        handleInputChange={handleInputChange}
        errors={errors}
      />
      
      <MedicationSection 
        formData={formState}
        handleInputChange={handleInputChange}
        error={errors.medications || errors.preferences}
      />
      
      <WaveAnalysisSection 
        formData={formState}
        setFormData={setFormState}
      />

      <MemoSection 
        formData={formState}
        handleInputChange={handleInputChange}
      />
    </FormContainer>
  );
};

export default UserInfoForm;