import React, { useState } from 'react';
import { FormContainer, SaveButtonContainer, StyledButton } from './patientFormStyles';
import { handleSubmit } from './patientFormHandler';

// 입력 컴포넌트들 import
import BasicInfoSection from '../UserInfoForm/BasicInfoSection';
import SymptomSection from '../UserInfoForm/SymptomSection';
import StressSection from '../UserInfoForm/StressSection';
import MedicationSection from '../UserInfoForm/MedicationSection';
import WaveAnalysisSection from '../UserInfoForm/WaveAnalysis';
import MemoSection from '../UserInfoForm/MemoSection';

const initialState = {
  basicInfo: {
    name: '',
    residentNumber: '',
    gender: '',
    personality: '',
    phoneNumber: '',
    workIntensity: '',
    height: '',
    weight: '',
    bmi: '',
    bloodPressure: '',
    memo: ''
  },
  records: {
    symptoms: [],
    stressItems: [],
    stressLevel: 0,
    medications: {
      drugs: [],
      preferences: []
    },
    pulseWave: {
      'a-b': null, 'a-c': null, 'a-d': null, 'a-e': null,
      'b/a': null, 'c/a': null, 'd/a': null, 'e/a': null,
      HR: null, PVC: null, BV: null, SV: null
    },
    measurementDate: new Date().toISOString()
  }
};

const PatientForm = () => {
  const [formState, setFormState] = useState(initialState);

  const handleSectionChange = (section, value) => {
    setFormState(prev => ({
      ...prev,
      [section]: value
    }));
  };

  return (
    <FormContainer>
      <BasicInfoSection
        data={formState.basicInfo}
        onChange={e =>
          handleSectionChange('basicInfo', {
            ...formState.basicInfo,
            [e.target.name]: e.target.value
          })
        }
      />
      <SymptomSection
        data={formState.records.symptoms}
        onChange={symptoms => handleSectionChange('records', { ...formState.records, symptoms })}
      />
      <StressSection
        data={{
          items: formState.records.stressItems,
          level: formState.records.stressLevel
        }}
        onChange={data =>
          handleSectionChange('records', {
            ...formState.records,
            stressItems: data.items,
            stressLevel: data.level
          })
        }
      />
      <MedicationSection
        data={formState.records.medications}
        onChange={data => handleSectionChange('records', {
          ...formState.records,
          medications: data
        })}
      />
      <WaveAnalysisSection
        data={formState.records.pulseWave}
        onChange={data => handleSectionChange('records', {
          ...formState.records,
          pulseWave: data
        })}
      />
      <MemoSection
        data={formState.basicInfo.memo}
        onChange={e =>
          handleSectionChange('basicInfo', {
            ...formState.basicInfo,
            memo: e.target.value
          })
        }
      />

      <SaveButtonContainer>
        <StyledButton type="primary" onClick={e => handleSubmit(e, formState)}>
          저장하기
        </StyledButton>
      </SaveButtonContainer>
    </FormContainer>
  );
};

export default PatientForm;
