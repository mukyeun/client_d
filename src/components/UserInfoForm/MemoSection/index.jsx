import React from 'react';
import { Card, Input } from 'antd';
import styled from 'styled-components';
import memoIcon from '../../../assets/icons/memo.svg';

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
    background: linear-gradient(135deg, #faad14 0%, #d48806 100%);  // 메모 섹션에 맞는 황금색 계열
    box-shadow: 0 4px 12px rgba(250, 173, 20, 0.15);
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

const StyledTextArea = styled(TextArea)`
  border-radius: 8px;
  border: 1px solid #d9d9d9;
  padding: 12px;
  min-height: 120px;
  font-size: 14px;
  line-height: 1.6;
  resize: vertical;

  &:hover {
    border-color: #faad14;
  }

  &:focus {
    border-color: #faad14;
    box-shadow: 0 0 0 2px rgba(250, 173, 20, 0.1);
  }

  &::placeholder {
    color: #bfbfbf;
  }
`;

const MemoSection = ({ formData, handleInputChange }) => {
  return (
    <StyledCard>
      <SectionTitle>
        <div className="icon-wrapper">
          <img src={memoIcon} alt="Memo" className="icon" />
        </div>
        <div className="title-text">
          메모
          <div className="subtitle">추가적인 참고사항을 기록해주세요</div>
        </div>
      </SectionTitle>

      <StyledTextArea
        name="memo"
        value={formData.memo}
        onChange={handleInputChange}
        placeholder="추가 메모사항을 입력해주세요..."
        autoSize={{ minRows: 4, maxRows: 8 }}
      />
    </StyledCard>
  );
};

export default MemoSection; 