import { useCallback } from 'react';
import { calculatePVC, calculateBV, calculateSV } from '../utils/calculations';

export const usePulseCalculation = (formData, setFormData) => {
  const updatePulseCalculations = useCallback(() => {
    const { 
      ab_ms, ac_ms, ad_ms, ae_ms, 
      ba_ratio, ca_ratio, da_ratio, ea_ratio 
    } = formData;

    const allValues = [ab_ms, ac_ms, ad_ms, ae_ms, ba_ratio, ca_ratio, da_ratio, ea_ratio];
    const areAllValid = allValues.every(v => !isNaN(parseFloat(v)));

    if (areAllValid) {
      setFormData(prev => ({
        ...prev,
        pvc: calculatePVC(formData),
        bv: calculateBV(formData),
        sv: calculateSV(formData)
      }));
    }
  }, [
    formData.ab_ms, formData.ac_ms, formData.ad_ms, formData.ae_ms,
    formData.ba_ratio, formData.ca_ratio, formData.da_ratio, formData.ea_ratio,
    setFormData
  ]);

  return { updatePulseCalculations };
}; 