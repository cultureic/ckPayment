import React from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';

const ModalWrapper = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ModalContent = styled.div`
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
`;

const PayButton = styled.button`
  background: #007bff;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1rem;
`;

function PaymentComponent({ onPayment }) {
  const handlePayment = () => {
    if (onPayment) {
      onPayment();
    }
  };

  return (
    <ModalWrapper>
      <ModalContent>
        <h2>Payment Modal</h2>
        <p>Payment details go here...</p>
        <PayButton onClick={handlePayment}>Pay Now</PayButton>
      </ModalContent>
    </ModalWrapper>
  );
}

let modalContainer = null;

const MyLibrary = {
  initialize: (containerId) => {
    modalContainer = document.getElementById(containerId);
    if (!modalContainer) {
      throw new Error('Could not find container element');
    }
  },
  renderPaymentModal: (props, onPayment) => {
    if (!modalContainer) {
      throw new Error('You must initialize MyLibrary with a container element before rendering the modal');
    }

    ReactDOM.render(<PaymentComponent {...props} onPayment={onPayment} />, modalContainer);
  },
  removePaymentModal: () => {
    if (!modalContainer) {
      throw new Error('You must initialize MyLibrary with a container element before removing the modal');
    }

    ReactDOM.unmountComponentAtNode(modalContainer);
  }
};

export default MyLibrary;
