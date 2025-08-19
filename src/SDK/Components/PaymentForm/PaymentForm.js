import React, { useState, useEffect } from 'react';
import { usePayment } from '../../providers/PaymentProvider';
import TokenSelector from '../TokenSelector/TokenSelector';
import './PaymentForm.css';

const PaymentForm = ({ 
  amount, 
  description = "Payment",
  onPayment,
  onError,
  showDescription = true,
  showAmount = true 
}) => {
  const { 
    createInvoice, 
    getPaymentAddress, 
    loading, 
    isConnected, 
    canisterId 
  } = usePayment();

  const [selectedToken, setSelectedToken] = useState(null);
  const [formAmount, setFormAmount] = useState(amount || 0);
  const [formDescription, setFormDescription] = useState(description);
  const [invoice, setInvoice] = useState(null);
  const [status, setStatus] = useState('idle'); // idle, creating, created, error
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (amount) {
      setFormAmount(amount);
    }
  }, [amount]);

  const handleCreatePayment = async () => {
    if (!selectedToken) {
      setErrorMessage('Please select a token');
      return;
    }

    if (!formAmount || formAmount <= 0) {
      setErrorMessage('Please enter a valid amount');
      return;
    }

    try {
      setStatus('creating');
      setErrorMessage('');

      const newInvoice = await createInvoice(
        formAmount,
        selectedToken.symbol,
        formDescription,
        [['canister_id', canisterId]]
      );

      setInvoice(newInvoice);
      setStatus('created');

      if (onPayment) {
        onPayment({
          invoice: newInvoice,
          token: selectedToken,
          amount: formAmount,
          description: formDescription,
          paymentAddress: getPaymentAddress()
        });
      }

    } catch (error) {
      setStatus('error');
      setErrorMessage(error.message);
      if (onError) {
        onError(error);
      }
    }
  };

  const formatAmount = (amount, decimals) => {
    return (Number(amount) / Math.pow(10, decimals)).toFixed(decimals);
  };

  if (!isConnected) {
    return (
      <div className="ckpay-payment-form error">
        <p>Unable to connect to payment canister</p>
        <p>Canister ID: {canisterId}</p>
      </div>
    );
  }

  return (
    <div className="ckpay-payment-form">
      <div className="ckpay-form-header">
        <h3>Create Payment</h3>
        <div className="ckpay-canister-info">
          Canister: {canisterId}
        </div>
      </div>

      <div className="ckpay-form-content">
        {showAmount && (
          <div className="ckpay-form-group">
            <label htmlFor="amount-input" className="ckpay-label">
              Amount
            </label>
            <input
              id="amount-input"
              type="number"
              className="ckpay-input"
              value={formAmount}
              onChange={(e) => setFormAmount(e.target.value)}
              placeholder="Enter amount"
              min="0"
              step="0.01"
              disabled={status === 'creating' || !!amount}
            />
          </div>
        )}

        {showDescription && (
          <div className="ckpay-form-group">
            <label htmlFor="description-input" className="ckpay-label">
              Description
            </label>
            <input
              id="description-input"
              type="text"
              className="ckpay-input"
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              placeholder="Payment description"
              disabled={status === 'creating'}
            />
          </div>
        )}

        <TokenSelector
          onTokenSelect={setSelectedToken}
          selectedToken={selectedToken}
          disabled={status === 'creating'}
        />

        {selectedToken && (
          <div className="ckpay-payment-summary">
            <h4>Payment Summary</h4>
            <div className="ckpay-summary-line">
              <span>Amount:</span>
              <span>{formatAmount(formAmount, selectedToken.decimals)} {selectedToken.symbol}</span>
            </div>
            <div className="ckpay-summary-line">
              <span>Token:</span>
              <span>{selectedToken.name}</span>
            </div>
            <div className="ckpay-summary-line">
              <span>Destination:</span>
              <span className="ckpay-address">{getPaymentAddress()}</span>
            </div>
            <div className="ckpay-summary-line">
              <span>Network Fee:</span>
              <span>{formatAmount(selectedToken.fee, selectedToken.decimals)} {selectedToken.symbol}</span>
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="ckpay-error-message">
            {errorMessage}
          </div>
        )}

        {status === 'created' && invoice && (
          <div className="ckpay-success-message">
            <h4>Payment Created Successfully!</h4>
            <p>Invoice ID: {invoice.id}</p>
            <p>Send {formatAmount(formAmount, selectedToken.decimals)} {selectedToken.symbol} to:</p>
            <div className="ckpay-payment-address">
              {getPaymentAddress()}
            </div>
          </div>
        )}

        <button
          className={`ckpay-button ${status === 'created' ? 'success' : ''}`}
          onClick={handleCreatePayment}
          disabled={status === 'creating' || loading || !selectedToken || !formAmount}
        >
          {status === 'creating' ? 'Creating Payment...' :
           status === 'created' ? 'Payment Created ✓' :
           'Create Payment'}
        </button>
      </div>
    </div>
  );
};

export default PaymentForm;
