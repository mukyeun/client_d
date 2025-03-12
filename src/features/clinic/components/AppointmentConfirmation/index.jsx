import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './styles.css';

const AppointmentConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { appointmentId } = location.state || {};

  return (
    <div className="confirmation-container">
      <div className="confirmation-card">
        <h2>예약이 완료되었습니다</h2>
        <p>예약 번호: {appointmentId}</p>
        <div className="button-group">
          <button onClick={() => navigate('/clinic/registration')}>
            새로운 예약하기
          </button>
          <button onClick={() => window.print()}>예약 내역 출력</button>
        </div>
      </div>
    </div>
  );
};

export default AppointmentConfirmation; 