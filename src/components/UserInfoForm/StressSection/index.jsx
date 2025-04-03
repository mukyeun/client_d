import React, { useState } from 'react';
import { Card, Select, Tag, Space, Input, Typography, Row, Col } from 'antd';
import { AlertOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import { 스트레스카테고리, evaluateStressLevel } from '../../../data/stressEvents';
import stressIcon from '../../../assets/icons/stress.svg';

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
    background: linear-gradient(135deg, #722ed1 0%, #531dab 100%);  // 스트레스 섹션에 맞는 보라색 계열
    box-shadow: 0 4px 12px rgba(114, 46, 209, 0.15);
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
  margin-bottom: 16px;
  
  .ant-tag {
    margin: 4px;
  }
`;

const EvaluationContainer = styled.div`
  background: #f5f5f5;
  padding: 16px;
  border-radius: 4px;
  margin-bottom: 16px;
`;

const FormItem = styled.div`
  margin-bottom: 16px;
  
  .label {
    margin-bottom: 8px;
    font-weight: 500;
    color: #333;
  }
`;

const StressSection = ({ formData, handleInputChange }) => {
  const [selectedCategory, setSelectedCategory] = useState('');
  const selectedItems = formData.stressItems || [];

  const handleCategoryChange = (value) => {
    setSelectedCategory(value);
  };

  const handleItemSelect = (value) => {
    if (!value) return;
    
    const item = JSON.parse(value);
    const updatedItems = selectedItems.some(selected => selected.name === item.name)
      ? selectedItems
      : [...selectedItems, item];
    
    handleInputChange({
      target: {
        name: 'stressItems',
        value: updatedItems
      }
    });
  };

  const handleItemRemove = (itemToRemove) => {
    const updatedItems = selectedItems.filter(item => item.name !== itemToRemove.name);
    handleInputChange({
      target: {
        name: 'stressItems',
        value: updatedItems
      }
    });
  };

  const totalScore = selectedItems.reduce((sum, item) => sum + item.score, 0);
  const evaluation = totalScore > 0 ? evaluateStressLevel(totalScore) : null;

  return (
    <StyledCard>
      <SectionTitle>
        <div className="icon-wrapper">
          <img src={stressIcon} alt="Stress Level" className="icon" />
        </div>
        <div className="title-text">
          스트레스
          <div className="subtitle">현재 스트레스 수준을 평가해주세요</div>
        </div>
      </SectionTitle>

      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <SelectContainer>
          <SelectWrapper>
            <div className="select-label">스트레스 대분류</div>
            <Select
              style={{ width: '100%' }}
              value={selectedCategory}
              onChange={handleCategoryChange}
              placeholder="선택하세요"
            >
              {스트레스카테고리.map((category, index) => (
                <Select.Option key={index} value={category.대분류}>
                  {category.대분류}
                </Select.Option>
              ))}
            </Select>
          </SelectWrapper>

          <SelectWrapper>
            <div className="select-label">스트레스 항목</div>
            <Select
              style={{ width: '100%' }}
              onChange={handleItemSelect}
              disabled={!selectedCategory}
              placeholder="선택하세요"
            >
              {selectedCategory && 스트레스카테고리
                .find(category => category.대분류 === selectedCategory)
                ?.중분류.map((item, index) => (
                  <Select.Option key={index} value={JSON.stringify(item)}>
                    {item.name} ({item.score}점)
                  </Select.Option>
                ))}
            </Select>
          </SelectWrapper>
        </SelectContainer>

        {selectedItems.length > 0 && (
          <>
            <TagContainer>
              {selectedItems.map((item, index) => (
                <Tag
                  key={index}
                  closable
                  onClose={() => handleItemRemove(item)}
                >
                  {item.name} ({item.score}점)
                </Tag>
              ))}
            </TagContainer>

            <EvaluationContainer>
              <div style={{ marginBottom: '8px' }}>
                총점: {totalScore}점
              </div>
              {evaluation && (
                <div>
                  스트레스 수준: 
                  <Tag 
                    color={
                      evaluation.level === '심각' ? 'red' :
                      evaluation.level === '중증' ? 'orange' :
                      evaluation.level === '경증' ? 'gold' : 'green'
                    }
                    style={{ margin: '0 8px' }}
                  >
                    {evaluation.level}
                  </Tag>
                  <span style={{ color: '#666' }}>
                    ({evaluation.description})
                  </span>
                </div>
              )}
            </EvaluationContainer>
          </>
        )}

        <div>
          <div style={{ marginBottom: '8px', fontWeight: 500 }}>스트레스 상세</div>
          <TextArea
            name="stressDetails"
            value={formData.stressDetails}
            onChange={handleInputChange}
            placeholder="스트레스 상황에 대해 자세히 설명해주세요"
            rows={4}
          />
        </div>
      </Space>
    </StyledCard>
  );
};

export default StressSection; 