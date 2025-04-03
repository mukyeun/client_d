export const validateWaveData = (data) => {
  return data && typeof data === 'object' && data.pulse;
}; 