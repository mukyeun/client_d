import React from 'react';
import { Form, Input, Row, Col, Spin } from 'antd';

const WaveAnalysisGrid = ({
  formData,
  onInputChange,
  calculatePVC,
  calculateBV,
  calculateSV,
  error,
  loading
}) => {
  const gridStyle = {
    marginTop: 16,
    opacity: loading ? 0.7 : 1,
    pointerEvents: loading ? 'none' : 'auto'
  };

  const renderInput = (field, label, disabled = false) => (
    <Form.Item label={label} style={{ marginBottom: 8 }}>
      <Input
        value={formData[field]}
        onChange={(e) => onInputChange(field, e.target.value)}
        disabled={disabled || loading}
      />
    </Form.Item>
  );

  return (
    <Spin spinning={loading}>
      <div style={gridStyle}>
        <Row gutter={16}>
          <Col span={6}>
            {renderInput('ab_ms', 'a-b (ms)', true)}
            {renderInput('ac_ms', 'a-c (ms)', true)}
          </Col>
          <Col span={6}>
            {renderInput('ad_ms', 'a-d (ms)', true)}
            {renderInput('ae_ms', 'a-e (ms)', true)}
          </Col>
          <Col span={6}>
            {renderInput('ba_ratio', 'b/a ratio', true)}
            {renderInput('ca_ratio', 'c/a ratio', true)}
          </Col>
          <Col span={6}>
            {renderInput('da_ratio', 'd/a ratio', true)}
            {renderInput('ea_ratio', 'e/a ratio', true)}
          </Col>
        </Row>

        <Row gutter={16} style={{ marginTop: 16 }}>
          <Col span={6}>
            {renderInput('pvc', 'PVC', true)}
          </Col>
          <Col span={6}>
            {renderInput('bv', 'BV', true)}
          </Col>
          <Col span={6}>
            {renderInput('sv', 'SV', true)}
          </Col>
          <Col span={6}>
            {renderInput('pulse', 'HR', true)}
          </Col>
        </Row>

        {error && (
          <div style={{ color: 'red', marginTop: 16 }}>
            {error}
          </div>
        )}
      </div>
    </Spin>
  );
};

export default WaveAnalysisGrid; 