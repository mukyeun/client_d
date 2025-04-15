import React, { useState, useEffect } from 'react';
import { Table, Button, Space, message } from 'antd';
import { getPatientList } from '../../../api/config';
import * as XLSX from 'xlsx';

const UserDataTable = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const columns = [
    {
      title: '기본 정보',
      children: [
        { title: '이름', dataIndex: ['basicInfo', 'name'], key: 'name', width: 100 },
        { title: '주민번호', dataIndex: ['basicInfo', 'idNumber'], key: 'idNumber', width: 120 },
        { title: '연락처', dataIndex: ['basicInfo', 'phoneNumber'], key: 'phoneNumber', width: 120 },
        { title: '성별', dataIndex: ['basicInfo', 'gender'], key: 'gender', width: 80 },
        { title: '성격', dataIndex: ['basicInfo', 'personality'], key: 'personality', width: 100 },
        { title: '노동강도', dataIndex: ['basicInfo', 'laborIntensity'], key: 'laborIntensity', width: 100 },
        { title: '신장(cm)', dataIndex: ['basicInfo', 'height'], key: 'height', width: 90 },
        { title: '체중(kg)', dataIndex: ['basicInfo', 'weight'], key: 'weight', width: 90 },
        { 
          title: 'BMI',
          key: 'bmi',
          width: 90,
          render: (_, record) => {
            const height = record.basicInfo?.height / 100;
            const weight = record.basicInfo?.weight;
            if (height && weight) {
              return (weight / (height * height)).toFixed(1);
            }
            return '';
          }
        },
      ]
    },
    {
      title: '스트레스/증상',
      children: [
        { 
          title: '스트레스 레벨', 
          dataIndex: 'stressLevel', 
          key: 'stressLevel',
          width: 120 
        },
        { 
          title: '증상',
          dataIndex: 'symptoms',
          key: 'symptoms',
          width: 150,
          render: (symptoms) => symptoms?.join(', ') || ''
        },
      ]
    },
    {
      title: '약물/기호품',
      children: [
        { 
          title: '복용약물',
          dataIndex: ['medications', 'drugs'],
          key: 'medications',
          width: 150,
          render: (drugs) => drugs?.join(', ') || ''
        },
        { 
          title: '기호식품',
          dataIndex: ['medications', 'preferences'],
          key: 'preferences',
          width: 150,
          render: (preferences) => preferences?.join(', ') || ''
        },
      ]
    },
    {
      title: '혈압/맥파',
      children: [
        { 
          title: '혈압(이완기/수축기)',
          key: 'bloodPressure',
          width: 150,
          render: (_, record) => {
            const systolic = record.basicInfo?.bloodPressure?.systolic;
            const diastolic = record.basicInfo?.bloodPressure?.diastolic;
            return systolic && diastolic ? `${diastolic}/${systolic}` : '';
          }
        },
        { title: 'a-b', dataIndex: ['pulseWave', 'a-b'], key: 'ab', width: 80 },
        { title: 'a-c', dataIndex: ['pulseWave', 'a-c'], key: 'ac', width: 80 },
        { title: 'a-d', dataIndex: ['pulseWave', 'a-d'], key: 'ad', width: 80 },
        { title: 'a-e', dataIndex: ['pulseWave', 'a-e'], key: 'ae', width: 80 },
        { title: 'b/a', dataIndex: ['pulseWave', 'b/a'], key: 'ba', width: 80 },
        { title: 'c/a', dataIndex: ['pulseWave', 'c/a'], key: 'ca', width: 80 },
        { title: 'd/a', dataIndex: ['pulseWave', 'd/a'], key: 'da', width: 80 },
        { title: 'e/a', dataIndex: ['pulseWave', 'e/a'], key: 'ea', width: 80 },
        { title: 'PVC', dataIndex: ['pulseWave', 'PVC'], key: 'pvc', width: 80 },
        { title: 'BV', dataIndex: ['pulseWave', 'BV'], key: 'bv', width: 80 },
        { title: 'SV', dataIndex: ['pulseWave', 'SV'], key: 'sv', width: 80 },
        { title: 'HR', dataIndex: ['pulseWave', 'HR'], key: 'hr', width: 80 },
      ]
    },
    {
      title: '메모',
      dataIndex: 'memo',
      key: 'memo',
      width: 200
    }
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await getPatientList();
      setData(response.data);
    } catch (error) {
      message.error('데이터 로딩 실패');
      console.error('데이터 로딩 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "환자데이터");
    XLSX.writeFile(wb, "환자데이터.xlsx");
  };

  return (
    <div style={{ padding: '20px' }}>
      <Space style={{ marginBottom: '20px' }}>
        <Button onClick={fetchData} type="primary">새로고침</Button>
        <Button onClick={handleExportExcel}>엑셀로 내보내기</Button>
      </Space>
      <Table 
        columns={columns} 
        dataSource={data}
        loading={loading}
        scroll={{ x: 'max-content' }}
        rowKey="_id"
        size="small"
        bordered
      />
    </div>
  );
};

export default UserDataTable;
