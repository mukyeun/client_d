import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './styles.css';

const AdminLogin = () => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    
    // 임시 관리자 계정 확인
    if (credentials.username === 'admin' && credentials.password === 'admin123') {
      // 로그인 성공
      localStorage.setItem('isAdminLoggedIn', 'true');
      navigate('/clinic/appointments');
    } else {
      setError('아이디 또는 비밀번호가 올바르지 않습니다.');
    }
  };

  return (
    <div className="admin-login-container">
      <div className="login-card">
        <h2>관리자 로그인</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>아이디</label>
            <input
              type="text"
              value={credentials.username}
              onChange={(e) => setCredentials({...credentials, username: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <label>비밀번호</label>
            <input
              type="password"
              value={credentials.password}
              onChange={(e) => setCredentials({...credentials, password: e.target.value})}
              required
            />
          </div>
          <button type="submit">로그인</button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin; 