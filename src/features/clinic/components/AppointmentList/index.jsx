import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import axios from 'axios';
import './styles.css';

const AppointmentList = forwardRef((props, ref) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // 예약 목록 조회
  const fetchAppointments = async (date) => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5003/api/appointments?date=${date}`);
      
      // 응답 데이터 구조 확인 및 처리
      const appointmentsData = response.data.data || response.data.appointments || [];
      
      // 배열인지 확인하고 처리
      if (Array.isArray(appointmentsData)) {
        setAppointments(appointmentsData);
      } else {
        console.error('예약 데이터가 배열이 아님:', appointmentsData);
        setAppointments([]);
      }
      
      setError(null);
    } catch (err) {
      console.error('예약 목록 조회 오류:', err);
      setError('예약 목록을 불러오는데 실패했습니다.');
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  // 날짜 변경 핸들러
  const handleDateChange = (e) => {
    const newDate = e.target.value;
    setSelectedDate(newDate);
    fetchAppointments(newDate);
  };

  // 컴포넌트 마운트 시 예약 목록 조회
  useEffect(() => {
    fetchAppointments(selectedDate);
  }, []);

  // 예약 상태에 따른 배경색 반환
  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'PENDING': return '#fff3cd';
      case 'CONFIRMED': return '#d4edda';
      case 'CANCELLED': return '#f8d7da';
      case 'COMPLETED': return '#cce5ff';
      default: return 'white';
    }
  };

  // 예약 상태 한글 변환
  const getStatusText = (status) => {
    switch (status?.toUpperCase()) {
      case 'PENDING': return '대기';
      case 'CONFIRMED': return '확정';
      case 'CANCELLED': return '취소';
      case 'COMPLETED': return '완료';
      default: return status || '알 수 없음';
    }
  };

  // 부모 컴포넌트에서 호출할 수 있도록 메서드 노출
  useImperativeHandle(ref, () => ({
    fetchAppointments
  }));

  if (loading) return <div className="loading">로딩 중...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="appointment-list">
      <h2>예약 목록</h2>
      
      <div className="date-selector">
        <label htmlFor="date">날짜 선택: </label>
        <input
          type="date"
          id="date"
          value={selectedDate}
          onChange={handleDateChange}
        />
      </div>

      <table>
        <thead>
          <tr>
            <th>시간</th>
            <th>환자명</th>
            <th>연락처</th>
            <th>상태</th>
          </tr>
        </thead>
        <tbody>
          {appointments.length === 0 ? (
            <tr>
              <td colSpan="4" className="no-appointments">
                예약이 없습니다.
              </td>
            </tr>
          ) : (
            appointments.map((appointment) => (
              <tr 
                key={appointment._id}
                style={{ backgroundColor: getStatusColor(appointment.status) }}
              >
                <td>{appointment.time}</td>
                <td>{appointment.patientId?.name || '이름 없음'}</td>
                <td>{appointment.patientId?.phone || '연락처 없음'}</td>
                <td>{getStatusText(appointment.status)}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
});

export default AppointmentList;