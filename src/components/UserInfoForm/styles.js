export const styles = {
  // 전체 컨테이너
  userInfoForm: {
    width: '100%',
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '40px',
    background: 'linear-gradient(135deg, #f6f9fc 0%, #f1f5f9 100%)',
    borderRadius: '30px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.08)'
  },

  // 검색 섹션
  searchSection: {
    background: '#ffffff',
    padding: '30px',
    borderRadius: '20px',
    boxShadow: '0 8px 30px rgba(0,0,0,0.06)',
    marginBottom: '35px',
    border: '1px solid rgba(74,144,226,0.1)'
  },

  searchInput: {
    width: '100%',
    height: '50px',
    padding: '0 20px',
    fontSize: '16px',
    border: '2px solid #e2e8f0',
    borderRadius: '12px',
    backgroundColor: '#f8fafc',
    transition: 'all 0.3s ease',
    '&:focus': {
      borderColor: '#4A90E2',
      backgroundColor: '#ffffff',
      boxShadow: '0 0 0 4px rgba(74,144,226,0.15)',
      outline: 'none'
    }
  },

  // 각 섹션 공통
  formBox: {
    position: 'relative',
    width: '100%',
    margin: '0 0 35px 0',
    background: '#ffffff',
    borderRadius: '20px',
    padding: '30px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
    border: '1px solid rgba(0,0,0,0.06)',
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 15px 35px rgba(0,0,0,0.1)'
    }
  },

  // 섹션 헤더
  sectionHeader: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    marginBottom: '25px',
    padding: '15px 20px',
    background: 'linear-gradient(90deg, #f1f5f9 0%, #ffffff 100%)',
    borderRadius: '12px'
  },

  // 섹션 제목
  sectionTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#1e293b',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    '& i': {
      fontSize: '24px',
      color: '#4A90E2'
    }
  },

  // 입력 필드 그리드
  inputRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '25px',
    padding: '20px'
  },

  // 입력 그룹
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },

  // 라벨
  formLabel: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#64748b',
    marginBottom: '6px'
  },

  // 입력 필드
  formInput: {
    width: '100%',
    height: '45px',
    padding: '0 16px',
    fontSize: '15px',
    color: '#1e293b',
    border: '2px solid #e2e8f0',
    borderRadius: '12px',
    backgroundColor: '#f8fafc',
    transition: 'all 0.2s ease',
    '&:hover': {
      borderColor: '#94a3b8',
      backgroundColor: '#ffffff'
    },
    '&:focus': {
      outline: 'none',
      borderColor: '#4A90E2',
      backgroundColor: '#ffffff',
      boxShadow: '0 0 0 4px rgba(74,144,226,0.15)'
    }
  },

  // 선택 필드
  formSelect: {
    width: '100%',
    height: '45px',
    padding: '0 16px',
    fontSize: '15px',
    color: '#1e293b',
    border: '2px solid #e2e8f0',
    borderRadius: '12px',
    backgroundColor: '#f8fafc',
    cursor: 'pointer',
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='%2364748b' viewBox='0 0 16 16'%3E%3Cpath d='M8 12L3 6h10l-5 6z'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 16px center',
    transition: 'all 0.2s ease'
  },

  // 메모 영역
  textarea: {
    width: '100%',
    minHeight: '150px',
    padding: '16px',
    fontSize: '15px',
    color: '#1e293b',
    border: '2px solid #e2e8f0',
    borderRadius: '12px',
    backgroundColor: '#f8fafc',
    resize: 'vertical',
    transition: 'all 0.2s ease',
    '&:focus': {
      outline: 'none',
      borderColor: '#4A90E2',
      backgroundColor: '#ffffff',
      boxShadow: '0 0 0 4px rgba(74,144,226,0.15)'
    }
  },

  // 버튼
  button: {
    height: '45px',
    padding: '0 24px',
    fontSize: '16px',
    fontWeight: '500',
    color: '#ffffff',
    backgroundColor: '#4A90E2',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 15px rgba(74,144,226,0.2)',
    '&:hover': {
      backgroundColor: '#357ABD',
      transform: 'translateY(-2px)',
      boxShadow: '0 6px 20px rgba(74,144,226,0.3)'
    }
  },

  // 섹션별 스타일
  basicInfoSection: {
    padding: '20px',
    border: '1px solid rgba(0, 0, 0, 0.6)',
    borderLeft: '10px solid #4A90E2',
    borderRadius: '4px',
    marginBottom: '15px',
    backgroundColor: 'white',
    boxShadow: '4px 4px 8px rgba(0, 0, 0, 0.3)'
  },

  pulseSection: {
    padding: '20px',
    border: '1px solid rgba(0, 0, 0, 0.6)',
    borderLeft: '10px solid #50C878',
    borderRadius: '4px',
    marginBottom: '15px',
    backgroundColor: 'white',
    boxShadow: '4px 4px 8px rgba(0, 0, 0, 0.3)'
  },

  // ... 나머지 섹션들도 동일한 패턴으로 추가

  // 검색 섹션
  searchSection: {
    background: '#ffffff',
    padding: '25px',
    borderRadius: '16px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
    marginBottom: '30px'
  },

  searchForm: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '1rem',
    alignItems: 'center'
  },

  searchInput: {
    flex: 1,
    padding: '0.75rem',
    border: '1px solid #e0e0e0',
    borderRadius: '4px',
    fontSize: '1rem',
    transition: 'border-color 0.3s ease',
    '&:focus': {
      borderColor: '#4A90E2',
      outline: 'none',
      boxShadow: '0 0 0 2px rgba(74, 144, 226, 0.1)'
    }
  },

  // 버튼 스타일
  button: {
    padding: '12px 24px',
    backgroundColor: '#4A90E2',
    color: '#ffffff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '0.95rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    '&:hover': {
      backgroundColor: '#357ABD',
      transform: 'translateY(-1px)'
    }
  },

  // 메모 영역 스타일 현대화
  textarea: {
    width: '100%',
    minHeight: '120px',
    padding: '16px',
    border: '1.5px solid #e2e8f0',
    borderRadius: '10px',
    fontSize: '0.95rem',
    color: '#1e293b',
    resize: 'vertical',
    transition: 'all 0.2s ease',
    '&:focus': {
      outline: 'none',
      borderColor: '#4A90E2',
      boxShadow: '0 0 0 3px rgba(74,144,226,0.1)'
    }
  }
};