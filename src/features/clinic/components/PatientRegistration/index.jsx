import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './styles.css';
import { 
  증상카테고리, 
  약물카테고리, 
  기호식품카테고리, 
  스트레스카테고리,
  evaluateStressLevel 
} from '../../../../shared/data/categories';
import { saveAppointment } from '../../../../App';

const PatientRegistration = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    // 기본 정보
    name: '',
    residentNumber: '',
    phone: '',
    gender: '',
    height: '',
    weight: '',
    bmi: '',

    // 건강 상태
    personality: '',
    stress: '',
    workIntensity: '',
    
    // 증상
    selectedCategory: '',
    selectedSubCategory: '',
    selectedSymptom: '',
    selectedSymptoms: [],
    
    // 약물 및 기호식품
    medication: '',
    selectedMedications: [],    // 선택된 약물들
    preference: '',
    selectedPreferences: [],    // 선택된 기호식품들
    
    // 스트레스
    selectedStressEvents: [],
    stressScore: 0,
    stressLevel: '',
    
    // 예약 정보
    appointmentDate: '',
    appointmentTime: '',
    memo: '',

    selectedStressCategory: '',      // 선택된 스트레스 대분류
    totalStressScore: 0,            // 총 스트레스 점수
  });

  const [error, setError] = useState('');

  // 입력값 변경 처리
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      
      // BMI 자동 계산
      if (name === 'height' || name === 'weight') {
        const height = name === 'height' ? value : prev.height;
        const weight = name === 'weight' ? value : prev.weight;
        
        if (height && weight) {
          const heightInMeters = Number(height) / 100;
          const bmi = (Number(weight) / (heightInMeters * heightInMeters)).toFixed(1);
          newData.bmi = bmi;
        }
      }
      
      return newData;
    });
  };

  // 주민등록번호 처리 함수
  const handleResidentNumberChange = (e) => {
    let value = e.target.value.replace(/[^0-9]/g, ''); // 숫자만 허용
    
    if (value.length <= 6) {
      // 앞자리 6자리
      value = value;
    } else {
      // 뒷자리는 첫 번째 숫자만 허용
      value = value.slice(0, 6) + '-' + value.slice(6, 7);
    }

    // 성별 자동 설정
    if (value.length === 8) { // 6자리 + '-' + 1자리
      const genderDigit = parseInt(value.slice(-1));
      let gender = '';
      if (genderDigit === 1 || genderDigit === 3) {
        gender = 'male';
      } else if (genderDigit === 2 || genderDigit === 4) {
        gender = 'female';
      }
      setFormData(prev => ({
        ...prev,
        residentNumber: value,
        gender: gender
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        residentNumber: value
      }));
    }
  };

  // 증상 선택 핸들러들
  const handleCategoryChange = (e) => {
    const category = e.target.value;
    setFormData(prev => ({
      ...prev,
      selectedCategory: category,
      selectedSubCategory: '',
      selectedSymptom: ''
    }));
  };

  const handleSubCategoryChange = (e) => {
    const subCategory = e.target.value;
    setFormData(prev => ({
      ...prev,
      selectedSubCategory: subCategory,
      selectedSymptom: ''
    }));
  };

  const handleSymptomChange = (e) => {
    const symptom = e.target.value;
    setFormData(prev => ({
      ...prev,
      selectedSymptom: symptom
    }));
    
    if (symptom && !formData.selectedSymptoms.includes(symptom)) {
      setFormData(prev => ({
        ...prev,
        selectedSymptoms: [...prev.selectedSymptoms, symptom],
        selectedSymptom: ''
      }));
    }
  };

  const removeSymptom = (symptomToRemove) => {
    setFormData(prev => ({
      ...prev,
      selectedSymptoms: prev.selectedSymptoms.filter(symptom => symptom !== symptomToRemove)
    }));
  };

  // 스트레스 이벤트 선택 핸들러
  const handleStressEventChange = (event) => {
    const updatedEvents = formData.selectedStressEvents.includes(event)
      ? formData.selectedStressEvents.filter(e => e !== event)
      : [...formData.selectedStressEvents, event];

    // 총점 계산
    const totalScore = updatedEvents.reduce((sum, event) => {
      return sum + event.score;
    }, 0);

    // 스트레스 수준 평가
    const stressEvaluation = evaluateStressLevel(totalScore);

    setFormData(prev => ({
      ...prev,
      selectedStressEvents: updatedEvents,
      totalStressScore: totalScore,
      stressLevel: stressEvaluation
    }));
  };

  // 약물 선택 핸들러
  const handleMedicationChange = (e) => {
    const medication = e.target.value;
    setFormData(prev => ({
      ...prev,
      medication: medication
    }));

    if (medication && !formData.selectedMedications.includes(medication)) {
      setFormData(prev => ({
        ...prev,
        selectedMedications: [...prev.selectedMedications, medication],
        medication: '' // 선택 후 초기화
      }));
    }
  };

  // 기호식품 선택 핸들러
  const handlePreferenceChange = (e) => {
    const preference = e.target.value;
    setFormData(prev => ({
      ...prev,
      preference: preference
    }));

    if (preference && !formData.selectedPreferences.includes(preference)) {
      setFormData(prev => ({
        ...prev,
        selectedPreferences: [...prev.selectedPreferences, preference],
        preference: '' // 선택 후 초기화
      }));
    }
  };

  // 약물 태그 삭제
  const removeMedication = (medicationToRemove) => {
    setFormData(prev => ({
      ...prev,
      selectedMedications: prev.selectedMedications.filter(med => med !== medicationToRemove)
    }));
  };

  // 기호식품 태그 삭제
  const removePreference = (preferenceToRemove) => {
    setFormData(prev => ({
      ...prev,
      selectedPreferences: prev.selectedPreferences.filter(pref => pref !== preferenceToRemove)
    }));
  };

  // 폼 제출 처리
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const appointmentData = {
        patientInfo: {
          name: formData.name,
          residentNumber: formData.residentNumber,
          phone: formData.phone,
          gender: formData.gender,
          personality: formData.personality,
          workIntensity: formData.workIntensity,
          height: formData.height,
          weight: formData.weight,
          bmi: formData.bmi
        },
        symptoms: formData.selectedSymptoms,
        medications: formData.selectedMedications,
        preferences: formData.selectedPreferences,
        stressItems: formData.selectedStressEvents,
        appointment: {
          date: formData.appointmentDate,
          time: formData.appointmentTime,
          memo: formData.memo
        }
      };

      const response = await saveAppointment(appointmentData);

      if (response.success) {
        navigate('/clinic/appointment-confirmation', { 
          state: { appointmentId: response.data.id } 
        });
      } else {
        setError('예약 저장에 실패했습니다.');
      }
    } catch (error) {
      setError('예약 접수 중 오류가 발생했습니다. 다시 시도해 주세요.');
      console.error('Appointment submission error:', error);
    }
  };

  // 현재 날짜 구하기
  const today = new Date().toISOString().split('T')[0];

  const getInputStyle = (fieldName) => {
    // 필요한 스타일링 로직 추가
    return {};
  };

  return (
    <div className="registration-container">
      <form onSubmit={handleSubmit}>
        
        {/* 기본 정보 섹션 */}
        <div className="form-box analysis-box enhanced-box shadow-box">
          <div className="section-marker red"></div>
          <div className="section-content">
            <h2 className="section-title large-title">기본 정보</h2>
            <div className="input-row">
              <div className="input-group">
                <label className="form-label required">이름</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="이름을 입력하세요"
                  style={getInputStyle('name')}
                />
                {error && <span className="error-message">{error}</span>}
              </div>
              <div className="input-group">
                <label className="form-label required">주민등록번호</label>
                <input
                  type="text"
                  name="residentNumber"
                  value={formData.residentNumber}
                  onChange={handleResidentNumberChange}
                  placeholder="앞 6자리 - 뒤 1자리"
                  maxLength="8" // 6자리 + '-' + 1자리
                  style={getInputStyle('residentNumber')}
                />
                {error && <span className="error-message">{error}</span>}
              </div>
              <div className="input-group">
                <label className="form-label required">연락처</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="연락처를 입력하세요"
                  style={getInputStyle('phone')}
                />
                {error && <span className="error-message">{error}</span>}
              </div>
              <div className="input-group">
                <label className="form-label">성별</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  style={getInputStyle('gender')}
                  disabled // 자동 입력되므로 직접 선택 불가
                >
                  <option value="">선택하세요</option>
                  <option value="male">남성</option>
                  <option value="female">여성</option>
                </select>
                {error && <span className="error-message">{error}</span>}
              </div>
              <div className="input-group">
                <label className="form-label">성격</label>
                <select
                  name="personality"
                  value={formData.personality}
                  onChange={handleInputChange}
                  style={getInputStyle('personality')}
                >
                  <option value="">선택하세요</option>
                  <option value="매우 급함">매우 급함</option>
                  <option value="급함">급함</option>
                  <option value="원만">원만</option>
                  <option value="느긋">느긋</option>
                  <option value="매우 느긋">매우 느긋</option>
                </select>
                {error && <span className="error-message">{error}</span>}
              </div>
              <div className="input-group">
                <label className="form-label">노동강도</label>
                <select
                  name="workIntensity"
                  value={formData.workIntensity}
                  onChange={handleInputChange}
                  style={getInputStyle('workIntensity')}
                >
                  <option value="">선택하세요</option>
                  <option value="매우 높음">매우 높음</option>
                  <option value="높음">높음</option>
                  <option value="보통">보통</option>
                  <option value="낮음">낮음</option>
                  <option value="매우 낮음">매우 낮음</option>
                </select>
                {error && <span className="error-message">{error}</span>}
              </div>
              <div className="input-group">
                <label className="form-label">신장</label>
                <input
                  type="number"
                  name="height"
                  value={formData.height}
                  onChange={handleInputChange}
                  placeholder="cm"
                  style={getInputStyle('height')}
                />
                {error && <span className="error-message">{error}</span>}
              </div>
              <div className="input-group">
                <label className="form-label">체중</label>
                <input
                  type="number"
                  name="weight"
                  value={formData.weight}
                  onChange={handleInputChange}
                  placeholder="kg"
                  style={getInputStyle('weight')}
                />
                {error && <span className="error-message">{error}</span>}
              </div>
              <div className="input-group">
                <label className="form-label">BMI 지수</label>
                <input
                  type="text"
                  name="bmi"
                  value={formData.bmi}
                  readOnly
                  placeholder="BMI"
                  style={getInputStyle('bmi')}
                />
                {error && <span className="error-message">{error}</span>}
              </div>
            </div>
          </div>
        </div>

        {/* 증상 선택 섹션 */}
        <div className="form-box analysis-box enhanced-box shadow-box">
          <div className="section-marker green"></div>
          <div className="section-content">
            <h2 className="section-title large-title">증상 선택</h2>
            <div className="form-row symptoms-category-row">
              <div className="form-group category">
                <label className="form-label">대분류</label>
                <select 
                  value={formData.selectedCategory} 
                  onChange={handleCategoryChange}
                  style={getInputStyle('selectedCategory')}
                >
                  <option value="">선택하세요</option>
                  {Object.keys(증상카테고리).map(category => (
                    <option key={`cat-${category}`} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                {error && <span className="error-message">{error}</span>}
              </div>
              <div className="form-group subcategory">
                <label className="form-label">중분류</label>
                <select 
                  value={formData.selectedSubCategory} 
                  onChange={handleSubCategoryChange}
                  style={getInputStyle('selectedSubCategory')}
                >
                  <option value="">선택하세요</option>
                  {formData.selectedCategory && 
                    Object.keys(증상카테고리[formData.selectedCategory]).map(subCategory => (
                      <option key={`subcat-${formData.selectedCategory}-${subCategory}`} value={subCategory}>
                        {subCategory}
                      </option>
                    ))
                  }
                </select>
                {error && <span className="error-message">{error}</span>}
              </div>
              <div className="form-group symptom">
                <label className="form-label">소분류</label>
                <select 
                  value={formData.selectedSymptom} 
                  onChange={handleSymptomChange}
                  style={getInputStyle('selectedSymptom')}
                >
                  <option value="">선택하세요</option>
                  {formData.selectedSubCategory && 
                    증상카테고리[formData.selectedCategory][formData.selectedSubCategory].map(symptom => (
                      <option 
                        key={`sym-${formData.selectedCategory}-${formData.selectedSubCategory}-${symptom.name}`} 
                        value={symptom.name}
                      >
                        {symptom.name}
                      </option>
                    ))
                  }
                </select>
                {error && <span className="error-message">{error}</span>}
              </div>
            </div>
            
            <div className="selected-symptoms">
              {formData.selectedSymptoms.map((symptom, index) => (
                <span 
                  key={`selected-${index}-${symptom.replace(/\s+/g, '-')}`} 
                  className="symptom-tag"
                >
                  {symptom}
                  <button 
                    type="button" 
                    onClick={() => removeSymptom(symptom)}
                    className="remove-symptom"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* 복용약물 및 기호식품 섹션 */}
        <div className="form-box analysis-box enhanced-box shadow-box">
          <div className="section-marker blue"></div>
          <div className="section-content">
            <h2 className="section-title large-title">복용약물</h2>
            <div className="form-row medication-row">
              <div className="form-group medication">
                <label className="form-label">복용 중인 약물</label>
                <select
                  name="medication"
                  value={formData.medication}
                  onChange={handleMedicationChange}
                  style={getInputStyle('medication')}
                >
                  <option value="">약물을 선택하세요</option>
                  {약물카테고리.map((약물, index) => (
                    <option key={`medication-${index}-${약물}`} value={약물}>
                      {약물}
                    </option>
                  ))}
                </select>
                {error && <span className="error-message">{error}</span>}
              </div>
              <div className="form-group preference">
                <label className="form-label">기호식품</label>
                <select
                  name="preference"
                  value={formData.preference}
                  onChange={handlePreferenceChange}
                  style={getInputStyle('preference')}
                >
                  <option value="">기호식품을 선택하세요</option>
                  {기호식품카테고리.map((기호품, index) => (
                    <option key={`preference-${index}`} value={기호품}>{기호품}</option>
                  ))}
                </select>
                {error && <span className="error-message">{error}</span>}
              </div>
            </div>

            {/* 선택된 약물 태그들 */}
            <div className="selected-items">
              <div className="selected-medications">
                {formData.selectedMedications.map((medication, index) => (
                  <span 
                    key={`selected-med-${index}-${medication.replace(/\s+/g, '-')}`} 
                    className="symptom-tag"
                  >
                    {medication}
                    <button 
                      type="button" 
                      onClick={() => removeMedication(medication)}
                      className="remove-symptom"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>

              {/* 선택된 기호식품 태그들 */}
              <div className="selected-preferences">
                {formData.selectedPreferences.map((preference, index) => (
                  <span 
                    key={`selected-pref-${index}-${preference.replace(/\s+/g, '-')}`} 
                    className="symptom-tag"
                  >
                    {preference}
                    <button 
                      type="button" 
                      onClick={() => removePreference(preference)}
                      className="remove-symptom"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 스트레스 평가 섹션 */}
        <div className="form-box analysis-box enhanced-box shadow-box">
          <div className="section-marker orange"></div>
          <div className="section-content">
            <h2 className="section-title large-title">스트레스 평가</h2>
            <div className="input-row">
              <div className="input-group">
                <label className="form-label">스트레스 대분류</label>
                <select
                  className="form-select"
                  value={formData.selectedStressCategory}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    selectedStressCategory: e.target.value
                  }))}
                >
                  <option value="">선택하세요</option>
                  {스트레스카테고리.map((category, index) => (
                    <option key={index} value={category.대분류}>
                      {category.대분류}
                    </option>
                  ))}
                </select>
              </div>
              <div className="input-group">
                <label className="form-label">스트레스 항목</label>
                <select
                  className="form-select"
                  onChange={(e) => {
                    const item = JSON.parse(e.target.value);
                    setFormData(prev => ({
                      ...prev,
                      selectedStressEvents: [item],
                      totalStressScore: item.score,
                      stressLevel: evaluateStressLevel(item.score)
                    }));
                  }}
                  disabled={!formData.selectedStressCategory}
                >
                  <option value="">선택하세요</option>
                  {formData.selectedStressCategory && 스트레스카테고리
                    .find(category => category.대분류 === formData.selectedStressCategory)
                    ?.중분류.map((item, index) => (
                      <option key={index} value={JSON.stringify(item)}>
                        {item.name} ({item.score}점)
                      </option>
                    ))}
                </select>
              </div>
            </div>

            {formData.selectedStressEvents.length > 0 && (
              <div className="selected-items">
                <div className="selected-items-list">
                  {formData.selectedStressEvents.map((item, index) => (
                    <span 
                      key={index} 
                      className="symptom-tag"
                    >
                      {item.name} ({item.score}점)
                      <button
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            selectedStressEvents: prev.selectedStressEvents.filter((_, i) => i !== index)
                          }));
                        }}
                        className="remove-symptom"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="stress-evaluation">
                  {(() => {
                    const totalScore = formData.selectedStressEvents.reduce((sum, item) => sum + item.score, 0);
                    const evaluation = evaluateStressLevel(totalScore);
                    return (
                      <>
                        <div className="stress-total">총점: {totalScore}점</div>
                        <div className="stress-level">
                          스트레스 수준: <span className={`level-${evaluation.level}`}>{evaluation.level}</span>
                          <div className="level-description">({evaluation.description})</div>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 예약 정보 섹션 */}
        <div className="form-box analysis-box enhanced-box shadow-box">
          <div className="section-marker purple"></div>
          <div className="section-content">
            <h2 className="section-title large-title">예약 정보</h2>
            <div className="input-row">
              <div className="input-group">
                <label className="form-label required">예약 날짜</label>
                <input
                  type="date"
                  name="appointmentDate"
                  value={formData.appointmentDate}
                  onChange={handleInputChange}
                  className="form-input"
                  style={getInputStyle('appointmentDate')}
                  required
                />
                {error && <span className="error-message">{error}</span>}
              </div>
              <div className="input-group">
                <label className="form-label required">예약 시간</label>
                <input
                  type="time"
                  name="appointmentTime"
                  value={formData.appointmentTime}
                  onChange={handleInputChange}
                  className="form-input"
                  style={getInputStyle('appointmentTime')}
                  required
                />
                {error && <span className="error-message">{error}</span>}
              </div>
              <div className="input-group full-width">
                <label className="form-label">메모</label>
                <textarea
                  name="memo"
                  value={formData.memo}
                  onChange={handleInputChange}
                  className="form-input"
                  style={getInputStyle('memo')}
                  placeholder="추가 참고사항이나 메모를 입력하세요."
                  rows="4"
                />
                {error && <span className="error-message">{error}</span>}
              </div>
            </div>
          </div>
        </div>

        <div className="submit-button-container">
          <button type="submit" className="submit-button">
            예약/접수 완료
          </button>
        </div>
        
        {error && <div className="error-message">{error}</div>}
      </form>
    </div>
  );
};

export default PatientRegistration; 