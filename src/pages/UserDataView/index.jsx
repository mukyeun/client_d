import React, { useState, useEffect } from 'react';
import axios from 'axios';
import UserInfoTable from '../../components/UserInfoTable';
import './styles.css';

const UserDataView = () => {
  const [userData, setUserData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('http://localhost:5003/api/patient-info');
      if (response.data.status === 'success') {
        setUserData(response.data.data);
      } else {
        throw new Error('데이터 조회 실패');
      }
    } catch (err) {
      console.error('데이터 조회 오류:', err);
      setError('데이터를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportExcel = async () => {
    try {
      // 엑셀 내보내기 로직
      const fileData = userData.map(record => ({
        날짜: new Date(record.createdAt).toLocaleDateString(),
        이름: record.name,
        성별: record.gender,
        신장: record.height,
        체중: record.weight,
        BMI: record.bmi,
        스트레스수준: record.stressLevel,
        증상: record.selectedSymptoms?.join(', '),
        복용약물: record.medication?.join(', '),
        기호식품: record.preference?.join(', '),
        혈압: `${record.diastolic}/${record.systolic}`,
        PVC: record.pvc,
        BV: record.bv,
        SV: record.sv,
        HR: record.hr,
        메모: record.memo
      }));

      // 엑셀 파일 생성 및 다운로드
      const XLSX = require('xlsx');
      const ws = XLSX.utils.json_to_sheet(fileData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "환자데이터");
      XLSX.writeFile(wb, "환자데이터.xlsx");
    } catch (err) {
      console.error('엑셀 내보내기 오류:', err);
      alert('엑셀 파일 생성에 실패했습니다.');
    }
  };

  const handleBackup = async () => {
    try {
      const jsonStr = JSON.stringify(userData, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const href = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = href;
      link.download = `환자데이터_백업_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('백업 생성 오류:', err);
      alert('백업 파일 생성에 실패했습니다.');
    }
  };

  if (isLoading) return <div className="loading">데이터를 불러오는 중...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="view-container">
      <div className="header">
        <h2 className="title">환자 데이터 조회</h2>
        <div className="button-group">
          <button className="button secondary" onClick={handleBackup}>
            데이터 백업
          </button>
          <button className="button primary" onClick={handleExportExcel}>
            엑셀 내보내기
          </button>
        </div>
      </div>
      <UserInfoTable data={userData} />
    </div>
  );
};

export default UserDataView; 