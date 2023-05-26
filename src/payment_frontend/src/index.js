import React from 'react';
import ReactDOM from 'react-dom';
import PaymentComponent from "./Pay";

window.MySDK = {
  PaymentComponent,
  render: (componentName, container, props) => {
    const Component = MySDK[componentName];
    ReactDOM.render(<Component {...props} />, container);
  },
};
