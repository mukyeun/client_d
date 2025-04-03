import React, { useRef } from 'react';
import { Card, Row, Col, Input, Space, Button, Typography } from 'antd';
import { LineChartOutlined, UploadOutlined } from '@ant-design/icons';
import WaveAnalysisControls from './WaveAnalysisControls';
import { useWaveAnalysis } from './useWaveAnalysis';
import styled from 'styled-components';
import waveIcon from '../../../assets/icons/wave-analysis.svg';

const { Title } = Typography;

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
    background: linear-gradient(135deg, #13c2c2 0%, #08979c 100%);  // 맥파 분석에 맞는 청록색 계열
    box-shadow: 0 4px 12px rgba(19, 194, 194, 0.15);
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
    flex-grow: 1;
    
    .subtitle {
      font-size: 14px;
      color: #666;
      font-weight: normal;
      margin-top: 4px;
    }
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;

  button {
    height: 36px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 0 16px;
    font-weight: 500;
    
    &.ant-btn-primary {
      background: linear-gradient(135deg, #13c2c2 0%, #08979c 100%);
      border: none;
      box-shadow: 0 2px 8px rgba(19, 194, 194, 0.2);
      
      &:hover {
        background: linear-gradient(135deg, #36cfc9 0%, #13c2c2 100%);
      }
    }
  }
`;

const HeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
`;

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 24px;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: 576px) {
    grid-template-columns: 1fr;
  }
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;

  label {
    font-weight: 500;
    color: #333;
    font-size: 14px;
  }

  input {
    height: 36px;
    border-radius: 8px;
    border: 1px solid #d9d9d9;
    padding: 0 12px;
    
    &:focus {
      border-color: #13c2c2;
      box-shadow: 0 0 0 2px rgba(19, 194, 194, 0.1);
    }
  }
`;

const InfoText = styled.div`
  color: #8c8c8c;
  font-size: 12px;
  margin-top: 4px;
`;

// 입력 필드 컴포넌트 - 단순화
const FormInput = ({ value, onChange, unit, placeholder, ...props }) => {
  return (
    <div>
      <Input
        {...props}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
      {unit && <InfoText>단위: {unit}</InfoText>}
    </div>
  );
};

const WaveAnalysisSection = () => {
  const fileInputRef = useRef(null);
  const {
    formData = {},
    handleLaunchUBioMacpa,
    handleDataFetch,
    handleInputChange,
    calculatePVC,
    calculateBV,
    calculateSV,
    error,
    loading,
    validationErrors,
    handleFileSelect,
    setFormData
  } = useWaveAnalysis();

  const inputStyle = {
    width: '100%',
    boxSizing: 'border-box',
  };

  const labelStyle = {
    marginBottom: '8px',
    display: 'block',
    whiteSpace: 'nowrap'
  };

  // 파일 선택 버튼 클릭 핸들러
  const handleFileButtonClick = (e) => {
    e.preventDefault(); // 기본 이벤트 중지
    console.log('파일 선택 버튼 클릭');
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // 파일 선택 핸들러
  const onFileSelect = (event) => {
    console.log('파일 선택됨');
    handleFileSelect(event, formData, setFormData);
  };

  return (
    <StyledCard>
      <HeaderContainer>
        <SectionTitle>
          <div className="icon-wrapper">
            <img src={waveIcon} alt="Wave Analysis" className="icon" />
          </div>
          <div className="title-text">
            맥파 분석
            <div className="subtitle">맥파 측정 데이터를 분석합니다</div>
          </div>
        </SectionTitle>
        
        <ButtonGroup>
          <Button type="primary" onClick={handleLaunchUBioMacpa} disabled={loading}>유비오맥파기 실행</Button>
          <Button onClick={handleDataFetch} disabled={loading}>유비오맥파데이터가져오기</Button>
        </ButtonGroup>
      </HeaderContainer>

      <GridContainer>
        <InputGroup>
          <label>ab (ms)</label>
          <input
            type="number"
            name="ab_ms"
            value={formData.ab_ms}
            onChange={handleInputChange}
            placeholder="ab 간격"
          />
        </InputGroup>

        <InputGroup>
          <label>ac (ms)</label>
          <input
            type="number"
            name="ac_ms"
            value={formData.ac_ms}
            onChange={handleInputChange}
            placeholder="ac 간격"
          />
        </InputGroup>

        <InputGroup>
          <label>ad (ms)</label>
          <input
            type="number"
            name="ad_ms"
            value={formData.ad_ms}
            onChange={handleInputChange}
            placeholder="ad 간격"
          />
        </InputGroup>

        <InputGroup>
          <label>ae (ms)</label>
          <input
            type="number"
            name="ae_ms"
            value={formData.ae_ms}
            onChange={handleInputChange}
            placeholder="ae 간격"
          />
        </InputGroup>

        <InputGroup>
          <label>ba 비율</label>
          <input
            type="number"
            name="ba_ratio"
            value={formData.ba_ratio}
            onChange={handleInputChange}
            placeholder="ba 비율"
          />
        </InputGroup>

        <InputGroup>
          <label>ca 비율</label>
          <input
            type="number"
            name="ca_ratio"
            value={formData.ca_ratio}
            onChange={handleInputChange}
            placeholder="ca 비율"
          />
        </InputGroup>

        <InputGroup>
          <label>da 비율</label>
          <input
            type="number"
            name="da_ratio"
            value={formData.da_ratio}
            onChange={handleInputChange}
            placeholder="da 비율"
          />
        </InputGroup>

        <InputGroup>
          <label>ea 비율</label>
          <input
            type="number"
            name="ea_ratio"
            value={formData.ea_ratio}
            onChange={handleInputChange}
            placeholder="ea 비율"
          />
        </InputGroup>

        <InputGroup>
          <label>심박수 (HR)</label>
          <input
            type="number"
            name="hr"
            value={formData.hr}
            onChange={handleInputChange}
            placeholder="심박수"
          />
        </InputGroup>

        <InputGroup>
          <label>맥파 속도 (PVC)</label>
          <input
            type="number"
            name="pvc"
            value={formData.pvc}
            onChange={handleInputChange}
            placeholder="맥파 속도"
          />
        </InputGroup>

        <InputGroup>
          <label>혈관 나이 (BV)</label>
          <input
            type="number"
            name="bv"
            value={formData.bv}
            onChange={handleInputChange}
            placeholder="혈관 나이"
          />
        </InputGroup>

        <InputGroup>
          <label>혈관 탄성도 (SV)</label>
          <input
            type="number"
            name="sv"
            value={formData.sv}
            onChange={handleInputChange}
            placeholder="혈관 탄성도"
          />
        </InputGroup>
      </GridContainer>

      {error && (
        <div style={{ color: 'red', marginTop: 16, textAlign: 'center' }}>
          {error}
        </div>
      )}

      {validationErrors.general && (
        <div className="error-message" style={{ 
          marginTop: '10px',
          color: '#ff4d4f',
          textAlign: 'center'
        }}>
          {validationErrors.general}
        </div>
      )}

      <input
        type="file"
        ref={fileInputRef}
        onChange={onFileSelect}
        style={{ display: 'none' }}
        accept=".xlsx,.xls"
      />
    </StyledCard>
  );
};

export default WaveAnalysisSection; 