import styled from 'styled-components';
import { Card, Button, Input } from 'antd';

export const StyledCard = styled(Card)`
  .ant-card-head {
    background: #f8f9fa;
    border-bottom: 2px solid #e9ecef;
  }

  .ant-card-head-title {
    padding: 12px 0;
  }
`;

export const ControlsContainer = styled.div`
  margin-bottom: 40px;
  display: flex;
  gap: 16px;
  justify-content: center;
  
  @media (max-width: 576px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

export const StyledButton = styled(Button)`
  min-width: 180px;
  height: 40px;
  
  &.launch-button {
    background: #1890ff;
    border-color: #1890ff;
    
    &:hover {
      background: #40a9ff;
      border-color: #40a9ff;
    }
  }
`;

export const GridContainer = styled.div`
  width: 90%;
  margin: 0 auto;
  max-width: 1200px;
`;

export const StyledInput = styled(Input)`
  &.analysis-result {
    background-color: #f6f8fa;
    color: #1f1f1f;
    font-weight: 500;
  }

  &.warning {
    border-color: #faad14;
    
    &:hover, &:focus {
      border-color: #ffc53d;
      box-shadow: 0 0 0 2px rgba(250, 173, 20, 0.2);
    }
  }

  &.error {
    border-color: #ff4d4f;
    
    &:hover, &:focus {
      border-color: #ff7875;
      box-shadow: 0 0 0 2px rgba(255, 77, 79, 0.2);
    }
  }
`;

export const SectionTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  
  img {
    width: 24px;
    height: 24px;
  }
  
  span {
    font-size: 16px;
    font-weight: 500;
  }
`;

export const ErrorMessage = styled.div`
  color: #ff4d4f;
  font-size: 14px;
  margin-top: 4px;
`;

export const ResultsContainer = styled.div`
  margin-top: 24px;
  padding: 16px;
  background: #fafafa;
  border-radius: 4px;
  border: 1px solid #f0f0f0;
`; 