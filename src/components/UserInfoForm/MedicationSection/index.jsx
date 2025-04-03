import React from 'react';
import { Card, Row, Col, Select, Typography, Tag } from 'antd';
import { MedicineBoxOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import { 약물카테고리 } from '../../../data/medications';
import { 기호식품카테고리 } from '../../../data/preferences';
import medicationIcon from '../../../assets/icons/medication.svg';

const { Title } = Typography;
const { Option } = Select;

const StyledCard = styled(Card)`
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
  
  .ant-card-head {
    border-bottom: none;
    padding: 16px 24px;
  }
  
  .ant-card-body {
    padding: 24px;
  }
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
    background: linear-gradient(135deg, #52c41a 0%, #389e0d 100%);  // 약물 섹션에 맞는 녹색 계열
    box-shadow: 0 4px 12px rgba(82, 196, 26, 0.15);
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
    color: #333;
  }
`;

const StyledSelect = styled(Select)`
  width: 100%;
  
  &.ant-select-focused {
    box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.1);
  }
`;

const TagContainer = styled.div`
  margin-top: 8px;
  min-height: 32px;
  
  .ant-tag {
    margin: 4px;
    padding: 4px 8px;
    font-size: 14px;
  }
`;

const MedicationSection = ({ formData, handleInputChange, error }) => {
  // 복수 선택 처리 함수
  const handleMedicationChange = (values) => {
    handleInputChange({
      target: { name: 'medications', value: values }
    });
  };

  const handlePreferenceChange = (values) => {
    handleInputChange({
      target: { name: 'preferences', value: values }
    });
  };

  return (
    <StyledCard>
      <SectionTitle>
        <div className="icon-wrapper">
          <img src={medicationIcon} alt="Medication" className="icon" />
        </div>
        <div className="title-text">
          복용약물
          <div className="subtitle">현재 복용 중인 약물을 입력해주세요</div>
        </div>
      </SectionTitle>
      
      <Row gutter={[24, 24]}>
        <Col xs={24} sm={12}>
          <div>
            <div style={{ marginBottom: 8 }}>복용 중인 약물 (복수 선택 가능)</div>
            <StyledSelect
              mode="multiple"
              value={formData.medications}
              onChange={handleMedicationChange}
              placeholder="약물을 선택하세요"
              status={error && 'error'}
              allowClear
            >
              {약물카테고리.map((약물, index) => (
                <Option key={`medication-${index}`} value={약물}>
                  {약물}
                </Option>
              ))}
            </StyledSelect>
            {error && <div style={{ color: '#ff4d4f', fontSize: '12px', marginTop: 4 }}>{error}</div>}
          </div>
        </Col>
        
        <Col xs={24} sm={12}>
          <div>
            <div style={{ marginBottom: 8 }}>기호식품 (복수 선택 가능)</div>
            <StyledSelect
              mode="multiple"
              value={formData.preferences}
              onChange={handlePreferenceChange}
              placeholder="기호식품을 선택하세요"
              status={error && 'error'}
              allowClear
            >
              {기호식품카테고리.map((기호품, index) => (
                <Option key={`preference-${index}`} value={기호품}>
                  {기호품}
                </Option>
              ))}
            </StyledSelect>
            {error && <div style={{ color: '#ff4d4f', fontSize: '12px', marginTop: 4 }}>{error}</div>}
          </div>
        </Col>
      </Row>
    </StyledCard>
  );
};

export default MedicationSection; 