import React, { useMemo } from 'react';
import { Card, Select, Space, Typography } from 'antd';
import styled from '@emotion/styled';
import { 스트레스스케일표 } from '../../data/stressEvents';

const { Text } = Typography;

const StyledCard = styled(Card)`
  margin-bottom: 16px;
`;

const StressSection = ({ value, onChange }) => {
  // 스트레스 항목을 대분류별로 그룹화
  const stressOptions = useMemo(() => {
    return 스트레스스케일표.map(category => ({
      label: category.대분류,
      options: category.중분류.map(item => ({
        label: item.name,
        value: JSON.stringify({
          category: category.대분류,
          name: item.name,
          score: item.score
        })
      }))
    }));
  }, []);

  // 선택된 항목들의 총점 계산
  const calculateStressLevel = (selectedItems) => {
    const totalScore = selectedItems.reduce((sum, item) => {
      const itemData = JSON.parse(item.value);
      return sum + itemData.score;
    }, 0);

    // 스트레스 수준 결정
    if (totalScore >= 200) return '매우 위험';
    if (totalScore >= 150) return '위험';
    if (totalScore >= 100) return '보통';
    return '낮음';
  };

  const handleChange = (selectedItems) => {
    const formattedItems = selectedItems.map(item => {
      const itemData = JSON.parse(item.value);
      return {
        category: itemData.category,
        name: itemData.name,
        score: itemData.score
      };
    });

    const stressLevel = calculateStressLevel(selectedItems);

    onChange?.({
      items: formattedItems,
      level: stressLevel,
      totalScore: formattedItems.reduce((sum, item) => sum + item.score, 0)
    });
  };

  return (
    <StyledCard title="스트레스 평가">
      <Space direction="vertical" style={{ width: '100%' }}>
        <Select
          mode="multiple"
          style={{ width: '100%' }}
          placeholder="스트레스 요인을 선택하세요"
          value={value?.items?.map(item => ({
            label: item.name,
            value: JSON.stringify({
              category: item.category,
              name: item.name,
              score: item.score
            })
          })) || []}
          onChange={handleChange}
          options={stressOptions}
          labelInValue
        />
        {value?.level && (
          <Text>
            스트레스 수준: <Text strong>{value.level}</Text> (총점: {value.totalScore})
          </Text>
        )}
      </Space>
    </StyledCard>
  );
};

export default StressSection; 