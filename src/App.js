import React, { useEffect, useCallback } from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './shared/components/Header';
import UserInfoForm from './components/UserInfoForm';
import UserDataTable from './components/UserDataTable';
import PatientRegistration from './features/clinic/components/PatientRegistration';
import AppointmentManagement from './features/admin/components/AppointmentManagement';
import AppointmentConfirmation from './features/clinic/components/AppointmentConfirmation';
import AdminLogin from './features/admin/components/AdminLogin';
import ProtectedRoute from './features/admin/components/ProtectedRoute';
import './App.css';

// 상수 정의
export const LOCAL_STORAGE_KEY = 'ubioUserData';
export const APPOINTMENTS_STORAGE_KEY = 'ubioAppointments';

// API 함수들
export const saveUserInfo = async (userData) => {
  try {
    const existingData = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
    existingData.push(userData);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(existingData));

    return {
      success: true,
      data: userData
    };
  } catch (error) {
    console.error('저장 오류:', error);
    return {
      success: false,
      error: '데이터 저장 중 오류가 발생했습니다'
    };
  }
};

export const getAllUserInfo = async () => {
  try {
    const localData = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
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

function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<div>홈</div>} />
        <Route path="/clinic" element={<PatientRegistration />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route 
          path="/clinic/appointments" 
          element={
            <ProtectedRoute>
              <AppointmentManagement />
            </ProtectedRoute>
          } 
        />
        <Route path="/clinic/appointment-confirmation" element={<AppointmentConfirmation />} />
        <Route path="/input" element={<UserInfoForm />} />
        <Route path="/data" element={<UserDataTable />} />
      </Routes>
    </>
  );
}

export default App;