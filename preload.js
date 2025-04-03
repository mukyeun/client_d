const { contextBridge, ipcRenderer } = require('electron');
const XLSX = require('xlsx');
const fs = require('fs').promises;
const path = require('path');

console.log('Preload script starting...');

// API 이름을 'electron'으로 변경
contextBridge.exposeInMainWorld(
  'electron',  // 'electronAPI' 대신 'electron' 사용
  {
    launchUbio: () => {
      console.log('launchUbio called from preload');
      return ipcRenderer.invoke('launch-ubio');
    },
    // 파일 존재 여부 확인
    checkFileExists: async (filePath) => {
      try {
        await fs.access(filePath);
        return true;
      } catch (error) {
        throw new Error(`파일을 찾을 수 없습니다: ${filePath}`);
      }
    },
    // 엑셀 데이터 읽기
    readExcelData: async (params) => {
      try {
        return await ipcRenderer.invoke('read-excel-data', params);
      } catch (error) {
        console.error('엑셀 데이터 읽기 오류:', error);
        throw error;
      }
    },
    // 파일 저장 경로 가져오기
    getAppPath: () => ipcRenderer.invoke('get-app-path'),
    // MongoDB 저장
    saveToMongoDB: async (data) => {
      try {
        return await ipcRenderer.invoke('save-to-mongodb', data);
      } catch (error) {
        console.error('MongoDB 저장 오류:', error);
        throw error;
      }
    },
    // 데이터 조회 (데이터테이블용)
    fetchUserData: async () => {
      try {
        return await ipcRenderer.invoke('fetch-user-data');
      } catch (error) {
        console.error('데이터 조회 오류:', error);
        throw error;
      }
    },
    // 테스트용 메서드
    ping: () => 'pong'
  }
);

// 디버깅을 위한 로그
console.log('Preload script finished');

// 오류 처리
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (error) => {
  console.error('Unhandled Rejection:', error);
}); 