export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5003/api';

export const API_ENDPOINTS = {
    PATIENTS: '/patients',
    PULSE_RECORDS: '/pulse-records',
    APPOINTMENTS: '/appointments',
    LAUNCH_UBIO: '/launch-ubio'
};

export const handleResponse = async (response) => {
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || '서버 오류가 발생했습니다.');
    }
    return response.json();
}; 