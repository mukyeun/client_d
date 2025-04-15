import styled from 'styled-components';
import { Input, Select } from 'antd';

export const StyledInput = styled(Input)`
  height: 40px;
  border-radius: 8px;
  font-size: 14px;
  border: 1.5px solid #d9d9d9;

  &:hover, &:focus {
    border-color: #1890ff;
    box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.1);
  }
`;

export const StyledSelect = styled(Select)`
  .ant-select-selector {
    height: 40px !important;
    border-radius: 8px !important;
    border: 1.5px solid #d9d9d9 !important;
    padding: 4px 11px !important;
  }
`;

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
