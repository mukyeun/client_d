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
    preference: '',
    
    // 스트레스
    selectedStressEvents: [],
    stressScore: 0,
    stressLevel: '',
    
    // 예약 정보
    appointmentDate: '',
    appointmentTime: '',
    memo: '',

    selectedMedications: [],    // 선택된 약물들
    selectedPreferences: [],    // 선택된 기호식품들
    selectedStressCategory: '',      // 선택된 스트레스 대분류
    totalStressScore: 0,            // 총 스트레스 점수
  });

  const [error, setError] = useState('');

  // 입력값 변경 처리
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // BMI 자동 계산
    if (name === 'height' || name === 'weight') {
      const height = name === 'height' ? value : formData.height;
      const weight = name === 'weight' ? value : formData.weight;
      if (height && weight) {
        const heightInMeters = height / 100;
        const bmi = (weight / (heightInMeters * heightInMeters)).toFixed(1);
        setFormData(prev => ({
          ...prev,
          bmi: bmi
        }));
      }
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
  };

  const addSymptom = () => {
    if (formData.selectedSymptom && !formData.selectedSymptoms.includes(formData.selectedSymptom)) {
      setFormData(prev => ({
        ...prev,
        selectedSymptoms: [...prev.selectedSymptoms, formData.selectedSymptom],
        selectedSymptom: ''  // 선택 초기화
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
  const handleMedicationChange = (medication) => {
    setFormData(prev => ({
      ...prev,
      selectedMedications: prev.selectedMedications.includes(medication)
        ? prev.selectedMedications.filter(item => item !== medication)
        : [...prev.selectedMedications, medication]
    }));
  };

  // 기호식품 선택 핸들러
  const handlePreferenceChange = (preference) => {
    setFormData(prev => ({
      ...prev,
      selectedPreferences: prev.selectedPreferences.includes(preference)
        ? prev.selectedPreferences.filter(item => item !== preference)
        : [...prev.selectedPreferences, preference]
    }));
  };

  // 폼 제출 처리
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // TODO: API 호출로 데이터 저장
      console.log('저장된 데이터:', formData);
      navigate('/clinic/appointments');
    } catch (error) {
      setError('데이터 저장 중 오류가 발생했습니다.');
      console.error('저장 오류:', error);
    }
  };

  // 현재 날짜 구하기
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="patient-registration">
      <h2 className="section-title">환자 예약/접수</h2>
      
      <form onSubmit={handleSubmit}>
        {/* 기본 정보 섹션 */}
        <div className="form-section">
          <h3>기본 정보</h3>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">이름</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="form-input"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">주민등록번호</label>
              <input
                type="text"
                name="residentNumber"
                value={formData.residentNumber}
                onChange={handleInputChange}
                className="form-input"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">연락처</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="form-input"
                required
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">성별</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                className="form-input"
                required
              >
                <option value="">선택하세요</option>
                <option value="male">남성</option>
                <option value="female">여성</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">신장 (cm)</label>
              <input
                type="number"
                name="height"
                value={formData.height}
                onChange={handleInputChange}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">체중 (kg)</label>
              <input
                type="number"
                name="weight"
                value={formData.weight}
                onChange={handleInputChange}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">BMI</label>
              <input
                type="text"
                name="bmi"
                value={formData.bmi}
                className="form-input"
                readOnly
              />
            </div>
          </div>
        </div>

        {/* 건강 상태 섹션 추가 */}
        <div className="form-section">
          <h3 className="section-title">건강 상태</h3>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">성격</label>
              <select
                name="personality"
                value={formData.personality}
                onChange={handleInputChange}
                className="form-input"
              >
                <option value="">선택하세요</option>
                <option value="급함">급한 성격</option>
                <option value="보통">보통</option>
                <option value="느긋함">느긋한 성격</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">스트레스 수준</label>
              <select
                name="stress"
                value={formData.stress}
                onChange={handleInputChange}
                className="form-input"
              >
                <option value="">선택하세요</option>
                <option value="높음">높음</option>
                <option value="중간">중간</option>
                <option value="낮음">낮음</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">업무 강도</label>
              <select
                name="workIntensity"
                value={formData.workIntensity}
                onChange={handleInputChange}
                className="form-input"
              >
                <option value="">선택하세요</option>
                <option value="높음">높음</option>
                <option value="중간">중간</option>
                <option value="낮음">낮음</option>
              </select>
            </div>
          </div>
        </div>

        {/* 증상 선택 섹션 */}
        <div className="form-section">
          <h3 className="section-title">증상 선택</h3>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">대분류</label>
              <select
                name="category"
                value={formData.selectedCategory}
                onChange={handleCategoryChange}
                className="form-input"
              >
                <option value="">선택하세요</option>
                {Object.keys(증상카테고리).map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">중분류</label>
              <select
                name="subCategory"
                value={formData.selectedSubCategory}
                onChange={handleSubCategoryChange}
                className="form-input"
                disabled={!formData.selectedCategory}
              >
                <option value="">선택하세요</option>
                {formData.selectedCategory &&
                  Object.keys(증상카테고리[formData.selectedCategory]).map(subCategory => (
                    <option key={subCategory} value={subCategory}>
                      {subCategory}
                    </option>
                  ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">증상</label>
              <select
                name="symptom"
                value={formData.selectedSymptom}
                onChange={handleSymptomChange}
                className="form-input"
                disabled={!formData.selectedSubCategory}
              >
                <option value="">선택하세요</option>
                {formData.selectedCategory && formData.selectedSubCategory &&
                  증상카테고리[formData.selectedCategory][formData.selectedSubCategory].map(symptom => (
                    <option key={symptom.name} value={symptom.name}>
                      {symptom.name}
                    </option>
                  ))}
              </select>
              <button 
                type="button" 
                onClick={addSymptom}
                className="add-button"
                disabled={!formData.selectedSymptom}
              >
                증상 추가
              </button>
            </div>
          </div>

          {/* 선택된 증상 목록 */}
          <div className="selected-symptoms">
            {formData.selectedSymptoms.map(symptom => (
              <div key={symptom} className="symptom-tag">
                {symptom}
                <button 
                  type="button" 
                  onClick={() => removeSymptom(symptom)}
                  className="remove-button"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 약물 및 기호식품 섹션 */}
        <div className="form-section">
          <h3 className="section-title">약물 및 기호식품</h3>
          
          {/* 약물 선택 */}
          <div className="checkbox-group">
            <label className="checkbox-group-label">복용 중인 약물</label>
            <div className="checkbox-options">
              {약물카테고리.map(medication => (
                <label key={medication} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.selectedMedications.includes(medication)}
                    onChange={() => handleMedicationChange(medication)}
                  />
                  {medication}
                </label>
              ))}
            </div>
          </div>

          {/* 기호식품 선택 */}
          <div className="checkbox-group">
            <label className="checkbox-group-label">기호식품</label>
            <div className="checkbox-options">
              {기호식품카테고리.map(preference => (
                <label key={preference} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.selectedPreferences.includes(preference)}
                    onChange={() => handlePreferenceChange(preference)}
                  />
                  {preference}
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* 스트레스 이벤트 섹션 */}
        <div className="form-section">
          <h3 className="section-title">스트레스 이벤트</h3>
          
          {스트레스카테고리.map(category => (
            <div key={category.대분류} className="stress-category">
              <h4 className="stress-category-title">{category.대분류}</h4>
              <div className="stress-events">
                {category.중분류.map(event => (
                  <label key={event.name} className="stress-event-label">
                    <input
                      type="checkbox"
                      checked={formData.selectedStressEvents.includes(event)}
                      onChange={() => handleStressEventChange(event)}
                    />
                    <span className="event-name">{event.name}</span>
                    <span className="event-score">({event.score}점)</span>
                  </label>
                ))}
              </div>
            </div>
          ))}

          {/* 스트레스 평가 결과 */}
          {formData.stressLevel && (
            <div className="stress-evaluation">
              <div className="stress-score">
                총점: <span>{formData.totalStressScore}점</span>
              </div>
              <div className="stress-level">
                스트레스 수준: <span className={`level-${formData.stressLevel.level}`}>
                  {formData.stressLevel.level}
                </span>
              </div>
              <div className="stress-description">
                {formData.stressLevel.description}
              </div>
            </div>
          )}
        </div>

        {/* 예약 정보 섹션 */}
        <div className="form-section">
          <h3 className="section-title">예약 정보</h3>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">예약 날짜</label>
              <input
                type="date"
                name="appointmentDate"
                value={formData.appointmentDate}
                onChange={handleInputChange}
                min={today}
                className="form-input"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">예약 시간</label>
              <input
                type="time"
                name="appointmentTime"
                value={formData.appointmentTime}
                onChange={handleInputChange}
                className="form-input"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group full-width">
              <label className="form-label">메모</label>
              <textarea
                name="memo"
                value={formData.memo}
                onChange={handleInputChange}
                className="form-input textarea"
                placeholder="추가 참고사항이나 메모를 입력하세요."
                rows="4"
              />
            </div>
          </div>
        </div>

        <button type="submit" className="submit-button">
          예약/접수 완료
        </button>
        
        {error && <div className="error-message">{error}</div>}
      </form>
    </div>
  );
};

export default PatientRegistration; 