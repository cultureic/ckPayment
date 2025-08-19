import React from 'react';
import PaymentForm from '../PaymentForm/PaymentForm';
import './PaymentModal.css';

const PaymentModal = ({ 
  amount,
  description,
  metadata,
  onComplete,
  onClose,
  showOverlay = true
}) => {
  const handlePayment = (paymentData) => {
    console.log('Payment created:', paymentData);
    if (onComplete) {
      onComplete(paymentData);
    }
  };

  const handleError = (error) => {
    console.error('Payment error:', error);
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && onClose) {
      onClose();
    }
  };

  return (
    <div 
      className={`ckpay-modal-overlay ${showOverlay ? 'visible' : ''}`}
      onClick={handleOverlayClick}
    >
      <div className="ckpay-modal-content">
        <div className="ckpay-modal-header">
          <h2>Payment</h2>
          {onClose && (
            <button 
              className="ckpay-modal-close"
              onClick={onClose}
              aria-label="Close"
            >
              ×
            </button>
          )}
        </div>
        
        <div className="ckpay-modal-body">
          <PaymentForm
            amount={amount}
            description={description}
            onPayment={handlePayment}
            onError={handleError}
          />
        </div>
        
        {metadata && Object.keys(metadata).length > 0 && (
          <div className="ckpay-modal-footer">
            <div className="ckpay-metadata">
              <h4>Additional Information</h4>
              {Object.entries(metadata).map(([key, value]) => (
                <div key={key} className="ckpay-metadata-item">
                  <span className="ckpay-metadata-key">{key}:</span>
                  <span className="ckpay-metadata-value">{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentModal;
