import { API_BASE_URL, API_ENDPOINTS, handleResponse } from './config';

export const patientApi = {
    // 환자 목록 조회
    getAll: async () => {
        const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.PATIENTS}`);
        return handleResponse(response);
    },

    // 환자 검색
    search: async (params) => {
        const queryString = new URLSearchParams(params).toString();
        const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.PATIENTS}/search?${queryString}`);
        return handleResponse(response);
    },

    // 고급 검색
    advancedSearch: async (params) => {
        const queryString = new URLSearchParams(params).toString();
        const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.PATIENTS}/advanced-search?${queryString}`);
        return handleResponse(response);
    },

    // 환자 상세 정보 조회
    getById: async (id) => {
        const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.PATIENTS}/${id}`);
        return handleResponse(response);
    },

    // 환자 정보 생성
    create: async (data) => {
        const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.PATIENTS}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        return handleResponse(response);
    },

    // 환자 정보 수정
    update: async (id, data) => {
        const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.PATIENTS}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        return handleResponse(response);
    },

    // 환자 정보 삭제
    delete: async (id) => {
        const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.PATIENTS}/${id}`, {
            method: 'DELETE',
        });
        return handleResponse(response);
    },
}; 