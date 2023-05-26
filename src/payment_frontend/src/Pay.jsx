
// Import the necessary libraries
import React from 'react';
import ReactDOM from 'react-dom';



function PaymentComponent({ onPayment }) {
  const handlePayment = () => {
    // ... some payment logic goes here...
    // Let's say the payment was successful. Notify the parent:
    if (onPayment) {
      onPayment();
    }
  };

  return (
    <button onClick={handlePayment}>
      Pay Now
    </button>
  );
}


// Import your component

// Create a global object that exposes methods to render your components
const MyLibrary = {
  renderPaymentModal: (element, props, onPayment) => {
    ReactDOM.render(<PaymentComponent {...props} onPayment={onPayment} />, element);
  },
};

export default MyLibrary;