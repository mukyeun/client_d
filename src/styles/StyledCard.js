import styled from 'styled-components';
import { Card } from 'antd';

export const StyledCard = styled(Card)`
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
  margin-bottom: 24px;
  border: none;
  background: white;

  .ant-card-body {
    padding: 24px;
  }

  @media (max-width: 768px) {
    .ant-card-body {
      padding: 16px;
    }
  }
`;
