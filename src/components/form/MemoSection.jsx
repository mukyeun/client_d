import React from 'react';
import { Input } from 'antd';
import { StyledCard, SectionTitle, FormItem } from './styles';
import memoIcon from '../../assets/icons/memo.svg';

const { TextArea } = Input;

const MemoSection = ({ data, onChange }) => {
  return (
    <StyledCard>
      <SectionTitle>
        <div className="icon-wrapper" style={{ background: 'linear-gradient(135deg, #722ed1 0%, #531dab 100%)' }}>
          <img src={memoIcon} alt="Memo" className="icon" />
        </div>
        <div className="title-text">
          메모
          <div className="subtitle">환자에 대한 추가적인 메모를 입력하세요</div>
        </div>
      </SectionTitle>

      <FormItem>
        <TextArea
          rows={4}
          value={data || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="특이사항, 주의사항 등을 자유롭게 입력하세요"
        />
      </FormItem>
    </StyledCard>
  );
};

export default MemoSection; 