import React from 'react';
import ReactDOM from 'react-dom';
import PaymentComponent from "./Pay";

window.ckPaySDK = {
  PaymentComponent,
  render: (componentName, container, props) => {
    const Component = ckPaySDK[componentName];
    ReactDOM.render(<Component {...props} />, container);
  }
}