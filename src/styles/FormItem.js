import styled from 'styled-components';

export const FormItem = styled.div`
  margin-bottom: 24px;

  .label {
    margin-bottom: 8px;
    font-weight: 500;
    color: #262626;
    font-size: 14px;

    &.required::after {
      content: '*';
      color: #ff4d4f;
      margin-left: 4px;
    }
  }

  .ant-input, .ant-select-selector {
    height: 40px !important;
    border-radius: 8px !important;
    padding: 4px 12px !important;
    border: 1px solid #d9d9d9;
    background: white;
  }

  .ant-input[type='number'] {
    -moz-appearance: textfield;
    &::-webkit-outer-spin-button,
    &::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }
  }
`;
