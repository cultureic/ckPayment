
# ckPayment Web3 Integration Guide

## System Architecture
1. **SDK Build** (`ckPay.js`) - Standalone payment component library
2. **Frontend Build** - Main application that consumes the SDK

## Build Process

### 1. Build the SDK
```bash
cd ckPayment-web3
npm install
npm run build
```

### 2. Build Frontend
```bash
cd ..
npm install
npm run build
```

## Exact HTML Integration
```html
<!DOCTYPE html>
<html>
<head>
  <title>Payment Integration</title>
  <!-- 1. Load SDK -->
  <script src="https://zkg6o-xiaaa-aaaag-acofa-cai.icp0.io/cdkPay.js"></script>
  <!-- OR for local testing: -->
  <!-- <script src="ckPayment-web3/dist/cdkPay.js"></script> -->
</head>
<body>
  <!-- 2. Required container (must match ID below) -->
  <div id="payment-container"></div>
  
  <!-- 3. Trigger button -->
  <button onclick="startPayment()">Pay Now</button>

  <script>
    // 4. Initialize when page loads (REQUIRED FIRST)
    window.onload = function() {
      ckPaySDK.PaymentComponent.initialize('payment-container');
    };

    // 5. Payment flow handler
    function startPayment() {
      ckPaySDK.PaymentComponent.renderPaymentModal(
        { /* payment config */ }, 
        function(paymentResult) {
          console.log('Payment completed:', paymentResult);
          ckPaySDK.PaymentComponent.removePaymentModal();
        }
      );
    }
  </script>
</body>
</html>
```

## Critical Integration Sequence
1. `<div id="payment-container">` must exist in DOM
2. `initialize()` must be called before render
3. Call flow must be:
   ```javascript
   initialize() → renderPaymentModal() → removePaymentModal()
   ```

## Testing
1. Save as `test.html` and open in browser
2. Verify:
   - Modal appears on button click
   - Payment flow completes
   - Modal closes after payment

## Deployment
```bash
# Local testing
dfx start --background
dfx deploy

# Production deployment
dfx deploy --ic
```

## Development Workflow
1. **Modify SDK**:
   ```bash
   cd ckPayment-web3
   # Make changes to src/SDK/
   npm run build
   cd ..
   ```

2. **Test Changes**:
   - Refresh your test.html file
   - Or run local deployment:
     ```bash
     dfx deploy
     ```

3. **Update Production**:
   ```bash
   dfx deploy --ic
   ```

