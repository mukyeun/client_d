import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllAppointments, updateAppointmentStatus } from '../../../../App';
import './styles.css';

const AppointmentManagement = () => {
  const [appointments, setAppointments] = useState([]);
  const [filter, setFilter] = useState('all'); // all, pending, confirmed, completed, cancelled
  const navigate = useNavigate();

  useEffect(() => {
    fetchAppointments();
  }, [filter]);

  const fetchAppointments = async () => {
    try {
      const response = await getAllAppointments();
      if (response.success) {
        let filteredAppointments = response.data;
        if (filter !== 'all') {
          filteredAppointments = response.data.filter(
            appointment => appointment.status === filter
          );
        }
        setAppointments(filteredAppointments);
      }
    } catch (error) {
      console.error('Failed to fetch appointments:', error);
    }
  };

  const handleStatusUpdate = async (appointmentId, newStatus) => {
    try {
      const response = await updateAppointmentStatus(appointmentId, newStatus);
      if (response.success) {
        fetchAppointments();
      }
    } catch (error) {
      console.error('Failed to update appointment status:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('isAdminLoggedIn');
    navigate('/admin/login');
  };

  return (
    <div className="appointment-management">
      <div className="management-header">
        <h1>예약 관리</h1>
        <button onClick={handleLogout} className="logout-button">
          로그아웃
        </button>
      </div>
      
      <div className="filter-controls">
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">전체</option>
          <option value="pending">대기중</option>
          <option value="confirmed">확정</option>
          <option value="completed">완료</option>
          <option value="cancelled">취소</option>
        </select>
      </div>

      <div className="appointments-list">
        {appointments.map(appointment => (
          <div key={appointment.id} className={`appointment-card ${appointment.status}`}>
            <div className="appointment-header">
              <h3>{appointment.patientInfo.name}</h3>
              <span className="status-badge">{appointment.status}</span>
            </div>
            
            <div className="appointment-details">
              <p>예약일시: {appointment.appointment.date} {appointment.appointment.time}</p>
              <p>연락처: {appointment.patientInfo.phone}</p>
              <p>증상: {appointment.symptoms.join(', ')}</p>
              {appointment.appointment.memo && <p>메모: {appointment.appointment.memo}</p>}
            </div>

            <div className="appointment-actions">
              {appointment.status === 'pending' && (
                <>
                  <button onClick={() => handleStatusUpdate(appointment.id, 'confirmed')}>
                    예약 확정
                  </button>
                  <button onClick={() => handleStatusUpdate(appointment.id, 'cancelled')}>
                    예약 취소
                  </button>
                </>
              )}
              {appointment.status === 'confirmed' && (
                <button onClick={() => handleStatusUpdate(appointment.id, 'completed')}>
                  진료 완료
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AppointmentManagement; 