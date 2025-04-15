import styled from 'styled-components';

export const SectionTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 32px;
  padding-bottom: 20px;
  border-bottom: 1px solid #f0f0f0;

  .icon-wrapper {
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 12px;
    background: ${props => props.gradient || 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)'};
    box-shadow: 0 8px 16px rgba(24, 144, 255, 0.12);
  }

  .icon {
    width: 28px;
    height: 28px;
    object-fit: contain;
    filter: brightness(0) invert(1);
  }

  .title-text {
    font-size: 24px;
    font-weight: 600;
    color: #1f1f1f;
  }
`;
