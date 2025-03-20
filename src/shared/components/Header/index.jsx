import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useDarkMode } from '../../../hooks/useDarkMode';
import './styles.css';

const Header = () => {
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const location = useLocation();

  return (
    <header className="header">
      <nav className="nav-menu">
        <Link to="/" className="nav-link">홈</Link>
        <Link to="/clinic" className="nav-link">예약하기</Link>
        <Link to="/admin/appointments" className="nav-link">예약관리</Link>
        <Link to="/input" className="nav-link">정보입력</Link>
        <Link to="/data" className="nav-link">데이터조회</Link>
        <button 
          onClick={toggleDarkMode} 
          className="theme-toggle"
          aria-label={isDarkMode ? '라이트 모드로 전환' : '다크 모드로 전환'}
        >
          {isDarkMode ? '🌞' : '🌙'}
        </button>
      </nav>
    </header>
  );
};

export default Header; 