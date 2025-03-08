const { contextBridge, ipcRenderer } = require('electron');

console.log('Preload script starting...');

// API 이름을 'electron'으로 변경
contextBridge.exposeInMainWorld(
  'electron',  // 'electronAPI' 대신 'electron' 사용
  {
    launchUbio: () => {
      console.log('launchUbio called from preload');
      return ipcRenderer.invoke('launch-ubio');
    },
    // 테스트용 메서드
    ping: () => 'pong'
  }
);

// 디버깅을 위한 로그
console.log('Preload script finished'); 