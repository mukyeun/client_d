import React from 'react';
import { Row, Col, Select } from 'antd';
import { StyledCard, SectionTitle, FormItem, StyledSelect } from './styles';
import { 약물카테고리 } from '../../data/medications';
import { 기호식품카테고리 } from '../../data/preferences';
import medicationIcon from '../../assets/icons/medication.svg';

const { Option } = Select;

const MedicationSection = ({ data, onChange, errors }) => {
  const handleMedicationChange = (values) => {
    onChange({
      ...data,
      medications: values
    });
  };

  const handlePreferenceChange = (values) => {
    onChange({
      ...data,
      preferences: values
    });
  };

  return (
    <StyledCard>
      <SectionTitle>
        <div className="icon-wrapper" style={{
          background: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)',
          boxShadow: '0 4px 12px rgba(82, 196, 26, 0.15)'
        }}>
          <img src={medicationIcon} alt="약물" className="icon" />
        </div>
        <div className="title-text">
          복용약물
          <div className="subtitle">현재 복용 중인 약물 및 기호식품을 입력해주세요</div>
        </div>
      </SectionTitle>

      <Row gutter={[24, 24]}>
        <Col xs={24} sm={12}>
          <FormItem>
            <div className="label">복용 중인 약물</div>
            <StyledSelect
              mode="multiple"
              value={data.medications || []}
              onChange={handleMedicationChange}
              placeholder="약물을 선택하세요"
              status={errors?.medications ? 'error' : ''}
              allowClear
              showSearch
              optionFilterProp="children"
            >
              {약물카테고리.map((item, index) => (
                <Option key={`medication-${index}`} value={item}>
                  {item}
                </Option>
              ))}
            </StyledSelect>
            {errors?.medications && (
              <div className="error-message">{errors.medications}</div>
            )}
          </FormItem>
        </Col>

        <Col xs={24} sm={12}>
          <FormItem>
            <div className="label">기호식품</div>
            <StyledSelect
              mode="multiple"
              value={data.preferences || []}
              onChange={handlePreferenceChange}
              placeholder="기호식품을 선택하세요"
              status={errors?.preferences ? 'error' : ''}
              allowClear
              showSearch
              optionFilterProp="children"
            >
              {기호식품카테고리.map((item, index) => (
                <Option key={`preference-${index}`} value={item}>
                  {item}
                </Option>
              ))}
            </StyledSelect>
            {errors?.preferences && (
              <div className="error-message">{errors.preferences}</div>
            )}
          </FormItem>
        </Col>
      </Row>
    </StyledCard>
  );
};

export default MedicationSection; 