import React, { useState, useEffect, useMemo, useCallback, memo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../common/LoadingSpinner';
import EditModal from './EditModal';
import dataService from '../../services/dataService';
import './UserDataTable.css';
import ErrorMessage from '../common/ErrorMessage';
import { exportToExcel, exportToCSV } from '../../utils/exportUtils';
import { read, utils } from 'xlsx';
import ExcelJS from 'exceljs';
import { formatDate } from '../../utils/dateUtils';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import { Button, Input, Space, Modal, Card, Layout, theme, DatePicker } from 'antd';
import { SearchOutlined, ReloadOutlined, CalendarOutlined, DownloadOutlined } from '@ant-design/icons';
import { Tag } from 'antd';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import { getPatientInfo, deletePatientInfo } from '../../api/patientApi';
import styled from '@emotion/styled';
import axios from 'axios';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { getAllPatients, savePatient } from '../../api/patientApi';

dayjs.extend(isBetween);

const { Title } = Typography;
const { Content } = Layout;
const { RangePicker } = DatePicker;

// 스타일드 컴포넌트로 스타일 정의
const StyledTableWrapper = styled.div`
  .ant-table {
    font-size: 14px;
  }

  .ant-table-thead > tr > th {
    background-color: #f8f9fa;
    font-weight: 600;
    color: #333;
    border-bottom: 2px solid #e9ecef;
    padding: 12px 8px;
  }

  .ant-table-tbody > tr > td {
    border-bottom: 1px solid #e9ecef;
    padding: 12px 8px;
  }

  .ant-table-tbody > tr:hover > td {
    background-color: #f8f9fa;
  }

  .ant-table-tbody > tr:nth-of-type(even) {
    background-color: #fafbfc;
  }
`;

const LOCAL_STORAGE_KEY = 'ubioUserData';

// 상수 정의
const ITEMS_PER_PAGE_OPTIONS = [10, 20, 50, 100];
const DEFAULT_ITEMS_PER_PAGE = 20;

const UserDataTable = () => {
  const [userData, setUserData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [checkedIds, setCheckedIds] = useState([]);

  // 체크박스 상태 계산
  const { isAllChecked, isIndeterminate } = useMemo(() => ({
    isAllChecked: userData.length > 0 && checkedIds.length === userData.length,
    isIndeterminate: checkedIds.length > 0 && checkedIds.length < userData.length
  }), [userData.length, checkedIds.length]);

  // 체크박스 핸들러
  const handleCheckboxChange = useCallback((id) => {
    setCheckedIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id);
      } else {
        return [...prev, id];
      }
    });
  }, []);

  // 전체 체크박스 핸들러
  const toggleAllCheckboxes = useCallback(() => {
    if (isAllChecked) {
      setCheckedIds([]);
    } else {
      const allIds = userData.map(item => item.key);
      setCheckedIds(allIds);
    }
  }, [isAllChecked, userData]);

  const loadUserData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getPatientInfo();
      
      const formattedData = data.map(item => {
        // 원본 데이터의 모든 필드를 자세히 출력
        console.log('원본 데이터 상세:', {
          // 기본 정보
          기본정보: {
            id: item._id,
            이름: item.name,
            주민번호: item.residentNumber,
            전화번호: item.phone,
            성별: item.gender,
            성격: item.personality,
            노동강도: item.workIntensity,
            신장: item.height,
            체중: item.weight,
            BMI: item.bmi
          },
          // 스트레스 정보
          스트레스: {
            원본: item.stress,
            결과: item.stressResult,
            레벨: item.stressLevel
          },
          // 증상 정보
          증상: {
            원본: item.symptoms,
            선택됨: item.selectedSymptoms
          },
          // 복용약물 및 기호식품
          복용정보: {
            약물: item.medications,
            선택된약물: item.selectedMedications,
            기호식품: item.preferences,
            선택된기호식품: item.selectedPreferences
          },
          // 혈압 정보
          혈압: {
            객체: item.bloodPressure,
            수축기: item.systolicBP,
            이완기: item.diastolicBP
          },
          // 맥파 분석
          맥파: {
            원본: item.waveformData,
            개별값: {
              ab: item.ab,
              ac: item.ac,
              ad: item.ad,
              ae: item.ae,
              ba_ratio: item.ba_ratio,
              ca_ratio: item.ca_ratio,
              da_ratio: item.da_ratio,
              ea_ratio: item.ea_ratio,
              pvc: item.pvc,
              bv: item.bv,
              sv: item.sv,
              hr: item.hr
            }
          },
          // 메모
          메모: item.memo
        });

        // 데이터 변환
        return {
          ...item,
          stressLevel: item.stressResult || item.stressLevel || item.stress || '-',
          symptoms: Array.isArray(item.selectedSymptoms || item.symptoms) 
            ? (item.selectedSymptoms || item.symptoms).join(', ') 
            : '-',
          medications: Array.isArray(item.selectedMedications || item.medications) 
            ? (item.selectedMedications || item.medications).join(', ') 
            : '-',
          preferences: Array.isArray(item.selectedPreferences || item.preferences) 
            ? (item.selectedPreferences || item.preferences).join(', ') 
            : '-',
          bloodPressure: item.bloodPressure?.systolic && item.bloodPressure?.diastolic
            ? `${item.bloodPressure.diastolic}/${item.bloodPressure.systolic}`
            : '-',
          key: item._id || String(Math.random())
        };
      });

      console.log('변환된 데이터 상세:', formattedData[0]);
      setUserData(formattedData);
      setError(null);
    } catch (error) {
      console.error('데이터 로드 오류:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  // 데이터 삭제 핸들러
  const handleDelete = async () => {
    if (!checkedIds.length) return;
    
    if (window.confirm('선택한 항목을 삭제하시겠습니까?')) {
      try {
        for (const id of checkedIds) {
          await deletePatientInfo(id);
        }
        await loadUserData(); // 데이터 새로고침
        setCheckedIds([]); // 체크박스 초기화
      } catch (error) {
        console.error('삭제 중 오류 발생:', error);
        setError('데이터 삭제에 실패했습니다.');
      }
    }
  };

  // 데이터 백업
  const handleBackup = () => {
    try {
      const backupData = JSON.stringify(userData, null, 2);
      const blob = new Blob([backupData], { type: 'application/json' });
      saveAs(blob, `pulse_data_backup_${new Date().toISOString()}.json`);
    } catch (error) {
      console.error('백업 생성 실패:', error);
      setError('백업 파일 생성에 실패했습니다');
    }
  };

  // 엑셀 내보내기 설정
  const handleExport = async () => {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('환자 데이터');

      // 헤더 설정
      worksheet.columns = [
        { header: '이름', key: 'name', width: 15 },
        { header: '주민번호', key: 'residentNumber', width: 15 },
        { header: '연락처', key: 'phone', width: 15 },
        { header: '성별', key: 'gender', width: 15 },
        { header: '성격', key: 'personality', width: 15 },
        { header: '노동강도', key: 'workIntensity', width: 15 },
        { header: '신장(cm)', key: 'height', width: 15 },
        { header: '체중(kg)', key: 'weight', width: 15 },
        { header: 'BMI', key: 'bmi', width: 15 },
        { header: '스트레스 수준', key: 'stressLevel', width: 15 },
        { header: '증상 대분류', key: 'symptomMainCategory', width: 15 },
        { header: '증상 중분류', key: 'symptomSubCategory', width: 15 },
        { header: '증상', key: 'symptoms', width: 15 },
        { header: '복용약물', key: 'medications', width: 15 },
        { header: '기호식품', key: 'preferences', width: 15 },
        { header: '혈압(이완/수축)', key: 'bloodPressure', width: 15 },
        { header: 'PVC', key: 'pvc', width: 15 },
        { header: 'BV', key: 'bv', width: 15 },
        { header: 'SV', key: 'sv', width: 15 },
        { header: 'HR', key: 'hr', width: 15 },
        { header: '메모', key: 'memo', width: 15 }
      ];

      // 데이터 행 추가
      const rows = userData.map(user => ({
        name: user.name,
        residentNumber: user.residentNumber,
        phone: user.phone,
        gender: user.gender,
        personality: user.personality,
        workIntensity: user.workIntensity,
        height: user.height,
        weight: user.weight,
        bmi: user.bmi,
        stressLevel: user.stressLevel,
        symptomMainCategory: user.symptomMainCategory,
        symptomSubCategory: user.symptomSubCategory,
        symptoms: user.symptoms,
        medications: user.medications,
        preferences: user.preferences,
        bloodPressure: user.bloodPressure,
        pvc: user.pvc,
        bv: user.bv,
        sv: user.sv,
        hr: user.hr,
        memo: user.memo
      }));

      worksheet.addRows(rows);

      // 스타일 적용
      worksheet.getRow(1).font = { bold: true };
      
      // 파일 저장
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `환자데이터_${new Date().toISOString().slice(0,10)}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('엑셀 내보내기 오류:', error);
      alert('엑셀 파일 생성 중 오류가 발생했습니다.');
    }
  };

  // 스트레스 레벨 계산 및 표시 함수
  const getStressLevelDisplay = useCallback((score) => {
    if (!score && score !== 0) return '-';
    
    // 스트레스 점수에 따른 레벨 결정
    if (score <= 20) return '낮음';
    if (score <= 40) return '보통';
    if (score <= 60) return '위험';
    return '매우 위험';
  }, []);

  // 검색된 데이터
  const filteredData = userData.filter(user => 
    user.name?.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    // 기본정보
    { title: '이름', dataIndex: 'name', key: 'name', fixed: 'left' },
    { title: '주민번호', dataIndex: 'residentNumber', key: 'residentNumber' },
    { title: '연락처', dataIndex: 'phone', key: 'phone' },
    { title: '성별', dataIndex: 'gender', key: 'gender' },
    { title: '성격', dataIndex: 'personality', key: 'personality' },
    { title: '노동강도', dataIndex: 'workIntensity', key: 'workIntensity' },
    { title: '신장(cm)', dataIndex: 'height', key: 'height' },
    { title: '체중(kg)', dataIndex: 'weight', key: 'weight' },
    { title: 'BMI', dataIndex: 'bmi', key: 'bmi' },
    
    // 스트레스 평가
    { 
      title: '스트레스 레벨', 
      dataIndex: 'stressLevel', 
      key: 'stressLevel',
      render: (text) => text || '-'
    },
    
    // 증상
    { 
      title: '증상', 
      dataIndex: 'symptoms', 
      key: 'symptoms',
      render: (symptoms) => (Array.isArray(symptoms) ? symptoms.join(', ') : '-')
    },
    
    // 복용약물 및 기호식품
    { 
      title: '복용약물', 
      dataIndex: 'medications', 
      key: 'medications',
      render: (meds) => (Array.isArray(meds) ? meds.join(', ') : '-')
    },
    { 
      title: '기호식품', 
      dataIndex: 'preferences', 
      key: 'preferences',
      render: (prefs) => (Array.isArray(prefs) ? prefs.join(', ') : '-')
    },
    
    // 혈압
    { 
      title: '혈압', 
      key: 'bloodPressure',
      render: (_, record) => (
        record.bloodPressure 
          ? record.bloodPressure 
          : '-'
      )
    },
    
    // 맥파분석 (엑셀 데이터)
    { title: 'a-b', dataIndex: 'ab', key: 'ab' },
    { title: 'a-c', dataIndex: 'ac', key: 'ac' },
    { title: 'a-d', dataIndex: 'ad', key: 'ad' },
    { title: 'a-e', dataIndex: 'ae', key: 'ae' },
    { title: 'b/a', dataIndex: 'ba_ratio', key: 'ba_ratio' },
    { title: 'c/a', dataIndex: 'ca_ratio', key: 'ca_ratio' },
    { title: 'd/a', dataIndex: 'da_ratio', key: 'da_ratio' },
    { title: 'e/a', dataIndex: 'ea_ratio', key: 'ea_ratio' },
    { title: 'PVC', dataIndex: 'pvc', key: 'pvc' },
    { title: 'BV', dataIndex: 'bv', key: 'bv' },
    { title: 'SV', dataIndex: 'sv', key: 'sv' },
    { title: 'HR', dataIndex: 'hr', key: 'hr' },
    
    // 메모
    { 
      title: '메모', 
      dataIndex: 'memo', 
      key: 'memo',
      render: (text) => text || '-'
    }
  ];

  return (
    <div className="user-data-table">
      <Card
        title={
          <Space size="middle" style={{ width: '100%', justifyContent: 'space-between', flexWrap: 'wrap' }}>
            <h2>환자 데이터</h2>
            <Space wrap>
              <Input
                placeholder="이름으로 검색"
                prefix={<SearchOutlined />}
                onChange={(e) => setSearchText(e.target.value)}
                style={{ width: '200px' }}
              />
              <Button 
                icon={<ReloadOutlined />} 
                onClick={loadUserData}
              >
                새로고침
              </Button>
              <Button 
                type="primary" 
                icon={<DownloadOutlined />} 
                onClick={handleExport}
              >
                엑셀 다운로드
              </Button>
            </Space>
          </Space>
        }
      >
        {loading ? (
          <div>로딩 중...</div>
        ) : error ? (
          <div>에러: {error}</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {columns.map(col => (
                  <th key={col.key || col.dataIndex}>
                    {col.title}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredData.map((user, index) => (
                <tr key={user.key || index}>
                  {columns.map(col => (
                    <td key={col.key || col.dataIndex}>
                      {col.render 
                        ? col.render(user[col.dataIndex], user)
                        : user[col.dataIndex] || '-'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
};

export default UserDataTable;