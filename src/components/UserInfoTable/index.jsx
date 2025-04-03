import React from 'react';
import './styles.css';

const UserInfoTable = ({ data }) => {
  return (
    <div className="table-container">
      <table className="table">
        <thead>
          <tr>
            <th>날짜</th>
            <th>기본정보</th>
            <th>스트레스 수준</th>
            <th>증상</th>
            <th>복용약물/기호식품</th>
            <th>혈압</th>
            <th>맥파분석</th>
            <th>메모</th>
          </tr>
        </thead>
        <tbody>
          {data.map((record) => (
            <tr key={record._id}>
              <td>{new Date(record.createdAt).toLocaleDateString()}</td>
              <td>
                {`이름: ${record.name}, 
                  성별: ${record.gender}, 
                  신장: ${record.height}cm, 
                  체중: ${record.weight}kg, 
                  BMI: ${record.bmi}`}
              </td>
              <td>{record.stressLevel}</td>
              <td>{record.symptoms.join(', ')}</td>
              <td>
                {[...record.medications, ...record.preferences].join(', ')}
              </td>
              <td>{`${record.diastolic}/${record.systolic}`}</td>
              <td>
                {`PVC: ${record.pvc}, 
                  BV: ${record.bv}, 
                  SV: ${record.sv}, 
                  HR: ${record.hr}`}
              </td>
              <td>{record.memo}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserInfoTable; 