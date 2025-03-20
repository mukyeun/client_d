import React, { useRef } from 'react';
import PatientRegistration from '../../components/PatientRegistration';
import AppointmentList from '../../components/AppointmentList';
import './styles.css';

const MainPage = () => {
  const appointmentListRef = useRef();

  const handleAppointmentCreated = (date) => {
    // AppointmentList 컴포넌트의 fetchAppointments 메서드 호출
    if (appointmentListRef.current) {
      appointmentListRef.current.fetchAppointments(date);
    }
  };

  return (
    <div className="main-page">
      <div className="content-wrapper">
        <div className="registration-section">
          <PatientRegistration onAppointmentCreated={handleAppointmentCreated} />
        </div>
        <div className="list-section">
          <AppointmentList ref={appointmentListRef} />
        </div>
      </div>
    </div>
  );
};

export default MainPage; 