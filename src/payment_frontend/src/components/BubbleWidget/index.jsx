import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';

const instructionScheme = [
  { step: 1, text: 'Step 1: Do this.' },
  { step: 2, text: 'Step 2: Do that.' },
  // add as many steps as needed
];

const BubbleWidget = () => {
  const [showModal, setShowModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const modalRef = useRef();

  useEffect(() => {
    setShowModal(true);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleBubbleClick = () => {
    setShowModal(!showModal);
  };

  const handleNextClick = () => {
    if (currentStep < instructionScheme.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setCurrentStep(0);
      setShowModal(false);
    }
  };

  const handleClickOutside = event => {
    if (modalRef.current && !modalRef.current.contains(event.target)) {
      setShowModal(false);
    }
  };

  return ReactDOM.createPortal(
    (
      <div style={{ position: 'fixed', bottom: 20, right: 20 }}>
        <svg onClick={handleBubbleClick} viewBox="0 0 100 100" className="bitcoin-trigger">
          <circle cx="50" cy="50" r="45" fill="#F7931A" />
          <text x="50%" y="45%" textAnchor="middle" fill="white" fontSize="20" fontFamily="Arial" fontWeight="bold">ck</text>
          <text x="50%" y="65%" textAnchor="middle" fill="white" fontSize="25" fontFamily="Arial" fontWeight="bold">BTC</text>
        </svg>
        {showModal && (
          <div ref={modalRef} style={{
            position: 'fixed', bottom: 130, right: 20, backgroundColor: '#fff', padding: 20,
            borderRadius: 10, border: '1px solid #000', textAlign: 'center'
          }}>
            {instructionScheme[currentStep].text}
            <button onClick={handleNextClick}>Next</button>
          </div>
        )}
      </div>
    ), document.getElementById('bubble')
  );
};

export default BubbleWidget;
