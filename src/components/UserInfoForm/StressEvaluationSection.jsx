import React, { useState } from 'react';
import { Card, Select, Tag, Space } from 'antd';
import { AlertOutlined } from '@ant-design/icons';
import { 스트레스카테고리, evaluateStressLevel } from '../../data/stressEvents';

const StressEvaluationSection = () => {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);

  const handleCategoryChange = (value) => {
    setSelectedCategory(value);
  };

  const handleItemSelect = (value) => {
    if (!value) return;
    
    const item = JSON.parse(value);
    if (!selectedItems.some(selected => selected.name === item.name)) {
      setSelectedItems([...selectedItems, item]);
    }
  };

  const handleItemRemove = (itemToRemove) => {
    setSelectedItems(selectedItems.filter(item => item.name !== itemToRemove.name));
  };

  const totalScore = selectedItems.reduce((sum, item) => sum + item.score, 0);
  const evaluation = totalScore > 0 ? evaluateStressLevel(totalScore) : null;

  return (
    <Card
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertOutlined style={{ fontSize: '24px' }} />
          <span>스트레스 평가</span>
        </div>
      }
      style={{ marginBottom: 24 }}
    >
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <div style={{ display: 'flex', gap: '16px' }}>
          <div style={{ flex: 1 }}>
            <div style={{ marginBottom: '8px' }}>스트레스 대분류</div>
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
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ marginBottom: '8px' }}>스트레스 항목</div>
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
          </div>
        </div>

        {selectedItems.length > 0 && (
          <div>
            <div style={{ marginBottom: '16px' }}>
              {selectedItems.map((item, index) => (
                <Tag
                  key={index}
                  closable
                  onClose={() => handleItemRemove(item)}
                  style={{ margin: '4px' }}
                >
                  {item.name} ({item.score}점)
                </Tag>
              ))}
            </div>

            <div style={{ 
              background: '#f5f5f5', 
              padding: '16px', 
              borderRadius: '4px' 
            }}>
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
            </div>
          </div>
        )}
      </Space>
    </Card>
  );
};

export default StressEvaluationSection; 