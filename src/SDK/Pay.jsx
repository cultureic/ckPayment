
// Import the necessary libraries
import React from 'react';
import {createPortal} from "react-dom"
import {createRoot} from 'react-dom/client';
import "./index.css"

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
    const root = createRoot(element)
    let portal = createPortal(<PaymentComponent {...props} onPayment={onPayment} />, document.body);
    root.render(portal)
  },
};

export default MyLibrary;