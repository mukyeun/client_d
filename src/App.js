import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './shared/components/Header';
import { Box, Container } from '@mui/material';

// 각 컴포넌트 import
import Home from './features/home/Home';
import PatientRegistration from './features/clinic/components/PatientRegistration';
import AppointmentConfirmation from './features/clinic/components/AppointmentConfirmation';
import AppointmentManagement from './features/admin/components/AppointmentManagement';
import UserInfoForm from './components/UserInfoForm/index';
import UserDataTable from './components/UserDataTable';

// 상수 정의
export const LOCAL_STORAGE_KEY = 'ubioUserData';
export const APPOINTMENTS_STORAGE_KEY = 'ubioAppointments';

// API 함수들
export const saveUserInfo = async (userData) => {
  try {
    const existingData = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY)) || [];
    existingData.push(userData);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(existingData));
    return {
      success: true,
      data: userData
    };
  } catch (error) {
    console.error('Save error:', error);
    throw error;
  }
};

export const getAllPatients = async () => {
  try {
    const localData = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY)) || [];
    return {
      success: true,
      data: localData
    };
  } catch (error) {
    console.error('데이터 조회 오류:', error);
    return {
      success: false,
      data: [],
      error: error.message
    };
  }
};

export const deleteUserInfo = async (id) => {
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    const parsedData = data ? JSON.parse(data) : [];
    
    const updatedData = parsedData.filter(item => item.id !== id);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedData));
    
    return {
      success: true,
      data: updatedData
    };
  } catch (error) {
    console.error('삭제 오류:', error);
    throw error;
  }
};

// 예약 관련 API 함수들
export const saveAppointment = async (appointmentData) => {
  try {
    const existingData = JSON.parse(localStorage.getItem(APPOINTMENTS_STORAGE_KEY) || '[]');
    const newAppointment = {
      ...appointmentData,
      id: Date.now().toString(), // 고유 ID 생성
      createdAt: new Date().toISOString(),
      status: 'pending'
    };
    
    existingData.push(newAppointment);
    localStorage.setItem(APPOINTMENTS_STORAGE_KEY, JSON.stringify(existingData));

    return {
      success: true,
      data: newAppointment
    };
  } catch (error) {
    console.error('예약 저장 오류:', error);
    return {
      success: false,
      error: '예약 저장 중 오류가 발생했습니다'
    };
  }
};

export const getAllAppointments = async () => {
  try {
    const appointments = JSON.parse(localStorage.getItem(APPOINTMENTS_STORAGE_KEY) || '[]');
    return {
      success: true,
      data: appointments
    };
  } catch (error) {
    console.error('예약 조회 오류:', error);
    return {
      success: false,
      data: [],
      error: error.message
    };
  }
};

export const updateAppointmentStatus = async (appointmentId, newStatus) => {
  try {
    const appointments = JSON.parse(localStorage.getItem(APPOINTMENTS_STORAGE_KEY) || '[]');
    const updatedAppointments = appointments.map(appointment => {
      if (appointment.id === appointmentId) {
        return {
          ...appointment,
          status: newStatus,
          updatedAt: new Date().toISOString()
        };
      }
      return appointment;
    });
    
    localStorage.setItem(APPOINTMENTS_STORAGE_KEY, JSON.stringify(updatedAppointments));
    return {
      success: true,
      data: updatedAppointments.find(a => a.id === appointmentId)
    };
  } catch (error) {
    console.error('예약 상태 업데이트 오류:', error);
    return {
      success: false,
      error: '예약 상태 업데이트 중 오류가 발생했습니다'
    };
  }
};

// 임시 NotFound 컴포넌트
const NotFound = () => (
  <div style={{ textAlign: 'center', padding: '2rem' }}>
    <h2>404 - 페이지를 찾을 수 없습니다</h2>
    <p>요청하신 페이지가 존재하지 않습니다.</p>
  </div>
);

const App = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      <Container component="main" sx={{ mt: 4, mb: 4, flex: 1 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/registration" element={<PatientRegistration />} />
          <Route path="/confirmation" element={<AppointmentConfirmation />} />
          <Route path="/management" element={<AppointmentManagement />} />
          <Route path="/input" element={<UserInfoForm />} />
          <Route path="/data" element={<UserDataTable />} />
        </Routes>
      </Container>
    </Box>
  );
};

export default App;