const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const isDev = require('electron-is-dev');
const { exec } = require('child_process');
const xlsx = require('xlsx');
const axios = require('axios');
const XLSX = require('xlsx');
const { MongoClient } = require('mongodb');

let mainWindow;

// 경로 설정
const UBIO_INSTALL_PATH = 'C:\\Program Files (x86)\\uBioMacpa Pro';
const UBIO_DATA_PATH = 'D:\\uBioMacpaData\\유비오측정맥파.xlsx';
const UBIO_EXE_PATH = path.join(UBIO_INSTALL_PATH, 'bin', 'uBioMacpaPro.exe');
const DOWON_DATA_PATH = path.join(app.getPath('userData'), 'DowonData');

// 도원한의원 데이터 디렉토리 생성 함수
function createDowonDirectory() {
  try {
    const dirs = [
      DOWON_DATA_PATH,
      path.join(DOWON_DATA_PATH, 'appointments'),
      path.join(DOWON_DATA_PATH, 'patients'),
      path.join(DOWON_DATA_PATH, 'backups')
    ];

    dirs.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`Created Dowon directory: ${dir}`);
      }
    });

    return true;
  } catch (error) {
    console.error('Error creating Dowon directories:', error);
    return false;
  }
}

// uBioMacpa 디렉토리 생성 함수
function createDataDirectory() {
  try {
    // 메인 디렉토리 생성
    if (!fs.existsSync(UBIO_DATA_PATH)) {
      fs.mkdirSync(UBIO_DATA_PATH, { recursive: true });
      console.log(`Created main directory: ${UBIO_DATA_PATH}`);
    }
    
    // 필요한 모든 하위 디렉토리 생성
    const subDirs = [
      'Data',
      'Report',
      'Config',
      'Backup',
      path.join('Data', 'PWV'),
      path.join('Data', 'ECG'),
      path.join('Report', 'PWV'),
      path.join('Report', 'ECG')
    ];

    subDirs.forEach(dir => {
      const fullPath = path.join(UBIO_DATA_PATH, dir);
      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
        console.log(`Created subdirectory: ${fullPath}`);
      }
    });

    // 설정 파일 생성
    const configPath = path.join(UBIO_DATA_PATH, 'Config', 'config.ini');
    if (!fs.existsSync(configPath)) {
      fs.writeFileSync(configPath, 'DataPath=D:\\uBioMacpaData\\Data\nReportPath=D:\\uBioMacpaData\\Report\n');
      console.log(`Created config file: ${configPath}`);
    }
    
    return true;
  } catch (error) {
    console.error('Error creating directories:', error);
    return false;
  }
}

function createWindow() {
  console.log('Creating window with preload script at:', path.join(__dirname, 'preload.js'));
  
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  mainWindow.loadURL(
    isDev
      ? 'http://localhost:3000'
      : `file://${path.join(__dirname, 'build/index.html')}`
  );

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.webContents.on('did-finish-load', () => {
    console.log('Window loaded successfully');
    mainWindow.webContents.send('electron-check', true);
  });
}

app.whenReady().then(() => {
  console.log('App is ready, creating directories and window...');
  createDowonDirectory();
  createWindow();
});

// 도원한의원 예약 데이터 처리
ipcMain.handle('save-appointment', async (event, appointmentData) => {
  try {
    const appointmentsPath = path.join(DOWON_DATA_PATH, 'appointments');
    const fileName = `appointment_${Date.now()}.json`;
    const filePath = path.join(appointmentsPath, fileName);
    
    fs.writeFileSync(filePath, JSON.stringify(appointmentData, null, 2));
    return { success: true, fileName };
  } catch (error) {
    console.error('Save appointment failed:', error);
    throw error;
  }
});

// uBioMacpa 실행 핸들러 이름 변경
ipcMain.handle('launch-ubio', async () => {
  console.log('Received launch request for uBioMacpa');
  try {
    // 데이터 디렉토리 생성
    if (!createDataDirectory()) {
      throw new Error('Failed to create data directories');
    }

    // 실행 파일 존재 확인
    if (!fs.existsSync(UBIO_EXE_PATH)) {
      throw new Error(`uBioMacpa executable not found at: ${UBIO_EXE_PATH}`);
    }

    console.log('Launching:', UBIO_EXE_PATH);
    
    // 관리자 권한으로 프로그램 실행
    const command = `powershell.exe -Command "Start-Process '${UBIO_EXE_PATH}' -WorkingDirectory '${UBIO_INSTALL_PATH}\\bin' -Verb RunAs"`;
    
    exec(command, {
      windowsHide: false,
      env: {
        ...process.env,
        UBIO_DATA_PATH: UBIO_DATA_PATH
      }
    }, (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        return;
      }
      if (stdout) console.log(`stdout: ${stdout}`);
      if (stderr) console.error(`stderr: ${stderr}`);
    });

    return { success: true };
  } catch (error) {
    console.error('Launch failed:', error);
    throw error;
  }
});

// 백업 처리
ipcMain.handle('create-backup', async () => {
  try {
    const backupPath = path.join(DOWON_DATA_PATH, 'backups');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFileName = `backup_${timestamp}.zip`;
    
    // TODO: 백업 로직 구현
    
    return { success: true, backupFile: backupFileName };
  } catch (error) {
    console.error('Backup failed:', error);
    throw error;
  }
});

// 파일 존재 여부 확인
ipcMain.handle('check-file-exists', async (event, filePath) => {
  try {
    await fs.promises.access(filePath, fs.constants.F_OK);
    return true;
  } catch (error) {
    console.error('파일 접근 오류:', error);
    throw new Error(`파일을 찾을 수 없습니다: ${filePath}`);
  }
});

// 엑셀 파일 읽기
ipcMain.handle('read-excel-data', async (event, { filePath, userName, columns }) => {
  try {
    console.log('엑셀 파일 읽기 시작:', filePath);
    console.log('검색할 사용자:', userName);

    const workbook = XLSX.readFile(filePath);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    
    // 데이터를 2차원 배열로 변환
    const data = XLSX.utils.sheet_to_json(worksheet, { 
      header: 1,
      raw: false
    });

    console.log('전체 데이터 행 수:', data.length);

    // 이름으로 행 찾기 (A열)
    const userRows = data.filter(row => row && row[0] === userName);
    
    if (userRows.length === 0) {
      throw new Error(`${userName}님의 데이터를 찾을 수 없습니다.`);
    }

    // 가장 최근 데이터 행 사용
    const latestRow = userRows[userRows.length - 1];
    
    // 요청된 열의 데이터 추출
    const result = {};
    Object.entries(columns).forEach(([key, col]) => {
      const colIndex = col.charCodeAt(0) - 'A'.charCodeAt(0);
      result[key] = latestRow[colIndex]?.toString() || '';
    });

    console.log('추출된 데이터:', result);
    return result;

  } catch (error) {
    console.error('엑셀 파일 읽기 오류:', error);
    throw error;
  }
});

// MongoDB 저장
ipcMain.handle('save-to-mongodb', async (event, data) => {
  try {
    // MongoDB 연결 설정
    const uri = 'mongodb://localhost:27017';
    const client = new MongoClient(uri);

    await client.connect();
    console.log('MongoDB 연결 성공');

    const db = client.db('ubioMacpa');
    const collection = db.collection('patients');

    // 데이터 저장
    const result = await collection.insertOne({
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await client.close();
    console.log('MongoDB 저장 성공:', result);

    return { success: true, data: result };

  } catch (error) {
    console.error('MongoDB 저장 오류:', error);
    return { success: false, error: error.message };
  }
});

// 데이터 조회
ipcMain.handle('fetch-user-data', async () => {
  try {
    const uri = 'mongodb://localhost:27017';
    const client = new MongoClient(uri);

    await client.connect();
    const db = client.db('ubioMacpa');
    const collection = db.collection('patients');

    const data = await collection.find({}).toArray();
    await client.close();

    return data;

  } catch (error) {
    console.error('데이터 조회 오류:', error);
    throw error;
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});