import React from 'react';
import { Button, Space } from 'antd';
import { PlayCircleOutlined, SyncOutlined } from '@ant-design/icons';

const WaveAnalysisControls = ({
  onLaunchUBioMacpa,
  onDataFetch,
  loading,
  disabled
}) => {
  return (
    <Space style={{ marginBottom: 16 }}>
      <Button
        icon={<PlayCircleOutlined />}
        onClick={onLaunchUBioMacpa}
        disabled={disabled || loading}
      >
        U-Bio Macpa 실행
      </Button>

      <Button
        icon={<SyncOutlined spin={loading} />}
        onClick={onDataFetch}
        disabled={disabled || loading}
      >
        데이터 가져오기
      </Button>
    </Space>
  );
};

WaveAnalysisControls.displayName = 'WaveAnalysisControls';

export default WaveAnalysisControls; 