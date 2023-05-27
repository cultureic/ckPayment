import React from 'react';
import {createRoot} from 'react-dom/client';



window.onload = function() {
  console.log("window",window)
    var modalElement = document.getElementById('payment-modal');
    ckPaySDK.PaymentComponent.renderPaymentModal(modalElement, { /* props go here */ });
}

const App = () =>{
  return<div>
    <h1>hello world</h1>
    </div>
}


const container = document.getElementById('app');
const root = createRoot(container);


root.render(<App/>)
