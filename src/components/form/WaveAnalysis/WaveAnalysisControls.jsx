import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'antd';
import { ControlsContainer } from './styles';

const WaveAnalysisControls = ({
  onExecuteDevice,
  onFetchData,
  isFetchEnabled = true,
  isLoading = false
}) => {
  return (
    <ControlsContainer>
      <Button 
        onClick={onExecuteDevice}
        disabled={isLoading}
      >
        유비오맥파기 실행
      </Button>
      <Button 
        type="primary"
        onClick={onFetchData}
        disabled={!isFetchEnabled || isLoading}
      >
        유비오맥파 데이터 가져오기
      </Button>
    </ControlsContainer>
  );
};

WaveAnalysisControls.propTypes = {
  onExecuteDevice: PropTypes.func.isRequired,
  onFetchData: PropTypes.func.isRequired,
  isFetchEnabled: PropTypes.bool,
  isLoading: PropTypes.bool
};

export default WaveAnalysisControls; 