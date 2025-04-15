import React, { useState, useEffect, useCallback } from 'react';
import { Card, Table, Input, Button, Space } from 'antd';
import { SearchOutlined, ReloadOutlined, DownloadOutlined } from '@ant-design/icons';
import { getPatientInfo } from '../../api/patientApi';
import ExcelJS from 'exceljs';
import styled from 'styled-components';

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

const UserDataTable = () => {
  const [userData, setUserData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchText, setSearchText] = useState('');

  const loadUserData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getPatientInfo();
      setUserData(data);
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

  const handleExport = async () => {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('환자 데이터');

      // 헤더 설정
      worksheet.columns = [
        { header: '이름', key: 'name', width: 15 },
        { header: '주민번호', key: 'residentNumber', width: 15 },
        { header: '연락처', key: 'phoneNumber', width: 15 },
        { header: '성별', key: 'gender', width: 10 },
        { header: '메모', key: 'memo', width: 30 }
      ];

      worksheet.addRows(userData);
      
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

  const columns = [
    { title: '이름', dataIndex: 'name', key: 'name' },
    { title: '주민번호', dataIndex: 'residentNumber', key: 'residentNumber' },
    { title: '연락처', dataIndex: 'phoneNumber', key: 'phoneNumber' },
    { title: '성별', dataIndex: 'gender', key: 'gender' },
    { title: '메모', dataIndex: 'memo', key: 'memo' }
  ];

  const filteredData = userData.filter(user => 
    user.name?.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <StyledTableWrapper>
      <Card
        title={
          <Space size="middle" style={{ width: '100%', justifyContent: 'space-between' }}>
            <h2>환자 목록</h2>
            <Space>
              <Input
                placeholder="이름으로 검색"
                prefix={<SearchOutlined />}
                onChange={(e) => setSearchText(e.target.value)}
                style={{ width: 200 }}
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
        <Table
          columns={columns}
          dataSource={filteredData}
          loading={loading}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </StyledTableWrapper>
  );
};

export default UserDataTable; 