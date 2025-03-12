import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  return (
    <div className="home-container">
      <section className="hero-section">
        <h1>도원한의원</h1>
        <p className="subtitle">건강한 삶을 위한 첫걸음</p>
      </section>

      <section className="features-section">
        <div className="feature-card">
          <div className="feature-icon">📅</div>
          <h2>진료 예약</h2>
          <p>온라인으로 쉽고 빠르게 예약하세요</p>
          <Link to="/clinic" className="feature-button">예약하기</Link>
        </div>

        <div className="feature-card">
          <div className="feature-icon">📋</div>
          <h2>환자 정보</h2>
          <p>상세한 진료 정보를 입력하세요</p>
          <Link to="/input" className="feature-button">정보입력</Link>
        </div>

        <div className="feature-card">
          <div className="feature-icon">📊</div>
          <h2>진료 기록</h2>
          <p>진료 기록을 확인하세요</p>
          <Link to="/data" className="feature-button">기록조회</Link>
        </div>
      </section>

      <section className="info-section">
        <div className="clinic-info">
          <h2>진료 시간</h2>
          <ul>
            <li>평일: 09:00 - 18:00</li>
            <li>토요일: 09:00 - 13:00</li>
            <li>일요일 및 공휴일: 휴진</li>
          </ul>
        </div>

        <div className="clinic-info">
          <h2>진료 안내</h2>
          <ul>
            <li>비대면 진료 가능</li>
            <li>주차 가능</li>
            <li>건강보험 적용</li>
          </ul>
        </div>

        <div className="clinic-info">
          <h2>연락처</h2>
          <ul>
            <li>전화: 02-XXX-XXXX</li>
            <li>주소: XX시 XX구 XX로 XX</li>
            <li>이메일: info@dowon.com</li>
          </ul>
        </div>
      </section>
    </div>
  );
};

export default Home; 