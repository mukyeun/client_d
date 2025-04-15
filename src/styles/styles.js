import styled from 'styled-components';
import { Card, Button } from 'antd';

// 카드 컴포넌트
export const StyledCard = styled(Card)`
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
  margin-bottom: 24px;
  border: none;
  background: white;

  .ant-card-body {
    padding: 24px;
  }

  @media (max-width: 768px) {
    .ant-card-body {
      padding: 16px;
    }
  }
`;

// 섹션 제목
export const SectionTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 32px;
  padding-bottom: 20px;
  border-bottom: 1px solid #f0f0f0;

  .icon-wrapper {
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 12px;
    background: ${({ gradient }) =>
      gradient || 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)'};
    box-shadow: 0 8px 16px rgba(24, 144, 255, 0.12);
    transition: all 0.3s ease;
  }

  .icon {
    width: 28px;
    height: 28px;
    object-fit: contain;
    filter: brightness(0) invert(1);
  }

  .title-text {
    font-size: 24px;
    font-weight: 600;
    color: #1f1f1f;
  }
`;

// 폼 아이템 공통 스타일
export const FormItem = styled.div`
  margin-bottom: 24px;

  .label {
    margin-bottom: 8px;
    font-weight: 500;
    color: #262626;
    font-size: 14px;
    display: flex;
    align-items: center;
    gap: 4px;

    &.required::after {
      content: '*';
      color: #ff4d4f;
      margin-left: 4px;
    }
  }

  .ant-input,
  .ant-select-selector {
    height: 40px !important;
    border-radius: 8px !important;
    padding: 4px 12px !important;
    background: white;
    border: 1px solid #d9d9d9;

    &:hover,
    &:focus {
      border-color: #1890ff;
      box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.1);
    }
  }
`;

// 버튼 공통 스타일
export const StyledButton = styled(Button)`
  height: 40px;
  border-radius: 8px;
  font-weight: 500;
  padding: 0 20px;

  &.ant-btn-primary {
    background: #1890ff;
    border: none;

    &:hover {
      background: #40a9ff;
    }
  }
`;

// 저장 버튼 전용 컨테이너
export const SaveButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  margin: 40px 0;
  padding-bottom: 24px;
`;

export const SaveButton = styled(Button)`
  height: 48px;
  padding: 0 48px;
  border-radius: 24px;
  font-size: 16px;
  font-weight: 500;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
  }
`;
