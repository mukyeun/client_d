import React from 'react';
import { Link } from 'react-router-dom';
import './styles.css';

const Header = () => {
  return (
    <header className="header">
      <nav className="nav-menu">
        <Link to="/" className="nav-link home-link">
          홈
        </Link>
        <Link to="/registration" className="nav-link reservation-link">
          예약하기
        </Link>
        <Link to="/confirmation" className="nav-link admin-link">
          예약관리
        </Link>
        <Link to="/management" className="nav-link admin-link">
          관리자
        </Link>
        <Link to="/input" className="nav-link input-link">
          정보입력
        </Link>
        <Link to="/data" className="nav-link data-link">
          데이터조회
        </Link>
      </nav>
    </header>
  );
};

export default Header; 