import { useState, useCallback, useEffect } from 'react';

export const useElectronCheck = () => {
  const [isUBioMacpaRunning, setIsUBioMacpaRunning] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const checkElectronEnvironment = useCallback(() => {
    return window?.electron !== undefined;
  }, []);

  const handleLaunchUBioMacpa = useCallback(async () => {
    if (isProcessing) return;

    try {
      if (!checkElectronEnvironment()) {
        alert('이 기능은 데스크톱 앱에서만 사용 가능합니다.');
        return;
      }

      setIsProcessing(true);

      // launch-ubio로 이벤트 이름 변경
      const result = await window.electron.invoke('launch-ubio');
      
      if (!result?.success) {
        throw new Error(result?.message || '프로그램 실행 실패');
      }

      setIsUBioMacpaRunning(true);
    } catch (error) {
      console.error('프로그램 실행 오류:', error);
      alert('유비오맥파 프로그램 실행 중 오류가 발생했습니다: ' + error.message);
      setIsUBioMacpaRunning(false);
    } finally {
      setIsProcessing(false);
    }
  }, [checkElectronEnvironment, isProcessing]);

  useEffect(() => {
    let mounted = true;

    const handleStatusUpdate = (event, status) => {
      if (mounted) {
        setIsUBioMacpaRunning(!!status?.running);
      }
    };

    if (checkElectronEnvironment()) {
      // 상태 변경 이벤트 구독
      window.electron.on('ubio-status', handleStatusUpdate);
    }

    return () => {
      mounted = false;
      if (window?.electron) {
        window.electron.removeAllListeners('ubio-status');
      }
    };
  }, [checkElectronEnvironment]);

  return {
    isUBioMacpaRunning,
    isProcessing,
    checkElectronEnvironment,
    handleLaunchUBioMacpa
  };
}; 