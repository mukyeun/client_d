import styled from 'styled-components';
import { Button } from 'antd';

export const StyledButton = styled(Button)`
  height: 40px;
  border-radius: 8px;
  font-weight: 500;
  padding: 0 20px;
  display: flex;
  align-items: center;
  gap: 8px;

  &.ant-btn-primary {
    background: #1890ff;
    border: none;

    &:hover {
      background: #40a9ff;
    }
  }
`;
