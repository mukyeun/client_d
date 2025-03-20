import React from 'react';
import { Button, Typography } from '@mui/material';
import { styles } from './styles';
import { formatDate } from './utils';
import { API_ENDPOINTS } from './constants';
import axios from 'axios';

const SearchSection = ({
  searchTerm,
  setSearchTerm,
  setSearchResults,
  isSearching,
  searchResults = [],
  handleSelectResult
}) => {
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    try {
      console.log('검색 시작:', searchTerm);
      
      const response = await axios.get(API_ENDPOINTS.SEARCH, {
        params: { term: searchTerm }
      });

      console.log('서버 응답:', response.data);

      if (response.data.status === 'success' && typeof setSearchResults === 'function') {
        setSearchResults(response.data.data);
      } else {
        console.error('검색 결과 처리 실패:', response.data);
      }
    } catch (error) {
      console.error('검색 오류:', error);
      setSearchResults([]);
    }
  };

  return (
    <div className="search-section" style={styles.container}>
      <Typography variant="h6" style={{ marginBottom: '15px' }}>
        <i className="fas fa-search" style={{ marginRight: '8px' }}></i>
        예약 정보 검색
      </Typography>
      
      <div style={{ marginBottom: '15px' }}>
        <div style={styles.searchForm}>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="이름 또는 전화번호로 검색"
            style={styles.searchInput}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSearch(e);
              }
            }}
          />
          <Button
            onClick={handleSearch}
            variant="contained"
            disabled={isSearching}
            style={styles.searchButton}
          >
            {isSearching ? '...' : '검색'}
          </Button>
        </div>
      </div>

      {searchResults.length > 0 && (
        <div style={styles.resultsContainer}>
          <table style={styles.resultsTable}>
            <thead>
              <tr style={styles.tableHeader}>
                <th style={styles.tableCell}>이름</th>
                <th style={styles.tableCell}>전화번호</th>
                <th style={styles.tableCell}>예약일시</th>
                <th style={styles.tableCell}>선택</th>
              </tr>
            </thead>
            <tbody>
              {searchResults.map((result, index) => (
                <tr key={index} style={styles.tableRow}>
                  <td style={styles.tableCell}>{result.name}</td>
                  <td style={styles.tableCell}>{result.phone}</td>
                  <td style={styles.tableCell}>
                    {formatDate(result.date + ' ' + result.time)}
                  </td>
                  <td style={styles.tableCell}>
                    <Button
                      size="small"
                      variant="contained"
                      onClick={() => handleSelectResult(result)}
                      style={styles.selectButton}
                    >
                      선택
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SearchSection; 