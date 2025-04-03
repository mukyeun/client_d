import { Form, message } from 'antd';
import { useState, useEffect } from 'react';
import { patientApi } from '../api/patientApi';
import { 
  MEDICATION_OPTIONS, 
  PREFERENCE_OPTIONS, 
  INITIAL_FORM_VALUES,
  FORM_RULES 
} from '../constants/formOptions';
import { 약물카테고리 } from '../data/medications';
import { 기호식품카테고리 } from '../data/preferences';

const STORAGE_KEY = 'userform_draft';

export const useUserForm = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stressScore, setStressScore] = useState(0);

  // 임시 저장된 데이터 복원
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        form.setFieldsValue(parsedData);
      } catch (e) {
        console.error('임시 저장 데이터 복원 실패:', e);
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  // 약물 옵션 생성
  const medicationOptions = Object.entries(약물카테고리).map(([category, subCategories]) => ({
    label: category,
    options: Object.entries(subCategories).map(([name, details]) => ({
      value: details.id,
      label: name
    }))
  }));

  // 기호식품 옵션 생성
  const preferenceOptions = Object.entries(기호식품카테고리).map(([category, subCategories]) => ({
    label: category,
    options: Object.entries(subCategories).map(([name, details]) => ({
      value: details.id,
      label: name
    }))
  }));

  const calculateBMI = (height, weight) => {
    if (!height || !weight) return '';
    const heightInMeters = Number(height) / 100;
    const weightInKg = Number(weight);
    if (heightInMeters <= 0) return '';
    return (weightInKg / (heightInMeters * heightInMeters)).toFixed(1);
  };

  // 자동 임시 저장
  const handleValuesChange = (changedValues, allValues) => {
    // 에러 상태 초기화
    setError(null);
    
    if ('height' in changedValues || 'weight' in changedValues) {
      const bmi = calculateBMI(allValues.height, allValues.weight);
      form.setFieldValue('bmi', bmi);
    }

    // 임시 저장
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allValues));
    } catch (e) {
      console.error('임시 저장 실패:', e);
    }
  };

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      setError(null);

      const formData = {
        ...values,
        medications: values.medications || [],
        preferences: values.preferences || []
      };

      const response = await patientApi.savePatientInfo(formData);

      if (response.success) {
        message.success('저장되었습니다');
        // 성공적인 저장 후 임시 데이터 삭제
        localStorage.removeItem(STORAGE_KEY);
        form.resetFields();
        form.setFieldsValue(INITIAL_FORM_VALUES);
      } else {
        throw new Error(response.message || '저장 실패');
      }
    } catch (error) {
      console.error('저장 오류:', error);
      setError(error.message);
      message.error('저장에 실패했습니다');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    form.resetFields();
    localStorage.removeItem(STORAGE_KEY);
    setError(null);
    message.info('폼이 초기화되었습니다');
  };

  return {
    form,
    loading,
    error,
    stressScore,
    initialValues: INITIAL_FORM_VALUES,
    medicationOptions,
    preferenceOptions,
    formRules: FORM_RULES,
    handleValuesChange,
    handleSubmit,
    resetForm
  };
}; 