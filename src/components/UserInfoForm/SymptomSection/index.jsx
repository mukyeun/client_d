import React, { useState } from 'react';
import { Card, Select, Tag, Space, Input, Typography, Row, Col } from 'antd';
import { MedicineBoxOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import { 증상카테고리 } from '../../../data/symptoms';
import symptomIcon from '../../../assets/icons/symptoms.svg';

const { Title } = Typography;
const { TextArea } = Input;

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
    background: linear-gradient(135deg, #ff4d4f 0%, #cf1322 100%);  // 증상 섹션에 맞는 색상
    box-shadow: 0 4px 12px rgba(255, 77, 79, 0.15);
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

const SelectContainer = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
`;

const SelectWrapper = styled.div`
  flex: 1;
  
  .select-label {
    margin-bottom: 8px;
    font-weight: 500;
  }
`;

const TagContainer = styled.div`
  padding: 16px;
  background: #f5f5f5;
  border-radius: 4px;
  min-height: 50px;
  margin-bottom: 16px;
  
  .ant-tag {
    margin: 4px;
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

const SymptomSection = ({ formData, handleInputChange }) => {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubCategory, setSelectedSubCategory] = useState('');

  const handleCategoryChange = (value) => {
    setSelectedCategory(value);
    setSelectedSubCategory('');
  };

  const handleSubCategoryChange = (value) => {
    setSelectedSubCategory(value);
  };

  const handleSymptomSelect = (value) => {
    if (!value) return;
    
    const updatedSymptoms = formData.symptoms || [];
    if (!updatedSymptoms.includes(value)) {
      handleInputChange({
        target: {
          name: 'symptoms',
          value: [...updatedSymptoms, value]
        }
      });
    }
  };

  const handleSymptomRemove = (symptomToRemove) => {
    const updatedSymptoms = (formData.symptoms || [])
      .filter(symptom => symptom !== symptomToRemove);
    
    handleInputChange({
      target: {
        name: 'symptoms',
        value: updatedSymptoms
      }
    });
  };

  return (
    <StyledCard>
      <SectionTitle>
        <div className="icon-wrapper">
          <img src={symptomIcon} alt="Symptoms" className="icon" />
        </div>
        <div className="title-text">
          증상
          <div className="subtitle">현재 겪고 있는 증상을 선택해주세요</div>
        </div>
      </SectionTitle>

      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <SelectContainer>
          <SelectWrapper>
            <div className="select-label">대분류</div>
            <Select
              style={{ width: '100%' }}
              value={selectedCategory}
              onChange={handleCategoryChange}
              placeholder="선택하세요"
            >
              {Object.keys(증상카테고리).map(category => (
                <Select.Option key={category} value={category}>
                  {category}
                </Select.Option>
              ))}
            </Select>
          </SelectWrapper>

          <SelectWrapper>
            <div className="select-label">중분류</div>
            <Select
              style={{ width: '100%' }}
              value={selectedSubCategory}
              onChange={handleSubCategoryChange}
              placeholder="선택하세요"
              disabled={!selectedCategory}
            >
              {selectedCategory && 
                Object.keys(증상카테고리[selectedCategory]).map(subCategory => (
                  <Select.Option key={subCategory} value={subCategory}>
                    {subCategory}
                  </Select.Option>
                ))
              }
            </Select>
          </SelectWrapper>

          <SelectWrapper>
            <div className="select-label">소분류</div>
            <Select
              style={{ width: '100%' }}
              onChange={handleSymptomSelect}
              placeholder="선택하세요"
              disabled={!selectedSubCategory}
            >
              {selectedSubCategory && 
                증상카테고리[selectedCategory][selectedSubCategory].map(symptom => (
                  <Select.Option key={symptom.name} value={symptom.name}>
                    {symptom.name}
                  </Select.Option>
                ))
              }
            </Select>
          </SelectWrapper>
        </SelectContainer>

        {formData.symptoms?.length > 0 && (
          <TagContainer>
            {formData.symptoms.map((symptom, index) => (
              <Tag
                key={index}
                closable
                onClose={() => handleSymptomRemove(symptom)}
              >
                {symptom}
              </Tag>
            ))}
          </TagContainer>
        )}

        <div>
          <div style={{ marginBottom: '8px', fontWeight: 500 }}>증상 상세</div>
          <TextArea
            name="symptomDetails"
            value={formData.symptomDetails}
            onChange={handleInputChange}
            placeholder="증상에 대해 자세히 설명해주세요"
            rows={4}
          />
        </div>
      </Space>
    </StyledCard>
  );
};

export default SymptomSection; 