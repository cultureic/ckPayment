
## Usage

To use SDK Name in your web application, follow these steps:

1. Include the following HTML markup in your document where you want to display the payment modal:
    ```html
        <div id="payment-modal"></div>
    ```

2. Add the following JavaScript code to your document, preferably inside a <script> tag or an external JavaScript file:

   ```javascript
   window.onload = function() {
    var modalElement = document.getElementById('payment-modal');
    ckPaySDK.PaymentComponent.renderPaymentModal(modalElement, { /* props go here */ });
}```

Make sure to replace `{ /* props go here */ }` with the necessary configuration options for your payment component.

You can customize the SDK integration as per your application's requirements. Refer to the SDK documentation for detailed information on available configuration options and APIs.

## Sample HTML Integration

Here's an example of how you can integrate the SDK in a basic HTML page:

```
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>SDK Name HTML Integration</title>
  <script src="https://cdkpay.dogeria.workers.dev/cdkPay.js"></script>
</head>
<body>
  <div id="payment-modal"></div>
  <script>
    window.onload = function() {
        var modalElement = document.getElementById('payment-modal');
        ckPaySDK.PaymentComponent.renderPaymentModal(modalElement, { /* props go here */ });
    }
  </script>
</body>
</html>
```

## Sample React Integration

Here's an example of how you can integrate the SDK in a React application:

1. Install the SDK package using npm or yarn:

   `BASH COMMANDS GO HERE`

2. Import the SDK into your React component:

  ```
  import React from 'react'
import { createRoot } from 'react-dom/client'


window.onload = function () {
  ckPaySDK.PaymentComponent.initialize('payment-modal')
}

const App = () => {
  const handlePayment = () => {
    console.log('payment has been handle')
  }

  const startPaymentFlow = () => {
    ckPaySDK.PaymentComponent.renderPaymentModal({}, function () {
      console.log('Payment complete')
      // hide the modal when payment is done
      ckPaySDK.PaymentComponent.removePaymentModal()
    })
  }

  return (
    <div>
      <h1>hello world</h1>
      <button
        onClick={() => {
          ckPaySDK.PaymentComponent.renderPaymentModal({}, function () {
            ckPaySDK.PaymentComponent.removePaymentModal()
          })
        }}
      >
        Pay in BTC
      </button>
    </div>
  )
}

const container = document.getElementById('app')
const root = createRoot(container)
```
