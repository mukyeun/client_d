import { API_BASE_URL, API_ENDPOINTS, handleResponse } from './config';

export const appointmentApi = {
    // 모든 예약 조회
    getAll: async () => {
        const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.APPOINTMENTS}`);
        return handleResponse(response);
    },

    // 특정 환자의 예약 조회
    getByPatientId: async (patientId) => {
        const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.APPOINTMENTS}/patient/${patientId}`);
        return handleResponse(response);
    },

    // 특정 날짜의 예약 조회
    getByDate: async (date) => {
        const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.APPOINTMENTS}/date/${date}`);
        return handleResponse(response);
    },

    // 예약 생성
    create: async (data) => {
        const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.APPOINTMENTS}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        return handleResponse(response);
    },

    // 예약 수정
    update: async (id, data) => {
        const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.APPOINTMENTS}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        return handleResponse(response);
    },

    // 예약 상태 업데이트
    updateStatus: async (id, status) => {
        const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.APPOINTMENTS}/${id}/status`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status }),
        });
        return handleResponse(response);
    },

    // 예약 삭제
    delete: async (id) => {
        const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.APPOINTMENTS}/${id}`, {
            method: 'DELETE',
        });
        return handleResponse(response);
    },
}; 