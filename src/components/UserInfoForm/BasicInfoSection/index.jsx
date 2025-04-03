import React from 'react';
import { Card, Row, Col, Input, Select, Typography } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import userIcon from '../../../assets/icons/user-info.svg';  // 경로 수정

const { Title } = Typography;
const { Option } = Select;

const StyledCard = styled(Card)`
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
`;

const SectionTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 28px;
  padding-bottom: 16px;
  border-bottom: 2px solid #f0f0f0;

  .icon-wrapper {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 12px;
    background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
    box-shadow: 0 4px 12px rgba(24, 144, 255, 0.15);
  }

  .icon {
    width: 24px;
    height: 24px;
    object-fit: contain;
  }

  .title-text {
    font-size: 22px;
    font-weight: 600;
    color: #1f1f1f;
    margin: 0;
    
    .subtitle {
      font-size: 14px;
      color: #666;
      font-weight: normal;
      margin-top: 4px;
    }
  }
`;

const FormItem = styled.div`
  margin-bottom: 16px;
  
  .label {
    margin-bottom: 8px;
    font-weight: 500;
  }

  .required::after {
    content: '*';
    color: #ff4d4f;
    margin-left: 4px;
  }

  // 입력 필드 높이 조정
  .ant-input,
  .ant-input-number,
  .ant-select-selector {
    height: 36px !important;
  }

  .ant-input-number-input {
    height: 34px !important;
  }

  // 혈압 입력 필드 스타일 조정
  .bp-container {
    display: flex;
    align-items: center;
    gap: 8px;

    .ant-input-number,
    .ant-input {
      height: 36px !important;
    }

    .separator {
      color: #666;
    }
  }
`;

const BloodPressureInput = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;

  .bp-input {
    width: 80px;
  }

  .separator {
    color: #666;
    font-weight: 500;
  }
`;

const BasicInfoSection = ({ formData, handleInputChange, errors }) => {
  // BMI 계산
  const calculateBMI = (height, weight) => {
    if (!height || !weight) return '';
    const heightInMeters = height / 100;
    const bmi = (weight / (heightInMeters * heightInMeters)).toFixed(1);
    return bmi;
  };

  // 주민번호 입력 처리
  const handleResidentNumberChange = (e) => {
    let value = e.target.value.replace(/[^0-9-]/g, '');
    if (value.length === 6 && !value.includes('-')) {
      value = value + '-';
    }
    handleInputChange({
      target: {
        name: 'residentNumber',
        value: value.slice(0, 14)
      }
    });
  };

  // 전화번호 입력 처리
  const handlePhoneChange = (e) => {
    let value = e.target.value.replace(/[^0-9-]/g, '');
    if (value.length === 3 || value.length === 8) {
      value += '-';
    }
    handleInputChange({
      target: {
        name: 'phone',
        value: value.slice(0, 13)
      }
    });
  };

  // 혈압 입력 처리
  const handleBloodPressureChange = (type, value) => {
    handleInputChange({
      target: {
        name: type,
        value: value
      }
    });
  };

  return (
    <StyledCard>
      <SectionTitle>
        <div className="icon-wrapper">
          <img src={userIcon} alt="User Info" className="icon" />
        </div>
        <div className="title-text">
          기본 정보
          <div className="subtitle">사용자의 기본적인 정보를 입력해주세요</div>
        </div>
      </SectionTitle>

      <Row gutter={[24, 16]}>
        <Col xs={24} sm={8}>
          <FormItem>
            <div className="label required">이름</div>
            <Input
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="이름을 입력하세요"
              status={errors?.name && 'error'}
            />
            {errors?.name && <div style={{ color: '#ff4d4f', fontSize: '12px' }}>{errors.name}</div>}
          </FormItem>
        </Col>

        <Col xs={24} sm={8}>
          <FormItem>
            <div className="label required">주민등록번호</div>
            <Input
              name="residentNumber"
              value={formData.residentNumber}
              onChange={handleResidentNumberChange}
              placeholder="123456-1234567"
              maxLength={14}
              status={errors?.residentNumber && 'error'}
            />
            {errors?.residentNumber && <div style={{ color: '#ff4d4f', fontSize: '12px' }}>{errors.residentNumber}</div>}
          </FormItem>
        </Col>

        <Col xs={24} sm={8}>
          <FormItem>
            <div className="label required">연락처</div>
            <Input
              name="phone"
              value={formData.phone}
              onChange={handlePhoneChange}
              placeholder="010-0000-0000"
              maxLength={13}
              status={errors?.phone && 'error'}
            />
            {errors?.phone && <div style={{ color: '#ff4d4f', fontSize: '12px' }}>{errors.phone}</div>}
          </FormItem>
        </Col>

        <Col xs={24} sm={8}>
          <FormItem>
            <div className="label">성별</div>
            <Select
              name="gender"
              value={formData.gender}
              onChange={(value) => handleInputChange({ target: { name: 'gender', value }})}
              placeholder="선택하세요"
              style={{ width: '100%' }}
            >
              <Option value="male">남성</Option>
              <Option value="female">여성</Option>
            </Select>
          </FormItem>
        </Col>

        <Col xs={24} sm={8}>
          <FormItem>
            <div className="label">성격</div>
            <Select
              name="personality"
              value={formData.personality}
              onChange={(value) => handleInputChange({ target: { name: 'personality', value }})}
              placeholder="선택하세요"
              style={{ width: '100%' }}
            >
              {['매우 급함', '급함', '원만', '느긋', '매우 느긋'].map(option => (
                <Option key={option} value={option}>{option}</Option>
              ))}
            </Select>
          </FormItem>
        </Col>

        <Col xs={24} sm={8}>
          <FormItem>
            <div className="label">노동강도</div>
            <Select
              name="workIntensity"
              value={formData.workIntensity}
              onChange={(value) => handleInputChange({ target: { name: 'workIntensity', value }})}
              placeholder="선택하세요"
              style={{ width: '100%' }}
            >
              {['매우 높음', '높음', '보통', '낮음', '매우 낮음'].map(option => (
                <Option key={option} value={option}>{option}</Option>
              ))}
            </Select>
          </FormItem>
        </Col>

        <Col xs={24} sm={8}>
          <FormItem>
            <div className="label">혈압</div>
            <div className="bp-container">
              <Input
                type="number"
                name="diastolicPressure"
                value={formData.diastolicPressure}
                onChange={handleInputChange}
                placeholder="이완기"
                suffix="mmHg"
                style={{ width: '45%' }}
              />
              <span className="separator">/</span>
              <Input
                type="number"
                name="systolicPressure"
                value={formData.systolicPressure}
                onChange={handleInputChange}
                placeholder="수축기"
                suffix="mmHg"
                style={{ width: '45%' }}
              />
            </div>
          </FormItem>
        </Col>

        <Col xs={24} sm={8}>
          <FormItem>
            <div className="label required">신장</div>
            <Input
              name="height"
              type="number"
              value={formData.height}
              onChange={handleInputChange}
              placeholder="cm"
              suffix="cm"
              status={errors?.height && 'error'}
            />
            {errors?.height && (
              <div style={{ color: '#ff4d4f', fontSize: '12px' }}>
                {errors.height}
              </div>
            )}
          </FormItem>
        </Col>

        <Col xs={24} sm={8}>
          <FormItem>
            <div className="label required">체중</div>
            <Input
              name="weight"
              type="number"
              value={formData.weight}
              onChange={handleInputChange}
              placeholder="kg"
              suffix="kg"
              status={errors?.weight && 'error'}
            />
            {errors?.weight && (
              <div style={{ color: '#ff4d4f', fontSize: '12px' }}>
                {errors.weight}
              </div>
            )}
          </FormItem>
        </Col>

        <Col xs={24} sm={8}>
          <FormItem>
            <div className="label">BMI</div>
            <Input
              value={calculateBMI(formData.height, formData.weight)}
              disabled
              placeholder="BMI"
            />
          </FormItem>
        </Col>
      </Row>
    </StyledCard>
  );
};

export default BasicInfoSection; 