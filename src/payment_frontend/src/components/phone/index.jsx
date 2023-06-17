import React from 'react';
import './index.css';

const Smartphone = () => {
  const handleWidgetClick = () => {
    alert('Payment widget clicked!');
  };

  return (
    <svg className="smartphone" width="210" height="420" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="body-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style={{stopColor: "#999", stopOpacity: 1}}/>
          <stop offset="100%" style={{stopColor: "#666", stopOpacity: 1}}/>
        </linearGradient>
        <linearGradient id="screen-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style={{stopColor: "#f5f5f5", stopOpacity: 1}}/>
          <stop offset="100%" style={{stopColor: "#e0e0e0", stopOpacity: 1}}/>
        </linearGradient>
        <clipPath id="screen-clip">
          <rect x="25" y="65" width="160" height="270" rx="10" ry="10"/>
        </clipPath>
      </defs>
      <rect className="body" width="210" height="420" rx="35" ry="35" fill="url(#body-gradient)"/>
      <rect className="screen" x="21" y="59" width="169" height="299" rx="10" ry="10" fill="url(#screen-gradient)" />
      <rect className="speaker" x="90" y="35" width="30" height="10" rx="2" ry="2" />
      <circle className="home-button" cx="105" cy="385" r="15" />

      {/* E-commerce section */}
      <g clipPath="url(#screen-clip)">
        {/* Header */}
        <rect x="25" y="65" width="160" height="30" fill="#4caf50" />
        <text x="105" y="87" fill="#fff" textAnchor="middle">E-Shop</text>

        {/* Items */}
        <g>
          <rect x="35" y="105" width="60" height="60" fill="#ccc" rx="10" ry="10"/>
          <text x="65" y="180" fill="#000" textAnchor="middle">Item 1</text>
        </g>
        <g>
          <rect x="115" y="105" width="60" height="60" fill="#ccc" rx="10" ry="10"/>
          <text x="145" y="180" fill="#000" textAnchor="middle">Item 2</text>
        </g>

        {/* Payment widget */}
        <g className="payment-widget" onClick={handleWidgetClick}>
          <rect x="30" y="200" width="150" height="120" fill="#fff" rx="10" ry="10"/>
          <text x="105" y="230" fill="#000" textAnchor="middle" fontWeight="bold">Checkout</text>
          <text x="105" y="260" fill="#000" textAnchor="middle">$100.00</text>
        </g>
      </g>

      <rect className="side-button" x="0" y="130" width="10" height="40" rx="2" ry="2" />
      <rect className="side-button" x="200" y="130" width="10" height="40" rx="2" ry="2" />
      <rect className="frame" x="20" y="60" width="170" height="300" rx="20" ry="20" fill="transparent" stroke="#333" strokeWidth="10"/>
    </svg>
  );
};

export default Smartphone;
