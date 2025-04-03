// Electron API 모킹
export const mockElectronAPI = {
  // 단순한 Electron API 모방
  showOpenDialog: async () => {
    console.log('Mock: 파일 선택 다이얼로그 표시');
    return {
      filePaths: ['D:/uBioMacpaData/유비오맥파측정.xlsx'],
      canceled: false
    };
  },

  readAndProcessExcel: async (filePath, userName) => {
    console.log('Mock: 엑셀 파일 읽기 시도', { filePath, userName });
    
    try {
      // 실제 엑셀 파일의 마지막 행(최근 측정) 데이터를 시뮬레이션
      const mockLatestData = {
        "박경화": {
          ab_ms: "92",      // J열 마지막 행
          ac_ms: "156",     // K열 마지막 행
          ad_ms: "201",     // L열 마지막 행
          ae_ms: "270",     // M열 마지막 행
          ba_ratio: "-0.76", // N열 마지막 행
          ca_ratio: "-0.43", // O열 마지막 행
          da_ratio: "-0.31", // P열 마지막 행
          ea_ratio: "0.19",  // Q열 마지막 행
          pvc: "86.56",      // R열 마지막 행
          measurementTime: new Date().toISOString()
        },
        "권창준": {
          ab_ms: "88",
          ac_ms: "162",
          ad_ms: "198",
          ae_ms: "265",
          ba_ratio: "-0.72",
          ca_ratio: "-0.41",
          da_ratio: "-0.29",
          ea_ratio: "0.21",
          pvc: "82.45",
          measurementTime: new Date().toISOString()
        }
      };

      // 해당 사용자의 최근 데이터 확인
      const userData = mockLatestData[userName];
      if (!userData) {
        throw new Error(`${userName}님의 맥파 데이터를 찾을 수 없습니다.`);
      }

      console.log(`${userName}님의 최근 데이터:`, userData);
      return userData;

    } catch (error) {
      console.error('파일 읽기 오류:', error);
      throw error;
    }
  },

  saveToMongoDB: async (data) => {
    console.log('Mock: MongoDB 저장 시도', data);
    await new Promise(resolve => setTimeout(resolve, 300));
    return {
      ...data,
      _id: 'mock_' + Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  },

  launchUbio: async () => {
    console.log('Mock: uBio 실행 시도');
    await new Promise(resolve => setTimeout(resolve, 1000));
    return true;
  }
}; 