import styled from 'styled-components';
import { Input, Card, Typography } from 'antd';

const { Title } = Typography;

// 공통 카드 스타일
export const StyledCard = styled(Card)`
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
`;

// 공통 섹션 제목 스타일
export const SectionTitle = styled(Title)`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 24px !important;
`;

// 공통 폼 아이템 스타일
export const FormItem = styled.div`
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
`;

// 공통 입력 필드 스타일
export const StyledInput = styled(Input)`
  height: 36px;  // 모든 입력 필드 높이 통일
  
  &.ant-input-lg {
    height: 40px;
  }
  
  &.ant-input-sm {
    height: 32px;
  }
`;

// Select, TextArea 등의 높이도 통일
export const StyledSelect = styled(Input.Select)`
  .ant-select-selector {
    height: 36px !important;
    
    .ant-select-selection-search-input,
    .ant-select-selection-item {
      height: 34px !important;
      line-height: 34px !important;
    }
  }
`;

export const StyledTextArea = styled(Input.TextArea)`
  min-height: 36px;
  
  &.ant-input-lg {
    min-height: 40px;
  }
  
  &.ant-input-sm {
    min-height: 32px;
  }
`; 