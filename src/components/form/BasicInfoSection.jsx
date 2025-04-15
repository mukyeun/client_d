import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { Card, Row, Col, Input, Select, Typography } from 'antd';
import styled from 'styled-components';
import { v4 as uuidv4 } from 'uuid';
import { getGenderFromRRN } from '../../utils/dataUtils';
import userInfoIcon from '../../assets/icons/user-info.svg';

const { Option } = Select;
const { Title } = Typography;

const StyledCard = styled(Card)`
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
`;

const Wrapper = styled.div`
  padding: 24px;
  border: 1px solid #ddd;
  border-radius: 8px;
  margin-bottom: 24px;
  background-color: #fff;
`;

const FormItem = styled.div`
  margin-bottom: 16px;
`;

const FieldLabel = styled.div`
  margin-bottom: 4px;
  font-weight: 500;
`;

const StyledTextInput = styled(Input)`
  width: 100%;
  &.blood-pressure-input {
    width: 80px;
    text-align: center;
  }
`;

const StyledNumberInput = styled((props) => <Input {...props} type="number" />)`
  width: 100%;
  height: 32px;
`;

const StyledSelect = styled(Select)`
  width: 100% !important;
  .ant-select-selector {
    height: 32px !important;

    .ant-select-selection-item {
      line-height: 30px !important;
    }
  }
`;

const BloodPressureWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Separator = styled.span`
  padding: 0 4px;
  color: #666;
  font-weight: bold;
`;

const UnitText = styled.span`
  color: #666;
  white-space: nowrap;
`;

const HelpText = styled.div`
  font-size: 12px;
  color: #666;
  margin-top: 4px;
`;

const PERSONALITY_OPTIONS = ['매우급함', '급함', '보통', '느긋', '매우 느긋'];
const WORK_INTENSITY_OPTIONS = ['매우 심함', '심함', '보통', '적음', '매우 적음'];

const DEFAULT_PULSE_WAVE = {
  hr: 75,
  pvc: 0.0,
  bv: 1.2,
  sv: 70.0,
  lastUpdated: null
};

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
`;

const StyledInput = styled.input`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 14px;

  &:focus {
    border-color: #40a9ff;
    outline: none;
    box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
  }

  &:read-only {
    background-color: #f5f5f5;
    cursor: not-allowed;
  }
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 24px;
  
  .section-icon {
    width: 24px;
    height: 24px;
    margin-right: 8px;
  }
`;

const INPUT_FIELDS = [
  { label: '이름', name: 'name', type: 'text' },
  { label: '성별', name: 'gender', type: 'select', options: ['남자', '여자'] },
  { label: '생년월일', name: 'birthDate', type: 'date' },
  { label: '나이', name: 'age', type: 'number' }
  // 혈압(수축기/이완기)과 심박수 필드 제거
];

const BasicInfoSection = ({
  formData,
  onBasicInfoChange
}) => {
  const basicInfo = formData?.basicInfo || {};

  const handleInputChange = (field, value) => {
    console.log('💫 기본정보 필드 변경:', { field, value });

    if (field === 'height' || field === 'weight') {
      const height = field === 'height' ? value : basicInfo.height;
      const weight = field === 'weight' ? value : basicInfo.weight;
      
      if (height && weight) {
        const heightInMeters = Number(height) / 100;
        const bmi = (Number(weight) / (heightInMeters * heightInMeters)).toFixed(1);
        
        onBasicInfoChange({
          ...basicInfo,
          [field]: value,
          bmi
        });
        return;
      }
    }

    onBasicInfoChange({
      ...basicInfo,
      [field]: value
    });
  };

  const handleResidentNumberChange = (e) => {
    const input = e.target.value;
    
    const cleaned = input.replace(/[^\d-]/g, '');
    
    let formatted = cleaned;
    if (cleaned.length >= 6 && !cleaned.includes('-')) {
      formatted = `${cleaned.slice(0, 6)}-${cleaned.slice(6)}`;
    }

    let gender = '';
    if (formatted.length >= 8) {
      const genderDigit = formatted.charAt(7);
      gender = ['1', '3', '5'].includes(genderDigit) ? '남' : '여';
    }

    const patientId = formatted.length >= 7 
      ? `${formatted.slice(0, 6)}${formatted.charAt(7)}`
      : '';

    console.log('📝 주민번호 입력 처리:', {
      input,
      formatted,
      gender,
      patientId
    });

    onBasicInfoChange({
      ...basicInfo,
      residentNumber: formatted,
      gender,
      patientId
    });
  };

  const formatPhone = (value) => {
    const cleaned = value.replace(/[^0-9]/g, '').slice(0, 11);
    const parts = [
      cleaned.slice(0, 3),
      cleaned.slice(3, 7),
      cleaned.slice(7)
    ].filter(Boolean);
    return parts.join('-');
  };

  const calculateBMI = (h, w) => {
    const heightM = parseFloat(h) / 100;
    const weightKg = parseFloat(w);
    if (!heightM || !weightKg || heightM <= 0) return '';
    return (weightKg / (heightM * heightM)).toFixed(1);
  };

  const handleBloodPressureChange = (type, e) => {
    const value = e.target.value.replace(/\D/g, '');
    handleInputChange(type + 'Pressure', value);
  };

  const handleHeartRateChange = (value) => {
    const hr = parseInt(value);
    console.log('💓 심박수 입력:', {
      input: value,
      parsed: hr,
      isValid: !isNaN(hr)
    });
    handleInputChange('heartRate', hr);
  };

  useEffect(() => {
    if (!basicInfo.patientId && basicInfo.residentNumber) {
      const patientId = basicInfo.residentNumber.replace(/[^0-9]/g, '');
      handleInputChange('patientId', patientId);
    }
  }, [basicInfo.residentNumber]);

  useEffect(() => {
    if (basicInfo.height && basicInfo.weight) {
      const newBmi = calculateBMI(basicInfo.height, basicInfo.weight);
      handleInputChange('bmi', newBmi);
    }
  }, [basicInfo.height, basicInfo.weight]);

  return (
    <div>
      <SectionHeader>
        <img src={userInfoIcon} alt="기본정보" className="section-icon" />
        <Title level={4}>기본 정보</Title>
      </SectionHeader>

      <Wrapper>
        <Row gutter={[16, 16]}>
          <Col span={8}>
            <FormItem>
              <FieldLabel>이름</FieldLabel>
              <StyledTextInput 
                value={basicInfo.name || ''} 
                onChange={(e) => handleInputChange('name', e.target.value)} 
              />
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem>
              <FieldLabel>주민등록번호</FieldLabel>
              <StyledTextInput
                type="text"
                value={basicInfo.residentNumber || ''}
                onChange={handleResidentNumberChange}
                placeholder="000000-0000000"
                inputMode="numeric"
                maxLength={14}
              />
              <HelpText>숫자만 입력하세요 (최대 14자리, 하이픈 자동 삽입)</HelpText>
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem>
              <FieldLabel>성별</FieldLabel>
              <StyledTextInput
                value={basicInfo.gender || ''}
                readOnly
                placeholder="주민번호 입력 시 자동 입력"
              />
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem>
              <FieldLabel>연락처</FieldLabel>
              <StyledTextInput 
                value={basicInfo.phone || ''} 
                onChange={(e) => handleInputChange('phone', formatPhone(e.target.value))} 
              />
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem>
              <FieldLabel>성격</FieldLabel>
              <StyledSelect
                value={basicInfo.personality || undefined}
                onChange={(value) => handleInputChange('personality', value)}
                placeholder="선택"
              >
                {PERSONALITY_OPTIONS.map((v) => (
                  <Option key={v} value={v}>{v}</Option>
                ))}
              </StyledSelect>
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem>
              <FieldLabel>노동강도</FieldLabel>
              <StyledSelect
                value={basicInfo.workIntensity || undefined}
                onChange={(value) => handleInputChange('workIntensity', value)}
                placeholder="선택"
              >
                {WORK_INTENSITY_OPTIONS.map((v) => (
                  <Option key={v} value={v}>{v}</Option>
                ))}
              </StyledSelect>
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem>
              <FieldLabel>신장 (cm)</FieldLabel>
              <StyledNumberInput 
                value={basicInfo.height || ''} 
                onChange={(e) => handleInputChange('height', e.target.value)} 
              />
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem>
              <FieldLabel>체중 (kg)</FieldLabel>
              <StyledNumberInput 
                value={basicInfo.weight || ''} 
                onChange={(e) => handleInputChange('weight', e.target.value)} 
              />
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem>
              <FieldLabel>BMI</FieldLabel>
              <StyledTextInput 
                type="text" 
                value={basicInfo.bmi || ''} 
                readOnly 
              />
            </FormItem>
          </Col>
        </Row>
      </Wrapper>
    </div>
  );
};

BasicInfoSection.propTypes = {
  formData: PropTypes.object.isRequired,
  onBasicInfoChange: PropTypes.func.isRequired
};

export default BasicInfoSection;
