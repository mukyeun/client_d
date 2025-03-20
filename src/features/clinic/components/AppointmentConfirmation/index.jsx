import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './styles.css';

const AppointmentConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { appointmentData, patientData } = location.state || {};

  const handleConfirm = () => {
    navigate('/'); // 홈으로 이동
  };

  if (!appointmentData || !patientData) {
    return (
      <div className="appointment-confirmation-container">
        <div className="error-message">
          예약 정보를 찾을 수 없습니다.
        </div>
      </div>
    );
  }

  return (
    <div className="appointment-confirmation-container">
      <div className="confirmation-card">
        <div className="confirmation-header">
          <h2>예약이 완료되었습니다</h2>
          <p className="success-message">예약이 성공적으로 등록되었습니다.</p>
        </div>

        <div className="confirmation-details">
          <h3>예약 정보</h3>
          <div className="info-grid">
            <div className="info-item">
              <label>예약 날짜:</label>
              <span>{appointmentData.date}</span>
            </div>
            <div className="info-item">
              <label>예약 시간:</label>
              <span>{appointmentData.time}</span>
            </div>
            <div className="info-item">
              <label>환자명:</label>
              <span>{patientData.name}</span>
            </div>
            <div className="info-item">
              <label>연락처:</label>
              <span>{patientData.phone}</span>
            </div>
          </div>

          {appointmentData.symptoms?.length > 0 && (
            <div className="symptoms-section">
              <h4>증상</h4>
              <p>{appointmentData.symptoms.join(', ')}</p>
            </div>
          )}

          {appointmentData.memo && (
            <div className="memo-section">
              <h4>메모</h4>
              <p>{appointmentData.memo}</p>
            </div>
          )}
        </div>

        <div className="confirmation-actions">
          <button 
            className="confirm-button"
            onClick={handleConfirm}
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
};

export default AppointmentConfirmation; 