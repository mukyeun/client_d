import { savePatient, getPatientInfo } from '../api/patientApi';

const dataService = {
  saveUserData: async (userData) => {
    try {
      const response = await savePatient(userData);
      return response;
    } catch (error) {
      console.error('데이터 저장 실패:', error);
      throw error;
    }
  },

  getAllUserData: async () => {
    try {
      const response = await getPatientInfo();
      return response;
    } catch (error) {
      console.error('데이터 조회 실패:', error);
      throw error;
    }
  },

  updateUserData: async (id, userData) => {
    try {
      const response = await fetch(`${this.baseUrl}/api/user-data/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData)
      });

      if (!response.ok) {
        throw new Error('데이터 수정에 실패했습니다.');
      }

      return await response.json();

    } catch (error) {
      console.error('updateUserData 에러:', error);
      throw error;
    }
  },

  deleteUserData: async (id) => {
    try {
      const response = await fetch(`${this.baseUrl}/api/user-data/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('데이터 삭제에 실패했습니다.');
      }

      return await response.json();

    } catch (error) {
      console.error('deleteUserData 에러:', error);
      throw error;
    }
  }
};

export default dataService;