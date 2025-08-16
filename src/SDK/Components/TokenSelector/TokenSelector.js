import React from 'react';
import { usePayment } from '../../providers/PaymentProvider';
import './TokenSelector.css';

const TokenSelector = ({ 
  onTokenSelect, 
  selectedToken, 
  disabled = false,
  placeholder = "Select a token"
}) => {
  const { supportedTokens, loading, error } = usePayment();

  const handleChange = (e) => {
    const tokenSymbol = e.target.value;
    const token = supportedTokens.find(t => t.symbol === tokenSymbol);
    if (onTokenSelect && token) {
      onTokenSelect(token);
    }
  };

  if (error) {
    return (
      <div className="ckpay-token-selector error">
        <p>Failed to load tokens: {error}</p>
      </div>
    );
  }

  return (
    <div className="ckpay-token-selector">
      <label htmlFor="token-select" className="ckpay-label">
        Payment Token
      </label>
      <select
        id="token-select"
        className="ckpay-select"
        value={selectedToken?.symbol || ''}
        onChange={handleChange}
        disabled={disabled || loading}
      >
        <option value="">{loading ? 'Loading tokens...' : placeholder}</option>
        {supportedTokens.map((token) => (
          <option key={token.symbol} value={token.symbol}>
            {token.name} ({token.symbol})
          </option>
        ))}
      </select>
      
      {selectedToken && (
        <div className="ckpay-token-info">
          <div className="ckpay-token-details">
            <span className="ckpay-token-name">{selectedToken.name}</span>
            <span className="ckpay-token-symbol">({selectedToken.symbol})</span>
          </div>
          {selectedToken.logo && selectedToken.logo.length > 0 && (
            <img 
              src={selectedToken.logo[0]} 
              alt={selectedToken.name}
              className="ckpay-token-logo"
            />
          )}
        </div>
      )}
      
      <div className="ckpay-token-count">
        {supportedTokens.length} token{supportedTokens.length !== 1 ? 's' : ''} available
      </div>
    </div>
  );
};

export default TokenSelector;
