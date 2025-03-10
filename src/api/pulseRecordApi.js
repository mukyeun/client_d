import { API_BASE_URL, API_ENDPOINTS, handleResponse } from './config';

export const pulseRecordApi = {
    // 모든 맥파 기록 조회
    getAll: async () => {
        const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.PULSE_RECORDS}`);
        return handleResponse(response);
    },

    // 특정 환자의 맥파 기록 조회
    getByPatientId: async (patientId) => {
        const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.PULSE_RECORDS}/patient/${patientId}`);
        return handleResponse(response);
    },

    // 특정 맥파 기록 조회
    getById: async (id) => {
        const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.PULSE_RECORDS}/${id}`);
        return handleResponse(response);
    },

    // 맥파 기록 생성
    create: async (data) => {
        const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.PULSE_RECORDS}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        return handleResponse(response);
    },

    // 맥파 기록 수정
    update: async (id, data) => {
        const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.PULSE_RECORDS}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        return handleResponse(response);
    },

    // 맥파 기록 삭제
    delete: async (id) => {
        const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.PULSE_RECORDS}/${id}`, {
            method: 'DELETE',
        });
        return handleResponse(response);
    },

    // 유비오맥파 프로그램 실행
    launchUbio: async () => {
        const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.LAUNCH_UBIO}`, {
            method: 'POST',
        });
        return handleResponse(response);
    },
}; 