import styled from 'styled-components';
import { Card, Input, Select } from 'antd';

const { TextArea } = Input;

export const FormContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
`;

export const StyledCard = styled(Card)`
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
`;

export const SectionTitle = styled.div`
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
    box-shadow: 0 4px 12px rgba(114, 46, 209, 0.15);
  }

  .icon {
    width: 24px;
    height: 24px;
  }

  .title-text {
    font-size: 22px;
    font-weight: 600;
    color: #1f1f1f;

    .subtitle {
      font-size: 14px;
      color: #666;
      margin-top: 4px;
    }
  }
`;

export const FormItem = styled.div`
  margin-bottom: 16px;

  .label {
    font-weight: 500;
    margin-bottom: 8px;
    color: #262626;
  }
`;

export const SelectContainer = styled.div`
  display: flex;
  gap: 24px;
  margin-bottom: 24px;
`;

export const SelectWrapper = styled.div`
  flex: 1;
`;

export const StyledSelect = styled(Select)`
  width: 100%;
`;

export const TagContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
`;

export const EvaluationContainer = styled.div`
  background: #f5f5f5;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 24px;

  .score {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 8px;
  }

  .level {
    display: flex;
    align-items: center;
    gap: 8px;

    .description {
      color: #666;
    }
  }
`;

export const StyledTextArea = styled(Input.TextArea)`
  &.ant-input {
    border-radius: 8px;
  }
`;

export const ButtonGroup = styled.div`
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 24px;
  margin-bottom: 32px;

  button {
    height: 44px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 0 24px;
    font-weight: 500;
    
    &.ant-btn-primary {
      background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
      border: none;
      box-shadow: 0 2px 8px rgba(24, 144, 255, 0.2);
      
      &:hover {
        background: linear-gradient(135deg, #40a9ff 0%, #1890ff 100%);
      }
    }
  }
`;

export const StyledInput = styled(Input)`
  width: 100% !important;
  border-radius: 8px;
  height: 40px;
  padding: 4px 11px;

  &:hover, &:focus {
    border-color: #13c2c2;
    box-shadow: 0 0 0 2px rgba(19, 194, 194, 0.1);
  }

  &::placeholder {
    color: #bfbfbf;
  }

  &.ant-input-disabled {
    background-color: #f5f5f5;
    cursor: not-allowed;
  }

  &.ant-input-number {
    .ant-input-number-handler-wrap {
      border-radius: 0 8px 8px 0;
    }
  }
`;

export const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 24px;

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 576px) {
    grid-template-columns: 1fr;
  }
`;

export const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  
  label {
    font-weight: 500;
    margin-bottom: 4px;
    font-size: 14px;
  }

  input {
    padding: 8px;
    height: 36px;
    border-radius: 8px;
    border: 1px solid #d9d9d9;
    
    &:hover {
      border-color: #13c2c2;
    }

    &:focus {
      border-color: #13c2c2;
      box-shadow: 0 0 0 2px rgba(19, 194, 194, 0.1);
      outline: none;
    }
  }
`;
