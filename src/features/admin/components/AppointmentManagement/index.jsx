import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  CircularProgress,
  Alert,
  Chip
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

const AppointmentManagement = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAppointments = async (date) => {
    try {
      setLoading(true);
      setError(null);
      const formattedDate = format(date, 'yyyy-MM-dd');
      
      console.log('📅 예약 조회 요청:', formattedDate);
      
      const response = await axios.get(
        `http://localhost:5003/api/appointments/date/${formattedDate}`
      );

      console.log('📋 서버 응답:', response.data);
      
      if (response.data.status === 'success') {
        setAppointments(response.data.data || []);
      } else {
        throw new Error(response.data.message || '예약 조회 실패');
      }
    } catch (error) {
      console.error('❌ 예약 조회 오류:', error);
      setError(error.response?.data?.message || error.message || '예약 조회 중 오류가 발생했습니다.');
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedDate) {
      fetchAppointments(selectedDate);
    }
  }, [selectedDate]);

  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
  };

  const handleCancelAppointment = async (appointmentId) => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      
      if (!adminToken) {
        setError('관리자 인증이 필요합니다.');
        return;
      }

      const response = await axios.patch(
        `http://localhost:5003/api/appointments/${appointmentId}/status`,
        {
          status: 'cancelled'
        },
        {
          headers: {
            'Authorization': `Bearer ${adminToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('예약 취소 요청 URL:', `http://localhost:5003/api/appointments/${appointmentId}/status`);
      console.log('서버 응답:', response.data);
      
      if (response.data.status === 'success') {
        alert('예약이 취소되었습니다.');
        await fetchAppointments(selectedDate);
        setError(null);
      } else {
        throw new Error(response.data.message || '예약 취소에 실패했습니다.');
      }
    } catch (error) {
      console.error('❌ 예약 취소 오류:', error);
      
      if (error.response) {
        console.error('서버 응답:', error.response.data);
        console.error('상태 코드:', error.response.status);
        console.error('요청 URL:', error.config.url);
      }
      
      const errorMessage = error.response?.data?.message 
        || error.message 
        || '예약 취소 중 오류가 발생했습니다.';
      
      setError(errorMessage);
    }
  };

  const confirmCancel = (appointmentId) => {
    if (window.confirm('정말로 이 예약을 취소하시겠습니까?')) {
      handleCancelAppointment(appointmentId);
    }
  };

  const handleSearch = async (searchTerm) => {
    try {
      if (!searchTerm.trim()) {
        // 검색어가 비어있으면 전체 목록 조회
        await fetchAppointments(selectedDate);
        return;
      }

      const response = await axios.get(
        `http://localhost:5003/api/appointments/search`,
        {
          params: { 
            term: searchTerm,
            date: format(selectedDate, 'yyyy-MM-dd')
          }
        }
      );

      if (response.data.status === 'success') {
        setAppointments(response.data.data || []);
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error('검색 오류:', error);
      setError('검색 중 오류가 발생했습니다.');
    }
  };

  return (
    <Box sx={{ maxWidth: '1200px', margin: '2rem auto', padding: '0 1rem' }}>
      <Paper 
        elevation={3} 
        sx={{ 
          p: 4,
          borderRadius: 2,
          background: 'linear-gradient(to right bottom, #ffffff, #f8f9fa)'
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 4 
        }}>
          <Typography 
            variant="h5" 
            sx={{ 
              fontWeight: 600,
              color: '#2c3e50',
              fontSize: '1.8rem'
            }}
          >
            예약 관리
          </Typography>
          
          <Box sx={{ 
            backgroundColor: '#fff',
            borderRadius: 2,
            padding: '8px 16px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
            border: '1px solid #e1e8ed'
          }}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="날짜 선택"
                value={selectedDate}
                onChange={handleDateChange}
                format="yyyy-MM-dd"
                sx={{
                  '& .MuiInputBase-root': {
                    border: 'none',
                    backgroundColor: 'transparent',
                    '&:hover': {
                      backgroundColor: 'transparent',
                    },
                    '& fieldset': {
                      border: 'none'
                    }
                  },
                  '& .MuiInputLabel-root': {
                    color: '#3498db',
                    '&.Mui-focused': {
                      color: '#3498db'
                    }
                  },
                  '& .MuiInputBase-input': {
                    color: '#2c3e50',
                    fontSize: '1rem',
                    fontWeight: 500,
                    padding: '8px 0'
                  },
                  '& .MuiIconButton-root': {
                    color: '#3498db',
                    '&:hover': {
                      backgroundColor: 'rgba(52, 152, 219, 0.1)'
                    }
                  }
                }}
              />
            </LocalizationProvider>
          </Box>
        </Box>

        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3,
              borderRadius: 2
            }}
          >
            {error}
          </Alert>
        )}

        <TableContainer 
          component={Paper} 
          sx={{ 
            boxShadow: 'none',
            borderRadius: 2,
            overflow: 'hidden'
          }}
        >
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f1f8ff' }}>
                <TableCell sx={{ fontWeight: 600, color: '#2c3e50' }}>시간</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#2c3e50' }}>환자명</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#2c3e50' }}>연락처</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#2c3e50' }}>증상</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#2c3e50' }}>복용약</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#2c3e50' }}>메모</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#2c3e50' }}>상태</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#2c3e50' }}>관리</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 5 }}>
                    <CircularProgress size={40} sx={{ color: '#3498db' }} />
                  </TableCell>
                </TableRow>
              ) : appointments.length === 0 ? (
                <TableRow>
                  <TableCell 
                    colSpan={8} 
                    align="center"
                    sx={{ 
                      py: 5,
                      color: '#7f8c8d',
                      fontSize: '1.1rem'
                    }}
                  >
                    예약이 없습니다.
                  </TableCell>
                </TableRow>
              ) : (
                appointments.map((appointment) => (
                  <TableRow 
                    key={appointment._id}
                    sx={{ 
                      '&:hover': { 
                        backgroundColor: '#f8f9fa'
                      }
                    }}
                  >
                    <TableCell>{appointment.time}</TableCell>
                    <TableCell>{appointment.patientId?.name}</TableCell>
                    <TableCell>{appointment.patientId?.phone}</TableCell>
                    <TableCell>{appointment.symptoms?.join(', ') || '-'}</TableCell>
                    <TableCell>{appointment.medications?.join(', ') || '-'}</TableCell>
                    <TableCell>{appointment.memo || '-'}</TableCell>
                    <TableCell>
                      <Chip
                        label={
                          appointment.status === 'confirmed' ? '예약됨' :
                          appointment.status === 'cancelled' ? '취소됨' :
                          appointment.status === 'completed' ? '완료' : 
                          appointment.status
                        }
                        color={
                          appointment.status === 'confirmed' ? 'primary' :
                          appointment.status === 'cancelled' ? 'error' :
                          appointment.status === 'completed' ? 'success' : 
                          'default'
                        }
                        size="small"
                        sx={{ fontWeight: 500 }}
                      />
                    </TableCell>
                    <TableCell>
                      {appointment.status === 'confirmed' && (
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          onClick={() => confirmCancel(appointment._id)}
                          sx={{
                            borderRadius: 1.5,
                            textTransform: 'none',
                            '&:hover': {
                              backgroundColor: '#fff1f0'
                            }
                          }}
                        >
                          취소
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default AppointmentManagement; 