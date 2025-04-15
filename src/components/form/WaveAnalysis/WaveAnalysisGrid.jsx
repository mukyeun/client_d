import React from 'react';
import PropTypes from 'prop-types';
import { Input } from 'antd';
import { WaveDataGrid, FormItem } from './styles';
import { waveInputs } from './waveAnalysisUtils';

const WaveAnalysisGrid = ({ data = {}, onChange }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    const numericValue = value === '' ? '' : Number(value);
    onChange({
      ...data,
      [name]: numericValue
    });
  };

  return (
    <WaveDataGrid>
      {waveInputs.map(({ label, name, placeholder }) => (
        <FormItem key={name}>
          <div className="label">{label}</div>
          <Input
            type="number"
            name={name}
            value={data[name] ?? ''}
            onChange={handleChange}
            placeholder={placeholder}
            step="any"
          />
        </FormItem>
      ))}
    </WaveDataGrid>
  );
};

WaveAnalysisGrid.propTypes = {
  data: PropTypes.object,
  onChange: PropTypes.func.isRequired
};

WaveAnalysisGrid.defaultProps = {
  data: {}
};

export default WaveAnalysisGrid; 