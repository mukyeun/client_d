import styled from 'styled-components';
import { Card, Input as AntInput, Button } from 'antd';

/** 섹션 컨테이너 */
export const SectionContainer = styled.div`
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
`;

/** 카드 컨테이너 */
export const StyledCard = styled(Card)`
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
`;

/** 섹션 타이틀 */
export const SectionTitle = styled.div`
  display: flex;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid #f0f0f0;

  .icon-wrapper {
    width: 40px;
    height: 40px;
    border-radius: 8px;
    margin-right: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
    box-shadow: 0 4px 12px rgba(24, 144, 255, 0.15);
  }

  .icon {
    font-size: 24px;
    color: white;
  }

  .title-text {
    display: flex;
    flex-direction: column;
    font-size: 20px;
    font-weight: 600;
    
    .subtitle {
      font-size: 14px;
      font-weight: normal;
      color: #8c8c8c;
      margin-top: 4px;
    }
  }
`;

/** 버튼 그룹 컨테이너 */
export const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  padding: 0 24px;
`;

/** 컨트롤 버튼 컨테이너 */
export const ControlsContainer = styled.div`
  display: flex;
  gap: 16px;
  margin: 24px 0;
  justify-content: flex-start;
`;

/** 에러 메시지 */
export const ErrorMessage = styled.div`
  color: #ff4d4f;
  margin-top: 16px;
`;

/** 맥파 입력 필드 그리드 */
export const WaveDataGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-top: 24px;
`;

/** 폼 항목 라벨 + 입력 필드 */
export const FormItem = styled.div`
  margin-bottom: 16px;

  .label {
    margin-bottom: 8px;
    font-weight: 500;
    color: #262626;
  }
`;

/** 버튼 */
export const StyledButton = styled(Button)`
  min-width: 120px;
  height: 36px;
  margin-right: 12px;
  
  &.primary {
    background: #1890ff;
    border-color: #1890ff;
    color: white;
    
    &:hover {
      background: #40a9ff;
      border-color: #40a9ff;
    }
  }
`;

/** 데이터 그리드 */
export const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin: 24px 0;
  padding: 20px;
  background: #fafafa;
  border-radius: 8px;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

/** 입력 그룹 */
export const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

/** 라벨 */
export const Label = styled.label`
  font-size: 14px;
  color: #666;
  margin-bottom: 4px;
`;

/** 스타일된 입력 필드 */
export const StyledInput = styled(AntInput)`
  width: 100%;
  
  &[readonly] {
    background-color: ${props => props.isCalculated ? '#f0f5ff' : '#f5f5f5'};
    cursor: default;
    &:hover {
      border-color: #d9d9d9;
    }
  }

  &::placeholder {
    color: #bbb;
    font-style: italic;
  }
`;

/** 결과 컨테이너 */
export const ResultsContainer = styled.div`
  margin-top: 24px;
  padding: 16px;
  background: #fafafa;
  border-radius: 4px;
  border: 1px solid #f0f0f0;
`;

export const ContentWrapper = styled.div`
  padding: 24px;
`;

export const WarningMessage = styled.div`
  padding: 12px;
  margin: 16px 24px;
  background: #fff2f0;
  border: 1px solid #ffccc7;
  border-radius: 4px;
  color: #ff4d4f;
`;

export const CalculationResults = styled.div`
  margin: 24px;
  padding: 16px;
  background: #f6ffed;
  border: 1px solid #b7eb8f;
  border-radius: 4px;
`;

export const ResultsTitle = styled.div`
  color: #52c41a;
  margin-bottom: 12px;
  font-weight: 500;
`;

export const ResultsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
`;

export const ResultItem = styled.div`
  padding: 8px;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.1);
`;

export const ResultLabel = styled.div`
  color: #666;
  font-size: 12px;
`;

export const ResultValue = styled.div`
  font-size: 16px;
  font-weight: 500;
  margin-top: 4px;
`;

export const CalculationNote = styled.p`
  color: #666;
  font-size: 13px;
  margin-top: 12px;
  font-style: italic;
`;