// ✅ WaveAnalysis.jsx 전체 완성본 (1/2)

import React, { useState, useEffect, useRef, useCallback } from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { Typography, message, Button, Card, Row, Col, Space, Text } from 'antd';
import { PlayCircleOutlined, DownloadOutlined } from '@ant-design/icons';
import * as XLSX from 'xlsx';
import waveIcon from '../../../assets/icons/wave-analysis.svg';
import { calculatePVC, calculateBV, calculateSV } from './waveAnalysisUtils';
import {
  GridContainer,
  InputGroup,
  Label,
  StyledInput,
  ControlsContainer,
  ResultsContainer,
  CalculationNote,
  WaveDataGrid
} from './styles';

const { Title } = Typography;

// 혈관 탄성도 등급별 수치 매핑 수정 (A->0.2, E->1.0)
const ELASTICITY_SCORES = {
  'A': 0.2,
  'B': 0.4,
  'C': 0.6,
  'D': 0.8,
  'E': 1.0
};

const INPUT_FIELDS = [
  { label: 'a-b (ms)', name: 'a-b', isManual: true, type: 'number' },
  { label: 'a-c (ms)', name: 'a-c', isManual: true, type: 'number' },
  { label: 'a-d (ms)', name: 'a-d', isManual: true, type: 'number' },
  { label: 'a-e (ms)', name: 'a-e', isManual: true, type: 'number' },
  { label: 'b/a', name: 'b/a', isManual: true, type: 'number' },
  { label: 'c/a', name: 'c/a', isManual: true, type: 'number' },
  { label: 'd/a', name: 'd/a', isManual: true, type: 'number' },
  { label: 'e/a', name: 'e/a', isManual: true, type: 'number' },
  { 
    label: '혈관의 탄성도', 
    name: 'elasticityScore', 
    isManual: false, 
    type: 'number',
    precision: 1
  },
  { label: '말초혈관 수축도 (PVC)', name: 'PVC', isManual: false, type: 'number', precision: 2 },
  { label: '혈관점탄도 (BV)', name: 'BV', isManual: false, type: 'number', precision: 2 },
  { label: '일회박출량 (SV)', name: 'SV', isManual: false, type: 'number', precision: 2 }
];

const DEFAULT_PULSE_WAVE = {
  'a-b': null, 'a-c': null, 'a-d': null, 'a-e': null,
  'b/a': null, 'c/a': null, 'd/a': null, 'e/a': null,
  HR: 75, PVC: 0.0, BV: 1.2, SV: 70.0,
  lastUpdated: null
};

const EXCEL_COLUMNS = {
  'a-b': 9,    // J열
  'a-c': 10,   // K열
  'a-d': 11,   // L열
  'a-e': 12,   // M열
  'b/a': 13,   // N열
  'c/a': 14,   // O열
  'd/a': 15,   // P열
  'e/a': 16    // Q열
};

/**
 * 필드명 매핑 (대문자 → 소문자)
 */
const FIELD_MAPPING = {
  HR: 'hr',
  PVC: 'pvc',
  BV: 'bv',
  SV: 'sv',
  'ab_ms': 'a-b',
  'ac_ms': 'a-c',
  'ad_ms': 'a-d',
  'ae_ms': 'a-e'
};

// 유틸리티 함수들을 상단에 정의
const toNumber = (val) => {
  if (val === null || val === undefined || val === '') return null;
  const num = parseFloat(val);
  return isNaN(num) ? null : num;
};

/**
 * 엑셀 파일을 읽어서 2차원 배열로 변환
 */
const readExcelFile = async (file) => {
  try {
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    console.log('📑 엑셀 파일 읽기 완료:', {
      sheetName,
      rowCount: rows.length
    });

    return rows;
  } catch (error) {
    console.error('❌ 엑셀 파일 읽기 오류:', error);
    throw error;
  }
};

/**
 * 환자 이름으로 데이터 행 찾기
 */
const parseExcelContent = (rows, currentPatientName, currentFormData) => {
  console.log('📑 엑셀 데이터 파싱 시작:', {
    totalRows: rows.length,
    patientName: currentPatientName,
    heartRate: currentFormData?.basicInfo?.heartRate
  });

  const dataRows = rows.slice(1);
  const matched = dataRows.filter(row => {
    const nameCell = String(row[0] || '').trim();
    return nameCell === currentPatientName;
  });

  if (matched.length === 0) {
    throw new Error(`${currentPatientName}님의 데이터를 찾을 수 없습니다`);
  }

  const latestRow = matched[matched.length - 1];
  
  console.log('✅ 최신 데이터 찾음:', {
    name: latestRow[0],
    date: latestRow[1],
    rowData: latestRow
  });

  return latestRow;
};

const StyledSelect = styled.select`
  width: 100%;
  padding: 4px 8px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  background-color: ${props => props.disabled ? '#f5f5f5' : 'white'};

  &:focus {
    border-color: #40a9ff;
    outline: none;
    box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
  }
`;

// 2행 8열 레이아웃을 위한 필드 구성
const FIRST_ROW_FIELDS = [
  { label: '수축기혈압', name: 'systolicBP', isManual: true, type: 'number' },
  { label: '이완기혈압', name: 'diastolicBP', isManual: true, type: 'number' },
  { label: '심박수', name: 'heartRate', isManual: true, type: 'number' },
  { label: '맥압', name: 'pulsePressure', isManual: false, type: 'number' },
  { label: 'a-b (ms)', name: 'a-b', isManual: true, type: 'number' },
  { label: 'a-c (ms)', name: 'a-c', isManual: true, type: 'number' },
  { label: 'a-d (ms)', name: 'a-d', isManual: true, type: 'number' },
  { label: 'a-e (ms)', name: 'a-e', isManual: true, type: 'number' }
];

const SECOND_ROW_FIELDS = [
  { label: 'b/a', name: 'b/a', isManual: true, type: 'number' },
  { label: 'c/a', name: 'c/a', isManual: true, type: 'number' },
  { label: 'd/a', name: 'd/a', isManual: true, type: 'number' },
  { label: 'e/a', name: 'e/a', isManual: true, type: 'number' },
  { label: '혈관의 탄성도', name: 'elasticityScore', isManual: false, type: 'number', precision: 1 },
  { label: '말초혈관 수축도 (PVC)', name: 'PVC', isManual: false, type: 'number', precision: 2 },
  { label: '혈관점탄도 (BV)', name: 'BV', isManual: false, type: 'number', precision: 2 },
  { label: '일회박출량 (SV)', name: 'SV', isManual: false, type: 'number', precision: 2 }
];

/**
 * 맥파 분석 컴포넌트
 */
const WaveAnalysis = ({ formData, onPulseWaveChange, fileProcessing = false }) => {
  const fileInputRef = useRef();

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const result = await readExcelFile(file);
      
      if (!result || result.length === 0) {
        message.error('엑셀 파일을 읽을 수 없습니다.');
        return;
      }

      const lastRowIndex = result.length - 1;
      const rowData = result[lastRowIndex];

      if (!rowData || rowData.length < 17) {
        message.error('필요한 데이터가 부족합니다.');
        return;
      }

      // 혈관탄성도 알파벳을 숫자로 변환
      const elasticityMap = {
        'A': 0.2,
        'B': 0.4,
        'C': 0.6,
        'D': 0.8,
        'E': 1.0
      };
      
      // 기본 데이터 매핑 (심박수는 제외 - 직접 입력 필드 사용)
      const newPulseWave = {
        ...formData.records?.pulseWave,
        'elasticityScore': elasticityMap[rowData[8]] || '',  // I열 알파벳을 숫자로 변환
        'a-b': rowData[9] !== undefined ? parseFloat(rowData[9]) : '',
        'a-c': rowData[10] !== undefined ? parseFloat(rowData[10]) : '',
        'a-d': rowData[11] !== undefined ? parseFloat(rowData[11]) : '',
        'a-e': rowData[12] !== undefined ? parseFloat(rowData[12]) : '',
        'b/a': rowData[13] !== undefined ? parseFloat(rowData[13]) : '',
        'c/a': rowData[14] !== undefined ? parseFloat(rowData[14]) : '',
        'd/a': rowData[15] !== undefined ? parseFloat(rowData[15]) : '',
        'e/a': rowData[16] !== undefined ? parseFloat(rowData[16]) : ''
      };

      // PVC 계산
      const pvc = (
        0.2 * Math.abs(newPulseWave['b/a']) +
        0.15 * Math.abs(newPulseWave['d/a']) +
        0.1 * newPulseWave['a-e'] +
        0.05 * Math.abs(newPulseWave['c/a'])
      ).toFixed(2);

      // BV 계산
      const bv = (
        0.15 * Math.abs(newPulseWave['c/a']) +
        0.1 * (newPulseWave['a-d'] - newPulseWave['a-c']) +
        0.1 * (newPulseWave['a-e'] / newPulseWave['a-b']) +
        0.05 * newPulseWave['a-b']
      ).toFixed(2);

      // SV 계산
      const sv = (
        0.05 * Math.abs(newPulseWave['d/a']) +
        0.03 * newPulseWave['a-e'] +
        0.02 * Math.abs(newPulseWave['b/a'])
      ).toFixed(2);

      // 계산된 값 추가
      newPulseWave.PVC = pvc;
      newPulseWave.BV = bv;
      newPulseWave.SV = sv;

      // 기존 입력된 심박수와 혈압 값 유지
      onPulseWaveChange({
        ...formData,
        records: {
          ...formData.records,
          pulseWave: {
            ...newPulseWave,
            heartRate: formData.records?.pulseWave?.heartRate, // 직접 입력된 심박수 유지
            systolicBP: formData.records?.pulseWave?.systolicBP, // 직접 입력된 수축기 혈압 유지
            diastolicBP: formData.records?.pulseWave?.diastolicBP // 직접 입력된 이완기 혈압 유지
          }
        }
      });

      message.success('최근 측정 데이터를 성공적으로 불러왔습니다.');
    } catch (error) {
      console.error('파일 처리 중 오류 발생:', error);
      message.error('파일 처리 중 오류가 발생했습니다.');
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleInputChange = (name, value) => {
    const newValue = value === '' ? '' : Number(value);
    
    const newPulseWave = {
      ...formData.records?.pulseWave,
      [name]: newValue
    };

    // 혈압이 변경될 때 맥압 자동 계산
    if (name === 'systolicBP' || name === 'diastolicBP') {
      const systolic = name === 'systolicBP' ? newValue : Number(newPulseWave.systolicBP);
      const diastolic = name === 'diastolicBP' ? newValue : Number(newPulseWave.diastolicBP);
      
      if (!isNaN(systolic) && !isNaN(diastolic)) {
        newPulseWave.pulsePressure = systolic - diastolic;
      }
    }

    onPulseWaveChange({
      ...formData,
      records: {
        ...formData.records,
        pulseWave: newPulseWave
      }
    });
  };

  const formatDisplayValue = (value, field) => {
    if (value === null || value === undefined) return '';
    
    const autoCalculatedFields = ['PVC', 'BV', 'SV'];
    if (autoCalculatedFields.includes(field) && typeof value === 'number') {
      return value.toFixed(2);
    }
    
    return value;
  };

  // 컴포넌트 마운트 시 맥압 초기 계산
  useEffect(() => {
    const systolic = Number(formData?.records?.pulseWave?.systolicBP);
    const diastolic = Number(formData?.records?.pulseWave?.diastolicBP);
    
    if (!isNaN(systolic) && !isNaN(diastolic)) {
      handleInputChange('pulsePressure', systolic - diastolic);
    }
  }, []);

  return (
    <Card>
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        accept=".xlsx,.xls"
        onChange={handleFileUpload}
        onClick={(e) => { // 클릭 이벤트 핸들러 추가
          e.currentTarget.value = ''; // 같은 파일 재선택 가능하도록
        }}
      />

      <ResultsContainer>
        <div className="section-header">
          <img src={waveIcon} alt="맥파" className="section-icon" />
          <Title level={4}>맥파 분석</Title>
        </div>

        <ControlsContainer>
          <Button 
            icon={<PlayCircleOutlined />} 
            onClick={() => {
              console.log('🚀 U-Bio 실행:', {
                patientName: formData?.basicInfo?.name,
                timestamp: new Date().toISOString()
              });
              message.info('U-Bio 실행 기능은 준비 중입니다');
            }}
            disabled={fileProcessing}
          >
            유비오맥파기 실행
          </Button>
          <Button 
            icon={<DownloadOutlined />} 
            onClick={() => {
              console.log('파일 선택 버튼 클릭'); // 디버깅 로그 추가
              fileInputRef.current?.click();
            }} 
            disabled={fileProcessing || !formData?.basicInfo?.name}
          >
            엑셀 데이터 가져오기
          </Button>
        </ControlsContainer>

        {formData?.records?.pulseWave?.lastUpdated && (
          <div style={{ color: '#888', marginBottom: '8px' }}>
            마지막 업데이트: {new Date(formData.records.pulseWave.lastUpdated).toLocaleString()}
          </div>
        )}

        <WaveDataGrid>
          {[...FIRST_ROW_FIELDS, ...SECOND_ROW_FIELDS].map(({ label, name, isManual, type, precision }) => (
            <InputGroup key={name}>
              <Label>{label}</Label>
              <StyledInput
                type={type}
                value={formData?.records?.pulseWave?.[name] ?? ''}
                onChange={(e) => handleInputChange(name, e.target.value)}
                readOnly={!isManual}
                disabled={fileProcessing && !isManual}
                placeholder={isManual ? '직접 입력' : '자동 계산'}
                step={precision ? Math.pow(0.1, precision) : 'any'}
              />
            </InputGroup>
          ))}
        </WaveDataGrid>
      </ResultsContainer>
    </Card>
  );
};

WaveAnalysis.propTypes = {
  formData: PropTypes.object.isRequired,
  onPulseWaveChange: PropTypes.func.isRequired,
  fileProcessing: PropTypes.bool
};

export default WaveAnalysis;
